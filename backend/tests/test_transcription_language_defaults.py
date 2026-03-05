"""
Unit tests for per-language transcription defaults and language validation.

Covers:
- transcribe.get_default_transcription_model_id (outlier languages with a default model; others return None)
- utils.validation.validate_language (invalid code returns False)
- models: VoiceProfileCreate, GenerationRequest, TranscriptionRequest (accept valid, reject invalid)

Run from project root: python -m backend.tests.test_transcription_language_defaults
"""

import sys
from pathlib import Path

# Project root so "backend" is a package (needed for transcribe's relative imports)
_project_root = Path(__file__).resolve().parent.parent.parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))


def test_get_default_transcription_model_id_for_language_with_default():
    """A language with a default transcription model returns its model ID."""
    from backend.transcribe import get_default_transcription_model_id

    # Current outlier: hi has a script-specific default
    result = get_default_transcription_model_id("hi")
    assert result is not None
    assert result == "collabora/whisper-large-v2-hindi"


def test_get_default_transcription_model_id_returns_none_for_language_without_default():
    """A language not in the default map returns None (use default Whisper)."""
    from backend.transcribe import get_default_transcription_model_id

    assert get_default_transcription_model_id("en") is None


def test_get_default_transcription_model_id_unknown():
    """Unknown or empty language returns None."""
    from backend.transcribe import get_default_transcription_model_id

    assert get_default_transcription_model_id("xx") is None
    assert get_default_transcription_model_id("") is None


def test_validate_language_invalid():
    """Invalid language code returns False and error message listing valid codes."""
    from backend.utils.validation import validate_language

    valid, err = validate_language("xx")
    assert valid is False
    assert err is not None
    assert "Invalid language" in err


def _models_available():
    """Check if backend.models can be imported (requires pydantic and backend deps)."""
    try:
        from backend import models  # noqa: F401
        return True
    except Exception:
        return False


def test_voice_profile_create_accepts_valid_language():
    """VoiceProfileCreate accepts a valid language code."""
    if not _models_available():
        print("  SKIP test_voice_profile_create_accepts_valid_language (backend.models not available)")
        return
    from backend.models import VoiceProfileCreate

    obj = VoiceProfileCreate(name="Test", language="en")
    assert obj.language == "en"


def test_voice_profile_create_rejects_invalid_language():
    """VoiceProfileCreate rejects invalid language codes."""
    if not _models_available():
        print("  SKIP test_voice_profile_create_rejects_invalid_language (backend.models not available)")
        return
    from pydantic import ValidationError
    from backend.models import VoiceProfileCreate

    try:
        VoiceProfileCreate(name="Test", language="xx")
        assert False, "Expected ValidationError"
    except ValidationError as e:
        errs = e.errors()
        assert any("language" in str(err.get("loc", [])) for err in errs)


def test_generation_request_accepts_valid_language():
    """GenerationRequest accepts a valid language code."""
    if not _models_available():
        print("  SKIP test_generation_request_accepts_valid_language (backend.models not available)")
        return
    from backend.models import GenerationRequest

    obj = GenerationRequest(profile_id="some-id", text="Hello", language="en")
    assert obj.language == "en"


def test_generation_request_rejects_invalid_language():
    """GenerationRequest rejects invalid language codes."""
    if not _models_available():
        print("  SKIP test_generation_request_rejects_invalid_language (backend.models not available)")
        return
    from pydantic import ValidationError
    from backend.models import GenerationRequest

    try:
        GenerationRequest(profile_id="x", text="y", language="xx")
        assert False, "Expected ValidationError"
    except ValidationError as e:
        errs = e.errors()
        assert any("language" in str(err.get("loc", [])) for err in errs)


def test_transcription_request_accepts_optional_language():
    """TranscriptionRequest accepts None or a valid language code."""
    if not _models_available():
        print("  SKIP test_transcription_request_accepts_optional_language (backend.models not available)")
        return
    from backend.models import TranscriptionRequest

    assert TranscriptionRequest().language is None
    obj = TranscriptionRequest(language="en")
    assert obj.language == "en"


def test_transcription_request_rejects_invalid_language():
    """TranscriptionRequest rejects invalid language codes."""
    if not _models_available():
        print("  SKIP test_transcription_request_rejects_invalid_language (backend.models not available)")
        return
    from pydantic import ValidationError
    from backend.models import TranscriptionRequest

    try:
        TranscriptionRequest(language="xx")
        assert False, "Expected ValidationError"
    except ValidationError as e:
        errs = e.errors()
        assert any("language" in str(err.get("loc", [])) for err in errs)


def run_tests():
    """Run all tests and return (passed_count, failed_count)."""
    tests = [
        test_get_default_transcription_model_id_for_language_with_default,
        test_get_default_transcription_model_id_returns_none_for_language_without_default,
        test_get_default_transcription_model_id_unknown,
        test_validate_language_invalid,
        test_voice_profile_create_accepts_valid_language,
        test_voice_profile_create_rejects_invalid_language,
        test_generation_request_accepts_valid_language,
        test_generation_request_rejects_invalid_language,
        test_transcription_request_accepts_optional_language,
        test_transcription_request_rejects_invalid_language,
    ]
    passed = 0
    failed = 0
    for t in tests:
        try:
            t()
            passed += 1
            print(f"  OK   {t.__name__}")
        except Exception as e:
            failed += 1
            print(f"  FAIL {t.__name__}: {e}")
    return passed, failed


if __name__ == "__main__":
    print("Transcription language defaults & validation tests")
    print("=" * 50)
    passed, failed = run_tests()
    print("=" * 50)
    print(f"Passed: {passed}, Failed: {failed}")
    sys.exit(0 if failed == 0 else 1)
