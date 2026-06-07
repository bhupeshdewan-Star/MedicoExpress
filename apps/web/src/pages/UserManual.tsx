import React, { useState } from 'react';
import { BookOpen, Key, Terminal, AlertTriangle, LifeBuoy, Settings, Monitor, Laptop, HelpCircle } from 'lucide-react';

export default function UserManual() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '1. System Overview', icon: BookOpen },
    { id: 'usage', label: '2. How to Use', icon: Key },
    { id: 'install', label: '3. Installation Guide', icon: Terminal },
    { id: 'trouble', label: '4. Troubleshooting', icon: AlertTriangle },
    { id: 'support', label: '5. Support & Governance', icon: LifeBuoy }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-brand-teal" /> ClinCommand OS™ User Manual
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Technical specifications, multi-OS configuration guidelines, and operational procedures.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-850 pb-2">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-button text-xs font-bold uppercase tracking-wider transition-all border ${
                activeTab === t.id
                  ? 'bg-brand-teal/10 text-brand-teal-dark border-brand-teal/30 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-950 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/60 p-8 shadow-sm min-h-[400px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand-teal" /> 1. System Overview
            </h2>
            <div className="space-y-4 text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
              <p>
                <strong>ClinCommand OS™</strong> is a qualified, closed enterprise compliance platform specifically designed 
                to orchestrate decentralized clinical trials (DCT), monitor real-time key performance indicators, 
                and verify audit trail records matching global regulatory requirements (FDA 21 CFR Part 11 and GAMP 5 Category 4).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Core Clinical Workflows</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <li>Stratified block randomization with blinding logic (RTSM)</li>
                    <li>Automatic supply kit dispensation and site shipment tracking</li>
                    <li>ePRO device signature sync with Last-Write-Wins (LWW) conflict checks</li>
                    <li>rSDV document ingestion with verified cryptographic hashes</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Role-Based Dashboard Authorization</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <li><strong>Sponsor Admin:</strong> System configurations and global audit views</li>
                    <li><strong>CRA Monitor:</strong> Site monitoring visits and SDV approvals</li>
                    <li><strong>Data Manager:</strong> CRF forms layout, freezes, and queries closing</li>
                    <li><strong>Safety Officer:</strong> Unblinding audits and AE correlations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOW TO USE TAB */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
              <Key className="h-5 w-5 text-brand-teal" /> 2. How to Use the System
            </h2>
            <div className="space-y-4 text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-brand-teal-dark mb-1">A. Authentication & Tenant Scope</h4>
                  <p className="text-xs">
                    Login using clinical credentials. The tenant context is strictly restricted to <strong>NovaBio Clinical Research</strong> (tenant_id = 2) for pilot operations. All data isolation filters automatically lock down views to this context.
                  </p>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800/40 my-3"></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-brand-teal-dark mb-1">B. Navigating Key Control Panels</h4>
                  <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 dark:text-slate-400 mt-2">
                    <li><strong>Live Operations (/admin/live-operations):</strong> View active clinical requests, API latencies, and simulate telemetry streams.</li>
                    <li><strong>Pilot Readiness (/admin/pilot-readiness):</strong> Activate pilot features, test feature flags, and execute rollbacks.</li>
                    <li><strong>Regulatory Command Center (/admin/regulatory-command):</strong> View submission completeness score, trace audit chains, and run FDA/EMA simulation queries.</li>
                    <li><strong>Global Command Console (/admin/global-console):</strong> Audit multi-region failovers (Mumbai, Virginia, Frankfurt topologies).</li>
                  </ul>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800/40 my-3"></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-brand-teal-dark mb-1">C. Monitoring SLO & Audits</h4>
                  <p className="text-xs">
                    Access the system validation ledger to audit P95 response latencies (limit ≤ 200ms), ePRO lags (limit ≤ 60s), 
                    and confirm zero telemetry data loss. Immutable GxP Audit Logs are persistent and visible under settings options.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INSTALLATION TAB */}
        {activeTab === 'install' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-brand-teal" /> 3. Installation Guide (Multi-OS Support)
            </h2>
            <div className="space-y-6">
              {/* Windows OS */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <Laptop className="h-4 w-4 text-brand-teal" /> Windows OS Configuration
                </h4>
                <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 leading-relaxed space-y-1">
                  <div># Ensure Node.js LTS is installed</div>
                  <div>npm install</div>
                  <div>npm run build</div>
                  <div>$env:NODE_ENV="test"; $env:PORT="8000"; node apps/api-core/server.js</div>
                  <div>npm run dev --prefix apps/web -- --port 3000 --strictPort</div>
                </div>
              </div>

              {/* macOS */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <Laptop className="h-4 w-4 text-brand-teal" /> macOS Configuration
                </h4>
                <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 leading-relaxed space-y-1">
                  <div>brew install node</div>
                  <div>npm install</div>
                  <div>npm run build</div>
                  <div>NODE_ENV=test PORT=8000 node apps/api-core/server.js</div>
                  <div>npm run dev --prefix apps/web -- --port 3000 --strictPort</div>
                </div>
              </div>

              {/* Linux */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <Monitor className="h-4 w-4 text-brand-teal" /> Linux (Ubuntu/Debian) Configuration
                </h4>
                <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 leading-relaxed space-y-1">
                  <div>sudo apt update && sudo apt install nodejs npm</div>
                  <div>npm install</div>
                  <div>npm run build</div>
                  <div>NODE_ENV=test PORT=8000 node apps/api-core/server.js</div>
                  <div>npm run dev --prefix apps/web -- --port 3000 --strictPort</div>
                </div>
              </div>

              {/* Android */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <Monitor className="h-4 w-4 text-brand-teal" /> Android (Termux Developer Mode)
                </h4>
                <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 leading-relaxed space-y-1">
                  <div># Install Termux, upgrade repository</div>
                  <div>pkg install nodejs</div>
                  <div>npm install</div>
                  <div>npm run build</div>
                  <div>NODE_ENV=test PORT=8000 node apps/api-core/server.js</div>
                  <div>npm run dev --prefix apps/web -- --port 3000 --strictPort</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TROUBLESHOOTING TAB */}
        {activeTab === 'trouble' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-brand-teal" /> 4. Troubleshooting & System Faults
            </h2>
            <div className="space-y-4">
              <div className="border border-red-200 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/20 rounded-xl p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-red-800 dark:text-red-300">1. Port Conflicts (EADDRINUSE: 3000 or 8000)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Occurs if another service is already using port 3000 or 8000. Run <code>npx kill-port 3000 8000</code> or change the PORT environment variables.
                  </p>
                </div>
                <div className="border-t border-slate-200/40 dark:border-slate-800/40"></div>
                <div>
                  <h4 className="text-xs font-bold text-red-800 dark:text-red-300">2. Vite Build Resolution Errors</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Verify that Node version is ≥ 18 and npm version is ≥ 9. Run <code>npm cache clean --force</code> followed by <code>npm install</code> in the root directory.
                  </p>
                </div>
                <div className="border-t border-slate-200/40 dark:border-slate-800/40"></div>
                <div>
                  <h4 className="text-xs font-bold text-red-800 dark:text-red-300">3. Telemetry Output Directory Missing</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    The system relies on a local telemetry JSON log database under <code>/logs/telemetry.json</code>. Ensure the folder is writable and the directory junction from <code>apps/logs</code> to root <code>logs</code> remains valid.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUPPORT TAB */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-brand-teal" /> 5. Support, Governance & Legal Attributions
            </h2>
            <div className="space-y-4 text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-brand-teal/10 flex items-center justify-center font-bold text-brand-teal text-lg shrink-0">
                    BD
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm">Dr. Bhupesh Dewan</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">System Creator, Lead Designer & Principal Owner</span>
                  </div>
                </div>
                <p className="text-xs">
                  This instance of ClinCommand OS™ runs under closed clinical trial governance controls. 
                  Access to server metrics, audit trail data, and database logs is restricted. 
                  Any unauthorized duplication or redistribution of clinical data models is strictly prohibited.
                </p>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Headquarters</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Mumbai, India</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Standard Frameworks</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">GxP, 21 CFR Part 11, HIPAA compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
