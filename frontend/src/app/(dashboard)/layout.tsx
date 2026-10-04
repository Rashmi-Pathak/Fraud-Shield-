'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Home, Activity, Search, List, Bell, 
  GitMerge, BrainCircuit, Database, Settings, ShieldCheck,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Live Monitor', href: '/live', icon: Activity },
  { name: 'Analyze Transaction', href: '/analyze', icon: Search },
  { name: 'Transactions', href: '/transactions', icon: List },
  { name: 'Fraud Alerts', href: '/alerts', icon: Bell, hasNotification: true },
  { name: 'Fraud Patterns', href: '/patterns', icon: GitMerge },
  { name: 'Model Intelligence', href: '/models', icon: BrainCircuit },
  { name: 'Data Center', href: '/data', icon: Database },
  { name: 'System', href: '/system', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [alertCount, setAlertCount] = useState<number | null>(null);
  const [systemStatus, setSystemStatus] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    let active = true;
    const loadStatus = async () => {
      try {
        const response = await fetch('/api/alerts/summary');
        if (active && response.ok) {
          const data = await response.json();
          setAlertCount(typeof data.total === 'number' ? data.total : 0);
        }
      } catch {
        if (active) setAlertCount(null);
      }
      try {
        const response = await fetch('/api/system/health');
        if (active && response.ok) {
          const data = await response.json();
          setSystemStatus(data.status || null);
        }
      } catch {
        if (active) setSystemStatus(null);
      }
    };
    loadStatus();
    return () => { active = false; };
  }, []);

  return (
    <div className="flex h-screen w-full fraudshield-surface">
      {/* Sidebar */}
      <aside className={cn(
        "bg-[#1e463a] text-white flex flex-col justify-between h-full rounded-r-3xl overflow-hidden shrink-0 shadow-xl m-2 my-2 ml-0 rounded-l-none transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div>
          <div className="flex items-center justify-between p-4 mt-2">
            {!isCollapsed ? (
              <Link href="/" className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-lg relative shrink-0">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight truncate">FraudShield <span className="font-medium text-white/80">AI</span></span>
              </Link>
            ) : (
              <div className="w-full flex justify-center">
                 <Link href="/">
                   <div className="bg-white/10 p-2 rounded-lg relative shrink-0">
                     <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                     <ShieldCheck className="w-6 h-6 text-white" />
                   </div>
                 </Link>
              </div>
            )}
            
            {!isCollapsed && (
               <button onClick={() => setIsCollapsed(true)} className="text-white/50 hover:text-white p-1 shrink-0">
                 <ChevronLeft className="w-5 h-5" />
               </button>
            )}
          </div>
          
          {isCollapsed && (
             <div className="flex justify-center mb-2">
               <button onClick={() => setIsCollapsed(false)} className="text-white/50 hover:text-white p-1">
                 <ChevronRight className="w-5 h-5" />
               </button>
             </div>
          )}

          <nav className={cn("mt-2 space-y-1", isCollapsed ? "px-2" : "px-4")}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between py-3 rounded-xl transition-all duration-200 group relative",
                    isCollapsed ? "px-0 justify-center" : "px-4",
                    isActive 
                      ? "bg-white text-[#1e463a] font-semibold shadow-sm" 
                      : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-[#1e463a]" : "text-white/50 group-hover:text-white")} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && item.hasNotification && !isActive && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full shrink-0"></div>
                  )}
                  {!isCollapsed && item.hasNotification && isActive && (
                    <div className="w-5 h-5 bg-yellow-400 text-[#1e463a] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{alertCount ?? 'N/A'}</div>
                  )}
                  
                  {/* Minimized notification dot */}
                  {isCollapsed && item.hasNotification && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full shrink-0"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Status */}
        <div className="p-4">
          <div className="bg-black/20 rounded-xl p-3 flex items-center justify-center space-x-3 backdrop-blur-sm border border-white/5" title={isCollapsed ? (systemStatus || 'Backend unavailable') : undefined}>
            <div className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate">System Status</p>
                <p className="text-xs text-emerald-400 font-medium truncate">{systemStatus || 'Backend unavailable'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col h-screen">
        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-transparent">
          {children}
        </div>
      </main>
    </div>
  );
}
