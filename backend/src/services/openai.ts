import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

// Lazy initialization of Azure OpenAI client
// This ensures dotenv.config() has been called before the client is created
let client: OpenAI | null = null;


function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    
    if (!apiKey || !endpoint || !deploymentName) {
      throw new Error(
        "Azure OpenAI configuration missing. Please set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT_NAME environment variables."
      );
    }

    client = new OpenAI({
      apiKey,
      baseURL: `${endpoint}openai/deployments/${deploymentName}/`,
      defaultQuery: {
        "api-version":
          process.env.AZURE_OPENAI_API_VERSION || "2024-05-01-preview",
      },
      defaultHeaders: {
        "api-key": apiKey,
      },
    });
  }
  return client;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DebugRequest {
  code?: string;
  errorMessage?: string;
  testCase?: string;
  question?: string;
}

export interface AssignmentRequest {
  question: string;
  code?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkspaceRequest {
  code: string;
  language: string;
  message: string;
  history: ChatMessage[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  action: 'debug' | 'test' | 'feature' | 'chat';
}

export interface AssistantResponse {
  content: string;
  metadata: {
    diagnosis_confidence?: "low" | "medium" | "high";
    safety_decision: "allow" | "refuse" | "review_required";
    hint_level?: 1 | 2 | 3;
    lines_referenced?: number[];
  };
}

/**
 * Load prompt from markdown file
 */
export function loadPrompt(promptFileName: string): string {
  // Resolve path relative to project root (works in both dev and production)
  // In dev: __dirname = backend/src/services
  // In prod: __dirname = backend/dist/services
  // We need to go up to project root, then into prompts folder
  const projectRoot = path.resolve(__dirname, "../../..");
  const promptPath = path.join(projectRoot, "prompts", promptFileName);
  
  try {
    const content = fs.readFileSync(promptPath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error loading prompt file ${promptFileName} from ${promptPath}:`, error);
    throw new Error(`Failed to load prompt file: ${promptFileName}`);
  }
}

/**
 * Extract system message from prompt content
 */
function extractSystemMessage(promptContent: string, mode: "debug" | "assignment"): string {
  // Use the prompt content from the repository as the full system message.
  // Prompts in the `prompts/` directory should include any required system role text.
  return promptContent;
}

/**
 * Check for misuse signals in user input
 */
function detectMisuseSignals(input: string): number {
  const misusePhrases = [
    "submit",
    "turnin",
    "final",
    "assignment",
    "complete code",
    "do it for me",
    "do my homework",
    "complete this",
    "give me the code",
    "full solution",
  ];
  
  const lowerInput = input.toLowerCase();
  let score = 0;
  
  for (const phrase of misusePhrases) {
    if (lowerInput.includes(phrase)) {
      score += 1;
    }
  }
  
  return score;
}

/**
 * Call Azure OpenAI API
 */
export async function callOpenAI(
  messages: ChatMessage[],
  mode: "debug" | "assignment"
): Promise<AssistantResponse> {
  // Proceed to call Azure OpenAI

  try {
    const openaiClient = getClient();
    // Minimal debug log: record which deployment we're calling (no message contents)
    console.log("Calling Azure OpenAI deployment:", process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
    const response = await openaiClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4",
      messages: messages,
      // Certain Azure deployments disallow customizing temperature; omit it to use the model default
      // Azure newer deployments expect max_completion_tokens instead of max_tokens
      max_completion_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || "";
    
    // Determine safety decision based on content and misuse signals
    const userMessage = messages[messages.length - 1]?.content || "";
    const misuseScore = detectMisuseSignals(userMessage);
    
    let safetyDecision: "allow" | "refuse" | "review_required" = "allow";
    if (misuseScore >= 2 || content.toLowerCase().includes("i can't") || content.toLowerCase().includes("i cannot")) {
      safetyDecision = "refuse";
    } else if (misuseScore === 1) {
      safetyDecision = "review_required";
    }

    // Extract metadata (simplified - in production, parse from response)
    const metadata = {
      safety_decision: safetyDecision,
      diagnosis_confidence: "medium" as const,
      hint_level: 1 as const,
    };

    return {
      content,
      metadata,
    };
  } catch (error: any) {
    console.error("Error calling Azure OpenAI:", error?.message || error);
    try {
      // axios / node-fetch style
      // @ts-ignore
      if (error?.response) {
        // @ts-ignore
        console.error("Azure response status:", error.response.status);
        // @ts-ignore
        console.error("Azure response data:", JSON.stringify(error.response.data));
      }
      // Some errors include .body or .statusCode
      // @ts-ignore
      if (error?.body) {
        // @ts-ignore
        console.error("Error body:", error.body);
      }
    } catch (e) {
      console.error("Failed to extract error response details:", e);
    }

    // Provide actionable guidance for common misconfigurations
    const guidance = `Failed to generate response from Azure OpenAI. Common causes:\n` +
      `- Incorrect AZURE_OPENAI_ENDPOINT (should be like https://<resource-name>.openai.azure.com/)\n` +
      `- Wrong AZURE_OPENAI_DEPLOYMENT_NAME (use the deployment id for your model)\n` +
      `- Missing or invalid AZURE_OPENAI_API_KEY\n` +
      `Check your backend/.env and Azure portal settings.`;

    throw new Error(`Failed to generate response from AI service. ${guidance}`);
  }
}

/**
 * Generate debug response
 */
export async function generateDebugResponse(request: DebugRequest): Promise<AssistantResponse> {
  const promptContent = loadPrompt("debug_prompt_v1.md");
  const systemMessage = extractSystemMessage(promptContent, "debug");

  let userMessage = "";
  if (request.code) {
    userMessage += `Student code:\n\`\`\`\n${request.code}\n\`\`\`\n\n`;
  }
  if (request.errorMessage) {
    userMessage += `Error message: ${request.errorMessage}\n\n`;
  }
  if (request.testCase) {
    userMessage += `Test case: ${request.testCase}\n\n`;
  }
  if (request.question) {
    userMessage += `Question: ${request.question}\n`;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage },
  ];

  return await callOpenAI(messages, "debug");
}

/**
 * Generate conversational debug response with full history.
 * This enables multi-turn conversations where the AI remembers context.
 */
export async function generateConversationalResponse(
  currentMessage: string,
  history: ChatMessage[],
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<AssistantResponse> {
  const promptContent = loadPrompt("debug_prompt_v1.md");
  let systemMessage = extractSystemMessage(promptContent, "debug");
  
  // Append difficulty-specific instructions to the system message
  const difficultyInstructions = getDifficultyInstructions(difficulty);
  systemMessage = `${systemMessage}\n\n${difficultyInstructions}`;

  // Build the full conversation: system + history + current message
  const messages: ChatMessage[] = [
    { role: "system", content: systemMessage },
    ...history.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: currentMessage },
  ];

  return await callOpenAI(messages, "debug");
}

/**
 * Generate workspace response
 */
export async function generateWorkspaceResponse(
  request: WorkspaceRequest
): Promise<AssistantResponse> {
  const promptContent = loadPrompt("workspace_prompt_v1.md");
  let systemMessage = extractSystemMessage(promptContent, "debug");
  
  const difficultyInstructions = getDifficultyInstructions(request.difficulty);
  systemMessage = `${systemMessage}\n\n${difficultyInstructions}\n\nACTION: ${request.action.toUpperCase()}\nLANGUAGE: ${request.language}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemMessage },
    ...request.history.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: `Code:\n${request.code}\n\nMessage: ${request.message}` },
  ];

  return await callOpenAI(messages, "debug");
}

/**
 * Get difficulty-specific instructions to append to the system prompt
 */
function getDifficultyInstructions(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  switch (difficulty) {
    case 'beginner':
      return `DIFFICULTY LEVEL: BEGINNER
- Use very simple, non-technical language. Avoid jargon or explain every term.
- Provide more context and background. Assume the student is learning fundamental concepts.
- Give more explicit hints. Break down complex concepts into smaller, digestible pieces.
- Use analogies and real-world examples whenever possible.
- Be patient and encouraging. Repeat key concepts if needed.`;
    
    case 'intermediate':
      return `DIFFICULTY LEVEL: INTERMEDIATE
- Use standard technical terminology appropriate for students with some programming experience.
- Provide moderate context. Assume familiarity with basic programming concepts.
- Give balanced hints - not too explicit, not too vague. Encourage some independent thinking.
- Reference common patterns and best practices.
- Encourage deeper understanding of why things work.`;
    
    case 'advanced':
      return `DIFFICULTY LEVEL: ADVANCED
- Use precise technical language. Assume familiarity with advanced concepts.
- Provide minimal context. Focus on the specific issue at hand.
- Give subtle hints that require the student to think critically and connect concepts.
- Reference advanced patterns, design principles, and edge cases.
- Challenge the student to think about performance, scalability, or architectural implications when relevant.`;
    
    default:
      return '';
  }
}

/**
 * Generate assignment help response
 */
export async function generateAssignmentResponse(
  request: AssignmentRequest
): Promise<AssistantResponse> {
  const promptContent = loadPrompt("assignment_help_prompt_v1.md");
  let systemMessage = extractSystemMessage(promptContent, "assignment");
  
  // Append difficulty-specific instructions to the system message
  const difficulty = request.difficulty || 'intermediate';
  const difficultyInstructions = getDifficultyInstructions(difficulty);
  systemMessage = `${systemMessage}\n\n${difficultyInstructions}`;

  let userMessage = request.question;
  if (request.code) {
    userMessage += `\n\nCode provided:\n\`\`\`\n${request.code}\n\`\`\`\n`;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage },
  ];

  return await callOpenAI(messages, "assignment");
}

/**
 * Generate conversational assignment response with full history.
 * This enables multi-turn conversations where the AI remembers context.
 */
export async function generateConversationalAssignmentResponse(
  currentMessage: string,
  history: ChatMessage[],
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<AssistantResponse> {
  const promptContent = loadPrompt("assignment_help_prompt_v1.md");
  let systemMessage = extractSystemMessage(promptContent, "assignment");
  
  // Append difficulty-specific instructions to the system message
  const difficultyInstructions = getDifficultyInstructions(difficulty);
  systemMessage = `${systemMessage}\n\n${difficultyInstructions}`;
  
  // Add instruction to omit "why" explanation after first response
  // Check if this is a follow-up (history has assistant messages)
  const hasPreviousAssistantMessages = history.some(m => m.role === 'assistant');
  if (hasPreviousAssistantMessages) {
    systemMessage += `\n\nIMPORTANT: Since this is a follow-up question, do NOT include the "why" (rationale) explanation about academic integrity. The user already understands why you don't provide code. Skip directly to the guidance or refusal statement.`;
  }

  // Build the full conversation: system + history + current message
  const messages: ChatMessage[] = [
    { role: "system", content: systemMessage },
    ...history.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: currentMessage },
  ];

  return await callOpenAI(messages, "assignment");
}
