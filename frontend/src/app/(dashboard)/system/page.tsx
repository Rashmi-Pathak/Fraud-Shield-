'use client';

import { 
  CheckCircle2, Clock, Activity, AlertTriangle, ShieldCheck, Monitor,
  ChevronDown, Server, ArrowRight, Shield, Calendar
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import Link from 'next/link';

// Mock Data
const perfData = [
  { name: 'May 23', cpu: 32, mem: 55, disk: 41, net: 45, gpu: 20 },
  { name: 'May 24', cpu: 35, mem: 58, disk: 42, net: 48, gpu: 22 },
  { name: 'May 25', cpu: 30, mem: 56, disk: 41, net: 42, gpu: 19 },
  { name: 'May 26', cpu: 38, mem: 60, disk: 43, net: 52, gpu: 25 },
  { name: 'May 27', cpu: 36, mem: 59, disk: 42, net: 50, gpu: 23 },
  { name: 'May 28', cpu: 33, mem: 57, disk: 41, net: 47, gpu: 21 },
  { name: 'May 29', cpu: 34, mem: 58, disk: 42, net: 49, gpu: 23 },
];

const uptimeData = Array.from({length: 30}).map((_, i) => ({
  day: i + 1,
  val: Math.random() > 0.1 ? 100 : (Math.random() * 5 + 95)
}));

export default function SystemHealth() {
  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor the health, performance and security of the FraudShield AI platform.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-semibold">Overall Status</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Operational</h3>
          </div>
          <p className="text-[9px] text-gray-500 mt-2 font-medium">All systems running smoothly</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-semibold">System Uptime</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">99.98%</h3>
          </div>
          <div className="mt-2 flex items-center text-[9px] text-emerald-600 font-bold">
            <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 0.02% vs last 7 days
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span className="text-[11px] font-semibold">Response Time (Avg)</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <h3 className="text-xl font-bold text-gray-900">142</h3>
              <span className="text-sm font-bold text-gray-600">ms</span>
            </div>
          </div>
          <div className="mt-2 flex items-center text-[9px] text-emerald-600 font-bold">
            <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5-5-5m0 0l5-5 5 5m-5-5v12"></path></svg> 8 ms vs last 7 days
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500 hidden"></div>
          <div>
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-[11px] font-semibold">Active Incidents</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">0</h3>
          </div>
          <p className="text-[9px] text-gray-400 mt-2 font-medium flex items-center">
             - No active incidents
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-semibold">Security Score</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <h3 className="text-xl font-bold text-gray-900">98</h3>
              <span className="text-[10px] font-bold text-gray-500">/ 100</span>
            </div>
          </div>
          <div className="mt-2 flex items-center text-[9px] text-emerald-600 font-bold">
            <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 2 pts vs last 7 days
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <Monitor className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-semibold">System Load (Avg)</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">34%</h3>
          </div>
          <div className="mt-2 flex items-center text-[9px] text-emerald-600 font-bold">
            <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5-5-5m0 0l5-5 5 5m-5-5v12"></path></svg> 6% vs last 7 days
          </div>
        </div>

      </div>

      <div className="flex gap-6 items-start">
        
        {/* Left Column */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* System Performance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">System Performance</h3>
              <div className="relative">
                <select className="appearance-none pl-3 pr-8 py-1 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                  <option>Last 7 days</option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-6 text-xs border-b border-gray-100 pb-4">
              <div className="flex flex-col">
                <span className="text-gray-500 font-semibold mb-1">CPU Usage</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-lg font-bold text-gray-900">34%</span>
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center"><svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5-5-5m0 0l5-5 5 5m-5-5v12"></path></svg> 6%</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-semibold mb-1">Memory Usage</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-lg font-bold text-gray-900">58%</span>
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center"><svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5-5-5m0 0l5-5 5 5m-5-5v12"></path></svg> 5%</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-semibold mb-1">Disk Usage</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-lg font-bold text-gray-900">42%</span>
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center"><svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5-5-5m0 0l5-5 5 5m-5-5v12"></path></svg> 3%</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-semibold mb-1">Network I/O</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-lg font-bold text-gray-900">267 <span className="text-sm font-medium">Mbps</span></span>
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center"><svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 12%</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-semibold mb-1">GPU Usage</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-lg font-bold text-gray-900">23%</span>
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center"><svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 4%</span>
                </div>
              </div>
            </div>

            <div className="h-56 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={perfData} margin={{top: 5, right: 10, left: -20, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#10b981" strokeWidth={2} dot={{r:3}} />
                  <Line type="monotone" dataKey="mem" stroke="#3b82f6" strokeWidth={2} dot={{r:3}} />
                  <Line type="monotone" dataKey="disk" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} />
                  <Line type="monotone" dataKey="net" stroke="#8b5cf6" strokeWidth={2} dot={{r:3}} />
                  <Line type="monotone" dataKey="gpu" stroke="#14b8a6" strokeWidth={2} dot={{r:3}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center space-x-6 text-[10px] font-semibold text-gray-600 mb-6 border-b border-gray-100 pb-4">
              <span className="flex items-center"><div className="w-2 h-1 rounded-full bg-[#10b981] mr-1.5"></div> CPU Usage</span>
              <span className="flex items-center"><div className="w-2 h-1 rounded-full bg-[#3b82f6] mr-1.5"></div> Memory Usage</span>
              <span className="flex items-center"><div className="w-2 h-1 rounded-full bg-[#f59e0b] mr-1.5"></div> Disk Usage</span>
              <span className="flex items-center"><div className="w-2 h-1 rounded-full bg-[#8b5cf6] mr-1.5"></div> Network I/O</span>
              <span className="flex items-center"><div className="w-2 h-1 rounded-full bg-[#14b8a6] mr-1.5"></div> GPU Usage</span>
            </div>

            <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-100 flex items-center text-[11px] font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" />
              <p>All critical systems are performing within normal thresholds.</p>
            </div>
          </div>

          {/* Recent System Events */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Recent System Events</h3>
              <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline flex items-center">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white">
                  <tr className="text-[11px] font-semibold text-gray-500 border-b border-gray-100">
                    <th className="px-2 py-3 font-medium">Time</th>
                    <th className="px-2 py-3 font-medium">Severity</th>
                    <th className="px-2 py-3 font-medium">Component</th>
                    <th className="px-2 py-3 font-medium">Event</th>
                    <th className="px-2 py-3 font-medium">Status</th>
                    <th className="px-2 py-3 font-medium text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {[
                    { t: 'May 29, 2025 10:15 AM', sev: 'Info', c: 'Backup Service', e: 'Daily backup completed successfully', s: 'Resolved', d: '12m 34s' },
                    { t: 'May 29, 2025 09:42 AM', sev: 'Info', c: 'ML Inference Service', e: 'Model v2.4.1 deployment completed', s: 'Resolved', d: '8m 21s' },
                    { t: 'May 29, 2025 08:33 AM', sev: 'Warning', c: 'API Gateway', e: 'High response time detected', s: 'Resolved', d: '15m 10s' },
                    { t: 'May 28, 2025 11:07 PM', sev: 'Info', c: 'Database Cluster', e: 'Index optimization completed', s: 'Resolved', d: '22m 18s' },
                    { t: 'May 28, 2025 09:15 PM', sev: 'Info', c: 'Monitoring Service', e: 'Health check configuration updated', s: 'Resolved', d: '5m 02s' },
                  ].map((ev, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-3 font-medium text-gray-900">{ev.t}</td>
                      <td className="px-2 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ev.sev === 'Warning' ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                          {ev.sev}
                        </span>
                      </td>
                      <td className="px-2 py-3 font-medium text-gray-900">{ev.c}</td>
                      <td className="px-2 py-3 text-gray-600">{ev.e}</td>
                      <td className="px-2 py-3">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{ev.s}</span>
                      </td>
                      <td className="px-2 py-3 font-medium text-gray-600 text-right">{ev.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-center">
              <button className="flex items-center space-x-2 text-xs font-bold text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
                <span>View All Events</span> <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Grid row for Security and Resources */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Security & Compliance */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Security & Compliance</h3>
                <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline">View Details</Link>
              </div>
              
              <div className="flex items-center justify-between">
                
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-semibold text-gray-500 mb-2">Threat Detection</p>
                  <div className="w-24 h-24 relative">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                      <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="0" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Shield className="w-8 h-8 text-emerald-500" />
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-gray-600 mt-2">No threats detected</p>
                  <p className="text-[9px] text-gray-400">All clear</p>
                </div>

                <div className="flex-1 ml-6 space-y-4 text-xs">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">Vulnerability Scan</p>
                      <p className="text-[10px] text-gray-500">No critical vulnerabilities</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">Firewall Status</p>
                      <p className="text-[10px] text-gray-500">All rules active</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">SSL Certificates</p>
                      <p className="text-[10px] text-gray-500">All certificates valid</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">Compliance Status</p>
                      <p className="text-[10px] text-gray-500">Compliant (SOC 2, GDPR)</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Resource Utilization */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Resource Utilization</h3>
                <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline">View Details</Link>
              </div>

              <div className="grid grid-cols-4 gap-4 h-full pt-2">
                
                {[
                  { lbl: 'CPU', val: 34, vlbl: 'of 100%', col: '#3b82f6', trend: 'down', trVal: '6%' },
                  { lbl: 'Memory', val: 58, vlbl: 'of 100%', col: '#8b5cf6', trend: 'down', trVal: '5%' },
                  { lbl: 'Disk', val: 42, vlbl: 'of 100%', col: '#f59e0b', trend: 'down', trVal: '3%' },
                  { lbl: 'Network', val: 67, vlbl: 'of 1 Gbps', col: '#10b981', trend: 'up', trVal: '12%' },
                ].map((res, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <p className="text-[11px] font-bold text-gray-700 mb-2">{res.lbl}</p>
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="26" stroke="#f3f4f6" strokeWidth="6" fill="none" />
                        <circle cx="32" cy="32" r="26" stroke={res.col} strokeWidth="6" fill="none" strokeDasharray="163.28" strokeDashoffset={163.28 * (1 - res.val/100)} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm font-bold text-gray-900 leading-none">{res.val}%</span>
                        <span className="text-[7px] text-gray-500 font-medium">{res.vlbl}</span>
                      </div>
                    </div>
                    <div className={`mt-3 flex items-center text-[9px] font-bold ${res.trend === 'up' ? 'text-emerald-600' : 'text-emerald-600'}`}>
                      <svg className={`w-3 h-3 mr-0.5 ${res.trend === 'down' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> {res.trVal}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column */}
        <div className="w-[320px] flex-shrink-0 space-y-6">
          
          {/* System Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">System Status</h3>
              <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline">View All</Link>
            </div>
            
            <div className="space-y-3">
              {[
                { n: 'Web Application', icon: Monitor },
                { n: 'API Gateway', icon: Server },
                { n: 'Fraud Detection Engine', icon: ShieldCheck },
                { n: 'ML Inference Service', icon: Activity },
                { n: 'Database Cluster', icon: Server },
                { n: 'Cache Service (Redis)', icon: Server },
                { n: 'Message Queue (Kafka)', icon: Activity },
                { n: 'Storage Service', icon: Server },
                { n: 'Backup Service', icon: ShieldCheck },
                { n: 'Monitoring Service', icon: Monitor },
              ].map((sys, i) => {
                const Icon = sys.icon;
                return (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2 text-gray-700 font-medium">
                      <div className="p-1 bg-blue-50 text-blue-600 rounded"><Icon className="w-3 h-3" /></div>
                      <span>{sys.n}</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Operational</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incident Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Incident Summary</h3>
              <div className="relative">
                <select className="appearance-none pl-2 pr-5 py-1 border border-gray-200 rounded text-[9px] font-semibold text-gray-600 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                  <option>Last 30 days</option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-600 mb-1">0</p>
                <p className="text-[9px] font-semibold text-red-800">Critical</p>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-orange-500 mb-1">1</p>
                <p className="text-[9px] font-semibold text-orange-800">Warning</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-blue-500 mb-1">3</p>
                <p className="text-[9px] font-semibold text-blue-800">Info</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-700 mb-1">4</p>
                <p className="text-[9px] font-semibold text-gray-600">Total</p>
              </div>
            </div>
          </div>

          {/* Uptime History */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Uptime History</h3>
            
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none">99.98%</p>
                <p className="text-[9px] font-medium text-gray-500 mt-1">Overall Uptime</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-end"><svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 0.03%</p>
                <p className="text-[9px] font-medium text-gray-500 mt-1">vs previous 30 days</p>
              </div>
            </div>

            <div className="h-24 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uptimeData} margin={{top: 0, right: 0, left: -25, bottom: 0}}>
                  <YAxis domain={[95, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#9ca3af' }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{fontSize:'10px', borderRadius:'8px'}} />
                  <Bar dataKey="val" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-[8px] text-gray-400 mt-1 px-4">
                <span>Apr 30</span>
                <span>May 5</span>
                <span>May 10</span>
                <span>May 15</span>
                <span>May 20</span>
                <span>May 25</span>
                <span>May 29</span>
              </div>
            </div>
          </div>

          {/* Maintenance Schedule */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Maintenance Schedule</h3>
              <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600 border border-blue-100"><Calendar className="w-4 h-4" /></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-bold text-gray-900">Database Maintenance</p>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Scheduled</span>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-0.5">May 31, 2025 12:00 AM - 02:00 AM</p>
                  <p className="text-[9px] font-medium text-gray-600 mt-0.5">Estimated downtime: 2 hours</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-50 p-2 rounded-lg text-purple-600 border border-purple-100"><Activity className="w-4 h-4" /></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-bold text-gray-900">Model Training Window</p>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Scheduled</span>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-0.5">Jun 02, 2025 01:00 AM - 03:00 AM</p>
                  <p className="text-[9px] font-medium text-gray-600 mt-0.5">Estimated impact: Low</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
              <button className="text-[10px] font-bold text-gray-600 hover:text-gray-900 flex items-center">
                View All Maintenance <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
