# Cowriter LiveKit Agent (Python)

This package provides a Python reference implementation for the Joel-based co-writing agent.
It is designed to run on [LiveKit Cloud](https://cloud.livekit.io) using the
[livekit-agents](https://docs.livekit.io/agents/) Python SDK.

Key features
- Personalized system prompt generated from the selected M.E. model (defaults to Joel Kaiser).
- Handles "prep" messages from the frontend to greet the user and optionally kick off tools.
- Tool stubs for:
  - `voice_swap`: calls out to an ElevenLabs (or equivalent) voice conversion service.
  - `music_gen`: creates a musical preview from text + optional stem.
- Emits data-channel messages back to the frontend with status updates and tool artifacts.

Files
- `agent.py` – LiveKit Agent entrypoint.
- `prompt.py` – Prompt builder utilities.
- `tools/voice_swap.py`, `tools/music_gen.py` – async tool shims.
- `models.py` – shared dataclasses for prep payloads and tool results.
- `settings.py` – Pydantic-based environment configuration.
- `.env.example` – required environment variables.
- `requirements.txt` – Python dependencies.

Environment variables
```
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# choose either OpenAI or Gemini (or both if you support runtime selection)
OPENAI_API_KEY=
# GEMINI_API_KEY=

# ElevenLabs for Joel voice swap
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

Run locally
```
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
python agent.py
```

Deploy to LiveKit Cloud
- Upload this directory as the agent package (or publish to your own git repo/bucket).
- Configure environment variables using the `.env.example` template.
- Set the start command to `python agent.py` (Python 3.10+ recommended).
- The agent expects the frontend to send a JSON “prep” payload over the data channel when the user initiates a session (see `handle_prep`).

Frontend integration
- When the React UI starts a session, gather the pre-session choice and upload URLs, then send:
  ```json
  {
    "type": "prep",
    "mode": "swap" | "generate" | "chat",
    "vocalUrl": "https://...",      // only for swap
    "prompt": "...",                // only for generate
    "stemUrl": "https://...",       // optional stem
    "model": {
      "id": "me-joel",
      "firstName": "Joel",
      "bio": "soulful singer/artist",
      "voiceId": "elevenlabs-voice-id"
    }
  }
  ```
- The agent acknowledges by replying with `agent/text` messages and tool-specific updates
  (`tool/voiceSwap` or `tool/musicGen`). Hook those into your UI for progress/state.

Next steps
- Replace the tool stubs with real API calls.
- Add LiveKit track publishing for realtime audio once the pipelines are ready.
- Extend `agent.py` with LLM-based planning (OpenAI, Gemini, etc.) to decide when to call tools dynamically.
