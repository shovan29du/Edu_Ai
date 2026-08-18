import { describe, it, expect } from 'vitest';
import { isTextSafe, isResourceSafe } from '../src/utils/safetyFilter.js';

describe('safetyFilter', () => {
  it('flags blocked words as unsafe', () => {
    expect(isTextSafe('a kind and gentle story')).toBe(true);
    expect(isTextSafe('this is full of hate')).toBe(false);
  });

  it('treats resources with safe:false as unsafe', () => {
    expect(isResourceSafe({ title: 'ok', safe: false })).toBe(false);
    expect(isResourceSafe({ title: 'ok', safe: true })).toBe(true);
  });

  it('flags resources whose text fields contain blocked words', () => {
    expect(isResourceSafe({ title: 'a story about violence', safe: true })).toBe(false);
  });
});
