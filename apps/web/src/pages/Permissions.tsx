import React, { useState } from 'react';

const availablePermissions = [
  { key: 'VIEW_SOP', label: 'View SOP Registry', desc: 'Allows viewing and browsing controlled Standard Operating Procedures.' },
  { key: 'EDIT_SOP', label: 'Draft/Edit SOP', desc: 'Allows drafting and modifying SOP metadata and content fields.' },
  { key: 'APPROVE_SOP', label: 'Approve SOP', desc: 'Allows executing GxP review and approval workflows on SOP items.' },
  { key: 'VIEW_AUDITS', label: 'Access Audit Logs', desc: 'Allows viewing immutable audit trail logs and print logs.' },
  { key: 'MANAGE_USERS', label: 'SCIM User Operations', desc: 'Allows provisioning, de-activating, and updating user permissions.' },
  { key: 'MANAGE_TENANT', label: 'SaaS Tenant Controls', desc: 'Allows managing feature flags and commercial billing subscriptions.' },
  { key: 'RUN_VALIDATIONS', label: 'Trigger GxP Validation', desc: 'Allows triggering installation, operational, and performance testing suites.' },
  { key: 'SIGN_DOCUMENTS', label: '21 CFR Part 11 Signatures', desc: 'Allows executing electronic signatures carrying cryptographic hashes.' }
];

const defaultRoleMapping: Record<string, string[]> = {
  'Admin': ['VIEW_SOP', 'EDIT_SOP', 'APPROVE_SOP', 'VIEW_AUDITS', 'MANAGE_USERS', 'MANAGE_TENANT', 'RUN_VALIDATIONS', 'SIGN_DOCUMENTS'],
  'Head of Medical Affairs': ['VIEW_SOP', 'EDIT_SOP', 'APPROVE_SOP', 'SIGN_DOCUMENTS', 'RUN_VALIDATIONS'],
  'Quality Assurance': ['VIEW_SOP', 'VIEW_AUDITS', 'RUN_VALIDATIONS', 'SIGN_DOCUMENTS'],
  'Medical Manager': ['VIEW_SOP', 'EDIT_SOP', 'SIGN_DOCUMENTS']
};

export default function Permissions() {
  const [selectedRole, setSelectedRole] = useState<string>('Admin');
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(defaultRoleMapping);

  const togglePermission = (permKey: string) => {
    const activePerms = rolePermissions[selectedRole] || [];
    const updated = activePerms.includes(permKey)
      ? activePerms.filter(p => p !== permKey)
      : [...activePerms, permKey];
    
    setRolePermissions({
      ...rolePermissions,
      [selectedRole]: updated
    });
  };

  return (
    <div style={{ padding: '24px', color: '#f3f4f6', backgroundColor: '#0b0f19', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>Enterprise RBAC Permission Engine</h1>
        <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Configure granular access permissions across enterprise roles to enforce GxP validation security gates.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
          {/* Role selector panel */}
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '16px' }}>Available Roles</h3>
            {Object.keys(defaultRoleMapping).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: selectedRole === role ? '#1e293b' : 'transparent',
                  color: selectedRole === role ? '#3b82f6' : '#d1d5db',
                  fontWeight: selectedRole === role ? 600 : 400,
                  cursor: 'pointer',
                  marginBottom: '8px',
                  transition: 'all 0.2s'
                }}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Permissions mapping dashboard */}
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff' }}>Role Scope: <span style={{ color: '#3b82f6' }}>{selectedRole}</span></h2>
              <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', backgroundColor: '#1e293b', color: '#9ca3af' }}>
                {(rolePermissions[selectedRole] || []).length} of {availablePermissions.length} Active
              </span>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {availablePermissions.map((perm) => {
                const isActive = (rolePermissions[selectedRole] || []).includes(perm.key);
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #1f2937',
                      backgroundColor: isActive ? '#1e293b' : '#0b0f19',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: isActive ? '#3b82f6' : '#ffffff', marginBottom: '4px' }}>{perm.label}</div>
                      <div style={{ fontSize: '13px', color: '#9ca3af' }}>{perm.desc}</div>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: '2px solid #3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive ? '#3b82f6' : 'transparent'
                    }}>
                      {isActive && <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
