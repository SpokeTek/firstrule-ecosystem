export type PrepMode = "chat" | "swap" | "generate";

export interface CowriterModel {
  id: string;
  firstName: string; // e.g., "Joel"
  bio: string; // short style/bio
  voiceId?: string; // ElevenLabs voice ID
}

export interface PrepMessage {
  type: "prep";
  mode: PrepMode;
  vocalUrl?: string;
  prompt?: string;
  stemUrl?: string;
  model?: CowriterModel;
}

export interface ToolResult {
  ok: boolean;
  artifactUrl?: string;
  error?: string;
}
