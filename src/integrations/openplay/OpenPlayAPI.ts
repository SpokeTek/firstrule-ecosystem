/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * OpenPlay Music API Integration Service
 * Handles communication with OpenPlay's music catalog and distribution API
 */

export interface OpenPlayConfig {
  apiKey: string;
  baseUrl: string;
  webhookSecret?: string;
}

export interface Artist {
  id: string;
  name: string;
  externalIds?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface Track {
  id: string;
  title: string;
  artistId: string;
  isrc?: string;
  duration?: number;
  metadata?: Record<string, any>;
  voiceModelId?: string; // Custom field to track voice model usage
  licenseInfo?: {
    licensee: string;
    licenseId: string;
    usageType: string;
    revenue?: number;
  };
}

export interface Release {
  id: string;
  title: string;
  artistId: string;
  type: 'single' | 'album' | 'ep';
  releaseDate: string;
  tracks: Track[];
  metadata?: Record<string, any>;
  distributors?: string[];
  upc?: string;
}

export interface WebhookEvent {
  id: string;
  type: 'release.created' | 'release.updated' | 'track.created' | 'track.updated';
  data: Release | Track;
  timestamp: string;
  signature?: string;
}

export class OpenPlayAPI {
  private config: OpenPlayConfig;
  private rateLimitRemaining = 1000;
  private rateLimitReset = 0;
  private useProxy: boolean;

  constructor(config: OpenPlayConfig) {
    this.config = config;
    // Use proxy in development, direct API in production
    this.useProxy = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Use proxy in development, direct API in production
    const baseUrl = this.useProxy ? '' : this.config.baseUrl;
    const proxyEndpoint = this.useProxy ? `/api/openplay${endpoint}` : endpoint;
    const url = `${baseUrl}${proxyEndpoint}`;

    console.log(`🌐 OpenPlay API Request: ${url}`);
    console.log(`🔑 Using ${this.useProxy ? 'proxy' : 'direct'} connection`);
    console.log(`🔑 API Key: ${this.config.apiKey ? '***' + this.config.apiKey.slice(-4) : 'not set'}`);

    // Check rate limiting
    if (this.rateLimitRemaining <= 1 && Date.now() < this.rateLimitReset) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitReset - Date.now()));
    }

    try {
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      };

      // Only add Authorization header for direct API calls (not proxy)
      if (!this.useProxy) {
        requestOptions.headers = {
          ...requestOptions.headers,
          'Authorization': `Bearer ${this.config.apiKey}`,
        };
      }

      const response = await fetch(url, requestOptions);

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      // Update rate limit info from headers
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      const rateLimitReset = response.headers.get('x-ratelimit-reset');

      if (rateLimitRemaining) {
        this.rateLimitRemaining = parseInt(rateLimitRemaining);
      }
      if (rateLimitReset) {
        this.rateLimitReset = parseInt(rateLimitReset) * 1000; // Convert to milliseconds
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ OpenPlay API Error Response:`, errorText);
        throw new Error(`OpenPlay API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ OpenPlay API Success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ OpenPlay API Network Error:`, error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (this.useProxy) {
          throw new Error(`Network error accessing OpenPlay API through proxy at ${url}. Check if the proxy server is running.`);
        } else {
          throw new Error(`Network error accessing OpenPlay API at ${url}. This may be due to CORS restrictions or network connectivity. Using demo mode.`);
        }
      }

      // Handle authentication errors specifically
      if (error.message.includes('401') || error.message.includes('Not authorized')) {
        throw new Error(`OpenPlay API authentication failed. The API credentials may not be valid for this environment. Using demo mode.`);
      }

      throw error;
    }
  }

  // Artists
  async getArtists(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ artists: Artist[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);

    return this.makeRequest(`/artists?${searchParams.toString()}`);
  }

  async getArtist(id: string): Promise<Artist> {
    return this.makeRequest(`/artists/${id}`);
  }

  async createArtist(artist: Omit<Artist, 'id'>): Promise<Artist> {
    return this.makeRequest('/artists', {
      method: 'POST',
      body: JSON.stringify(artist),
    });
  }

  async updateArtist(id: string, updates: Partial<Artist>): Promise<Artist> {
    return this.makeRequest(`/artists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Releases
  async getReleases(params?: {
    page?: number;
    limit?: number;
    artistId?: string;
    type?: 'single' | 'album' | 'ep';
    search?: string;
    from?: string;
    to?: string;
  }): Promise<{ releases: Release[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.artistId) searchParams.set('artistId', params.artistId);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);

    return this.makeRequest(`/releases?${searchParams.toString()}`);
  }

  async getRelease(id: string): Promise<Release> {
    return this.makeRequest(`/releases/${id}`);
  }

  async createRelease(release: Omit<Release, 'id'>): Promise<Release> {
    return this.makeRequest('/releases', {
      method: 'POST',
      body: JSON.stringify(release),
    });
  }

  async updateRelease(id: string, updates: Partial<Release>): Promise<Release> {
    return this.makeRequest(`/releases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Tracks
  async getTracks(params?: {
    page?: number;
    limit?: number;
    artistId?: string;
    releaseId?: string;
    search?: string;
    voiceModelId?: string; // Custom filter for voice model tracking
  }): Promise<{ tracks: Track[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.artistId) searchParams.set('artistId', params.artistId);
    if (params?.releaseId) searchParams.set('releaseId', params.releaseId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.voiceModelId) searchParams.set('metadata.voiceModelId', params.voiceModelId);

    return this.makeRequest(`/tracks?${searchParams.toString()}`);
  }

  async getTrack(id: string): Promise<Track> {
    return this.makeRequest(`/tracks/${id}`);
  }

  async updateTrack(id: string, updates: Partial<Track>): Promise<Track> {
    return this.makeRequest(`/tracks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Voice Model specific operations
  async getTracksWithVoiceModel(voiceModelId: string): Promise<Track[]> {
    const result = await this.getTracks({ voiceModelId });
    return result.tracks;
  }

  async getReleasesWithVoiceModel(voiceModelId: string): Promise<Release[]> {
    const tracks = await this.getTracksWithVoiceModel(voiceModelId);
    const releaseIds = [...new Set(tracks.map(track => track.metadata?.releaseId).filter(Boolean))];

    const releases = await Promise.all(
      releaseIds.map(id => this.getRelease(id as string))
    );

    return releases;
  }

  // Analytics and reporting
  async getVoiceModelUsageReport(voiceModelId: string, params?: {
    from?: string;
    to?: string;
    groupBy?: 'month' | 'quarter' | 'year';
  }): Promise<{
    totalTracks: number;
    totalReleases: number;
    totalRevenue: number;
    usage: Array<{
      period: string;
      tracks: number;
      releases: number;
      revenue: number;
    }>;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    if (params?.groupBy) searchParams.set('groupBy', params.groupBy);

    return this.makeRequest(`/analytics/voice-model/${voiceModelId}?${searchParams.toString()}`);
  }

  // Webhook signature verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      return false;
    }

    // This is a basic implementation - you'd want to use a proper crypto library
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }

  // Rate limit information
  getRateLimitInfo(): { remaining: number; reset: number } {
    return {
      remaining: this.rateLimitRemaining,
      reset: this.rateLimitReset,
    };
  }
}

// Factory function for creating API client
export function createOpenPlayClient(config: OpenPlayConfig): OpenPlayAPI {
  return new OpenPlayAPI(config);
}