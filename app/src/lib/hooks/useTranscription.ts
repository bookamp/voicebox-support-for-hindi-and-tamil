import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { LanguageCode } from '@/lib/constants/languages';

export function useTranscription() {
  return useMutation({
    mutationFn: ({
      file,
      language,
      transcriptionModelId,
    }: {
      file: File;
      language?: LanguageCode;
      /** Model ID to use for this language (from store); omit to use backend default. */
      transcriptionModelId?: string | null;
    }) => apiClient.transcribeAudio(file, language, transcriptionModelId),
  });
}
