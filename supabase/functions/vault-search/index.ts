import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    const modality = url.searchParams.get('modality');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter "q" is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for API key or user authentication
    const apiKey = req.headers.get('x-api-key');
    const authHeader = req.headers.get('Authorization');
    
    let partnerId: string | null = null;
    
    if (apiKey) {
      // Validate partner API key
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { data: keyData, error: keyError } = await supabaseAdmin
        .from('partner_api_keys')
        .select('partner_id, is_active, expires_at')
        .eq('key_hash', keyHash)
        .single();

      if (keyError || !keyData || !keyData.is_active) {
        return new Response(
          JSON.stringify({ error: 'Invalid API key' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      partnerId = keyData.partner_id;
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = partnerId 
      ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! 
      : Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
    });

    // Build search query
    let searchQuery = supabase
      .from('me_models')
      .select(`
        id,
        model_name,
        canonical_name,
        description,
        sample_url,
        is_active,
        provenance,
        created_at,
        artists (
          id,
          artist_name,
          bio
        ),
        licenses (
          id,
          license_type
        )
      `)
      .eq('is_active', true)
      .or(`model_name.ilike.%${query}%,canonical_name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    // Apply modality filter if provided
    if (modality) {
      searchQuery = searchQuery.contains('provenance', { modality });
    }

    const { data: models, error: searchError } = await searchQuery;

    if (searchError) {
      console.error('Search error:', searchError);
      return new Response(
        JSON.stringify({ error: 'Search failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter results based on partner access if applicable
    let filteredModels = models || [];
    
    if (partnerId) {
      const { data: accessData } = await supabase
        .from('partner_model_access')
        .select('model_id')
        .eq('partner_id', partnerId)
        .eq('is_active', true);

      const accessibleModelIds = new Set(accessData?.map(a => a.model_id) || []);
      filteredModels = filteredModels.filter(m => accessibleModelIds.has(m.id));
    }

    return new Response(
      JSON.stringify({
        results: filteredModels,
        count: filteredModels.length,
        query,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in vault-search function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});