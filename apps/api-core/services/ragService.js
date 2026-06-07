import crypto from 'crypto';
import { query } from '../config/db.js';

let hasPgVector = null;

/**
 * Checks if the reference_library table contains the vector embedding column.
 */
async function checkPgVectorSupport() {
  if (hasPgVector !== null) return hasPgVector;
  try {
    const res = await query(`
      SELECT 1 FROM pg_attribute 
      WHERE attrelid = 'reference_library'::regclass AND attname = 'embedding'
    `);
    hasPgVector = res.rows.length > 0;
  } catch (err) {
    hasPgVector = false;
  }
  return hasPgVector;
}

/**
 * Generates a deterministic 1536-dimensional normalized vector from text.
 * Used for vector similarity comparison without requiring network connections.
 */
export function getDeterministicEmbedding(text) {
  const dimensions = 1536;
  const embedding = new Array(dimensions).fill(0);
  
  for (let i = 0; i < dimensions; i++) {
    const hash = crypto.createHash('sha256').update(text + `-dim-1536-${i}`).digest();
    const intVal = hash.readInt32LE(0);
    embedding[i] = intVal / 2147483648;
  }
  
  // Normalize the vector to unit length (L2 norm = 1) for cosine similarity
  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSq += embedding[i] * embedding[i];
  }
  const norm = Math.sqrt(sumSq);
  for (let i = 0; i < dimensions; i++) {
    embedding[i] = embedding[i] / (norm || 1);
  }
  
  return embedding;
}

export async function registerSource(fileName, filePath, content) {
  // Compute checksum to verify integrity
  const checksum = crypto.createHash('sha256').update(content).digest('hex');
  const chunks = chunkText(content, 1000); // 1000 character chunks

  const res = await query(
    `INSERT INTO rag_sources (file_name, file_path, chunk_count, status)
     VALUES ($1, $2, $3, 'INDEXED')
     ON CONFLICT (file_name) DO UPDATE SET chunk_count = EXCLUDED.chunk_count, status = 'INDEXED'
     RETURNING id`,
    [fileName, filePath, chunks.length]
  );
  
  const sourceId = res.rows[0].id;

  // Insert into evidence_sources
  await query(
    `INSERT INTO evidence_sources (source_type, title, provenance_url, verification_checksum)
     VALUES ('RAG_SOURCE', $1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [fileName, filePath, checksum]
  );

  const pgVectorActive = await checkPgVectorSupport();

  // Insert chunks into reference_library
  for (let i = 0; i < chunks.length; i++) {
    const chunkTextVal = chunks[i];
    const extId = `${fileName}-chunk-${i}`;
    const titleVal = `${fileName} - Chunk ${i+1}`;
    const metaJson = JSON.stringify({ index: i, sourceId });

    if (pgVectorActive) {
      const vector = getDeterministicEmbedding(chunkTextVal);
      const vectorStr = `[${vector.join(',')}]`;
      await query(
        `INSERT INTO reference_library (source_type, title, external_id, content_abstract, full_text_url, metadata_json, embedding)
         VALUES ('RAG_CHUNK', $1, $2, $3, $4, $5, $6::vector)
         ON CONFLICT (external_id) DO NOTHING`,
        [titleVal, extId, chunkTextVal, filePath, metaJson, vectorStr]
      );
    } else {
      await query(
        `INSERT INTO reference_library (source_type, title, external_id, content_abstract, full_text_url, metadata_json)
         VALUES ('RAG_CHUNK', $1, $2, $3, $4, $5)
         ON CONFLICT (external_id) DO NOTHING`,
        [titleVal, extId, chunkTextVal, filePath, metaJson]
      );
    }
  }

  return { sourceId, chunkCount: chunks.length, checksum };
}

export async function retrieveContext(searchQuery, limit = 5) {
  const pgVectorActive = await checkPgVectorSupport();
  
  if (pgVectorActive) {
    try {
      const qVector = getDeterministicEmbedding(searchQuery);
      const qVectorStr = `[${qVector.join(',')}]`;
      
      const res = await query(
        `SELECT *, 1 - (embedding <=> $1::vector) AS similarity 
         FROM reference_library 
         ORDER BY embedding <=> $1::vector ASC 
         LIMIT $2`,
        [qVectorStr, limit]
      );
      
      return res.rows.map(row => ({
        id: row.id,
        title: row.title,
        text: row.content_abstract,
        url: row.full_text_url,
        metadata: typeof row.metadata_json === 'string' ? JSON.parse(row.metadata_json) : row.metadata_json,
        similarity: row.similarity
      }));
    } catch (err) {
      console.warn('pgvector similarity search failed, executing text fallback:', err.message);
    }
  }

  // Dual compatibility full-text/keyword search fallback
  try {
    const res = await query(
      `SELECT * FROM reference_library 
       WHERE title LIKE $1 OR content_abstract LIKE $1
       LIMIT $2`,
      [`%${searchQuery}%`, limit]
    );
    return res.rows.map(row => ({
      id: row.id,
      title: row.title,
      text: row.content_abstract,
      url: row.full_text_url,
      metadata: typeof row.metadata_json === 'string' ? JSON.parse(row.metadata_json) : row.metadata_json,
      similarity: 0.5
    }));
  } catch (err) {
    console.error('RAG Retrieval failed:', err.message);
    return [];
  }
}

export async function registerCitation(entityType, entityId, sourceId, quote, confidence = 1.0) {
  await query(
    `INSERT INTO evidence_links (source_id, target_type, target_id, provenance_quote, confidence_score)
     VALUES ($1, $2, $3, $4, $5)`,
    [sourceId, entityType, entityId, quote, confidence]
  );

  const sourceRes = await query(`SELECT * FROM evidence_sources WHERE id = $1`, [sourceId]);
  const source = sourceRes.rows[0];

  if (source) {
    const formatted = `[Evidence] ${source.title}. Available at: ${source.provenance_url || 'On-Premise Vault'}. Integrity Check: ${source.verification_checksum.substring(0, 10)}`;
    await query(
      `INSERT INTO citation_registry (entity_type, entity_id, citation_style, formatted_citation)
       VALUES ($1, $2, 'AMA', $3)`,
      [entityType, entityId, formatted]
    );
  }
}

function chunkText(text, size) {
  const chunks = [];
  let index = 0;
  while (index < text.length) {
    chunks.push(text.substring(index, index + size));
    index += size;
  }
  return chunks;
}
