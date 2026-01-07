import { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import './App.css';
import { sendMessage, sendAssignmentMessage, ChatMessage as ApiChatMessage, DifficultyLevel, ChatMode } from './services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function ChatApp() {
  const { user, logout } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [chatMode, setChatMode] = useState<ChatMode>('debug');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close sidebar on small screens when a message is sent
  const handleMobileSidebarClose = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    handleMobileSidebarClose();

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

      // Send the message to the appropriate endpoint based on mode
      let response;
      if (chatMode === 'debug') {
        response = await sendMessage({
          message: currentInput,
          history: history,
          difficulty: difficulty,
        });
      } else {
        // Assignment mode - send message with conversation history
        response = await sendAssignmentMessage({
          message: currentInput,
          history: history,
          difficulty: difficulty,
        });
      }
      
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
    handleMobileSidebarClose();
  };

  const handleModeChange = (newMode: ChatMode) => {
    if (newMode !== chatMode) {
      // Warn user if they have messages and are switching modes
      if (messages.length > 0) {
        const confirmSwitch = window.confirm(
          `Switching to ${newMode === 'debug' ? 'Debug' : 'Assignment'} mode will clear your current conversation. Continue?`
        );
        if (!confirmSwitch) return;
      }
      setChatMode(newMode);
      setMessages([]);
      setInput('');
    }
  };

  const getDifficultyDescription = (level: DifficultyLevel): string => {
    switch (level) {
      case 'beginner':
        return 'Just starting to code? Explanations will use simple language, provide lots of context, and include analogies to help you understand.';
      case 'intermediate':
        return 'Have some coding experience? Explanations will use standard terminology and provide balanced hints that encourage independent thinking.';
      case 'advanced':
        return 'Experienced programmer? Explanations will be concise and technical, with subtle hints that require critical thinking.';
      default:
        return '';
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile Toggle Button */}
      {!isSidebarOpen && (
        <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
      )}

      {/* Sidebar Overlay (Mobile only) */}
      {isSidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

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
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-container">
        <header className="chat-header">
          <div className="header-info">
            <h2>Learning-First.ai</h2>
          </div>
          <div className="header-controls">
            <div className="mode-selector">
              <label htmlFor="mode-select">Mode:</label>
              <div className="mode-toggle">
                <button
                  className={`mode-btn ${chatMode === 'debug' ? 'active' : ''}`}
                  onClick={() => handleModeChange('debug')}
                  disabled={loading}
                  title="Debug mode: Get hints for fixing bugs in your code"
                >
                  🐛 Debug
                </button>
                <button
                  className={`mode-btn ${chatMode === 'assignment' ? 'active' : ''}`}
                  onClick={() => handleModeChange('assignment')}
                  disabled={loading}
                  title="Assignment mode: Get conceptual help without code solutions"
                >
                  📚 Assignment
                </button>
              </div>
            </div>
            <div className="difficulty-selector">
              <label htmlFor="difficulty-select">My Level:</label>
              <select
                id="difficulty-select"
                className="difficulty-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                disabled={loading}
                title={getDifficultyDescription(difficulty)}
              >
                <option value="beginner" title="Just starting to code? Choose this for simple explanations with lots of context.">Beginner</option>
                <option value="intermediate" title="Have some coding experience? Choose this for balanced explanations with standard terminology.">Intermediate</option>
                <option value="advanced" title="Experienced programmer? Choose this for concise, technical explanations.">Advanced</option>
              </select>
              <span className="difficulty-hint" title={getDifficultyDescription(difficulty)}>ℹ️</span>
            </div>
            <div className="header-badges">
              <span className="badge secure">No Full Solutions</span>
            </div>
          </div>
        </header>

        <div className="messages-list">
          {messages.length === 0 && (
            <div className="welcome-hero">
              <div className="hero-icon">🛡️</div>
              <h1>Learning-First.ai</h1>
              {chatMode === 'debug' ? (
                <>
                  <p>I help you debug code by explaining the "why" — not giving you the answer. Paste your code, describe your bug, or ask follow-up questions.</p>
                  <div className="welcome-level-info">
                    <p className="level-info-text">
                      <strong>🐛 Debug Mode:</strong> Get hints and explanations for fixing bugs in your code. Share your code snippet and error message, and I'll guide you to understand the issue.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p>I provide conceptual help for assignments without giving code solutions. Ask about algorithms, strategies, or how to approach problems.</p>
                  <div className="welcome-level-info">
                    <p className="level-info-text">
                      <strong>📚 Assignment Mode:</strong> Get high-level guidance, conceptual explanations, and problem-solving strategies. I won't provide code solutions, but I'll help you understand how to think through the problem.
                    </p>
                  </div>
                </>
              )}
              <div className="welcome-level-info" style={{ marginTop: '1rem' }}>
                <p className="level-info-text">
                  <strong>Set your learning level</strong> in the header above to get explanations tailored to your experience. 
                  Choose <strong>Beginner</strong> for simple explanations, <strong>Intermediate</strong> for balanced guidance, 
                  or <strong>Advanced</strong> for concise technical hints.
                </p>
              </div>
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
                placeholder={chatMode === 'debug' ? "Paste your code, describe the bug, or ask a question..." : "Ask about concepts, strategies, or how to approach the problem..."}
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

export default ChatApp;
