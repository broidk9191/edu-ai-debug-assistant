import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

async function postToEndpoint(url: string, body: any) {
  const res = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' }, timeout: 60000 });
  return res.data;
}

async function main() {
  const promptsDir = path.resolve(__dirname, '../../prompts');
  const outDir = path.resolve(__dirname, '../test_outputs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(promptsDir).filter((f) => f.endsWith('.md'));
  if (files.length === 0) {
    console.error('No prompt files found in', promptsDir);
    process.exit(1);
  }

  for (const file of files) {
    const content = fs.readFileSync(path.join(promptsDir, file), 'utf-8');
    const baseName = path.parse(file).name;

    console.log('Posting prompt', file);

    try {
      // POST to debug endpoint
      const debugUrl = process.env.DEBUG_URL || 'http://localhost:3000/api/debug';
      const debugBody = { question: content };
      let debugResp;
      try {
        debugResp = await postToEndpoint(debugUrl, debugBody);
      } catch (err: any) {
        console.error('  debug POST initial attempt failed:', err.message || err.toString());
        if (err.response) {
          console.error('    HTTP status:', err.response.status);
          try { console.error('    HTTP data:', JSON.stringify(err.response.data)); } catch (e) { console.error('    (unable to stringify response data)'); }
        } else {
          console.error('    Request error code:', err.code);
        }
        console.log('  Retrying debug POST once...');
        await new Promise((r) => setTimeout(r, 1000));
        debugResp = await postToEndpoint(debugUrl, debugBody);
      }

      fs.writeFileSync(path.join(outDir, `${baseName}_debug.json`), JSON.stringify(debugResp, null, 2));
      console.log('  -> saved', `${baseName}_debug.json`);
    } catch (err: any) {
      console.error('  debug POST failed after retry:', err.message || err.toString());
      if (err.response) {
        console.error('    HTTP status:', err.response.status);
        try { console.error('    HTTP data:', JSON.stringify(err.response.data)); } catch (e) { console.error('    (unable to stringify response data)'); }
      }
    }

    try {
      // POST to assignment endpoint
      const assignmentUrl = process.env.ASSIGNMENT_URL || 'http://localhost:3000/api/assignment';
      const assignmentBody = { question: content };
      let assignmentResp;
      try {
        assignmentResp = await postToEndpoint(assignmentUrl, assignmentBody);
      } catch (err: any) {
        console.error('  assignment POST initial attempt failed:', err.message || err.toString());
        if (err.response) {
          console.error('    HTTP status:', err.response.status);
          try { console.error('    HTTP data:', JSON.stringify(err.response.data)); } catch (e) { console.error('    (unable to stringify response data)'); }
        } else {
          console.error('    Request error code:', err.code);
        }
        console.log('  Retrying assignment POST once...');
        await new Promise((r) => setTimeout(r, 1000));
        assignmentResp = await postToEndpoint(assignmentUrl, assignmentBody);
      }

      fs.writeFileSync(path.join(outDir, `${baseName}_assignment.json`), JSON.stringify(assignmentResp, null, 2));
      console.log('  -> saved', `${baseName}_assignment.json`);
    } catch (err: any) {
      console.error('  assignment POST failed after retry:', err.message || err.toString());
      if (err.response) {
        console.error('    HTTP status:', err.response.status);
        try { console.error('    HTTP data:', JSON.stringify(err.response.data)); } catch (e) { console.error('    (unable to stringify response data)'); }
      }
    }
  }

  console.log('Integration run complete. Outputs in', outDir);
}

main().catch((e) => {
  console.error('Integration run failed:', e);
  process.exit(1);
});
