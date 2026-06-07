import React, { useState } from 'react';
import { UserCheck, ShieldAlert, Key, Eye, HelpCircle } from 'lucide-react';

interface Subject {
  id: number;
  subject_number: string;
  status: string;
  site_id: number;
}

interface PanelProps {
  subjects: Subject[];
  token: string;
  role: string;
  onSuccess: () => void;
}

export default function SubjectRandomizationPanel({ subjects, token, role, onSuccess }: PanelProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [unblindData, setUnblindData] = useState<any>(null);
  const [unblindReason, setUnblindReason] = useState('');
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);

  const handleRandomize = async (subjectId: number) => {
    setLoadingId(subjectId);
    setError('');
    try {
      const res = await fetch(`/api/v1/rtsm/subjects/${subjectId}/randomize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resJson = await res.json();
      if (resJson.success) {
        onSuccess();
      } else {
        setError(resJson.errors?.[0] || 'Randomization failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnblind = async (subjectId: number) => {
    if (!unblindReason) {
      alert('You must provide an emergency reason for unblinding.');
      return;
    }
    setLoadingId(subjectId);
    setError('');
    try {
      const res = await fetch(`/api/v1/rtsm/subjects/${subjectId}/unblind`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: unblindReason })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setUnblindData(resJson.data);
        setUnblindReason('');
        setSelectedSubId(null);
      } else {
        setError(resJson.errors?.[0] || 'Unblinding unauthorized.');
      }
    } catch (err: any) {
      setError(err.message || 'Unblinding request failed');
    } finally {
      setLoadingId(null);
    }
  };

  const isAuthorizedToUnblind = ['Head of Medical Affairs', 'Admin', 'Medical Advisor'].includes(role);

  return (
    <div className="space-y-4 font-sans text-xs text-left">
      <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <UserCheck className="h-4 w-4 text-brand-teal" />
          <span>Subject Randomization Hub</span>
        </h3>
        {error && <span className="text-[10px] text-red-500 font-bold">{error}</span>}
      </div>

      {/* Emergency Unblinding Overlay Modal */}
      {unblindData && (
        <div className="p-4 border border-red-200 bg-red-55 dark:bg-red-950/20 text-red-750 dark:text-red-400 rounded-lg space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
            <ShieldAlert className="h-5 w-5 animate-pulse" />
            <span>Emergency Unblind Protocol Activated</span>
          </div>
          <div className="grid grid-cols-2 gap-4 font-mono text-[11px] pt-1 border-t border-red-100 dark:border-red-900/20">
            <div>Subject: {unblindData.unblindedBy ? `ID ${unblindData.subjectId}` : 'N/A'}</div>
            <div>Randomization Code: <span className="font-bold">{unblindData.randomizationNumber}</span></div>
            <div>Assigned Arm: <span className="font-bold underline text-red-700 dark:text-red-400">{unblindData.treatmentArm}</span></div>
            <div>Audited By: {unblindData.unblindedBy}</div>
          </div>
          <button 
            onClick={() => setUnblindData(null)}
            className="px-2.5 py-1 bg-red-600 text-white rounded text-[10px] cursor-pointer mt-1 font-semibold"
          >
            Close Blind details
          </button>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="text-slate-400 italic py-6 text-center">No screened subjects found.</div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b dark:border-slate-800 text-[9px]">
                <th className="p-3">Subject No</th>
                <th className="p-3">Site ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
              {subjects.map(sub => {
                const isRand = sub.status !== 'SCREENING';
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{sub.subject_number}</td>
                    <td className="p-3 text-slate-400 font-mono">Site {sub.site_id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isRand ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3 space-x-2">
                      {!isRand ? (
                        <button
                          onClick={() => handleRandomize(sub.id)}
                          disabled={loadingId !== null}
                          className="bg-brand-teal text-white hover:bg-brand-teal-dark font-semibold px-3 py-1 rounded cursor-pointer disabled:opacity-50"
                        >
                          {loadingId === sub.id ? 'Processing...' : 'Randomize'}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Blinded</span>
                          
                          {/* Unblinding trigger */}
                          {isAuthorizedToUnblind ? (
                            selectedSubId === sub.id ? (
                              <div className="flex gap-1.5 items-center">
                                <input
                                  type="text"
                                  placeholder="Enter emergency reason..."
                                  value={unblindReason}
                                  onChange={(e) => setUnblindReason(e.target.value)}
                                  className="border border-red-200 rounded px-2 py-1 outline-none text-[10px]"
                                />
                                <button
                                  onClick={() => handleUnblind(sub.id)}
                                  className="bg-red-600 text-white font-semibold px-2.5 py-1 rounded cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setSelectedSubId(null)}
                                  className="text-slate-400 hover:text-slate-600 text-[10px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedSubId(sub.id)}
                                className="border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Emergency Unblind</span>
                              </button>
                            )
                          ) : (
                            <div className="flex items-center text-slate-400 gap-1 text-[9px]">
                              <HelpCircle className="h-3.5 w-3.5" />
                              <span>Requires clearance</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
