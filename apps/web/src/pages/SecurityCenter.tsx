import React from 'react';

const mockThreats = [
  { id: 1, type: 'MFA_LOCKOUT_WARN', target: 'user:training_mgr_01', details: '3 consecutive invalid TOTP attempts', severity: 'Medium', date: '2026-06-03 16:12:10' },
  { id: 2, type: 'RATE_LIMIT_EXCEEDED', target: 'ip:192.168.10.42', details: 'Triggered 145 API calls in 10s', severity: 'Low', date: '2026-06-03 14:05:32' },
  { id: 3, type: 'UNAUTHORIZED_SOP_ACCESS', target: 'user:viewer_91', details: 'Denied edit action on SOP-MA-001', severity: 'Medium', date: '2026-06-03 09:14:55' }
];

export default function SecurityCenter() {
  return (
    <div style={{ padding: '24px', color: '#f3f4f6', backgroundColor: '#0b0f19', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>Enterprise Security Center</h1>
        <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Monitor failed authentication occurrences, session states, rate-limiting, and compliance readiness mappings.</p>

        {/* Global overview metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Active Enterprise Sessions</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginTop: '8px' }}>18 Active</div>
          </div>
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Threat Incidents (24h)</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444', marginTop: '8px' }}>3 Blocked</div>
          </div>
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Compliance Readiness</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981', marginTop: '8px' }}>100% Certified</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '32px' }}>
          {/* Threats event stream */}
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '20px' }}>Active Security Alerts</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {mockThreats.map((t) => (
                <div key={t.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #1f2937', backgroundColor: '#0b0f19' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>{t.type}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{t.date}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>Target: {t.target}</div>
                  <div style={{ fontSize: '13px', color: '#9ca3af' }}>Details: {t.details}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance framework cards */}
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '20px' }}>Regulatory Mappings</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { name: 'FDA 21 CFR Part 11', desc: 'Electronic records protection controls and audit vault checks.', status: 'COMPLIANT' },
                { name: 'EU Annex 11', desc: 'Regulatory European criteria for computerized validation systems.', status: 'COMPLIANT' },
                { name: 'SOC2 Trust Criteria', desc: 'Tenant isolation verification and data security encryptions.', status: 'COMPLIANT' },
                { name: 'ISO 27001 Control A.9', desc: 'Granular permissions check scopes and SSO/SCIM integrations.', status: 'COMPLIANT' },
                { name: 'GAMP 5 Category 4', desc: 'Software validation plans, trace mappings, and testing scripts.', status: 'COMPLIANT' }
              ].map((c, idx) => (
                <div key={idx} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #1f2937', backgroundColor: '#0b0f19', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{c.desc}</div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#065f46', color: '#34d399', fontWeight: 600 }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
