import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import { 
  SendHorizonal, 
  Sparkles, 
  Image as ImageIcon, 
  MessageSquare, 
  Eraser, 
  Download, 
  Copy, 
  Bot, 
  User, 
  Zap,
  Loader2,
  Lock,
  ArrowUp,
  Cloud,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ZapOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ⚙️ DEPLOYMENT & VERSION CONFIG ---
const APP_VERSION = "v1.0.1";
const LAST_UPDATED = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const App = () => {
  // 1. Data States
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [mode, setMode] = useState('text'); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 2. Refresh Logic
  const handleRefresh = () => {
    window.location.reload();
  };

  // 3. API Key Fallback check
  const getSafeApiKey = () => {
    return import.meta.env.VITE_HF_API_KEY || "";
  };

  // 4. API Handlers
  const handleSend = async () => {
    if (!inputVal.trim()) return;
    
    const activeKey = getSafeApiKey();
    
    // ERROR HANDLING: If API key missing in production
    if (!activeKey) {
      setError("App not configured. Please set API key.");
      return;
    }

    const newUserMsg = { id: Date.now(), role: 'user', type: 'text', content: inputVal };
    setMessages(prev => [...prev, newUserMsg]);
    setInputVal('');
    setIsLoading(true);
    setError(null);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      if (mode === 'text') {
        const openai = new OpenAI({ 
          baseURL: import.meta.env.VITE_HF_TEXT_URL, 
          apiKey: activeKey, 
          dangerouslyAllowBrowser: true 
        });
        const response = await openai.chat.completions.create({
          model: "meta-llama/Llama-3.2-1B-Instruct:novita",
          messages: [
            { role: "system", content: "You are Neurova, a professional and intelligent AI assistant." },
            ...history,
            { role: "user", content: inputVal }
          ],
          max_tokens: 512,
        });
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'text', content: response.choices[0].message.content }]);
      } else {
        const response = await fetch(import.meta.env.VITE_HF_IMAGE_URL, {
          headers: { 
            Authorization: `Bearer ${activeKey}`, 
            "Content-Type": "application/json" 
          },
          method: "POST",
          body: JSON.stringify({ 
            model: "stabilityai/stable-diffusion-xl-base-1.0", 
            prompt: inputVal, 
            response_format: "b64_json" 
          }),
        });
        
        if (!response.ok) throw new Error("Materialization failed. Verify your connection/API limit.");
        
        const result = await response.json();
        const base64 = result.data?.[0]?.b64_json;
        if (!base64) throw new Error("Invalid response from intelligence provider.");
        
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'image', content: `data:image/png;base64,${base64}` }]);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      {/* Sidebar Section */}
      <aside className="sidebar">
        <header className="sidebar-brand">
          <Zap size={24} color="var(--accent-primary)" fill="var(--accent-primary)" />
          <h2 className="brand-text">Neurova</h2>
        </header>

        <section className="nav-group">
          <p className="nav-label">Modules</p>
          <button className={`nav-button ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>
            <MessageSquare size={18} /> Text Assistant
          </button>
          <button className={`nav-button ${mode === 'image' ? 'active' : ''}`} onClick={() => setMode('image')}>
            <ImageIcon size={18} /> Image Generator
          </button>
        </section>

        <section className="nav-group">
          <p className="nav-label">Controls</p>
          <button className="nav-button" onClick={() => setMessages([])}>
            <Eraser size={18} /> Clear Session
          </button>
          <button className="nav-button" onClick={handleRefresh}>
            <RotateCw size={18} /> Check for Updates
          </button>
        </section>

        {/* --- VERSION & STATUS FOOTER --- */}
        <footer className="sidebar-footer">
          <div className="status-badge" style={{ marginBottom: '0.75rem' }}>
             <CheckCircle2 size={12} color="#22c55e" />
             <span>Core Online // {APP_VERSION}</span>
          </div>
          <div style={{ padding: '0 0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
             Latest version deployed<br />
             Updated: {LAST_UPDATED}
          </div>
        </footer>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <div className="chat-container">
          <div className="chat-content-limit">
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', opacity: 0.6 }}>
                <Bot size={64} strokeWidth={1} style={{ marginBottom: '1.5rem' }} />
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Neurova AI</h1>
                <p style={{ maxWidth: 400 }}>Experience next-gen synthetic reasoning and visual manifestation.</p>
              </div>
            ) : (
              messages.map((m) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className="message-row">
                  <div className="message-box">
                    <div className={`msg-icon ${m.role === 'user' ? 'user' : 'assistant'}`}>
                      {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className="msg-text">
                      <div className="msg-label">{m.role === 'user' ? 'You' : 'Neurova'}</div>
                      {m.type === 'text' ? (
                        <div>{m.content}</div>
                      ) : (
                        <div className="msg-img">
                          <img src={m.content} alt="Materialized Vision" />
                          <div style={{ padding: '0.5rem', background: '#000', textAlign: 'right' }}>
                            <button className="nav-button" style={{ width: 'auto', display: 'inline-flex', padding: '4px 10px' }} onClick={() => {
                              const a = document.createElement('a'); a.href = m.content; a.download = `art-${Date.now()}.png`; a.click();
                            }}>
                              <Download size={14} /> Download
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
             )}

            {isLoading && (
              <div className="loading-box">
                <Loader2 size={16} style={{ animation: 'spin 2s linear infinite' }} />
                <span>{mode === 'text' ? "Neurova is reasoning..." : "Manifesting vision..."}</span>
              </div>
            )}

            {!getSafeApiKey() && (
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', padding: '1.5rem', borderRadius: 16, border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                <ZapOff size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>Core Integration Offline</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>App not configured. Please set API key in environment.</p>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', padding: '1rem', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={14} /> System alert
                </div>
                {error}
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
              placeholder={mode === 'text' ? "Message Neurova AI..." : "Describe a visualization..."}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              disabled={isLoading || !getSafeApiKey()}
            />
            <button className="send-button" onClick={handleSend} disabled={isLoading || !inputVal.trim() || !getSafeApiKey()}>
              {isLoading ? <Loader2 size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> : <ArrowUp size={20} />}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.8rem', letterSpacing: '0.1em' }}>
            NEUROVA INTENDED FOR PROFESSIONAL SYNERGY
          </p>
        </section>
      </main>

      {/* --- Toast Feedback --- */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="toast-box">
            <CheckCircle2 size={16} color="var(--accent-primary)" />
            <span>Operational status verified</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
