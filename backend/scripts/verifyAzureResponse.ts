import dotenv from 'dotenv';
dotenv.config();

import { generateDebugResponse } from '../src/services/openai';

(async () => {
  try {
    console.log('Running Azure verification test...');
    const res = await generateDebugResponse({
      code: 'print("hello world")',
      question: 'Why does this print newlines?'
    });
    console.log('=== AZURE RESPONSE ===');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Azure verification failed:');
    console.error(err);
    process.exit(1);
  }
})();
