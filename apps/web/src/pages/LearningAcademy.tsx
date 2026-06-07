import React, { useState } from 'react';
import { GraduationCap, BookOpen, Search, PlayCircle } from 'lucide-react';

export default function LearningAcademy() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(0);

  const articles = [
    {
      title: 'Platform Overview & Security Gates',
      category: 'Introduction',
      content: `ClinCommand OS™ functions as an on-premise digital command operating center.
      
      ### Role-Based Access Controls
      Authorizations are bound strictly to user tokens. System administrators can create accounts and alter roles directories. Deactivating directories terminates active JWT sessions instantly.
      
      ### Immutable Audits
      All actions trigger database entries capturing timestamp, user details, and client IP. Deleting logs is blocked at the database level rules to guarantee 21 CFR Part 11 compliance.`
    },
    {
      title: 'SOP Revisions & E-Signatures',
      category: 'SOP Module',
      content: `Standard operating procedures have four workflow statuses: Draft, Under Review, Approved, and Archived.
      
      ### 21 CFR Part 11 E-Signing
      1. Choose active Draft or Under Review SOP.
      2. Click "E-Sign Approve" to open the authorization dialog.
      3. Enter your login password and choose the signing purpose.
      4. The system validates credentials, calculates a SHA-256 checksum of the text body, and locks the document from editing.`
    },
    {
      title: 'Product Appraisal Builder',
      category: 'Business Modules',
      content: `The appraisal module compiles Go/No-Go validation guides.
      
      ### Wizard Workflow
      Managers navigate the 8-step compiler wizard covering SWOT, competitor cost parameters, and financial forecasts. Completed guides can be exported as Word, PDF, or PowerPoint summaries.`
    }
  ];

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    art.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-brand-teal" />
          <span>User Manual & Learning Academy</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Search & Categories List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-card space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user guide..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-button text-xs bg-slate-50 focus:border-brand-teal"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">Manual Sections</span>
            {filteredArticles.map((art, i) => (
              <button
                key={i}
                onClick={() => setSelectedArticle(articles.indexOf(art))}
                className={`w-full text-left px-2.5 py-2 rounded-button text-xs font-semibold flex items-center gap-2 transition-colors ${
                  articles.indexOf(art) === selectedArticle
                    ? 'bg-brand-teal/10 text-brand-teal-dark'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="truncate">{art.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Article Viewer & Media Simulator */}
        <div className="lg:col-span-3 space-y-6">
          {/* Document Viewer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 space-y-4">
            <span className="px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal-dark font-bold text-[10px] uppercase">
              {articles[selectedArticle]?.category || 'General'}
            </span>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
              {articles[selectedArticle]?.title}
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line border-t pt-4 border-slate-100 dark:border-slate-800">
              {articles[selectedArticle]?.content}
            </div>
          </div>

          {/* Videos Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 space-y-4">
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <PlayCircle className="h-4.5 w-4.5 text-brand-teal" />
              <span>Demonstration Training Videos Academy</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-card hover:border-brand-teal cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
                <PlayCircle className="h-8 w-8 text-brand-teal shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Video: Applying Electronic Signatures</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Duration: 4m 12s | Topic: 21 CFR Part 11 verification</p>
                </div>
              </div>
              <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-card hover:border-brand-teal cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
                <PlayCircle className="h-8 w-8 text-brand-teal shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Video: Product Appraisal Wizards</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Duration: 6m 45s | Topic: Go/No-Go forecasting reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
