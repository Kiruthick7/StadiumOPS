import { Users, AlertTriangle, CloudRain, Activity } from "lucide-react";
import type { OperationalStatus } from "@/types";
import { WEATHER_LABEL } from "@/constants";
import { OccupancyBar } from "../shared/OccupancyBar";

interface Props {
  status: OperationalStatus;
  onAlertsClick?: () => void;
}

export function OverviewPanel({ status, onAlertsClick }: Props) {
  const activeAlerts = status.alerts.filter((a) => !a.resolved && a.severity !== 'info');
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="card flex flex-col justify-between p-3 gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-500">
            <Users size={14} />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Occupancy</h3>
          </div>
          <p className="text-sm font-bold font-mono text-zinc-200">
            {Math.round((status.current_occupancy / status.total_capacity) * 100)}%
          </p>
        </div>
        <div>
          <div className="flex items-end justify-between mb-1.5">
             <span className="text-lg font-bold font-mono text-zinc-100 leading-none">{status.current_occupancy.toLocaleString()}</span>
             <span className="text-[10px] font-mono text-zinc-500 leading-none">/ {status.total_capacity.toLocaleString()}</span>
          </div>
          <OccupancyBar
            pct={status.current_capacity_pct}
            risk={status.current_capacity_pct > 85 ? "high" : "low"}
            showLabel={false}
          />
        </div>
      </div>

      <div 
        className={`card flex flex-col justify-between p-3 gap-2 ${onAlertsClick ? 'cursor-pointer hover:bg-surface-2 transition-colors' : ''}`}
        onClick={onAlertsClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-500">
            <AlertTriangle size={14} />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Active Alerts</h3>
          </div>
          {criticalAlerts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">
              {criticalAlerts.length} CRITICAL
            </span>
          )}
        </div>
        <div className="flex items-end justify-between mt-auto">
          <span className="text-2xl font-bold font-mono text-zinc-100 leading-none">{activeAlerts.length}</span>
          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-500">Total Unresolved</span>
            {onAlertsClick && (
              <span className="text-[9px] text-zinc-400 mt-0.5 uppercase tracking-wider font-semibold">Click to view details</span>
            )}
          </div>
        </div>
      </div>

      <div className="card flex flex-col justify-between p-3 gap-2">
        <div className="flex items-center gap-2 text-zinc-500 mb-1">
          <CloudRain size={14} />
          <h3 className="text-xs font-semibold uppercase tracking-wider">Weather</h3>
        </div>
        <div className="mt-auto">
           <div className="flex items-baseline gap-2 mb-1">
             <span className="text-xl font-bold text-zinc-100 leading-none">{status.weather.temperature_c}°C</span>
             <span className="text-sm font-medium text-zinc-500">{WEATHER_LABEL[status.weather.condition]}</span>
           </div>
           <div className="flex gap-3 text-[10px] text-zinc-500 font-mono mt-1">
             <span>HUM: {status.weather.humidity_pct}%</span>
             <span>VIS: {status.weather.visibility_km}km</span>
           </div>
        </div>
      </div>

      <div className="card flex flex-col justify-between p-3 gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-500">
            <Activity size={14} />
            <h3 className="text-xs font-semibold uppercase tracking-wider">System Health</h3>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>
        <div className="mt-auto flex flex-col gap-1.5">
           <div className="flex justify-between items-center bg-surface-0 px-2 py-1 rounded border border-white/5">
              <span className="text-[10px] text-zinc-500 font-medium uppercase">Network</span>
              <span className={status.system_health.network_degraded ? "text-[10px] font-bold text-red-400" : "text-[10px] font-bold text-emerald-400"}>
                {status.system_health.network_degraded ? "DEGRADED" : "NOMINAL"}
              </span>
           </div>
           <div className="flex justify-between items-center bg-surface-0 px-2 py-1 rounded border border-white/5">
              <span className="text-[10px] text-zinc-500 font-medium uppercase">AI Engine</span>
              <span className={status.system_health.ai_available ? "text-[10px] font-bold text-emerald-400" : "text-[10px] font-bold text-amber-400"}>
                {status.system_health.ai_available ? "ONLINE" : "OFFLINE"}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}
