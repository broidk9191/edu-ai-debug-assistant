import { useState, useRef, useEffect } from 'react';
import './App.css';
import { sendMessage, ChatMessage as ApiChatMessage } from './services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    const currentInput = input.trim();
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for the backend
      const history: ApiChatMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Send the new message along with history
      const response = await sendMessage({
        message: currentInput,
        history: history,
      });
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error: ${err.message || 'Connection failed'}. Please check if the backend server is running.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
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
          <button className="new-session-btn" onClick={handleNewChat}>
            <span>+</span> New Chat
          </button>
          
          {messages.length > 0 && (
            <div className="current-session">
              <div className="session-indicator">
                <span className="session-dot"></span>
                <span>Current Session</span>
              </div>
              <p className="message-count">{messages.length} messages</p>
            </div>
          )}
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
            <h2>Learning-First.ai</h2>
          </div>
          <div className="header-badges">
            <span className="badge secure">No Full Solutions</span>
          </div>
        </header>

        <div className="messages-list">
          {messages.length === 0 && (
            <div className="welcome-hero">
              <div className="hero-icon">🛡️</div>
              <h1>Learning-First.ai</h1>
              <p>I help you debug code by explaining the "why" — not giving you the answer. Paste your code, describe your bug, or ask follow-up questions.</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.role}`}>
              <div className={`avatar ${msg.role}`}>
                {msg.role === 'user' ? '👤' : '🛡️'}
              </div>
              <div className="message-content">
                <div className="markdown-content">
                  <pre className="message-text">{msg.content}</pre>
                </div>
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
          <div className="input-box-container">
            <div className="chat-input-wrapper">
              <textarea 
                ref={textareaRef}
                className="main-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Learning-First.ai..."
                rows={1}
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
              <p>All messages in this chat share the same context. Click "New Chat" to start fresh.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
