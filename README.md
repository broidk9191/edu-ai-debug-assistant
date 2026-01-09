# Learning-First AI Debug Assistant

**Developed by Henry Lo and Dennis Wu**

## Overview

The Learning-First AI Debug Assistant is an education-focused AI tool designed to help students understand programming errors and build code incrementally without directly providing full solutions. Unlike general-purpose AI tools, this system enforces learning-oriented constraints to promote critical thinking and maintain academic integrity.

The project targets introductory computer science students who want help debugging their code and building features incrementally while still learning how and why errors occur.

---

## Problem Statement

Many students use general-purpose AI tools for debugging and coding, but these tools often:

- Provide complete solutions  
- Encourage copy-paste behavior  
- Undermine learning and academic integrity  
- Don't support incremental, test-driven development

Educators, meanwhile, struggle to balance AI accessibility with responsible use.

This project aims to bridge that gap.

---

## Solution

This project introduces a constrained AI assistant that:

- Explains why a bug occurs instead of fixing it outright  
- Provides guided hints rather than full answers  
- Uses reflective questions to encourage student reasoning  
- Refuses requests for complete solutions  
- Supports incremental code building with an interactive workspace
- Maintains conversation context for follow-up questions
- Provides a terminal environment for testing and running code

The system is intentionally designed to support learning, not shortcut it.

---

## Key Differentiators from ChatGPT

- **Learning-first constraints:** Prevents full corrected code output.  
- **Structured responses:** Hints + reflection questions instead of answers.  
- **Pedagogical focus:** Encourages reasoning and debugging skills.  
- **Difficulty customization:** Adapts explanations to student's learning level (beginner/intermediate/advanced).  
- **Interactive workspace:** Integrated code editor and terminal for incremental building and testing.  
- **Mode clarity:** Explicit Assignment vs Workspace modes for clear user understanding.  
- **Responsible AI enforcement:** Academic misuse detection built in.  
- **Conversational memory:** Remembers context within a session for follow-up questions (both modes).  

---

## Microsoft AI Services Used (Requirement Compliance)

This project requires and integrates Microsoft AI services:

### 1. Azure OpenAI Service
Used as the reasoning engine for:
- Code understanding  
- Error explanation  
- Guided debugging output  
- Multi-turn conversational responses
- Terminal output simulation (for non-JavaScript languages)

### 2. Azure AI Content Safety
Used for:
- Academic misuse detection  
- Refusal logic + redirection triggers  
- Safety filtering for responsible AI use  

### 3. Microsoft Foundry
Used for:
- Experimenting with alternative model backends and private models during research.
- Routing requests for telemetry, model comparison, and governance in experimental runs.

These combined services enable a safe, learning-first debugging and coding assistant.

---

## Project Status

### **Phase 1 — Prompt Design & Validation ✔ Completed**

Achievements:  
- Debug Prompt v1 + Assignment Help Prompt v1 + Workspace Prompt v1 complete  
- Prompt behavior validated against ChatGPT baseline  
- Academic misuse refusal behavior tested  
- Documentation + repo structure initialized  

Results stored in:  
`/prompts/` + `/validation/`

---

### **Phase 2 — MVP Implementation ✅ Completed**

**Delivered Features:**

✅ **Backend API** (`/backend`)
- RESTful API with `/api/assignment` and `/api/workspace` endpoints
- Conversational mode with full chat history support (both endpoints)
- **Difficulty level support**: Tailors responses to beginner/intermediate/advanced levels
- Azure OpenAI integration with prompt management
- Azure AI Content Safety integration
- Authentication system (email/password + Google OAuth)
- JWT-based session management
- Rate limiting (20 requests/minute per IP)
- CORS protection with configurable origins
- Request size limits (1MB max)
- Error handling and logging

✅ **Frontend UI** (`/frontend`)
- Modern React + TypeScript chat interface
- Dark mode design with Learning-First.ai branding
- Professional landing page with logo integration
- **Mode selector**: Choose between Assignment and Workspace modes
- **Workspace mode**: Interactive code editor with Monaco Editor
  - Multi-language support (JavaScript, Python, Java, C++, and more)
  - Integrated terminal for code execution
  - Action buttons: Debug, Suggest Tests, Add Feature, Chat, Execute
  - Local JavaScript execution and AI-simulated execution for other languages
- **Assignment mode**: Conceptual help without code solutions
- **Difficulty level customization**: Beginner, Intermediate, Advanced
- **Multi-session chat**: Separate chat histories per session
- Conversation memory within sessions (both modes)
- VS Code-style code editor view for AI responses
- Syntax highlighting and code formatting
- Auto-resizing input
- Loading states and error handling
- Metadata stripping (developer info hidden from users)
- Session management (New Chat button)
- Mobile-responsive design (works across all platforms)
- Enhanced UX with tooltips and clear mode descriptions

✅ **Security & Production Features**
- Rate limiting to prevent abuse
- CORS configuration for production deployment
- Request size validation
- Environment variable management
- Production-ready error messages
- JWT token-based authentication
- Google OAuth integration
- Secure password hashing (bcrypt)

---

### **Phase 3 — User Testing & Iteration ✔ Completed**

Achievements:  
- User testing conducted with CS students and professors
- Feedback collected on interactive code creation and incremental development
- **Interactive Workspace feature implemented** based on user feedback:
  - Incremental code building (start simple, add features incrementally)
  - Interactive code editor with Monaco Editor
  - Integrated terminal for testing and execution
  - Test suggestion capabilities (AI-powered test recommendations)
  - Support for multiple programming languages
  - Real-time code execution and debugging
- User feedback incorporated into Workspace mode design
- UI/UX improvements based on testing sessions

Key User Feedback Addressed:
- Students need ability to explore code interactively (not just paste)
- Incremental building is preferred over full solutions
- Test suggestions help students learn proper testing practices
- Terminal integration enables immediate feedback loop

---

## Planned Roadmap

- Phase 4: Deployment + Imagine Cup submission build  
- Phase 5: Analytics, feedback loops, reflection metrics  
- Phase 6: Database integration for persistent storage (PostgreSQL/MongoDB)
- Phase 7: Session persistence across page refreshes

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Azure OpenAI Service account
- Azure AI Content Safety account
- (Optional) Google OAuth credentials for Google Sign-In

### Local Development

**1. Clone the repository:**
```bash
git clone <your-repo-url>
cd edu-ai-debug-assistant
```

**2. Backend Setup:**
```bash
cd backend
npm install
```

Create a `.env` file:
```env
# Server Configuration
PORT=3000
HOST=0.0.0.0

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173

# Production mode (hides detailed error messages)
NODE_ENV=development

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-05-01-preview

# Azure AI Content Safety Configuration (REQUIRED)
AZURE_CONTENT_SAFETY_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_CONTENT_SAFETY_API_KEY=your-content-safety-api-key

# JWT Secret (for authentication)
JWT_SECRET=your-secret-key-change-in-production

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Start backend:
```bash
npm run dev
```

**3. Frontend Setup:**
```bash
cd frontend
npm install
```

Create a `.env` file:
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id  # Optional
```

Start frontend:
```bash
npm run dev
```

**4. Open in browser:**
Navigate to `http://localhost:5173` (or the port shown in the terminal)

---

## Repository Structure

```
edu-ai-debug-assistant/
├── backend/              # Node.js + TypeScript API server
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   │   ├── assignment.ts
│   │   │   ├── workspace.ts
│   │   │   └── auth.ts
│   │   ├── services/     # OpenAI & Content Safety integration
│   │   │   ├── openai.ts
│   │   │   ├── contentSafety.ts
│   │   │   └── auth.ts
│   │   └── middleware/   # Authentication middleware
│   └── README.md         # Backend documentation
├── frontend/             # React + TypeScript web app
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── ChatApp.tsx
│   │   │   ├── WorkspaceView.tsx
│   │   │   ├── MessageContent.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── contexts/     # React contexts
│   │   │   └── AuthContext.tsx
│   │   └── services/     # API client
│   │       └── api.ts
│   ├── public/
│   │   └── logo.png      # Startup logo
│   └── README.md         # Frontend documentation
├── prompts/              # System prompts for AI
│   ├── assignment_help_prompt_v1.md
│   ├── workspace_prompt_v1.md
│   └── debug_prompt_v1.md  # Legacy (for reference)
├── validation/           # Phase 1 test results
│   └── prompt_comparison.md
└── doc/                  # Project documentation
    └── Project General Proposal.pdf
```

---

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- React Router (routing)
- Monaco Editor (@monaco-editor/react) for code editing
- React Syntax Highlighter for code display
- @react-oauth/google (Google OAuth)
- Modern CSS with dark mode

**Backend:**
- Node.js + Express + TypeScript
- Azure OpenAI SDK
- Azure AI Content Safety API
- jsonwebtoken (JWT authentication)
- bcryptjs (password hashing)
- google-auth-library (Google OAuth)
- express-rate-limit (rate limiting)
- CORS middleware
- dotenv (environment variables)

**Deployment:**
- Frontend: Vercel/Netlify/Azure Static Web Apps
- Backend: Azure App Service/Railway/Render

---

## API Endpoints

### POST `/api/assignment`
Assignment help (conceptual guidance only) with conversational history and difficulty customization.

**Request:**
```json
{
  "message": "How do I approach this problem?",
  "history": [
    { "role": "user", "content": "I need to..." },
    { "role": "assistant", "content": "Start by..." }
  ],
  "difficulty": "beginner" | "intermediate" | "advanced" (optional)
}
```

**Response:**
```json
{
  "content": "Conceptual guidance tailored to difficulty level...",
  "metadata": { "safety_decision": "allow", ... }
}
```

### POST `/api/workspace`
Interactive workspace for incremental code building, debugging, testing, and execution.

**Request:**
```json
{
  "code": "function calculateTotal(items) { ... }",
  "language": "javascript",
  "message": "Why is this not working?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "difficulty": "beginner" | "intermediate" | "advanced" (optional),
  "action": "debug" | "test" | "feature" | "chat" | "execute"
}
```

**Response:**
```json
{
  "content": "Structured guidance or raw terminal output (for execute action)...",
  "metadata": { "safety_decision": "allow", ... }
}
```

**Actions:**
- `debug`: Analyze code and provide hints for bugs
- `test`: Suggest test cases to try
- `feature`: Suggest next incremental feature to add
- `chat`: Answer conceptual questions about the code
- `execute`: Simulate terminal output (raw text only)

### POST `/api/auth/register`
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST `/api/auth/google`
Login/Register with Google OAuth.

**Request:**
```json
{
  "credential": "google-id-token"
}
```

See `/backend/README.md` for full API documentation.

---

## Deployment

### Frontend
1. Set `VITE_API_URL` environment variable to your backend URL
2. Set `VITE_GOOGLE_CLIENT_ID` (optional, for Google Sign-In)
3. Build: `npm run build`
4. Deploy `dist/` folder to Vercel/Netlify/Azure Static Web Apps

### Backend
1. Set all environment variables (see `/backend/README.md`)
2. Build: `npm run build`
3. Deploy to Azure App Service/Railway/Render
4. Configure `ALLOWED_ORIGINS` with your frontend domain
5. Ensure all Azure services (OpenAI, Content Safety) are configured

See individual README files in `/backend` and `/frontend` for detailed deployment instructions.  

---

## MVP Status & Limitations

### ✅ **Ready for Demo/Competition**
The MVP is fully functional for demonstrations and competitions. All core features work for live demo sessions.

### ⚠️ **Current Limitations (For Production)**
- **No Database**: Users and sessions are stored in-memory. Data is lost on server restart.
- **No Session Persistence**: Chat sessions only exist in frontend state (lost on page refresh).
- **In-Memory Authentication**: User accounts are not persisted across restarts.

### 🔄 **Post-Demo Roadmap**
- Add PostgreSQL or MongoDB for persistent storage
- Implement session persistence across page refreshes
- Add database-backed user authentication
- Implement error tracking/monitoring (e.g., Sentry)
- Add analytics and usage metrics

These limitations are acceptable for MVP demos but should be addressed before production launch.

---

## Ethical & Responsible AI Considerations

- ✅ Prevents answer dumping & plagiarism  
- ✅ Focuses on education and comprehension  
- ✅ Transparent refusal logic  
- ✅ Safety checks via Content Safety API  
- ✅ Rate limiting to prevent abuse
- ✅ Academic misuse detection
- ✅ Learning-first constraints enforced in all modes
- ✅ Incremental development encouraged over full solutions

---

## Contributors

- **Henry Lo** - Developer
- **Dennis Wu** - Developer

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2024 Learning-First AI Debug Assistant

Developed by **Henry Lo** and **Dennis Wu**  