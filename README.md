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
This project introduces a **constrained AI debugging assistant** that:
- Explains *why* a bug occurs instead of fixing it outright
- Provides guided hints rather than full answers
- Uses reflective questions to encourage student reasoning
- Refuses requests for complete solutions

The system is intentionally designed to support learning, not shortcut it.

---

## Key Differentiators from ChatGPT
- **Learning-first constraints**: The assistant is prevented from outputting full corrected code.
- **Structured responses**: Explanations, hints, and reflection prompts follow a predictable format.
- **Pedagogical focus**: Responses are designed using educational principles (guided discovery, error-based learning).
- **Responsible AI enforcement**: Unsafe or misuse-prone requests are detected and handled at the system level.

---

## Microsoft AI Services Used (Requirement Compliance)

This project **requires multiple Microsoft AI services to operate**:

### 1. Azure OpenAI Service
Used as the core reasoning engine to:
- Analyze student-submitted code
- Generate explanations and guided debugging hints
- Follow system-level learning constraints and structured output rules

### 2. Azure AI Content Safety
Used to:
- Detect academic misuse (e.g., requests for full solutions)
- Identify unsafe or policy-violating prompts
- Enforce refusal and redirection behaviors when necessary

Together, these services ensure the assistant is both **effective and responsibly constrained**.

---

## Current Project Phase
**Phase 1: Prompt Design & Idea Validation**

Current focus:
- Designing and iterating constrained system prompts
- Comparing Azure OpenAI behavior against ChatGPT
- Validating learning effectiveness and student trust
- Testing Content Safety filtering for misuse prevention

No frontend or backend implementation yet.

---

## Prompt Design
Prompt templates are stored in the `prompts/` directory and include:
- Debugging mode (explanation + guided hints)
- Assignment help mode (refusal + learning redirection)

These prompts enforce strict behavioral rules to ensure consistent learning-oriented responses.

---

## Validation
Early validation includes:
- Prompt behavior comparisons with ChatGPT
- Student feedback on learning effectiveness
- Testing misuse detection via Azure AI Content Safety

Find validation notes in the `validation/` directory.

---

## Planned Next Steps
- Phase 2: MVP implementation (frontend + backend)
- Phase 3: User testing and iteration
- Phase 4: Deployment and Imagine Cup submission

---

## Tech Stack
- Frontend: React + TypeScript
- Backend: Node.js + TypeScript
- AI Services:
  - Azure OpenAI Service
  - Azure AI Content Safety
- Deployment: Azure App Service

---

## Ethical & Responsible AI Considerations
This project follows Microsoft Responsible AI principles:
- Prevents academic misuse through automated content filtering
- Encourages understanding over automation
- Maintains transparency in AI behavior and limitations
- Applies safeguards at both prompt and service levels
