import clsx from "clsx";
import type { RiskLevel } from "@/types";
import { RISK_COLORS, RISK_BG } from "@/constants";

interface Props {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: Props) {
  return (
    <span className={clsx("badge", RISK_BG[level], RISK_COLORS[level], className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {level.toUpperCase()}
    </span>
  );
}
