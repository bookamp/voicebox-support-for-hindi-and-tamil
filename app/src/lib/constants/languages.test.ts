/**
 * Tests for supported language constants (including outlier languages).
 */

import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_CODES,
  LANGUAGE_OPTIONS,
  type LanguageCode,
} from './languages';

describe('languages', () => {
  it('SUPPORTED_LANGUAGES has a label for every LANGUAGE_CODE', () => {
    for (const code of LANGUAGE_CODES) {
      expect(SUPPORTED_LANGUAGES[code as LanguageCode]).toBeDefined();
      expect(typeof SUPPORTED_LANGUAGES[code as LanguageCode]).toBe('string');
    }
  });

  it('LANGUAGE_OPTIONS includes one entry per code with value and label', () => {
    expect(LANGUAGE_OPTIONS).toHaveLength(LANGUAGE_CODES.length);
    for (const code of LANGUAGE_CODES) {
      const option = LANGUAGE_OPTIONS.find((o) => o.value === code);
      expect(option).toBeDefined();
      expect(option?.label).toBe(SUPPORTED_LANGUAGES[code as LanguageCode]);
    }
  });

  it('LanguageCode allows all keys of SUPPORTED_LANGUAGES', () => {
    const code: LanguageCode = 'hi';
    expect(SUPPORTED_LANGUAGES[code]).toBe('Hindi');
  });
});
