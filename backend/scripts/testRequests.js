"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Enable local mock mode for testing
process.env.LOCAL_FAKE_AI = "true";
const openai_1 = require("../src/services/openai");
(async () => {
    try {
        console.log("Running local test requests (LOCAL_FAKE_AI=true)");
        const debug = await (0, openai_1.generateDebugResponse)({
            code: 'print("hello world")',
            errorMessage: '',
            question: 'Why does this print newlines?'
        });
        console.log('--- DEBUG RESPONSE ---');
        console.log(JSON.stringify(debug, null, 2));
        const assignment = await (0, openai_1.generateAssignmentResponse)({
            question: 'Explain how binary search works and common bugs to watch for.',
            code: 'def binary_search(arr, target):\n    # student code\n    pass'
        });
        console.log('--- ASSIGNMENT RESPONSE ---');
        console.log(JSON.stringify(assignment, null, 2));
    }
    catch (err) {
        console.error('Test script error:', err);
        process.exit(1);
    }
})();
//# sourceMappingURL=testRequests.js.map