'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, CreditCard, ShieldAlert, Clock, AlertTriangle, IndianRupee, ShieldCheck } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';

export default function DashboardOverview() {
  const [summary, setSummary] = useState<any>(null);
  const [txData, setTxData] = useState<any[]>([]);
  const [fraudData, setFraudData] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sumRes = await fetch('/api/dashboard/summary');
        if (sumRes.ok) setSummary(await sumRes.json());

        const txRes = await fetch('/api/dashboard/transaction-trends');
        if (txRes.ok) {
            const txT = await txRes.json();
            setTxData(txT.labels.map((l: string, i: number) => ({ name: l, total: txT.data[i] })));
        }

        const fRes = await fetch('/api/dashboard/fraud-trends');
        if (fRes.ok) {
            const fT = await fRes.json();
            setFraudData(fT.labels.map((l: string, i: number) => ({ name: l, fraud: fT.data[i] })));
        }

        const rRes = await fetch('/api/dashboard/risk-distribution');
        if (rRes.ok) {
            const rT = await rRes.json();
            const totalR = Object.values(rT).reduce((a: any, b: any) => a + b, 0) as number;
            setRiskData([
            { name: 'Low Risk', value: rT.LOW || 0, color: '#10b981', total: totalR },
            { name: 'Medium Risk', value: rT.MEDIUM || 0, color: '#f59e0b', total: totalR },
            { name: 'High Risk', value: rT.HIGH || 0, color: '#f97316', total: totalR },
            { name: 'Critical', value: rT.CRITICAL || 0, color: '#ef4444', total: totalR },
            ]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 sec polling
    return () => clearInterval(interval);
  }, []);

  if (!summary) {
    return <div className="p-8 text-center text-gray-500">Loading Dashboard Data...</div>;
  }

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return '₹' + (val / 10000000).toFixed(2) + 'Cr';
    if (val >= 100000) return '₹' + (val / 100000).toFixed(2) + 'L';
    return '₹' + val.toLocaleString();
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview Dashboard</h1>
          <p className="text-gray-500">Welcome back, <span className="font-semibold text-gray-700">Operator!</span> Here's what's happening with your transactions today.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium shadow-sm">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>Real-time</span>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-emerald-50 p-3 rounded-xl">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.total_transactions.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-yellow-50 p-3 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fraud Detected</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.fraud_transactions.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-red-50 p-3 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fraud Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.fraud_rate.toFixed(2)}%</h3>
            </div>
          </div>
        </div>
        
        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-50 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">High Risk Txns</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.high_risk_transactions.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-emerald-50 p-3 rounded-xl">
              <IndianRupee className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Txn Value</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.total_transaction_value)}</h3>
            </div>
          </div>
        </div>

        {/* Card 6 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-yellow-50 p-3 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Flagged Value</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.flagged_transaction_value)}</h3>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transactions Over Time */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Transactions Over Time</h3>
            <div className="flex items-center space-x-2 text-xs font-medium text-gray-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Transactions</span>
            </div>
          </div>
          <div className="h-64 w-full">
            {txData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={txData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Fraud Over Time */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Fraud Over Time</h3>
            <div className="flex items-center space-x-2 text-xs font-medium text-gray-500">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Fraud Detected</span>
            </div>
          </div>
          <div className="h-64 w-full">
            {fraudData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fraudData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorFraud)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">Risk Distribution</h3>
          <div className="flex items-center justify-between h-64">
            <div className="w-1/2 h-full relative">
              {(riskData.length === 0 || riskData[0]?.total === 0) ? (
                <div className="h-full flex items-center justify-center text-gray-400">No data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-gray-900">{riskData[0]?.total.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 font-medium">Total</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="w-1/2 space-y-3 pl-4">
              {riskData.map((item, index) => {
                const perc = item.total ? (item.value / item.total) * 100 : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {perc.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
