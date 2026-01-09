import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-logo">
          <img src="/logo.png" alt="Learning-First.ai Logo" className="nav-logo-img" />
          <span>Learning-First.ai</span>
        </div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate('/login')}>Login</button>
          <button className="nav-btn primary" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </nav>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Master Coding through <span className="highlight">Guided Discovery</span>
            </h1>
            <p className="hero-subtitle">
              The AI-powered interactive workspace that refuses to give you the answer, 
              so you can learn to find it yourself. Built for students who want to truly understand.
            </p>
            <div className="hero-cta">
              <button className="hero-btn primary" onClick={() => navigate('/login')}>
                Start Learning Now
              </button>
              <button className="hero-btn secondary" onClick={() => navigate('/login')}>
                Watch Demo
              </button>
            </div>
          </div>
          <div className="hero-image">
            <img src="/logo.png" alt="Learning-First AI" className="hero-logo-large" />
          </div>
        </section>

        <section className="modes-section">
          <h2 className="section-title">Two Paths to Understanding</h2>
          <div className="modes-grid">
            <div className="mode-card">
              <div className="mode-header">
                <span className="mode-label">Interactive</span>
                <h3>Workspace</h3>
              </div>
              <p>
                A professional code editor with an integrated terminal. Build your code 
                incrementally with AI-powered test suggestions, debugging hints, and 
                next-step guidance.
              </p>
              <ul className="mode-features">
                <li>Run JS, Python, Java, and more</li>
                <li>AI-Simulated Terminal Output</li>
                <li>Guided Debugging Hints</li>
              </ul>
            </div>

            <div className="mode-card">
              <div className="mode-header">
                <span className="mode-label">Conceptual</span>
                <h3>Assignment Help</h3>
              </div>
              <p>
                Get high-level strategies and conceptual explanations for your 
                assignments. Our AI is hard-wired to maintain academic integrity 
                by never providing code solutions.
              </p>
              <ul className="mode-features">
                <li>Algorithmic Thinking Paths</li>
                <li>Conceptual Deep-Dives</li>
                <li>Reflective Learning Questions</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="values-section">
          <div className="value-item">
            <h4>Pedagogy First</h4>
            <p>Built on the Socratic method to encourage critical thinking and self-reliance.</p>
          </div>
          <div className="value-item">
            <h4>No Shortcuts</h4>
            <p>Designed to prevent academic misuse while maximizing actual skill development.</p>
          </div>
          <div className="value-item">
            <h4>Pro Experience</h4>
            <p>A streamlined environment that mirrors real-world development workflows.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/logo.png" alt="Logo" className="footer-logo-img" />
            <span>Learning-First.ai</span>
          </div>
          <p>© 2026 Learning-First.ai. Pioneering Ethical EdTech.</p>
          <div className="footer-badges">
            <span className="badge">Azure OpenAI</span>
            <span className="badge">Content Safety</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
