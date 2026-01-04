import { Router, Request, Response } from "express";
import {
  generateDebugResponse,
  generateConversationalResponse,
  ChatMessage,
} from "../services/openai";
import { checkContentSafety, checkAcademicMisuse } from "../services/contentSafety";

const router = Router();

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface DebugRequestBody {
  // Legacy single-turn fields
  code?: string;
  errorMessage?: string;
  testCase?: string;
  question?: string;
  // New conversational fields
  message?: string;
  history?: ConversationMessage[];
  difficulty?: DifficultyLevel;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { code, errorMessage, testCase, question, message, history, difficulty }: DebugRequestBody = req.body;

    // Determine if this is a conversational request or legacy request
    const isConversational = message !== undefined;
    
    // Get the current user input
    const currentInput = isConversational ? message : [code, errorMessage, testCase, question].filter(Boolean).join("\n");
    
    // Validate input
    if (!currentInput) {
      return res.status(400).json({
        error: "A message or code/question must be provided",
      });
    }

    // Check content safety on the current input
    let safetyResult;
    try {
      safetyResult = await checkContentSafety(currentInput);
    } catch (error: any) {
      console.error("Content safety check failed:", error);
      return res.status(500).json({
        error: "Content safety check failed",
        message: "Unable to process request due to content safety service error",
      });
    }

    const hasMisuse = checkAcademicMisuse(currentInput);

    // If content safety flags issues or misuse detected, return refusal
    if (!safetyResult.safe || hasMisuse) {
      return res.json({
        content: `I can't provide a full corrected solution for an assignment, but I can help you learn to fix it.

To help you learn, try these steps: (1) point me to the smallest failing function or error message; (2) run a short experiment (I can suggest one) that isolates the issue; (3) ask for a progressively more specific hint if needed.

If you share the failing function and the error trace, I'll give a targeted hint focusing on the single failing line.`,
        metadata: {
          safety_decision: "refuse",
          diagnosis_confidence: "low",
          hint_level: 1,
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
        
        response = await generateConversationalResponse(message!, conversationHistory, difficulty || 'intermediate');
      } else {
        // Legacy single-turn mode
        response = await generateDebugResponse({
          ...(code && { code }),
          ...(errorMessage && { errorMessage }),
          ...(testCase && { testCase }),
          ...(question && { question }),
        });
      }
    } catch (err: any) {
      console.error('AI service error while generating debug response:', err);
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
    console.log("Debug request processed:", {
      safety_decision: response.metadata.safety_decision,
      is_conversational: isConversational,
      history_length: history?.length || 0,
      timestamp: new Date().toISOString(),
    });

    res.json(response);
  } catch (error: any) {
    console.error("Error in debug route:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

export default router;
