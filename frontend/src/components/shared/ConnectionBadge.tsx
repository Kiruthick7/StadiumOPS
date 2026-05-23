import clsx from "clsx";
import { Wifi, WifiOff, AlertTriangle, Radio } from "lucide-react";
import type { ConnectionState } from "@/hooks/useStatus";

const CONN_CONFIG: Record<ConnectionState, { icon: typeof Wifi; label: string; color: string }> = {
  connecting: { icon: Radio,         label: "Connecting…",  color: "text-blue-400"  },
  live:       { icon: Wifi,          label: "Live",          color: "text-green-400" },
  degraded:   { icon: AlertTriangle, label: "Degraded",      color: "text-amber-400" },
  offline:    { icon: WifiOff,       label: "Offline",       color: "text-red-400"   },
};

interface Props {
  state: ConnectionState;
}

export function ConnectionBadge({ state }: Props) {
  const { icon: Icon, label, color } = CONN_CONFIG[state];

  return (
    <div className={clsx("flex items-center gap-2 text-xs font-mono", color)}>
      {state === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
      )}
      <Icon size={13} />
      <span>{label}</span>
    </div>
  );
}
