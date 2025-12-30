import { Router, Request, Response } from "express";
import {
  generateAssignmentResponse,
  AssignmentRequest,
} from "../services/openai";
import { checkContentSafety, checkAcademicMisuse } from "../services/contentSafety";

const router = Router();

interface AssignmentRequestBody {
  question: string;
  code?: string;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { question, code }: AssignmentRequestBody = req.body;

    // Validate input
    if (!question) {
      return res.status(400).json({
        error: "'question' field is required",
      });
    }

    // Check content safety (required)
    const userInput = code ? `${question}\n\n${code}` : question;
    
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

    // Generate assignment help response
    const request: AssignmentRequest = {
      question,
      ...(code && { code }),
    };

    let response;
    try {
      response = await generateAssignmentResponse(request);
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

