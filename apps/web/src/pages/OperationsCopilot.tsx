import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CornerDownRight 
} from 'lucide-react';

export default function OperationsCopilot() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'copilot',
      text: "Hello! I am your AI Operations Copilot for ClinCommand OS™. I monitor distributed trace graphs, SLO drifts, and incident logs. Ask me anything about the system's operational health.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const activeText = textToSend || query;
    if (!activeText.trim()) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: activeText,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    // Simulate copilot response based on keywords
    setTimeout(() => {
      let responseText = "I've analyzed the telemetry streams but couldn't find a direct correlation. Could you please refine your question?";
      const lower = activeText.toLowerCase();

      if (lower.includes('slo') || lower.includes('drop') || lower.includes('latency')) {
        responseText = "P95 response latency on `POST /api/v1/epro/sync` escalated to 245ms due to deep database locking during a batch commit. The SLO Enforcement Engine detected this breach and triggered a P1 incident warning, which initiated a preemptive container scale-up.";
      } else if (lower.includes('throttle') || lower.includes('epro')) {
        responseText = "Current ePRO ingestion delay is averaging 42 seconds (nominal). However, telemetry backlogs are rising in the ap-south-1 primary region. I recommend enabling Mode 2 Auto-Apply or reducing feature rollout to 25% to prevent queue saturation.";
      } else if (lower.includes('forecast') || lower.includes('predict') || lower.includes('outage') || lower.includes('incident')) {
        responseText = "My 5-30 minute forecast shows a 15% risk of P1 degradation on wearables telemetry. Since the queue backlog is stable at 35 items and container count is 3 replicas, no emergency actions are required at this time.";
      } else if (lower.includes('recommend') || lower.includes('optimize') || lower.includes('tuning')) {
        responseText = "Active Tuning Proposals:\n1. Decrease progressive rollout for wearables telemetry to 25% (Nominal load stabilizer)\n2. Set autoscaler base instances count from 2 to 3 replicas for tenant NovaBio due to peak regional workload.";
      }

      setMessages(prev => [...prev, {
        sender: 'copilot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const suggestions = [
    "Why did SLO drop in last 10 minutes?",
    "Should we throttle ePRO ingestion?",
    "Show recent incident forecast risk",
    "Get optimizer recommendations"
  ];

  return (
    <div style={{ padding: '24px', color: '#f3f4f6', backgroundColor: '#0b0f19', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '8fr 4fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: Chat Interface */}
        <div style={{ 
          backgroundColor: '#111827', 
          border: '1px solid #1f2937', 
          borderRadius: '12px', 
          display: 'flex', 
          flexDirection: 'column', 
          height: '75vh',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '6px', borderRadius: '8px' }}>
              <Bot size={20} />
            </span>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>AI Operations Copilot</h2>
              <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                Connected to distributed trace maps
              </span>
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{ 
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                backgroundColor: m.sender === 'user' ? '#2563eb' : '#1f2937',
                padding: '12px 16px',
                borderRadius: m.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                border: m.sender === 'user' ? 'none' : '1px solid #334155'
              }}>
                <div style={{ fontSize: '14px', lineHeight: 1.5, color: '#ffffff', whiteSpace: 'pre-wrap' }}>{m.text}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', marginTop: '6px' }}>{m.timestamp}</div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: '#1f2937', padding: '12px 16px', borderRadius: '12px 12px 12px 0', border: '1px solid #334155' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Copilot is analyzing logs...</span>
              </div>
            )}
          </div>

          {/* Footer Query Bar */}
          <div style={{ padding: '20px', borderTop: '1px solid #1f2937' }}>
            {/* Quick Suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  style={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '20px',
                    color: '#9ca3af',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Sparkles size={12} color="#60a5fa" />
                  {s}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question about SLO status, trace hops, or failovers..."
                style={{
                  flex: 1,
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff',
                  padding: '12px 16px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleSend()}
                style={{
                  backgroundColor: '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  padding: '12px',
                  cursor: 'pointer'
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Diagnostic Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SLO Trends Card */}
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#3b82f6" />
              SLO Drift Diagnostics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
                  <span>P95 Latency Drift</span>
                  <span style={{ color: '#34d399' }}>-12ms (Improving)</span>
                </div>
                <div style={{ height: '4px', backgroundColor: '#1f2937', borderRadius: '2px', marginTop: '6px' }}>
                  <div style={{ height: '100%', width: '40%', backgroundColor: '#10b981' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
                  <span>Queue Backlog Velocity</span>
                  <span style={{ color: '#fbbf24' }}>+5 items/min (Rising)</span>
                </div>
                <div style={{ height: '4px', backgroundColor: '#1f2937', borderRadius: '2px', marginTop: '6px' }}>
                  <div style={{ height: '100%', width: '65%', backgroundColor: '#f59e0b' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Card */}
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="#c084fc" />
              30-Min Incident Forecast
            </h3>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399', marginBottom: '8px' }}>15% Risk</div>
            <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.4, margin: 0 }}>
              Low outage hazard forecast. Auto-scaler and regional load pools are well-proportioned for current trial activity.
            </p>
          </div>

          {/* Optimizer Recommendations */}
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#fbbf24" />
              Tuning Suggestions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: '#e2e8f0', display: 'flex', gap: '6px' }}>
                <CornerDownRight size={14} style={{ flexShrink: 0, color: '#fbbf24' }} />
                <span>Limit wearables telemetry rollout to 25% for stability.</span>
              </div>
              <div style={{ fontSize: '12px', color: '#e2e8f0', display: 'flex', gap: '6px' }}>
                <CornerDownRight size={14} style={{ flexShrink: 0, color: '#fbbf24' }} />
                <span>Preemptively scale up to 3 replicas before peak session hours.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
