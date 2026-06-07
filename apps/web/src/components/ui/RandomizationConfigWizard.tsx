import React, { useState } from 'react';
import { Settings, Play, CheckCircle } from 'lucide-react';

interface WizardProps {
  studyId: number;
  token: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function RandomizationConfigWizard({ studyId, token, onSuccess, onClose }: WizardProps) {
  const [blockSizes, setBlockSizes] = useState('4, 6');
  const [stratificationFactors, setStratificationFactors] = useState('site_id');
  const [randomizationRatio, setRandomizationRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const parsedBlocks = blockSizes
      .split(',')
      .map(b => parseInt(b.trim(), 10))
      .filter(b => !isNaN(b));
    
    const parsedStrats = stratificationFactors
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      const res = await fetch(`/api/v1/rtsm/studies/${studyId}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          blockSizes: `{${parsedBlocks.join(',')}}`,
          stratificationFactors: `{${parsedStrats.join(',')}}`,
          randomizationRatio
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setSaved(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(resJson.errors?.[0] || 'Failed to save configuration.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-left">
        <div className="flex items-center gap-2 border-b dark:border-slate-800 pb-3">
          <Settings className="h-5 w-5 text-brand-teal" />
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Randomization Config Wizard</h3>
            <p className="text-[10px] text-slate-400">Set stratification parameters for study ID: {studyId}</p>
          </div>
        </div>

        {saved ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-12 w-12 animate-bounce" />
            <span className="font-semibold">Randomization Settings Saved Successfully!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-[11px]">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider text-[9px]">
                Allocation Block Sizes (e.g. 4, 6)
              </label>
              <input
                type="text"
                required
                value={blockSizes}
                onChange={(e) => setBlockSizes(e.target.value)}
                placeholder="4, 6"
                className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand-teal"
              />
              <span className="text-[9px] text-slate-400">Uses random block sequence sizing to maintain blinding safety.</span>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider text-[9px]">
                Stratification Factors (comma separated)
              </label>
              <input
                type="text"
                required
                value={stratificationFactors}
                onChange={(e) => setStratificationFactors(e.target.value)}
                placeholder="site_id, gender"
                className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand-teal"
              />
              <span className="text-[9px] text-slate-400">E.g., site_id, age_group, baseline_severity</span>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider text-[9px]">
                Randomization Ratio
              </label>
              <select
                value={randomizationRatio}
                onChange={(e) => setRandomizationRatio(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand-teal"
              >
                <option value="1:1">1:1 Allocation (Active vs Placebo)</option>
                <option value="2:1">2:1 Allocation (Double Active share)</option>
                <option value="1:1:1">1:1:1 Allocation (Active vs Placebo vs Low Dose)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-3 border-t dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-brand-teal text-white rounded-lg font-semibold hover:bg-brand-teal-dark disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{loading ? 'Saving...' : 'Deploy Config'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
