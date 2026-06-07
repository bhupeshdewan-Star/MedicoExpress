import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCheck, Plus, Calendar, AlertTriangle, ShieldAlert } from 'lucide-react';

interface Subject {
  id: number;
  study_id: number;
  site_id: number;
  site_name: string;
  protocol_number: string;
  subject_number: string;
  enrollment_date: string;
  status: string;
}

interface Visit {
  id: number;
  subject_id: number;
  visit_name: string;
  scheduled_date: string;
  actual_date: string;
  status: string;
}

interface Deviation {
  id: number;
  study_id: number;
  site_id: number;
  subject_id: number;
  deviation_type: string;
  description: string;
  reported_date: string;
  severity: string;
}

export default function SubjectCenter() {
  const { token } = useAuth() as any;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubId, setActiveSubId] = useState<number | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [deviations, setDeviations] = useState<Deviation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form register subject
  const [siteId, setSiteId] = useState('1');
  const [studyId, setStudyId] = useState('1');
  const [subNumber, setSubNumber] = useState('');

  // Form log deviation
  const [devType, setDevType] = useState('VISIT_WINDOW');
  const [devDesc, setDevDesc] = useState('');
  const [devSeverity, setDevSeverity] = useState('MINOR');

  useEffect(() => {
    fetchSubjects();
    fetchDeviations();
  }, [token]);

  useEffect(() => {
    if (activeSubId) {
      fetchSubjectVisits(activeSubId);
    }
  }, [activeSubId]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        setSubjects(resJson.data);
        if (resJson.data.length > 0) {
          setActiveSubId(resJson.data[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error loading subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectVisits = async (subId: number) => {
    try {
      const res = await fetch(`/api/v1/subjects/${subId}/visits`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        setVisits(resJson.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDeviations = async () => {
    try {
      const res = await fetch('/api/v1/subjects/deviations?study_id=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        setDeviations(resJson.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          study_id: parseInt(studyId),
          site_id: parseInt(siteId),
          subject_number: subNumber
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setSubNumber('');
        fetchSubjects();
      } else {
        setError(resJson.errors?.[0] || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEnrollSubject = async (subId: number) => {
    try {
      const res = await fetch(`/api/v1/subjects/${subId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'ENROLLED' })
      });
      const resJson = await res.json();
      if (resJson.success) {
        fetchSubjects();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCompleteVisit = async (visitId: number) => {
    try {
      const res = await fetch(`/api/v1/subjects/visits/${visitId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ actual_date: new Date().toISOString() })
      });
      const resJson = await res.json();
      if (resJson.success && activeSubId) {
        fetchSubjectVisits(activeSubId);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogDeviation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubId || !activeSub) return;
    try {
      const res = await fetch('/api/v1/subjects/deviations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          study_id: activeSub.study_id,
          site_id: activeSub.site_id,
          subject_id: activeSubId,
          deviation_type: devType,
          description: devDesc,
          severity: devSeverity
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setDevDesc('');
        fetchDeviations();
      } else {
        setError(resJson.errors?.[0] || 'Logging deviation failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTriggerRTSM = async () => {
    try {
      const res = await fetch('/api/v1/subjects/randomization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studyId: 1, subjectId: activeSubId })
      });
      const resJson = await res.json();
      if (res.status === 501) {
        alert(`RTSM Allocation Request Blocked:\n${resJson.errors[0]}`);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const activeSub = subjects.find(s => s.id === activeSubId);
  const filteredSubjects = subjects.filter(s => statusFilter === 'ALL' || s.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-brand-teal" />
            <span>Trial Subjects Enrollment & Tracker</span>
          </h1>
          <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
            Enroll study subjects, schedule longitudinal visits, and log protocol compliance deviations.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading trial subjects...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Subjects Registry & Filtering */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400">Subject Registry</h2>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 dark:border-slate-800 rounded p-1 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                >
                  <option value="ALL">All Status</option>
                  <option value="SCREENING">Screening</option>
                  <option value="ENROLLED">Enrolled</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredSubjects.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => setActiveSubId(sub.id)}
                    className={`p-3.5 rounded border cursor-pointer transition-all ${
                      activeSubId === sub.id
                        ? 'border-brand-teal bg-brand-teal/5 text-brand-teal-dark font-bold'
                        : 'border-slate-150 dark:border-slate-800 hover:bg-slate-55'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                        {sub.subject_number}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        sub.status === 'ENROLLED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Facility: {sub.site_name} | {sub.protocol_number}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Register Subject form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-brand-teal" />
                <span>Screen Subject</span>
              </h2>
              <form onSubmit={handleRegisterSubject} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-450 dark:text-slate-400 mb-1">Link to Study ID</label>
                  <input
                    type="number"
                    required
                    value={studyId}
                    onChange={(e) => setStudyId(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
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
                  <label className="block text-slate-450 dark:text-slate-400 mb-1">Subject Screening Number</label>
                  <input
                    type="text"
                    required
                    value={subNumber}
                    onChange={(e) => setSubNumber(e.target.value)}
                    placeholder="e.g. SUB-101-003"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-brand-teal text-white rounded font-semibold cursor-pointer text-xs"
                >
                  Initiate Screening
                </button>
              </form>
            </div>
          </div>

          {/* Visits Timeline & Deviations Registry */}
          <div className="lg:col-span-2 space-y-6">
            {activeSub ? (
              <>
                {/* Active Subject visits schedule */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <div>
                      <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">Subject: {activeSub.subject_number}</h2>
                      <p className="text-xs text-slate-400 mt-1">Status: {activeSub.status} | Site: {activeSub.site_name}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      {activeSub.status === 'SCREENING' && (
                        <button
                          onClick={() => handleEnrollSubject(activeSub.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded cursor-pointer"
                        >
                          Enroll Subject
                        </button>
                      )}
                      
                      {/* RTSM stub trigger */}
                      {activeSub.status === 'ENROLLED' && (
                        <button
                          onClick={handleTriggerRTSM}
                          className="bg-brand-blue text-white font-semibold text-xs px-3.5 py-1.5 rounded cursor-pointer"
                        >
                          RTSM Allocation Request
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-brand-teal" />
                    <span>Visits Timeline Schedule</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    {visits.map(visit => (
                      <div
                        key={visit.id}
                        className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{visit.visit_name}</div>
                          <div className="text-[10px] text-slate-450">Scheduled: {new Date(visit.scheduled_date).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            visit.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {visit.status}
                          </span>
                          {visit.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleCompleteVisit(visit.id)}
                              className="px-2.5 py-1 border border-slate-200 rounded text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
                            >
                              Check-In
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Protocol Deviations Logger & Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deviations log */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                    <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-brand-teal" />
                      <span>Protocol Deviations</span>
                    </h3>
                    <div className="space-y-3 text-xs overflow-y-auto max-h-[300px]">
                      {deviations.filter(d => d.subject_id === activeSubId).length === 0 ? (
                        <div className="text-slate-400 italic py-4">No deviations logged for this subject.</div>
                      ) : (
                        deviations.filter(d => d.subject_id === activeSubId).map(dev => (
                          <div key={dev.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900/10">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-850 dark:text-slate-200">{dev.deviation_type}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                dev.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {dev.severity}
                              </span>
                            </div>
                            <p className="text-slate-450 leading-relaxed text-[11px]">{dev.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Form log deviation */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                    <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-brand-teal" />
                      <span>Log Compliance Incident</span>
                    </h3>
                    <form onSubmit={handleLogDeviation} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-450 dark:text-slate-400 mb-1">Deviation Type</label>
                        <select
                          value={devType}
                          onChange={(e) => setDevType(e.target.value)}
                          className="w-full border border-slate-200 dark:border-slate-800 rounded p-1.5 bg-transparent text-slate-900 dark:text-slate-100"
                        >
                          <option value="VISIT_WINDOW">Missed Visit Window Gaps</option>
                          <option value="INCLUSION_EXCLUSION">Eligibility Deviation</option>
                          <option value="SAFETY">Safety Protocol Failure</option>
                          <option value="OTHER">Other Operational Deviation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-450 dark:text-slate-400 mb-1">Severity Tier</label>
                        <select
                          value={devSeverity}
                          onChange={(e) => setDevSeverity(e.target.value)}
                          className="w-full border border-slate-200 dark:border-slate-800 rounded p-1.5 bg-transparent text-slate-900 dark:text-slate-100"
                        >
                          <option value="MINOR">Minor Deviation</option>
                          <option value="MAJOR">Major Deviation</option>
                          <option value="CRITICAL">Critical Incident</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-450 dark:text-slate-400 mb-1">Detailed Findings</label>
                        <textarea
                          required
                          value={devDesc}
                          onChange={(e) => setDevDesc(e.target.value)}
                          placeholder="e.g. Subject visited 4 days past the Week 4 target date window."
                          rows={3}
                          className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-brand-teal text-white rounded font-semibold cursor-pointer"
                      >
                        Submit Incident Log
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card text-slate-400 italic">
                Please select a trial subject from registry to view visits timeline and deviation logs.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
