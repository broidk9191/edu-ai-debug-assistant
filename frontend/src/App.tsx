import { useState, useRef, useEffect } from 'react';
import './App.css';
import { CodeEditor } from './components/CodeEditor';
import { DebugResult } from './components/DebugResult';
import { getDebugHints, DebugResponse } from './services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string | DebugResponse;
  timestamp: Date;
}

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Send the entire user input to the backend
      // The backend can decide if it's code, a question, or both
      const data = await getDebugHints({ code: currentInput, language: 'auto' } as any);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: {
          summary: "I encountered an error while analyzing your request.",
          rootCause: err.message || "Connection failed.",
          hints: ["Please check if the backend server is running.", "Try refreshing the page."],
          reflection: ["What was happening right before the error?"]
        },
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar - "The Debug Log" */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">Learning-First.ai</span>
          </div>
          <button className="toggle-sidebar" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button className="new-session-btn" onClick={() => {
            setMessages([]);
            setInput('');
          }}>
            <span>+</span> New Chat
          </button>
          
          <div className="history-section">
            <label>Recent Sessions</label>
            {messages.filter(m => m.role === 'assistant').slice(-5).reverse().map((m, i) => (
              <div key={i} className="history-item">
                <span className="dot"></span>
                <span className="history-text">
                  {typeof m.content === 'string' ? m.content.substring(0, 30) : (m.content as DebugResponse).summary.substring(0, 30)}...
                </span>
              </div>
            ))}
            {messages.filter(m => m.role === 'assistant').length === 0 && (
              <p className="empty-history">No history yet.</p>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="mode-indicator">
            <span className="pulse"></span>
            <span>Learning Mode</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-container">
        <header className="chat-header">
          <div className="header-info">
            <h2>Assistant</h2>
          </div>
          <div className="header-badges">
            <span className="badge secure">No-Solution Policy</span>
          </div>
        </header>

        <div className="messages-list">
          {messages.length === 0 && (
            <div className="welcome-hero">
              <div className="hero-icon">🛡️</div>
              <h1>Learning-First.ai</h1>
              <p>Paste your code or ask a question. I help you debug by explaining the "why", not just the "how".</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.role}`}>
              <div className={`avatar ${msg.role}`}>
                {msg.role === 'user' ? '👤' : '🛡️'}
              </div>
              <div className="message-content">
                {typeof msg.content === 'string' ? (
                  <div className="markdown-content">
                    {msg.content.includes('```') ? (
                      <pre className="code-block"><code>{msg.content}</code></pre>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                ) : (
                  <DebugResult result={msg.content} />
                )}
                <span className="timestamp">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message-wrapper assistant">
              <div className="avatar assistant">🛡️</div>
              <div className="message-content loading-container">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
                <p className="loading-text">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Unified Chat Box */}
        <footer className="input-area">
          <div className="input-box-container shadow-xl">
            <div className="chat-input-wrapper">
              <textarea 
                className="main-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Learning-First.ai... (Paste code or ask questions)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button 
                className={`send-btn ${loading || !input.trim() ? 'disabled' : 'active'}`}
                onClick={handleSubmit} 
                disabled={loading || !input.trim()}
              >
                {loading ? <div className="mini-spinner"></div> : '↑'}
              </button>
            </div>
            
            <div className="input-footer">
              <p>Learning-First.ai can make mistakes. Verify important information.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
