'use client';

import { 
  ShieldAlert, AlertTriangle, ShieldCheck, ArrowUpRight, ArrowDownRight, 
  Search, ChevronDown, Filter, Square, Eye, ChevronRight, Activity, 
  CreditCard, Monitor, MapPin, IndianRupee, Clock, ChevronLeft, ArrowRight
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Using fixed mock data for charts since we don't have a /api/alerts/summary endpoint
const overviewData = [
  { name: 'Critical', value: 128, color: '#ef4444' },
  { name: 'High', value: 320, color: '#f97316' },
  { name: 'Medium', value: 542, color: '#eab308' },
  { name: 'Low', value: 258, color: '#10b981' },
];

const timeData = [
  { name: 'May 23', critical: 10, high: 20, medium: 40, low: 25 },
  { name: 'May 24', critical: 15, high: 25, medium: 45, low: 20 },
  { name: 'May 25', critical: 8, high: 18, medium: 35, low: 30 },
  { name: 'May 26', critical: 12, high: 22, medium: 50, low: 28 },
  { name: 'May 27', critical: 20, high: 30, medium: 40, low: 22 },
  { name: 'May 28', critical: 18, high: 28, medium: 45, low: 35 },
  { name: 'May 29', critical: 25, high: 35, medium: 55, low: 40 },
];

const categoriesData = [
  { name: 'Velocity Anomaly', count: 425, pct: '34.1%', fill: '#ef4444', icon: Activity },
  { name: 'Card Testing', count: 318, pct: '25.5%', fill: '#f97316', icon: CreditCard },
  { name: 'Amount Anomaly', count: 286, pct: '22.9%', fill: '#eab308', icon: IndianRupee },
  { name: 'New Device', count: 129, pct: '10.3%', fill: '#10b981', icon: Monitor },
  { name: 'Geographic Anomaly', count: 90, pct: '7.2%', fill: '#3b82f6', icon: MapPin },
];

export default function FraudAlerts() {
  const [data, setData] = useState<any>({ items: [], total: 0, page: 1, size: 10, pages: 1 });
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [severity, setSeverity] = useState("All Risk Levels");

  useEffect(() => {
    fetchData();
  }, [page, size, status, severity]);

  const fetchData = async (currentSearch = search) => {
    setLoading(true);
    try {
      let url = `/api/alerts?page=${page}&size=${size}`;
      if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
      if (status !== 'All Statuses') url += `&status=${encodeURIComponent(status)}`;
      if (severity !== 'All Risk Levels') url += `&severity=${encodeURIComponent(severity)}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: any) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchData(search);
    }
  };

  return (
    <div className="p-8 space-y-6 flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fraud Alerts</h1>
        <p className="text-gray-500 text-sm">Monitor and investigate potential fraud alerts in real-time.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 shrink-0">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold">Total Alerts</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">1,248</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <ShieldAlert className="w-5 h-5 text-red-600 fill-red-50" />
              <span className="text-sm font-semibold">Critical</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">128</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500 fill-orange-50" />
              <span className="text-sm font-semibold">High Risk</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">320</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 fill-yellow-50" />
              <span className="text-sm font-semibold">Medium Risk</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">542</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-50" />
              <span className="text-sm font-semibold">Low Risk</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">258</h3>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start flex-1 min-h-0">
        
        {/* Left Column: Filters and Table */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full min-w-0">
          
          {/* Filters Bar */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between space-x-4 bg-gray-50/50 shrink-0">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search alerts (Press Enter)..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e463a]/20" 
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select value={status} onChange={e => {setStatus(e.target.value); setPage(1);}} className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                  <option>All Statuses</option>
                  <option>OPEN</option>
                  <option>INVESTIGATING</option>
                  <option>CLOSED</option>
                  <option>DISMISSED</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={severity} onChange={e => {setSeverity(e.target.value); setPage(1);}} className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                  <option>All Risk Levels</option>
                  <option>CRITICAL</option>
                  <option>HIGH</option>
                  <option>MEDIUM</option>
                  <option>LOW</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1 relative">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
                <tr className="text-xs font-semibold text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-4"><Square className="w-4 h-4 text-gray-300" /></th>
                  <th className="px-4 py-4 font-medium">Alert Details</th>
                  <th className="px-4 py-4 font-medium">Risk Level <ChevronDown className="w-3 h-3 inline ml-1"/></th>
                  <th className="px-4 py-4 font-medium">Alert Score <ChevronDown className="w-3 h-3 inline ml-1"/></th>
                  <th className="px-4 py-4 font-medium">Category</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Detected At <ChevronDown className="w-3 h-3 inline ml-1"/></th>
                  <th className="px-4 py-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr>
                ) : data.items.map((alert: any, idx: number) => {
                  const dt = new Date(alert.created_at);
                  const isCrit = alert.severity === 'CRITICAL';
                  const isHigh = alert.severity === 'HIGH';
                  const isMed = alert.severity === 'MEDIUM';
                  
                  return (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4"><Square className="w-4 h-4 text-gray-300" /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${isCrit ? 'bg-red-50 text-red-600' : isHigh ? 'bg-orange-50 text-orange-600' : isMed ? 'bg-yellow-50 text-yellow-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isCrit ? <ShieldAlert className="w-4 h-4" /> : (!isMed && !isHigh) ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div>
                          <Link href={`/alerts/${alert.id}`} className="font-bold text-gray-900 hover:underline">{alert.transaction_id}</Link>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">Card **** {alert.card_id.slice(-4)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{alert.customer_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        isCrit ? 'bg-red-50 text-red-700 border-red-200' :
                        isHigh ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        isMed ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold ${isCrit ? 'text-red-600' : isHigh ? 'text-orange-500' : isMed ? 'text-yellow-500' : 'text-emerald-600'}`}>
                          {alert.risk_score}/100
                        </span>
                        <div className="flex space-x-0.5 mt-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`h-1.5 w-3 rounded-sm ${i * 20 <= alert.risk_score ? (isCrit ? 'bg-red-600' : isHigh ? 'bg-orange-500' : isMed ? 'bg-yellow-500' : 'bg-emerald-500') : 'bg-gray-200'}`}></div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 space-y-1.5">
                      {alert.categories.map((cat: string, i: number) => {
                        return (
                          <div key={i} className="flex items-center space-x-1.5 text-xs text-gray-600 font-medium">
                            <Activity className="w-3.5 h-3.5 text-gray-400" />
                            <span>{cat}</span>
                          </div>
                        )
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          alert.status === 'OPEN' ? 'text-red-600 bg-red-50' :
                          alert.status === 'INVESTIGATING' ? 'text-blue-600 bg-blue-50' :
                          alert.status === 'DISMISSED' ? 'text-gray-600 bg-gray-100' :
                          'text-emerald-600 bg-emerald-50'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-gray-900">{dt.toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{dt.toLocaleTimeString()}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link href={`/alerts/${alert.id}`} className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white shrink-0">
             <span>Showing {(page - 1) * size + 1} to {Math.min(page * size, data.total)} of {data.total} results</span>
             <div className="flex items-center space-x-4">
               <div className="flex space-x-1">
                 <button onClick={() => setPage(Math.max(1, page-1))} className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-gray-400 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
                 <span className="px-3 py-1.5 font-bold">Page {page} of {data.pages || 1}</span>
                 <button onClick={() => setPage(Math.min(data.pages, page+1))} className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
               </div>
               <div className="relative">
                 <select value={size} onChange={e => {setSize(parseInt(e.target.value)); setPage(1);}} className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                   <option value="10">10 / page</option>
                   <option value="50">50 / page</option>
                 </select>
                 <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="w-[320px] flex-shrink-0 space-y-6 overflow-y-auto pr-2 max-h-full">
          {/* ... widgets ... (Static mock left here for visual accuracy as requested) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Alerts Overview</h3>
              <div className="relative">
                <select className="appearance-none pl-2 pr-6 py-1 border border-gray-200 rounded text-[10px] font-semibold text-gray-600 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                  <option>Last 7 days</option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-24 h-24 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={overviewData} cx="50%" cy="50%" innerRadius={35} outerRadius={48} paddingAngle={2} dataKey="value">
                      {overviewData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">1,248</span>
                </div>
              </div>
              <div className="flex-1 pl-4 space-y-2 text-[10px]">
                {overviewData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                      <span className="text-gray-600 font-medium">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Alerts Over Time</h3>
              <div className="relative">
                <select className="appearance-none pl-2 pr-6 py-1 border border-gray-200 rounded text-[10px] font-semibold text-gray-600 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                  <option>Last 7 days</option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="h-40 w-full mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeData} margin={{top: 5, right: 0, left: -25, bottom: 0}}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="critical" stroke="#ef4444" fill="none" strokeWidth={2} />
                  <Area type="monotone" dataKey="high" stroke="#f97316" fill="none" strokeWidth={2} />
                  <Area type="monotone" dataKey="medium" stroke="#eab308" fill="none" strokeWidth={2} />
                  <Area type="monotone" dataKey="low" stroke="#10b981" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
