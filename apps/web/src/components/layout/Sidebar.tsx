import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../ui/Logo';
import {
  LayoutDashboard,
  Briefcase,
  Activity,
  ShieldCheck,
  FileSpreadsheet,
  Cpu,
  BookOpen,
  Search,
  ClipboardCheck,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Shield,
  Download,
  Binary,
  FileText,
  Building2,
  HeartHandshake,
  Lock,
  Layers,
  UserCheck,
  FolderOpen,
  ShieldAlert,
  Pill,
  Bot,
  Globe
} from 'lucide-react';

export default function Sidebar({ isCollapsed, onToggle }) {
  const { user, activeRole } = useAuth() as any;

  const section1 = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Medical Marketing', path: '/marketing', icon: Briefcase },
    { name: 'Clinical Research', path: '/clinical', icon: Activity },
    { name: 'Regulatory Services', path: '/regulatory', icon: ShieldCheck }
  ];

  const section2 = [
    { name: 'SOP Repository', path: '/sops', icon: FileSpreadsheet },
    { name: 'Skills Repository', path: '/skills', icon: Cpu },
    { name: 'Knowledge Center', path: '/knowledge', icon: BookOpen },
    { name: 'Literature Search', path: '/literature-search', icon: Search },
    { name: 'Compliance Center', path: '/compliance', icon: ClipboardCheck }
  ];

  const section3 = [
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const sectionEnterprise = [
    { name: 'Permissions (RBAC)', path: '/permissions', icon: Shield },
    { name: 'Audit Exports', path: '/audit-exports', icon: Download },
    { name: 'AI Governance', path: '/ai-governance', icon: Binary },
    { name: 'Validation Center', path: '/validation-center', icon: FileText },
    { name: 'Tenant Management', path: '/tenant-management', icon: Building2 },
    { name: 'Customer Success', path: '/customer-success', icon: HeartHandshake },
    { name: 'Security Center', path: '/security-center', icon: Lock },
    { name: 'Deployment Readiness Center', path: '/admin/deployment-readiness', icon: ShieldCheck },
    { name: 'Production Readiness', path: '/admin/production-readiness', icon: ShieldCheck },
    { name: 'Pilot Readiness', path: '/admin/pilot-readiness', icon: ShieldCheck },
    { name: 'Live Operations', path: '/admin/live-operations', icon: Activity },
    { name: 'Operations Copilot', path: '/admin/copilot', icon: Bot },
    { name: 'Global Command Console', path: '/admin/global-console', icon: Globe },
    { name: 'Regulatory Command Center', path: '/admin/regulatory-command', icon: ShieldCheck },
    { name: 'About OS', path: '/admin/about', icon: BookOpen },
    { name: 'User Manual', path: '/admin/user-manual', icon: FileText }
  ];

  const sectionClinical = [
    { name: 'Studies Portfolio', path: '/clinical-studies', icon: Layers },
    { name: 'Site Operations', path: '/clinical-sites', icon: Building2 },
    { name: 'Subject Registry', path: '/clinical-subjects', icon: UserCheck },
    { name: 'Site Monitoring', path: '/clinical-monitoring', icon: ClipboardCheck },
    { name: 'eTMF Archive', path: '/clinical-etmf', icon: FolderOpen },
    { name: 'RBM Heatmap', path: '/clinical-rbm', icon: ShieldAlert },
    { name: 'Clinical Analytics', path: '/clinical-analytics', icon: TrendingUp },
    { name: 'RTSM / Supply', path: '/clinical-rtsm', icon: Pill },
    { name: 'EDC / eCRF CDMS', path: '/clinical-edc', icon: Database }
  ];

  const renderLink = (item, i) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={i}
        to={item.path}
        className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-button text-xs font-semibold tracking-wide uppercase transition-colors ${
          isActive
            ? 'bg-brand-teal/10 text-brand-teal-dark font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0 text-slate-450 dark:text-slate-400" />
        {!isCollapsed && <span className="truncate">{item.name}</span>}
      </NavLink>
    );
  };

  return (
    <aside className={`bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-[70px]' : 'w-[260px]'}`}>
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between bg-white dark:bg-slate-900/30">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Logo size={28} className="shrink-0" />
            <span className="font-display font-bold text-base tracking-tight bg-gradient-to-r from-brand-teal-dark to-brand-blue bg-clip-text text-transparent">ClinCommand OS™</span>
          </div>
        )}
        {isCollapsed && <Logo size={28} className="mx-auto" />}
        <button onClick={onToggle} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hidden md:block">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* User Profile Info Card */}
      {!isCollapsed && user && (
        <div className="p-3 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/40 m-3 rounded-card shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-teal/10 flex items-center justify-center font-display font-semibold text-brand-teal-dark text-sm shrink-0">
              {(user?.username || '?').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.username || 'Signed-in user'}</h4>
              <span className="text-[9px] uppercase font-bold tracking-wider text-brand-teal-dark truncate block mt-0.5">{activeRole}</span>
            </div>
          </div>
        </div>
      )}

      {/* Menu Sections Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Core Domains */}
        <div className="space-y-1">
          {section1.map((item, i) => renderLink(item, i))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-900 my-2"></div>

        {/* Repos & Compliance */}
        <div className="space-y-1">
          {section2.map((item, i) => renderLink(item, i))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-900 my-2"></div>

        {/* Analytics & Config */}
        <div className="space-y-1">
          {section3.map((item, i) => renderLink(item, i))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-900 my-2"></div>

        {/* Enterprise Modules */}
        <div className="space-y-1">
          {sectionEnterprise.map((item, i) => renderLink(item, i))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-900 my-2"></div>

        {/* Clinical Operations Cloud (Phase 11) */}
        <div className="space-y-1">
          {!isCollapsed && <span className="px-3 text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Clinical Operations</span>}
          {sectionClinical.map((item, i) => renderLink(item, i))}
        </div>
      </nav>

      {/* Sync Status Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-900 flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-400 bg-white dark:bg-slate-900/20">
        <div className="flex items-center gap-2 mx-auto md:mx-0">
          <div className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></div>
          {!isCollapsed && <span>DB Synced</span>}
        </div>
        {!isCollapsed && <Database className="h-3.5 w-3.5 text-slate-400" />}
      </div>
    </aside>
  );
}
