const DEFAULT_MAX_CONCURRENT = 6;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 500;
const DEFAULT_MAX_DELAY_MS = 8000;

const maxConcurrent = (() => {
  const raw = (import.meta as any)?.env?.VITE_API_MAX_CONCURRENT;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_CONCURRENT;
})();

let activeCount = 0;
const queue: Array<(release: () => void) => void> = [];

const acquire = (): Promise<() => void> =>
  new Promise((resolve) => {
    const grant = (release: () => void) => resolve(release);
    if (activeCount < maxConcurrent) {
      activeCount += 1;
      grant(releaseSlot);
      return;
    }
    queue.push(grant);
  });

const releaseSlot = () => {
  activeCount = Math.max(0, activeCount - 1);
  const next = queue.shift();
  if (next) {
    activeCount += 1;
    next(releaseSlot);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryAfterMs = (response: Response) => {
  const header = response.headers.get("Retry-After");
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000);
  }
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }
  return null;
};

export interface LimitedFetchOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryOnStatuses?: number[];
  retryMethods?: string[];
}

export const limitedFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: LimitedFetchOptions = {}
): Promise<Response> => {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
    retryOnStatuses = [429],
    retryMethods = ["GET", "HEAD"],
  } = options;

  const method = (init.method || "GET").toUpperCase();
  const shouldRetryMethod = retryMethods.includes(method);

  let attempt = 0;
  let lastError: unknown = null;
  let lastResponse: Response | null = null;

  while (attempt <= maxRetries) {
    const release = await acquire();
    let shouldRelease = true;
    try {
      const response = await fetch(input, init);
      lastResponse = response;

      if (!retryOnStatuses.includes(response.status) || !shouldRetryMethod) {
        return response;
      }

      if (attempt >= maxRetries) {
        return response;
      }

      // Release slot BEFORE sleeping for retry
      release();
      shouldRelease = false;

      const retryAfterMs = getRetryAfterMs(response);
      const jitter = Math.floor(Math.random() * 250);
      const backoff = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt + jitter);
      await sleep(retryAfterMs ?? backoff);
    } catch (error) {
      lastError = error;
      if (!shouldRetryMethod || attempt >= maxRetries) {
        throw error;
      }

      // Release slot BEFORE sleeping for retry
      release();
      shouldRelease = false;

      const jitter = Math.floor(Math.random() * 250);
      const backoff = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt + jitter);
      await sleep(backoff);
    } finally {
      if (shouldRelease) {
        release();
      }
    }

    attempt += 1;
  }

  if (lastError) {
    throw lastError;
  }

  return lastResponse ?? new Response(null, { status: 500, statusText: "Internal Error" });
};
