import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ClaudeQuotaState, CodexQuotaState, ResolvedTheme } from '@/types';
import { getAuthFileIcon } from '@/features/authFiles/constants';
import type { QuotaFileEntry } from '../logic';
import type { QuotaCardState } from '../providers';
import { summarizeWeekly } from '../summary';
import styles from './QuotaSummary.module.scss';

export function QuotaSummary({
  entries,
  quotaFor,
  resolvedTheme,
}: {
  entries: QuotaFileEntry[];
  quotaFor: (entry: QuotaFileEntry) => QuotaCardState | undefined;
  resolvedTheme: ResolvedTheme;
}) {
  const { t } = useTranslation();
  return (
    <>
      <section className={styles.summary} aria-label={t('quota_management.weekly_remaining')}>
        {(['claude', 'codex'] as const).map((provider) => {
          const accounts = entries.filter((entry) => entry.type === provider);
          const result = summarizeWeekly(
            accounts.map(
              (entry) => quotaFor(entry) as ClaudeQuotaState | CodexQuotaState | undefined
            )
          );
          return (
            <article key={provider} className={styles.provider}>
              <header>
                <img src={getAuthFileIcon(provider, resolvedTheme) ?? undefined} alt="" />
                <strong>{provider === 'claude' ? 'Claude' : 'Codex'}</strong>
                <span>{t('quota_management.meta_credentials', { count: accounts.length })}</span>
              </header>
              <p>{t('quota_management.weekly_remaining')}</p>
              <div className={styles.value}>
                {result.total === null ? '—' : `${Math.round(result.total)}%`}
                {accounts.length > 0 && <small> / {accounts.length * 100}%</small>}
              </div>
              <div className={styles.segments}>
                {(result.remaining.length ? result.remaining : [null]).map((value, index) => (
                  <div key={index} className={styles.track}>
                    <span
                      className={
                        value !== null && value < 20
                          ? styles.low
                          : value !== null && value < 60
                            ? styles.medium
                            : styles.high
                      }
                      style={{ width: `${value ?? 0}%` }}
                    />
                  </div>
                ))}
              </div>
              <p>
                {t('quota_management.summary_loaded', {
                  loaded: result.loaded,
                  count: accounts.length,
                })}
              </p>
            </article>
          );
        })}
      </section>
      {entries.length === 0 && (
        <div className={styles.connect}>
          <div>
            <h2>{t('quota_management.connect_title')}</h2>
            <p>{t('quota_management.connect_description')}</p>
          </div>
          <Link to="/oauth">{t('quota_management.connect_accounts')} →</Link>
        </div>
      )}
    </>
  );
}
