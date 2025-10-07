import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Helper to validate API key
async function validateApiKey(apiKey: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const { data: keyData, error } = await supabase
    .from('partner_api_keys')
    .select(`
      id,
      partner_id,
      scopes,
      is_active,
      expires_at,
      partner_organizations (
        status
      )
    `)
    .eq('key_hash', keyHash)
    .single();

  if (error || !keyData || !keyData.is_active) {
    return null;
  }

  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return null;
  }

  const partner = keyData.partner_organizations as any;
  if (partner.status !== 'active') {
    return null;
  }

  // Update last used
  await supabase
    .from('partner_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id);

  return {
    partnerId: keyData.partner_id,
    scopes: keyData.scopes || [],
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const auth = await validateApiKey(apiKey);
    if (!auth) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/partner-api', '');
    const method = req.method;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GET /models/{id} - Retrieve specific model
    if (method === 'GET' && path.match(/^\/models\/[^/]+$/)) {
      const modelId = path.split('/')[2];
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(modelId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid model ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check access
      const { data: access } = await supabase
        .from('partner_model_access')
        .select('id')
        .eq('partner_id', auth.partnerId)
        .eq('model_id', modelId)
        .eq('is_active', true)
        .single();

      if (!access) {
        return new Response(
          JSON.stringify({ error: 'Access denied to this model' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: model, error } = await supabase
        .from('me_models')
        .select(`
          id,
          model_name,
          canonical_name,
          description,
          sample_url,
          provenance,
          created_at,
          artists (
            id,
            artist_name,
            bio
          )
        `)
        .eq('id', modelId)
        .eq('is_active', true)
        .single();

      if (error || !model) {
        return new Response(
          JSON.stringify({ error: 'Model not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(model),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /licenses - Create a license
    if (method === 'POST' && path === '/licenses') {
      if (!auth.scopes.includes('write')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { model_id, licensee_email, license_type, terms } = body;

      // Validate inputs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!model_id || !licensee_email || !license_type) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!uuidRegex.test(model_id) || !emailRegex.test(licensee_email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid input format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check access to model
      const { data: access } = await supabase
        .from('partner_model_access')
        .select('id')
        .eq('partner_id', auth.partnerId)
        .eq('model_id', model_id)
        .eq('is_active', true)
        .single();

      if (!access) {
        return new Response(
          JSON.stringify({ error: 'Access denied to this model' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create license
      const { data: license, error } = await supabase
        .from('licenses')
        .insert({
          model_id,
          licensee_email,
          license_type,
          terms,
          issued_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('License creation error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create license' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(license),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /usage - Get usage statistics
    if (method === 'GET' && path === '/usage') {
      const modelId = url.searchParams.get('model_id');
      
      let query = supabase
        .from('usage_records')
        .select(`
          id,
          recorded_at,
          status,
          usage_metadata,
          licenses (
            id,
            license_type
          ),
          me_models (
            id,
            model_name
          )
        `)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (modelId) {
        query = query.eq('model_id', modelId);
      }

      const { data: usage, error } = await query;

      if (error) {
        console.error('Usage query error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch usage data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ usage, count: usage?.length || 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /usage - Record usage
    if (method === 'POST' && path === '/usage') {
      if (!auth.scopes.includes('write')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { model_id, license_id, usage_metadata } = body;

      // Validate UUIDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!model_id || !license_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!uuidRegex.test(model_id) || !uuidRegex.test(license_id)) {
        return new Response(
          JSON.stringify({ error: 'Invalid UUID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: record, error } = await supabase
        .from('usage_records')
        .insert({
          model_id,
          license_id,
          usage_metadata,
          recorded_at: new Date().toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Usage record error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to record usage' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(record),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in partner-api function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
