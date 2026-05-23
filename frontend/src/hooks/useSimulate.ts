import { useState, useCallback } from "react";
import { api } from "@/services/api";

type ScenarioKey = "congestion" | "weather" | "emergency" | "gateBlockage" | "networkFailure" | "reset";

export function useSimulate() {
  const [loading, setLoading] = useState<ScenarioKey | null>(null);

  const trigger = useCallback(
    async (scenario: ScenarioKey, body?: Record<string, unknown>) => {
      setLoading(scenario);
      try {
        switch (scenario) {
          case "congestion":     await api.simulate.congestion(body);     break;
          case "weather":        await api.simulate.weather(body);        break;
          case "emergency":      await api.simulate.emergency(body);      break;
          case "gateBlockage":   await api.simulate.gateBlockage(body);   break;
          case "networkFailure": await api.simulate.networkFailure(body); break;
          case "reset":          await api.simulate.reset();              break;
        }
      } finally {
        setLoading(null);
      }
    },
    []
  );

  return { trigger, loading };
}
