import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, Plus, Search, Edit3, Key, FileCheck, Printer, ArrowLeft, 
  Layers, GitMerge, BarChart3, RotateCcw, Check, AlertCircle, Copy, Archive 
} from 'lucide-react';
import DocumentViewer from '../components/ui/DocumentViewer';

export default function Sops() {
  const { token, activeRole } = useAuth() as any;
  const [activeTab, setActiveTab] = useState<'directory' | 'templates' | 'workflows' | 'analytics'>('directory');
  
  // SOP states
  const [sops, setSops] = useState<any[]>([]);
  const [selectedSop, setSelectedSop] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Editor inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [code, setCode] = useState('');
  const [categoryId, setCategoryId] = useState('1');

  // E-Sign modal
  const [showSignModal, setShowSignModal] = useState(false);
  const [password, setPassword] = useState('');
  const [signPurpose, setSignPurpose] = useState('APPROVAL');

  // Version Governance states
  const [versions, setVersions] = useState<any[]>([]);
  const [compareVerA, setCompareVerA] = useState('');
  const [compareVerB, setCompareVerB] = useState('');
  const [compareResult, setCompareResult] = useState<any>(null);

  // Template states
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templateFields, setTemplateFields] = useState<any[]>([{ name: '', type: 'text', required: false }]);

  // Workflow states
  const [workflowDefs, setWorkflowDefs] = useState<any[]>([]);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [wfName, setWfName] = useState('');
  const [wfDesc, setWfDesc] = useState('');
  const [wfStages, setWfStages] = useState<any[]>([{ stage_name: '', stage_order: 1, role_requirement: 'Medical Manager', is_parallel: false, required_approvers_count: 1, sla_hours: 24 }]);
  const [activeWorkflowTasks, setActiveWorkflowTasks] = useState<any[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerContent, setViewerContent] = useState('');

  // Analytics states
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [boardReport, setBoardReport] = useState<any>(null);

  const fetchSops = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/sops', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSops(data);
      }
    } catch (err) {
      console.warn('SOP list fallback activated:', (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sop-templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (err) {
      console.warn('Template list error:', (err as any).message);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/workflows/definitions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWorkflowDefs(data);
      }
    } catch (err) {
      console.warn('Workflow list error:', (err as any).message);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const sumRes = await fetch('http://localhost:5000/api/analytics/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const boardRes = await fetch('http://localhost:5000/api/analytics/board-report', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sumRes.ok && boardRes.ok) {
        setAnalyticsSummary(await sumRes.json());
        setBoardReport(await boardRes.json());
      }
    } catch (err) {
      console.warn('Analytics loading error:', (err as any).message);
    }
  };

  useEffect(() => {
    fetchSops();
    fetchTemplates();
    fetchWorkflows();
    fetchAnalytics();
  }, [token]);

  const selectSop = async (sop: any) => {
    setSelectedSop(null);
    setEditMode(false);
    setCompareResult(null);
    try {
      const response = await fetch(`http://localhost:5000/api/sops/${sop.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedSop(data);
        setTitle(data.title);
        setContent(data.content);
        setCode(data.code);

        // Fetch version history
        const verResponse = await fetch(`http://localhost:5000/api/sops/${sop.id}/versions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (verResponse.ok) {
          setVersions(await verResponse.json());
        }
      }
    } catch (err) {
      setSelectedSop({
        ...sop,
        content: `# SOP Details: ${sop.title}\n\nStandard guidelines template.`,
        signatures: []
      });
    }
  };

  const handleSaveSop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      let response;
      if (selectedSop) {
        response = await fetch(`http://localhost:5000/api/sops/${selectedSop.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, content, change_summary: 'SOP Content Edit' })
        });
      } else {
        response = await fetch('http://localhost:5000/api/sops', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ code, title, categoryId: parseInt(categoryId), content })
        });
      }

      if (response.ok) {
        setEditMode(false);
        await fetchSops();
        setSelectedSop(null);
      }
    } catch (err) {
      alert('Failed to save SOP');
    }
  };

  const handleEsign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !selectedSop) return;

    try {
      const response = await fetch(`http://localhost:5000/api/sops/${selectedSop.id}/esign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password, purpose: signPurpose })
      });

      if (response.ok) {
        setShowSignModal(false);
        setPassword('');
        alert('Electronic Signature successfully applied. SOP status updated.');
        await selectSop(selectedSop);
        await fetchSops();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Password verification failed.');
      }
    } catch (err) {
      alert('Signature validation failed.');
    }
  };

  const handleCompareVersions = async () => {
    if (!compareVerA || !compareVerB) return;
    try {
      const res = await fetch(`http://localhost:5000/api/sops/${selectedSop.id}/compare?verA=${compareVerA}&verB=${compareVerB}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCompareResult(await res.json());
      }
    } catch (err) {
      alert('Failed to compare versions');
    }
  };

  const handleRollback = async (targetVersion: string) => {
    if (!window.confirm(`Are you sure you want to rollback to version ${targetVersion}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/sops/${selectedSop.id}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ target_version: targetVersion })
      });
      if (res.ok) {
        alert(`Successfully rolled back to version ${targetVersion}`);
        await selectSop(selectedSop);
        await fetchSops();
      }
    } catch (err) {
      alert('Failed to rollback');
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/sop-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: templateName,
          description: templateDesc,
          structure_json: { fields: templateFields }
        })
      });
      if (res.ok) {
        setShowTemplateModal(false);
        setTemplateName('');
        setTemplateDesc('');
        setTemplateFields([{ name: '', type: 'text', required: false }]);
        await fetchTemplates();
      }
    } catch (err) {
      alert('Failed to create template');
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/workflows/definitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: wfName,
          description: wfDesc,
          stages: wfStages
        })
      });
      if (res.ok) {
        setShowWorkflowModal(false);
        setWfName('');
        setWfDesc('');
        setWfStages([{ stage_name: '', stage_order: 1, role_requirement: 'Medical Manager', is_parallel: false, required_approvers_count: 1, sla_hours: 24 }]);
        await fetchWorkflows();
      }
    } catch (err) {
      alert('Failed to create workflow definition');
    }
  };

  const triggerBoardReportExport = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/exports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resource_type: 'analytics', resource_id: 1, file_type: 'pdf' })
      });
      if (res.ok) {
        const job = await res.json();
        alert(`Compliance board report export queued (Job ID: ${job.job_id}). Document will compile in the background.`);
      }
    } catch (err) {
      alert('Failed to trigger export');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <nav className="flex gap-4">
          <button 
            onClick={() => setActiveTab('directory')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'directory' ? 'border-brand-teal text-brand-teal-dark' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>SOP Directory</span>
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'templates' ? 'border-brand-teal text-brand-teal-dark' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Template Registry</span>
          </button>
          <button 
            onClick={() => setActiveTab('workflows')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'workflows' ? 'border-brand-teal text-brand-teal-dark' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <GitMerge className="h-4 w-4" />
            <span>Workflow Designer</span>
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'analytics' ? 'border-brand-teal text-brand-teal-dark' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics Summary</span>
          </button>
        </nav>
      </div>

      {/* Directory Tab View */}
      {activeTab === 'directory' && (
        <div className="h-[calc(100vh-220px)] flex gap-6">
          {/* Left panel */}
          <div className={`w-[360px] shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card flex flex-col p-4 space-y-4 ${selectedSop || editMode ? 'hidden xl:flex' : 'flex'}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">SOP File List</h3>
              {activeRole !== 'Viewer' && (
                <button
                  onClick={() => {
                    setSelectedSop(null);
                    setEditMode(true);
                    setTitle('');
                    setContent('');
                    setCode('SOP-MA-');
                  }}
                  className="p-1 px-2.5 bg-brand-teal text-white rounded-button hover:bg-brand-teal-dark flex items-center gap-1 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Draft SOP</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter files..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-button bg-slate-50 dark:bg-slate-950 text-xs focus:border-brand-teal"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-8 text-slate-400 text-xs">Fetching SOP database...</div>
              ) : sops.map(sop => (
                <div 
                  key={sop.id} 
                  onClick={() => selectSop(sop)}
                  className={`p-3 border rounded-card hover:border-brand-teal cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900 ${
                    selectedSop?.id === sop.id ? 'border-brand-teal bg-brand-teal/5' : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-brand-teal-dark">{sop.code}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      sop.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>{sop.status}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{sop.title}</h4>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2">
                    <span>{sop.category || 'Quality Control'}</span>
                    <span>Ver: {sop.version}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right workspace */}
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 flex flex-col overflow-y-auto">
            {selectedSop && !editMode && (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand-teal">{selectedSop.code}</span>
                    <h2 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 mt-1">{selectedSop.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setViewerTitle(selectedSop.title); setViewerContent(selectedSop.content); setViewerOpen(true); }} className="p-2 border border-slate-250 dark:border-slate-800 rounded-button text-xs font-semibold bg-slate-50 hover:bg-slate-100 flex items-center gap-1 cursor-pointer">
                      <FileText className="h-3.5 w-3.5 text-brand-teal" />
                      <span>Read Mode</span>
                    </button>
                    {activeRole !== 'Viewer' && selectedSop.status !== 'Approved' && (
                      <button onClick={() => setEditMode(true)} className="p-2 border border-slate-200 dark:border-slate-850 rounded-button text-xs font-semibold hover:bg-slate-50 flex items-center gap-1">
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                    {activeRole !== 'Viewer' && selectedSop.status !== 'Approved' && (
                      <button onClick={() => setShowSignModal(true)} className="p-2 bg-brand-teal text-white rounded-button text-xs font-semibold hover:bg-brand-teal-dark flex items-center gap-1">
                        <Key className="h-3.5 w-3.5" />
                        <span>E-Sign</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start flex-1">
                  {/* Left Column: Markdown content body */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-card text-xs leading-relaxed whitespace-pre-line overflow-y-auto max-h-[400px]">
                      {selectedSop.content}
                    </div>

                    {/* eSignatures log */}
                    {selectedSop.signatures && selectedSop.signatures.length > 0 && (
                      <div className="p-4 border border-brand-teal/20 bg-brand-teal/5 rounded-card">
                        <h4 className="font-display font-bold text-[10px] text-brand-teal-dark uppercase tracking-wider mb-2">21 CFR Part 11 Signatures</h4>
                        <div className="space-y-2">
                          {selectedSop.signatures.map((sig: any, idx: number) => (
                            <div key={idx} className="text-[10px] text-slate-600 dark:text-slate-400 pl-2 border-l border-brand-teal">
                              <span className="font-semibold text-slate-800">{sig.username} ({sig.signer_role})</span>
                              <div>Purpose: {sig.sign_purpose} | Signed: {new Date(sig.signed_at).toLocaleString()}</div>
                              <div className="font-mono text-[8px] text-slate-400">Hash: {sig.sha256_checksum}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Version comparisons & rollbacks */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-card space-y-4">
                    <h3 className="font-display font-bold text-xs text-slate-800">Version Governance</h3>
                    
                    {/* Comparison UI */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compare Revisions</span>
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={compareVerA} 
                          onChange={(e) => setCompareVerA(e.target.value)}
                          className="px-2 py-1 border rounded text-[10px] bg-white"
                        >
                          <option value="">Select version</option>
                          {versions.map(v => <option key={v.id} value={v.version}>{v.version}</option>)}
                        </select>
                        <select 
                          value={compareVerB} 
                          onChange={(e) => setCompareVerB(e.target.value)}
                          className="px-2 py-1 border rounded text-[10px] bg-white"
                        >
                          <option value="">Select version</option>
                          {versions.map(v => <option key={v.id} value={v.version}>{v.version}</option>)}
                        </select>
                      </div>
                      <button 
                        onClick={handleCompareVersions}
                        className="w-full py-1 bg-brand-teal text-white rounded text-[10px] font-semibold hover:bg-brand-teal-dark"
                      >
                        Compare Diff
                      </button>
                    </div>

                    {/* Compare result output */}
                    {compareResult && (
                      <div className="p-3 border border-slate-200 bg-white rounded text-[10px] space-y-2 max-h-[150px] overflow-y-auto">
                        <div className="font-semibold border-b pb-1">Comparison Output:</div>
                        <div className="whitespace-pre-line text-slate-500 font-mono">
                          {compareResult.verA?.content === compareResult.verB?.content 
                            ? 'No differences detected.' 
                            : `<<< Version ${compareVerA}\n${String(compareResult.verA?.content || '').substring(0, 100)}...\n\n>>> Version ${compareVerB}\n${String(compareResult.verB?.content || '').substring(0, 100)}...`
                          }
                        </div>
                      </div>
                    )}

                    {/* Version History listing with rollback */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revision Logs</span>
                      <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                        {versions.map(v => (
                          <div key={v.id} className="p-2 bg-white rounded border border-slate-100 flex justify-between items-center text-[10px]">
                            <div>
                              <span className="font-semibold">v{v.version}</span>
                              <div className="text-slate-400 text-[8px]">{new Date(v.created_at).toLocaleDateString()} by {v.username}</div>
                              <div className="text-slate-400 text-[8px] truncate max-w-[150px]">{v.change_summary}</div>
                            </div>
                            <button 
                              onClick={() => handleRollback(v.version)}
                              className="p-1 border text-brand-teal rounded hover:bg-slate-50"
                              title="Rollback to this version"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SOP Edit / Form mode */}
            {editMode && (
              <form onSubmit={handleSaveSop} className="space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="font-display font-bold text-sm text-slate-800">SOP Metadata Draft Panel</h3>
                  <button type="button" onClick={() => setEditMode(false)} className="p-1 px-2 border rounded text-xs font-semibold hover:bg-slate-50 flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                </div>

                {!selectedSop && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Document Code</label>
                      <input 
                        type="text" 
                        required 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)} 
                        className="w-full px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Department Division</label>
                      <select 
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-2 py-1.5 border rounded text-xs"
                      >
                        <option value="1">Medical Affairs Operations</option>
                        <option value="2">Regulatory Support</option>
                        <option value="3">Clinical Research</option>
                        <option value="6">Pharmacovigilance</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">SOP Title</label>
                  <input 
                    type="text" 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full px-2 py-1.5 border rounded text-xs"
                  />
                </div>

                <div className="flex-1 flex flex-col space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Markdown Procedures body</label>
                  <textarea 
                    required 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    className="flex-1 p-3 border rounded text-xs font-mono resize-none min-h-[220px]"
                  />
                </div>

                <button type="submit" className="w-full py-2 bg-brand-teal text-white rounded text-xs font-semibold hover:bg-brand-teal-dark">
                  Commit SOP Draft
                </button>
              </form>
            )}

            {!selectedSop && !editMode && (
              <div className="text-center py-20 text-slate-400 text-xs flex flex-col items-center justify-center space-y-2 flex-1">
                <FileText className="h-8 w-8 text-slate-300" />
                <span>Select an SOP from the left directory column to load version governance files.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab View */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-sm text-slate-800">Dynamic Templates Registry</h3>
            <button 
              onClick={() => setShowTemplateModal(true)}
              className="p-1.5 px-3 bg-brand-teal text-white rounded-button text-xs font-semibold hover:bg-brand-teal-dark flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map(tpl => (
              <div key={tpl.id} className="bg-white border border-slate-200 p-4 rounded-card space-y-3 relative group">
                <div className="flex justify-between items-start">
                  <h4 className="font-display font-bold text-xs text-slate-900">{tpl.name}</h4>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-100 text-slate-600">Active</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{tpl.description}</p>
                <div className="pt-2 border-t flex justify-between items-center text-[9px] text-slate-400">
                  <span>Custom Fields: {JSON.parse(tpl.structure_json || '{}').fields?.length || 0} items</span>
                  <div className="flex gap-2">
                    <button className="text-brand-teal hover:underline flex items-center gap-0.5"><Copy className="h-2.5 w-2.5" />Clone</button>
                    <button className="text-slate-400 hover:underline flex items-center gap-0.5"><Archive className="h-2.5 w-2.5" />Archive</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Designer Tab View */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-sm text-slate-800">Polymorphic Generic Workflow Engine</h3>
            <button 
              onClick={() => setShowWorkflowModal(true)}
              className="p-1.5 px-3 bg-brand-teal text-white rounded-button text-xs font-semibold hover:bg-brand-teal-dark flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Configure Workflow</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {workflowDefs.map(wf => (
              <div key={wf.id} className="bg-white border border-slate-200 p-4 rounded-card space-y-3">
                <h4 className="font-display font-bold text-xs text-slate-900">{wf.name}</h4>
                <p className="text-[10px] text-slate-400">{wf.description}</p>
                
                <div className="pt-2 border-t space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Approval Sequence</span>
                  <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded">Draft</span>
                    {/* Sequence logic */}
                    <span className="text-slate-400">&rarr;</span>
                    <span className="px-1.5 py-0.5 bg-brand-teal/10 text-brand-teal-dark rounded">Approval Gate</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded">Locked</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab View */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-sm text-slate-800">GxP Compliance Summary Board</h3>
            <button 
              onClick={triggerBoardReportExport}
              className="p-1.5 px-3 bg-brand-teal text-white rounded-button text-xs font-semibold hover:bg-brand-teal-dark flex items-center gap-1"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Export Board PDF</span>
            </button>
          </div>

          {/* Odometer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-200 p-4 rounded-card">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certified SOP count</h4>
              <p className="text-2xl font-bold text-slate-950 mt-1">{boardReport?.metrics?.certified_sops || 0}</p>
              <span className="text-[8px] text-slate-400 mt-1 block">GxP Locked active files</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-card">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active CAPAs</h4>
              <p className="text-2xl font-bold text-brand-teal-dark mt-1">{boardReport?.metrics?.active_corrective_actions_capa || 0}</p>
              <span className="text-[8px] text-slate-400 mt-1 block">Open Corrective action items</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-card">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI cost tracking</h4>
              <p className="text-2xl font-bold text-slate-950 mt-1">${analyticsSummary?.ai_total_cost_usd?.toFixed(4) || '0.0000'}</p>
              <span className="text-[8px] text-slate-400 mt-1 block">Total tokens calculation</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-card">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance Index</h4>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{boardReport?.compliance_rating_percentage || 100}%</p>
              <span className="text-[8px] text-slate-400 mt-1 block">Audit trail health metrics</span>
            </div>
          </div>

          {/* Executive review card */}
          {boardReport && (
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-card space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold text-xs uppercase tracking-wider text-brand-teal">Quarterly Executive Digest ({boardReport.reporting_quarter})</span>
                <span className="text-[10px] text-slate-400">Board date: {boardReport.board_ready_date}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 font-sans whitespace-pre-line">{boardReport.executive_summary}</p>
            </div>
          )}
        </div>
      )}

      {/* Signature popup */}
      {showSignModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[380px] bg-white border border-slate-250 rounded-card shadow-2xl p-6">
            <h3 className="font-display font-bold text-sm text-slate-900 mb-2">GxP E-Signature Verification</h3>
            <p className="text-[10px] text-slate-500 mb-4">Validate credentials to compute SHA-256 integrity block.</p>
            <form onSubmit={handleEsign} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Signing Purpose</label>
                <select 
                  value={signPurpose} 
                  onChange={(e) => setSignPurpose(e.target.value)}
                  className="w-full px-2 py-1.5 border rounded text-xs"
                >
                  <option value="REVIEW">REVIEW (Verification check)</option>
                  <option value="APPROVAL">APPROVAL (Authorize release of files)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Confirm Password</label>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full px-2 py-1.5 border rounded text-xs"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSignModal(false)} className="flex-1 py-1.5 border rounded text-xs hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-1.5 bg-brand-teal text-white rounded text-xs font-semibold hover:bg-brand-teal-dark">Sign & Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[450px] bg-white border border-slate-250 rounded-card shadow-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-900">Define SOP Template</h3>
            <form onSubmit={handleCreateTemplate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Template Name</label>
                <input 
                  type="text" 
                  required 
                  value={templateName} 
                  onChange={(e) => setTemplateName(e.target.value)} 
                  className="w-full px-2 py-1.5 border rounded text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <input 
                  type="text" 
                  value={templateDesc} 
                  onChange={(e) => setTemplateDesc(e.target.value)} 
                  className="w-full px-2 py-1.5 border rounded text-xs"
                />
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custom Fields Checklist</span>
                <button 
                  type="button"
                  onClick={() => setTemplateFields([...templateFields, { name: '', type: 'text', required: false }])}
                  className="py-1 px-2 border border-slate-200 rounded text-[9px] hover:bg-slate-50 font-semibold"
                >
                  + Add Field
                </button>
                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                  {templateFields.map((f, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        required 
                        placeholder="Field name" 
                        value={f.name}
                        onChange={(e) => {
                          const list = [...templateFields];
                          list[idx].name = e.target.value;
                          setTemplateFields(list);
                        }}
                        className="flex-1 px-2 py-1 border rounded text-[10px]"
                      />
                      <select 
                        value={f.type}
                        onChange={(e) => {
                          const list = [...templateFields];
                          list[idx].type = e.target.value;
                          setTemplateFields(list);
                        }}
                        className="px-2 py-1 border rounded text-[10px]"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowTemplateModal(false)} className="flex-1 py-1.5 border rounded text-xs hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-1.5 bg-brand-teal text-white rounded text-xs font-semibold hover:bg-brand-teal-dark">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow Modal */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[500px] bg-white border border-slate-250 rounded-card shadow-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-900">Define Approval Workflow</h3>
            <form onSubmit={handleCreateWorkflow} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Workflow Name</label>
                <input 
                  type="text" 
                  required 
                  value={wfName} 
                  onChange={(e) => setWfName(e.target.value)} 
                  className="w-full px-2 py-1.5 border rounded text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <input 
                  type="text" 
                  value={wfDesc} 
                  onChange={(e) => setWfDesc(e.target.value)} 
                  className="w-full px-2 py-1.5 border rounded text-xs"
                />
              </div>

              <div className="space-y-2 pt-2 border-t">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approval Stages sequence</span>
                <button 
                  type="button"
                  onClick={() => setWfStages([...wfStages, { stage_name: '', stage_order: wfStages.length + 1, role_requirement: 'Medical Manager', is_parallel: false, required_approvers_count: 1, sla_hours: 24 }])}
                  className="py-1 px-2 border border-slate-200 rounded text-[9px] hover:bg-slate-50 font-semibold"
                >
                  + Add Stage
                </button>
                <div className="space-y-2 max-h-[140px] overflow-y-auto">
                  {wfStages.map((st, idx) => (
                    <div key={idx} className="flex gap-2 items-center text-[10px]">
                      <span className="font-bold text-brand-teal">{st.stage_order}.</span>
                      <input 
                        type="text" 
                        required 
                        placeholder="Stage Name" 
                        value={st.stage_name}
                        onChange={(e) => {
                          const list = [...wfStages];
                          list[idx].stage_name = e.target.value;
                          setWfStages(list);
                        }}
                        className="flex-1 px-2 py-1 border rounded text-[10px]"
                      />
                      <select 
                        value={st.role_requirement}
                        onChange={(e) => {
                          const list = [...wfStages];
                          list[idx].role_requirement = e.target.value;
                          setWfStages(list);
                        }}
                        className="px-2 py-1 border rounded text-[10px]"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Head of Medical Affairs">Head of Medical Affairs</option>
                        <option value="Medical Manager">Medical Manager</option>
                        <option value="Regulatory Manager">Regulatory Manager</option>
                      </select>
                      <input 
                        type="number" 
                        title="SLA Hours"
                        placeholder="SLA Hrs" 
                        value={st.sla_hours}
                        onChange={(e) => {
                          const list = [...wfStages];
                          list[idx].sla_hours = parseInt(e.target.value);
                          setWfStages(list);
                        }}
                        className="w-14 px-2 py-1 border rounded text-[10px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowWorkflowModal(false)} className="flex-1 py-1.5 border rounded text-xs hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-1.5 bg-brand-teal text-white rounded text-xs font-semibold hover:bg-brand-teal-dark">Save Workflow</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewerOpen && (
        <DocumentViewer
          title={viewerTitle}
          content={viewerContent}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
