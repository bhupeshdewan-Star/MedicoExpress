import React, { useState } from 'react';
import { 
  Globe, 
  AlertOctagon, 
  FileArchive, 
  Zap, 
  Settings, 
  CheckCircle, 
  Server, 
  ShieldAlert 
} from 'lucide-react';

export default function GlobalCommandConsole() {
  const [regions, setRegions] = useState<any>({
    'ap-south-1': { name: 'Asia Pacific (Mumbai)', role: 'ACTIVE_PRIMARY', health: 100, latency: 75 },
    'us-east-1': { name: 'US East (N. Virginia)', role: 'PASSIVE_STANDBY', health: 100, latency: 120 },
    'eu-west-1': { name: 'Europe (Ireland)', role: 'PASSIVE_STANDBY', health: 100, latency: 180 }
  });

  const [activeRegion, setActiveRegion] = useState('ap-south-1');
  const [sloEnforcement, setSloEnforcement] = useState(true);
  const [killSwitches, setKillSwitches] = useState<any>({
    wearables: false,
    epro: false,
    rbm: false
  });

  const [exportLoading, setExportLoading] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);

  const handleFailover = (targetRegion: string) => {
    const updated = { ...regions };
    for (const key of Object.keys(updated)) {
      if (key === targetRegion) {
        updated[key].role = 'ACTIVE_PRIMARY';
      } else {
        updated[key].role = 'PASSIVE_STANDBY';
      }
    }
    setRegions(updated);
    setActiveRegion(targetRegion);
    console.log(`[MANUAL FAILOVER] Promoted region: ${targetRegion}`);
  };

  const handleTriggerExport = () => {
    setExportLoading(true);
    setExportResult(null);
    
    // Simulate compilation of validation reports, audit records, and metadata
    setTimeout(() => {
      setExportLoading(false);
      setExportResult({
        packageId: `PKG-STUDY-ONCOLOGY-${Math.floor(1000 + Math.random() * 9000)}`,
        generatedAt: new Date().toLocaleString(),
        status: 'EXPORT_SUCCESS',
        manifest: [
          { file: 'study_metadata.json', type: 'Administrative', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
          { file: 'audit_trail_chain.jsonl', type: 'Clinical Audit', hash: '7c6d66e748805cfd6bde88c88f11059f71c4c1a84f3cc2ea8a562ef6d8a25c11' },
          { file: 'release-validation-report.html', type: 'Installation Verification', hash: '5b1a8f6c310c149afbf5c8989f6bb92527ae41e4549b934ca485991b7852b777' },
          { file: 'incident_history_summary.json', type: 'Incident Records', hash: '4a6b8c8d20c149afbf5c8989f6bb92527ae41e4549b934ca485991b7852b888' }
        ]
      });
    }, 2000);
  };

  const toggleKillSwitch = (key: string) => {
    setKillSwitches((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div style={{ padding: '24px', color: '#f3f4f6', backgroundColor: '#0b0f19', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: '#2563eb', padding: '6px', borderRadius: '8px', color: '#ffffff' }}>
              <Globe size={24} />
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Enterprise Global Command Console</h1>
          </div>
          <p style={{ color: '#9ca3af', marginTop: '6px', fontSize: '14px' }}>
            Central administration hub for multi-region failovers, hard-gated SLO enforcement rules, and regulatory FDA/EMA compliance packaging.
          </p>
        </div>

        {/* Console Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
          
          {/* LEFT SECTION: Multi-Region Topology (8 cols) */}
          <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Regions list */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={18} color="#60a5fa" />
                Active Multi-Region Nodes
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.keys(regions).map((regionKey) => {
                  const reg = regions[regionKey];
                  const isActive = reg.role === 'ACTIVE_PRIMARY';
                  return (
                    <div 
                      key={regionKey} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        backgroundColor: '#1f2937', 
                        padding: '16px 20px', 
                        borderRadius: '8px',
                        border: `1px solid ${isActive ? '#2563eb' : '#374151'}`
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#ffffff', fontSize: '15px' }}>{reg.name}</strong>
                          <span style={{ fontFamily: 'monospace', color: '#9ca3af', fontSize: '12px' }}>({regionKey})</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: '#9ca3af' }}>
                          <span>Health: <strong style={{ color: reg.health > 80 ? '#34d399' : '#f87171' }}>{reg.health}%</strong></span>
                          <span>Latency: <strong>{reg.latency}ms</strong></span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontWeight: 700,
                          backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: isActive ? '#34d399' : '#60a5fa'
                        }}>
                          {reg.role}
                        </span>
                        
                        {!isActive && (
                          <button
                            onClick={() => handleFailover(regionKey)}
                            style={{
                              backgroundColor: '#2563eb',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#ffffff',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            Trigger Failover
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission packaging builder */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileArchive size={18} color="#a78bfa" />
                FDA eCTD Submission Packaging
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>
                Bundle clinical study metadata, GxP trace logs, and system integrity manifests into an agency-ready eCTD Module dossier.
              </p>

              <button
                onClick={handleTriggerExport}
                disabled={exportLoading}
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: exportLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Zap size={16} />
                {exportLoading ? 'Compiling Dossier Files...' : 'Compile & Build FDA eCTD Package'}
              </button>

              {exportResult && (
                <div style={{ marginTop: '24px', backgroundColor: '#1f2937', borderRadius: '8px', padding: '20px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
                    <CheckCircle size={18} />
                    EXPORT COMPLETED SUCCESSFUL (FDA eCTD Compliant)
                  </div>
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
                    Package ID: <strong style={{ color: '#ffffff' }}>{exportResult.packageId}</strong> | Export Time: {exportResult.generatedAt}
                  </div>
                  
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>Package Components Checksums (SHA-256):</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #374151' }}>
                        <th style={{ padding: '6px 0', color: '#9ca3af' }}>Dossier File</th>
                        <th style={{ padding: '6px 0', color: '#9ca3af' }}>Module Section</th>
                        <th style={{ padding: '6px 0', color: '#9ca3af' }}>SHA-256 Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportResult.manifest.map((item: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                          <td style={{ padding: '8px 0', color: '#ffffff', fontFamily: 'monospace' }}>{item.file}</td>
                          <td style={{ padding: '8px 0', color: '#9ca3af' }}>{item.type}</td>
                          <td style={{ padding: '8px 0', color: '#a78bfa', fontFamily: 'monospace' }}>{String(item.hash || 'pending-hash').substring(0, 16)}...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SECTION: Enforcement and GxP Kill Switches (4 cols) */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* SLO Enforcement */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} color="#f59e0b" />
                Live SLO Enforcement
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>Active Enforcement</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Auto-throttle on breaches</div>
                </div>
                <button
                  onClick={() => setSloEnforcement(!sloEnforcement)}
                  style={{
                    backgroundColor: sloEnforcement ? '#10b981' : '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}
                >
                  {sloEnforcement ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.4, margin: 0 }}>
                When enabled, the SLO Enforcement Engine will automatically throttle rollout traffic or scale up replicas if target latency or backlog boundaries are crossed.
              </p>
            </div>

            {/* GxP Kill Switches */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="#dc2626" />
                Feature-Specific Kill Switches
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { key: 'wearables', label: 'Wearables Telemetry Stream', desc: 'Stops IoT data ingestion logs.' },
                  { key: 'epro', label: 'ePRO Sync diary Gateway', desc: 'Locks patient mobile submissions.' },
                  { key: 'rbm', label: 'RBM AI Risk Processing', desc: 'Disables automated anomaly flags.' }
                ].map((item) => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #1f2937' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                    <button
                      onClick={() => toggleKillSwitch(item.key)}
                      style={{
                        backgroundColor: killSwitches[item.key] ? '#dc2626' : '#1f2937',
                        color: killSwitches[item.key] ? '#ffffff' : '#9ca3af',
                        border: '1px solid #374151',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {killSwitches[item.key] ? 'KILLED' : 'ACTIVE'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
