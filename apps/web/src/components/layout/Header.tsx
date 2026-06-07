import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bot, HelpCircle, Bell, User, LogOut, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Header({ onToggleHelp, onToggleCopilot }) {
  const { user, activeRole, devSwitchRole, logout } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Generate readable breadcrumb trail
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p.length > 0);
    if (paths.length === 0) return 'Home';
    return paths.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ');
  };

  const roles = [
    'Admin',
    'Head of Medical Affairs',
    'Medical Manager',
    'Regulatory Manager',
    'Clinical Research Manager',
    'Medical Writer',
    'Medical Advisor',
    'Training Manager',
    'Viewer'
  ];

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-[60px] bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 px-6 flex items-center justify-between shrink-0">
      {/* Breadcrumb Trail */}
      <div className="font-display font-semibold text-sm text-slate-500 dark:text-slate-400">
        {getBreadcrumbs()}
      </div>

      {/* Odometer-style Counter performance stats widget */}
      <div className="hidden lg:flex items-center gap-4 text-[10px] text-slate-400 uppercase">
        <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 px-2 py-1">
          <span className="font-bold">AI Latency:</span>
          <span className="font-mono font-bold text-brand-teal-dark">850ms</span>
        </div>
        <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 px-2 py-1">
          <span className="font-bold">AI Cost QTD:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-100">$0.045</span>
        </div>
        <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 px-2 py-1">
          <span className="font-bold">GxP Status:</span>
          <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            COMPLIANT
          </span>
        </div>
      </div>

      {/* Control Utility Toolbar */}
      <div className="flex items-center gap-4">
        {/* Development Mode Role Switcher dropdown */}
        <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-button bg-slate-50 dark:bg-slate-900">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Session Role:</span>
          <select
            value={activeRole}
            onChange={(e) => devSwitchRole(e.target.value)}
            className="bg-transparent text-xs font-semibold text-brand-teal-dark border-none cursor-pointer focus:ring-0"
          >
            {roles.map((r, i) => (
              <option key={i} value={r} className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950">{r}</option>
            ))}
          </select>
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500">
          {darkMode ? <Sun className="h-4 w-4 text-brand-teal" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-teal"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[320px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-card shadow-2xl z-50 p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-900">
                <span className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">Workflow Notifications</span>
                <button onClick={() => setShowNotifications(false)} className="text-[10px] text-brand-teal-dark hover:underline">Mark all read</button>
              </div>
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-md border-l-2 border-brand-teal text-xs">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200">SOP Review Required</h5>
                  <p className="text-slate-400 mt-1">SOP-MA-001 requires Medical Manager review check-off.</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-md border-l-2 border-brand-teal text-xs">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200">Appraisal Ready</h5>
                  <p className="text-slate-400 mt-1">Product Appraisal report ready for compilation export.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contextual Help trigger */}
        <button onClick={onToggleHelp} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500">
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* AI Copilot trigger */}
        <button onClick={onToggleCopilot} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 flex items-center gap-1.5 border border-slate-200 dark:border-slate-800">
          <Bot className="h-4 w-4 text-brand-teal animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">AI Copilot</span>
        </button>

        {/* Profile Logout */}
        <div className="relative">
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500">
            <User className="h-4 w-4" />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-[160px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-card shadow-2xl z-50 py-1">
              <button onClick={logout} className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2">
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
