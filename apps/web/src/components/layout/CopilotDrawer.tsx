import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send, X, Bot, AlertTriangle } from 'lucide-react';

export default function CopilotDrawer({ isOpen, onClose }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', text: 'Hello, I am your ClinCommand AI copilot. Ask for a product appraisal, slide deck, literature review, protocol synopsis, regulatory response, SOP check, or evidence-grounded medical draft.', model: 'ClinCommand Activity Orchestrator' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userText })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'ai', text: data.response, model: data.model }]);
      } else {
        throw new Error('AI Server offline');
      }
    } catch (err) {
      // Last-resort browser fallback if the governed API is unavailable.
      setTimeout(() => {
        const queryLower = userText.toLowerCase();
        let reply = '';
        if (queryLower.includes('product appraisal') || queryLower.includes('appraisal')) {
          reply = `### Product Appraisal Intake Needed\nI can generate a molecule-specific appraisal, but the governed API is currently unavailable from this browser session.\n\nPlease provide: molecule, indication, geography, target audience, competitors, SOP, skill set, and source evidence. Once the API is reachable, I will produce a structured appraisal with molecule context, SWOT, claim-source plan, evidence gaps, and review workflow.`;
        } else if (queryLower.includes('slide deck') || queryLower.includes('presentation')) {
          reply = `### Slide Deck Intake Needed\nI can create a scientific deck storyboard once the governed API is reachable.\n\nPlease provide: molecule, indication, audience, slide count, objective, SOP, skill set, and evidence pack.`;
        } else if (queryLower.includes('sop') || queryLower.includes('code')) {
          reply = `### SOP Search Request\nThe browser fallback cannot validate repository records by itself. Ask again after the API reconnects, or open the SOP Repository to search the validated SOP index.`;
        } else {
          reply = `### AI Copilot API Unavailable\nI received: "${userText}". The local browser fallback will not invent clinical claims. Reconnect the governed API and I will route this through the activity-specific AI engine.`;
        }
        setMessages(prev => [...prev, { role: 'ai', text: reply, model: 'Browser safety fallback' }]);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-900 shadow-2xl z-50 flex flex-col transition-transform duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-brand-teal" />
          <span className="font-display font-semibold text-slate-900 dark:text-slate-100">ClinCommand AI Copilot</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-brand-teal text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200'}`}>
              <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
            </div>
            {msg.model && (
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                Engine: {msg.model}
              </span>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="animate-spin h-4 w-4 border-2 border-brand-teal border-t-transparent rounded-full"></span>
            AI is thinking...
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 dark:border-slate-900 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot or search SOPs..."
          className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-900 rounded-button bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 focus:border-brand-teal"
        />
        <button type="submit" disabled={loading} className="p-2 bg-brand-teal text-white rounded-button hover:bg-brand-teal-dark transition-colors">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
