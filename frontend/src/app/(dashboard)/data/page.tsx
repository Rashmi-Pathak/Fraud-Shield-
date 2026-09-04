'use client';

import { 
  Database, Server, Network, ShieldCheck, Star, ChevronDown, Calendar, 
  BarChart2, MoreVertical, CheckCircle2, Clock, Activity, HardDrive, Lock, 
  Settings, Link as LinkIcon, AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import Link from 'next/link';

// Mock Data
const dataOverview = [
  { name: 'May 23', ingested: 2.5, processed: 2.2, stored: 11.2, archived: 7.5 },
  { name: 'May 24', ingested: 2.6, processed: 2.3, stored: 11.4, archived: 7.6 },
  { name: 'May 25', ingested: 2.4, processed: 2.1, stored: 11.6, archived: 7.7 },
  { name: 'May 26', ingested: 2.8, processed: 2.5, stored: 11.8, archived: 7.8 },
  { name: 'May 27', ingested: 2.7, processed: 2.4, stored: 12.0, archived: 7.9 },
  { name: 'May 28', ingested: 3.0, processed: 2.6, stored: 12.2, archived: 8.0 },
  { name: 'May 29', ingested: 3.2, processed: 2.8, stored: 12.4, archived: 8.1 },
];

const storageData = [
  { name: 'Hot Storage', value: 4.2, color: '#10b981' },
  { name: 'Warm Storage', value: 3.6, color: '#f59e0b' },
  { name: 'Cold Storage', value: 2.9, color: '#0ea5e9' },
  { name: 'Archive Storage', value: 1.7, color: '#8b5cf6' },
];

const qualityTrends = [
  { name: 'May 23', score: 95.2 },
  { name: 'May 24', score: 95.8 },
  { name: 'May 25', score: 94.5 },
  { name: 'May 26', score: 96.0 },
  { name: 'May 27', score: 96.5 },
  { name: 'May 28', score: 95.9 },
  { name: 'May 29', score: 96.2 },
];

export default function DataCenter() {
  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Center</h1>
        <p className="text-gray-500 text-sm mt-1">Manage, monitor and secure all your data assets and system resources.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><Database className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Total Datasets</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">48</h3>
            <div className="mt-1 flex items-center text-[10px] text-emerald-600 font-bold">
              <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 6 vs last 7 days
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-orange-50 text-orange-500 p-3 rounded-xl"><Server className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Data Volume</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">12.4 TB</h3>
            <div className="mt-1 flex items-center text-[10px] text-emerald-600 font-bold">
              <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 8.6% vs last 7 days
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl"><Network className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Active Pipelines</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">16</h3>
            <div className="mt-1 flex items-center text-[10px] text-emerald-600 font-bold">
              <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 3 vs last 7 days
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Backup Status</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">100%</h3>
            <div className="mt-1 text-[10px] text-gray-500 font-medium">All systems backed up</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-orange-50 text-orange-500 p-3 rounded-xl"><Star className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Data Quality Score</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">96.2%</h3>
            <div className="mt-1 flex items-center text-[10px] text-emerald-600 font-bold">
              <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 2.4% vs last 7 days
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        
        {/* Left Column */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Data Overview Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Data Overview</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <select className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                    <option>All Data Sources</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                <button className="flex items-center space-x-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50">
                  <Calendar className="w-3.5 h-3.5" /> <span>May 23, 2025 - May 29, 2025</span> <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6 text-xs border-b border-gray-100 pb-4">
              <div className="flex flex-col">
                <span className="text-gray-500 font-semibold mb-1 flex items-center"><div className="w-2 h-2 rounded-full bg-[#10b981] mr-1.5"></div> Ingested Data</span>
                <span className="text-xl font-bold text-gray-900">3.2 TB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-semibold mb-1 flex items-center"><div className="w-2 h-2 rounded-full bg-[#f59e0b] mr-1.5"></div> Processed Data</span>
                <span className="text-xl font-bold text-gray-900">2.8 TB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-semibold mb-1 flex items-center"><div className="w-2 h-2 rounded-full bg-[#0ea5e9] mr-1.5"></div> Stored Data</span>
                <span className="text-xl font-bold text-gray-900">12.4 TB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-semibold mb-1 flex items-center"><div className="w-2 h-2 rounded-full bg-[#8b5cf6] mr-1.5"></div> Archived Data</span>
                <span className="text-xl font-bold text-gray-900">8.1 TB</span>
              </div>
            </div>

            <div className="h-64 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataOverview} margin={{top: 5, right: 10, left: -20, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => `${val} TB`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="ingested" stroke="#10b981" strokeWidth={2} dot={{r:3}} />
                  <Line type="monotone" dataKey="processed" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} />
                  <Line type="monotone" dataKey="stored" stroke="#0ea5e9" strokeWidth={2} dot={{r:3}} />
                  <Line type="monotone" dataKey="archived" stroke="#8b5cf6" strokeWidth={2} dot={{r:3}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 flex items-center text-xs">
              <BarChart2 className="w-4 h-4 text-emerald-600 mr-2" />
              <p>Total data volume increased by 8.6% compared to last week.</p>
            </div>
          </div>

          {/* Recent Datasets Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Recent Datasets</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white">
                  <tr className="text-[11px] font-semibold text-gray-500 border-b border-gray-100">
                    <th className="px-2 py-3 font-medium">Dataset Name</th>
                    <th className="px-2 py-3 font-medium">Source</th>
                    <th className="px-2 py-3 font-medium">Records</th>
                    <th className="px-2 py-3 font-medium">Size</th>
                    <th className="px-2 py-3 font-medium">Last Updated</th>
                    <th className="px-2 py-3 font-medium">Quality Score</th>
                    <th className="px-2 py-3 font-medium">Status</th>
                    <th className="px-2 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {[
                    { name: 'Transaction_Full_2025', src: 'Transaction DB', rec: '2.45 B', size: '3.2 TB', upd: 'May 29, 2025 10:15 AM', qual: '98.5%', status: 'Active' },
                    { name: 'User_Behavior_May2025', src: 'User Logs', rec: '890 M', size: '1.1 TB', upd: 'May 29, 2025 09:42 AM', qual: '95.3%', status: 'Active' },
                    { name: 'Merchant_Master', src: 'Reference DB', rec: '12.6 M', size: '320 GB', upd: 'May 28, 2025 11:30 PM', qual: '97.8%', status: 'Active' },
                    { name: 'Device_Fingerprint', src: 'Device Logs', rec: '560 M', size: '780 GB', upd: 'May 28, 2025 08:10 PM', qual: '93.1%', status: 'Active' },
                    { name: 'External_Risk_Feeds', src: 'External API', rec: '245 M', size: '210 GB', upd: 'May 28, 2025 07:25 PM', qual: '94.6%', status: 'Active' },
                  ].map((ds, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-4 font-bold text-gray-900">{ds.name}</td>
                      <td className="px-2 py-4 text-gray-600">{ds.src}</td>
                      <td className="px-2 py-4 font-medium text-gray-900">{ds.rec}</td>
                      <td className="px-2 py-4 font-medium text-gray-900">{ds.size}</td>
                      <td className="px-2 py-4 text-gray-500">{ds.upd}</td>
                      <td className="px-2 py-4 font-bold text-gray-900">{ds.qual}</td>
                      <td className="px-2 py-4">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{ds.status}</span>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <button className="p-1.5 border border-gray-200 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><MoreVertical className="w-3 h-3" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-center">
              <Link href="#" className="text-xs font-bold text-[#1e463a] hover:underline flex items-center">
                View All Datasets <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
            </div>
          </div>

          {/* Data Pipeline Monitor */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Data Pipeline Monitor</h3>
              <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline">View All Pipelines</Link>
            </div>
            
            <div className="grid grid-cols-5 gap-4 relative">
              
              <div className="absolute top-10 left-10 right-10 h-0.5 bg-gray-100 -z-10"></div>

              {[
                { name: 'Transaction Ingestion', status: 'Running', sCol: 'text-emerald-600 bg-emerald-50', icon: Activity, tp: '125K / min', lt: '10:15 AM' },
                { name: 'Feature Engineering', status: 'Running', sCol: 'text-emerald-600 bg-emerald-50', icon: Activity, tp: '85K / min', lt: '10:14 AM' },
                { name: 'Model Training Data', status: 'Completed', sCol: 'text-blue-600 bg-blue-50', icon: CheckCircle2, tp: '-', lt: '09:58 AM' },
                { name: 'Risk Score Pipeline', status: 'Running', sCol: 'text-emerald-600 bg-emerald-50', icon: Activity, tp: '220K / min', lt: '10:16 AM' },
                { name: 'Archive Pipeline', status: 'Scheduled', sCol: 'text-yellow-600 bg-yellow-50', icon: Clock, tp: '-', lt: '02:00 AM', ltLbl: 'Next Run' },
              ].map((p, i) => {
                const Icon = p.icon;
                return (
                  <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between relative">
                    <div>
                      <p className="text-[10px] font-bold text-gray-900 leading-tight mb-2 h-6">{p.name}</p>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border border-transparent ${p.sCol}`}>{p.status}</span>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <div className={`p-2 rounded-full ${p.status === 'Completed' ? 'bg-blue-50 text-blue-500' : p.status === 'Scheduled' ? 'bg-yellow-50 text-yellow-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between text-[9px] border-t border-gray-50 pt-2">
                      <div>
                        <span className="text-gray-400 block mb-0.5">Throughput</span>
                        <span className="font-bold text-gray-900">{p.tp}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 block mb-0.5">{p.ltLbl || 'Last Run'}</span>
                        <span className="font-bold text-gray-900">{p.lt}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="w-[320px] flex-shrink-0 space-y-6">
          
          {/* Storage Utilization */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Storage Utilization</h3>
            <div className="flex items-center">
              <div className="w-24 h-24 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={storageData} cx="50%" cy="50%" innerRadius={35} outerRadius={48} paddingAngle={2} dataKey="value">
                      {storageData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">12.4 TB</span>
                  <span className="text-[8px] text-gray-500 font-medium">Total Used</span>
                </div>
              </div>
              <div className="flex-1 pl-4 space-y-2 text-[9px]">
                {storageData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                      <span className="text-gray-600 font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 block">{item.value} TB</span>
                      <span className="text-gray-400">({Math.round((item.value/12.4)*100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-xs">
              <span className="text-gray-500 font-semibold">Storage Health</span>
              <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold cursor-pointer hover:bg-emerald-100 transition-colors">
                <span>Healthy</span> <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Data Sources</h3>
              <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline flex items-center">View All <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></Link>
            </div>
            
            <div className="space-y-4 mb-4">
              {[
                { name: 'Transaction Database', icon: Database, vol: '8.2 TB', pct: '65%', color: 'bg-emerald-500', icol: 'text-blue-500 bg-blue-50' },
                { name: 'User Behavior Logs', icon: HardDrive, vol: '2.1 TB', pct: '17%', color: 'bg-orange-500', icol: 'text-emerald-500 bg-emerald-50' },
                { name: 'External Feeds', icon: Network, vol: '1.3 TB', pct: '10%', color: 'bg-blue-500', icol: 'text-purple-500 bg-purple-50' },
                { name: 'Deference Data', icon: Lock, vol: '0.5 TB', pct: '4%', color: 'bg-purple-500', icol: 'text-orange-500 bg-orange-50' },
                { name: 'Others', icon: Settings, vol: '0.3 TB', pct: '4%', color: 'bg-gray-400', icol: 'text-gray-500 bg-gray-100' },
              ].map((ds, i) => (
                <div key={i} className="flex flex-col space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${ds.icol}`}><ds.icon className="w-3 h-3"/></div>
                      <span className="text-gray-700 font-medium">{ds.name}</span>
                    </div>
                    <div className="flex space-x-3 text-gray-500 font-semibold">
                      <span>{ds.vol}</span>
                      <span className="text-gray-900">{ds.pct}</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${ds.color}`} style={{ width: ds.pct }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
              <span className="text-gray-500 font-semibold">Total Sources</span>
              <span className="font-bold text-gray-900">28</span>
            </div>
          </div>

          {/* Data Quality Trends */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Data Quality Trends</h3>
              <div className="relative">
                <select className="appearance-none pl-2 pr-5 py-1 border border-gray-200 rounded text-[9px] font-semibold text-gray-600 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                  <option>Last 7 days</option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            
            <div className="h-32 w-full mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityTrends} margin={{top: 5, right: 0, left: -25, bottom: 0}}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={5} />
                  <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{r:3, fill: '#10b981', strokeWidth:2, stroke: '#fff'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center border-t border-gray-50 pt-2 text-[10px]">
              <span className="text-gray-500 font-medium">Average Quality Score</span>
              <div className="flex items-center">
                <span className="font-bold text-gray-900 mr-2">96.2%</span>
                <span className="text-emerald-600 font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded"><svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 2.4%</span>
              </div>
            </div>
          </div>

          {/* Recent Data Activities */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Recent Data Activities</h3>
              <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline flex items-center">View All <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-emerald-50 p-1 rounded-full text-emerald-600 mt-0.5"><Database className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Dataset "Transaction_Full_2025" updated</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">May 29, 2025 • 10:15 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-50 p-1 rounded-full text-blue-600 mt-0.5"><ShieldCheck className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Backup completed successfully</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">May 29, 2025 • 02:30 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-50 p-1 rounded-full text-purple-600 mt-0.5"><LinkIcon className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">New data source "Risk Feed API" connected</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">May 28, 2025 • 11:45 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-red-50 p-1 rounded-full text-red-500 mt-0.5"><AlertTriangle className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Data quality issue detected in "User_Logs"</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">May 28, 2025 • 09:12 PM</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
