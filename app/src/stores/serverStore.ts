import type { LanguageCode } from '@/lib/constants/languages';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Built-in default Whisper model IDs per language (e.g. for script-specific output). Not user-configurable. */
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

  /** Returns the model ID to use for transcription for the given language, or undefined to use default Whisper. */
  getTranscriptionModelIdForLanguage: (language: LanguageCode) => string | undefined;
}

export const useServerStore = create<ServerStore>()(
  persist(
    (set) => ({
      serverUrl: 'http://127.0.0.1:17493',
      setServerUrl: (url) => set({ serverUrl: url }),

      isConnected: false,
      setIsConnected: (connected) => set({ isConnected: connected }),

      mode: 'local',
      setMode: (mode) => set({ mode }),

      keepServerRunningOnClose: false,
      setKeepServerRunningOnClose: (keepRunning) => set({ keepServerRunningOnClose: keepRunning }),

      getTranscriptionModelIdForLanguage: (language) =>
        DEFAULT_TRANSCRIPTION_MODELS[language] ?? undefined,
    }),
    {
      name: 'voicebox-server',
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        isConnected: state.isConnected,
        mode: state.mode,
        keepServerRunningOnClose: state.keepServerRunningOnClose,
      }),
    },
  ),
);
