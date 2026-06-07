import React, { useState, useEffect } from 'react';
import { History, X, Download } from 'lucide-react';

interface HistoryItem {
  id: number;
  data_point_id: number;
  old_value: string | null;
  new_value: string | null;
  change_reason: string;
  user_id: number;
  username: string;
  created_at: string;
}

interface DataChangeHistoryPanelProps {
  dataPointId: number;
  fieldKey: string;
  onClose: () => void;
}

export default function DataChangeHistoryPanel({ dataPointId, fieldKey, onClose }: DataChangeHistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [dataPointId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v2/edc/data-points/${dataPointId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setHistory(result.data);
      } else {
        setError(result.errors?.[0] || 'Failed to fetch history logs.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = 'Audit ID,Data Point ID,Old Value,New Value,Change Reason,Author,Timestamp\n';
    const csvContent = history.map(item => 
      `"${item.id}","${item.data_point_id}","${item.old_value || ''}","${item.new_value || ''}","${item.change_reason.replace(/"/g, '""')}","${item.username}","${item.created_at}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_trail_data_point_${dataPointId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="flex flex-col w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <History className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-lg">CFR Part 11 Audit Trail History</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Data Variable Code: </span>
            <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400 text-sm font-mono font-bold">
              {fieldKey}
            </code>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <span className="text-slate-500 animate-pulse">Loading GxP audit records...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200 dark:border-red-800/30">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">
              No modifications recorded. First data entry value remains unchanged (ALCOA+ Originality Check: Valid).
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Audit Trail
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3">Previous</th>
                      <th className="p-3">New Value</th>
                      <th className="p-3">Reason for Change</th>
                      <th className="p-3">Author / Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {history.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="p-3 font-mono text-xs text-red-500 bg-red-50/20 dark:bg-red-950/10">
                          {item.old_value || <span className="italic text-slate-400">Empty</span>}
                        </td>
                        <td className="p-3 font-mono text-xs text-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10">
                          {item.new_value || <span className="italic text-slate-400">Deleted</span>}
                        </td>
                        <td className="p-3 max-w-[200px] truncate" title={item.change_reason}>
                          {item.change_reason}
                        </td>
                        <td className="p-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.username}</span>
                          <br />
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
