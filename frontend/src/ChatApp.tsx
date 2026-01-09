import { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import './App.css';
import { sendMessage, sendAssignmentMessage, sendWorkspaceMessage, ChatMessage as ApiChatMessage, DifficultyLevel, ChatMode } from './services/api';
import MessageContent from './components/MessageContent';
import WorkspaceView from './components/WorkspaceView';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  mode: ChatMode;
  difficulty: DifficultyLevel;
  createdAt: Date;
  updatedAt: Date;
}

function ChatApp() {
  const { user, logout } = useAuth();
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [chatMode, setChatMode] = useState<ChatMode>('workspace');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get current session
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

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
      const isDesktopWidth = window.innerWidth > 768;
      setIsDesktop(isDesktopWidth);
      if (isDesktopWidth) {
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

  const handleSubmit = async (customInput?: string, customAction?: 'debug' | 'test' | 'feature' | 'chat' | 'execute', customLanguage?: string): Promise<string | undefined> => {
    const finalInput = customInput || input.trim();
    if (!finalInput && !customInput) return;
    if (loading) return;

    // Create new session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        mode: chatMode,
        difficulty: difficulty,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSessions(prev => [newSession, ...prev]);
      sessionId = newSession.id;
      setCurrentSessionId(sessionId);
    }

    handleMobileSidebarClose();

    // Only add to history if not a background execution action
    if (customAction !== 'execute') {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: finalInput,
        timestamp: new Date(),
      };

      // Update session with user message
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          const updatedMessages = [...s.messages, userMessage];
          // Generate title from first message if it's new
          const newTitle = s.messages.length === 0 
            ? (finalInput.length > 50 ? finalInput.substring(0, 50) + '...' : finalInput)
            : s.title;
          return {
            ...s,
            messages: updatedMessages,
            title: newTitle,
            mode: chatMode,
            difficulty: difficulty,
            updatedAt: new Date(),
          };
        }
        return s;
      }));
    }

    const currentInput = finalInput;
    if (!customInput) setInput('');
    
    setLoading(true);

    try {
      // Build conversation history for the backend
      const history: ApiChatMessage[] = (sessions.find(s => s.id === sessionId)?.messages || []).map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Send the message to the appropriate endpoint based on mode
      let response;
      if (chatMode === 'assignment') {
        // Assignment mode - send message with conversation history
        response = await sendAssignmentMessage({
          message: currentInput,
          history: history,
          difficulty: difficulty,
        });
      } else {
        // Workspace mode
        // Extract code from the customInput if it's an action
        let code = '';
        let actualMessage = currentInput;
        
        if (customAction && customAction !== 'chat') {
          const codeMatch = currentInput.match(/Code:\n([\s\S]*)$/);
          if (codeMatch) {
            code = codeMatch[1];
            actualMessage = `Please ${customAction} this code.`;
          }
        }

        response = await sendWorkspaceMessage({
          code: code,
          language: customLanguage || 'javascript',
          message: actualMessage,
          history: history,
          difficulty: difficulty,
          action: (customAction as any) || 'chat'
        });
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };
      
      // Update session with assistant message (if not execute action)
      if (customAction !== 'execute') {
        setSessions(prev => prev.map(s => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: [...s.messages, assistantMessage],
              updatedAt: new Date(),
            };
          }
          return s;
        }));
      }

      return response.content;
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error: ${err.message || 'Connection failed'}. Please check if the backend server is running.`,
        timestamp: new Date(),
      };
      
      // Update session with error message (if not execute action)
      if (customAction !== 'execute') {
        setSessions(prev => prev.map(s => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: [...s.messages, errorMessage],
              updatedAt: new Date(),
            };
          }
          return s;
        }));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new chat session
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      mode: chatMode,
      difficulty: difficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setInput('');
    handleMobileSidebarClose();
  };

  // Switch to a different session
  const handleSwitchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setChatMode(session.mode);
      setDifficulty(session.difficulty);
      setInput('');
      handleMobileSidebarClose();
    }
  };


  const handleModeChange = (newMode: ChatMode) => {
    if (newMode !== chatMode) {
      // Update current session mode if it exists
      if (currentSessionId) {
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return { ...s, mode: newMode };
          }
          return s;
        }));
      }
      setChatMode(newMode);
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
      {/* Desktop Toggle Button (when sidebar is closed) */}
      {!isSidebarOpen && isDesktop && (
        <button className="desktop-toggle" onClick={() => setSidebarOpen(true)} title="Open sidebar">
          Menu
        </button>
      )}

      {/* Mobile Toggle Button */}
      {!isSidebarOpen && !isDesktop && (
        <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
          Menu
        </button>
      )}

      {/* Sidebar Overlay (Mobile only) */}
      {isSidebarOpen && !isDesktop && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src="/logo.png" alt="Learning-First.ai Logo" className="sidebar-logo-img" />
            <span className="logo-text">Learning-First.ai</span>
          </div>
          <button className="toggle-sidebar" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '<' : '>'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button className="new-session-btn" onClick={handleNewChat}>
            New Chat
          </button>
          
          {sessions.length > 0 && (
            <div className="sessions-list">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`session-item ${session.id === currentSessionId ? 'active' : ''}`}
                  onClick={() => handleSwitchSession(session.id)}
                >
                  <div className="session-title">{session.title}</div>
                  <div className="session-meta">
                    <span className="session-mode">
                      {session.mode === 'assignment' ? 'Assignment' : 'Workspace'}
                    </span>
                    <span className="session-messages">{session.messages.length} messages</span>
                  </div>
                </div>
              ))}
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
      <main className={`chat-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
        <header className="chat-header">
          <div className="header-info">
            <h2>Learning-First.ai {chatMode === 'workspace' ? '- Workspace' : ''}</h2>
          </div>
          <div className="header-controls">
            <div className="mode-selector">
              <label htmlFor="mode-select">Mode:</label>
              <div className="mode-toggle">
                <button
                  className={`mode-btn ${chatMode === 'assignment' ? 'active' : ''}`}
                  onClick={() => handleModeChange('assignment')}
                  disabled={loading}
                  title="Assignment mode: Get conceptual help without code solutions"
                >
                  Assignment
                </button>
                <button
                  className={`mode-btn ${chatMode === 'workspace' ? 'active' : ''}`}
                  onClick={() => handleModeChange('workspace')}
                  disabled={loading}
                  title="Workspace mode: Interactive code editor with incremental building"
                >
                  Workspace
                </button>
              </div>
            </div>
            <div className="difficulty-selector">
              <label htmlFor="difficulty-select">My Level:</label>
              <select
                id="difficulty-select"
                className="difficulty-select"
                value={difficulty}
                onChange={(e) => {
                  const newDifficulty = e.target.value as DifficultyLevel;
                  setDifficulty(newDifficulty);
                  // Update current session difficulty
                  if (currentSessionId) {
                    setSessions(prev => prev.map(s => {
                      if (s.id === currentSessionId) {
                        return { ...s, difficulty: newDifficulty };
                      }
                      return s;
                    }));
                  }
                }}
                disabled={loading}
                title={getDifficultyDescription(difficulty)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="header-badges">
              <span className="badge secure">No Full Solutions</span>
            </div>
          </div>
        </header>

        {chatMode === 'workspace' ? (
          <WorkspaceView
            difficulty={difficulty}
            loading={loading}
            messages={messages}
            onSendMessage={handleSubmit}
            onNewMessage={(msg) => setInput(msg)}
          />
        ) : (
          <>
            <div className="messages-list">
              {messages.length === 0 && (
            <div className="welcome-hero">
              <h1>Learning-First.ai</h1>
              <p>I provide conceptual help for assignments without giving code solutions. Ask about algorithms, strategies, or how to approach problems.</p>
              <div className="welcome-level-info">
                <p className="level-info-text">
                  <strong>Assignment Mode:</strong> Get high-level guidance, conceptual explanations, and problem-solving strategies. I won't provide code solutions, but I'll help you understand how to think through the problem.
                </p>
              </div>
              <div className="welcome-level-info" style={{ marginTop: '1rem' }}>
                <p className="level-info-text">
                  <strong>Set your learning level</strong> in the header above to get explanations tailored to your experience. 
                  Choose <strong>Beginner</strong> for simple explanations, <strong>Intermediate</strong> for balanced guidance, 
                  or <strong>Advanced</strong> for concise technical hints.
                </p>
              </div>
            </div>
              )}
              
              {            messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                <div className={`avatar ${msg.role}`}>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div className="message-content">
                    <MessageContent content={msg.content} />
                    <span className="timestamp">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="message-wrapper assistant">
                  <div className="avatar assistant">AI</div>
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
                    placeholder="Ask about concepts, strategies, or how to approach the problem..."
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
                    onClick={() => handleSubmit()} 
                    disabled={loading || !input.trim()}
                  >
                    {loading ? <div className="mini-spinner"></div> : 'Send'}
                  </button>
                </div>
                
                <div className="input-footer">
                  <p>All messages in this chat share the same context. Click "New Chat" to create a separate conversation.</p>
                </div>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

export default ChatApp;
