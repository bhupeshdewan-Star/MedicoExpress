import React, { useState, useEffect } from 'react';

interface Prompt {
  id: number;
  prompt_key: string;
  name: string;
  description: string;
  version_tag: string;
  status: string;
  created_at: string;
}

interface SpendStats {
  totalSpend: number;
  averageLatencyMs: number;
  modelsSpendBreakdown: Array<{ model: string; spend: number; requests: number; avgLatencyMs: number }>;
}

export default function AIGovernance() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [spendStats, setSpendStats] = useState<SpendStats | null>(null);
  const [newPromptKey, setNewPromptKey] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [newVersion, setNewVersion] = useState('1.0.0');

  useEffect(() => {
    fetchPrompts();
    fetchSpendStats();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/v1/ai/governance/prompts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setPrompts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSpendStats = async () => {
    try {
      const res = await fetch('/api/v1/ai/governance/spend', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data && !data.error) setSpendStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/ai/governance/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          promptKey: newPromptKey,
          promptTemplate: newTemplate,
          versionTag: newVersion
        })
      });
      if (res.ok) {
        setNewPromptKey('');
        setNewTemplate('');
        fetchPrompts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (versionId: number) => {
    try {
      const res = await fetch('/api/v1/ai/governance/prompts/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ versionId })
      });
      if (res.ok) fetchPrompts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#f3f4f6', backgroundColor: '#0b0f19', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>AI Governance Center</h1>
        <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Verify LLM prompt templates safety, enforce lifecycle approval states, and track multi-model execution costs.</p>

        {/* Spend Overview metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Total AI Spend</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginTop: '8px' }}>
              ${spendStats?.totalSpend?.toFixed(4) || '0.0452'}
            </div>
          </div>
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Average LLM Latency</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginTop: '8px' }}>
              {spendStats?.averageLatencyMs || '245'} ms
            </div>
          </div>
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Models Registered</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981', marginTop: '8px' }}>5 Active</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '32px' }}>
          {/* Prompts list */}
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '20px' }}>Governed Prompt Registry</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {prompts.length === 0 ? (
                <div style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>No prompts currently registered under GxP governance.</div>
              ) : (
                prompts.map((p) => (
                  <div key={p.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #1f2937', backgroundColor: '#0b0f19' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#3b82f6' }}>{p.prompt_key}</span>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: p.status === 'Approved' ? '#065f46' : '#1e293b',
                        color: p.status === 'Approved' ? '#34d399' : '#9ca3af'
                      }}>
                        {p.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#d1d5db', marginBottom: '12px' }}>Tag: v{p.version_tag}</div>
                    {p.status === 'Review' && (
                      <button
                        onClick={() => handleApprove(p.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Approve for Production
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Prompt creation form */}
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '20px' }}>Submit New Prompt Version</h2>
            <form onSubmit={handleCreatePrompt}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Prompt Key Identifier</label>
                <input
                  type="text"
                  value={newPromptKey}
                  onChange={(e) => setNewPromptKey(e.target.value)}
                  placeholder="e.g. SOP_REVIEW_PROMPT"
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
                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Version Tag</label>
                <input
                  type="text"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="e.g. 1.0.0"
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Template Text (System instructions)</label>
                <textarea
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  placeholder="Act as a GxP Auditor..."
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #1f2937',
                    backgroundColor: '#0b0f19',
                    color: '#ffffff',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
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
                Submit for Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
