import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
  const { audioUrl, userPrompt, artistNames } = await req.json();

  // Input validation
  if (!userPrompt || typeof userPrompt !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Invalid or missing userPrompt' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (userPrompt.length > 2000) {
    return new Response(
      JSON.stringify({ error: 'Prompt exceeds maximum length of 2000 characters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (audioUrl && typeof audioUrl !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Invalid audio URL format' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Analyzing audio and searching for matching models');

    // Fetch all active models with artist details
    const { data: models, error: modelsError } = await supabase
      .from('me_models')
      .select(`
        id,
        model_name,
        canonical_name,
        description,
        provenance,
        sample_url,
        artists (
          artist_name,
          bio
        )
      `)
      .eq('is_active', true);

    if (modelsError) {
      console.error('Error fetching models:', modelsError);
      throw new Error('Failed to fetch models from vault');
    }

    // Build context for AI analysis
    const modelsContext = models?.map(m => {
      const artistData: any = m.artists;
      const artistName = Array.isArray(artistData) ? artistData[0]?.artist_name : artistData?.artist_name;
      
      return {
        id: m.id,
        name: m.model_name,
        canonical_name: m.canonical_name,
        artist: artistName,
        description: m.description,
        provenance: m.provenance,
        sample_url: m.sample_url
      };
    }) || [];

    const systemPrompt = `You are an expert music A&R agent specializing in voice model matching for covers, remixes, and collaborations.

Your task:
1. Analyze the user's creative intent from their prompt
2. Match it with the best M.E Models from our Artist Vault
3. Consider: genre compatibility, vocal style, artist reputation, and creative vision alignment
4. If specific artist names are mentioned, prioritize their models
5. Return a ranked list of 3-5 model recommendations with detailed reasoning

Available M.E Models:
${JSON.stringify(modelsContext, null, 2)}

User's Creative Vision: "${userPrompt}"
${artistNames && artistNames.length > 0 ? `Mentioned Artists: ${artistNames.join(', ')}` : ''}

Audio Reference: ${audioUrl || 'None provided'}

Respond with a JSON array of recommendations in this format:
[
  {
    "model_id": "uuid",
    "model_name": "string",
    "artist_name": "string",
    "match_score": 0-100,
    "reasoning": "detailed explanation of why this model matches",
    "genre_fit": "string",
    "style_notes": "string"
  }
]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze and recommend the best matching M.E Models for this creative project.` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway request failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse AI response to extract JSON recommendations
    let recommendations = [];
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: return top models based on artist name matching
      recommendations = modelsContext
        .filter(m => !artistNames || artistNames.length === 0 || 
          artistNames.some((name: string) => m.artist?.toLowerCase().includes(name.toLowerCase())))
        .slice(0, 5)
        .map(m => ({
          model_id: m.id,
          model_name: m.name,
          artist_name: m.artist,
          match_score: 75,
          reasoning: 'Model from mentioned artist',
          genre_fit: 'Compatible',
          style_notes: m.description
        }));
    }

    return new Response(
      JSON.stringify({ 
        recommendations,
        analysis: aiResponse,
        mentionedArtists: artistNames || []
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Audio analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
