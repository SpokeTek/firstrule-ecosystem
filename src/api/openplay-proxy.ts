/**
 * OpenPlay API Proxy - Server-side proxy to handle CORS issues
 * This would typically be a server-side API route, but for now we'll provide
 * a fallback mechanism to handle the CORS limitations
 */

// This would be the server-side implementation
// For now, we'll enhance the client-side to handle CORS gracefully

export interface OpenPlayProxyConfig {
  apiKey: string;
  baseUrl: string;
}

export class OpenPlayProxy {
  private config: OpenPlayProxyConfig;

  constructor(config: OpenPlayProxyConfig) {
    this.config = config;
  }

  // This method would be implemented on the server side
  async getArtists(params?: { page?: number; limit?: number; search?: string }) {
    // For now, return an error that explains the CORS limitation
    throw new Error(
      'Direct browser access to OpenPlay API is blocked by CORS. ' +
      'To fix this, implement a server-side proxy at /api/openplay/artists ' +
      'that forwards requests to the OpenPlay API with proper CORS headers.'
    );
  }
}

// Enhanced client implementation that detects CORS issues
export async function detectCORSIssue(url: string): Promise<boolean> {
  try {
    // Try a simple OPTIONS request to check CORS
    const response = await fetch(url, {
      method: 'OPTIONS',
      mode: 'cors'
    });
    return false; // If we get here, CORS is working
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('CORS')) {
      return true; // CORS issue detected
    }
    return false; // Different kind of error
  }
}