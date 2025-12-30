import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import debugRouter from "./routes/debug";
import assignmentRouter from "./routes/assignment";
import { validateContentSafetyConfig } from "./services/contentSafety";

dotenv.config();

// Validate required environment variables on startup
function validateEnvironment(): void {
  const requiredVars = {
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Validate Content Safety configuration (required)
  validateContentSafetyConfig();
}

try {
  validateEnvironment();
} catch (error: any) {
  console.error("❌ Environment validation failed:", error.message);
  process.exit(1);
}

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "Learning-First AI Debug Assistant - Backend API",
    status: "running",
    version: "1.0.0",
    endpoints: {
      debug: "/api/debug",
      assignment: "/api/assignment"
    }
  });
});

// API routes
app.use("/api/debug", debugRouter);
app.use("/api/assignment", assignmentRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start server (bind explicitly to host to ensure HTTP requests from this machine succeed)
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  console.log(`📝 Debug endpoint: http://${HOST}:${PORT}/api/debug`);
  console.log(`📚 Assignment endpoint: http://${HOST}:${PORT}/api/assignment`);
});
