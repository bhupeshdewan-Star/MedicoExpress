import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, Play, ChevronRight, X, User, HelpCircle, 
  MapPin, CheckCircle, Database, AlertCircle 
} from 'lucide-react';

export default function DemoGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const navigate = useNavigate();

  const scenarios = [
    {
      title: '1. Site Coordinator Persona',
      role: 'Clinical Research Coordinator',
      credentials: 'coordinator@demo.com / Demo@123',
      description: 'Perform subject screening, baseline visit eCRF entry, and respond to raised discrepancy queries.',
      path: '/clinical-subjects',
      tables: 'study_subjects, subject_visits, subject_form_submissions, subject_form_data_points',
      apis: 'POST /api/v2/edc/submissions/:id/data, PUT /api/v2/edc/queries/:id/resolve',
      steps: [
        'Navigate to Subjects Center.',
        'Screen a new oncology subject (e.g. SUB-101-105).',
        'Record vitals and submit initial Screening Visit eCRF.',
        'If a query is raised on systolic pressure, input correction details with a mandatory reason-for-change.'
      ]
    },
    {
      title: '2. CRA Monitor Persona',
      role: 'CRA Monitor',
      credentials: 'cra@demo.com / Demo@123',
      description: 'Review site clinical data, verify source documents (rSDV), open queries, and execute electronic signatures.',
      path: '/clinical-monitoring',
      tables: 'monitoring_visits, monitoring_findings, monitoring_visit_signatures, source_documents',
      apis: 'POST /api/v1/monitoring/:id/sign, POST /api/v1/rsdv/review',
      steps: [
        'Navigate to Monitoring Center.',
        'Start scheduled visit at Boston Oncology Center.',
        'Perform remote SDV check against MinIO uploaded source PDF.',
        'Sign interim monitoring visit report with password re-authentication.'
      ]
    },
    {
      title: '3. Medical Monitor Persona',
      role: 'Head of Medical Affairs / Advisor',
      credentials: 'medmon1@novabio.com / Demo@123',
      description: 'Audit automated RBM risk alerts, inspect outlier subjects, and review AI signals with dual-signature override.',
      path: '/clinical-rbm',
      tables: 'ai_alerts, study_risk_scores, subject_risk_scores',
      apis: 'POST /api/v1/rbm/approve-alert',
      steps: [
        'Navigate to RBM AI Center.',
        'Inspect oncology safety signals dashboard.',
        'Verify high-risk subjects with high deviations or outliers.',
        'Execute dual-signature electronic approval to close signals.'
      ]
    },
    {
      title: '4. Sponsor Executive Persona',
      role: 'Admin / Executive Monitor',
      credentials: 'sponsor1@novabio.com / Demo@123',
      description: 'Audit trial portfolio metrics, study-level KPI analysis, check eTMF binders completeness, and view system health.',
      path: '/clinical-studies',
      tables: 'studies, tenants, billing_subscriptions, audit_logs',
      apis: 'GET /api/v1/system/health, GET /api/audit/logs',
      steps: [
        'Check studies center enrollment progress bars.',
        'Navigate to eTMF center to verify binder completeness checks.',
        'Open System Health page to review live API, Redis, and Kafka metrics.',
        'Review global compliance logs on the Audit Dashboard.'
      ]
    }
  ];

  const handleLaunchScenario = (index: number) => {
    setActiveStep(index);
    navigate(scenarios[index].path);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-brand-teal hover:bg-teal-600 text-white font-semibold px-4.5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all border border-teal-500/20"
        >
          <Compass className="h-5 w-5 animate-spin-slow" />
          <span>Launch Demonstration Guide</span>
        </button>
      )}

      {/* Main floating drawer panel */}
      {isOpen && (
        <div className="w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 flex flex-col max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-brand-teal" />
              <h3 className="font-display font-bold text-slate-900 dark:text-slate-100">Walkthrough Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {activeStep === null ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Select one of the guided UAT clinical scenarios below to execute steps in the mock-simulation environment.
              </p>
              <div className="space-y-2.5">
                {scenarios.map((sc, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLaunchScenario(idx)}
                    className="w-full text-left p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 border border-slate-100 dark:border-slate-800/50 hover:border-teal-200/50 dark:hover:border-teal-900/50 rounded-xl transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-brand-teal transition-colors">
                        {sc.title}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {sc.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="bg-teal-50/40 dark:bg-teal-950/10 p-3 rounded-lg border border-teal-100/30">
                <h4 className="font-bold text-brand-teal-dark">{scenarios[activeStep].title}</h4>
                <p className="text-[11px] text-slate-500 mt-1">Role: {scenarios[activeStep].role}</p>
                <div className="text-[11px] text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded mt-2 border border-slate-100 dark:border-slate-800 font-mono">
                  Demo User: {scenarios[activeStep].credentials}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">Step Instructions:</span>
                <ul className="space-y-2 mt-2">
                  {scenarios[activeStep].steps.map((st, i) => (
                    <li key={i} className="flex gap-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      <span className="h-4.5 w-4.5 shrink-0 rounded-full bg-teal-50 dark:bg-teal-950 text-[10px] font-bold text-brand-teal flex items-center justify-center border border-teal-150">
                        {i + 1}
                      </span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-[10px] text-slate-400">
                <div className="flex gap-1.5 items-start">
                  <Database className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                  <span><strong>Touched Tables:</strong> {scenarios[activeStep].tables}</span>
                </div>
                <div className="flex gap-1.5 items-start">
                  <Play className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                  <span><strong>Consumed APIs:</strong> {scenarios[activeStep].apis}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveStep(null)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg font-semibold transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Back to List
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-brand-teal hover:bg-teal-600 text-white py-2 rounded-lg font-semibold transition-colors border border-teal-500/20"
                >
                  Got It
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
