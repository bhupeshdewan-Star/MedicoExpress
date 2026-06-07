import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Cpu, Mail } from 'lucide-react';

export default function SettingsPage() {
  const { token, activeRole } = useAuth() as any;
  const [activeTab, setActiveTab] = useState('general');
  const [, setLoading] = useState(true);

  // Form State
  const [orgName, setOrgName] = useState('ClinCommand On-Premise');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [lmStudioUrl, setLmStudioUrl] = useState('http://localhost:1234');
  const [smtpHost, setSmtpHost] = useState('localhost');
  const [smtpPort, setSmtpPort] = useState('1025');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Map settings array to state variables
        data.forEach((item: any) => {
          if (item.setting_key === 'organization_name') setOrgName(item.setting_value);
          if (item.setting_key === 'ollama_url') setOllamaUrl(item.setting_value);
          if (item.setting_key === 'lm_studio_url') setLmStudioUrl(item.setting_value);
          if (item.setting_key === 'smtp_host') setSmtpHost(item.setting_value);
          if (item.setting_key === 'smtp_port') setSmtpPort(item.setting_value);
        });
      }
    } catch (err) {
      console.warn('System settings fallback:', (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole === 'Viewer') return;

    const payload = {
      settings: {
        organization_name: orgName,
        ollama_url: ollamaUrl,
        lm_studio_url: lmStudioUrl,
        smtp_host: smtpHost,
        smtp_port: smtpPort
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Configurations parameters successfully updated on local database.');
        await fetchSettings();
      }
    } catch (err) {
      alert('Sandbox fallback: Settings configurations saved to LocalStorage.');
      localStorage.setItem('orgName', orgName);
      localStorage.setItem('ollamaUrl', ollamaUrl);
    }
  };

  const tabs = [
    { id: 'general', name: 'General Parameters', icon: Settings },
    { id: 'ai', name: 'Local AI Connectors', icon: Cpu },
    { id: 'smtp', name: 'SMTP Mail Setup', icon: Mail }
  ];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-brand-teal" />
          <span>System Settings & Node Administration</span>
        </h2>
      </div>

      <div className="flex gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="w-[200px] shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2 rounded-button text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-teal/10 text-brand-teal-dark font-bold'
                    : 'text-slate-500 hover:bg-slate-55 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Form Card */}
        <form onSubmit={handleSaveSettings} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 max-w-[600px] space-y-5">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                <Settings className="h-4 w-4 text-brand-teal" />
                <span>General Organization settings</span>
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Company / Organization name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-button text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-brand-teal" />
                <span>On-Premise AI Engines Configuration</span>
              </h3>
              <div className="p-3 bg-brand-teal/5 border border-brand-teal-light rounded-md text-xs text-brand-teal-dark leading-relaxed">
                <span>**Local Deployment Guide:** The AI Copilot routes queries to on-premise ports. If active, Llama3 models process documents contextually under data-sovereignty boundaries.</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Ollama API Engine URL</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-button text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">LM Studio Server URL</label>
                <input
                  type="text"
                  value={lmStudioUrl}
                  onChange={(e) => setLmStudioUrl(e.target.value)}
                  placeholder="http://localhost:1234"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-button text-sm font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'smtp' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-brand-teal" />
                <span>SMTP Mail Server Setup</span>
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">SMTP Host Server</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-button text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Port Number</label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-button text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeRole !== 'Viewer' && (
            <button type="submit" className="w-full py-2 bg-brand-teal hover:bg-brand-teal-dark text-white font-semibold rounded-button text-xs transition-colors">
              Save Configurations
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
