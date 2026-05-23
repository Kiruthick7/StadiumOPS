import clsx from "clsx";
import { RISK_COLORS, RISK_BAR } from "@/constants";
import type { RiskLevel } from "@/types";

interface Props {
  pct: number;
  risk: RiskLevel;
  showLabel?: boolean;
}

export function OccupancyBar({ pct, risk, showLabel = true }: Props) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Occupancy</span>
          <span className={clsx("font-mono font-semibold", RISK_COLORS[risk])}>
            {clamped.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="risk-bar-track">
        <div
          className={clsx("h-full rounded-full transition-all duration-700", RISK_BAR[risk])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
