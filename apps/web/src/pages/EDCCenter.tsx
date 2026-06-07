import React, { useState, useEffect } from 'react';
import { Database, FileText, Lock, ShieldAlert, History, MessageSquare, Tag, Play, CheckCircle2, ChevronRight, RefreshCw, Plus } from 'lucide-react';
import DataChangeHistoryPanel from '../components/ui/DataChangeHistoryPanel';
import QueryConversationPanel from '../components/ui/QueryConversationPanel';
import LockManagementCenter from '../components/ui/LockManagementCenter';
import MedicalCodingWorkbench from '../components/ui/MedicalCodingWorkbench';

export default function EDCCenter() {
  const [activeTab, setActiveTab] = useState<'entry' | 'locks' | 'coding' | 'queries'>('entry');
  const [studyId] = useState(1); // Mock active study ID
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [formLayout, setFormLayout] = useState<any[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  
  // History Audit Modal state
  const [auditDpId, setAuditDpId] = useState<number | null>(null);
  const [auditFieldKey, setAuditFieldKey] = useState('');
  
  // Query Conversation Thread Modal state
  const [threadQueryId, setThreadQueryId] = useState<number | null>(null);
  const [threadQueryText, setThreadQueryText] = useState('');
  const [threadFieldKey, setThreadFieldKey] = useState('');
  const [threadStatus, setThreadStatus] = useState('');

  // Medical Coding Workbench Modal state
  const [codingDpId, setCodingDpId] = useState<number | null>(null);
  const [codingFieldName, setCodingFieldName] = useState('');
  const [codingReportedText, setCodingReportedText] = useState('');

  // Form submit states
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
    fetchFormLayout();
  }, []);

  const fetchSubmissions = async () => {
    // In demo/test mode, we load mock list
    setSubmissions([
      { id: 1, subject_number: 'SUB-101-001', form_name: 'Demographics & Vitals', visit_name: 'Screening Visit', status: 'IN_PROGRESS', sdv_status: 'Pending', data_points_count: 3 },
      { id: 2, subject_number: 'SUB-101-002', form_name: 'Vital Signs', visit_name: 'Visit 1 (Dispensation)', status: 'COMPLETED', sdv_status: 'Pending', data_points_count: 4 },
      { id: 3, subject_number: 'SUB-101-003', form_name: 'Adverse Events Log', visit_name: 'Unscheduled Event', status: 'UNDER_QUERY', sdv_status: 'Flagged', data_points_count: 2 }
    ]);
  };

  const fetchFormLayout = () => {
    setFormLayout([
      { key: 'age', label: 'Subject Age (Years)', type: 'number', min: 18, max: 65 },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
      { key: 'systolic', label: 'Systolic Blood Pressure (mmHg)', type: 'number', min: 90, max: 140 },
      { key: 'diastolic', label: 'Diastolic Blood Pressure (mmHg)', type: 'number', min: 60, max: 90 },
      { key: 'adverse_event', label: 'Adverse Event Description (If any)', type: 'text' },
      { key: 'medication', label: 'Concomitant Medication Name', type: 'text' }
    ]);
    setFormValues({
      age: '42',
      gender: 'Female',
      systolic: '120',
      diastolic: '80',
      adverse_event: 'Severe headache',
      medication: 'Aspirin'
    });
  };

  const handleSelectSubmission = async (sub: any) => {
    setSelectedSubmission(sub);
    setMsg(null);
  };

  const handleSaveData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSubmitting(true);
    setMsg(null);
    try {
      const token = localStorage.getItem('token');
      // Format dynamic variables list
      const data_points = Object.keys(formValues).map(key => ({
        field_key: key,
        field_value: formValues[key]
      }));

      const res = await fetch(`/api/v2/edc/submissions/${selectedSubmission.id}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data_points,
          reason_for_change: reason
        })
      });
      const result = await res.json();
      if (result.success) {
        setMsg(`Success: Submissions updated. Current State: ${result.data.status}`);
        setReason('');
        await fetchSubmissions();
      } else {
        setMsg(`Error: ${result.errors?.[0] || 'Validation error'}`);
      }
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewTransition = async (status: string) => {
    if (!selectedSubmission) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v2/edc/submissions/${selectedSubmission.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const result = await res.json();
      if (result.success) {
        setSelectedSubmission(prev => ({ ...prev, status: result.data.status }));
        alert(`Status updated to ${result.data.status}`);
        await fetchSubmissions();
      } else {
        alert(`Error: ${result.errors?.[0]}`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950 text-slate-100 font-sans">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Unified EDC / eCRF Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            FDA 21 CFR Part 11 and ICH GCP Hardened Clinical Trial CDMS Data Capture Platform
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('entry')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === 'entry' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          eCRF Data Entry
        </button>
        <button
          onClick={() => setActiveTab('locks')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === 'locks' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="h-4 w-4" />
          Hierarchical Locks
        </button>
        <button
          onClick={() => setActiveTab('coding')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === 'coding' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="h-4 w-4" />
          Medical Coding
        </button>
        <button
          onClick={() => setActiveTab('queries')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === 'queries' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Clinical Queries
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'entry' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Submissions Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg h-fit">
            <h3 className="font-bold text-lg text-slate-100 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-400" />
              Subject case books
            </h3>

            <div className="space-y-3">
              {submissions.map(sub => (
                <div 
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedSubmission?.id === sub.id 
                      ? 'bg-indigo-950/20 border-indigo-500 shadow-md shadow-indigo-500/5' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-indigo-400">{sub.subject_number}</span>
                    <span className="text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded uppercase">
                      {sub.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{sub.form_name}</div>
                  <div className="text-[11px] text-slate-500 mt-1 italic">{sub.visit_name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Form Editor */}
          <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            {selectedSubmission ? (
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-100">
                      {selectedSubmission.form_name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Subject: {selectedSubmission.subject_number} | {selectedSubmission.visit_name}
                    </p>
                  </div>

                  {/* Review Actions Panel */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleReviewTransition('DATA_MANAGER_REVIEW')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded text-indigo-300"
                    >
                      DM Review
                    </button>
                    <button 
                      onClick={() => handleReviewTransition('MEDICAL_REVIEW')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded text-purple-300"
                    >
                      Med Review
                    </button>
                    <button 
                      onClick={() => handleReviewTransition('SDV_VERIFIED')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded text-emerald-300"
                    >
                      Sign SDV
                    </button>
                  </div>
                </div>

                {msg && (
                  <div className={`p-3 rounded-lg text-sm mb-4 border ${
                    msg.startsWith('Error') 
                      ? 'bg-red-950/20 border-red-800 text-red-400' 
                      : 'bg-emerald-950/20 border-emerald-800 text-emerald-400'
                  }`}>
                    {msg}
                  </div>
                )}

                <form onSubmit={handleSaveData} className="space-y-4">
                  {formLayout.map(field => (
                    <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-3">
                      <div className="max-w-[280px]">
                        <label className="text-sm font-semibold text-slate-200">
                          {field.label}
                        </label>
                      </div>

                      <div className="flex items-center gap-2 flex-1 max-w-md">
                        {field.type === 'select' ? (
                          <select
                            value={formValues[field.key] || ''}
                            onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                          >
                            {(field.options || []).map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={formValues[field.key] || ''}
                            onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-100 font-mono"
                          />
                        )}

                        {/* Audit Trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            setAuditDpId(1); // mock dp ID
                            setAuditFieldKey(field.key);
                          }}
                          title="View Audit Trail History"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                        >
                          <History className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Mandatory Edit Reason for Change */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 mt-6">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Reason for change (GxP Audit Mandatory on updates)
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="Specify reason for clinical data corrections..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors"
                  >
                    Submit Data Points & Run Edit Checks
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">
                Select a subject case book from the side grid to start data entry.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'locks' && (
        <LockManagementCenter studyId={studyId} />
      )}

      {activeTab === 'coding' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Tag className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-lg">Medical Coding dictionary workbench</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950 text-slate-500 font-semibold border-b border-slate-800">
                  <th className="p-3">Variable Key</th>
                  <th className="p-3">Reported Text</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="hover:bg-slate-800/10">
                  <td className="p-3 font-semibold text-slate-100">adverse_event</td>
                  <td className="p-3">"Severe headache"</td>
                  <td className="p-3">
                    <span className="text-xs bg-amber-950/20 text-amber-400 px-2 py-0.5 rounded border border-amber-800/30">
                      Uncoded
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        setCodingDpId(1);
                        setCodingFieldName('Adverse Event Log');
                        setCodingReportedText('Severe headache');
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded"
                    >
                      Code Term
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/10">
                  <td className="p-3 font-semibold text-slate-100">medication</td>
                  <td className="p-3">"Aspirin"</td>
                  <td className="p-3">
                    <span className="text-xs bg-amber-950/20 text-amber-400 px-2 py-0.5 rounded border border-amber-800/30">
                      Uncoded
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        setCodingDpId(2);
                        setCodingFieldName('ConMeds Log');
                        setCodingReportedText('Aspirin');
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded"
                    >
                      Code Term
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'queries' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <MessageSquare className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-lg">Active Clinical Queries</h3>
          </div>

          <div className="space-y-4">
            <div 
              onClick={() => {
                setThreadQueryId(1);
                setThreadQueryText('Systolic Blood Pressure must be higher than Diastolic Blood Pressure.');
                setThreadFieldKey('systolic');
                setThreadStatus('OPEN');
              }}
              className="p-4 bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold bg-amber-950/20 text-amber-400 px-2 py-0.5 rounded uppercase border border-amber-800/20">
                  OPEN
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">systolic</span>
              </div>
              <p className="text-sm text-slate-300 font-semibold">
                "Systolic Blood Pressure must be higher than Diastolic Blood Pressure."
              </p>
              <div className="text-[10px] text-slate-500 mt-2 font-medium">Click to open threaded discussion thread</div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Modal */}
      {auditDpId !== null && (
        <DataChangeHistoryPanel
          dataPointId={auditDpId}
          fieldKey={auditFieldKey}
          onClose={() => setAuditDpId(null)}
        />
      )}

      {/* Query Comments Modal */}
      {threadQueryId !== null && (
        <QueryConversationPanel
          queryId={threadQueryId}
          queryText={threadQueryText}
          fieldKey={threadFieldKey}
          queryStatus={threadStatus}
          onClose={() => setThreadQueryId(null)}
        />
      )}

      {/* Medical Coding Modal */}
      {codingDpId !== null && (
        <MedicalCodingWorkbench
          dataPointId={codingDpId}
          fieldName={codingFieldName}
          reportedText={codingReportedText}
          onClose={() => setCodingDpId(null)}
        />
      )}

    </div>
  );
}
