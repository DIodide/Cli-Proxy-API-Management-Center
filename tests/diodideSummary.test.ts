import { expect, test } from 'bun:test';
import { maskQuotaIdentity, summarizeWeekly } from '../src/features/quota/summary';
test('weekly pool excludes unknown accounts and model-specific windows', () => {
  const result = summarizeWeekly([
    undefined,
    { status: 'error', windows: [] },
    {
      status: 'success',
      windows: [
        { id: 'weekly-fable', label: 'Fable', usedPercent: 90, resetLabel: '', periodHours: 168 },
        { id: 'weekly', label: 'Weekly', usedPercent: 25, resetLabel: '', periodHours: 168 },
      ],
    },
  ]);
  expect(result.total).toBe(75);
  expect(result.loaded).toBe(1);
  expect(result.remaining).toEqual([null, null, 75]);
  expect(summarizeWeekly([undefined]).total).toBeNull();
});
test('identity masking hides emails embedded in credential filenames', () => {
  expect(maskQuotaIdentity('claude-someone@example.com.json')).not.toContain('someone');
  expect(maskQuotaIdentity('account-1.json')).toBe('account-1.json');
});
