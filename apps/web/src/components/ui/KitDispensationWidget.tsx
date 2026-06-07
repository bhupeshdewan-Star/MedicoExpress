import React, { useState } from 'react';
import { Pill, Printer, AlertTriangle, CheckCircle } from 'lucide-react';

interface WidgetProps {
  subjectId: number;
  subjectNumber: string;
  visitId: number;
  visitName: string;
  isRandomized: boolean;
  token: string;
  onSuccess: () => void;
}

export default function KitDispensationWidget({ subjectId, subjectNumber, visitId, visitName, isRandomized, token, onSuccess }: WidgetProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dispensedKit, setDispensedKit] = useState<any>(null);

  const handleDispense = async () => {
    setLoading(true);
    setError('');
    setDispensedKit(null);

    try {
      const res = await fetch(`/api/v1/rtsm/subjects/${subjectId}/dispense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ visitId })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setDispensedKit(resJson.kit);
        onSuccess();
      } else {
        setError(resJson.errors?.[0] || 'Dispensation failed. No matching kits available at site inventory.');
      }
    } catch (err: any) {
      setError(err.message || 'Dispensation execution error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/40 text-left font-sans text-xs space-y-3">
      <div className="flex items-center gap-1.5 border-b dark:border-slate-800 pb-1.5 font-bold">
        <Pill className="h-4 w-4 text-brand-teal" />
        <span>Kit Dispensation Workspace</span>
      </div>

      {!isRandomized ? (
        <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500 rounded text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Blinding Rule: Subject must be randomized before kit dispensation. Use the subject randomization panel to allocate a treatment code.</span>
        </div>
      ) : dispensedKit ? (
        <div className="space-y-3 text-[11px]">
          <div className="flex gap-1.5 items-center text-green-600 dark:text-green-400 font-bold">
            <CheckCircle className="h-4 w-4" />
            <span>Dispensation Completed Successfully!</span>
          </div>
          <div className="p-3 border border-green-200 bg-green-500/5 rounded font-mono space-y-1">
            <div>Subject: {subjectNumber}</div>
            <div>Visit ID: {visitName}</div>
            <div>Kit Label Assigned: <span className="font-bold underline text-slate-800 dark:text-slate-200">{dispensedKit.kit_number}</span></div>
            <div>Blinded Treatment Arm: {dispensedKit.treatment_arm}</div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 bg-brand-teal text-white font-semibold px-3 py-1 rounded cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Label</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-slate-500 leading-relaxed text-[11px]">
            Executing kit dispensation will search active site inventory for unexpired kits matching the subject's treatment group. This action is irreversible.
          </div>
          {error && <div className="text-red-500 text-[10px] font-bold">{error}</div>}
          <button
            onClick={handleDispense}
            disabled={loading}
            className="bg-brand-teal text-white hover:bg-brand-teal-dark font-semibold px-4 py-1.5 rounded cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Allocating Kit...' : 'Dispense Kit'}
          </button>
        </div>
      )}
    </div>
  );
}
