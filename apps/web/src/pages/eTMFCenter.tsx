import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Folder, File, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import DocumentViewer from '../components/ui/DocumentViewer';

interface FolderItem {
  id: number;
  study_id: number;
  parent_id: number | null;
  name: string;
}

interface DocumentItem {
  id: number;
  study_id: number;
  folder_id: number | null;
  site_id: number | null;
  title: string;
  doc_type: string;
  status: string;
  file_url: string;
  file_size: number;
  file_hash: string;
}

interface ComplianceAlert {
  siteId: number;
  siteNumber: string;
  siteName: string;
  completenessPercent: number;
  presentDocuments: string[];
  missingDocuments: string[];
  isCompliant: boolean;
}

export default function ETMFCenter() {
  const { token } = useAuth() as any;
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [completeness, setCompleteness] = useState<ComplianceAlert[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form mock upload fields
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('PROTOCOL');
  const [filename, setFilename] = useState('');
  const [simContent, setSimContent] = useState('');
  const [siteId, setSiteId] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerContent, setViewerContent] = useState('');

  useEffect(() => {
    fetchFoldersAndDocs();
  }, [token]);

  const fetchFoldersAndDocs = async () => {
    setLoading(true);
    try {
      const folderRes = await fetch('/api/v1/etmf/folders?study_id=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const folderJson = await folderRes.json();
      if (folderJson.success) {
        setFolders(folderJson.data);
        if (folderJson.data.length > 0) {
          setSelectedFolderId(folderJson.data[0].id);
        }
      }

      const docRes = await fetch('/api/v1/etmf/documents?study_id=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const docJson = await docRes.json();
      if (docJson.success) {
        setDocuments(docJson.data);
      }

      const compRes = await fetch('/api/v1/etmf/completeness?study_id=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const compJson = await compRes.json();
      if (compJson.success) {
        setCompleteness(compJson.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading eTMF repository');
    } finally {
      setLoading(false);
    }
  };

  const openDocViewer = (doc: DocumentItem) => {
    setViewerTitle(doc.title);
    const simulatedPdf = `CLINICAL STUDY DOCUMENT MASTER BINDER RECORD

Title: ${doc.title}
Document Type: ${doc.doc_type}
Status: APPROVED
Uploaded At: 2026-06-03
SHA-256 Hash Verification: ${doc.file_hash || 'verified-checksum-9922'}

SECTION 1: CLINICAL OBJECTIVES & SCOPE OF STUDY
This master document outlines the regulatory expectations, protocol amendments, and site requirements for active monitoring. All researchers are required to maintain strict adherence to GxP compliance.

SECTION 2: SUBJECT VISIT PROTOCOLS AND COMPLIANCE RULES
Verify subject records, enrollment, and milestones check parameters. Ensure that RLS tenant isolation controls prevent cross-organization views or modifications of patient data.

SECTION 3: SIGN-OFF & COMPLIANCE STATEMENTS
This document is approved under FDA 21 CFR Part 11 electronic signature validations. All modifications are logged in the immutable audit trail blocks.`;
    setViewerContent(simulatedPdf);
    setViewerOpen(true);
  };

  const handleMockUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolderId) return;

    try {
      const res = await fetch('/api/v1/etmf/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          study_id: 1,
          folder_id: selectedFolderId,
          site_id: siteId ? parseInt(siteId) : null,
          title: docTitle,
          doc_type: docType,
          filename: filename || `${docTitle.toLowerCase().replace(/ /g, '_')}.pdf`,
          content: simContent || 'Simulated PDF payload data hash checks.'
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setDocTitle('');
        setFilename('');
        setSimContent('');
        setSiteId('');
        fetchFoldersAndDocs();
      } else {
        setError(resJson.errors?.[0] || 'Upload validation failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Build folder hierarchy (Trial / Country / Site DIA levels)
  const buildFolderHierarchy = () => {
    const root = folders.filter(f => f.parent_id === null);
    
    const renderNode = (folder: FolderItem) => {
      const children = folders.filter(f => f.parent_id === folder.id);
      const isSelected = selectedFolderId === folder.id;
      return (
        <div key={folder.id} className="pl-3 text-xs">
          <button
            onClick={() => setSelectedFolderId(folder.id)}
            className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 ${
              isSelected ? 'font-bold text-brand-teal bg-brand-teal/5' : 'text-slate-500'
            }`}
          >
            <Folder className="h-4 w-4 shrink-0" />
            <span className="truncate">{folder.name}</span>
          </button>
          {children.length > 0 && (
            <div className="border-l border-slate-200 dark:border-slate-800 pl-2 mt-0.5 space-y-0.5">
              {children.map(c => renderNode(c))}
            </div>
          )}
        </div>
      );
    };

    return root.map(r => renderNode(r));
  };

  const selectedFolderDocs = documents.filter(doc => doc.folder_id === selectedFolderId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-brand-teal" />
            <span>electronic Trial Master File (eTMF)</span>
          </h1>
          <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
            Store regulatory trial binders structured after the DIA Reference Model with active completeness checks.
          </p>
        </div>
        <button
          onClick={fetchFoldersAndDocs}
          className="flex items-center gap-1 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal-dark font-semibold text-xs px-3.5 py-1.5 rounded cursor-pointer mt-3 md:mt-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Completeness</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading eTMF directory tree...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* DIA Folder Tree */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 max-h-[600px] overflow-y-auto">
            <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-400 mb-4">DIA File Hierarchy</h2>
            <div className="space-y-1">
              {buildFolderHierarchy()}
            </div>
          </div>

          {/* Documents under selected folder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 min-h-[400px]">
              <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                <Folder className="h-4 w-4 text-brand-teal" />
                <span>Documents List</span>
              </h3>

              {selectedFolderDocs.length === 0 ? (
                <div className="text-slate-400 italic text-xs py-8 text-center">
                  This folder does not contain any approved documents.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {selectedFolderDocs.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => openDocViewer(doc)}
                      className="p-3 border border-slate-150 dark:border-slate-800 rounded hover:bg-slate-50 dark:hover:bg-slate-900/10 flex justify-between items-start cursor-pointer hover:border-brand-teal transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <File className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>{doc.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Type: {doc.doc_type} | Site ID: {doc.site_id || 'Global'} | Size: {Math.round(doc.file_size)}B
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 truncate max-w-[250px]">
                          Hash: {doc.file_hash}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mock Upload widget */}
            {selectedFolderId && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
                <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-brand-teal" />
                  <span>Upload Document Metadata</span>
                </h3>
                <form onSubmit={handleMockUpload} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-450 dark:text-slate-400 mb-1">Document Title</label>
                      <input
                        type="text"
                        required
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        placeholder="e.g. Site Activation Sign-off"
                        className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-450 dark:text-slate-400 mb-1">Doc Type</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                      >
                        <option value="PROTOCOL">PROTOCOL</option>
                        <option value="ICF">ICF (Informed Consent Form)</option>
                        <option value="IRB_APPROVAL">IRB_APPROVAL Letter</option>
                        <option value="CV">Investigator CV</option>
                        <option value="OTHER">OTHER (Clinical records)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-450 dark:text-slate-400 mb-1">Associated Site ID (Optional)</label>
                      <input
                        type="number"
                        value={siteId}
                        onChange={(e) => setSiteId(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-450 dark:text-slate-400 mb-1">Simulated File Contents (for hashing)</label>
                      <textarea
                        value={simContent}
                        onChange={(e) => setSimContent(e.target.value)}
                        placeholder="Standard procedures text..."
                        rows={2}
                        className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 text-xs"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-2 py-2 bg-brand-teal text-white rounded font-semibold cursor-pointer"
                  >
                    Simulate Upload File
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* eTMF Completeness Checker */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-4">
            <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-400 mb-2">eTMF Compliance Audits</h2>
            {completeness.length === 0 ? (
              <div className="text-slate-400 italic text-xs py-4">No completeness checks loaded.</div>
            ) : (
              <div className="space-y-4 text-xs">
                {completeness.map(alert => (
                  <div
                    key={alert.siteId}
                    className={`p-3.5 rounded border ${
                      alert.isCompliant
                        ? 'border-green-200 bg-green-500/5 text-green-700'
                        : 'border-red-200 bg-red-500/5 text-red-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold font-mono">Site {alert.siteNumber}</span>
                      <span className="font-bold">{alert.completenessPercent}%</span>
                    </div>
                    {alert.missingDocuments.length > 0 ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>Missing Documents Warning:</span>
                        </div>
                        <div className="pl-5 space-y-0.5 text-[10px] uppercase font-mono">
                          {alert.missingDocuments.map(md => <div key={md}>• {md}</div>)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-green-600 font-semibold">✓ Compliant Site Folder</div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
