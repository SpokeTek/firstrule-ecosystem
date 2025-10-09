/*
  LiveKit Agent entrypoint (skeleton)
  - Greets based on pre-session context from client
  - Invokes voiceSwap/musicGen tools as needed
  - Streams back simple data messages with results

  NOTE: Replace stubbed tool calls with your production APIs.
*/

import 'cross-fetch/polyfill';
import WebSocket from 'ws';
import { buildSystemPrompt, greetingForMode } from './prompt';
import { musicGen } from './tools/musicGen';
import { voiceSwap } from './tools/voiceSwap';
import type { CowriterModel, PrepMessage, PrepMode } from './types';

// If you use @livekit/agents, import your Agent runner here.
// This file uses a lightweight Room WS skeleton to illustrate message flow without external deps.

interface Env {
  LIVEKIT_URL: string;
  LIVEKIT_API_KEY: string;
  LIVEKIT_API_SECRET: string;
  ELEVENLABS_API_KEY?: string;
  ELEVENLABS_VOICE_ID?: string;
  OPENAI_API_KEY?: string;
  GOOGLE_GEMINI_API_KEY?: string;
}

const env: Env = {
  LIVEKIT_URL: process.env.LIVEKIT_URL || '',
  LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY || '',
  LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET || '',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
};

// Minimal logging utility
function log(...args: any[]) { console.log('[agent]', ...args); }

// This demonstrates message handling; replace with LiveKit Agents SDK runner when integrating.
async function startAgent() {
  if (!env.LIVEKIT_URL) {
    log('Missing LIVEKIT_URL');
    process.exit(1);
  }

  // In production, obtain a proper access token and connect via LiveKit Agents SDK.
  // For illustration, we use a placeholder WS connect to an arbitrary endpoint.
  const ws = new WebSocket(env.LIVEKIT_URL);

  ws.on('open', () => {
    log('Connected to LiveKit (WS placeholder)');
    // Announce readiness
    ws.send(JSON.stringify({ type: 'agent/ready' }));
  });

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(String(data));
      if (msg?.type === 'prep') {
        const prep = msg as PrepMessage;
        await handlePrep(ws, prep);
      } else if (msg?.type === 'user/text') {
        // Extend: route to LLM to decide tool usage based on system prompt
        ws.send(JSON.stringify({ type: 'agent/text', text: 'Got it — what would you like me to do next?' }));
      }
    } catch (e) {
      log('invalid message', e);
    }
  });

  ws.on('close', () => log('WS closed'));
  ws.on('error', (e) => log('WS error', e));
}

async function handlePrep(ws: WebSocket, prep: PrepMessage) {
  const model: CowriterModel = prep.model || {
    id: 'me-joel',
    firstName: 'Joel',
    bio: 'a singer/artist with a soulful voice and rich lyrics and melodies',
    voiceId: process.env.ELEVENLABS_VOICE_ID,
  };

  const systemPrompt = buildSystemPrompt(model);
  ws.send(JSON.stringify({ type: 'agent/system', prompt: systemPrompt }));

  // Greet based on mode
  ws.send(JSON.stringify({ type: 'agent/text', text: greetingForMode(prep.mode as PrepMode, model.firstName) }));

  // Auto-run based on provided inputs
  if (prep.mode === 'swap' && prep.vocalUrl && model.voiceId) {
    ws.send(JSON.stringify({ type: 'agent/text', text: 'Running voiceSwap…' }));
    const res = await voiceSwap({ vocalUrl: prep.vocalUrl, targetVoiceId: model.voiceId });
    if (res.ok) {
      ws.send(JSON.stringify({ type: 'tool/voiceSwap:ok', url: res.artifactUrl }));
    } else {
      ws.send(JSON.stringify({ type: 'tool/voiceSwap:err', error: res.error }));
    }
  }

  if (prep.mode === 'generate' && prep.prompt) {
    ws.send(JSON.stringify({ type: 'agent/text', text: 'Composing preview with musicGen…' }));
    const res = await musicGen({ prompt: prep.prompt, stemUrl: prep.stemUrl });
    if (res.ok) {
      ws.send(JSON.stringify({ type: 'tool/musicGen:ok', url: res.artifactUrl }));
    } else {
      ws.send(JSON.stringify({ type: 'tool/musicGen:err', error: res.error }));
    }
  }
}

startAgent().catch((e) => {
  log('fatal', e);
  process.exit(1);
});

