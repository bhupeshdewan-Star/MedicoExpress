import React, { useState } from 'react';

interface Tenant {
  id: number;
  name: string;
  domain: string;
  status: string;
  plan: string;
}

const mockTenants: Tenant[] = [
  { id: 1, name: 'Global Pharma Corp', domain: 'globalpharma.com', status: 'ACTIVE', plan: 'Validated Enterprise' },
  { id: 2, name: 'BioMed Innovations', domain: 'biomed.io', status: 'ACTIVE', plan: 'Professional' },
  { id: 3, name: 'Vertex Laboratories', domain: 'vertexlabs.com', status: 'SUSPENDED', plan: 'Starter' },
  { id: 4, name: 'Apex Therapeutics', domain: 'apexthera.com', status: 'PILOT', plan: 'Professional' }
];

export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantDomain, setNewTenantDomain] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState('Starter');

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const newTenant: Tenant = {
      id: tenants.length + 1,
      name: newTenantName,
      domain: newTenantDomain,
      status: 'ACTIVE',
      plan: newTenantPlan
    };
    setTenants([...tenants, newTenant]);
    setNewTenantName('');
    setNewTenantDomain('');
  };

  const toggleStatus = (id: number) => {
    setTenants(tenants.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  return (
    <div style={{ padding: '24px', color: '#f3f4f6', backgroundColor: '#0b0f19', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>Tenant Lifecycle Management</h1>
        <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Provision new client environments, toggle status flags (Active, Suspended, Archived), and configure SaaS billing mappings.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
          {/* Tenant registry table */}
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '20px' }}>Active SaaS Tenants</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af', fontSize: '13px' }}>
                    <th style={{ padding: '12px 8px' }}>Organization</th>
                    <th style={{ padding: '12px 8px' }}>Domain</th>
                    <th style={{ padding: '12px 8px' }}>Pricing Plan</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #1f2937', fontSize: '14px', color: '#d1d5db' }}>
                      <td style={{ padding: '16px 8px', fontWeight: 600, color: '#ffffff' }}>{t.name}</td>
                      <td style={{ padding: '16px 8px' }}>{t.domain}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#1e293b', color: '#60a5fa' }}>
                          {t.plan}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: t.status === 'ACTIVE' ? '#10b981' : t.status === 'SUSPENDED' ? '#ef4444' : '#f59e0b'
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                        <button
                          onClick={() => toggleStatus(t.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: t.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                            backgroundColor: 'transparent',
                            color: t.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Provisioning form */}
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '20px' }}>Provision New Tenant</h2>
            <form onSubmit={handleCreateTenant}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Company Name</label>
                <input
                  type="text"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  placeholder="e.g. Helix Bio"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #1f2937',
                    backgroundColor: '#0b0f19',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Corporate Domain</label>
                <input
                  type="text"
                  value={newTenantDomain}
                  onChange={(e) => setNewTenantDomain(e.target.value)}
                  placeholder="e.g. helixbio.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #1f2937',
                    backgroundColor: '#0b0f19',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Pricing tier</label>
                <select
                  value={newTenantPlan}
                  onChange={(e) => setNewTenantPlan(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #1f2937',
                    backgroundColor: '#0b0f19',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                >
                  <option value="Starter">Starter Plan</option>
                  <option value="Professional">Professional Plan</option>
                  <option value="Enterprise">Enterprise Plan</option>
                  <option value="Validated Enterprise">Validated Enterprise Plan</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Provision Organization
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
