import clsx from "clsx";
import type { Zone, Gate } from "@/types";
import { X, Users, Activity, ChevronRight } from "lucide-react";
import { RiskBadge } from "../shared/RiskBadge";
import { OccupancyBar } from "../shared/OccupancyBar";
import { TREND_ICON, TREND_COLOR, MOVEMENT_COLOR } from "@/constants";

interface Props {
  zone?: Zone;
  gates: Gate[];
  isOpen: boolean;
  onClose: () => void;
}

export function ZoneDetailsPanel({ zone, gates, isOpen, onClose }: Props) {
  if (!isOpen || !zone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-surface-3/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose} 
      />
      <div className="relative w-full max-w-2xl bg-surface-0 rounded-lg border border-white/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-white/5 bg-surface-1 flex items-start justify-between relative overflow-hidden shrink-0">
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-1.5">
               <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-3 text-zinc-400 border border-slate-600/50">ZONE {zone.id}</span>
               <RiskBadge level={zone.risk_level} />
             </div>
             <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{zone.name}</h2>
           </div>
           <button onClick={onClose} className="p-1.5 bg-surface-2 hover:bg-surface-3 rounded-md transition-colors relative z-10 focus:outline-none focus:ring-2 focus:ring-slate-500 border border-slate-600/50">
             <X size={18} className="text-zinc-500" />
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-surface-0">
           <section>
             <div className="flex items-center gap-2 mb-3 text-zinc-500">
                <Users size={14} />
                <h3 className="font-semibold text-xs tracking-wider uppercase">Occupancy Status</h3>
             </div>
             <div className="bg-surface-1 rounded-md p-4 border border-white/5 shadow-sm">
                <div className="flex justify-between items-end mb-2">
                   <div className="text-2xl font-semibold text-zinc-100 tracking-tight font-mono">
                     {zone.current_occupancy.toLocaleString()}
                   </div>
                   <div className="text-sm font-mono text-zinc-500">
                     / {zone.capacity.toLocaleString()} cap
                   </div>
                </div>
                <OccupancyBar pct={zone.occupancy_pct} risk={zone.risk_level} />
                <div className="flex justify-between mt-2 text-[10px] uppercase tracking-widest font-mono text-zinc-500">
                   <span>0%</span>
                   <span className="text-zinc-400 font-bold">{zone.occupancy_pct.toFixed(1)}%</span>
                   <span>100%</span>
                </div>
             </div>
           </section>
           <section>
             <div className="flex items-center gap-2 mb-3 text-zinc-500">
                <Activity size={14} />
                <h3 className="font-semibold text-xs tracking-wider uppercase">Flow Metrics</h3>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-1 rounded-md p-3 border border-white/5 flex flex-col justify-between">
                   <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-500 mb-1">Movement</span>
                   <span className={clsx("text-base font-bold capitalize", MOVEMENT_COLOR[zone.movement_speed])}>{zone.movement_speed}</span>
                </div>
                <div className="bg-surface-1 rounded-md p-3 border border-white/5 flex flex-col justify-between">
                   <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-500 mb-1">Trend</span>
                   <span className={clsx("text-base font-bold capitalize flex items-center gap-1", TREND_COLOR[zone.trend])}>
                     {zone.trend} <span className="font-mono">{TREND_ICON[zone.trend]}</span>
                   </span>
                </div>
                <div className="bg-surface-1 rounded-md p-3 border border-white/5 col-span-2 flex items-center justify-between">
                   <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-500">Congestion Level</span>
                   <span className={clsx("text-xs font-bold capitalize px-2 py-0.5 rounded border", 
                     zone.congestion_status === 'clear' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                     zone.congestion_status === 'moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                   )}>
                     {zone.congestion_status}
                   </span>
                </div>
             </div>
           </section>
           <section>
             <div className="flex items-center gap-2 mb-3 text-zinc-500">
                <ChevronRight size={14} />
                <h3 className="font-semibold text-xs tracking-wider uppercase">Connected Gates</h3>
             </div>
             <div className="space-y-2">
                {gates.length === 0 ? (
                   <p className="text-xs text-zinc-500 italic px-2">No direct gate feeds available.</p>
                ) : (
                   gates.map(g => (
                     <div key={g.id} className="bg-surface-1 rounded-md p-3 border border-white/5 flex items-center justify-between">
                       <div>
                         <p className="font-medium text-zinc-200 text-sm mb-0.5">{g.name}</p>
                         <p className="text-[10px] text-zinc-500 font-mono">INFLOW: {g.inflow_rate}/MIN</p>
                       </div>
                       <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider", g.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>
                         {g.status}
                       </span>
                     </div>
                   ))
                )}
             </div>
           </section>
        </div>
      </div>
    </div>
  );
}
