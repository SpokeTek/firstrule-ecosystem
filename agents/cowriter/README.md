Cowriter LiveKit Agent
======================

Overview
- A LiveKit Agent that acts as an agentic co‑writer with two tools:
  - voiceSwap: swap uploaded vocals to a chosen M.E. voice (ElevenLabs-backed)
  - musicGen: generate music from text, optionally guided by a stem
- Personalized system prompt derived from the selected M.E. model. Default: Joel Kaiser — a soulful singer with rich lyrics and melodies.

Folder contents
- agent.ts: Agent entrypoint (Node/TS) for LiveKit Cloud Agents.
- prompt.ts: Prompt utilities for building the system message from the selected model.
- tools/voiceSwap.ts: Voice swap tool interface + stub implementation.
- tools/musicGen.ts: Music generation tool interface + stub implementation.
- types.ts: Shared types.
- .env.sample: Required environment variables to run locally or in Cloud.

Environment variables (.env)
- LIVEKIT_URL
- LIVEKIT_API_KEY
- LIVEKIT_API_SECRET
- OPENAI_API_KEY (or GOOGLE_.* if using Gemini)
- ELEVENLABS_API_KEY
- ELEVENLABS_VOICE_ID (the trained Joel model voice ID)

Development
1) Install deps (from repo root or within this folder):
   npm i @livekit/agents openai ws cross-fetch
   # Or if using Google for LLM, install @google/generative-ai instead of openai

2) Set env:
   cp agents/cowriter/.env.sample agents/cowriter/.env
   # fill in values

3) Run locally (example):
   node --env-file=agents/cowriter/.env --loader ts-node/esm agents/cowriter/agent.ts

LiveKit Cloud
- Deploy this agent to LiveKit Cloud as an Agent. Configure the above environment variables and set the start command to run `agent.ts` (built JS) with Node 18+.

Client <-> Agent handshake
- The web client should send a small JSON control message on connect (LiveKit data channel or room metadata) to indicate any pre-session choices:
  {
    "type": "prep",
    "mode": "swap" | "generate" | "chat",
    "vocalUrl"?: "https://.../vocal.wav",
    "prompt"?: "...",
    "stemUrl"?: "https://.../stem.wav",
    "model": { "id": "me-joel", "firstName": "Joel", "bio": "soulful singer...", "voiceId": "..." }
  }
- The agent will greet accordingly and optionally trigger tool runs based on that context. Subsequent tool actions can be initiated by additional messages or by agent planning.

Notes
- The tool implementations here are stubs. Wire them to your actual APIs (ElevenLabs voice conversion / TTS and music generation pipelines) and stream artifacts back via LiveKit tracks or presigned URLs announced over data messages.
