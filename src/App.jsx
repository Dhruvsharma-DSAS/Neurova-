import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import { 
  Sparkles, 
  Image as ImageIcon, 
  MessageSquare, 
  Eraser, 
  Download, 
  Bot, 
  User, 
  Zap,
  Loader2,
  ArrowUp,
  Cloud,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Versioning for Deployment Tracking ---
const APP_VERS = "v1.0.1";
const LAST_MOD = "April 2, 2026";

const App = () => {
  // 1. Core State
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [mode, setMode] = useState('text'); // text or image
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const chatEndRef = useRef(null);

  // 2. Clear Session Logic
  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 3. API Handlers
  const handleSend = async () => {
    if (!inputVal.trim()) return;
    
    // Using default environment API key only
    const token = import.meta.env.VITE_HF_API_KEY || "";
    
    if (!token) {
      setError("Default API key missing. Please configure VITE_HF_API_KEY in your environment setup.");
      return;
    }

    const newUserMsg = { id: Date.now(), role: 'user', type: 'text', content: inputVal };
    setMessages(prev => [...prev, newUserMsg]);
    setInputVal('');
    setIsLoading(true);
    setError(null);

    const promptHistory = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      if (mode === 'text') {
        const openai = new OpenAI({ 
          baseURL: import.meta.env.VITE_HF_TEXT_URL, 
          apiKey: token, 
          dangerouslyAllowBrowser: true 
        });
        const completion = await openai.chat.completions.create({
          model: "meta-llama/Llama-3.2-1B-Instruct:novita",
          messages: [
            { role: "system", content: "You are Neurova, a professional and highly intelligent AI assistant. Your goal is to provide concise, authoritative, and helpful insights." },
            ...promptHistory,
            { role: "user", content: inputVal }
          ],
          max_tokens: 512,
        });
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'text', content: completion.choices[0].message.content }]);
      } else {
        const response = await fetch(import.meta.env.VITE_HF_IMAGE_URL, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          },
          method: "POST",
          body: JSON.stringify({ 
            model: "stabilityai/stable-diffusion-xl-base-1.0", 
            prompt: inputVal, 
            response_format: "b64_json" 
          }),
        });
        
        if (!response.ok) throw new Error("Visualization engine failed to materialize image. Verify API limits.");
        
        const data = await response.json();
        const base64Str = data.data?.[0]?.b64_json;
        if (!base64Str) throw new Error("Received empty materialization from server.");
        
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'image', content: `data:image/png;base64,${base64Str}` }]);
      }
    } catch (err) {
      setError(err.message || "Neurova Intelligence Core Exception.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      {/* Sidebar: Simplified Navigation */}
      <aside className="sidebar">
        <header className="sidebar-brand">
          <Zap size={24} color="var(--accent-primary)" fill="var(--accent-primary)" />
          <h2 className="brand-text">Neurova</h2>
        </header>

        <section className="nav-group">
          <p className="nav-label">Modules</p>
          <button className={`nav-button ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>
            <MessageSquare size={18} /> Text Studio
          </button>
          <button className={`nav-button ${mode === 'image' ? 'active' : ''}`} onClick={() => setMode('image')}>
            <ImageIcon size={18} /> Image Studio
          </button>
        </section>

        <section className="nav-group">
          <p className="nav-label">Workspace</p>
          <button className="nav-button" onClick={handleClear}>
            <Eraser size={18} /> Clear Chat
          </button>
          <button className="nav-button" onClick={handleRefresh}>
            <RefreshCw size={18} /> Refresh Platform
          </button>
        </section>

        <footer className="sidebar-footer">
          <div className="status-badge" style={{ marginBottom: '0.75rem' }}>
             <CheckCircle2 size={12} color="#22c55e" />
             <span>Neural Core Active</span>
          </div>
          <div style={{ padding: '0 0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
             App Build: {APP_VERS}<br />
             Released: {LAST_MOD}
          </div>
        </footer>
      </aside>

      {/* Main Container */}
      <main className="chat-main">
        <div className="chat-container">
          <div className="chat-content-limit">
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', opacity: 0.6 }}>
                <Bot size={56} strokeWidth={1.5} style={{ marginBottom: '1.2rem', color: 'var(--accent-primary)' }} />
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '-0.025em' }}>Neurova AI</h1>
                <p style={{ maxWidth: 360, fontSize: '0.95rem', lineHeight: 1.6 }}>Experience a professional synthetic workspace for crystalline logic and visual manifestation.</p>
              </div>
            ) : (
              messages.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="message-box">
                  <div className={`msg-icon ${m.role === 'user' ? 'user' : 'assistant'}`}>
                    {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className="msg-text">
                    <div className="msg-label">{m.role === 'user' ? 'USER IDENTITY' : 'NEUROVA CORE'}</div>
                    {m.type === 'text' ? (
                      <div style={{ fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{m.content}</div>
                    ) : (
                      <div className="msg-img">
                        <img src={m.content} alt="Materialized Art" />
                        <div style={{ padding: '0.75rem', background: '#000', display: 'flex', justifyContent: 'flex-end' }}>
                           <button className="nav-button" style={{ width: 'auto', padding: '4px 12px', background: 'rgba(255,255,255,0.08)' }} onClick={() => {
                             const a = document.createElement('a'); a.href = m.content; a.download = `art-${Date.now()}.png`; a.click();
                           }}>
                             <Download size={14} /> EXPORT
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}

            {isLoading && (
              <div className="loading-box">
                <Loader2 size={16} className="animate-spin" />
                <span>Neurova Core Reasoning...</span>
              </div>
            )}

            {/* Error handling for missing local key in deployment */}
            {!(import.meta.env.VITE_HF_API_KEY) && (
              <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '1.5rem', borderRadius: 16, textAlign: 'center' }}>
                <AlertCircle size={32} color="#ef4444" style={{ marginBottom: '1rem', opacity: 0.6 }} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ef4444' }}>Integration Offline</h3>
                <p style={{ fontSize: '0.8rem', color: '#ef4444', opacity: 0.8 }}>Application requires environmental configuration for production synergy.</p>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', padding: '1rem', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.15)', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <AlertTriangle size={14} /> Intelligence error
                </div>
                <div style={{ fontSize: '0.9rem' }}>{error}</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Terminal */}
        <section className="input-section">
          <div className="input-wrapper">
            <input 
              type="text" 
              className="input-field"
              placeholder={mode === 'text' ? "Request reasoning from Neurova..." : "Provide visualization prompt..."}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              disabled={isLoading || !(import.meta.env.VITE_HF_API_KEY)}
            />
            <button className="send-button" onClick={handleSend} disabled={isLoading || !inputVal.trim() || !(import.meta.env.VITE_HF_API_KEY)}>
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={20} />}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.8rem', letterSpacing: '0.15em' }}>
            NEUROVA INTENDED FOR PROFESSIONAL SYNERGY // STABLE
          </p>
        </section>
      </main>

      <style>{`
        .animate-spin { animation: spin 1.5s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
