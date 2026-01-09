import dotenv from "dotenv";
dotenv.config();

// Enable local mock mode for testing
process.env.LOCAL_FAKE_AI = "true";

import { generateDebugResponse, generateAssignmentResponse } from "../src/services/openai";

(async () => {
  try {
    console.log("Running local test requests (LOCAL_FAKE_AI=true)");

    const debug = await generateDebugResponse({
      code: 'print("hello world")',
      errorMessage: '',
      question: 'Why does this print newlines?'
    });

    console.log('--- DEBUG RESPONSE ---');
    console.log(JSON.stringify(debug, null, 2));

    const assignment = await generateAssignmentResponse({
      question: 'Explain how binary search works and common bugs to watch for.',
      code: 'def binary_search(arr, target):\n    # student code\n    pass'
    });

    console.log('--- ASSIGNMENT RESPONSE ---');
    console.log(JSON.stringify(assignment, null, 2));
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
})();
