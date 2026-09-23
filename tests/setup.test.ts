/**
 * Smoke test to verify the test infrastructure is working correctly.
 * Confirms that Vitest and fast-check are properly installed and configured.
 */
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Test infrastructure', () => {
  it('Vitest is running', () => {
    expect(true).toBe(true);
  });

  it('fast-check is available and functional', () => {
    // Verify fast-check can run a basic property test
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a; // commutativity
      })
    );
  });
});
