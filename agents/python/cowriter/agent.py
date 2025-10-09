from __future__ import annotations

import asyncio
import json
from typing import Any

from livekit import agents
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli

from .models import CowriterModel, PrepPayload
from .prompt import build_system_prompt, greeting_for_mode
from .settings import get_settings
from .tools.music_gen import music_gen
from .tools.voice_swap import voice_swap


async def entrypoint(ctx: JobContext) -> None:
    """Primary LiveKit Agent coroutine."""

    settings = get_settings()
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Listen for data-channel payloads (prep + further instructions)
    ctx.add_data_listener(lambda dc, p, d: asyncio.create_task(handle_data(ctx, d)))

    # If job metadata already contains prep info, handle it immediately
    if ctx.job_input:
        try:
            payload = json.loads(ctx.job_input)
            await handle_prep(ctx, payload)
        except Exception as exc:  # noqa: BLE001
            await ctx.send_data(json.dumps({"type": "agent/error", "error": str(exc)}).encode())

    # Keep running until room closed
    await ctx.wait_for_completion()


async def handle_data(ctx: JobContext, data: bytes) -> None:
    try:
        payload = json.loads(data.decode())
    except Exception as exc:  # noqa: BLE001
        await ctx.send_data(json.dumps({"type": "agent/error", "error": f"bad json: {exc}"}).encode())
        return

    if payload.get("type") == "prep":
        await handle_prep(ctx, payload)
    elif payload.get("type") == "user/text":
        await ctx.send_data(json.dumps({"type": "agent/text", "text": "Got it—what would you like me to do next?"}).encode())


async def handle_prep(ctx: JobContext, payload: dict[str, Any]) -> None:
    settings = get_settings()

    prep = parse_prep(payload)
    model = prep.model or CowriterModel(
        id="me-joel",
        first_name="Joel",
        bio="a singer/artist with a soulful voice and rich lyrics and melodies",
        voice_id=settings.elevenlabs_voice_id,
    )

    system_prompt = build_system_prompt(model)
    await ctx.send_data(json.dumps({"type": "agent/system", "prompt": system_prompt}).encode())
    await ctx.send_data(json.dumps({"type": "agent/text", "text": greeting_for_mode(prep.mode, model.first_name)}).encode())

    if prep.mode == "swap" and prep.vocal_url:
        await ctx.send_data(json.dumps({"type": "agent/text", "text": "Running voice swap…"}).encode())
        result = await voice_swap(prep.vocal_url, model.voice_id, settings.elevenlabs_api_key)
        await ctx.send_data(json.dumps(_tool_payload("voiceSwap", result)).encode())

    if prep.mode == "generate" and prep.prompt:
        await ctx.send_data(json.dumps({"type": "agent/text", "text": "Generating a musical idea…"}).encode())
        result = await music_gen(prep.prompt, prep.stem_url, settings.openai_api_key, settings.gemini_api_key)
        await ctx.send_data(json.dumps(_tool_payload("musicGen", result)).encode())


def parse_prep(payload: dict[str, Any]) -> PrepPayload:
    mode = payload.get("mode", "chat")
    model_info = payload.get("model")
    model = None
    if isinstance(model_info, dict):
        model = CowriterModel(
            id=model_info.get("id", "me-joel"),
            first_name=model_info.get("firstName", "Joel"),
            bio=model_info.get("bio", "a soulful singer"),
            voice_id=model_info.get("voiceId"),
        )
    return PrepPayload(
        type="prep",
        mode=mode,
        vocal_url=payload.get("vocalUrl"),
        prompt=payload.get("prompt"),
        stem_url=payload.get("stemUrl"),
        model=model,
    )


def _tool_payload(tool: str, result) -> dict[str, Any]:
    if result.ok:
        return {"type": f"tool/{tool}:ok", "url": result.artifact_url}
    return {"type": f"tool/{tool}:err", "error": result.error}


if __name__ == "__main__":
    cli.run_app(
        entrypoint,
        WorkerOptions(auto_subscribe=AutoSubscribe.AUDIO_ONLY),
    )
