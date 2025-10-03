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

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    // Validate API key or auth token
    const apiKey = headers.get('x-api-key');
    const authHeader = headers.get('Authorization');

    if (!apiKey && !authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let sessionId: string | null = null;

    socket.onopen = () => {
      console.log("WebSocket connection established");
      socket.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        message: 'Training realtime connection established'
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message:", message.type);

        if (message.type === 'start_training') {
          const { model_id, session_type, metadata } = message.data;

          // Create training session
          const { data: session, error } = await supabase
            .from('training_sessions')
            .insert({
              model_id,
              session_type,
              metadata,
              status: 'active',
              started_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            socket.send(JSON.stringify({
              type: 'error',
              error: 'Failed to create training session'
            }));
            return;
          }

          sessionId = session.id;

          socket.send(JSON.stringify({
            type: 'training_started',
            session_id: sessionId,
            status: 'active'
          }));

          // Simulate training progress updates
          if (sessionId) {
            simulateTrainingProgress(socket, sessionId, supabase);
          }
        }

        if (message.type === 'upload_chunk') {
          if (!sessionId) {
            socket.send(JSON.stringify({
              type: 'error',
              error: 'No active training session'
            }));
            return;
          }

          const { chunk_data, chunk_index, total_chunks } = message.data;

          // Process chunk (in real implementation, this would upload to storage)
          socket.send(JSON.stringify({
            type: 'chunk_received',
            chunk_index,
            total_chunks,
            progress: ((chunk_index + 1) / total_chunks * 100).toFixed(2)
          }));

          if (chunk_index + 1 === total_chunks) {
            socket.send(JSON.stringify({
              type: 'upload_complete',
              session_id: sessionId
            }));
          }
        }

        if (message.type === 'stop_training') {
          if (sessionId) {
            await supabase
              .from('training_sessions')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString()
              })
              .eq('id', sessionId);

            socket.send(JSON.stringify({
              type: 'training_stopped',
              session_id: sessionId
            }));
          }
        }

      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = async () => {
      console.log("WebSocket connection closed");
      if (sessionId) {
        // Mark session as completed on disconnect
        await supabase
          .from('training_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      }
    };

    return response;

  } catch (error) {
    console.error('Error in training-realtime function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Simulate training progress updates
async function simulateTrainingProgress(
  socket: WebSocket,
  sessionId: string,
  supabase: any
) {
  const stages = [
    { name: 'preprocessing', duration: 2000 },
    { name: 'feature_extraction', duration: 3000 },
    { name: 'model_training', duration: 5000 },
    { name: 'validation', duration: 2000 },
  ];

  let totalProgress = 0;

  for (const stage of stages) {
    socket.send(JSON.stringify({
      type: 'training_progress',
      session_id: sessionId,
      stage: stage.name,
      progress: totalProgress,
      status: 'processing'
    }));

    await new Promise(resolve => setTimeout(resolve, stage.duration));
    
    totalProgress += 25;

    socket.send(JSON.stringify({
      type: 'training_progress',
      session_id: sessionId,
      stage: stage.name,
      progress: totalProgress,
      status: 'completed'
    }));
  }

  // Update session status
  await supabase
    .from('training_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      data_summary: {
        stages_completed: stages.map(s => s.name),
        total_duration: stages.reduce((acc, s) => acc + s.duration, 0)
      }
    })
    .eq('id', sessionId);

  socket.send(JSON.stringify({
    type: 'training_complete',
    session_id: sessionId,
    progress: 100,
    message: 'Training completed successfully'
  }));
}
