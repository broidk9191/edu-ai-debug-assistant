import axios from "axios";

export interface ContentSafetyResult {
  safe: boolean;
  categories?: {
    hate?: number;
    selfHarm?: number;
    sexual?: number;
    violence?: number;
  };
  severity?: number;
  reason?: string;
}

/**
 * Validate that Azure AI Content Safety is configured
 */
export function validateContentSafetyConfig(): void {
  const endpoint = process.env.AZURE_CONTENT_SAFETY_ENDPOINT;
  const apiKey = process.env.AZURE_CONTENT_SAFETY_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error(
      "Azure AI Content Safety is required but not configured. Please set AZURE_CONTENT_SAFETY_ENDPOINT and AZURE_CONTENT_SAFETY_API_KEY environment variables."
    );
  }
}

/**
 * Check content safety using Azure AI Content Safety API
 * Requires AZURE_CONTENT_SAFETY_ENDPOINT and AZURE_CONTENT_SAFETY_API_KEY to be set
 */
export async function checkContentSafety(
  text: string
): Promise<ContentSafetyResult> {
  const endpoint = process.env.AZURE_CONTENT_SAFETY_ENDPOINT;
  const apiKey = process.env.AZURE_CONTENT_SAFETY_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error(
      "Azure AI Content Safety is required but not configured. Please set AZURE_CONTENT_SAFETY_ENDPOINT and AZURE_CONTENT_SAFETY_API_KEY environment variables."
    );
  }

  try {
    const response = await axios.post(
      `${endpoint}/contentsafety/text:analyze?api-version=2024-02-15-preview`,
      {
        text: text,
        categories: ["Hate", "SelfHarm", "Sexual", "Violence"],
      },
      {
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data;
    const categories = result.categoriesAnalysis || {};
    
    // Check if any category is flagged
    const hasIssues = Object.values(categories).some(
      (cat: any) => cat.severity && cat.severity > 0
    );

    // Check for academic misuse patterns
    const misusePatterns = [
      /submit.*assignment/i,
      /turn.*in.*assignment/i,
      /complete.*assignment/i,
      /do.*my.*homework/i,
      /give.*me.*the.*code/i,
      /full.*solution/i,
    ];

    const hasMisuse = misusePatterns.some((pattern) => pattern.test(text));

    const reason = hasIssues
      ? "Content flagged by safety filters"
      : hasMisuse
      ? "Potential academic misuse detected"
      : undefined;

    return {
      safe: !hasIssues && !hasMisuse,
      categories: {
        hate: categories.Hate?.severity || 0,
        selfHarm: categories.SelfHarm?.severity || 0,
        sexual: categories.Sexual?.severity || 0,
        violence: categories.Violence?.severity || 0,
      },
      severity: Math.max(
        ...Object.values(categories).map((cat: any) => cat.severity || 0)
      ),
      ...(reason && { reason }),
    };
  } catch (error: any) {
    console.error("Error checking content safety:", error.message);
    // Fail closed - reject content if safety check fails
    throw new Error(`Content safety check failed: ${error.message}`);
  }
}

/**
 * Check for academic misuse specifically
 */
export function checkAcademicMisuse(text: string): boolean {
  const misusePhrases = [
    "submit",
    "turnin",
    "final assignment",
    "complete assignment",
    "do my homework",
    "complete this for me",
    "give me the code",
    "full solution",
    "entire solution",
  ];

  const lowerText = text.toLowerCase();
  return misusePhrases.some((phrase) => lowerText.includes(phrase));
}

