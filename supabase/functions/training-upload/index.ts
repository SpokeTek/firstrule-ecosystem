import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const modelId = formData.get('modelId') as string;
    const sessionType = formData.get('sessionType') as string || 'daw_capture';
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : {};

    if (!file || !modelId) {
      throw new Error('Missing required fields: file and modelId');
    }

    // Verify model ownership
    const { data: modelCheck, error: modelError } = await supabase
      .from('me_models')
      .select('artist_id, artists!inner(user_id)')
      .eq('id', modelId)
      .eq('artists.user_id', user.id)
      .single();
    
    if (modelError || !modelCheck) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to upload training data for this model' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    const allowedTypes = [
      'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg',
      'audio/midi', 'audio/x-midi', 'application/x-midi',
      'audio/flac', 'audio/aac'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(wav|mp3|midi|mid|ogg|flac|aac)$/i)) {
      throw new Error('Invalid file type. Supported: WAV, MP3, MIDI, OGG, FLAC, AAC');
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      throw new Error('File size exceeds 20MB limit');
    }

    // Create training session
    const { data: session, error: sessionError } = await supabase
      .from('training_sessions')
      .insert({
        user_id: user.id,
        model_id: modelId,
        session_type: sessionType,
        status: 'active',
        metadata: metadata,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      throw new Error('Failed to create training session');
    }

    // Upload file to storage
    const fileName = `${user.id}/${session.id}/${Date.now()}_${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    
    const { error: uploadError } = await supabase.storage
      .from('training-data')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload file');
    }

    // Create training upload record
    const { data: upload, error: uploadRecordError } = await supabase
      .from('training_uploads')
      .insert({
        session_id: session.id,
        file_path: fileName,
        file_type: file.type,
        file_size: file.size,
        processing_status: 'pending',
      })
      .select()
      .single();

    if (uploadRecordError) {
      console.error('Upload record error:', uploadRecordError);
      throw new Error('Failed to create upload record');
    }

    console.log('Training upload successful:', {
      sessionId: session.id,
      uploadId: upload.id,
      fileName: fileName,
    });

    return new Response(
      JSON.stringify({
        success: true,
        session: session,
        upload: upload,
        message: 'Training data uploaded successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Training upload error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
