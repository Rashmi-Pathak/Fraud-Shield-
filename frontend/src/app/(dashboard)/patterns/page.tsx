'use client';

import { 
  LayoutGrid, AlertTriangle, Binoculars, ShieldCheck, ArrowUpRight, ArrowDownRight, 
  Search, ChevronDown, Calendar, Filter, CreditCard, Moon, MapPin, Users, Monitor, 
  Globe, Activity, MoreVertical, Eye, Info, RefreshCw, Gift, UserX, BrainCircuit, 
  Crosshair, Target, ShieldAlert, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';

// Mock Data
const patternsTableData = [
  { id: '1', name: 'Rapid Small Transactions', desc: 'Multiple small transactions in short time', level: 'Critical', freq: '2,843', aff: '1,28,450', status: 'Active', statusColor: 'text-emerald-600', icon: CreditCard, iconBg: 'bg-red-50 text-red-500', trendColor: '#ef4444', spark: [{v: 10}, {v: 15}, {v: 12}, {v: 25}, {v: 18}, {v: 28}, {v: 24}] },
  { id: '2', name: 'High Value Night Transfer', desc: 'High value transfers during unusual hours', level: 'High', freq: '1,256', aff: '56,780', status: 'Active', statusColor: 'text-emerald-600', icon: Moon, iconBg: 'bg-orange-50 text-orange-500', trendColor: '#f97316', spark: [{v: 5}, {v: 8}, {v: 7}, {v: 12}, {v: 15}, {v: 10}, {v: 20}] },
  { id: '3', name: 'New Location Transaction', desc: 'Transactions from new geographic location', level: 'High', freq: '987', aff: '45,320', status: 'Investigating', statusColor: 'text-blue-600', icon: MapPin, iconBg: 'bg-purple-50 text-purple-500', trendColor: '#f97316', spark: [{v: 8}, {v: 10}, {v: 9}, {v: 11}, {v: 14}, {v: 12}, {v: 18}] },
  { id: '4', name: 'New Beneficiary Spike', desc: 'Multiple transactions to new beneficiaries', level: 'Medium', freq: '765', aff: '32,450', status: 'Active', statusColor: 'text-emerald-600', icon: Users, iconBg: 'bg-emerald-50 text-emerald-500', trendColor: '#eab308', spark: [{v: 12}, {v: 9}, {v: 15}, {v: 11}, {v: 14}, {v: 8}, {v: 12}] },
  { id: '5', name: 'Device Change Pattern', desc: 'Transactions after device change/login', level: 'Medium', freq: '612', aff: '28,190', status: 'Monitoring', statusColor: 'text-purple-600', icon: Monitor, iconBg: 'bg-blue-50 text-blue-500', trendColor: '#10b981', spark: [{v: 5}, {v: 10}, {v: 8}, {v: 12}, {v: 15}, {v: 14}, {v: 9}] },
  { id: '6', name: 'Cross Border Anomaly', desc: 'Unusual cross border transactions', level: 'High', freq: '423', aff: '19,560', status: 'Investigating', statusColor: 'text-blue-600', icon: Globe, iconBg: 'bg-cyan-50 text-cyan-500', trendColor: '#f97316', spark: [{v: 3}, {v: 5}, {v: 4}, {v: 8}, {v: 6}, {v: 9}, {v: 12}] },
  { id: '7', name: 'Velocity Anomaly', desc: 'High transaction velocity within minutes', level: 'Critical', freq: '389', aff: '15,840', status: 'Active', statusColor: 'text-emerald-600', icon: Activity, iconBg: 'bg-yellow-50 text-yellow-600', trendColor: '#ef4444', spark: [{v: 12}, {v: 18}, {v: 15}, {v: 22}, {v: 25}, {v: 20}, {v: 30}] },
];

const trendData = [
  { name: 'May 23', critical: 400, high: 200, medium: 100, low: 50 },
  { name: 'May 24', critical: 600, high: 250, medium: 150, low: 70 },
  { name: 'May 25', critical: 500, high: 220, medium: 130, low: 60 },
  { name: 'May 26', critical: 750, high: 300, medium: 180, low: 80 },
  { name: 'May 27', critical: 650, high: 280, medium: 160, low: 75 },
  { name: 'May 28', critical: 800, high: 320, medium: 200, low: 90 },
  { name: 'May 29', critical: 700, high: 310, medium: 190, low: 85 },
];

const distributionData = [
  { name: 'Transaction Behavior', value: 45, color: '#10b981' },
  { name: 'User Behavior', value: 38, color: '#eab308' },
  { name: 'Device & Network', value: 29, color: '#0ea5e9' },
  { name: 'Location Based', value: 24, color: '#8b5cf6' },
  { name: 'Other', value: 20, color: '#94a3b8' },
];

export default function FraudPatterns() {
  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fraud Patterns</h1>
        <p className="text-gray-500 text-sm">Discover and analyze fraudulent patterns and trends identified by AI models.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-yellow-50 p-3 rounded-xl"><LayoutGrid className="w-6 h-6 text-yellow-500" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Total Patterns</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">156</h3>
            <div className="mt-1 flex items-center text-[10px] text-emerald-600 font-bold">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 14.8% vs last 7 days
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-red-50 p-3 rounded-xl"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">High Risk Patterns</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">34</h3>
            <div className="mt-1 flex items-center text-[10px] text-red-600 font-bold">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 21.3% vs last 7 days
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-purple-50 p-3 rounded-xl"><Binoculars className="w-6 h-6 text-purple-500" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">New Patterns</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">12</h3>
            <div className="mt-1 flex items-center text-[10px] text-emerald-600 font-bold">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> 9.1% vs last 7 days
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-50 p-3 rounded-xl"><ShieldCheck className="w-6 h-6 text-emerald-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Blocked Cases</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">8,432</h3>
            <div className="mt-1 flex items-center text-[10px] text-emerald-600 font-bold">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 18.6% vs last 7 days
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        
        {/* Left Column: Table & Insights */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Main Table Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            
            {/* Filters Bar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between space-x-3 bg-white">
              <div className="relative flex-1 max-w-[200px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input type="text" placeholder="Search patterns..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e463a]/20" />
              </div>
              <div className="flex items-center space-x-2">
                {['All Risk Levels', 'All Categories', 'All Statuses'].map(opt => (
                  <div key={opt} className="relative">
                    <select className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                      <option>{opt}</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                ))}
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50">
                  <Calendar className="w-3.5 h-3.5" /> <span>May 23, 2025 - May 29, 2025</span> <ChevronDown className="w-3 h-3" />
                </button>
                <button className="flex items-center space-x-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50">
                  <Filter className="w-3.5 h-3.5" /> <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white">
                  <tr className="text-xs font-semibold text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-4 font-medium">Pattern Name</th>
                    <th className="px-5 py-4 font-medium text-center">Risk Level</th>
                    <th className="px-5 py-4 font-medium flex items-center space-x-1"><span>Frequency</span> <Info className="w-3 h-3"/></th>
                    <th className="px-5 py-4 font-medium">Trend (7D)</th>
                    <th className="px-5 py-4 font-medium">Affected Transactions</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {patternsTableData.map((pat, idx) => {
                    const Icon = pat.icon;
                    return (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2.5 rounded-full ${pat.iconBg}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="max-w-[200px]">
                              <p className="font-bold text-gray-900 text-xs truncate">{pat.name}</p>
                              <p className="text-[10px] text-gray-500 truncate mt-0.5">{pat.desc}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pat.level === 'Critical' ? 'text-red-600 bg-red-50 border border-red-100' :
                            pat.level === 'High' ? 'text-orange-600 bg-orange-50 border border-orange-100' :
                            'text-yellow-600 bg-yellow-50 border border-yellow-100'
                          }`}>
                            {pat.level}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">{pat.freq}</td>
                        <td className="px-5 py-4">
                          <div className="h-6 w-20">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={pat.spark}>
                                <Area type="monotone" dataKey="v" stroke={pat.trendColor} fill="none" strokeWidth={1.5} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">{pat.aff}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              pat.status === 'Active' ? 'bg-emerald-500' : pat.status === 'Investigating' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}></div>
                            <span className={`text-[10px] font-semibold ${pat.statusColor}`}>{pat.status}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 hover:text-gray-600"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 hover:text-gray-600"><MoreVertical className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
               <span>Showing 1 to 7 of 156 patterns</span>
               <div className="flex items-center space-x-4">
                 <div className="flex space-x-1">
                   <button className="px-2 py-1 border border-gray-200 bg-white rounded text-gray-400"><ChevronLeft className="w-3.5 h-3.5" /></button>
                   <button className="px-2.5 py-1 border border-gray-200 bg-[#1e463a] text-white rounded font-bold shadow-sm">1</button>
                   <button className="px-2.5 py-1 border border-gray-200 bg-white rounded hover:bg-gray-50 font-semibold text-gray-700">2</button>
                   <button className="px-2.5 py-1 border border-gray-200 bg-white rounded hover:bg-gray-50 font-semibold text-gray-700">3</button>
                   <span className="px-1.5 py-1">...</span>
                   <button className="px-2.5 py-1 border border-gray-200 bg-white rounded hover:bg-gray-50 font-semibold text-gray-700">23</button>
                   <button className="px-2 py-1 border border-gray-200 bg-white rounded hover:bg-gray-50"><ChevronRight className="w-3.5 h-3.5 text-gray-600" /></button>
                 </div>
                 <div className="relative">
                   <select className="appearance-none pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                     <option>10 / page</option>
                   </select>
                   <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                 </div>
               </div>
            </div>
          </div>

          {/* AI Model Insights */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-6">AI Model Insights</h3>
            <div className="flex">
              
              <div className="w-1/4 flex flex-col items-center justify-center border-r border-gray-100 pr-6">
                 {/* Brain SVG placeholder */}
                 <div className="relative w-24 h-24 text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full opacity-80">
                      <path d="M12 4c-3.87 0-7 3.13-7 7 0 2.22 1.05 4.2 2.68 5.48.54.42.82 1.09.82 1.77v.75c0 1.1.9 2 2 2h5c1.1 0 2-.9 2-2v-.75c0-.68.28-1.35.82-1.77C19.95 15.2 21 13.22 21 11c0-3.87-3.13-7-7-7z" fill="#10b981" fillOpacity="0.1"/>
                      <path d="M12 4c-3.87 0-7 3.13-7 7 0 2.22 1.05 4.2 2.68 5.48.54.42.82 1.09.82 1.77v.75c0 1.1.9 2 2 2h5c1.1 0 2-.9 2-2v-.75c0-.68.28-1.35.82-1.77C19.95 15.2 21 13.22 21 11c0-3.87-3.13-7-7-7z"/>
                      <path d="M9 16v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1" />
                      <line x1="12" y1="4" x2="12" y2="2" />
                      <line x1="12" y1="22" x2="12" y2="20" />
                      <line x1="4" y1="12" x2="2" y2="12" />
                      <line x1="22" y1="12" x2="20" y2="12" />
                      <line x1="6.34" y1="6.34" x2="4.93" y2="4.93" />
                      <line x1="19.07" y1="19.07" x2="17.66" y2="17.66" />
                      <line x1="6.34" y1="17.66" x2="4.93" y2="19.07" />
                      <line x1="19.07" y1="4.93" x2="17.66" y2="6.34" />
                    </svg>
                 </div>
              </div>

              <div className="w-1/3 flex flex-col justify-between px-6 border-r border-gray-100 space-y-4">
                <div className="flex space-x-3 items-start">
                  <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded"><Crosshair className="w-4 h-4"/></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Model Confidence</p>
                    <p className="text-xl font-bold text-gray-900 leading-none">92.6%</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1 flex items-center"><ArrowUpRight className="w-2.5 h-2.5 mr-0.5"/> 2.4% vs last 7 days</p>
                  </div>
                </div>
                <div className="flex space-x-3 items-start">
                  <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded"><Target className="w-4 h-4"/></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Pattern Accuracy</p>
                    <p className="text-xl font-bold text-gray-900 leading-none">94.1%</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1 flex items-center"><ArrowUpRight className="w-2.5 h-2.5 mr-0.5"/> 1.8% vs last 7 days</p>
                  </div>
                </div>
                <div className="flex space-x-3 items-start">
                  <div className="bg-orange-50 text-orange-600 p-1.5 rounded"><AlertTriangle className="w-4 h-4"/></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-0.5">False Positive Rate</p>
                    <p className="text-xl font-bold text-gray-900 leading-none">0.37%</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1 flex items-center"><ArrowDownRight className="w-2.5 h-2.5 mr-0.5"/> 0.12% vs last 7 days</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 pl-6 flex flex-col justify-between">
                <h4 className="text-[10px] font-bold text-gray-800 mb-2">Top Contributing Models</h4>
                <div className="space-y-4">
                  {[
                    { name: 'XGBoost', val: 92.1, color: 'bg-[#1e463a]' },
                    { name: 'Random Forest', val: 89.3, color: 'bg-emerald-500' },
                    { name: 'Isolation Forest', val: 87.6, color: 'bg-yellow-500' },
                    { name: 'Rule Engine', val: 76.4, color: 'bg-cyan-600' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center text-[10px]">
                      <span className="w-24 text-gray-600 font-medium">{m.name}</span>
                      <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.color}`} style={{width: `${m.val}%`}}></div>
                      </div>
                      <span className="font-bold text-gray-900">{m.val}%</span>
                    </div>
                  ))}
                </div>
                <Link href="/models" className="text-[10px] font-bold text-[#1e463a] mt-4 flex items-center hover:underline">
                  View Model Performance <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Widgets */}
        <div className="w-[320px] flex-shrink-0 space-y-6">
          
          {/* Top Risk Pattern */}
          <div className="bg-red-50/30 rounded-2xl border border-red-100 shadow-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <h3 className="font-bold text-gray-800 text-sm mb-4">Top Risk Pattern</h3>
            
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-red-100 text-red-600 p-2 rounded-lg flex-shrink-0"><ShieldAlert className="w-5 h-5" /></div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm">Rapid Small Transactions</span>
                  <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[9px] font-bold">Critical Risk</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-tight">This pattern has the highest impact and is most frequently detected.</p>
              </div>
            </div>

            <div className="space-y-3 border-y border-red-100/50 py-4 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Frequency (7D)</span>
                <span className="font-bold text-gray-900">2,843</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Affected Transactions</span>
                <span className="font-bold text-gray-900">1,28,450</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Blocked</span>
                <span className="font-bold text-gray-900">96.3%</span>
              </div>
            </div>

            <button className="w-full bg-[#1e463a] text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-[#15342a] transition-colors flex items-center justify-center">
              View Pattern Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>

          {/* Pattern Detection Trend */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Pattern Detection Trend</h3>
              <div className="relative">
                <select className="appearance-none pl-2 pr-6 py-1 border border-gray-200 rounded text-[9px] font-semibold text-gray-600 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                  <option>Last 7 days</option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            
            <div className="h-40 w-full mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{top: 5, right: 0, left: -25, bottom: 0}}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="low" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-3 text-[9px] font-semibold text-gray-500">
              <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></div> Critical</span>
              <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1"></div> High</span>
              <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1"></div> Medium</span>
              <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></div> Low</span>
            </div>
          </div>

          {/* Recent New Patterns */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Recent New Patterns</h3>
              <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline flex items-center">View All <ChevronRight className="w-3 h-3 ml-0.5" /></Link>
            </div>
            
            <div className="space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-red-50 text-red-500 rounded-lg"><RefreshCw className="w-3.5 h-3.5" /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-tight">Unusual Refund Pattern</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Detected on May 29, 2025</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-[9px] font-bold text-blue-600">New</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-pink-50 text-pink-500 rounded-lg"><Gift className="w-3.5 h-3.5" /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-tight">Gift Card Abuse Pattern</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Detected on May 28, 2025</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-[9px] font-bold text-blue-600">New</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg"><UserX className="w-3.5 h-3.5" /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-tight">Account Takeover Pattern</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Detected on May 27, 2025</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-[9px] font-bold text-blue-600">New</span>
              </div>
            </div>

            <button className="w-full bg-[#1e463a] text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-[#15342a] transition-colors flex items-center justify-center">
              Explore All Patterns <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>

          {/* Pattern Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Pattern Distribution by Category</h3>
            <div className="flex items-center">
              <div className="w-24 h-24 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="value">
                      {distributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">156</span>
                  <span className="text-[8px] text-gray-500 font-medium">Total Patterns</span>
                </div>
              </div>
              <div className="flex-1 pl-4 space-y-2 text-[9px]">
                {distributionData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}}></div>
                      <span className="text-gray-600 font-medium">{item.name}</span>
                    </div>
                    <span className="text-gray-500"><span className="font-bold text-gray-900">{item.value}</span> ({Math.round((item.value/156)*100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
