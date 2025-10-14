import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openplay-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-openplay-signature');
    const payloadText = await req.text();
    
    // Verify webhook signature before processing
    const webhookSecret = Deno.env.get('OPENPLAY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('OPENPLAY_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!signature) {
      console.error('Missing webhook signature');
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Compute expected signature using HMAC-SHA256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(webhookSecret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureData = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payloadText)
    );
    const expectedSignature = Array.from(new Uint8Array(signatureData))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison to prevent timing attacks
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse payload after signature verification
    const payload = JSON.parse(payloadText);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store webhook event
    const { data: webhookEvent, error: webhookError } = await supabase
      .from('openplay_webhook_events')
      .insert({
        event_id: payload.event_id || crypto.randomUUID(),
        event_type: payload.event_type,
        payload: payload,
        signature: signature,
        processed: false,
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Error storing webhook:', webhookError);
      return new Response(
        JSON.stringify({ error: 'Failed to store webhook' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process webhook based on event type
    try {
      await processWebhookEvent(supabase, payload);

      // Mark as processed
      await supabase
        .from('openplay_webhook_events')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', webhookEvent.id);

    } catch (error) {
      console.error('Error processing webhook:', error);
      
      // Store error
      await supabase
        .from('openplay_webhook_events')
        .update({ 
          error_message: error instanceof Error ? error.message : 'Unknown error',
          processed_at: new Date().toISOString()
        })
        .eq('id', webhookEvent.id);
    }

    return new Response(
      JSON.stringify({ success: true, event_id: webhookEvent.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processWebhookEvent(supabase: any, payload: any) {
  const eventType = payload.event_type;

  switch (eventType) {
    case 'release.created':
    case 'release.updated':
      await handleReleaseEvent(supabase, payload);
      break;
    
    case 'track.created':
    case 'track.updated':
      await handleTrackEvent(supabase, payload);
      break;
    
    case 'analytics.stream_update':
      await handleStreamUpdate(supabase, payload);
      break;
    
    case 'analytics.revenue_update':
      await handleRevenueUpdate(supabase, payload);
      break;
    
    default:
      console.log('Unhandled event type:', eventType);
  }
}

async function handleReleaseEvent(supabase: any, payload: any) {
  const release = payload.data;
  
  const releaseData = {
    openplay_release_id: release.id,
    title: release.title,
    artist_name: release.artist_name,
    artist_id: release.artist_id,
    release_date: release.release_date,
    type: release.type,
    upc: release.upc,
    status: release.status,
    distributors: release.distributors || [],
    metadata: release.metadata || {},
  };

  const { error } = await supabase
    .from('commercial_releases')
    .upsert(releaseData, { onConflict: 'openplay_release_id' });

  if (error) throw error;
}

async function handleTrackEvent(supabase: any, payload: any) {
  const track = payload.data;
  
  // Find matching voice model if voice_model_reference exists
  let voiceModelId = null;
  if (track.voice_model_reference) {
    const { data: model } = await supabase
      .from('me_models')
      .select('id')
      .eq('canonical_name', track.voice_model_reference)
      .single();
    
    voiceModelId = model?.id;
  }

  const trackData = {
    openplay_track_id: track.id,
    commercial_release_id: null, // Will be set by release ID lookup
    voice_model_id: voiceModelId,
    title: track.title,
    isrc: track.isrc,
    track_number: track.track_number,
    duration_seconds: track.duration_seconds,
    voice_usage_type: track.voice_usage_type,
    usage_description: track.usage_description,
    prominence_score: track.prominence_score,
    openplay_metadata: track.metadata || {},
  };

  // Get release by openplay_release_id
  if (track.release_id) {
    const { data: release } = await supabase
      .from('commercial_releases')
      .select('id')
      .eq('openplay_release_id', track.release_id)
      .single();
    
    if (release) {
      trackData.commercial_release_id = release.id;
    }
  }

  const { error } = await supabase
    .from('commercial_tracks')
    .upsert(trackData, { onConflict: 'openplay_track_id' });

  if (error) throw error;
}

async function handleStreamUpdate(supabase: any, payload: any) {
  const data = payload.data;
  
  // Update track streams
  if (data.track_id) {
    const { data: track } = await supabase
      .from('commercial_tracks')
      .select('id')
      .eq('openplay_track_id', data.track_id)
      .single();

    if (track) {
      await supabase
        .from('commercial_tracks')
        .update({ 
          estimated_streams: data.total_streams,
          last_updated: new Date().toISOString()
        })
        .eq('id', track.id);
    }
  }

  // Update platform distributions
  if (data.platform && data.release_id) {
    const { data: release } = await supabase
      .from('commercial_releases')
      .select('id')
      .eq('openplay_release_id', data.release_id)
      .single();

    if (release) {
      await supabase
        .from('release_distributions')
        .upsert({
          commercial_release_id: release.id,
          platform: data.platform,
          platform_streams: data.platform_streams,
          last_updated: new Date().toISOString()
        }, { onConflict: 'commercial_release_id,platform' });
    }
  }
}

async function handleRevenueUpdate(supabase: any, payload: any) {
  const data = payload.data;
  
  if (data.track_id) {
    const { data: track } = await supabase
      .from('commercial_tracks')
      .select('id')
      .eq('openplay_track_id', data.track_id)
      .single();

    if (track) {
      await supabase
        .from('commercial_tracks')
        .update({ 
          estimated_revenue: data.total_revenue,
          last_updated: new Date().toISOString()
        })
        .eq('id', track.id);
    }
  }
}
