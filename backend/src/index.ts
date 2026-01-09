import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import debugRouter from "./routes/debug";
import assignmentRouter from "./routes/assignment";
import authRouter from "./routes/auth";
import workspaceRouter from "./routes/workspace";
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

// =============================================================================
// CORS Configuration
// =============================================================================
// In production, set ALLOWED_ORIGINS to your frontend domain(s), comma-separated
// Example: ALLOWED_ORIGINS=https://learning-first.ai,https://www.learning-first.ai
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3001", "http://localhost:5173"]; // Default dev origins

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// =============================================================================
// Rate Limiting
// =============================================================================
// Prevents abuse and controls API costs
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 20, // Limit each IP to 20 requests per minute
  message: {
    error: "Too many requests",
    message: "You have exceeded the rate limit. Please wait a moment before trying again.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: "Too many requests",
      message: "You have exceeded the rate limit. Please wait a moment before trying again.",
    });
  },
});

// Apply rate limiting to API routes only
app.use("/api", limiter);

// =============================================================================
// Body Parser with Size Limits
// =============================================================================
// Prevents large payload attacks
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// =============================================================================
// Routes
// =============================================================================

// Health check route (not rate limited)
app.get("/", (req, res) => {
  res.json({ 
    message: "Learning-First AI Debug Assistant - Backend API",
    status: "running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      assignment: "/api/assignment",
      workspace: "/api/workspace"
    }
  });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/debug", debugRouter);
app.use("/api/assignment", assignmentRouter);
app.use("/api/workspace", workspaceRouter);

// =============================================================================
// Error Handling
// =============================================================================
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Handle CORS errors specifically
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS error",
      message: "This origin is not allowed to access the API",
    });
  }
  
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "production" ? "An error occurred" : err.message,
  });
});

// =============================================================================
// Start Server
// =============================================================================
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  console.log(`📚 Assignment endpoint: http://${HOST}:${PORT}/api/assignment`);
  console.log(`✨ Workspace endpoint: http://${HOST}:${PORT}/api/workspace`);
  console.log(`🔒 CORS allowed origins: ${allowedOrigins.join(", ")}`);
  console.log(`⏱️  Rate limit: 20 requests per minute per IP`);
});
