import type { LanguageCode } from '@/lib/constants/languages';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Built-in default Whisper model IDs per language (e.g. for script-specific output). Add new languages here; no new store variables needed. */
const DEFAULT_TRANSCRIPTION_MODELS: Partial<Record<LanguageCode, string>> = {
  hi: 'collabora/whisper-large-v2-hindi',
};

interface ServerStore {
  serverUrl: string;
  setServerUrl: (url: string) => void;

  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  mode: 'local' | 'remote';
  setMode: (mode: 'local' | 'remote') => void;

  keepServerRunningOnClose: boolean;
  setKeepServerRunningOnClose: (keepRunning: boolean) => void;

  /** Per-language Whisper model overrides. One map for all languages; add keys for new languages instead of new variables. */
  transcriptionModelOverrides: Partial<Record<LanguageCode, string>>;
  setTranscriptionModelOverride: (language: LanguageCode, modelId: string) => void;

  /** Returns the model ID to use for transcription for the given language, or undefined to use default. Injected from store; no language checks in callers. */
  getTranscriptionModelIdForLanguage: (language: LanguageCode) => string | undefined;
  /** Current override for a language (for editing in settings). */
  getTranscriptionModelOverride: (language: LanguageCode) => string;
  /** Default model ID for a language (for placeholders in settings). */
  getDefaultTranscriptionModelId: (language: LanguageCode) => string;
  /** Languages that have a built-in transcription model (for settings UI). Add to DEFAULT_TRANSCRIPTION_MODELS to get a row here. */
  getLanguagesWithTranscriptionDefault: () => LanguageCode[];
}

export const useServerStore = create<ServerStore>()(
  persist(
    (set, get) => ({
      serverUrl: 'http://127.0.0.1:17493',
      setServerUrl: (url) => set({ serverUrl: url }),

      isConnected: false,
      setIsConnected: (connected) => set({ isConnected: connected }),

      mode: 'local',
      setMode: (mode) => set({ mode }),

      keepServerRunningOnClose: false,
      setKeepServerRunningOnClose: (keepRunning) => set({ keepServerRunningOnClose: keepRunning }),

      transcriptionModelOverrides: {},
      setTranscriptionModelOverride: (language, modelId) =>
        set((s) => {
          const trimmed = modelId?.trim() ?? '';
          const next = { ...(s.transcriptionModelOverrides ?? {}) };
          if (trimmed) next[language] = trimmed;
          else delete next[language];
          return { transcriptionModelOverrides: next };
        }),

      getTranscriptionModelIdForLanguage: (language) => {
        const overrides = get().transcriptionModelOverrides ?? {};
        const override = overrides[language]?.trim();
        const builtIn = DEFAULT_TRANSCRIPTION_MODELS[language];
        return override || builtIn || undefined;
      },
      getTranscriptionModelOverride: (language) => {
        const overrides = get().transcriptionModelOverrides ?? {};
        return overrides[language]?.trim() ?? '';
      },
      getDefaultTranscriptionModelId: (language) =>
        DEFAULT_TRANSCRIPTION_MODELS[language] ?? '',
      getLanguagesWithTranscriptionDefault: () =>
        Object.keys(DEFAULT_TRANSCRIPTION_MODELS) as LanguageCode[],
    }),
    {
      name: 'voicebox-server',
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        isConnected: state.isConnected,
        mode: state.mode,
        keepServerRunningOnClose: state.keepServerRunningOnClose,
        transcriptionModelOverrides: state.transcriptionModelOverrides ?? {},
      }),
      onRehydrateStorage: () => (storedState) => {
        if (!storedState) return;
        const legacy = (storedState as { whisperHindiModelId?: string }).whisperHindiModelId?.trim();
        const overrides = (storedState as { transcriptionModelOverrides?: Partial<Record<LanguageCode, string>> }).transcriptionModelOverrides ?? {};
        if (legacy && !overrides.hi) {
          useServerStore.setState({
            transcriptionModelOverrides: { ...overrides, hi: legacy },
          });
        }
      },
    },
  ),
);
