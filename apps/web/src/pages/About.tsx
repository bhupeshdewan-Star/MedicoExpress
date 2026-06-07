import React from 'react';
import { BookOpen, ShieldCheck, MapPin, User, FileLock, Copyright } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-teal-dark p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-brand-teal/20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-10 translate-y-10 rounded-full bg-brand-blue/20 blur-2xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-teal/25 text-brand-teal tracking-wide uppercase border border-brand-teal/30">
              System Certification Locked (Phase 16.2)
            </span>
            <h1 className="text-3xl font-display font-bold tracking-tight">ClinCommand OS™</h1>
            <p className="text-slate-350 text-sm max-w-xl">
              Next-Gen Autonomous Clinical Trials Operations, Compliance & Regulatory Intelligence Platform.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center h-20 w-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
            <Copyright className="h-10 w-10 text-brand-teal" />
          </div>
        </div>
      </div>

      {/* Main Info Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Attributes */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-teal" /> System Description & Purpose
            </h3>
            <p className="text-slate-650 dark:text-slate-300 text-sm leading-relaxed">
              ClinCommand OS™ provides an end-to-end GxP qualified digital infrastructure for decentralized virtual visits, 
              risk-based monitoring (RBM) AI scoring, encrypted ePRO pipelines, remote source document verification (rSDV), 
              wearables telemetry ingestion, and autonomous compliance drift detection. The system is engineered to 
              strictly enforce multi-tenant isolation, data integrity, and cross-phase cryptographic ledger immutability.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <FileLock className="h-4 w-4 text-brand-teal" /> License & Regulatory Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                <span className="font-semibold text-slate-600 dark:text-slate-400">License Model</span>
                <span className="font-bold text-red-650 dark:text-red-400">Proprietary / Closed System</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Redistribution</span>
                <span className="font-bold text-red-650 dark:text-red-400">Strictly Prohibited</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                <span className="font-semibold text-slate-600 dark:text-slate-400">GxP Compliance Standard</span>
                <span className="font-bold text-brand-teal-dark">Certified (GAMP 5 Category 4 / 21 CFR Part 11)</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Clinical Verification</span>
                <span className="font-bold text-brand-teal-dark">Simulation + Enterprise Pilot Approved</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Trial Scope Metadata</span>
                <span className="font-bold text-brand-teal-dark">NovaBio Clinical Research (Tenant ID: 2)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Governance & Ownership */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-850 bg-brand-teal/5 dark:bg-brand-teal/5 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-brand-teal" /> Intellectual Property
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">System Owner</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Dr. Bhupesh Dewan</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Regional Seat</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-brand-teal" /> Mumbai, India
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Copyright Notice</span>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-350 italic">
                  “© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved”
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-teal" /> System Lock Sign-off
            </h3>
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Version Range</span>
                <span className="text-xs font-mono font-bold text-slate-200">Phase 15.2 → 16.2</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">release.seal SHA-256</span>
                <span className="text-[8px] font-mono font-bold text-slate-400 break-all">c0dd3cc73f4f43419e97f258073a997f1f59cedc298f413667a6abc0a4e8c7a9</span>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded-full block w-max mx-auto mt-2">
                Certified Integrity
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
