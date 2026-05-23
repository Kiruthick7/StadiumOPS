import { useState, useCallback } from "react";
import { api } from "@/services/api";
import type { OperationalStatus } from "@/types";
import { usePolling } from "./usePolling";
import { POLL_INTERVAL_MS } from "@/constants";

export type ConnectionState = "connecting" | "live" | "degraded" | "offline";

interface UseStatusReturn {
  status: OperationalStatus | null;
  connection: ConnectionState;
  lastUpdated: Date | null;
  errorCount: number;
  refresh: () => Promise<void>;
}

export function useStatus(): UseStatusReturn {
  const [status, setStatus]           = useState<OperationalStatus | null>(null);
  const [connection, setConnection]   = useState<ConnectionState>("connecting");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorCount, setErrorCount]   = useState(0);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getStatus();
      setStatus(data);
      setLastUpdated(new Date());
      setConnection("live");
      setErrorCount(0);
    } catch {
      setErrorCount((n) => {
        const next = n + 1;
        if (next >= 3) setConnection("offline");
        else           setConnection("degraded");
        return next;
      });
    }
  }, []);

  const handleError = useCallback(() => setConnection("degraded"), []);

  usePolling(refresh, {
    interval: POLL_INTERVAL_MS,
    enabled: true,
    onError: handleError,
  });

  return { status, connection, lastUpdated, errorCount, refresh };
}
