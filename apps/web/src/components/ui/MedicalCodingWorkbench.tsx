import React, { useState, useEffect } from 'react';
import { Tag, Search, Check, RefreshCw, X, ShieldAlert } from 'lucide-react';

interface CodingRecord {
  id: number;
  data_point_id: number;
  dictionary_type: 'MedDRA' | 'WHODrug';
  code: string;
  term_text: string;
  dictionary_version: string;
  created_at: string;
}

interface MedicalCodingWorkbenchProps {
  dataPointId: number;
  fieldName: string;
  reportedText: string;
  onClose: () => void;
}

export default function MedicalCodingWorkbench({ dataPointId, fieldName, reportedText, onClose }: MedicalCodingWorkbenchProps) {
  const [currentCoding, setCurrentCoding] = useState<CodingRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState(reportedText);
  const [dictionaryType, setDictionaryType] = useState<'MedDRA' | 'WHODrug'>('MedDRA');
  const [searchResults, setSearchResults] = useState<{ code: string; term: string; version: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentCoding();
  }, [dataPointId]);

  const fetchCurrentCoding = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v2/edc/coding/${dataPointId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success && result.data) {
        setCurrentCoding(result.data);
      } else {
        setCurrentCoding(null);
      }
    } catch (err) {
      // Ignore initial query checks failure
    }
  };

  const handleSearchDictionary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSearchResults(null);
    try {
      const token = localStorage.getItem('token');
      const dictEndpoint = dictionaryType === 'MedDRA' ? 'meddra' : 'whodrug';
      const res = await fetch(`/api/v2/edc/coding/lookup/${dictEndpoint}?text=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success && result.data) {
        setSearchResults(result.data);
      } else {
        setError(result.errors?.[0] || 'No matching dictionary terms found.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with dictionary servers.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCode = async () => {
    if (!searchResults) return;

    setAssigning(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v2/edc/coding/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data_point_id: dataPointId,
          dictionary_type: dictionaryType,
          code: searchResults.code,
          term_text: searchResults.term,
          dictionary_version: searchResults.version
        })
      });
      const result = await res.json();
      if (result.success) {
        setCurrentCoding(result.data);
        setSearchResults(null);
      } else {
        setError(result.errors?.[0] || 'Failed to assign code mapping.');
      }
    } catch (err: any) {
      setError(err.message || 'Error writing database coding terms.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="flex flex-col w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Tag className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-lg">Medical Dictionary Coding Workbench</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Reported text & field */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Field: {fieldName}
          </span>
          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg">
            "{reportedText}"
          </p>
        </div>

        {/* Dynamic content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Active Coding Annotation */}
          {currentCoding ? (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Active Coding Annotation
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                  {currentCoding.dictionary_type} {currentCoding.dictionary_version}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {currentCoding.term_text}
                </span>
                <code className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400">
                  {currentCoding.code}
                </code>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/20 dark:border-amber-800/20 rounded-xl p-4 text-amber-700 dark:text-amber-400 text-sm">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Concomitant event is uncoded. Run dictionary lookup below.</span>
            </div>
          )}

          {/* Dictionary Selector */}
          <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                checked={dictionaryType === 'MedDRA'}
                onChange={() => { setDictionaryType('MedDRA'); setSearchResults(null); }}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">MedDRA (Adverse Events)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                checked={dictionaryType === 'WHODrug'}
                onChange={() => { setDictionaryType('WHODrug'); setSearchResults(null); }}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">WHODrug (ConMeds)</span>
            </label>
          </div>

          {/* Lookup Input Form */}
          <form onSubmit={handleSearchDictionary} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${dictionaryType}...`}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg flex items-center justify-center transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Results Area */}
          {loading ? (
            <div className="flex justify-center py-6">
              <span className="text-slate-500 animate-pulse">Running dictionary auto-match...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm text-center py-4">{error}</div>
          ) : searchResults ? (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Dictionary Match Resolved
                </span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                  {searchResults.version}
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{searchResults.term}</span>
                <code className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-indigo-500">{searchResults.code}</code>
              </div>
              <button
                onClick={handleAssignCode}
                disabled={assigning}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors"
              >
                <Check className="h-4 w-4" />
                Assign standard Code
              </button>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
