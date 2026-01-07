import { Router, Request, Response } from 'express';
import { createUser, authenticateUser, generateToken, authenticateGoogleUser } from '../services/auth';

const router = Router();

interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name }: RegisterRequestBody = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
      });
    }

    // Name validation
    if (name.trim().length < 2) {
      return res.status(400).json({
        error: 'Name must be at least 2 characters long',
      });
    }

    // Create user
    const user = await createUser(email.trim(), password, name.trim());

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        error: error.message,
      });
    }

    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to register user',
    });
  }
});

/**
 * POST /api/auth/login
 * Login an existing user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequestBody = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Authenticate user
    const user = await authenticateUser(email.trim(), password);

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        error: error.message,
      });
    }

    console.error('Login error:', error);
    res.status(500).json({
      error: 'Failed to login',
    });
  }
});

/**
 * POST /api/auth/google
 * Login or register with Google OAuth
 */
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: 'Google ID token is required',
      });
    }

    // Verify Google token and get/create user
    const user = await authenticateGoogleUser(idToken);

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    res.status(401).json({
      error: error.message || 'Google authentication failed',
    });
  }
});

export default router;
