/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * OpenPlay Webhook Handler
 * Processes real-time notifications from OpenPlay about releases and tracks
 */

import { OpenPlayAPI, WebhookEvent } from './OpenPlayAPI';

export interface WebhookContext {
  openplayAPI: OpenPlayAPI;
  supabase: any; // Supabase client
  logger: any; // Logger instance
}

export interface WebhookResult {
  success: boolean;
  processed: boolean;
  error?: string;
  data?: any;
}

export class OpenPlayWebhookHandler {
  private openplayAPI: OpenPlayAPI;
  private supabase: any;
  private logger: any;

  constructor(context: WebhookContext) {
    this.openplayAPI = context.openplayAPI;
    this.supabase = context.supabase;
    this.logger = context.logger;
  }

  /**
   * Main webhook handler - routes to appropriate handlers based on event type
   */
  async handleWebhook(payload: string, signature: string): Promise<WebhookResult> {
    try {
      // Verify webhook signature
      if (!this.openplayAPI.verifyWebhookSignature(payload, signature)) {
        return {
          success: false,
          processed: false,
          error: 'Invalid webhook signature'
        };
      }

      const event: WebhookEvent = JSON.parse(payload);
      this.logger.info('Processing webhook event', { type: event.type, id: event.id });

      // Store webhook event for audit trail
      await this.storeWebhookEvent(event);

      // Route to appropriate handler
      let result: WebhookResult;
      switch (event.type) {
        case 'release.created':
          result = await this.handleReleaseCreated(event.data as any);
          break;
        case 'release.updated':
          result = await this.handleReleaseUpdated(event.data as any);
          break;
        case 'track.created':
          result = await this.handleTrackCreated(event.data as any);
          break;
        case 'track.updated':
          result = await this.handleTrackUpdated(event.data as any);
          break;
        default:
          result = {
            success: true,
            processed: false,
            error: `Unhandled event type: ${event.type}`
          };
      }

      // Mark webhook as processed
      await this.markWebhookProcessed(event.id, result);

      return result;

    } catch (error) {
      this.logger.error('Webhook processing failed', { error: error.message });
      return {
        success: false,
        processed: false,
        error: error.message
      };
    }
  }

  /**
   * Handle new release creation
   */
  private async handleReleaseCreated(release: any): Promise<WebhookResult> {
    try {
      // Check if any tracks in this release use voice models
      const voiceModelTracks = await this.findVoiceModelTracks(release.tracks);

      if (voiceModelTracks.length === 0) {
        return {
          success: true,
          processed: false,
          data: { message: 'No voice model tracks found in release' }
        };
      }

      // Create commercial release record
      const { data: commercialRelease, error: releaseError } = await this.supabase
        .from('commercial_releases')
        .upsert({
          openplay_release_id: release.id,
          title: release.title,
          artist_name: release.artist?.name || 'Unknown Artist',
          artist_id: release.artistId,
          type: release.type,
          release_date: release.releaseDate,
          upc: release.upc,
          distributors: release.distributors || [],
          metadata: release.metadata || {},
          total_tracks: voiceModelTracks.length,
          status: 'active'
        })
        .select()
        .single();

      if (releaseError) {
        throw new Error(`Failed to create commercial release: ${releaseError.message}`);
      }

      // Process tracks that use voice models
      const processedTracks = await Promise.all(
        voiceModelTracks.map(track => this.processTrackWithVoiceModel(track, commercialRelease.id))
      );

      this.logger.info('Commercial release created', {
        releaseId: release.id,
        commercialReleaseId: commercialRelease.id,
        voiceModelTracks: processedTracks.length
      });

      return {
        success: true,
        processed: true,
        data: {
          commercialRelease,
          processedTracks: processedTracks.length
        }
      };

    } catch (error) {
      this.logger.error('Failed to handle release.created', { error: error.message, releaseId: release.id });
      return {
        success: false,
        processed: false,
        error: error.message
      };
    }
  }

  /**
   * Handle release updates
   */
  private async handleReleaseUpdated(release: any): Promise<WebhookResult> {
    try {
      // Update existing commercial release
      const { data: commercialRelease, error: updateError } = await this.supabase
        .from('commercial_releases')
        .update({
          title: release.title,
          artist_name: release.artist?.name,
          type: release.type,
          release_date: release.releaseDate,
          upc: release.upc,
          distributors: release.distributors,
          metadata: release.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('openplay_release_id', release.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update commercial release: ${updateError.message}`);
      }

      // Process any new tracks that might contain voice models
      const existingTracks = await this.supabase
        .from('commercial_tracks')
        .select('openplay_track_id')
        .eq('commercial_release_id', commercialRelease.id);

      const existingTrackIds = new Set(existingTracks.data?.map((t: any) => t.openplay_track_id) || []);
      const newTracks = release.tracks.filter((track: any) => !existingTrackIds.has(track.id));

      if (newTracks.length > 0) {
        const voiceModelTracks = await this.findVoiceModelTracks(newTracks);
        await Promise.all(
          voiceModelTracks.map(track => this.processTrackWithVoiceModel(track, commercialRelease.id))
        );
      }

      return {
        success: true,
        processed: true,
        data: { commercialRelease }
      };

    } catch (error) {
      this.logger.error('Failed to handle release.updated', { error: error.message, releaseId: release.id });
      return {
        success: false,
        processed: false,
        error: error.message
      };
    }
  }

  /**
   * Handle individual track creation
   */
  private async handleTrackCreated(track: any): Promise<WebhookResult> {
    try {
      // Check if this track uses a voice model
      const voiceModelInfo = await this.getVoiceModelInfo(track);

      if (!voiceModelInfo) {
        return {
          success: true,
          processed: false,
          data: { message: 'Track does not use voice model' }
        };
      }

      // Find associated commercial release
      const { data: commercialRelease } = await this.supabase
        .from('commercial_releases')
        .select('*')
        .eq('openplay_release_id', track.releaseId)
        .single();

      if (!commercialRelease) {
        return {
          success: true,
          processed: false,
          data: { message: 'No commercial release found for track' }
        };
      }

      // Process the track
      const processedTrack = await this.processTrackWithVoiceModel(track, commercialRelease.id, voiceModelInfo);

      return {
        success: true,
        processed: true,
        data: { processedTrack }
      };

    } catch (error) {
      this.logger.error('Failed to handle track.created', { error: error.message, trackId: track.id });
      return {
        success: false,
        processed: false,
        error: error.message
      };
    }
  }

  /**
   * Handle track updates
   */
  private async handleTrackUpdated(track: any): Promise<WebhookResult> {
    try {
      // Update existing commercial track
      const { data: commercialTrack, error: updateError } = await this.supabase
        .from('commercial_tracks')
        .update({
          title: track.title,
          isrc: track.isrc,
          duration_seconds: track.duration,
          openplay_metadata: track.metadata || {},
          updated_at: new Date().toISOString()
        })
        .eq('openplay_track_id', track.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update commercial track: ${updateError.message}`);
      }

      return {
        success: true,
        processed: true,
        data: { commercialTrack }
      };

    } catch (error) {
      this.logger.error('Failed to handle track.updated', { error: error.message, trackId: track.id });
      return {
        success: false,
        processed: false,
        error: error.message
      };
    }
  }

  /**
   * Find tracks that contain voice models
   */
  private async findVoiceModelTracks(tracks: any[]): Promise<any[]> {
    const voiceModelTracks = [];

    for (const track of tracks) {
      const voiceModelInfo = await this.getVoiceModelInfo(track);
      if (voiceModelInfo) {
        voiceModelTracks.push({
          ...track,
          voiceModelInfo
        });
      }
    }

    return voiceModelTracks;
  }

  /**
   * Get voice model information for a track
   */
  private async getVoiceModelInfo(track: any): Promise<any | null> {
    // Check if track metadata contains voice model information
    if (track.metadata?.voiceModelId) {
      // Look up the voice model in our database
      const { data: voiceModel } = await this.supabase
        .from('voice_models')
        .select('*')
        .eq('id', track.metadata.voiceModelId)
        .single();

      if (voiceModel) {
        return {
          voiceModelId: voiceModel.id,
          licenseId: track.metadata.licenseId,
          usageType: track.metadata.voiceUsageType || 'other',
          prominenceScore: track.metadata.prominenceScore || 0.5,
          usageDescription: track.metadata.usageDescription
        };
      }
    }

    // Alternative: Check if track title or metadata mentions voice models
    // This would depend on your specific naming conventions or metadata standards
    const voiceModelKeywords = ['ai voice', 'voice model', 'synthetic vocal', 'vocal synthesis'];
    const hasVoiceModelKeyword = voiceModelKeywords.some(keyword =>
      track.title.toLowerCase().includes(keyword) ||
      track.metadata?.description?.toLowerCase().includes(keyword)
    );

    if (hasVoiceModelKeyword) {
      // This would need manual review or automated matching
      this.logger.info('Potential voice model track detected', {
        trackId: track.id,
        title: track.title
      });
    }

    return null;
  }

  /**
   * Process a track that contains voice model usage
   */
  private async processTrackWithVoiceModel(track: any, commercialReleaseId: string, voiceModelInfo?: any): Promise<any> {
    const info = voiceModelInfo || await this.getVoiceModelInfo(track);

    if (!info) {
      throw new Error('No voice model information found for track');
    }

    // Create commercial track record
    const { data: commercialTrack, error: trackError } = await this.supabase
      .from('commercial_tracks')
      .upsert({
        openplay_track_id: track.id,
        commercial_release_id: commercialReleaseId,
        title: track.title,
        isrc: track.isrc,
        duration_seconds: track.duration,
        track_number: track.trackNumber,
        voice_model_id: info.voiceModelId,
        license_id: info.licenseId,
        voice_usage_type: info.usageType,
        prominence_score: info.prominenceScore,
        usage_description: info.usageDescription,
        openplay_metadata: track.metadata || {}
      })
      .select()
      .single();

    if (trackError) {
      throw new Error(`Failed to create commercial track: ${trackError.message}`);
    }

    // Trigger revenue reconciliation task
    await this.scheduleRevenueReconciliation(commercialTrack.id);

    return commercialTrack;
  }

  /**
   * Store webhook event for audit trail
   */
  private async storeWebhookEvent(event: WebhookEvent): Promise<void> {
    await this.supabase
      .from('openplay_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        payload: event,
        signature: event.signature,
        created_at: event.timestamp
      });
  }

  /**
   * Mark webhook as processed
   */
  private async markWebhookProcessed(eventId: string, result: WebhookResult): Promise<void> {
    await this.supabase
      .from('openplay_webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        error_message: result.error
      })
      .eq('event_id', eventId);
  }

  /**
   * Schedule revenue reconciliation for a track
   */
  private async scheduleRevenueReconciliation(commercialTrackId: string): Promise<void> {
    // This would typically queue a background job
    // For now, we'll just log it
    this.logger.info('Revenue reconciliation scheduled', { commercialTrackId });
  }
}

// Express.js webhook endpoint handler
export function createWebhookEndpoint(webhookHandler: OpenPlayWebhookHandler) {
  return async (req: any, res: any) => {
    const signature = req.headers['x-openplay-signature'] || req.headers['x-signature'];
    const payload = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    try {
      const result = await webhookHandler.handleWebhook(
        JSON.stringify(payload),
        signature
      );

      if (result.success) {
        return res.status(200).json({
          received: true,
          processed: result.processed,
          data: result.data
        });
      } else {
        return res.status(500).json({
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  };
}