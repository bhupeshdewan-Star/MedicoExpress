import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layers, Plus, GitCompare, FileText, CheckCircle, HelpCircle } from 'lucide-react';

interface Study {
  id: number;
  protocol_number: string;
  title: string;
  phase: string;
  status: string;
  sponsor: string;
  therapeutic_area: string;
}

interface Protocol {
  id: number;
  study_id: number;
  version: string;
  objectives: string;
  endpoints: string;
  inclusion_criteria: string;
  exclusion_criteria: string;
  is_active: boolean;
}

export default function StudiesCenter() {
  const { token } = useAuth() as any;
  const [studies, setStudies] = useState<Study[]>([]);
  const [activeStudyId, setActiveStudyId] = useState<number | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form fields
  const [protocolNumber, setProtocolNumber] = useState('');
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState('Phase III');
  const [area, setArea] = useState('Oncology');

  // Compare versions fields
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  useEffect(() => {
    fetchStudies();
  }, [token]);

  useEffect(() => {
    if (activeStudyId) {
      fetchProtocols(activeStudyId);
    }
  }, [activeStudyId]);

  const fetchStudies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/studies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        setStudies(resJson.data);
        if (resJson.data.length > 0) {
          setActiveStudyId(resJson.data[0].id);
        }
      } else {
        setError(resJson.errors?.[0] || 'Failed to fetch studies');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchProtocols = async (studyId: number) => {
    try {
      const res = await fetch(`/api/v1/studies/${studyId}/protocols`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        setProtocols(resJson.data);
        if (resJson.data.length > 0) {
          setV1(resJson.data[0].version);
          setV2(resJson.data[0].version);
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCreateStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          protocol_number: protocolNumber,
          title,
          phase,
          therapeutic_area: area
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setProtocolNumber('');
        setTitle('');
        fetchStudies();
      } else {
        setError(resJson.errors?.[0] || 'Failed to create study');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating study');
    }
  };

  const handleUpdateStatus = async (studyId: number, status: string) => {
    try {
      const res = await fetch(`/api/v1/studies/${studyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const resJson = await res.json();
      if (resJson.success) {
        fetchStudies();
      } else {
        setError(resJson.errors?.[0] || 'Transition blocked');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCompare = async () => {
    if (!v1 || !v2 || !activeStudyId) return;
    try {
      const res = await fetch(`/api/v1/studies/${activeStudyId}/protocols/compare?v1=${v1}&v2=${v2}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        setComparisonResult(resJson.data);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const activeStudy = studies.find(s => s.id === activeStudyId);
  const activeProtocol = protocols.find(p => p.is_active);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="h-6 w-6 text-brand-teal" />
            <span>Clinical Trial Portfolio</span>
          </h1>
          <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
            Track clinical study protocols, amend registries, and coordinate GxP authorization gates.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading study portfolio...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Studies Roster */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">Studies List</h2>
              <div className="space-y-3">
                {studies.map(study => (
                  <div
                    key={study.id}
                    onClick={() => setActiveStudyId(study.id)}
                    className={`p-4 rounded-card border cursor-pointer transition-all ${
                      activeStudyId === study.id
                        ? 'border-brand-teal bg-brand-teal/5 text-brand-teal-dark font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-55'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-650">
                        {study.protocol_number}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        study.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {study.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{study.title}</h3>
                    <div className="text-xs text-slate-400 mt-1">{study.therapeutic_area} | {study.phase}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create study form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-brand-teal" />
                <span>Register New Study</span>
              </h2>
              <form onSubmit={handleCreateStudy} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-450 dark:text-slate-400 mb-1">Protocol Number</label>
                  <input
                    type="text"
                    required
                    value={protocolNumber}
                    onChange={(e) => setProtocolNumber(e.target.value)}
                    placeholder="e.g. CC-2026-ONC-002"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-450 dark:text-slate-400 mb-1">Study Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Randomized trial of Remimazolam in lung cancer"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-450 dark:text-slate-400 mb-1">Phase</label>
                    <select
                      value={phase}
                      onChange={(e) => setPhase(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                    >
                      <option>Phase I</option>
                      <option>Phase II</option>
                      <option>Phase III</option>
                      <option>Phase IV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-450 dark:text-slate-400 mb-1">Therapeutic Area</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-brand-teal text-white rounded font-semibold cursor-pointer text-xs"
                >
                  Create Study
                </button>
              </form>
            </div>
          </div>

          {/* Study Protocol & Status Panel */}
          <div className="lg:col-span-2 space-y-6">
            {activeStudy ? (
              <>
                {/* Active Protocol Details */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <div>
                      <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">{activeStudy.title}</h2>
                      <p className="text-xs text-slate-400 mt-1">Sponsor: {activeStudy.sponsor}</p>
                    </div>
                    
                    {/* Status machine controls */}
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      {activeStudy.status === 'PLANNING' && (
                        <button
                          onClick={() => handleUpdateStatus(activeStudy.id, 'ACTIVE')}
                          className="bg-green-600 text-white font-semibold text-xs px-3 py-1.5 rounded cursor-pointer"
                        >
                          Activate Study
                        </button>
                      )}
                      {activeStudy.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleUpdateStatus(activeStudy.id, 'ON_HOLD')}
                          className="bg-amber-600 text-white font-semibold text-xs px-3 py-1.5 rounded cursor-pointer"
                        >
                          Place On Hold
                        </button>
                      )}
                      {activeStudy.status === 'ON_HOLD' && (
                        <button
                          onClick={() => handleUpdateStatus(activeStudy.id, 'ACTIVE')}
                          className="bg-green-600 text-white font-semibold text-xs px-3 py-1.5 rounded cursor-pointer"
                        >
                          Resume Active
                        </button>
                      )}
                      {['ACTIVE', 'ON_HOLD'].includes(activeStudy.status) && (
                        <button
                          onClick={() => handleUpdateStatus(activeStudy.id, 'COMPLETED')}
                          className="bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded cursor-pointer"
                        >
                          Complete Trial
                        </button>
                      )}
                    </div>
                  </div>

                  {activeProtocol ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-brand-teal font-semibold text-sm border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <FileText className="h-4 w-4" />
                        <span>Active Protocol Version {activeProtocol.version}</span>
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-50 dark:bg-slate-900/30 p-3 border border-slate-200 dark:border-slate-800 rounded">
                          <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Objectives</h4>
                          <p className="text-slate-500 leading-relaxed">{activeProtocol.objectives}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/30 p-3 border border-slate-200 dark:border-slate-800 rounded">
                          <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Endpoints</h4>
                          <p className="text-slate-500 leading-relaxed">{activeProtocol.endpoints}</p>
                        </div>
                      </div>
                      <div className="text-xs space-y-3">
                        <div className="border border-slate-200 dark:border-slate-800 p-4 rounded bg-slate-50 dark:bg-slate-900/10">
                          <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Key Inclusion Criteria</h4>
                          <p className="text-slate-500 leading-relaxed whitespace-pre-line">{activeProtocol.inclusion_criteria}</p>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-800 p-4 rounded bg-slate-50 dark:bg-slate-900/10">
                          <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Key Exclusion Criteria</h4>
                          <p className="text-slate-500 leading-relaxed whitespace-pre-line">{activeProtocol.exclusion_criteria}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs italic flex flex-col items-center gap-2">
                      <HelpCircle className="h-8 w-8 text-slate-300" />
                      <span>No active protocol registered for this study yet.</span>
                    </div>
                  )}
                </div>

                {/* Compare Versions Widget */}
                {protocols.length > 1 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                    <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                      <GitCompare className="h-4 w-4 text-brand-teal" />
                      <span>Compare Protocol Amendments</span>
                    </h3>
                    <div className="flex items-center gap-3 text-xs mb-4">
                      <div>
                        <label className="block text-slate-400 mb-1">Version A</label>
                        <select
                          value={v1}
                          onChange={(e) => setV1(e.target.value)}
                          className="border border-slate-200 dark:border-slate-800 rounded p-1 bg-transparent text-slate-900 dark:text-slate-100"
                        >
                          {protocols.map(p => <option key={p.id}>{p.version}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Version B</label>
                        <select
                          value={v2}
                          onChange={(e) => setV2(e.target.value)}
                          className="border border-slate-200 dark:border-slate-800 rounded p-1 bg-transparent text-slate-900 dark:text-slate-100"
                        >
                          {protocols.map(p => <option key={p.id}>{p.version}</option>)}
                        </select>
                      </div>
                      <button
                        onClick={handleCompare}
                        className="bg-brand-teal text-white px-4 py-1.5 rounded cursor-pointer self-end font-semibold"
                      >
                        Compare Diff
                      </button>
                    </div>

                    {comparisonResult && (
                      <div className="border border-slate-200 dark:border-slate-800 rounded p-4 bg-slate-50 dark:bg-slate-950 text-xs">
                        <h4 className="font-bold text-slate-700 dark:text-slate-350 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">
                          Diff Report: v{comparisonResult.versionComparison.v1} vs. v{comparisonResult.versionComparison.v2}
                        </h4>
                        {!comparisonResult.hasChanges ? (
                          <div className="text-slate-400 italic">No differences identified between these protocol versions.</div>
                        ) : (
                          <div className="space-y-3">
                            {Object.entries(comparisonResult.changes).map(([field, data]: any) => (
                              <div key={field} className="space-y-1">
                                <div className="font-semibold text-brand-teal capitalize">{field} Change:</div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-2 border border-red-200 bg-red-500/5 text-slate-500 rounded">
                                    <div className="font-bold text-[9px] text-red-500 uppercase">Removed in v{v2}:</div>
                                    <div className="line-clamp-4">{data.oldValue}</div>
                                  </div>
                                  <div className="p-2 border border-green-200 bg-green-500/5 text-slate-500 rounded">
                                    <div className="font-bold text-[9px] text-green-500 uppercase">Added in v{v2}:</div>
                                    <div className="line-clamp-4">{data.newValue}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card text-slate-400 italic">
                Please select a clinical study to inspect protocol details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
