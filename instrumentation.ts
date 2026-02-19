/**
 * Runs once when the Next.js server starts.
 * In development, suppress "The user aborted a request" / AbortError from cluttering the console
 * (expected when navigation or RSC prefetch cancels in-flight requests).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NODE_ENV !== 'development') return;

  function isAbortError(reason: unknown): boolean {
    const err = reason instanceof Error ? reason : null;
    const msg = err?.message ?? String(reason);
    return (
      err?.name === 'AbortError' ||
      (typeof msg === 'string' &&
        (msg.includes('The user aborted a request') || msg.includes('aborted')))
    );
  }

  const origEmit = process.emit;
  process.emit = function (this: NodeJS.Process, name: string, ...args: unknown[]): boolean {
    if (name === 'unhandledRejection' && args[0] != null && isAbortError(args[0])) {
      return false;
    }
    return origEmit.apply(this, [name, ...args] as Parameters<typeof origEmit>);
  };
}
