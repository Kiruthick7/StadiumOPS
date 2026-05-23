import { Activity, LayoutDashboard, Map, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import type { ConnectionState } from "@/hooks/useStatus";
import { ConnectionBadge } from "../shared/ConnectionBadge";

interface Props {
  children: React.ReactNode;
  connectionState: ConnectionState;
  activeTab: 'overview' | 'zones' | 'incidents';
  onTabChange: (tab: 'overview' | 'zones' | 'incidents') => void;
}

export function AppShell({ children, connectionState, activeTab, onTabChange }: Props) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'zones', label: 'Zones', icon: Map },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  ] as const;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-surface-0">
      <header className="sticky top-0 z-50 bg-surface-0 border-b border-slate-700/50 px-6 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 w-72">
          <div className="w-7 h-7 rounded-md bg-surface-2 flex items-center justify-center border border-slate-700">
            <Activity size={16} className="text-blue-400" />
          </div>
          <div>
            <h1 className="font-semibold tracking-tight text-slate-100 leading-tight text-sm">Stadium<span className="text-slate-400 font-normal">OPS</span></h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wide">MATCH_DAY_OPS_01</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-surface-1 rounded-md p-1 border border-slate-700/50">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={clsx(
                "flex items-center gap-2 px-3 py-1 rounded transition-all duration-150 text-xs font-medium",
                activeTab === item.id
                  ? "bg-surface-3 text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-surface-2"
              )}
            >
              <item.icon size={14} className={clsx(activeTab === item.id ? "text-blue-400" : "text-slate-400")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-5 w-72 justify-end">
          <ConnectionBadge state={connectionState} />
          <div className="h-6 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
             <div className="text-right hidden sm:block">
               <p className="text-xs font-medium text-slate-300">Duty Officer</p>
               <p className="text-[9px] text-slate-500 font-mono">OPR-8842</p>
             </div>
             <div className="w-7 h-7 rounded-md bg-surface-2 flex items-center justify-center text-slate-300 text-[10px] font-bold border border-slate-700">DO</div>
          </div>
        </div>
      </header>
      <nav className="md:hidden flex items-center justify-center gap-2 bg-surface-1 border-b border-slate-700/50 p-2 overflow-x-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium whitespace-nowrap",
              activeTab === item.id ? "bg-surface-3 text-slate-100" : "text-slate-500"
            )}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto lg:overflow-hidden p-4 md:p-6 custom-scrollbar relative flex flex-col">
        <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col min-h-0">
           {children}
        </div>
      </main>
    </div>
  );
}
