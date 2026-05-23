import clsx from "clsx";
import type { Zone } from "@/types";

interface Props {
  zones: Zone[];
  onZoneClick?: (id: string) => void;
}
export function StadiumMap({ zones, onZoneClick }: Props) {
  const getZoneColor = (id: string) => {
    const zone = zones.find((z) => z.id === id);
    if (!zone) return "fill-surface-2 stroke-zinc-800";
    const colors: Record<string, string> = {
      critical: "fill-red-500/20 stroke-red-500 hover:fill-red-500/30",
      high: "fill-orange-500/20 stroke-orange-500 hover:fill-orange-500/30",
      medium: "fill-amber-500/20 stroke-amber-500 hover:fill-amber-500/30",
      low: "fill-emerald-500/10 stroke-emerald-600 hover:fill-emerald-500/20",
    };
    
    const base = colors[zone.risk_level] || "fill-surface-1 stroke-zinc-800";
    return onZoneClick ? `${base} cursor-pointer transition-colors duration-300` : base;
  };

  return (
    <div className="card flex items-center justify-center p-4 w-full bg-surface-1/50 border border-white/5 shadow-inner overflow-hidden">
      <svg viewBox="0 0 650 400" className="w-full drop-shadow-sm max-h-[800px]">
        <rect x="50" y="50" width="400" height="300" rx="40" className="fill-surface-0 stroke-zinc-800 stroke-[4]" />
        <rect x="150" y="120" width="200" height="160" rx="10" className="fill-emerald-900/10 stroke-emerald-800/30 stroke-2" />
        <line x1="250" y1="120" x2="250" y2="280" className="stroke-emerald-800/30 stroke-2" />
        <circle cx="250" cy="200" r="30" className="fill-transparent stroke-emerald-800/30 stroke-2" />

        <path onClick={() => onZoneClick?.("Z1")} d="M 150 60 L 350 60 L 330 110 L 170 110 Z" className={clsx("stroke-2", getZoneColor("Z1"))} />
        <path onClick={() => onZoneClick?.("Z2")} d="M 150 340 L 350 340 L 330 290 L 170 290 Z" className={clsx("stroke-2", getZoneColor("Z2"))} />
        <path onClick={() => onZoneClick?.("Z3")} d="M 360 120 L 440 80 L 440 320 L 360 280 Z" className={clsx("stroke-2", getZoneColor("Z3"))} />
        <path onClick={() => onZoneClick?.("Z4")} d="M 140 120 L 60 80 L 60 320 L 140 280 Z" className={clsx("stroke-2", getZoneColor("Z4"))} />

        <path onClick={() => onZoneClick?.("Z5")} d="M 60 70 L 140 70 L 160 110 L 130 110 Z" className={clsx("stroke-2", getZoneColor("Z5"))} />
        <path onClick={() => onZoneClick?.("Z6")} d="M 440 70 L 360 70 L 340 110 L 370 110 Z" className={clsx("stroke-2", getZoneColor("Z6"))} />
        <path onClick={() => onZoneClick?.("Z7")} d="M 60 330 L 140 330 L 160 290 L 130 290 Z" className={clsx("stroke-2", getZoneColor("Z7"))} />

        <text x="250" y="90" textAnchor="middle" className="text-[10px] fill-slate-400 font-mono font-semibold pointer-events-none">Z1</text>
        <text x="250" y="320" textAnchor="middle" className="text-[10px] fill-slate-400 font-mono font-semibold pointer-events-none">Z2</text>
        <text x="400" y="205" textAnchor="middle" className="text-[10px] fill-slate-400 font-mono font-semibold pointer-events-none">Z3</text>
        <text x="100" y="205" textAnchor="middle" className="text-[10px] fill-slate-400 font-mono font-semibold pointer-events-none">Z4</text>
        <text x="110" y="95" textAnchor="middle" className="text-[10px] fill-slate-400 font-mono font-semibold pointer-events-none">Z5</text>
        <text x="390" y="95" textAnchor="middle" className="text-[10px] fill-slate-400 font-mono font-semibold pointer-events-none">Z6</text>
        <text x="110" y="315" textAnchor="middle" className="text-[10px] fill-slate-400 font-mono font-semibold pointer-events-none">Z7</text>
        <g transform="translate(250, 45)" className="opacity-90">
          <rect x="-15" y="-8" width="30" height="16" rx="2" className="fill-blue-500/20 stroke-blue-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[8px] fill-blue-400 font-bold pointer-events-none">GATE A</text>
        </g>
        <g transform="translate(410, 45)" className="opacity-90">
          <rect x="-15" y="-8" width="30" height="16" rx="2" className="fill-blue-500/20 stroke-blue-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[8px] fill-blue-400 font-bold pointer-events-none">GATE B</text>
        </g>
        <g transform="translate(455, 200)" className="opacity-90">
          <rect x="-15" y="-8" width="30" height="16" rx="2" className="fill-blue-500/20 stroke-blue-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[8px] fill-blue-400 font-bold pointer-events-none">GATE C</text>
        </g>
        <g transform="translate(250, 355)" className="opacity-90">
          <rect x="-15" y="-8" width="30" height="16" rx="2" className="fill-blue-500/20 stroke-blue-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[8px] fill-blue-400 font-bold pointer-events-none">GATE D</text>
        </g>
        <g transform="translate(45, 200)" className="opacity-90">
          <rect x="-15" y="-8" width="30" height="16" rx="2" className="fill-blue-500/20 stroke-blue-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[8px] fill-blue-400 font-bold pointer-events-none">GATE E</text>
        </g>
        <g transform="translate(90, 45)" className="opacity-90">
          <rect x="-15" y="-8" width="30" height="16" rx="2" className="fill-purple-500/20 stroke-purple-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[8px] fill-purple-400 font-bold pointer-events-none">VIP</text>
        </g>
        <g transform="translate(90, 355)" className="opacity-80">
          <rect x="-15" y="-8" width="30" height="16" rx="2" className="fill-emerald-500/20 stroke-emerald-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[8px] fill-emerald-500 font-bold pointer-events-none">EXIT</text>
        </g>
        <g transform="translate(410, 355)" className="opacity-80">
          <rect x="-15" y="-8" width="30" height="16" rx="2" className="fill-emerald-500/20 stroke-emerald-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[8px] fill-emerald-500 font-bold pointer-events-none">EXIT</text>
        </g>
        <g transform="translate(85, 85)" className="opacity-70">
          <circle cx="0" cy="0" r="8" className="fill-blue-500/20 stroke-blue-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[7px] fill-blue-400 font-bold pointer-events-none">WC</text>
        </g>
        <g transform="translate(415, 85)" className="opacity-70">
          <circle cx="0" cy="0" r="8" className="fill-blue-500/20 stroke-blue-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[7px] fill-blue-400 font-bold pointer-events-none">WC</text>
        </g>
        <g transform="translate(85, 315)" className="opacity-70">
          <circle cx="0" cy="0" r="8" className="fill-blue-500/20 stroke-blue-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[7px] fill-blue-400 font-bold pointer-events-none">WC</text>
        </g>
        <g transform="translate(415, 315)" className="opacity-70">
          <circle cx="0" cy="0" r="8" className="fill-blue-500/20 stroke-blue-500" />
          <text x="0" y="3" textAnchor="middle" className="text-[7px] fill-blue-400 font-bold pointer-events-none">WC</text>
        </g>
        <g transform="translate(190, 75)" className="opacity-80">
          <rect x="-6" y="-6" width="12" height="12" rx="1" className="fill-red-500/20 stroke-red-500" />
          <path d="M -2,0 L 2,0 M 0,-2 L 0,2" className="stroke-red-500 stroke-[1.5]" />
        </g>
        <g transform="translate(310, 325)" className="opacity-80">
          <rect x="-6" y="-6" width="12" height="12" rx="1" className="fill-red-500/20 stroke-red-500" />
          <path d="M -2,0 L 2,0 M 0,-2 L 0,2" className="stroke-red-500 stroke-[1.5]" />
        </g>
        <g transform="translate(310, 75)" className="opacity-70">
          <circle cx="0" cy="0" r="7" className="fill-amber-500/20 stroke-amber-500" />
          <text x="0" y="2.5" textAnchor="middle" className="text-[6px] fill-amber-400 font-bold pointer-events-none">F&B</text>
        </g>
        <g transform="translate(190, 325)" className="opacity-70">
          <circle cx="0" cy="0" r="7" className="fill-amber-500/20 stroke-amber-500" />
          <text x="0" y="2.5" textAnchor="middle" className="text-[6px] fill-amber-400 font-bold pointer-events-none">F&B</text>
        </g>
        <g transform="translate(470, 210)">
          <rect x="0" y="-125" width="140" height="185" rx="8" className="fill-surface-0/90 stroke-zinc-800/50" />
          <text x="15" y="-105" className="text-[9px] fill-slate-500 font-mono font-bold uppercase tracking-widest">Legend</text>
          <g transform="translate(15, -85)">
            <rect x="0" y="-6" width="22" height="12" rx="2" className="fill-blue-500/20 stroke-blue-500" />
            <text x="11" y="3" textAnchor="middle" className="text-[6px] fill-blue-500 font-bold pointer-events-none">GATE</text>
            <text x="32" y="3.5" className="text-[10px] fill-slate-300 pointer-events-none">Entry Gate</text>
          </g>
          <g transform="translate(15, -60)">
            <rect x="0" y="-6" width="22" height="12" rx="2" className="fill-purple-500/20 stroke-purple-500" />
            <text x="11" y="3" textAnchor="middle" className="text-[6px] fill-purple-400 font-bold pointer-events-none">VIP</text>
            <text x="32" y="3.5" className="text-[10px] fill-slate-300 pointer-events-none">VIP Access</text>
          </g>
          <g transform="translate(15, -35)">
            <rect x="0" y="-6" width="22" height="12" rx="2" className="fill-emerald-500/20 stroke-emerald-500" />
            <text x="11" y="3" textAnchor="middle" className="text-[6px] fill-emerald-500 font-bold pointer-events-none">EXIT</text>
            <text x="32" y="3.5" className="text-[10px] fill-slate-300 pointer-events-none">Emergency Exit</text>
          </g>
          <g transform="translate(15, -10)">
            <circle cx="11" cy="0" r="7" className="fill-blue-500/20 stroke-blue-500" />
            <text x="11" y="2.5" textAnchor="middle" className="text-[6px] fill-blue-400 font-bold pointer-events-none">WC</text>
            <text x="32" y="3.5" className="text-[10px] fill-slate-300 pointer-events-none">Restrooms</text>
          </g>
          <g transform="translate(15, 15)">
            <rect x="5" y="-6" width="12" height="12" rx="1" className="fill-red-500/20 stroke-red-500" />
            <path d="M 9,0 L 13,0 M 11,-2 L 11,2" className="stroke-red-500 stroke-[1.5]" />
            <text x="32" y="3.5" className="text-[10px] fill-slate-300 pointer-events-none">Medical Center</text>
          </g>
          <g transform="translate(15, 40)">
            <circle cx="11" cy="0" r="7" className="fill-amber-500/20 stroke-amber-500" />
            <text x="11" y="2.5" textAnchor="middle" className="text-[5px] fill-amber-400 font-bold pointer-events-none">F&B</text>
            <text x="32" y="3.5" className="text-[10px] fill-slate-300 pointer-events-none">Food & Beverage</text>
          </g>
        </g>
        <text x="540" y="285" textAnchor="middle" className="text-[10px] fill-slate-400 pointer-events-none">
          💡 Click on any seating zone
        </text>
        <text x="540" y="299" textAnchor="middle" className="text-[10px] fill-slate-400 pointer-events-none">
          to view detailed analytics.
        </text>
      </svg>
    </div>
  );
}
