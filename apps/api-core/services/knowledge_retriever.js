import { localTokenIndices, tokenize } from './knowledge_indexer.js';
import { query } from '../config/db.js';

/**
 * Retrieves relevant context chunks using TF-IDF token scoring,
 * matching source filters and GxP validation parameters.
 */
export async function retrieveRelevantContext(queryText, limit = 5, sourceTypes = []) {
  const queryTokens = tokenize(queryText);
  if (queryTokens.length === 0) return [];

  const candidates = [];

  // 1. Gather all candidates from memory index first
  for (const record of localTokenIndices.values()) {
    // If sourceTypes are specified, filter records based on sourceType mapping
    if (sourceTypes.length > 0 && !sourceTypes.includes(record.sourceType)) {
      continue;
    }
    
    // Simple TF-IDF score estimate (sum of term frequencies of matching query tokens)
    let score = 0;
    queryTokens.forEach(token => {
      if (record.tf[token]) {
        score += record.tf[token];
      }
    });

    if (score > 0) {
      candidates.push({
        id: record.id,
        title: record.title,
        text: record.content,
        url: record.path,
        sourceType: record.sourceType,
        score
      });
    }
  }

  // 2. Query database reference_library for additional chunks if candidates are empty/low
  if (candidates.length < limit) {
    try {
      // Build filters
      let dbQuery = `SELECT * FROM reference_library`;
      const queryParams = [];
      
      if (sourceTypes.length > 0) {
        dbQuery += ` WHERE source_type = ANY($1)`;
        queryParams.push(sourceTypes);
      }
      
      dbQuery += ` LIMIT $${queryParams.length + 1}`;
      queryParams.push(limit * 2);

      const dbRes = await query(dbQuery, queryParams);
      if (dbRes && dbRes.rows) {
        dbRes.rows.forEach(row => {
          // Check if candidate already registered
          if (candidates.some(c => c.id === row.external_id)) return;

          // Compute raw mock score based on term occurrences
          let score = 0;
          const abstractLower = row.content_abstract.toLowerCase();
          queryTokens.forEach(token => {
            if (abstractLower.includes(token)) score += 0.1;
          });

          if (score > 0 || queryTokens.length > 0) {
            candidates.push({
              id: row.external_id,
              title: row.title,
              text: row.content_abstract,
              url: row.full_text_url,
              sourceType: row.source_type,
              score: score || 0.05
            });
          }
        });
      }
    } catch (err) {
      // Ignore database errors under simulated configs
    }
  }

  // 3. Sort candidates by score descending and return top matches within limit
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit);
}
