import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    console.log('=== Incoming Request ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Pathname:', url.pathname);
    
    // Log all headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Request headers:', JSON.stringify(headers, null, 2));
    
    // Extract the path after /functions/v1/openplay-proxy
    // The pathname might be duplicated: /functions/v1/openplay-proxy/functions/v1/openplay-proxy/artists
    let path = url.pathname;
    
    // Remove ALL occurrences of the Edge Function prefix to handle duplication
    while (path.includes('/functions/v1/openplay-proxy')) {
      path = path.replace('/functions/v1/openplay-proxy', '');
    }
    while (path.includes('/openplay-proxy')) {
      path = path.replace('/openplay-proxy', '');
    }
    
    // If path is empty, default to root
    if (!path || path === '') {
      path = '/';
    }
    
    const queryString = url.search;
    console.log('Extracted API path:', path);
    console.log('Query string:', queryString);
    
    // Get OpenPlay credentials from environment
    // OpenPlay uses Basic Authentication with API Key ID and API Secret Key
    const openplayApiKeyId = Deno.env.get('OPENPLAY_API_KEY_ID');
    const openplayApiSecret = Deno.env.get('OPENPLAY_API_SECRET');
    const openplayBaseUrl = Deno.env.get('OPENPLAY_BASE_URL') || 'https://newwest.opstaging.com/connect/v2';
    
    console.log('OpenPlay API Key ID:', openplayApiKeyId ? 'SET' : 'NOT SET');
    console.log('OpenPlay API Secret:', openplayApiSecret ? 'SET' : 'NOT SET');
    console.log('OpenPlay Base URL:', openplayBaseUrl);
    
    if (!openplayApiKeyId || !openplayApiSecret) {
      console.error('OPENPLAY_API_KEY_ID or OPENPLAY_API_SECRET not set');
      return new Response(
        JSON.stringify({ error: 'OpenPlay credentials not configured. Need both API Key ID and API Secret.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build the target URL
    const targetUrl = `${openplayBaseUrl}${path}${queryString}`;
    console.log('Proxying request to:', targetUrl);
    console.log('Request method:', req.method);
    
    // Create Basic Auth header using API Key ID as username and API Secret as password
    const credentials = btoa(`${openplayApiKeyId}:${openplayApiSecret}`);
    console.log('Using Basic Authentication');
    
    // Forward the request to OpenPlay API with Basic Auth
    const openplayResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'FirstRule-CoWriter/1.0',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
    });

    console.log('OpenPlay response status:', openplayResponse.status);
    console.log('OpenPlay response headers:', Object.fromEntries(openplayResponse.headers.entries()));

    // Get response body
    const responseText = await openplayResponse.text();
    console.log('OpenPlay response body (first 500 chars):', responseText.slice(0, 500));
    
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
      console.log('Parsed response data:', JSON.stringify(responseData).slice(0, 200));
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      // If not JSON, return as text
      responseData = { error: 'Invalid JSON response', data: responseText };
    }

    // Return the response with CORS headers
    return new Response(
      JSON.stringify(responseData),
      {
        status: openplayResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in openplay-proxy:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

