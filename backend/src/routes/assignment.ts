import { Router, Request, Response } from "express";
import {
  generateAssignmentResponse,
  generateConversationalAssignmentResponse,
  AssignmentRequest,
  ChatMessage,
} from "../services/openai";
import { checkContentSafety, checkAcademicMisuse } from "../services/contentSafety";

const router = Router();

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AssignmentRequestBody {
  // Legacy single-turn fields
  question?: string;
  code?: string;
  // New conversational fields
  message?: string;
  history?: ConversationMessage[];
  difficulty?: DifficultyLevel;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { question, code, message, history, difficulty }: AssignmentRequestBody = req.body;

    // Determine if this is a conversational request or legacy request
    const isConversational = message !== undefined;
    
    // Get the current user input
    const currentInput = isConversational ? message : question;
    
    // Validate input
    if (!currentInput) {
      return res.status(400).json({
        error: "A message or question must be provided",
      });
    }

    // Check content safety (required)
    const userInput = code ? `${currentInput}\n\n${code}` : currentInput;
    
    let safetyResult;
    try {
      safetyResult = await checkContentSafety(userInput);
    } catch (error: any) {
      console.error("Content safety check failed:", error);
      return res.status(500).json({
        error: "Content safety check failed",
        message: "Unable to process request due to content safety service error",
      });
    }

    const hasMisuse = checkAcademicMisuse(userInput);

    // If content safety flags issues or misuse detected, return refusal
    if (!safetyResult.safe || hasMisuse) {
      return res.json({
        content: `I can't provide help with completing assignments or writing code for you.

This ensures you learn by debugging your own code and maintain academic integrity.

For debugging specific bugs in your code, use the debug mode: share your code snippet and error, then ask for hints.

Try breaking down the problem yourself, run test cases, and use online resources for concepts (not solutions).`,
        metadata: {
          safety_decision: "refuse",
        },
      });
    }

    let response;
    try {
      if (isConversational) {
        // Use conversational mode with history
        const conversationHistory: ChatMessage[] = (history || []).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
        
        response = await generateConversationalAssignmentResponse(message!, conversationHistory, difficulty || 'intermediate');
      } else {
        // Legacy single-turn mode
        const request: AssignmentRequest = {
          question: question!,
          ...(code && { code }),
          difficulty: difficulty || 'intermediate',
        };
        response = await generateAssignmentResponse(request);
      }
    } catch (err: any) {
      console.error('AI service error while generating assignment response:', err);
      return res.json({
        content: "Temporary AI service error. Please retry in a few seconds.",
        metadata: {
          safety_decision: "review_required",
          diagnosis_confidence: "low",
          hint_level: 1,
        },
      });
    }

    // Log safety decision for audit
    console.log("Assignment request processed:", {
      safety_decision: response.metadata.safety_decision,
      is_conversational: isConversational,
      history_length: history?.length || 0,
      has_code: !!code,
      timestamp: new Date().toISOString(),
    });

    res.json(response);
  } catch (error: any) {
    console.error("Error in assignment route:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

export default router;

