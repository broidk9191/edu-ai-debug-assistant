# Backend API - Learning-First AI Debug Assistant

## Overview

This backend provides REST API endpoints for the Learning-First AI Debug Assistant, integrating with Azure OpenAI and Azure AI Content Safety services.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0

# CORS Configuration (comma-separated list of allowed origins)
# For production, set to your frontend domain(s)
# Example: ALLOWED_ORIGINS=https://learning-first.ai,https://www.learning-first.ai
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173

# Production mode (hides detailed error messages)
NODE_ENV=development

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-05-01-preview

# Azure AI Content Safety Configuration (REQUIRED)
AZURE_CONTENT_SAFETY_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com
AZURE_CONTENT_SAFETY_API_KEY=your-content-safety-api-key
```

### 3. Environment Validation

The server validates all required environment variables on startup. If any are missing, the server will exit with an error message indicating which variables need to be configured.

**Required Variables:**
- `AZURE_OPENAI_ENDPOINT` - Your Azure OpenAI endpoint URL
- `AZURE_OPENAI_API_KEY` - Your Azure OpenAI API key
- `AZURE_OPENAI_DEPLOYMENT_NAME` - Your Azure OpenAI deployment name
- `AZURE_CONTENT_SAFETY_ENDPOINT` - Your Azure AI Content Safety endpoint URL
- `AZURE_CONTENT_SAFETY_API_KEY` - Your Azure AI Content Safety API key

**Optional Variables:**
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `ALLOWED_ORIGINS` - Comma-separated list of CORS allowed origins
- `NODE_ENV` - Set to `production` to hide detailed error messages

### 4. Run the Server

Development mode (with hot reload):
```bash
npm run dev
```

Build and run:
```bash
npm run build
npm start
```

**Note:** The server will not start if Azure AI Content Safety is not properly configured, as it is a required component for academic integrity enforcement.

## Security Features

### Rate Limiting
- **20 requests per minute per IP** to prevent abuse
- Returns 429 status with retry guidance when exceeded

### CORS Protection
- Only allows requests from configured origins
- Set `ALLOWED_ORIGINS` environment variable for production

### Request Size Limits
- Maximum request body size: 1MB
- Prevents large payload attacks

## API Endpoints

### POST `/api/debug`

Debug code and get learning-focused hints. Supports conversational history and difficulty level customization.

**Request Body (Conversational Mode):**
```json
{
  "message": "string - Current user message",
  "history": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ],
  "difficulty": "beginner" | "intermediate" | "advanced" (optional, default: "intermediate")
}
```

**Legacy format (also supported):**
```json
{
  "code": "string (optional)",
  "errorMessage": "string (optional)",
  "testCase": "string (optional)",
  "question": "string (optional)",
  "difficulty": "beginner" | "intermediate" | "advanced" (optional)
}
```

**Response:**
```json
{
  "content": "string - AI response with hints and guidance (tailored to difficulty level)",
  "metadata": {
    "safety_decision": "allow" | "refuse" | "review_required",
    "diagnosis_confidence": "low" | "medium" | "high",
    "hint_level": 1 | 2 | 3
  }
}
```

**Difficulty Levels:**
- `beginner`: Simple language, more context, explicit hints, analogies
- `intermediate`: Standard terminology, balanced hints, moderate context
- `advanced`: Technical language, subtle hints, minimal context, advanced concepts

### POST `/api/assignment`

Get assignment help (conceptual guidance, no code solutions). Supports conversational history and difficulty level customization.

**Request Body (Conversational Mode):**
```json
{
  "message": "string - Current user message",
  "history": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ],
  "difficulty": "beginner" | "intermediate" | "advanced" (optional, default: "intermediate")
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
  "content": "string - Conceptual guidance tailored to difficulty level",
  "metadata": {
    "safety_decision": "allow" | "refuse" | "review_required"
  }
}
```

**Difficulty Levels:**
- `beginner`: Very simple language, lots of context, explicit hints, analogies
- `intermediate`: Standard terminology, balanced hints, moderate context
- `advanced`: Precise technical language, subtle hints, minimal context, advanced topics

### GET `/`

Health check endpoint (not rate limited).

## Architecture

- **Routes** (`src/routes/`): Express route handlers for API endpoints
- **Services** (`src/services/`):
  - `openai.ts`: Azure OpenAI integration and prompt management
  - `contentSafety.ts`: Azure AI Content Safety integration
- **Prompts** (`../prompts/`): System prompts loaded from markdown files

## Features

- ✅ Azure OpenAI integration for AI responses
- ✅ Azure AI Content Safety for misuse detection
- ✅ Academic integrity enforcement
- ✅ Conversational memory (multi-turn chat for both debug and assignment modes)
- ✅ **Difficulty level customization** (beginner/intermediate/advanced)
- ✅ **Dynamic prompt adjustment** based on user's learning level
- ✅ Rate limiting (20 req/min per IP)
- ✅ CORS protection
- ✅ Request size limits
- ✅ Safety decision logging for audit

## Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure `ALLOWED_ORIGINS` with your frontend domain(s)
3. Set all Azure API keys securely (use platform secrets, not `.env` files)
4. Ensure HTTPS is enabled on your hosting platform
5. Consider adding a reverse proxy (nginx) for additional security