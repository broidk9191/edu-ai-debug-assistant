export interface DebugRequest {
  code: string;
  question?: string;
}

export interface DebugResponse {
  summary: string;
  rootCause: string;
  hints: string[];
  reflection: string[];
}

/**
 * Parses the raw content string from the backend into a structured object.
 * The backend currently returns markdown with labeled sections.
 */
function parseBackendResponse(data: any): DebugResponse {
  // If the data already has the desired structure, return it
  if (data.summary && data.rootCause) {
    return data;
  }

  // Otherwise, we expect { content: string, metadata: ... }
  const content = data.content || '';
  
  // Basic parsing for the markdown structure defined in debug_prompt_v1.md
  const summaryMatch = content.match(/(?:Summary|Short one-line summary)[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
  const rootCauseMatch = content.match(/(?:Root [Cc]ause)[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
  
  // Extract hints (look for lines starting with "Hint" or bullet points under a Hints header)
  const hintsMatch = content.match(/(?:Hints|Guided hints)[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
  const hints = hintsMatch 
    ? hintsMatch[1].split('\n').map(h => h.replace(/^[-*]\s*/, '').trim()).filter(h => h.length > 0)
    : [];

  // Extract reflection questions
  const reflectionMatch = content.match(/(?:Reflection questions)[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
  const reflection = reflectionMatch 
    ? reflectionMatch[1].split('\n').map(r => r.replace(/^[-*]\s*/, '').trim()).filter(r => r.length > 0)
    : [];

  return {
    summary: summaryMatch ? summaryMatch[1].trim() : (content.substring(0, 200) + '...'),
    rootCause: rootCauseMatch ? rootCauseMatch[1].trim() : 'Refer to the detailed analysis below.',
    hints: hints.length > 0 ? hints : ['Check the analysis for guided steps.'],
    reflection: reflection.length > 0 ? reflection : ['How does this change your understanding of the issue?']
  };
}

// Using relative path to take advantage of Vite's proxy configured in vite.config.ts
const API_BASE_URL = '/api';

export async function getDebugHints(request: DebugRequest): Promise<DebugResponse> {
  const response = await fetch(`${API_BASE_URL}/debug`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to fetch debug hints');
  }

  const data = await response.json();
  return parseBackendResponse(data);
}
