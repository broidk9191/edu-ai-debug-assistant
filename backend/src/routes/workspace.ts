import { Router, Request, Response } from "express";
import { generateWorkspaceResponse } from "../services/openai";
import { checkContentSafety, checkAcademicMisuse } from "../services/contentSafety";

const router = Router();

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface WorkspaceRequestBody {
  code: string;
  language: string;
  message: string;
  history: ConversationMessage[];
  difficulty?: DifficultyLevel;
  action?: 'debug' | 'test' | 'feature' | 'chat';
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { code, language, message, history, difficulty, action }: WorkspaceRequestBody = req.body;

    if (!message && !code) {
      return res.status(400).json({
        error: "Message or code must be provided",
      });
    }

    // Check content safety
    const userInput = `${message}\n\nCode:\n${code}`;
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

    if (!safetyResult.safe || hasMisuse) {
      return res.json({
        content: `I can't provide direct solutions or complete your code for you.

This ensures you learn by building and debugging your own code.

Try breaking down the problem yourself, and if you have a specific bug, use the debug action for a hint.`,
        metadata: {
          safety_decision: "refuse",
        }
      });
    }

    // Generate workspace response
    const response = await generateWorkspaceResponse({
      code,
      language,
      message,
      history,
      difficulty: difficulty || 'intermediate',
      action: action || 'chat'
    });

    res.json(response);
  } catch (error: any) {
    console.error("Workspace error:", error);
    res.status(500).json({
      error: "Failed to get workspace response",
      message: error.message,
    });
  }
});

export default router;
