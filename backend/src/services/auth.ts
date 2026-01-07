import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

// In-memory user storage (for MVP - replace with database in production)
interface User {
  id: string;
  email: string;
  password?: string; // hashed, optional for OAuth users
  name: string;
  createdAt: Date;
  provider?: 'local' | 'google'; // Track authentication provider
}

const users: Map<string, User> = new Map();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Lazy initialization of Google OAuth client (similar to OpenAI client)
// This ensures dotenv.config() has been called before the client is created
let googleClient: OAuth2Client | null = null;

function getGoogleClient(): OAuth2Client {
  if (!googleClient) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google OAuth not configured');
    }
    googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  }
  return googleClient;
}

export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: UserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): UserPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify Google ID token and get user info
 */
export async function verifyGoogleToken(idToken: string): Promise<{ email: string; name: string; picture?: string }> {
  const client = getGoogleClient();
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google OAuth not configured');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token');
    }

    const email = payload.email!;
    const name = (payload.name ?? email.split('@')[0]) as string;
    
    const result: { email: string; name: string; picture?: string } = {
      email,
      name,
    };
    
    if (payload.picture) {
      result.picture = payload.picture;
    }
    
    return result;
  } catch (error: any) {
    throw new Error('Failed to verify Google token: ' + (error.message || 'Invalid token'));
  }
}

/**
 * Create or get user by email
 */
export async function findOrCreateUser(email: string, name: string, provider: 'local' | 'google' = 'local', password?: string): Promise<UserPayload> {
  // Find existing user by email
  let existingUser: User | undefined;
  for (const user of users.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      existingUser = user;
      break;
    }
  }

  if (existingUser) {
    // User exists, return their info
    return {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
    };
  }

  // Create new user
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const userData: Partial<User> = {
    id,
    email: email.toLowerCase(),
    name,
    createdAt: new Date(),
    provider,
  };
  
  if (password) {
    userData.password = await hashPassword(password);
  }
  
  const user = userData as User;

  users.set(id, user);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

/**
 * Create a new user (local registration)
 */
export async function createUser(email: string, password: string, name: string): Promise<UserPayload> {
  // Check if user already exists
  for (const user of users.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      throw new Error('User with this email already exists');
    }
  }

  return findOrCreateUser(email, name, 'local', password);
}

/**
 * Authenticate a user (login)
 */
export async function authenticateUser(email: string, password: string): Promise<UserPayload> {
  // Find user by email
  let user: User | undefined;
  for (const u of users.values()) {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      user = u;
      break;
    }
  }

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user has a password (not OAuth-only)
  if (!user.password) {
    throw new Error('This account uses Google Sign-In. Please use Google to sign in.');
  }

  // Verify password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

/**
 * Authenticate or create user with Google OAuth
 */
export async function authenticateGoogleUser(idToken: string): Promise<UserPayload> {
  const googleUser = await verifyGoogleToken(idToken);
  const user = await findOrCreateUser(googleUser.email, googleUser.name, 'google');
  return user;
}

/**
 * Get user by ID
 */
export function getUserById(id: string): UserPayload | null {
  const user = users.get(id);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
