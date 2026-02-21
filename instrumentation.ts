/**
 * Runs once when the Next.js server starts.
 * In development, suppress noisy logs: "The user aborted a request", "Retrying 1/3...", AbortError.
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
    return origEmit.apply(this, [name, ...args] as Parameters<typeof origEmit>) as unknown as boolean;
  } as typeof process.emit;

  const origConsoleError = console.error;
  console.error = function (...args: unknown[]) {
    const msg = args[0] != null ? String(args[0]) : '';
    if (msg.includes('The user aborted a request') || (msg.includes('Retrying') && msg.includes('/3'))) {
      return;
    }
    origConsoleError.apply(console, args);
  };
}
