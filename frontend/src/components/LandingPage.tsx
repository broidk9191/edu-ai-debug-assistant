import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-container">
        <header className="landing-header">
          <div className="landing-logo">
            <span className="logo-icon-large">📚</span>
            <h1>Learning-First.ai</h1>
          </div>
        </header>

        <main className="landing-main">
          <section className="hero-section">
            <h2 className="hero-title">Learn to Debug Code, Not Just Fix It</h2>
            <p className="hero-subtitle">
              An AI-powered assistant that helps students understand programming errors
              through guided hints and explanations—promoting real learning over quick answers.
            </p>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🐛</div>
                <h3>Debug Mode</h3>
                <p>Get hints and explanations for fixing bugs in your code. Learn the "why" behind errors.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h3>Assignment Mode</h3>
                <p>Receive conceptual guidance for assignments without getting complete code solutions.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Personalized Learning</h3>
                <p>Choose your difficulty level—Beginner, Intermediate, or Advanced—for tailored explanations.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Academic Integrity</h3>
                <p>Built with learning-first constraints to support education, not undermine it.</p>
              </div>
            </div>

            <div className="cta-section">
              <button className="cta-button primary" onClick={() => navigate('/login')}>
                Get Started
              </button>
              <button className="cta-button secondary" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
          </section>
        </main>

        <footer className="landing-footer">
          <p>Built with Azure OpenAI & Azure AI Content Safety</p>
        </footer>
      </div>
    </div>
  );
}
