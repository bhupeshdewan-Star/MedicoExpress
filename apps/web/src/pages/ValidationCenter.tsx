import React, { useState, useEffect } from 'react';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

interface ValidationDoc {
  id: number;
  doc_type: string;
  title: string;
  content: string;
}

export default function ValidationCenter() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [documents, setDocuments] = useState<ValidationDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<ValidationDoc | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (activeProject) {
      fetchDocuments(activeProject);
    }
  }, [activeProject]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/v1/compliance/validation/projects', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
        if (data.length > 0) setActiveProject(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async (projectId: number) => {
    try {
      const res = await fetch(`/api/v1/compliance/validation/projects/${projectId}/documents`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data);
        if (data.length > 0) setActiveDoc(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/compliance/validation/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDesc
        })
      });
      if (res.ok) {
        setProjectName('');
        setProjectDesc('');
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#f3f4f6', backgroundColor: '#0b0f19', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>Validation Documentation Center</h1>
        <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Generate and audit software validation files (URS, FRS, SDS, Traceability matrices, and IQ/OQ/PQ scripts) for computer systems validation (CSV) audits.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>
          {/* Projects and Docs Navigation */}
          <div>
            {/* New project form */}
            <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '16px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '12px' }}>Create Validation Project</h3>
              <form onSubmit={handleCreateProject}>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #1f2937',
                    backgroundColor: '#0b0f19',
                    color: '#ffffff',
                    fontSize: '13px',
                    marginBottom: '8px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Generate Docs
                </button>
              </form>
            </div>

            {/* Document list accordion */}
            <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '16px' }}>Validation Artifacts</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: activeDoc?.id === doc.id ? '#1e293b' : 'transparent',
                      color: activeDoc?.id === doc.id ? '#3b82f6' : '#d1d5db',
                      fontWeight: activeDoc?.id === doc.id ? 600 : 400,
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {doc.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active document editor/viewer */}
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '32px', minHeight: '500px' }}>
            {activeDoc ? (
              <div>
                <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>{activeDoc.title}</h2>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>Type: {activeDoc.doc_type} | Version: 1.0.0</span>
                  </div>
                  <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', backgroundColor: '#065f46', color: '#34d399', fontWeight: 600 }}>
                    APPROVED
                  </span>
                </div>

                <div style={{ color: '#d1d5db', fontSize: '15px', lineHeight: 1.7, fontFamily: 'monospace', backgroundColor: '#0b0f19', padding: '20px', borderRadius: '8px', border: '1px solid #1f2937' }}>
                  {activeDoc.content}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontStyle: 'italic' }}>
                Select or create a validation project to inspect documentation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
