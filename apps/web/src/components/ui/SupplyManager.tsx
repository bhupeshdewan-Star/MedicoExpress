import React, { useState } from 'react';
import { Package, Truck, ShieldAlert, CheckSquare, Square, RefreshCw, Plus } from 'lucide-react';

interface Kit {
  id: number;
  kit_number: string;
  treatment_arm: string;
  status: string;
  site_id: number | null;
  expiration_date: string;
}

interface Site {
  id: number;
  name: string;
  site_number: string;
}

interface SupplyProps {
  kits: Kit[];
  sites: Site[];
  token: string;
  studyId: number;
  onSuccess: () => void;
}

export default function SupplyManager({ kits, sites, token, studyId, onSuccess }: SupplyProps) {
  const [selectedKitIds, setSelectedKitIds] = useState<number[]>([]);
  const [targetSiteId, setTargetSiteId] = useState('');
  const [quarantineReason, setQuarantineReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Bulk add states
  const [bulkCount, setBulkCount] = useState('10');
  const [bulkArm, setBulkArm] = useState('ACTIVE');
  const [bulkExp, setBulkExp] = useState('2027-12-31');

  const handleToggleSelect = (id: number) => {
    if (selectedKitIds.includes(id)) {
      setSelectedKitIds(selectedKitIds.filter(kid => kid !== id));
    } else {
      setSelectedKitIds([...selectedKitIds, id]);
    }
  };

  const handleShipKits = async () => {
    if (selectedKitIds.length === 0 || !targetSiteId) {
      alert('Please select kits and a destination site.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/rtsm/kits/shipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          kitIds: selectedKitIds,
          siteId: parseInt(targetSiteId, 10)
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setSelectedKitIds([]);
        setTargetSiteId('');
        onSuccess();
      } else {
        setError(resJson.errors?.[0] || 'Shipment failure.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuarantine = async (kitId: number) => {
    const reason = prompt('Please specify the quarantine reason (e.g. Temperature Deviation):');
    if (!reason) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/rtsm/kits/quarantine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ kitId, reason })
      });
      const resJson = await res.json();
      if (resJson.success) {
        onSuccess();
      } else {
        setError(resJson.errors?.[0] || 'Quarantine failed.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async (kitId: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/rtsm/kits/release', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ kitId })
      });
      const resJson = await res.json();
      if (resJson.success) {
        onSuccess();
      } else {
        setError(resJson.errors?.[0] || 'Release failed.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const count = parseInt(bulkCount, 10);
    const mockKitsList = [];
    for (let i = 1; i <= count; i++) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      mockKitsList.push({
        kitNumber: `K-${String(bulkArm || 'ARM').substring(0, 3)}-${suffix}`,
        treatmentArm: bulkArm,
        expirationDate: new Date(bulkExp).toISOString()
      });
    }

    try {
      const res = await fetch(`/api/v1/rtsm/studies/${studyId}/kits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ kits: mockKitsList })
      });
      const resJson = await res.json();
      if (resJson.success) {
        onSuccess();
      } else {
        setError(resJson.errors?.[0] || 'Bulk insert failed.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Logistics Operations panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-4 md:col-span-2">
          <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-brand-teal" />
              <span>Depot Logistics & Dispatch</span>
            </h3>
            {selectedKitIds.length > 0 && (
              <span className="text-[10px] bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded font-bold">
                {selectedKitIds.length} kits selected
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-lg">
            <select
              value={targetSiteId}
              onChange={(e) => setTargetSiteId(e.target.value)}
              className="border border-slate-250 dark:border-slate-800 rounded p-1.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="">-- Select Destination Site --</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.site_number})</option>)}
            </select>
            <button
              onClick={handleShipKits}
              disabled={loading || selectedKitIds.length === 0 || !targetSiteId}
              className="bg-brand-teal text-white hover:bg-brand-teal-dark font-semibold px-4 py-1.5 rounded cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <span>Dispatch Shipment</span>
            </button>
          </div>

          {error && <div className="text-[10px] text-red-500 font-bold">{error}</div>}

          {/* Kits List Grid */}
          <div className="max-h-[300px] overflow-y-auto border border-slate-150 dark:border-slate-850 rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b dark:border-slate-850 text-[9px] sticky top-0">
                  <th className="p-3 w-8">Select</th>
                  <th className="p-3">Kit Number</th>
                  <th className="p-3">Arm</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Site / Location</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850 bg-white dark:bg-slate-900">
                {kits.map(kit => {
                  const isSelected = selectedKitIds.includes(kit.id);
                  const isAvailable = kit.status === 'AVAILABLE';
                  const isQuarantined = kit.status === 'QUARANTINED';
                  
                  return (
                    <tr key={kit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="p-3 text-center">
                        {isAvailable ? (
                          <button 
                            type="button" 
                            onClick={() => handleToggleSelect(kit.id)}
                            className="text-slate-400 hover:text-brand-teal"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-brand-teal" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-300">-</span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-850 dark:text-slate-150 font-mono">{kit.kit_number}</td>
                      <td className="p-3 font-mono">{kit.treatment_arm}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          kit.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                          kit.status === 'DISPENSED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {kit.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        {kit.site_id ? `Site ${kit.site_id}` : 'Global Depot'}
                      </td>
                      <td className="p-3">
                        {isAvailable && (
                          <button
                            onClick={() => handleQuarantine(kit.id)}
                            className="text-red-500 hover:text-red-700 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                          >
                            <ShieldAlert className="h-3 w-3" />
                            <span>Quarantine</span>
                          </button>
                        )}
                        {isQuarantined && (
                          <button
                            onClick={() => handleRelease(kit.id)}
                            className="text-green-600 hover:text-green-800 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                          >
                            <RefreshCw className="h-3 w-3" />
                            <span>Release Stock</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Seed / Add Depot Stock Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-4">
          <div className="flex items-center gap-1.5 border-b dark:border-slate-800 pb-2">
            <Plus className="h-4 w-4 text-brand-teal" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Seed Depot Stock</h3>
          </div>
          <form onSubmit={handleBulkAdd} className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Kit Count</label>
              <input
                type="number"
                required
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
                placeholder="10"
                className="w-full border border-slate-250 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 rounded p-1.5"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Treatment Arm</label>
              <select
                value={bulkArm}
                onChange={(e) => setBulkArm(e.target.value)}
                className="w-full border border-slate-250 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 rounded p-1.5"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PLACEBO">PLACEBO</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Expiration Date</label>
              <input
                type="date"
                required
                value={bulkExp}
                onChange={(e) => setBulkExp(e.target.value)}
                className="w-full border border-slate-250 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 rounded p-1.5"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-brand-teal text-white font-semibold rounded cursor-pointer hover:bg-brand-teal-dark disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Kits to Depot'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
