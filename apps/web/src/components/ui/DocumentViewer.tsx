import React, { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, Search, ChevronLeft, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DocumentViewerProps {
  title: string;
  content: string;
  onClose: () => void;
}

export default function DocumentViewer({ title, content, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Split content into simulated pages (e.g., split by double newline or custom delimiter)
  const pages = useMemo(() => {
    const splitPages = content.split('\n\n');
    return splitPages.length > 0 ? splitPages : [content];
  }, [content]);

  const handleNextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Helper to render text with highlighted search queries
  const highlightedText = (text: string) => {
    if (!searchQuery) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 px-0.5 rounded font-semibold text-slate-900">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const activePageText = pages[currentPage - 1] || '';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-sm p-4 md:p-6 animate-fade-in font-sans">
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Title Bar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-teal animate-pulse" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[320px]">
              {title}
            </h2>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 dark:bg-green-950/40 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-900/40">
              <CheckCircle2 className="h-3 w-3" />
              <span>Verified GxP Source</span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer shadow-sm transition-all"
          >
            Close Viewer
          </button>
        </div>

        {/* Toolbar controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 px-4 py-2 shrink-0 text-xs">
          
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold font-mono text-slate-600 dark:text-slate-350">
              Page {currentPage} of {pages.length}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === pages.length}
              className="p-1.5 rounded-md border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="p-1.5 rounded-md border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-bold font-mono text-slate-600 dark:text-slate-350">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-1.5 rounded-md border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Search Filtering */}
          <div className="relative max-w-xs w-full flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search terms in document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>
        </div>

        {/* Interactive PDF Sheet Panel */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 overflow-auto flex justify-center items-start">
          <div 
            style={{ width: `${zoom}%`, maxWidth: '100%', minWidth: '320px' }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-lg p-8 md:p-12 transition-all min-h-[480px] relative text-left"
          >
            {/* Stamp / Compliance Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-6">
              <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                System: ClinCommand OS™
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                Audit Status: Active
              </div>
            </div>

            {/* Document body text */}
            <div className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
              {highlightedText(activePageText)}
            </div>

            {/* Compliance Footer */}
            <div className="absolute bottom-4 left-8 right-8 border-t border-slate-100 dark:border-slate-800/40 pt-4 flex justify-between items-center text-[8px] font-semibold text-slate-400">
              <span>FDA 21 CFR PART 11 ENCRYPTED CHECKSUM GATEWAY</span>
              <span>PAGE {currentPage} OF {pages.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
