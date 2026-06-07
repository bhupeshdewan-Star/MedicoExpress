import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Award, Calendar, AlertCircle } from 'lucide-react';

interface KPIReport {
  studyId: number;
  protocolNumber: string;
  metrics: {
    targetEnrollment: number;
    currentEnrollment: number;
    openFindings: number;
    etmfCompleteness: number;
    milestoneAdherence: number;
  };
  velocity: {
    subjectsPerDay: number;
    subjectsPerWeek: number;
  };
  forecast: {
    projectedDaysToTarget: number;
    projectedCompletionDate: string;
    isOverdue: boolean;
  };
  studyHealthIndex: number;
  chartData: {
    actualSeries: Array<{ date: string; count: number }>;
    targetSeries: Array<{ date: string; count: number }>;
  };
}

export default function ClinicalAnalytics() {
  const { token } = useAuth() as any;
  const [report, setReport] = useState<KPIReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/v1/clinical-analytics?study_id=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        setReport(resJson.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading clinical analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-brand-teal" />
            <span>Clinical Operations Intelligence Dashboard</span>
          </h1>
          <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
            Aggregate study performance metrics, calculate enrollment velocity, and track milestones.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400 font-semibold">Generating clinical forecast reports...</div>
      ) : (
        report && (
          <div className="space-y-6">
            
            {/* KPI Overview summary deck */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-card shadow-sm">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-450 mb-1">Subjects Enrolled</h4>
                <div className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
                  {report.metrics.currentEnrollment} <span className="text-xs font-normal text-slate-450">/ {report.metrics.targetEnrollment} Target</span>
                </div>
                <div className="text-[10px] text-slate-450 mt-1.5">Study Portfolio Completion</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-card shadow-sm">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-450 mb-1">eTMF Completeness</h4>
                <div className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
                  {report.metrics.etmfCompleteness}%
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-2">
                  <div className="bg-brand-teal h-1 rounded-full" style={{ width: `${report.metrics.etmfCompleteness}%` }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-card shadow-sm">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-450 mb-1">Milestone Adherence</h4>
                <div className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
                  {report.metrics.milestoneAdherence}%
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-2">
                  <div className="bg-brand-blue h-1 rounded-full" style={{ width: `${report.metrics.milestoneAdherence}%` }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-card shadow-sm">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-450 mb-1">Open Audit Findings</h4>
                <div className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
                  {report.metrics.openFindings}
                </div>
                <div className="text-[10px] text-slate-450 mt-1.5">Unresolved site actions (CAPA)</div>
              </div>

            </div>

            {/* Health index gauge and linear enrollment forecasts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Composite study health index */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-brand-teal" />
                    <span>Study Health Index Gauge</span>
                  </h3>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    Weighted index covering enrollment, findings, eTMF file uploads, and milestones.
                  </p>
                </div>

                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <span className="text-5xl font-display font-bold text-slate-850 dark:text-slate-150">{report.studyHealthIndex}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-teal mt-2">Study Health Index (0-100)</span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-brand-teal h-2 rounded-full animate-pulse" style={{ width: `${report.studyHealthIndex}%` }}></div>
                </div>
              </div>

              {/* Recruitment velocity & projections */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-brand-teal" />
                    <span>Linear Enrollment Velocity & Forecasts</span>
                  </h3>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    Calculated average velocity projections based on historical subject check-in dates.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded">
                    <div className="font-bold text-slate-500 uppercase text-[9px] mb-1">Recruitment Velocity</div>
                    <div className="text-lg font-bold text-slate-850 dark:text-slate-200">{report.velocity.subjectsPerWeek} subjects / week</div>
                    <div className="text-[10px] text-slate-400 mt-1">({report.velocity.subjectsPerDay} subjects / day average)</div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded">
                    <div className="font-bold text-slate-500 uppercase text-[9px] mb-1">Completion Projections</div>
                    <div className="text-lg font-bold text-brand-teal">{report.forecast.projectedCompletionDate}</div>
                    <div className="text-[10px] text-slate-400 mt-1">({report.forecast.projectedDaysToTarget} days remaining to target)</div>
                  </div>
                </div>

                {report.forecast.isOverdue ? (
                  <div className="flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Recruitment timeline is lagging significantly behind planned milestone bounds.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <span>Recruitment timeline is operating within projected milestone bounds.</span>
                  </div>
                )}
              </div>

            </div>

            {/* Target vs Actual Series Table representation (mock timeline charts) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6">
              <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4">Enrollment Series Curve Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-750">
                
                {/* Actual series */}
                <div className="space-y-3">
                  <h4 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-1.5 text-brand-teal">Actual Cumulative Enrollments</h4>
                  <div className="space-y-2">
                    {report.chartData.actualSeries.map((pt, i) => (
                      <div key={i} className="flex justify-between p-2 border border-slate-100 dark:border-slate-800 rounded">
                        <span>Date: {pt.date}</span>
                        <span className="font-bold">{pt.count} Patients Enrolled</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target projection series */}
                <div className="space-y-3">
                  <h4 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-1.5 text-brand-blue">Target Enrollment Forecast Trajectory</h4>
                  <div className="space-y-2">
                    {report.chartData.targetSeries.map((pt, i) => (
                      <div key={i} className="flex justify-between p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900/10">
                        <span>Milestone Date: {pt.date}</span>
                        <span className="font-bold">{pt.count} Target</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )
      )}
    </div>
  );
}
