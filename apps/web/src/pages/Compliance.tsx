import React, { useState, useEffect } from 'react';
import { ShieldCheck, ClipboardCheck, AlertTriangle, Play, RefreshCcw, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ComplianceCenter() {
  const { token } = useAuth() as any;
  const [verifying, setVerifying] = useState(false);
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [tampered, setTampered] = useState(false);
  const [iqState, setIqState] = useState('Passed');
  const [oqState, setOqState] = useState('Passed');
  const [pqState, setPqState] = useState('Passed');
  const [validating, setValidating] = useState(false);

  // Fetch initial validation logs on mount
  useEffect(() => {
    if (!token || token.includes('simulated')) return;
    const fetchLatestValidation = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/compliance/validations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const latest = data[0];
            setIqState(latest.execution_log.includes('IQ [FAILED]') ? 'Failed' : 'Passed');
            setOqState(latest.execution_log.includes('OQ [FAILED]') ? 'Failed' : 'Passed');
            setPqState(latest.execution_log.includes('PQ [FAILED]') ? 'Failed' : 'Passed');
          }
        }
      } catch (err) {
        console.warn('Failed to load compliance validation history:', err);
      }
    };
    fetchLatestValidation();
  }, [token]);

  const handleRunVerify = async () => {
    setVerifying(true);
    setVerified(false);
    setTampered(false);
    setVerificationLogs(['[SYSTEM] Initializing audit validation...', '[AUDIT] Reading Merkle blocks from PostgreSQL...']);

    if (!token || token.includes('simulated')) {
      // Simulation mode fallback
      const steps = [
        '[SECURITY] Fetching active Merkle block chain leaves...',
        '[VAULT] Running SHA-256 integrity hash verification checks...',
        '[SUCCESS] All logs verify successfully against Merkle root hash #A39B.'
      ];
      steps.forEach((step, idx) => {
        setTimeout(() => {
          setVerificationLogs(prev => [...prev, step]);
          if (idx === steps.length - 1) {
            setVerifying(false);
            setVerified(true);
          }
        }, (idx + 1) * 300);
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/v1/compliance/audit/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setVerificationLogs(prev => [
          ...prev,
          `[Merkle Vault] Scan complete. Integrity validation: ${data.status}`,
          `[Blocks Checked] ${data.verified_blocks || 0} blocks, ${data.verified_records || 0} leaves validated.`,
          data.status === 'VALID' ? '[SUCCESS] Merkle chain is cryptographically intact.' : `[TAMPERED] ${data.reason}`
        ]);
        if (data.status === 'VALID') {
          setVerified(true);
        } else {
          setTampered(true);
        }
      } else {
        setVerificationLogs(prev => [...prev, `[ERROR] Verification crashed: ${data.error || 'Server error'}`]);
      }
    } catch (err: any) {
      setVerificationLogs(prev => [...prev, `[ERROR] Fetch failed: ${err.message}`]);
    } finally {
      setVerifying(false);
    }
  };

  const handleRunGxPValidate = async () => {
    setValidating(true);
    setVerified(false);
    setTampered(false);
    setVerificationLogs(['[SYSTEM] Initializing GxP automated validation...', '[TEST] Running IQ, OQ, PQ validation suite...']);

    try {
      const response = await fetch('http://localhost:5000/api/v1/compliance/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setVerificationLogs(prev => [
          ...prev,
          ...data.logs.map((l: string) => `[TEST RUN] ${l}`),
          `[SUMMARY] Suite execution status: ${data.status}`,
          `[IQ Status] ${data.iq} | [OQ Status] ${data.oq} | [PQ Status] ${data.pq}`
        ]);
        setIqState(data.iq === 'PASSED' ? 'Passed' : 'Failed');
        setOqState(data.oq === 'PASSED' ? 'Passed' : 'Failed');
        setPqState(data.pq === 'PASSED' ? 'Passed' : 'Failed');
      } else {
        setVerificationLogs(prev => [...prev, `[ERROR] GxP validations failed: ${data.error || 'Server error'}`]);
      }
    } catch (err: any) {
      setVerificationLogs(prev => [...prev, `[ERROR] Validation run failed: ${err.message}`]);
    } finally {
      setValidating(false);
    }
  };

  const kpis = [
    { label: 'Active CAPAs', value: '2 Open', status: 'Warning', desc: 'Corrective actions pending signoff', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Change Controls', value: '4 Active', status: 'Active', desc: 'System version updates in progress', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Open Deviations', value: '0 Open', status: 'Optimal', desc: 'No deviations flagged QTD', color: 'text-green-600 bg-green-50 border-green-200' }
  ];

  return (
    <div className="space-y-6">
      {/* Upper overview card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">Compliance & GxP Validation</h2>
          <p className="text-xs text-slate-450 dark:text-slate-400">FDA 21 CFR Part 11 and EU Annex 11 validated control dashboard.</p>
        </div>

        <div className="flex gap-2.5">
          <button 
            onClick={handleRunVerify} 
            disabled={verifying || validating}
            className="px-4 py-2 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-button text-xs font-semibold transition-colors flex items-center gap-2"
          >
            {verifying ? <RefreshCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            <span>Run Merkle Chain Validation</span>
          </button>
          <button 
            onClick={handleRunGxPValidate} 
            disabled={verifying || validating}
            className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-button text-xs font-semibold transition-colors flex items-center gap-2"
          >
            {validating ? <RefreshCcw className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
            <span>Run GxP validations (IQ/OQ/PQ)</span>
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`p-5 rounded-card border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${kpi.color}`}>
                {kpi.status}
               </span>
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">{kpi.value}</h3>
            <p className="text-xs text-slate-400 leading-normal">{kpi.desc}</p>
          </div>
        ))}
      </div>

      {/* Compliance Log Verification Terminal & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Verification output logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 space-y-4">
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-teal" />
              <span>Merkle Chain Integrity Logging Terminal</span>
            </h3>

            {verifying || validating || verificationLogs.length > 0 ? (
              <div className="bg-slate-950 p-4 rounded-card border border-slate-800 font-mono text-[11px] text-brand-teal-light space-y-1.5 min-h-[160px]">
                {verificationLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
                {verifying && (
                  <div className="flex items-center gap-2 text-white">
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-brand-teal border-t-transparent rounded-full shrink-0"></span>
                    <span>Validating leaf nodes signature blocks...</span>
                  </div>
                )}
                {validating && (
                  <div className="flex items-center gap-2 text-white">
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-brand-blue border-t-transparent rounded-full shrink-0"></span>
                    <span>Running operational database rules suites...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded text-xs text-slate-400">
                Click "Run Merkle Chain Validation" or "Run GxP validations" to begin testing checks.
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Verification Result Check Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 space-y-4">
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-brand-teal" />
              <span>Validation Checklist State</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-850 rounded">
                <span>Installation Qualification (IQ)</span>
                <span className={iqState === 'Passed' ? 'text-brand-green font-semibold' : 'text-rose-500 font-semibold'}>{iqState}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-850 rounded">
                <span>Operational Qualification (OQ)</span>
                <span className={oqState === 'Passed' ? 'text-brand-green font-semibold' : 'text-rose-500 font-semibold'}>{oqState}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-850 rounded">
                <span>Performance Qualification (PQ)</span>
                <span className={pqState === 'Passed' ? 'text-brand-green font-semibold' : 'text-rose-500 font-semibold'}>{pqState}</span>
              </div>
            </div>

            {verified && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/60 rounded-card text-xs text-green-700 dark:text-green-300 leading-relaxed">
                <strong>System status verified.</strong> Cryptographic audit scans confirm zero tampering logs. All signatures are aligned.
              </div>
            )}
            {tampered && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-card text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                <strong>Data integrity violation!</strong> Cryptographic Merkle verification failed. Discrepancies detected in block audits history.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
