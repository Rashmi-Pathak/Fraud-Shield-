'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Activity, Search, List, Bell, 
  GitMerge, BrainCircuit, Database, Settings, ShieldCheck 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

  return (
    <div className="flex h-screen w-full bg-[#f4f7f6]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e463a] text-white flex flex-col justify-between h-full rounded-r-3xl overflow-hidden shrink-0 shadow-xl m-2 my-2 ml-0 rounded-l-none">
        <div>
          <div className="p-6 flex items-center space-x-3 mt-2">
            <div className="bg-white/10 p-2 rounded-lg relative">
              <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">FraudShield <span className="font-medium text-white/80">AI</span></span>
          </div>

          <nav className="mt-4 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-white text-[#1e463a] font-semibold shadow-sm" 
                      : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn("w-5 h-5", isActive ? "text-[#1e463a]" : "text-white/50 group-hover:text-white")} />
                    <span>{item.name}</span>
                  </div>
                  {item.hasNotification && !isActive && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  )}
                  {item.hasNotification && isActive && (
                    <div className="w-5 h-5 bg-yellow-400 text-[#1e463a] rounded-full flex items-center justify-center text-[10px] font-bold">12</div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Status */}
        <div className="p-6">
          <div className="bg-black/20 rounded-xl p-4 flex items-center space-x-3 backdrop-blur-sm border border-white/5">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">System Status</p>
              <p className="text-xs text-emerald-400 font-medium">Operational</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col h-screen">
        {/* Top Navbar */}
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1e463a]/20 w-64 transition-all"
              />
            </div>
            
            <div className="relative p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
              <Bell className="w-6 h-6" />
              <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">8</div>
            </div>
            
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <Link href="/system" className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer rounded-full hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#f4f7f6]">
          {children}
        </div>
      </main>
    </div>
  );
}
