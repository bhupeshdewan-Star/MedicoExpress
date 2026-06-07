import React from 'react';
import { X, HelpCircle, FileText, CheckSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function HelpDrawer({ isOpen, onClose }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Context help database matching active screens
  const getHelpContent = () => {
    switch (currentPath) {
      case '/dashboard':
        return {
          title: 'Executive Dashboard Guidelines',
          purpose: 'Track system active projects, SOP workflow updates, tasks due, and audit alerts in real time.',
          rules: ['Verify pending signatures on items in your queue.', 'Check audit logs for recent access warnings.', 'Review tasks count checklists.'],
          sops: ['SOP-MA-001: Product Appraisal workflow', 'SOP-KM-010: Database System Auditing']
        };
      case '/sops':
        return {
          title: 'SOP Repository & Versioning Guide',
          purpose: 'Manage standard operating procedures lifecycle including drafts creation, revisions, reviews, and sign-offs.',
          rules: ['All edits create new patch version (e.g. 1.0.1).', 'Final approvals require electronic signature password validation.', 'Only Admin can delete drafts.'],
          sops: ['SOP-KM-004: Versioning Control procedures', 'SOP-KM-005: Documents Redlines Compare']
        };
      case '/users':
        return {
          title: 'User Access Control Directories',
          purpose: 'Create staff accounts and assign user roles. (Restricted to Admin role).',
          rules: ['Password hashes are stored securely using bcrypt.', 'Deactivating users revokes JWT sessions instantly.', 'Audit trail logs all credential updates.'],
          sops: ['SOP-KM-008: Network Access & RBAC permissions']
        };
      case '/audit-trail':
        return {
          title: 'Immutable Audit Trail Controls',
          purpose: 'Log user actions (creates, views, sign-offs, exports, prints) to satisfy 21 CFR Part 11 requirements.',
          rules: ['Logs cannot be updated or deleted by any user or administrator.', 'Filters are provided to search by date and action type.', 'Exports can be saved as CSV files.'],
          sops: ['SOP-KM-010: System Audit Trail review rules']
        };
      case '/settings':
        return {
          title: 'System Settings Configuration',
          purpose: 'Update system configuration keys including local LLM URLs and SMTP host parameters.',
          rules: ['Ensure Ollama is running on port 11434 before testing connections.', 'Local storage directories must be verified before saves.', 'Changes are logged to the audit log.'],
          sops: ['SOP-KM-013: Local LLM Integration standards']
        };
      default:
        return {
          title: 'ClinCommand OS Help Desk',
          purpose: 'Welcome to the pharmaceutical medical affairs operating command center. Access manuals, AI Copilots, and workflow systems.',
          rules: ['Verify active user roles on header switcher.', 'Check database sync lights in sidebar.', 'Contact system admin if connection errors occur.'],
          sops: ['SOP-KM-001: General Knowledge Indexing']
        };
    }
  };

  const help = getHelpContent();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[380px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-900 shadow-2xl z-50 flex flex-col transition-transform duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-brand-teal" />
          <span className="font-display font-semibold text-slate-900 dark:text-slate-100">Contextual Help</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div>
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">{help.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{help.purpose}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 font-display font-semibold text-sm text-slate-800 dark:text-slate-200">
            <CheckSquare className="h-4 w-4 text-brand-teal" />
            <span>GxP Checklists Rules</span>
          </div>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-500 dark:text-slate-400">
            {help.rules.map((rule, i) => (
              <li key={i} className="leading-relaxed">{rule}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 font-display font-semibold text-sm text-slate-800 dark:text-slate-200">
            <FileText className="h-4 w-4 text-brand-teal" />
            <span>Associated SOP Guidelines</span>
          </div>
          <div className="space-y-2">
            {help.sops.map((sop, i) => (
              <div key={i} className="p-2 border border-slate-100 dark:border-slate-900 rounded-md text-xs text-slate-600 dark:text-slate-400 hover:border-brand-teal cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900">
                {sop}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
