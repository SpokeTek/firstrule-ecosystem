from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional

PrepMode = Literal["chat", "swap", "generate"]


@dataclass
class CowriterModel:
    id: str
    first_name: str
    bio: str
    voice_id: Optional[str] = None


@dataclass
class PrepPayload:
    type: str
    mode: PrepMode
    vocal_url: Optional[str] = None
    prompt: Optional[str] = None
    stem_url: Optional[str] = None
    model: Optional[CowriterModel] = None


@dataclass
class ToolResult:
    ok: bool
    artifact_url: Optional[str] = None
    error: Optional[str] = None

