import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface LockRecord {
  id: number;
  lock_level: string;
  study_id: number;
  site_id: number | null;
  subject_id: number | null;
  visit_id: number | null;
  is_frozen: boolean;
  is_locked: boolean;
  lock_reason: string;
  locked_by: number;
  created_at: string;
}

interface LockManagementCenterProps {
  studyId: number;
  onClose?: () => void;
}

export default function LockManagementCenter({ studyId, onClose }: LockManagementCenterProps) {
  const [locks, setLocks] = useState<LockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [lockLevel, setLockLevel] = useState<'STUDY' | 'SITE' | 'SUBJECT' | 'VISIT'>('STUDY');
  const [siteId, setSiteId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [visitId, setVisitId] = useState('');
  const [isFrozen, setIsFrozen] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLocks();
  }, [studyId]);

  const fetchLocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v2/edc/locks?study_id=${studyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setLocks(result.data);
      } else {
        setError(result.errors?.[0] || 'Failed to fetch locks list.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with database server.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Lock reason is required.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isLocked ? '/api/v2/edc/locks/lock' : '/api/v2/edc/locks/freeze';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lock_level: lockLevel,
          study_id: studyId,
          site_id: siteId ? parseInt(siteId, 10) : null,
          subject_id: subjectId ? parseInt(subjectId, 10) : null,
          visit_id: visitId ? parseInt(visitId, 10) : null,
          lock_reason: reason
        })
      });
      const result = await res.json();
      if (result.success) {
        setReason('');
        setSiteId('');
        setSubjectId('');
        setVisitId('');
        await fetchLocks();
      } else {
        alert(result.errors?.[0] || 'Failed to apply lock parameters.');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlock = async (lockId: number) => {
    if (!confirm('Are you sure you want to release this lock/freeze? Site coordinators will resume editing permissions.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v2/edc/locks/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lock_id: lockId })
      });
      const result = await res.json();
      if (result.success) {
        await fetchLocks();
      } else {
        alert(result.errors?.[0] || 'Failed to release lock.');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with database.');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
      
      {/* Configuration Form */}
      <div className="flex-1 max-w-md bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-100">
          <Shield className="h-5 w-5 text-indigo-500" />
          <h3 className="font-semibold text-lg">Apply Lock or Freeze</h3>
        </div>

        <form onSubmit={handleApplyLock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Lock Level Hierarchy
            </label>
            <select
              value={lockLevel}
              onChange={e => {
                setLockLevel(e.target.value as any);
                setSiteId('');
                setSubjectId('');
                setVisitId('');
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
            >
              <option value="STUDY">STUDY LEVEL (All Sites & Subjects)</option>
              <option value="SITE">SITE LEVEL (Specific Facility)</option>
              <option value="SUBJECT">SUBJECT LEVEL (Individual Patient)</option>
              <option value="VISIT">VISIT LEVEL (Specific Visit Event)</option>
            </select>
          </div>

          {lockLevel === 'SITE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Site Database ID
              </label>
              <input
                type="number"
                value={siteId}
                onChange={e => setSiteId(e.target.value)}
                placeholder="e.g. 3"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          )}

          {lockLevel === 'SUBJECT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Subject Database ID
              </label>
              <input
                type="number"
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                placeholder="e.g. 42"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          )}

          {lockLevel === 'VISIT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Visit Database ID
              </label>
              <input
                type="number"
                value={visitId}
                onChange={e => setVisitId(e.target.value)}
                placeholder="e.g. 101"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Action Mode
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isFrozen && !isLocked}
                  onChange={() => { setIsFrozen(true); setIsLocked(false); }}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  FREEZE (Site edit blocked; monitor SDV allowed)
                </span>
              </label>
            </div>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isLocked}
                  onChange={() => { setIsFrozen(false); setIsLocked(true); }}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  LOCK (Read-Only for all users)
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Lock Reason (GxP Mandatory)
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Provide reason for database lock or freeze..."
              required
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
          >
            {isLocked ? 'Apply Complete Lock' : 'Apply Database Freeze'}
          </button>
        </form>
      </div>

      {/* Locks Listing Table */}
      <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Lock className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-lg">Active Database Locks</h3>
          </div>
          <button 
            onClick={fetchLocks}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <span className="text-slate-500 animate-pulse">Loading active locks...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
            {error}
          </div>
        ) : locks.length === 0 ? (
          <div className="text-center py-14 text-slate-400 dark:text-slate-500 text-sm">
            No active locks or freezes configured. Database is open for clinical data entry.
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Level</th>
                  <th className="p-3">Target Details</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {locks.map(item => {
                  let target = 'Study-wide';
                  if (item.lock_level === 'SITE') target = `Site ID: ${item.site_id}`;
                  if (item.lock_level === 'SUBJECT') target = `Subject ID: ${item.subject_id}`;
                  if (item.lock_level === 'VISIT') target = `Visit ID: ${item.visit_id}`;
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {item.lock_level}
                      </td>
                      <td className="p-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/20 rounded">
                        {target}
                      </td>
                      <td className="p-3">
                        {item.is_locked ? (
                          <span className="flex items-center gap-1 text-xs font-semibold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-200/30">
                            <Lock className="h-3 w-3" />
                            LOCKED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200/30">
                            <AlertTriangle className="h-3 w-3" />
                            FROZEN
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs max-w-[150px] truncate" title={item.lock_reason}>
                        {item.lock_reason}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleUnlock(item.id)}
                          className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-800 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 px-2.5 py-1 rounded transition-colors"
                        >
                          <Unlock className="h-3.5 w-3.5" />
                          Release
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
