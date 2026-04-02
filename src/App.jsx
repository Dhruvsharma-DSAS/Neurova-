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
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  // 1. Data States
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [mode, setMode] = useState('text'); // text or image
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 2. Dual API States (Default vs User)
  const [apiMode, setApiMode] = useState(localStorage.getItem('api_mode') || 'default');
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('user_api_key') || '');
  const [showToast, setShowToast] = useState(false);

  const chatEndRef = useRef(null);

  // 3. API Logic
  const getApiKey = () => {
    if (apiMode === 'user') return userApiKey;
    return import.meta.env.VITE_HF_API_KEY;
  };

  const saveUserKey = () => {
    localStorage.setItem('user_api_key', userApiKey);
    localStorage.setItem('api_mode', 'user');
    setApiMode('user');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 4. API Handlers
  const handleSend = async () => {
    if (!inputVal.trim()) return;
    
    const activeKey = getApiKey();
    if (!activeKey) {
      setError("API Authorization required. Configure in the sidebar.");
      return;
    }

    const newUserMsg = { id: Date.now(), role: 'user', type: 'text', content: inputVal };
    setMessages(prev => [...prev, newUserMsg]);
    setInputVal('');
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'text') {
        const openai = new OpenAI({ 
          baseURL: import.meta.env.VITE_HF_TEXT_URL, 
          apiKey: activeKey, 
          dangerouslyAllowBrowser: true 
        });
        const response = await openai.chat.completions.create({
          model: "meta-llama/Llama-3.2-1B-Instruct:novita",
          messages: [{ role: "system", content: "You are Neurova, a professional and intelligent AI assistant." }, ...messages.map(m => ({ role: m.role, content: m.content })), { role: "user", content: inputVal }],
          max_tokens: 512,
        });
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'text', content: response.choices[0].message.content }]);
      } else {
        const response = await fetch(import.meta.env.VITE_HF_IMAGE_URL, {
          headers: { Authorization: `Bearer ${activeKey}`, "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({ model: "stabilityai/stable-diffusion-xl-base-1.0", prompt: inputVal, response_format: "b64_json" }),
        });
        if (!response.ok) throw new Error("Image materialize failed. Verify API key.");
        const result = await response.json();
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'image', content: `data:image/png;base64,${result.data[0].b64_json}` }]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      {/* --- Sidebar Section --- */}
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
        </section>

        {/* --- API Settings Section --- */}
        <section className="api-card">
          <p className="nav-label" style={{ marginBottom: '1rem', color: '#fff' }}>API Settings</p>
          <div className="api-toggle">
            <button className={`toggle-opt ${apiMode === 'default' ? 'active' : ''}`} onClick={() => { setApiMode('default'); localStorage.setItem('api_mode', 'default'); }}>
              Default
            </button>
            <button className={`toggle-opt ${apiMode === 'user' ? 'active' : ''}`} onClick={() => { setApiMode('user'); localStorage.setItem('api_mode', 'user'); }}>
              My Key
            </button>
          </div>

          <AnimatePresence>
            {apiMode === 'user' ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                <input 
                  type="password" 
                  placeholder="hf_..." 
                  className="api-input"
                  value={userApiKey} 
                  onChange={(e) => setUserApiKey(e.target.value)}
                />
                <button className="api-save-btn" onClick={saveUserKey}>Save & Use</button>
              </motion.div>
            ) : (
              <span className="api-status">Using Standard AI Key</span>
            )}
          </AnimatePresence>
        </section>
      </aside>

      {/* --- Chat Interface Section --- */}
      <main className="chat-main">
        <div className="chat-container">
          <div className="chat-content-limit">
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', opacity: 0.6 }}>
                <Bot size={64} strokeWidth={1} style={{ marginBottom: '1.5rem' }} />
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Neurova AI</h1>
                <p style={{ maxWidth: 400 }}>A minimal and balanced synthetic laboratory for text reasoning and visual manifestation.</p>
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

        {/* --- Floating Input Dock --- */}
        <section className="input-section">
          <div className="input-wrapper">
            <input 
              type="text" 
              className="input-field"
              placeholder={mode === 'text' ? "Message Neurova AI..." : "Describe a visualization..."}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              disabled={isLoading}
            />
            <button className="send-button" onClick={handleSend} disabled={isLoading || !inputVal.trim()}>
              {isLoading ? <Loader2 size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> : <ArrowUp size={20} />}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
            NEUROVA INTENDED FOR PROFESSIONAL SYNERGY
          </p>
        </section>
      </main>

      {/* --- Toast Feedback --- */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="toast-box">
            <CheckCircle2 size={16} color="var(--accent-primary)" />
            <span>API credentials updated</span>
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
