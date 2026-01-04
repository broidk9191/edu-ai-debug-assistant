# Learning-First AI Debug Assistant

## Overview

The Learning-First AI Debug Assistant is an education-focused AI tool designed to help students understand programming errors without directly providing full solutions. Unlike general-purpose AI tools, this system enforces learning-oriented constraints to promote critical thinking and maintain academic integrity.

The project targets introductory computer science students who want help debugging their code while still learning how and why errors occur.

---

## Problem Statement

Many students use general-purpose AI tools for debugging, but these tools often:

- Provide complete solutions  
- Encourage copy-paste behavior  
- Undermine learning and academic integrity  

Educators, meanwhile, struggle to balance AI accessibility with responsible use.

This project aims to bridge that gap.

---

## Solution

This project introduces a constrained AI debugging assistant that:

- Explains why a bug occurs instead of fixing it outright  
- Provides guided hints rather than full answers  
- Uses reflective questions to encourage student reasoning  
- Refuses requests for complete solutions  
- Maintains conversation context for follow-up questions

The system is intentionally designed to support learning, not shortcut it.

---

## Key Differentiators from ChatGPT

- **Learning-first constraints:** Prevents full corrected code output.  
- **Structured responses:** Hints + reflection questions instead of answers.  
- **Pedagogical focus:** Encourages reasoning and debugging skills.  
- **Difficulty customization:** Adapts explanations to student's learning level (beginner/intermediate/advanced).  
- **Mode clarity:** Explicit Debug vs Assignment modes for clear user understanding.  
- **Responsible AI enforcement:** Academic misuse detection built in.  
- **Conversational memory:** Remembers context within a session for follow-up questions (both modes).  

---

## Microsoft AI Services Used (Requirement Compliance)

This project requires and integrates two Microsoft AI services:

### 1. Azure OpenAI Service
Used as the reasoning engine for:
- Code understanding  
- Error explanation  
- Guided debugging output  
- Multi-turn conversational responses

### 2. Azure AI Content Safety
Used for:
- Academic misuse detection  
- Refusal logic + redirection triggers  
- Safety filtering for responsible AI use  

These combined services enable a safe, learning-first debugging assistant.

### 3. Microsoft Foundry
Used for:
- Experimenting with alternative model backends and private models during research.
- Routing requests for telemetry, model comparison, and governance in experimental runs.

---

## Project Status

### **Phase 1 — Prompt Design & Validation ✔ Completed**

Achievements:  
- Debug Prompt v1 + Assignment Help Prompt v1 complete  
- Prompt behavior validated against ChatGPT baseline  
- Academic misuse refusal behavior tested  
- Documentation + repo structure initialized  

Results stored in:  
`/prompts/` + `/validation/`

---

### **Phase 2 — MVP Implementation ✅ Completed**

**Delivered Features:**

✅ **Backend API** (`/backend`)
- RESTful API with `/api/debug` and `/api/assignment` endpoints
- Conversational mode with full chat history support (both endpoints)
- **Difficulty level support**: Tailors responses to beginner/intermediate/advanced levels
- Azure OpenAI integration with prompt management
- Azure AI Content Safety integration
- Rate limiting (20 requests/minute per IP)
- CORS protection with configurable origins
- Request size limits (1MB max)
- Error handling and logging

✅ **Frontend UI** (`/frontend`)
- Modern React + TypeScript chat interface
- Dark mode design with Learning-First.ai branding
- Unified chatbox (no separate code/question fields)
- **Mode selector**: Choose between Debug and Assignment modes
- **Difficulty level customization**: Beginner, Intermediate, Advanced
- Conversation memory within sessions (both modes)
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

---

## Planned Roadmap

- Phase 3: User testing + iteration with CS students  
- Phase 4: Deployment + Imagine Cup submission build  
- Phase 5: Analytics, feedback loops, reflection metrics  

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Azure OpenAI Service account
- Azure AI Content Safety account

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
PORT=3000
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_CONTENT_SAFETY_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_CONTENT_SAFETY_API_KEY=your-key
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173
```

Start backend:
```bash
npm run dev
```

**3. Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

**4. Open in browser:**
Navigate to `http://localhost:3001`

---

## Repository Structure

```
edu-ai-debug-assistant/
├── backend/              # Node.js + TypeScript API server
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   └── services/     # OpenAI & Content Safety integration
│   └── README.md         # Backend documentation
├── frontend/             # React + TypeScript web app
│   ├── src/
│   │   ├── components/   # React components
│   │   └── services/    # API client
│   └── README.md         # Frontend documentation
├── prompts/              # System prompts for AI
│   ├── debug_prompt_v1.md
│   └── assignment_help_prompt_v1.md
├── validation/           # Phase 1 test results
│   └── prompt_comparison.md
└── doc/                  # Project documentation
```

---

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Modern CSS with dark mode

**Backend:**
- Node.js + Express + TypeScript
- Azure OpenAI SDK
- Azure AI Content Safety API
- express-rate-limit (rate limiting)
- CORS middleware

**Deployment:**
- Frontend: Vercel/Netlify/Azure Static Web Apps
- Backend: Azure App Service/Railway/Render

---

## API Endpoints

### POST `/api/debug`
Conversational debug assistance with chat history and difficulty customization.

**Request:**
```json
{
  "message": "Why is my loop not working?",
  "history": [
    { "role": "user", "content": "def find_max(arr):..." },
    { "role": "assistant", "content": "The issue is..." }
  ],
  "difficulty": "beginner" | "intermediate" | "advanced" (optional)
}
```

**Response:**
```json
{
  "content": "The root cause is... [hints and reflection questions]",
  "metadata": { "safety_decision": "allow", ... }
}
```

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

**Legacy format (also supported):**
```json
{
  "question": "string (required)",
  "code": "string (optional)",
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

See `/backend/README.md` for full API documentation.

---

## Deployment

### Frontend
1. Set `VITE_API_URL` environment variable to your backend URL
2. Build: `npm run build`
3. Deploy `dist/` folder to Vercel/Netlify/Azure Static Web Apps

### Backend
1. Set all environment variables (see `/backend/README.md`)
2. Build: `npm run build`
3. Deploy to Azure App Service/Railway/Render
4. Configure `ALLOWED_ORIGINS` with your frontend domain

See individual README files in `/backend` and `/frontend` for detailed deployment instructions.  

---

## Ethical & Responsible AI Considerations

- ✅ Prevents answer dumping & plagiarism  
- ✅ Focuses on education and comprehension  
- ✅ Transparent refusal logic  
- ✅ Safety checks via Content Safety API  
- ✅ Rate limiting to prevent abuse
- ✅ Academic misuse detection

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2024 Learning-First AI Debug Assistant  
