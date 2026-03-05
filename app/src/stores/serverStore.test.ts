/**
 * Tests for serverStore per-language transcription defaults (outlier languages).
 * Model is not user-configurable; store returns built-in default only.
 */

import { describe, it, expect } from 'vitest';
import { useServerStore } from './serverStore';

describe('serverStore transcription defaults', () => {
  it('getTranscriptionModelIdForLanguage returns built-in default for language with default', () => {
    const modelId = useServerStore.getState().getTranscriptionModelIdForLanguage('hi');
    expect(modelId).toBe('collabora/whisper-large-v2-hindi');
  });

  it('getTranscriptionModelIdForLanguage returns undefined for language without default', () => {
    const modelId = useServerStore.getState().getTranscriptionModelIdForLanguage('en');
    expect(modelId).toBeUndefined();
  });
});
