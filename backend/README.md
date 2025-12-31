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

## API Endpoints

### POST `/api/debug`

Debug code and get learning-focused hints.

**Request Body:**
```json
{
  "code": "string (optional)",
  "errorMessage": "string (optional)",
  "testCase": "string (optional)",
  "question": "string (optional)"
}
```

**Response:**
```json
{
  "content": "string - AI response with hints and guidance",
  "metadata": {
    "safety_decision": "allow" | "refuse" | "review_required",
    "diagnosis_confidence": "low" | "medium" | "high",
    "hint_level": 1 | 2 | 3,
    "lines_referenced": [1, 2, 3]
  }
}
```

### POST `/api/assignment`

Get assignment help (conceptual guidance, no code solutions).

**Request Body:**
```json
{
  "question": "string (required)",
  "code": "string (optional)"
}
```

**Response:**
```json
{
  "content": "string - Conceptual guidance or refusal",
  "metadata": {
    "safety_decision": "allow" | "refuse" | "review_required"
  }
}
```

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
- ✅ Structured response format per prompt specifications
- ✅ Safety decision logging for audit

## Notes

- **Azure AI Content Safety is REQUIRED** - The server will not start without proper Content Safety configuration
- Prompts are loaded from `../prompts/` directory at runtime
- All responses follow the structured format defined in the prompt files
- Environment variables are validated on server startup

