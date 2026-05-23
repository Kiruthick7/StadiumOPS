import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  interval: number;
  enabled?: boolean;
  onError?: (err: unknown) => void;
}

/**
 * Generic polling hook — calls `fn` every `interval` ms.
 * Stops automatically when the component unmounts or `enabled` is false.
 */
export function usePolling(
  fn: () => Promise<void> | void,
  { interval, enabled = true, onError }: UsePollingOptions
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const schedule = useCallback(() => {
    timeoutRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      try {
        await fnRef.current();
      } catch (err) {
        onError?.(err);
      }
      if (mountedRef.current && enabled) schedule();
    }, interval);
  }, [interval, enabled, onError]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      (async () => {
        try { await fnRef.current(); } catch (err) { onError?.(err); }
        if (mountedRef.current && enabled) schedule();
      })();
    }
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, schedule]);
}
