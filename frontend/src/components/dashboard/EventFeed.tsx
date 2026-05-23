import { useState } from "react";
import clsx from "clsx";
import type { Alert } from "@/types";
import { ALERT_SEVERITY_CLASS } from "@/constants";
import { Activity, Clock, CheckCircle, Check } from "lucide-react";
import { api } from "@/services/api";

interface Props {
  alerts: Alert[];
  fullHeight?: boolean;
}

export function EventFeed({ alerts, fullHeight = false }: Props) {
  const [resolving, setResolving] = useState<Set<string>>(new Set());

  const handleResolve = async (id: string) => {
    setResolving(prev => new Set(prev).add(id));
    try {
      await api.resolveAlert(id);
    } catch (e) {
      console.error(e);
      setResolving(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className={clsx("card flex flex-col bg-surface-1 border-white/5", fullHeight ? "h-[calc(100vh-12rem)]" : "h-[800px]")}>
      <div className="card-header border-b border-white/5 pb-3 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-zinc-500" />
          <h3 className="font-semibold text-zinc-200 text-sm tracking-wide">Operational Timeline</h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span> Info</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span> Warning</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span> Critical</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Resolved</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 mt-2 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <Activity size={24} className="text-zinc-500 mb-2" />
            <p className="text-xs text-zinc-500">No active events</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isResolved = alert.resolved || resolving.has(alert.id);
            return (
              <div key={alert.id} className={clsx(
                "alert-banner border-l-2 bg-surface-0 border-t-0 border-r-0 border-b-0 flex items-start gap-3 transition-opacity", 
                isResolved ? "border-emerald-500/50 opacity-60" : ALERT_SEVERITY_CLASS[alert.severity]
              )}>
                <div className="flex-1 py-0.5">
                  <div className="flex items-start justify-between gap-4">
                    <p className={clsx("font-medium text-sm leading-snug mb-1.5", isResolved ? "text-zinc-400 line-through decoration-zinc-600" : "text-zinc-200")}>
                      {alert.message}
                    </p>
                    {isResolved ? (
                      <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    ) : alert.severity !== 'info' ? (
                      <button 
                        onClick={() => handleResolve(alert.id)}
                        className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-surface-2 hover:bg-surface-3 text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded border border-white/5 transition-colors flex items-center gap-1"
                      >
                        <Check size={12} /> Resolve
                      </button>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2.5 text-[10px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(alert.timestamp).toLocaleTimeString()}</span>
                    <span className="uppercase font-semibold tracking-wider text-zinc-500">{alert.category}</span>
                    {alert.zone_id && <span className="bg-surface-2 px-1.5 py-0.5 rounded text-zinc-500">ZONE {alert.zone_id}</span>}
                    {alert.gate_id && <span className="bg-surface-2 px-1.5 py-0.5 rounded text-zinc-500">GATE {alert.gate_id}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
