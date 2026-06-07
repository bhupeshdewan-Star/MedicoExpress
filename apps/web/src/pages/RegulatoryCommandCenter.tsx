import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  RefreshCw, 
  AlertOctagon, 
  Layers, 
  CheckCircle, 
  Activity, 
  Flame, 
  FileSpreadsheet, 
  Play 
} from 'lucide-react';

export default function RegulatoryCommandCenter() {
  const [driftAlerts, setDriftAlerts] = useState<any[]>([
    { id: 'DFT-01', type: 'COMPLIANCE_DRIFT_WARNING', component: 'feature-flags/wearables_telemetry', details: 'Feature flag configuration drifts from validated defaults.' }
  ]);

  const [federatedTrials, setFederatedTrials] = useState<any>({
    'study-oncology': { name: 'Phase III Oncology Trial', deviations: 16, subjects: 200, risk: 'LOW' },
    'study-diabetes': { name: 'Phase II Diabetes Trial', deviations: 20, subjects: 180, risk: 'MEDIUM' },
    'study-rheumatology': { name: 'Phase II Rheumatology Study', deviations: 5, subjects: 120, risk: 'LOW' }
  });

  const [safetySignals, setSafetySignals] = useState<any>({
    'Severe Headache': 4,
    'Mild Nausea': 36,
    'Mild Rash': 8
  });

  const [simulatedInquiry, setSimulatedInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [remediationsApplied, setRemediationsApplied] = useState<string[]>([]);

  const handleSimulateInquiry = (id: string) => {
    setLoading(true);
    setSimulatedInquiry(null);
    setRemediationsApplied([]);

    setTimeout(() => {
      setLoading(false);
      if (id === 'FDA') {
        setSimulatedInquiry({
          id: 'FDA-QUERY-01',
          agency: 'FDA',
          text: 'Provide cryptographic evidence verifying the immutability of the audit trails recorded during subject randomized dispensation runs.',
          remediations: [
            'Run cross_phase_verifier.js to assert seal and ledger chain continuity hashes.',
            'Export manifest-sha256.json using compliance package builder.'
          ]
        });
      } else {
        setSimulatedInquiry({
          id: 'EMA-FINDING-02',
          agency: 'EMA',
          text: 'Verify ePRO synchronization delay logs and confirm the auto-scaling response under high latency conditions.',
          remediations: [
            'Enable SLO Enforcement Engine live checking boundaries.',
            'Extract ePRO sync delay metrics records via the live metrics exporter.'
          ]
        });
      }
    }, 1500);
  };

  const applyRemediation = (action: string) => {
    if (!remediationsApplied.includes(action)) {
      setRemediationsApplied(prev => [...prev, action]);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#f3f4f6', backgroundColor: '#0b0f19', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: '#10b981', padding: '6px', borderRadius: '8px', color: '#ffffff' }}>
                <ShieldCheck size={24} />
              </span>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Autonomous Regulatory Command Center</h1>
            </div>
            <p style={{ color: '#9ca3af', marginTop: '6px', fontSize: '14px' }}>
              Multi-trial federated safety monitors, cross-system compliance drift alarms, and automated inspector query response handlers.
            </p>
          </div>
        </div>

        {/* Core Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
          
          {/* LEFT COLUMN: Federated Studies & Safety signals (8 cols) */}
          <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Trial Federation Grid */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#60a5fa" />
                Federated Clinical Trials
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {Object.keys(federatedTrials).map((studyId) => {
                  const trial = federatedTrials[studyId];
                  return (
                    <div key={studyId} style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>{trial.name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span>Total Subjects: <strong>{trial.subjects}</strong></span>
                        <span>Protocol Deviations: <strong>{trial.deviations}</strong></span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <span style={{ fontSize: '10px', color: '#6b7280' }}>Risk Profile</span>
                          <span style={{ 
                            fontSize: '10px', 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            fontWeight: 700,
                            backgroundColor: trial.risk === 'LOW' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: trial.risk === 'LOW' ? '#34d399' : '#fbbf24'
                          }}>{trial.risk}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inspection Simulator handler */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} color="#a78bfa" />
                Regulatory Inspection Query Simulator
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>
                Trigger simulated regulatory agency inquiries to test the closed-loop autonomous remediation and response planner.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button
                  onClick={() => handleSimulateInquiry('FDA')}
                  style={{ backgroundColor: '#1f2937', color: '#ffffff', padding: '10px 16px', borderRadius: '6px', border: '1px solid #374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Play size={14} color="#60a5fa" />
                  Simulate FDA Audit Inquiry
                </button>
                <button
                  onClick={() => handleSimulateInquiry('EMA')}
                  style={{ backgroundColor: '#1f2937', color: '#ffffff', padding: '10px 16px', borderRadius: '6px', border: '1px solid #374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Play size={14} color="#10b981" />
                  Simulate EMA Inspection
                </button>
              </div>

              {loading && <div style={{ fontSize: '14px', color: '#9ca3af' }}>Assembling inspection parameters...</div>}

              {simulatedInquiry && (
                <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #334155', padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Active {simulatedInquiry.agency} Query Loop ({simulatedInquiry.id})
                  </div>
                  <div style={{ fontSize: '15px', color: '#ffffff', fontWeight: 600, lineHeight: 1.4, marginBottom: '16px' }}>
                    "{simulatedInquiry.text}"
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>Remediation Responses Action Checklist:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {simulatedInquiry.remediations.map((action: string, idx: number) => {
                      const isApplied = remediationsApplied.includes(action);
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '10px 14px', borderRadius: '6px' }}>
                          <span style={{ fontSize: '13px', color: '#9ca3af' }}>{action}</span>
                          <button
                            onClick={() => applyRemediation(action)}
                            disabled={isApplied}
                            style={{
                              backgroundColor: isApplied ? 'rgba(16, 185, 129, 0.15)' : '#2563eb',
                              color: isApplied ? '#34d399' : '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              cursor: isApplied ? 'default' : 'pointer',
                              fontSize: '11px',
                              fontWeight: 600
                            }}
                          >
                            {isApplied ? 'RESOLVED' : 'APPLY'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Drift Alarms & Safety Signals (4 cols) */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Drift Alarm Panel */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertOctagon size={18} color="#dc2626" />
                Compliance Drift Detector
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {driftAlerts.map((alert, idx) => (
                  <div key={idx} style={{ borderLeft: '3px solid #dc2626', backgroundColor: '#1f2937', padding: '12px', borderRadius: '0 6px 6px 0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#f87171' }}>{alert.type}</div>
                    <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600, marginTop: '4px' }}>Component: {alert.component}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', lineHeight: 1.3 }}>{alert.details}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Signals Metadata */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} color="#fbbf24" />
                Federated Safety Monitor
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.keys(safetySignals).map((name) => {
                  const count = safetySignals[name];
                  return (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #1f2937' }}>
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>{name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '14px', color: '#ffffff' }}>{count} cases</strong>
                        {count >= 4 && (
                          <span style={{ fontSize: '9px', padding: '1px 4px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '3px' }}>
                            CORRELATED
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
