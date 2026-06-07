import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Cloud, 
  Database, 
  Lock, 
  RefreshCw, 
  ToggleLeft, 
  ToggleRight,
  TrendingUp,
  Terminal,
  Activity,
  History,
  Info,
  Sliders,
  Cpu,
  Trash2
} from 'lucide-react';

export default function PilotReadinessDashboard() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'envs' | 'flags' | 'rollback'>('envs');
  
  // Custom mock configuration states for interactive UI controls
  const [environments, setEnvironments] = useState<any[]>([
    { name: 'Development', host: 'localhost', status: 'ACTIVE', version: 'v15.4.0-dev', pgStatus: 'HEALTHY', redisStatus: 'HEALTHY', sso: 'Disabled', lastDeploy: '10m ago' },
    { name: 'Staging', host: 'staging-db.novabio.internal', status: 'ACTIVE', version: 'v15.4.0-rc1', pgStatus: 'HEALTHY', redisStatus: 'HEALTHY', sso: 'Okta', lastDeploy: '1h ago' },
    { name: 'UAT', host: 'uat-db.novabio.internal', status: 'ACTIVE', version: 'v15.3.2-stable', pgStatus: 'HEALTHY', redisStatus: 'HEALTHY', sso: 'Azure AD', lastDeploy: '1d ago' },
    { name: 'Pilot', host: 'pilot-db.novabio.internal', status: 'STABLE', version: 'v15.4.0-pilot', pgStatus: 'HEALTHY', redisStatus: 'HEALTHY', sso: 'Okta, AD, Google', lastDeploy: 'Just Now' },
    { name: 'Production', host: 'prod-db-cluster.novabio.internal', status: 'LOCKED', version: 'v15.3.0-stable', pgStatus: 'HEALTHY', redisStatus: 'HEALTHY', sso: 'Multi-IDP Enabled', lastDeploy: '5d ago' }
  ]);

  const [flags, setFlags] = useState<any[]>([
    { name: 'wearables_telemetry', desc: 'Secure Fitbit & Apple Health patient telemetry ingest pipeline', enabled: true, rollout: 100, killSwitch: false },
    { name: 'rsdv_ocr', desc: 'Remote Source Data Verification text and redaction pipeline', enabled: true, rollout: 100, killSwitch: false },
    { name: 'rbm_ai', desc: 'AI risk-based monitoring site safety scoring engine', enabled: true, rollout: 50, killSwitch: false },
    { name: 'dct_virtual_visits', desc: 'Decentralized trial telehealth consulting rooms controller', enabled: true, rollout: 100, killSwitch: false },
    { name: 'epro_sync', desc: 'Patient daily symptom diary synchronizations', enabled: true, rollout: 100, killSwitch: false }
  ]);

  const [rollbackHistory, setRollbackHistory] = useState<any[]>([
    { id: 'RLB-001', version: 'v15.4.0-rc1', timestamp: '2026-06-03 14:10:02', user: 'DevOps Agent', details: 'Database schema mismatch rollback executed successfully', status: 'COMPLETED' }
  ]);

  const [pilotTenant, setPilotTenant] = useState<any>({
    name: 'NovaBio Clinical Research',
    domain: 'novabio.com',
    status: 'ACTIVE',
    environment: 'pilot',
    subjectsCount: 500,
    isPilot: true,
    isolationAudit: 'PASSED'
  });

  // Rollback state simulation
  const [triggeringRollback, setTriggeringRollback] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState('v15.3.2-stable');

  const handleToggleFlag = (name: string) => {
    setFlags(flags.map(f => {
      if (f.name === name) {
        return { ...f, enabled: !f.enabled };
      }
      return f;
    }));
  };

  const handleToggleKillSwitch = (name: string) => {
    setFlags(flags.map(f => {
      if (f.name === name) {
        const nextKill = !f.killSwitch;
        return { ...f, killSwitch: nextKill, enabled: nextKill ? false : f.enabled };
      }
      return f;
    }));
  };

  const handleRolloutChange = (name: string, val: number) => {
    setFlags(flags.map(f => {
      if (f.name === name) {
        return { ...f, rollout: val };
      }
      return f;
    }));
  };

  const triggerMockRollback = () => {
    if (triggeringRollback) return;
    setTriggeringRollback(true);
    setTimeout(() => {
      // Revert flags globally
      setFlags(flags.map(f => ({ ...f, enabled: false, killSwitch: true })));
      // Add rollback history entry
      const newEntry = {
        id: `RLB-00${rollbackHistory.length + 2}`,
        version: rollbackTarget,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'Administrator (UI)',
        details: `Emergency rollback to ${rollbackTarget} triggered. Global kill switches enabled.`,
        status: 'COMPLETED'
      };
      setRollbackHistory([newEntry, ...rollbackHistory]);
      setTriggeringRollback(false);
      alert(`System rollback to version ${rollbackTarget} triggered successfully! Pre-release configurations reverted.`);
    }, 1500);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-[10px] tracking-widest uppercase font-bold text-blue-400">Enterprise Release Gate</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-300 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
              ClinCommand OS™ Pilot & Release Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Phase 15.4 Environment Segregation, Rollback Controls, and Pilot Onboarding Dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Sponsor Pilot</span>
              <span className="text-sm font-bold text-teal-400">NovaBio (Active)</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Release State</span>
              <span className="text-sm font-bold text-emerald-400">PILOT READY</span>
            </div>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-6">
          <button 
            onClick={() => setActiveTab('envs')}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition duration-150 border-b-2 flex items-center gap-2 ${
              activeTab === 'envs' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <Server className="h-4 w-4" />
            Environment Segregation Matrix
          </button>
          <button 
            onClick={() => setActiveTab('flags')}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition duration-150 border-b-2 flex items-center gap-2 ${
              activeTab === 'flags' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <Sliders className="h-4 w-4" />
            Tenant Feature Flags
          </button>
          <button 
            onClick={() => setActiveTab('rollback')}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition duration-150 border-b-2 flex items-center gap-2 ${
              activeTab === 'rollback' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <History className="h-4 w-4" />
            Global Rollback Panel
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'envs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Environments Listing Grid */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-400" />
                  Segregated Environments
                </h2>
                <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-1 rounded-md">
                  5 segregated profiles loaded
                </span>
              </div>

              <div className="space-y-3">
                {environments.map((env: any) => (
                  <div 
                    key={env.name} 
                    className="p-4 bg-slate-950/60 hover:bg-slate-950 border border-slate-900 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition duration-150"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${
                          env.name === 'Pilot' ? 'bg-teal-400 animate-pulse' : 'bg-slate-500'
                        }`}></span>
                        <h3 className="font-bold text-white text-sm">{env.name} Environment</h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 mt-1 block">Host: {env.host}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">SSO: {env.sso}</span>
                    </div>

                    <div className="flex flex-row sm:flex-col items-end gap-2 justify-between w-full sm:w-auto">
                      <span className="text-[10px] font-bold bg-slate-900 px-2 py-0.5 rounded text-blue-400 font-mono">
                        {env.version}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Deployed: {env.lastDeploy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pilot Onboarding Card */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-5">
              <div className="border-b border-slate-900 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-teal-400" />
                  Active Pilot Onboarding
                </h2>
              </div>

              <div className="bg-slate-950/70 border border-slate-900 rounded-xl p-4 space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tenant Name</span>
                  <strong className="text-white">{pilotTenant.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Corporate Domain</span>
                  <span className="font-mono text-slate-400">{pilotTenant.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Environment</span>
                  <span className="text-teal-400 uppercase font-bold tracking-wider text-[10px] bg-teal-500/10 px-2 py-0.5 rounded-full">
                    {pilotTenant.environment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Seeded Dataset</span>
                  <span className="text-slate-300 font-medium">{pilotTenant.subjectsCount} Subjects</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Isolation Boundary</span>
                  <span className="text-emerald-400 font-bold">VERIFIED (RLS ACTIVE)</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-550 leading-relaxed bg-slate-900/20 border border-slate-900/80 p-3 rounded-lg flex gap-2">
                <Info className="h-4 w-4 shrink-0 text-slate-400" />
                <span>NovaBio is flagged as [PILOT_ENABLED]. GxP audits confirm dataset segregation limits prevent cross-tenant queries.</span>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'flags' && (
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-indigo-400" />
                  Feature Flag Gating Controls
                </h2>
                <p className="text-xs text-slate-400 mt-1">Tenant-aware features gating with hash rollout overrides.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flags.map((flag: any) => (
                <div 
                  key={flag.name}
                  className="p-5 bg-slate-950/70 border border-slate-900 rounded-2xl space-y-4 hover:border-slate-800 transition duration-150"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-sm font-mono">{flag.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{flag.desc}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleFlag(flag.name)}
                        disabled={flag.killSwitch}
                        className="text-slate-400 hover:text-slate-200 transition focus:outline-none"
                      >
                        {flag.enabled ? (
                          <ToggleRight className={`h-8 w-8 text-teal-400 ${flag.killSwitch ? 'opacity-30' : ''}`} />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Rollout slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-slate-450 uppercase">
                      <span>Rollout Target</span>
                      <span>{flag.rollout}% of Tenants</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={flag.rollout}
                      onChange={(e) => handleRolloutChange(flag.name, parseInt(e.target.value))}
                      disabled={flag.killSwitch}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-xs">
                    <span className="text-slate-550 text-[10px] uppercase font-bold">Override Locks</span>
                    <button 
                      onClick={() => handleToggleKillSwitch(flag.name)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition duration-150 ${
                        flag.killSwitch 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : 'bg-slate-900 text-slate-500 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {flag.killSwitch ? 'Kill-Switch Active' : 'Kill-Switch Override'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rollback' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Rollback Trigger Console */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-900 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Emergency Rollback Engine
                </h2>
                <p className="text-xs text-slate-400 mt-1">Instant, audit-logged reversion of application state and database migrations.</p>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 uppercase tracking-wide font-bold">Target Rollback Version</label>
                  <select 
                    value={rollbackTarget}
                    onChange={(e) => setRollbackTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="v15.3.2-stable">v15.3.2-stable (Previous Staging Build)</option>
                    <option value="v15.3.0-stable">v15.3.0-stable (Phase 15.3 Validated Release)</option>
                    <option value="v15.2.0-stable">v15.2.0-stable (Sponsor Demo Release)</option>
                  </select>
                </div>

                <div className="text-[11px] text-amber-400/90 leading-relaxed bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 animate-bounce" />
                  <span>
                    <strong>WARNING:</strong> Triggering a rollback executes the database migration reversal SQL scripts, resets local variables, and places global feature flag overrides in kill-switch lock mode. An audit event <code>SYSTEM_ROLLBACK_TRIGGERED</code> will be permanently logged.
                  </span>
                </div>

                <button
                  onClick={triggerMockRollback}
                  disabled={triggeringRollback}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition duration-200 uppercase tracking-wider flex items-center justify-center gap-2 ${
                    triggeringRollback 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/10'
                  }`}
                >
                  {triggeringRollback ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Executing System Revert...
                    </>
                  ) : (
                    'Execute Emergency Rollback'
                  )}
                </button>
              </div>
            </div>

            {/* Rollback Audits Log */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-900 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-slate-400" />
                  Rollback Log Entries
                </h2>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {rollbackHistory.map((item: any) => (
                  <div 
                    key={item.id} 
                    className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-red-400 font-mono">{item.id}</span>
                      <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                    </div>
                    <p className="text-slate-300 font-medium leading-relaxed">{item.details}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-1.5 mt-1">
                      <span>User: {item.user}</span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
