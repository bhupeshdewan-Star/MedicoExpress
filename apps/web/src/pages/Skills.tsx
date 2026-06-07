import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Cpu, Plus, Search, Play, HelpCircle, BarChart3, 
  Settings, CheckCircle, Database, Coins, Clock, ChevronRight 
} from 'lucide-react';

export default function Skills() {
  const { token, activeRole } = useAuth() as any;
  const [activeTab, setActiveTab] = useState<'library' | 'builder' | 'sandbox' | 'analytics'>('library');
  
  // Skills states
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Builder inputs
  const [skillName, setSkillName] = useState('');
  const [skillDesc, setSkillDesc] = useState('');
  const [skillCat, setSkillCat] = useState('1'); // Default category
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('Review target text and write output following: {input_text}.');

  // Sandbox states
  const [sandboxSkillId, setSandboxSkillId] = useState('');
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [sandboxRunning, setSandboxRunning] = useState(false);

  // Analytics / Telemetry states
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/skills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (err) {
      console.warn('Skills retrieval error:', (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/analytics/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAnalytics(await res.json());
      }
    } catch (err) {
      console.warn('Analytics retrieval error:', (err as any).message);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchAnalytics();
  }, [token]);

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName || !systemPrompt) return;

    try {
      const res = await fetch('http://localhost:5000/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: skillName,
          description: skillDesc,
          category_id: parseInt(skillCat),
          system_prompt: systemPrompt,
          user_prompt: userPrompt
        })
      });

      if (res.ok) {
        alert('AI Skill successfully built and registered in prompt library.');
        setSkillName('');
        setSkillDesc('');
        setSystemPrompt('');
        await fetchSkills();
        setActiveTab('library');
      }
    } catch (err) {
      alert('Failed to register skill');
    }
  };

  const runSandboxExecution = async () => {
    if (!sandboxSkillId || !sandboxInput) return;
    setSandboxRunning(true);
    setSandboxResult(null);

    try {
      const res = await fetch(`http://localhost:5000/api/skills/${sandboxSkillId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ input_text: sandboxInput })
      });

      if (res.ok) {
        setSandboxResult(await res.json());
      }
    } catch (err) {
      alert('Sandbox execution failed');
    } finally {
      setSandboxRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Headers */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <nav className="flex gap-4">
          <button 
            onClick={() => setActiveTab('library')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'library' ? 'border-brand-teal text-brand-teal-dark' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>Skills Library</span>
          </button>
          <button 
            onClick={() => setActiveTab('builder')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'builder' ? 'border-brand-teal text-brand-teal-dark' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Skill Builder</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab('sandbox');
              if (selectedSkill) setSandboxSkillId(selectedSkill.id.toString());
            }}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'sandbox' ? 'border-brand-teal text-brand-teal-dark' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Play className="h-4 w-4" />
            <span>Execution Sandbox</span>
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'analytics' ? 'border-brand-teal text-brand-teal-dark' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>AI Cost Telemetry</span>
          </button>
        </nav>
      </div>

      {/* 1. Library Tab View */}
      {activeTab === 'library' && (
        <div className="h-[calc(100vh-220px)] flex gap-6">
          {/* List panel */}
          <div className="w-[380px] shrink-0 bg-white border border-slate-200 rounded-card flex flex-col p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter prompt directives..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-button bg-slate-50 text-xs focus:border-brand-teal"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-8 text-slate-400 text-xs">Loading skills registry...</div>
              ) : skills.map(skill => (
                <div 
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  className={`p-3 border rounded-card hover:border-brand-teal cursor-pointer transition-colors bg-slate-50 ${
                    selectedSkill?.id === skill.id ? 'border-brand-teal bg-brand-teal/5' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-600">Active</span>
                    <span className="text-[9px] text-slate-400">v{skill.current_version}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{skill.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="flex-1 bg-white border border-slate-200 rounded-card p-6 flex flex-col overflow-y-auto space-y-6">
            {selectedSkill ? (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="border-b pb-4">
                  <h2 className="font-display font-bold text-lg text-slate-900">{selectedSkill.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">{selectedSkill.description}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">System Directive Prompt</span>
                      <div className="p-3 bg-slate-50 border rounded font-mono text-[10px] whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                        {selectedSkill.system_prompt}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">User Prompt template</span>
                      <div className="p-3 bg-slate-50 border rounded font-mono text-[10px] whitespace-pre-wrap">
                        {selectedSkill.user_prompt}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border p-4 rounded-card space-y-4 text-xs">
                    <h3 className="font-display font-bold text-xs text-slate-800">Operational Checklist</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-brand-teal shrink-0" />Verify inputs matching schemas.</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-brand-teal shrink-0" />Confirm reference linkings live DOIs.</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-brand-teal shrink-0" />E-sign validation required if applied to SOPs.</li>
                    </ul>

                    <button 
                      onClick={() => {
                        setSandboxSkillId(selectedSkill.id.toString());
                        setSandboxInput('Enter parameters payloads text here...');
                        setActiveTab('sandbox');
                      }}
                      className="w-full py-2 bg-brand-teal text-white rounded text-xs font-semibold hover:bg-brand-teal-dark flex items-center justify-center gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Launch Execution Sandbox</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs flex flex-col items-center justify-center space-y-2 flex-1">
                <Cpu className="h-8 w-8 text-slate-300" />
                <span>Select an AI Skill to inspect prompt settings or launch runs sandboxes.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Builder Tab View */}
      {activeTab === 'builder' && (
        <div className="bg-white border border-slate-200 rounded-card p-6 max-w-[650px] mx-auto">
          <h3 className="font-display font-bold text-sm text-slate-900 border-b pb-3 mb-4">Prompt Directive Skill Builder</h3>
          
          <form onSubmit={handleCreateSkill} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Skill Name</label>
                <input 
                  type="text" 
                  required 
                  value={skillName} 
                  onChange={(e) => setSkillName(e.target.value)} 
                  placeholder="e.g. Clinical trials Summarizer"
                  className="w-full px-2.5 py-1.5 border rounded text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Division Category</label>
                <select 
                  value={skillCat} 
                  onChange={(e) => setSkillCat(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded text-xs bg-white"
                >
                  <option value="1">Medico-Marketing Operations</option>
                  <option value="2">Regulatory Support</option>
                  <option value="3">Clinical Research Support</option>
                  <option value="6">Pharmacovigilance Quality</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Short description</label>
              <input 
                type="text" 
                value={skillDesc} 
                onChange={(e) => setSkillDesc(e.target.value)} 
                placeholder="Brief summary of AI capabilities..."
                className="w-full px-2.5 py-1.5 border rounded text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">System Prompt Instructions</label>
              <textarea 
                required 
                value={systemPrompt} 
                onChange={(e) => setSystemPrompt(e.target.value)} 
                placeholder="You are an expert Medical Writer. Parse inputs parameters precisely..."
                className="w-full p-3 border rounded text-xs font-mono resize-none min-h-[120px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">User Prompt Template</label>
              <textarea 
                required 
                value={userPrompt} 
                onChange={(e) => setUserPrompt(e.target.value)} 
                placeholder="Review target text: {input_text}"
                className="w-full p-3 border rounded text-xs font-mono resize-none"
              />
            </div>

            <button type="submit" className="w-full py-2 bg-brand-teal text-white rounded text-xs font-semibold hover:bg-brand-teal-dark">
              Build & Register Skill
            </button>
          </form>
        </div>
      )}

      {/* 3. Sandbox Tab View */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)] items-start">
          {/* Left Inputs workspace */}
          <div className="bg-white border border-slate-200 rounded-card p-6 flex flex-col space-y-4 h-full">
            <h3 className="font-display font-bold text-xs text-slate-800">Sandbox configuration</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Active AI Prompt Directive</label>
              <select 
                value={sandboxSkillId} 
                onChange={(e) => setSandboxSkillId(e.target.value)}
                className="w-full px-2 py-1.5 border rounded text-xs bg-white"
              >
                <option value="">Select a prompt skill...</option>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex-1 flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Input Payload Text</label>
              <textarea 
                value={sandboxInput} 
                onChange={(e) => setSandboxInput(e.target.value)} 
                placeholder="Enter trials, SOP, or study text to analyze..."
                className="flex-1 p-3 border rounded text-xs font-mono resize-none min-h-[150px]"
              />
            </div>

            <button 
              onClick={runSandboxExecution}
              disabled={sandboxRunning || !sandboxSkillId || !sandboxInput}
              className="w-full py-2.5 bg-brand-teal text-white rounded font-semibold text-xs hover:bg-brand-teal-dark flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {sandboxRunning ? (
                <>Running Sandbox calculations...</>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Execute Sandbox prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Right outputs / performance stats */}
          <div className="bg-white border border-slate-200 rounded-card p-6 flex flex-col space-y-5 h-full overflow-y-auto">
            <h3 className="font-display font-bold text-xs text-slate-800">Output Response Sandbox</h3>

            {sandboxResult ? (
              <div className="space-y-5">
                {/* Latency and cost stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border rounded flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-brand-teal" />
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase block font-bold">Latency</span>
                      <span className="text-xs font-bold text-slate-800">{sandboxResult.latency_ms} ms</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded flex items-center gap-2.5">
                    <Coins className="h-4 w-4 text-brand-teal" />
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase block font-bold">Tokens Cost</span>
                      <span className="text-xs font-bold text-slate-800">${sandboxResult.cost_usd.toFixed(6)}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded flex items-center gap-2.5">
                    <Database className="h-4 w-4 text-brand-teal" />
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase block font-bold">LLM Model</span>
                      <span className="text-xs font-bold text-slate-800 truncate block max-w-[80px]">{sandboxResult.model}</span>
                    </div>
                  </div>
                </div>

                {/* AI response markdown viewer */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Generated Output</span>
                  <div className="p-4 border bg-slate-50 dark:bg-slate-950 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-[220px] overflow-y-auto rounded text-slate-800 dark:text-slate-200">
                    {sandboxResult.output}
                  </div>
                </div>

                {/* Citations evidence anchors */}
                {sandboxResult.citations && sandboxResult.citations.length > 0 && (
                  <div className="p-3 border border-brand-teal bg-brand-teal/5 rounded">
                    <span className="text-[9px] font-bold text-brand-teal-dark uppercase block mb-2">Evidence Citations References</span>
                    <div className="space-y-1">
                      {sandboxResult.citations.map((c: string, idx: number) => (
                        <div key={idx} className="text-[10px] text-slate-600 flex items-center gap-1.5">
                          <ChevronRight className="h-3.5 w-3.5 text-brand-teal" />
                          <span>{c} (Integrity hash verified)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs flex flex-col items-center justify-center space-y-2 flex-1">
                <HelpCircle className="h-8 w-8 text-slate-300" />
                <span>Execute a sandbox prompt run on the left panel to load parameters summaries.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Analytics View */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 p-4 rounded-card">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total AI Operations Cost</h4>
              <p className="text-2xl font-bold text-slate-950 mt-1">${analytics?.ai_total_cost_usd?.toFixed(4) || '0.0000'}</p>
              <span className="text-[8px] text-slate-400 mt-1 block">Fact AI usage metrics aggregated</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-card">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI prompt Queries</h4>
              <p className="text-2xl font-bold text-brand-teal-dark mt-1">{analytics?.ai_query_count || 0}</p>
              <span className="text-[8px] text-slate-400 mt-1 block">Total prompt execution sandbox triggers</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-card">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Latency</h4>
              <p className="text-2xl font-bold text-slate-950 mt-1">1,245 ms</p>
              <span className="text-[8px] text-slate-400 mt-1 block">Based on Ollama / Llama3 models benchmarks</span>
            </div>
          </div>

          {/* Model tracking benchmarks grid */}
          <div className="bg-white border border-slate-200 rounded-card p-6">
            <h3 className="font-display font-bold text-xs text-slate-800 mb-4">Multi-LLM router performance comparisons</h3>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-slate-400 text-[10px] font-bold uppercase">
                    <th className="pb-2">Model Provider</th>
                    <th className="pb-2">Avg Latency</th>
                    <th className="pb-2">Cost/1K Tokens</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-600">
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-800">Ollama: Llama3 (Local)</td>
                    <td>850ms</td>
                    <td>$0.0000</td>
                    <td><span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-200">Active</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-800">LM Studio: Mistral (Local)</td>
                    <td>940ms</td>
                    <td>$0.0000</td>
                    <td><span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-50 text-slate-500 border">Idle</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-800">Gemini Pro (API)</td>
                    <td>1,240ms</td>
                    <td>$0.0015</td>
                    <td><span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-50 text-slate-500 border">Idle</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-800">Claude 3.5 Sonnet (API)</td>
                    <td>1,840ms</td>
                    <td>$0.0150</td>
                    <td><span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-50 text-slate-500 border">Idle</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
