/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * OpenPlay Music API Integration Service
 * Handles communication with OpenPlay's music catalog and distribution API
 */

export interface OpenPlayConfig {
  apiKey: string;
  apiSecret?: string; // Optional, not used for Bearer auth
  baseUrl: string;
  webhookSecret?: string;
  supabaseAnonKey?: string; // For authenticating with Supabase Edge Functions
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

  constructor(config: OpenPlayConfig) {
    this.config = config;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    console.log(`=== OpenPlayAPI.makeRequest ===`);
    console.log(`baseUrl: ${this.config.baseUrl}`);
    console.log(`endpoint: ${endpoint}`);
    
    const url = `${this.config.baseUrl}${endpoint}`;
    const isUsingProxy = url.includes('/functions/v1/');
    
    console.log(`Final URL: ${url}`);
    console.log(`Using Supabase Edge Function proxy: ${isUsingProxy}`);

    // Check rate limiting
    if (this.rateLimitRemaining <= 1 && Date.now() < this.rateLimitReset) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitReset - Date.now()));
    }
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      // If using Supabase Edge Function proxy, only send the Supabase anon key
      // The Edge Function will handle OpenPlay authentication
      if (isUsingProxy && this.config.supabaseAnonKey) {
        headers['apikey'] = this.config.supabaseAnonKey;
        headers['Authorization'] = `Bearer ${this.config.supabaseAnonKey}`; // Supabase also needs this
        console.log(`Using Edge Function proxy - auth handled server-side`);
        console.log(`Supabase anon key (first 20): ${this.config.supabaseAnonKey.slice(0, 20)}...`);
      } else {
        // Direct API call - use Bearer token (not used in current setup)
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        console.log(`Direct API call with Bearer token`);
      }
      
      console.log(`Request headers:`, Object.keys(headers));
      console.log(`Headers being sent:`, headers);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`Response status: ${response.status} ${response.statusText}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

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
        console.error(`API Error Response:`, errorText);
        throw new Error(`OpenPlay API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Response data:`, data);
      return data;
    } catch (error) {
      console.error(`Fetch error:`, error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error(`This is likely a CORS issue. The browser is blocking the request.`);
        console.error(`Check if the API server allows requests from ${window.location.origin}`);
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
    // OpenPlay uses 'filters[name]' for filtering by artist name
    // The search term should be URL encoded (URLSearchParams handles this automatically)
    if (params?.search) {
      const encodedSearch = params.search.trim();
      searchParams.set('filters[name]', encodedSearch);
      console.log(`Search params: ${searchParams.toString()}`);
    }

    const response = await this.makeRequest<{
      results: Array<{ id: number; name: string; [key: string]: any }>;
      current_page: number;
      total_results: number;
      result_range: string;
    }>(`/artists/?${searchParams.toString()}`);

    // Transform OpenPlay API response to our expected format
    return {
      artists: response.results.map(result => ({
        id: result.id.toString(),
        name: result.name,
        externalIds: {},
        metadata: result
      })),
      total: response.total_results,
      page: response.current_page,
      limit: params?.limit || 50
    };
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