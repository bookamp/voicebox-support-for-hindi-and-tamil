"""
STT (Speech-to-Text) module - delegates to backend abstraction layer.
"""

import asyncio
from typing import Optional
from .backends import get_stt_backend, STTBackend

# Default Whisper model ID per language (script-specific output). Add entries for new languages; no code changes elsewhere.
_default_transcription_model_by_language: dict[str, str] = {
    "hi": "collabora/whisper-large-v2-hindi",
}


def get_default_transcription_model_id(language: str) -> str | None:
    """Return the default HuggingFace model ID for transcription in the given language, or None to use default Whisper."""
    return _default_transcription_model_by_language.get(language)


async def load_alt_model_async(model_id: str) -> None:
    """Download and load an optional per-language Whisper model by HuggingFace repo ID. PyTorch backend only."""
    backend = get_stt_backend()
    if hasattr(backend, "load_alt_model_async"):
        await backend.load_alt_model_async(model_id)
    else:
        raise RuntimeError("Language-specific transcription models are only supported on the PyTorch backend.")


def is_alt_model_loaded(model_id: str) -> bool:
    """Return True if the given alt model ID is currently loaded in the backend."""
    backend = get_stt_backend()
    if hasattr(backend, "is_alt_loaded"):
        return backend.is_alt_loaded(model_id)
    return False


def get_whisper_model() -> STTBackend:
    """
    Get STT backend instance (MLX or PyTorch based on platform).
    
    Returns:
        STT backend instance
    """
    return get_stt_backend()


def unload_whisper_model():
    """Unload Whisper model to free memory."""
    backend = get_stt_backend()
    backend.unload_model()


def unload_alt_model():
    """Unload the optional per-language Whisper model if loaded. PyTorch backend only."""
    backend = get_stt_backend()
    if hasattr(backend, "unload_alt_model"):
        backend.unload_alt_model()
