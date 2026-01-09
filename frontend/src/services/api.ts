export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ChatMode = 'assignment' | 'workspace';

export interface WorkspaceRequest {
  code: string;
  language: string;
  message: string;
  history: ChatMessage[];
  difficulty?: DifficultyLevel;
  action?: 'debug' | 'test' | 'feature' | 'chat';
}

export interface DebugRequest {
  message: string;
  history: ChatMessage[];
  difficulty?: DifficultyLevel;
}

export interface AssignmentRequest {
  message: string;
  history: ChatMessage[];
  difficulty?: DifficultyLevel;
}

export interface DebugResponse {
  content: string;
}

// API URL configuration
// In development: Uses Vite proxy (/api)
// In production: Set VITE_API_URL to your backend URL (e.g., https://api.learning-first.ai)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Removes any JSON metadata blocks from the AI response.
 * The prompt instructs the AI to include metadata for developers,
 * but we don't want to show it to end users.
 */
function stripMetadata(content: string): string {
  let cleaned = content;
  
  // Remove markdown JSON code blocks with metadata
  cleaned = cleaned.replace(/```json\s*\{[\s\S]*?"(?:diagnosis_confidence|safety_decision|hint_level|lines_referenced)"[\s\S]*?\}\s*```/gi, '');
  
  // Remove inline JSON objects with metadata keys
  cleaned = cleaned.replace(/\{[\s\S]*?"(?:diagnosis_confidence|safety_decision|hint_level|lines_referenced)"[\s\S]*?\}/gi, '');
  
  // Remove any "Metadata:" or "Developer metadata:" sections
  cleaned = cleaned.replace(/(?:Metadata|Developer metadata|Internal metadata)[:\s]*[\s\S]*?(?=\n\n|$)/gi, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  return cleaned;
}

export async function sendMessage(request: DebugRequest): Promise<DebugResponse> {
  const response = await fetch(`${API_BASE_URL}/debug`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to get response');
  }

  const data = await response.json();
  
  // Strip any developer metadata from the response before showing to users
  const cleanContent = stripMetadata(data.content || '');
  
  return {
    content: cleanContent,
  };
}

export async function sendAssignmentMessage(request: AssignmentRequest): Promise<DebugResponse> {
  const response = await fetch(`${API_BASE_URL}/assignment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to get response');
  }

  const data = await response.json();
  
  // Strip any developer metadata from the response before showing to users
  const cleanContent = stripMetadata(data.content || '');
  
  return {
    content: cleanContent,
  };
}

export async function sendWorkspaceMessage(request: WorkspaceRequest): Promise<DebugResponse> {
  const response = await fetch(`${API_BASE_URL}/workspace`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to get workspace response');
  }

  const data = await response.json();
  const cleanContent = stripMetadata(data.content || '');
  
  return {
    content: cleanContent,
  };
}

// Authentication API functions
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Login failed');
  }

  const data = await response.json();
  return {
    token: data.token,
    user: data.user,
  };
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Registration failed');
  }

  const data = await response.json();
  return {
    token: data.token,
    user: data.user,
  };
}

export async function getCurrentUser(token: string): Promise<{ id: string; email: string; name: string }> {
  // For MVP, we'll decode the JWT token on the client side
  // In production, you might want a /auth/me endpoint that validates the token server-side
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export interface GoogleAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Google authentication failed');
  }

  const data = await response.json();
  return {
    token: data.token,
    user: data.user,
  };
}
