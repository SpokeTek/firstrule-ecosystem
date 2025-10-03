import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { partner_id, name, scopes = ['read'], rate_limit_per_minute = 60 } = await req.json();

    if (!partner_id || !name) {
      return new Response(
        JSON.stringify({ error: 'partner_id and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is admin of the partner organization
    const { data: partnerUser, error: partnerUserError } = await supabase
      .from('partner_users')
      .select('role')
      .eq('partner_id', partner_id)
      .eq('user_id', user.id)
      .single();

    if (partnerUserError || !partnerUser || !['owner', 'admin'].includes(partnerUser.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate API key
    const keyBytes = new Uint8Array(32);
    crypto.getRandomValues(keyBytes);
    const apiKey = 'fr_' + Array.from(keyBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Hash the API key
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store the hashed key
    const { data: keyData, error: keyError } = await supabase
      .from('partner_api_keys')
      .insert({
        partner_id,
        key_hash: keyHash,
        key_prefix: apiKey.substring(0, 12) + '...',
        name,
        scopes,
        rate_limit_per_minute,
        created_by: user.id,
      })
      .select()
      .single();

    if (keyError) {
      console.error('Error creating API key:', keyError);
      return new Response(
        JSON.stringify({ error: 'Failed to create API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the API key (only shown once)
    return new Response(
      JSON.stringify({
        api_key: apiKey,
        key_id: keyData.id,
        key_prefix: keyData.key_prefix,
        message: 'Store this key securely - it will not be shown again',
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-generate-key function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});