import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/constants/languages';
import { useServerStore } from '@/stores/serverStore';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

const transcriptionSchema = z.record(z.string(), z.string());

type TranscriptionFormValues = z.infer<typeof transcriptionSchema>;

export function TranscriptionSettings() {
  const languages = useServerStore((s) => s.getLanguagesWithTranscriptionDefault());
  const getOverride = useServerStore((state) => state.getTranscriptionModelOverride);
  const setTranscriptionModelOverride = useServerStore((state) => state.setTranscriptionModelOverride);
  const getDefaultModelId = useServerStore((state) => state.getDefaultTranscriptionModelId);

  const defaultValues: TranscriptionFormValues = Object.fromEntries(
    languages.map((lang) => [lang, getOverride(lang)]),
  );

  const form = useForm<TranscriptionFormValues>({
    resolver: zodResolver(transcriptionSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(
      Object.fromEntries(languages.map((lang) => [lang, getOverride(lang)])),
    );
  }, [languages, getOverride, form]);

  const { isDirty } = form.formState;

  function onSubmit(data: TranscriptionFormValues) {
    Object.entries(data).forEach(([lang, value]) =>
      setTranscriptionModelOverride(lang as LanguageCode, value?.trim() ?? ''),
    );
    form.reset(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcription</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {languages.map((lang) => (
              <FormField
                key={lang}
                control={form.control}
                name={lang}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {SUPPORTED_LANGUAGES[lang]} model (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          getDefaultModelId(lang)
                            ? `e.g. ${getDefaultModelId(lang)}`
                            : 'HuggingFace model ID'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      HuggingFace model ID for {SUPPORTED_LANGUAGES[lang]} transcription.
                      Leave empty to use the default for this language.
                    </FormDescription>
                  </FormItem>
                )}
              />
            ))}
            {isDirty && <Button type="submit">Save</Button>}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
