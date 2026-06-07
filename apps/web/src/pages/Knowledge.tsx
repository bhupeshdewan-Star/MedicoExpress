import React, { useState } from 'react';
import { Search, BookOpen, FileText, Database, Layers, ArrowUpRight, Share2 } from 'lucide-react';

const MOCK_KNOWLEDGE_DOCS = [
  { id: 1, type: 'SOP', title: 'SOP-MA-042: Product Appraisal Control Guidelines', desc: 'Rules and requirements governing clinical SWOT matrices reviews.', status: 'Validated' },
  { id: 2, type: 'Regulatory Guideline', title: 'FDA-2025-D-01: Biosimilar Labeling Standards', desc: 'US FDA guidelines for structural biosimilar descriptions.', status: 'Active' },
  { id: 3, type: 'Clinical Monograph', title: 'Remimazolam Phase III Sedation Induction Study', desc: 'Clinical evaluation trial results and demographics profiles.', status: 'Approved' },
  { id: 4, type: 'Scientific Literature', title: 'Once-Weekly GLP-1 Weight Loss Outcomes Meta-Analysis', desc: 'Cochrane library systematic study comparisons datasets.', status: 'Published' }
];

export default function KnowledgeCenter() {
  const [query, setQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const filteredDocs = MOCK_KNOWLEDGE_DOCS.filter(doc => 
    doc.title.toLowerCase().includes(query.toLowerCase()) || 
    doc.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">Knowledge Center</h2>
          <p className="text-xs text-slate-400">Search globally across SOPs, regulatory guideline dossiers, and scientific literature databases.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents or references..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-button bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 focus:border-brand-teal"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Document List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6">
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-brand-teal" />
              <span>Unified Document Index ({filteredDocs.length})</span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocs.map(doc => (
                <div 
                  key={doc.id} 
                  onClick={() => setSelectedDoc(doc)}
                  className={`py-4 cursor-pointer hover:bg-slate-50/40 dark:hover:bg-slate-800/20 px-2 rounded transition-all flex items-start justify-between gap-4 ${selectedDoc?.id === doc.id ? 'bg-slate-50 dark:bg-slate-850' : ''}`}
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal-dark font-mono text-[9px] uppercase tracking-wider">
                      {doc.type}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 pt-1">{doc.title}</h4>
                    <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">{doc.desc}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold rounded-full shrink-0">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Context Details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6">
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-teal" />
              <span>Knowledge Graph Matrix</span>
            </h3>
            
            {selectedDoc ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedDoc.title}</h4>
                  <p className="text-xs text-slate-400">Cross-linked reference connections:</p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-brand-blue" />
                      <span>Molecule Link: Remimazolam</span>
                    </div>
                    <ArrowUpRight className="h-3 w-3 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-brand-green" />
                      <span>SOP Link: SOP-MA-001</span>
                    </div>
                    <ArrowUpRight className="h-3 w-3 text-slate-400" />
                  </div>
                </div>

                <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded transition-colors inline-flex items-center justify-center gap-2">
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Traverse Graph Node</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Select an indexed document to display its cross-linked nodes and references.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
