export interface LastScore {
  score: number;
  totalQuestions: number;
}

const LAST_SCORE_KEY = 'bd-quiz:last-score';

const isBrowser = typeof window !== 'undefined';

export function getLastScore(): LastScore | null {
  if (!isBrowser) return null;

  const raw = window.localStorage.getItem(LAST_SCORE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'score' in parsed &&
      'totalQuestions' in parsed &&
      typeof parsed.score === 'number' &&
      typeof parsed.totalQuestions === 'number'
    ) {
      const score = Math.max(0, Math.floor(parsed.score));
      const totalQuestions = Math.max(0, Math.floor(parsed.totalQuestions));

      if (totalQuestions === 0) return null;
      return { score, totalQuestions };
    }
  } catch {
    return null;
  }

  return null;
}

export function setLastScore(payload: LastScore) {
  if (!isBrowser) return;
  if (payload.totalQuestions <= 0) return;

  window.localStorage.setItem(
    LAST_SCORE_KEY,
    JSON.stringify({
      score: Math.max(0, Math.floor(payload.score)),
      totalQuestions: Math.max(0, Math.floor(payload.totalQuestions))
    })
  );
}

export function clearLastScore() {
  if (!isBrowser) return;
  window.localStorage.removeItem(LAST_SCORE_KEY);
}
