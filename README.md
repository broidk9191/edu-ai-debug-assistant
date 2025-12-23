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
- **Responsible AI design**: The system discourages misuse in academic settings.

---

## Current Project Phase
**Phase 1: Prompt Design & Idea Validation**

Current focus:
- Designing and iterating constrained system prompts
- Comparing behavior against ChatGPT
- Validating the need with real student feedback

No frontend or backend implementation yet.

---

## Prompt Design
Prompt templates are stored in the `prompts/` directory and include:
- Debugging mode (explanation + hints)
- Assignment help mode (refusal + redirection)

These prompts enforce strict behavioral rules to ensure consistent learning-oriented responses.

---

## Validation
Early validation includes:
- Prompt behavior comparisons with ChatGPT
- User feedback from CS students regarding learning needs and academic integrity concerns

Find prompt comparison notes in the `validation/` directory.

---

## Planned Next Steps
- Phase 2: MVP implementation (frontend + backend)
- Phase 3: User testing and iteration
- Phase 4: Deployment and Imagine Cup submission

---

## Tech Stack (Planned)
- Frontend: React + TypeScript
- Backend: Node.js + TypeScript
- AI: Azure OpenAI / OpenAI API
- Deployment: Azure App Service

---

## Ethical & Responsible AI Considerations
This project is built with responsible AI principles in mind:
- Prevents academic misuse
- Encourages understanding over automation
- Maintains transparency in AI behavior

