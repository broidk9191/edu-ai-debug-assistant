"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Ensure real mode
process.env.LOCAL_FAKE_AI = '';
const openai_1 = require("../src/services/openai");
(async () => {
    try {
        console.log('Running real-mode test request...');
        const res = await (0, openai_1.generateDebugResponse)({
            code: 'print("hello world")',
            question: 'Why does this print newlines?'
        });
        console.log('RESPONSE:', JSON.stringify(res, null, 2));
    }
    catch (err) {
        console.error('Real test failed:', err);
        process.exit(1);
    }
})();
//# sourceMappingURL=runRealTest.js.map