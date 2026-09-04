'use client';

import { 
  ArrowLeft, GitMerge, ShieldAlert, Bell, Users, DollarSign, 
  IndianRupee, ChevronDown, CheckCircle2, ShieldCheck, Cpu, Clock, 
  CreditCard, Activity, MapPin, Monitor, UserPlus, ArrowRight, Info
} from 'lucide-react';
import Link from 'next/link';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

const alertTrend = [
  { name: 'Apr 30', val: 20 }, { name: 'May 2', val: 30 }, { name: 'May 4', val: 25 }, { name: 'May 6', val: 40 }, 
  { name: 'May 8', val: 35 }, { name: 'May 10', val: 55 }, { name: 'May 12', val: 45 }, { name: 'May 14', val: 70 }, 
  { name: 'May 16', val: 65 }, { name: 'May 18', val: 40 }, { name: 'May 20', val: 50 }, { name: 'May 22', val: 45 }, 
  { name: 'May 24', val: 60 }, { name: 'May 26', val: 75 }, { name: 'May 28', val: 85 }, { name: 'May 29', val: 90 },
];

const riskBreakdown = [
  { name: 'Amount Risk', val: 28, col: '#ef4444' },
  { name: 'Behavioral Risk', val: 24, col: '#f59e0b' },
  { name: 'Velocity Risk', val: 20, col: '#eab308' },
  { name: 'New Beneficiary Risk', val: 18, col: '#10b981' },
  { name: 'Channel Risk', val: 10, col: '#3b82f6' },
];

const amountDist = [
  { name: '₹0 - ₹50K', val: 8 },
  { name: '₹50K - ₹1L', val: 15 },
  { name: '₹1L - ₹5L', val: 28 },
  { name: '₹5L - ₹10L', val: 22 },
  { name: '₹10L - ₹50L', val: 18 },
  { name: '> ₹50L', val: 9 },
];

const channelDist = [
  { name: 'Internet Banking', val: 42, col: '#10b981' },
  { name: 'UPI', val: 31, col: '#3b82f6' },
  { name: 'Mobile Banking', val: 15, col: '#f59e0b' },
  { name: 'Other', val: 8, col: '#8b5cf6' },
  { name: 'Branch / Offline', val: 4, col: '#9ca3af' },
];

export default function PatternDetails() {
  return (
    <div className="p-8 space-y-6 flex gap-6">
      
      <div className="flex-1 min-w-0 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium mb-2">
              <Link href="/patterns" className="hover:text-gray-900">Fraud Patterns</Link>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              <span className="text-gray-900 font-bold">Pattern Details</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Pattern Details</h1>
            <p className="text-gray-500 text-sm mt-1">Detailed analysis of fraud pattern and its characteristics</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/patterns" className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4" /> <span>Back to Patterns</span>
            </Link>
            <button className="flex items-center space-x-2 bg-[#1e463a] text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-[#15342a]">
              <span>Create Rule</span> <ChevronDown className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>

        {/* Top Info Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><GitMerge className="w-5 h-5"/></div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Pattern Name</p>
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-bold text-gray-900 text-[11px] leading-tight truncate w-32" title="High Value Transfer to New Beneficiary">High Value Transfer to New Beneficiary</p>
                <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded">Active</span>
              </div>
              <p className="text-[9px] text-gray-400">PATT-2025-0007</p>
            </div>
          </div>
          
          <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-lg shrink-0"><ShieldAlert className="w-5 h-5"/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Risk Score</p>
                <div className="flex items-baseline space-x-1">
                  <span className="font-bold text-gray-900 text-lg leading-none">92</span>
                  <span className="text-[10px] text-gray-500">/ 100</span>
                </div>
              </div>
            </div>
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100">High Risk</span>
          </div>

          <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
            <div className="flex items-center space-x-2 text-gray-500 mb-1">
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-semibold">Alert Count (30 Days)</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">1,248</h3>
            <div className="flex items-center text-[9px] text-emerald-600 font-bold">
              <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 18.4% vs last 30 days
            </div>
          </div>

          <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
            <div className="flex items-center space-x-2 text-gray-500 mb-1">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-semibold">Affected Customers</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">842</h3>
            <div className="flex items-center text-[9px] text-emerald-600 font-bold">
              <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 12.7% vs last 30 days
            </div>
          </div>

          <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
            <div className="flex items-center space-x-2 text-gray-500 mb-1">
              <IndianRupee className="w-4 h-4 text-purple-600" />
              <span className="text-[10px] font-semibold">Total Loss Prevented</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">₹ 3.45 Cr</h3>
            <div className="flex items-center text-[9px] text-emerald-600 font-bold">
              <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> 22.6% vs last 30 days
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 text-[11px] font-semibold">
            <button className="py-3 border-b-2 border-[#1e463a] text-[#1e463a]">Overview</button>
            <button className="py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Pattern Characteristics</button>
            <button className="py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Transaction Behavior</button>
            <button className="py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Geography</button>
            <button className="py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Devices & Channels</button>
            <button className="py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Related Alerts</button>
            <button className="py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Rule Configuration</button>
            <button className="py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">History</button>
          </div>
        </div>

        <div className="flex gap-6 items-stretch">
          
          {/* Pattern Overview */}
          <div className="w-1/3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-3">Pattern Overview</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                This pattern identifies high value fund transfers made to newly added beneficiaries or accounts with no prior transaction history. It typically indicates account takeover or mule account activity.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-[10px] text-gray-500 font-semibold mb-1">Category</p>
                <p className="text-xs font-bold text-gray-900">Transaction Behavior</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold mb-1">Sub-Category</p>
                <p className="text-xs font-bold text-gray-900">Beneficiary Risk</p>
              </div>
              <div className="mt-2">
                <p className="text-[10px] text-gray-500 font-semibold mb-1">Pattern Status</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Active</span>
              </div>
              <div className="mt-2">
                <p className="text-[10px] text-gray-500 font-semibold mb-1">Confidence Level</p>
                <p className="text-xs font-bold text-gray-900">High (94%)</p>
              </div>
              <div className="mt-2">
                <p className="text-[10px] text-gray-500 font-semibold mb-1">Detection Model</p>
                <p className="text-xs font-bold text-gray-900">Ensemble Model v2.4.1</p>
              </div>
              <div className="mt-2">
                <p className="text-[10px] text-gray-500 font-semibold mb-1">Last Model Update</p>
                <p className="text-xs font-bold text-gray-900">May 28, 2025</p>
              </div>
            </div>
          </div>

          {/* Alert Trend */}
          <div className="w-2/3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Alert Trend (Last 30 Days)</h3>
              <div className="relative">
                <select className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                  <option>Last 30 Days</option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={alertTrend} margin={{top: 5, right: 10, left: -20, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} interval="preserveStartEnd" minTickGap={30} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} dot={{r:3, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Pattern Characteristics */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Pattern Characteristics</h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 flex items-start space-x-3">
              <div className="p-1.5 bg-white shadow-sm rounded-lg text-blue-600"><IndianRupee className="w-4 h-4"/></div>
              <div>
                <p className="text-[9px] text-gray-500 font-semibold mb-0.5">Amount Range</p>
                <p className="font-bold text-gray-900 text-[11px]">₹ 1,00,000 - ₹ 50,00,000</p>
                <p className="text-[9px] text-gray-400 mt-0.5">High value transfers</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-start space-x-3">
              <div className="p-1.5 bg-white shadow-sm rounded-lg text-emerald-600"><Activity className="w-4 h-4"/></div>
              <div>
                <p className="text-[9px] text-gray-500 font-semibold mb-0.5">Transaction Frequency</p>
                <p className="font-bold text-gray-900 text-[11px]">1 - 5 transactions</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Within short time window</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-start space-x-3">
              <div className="p-1.5 bg-white shadow-sm rounded-lg text-purple-600"><Clock className="w-4 h-4"/></div>
              <div>
                <p className="text-[9px] text-gray-500 font-semibold mb-0.5">Time Pattern</p>
                <p className="font-bold text-gray-900 text-[11px]">Mostly 10 PM - 6 AM</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Unusual hours</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-start space-x-3">
              <div className="p-1.5 bg-white shadow-sm rounded-lg text-orange-600"><Monitor className="w-4 h-4"/></div>
              <div>
                <p className="text-[9px] text-gray-500 font-semibold mb-0.5">Channel</p>
                <p className="font-bold text-gray-900 text-[11px]">Internet Banking, UPI</p>
                <p className="text-[9px] text-gray-400 mt-0.5">High risk channels</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-start space-x-3">
              <div className="p-1.5 bg-white shadow-sm rounded-lg text-emerald-600"><UserPlus className="w-4 h-4"/></div>
              <div>
                <p className="text-[9px] text-gray-500 font-semibold mb-0.5">Beneficiary Type</p>
                <p className="font-bold text-gray-900 text-[11px]">New / First Time</p>
                <p className="text-[9px] text-gray-400 mt-0.5">No prior history</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Geographic Distribution (Top 5)</h3>
            <div className="flex-1 flex space-x-4">
              <div className="w-1/3 flex items-center justify-center opacity-50">
                <MapPin className="w-16 h-16 text-emerald-600" />
              </div>
              <div className="w-2/3 space-y-2.5">
                <div className="flex justify-between text-[8px] font-semibold text-gray-400 border-b border-gray-100 pb-1">
                  <span>Location</span><span>Alerts</span>
                </div>
                {[
                  { l: 'Maharashtra', a: '352', p: '28.2%' },
                  { l: 'Karnataka', a: '218', p: '17.5%' },
                  { l: 'Uttar Pradesh', a: '156', p: '12.5%' },
                  { l: 'Delhi', a: '128', p: '10.3%' },
                  { l: 'Gujarat', a: '102', p: '8.2%' },
                ].map((st, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-gray-700">{st.l}</span>
                    <span className="font-bold text-gray-900">{st.a} <span className="text-gray-400 font-medium text-[8px]">({st.p})</span></span>
                  </div>
                ))}
              </div>
            </div>
            <button className="text-[10px] font-bold text-[#1e463a] hover:underline flex items-center justify-center w-full mt-4">
              View All Locations <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Transaction Amount Distribution</h3>
            <div className="h-32 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={amountDist} margin={{top: 10, right: 0, left: -25, bottom: 0}}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#9ca3af' }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#9ca3af' }} tickFormatter={(val) => `${val}%`} />
                  <Bar dataKey="val" fill="#10b981" radius={[2, 2, 0, 0]}>
                    {amountDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.val === 28 ? '#10b981' : '#a7f3d0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button className="text-[10px] font-bold text-[#1e463a] hover:underline flex items-center justify-center w-full mt-4">
              View Full Distribution <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Channels Breakdown</h3>
            <div className="flex-1 flex items-center">
              <div className="w-28 h-28 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channelDist} cx="50%" cy="50%" innerRadius={35} outerRadius={48} paddingAngle={2} dataKey="val">
                      {channelDist.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.col} />))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-bold text-gray-900 leading-none">1,248</span>
                  <span className="text-[7px] text-gray-500 font-medium mt-0.5">Total Alerts</span>
                </div>
              </div>
              <div className="flex-1 pl-4 space-y-2 text-[9px]">
                {channelDist.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.col}}></div>
                      <span className="text-gray-600 font-medium truncate w-16">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.val}%</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="text-[10px] font-bold text-[#1e463a] hover:underline flex items-center justify-center w-full mt-4">
              View Channel Analysis <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

        </div>

        {/* Example Alert Row */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900 text-xs mb-3">Example Alert from this Pattern</h4>
            <div className="flex items-center space-x-8 text-[10px]">
              <div>
                <p className="text-gray-500 font-semibold mb-0.5">Alert ID</p>
                <div className="flex items-center space-x-2"><span className="font-bold text-gray-900">ALRT-2025-009876</span> <span className="bg-red-50 text-red-600 px-1 py-0.5 rounded text-[8px] font-bold">High Risk</span></div>
              </div>
              <div>
                <p className="text-gray-500 font-semibold mb-0.5">Customer</p>
                <p className="font-bold text-gray-900">Rahul Sharma</p>
                <p className="text-gray-400 text-[8px]">CUST-1002984</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold mb-0.5">Amount</p>
                <p className="font-bold text-gray-900">₹ 4,85,000.00</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold mb-0.5">Channel</p>
                <p className="font-bold text-gray-900">Internet Banking</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold mb-0.5">Beneficiary</p>
                <p className="font-bold text-gray-900">New Beneficiary</p>
                <p className="text-gray-400 text-[8px]">First time transfer</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold mb-0.5">Time</p>
                <p className="font-bold text-gray-900">May 29, 2025</p>
                <p className="text-gray-400 text-[8px]">10:15:32 PM</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold mb-0.5">Risk Score</p>
                <p className="font-bold text-gray-900">94 / 100</p>
              </div>
            </div>
          </div>
          <Link href="/alerts/ALRT-2025-009876" className="flex items-center space-x-2 border border-gray-200 text-xs font-semibold text-[#1e463a] px-4 py-2 rounded-lg hover:bg-gray-50 whitespace-nowrap">
            View Alert Details
          </Link>
        </div>

      </div>

      {/* Right Sidebar */}
      <div className="w-[320px] shrink-0 space-y-6">
        
        {/* Pattern Risk Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-6">Pattern Risk Breakdown</h3>
          <div className="flex items-center justify-between mb-6">
            <div className="w-24 h-24 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskBreakdown} cx="50%" cy="50%" innerRadius={28} outerRadius={40} dataKey="val" paddingAngle={2}>
                    {riskBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.col} />))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-900 leading-none">92</span>
                <span className="text-[7px] text-gray-500 font-semibold mt-0.5">Risk Score</span>
              </div>
            </div>
            <div className="flex-1 pl-4 space-y-2 text-[9px]">
              {riskBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{backgroundColor: item.col}}></div>
                    <span className="text-gray-700 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.val}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-start text-[9px] text-gray-600">
            <Info className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
            <p>Risk score is calculated based on the combination of multiple risk factors observed in the pattern.</p>
          </div>
        </div>

        {/* Top Contributing Factors */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Top Contributing Factors</h3>
          <div className="space-y-4">
            {[
              { name: 'High Transaction Amount', val: 32, col: '#ef4444', ic: DollarSign },
              { name: 'New Beneficiary', val: 26, col: '#f97316', ic: UserPlus },
              { name: 'Unusual Time', val: 18, col: '#f59e0b', ic: Clock },
              { name: 'Multiple Transactions', val: 14, col: '#10b981', ic: Activity },
              { name: 'Different Location', val: 10, col: '#3b82f6', ic: MapPin },
            ].map((f, i) => {
              const Icon = f.ic;
              return (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center space-x-2 w-32">
                    <Icon className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-700 font-semibold truncate">{f.name}</span>
                  </div>
                  <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden flex justify-end">
                    <div className="h-full rounded-full" style={{width: `${(f.val / 32) * 100}%`, backgroundColor: f.col}}></div>
                  </div>
                  <span className="font-bold text-gray-900 w-6 text-right">{f.val}%</span>
                </div>
              );
            })}
          </div>
          <button className="text-[10px] font-bold text-[#1e463a] hover:underline flex items-center justify-center w-full mt-4 pt-4 border-t border-gray-100">
            View All Factors <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        {/* Recent Pattern Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
          <h3 className="font-bold text-gray-900 text-sm mb-6">Recent Pattern Activity</h3>
          
          <div className="relative border-l border-gray-200 ml-2 space-y-6 pb-2">
            
            <div className="pl-6 relative">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-red-500 shadow-sm"></div>
              <div className="absolute left-[-24px] top-0 p-1.5 bg-red-50 text-red-500 rounded-full z-10"><ShieldAlert className="w-3 h-3"/></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-gray-900">High risk alert detected</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Alert ID: ALRT-2025-009876</p>
                </div>
                <span className="text-[9px] font-medium text-gray-400">10:15 AM</span>
              </div>
            </div>

            <div className="pl-6 relative">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm"></div>
              <div className="absolute left-[-24px] top-0 p-1.5 bg-emerald-50 text-emerald-500 rounded-full z-10"><ShieldCheck className="w-3 h-3"/></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Rule updated</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Amount threshold changed from ₹2L to ₹1.5L</p>
                </div>
                <span className="text-[9px] font-medium text-gray-400">May 28</span>
              </div>
            </div>

            <div className="pl-6 relative">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-blue-500 shadow-sm"></div>
              <div className="absolute left-[-24px] top-0 p-1.5 bg-blue-50 text-blue-500 rounded-full z-10"><Cpu className="w-3 h-3"/></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Model retrained</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Improved detection accuracy by 3.2%</p>
                </div>
                <span className="text-[9px] font-medium text-gray-400">May 27</span>
              </div>
            </div>

            <div className="pl-6 relative">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-orange-500 shadow-sm"></div>
              <div className="absolute left-[-24px] top-0 p-1.5 bg-orange-50 text-orange-500 rounded-full z-10"><GitMerge className="w-3 h-3"/></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-gray-900">New pattern variant detected</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Similar pattern observed in UPI channel</p>
                </div>
                <span className="text-[9px] font-medium text-gray-400">May 25</span>
              </div>
            </div>

          </div>

          <button className="text-[10px] font-bold text-[#1e463a] hover:underline flex items-center justify-center w-full mt-4 pt-4 border-t border-gray-100">
            View Full History <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>

      </div>

    </div>
  );
}
