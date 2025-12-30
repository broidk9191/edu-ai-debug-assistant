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

The system is intentionally designed to support learning, not shortcut it.

---

## Key Differentiators from ChatGPT

- **Learning-first constraints:** Prevents full corrected code output.  
- **Structured responses:** Hints + reflection questions instead of answers.  
- **Pedagogical focus:** Encourages reasoning and debugging skills.  
- **Responsible AI enforcement:** Academic misuse detection built in.  

---

## Microsoft AI Services Used (Requirement Compliance)

This project requires and integrates two Microsoft AI services:

### 1. Azure OpenAI Service
Used as the reasoning engine for:
- Code understanding  
- Error explanation  
- Guided debugging output  

### 2. Azure AI Content Safety
Used for:
- Academic misuse detection  
- Refusal logic + redirection triggers  
- Safety filtering for responsible AI use  

These combined services enable a safe, learning-first debugging assistant.

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

### **Phase 2 — MVP Implementation, Now in progress**

Current focus:

- Building minimal functional prototype using Azure OpenAI API  
- Backend → Node.js + TypeScript with prompt routing (debug vs assignment mode)  
- Frontend → React + TypeScript UI for code submission + responses  
- Integrating Azure AI Content Safety into request flow  
- Connecting user input → API → structured response output  

#### Deliverables for Phase 2:

| Component | Expected Output |
|----------|----------------|
| Backend API | `/api/debug` & `/api/assignment` endpoints |
| Azure Integration | Calls to OpenAI + Content Safety evaluation |
| Frontend UI | Code input box, response panel, "mode notifiers" |
| Logging | Safety decisions + hint level metadata tracking |

---

## Planned Roadmap

- Phase 3: User testing + iteration with CS students  
- Phase 4: Deployment + Imagine Cup submission build  
- Phase 5: Analytics, feedback loops, reflection metrics  

---

## Repository Structure
/prompts → system prompt files (debug + assignment)
/validation → prompt comparison + Phase 1 test results
/backend (planned) → Phase 2 server + OpenAI integration
/frontend (planned) → React+TS UI
/docs → proposal, planning, architecture notes

## Tech Stack

- React + TypeScript (frontend)  
- Node.js + TypeScript (backend)  
- Azure OpenAI + Azure AI Content Safety  
- Deployment planned on Azure App Service  

---

## Ethical & Responsible AI Considerations

- Prevents answer dumping & plagiarism  
- Focuses on education and comprehension  
- Transparent refusal logic  
- Safety checks via Content Safety API  
