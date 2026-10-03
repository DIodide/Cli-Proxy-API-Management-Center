import type { ClaudeQuotaState, CodexQuotaState } from '@/types';

export function maskQuotaIdentity(value: string): string {
  const suffix = value.endsWith('.json') ? '.json' : '';
  const name = suffix ? value.slice(0, -suffix.length) : value;
  return (
    name.replace(
      /(claude-|codex-)?([A-Z0-9._%+-]+)@([A-Z0-9.-]+\.[A-Z]{2,})/gi,
      (_email, prefix: string | undefined, local: string, domain: string) =>
        `${prefix ?? ''}${local.slice(0, 2)}•••@${domain.slice(0, 1)}•••`
    ) + suffix
  );
}

// Sum like-for-like weekly windows only; unloaded accounts never count as zero.
export function summarizeWeekly(states: Array<ClaudeQuotaState | CodexQuotaState | undefined>) {
  const remaining = states.map((state) => {
    if (state?.status !== 'success') return null;
    const window = state.windows.find(
      (item) => item.periodHours === 168 && ['seven-day', 'weekly'].includes(item.id)
    );
    const used = window?.usedPercent;
    return typeof used === 'number' && Number.isFinite(used)
      ? 100 - Math.max(0, Math.min(100, used))
      : null;
  });
  const loaded = remaining.filter((value): value is number => value !== null);
  return {
    remaining,
    loaded: loaded.length,
    total: loaded.length ? loaded.reduce((a, b) => a + b, 0) : null,
  };
}
