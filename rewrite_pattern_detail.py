import json

with open("frontend/src/app/(dashboard)/patterns/[id]/page.tsx", "w", encoding="utf-8") as f:
    f.write("""'use client';

import { ArrowLeft, ChevronDown, Activity, AlertTriangle, ShieldAlert, CreditCard, DollarSign, MapPin, Monitor, Clock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

export default function PatternDetail() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPattern = async () => {
      try {
        const res = await fetch(`/api/patterns/${id}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPattern();
  }, [id]);

  if (loading) return <div className="p-8 text-gray-500">Loading pattern...</div>;
  if (!data) return <div className="p-8 text-gray-500">Pattern not found</div>;

  const geoData = data.geographic_distribution.map((g: any) => ({ name: g.country, value: g.count }));
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];

  return (
    <div className="p-8 space-y-6 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium mb-2">
          <Link href="/patterns" className="hover:text-gray-900">Fraud Patterns</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-bold">{data.title}</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.title} Pattern</h1>
            <p className="text-gray-500 text-sm mt-1">{data.description}</p>
          </div>
          <Link href="/patterns" className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4" /> <span>Back to Patterns</span>
          </Link>
        </div>
      </div>

      <div className="flex gap-6 items-start flex-1 min-h-0">
        
        {/* Left Column */}
        <div className="flex-1 space-y-6 overflow-y-auto pr-2 pb-8 max-h-full">
          
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-[10px] text-gray-500 font-semibold mb-1">Total Detections</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.total_detections}</h3>
            </div>
            <div className="col-span-1 bg-white rounded-xl border border-red-100 shadow-sm p-4 bg-red-50/30">
              <p className="text-[10px] text-red-500 font-semibold mb-1">Critical Risk</p>
              <h3 className="text-2xl font-bold text-red-700">{data.risk_distribution.CRITICAL || 0}</h3>
            </div>
            <div className="col-span-1 bg-white rounded-xl border border-orange-100 shadow-sm p-4 bg-orange-50/30">
              <p className="text-[10px] text-orange-500 font-semibold mb-1">High Risk</p>
              <h3 className="text-2xl font-bold text-orange-700">{data.risk_distribution.HIGH || 0}</h3>
            </div>
            <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-[10px] text-gray-500 font-semibold mb-1">Trend</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.trend}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Top Contributing Factors</h3>
              <div className="space-y-3">
                {data.top_factors.length === 0 && <p className="text-xs text-gray-500">No rule factors available.</p>}
                {data.top_factors.map((f: any, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-xs font-medium text-gray-700">{f.reason}</span>
                    <span className="text-xs font-bold text-gray-900">{f.count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Amount Distribution</h3>
              <div className="space-y-3">
                {Object.entries(data.amount_distribution).map(([bucket, count]: any, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-xs font-medium text-gray-700">₹ {bucket}</span>
                    <span className="text-xs font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Recent Examples</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-500 border-b border-gray-100">
                  <th className="pb-2">Transaction ID</th>
                  <th className="pb-2">Date & Time</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {data.recent_examples.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center text-gray-500">No recent examples available.</td></tr>
                )}
                {data.recent_examples.map((ex: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium text-[#1e463a]">
                      <Link href={`/transactions/${ex.transaction_id}`}>{ex.transaction_id}</Link>
                    </td>
                    <td className="py-3 text-gray-600">{ex.timestamp ? new Date(ex.timestamp).toLocaleString() : ''}</td>
                    <td className="py-3 text-gray-600">{ex.customer_id}</td>
                    <td className="py-3 font-bold text-gray-900 text-right">{ex.amount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="w-[320px] shrink-0 space-y-6 overflow-y-auto max-h-full pr-2">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Geographic Distribution</h3>
            {geoData.length > 0 ? (
              <div className="flex items-center">
                <div className="w-24 h-24 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={geoData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="value">
                        {geoData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 pl-4 space-y-2 text-[10px]">
                  {geoData.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                        <span className="text-gray-600 font-medium truncate w-16">{item.name}</span>
                      </div>
                      <span className="text-gray-500 font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No geo data</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {data.recent_alerts.length === 0 && <p className="text-xs text-gray-500">No recent alerts.</p>}
              {data.recent_alerts.map((al: any, i: number) => (
                <div key={i} className="flex items-start justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{al.id}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{al.timestamp ? new Date(al.timestamp).toLocaleString() : ''}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${al.severity === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                    {al.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
"""
)
