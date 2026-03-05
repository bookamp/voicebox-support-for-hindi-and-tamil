/**
 * Tests for API client transcribeAudio (per-language model id and 202 downloading).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from './client';

describe('apiClient.transcribeAudio', () => {
  const mockFetch = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch);
    vi.clearAllMocks();
  });

  it('includes transcription_model_id in FormData when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'hello', duration: 1 }),
    });

    const file = new File(['audio'], 'test.wav', { type: 'audio/wav' });
    await apiClient.transcribeAudio(file, 'hi', 'collabora/whisper-large-v2-hindi');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/transcribe');
    expect(options?.method).toBe('POST');
    expect(options?.body).toBeInstanceOf(FormData);
    const formData = options.body as FormData;
    expect(formData.get('language')).toBe('hi');
    expect(formData.get('transcription_model_id')).toBe('collabora/whisper-large-v2-hindi');
  });

  it('does not append transcription_model_id when empty or whitespace', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'hello', duration: 1 }),
    });

    const file = new File(['audio'], 'test.wav', { type: 'audio/wav' });
    await apiClient.transcribeAudio(file, 'en', '');
    const formData = mockFetch.mock.calls[0][1].body as FormData;
    expect(formData.has('transcription_model_id')).toBe(false);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'hi', duration: 1 }),
    });
    await apiClient.transcribeAudio(file, 'en', '   ');
    const formData2 = mockFetch.mock.calls[1][1].body as FormData;
    expect(formData2.has('transcription_model_id')).toBe(false);
  });

  it('throws error with downloading: true when response is 202 and body.downloading', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 202,
      json: async () => ({
        downloading: true,
        message: 'Whisper model base is being downloaded. Please wait and try again.',
      }),
    });

    const file = new File(['audio'], 'test.wav', { type: 'audio/wav' });

    try {
      await apiClient.transcribeAudio(file, 'en');
      expect.fail('Expected transcribeAudio to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toMatch(/download/i);
      expect((err as Error & { downloading?: boolean }).downloading).toBe(true);
    }
  });
});
