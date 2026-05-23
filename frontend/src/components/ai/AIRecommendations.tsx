import { Sparkles, RefreshCcw, ShieldAlert, Check, AlertTriangle, X, Loader2 } from "lucide-react";
import clsx from "clsx";
import type { AIRecommendation } from "@/types";
import { PRIORITY_LABEL } from "@/constants";

interface Props {
  recommendations: AIRecommendation[];
  onRefresh: () => void;
  isRefreshing: boolean;
  aiAvailable: boolean;
  onAction?: (id: string, action: 'apply' | 'escalate' | 'dismiss') => void;
}

export function AIRecommendations({ recommendations, onRefresh, isRefreshing, aiAvailable, onAction }: Props) {
  return (
    <div className={clsx(
      "card flex flex-col flex-1 min-h-0 transition-colors duration-300 border",
      aiAvailable ? "bg-surface-1/80 border-slate-700/50" : "bg-surface-1/90 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
    )}>
      <div className={clsx(
        "card-header border-b pb-3 transition-colors duration-300 flex justify-between items-center",
        aiAvailable ? "border-slate-700/50" : "border-amber-500/20 bg-amber-500/5 -mx-4 -mt-4 px-4 pt-4 rounded-t-xl"
      )}>
        <div className="flex items-center gap-2">
          {aiAvailable ? (
            <Sparkles size={16} className="text-blue-400" />
          ) : (
            <ShieldAlert size={16} className="text-amber-400" />
          )}
          <h3 className={clsx(
            "font-semibold text-sm tracking-wide",
            aiAvailable ? "text-slate-200" : "text-amber-500"
          )}>
            {aiAvailable ? "AI Operations Engine" : "Rule-based Fallback"}
          </h3>
          {!aiAvailable && (
             <span className="ml-2 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">DEGRADED</span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1 rounded bg-surface-2 hover:bg-surface-3 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50 border border-slate-700/50"
          title="Force fresh analysis"
        >
          <RefreshCcw size={14} className={clsx(isRefreshing && "animate-spin")} />
        </button>
      </div>

      <div className="mt-3 flex-1 relative">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar pr-1 space-y-3">
        {isRefreshing ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-slate-500 space-y-2">
            <Loader2 size={24} className="animate-spin text-blue-500/50" />
            <p className="text-xs animate-pulse">Analyzing operational state...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-slate-500 space-y-2">
            <Check size={24} className="text-emerald-500/50" />
            <p className="text-xs">All active recommendations addressed.<br/>Operations nominal.</p>
          </div>
        ) : (
          recommendations.slice().reverse().map((rec) => (
            <div key={rec.id} className={clsx(
              "rounded-md bg-surface-0 border flex flex-col overflow-hidden relative shadow-sm",
              rec.source === 'ai' ? "border-slate-700/50" : "border-amber-700/50"
            )}>
              <div className={clsx(
                "absolute left-0 top-0 bottom-0 w-1",
                rec.source === 'ai' ? "bg-blue-500/20" : "bg-amber-500/20"
              )} />
              
              <div className="p-4 pl-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-3 gap-4">
                  <p className="font-semibold text-sm text-slate-200 leading-snug">
                    {rec.recommendation}
                  </p>
                  <span className={clsx("text-[9px] font-mono font-bold px-2 py-1 rounded border uppercase tracking-wider whitespace-nowrap", 
                    rec.priority === 'urgent' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    rec.priority === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                    rec.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  )}>
                    {PRIORITY_LABEL[rec.priority]}
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {rec.reasoning}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-[10px] font-mono mb-2">
                  <div className="flex flex-wrap gap-2 items-center text-slate-400">
                    {rec.zone_id && <span className="bg-surface-2 px-1.5 py-0.5 rounded text-slate-300 whitespace-nowrap">ZONE {rec.zone_id}</span>}
                    <span className="opacity-70 whitespace-nowrap">
                      {new Date(rec.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={clsx(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-surface-2 border border-slate-700/50 whitespace-nowrap",
                      rec.source === 'ai' ? "text-blue-400" : "text-amber-400"
                    )}>
                      {rec.source === 'ai' ? <Sparkles size={9} /> : <ShieldAlert size={9} />}
                      <span>{rec.source === 'ai' ? "AI GENERATED" : "SYSTEM RULE"}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-slate-500 whitespace-nowrap ml-auto" title="Confidence Score">
                    <span>CONFIDENCE</span>
                    <div className="w-12 h-1 bg-surface-2 rounded-full overflow-hidden">
                      <div 
                        className={clsx("confidence-fill h-full", rec.confidence > 85 ? "bg-emerald-500" : rec.confidence > 70 ? "bg-amber-500" : "bg-red-500")}
                        style={{ width: `${rec.confidence}%` }}
                      />
                    </div>
                    <span className="text-slate-700 w-5 text-right">{rec.confidence}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex border-t border-slate-700/50 bg-surface-1 divide-x divide-slate-700/50 mt-auto">
                <button onClick={() => onAction?.(rec.id, 'apply')} className="flex-1 py-2.5 flex justify-center items-center gap-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors">
                  <Check size={14} /> Apply Response
                </button>
                <button onClick={() => onAction?.(rec.id, 'escalate')} className="flex-1 py-2.5 flex justify-center items-center gap-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/10 transition-colors">
                  <AlertTriangle size={14} /> Escalate
                </button>
                <button onClick={() => onAction?.(rec.id, 'dismiss')} className="px-4 py-2.5 flex justify-center items-center text-slate-500 hover:bg-slate-700/50 hover:text-slate-800 transition-colors" title="Dismiss">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  );
}
