import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OverviewPanel } from "@/components/dashboard/OverviewPanel";
import { ZoneGrid } from "@/components/dashboard/ZoneGrid";
import { EventFeed } from "@/components/dashboard/EventFeed";
import { AIRecommendations } from "@/components/ai/AIRecommendations";
import { StadiumMap } from "@/components/map/StadiumMap";
import { SkeletonCard } from "@/components/shared/Skeleton";
import { ZoneDetailsPanel } from "@/components/dashboard/ZoneDetailsPanel";
import { useStatus } from "@/hooks/useStatus";
import { useSimulate } from "@/hooks/useSimulate";
import { api } from "@/services/api";
import { Play, CloudRain, AlertTriangle, XOctagon, WifiOff, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Tab = 'overview' | 'zones' | 'incidents';

export default function App() {
  const { status, connection, refresh } = useStatus();
  const { trigger, loading } = useSimulate();
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);
  const hasTriggeredInitialAI = useRef(false);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [dismissedRecs, setDismissedRecs] = useState<Set<string>>(new Set());

  const handleRefreshAI = async () => {
    setIsRefreshingAI(true);
    try {
      await api.triggerRecommend();
      await refresh(); // instantly fetch new state
      setDismissedRecs(new Set()); // Reset dismissals on fresh AI run
    } finally {
      setIsRefreshingAI(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    setDismissedRecs(prev => new Set(prev).add(id));

    try {
      if (action === 'escalate') {
        const rec = status?.recommendations?.find(r => r.id === id);
        const msg = rec ? `ESCALATED: Manual intervention required for "${rec.recommendation}"` : "ESCALATED: Manual intervention required by Match Director";
        await api.escalateAlert(msg, "critical");
        toast.error('Incident escalated to Match Director. Paging standby staff...');
      } else {
        await api.resolveRecommendation(id);
        if (action === 'apply') {
          toast.success('Automated response applied. Integrating with stadium systems...');
        } else if (action === 'dismiss') {
          toast('Recommendation dismissed by Duty Officer.');
        }
      }
    } catch (e) {
      console.error("Failed to execute action in backend:", e);
    }
  };

  const prevAiAvailable = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (!status) return;

    const justRecoveredAi = status.system_health?.ai_available === true && prevAiAvailable.current === false;
    const initialLoad = status.recommendations?.length === 0 && !hasTriggeredInitialAI.current;

    if ((justRecoveredAi || initialLoad) && !isRefreshingAI) {
      hasTriggeredInitialAI.current = true;
      handleRefreshAI();
    }

    prevAiAvailable.current = status.system_health?.ai_available;
  }, [status, isRefreshingAI]);
  useEffect(() => {
    if (status?.system_health?.ai_available === false) {
      const interval = setInterval(() => {
        if (!isRefreshingAI) {
          handleRefreshAI();
        }
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [status?.system_health?.ai_available, isRefreshingAI]);

  if (!status) {
    return (
      <AppShell
        connectionState="connecting"
        activeTab="overview"
        onTabChange={() => {}}
      >  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-4"><div className="grid grid-cols-4 gap-4"><SkeletonCard/><SkeletonCard/><SkeletonCard/><SkeletonCard/></div></div>
          <div className="col-span-1 md:col-span-3"><div className="grid grid-cols-3 gap-4"><SkeletonCard/><SkeletonCard/><SkeletonCard/></div></div>
        </div>
      </AppShell>
    );
  }

  const selectedZone = selectedZoneId ? status.zones.find(z => z.id === selectedZoneId) : undefined;
  const zoneGates = selectedZoneId ? status.gates.filter(g => g.id.includes(selectedZoneId.replace('Z', '')) || g.id === 'GX') : [];

  return (
    <AppShell
      connectionState={connection}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="mb-6 flex-none card bg-surface-1 py-2 px-3 flex flex-wrap items-center gap-2 border-white/5">
        <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest mr-2 font-semibold">Simulation Tools</span>
        <button onClick={async () => { await trigger('congestion'); handleRefreshAI(); }} disabled={loading !== null} className="btn-scenario">
          {loading === 'congestion' ? <Loader2 size={14} className="animate-spin text-orange-400" /> : <Play size={14} className="text-orange-400" />} Surge
        </button>
        <button onClick={async () => { await trigger('weather'); handleRefreshAI(); }} disabled={loading !== null} className="btn-scenario">
          {loading === 'weather' ? <Loader2 size={14} className="animate-spin text-blue-400" /> : <CloudRain size={14} className="text-blue-400" />} Rain
        </button>
        <button onClick={async () => { await trigger('emergency'); handleRefreshAI(); }} disabled={loading !== null} className="btn-scenario">
          {loading === 'emergency' ? <Loader2 size={14} className="animate-spin text-red-400" /> : <AlertTriangle size={14} className="text-red-400" />} Medical
        </button>
        <button onClick={async () => { await trigger('gateBlockage'); handleRefreshAI(); }} disabled={loading !== null} className="btn-scenario">
          {loading === 'gateBlockage' ? <Loader2 size={14} className="animate-spin text-amber-400" /> : <XOctagon size={14} className="text-amber-400" />} Block
        </button>
        <button onClick={async () => { await trigger('networkFailure'); handleRefreshAI(); }} disabled={loading !== null} className="btn-scenario">
          {loading === 'networkFailure' ? <Loader2 size={14} className="animate-spin text-zinc-500" /> : <WifiOff size={14} className="text-zinc-500" />} Network
        </button>
        <div className="flex-1" />
        <button onClick={async () => { await trigger('reset'); handleRefreshAI(); }} disabled={loading !== null} className="btn-scenario hover:bg-red-500/10 border-red-500/20 text-red-400">
          {loading === 'reset' ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Reset Baseline
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {activeTab === 'overview' && (
          <div className="flex flex-col flex-1 min-h-0 space-y-4 fade-in">
            <div className="flex-none">
              <OverviewPanel status={status} onAlertsClick={() => setActiveTab('incidents')} />
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 pb-2">
              <div className="lg:w-[70%] flex flex-col min-h-0">
                <StadiumMap zones={status.zones} onZoneClick={setSelectedZoneId} />
              </div>
              <div className="lg:w-[30%] lg:border-l border-white/5 lg:pl-4 flex flex-col min-h-0 mt-6 lg:mt-0">
                <AIRecommendations
                  recommendations={status.recommendations.filter(r => !dismissedRecs.has(r.id))}
                  onRefresh={handleRefreshAI}
                  isRefreshing={isRefreshingAI}
                  aiAvailable={status.system_health.ai_available}
                  onAction={handleAction}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="fade-in h-full overflow-y-auto">
            <ZoneGrid zones={status.zones} onZoneClick={setSelectedZoneId} />
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="fade-in h-full overflow-y-auto max-w-4xl mx-auto w-full">
            <EventFeed alerts={status.alerts} fullHeight />
          </div>
        )}
      </div>
      <ZoneDetailsPanel
        zone={selectedZone}
        gates={zoneGates}
        isOpen={!!selectedZone}
        onClose={() => setSelectedZoneId(null)}
      />
    </AppShell>
  );
}
