const DEFAULT_RESULT_COUNT = 8;

function toInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildEuropePmcQuery(input = {}) {
  const terms = [];
  const molecule = normalizeText(input.molecule);
  const topic = normalizeText(input.topic);
  const question = normalizeText(input.question);
  const disease = normalizeText(input.indication || input.therapeutic);

  if (molecule) terms.push(`"${molecule}"`);
  if (topic && topic !== molecule) terms.push(`(${topic})`);
  if (question && question !== topic) terms.push(`(${question})`);
  if (disease && disease !== molecule) terms.push(`(${disease})`);

  const baseQuery = terms.length ? terms.join(' AND ') : normalizeText(input.query || input.prompt || 'medical affairs');
  const yearFrom = toInt(input.yearFrom, 0);
  const yearTo = toInt(input.yearTo, 0);
  const filters = [];

  if (yearFrom && yearTo && yearTo >= yearFrom) {
    filters.push(`FIRST_PDATE:[${yearFrom}-01-01 TO ${yearTo}-12-31]`);
  } else if (yearFrom) {
    filters.push(`FIRST_PDATE:[${yearFrom}-01-01 TO 3000-12-31]`);
  }

  if (input.openAccessOnly) filters.push('OPEN_ACCESS:y');

  return [baseQuery, ...filters].filter(Boolean).join(' AND ');
}

async function fetchEuropePmcResults(query, limit) {
  const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
  url.searchParams.set('query', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('pageSize', String(limit));
  url.searchParams.set('resultType', 'core');
  url.searchParams.set('sort', 'RELEVANCE');

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'MedicoExpress/1.0 (+https://medicoexpress.local)'
    }
  });

  if (!response.ok) {
    throw new Error(`Europe PMC search failed with status ${response.status}`);
  }

  const data = await response.json();
  const results = Array.isArray(data?.resultList?.result) ? data.resultList.result : [];

  return results.map((item, index) => ({
    id: item.pmid || item.doi || `${item.source || 'EPMC'}-${index + 1}`,
    title: normalizeText(item.title) || 'Untitled article',
    authors: normalizeText(item.authorString) || normalizeAuthors(item.authorList?.author),
    journal: normalizeText(item.journalTitle) || normalizeText(item.source),
    year: item.pubYear ? String(item.pubYear) : '',
    publishedAt: item.firstPublicationDate || item.pubDate || '',
    doi: normalizeText(item.doi),
    pmid: normalizeText(item.pmid),
    abstract: normalizeText(item.abstractText) || 'Abstract not available from this source payload.',
    source: item.source || 'Europe PMC',
    openAccess: String(item.isOpenAccess).toLowerCase() === 'y',
    url: item.pmcid
      ? `https://europepmc.org/article/PMC/${item.pmcid}`
      : item.doi
        ? `https://doi.org/${item.doi}`
        : item.pmid
          ? `https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`
          : 'https://europepmc.org/'
  }));
}

function normalizeAuthors(authorList) {
  if (!Array.isArray(authorList)) return '';
  return authorList
    .map(author => {
      const firstName = normalizeText(author?.firstName);
      const lastName = normalizeText(author?.lastName);
      return [firstName, lastName].filter(Boolean).join(' ');
    })
    .filter(Boolean)
    .slice(0, 10)
    .join(', ');
}

function buildFallbackResults(input, limit) {
  const query = normalizeText(input.query || input.topic || input.molecule || input.prompt || 'literature search');
  return Array.from({ length: limit }, (_, index) => {
    const year = 2026 - index;
    return {
      id: `fallback-${index + 1}`,
      title: `${query} evidence summary ${index + 1}`,
      authors: 'Repository synthesis',
      journal: 'MedicoExpress Knowledge Vault',
      year: String(year),
      publishedAt: `${year}-01-01`,
      doi: '',
      pmid: '',
      abstract: 'Network search was unavailable in this session. Use this placeholder row as an intake template and rerun when outbound evidence APIs are reachable.',
      source: 'Fallback',
      openAccess: true,
      url: 'https://medicoexpress.local/knowledge'
    };
  });
}

export async function searchScientificLiterature(input = {}) {
  const limit = clamp(toInt(input.maxResults, DEFAULT_RESULT_COUNT), 1, 20);
  const query = buildEuropePmcQuery(input);
  const querySummary = normalizeText(input.query || input.topic || input.molecule || input.prompt || query);
  const databases = Array.isArray(input.databases) && input.databases.length ? input.databases : ['Europe PMC'];

  let results = [];
  let sourceStatus = [];

  if (databases.some(db => String(db).toLowerCase().includes('europe') || String(db).toLowerCase().includes('pubmed') || String(db).toLowerCase().includes('medline'))) {
    try {
      results = await fetchEuropePmcResults(query, limit);
      sourceStatus.push({ source: 'Europe PMC', status: 'ok', count: results.length });
    } catch (error) {
      sourceStatus.push({ source: 'Europe PMC', status: 'error', message: error.message });
    }
  }

  if (!results.length) {
    results = buildFallbackResults(input, limit);
    sourceStatus.push({ source: 'Fallback', status: 'ok', count: results.length });
  }

  return {
    query: querySummary,
    normalizedQuery: query,
    totalResults: results.length,
    sourceStatus,
    results
  };
}
