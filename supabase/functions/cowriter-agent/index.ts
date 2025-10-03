import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style, artistNames, mode, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build system prompt based on mode
    let systemPrompt = '';
    
    if (mode === 'full-generation') {
      systemPrompt = `You are an expert music producer and songwriter AI agent. Generate complete song concepts including:
- Melody ideas (described in musical notation or intervals)
- Chord progressions (with specific chords)
- Rhythm patterns (time signature and groove description)
- Lyrical themes and hooks
- Arrangement structure (intro, verse, chorus, bridge, outro)
- Production suggestions (instrumentation, effects, mixing notes)

${artistNames && artistNames.length > 0 ? `Incorporate the vocal style and musical influences of: ${artistNames.join(', ')}` : ''}
${style ? `Musical style/genre: ${style}` : ''}

Be creative, specific, and provide actionable musical suggestions that a producer can implement.`;
    } else if (mode === 'stem-generation') {
      systemPrompt = `You are an AI music production assistant specializing in stem-by-stem MIDI generation.
Generate MIDI patterns for the requested stem type (drums, bass, melody, harmony, etc.).

Provide:
- Note sequences in MIDI format (note numbers, velocities, durations)
- Timing information (beats, subdivisions)
- Suggested velocity curves
- Articulation notes
- Groove and feel suggestions

${artistNames && artistNames.length > 0 ? `Style influenced by: ${artistNames.join(', ')}` : ''}
${style ? `Musical style: ${style}` : ''}

Output structured, implementable MIDI data.`;
    } else if (mode === 'lyric-generation') {
      systemPrompt = `You are a professional songwriter AI specialized in writing lyrics.
Create compelling, original lyrics with:
- Strong hooks and memorable phrases
- Cohesive storytelling or thematic elements
- Natural rhyme schemes and meter
- Emotional resonance

${artistNames && artistNames.length > 0 ? `Write in the style/voice of: ${artistNames.join(', ')}` : ''}
${style ? `Genre/style: ${style}` : ''}`;
    } else {
      systemPrompt = `You are a collaborative music AI assistant helping with songwriting and production.
Provide creative suggestions, musical ideas, and production guidance based on the user's request.

${artistNames && artistNames.length > 0 ? `Consider the style of: ${artistNames.join(', ')}` : ''}`;
    }

    // Add context if provided
    if (context) {
      systemPrompt += `\n\nSession context: ${context}`;
    }

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
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
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
    const generatedContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        mode: mode,
        artistNames: artistNames
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('CoWriter agent error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
