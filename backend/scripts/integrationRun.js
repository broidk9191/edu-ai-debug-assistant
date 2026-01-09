"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function postToEndpoint(url, body) {
    const res = await axios_1.default.post(url, body, { headers: { 'Content-Type': 'application/json' }, timeout: 60000 });
    return res.data;
}
async function main() {
    const promptsDir = path.resolve(__dirname, '../../prompts');
    const outDir = path.resolve(__dirname, '../test_outputs');
    if (!fs.existsSync(outDir))
        fs.mkdirSync(outDir, { recursive: true });
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
            }
            catch (err) {
                console.error('  debug POST initial attempt failed:', err.message || err.toString());
                if (err.response) {
                    console.error('    HTTP status:', err.response.status);
                    try {
                        console.error('    HTTP data:', JSON.stringify(err.response.data));
                    }
                    catch (e) {
                        console.error('    (unable to stringify response data)');
                    }
                }
                else {
                    console.error('    Request error code:', err.code);
                }
                console.log('  Retrying debug POST once...');
                await new Promise((r) => setTimeout(r, 1000));
                debugResp = await postToEndpoint(debugUrl, debugBody);
            }
            fs.writeFileSync(path.join(outDir, `${baseName}_debug.json`), JSON.stringify(debugResp, null, 2));
            console.log('  -> saved', `${baseName}_debug.json`);
        }
        catch (err) {
            console.error('  debug POST failed after retry:', err.message || err.toString());
            if (err.response) {
                console.error('    HTTP status:', err.response.status);
                try {
                    console.error('    HTTP data:', JSON.stringify(err.response.data));
                }
                catch (e) {
                    console.error('    (unable to stringify response data)');
                }
            }
        }
        try {
            // POST to assignment endpoint
            const assignmentUrl = process.env.ASSIGNMENT_URL || 'http://localhost:3000/api/assignment';
            const assignmentBody = { question: content };
            let assignmentResp;
            try {
                assignmentResp = await postToEndpoint(assignmentUrl, assignmentBody);
            }
            catch (err) {
                console.error('  assignment POST initial attempt failed:', err.message || err.toString());
                if (err.response) {
                    console.error('    HTTP status:', err.response.status);
                    try {
                        console.error('    HTTP data:', JSON.stringify(err.response.data));
                    }
                    catch (e) {
                        console.error('    (unable to stringify response data)');
                    }
                }
                else {
                    console.error('    Request error code:', err.code);
                }
                console.log('  Retrying assignment POST once...');
                await new Promise((r) => setTimeout(r, 1000));
                assignmentResp = await postToEndpoint(assignmentUrl, assignmentBody);
            }
            fs.writeFileSync(path.join(outDir, `${baseName}_assignment.json`), JSON.stringify(assignmentResp, null, 2));
            console.log('  -> saved', `${baseName}_assignment.json`);
        }
        catch (err) {
            console.error('  assignment POST failed after retry:', err.message || err.toString());
            if (err.response) {
                console.error('    HTTP status:', err.response.status);
                try {
                    console.error('    HTTP data:', JSON.stringify(err.response.data));
                }
                catch (e) {
                    console.error('    (unable to stringify response data)');
                }
            }
        }
    }
    console.log('Integration run complete. Outputs in', outDir);
}
main().catch((e) => {
    console.error('Integration run failed:', e);
    process.exit(1);
});
//# sourceMappingURL=integrationRun.js.map