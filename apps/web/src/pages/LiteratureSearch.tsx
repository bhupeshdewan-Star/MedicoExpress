import React, { useState } from 'react';
import { Search, BookOpen, ExternalLink, Loader2, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type ResultItem = {
  id: string;
  title: string;
  authors?: string;
  journal?: string;
  year?: string;
  publishedAt?: string;
  doi?: string;
  pmid?: string;
  abstract?: string;
  source?: string;
  openAccess?: boolean;
  url?: string;
};

export default function LiteratureSearch() {
  const { token } = useAuth() as any;
  const [query, setQuery] = useState('');
  const [molecule, setMolecule] = useState('');
  const [topic, setTopic] = useState('');
  const [indication, setIndication] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [openAccessOnly, setOpenAccessOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [searchSummary, setSearchSummary] = useState<any>(null);
  const [error, setError] = useState('');

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/literature/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          query,
          molecule,
          topic,
          indication,
          yearFrom,
          yearTo,
          openAccessOnly,
          maxResults: 10
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || payload.error || 'Search failed');
      }
      setResults(Array.isArray(payload.results) ? payload.results : []);
      setSearchSummary(payload);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
      setSearchSummary(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand-teal" />
              Scientific Literature Search
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Search open biomedical literature through the governed retrieval layer. Europe PMC is used first, with a controlled fallback if the external evidence service is unavailable.
            </p>
          </div>
        </div>

        <form onSubmit={runSearch} className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Query</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full px-3 py-2 rounded-button border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" placeholder="e.g. remimazolam procedural sedation" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Molecule</span>
            <input value={molecule} onChange={(e) => setMolecule(e.target.value)} className="w-full px-3 py-2 rounded-button border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" placeholder="e.g. remimazolam" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Topic</span>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-3 py-2 rounded-button border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" placeholder="e.g. procedural sedation" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Indication</span>
            <input value={indication} onChange={(e) => setIndication(e.target.value)} className="w-full px-3 py-2 rounded-button border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" placeholder="e.g. anesthesia" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Year From</span>
            <input value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} className="w-full px-3 py-2 rounded-button border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" placeholder="2020" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Year To</span>
            <input value={yearTo} onChange={(e) => setYearTo(e.target.value)} className="w-full px-3 py-2 rounded-button border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" placeholder="2026" />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 md:col-span-2 xl:col-span-3">
            <input type="checkbox" checked={openAccessOnly} onChange={(e) => setOpenAccessOnly(e.target.checked)} />
            Open access only
          </label>
          <div className="md:col-span-2 xl:col-span-3 flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded-button bg-brand-teal text-white text-sm font-semibold hover:bg-brand-teal-dark disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search Literature
            </button>
            <div className="text-xs text-slate-400 inline-flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" />
              Search results are source-backed and audit logged.
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-card border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {searchSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Query</div>
            <div className="mt-1 text-sm text-slate-800 dark:text-slate-100">{searchSummary.query}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Results</div>
            <div className="mt-1 text-sm text-slate-800 dark:text-slate-100">{searchSummary.totalResults}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Sources</div>
            <div className="mt-1 text-sm text-slate-800 dark:text-slate-100">
              {(searchSummary.sourceStatus || []).map((item: any) => `${item.source}:${item.status}`).join(' | ') || 'No source status'}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {results.map((result) => (
          <article key={result.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal-dark text-[10px] font-bold uppercase tracking-wider">
                    {result.source || 'Open Literature'}
                  </span>
                  {result.openAccess && (
                    <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-wider">
                      Open Access
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{result.title}</h3>
                <p className="text-xs text-slate-400">{result.authors || 'Authors unavailable'} {result.journal ? `| ${result.journal}` : ''} {result.year ? `| ${result.year}` : ''}</p>
              </div>
              {result.url && (
                <a href={result.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal hover:underline shrink-0">
                  Open <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {result.abstract}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              {result.pmid && <span>PMID: {result.pmid}</span>}
              {result.doi && <span>DOI: {result.doi}</span>}
              {result.publishedAt && <span>Published: {result.publishedAt}</span>}
            </div>
          </article>
        ))}
        {!loading && !results.length && !error && (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-card p-8 text-center text-sm text-slate-400">
            Run a search to surface evidence-backed results.
          </div>
        )}
      </div>
    </div>
  );
}
