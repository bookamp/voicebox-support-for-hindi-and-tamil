"""
STT (Speech-to-Text) module - delegates to backend abstraction layer.
"""

from typing import Optional
from .backends import get_stt_backend, STTBackend

# Default Whisper model ID per language (script-specific output). Add entries for new languages; no code changes elsewhere.
_default_transcription_model_by_language: dict[str, str] = {
    "hi": "collabora/whisper-large-v2-hindi",
}


def get_default_transcription_model_id(language: str) -> str | None:
    """Return the default HuggingFace model ID for transcription in the given language, or None to use default Whisper."""
    return _default_transcription_model_by_language.get(language)


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
