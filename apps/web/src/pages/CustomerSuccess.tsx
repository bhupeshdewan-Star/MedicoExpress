import React from 'react';

const successMetrics = [
  { company: 'Global Pharma Corp', users: 142, adoption: 94, utilization: 88, aiUsage: 12450, renewal: 99, alerts: 0 },
  { company: 'BioMed Innovations', users: 58, adoption: 82, utilization: 74, aiUsage: 4320, renewal: 85, alerts: 1 },
  { company: 'Vertex Laboratories', users: 24, adoption: 45, utilization: 30, aiUsage: 940, renewal: 40, alerts: 3 },
  { company: 'Apex Therapeutics', users: 89, adoption: 88, utilization: 81, aiUsage: 8900, renewal: 92, alerts: 0 }
];

export default function CustomerSuccess() {
  return (
    <div style={{ padding: '24px', color: '#f3f4f6', backgroundColor: '#0b0f19', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>Customer Success Dashboard</h1>
        <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Track tenant adoption indices, user engagement, SOP library utilization, and billing risk alert trends.</p>

        {/* Global summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Global Active Users</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginTop: '8px' }}>313</div>
          </div>
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Average Platform Adoption</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#60a5fa', marginTop: '8px' }}>77.2%</div>
          </div>
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Total AI Requests</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#34d399', marginTop: '8px' }}>26,610</div>
          </div>
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Accounts At Risk</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444', marginTop: '8px' }}>1 Alert</div>
          </div>
        </div>

        {/* Detailed tenant overview table */}
        <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '20px' }}>Tenant Engagement Index</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af', fontSize: '13px' }}>
                  <th style={{ padding: '12px 8px' }}>Client Organization</th>
                  <th style={{ padding: '12px 8px' }}>Active Seats</th>
                  <th style={{ padding: '12px 8px' }}>Adoption Index</th>
                  <th style={{ padding: '12px 8px' }}>SOP Utilization</th>
                  <th style={{ padding: '12px 8px' }}>Monthly AI Queries</th>
                  <th style={{ padding: '12px 8px' }}>Renewal Probability</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Active Risk Alerts</th>
                </tr>
              </thead>
              <tbody>
                {successMetrics.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1f2937', fontSize: '14px', color: '#d1d5db' }}>
                    <td style={{ padding: '16px 8px', fontWeight: 600, color: '#ffffff' }}>{m.company}</td>
                    <td style={{ padding: '16px 8px' }}>{m.users} users</td>
                    <td style={{ padding: '16px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', backgroundColor: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${m.adoption}%`, height: '100%', backgroundColor: m.adoption > 80 ? '#10b981' : m.adoption > 50 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span>{m.adoption}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 8px' }}>{m.utilization}%</td>
                    <td style={{ padding: '16px 8px' }}>{m.aiUsage} calls</td>
                    <td style={{ padding: '16px 8px', fontWeight: 600, color: m.renewal > 80 ? '#10b981' : m.renewal > 50 ? '#f59e0b' : '#ef4444' }}>{m.renewal}%</td>
                    <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 600, color: m.alerts > 0 ? '#ef4444' : '#10b981' }}>
                      {m.alerts} Alerts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
