import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, AlertTriangle, ShieldCheck, Settings } from 'lucide-react';

interface SiteRisk {
  siteId: number;
  siteNumber: string;
  siteName: string;
  metrics: {
    deviations: number;
    missedVisits: number;
    openFindings: number;
  };
  scores: {
    deviationScore: number;
    missedVisitScore: number;
    findingsScore: number;
  };
  aggregateScore: number;
  riskTier: string;
  needsEscalation: boolean;
}

interface RiskProfile {
  studyId: number;
  weights: {
    w1: number;
    w2: number;
    w3: number;
  };
  averageStudyScore: number;
  studyRiskTier: string;
  siteRisks: SiteRisk[];
}

export default function RBMCenter() {
  const { token } = useAuth() as any;
  const [profile, setProfile] = useState<RiskProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Slider Weights
  const [w1, setW1] = useState(0.4);
  const [w2, setW2] = useState(0.3);
  const [w3, setW3] = useState(0.3);

  useEffect(() => {
    fetchRiskProfile();
  }, [token, w1, w2, w3]);

  const fetchRiskProfile = async () => {
    try {
      const res = await fetch(`/api/v1/rbm?study_id=1&w1=${w1}&w2=${w2}&w3=${w3}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        setProfile(resJson.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleNormalizeWeights = (num1: number, num2: number, num3: number) => {
    const sum = num1 + num2 + num3;
    if (sum === 0) return;
    setW1(parseFloat((num1 / sum).toFixed(2)));
    setW2(parseFloat((num2 / sum).toFixed(2)));
    setW3(parseFloat((num3 / sum).toFixed(2)));
  };

  const highRiskSites = profile?.siteRisks.filter(s => s.riskTier === 'High') || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-brand-teal" />
            <span>Risk-Based Monitoring (RBM) Center</span>
          </h1>
          <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
            Audit patient safety indicators and checklist compliance gaps dynamically across research facilities.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading risk assessments...</div>
      ) : (
        profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Risk indicators configuration & highlights */}
            <div className="space-y-6">
              
              {/* Alert banner */}
              {highRiskSites.length > 0 ? (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-5 rounded-card flex gap-3 text-xs leading-relaxed">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm mb-1">High-Risk Sites Alert</h3>
                    <p className="mb-2">There are {highRiskSites.length} site(s) requiring immediate corrective and preventive action logs:</p>
                    <div className="font-mono uppercase font-bold space-y-0.5">
                      {highRiskSites.map(s => <div key={s.siteId}>• Site {s.siteNumber} ({s.siteName})</div>)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500 text-green-700 p-5 rounded-card flex gap-3 text-xs leading-relaxed">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm mb-1">Study Safety Compliant</h3>
                    <p>All clinical investigator sites are operating within acceptable low/medium risk thresholds.</p>
                  </div>
                </div>
              )}

              {/* Weight sliders */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-4">
                <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-brand-teal" />
                  <span>Configure Risk Scoring Weightings</span>
                </h2>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Adjust metrics prioritization sliders. System auto-normalizes the weight parameters to sum up to 1.0.
                </p>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-750 mb-1">
                      <span>w1: Protocol Deviations Weight</span>
                      <span className="text-brand-teal">{(w1 * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={w1}
                      onChange={(e) => handleNormalizeWeights(parseFloat(e.target.value), w2, w3)}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-750 mb-1">
                      <span>w2: Missed Subject Visits Weight</span>
                      <span className="text-brand-teal">{(w2 * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={w2}
                      onChange={(e) => handleNormalizeWeights(w1, parseFloat(e.target.value), w3)}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-750 mb-1">
                      <span>w3: Open Monitoring Findings Weight</span>
                      <span className="text-brand-teal">{(w3 * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={w3}
                      onChange={(e) => handleNormalizeWeights(w1, w2, parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Risk score breakdown table & site heatmap */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Heatmap visual cards list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4">
                  RBM Site Risk Heatmap ({profile.averageStudyScore} Avg Score)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.siteRisks.map(site => (
                    <div
                      key={site.siteId}
                      className={`p-4 border rounded-card relative overflow-hidden flex flex-col justify-between min-h-[120px] ${
                        site.riskTier === 'High'
                          ? 'border-red-500 bg-red-500/5'
                          : site.riskTier === 'Medium'
                          ? 'border-amber-500 bg-amber-500/5'
                          : 'border-green-500 bg-green-500/5'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Site {site.siteNumber}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            site.riskTier === 'High' ? 'bg-red-200 text-red-800' : site.riskTier === 'Medium' ? 'bg-amber-250 text-amber-800' : 'bg-green-200 text-green-800'
                          }`}>{site.riskTier}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-250 line-clamp-1">{site.siteName}</h4>
                      </div>
                      <div className="flex justify-between items-baseline mt-4">
                        <span className="text-3xl font-display font-bold text-slate-850 dark:text-slate-200">{site.aggregateScore}</span>
                        <span className="text-[10px] text-slate-450">Risk Index Score</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RBM Detail Score Breakdown Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4">Risk Matrix Breakdowns</h3>
                
                <div className="overflow-x-auto text-xs">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450">
                        <th className="py-2.5 font-semibold">Site Facility</th>
                        <th className="py-2.5 font-semibold text-center">Deviations</th>
                        <th className="py-2.5 font-semibold text-center">Missed Visits</th>
                        <th className="py-2.5 font-semibold text-center">Open Findings</th>
                        <th className="py-2.5 font-semibold text-right">RPN Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-750">
                      {profile.siteRisks.map(site => (
                        <tr key={site.siteId} className="hover:bg-slate-50 dark:hover:bg-slate-900/10">
                          <td className="py-3 font-semibold">{site.siteName} ({site.siteNumber})</td>
                          <td className="py-3 text-center font-mono">{site.metrics.deviations}</td>
                          <td className="py-3 text-center font-mono">{site.metrics.missedVisits}</td>
                          <td className="py-3 text-center font-mono">{site.metrics.openFindings}</td>
                          <td className={`py-3 text-right font-bold ${
                            site.riskTier === 'High' ? 'text-red-500' : site.riskTier === 'Medium' ? 'text-amber-500' : 'text-green-500'
                          }`}>{site.aggregateScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
