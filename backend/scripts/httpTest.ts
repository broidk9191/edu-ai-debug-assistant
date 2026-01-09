import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

(async () => {
  const url = process.env.TEST_URL || 'http://localhost:3000/api/debug';
  const body = {
    code: 'print("hello world")',
    errorMessage: '',
    question: 'Why does this print newlines?'
  };

  const maxAttempts = 6;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxAttempts} - Posting to ${url}`);
      const res = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
      console.log('Status:', res.status);
      console.log('Response data:', JSON.stringify(res.data, null, 2));
      process.exit(0);
    } catch (err: any) {
      console.error(`Attempt ${attempt} failed:`);
      if (err.response) {
        console.error('  HTTP error status:', err.response.status);
        console.error('  HTTP error data:', JSON.stringify(err.response.data));
      } else {
        console.error('  Request error message:', err.message || err.toString());
        console.error('  Error code:', err.code);
        if (err.config) console.error('  Request config:', JSON.stringify({ url: err.config.url, method: err.config.method }));
      }

      if (attempt < maxAttempts) {
        const wait = attempt * 1000;
        console.log(`  Waiting ${wait}ms before retrying...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      console.error('All attempts failed.');
      process.exit(1);
    }
  }
})();
