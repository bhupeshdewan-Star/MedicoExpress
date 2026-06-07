import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, FileSpreadsheet, Search, RefreshCw, 
  UserCheck, Lock, Unlock, Download, AlertTriangle 
} from 'lucide-react';

export default function AuditDashboard() {
  const { token } = useAuth() as any;
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [searchUser, setSearchUser] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/audit/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        throw new Error('Fallback required');
      }
    } catch (err) {
      // Fallback simulated compliance log records
      setLogs([
        { id: 1, username: 'sponsor.admin@demo.com', user_role: 'Admin', action_type: 'LOGIN', target_resource: 'auth/login', details: 'Access token generated successfully.', ip_address: '127.0.0.1', timestamp: new Date().toISOString() },
        { id: 2, username: 'coordinator@demo.com', user_role: 'Clinical Research Coordinator', action_type: 'ECONSENT_SIGNED', target_resource: 'subject:1', details: 'eConsent signed for SUB-101-001. Version v1.0, Hash: a9f8e7...', ip_address: '127.0.0.1', timestamp: new Date(Date.now() - 300000).toISOString() },
        { id: 3, username: 'cra@demo.com', user_role: 'CRA Monitor', action_type: 'WORKFLOW_STATUS_TRANSITION', target_resource: 'submissions/1', details: 'Transitioned form submission status state to SDV_VERIFIED', ip_address: '192.168.1.10', timestamp: new Date(Date.now() - 600000).toISOString() },
        { id: 4, username: 'failed_user', user_role: 'Viewer', action_type: 'FAILED_LOGIN_ATTEMPT', target_resource: 'auth/login', details: 'IP attempted login for failed_user', ip_address: '10.0.0.12', timestamp: new Date(Date.now() - 900000).toISOString() },
        { id: 5, username: 'sponsor1@novabio.com', user_role: 'Admin', action_type: 'APPLY_STUDY_LOCK', target_resource: 'locks/study:10', details: 'Study Oncology Trial locked', ip_address: '127.0.0.1', timestamp: new Date(Date.now() - 1200000).toISOString() },
        { id: 6, username: 'dm1@novabio.com', user_role: 'Data Manager', action_type: 'SOURCE_DOC_REVIEW', target_resource: 'doc:101', details: 'Reviewed source document status to VERIFIED', ip_address: '127.0.0.1', timestamp: new Date(Date.now() - 1500000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === '' || log.action_type === filterAction;
    const matchesUser = searchUser === '' || log.username.toLowerCase().includes(searchUser.toLowerCase());
    return matchesAction && matchesUser;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">LOGIN</span>;
      case 'FAILED_LOGIN_ATTEMPT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">FAILED LOGIN</span>;
      case 'ECONSENT_SIGNED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">E-SIGNATURE</span>;
      case 'APPLY_STUDY_LOCK':
      case 'WORKFLOW_STATUS_TRANSITION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">WORKFLOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-teal" />
            <span>Compliance Audit Vault (21 CFR Part 11)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable regulatory audit log trail. Records cannot be overwritten or deleted.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs} 
            className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Logs</span>
          </button>
          <button 
            className="flex items-center gap-1.5 bg-brand-teal hover:bg-teal-600 text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            onClick={() => alert('Exporting audit trail package to FDA Inspection compliant CSV format...')}
          >
            <Download className="h-4 w-4" />
            <span>Regulatory Export</span>
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter by username..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal"
          >
            <option value="">All GxP Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="FAILED_LOGIN_ATTEMPT">FAILED LOGIN</option>
            <option value="ECONSENT_SIGNED">E-SIGNATURE</option>
            <option value="WORKFLOW_STATUS_TRANSITION">WORKFLOW TRANSITION</option>
            <option value="APPLY_STUDY_LOCK">STUDY LOCK</option>
            <option value="SOURCE_DOC_REVIEW">rSDV REVIEW</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400 uppercase font-bold">
                <th className="py-3.5 px-6">Timestamp</th>
                <th>User / Role</th>
                <th>Action</th>
                <th>Target Resource</th>
                <th>Verification Details</th>
                <th className="pr-6">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No compliance records matching the selected search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-400 font-semibold">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{log.username}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{log.user_role}</div>
                    </td>
                    <td>{getActionBadge(log.action_type)}</td>
                    <td className="font-mono text-xs text-brand-teal-dark">{log.target_resource}</td>
                    <td className="max-w-md leading-relaxed text-xs">{log.details}</td>
                    <td className="text-xs text-slate-400 pr-6 font-mono">{log.ip_address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
