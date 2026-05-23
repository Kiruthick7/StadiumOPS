import clsx from "clsx";
import type { Zone } from "@/types";
import { TREND_ICON, TREND_COLOR, MOVEMENT_COLOR } from "@/constants";
import { RiskBadge } from "../shared/RiskBadge";
import { OccupancyBar } from "../shared/OccupancyBar";
import { MoveRight, TrendingUp, AlertCircle } from "lucide-react";

interface Props {
  zones: Zone[];
  onZoneClick?: (id: string) => void;
}

export function ZoneGrid({ zones, onZoneClick }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {zones.map((zone) => (
        <div 
          key={zone.id} 
          onClick={() => onZoneClick?.(zone.id)}
          className={clsx(
            "card transition-all duration-300 relative overflow-hidden group p-3 flex flex-col gap-3", 
            onZoneClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
            zone.risk_level === 'critical' ? 'border-red-500/50 bg-red-500/5' : 'hover:border-slate-500/50'
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-zinc-200 tracking-wide text-sm">{zone.name}</h3>
                <span className="text-[10px] text-zinc-500 font-mono">ID: {zone.id}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-zinc-400 font-medium">{Math.round(zone.occupancy_pct)}%</span>
                <span className="text-zinc-500">Occupied</span>
              </div>
            </div>
            <RiskBadge level={zone.risk_level} />
          </div>
          <div>
            <OccupancyBar pct={zone.occupancy_pct} risk={zone.risk_level} showLabel={false} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mt-1">
            <div className="stat-pill">
              <span className="text-zinc-500 flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider"><MoveRight size={12}/> Movement</span>
              <span className={clsx("font-semibold capitalize text-xs", MOVEMENT_COLOR[zone.movement_speed])}>
                {zone.movement_speed}
              </span>
            </div>
            <div className="stat-pill">
              <span className="text-zinc-500 flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider"><TrendingUp size={12}/> Trend</span>
              <span className={clsx("font-semibold capitalize flex items-center gap-1 text-xs", TREND_COLOR[zone.trend])}>
                {zone.trend} <span className="font-mono text-sm leading-none">{TREND_ICON[zone.trend]}</span>
              </span>
            </div>
            <div className="stat-pill col-span-2 flex flex-row items-center justify-between py-1.5">
              <span className="text-zinc-500 flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider"><AlertCircle size={12}/> Congestion</span>
              <span className={clsx("font-bold capitalize text-xs", zone.congestion_status === 'clear' ? 'text-emerald-400' : zone.congestion_status === 'moderate' ? 'text-amber-400' : 'text-orange-400')}>
                {zone.congestion_status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
