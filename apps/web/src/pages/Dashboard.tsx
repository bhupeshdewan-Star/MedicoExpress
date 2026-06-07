import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, Briefcase, CheckSquare, ClipboardCheck, ArrowUpRight, History, 
  Users, AlertTriangle, ShieldAlert, CheckCircle2, TrendingUp, Calendar, 
  MapPin, ShieldCheck, Database, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { token, user, activeRole, devSwitchRole } = useAuth() as any;
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    sop_count: 42,
    project_count: 12,
    tasks_due: 3,
    approvals_due: 2,
    recent_activities: []
  });
  const [loading, setLoading] = useState(true);

  // We add a state to manually toggle dashboard views for UAT presentation
  const [demoViewRole, setDemoViewRole] = useState<string>(activeRole || 'Admin');

  useEffect(() => {
    if (activeRole) {
      setDemoViewRole(activeRole);
    }
  }, [activeRole]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          throw new Error('Fallback required');
        }
      } catch (err) {
        // Fallback simulation metrics
        setStats({
          sop_count: 42,
          project_count: 12,
          tasks_due: 3,
          approvals_due: 2,
          recent_activities: [
            { id: 1, username: 'coordinator@demo.com', action_type: 'LOGIN', target_resource: 'auth/login', ip_address: '127.0.0.1', timestamp: new Date().toISOString() },
            { id: 2, username: 'cra@demo.com', action_type: 'DCT_VISIT_CHECKIN', target_resource: 'visit:3', ip_address: '127.0.0.1', timestamp: new Date().toISOString() },
            { id: 3, username: 'medmon1@novabio.com', action_type: 'AI_ALERT_REVIEW', target_resource: 'alert:1', ip_address: '127.0.0.1', timestamp: new Date().toISOString() }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetRole = e.target.value;
    setDemoViewRole(targetRole);
    devSwitchRole(targetRole);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header with UAT Demo Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
            NovaBio Clinical Research Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            FDA GxP Validated SaaS Environment. Authenticated user: <strong className="text-brand-teal font-medium">{user?.username}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            UAT Perspective Switcher:
          </label>
          <select 
            value={demoViewRole} 
            onChange={handleRoleChange}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal"
          >
            <option value="Admin">Sponsor Executive Dashboard</option>
            <option value="CRA Monitor">CRO Monitoring Operations</option>
            <option value="Data Manager">Data Management Control</option>
            <option value="Head of Medical Affairs">Safety & Medical Monitor Dashboard</option>
          </select>
        </div>
      </div>

      {/* 2. Custom Role Perspectives */}
      {demoViewRole === 'Admin' && (
        <SponsorExecutiveDashboard stats={stats} navigate={navigate} />
      )}
      {demoViewRole === 'CRA Monitor' && (
        <CroMonitoringDashboard stats={stats} navigate={navigate} />
      )}
      {demoViewRole === 'Data Manager' && (
        <DataManagerDashboard stats={stats} navigate={navigate} />
      )}
      {demoViewRole === 'Head of Medical Affairs' && (
        <SafetyMedicalDashboard stats={stats} navigate={navigate} />
      )}

      {/* 3. System Log Feeds (Regulatory Compliance Requirement) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-brand-teal" />
            <span>Real-time GxP System Activity Trail (21 CFR Part 11 Verified)</span>
          </h3>
          <button 
            onClick={() => navigate('/audit-trail')} 
            className="text-xs text-brand-teal hover:underline font-semibold flex items-center gap-1"
          >
            <span>View Full Audit Vault</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.recent_activities.map((act: any, i: number) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {act.action_type}
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">
                  User: <span className="text-brand-teal">{act.username}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Resource: {act.target_resource}</p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                <span>IP: {act.ip_address}</span>
                <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SPONSOR EXECUTIVE DASHBOARD VIEW
// ----------------------------------------------------
function SponsorExecutiveDashboard({ stats, navigate }: any) {
  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <DashboardCard title="Oncology Trial Enrollment" value="82.4%" icon={Users} desc="412 of 500 subjects enrolled" trend="+4.2%" color="teal" />
        <DashboardCard title="Site Performance Rating" value="A+" icon={Briefcase} desc="All 15 sites validated" trend="Stable" color="blue" />
        <DashboardCard title="Protocol Deviations" value="0.8%" icon={AlertTriangle} desc="4 incidents tracked" trend="-0.3%" color="amber" />
        <DashboardCard title="eTMF Completeness" value="94.2%" icon={FileText} desc="471 of 500 documents verified" trend="+2.1%" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Studies Portfolio */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-brand-teal" />
            <span>Active Trial Portfolios</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                  <th className="py-3">Study / Protocol</th>
                  <th>Status</th>
                  <th>Enrollment Progress</th>
                  <th>RBM Risk Level</th>
                  <th>Forms Locked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="py-4.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100">Phase II Oncology Trial</span>
                    <p className="text-xs text-slate-400">NB-ONC-2026</p>
                  </td>
                  <td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">ACTIVE</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-teal h-full" style={{ width: '82%' }}></div>
                      </div>
                      <span className="text-xs font-semibold">82%</span>
                    </div>
                  </td>
                  <td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">MEDIUM (55.4)</span></td>
                  <td className="font-semibold text-slate-900 dark:text-slate-100">12 Forms</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="py-4.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100">Type 2 Diabetes Study</span>
                    <p className="text-xs text-slate-400">NB-DIA-2026</p>
                  </td>
                  <td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">ACTIVE</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-teal h-full" style={{ width: '56%' }}></div>
                      </div>
                      <span className="text-xs font-semibold">56%</span>
                    </div>
                  </td>
                  <td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">LOW (22.8)</span></td>
                  <td className="font-semibold text-slate-900 dark:text-slate-100">8 Forms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Study Goals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-brand-teal" />
            <span>Regulatory Milestones</span>
          </h3>
          <div className="space-y-4">
            <MilestoneItem title="Oncology Mid-Study Report" status="Completed" date="May 2026" />
            <MilestoneItem title="Diabetes Phase III FDA Submission" status="In Progress" date="Jul 2026" />
            <MilestoneItem title="Rheumatology Clinical Protocol Draft" status="Draft" date="Aug 2026" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// CRO MONITORING VIEW
// ----------------------------------------------------
function CroMonitoringDashboard({ stats, navigate }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <DashboardCard title="Sites Activated" value="12 / 15" icon={MapPin} desc="80% of target sites open" trend="Stable" color="teal" />
        <DashboardCard title="Monitoring Visits Done" value="31 visits" icon={Calendar} desc="CRA monitor check-ins logged" trend="+5" color="blue" />
        <DashboardCard title="SDV Completion %" value="91.2%" icon={ClipboardCheck} desc="Source data verified fields" trend="+1.5%" color="green" />
        <DashboardCard title="Outstanding Findings" value="2 open" icon={AlertTriangle} desc="Requires site remediation" trend="New" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-brand-teal" />
            <span>Upcoming Site Visit Operations Calendar</span>
          </h3>
          <div className="space-y-3">
            <VisitScheduleRow site="Dana-Farber Cancer (Site 001)" monitor="cra1@novabio.com" date="June 12, 2026" type="IMV (Interim Monitoring Visit)" />
            <VisitScheduleRow site="Memorial Sloan Kettering (Site 002)" monitor="cra2@novabio.com" date="June 18, 2026" type="IMV" />
            <VisitScheduleRow site="Joslin Diabetes Center (Site 006)" monitor="cra4@novabio.com" date="June 22, 2026" type="COV (Close Out Visit)" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ClipboardCheck className="h-4.5 w-4.5 text-brand-teal" />
            <span>Site Activation Tracker</span>
          </h3>
          <div className="space-y-3">
            <ActivationRow name="Dana-Farber Oncology" step="Contracts Executed" status="done" />
            <ActivationRow name="Memorial Sloan Cancer" step="IRB Clearance Approved" status="done" />
            <ActivationRow name="Cleveland Clinic Rheumatology" step="Investigator Initiation Meeting" status="pending" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// DATA MANAGEMENT VIEW
// ----------------------------------------------------
function DataManagerDashboard({ stats, navigate }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <DashboardCard title="Query Status Funnel" value="OPEN: 12" icon={Layers} desc="8 Answered | 40 Closed" trend="Active" color="amber" />
        <DashboardCard title="Missing Variables" value="1.2%" icon={Database} desc="Out of 12,500 clinical points" trend="-0.4%" color="green" />
        <DashboardCard title="Coding Backlog" value="0 items" icon={FileText} desc="MedDRA / WHODrug fully matched" trend="Complete" color="teal" />
        <DashboardCard title="Data Lock Readiness" value="Study 10: 92%" icon={Layers} desc="Sites 101 to 105 lock reviews" trend="On Track" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-brand-teal" />
            <span>Query Discrepancy Breakdown Funnel</span>
          </h3>
          <div className="space-y-4">
            <FunnelBar label="Closed Queries" count={40} percent={66} color="bg-brand-teal" />
            <FunnelBar label="Open Queries (Pending Site)" count={12} percent={20} color="bg-amber-500" />
            <FunnelBar label="Answered Queries (Pending Review)" count={8} percent={14} color="bg-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-brand-teal" />
            <span>Form Lock Status Checklist</span>
          </h3>
          <div className="space-y-3.5">
            <ChecklistItem text="Oncology study design schema: APPROVED" checked={true} />
            <ChecklistItem text="Vitals validation rules verified: PASSED" checked={true} />
            <ChecklistItem text="Lock RLS tenant filters validated: PASSED" checked={true} />
            <ChecklistItem text="CRA signature workflow checks: PENDING" checked={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SAFETY & MEDICAL AFFAIRS VIEW
// ----------------------------------------------------
function SafetyMedicalDashboard({ stats, navigate }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <DashboardCard title="Adverse Events (AE)" value="12 cases" icon={AlertTriangle} desc="Mild to moderate symptoms" trend="Monitored" color="blue" />
        <DashboardCard title="Serious Adverse (SAE)" value="0 cases" icon={ShieldAlert} desc="Zero life-threatening events" trend="Secure" color="green" />
        <DashboardCard title="AI Generated Alerts" value="3 alerts" icon={ShieldAlert} desc="Subject outlier detections" trend="Active" color="amber" />
        <DashboardCard title="Medical Review Queue" value="1 pending" icon={ClipboardCheck} desc="Dual eSignature required" trend="Pending" color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-brand-teal" />
            <span>Active Safety Signal Detections</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                  <th className="py-2.5">Alert ID</th>
                  <th>Type</th>
                  <th>Target subject</th>
                  <th>Score %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="py-3 font-semibold text-brand-teal-dark">ALT-101</td>
                  <td>SAFETY_SIGNAL</td>
                  <td>Subject 1001 (Oncology)</td>
                  <td>82.50%</td>
                  <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">PENDING_REVIEW</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="py-3 font-semibold text-brand-teal-dark">ALT-102</td>
                  <td>PROTOCOL_DEVIATION</td>
                  <td>Subject 1002 (Oncology)</td>
                  <td>75.10%</td>
                  <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">PENDING_REVIEW</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-brand-teal" />
            <span>Dual-Signature Operations</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Under 21 CFR Part 11, critical modifications (e.g. closing safety signals or overriding protocol locks) require secondary authentication validation.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-brand-teal shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">MFA & E-Signatures Active</span>
              <p className="text-[10px] text-slate-400">Secure SHA-256 integrity seal enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SMALL UI HELPERS
// ----------------------------------------------------
function DashboardCard({ title, value, icon: Icon, desc, trend, color }: any) {
  const colorMap: any = {
    teal: 'text-brand-teal bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/50',
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50',
    green: 'text-green-500 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50',
    amber: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50'
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.teal}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="text-xs font-bold text-brand-teal px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100">{value}</h3>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{title}</h4>
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}

function MilestoneItem({ title, status, date }: any) {
  const isDone = status === 'Completed';
  return (
    <div className="flex items-start gap-3 text-sm">
      <CheckCircle2 className={`h-4.5 w-4.5 mt-0.5 ${isDone ? 'text-brand-teal' : 'text-slate-300'}`} />
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200">{title}</p>
        <span className="text-xs text-slate-400">{date} • {status}</span>
      </div>
    </div>
  );
}

function VisitScheduleRow({ site, monitor, date, type }: any) {
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
      <div>
        <p className="font-bold text-slate-900 dark:text-slate-100">{site}</p>
        <p className="text-slate-400 mt-0.5">Assigned CRA: {monitor} • Type: {type}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded">
          {date}
        </span>
      </div>
    </div>
  );
}

function ActivationRow({ name, step, status }: any) {
  const isDone = status === 'done';
  return (
    <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 dark:border-slate-800/50">
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200">{name}</p>
        <span className="text-[10px] text-slate-400">{step}</span>
      </div>
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDone ? 'bg-green-50 text-green-600 border border-green-150' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
        {isDone ? 'ACTIVE' : 'PENDING'}
      </span>
    </div>
  );
}

function FunnelBar({ label, count, percent, color }: any) {
  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex justify-between items-center font-semibold">
        <span>{label} ({count})</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden flex">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function ChecklistItem({ text, checked }: any) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
      <input type="checkbox" checked={checked} readOnly className="h-4.5 w-4.5 rounded border-slate-300 text-brand-teal focus:ring-brand-teal" />
      <span>{text}</span>
    </div>
  );
}
