import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardCheck, Plus, CheckSquare, ShieldCheck, AlertCircle, PenTool } from 'lucide-react';

interface Visit {
  id: number;
  site_id: number;
  site_number: string;
  site_name: string;
  visit_date: string;
  monitor_id: number;
  monitor_name: string;
  visit_type: string;
  status: string;
}

interface Finding {
  id: number;
  visit_id: number;
  description: string;
  severity: string;
  status: string;
  resolution_details: string;
}

interface Signature {
  id: number;
  visit_id: number;
  user_id: number;
  username: string;
  role: string;
  signature_hash: string;
  signed_at: string;
}

export default function MonitoringCenter() {
  const { token, user } = useAuth() as any;
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activeVisitId, setActiveVisitId] = useState<number | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form schedule fields
  const [siteId, setSiteId] = useState('1');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitType, setVisitType] = useState('IMV');

  // Form findings fields
  const [findingDesc, setFindingDesc] = useState('');
  const [findingSeverity, setFindingSeverity] = useState('MAJOR');

  // Signature validation form
  const [usernameConfirm, setUsernameConfirm] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [signingRole, setSigningRole] = useState('MONITOR');

  useEffect(() => {
    fetchVisits();
  }, [token]);

  useEffect(() => {
    if (activeVisitId) {
      fetchVisitDetails(activeVisitId);
    }
  }, [activeVisitId]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/monitoring', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        setVisits(resJson.data);
        if (resJson.data.length > 0) {
          setActiveVisitId(resJson.data[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error loading monitoring visits');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitDetails = async (visitId: number) => {
    try {
      // Findings
      const findRes = await fetch(`/api/v1/monitoring/${visitId}/findings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const findJson = await findRes.json();
      if (findJson.success) {
        setFindings(findJson.data);
      }

      // Signatures
      const sigRes = await fetch(`/api/v1/monitoring/${visitId}/signatures`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sigJson = await sigRes.json();
      if (sigJson.success) {
        setSignatures(sigJson.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          site_id: parseInt(siteId),
          visit_date: visitDate,
          visit_type: visitType,
          monitor_id: user.id
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        fetchVisits();
      } else {
        setError(resJson.errors?.[0] || 'Scheduling failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (visitId: number, status: string) => {
    try {
      const res = await fetch(`/api/v1/monitoring/${visitId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const resJson = await res.json();
      if (resJson.success) {
        fetchVisits();
      } else {
        setError(resJson.errors?.[0] || 'Transition blocked');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisitId) return;

    if (usernameConfirm !== user.username) {
      setError('e-Signature failed: Username confirmation does not match logged-in user.');
      return;
    }

    try {
      const res = await fetch(`/api/v1/monitoring/${activeVisitId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: signingRole,
          password: passwordConfirm // Simulated Part 11 double credential verification
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setUsernameConfirm('');
        setPasswordConfirm('');
        fetchVisitDetails(activeVisitId);
        fetchVisits(); // Reload visits to update status
      } else {
        setError(resJson.errors?.[0] || 'e-Signature sign-off rejected');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisitId) return;
    try {
      const res = await fetch(`/api/v1/monitoring/${activeVisitId}/findings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: findingDesc,
          severity: findingSeverity
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setFindingDesc('');
        fetchVisitDetails(activeVisitId);
      } else {
        setError(resJson.errors?.[0] || 'Adding finding failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResolveFinding = async (findingId: number) => {
    try {
      const res = await fetch(`/api/v1/monitoring/findings/${findingId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resolution_details: 'Resolved during follow-up validation audits.' })
      });
      const resJson = await res.json();
      if (resJson.success && activeVisitId) {
        fetchVisitDetails(activeVisitId);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const activeVisit = visits.find(v => v.id === activeVisitId);
  const monitorSigned = signatures.some(s => s.role === 'MONITOR');
  const piSigned = signatures.some(s => s.role === 'PI');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-brand-teal" />
            <span>Site Monitoring & Report Verification</span>
          </h1>
          <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
            Conduct site qualification, initiation, and interim monitoring audits carrying secure double signatures.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading monitoring records...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Schedule Monitoring Visit list */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">Visits Log</h2>
              <div className="space-y-3">
                {visits.map(visit => (
                  <div
                    key={visit.id}
                    onClick={() => setActiveVisitId(visit.id)}
                    className={`p-4 rounded border cursor-pointer transition-all ${
                      activeVisitId === visit.id
                        ? 'border-brand-teal bg-brand-teal/5 text-brand-teal-dark font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-55'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono font-bold text-slate-650">
                        Site {visit.site_number} ({visit.visit_type})
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        visit.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-slate-105 text-slate-700'
                      }`}>
                        {visit.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{visit.site_name}</h3>
                    <div className="text-[10px] text-slate-400 mt-1">Date: {new Date(visit.visit_date).toLocaleDateString()} | Monitor: {visit.monitor_name || 'Unassigned'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-brand-teal" />
                <span>Schedule Audit Visit</span>
              </h2>
              <form onSubmit={handleScheduleVisit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-450 dark:text-slate-400 mb-1">Link to Site ID</label>
                  <input
                    type="number"
                    required
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-450 dark:text-slate-400 mb-1">Audit Visit Date</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-450 dark:text-slate-400 mb-1">Visit Type</label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                  >
                    <option value="SQV">Site Qualification Visit (SQV)</option>
                    <option value="SIV">Site Initiation Visit (SIV)</option>
                    <option value="IMV">Interim Monitoring Visit (IMV)</option>
                    <option value="COV">Close Out Visit (COV)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-brand-teal text-white rounded font-semibold cursor-pointer text-xs"
                >
                  Schedule Visit
                </button>
              </form>
            </div>
          </div>

          {/* Report workflow, eSignatures, Findings */}
          <div className="lg:col-span-2 space-y-6">
            {activeVisit ? (
              <>
                {/* Active monitoring report controls and signatures */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <div>
                      <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">Audit Report: Site {activeVisit.site_number}</h2>
                      <p className="text-xs text-slate-400 mt-1">Status: {activeVisit.status} | Type: {activeVisit.visit_type}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      {activeVisit.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleUpdateStatus(activeVisit.id, 'IN_PROGRESS')}
                          className="bg-brand-teal text-white font-semibold text-xs px-3.5 py-1.5 rounded cursor-pointer"
                        >
                          Start Visit
                        </button>
                      )}
                      {activeVisit.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleUpdateStatus(activeVisit.id, 'REPORT_PENDING')}
                          className="bg-slate-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded cursor-pointer"
                        >
                          Complete Visit (Draft Report)
                        </button>
                      )}
                      {activeVisit.status === 'REPORT_PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(activeVisit.id, 'PENDING_SIGNATURE')}
                          className="bg-amber-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded cursor-pointer"
                        >
                          Submit for e-Signature
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Signatures status indicator */}
                  <div className="grid grid-cols-2 gap-4 border border-slate-100 dark:border-slate-850 p-4 rounded bg-slate-50 dark:bg-slate-900/10 text-xs">
                    <div>
                      <div className="font-bold text-slate-750 flex items-center gap-1.5">
                        <ShieldCheck className={`h-4 w-4 ${monitorSigned ? 'text-green-500' : 'text-slate-350'}`} />
                        <span>Clinical Research Monitor Signature</span>
                      </div>
                      {monitorSigned ? (
                        <div className="text-[10px] text-green-600 font-semibold mt-1">Signed & Confirmed</div>
                      ) : (
                        <div className="text-[10px] text-slate-400 mt-1">Awaiting Sign-off</div>
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-slate-750 flex items-center gap-1.5">
                        <ShieldCheck className={`h-4 w-4 ${piSigned ? 'text-green-500' : 'text-slate-350'}`} />
                        <span>Principal Investigator Signature</span>
                      </div>
                      {piSigned ? (
                        <div className="text-[10px] text-green-600 font-semibold mt-1">Signed & Confirmed</div>
                      ) : (
                        <div className="text-[10px] text-slate-400 mt-1">Awaiting Sign-off</div>
                      )}
                    </div>
                  </div>

                  {/* Sign form (Part 11) */}
                  {activeVisit.status === 'PENDING_SIGNATURE' && (!monitorSigned || !piSigned) && (
                    <form onSubmit={handleSignReport} className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3 text-xs max-w-sm">
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <PenTool className="h-4 w-4 text-brand-teal" />
                        <span>21 CFR Part 11 Electronic Signature Validation</span>
                      </h4>
                      <div>
                        <label className="block text-slate-450 dark:text-slate-400 mb-1">Confirm Username</label>
                        <input
                          type="text"
                          required
                          value={usernameConfirm}
                          onChange={(e) => setUsernameConfirm(e.target.value)}
                          className="w-full border border-slate-200 dark:border-slate-800 rounded p-1.5 bg-transparent text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-450 dark:text-slate-400 mb-1">Enter Password</label>
                          <input
                            type="password"
                            required
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-800 rounded p-1.5 bg-transparent text-slate-900 dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-450 dark:text-slate-400 mb-1">Signature Role</label>
                          <select
                            value={signingRole}
                            onChange={(e) => setSigningRole(e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-800 rounded p-1.5 bg-transparent text-slate-900 dark:text-slate-100"
                          >
                            <option>MONITOR</option>
                            <option>PI</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-brand-teal text-white rounded font-semibold cursor-pointer"
                      >
                        Sign & Seal Record
                      </button>
                    </form>
                  )}
                </div>

                {/* Findings Audit Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Findings list */}
                  <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                    <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-brand-teal" />
                      <span>Audit Findings & Action plans (CAPA)</span>
                    </h3>

                    <div className="space-y-3 text-xs overflow-y-auto max-h-[350px]">
                      {findings.length === 0 ? (
                        <div className="text-slate-400 italic py-4">No findings logged for this monitoring visit.</div>
                      ) : (
                        findings.map(finding => (
                          <div key={finding.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900/10">
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                finding.severity === 'CRITICAL' ? 'bg-red-105 text-red-700' : 'bg-amber-105 text-amber-700'
                              }`}>
                                {finding.severity}
                              </span>
                              <span className="text-[10px] text-slate-400">{finding.status}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">"{finding.description}"</p>
                            {finding.status === 'OPEN' ? (
                              <button
                                onClick={() => handleResolveFinding(finding.id)}
                                className="px-2 py-1 bg-brand-teal text-white rounded font-semibold text-[10px] cursor-pointer"
                              >
                                Resolve & Attach CAPA
                              </button>
                            ) : (
                              <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-100 dark:border-slate-850 pt-1">
                                <span className="font-bold text-slate-650">Resolution Details:</span> {finding.resolution_details}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add finding form */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                    <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4">Log Monitoring Finding</h4>
                    <form onSubmit={handleAddFinding} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-450 dark:text-slate-400 mb-1">Finding Severity</label>
                        <select
                          value={findingSeverity}
                          onChange={(e) => setFindingSeverity(e.target.value)}
                          className="w-full border border-slate-200 dark:border-slate-800 rounded p-1.5 bg-transparent text-slate-900 dark:text-slate-100"
                        >
                          <option value="CRITICAL">Critical Finding (Escalate)</option>
                          <option value="MAJOR">Major Finding</option>
                          <option value="MINOR">Minor Finding</option>
                          <option value="OBSERVATION">Observation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-450 dark:text-slate-400 mb-1">Finding Description</label>
                        <textarea
                          required
                          value={findingDesc}
                          onChange={(e) => setFindingDesc(e.target.value)}
                          placeholder="e.g. Critical lack of source documentation verification on Baseline visit."
                          rows={4}
                          className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-brand-teal text-white rounded font-semibold cursor-pointer"
                      >
                        Add to Audit Report
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card text-slate-400 italic">
                Please select a monitoring audit record from logs to view findings and sign-off report.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
