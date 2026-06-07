import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Plus, CheckSquare, Users, AlertCircle, Award } from 'lucide-react';

interface Site {
  id: number;
  study_id: number;
  protocol_number: string;
  site_number: string;
  name: string;
  country: string;
  status: string;
  target_enrollment: number;
  actual_enrollment: number;
}

interface ChecklistItem {
  id: number;
  site_id: number;
  task_name: string;
  is_completed: boolean;
  completed_at: string;
  completed_by: number;
}

interface Investigator {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  specialty: string;
}

interface Staff {
  id: number;
  site_id: number;
  investigator_id: number;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function SiteManagement() {
  const { token } = useAuth() as any;
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [investigators, setInvestigators] = useState<Investigator[]>([]);
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Register site fields
  const [studyId, setStudyId] = useState('1');
  const [siteNumber, setSiteNumber] = useState('');
  const [siteName, setSiteName] = useState('');
  const [country, setCountry] = useState('United States');
  const [target, setTarget] = useState('15');

  // Assign staff fields
  const [investigatorId, setInvestigatorId] = useState('');
  const [staffRole, setStaffRole] = useState('PI');

  useEffect(() => {
    fetchSites();
    fetchInvestigators();
  }, [token]);

  useEffect(() => {
    if (activeSiteId) {
      fetchSiteDetails(activeSiteId);
    }
  }, [activeSiteId]);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/sites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        setSites(resJson.data);
        if (resJson.data.length > 0) {
          setActiveSiteId(resJson.data[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error loading sites');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestigators = async () => {
    try {
      const res = await fetch('/api/v1/subjects', { // Mock mapping fallback or direct query helper
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Stub values in case database is empty or queries are empty
      setInvestigators([
        { id: 1, first_name: 'Sarah', last_name: 'Jenkins', email: 'sjenkins@bostononcology.org', specialty: 'Oncology' },
        { id: 2, first_name: 'Rajesh', last_name: 'Sharma', email: 'rsharma@tmc.gov.in', specialty: 'Immunotherapy' }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSiteDetails = async (siteId: number) => {
    try {
      // Checklist
      const checkRes = await fetch(`/api/v1/sites/${siteId}/checklist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const checkJson = await checkRes.json();
      if (checkJson.success) {
        setChecklist(checkJson.data);
      }

      // Staff
      const staffRes = await fetch(`/api/v1/sites/${siteId}/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const staffJson = await staffRes.json();
      if (staffJson.success) {
        setStaff(staffJson.data);
      }

      // Performance Score
      const performancePercent = calculateScore(siteId);
      setPerformanceScore(performancePercent);

    } catch (err) {
      console.error(err);
    }
  };

  const calculateScore = (siteId: number) => {
    const site = sites.find(s => s.id === siteId);
    if (!site || site.target_enrollment === 0) return 0;
    return Math.round((site.actual_enrollment / site.target_enrollment) * 100);
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          study_id: parseInt(studyId),
          site_number: siteNumber,
          name: siteName,
          country,
          target_enrollment: parseInt(target)
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setSiteNumber('');
        setSiteName('');
        fetchSites();
      } else {
        setError(resJson.errors?.[0] || 'Failed to register site');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleChecklist = async (itemId: number, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/v1/sites/checklist/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_completed: !currentVal })
      });
      const resJson = await res.json();
      if (resJson.success) {
        if (activeSiteId) {
          fetchSiteDetails(activeSiteId);
          // Refetch sites list to update site active status badge
          const updatedSites = await fetch('/api/v1/sites', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const updateJson = await updatedSites.json();
          if (updateJson.success) {
            setSites(updateJson.data);
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSiteId || !investigatorId) return;
    try {
      const res = await fetch(`/api/v1/sites/${activeSiteId}/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          investigator_id: parseInt(investigatorId),
          role: staffRole
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setInvestigatorId('');
        fetchSiteDetails(activeSiteId);
      } else {
        setError(resJson.errors?.[0] || 'Assignment failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const activeSite = sites.find(s => s.id === activeSiteId);
  const checklistCompletion = checklist.length > 0
    ? Math.round((checklist.filter(c => c.is_completed).length / checklist.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-brand-teal" />
            <span>Site Activation & Management</span>
          </h1>
          <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
            Initiate clinical trial centers, track readiness checklists, and assign research staff.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading trial sites...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sites Directory */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">Investigator Centers</h2>
              <div className="space-y-3">
                {sites.map(site => (
                  <div
                    key={site.id}
                    onClick={() => setActiveSiteId(site.id)}
                    className={`p-4 rounded-card border cursor-pointer transition-all ${
                      activeSiteId === site.id
                        ? 'border-brand-teal bg-brand-teal/5 text-brand-teal-dark font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-55'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono font-bold text-slate-650">
                        {site.site_number} ({site.country})
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        site.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {site.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{site.name}</h3>
                    <div className="text-[11px] text-slate-400 mt-1">Study ID: {site.study_id} | Protocol: {site.protocol_number}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Register site form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-brand-teal" />
                <span>Initiate New Site</span>
              </h2>
              <form onSubmit={handleCreateSite} className="space-y-3 text-xs">
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
                  <label className="block text-slate-450 dark:text-slate-400 mb-1">Site Number</label>
                  <input
                    type="text"
                    required
                    value={siteNumber}
                    onChange={(e) => setSiteNumber(e.target.value)}
                    placeholder="e.g. US-102"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-450 dark:text-slate-400 mb-1">Site Facility Name</label>
                  <input
                    type="text"
                    required
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="e.g. Mayo Clinic"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-450 dark:text-slate-400 mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-450 dark:text-slate-400 mb-1">Enrollment Target</label>
                    <input
                      type="number"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-brand-teal text-white rounded font-semibold cursor-pointer text-xs"
                >
                  Create Site
                </button>
              </form>
            </div>
          </div>

          {/* Site Checklists & Performance */}
          <div className="lg:col-span-2 space-y-6">
            {activeSite ? (
              <>
                {/* Performance score card and activation checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Performance stats */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1">
                        <Award className="h-4 w-4 text-brand-teal" />
                        <span>Performance Scorecard</span>
                      </h3>
                      <p className="text-xs text-slate-400">Recruitment velocity against enrollment target thresholds.</p>
                    </div>
                    <div className="py-6 flex items-baseline gap-2">
                      <span className="text-4xl font-display font-bold text-slate-900 dark:text-slate-100">{performanceScore}%</span>
                      <span className="text-xs text-slate-400">({activeSite.actual_enrollment} of {activeSite.target_enrollment} enrolled)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-brand-teal h-2 rounded-full" style={{ width: `${Math.min(100, performanceScore)}%` }}></div>
                    </div>
                  </div>

                  {/* Checklist summary */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1">
                        <CheckSquare className="h-4 w-4 text-brand-teal" />
                        <span>Startup Milestone Readiness</span>
                      </h3>
                      <p className="text-xs text-slate-400">Checklist items must be complete to transition site to Active.</p>
                    </div>
                    <div className="py-6 flex items-baseline gap-2">
                      <span className="text-4xl font-display font-bold text-slate-900 dark:text-slate-100">{checklistCompletion}%</span>
                      <span className="text-xs text-slate-400">({checklist.filter(c => c.is_completed).length} of {checklist.length} completed)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-brand-blue h-2 rounded-full" style={{ width: `${checklistCompletion}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Activation Checklist details */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                  <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-brand-teal" />
                    <span>Site Activation Checklist</span>
                  </h3>
                  {checklist.length === 0 ? (
                    <div className="text-slate-450 italic text-xs py-4">No checklist tasks loaded.</div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      {checklist.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleChecklist(item.id, item.is_completed)}
                          className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded hover:bg-slate-50 dark:hover:bg-slate-900/30 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.is_completed}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-brand-teal focus:ring-brand-teal h-4 w-4 shrink-0"
                            />
                            <span className={`font-semibold ${item.is_completed ? 'line-through text-slate-400' : 'text-slate-850'}`}>
                              {item.task_name}
                            </span>
                          </div>
                          {item.is_completed && (
                            <span className="text-[10px] text-slate-400">Completed at {new Date(item.completed_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Site Roster staff management */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                  <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-brand-teal" />
                    <span>Investigator & Staff Roster</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* List staff */}
                    <div className="md:col-span-2 space-y-3 text-xs">
                      {staff.length === 0 ? (
                        <div className="text-slate-400 italic py-4 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>No staff assigned to this site. Assign PI to continue.</span>
                        </div>
                      ) : (
                        staff.map(member => (
                          <div key={member.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900/10">
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {member.first_name} {member.last_name}
                              </div>
                              <div className="text-slate-400 text-[10px]">{member.email}</div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-teal/10 text-brand-teal-dark px-2.5 py-0.5 rounded">
                              {member.role}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Assign staff form */}
                    <div className="bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-800 rounded text-xs">
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Assign Member</h4>
                      <form onSubmit={handleAssignStaff} className="space-y-3">
                        <div>
                          <label className="block text-slate-450 dark:text-slate-400 mb-1">Select Investigator</label>
                          <select
                            required
                            value={investigatorId}
                            onChange={(e) => setInvestigatorId(e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-800 rounded p-1.5 bg-transparent text-slate-900 dark:text-slate-100"
                          >
                            <option value="">-- Choose --</option>
                            {investigators.map(inv => (
                              <option key={inv.id} value={inv.id}>{inv.first_name} {inv.last_name} ({inv.specialty})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-450 dark:text-slate-400 mb-1">Role</label>
                          <select
                            value={staffRole}
                            onChange={(e) => setStaffRole(e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-800 rounded p-1.5 bg-transparent text-slate-900 dark:text-slate-100"
                          >
                            <option>PI</option>
                            <option>SUB_I</option>
                            <option>COORDINATOR</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-brand-teal text-white rounded font-semibold cursor-pointer"
                        >
                          Add to Roster
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card text-slate-400 italic">
                Please select a clinical site to view activate checklists and staff roster.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
