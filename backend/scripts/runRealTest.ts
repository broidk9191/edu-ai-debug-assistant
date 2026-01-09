import dotenv from 'dotenv';
dotenv.config();

// Ensure real mode
process.env.LOCAL_FAKE_AI = '';

import { generateDebugResponse } from '../src/services/openai';

(async () => {
  try {
    console.log('Running real-mode test request...');
    const res = await generateDebugResponse({
      code: 'print("hello world")',
      question: 'Why does this print newlines?'
    });
    console.log('RESPONSE:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Real test failed:', err);
    process.exit(1);
  }
})();
