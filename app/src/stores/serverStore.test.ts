/**
 * Tests for serverStore per-language transcription defaults (outlier languages).
 */

import { describe, it, expect } from 'vitest';
import { useServerStore } from './serverStore';

describe('serverStore transcription defaults', () => {
  it('getLanguagesWithTranscriptionDefault returns languages that have a default model', () => {
    const languages = useServerStore.getState().getLanguagesWithTranscriptionDefault();
    expect(languages.length).toBeGreaterThan(0);
    expect(languages).toContain('hi');
  });

  it('getDefaultTranscriptionModelId returns model ID for language with default, empty for others', () => {
    const withDefault = useServerStore.getState().getDefaultTranscriptionModelId('hi');
    expect(withDefault).toBe('collabora/whisper-large-v2-hindi');
    const withoutDefault = useServerStore.getState().getDefaultTranscriptionModelId('en');
    expect(withoutDefault).toBe('');
  });

  it('getTranscriptionModelIdForLanguage returns built-in default when no override', () => {
    const modelId = useServerStore.getState().getTranscriptionModelIdForLanguage('hi');
    expect(modelId).toBe('collabora/whisper-large-v2-hindi');
  });

  it('getTranscriptionModelOverride returns empty when not set', () => {
    const override = useServerStore.getState().getTranscriptionModelOverride('hi');
    expect(override).toBe('');
  });

  it('setTranscriptionModelOverride overrides getTranscriptionModelIdForLanguage', () => {
    useServerStore.getState().setTranscriptionModelOverride('hi', 'custom/whisper-hindi');
    expect(useServerStore.getState().getTranscriptionModelIdForLanguage('hi')).toBe(
      'custom/whisper-hindi',
    );
    useServerStore.getState().setTranscriptionModelOverride('hi', '');
  });
});
