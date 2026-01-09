import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import MessageContent from './MessageContent';
import { DifficultyLevel, ChatMessage as ApiChatMessage, sendWorkspaceMessage } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface WorkspaceViewProps {
  difficulty: DifficultyLevel;
  onNewMessage: (msg: string) => void;
  loading: boolean;
  messages: ChatMessage[];
  onSendMessage: (message: string, action?: 'debug' | 'test' | 'feature' | 'chat' | 'execute', language?: string) => Promise<string | undefined>;
}

const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  difficulty,
  loading,
  messages,
  onSendMessage
}) => {
  const [code, setCode] = useState('// Start typing your code here...');
  const [language, setLanguage] = useState('javascript');
  const [chatInput, setChatInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  // Update terminal prompt when language changes
  useEffect(() => {
    setTerminalOutput([`${language.charAt(0).toUpperCase() + language.slice(1)} terminal initialized. Press "Run" to see output.`]);
  }, [language]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleRun = async () => {
    if (language === 'javascript') {
      setTerminalOutput(prev => [...prev, `> Running JavaScript code...`]);
      const originalLog = console.log;
      const logs: string[] = [];
      
      // Capture console.log
      console.log = (...args) => {
        logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
        originalLog(...args);
      };

      try {
        // eslint-disable-next-line no-eval
        eval(code);
        setTerminalOutput(prev => [...prev, ...logs]);
      } catch (err: any) {
        setTerminalOutput(prev => [...prev, ...logs, `Error: ${err.message}`]);
      } finally {
        console.log = originalLog;
      }
    } else {
      // For all other languages, use AI-simulated execution
      setTerminalOutput(prev => [...prev, `> Simulating ${language} execution...`]);
      const result = await onSendMessage(`Code:\n${code}`, 'execute', language);
      if (result) {
        setTerminalOutput(prev => [...prev, result]);
      } else {
        setTerminalOutput(prev => [...prev, `[System] Execution simulation failed. Please try again.`]);
      }
    }
  };

  const clearTerminal = () => {
    setTerminalOutput([`${language.charAt(0).toUpperCase() + language.slice(1)} terminal initialized. Press "Run" to see output.`]);
  };

  const handleSend = async (action: 'debug' | 'test' | 'feature' | 'chat' | 'execute' = 'chat') => {
    const message = action === 'chat' ? chatInput : `Action: ${action}\nCode:\n${code}`;
    await onSendMessage(message, action, language);
    if (action === 'chat') setChatInput('');
  };

  return (
    <div className="workspace-container">
      <div className="workspace-editor-pane">
        <div className="workspace-toolbar">
          <div className="toolbar-left">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </div>
          <div className="toolbar-right">
            <button 
              className="toolbar-btn run" 
              onClick={handleRun}
              disabled={loading}
              title="Run current code"
            >
              Run
            </button>
            <button 
              className="toolbar-btn debug" 
              onClick={() => handleSend('debug')}
              disabled={loading}
              title="Debug current code"
            >
              Debug
            </button>
            <button 
              className="toolbar-btn test" 
              onClick={() => handleSend('test')}
              disabled={loading}
              title="Suggest tests for this code"
            >
              Suggest Tests
            </button>
            <button 
              className="toolbar-btn feature" 
              onClick={() => handleSend('feature')}
              disabled={loading}
              title="Suggest next feature"
            >
              Add Feature
            </button>
          </div>
        </div>
        <div className="workspace-editor-terminal-split">
          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 10, bottom: 10 }
              }}
            />
          </div>
          <div className="terminal-wrapper">
            <div className="terminal-header">
              <span>Terminal Output</span>
              <button onClick={clearTerminal} className="clear-terminal-btn">Clear</button>
            </div>
            <div className="terminal-content">
              {terminalOutput.map((line, i) => (
                <div key={i} className="terminal-line">{line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="workspace-chat-pane">
        <div className="workspace-chat-messages">
          {messages.length === 0 ? (
            <div className="workspace-welcome">
              <h3>Interactive Workspace</h3>
              <p>Type your code on the left and build it incrementally.</p>
              <ul>
                <li><strong>Debug:</strong> Get hints for your current code.</li>
                <li><strong>Suggest Tests:</strong> AI suggests ways to test your code.</li>
                <li><strong>Add Feature:</strong> Get ideas for what to build next.</li>
              </ul>
            </div>
          ) : (
            messages.map((msg) => (
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
            ))
          )}
          {loading && (
            <div className="message-wrapper assistant">
              <div className="avatar assistant">AI</div>
              <div className="message-content loading-container">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="workspace-chat-input">
          <div className="chat-input-wrapper">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend('chat');
                }
              }}
              rows={1}
            />
            <button 
              className={`send-btn ${loading || !chatInput.trim() ? 'disabled' : 'active'}`}
              onClick={() => handleSend('chat')}
              disabled={loading || !chatInput.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceView;
