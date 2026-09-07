import json

with open("frontend/src/app/(dashboard)/patterns/page.tsx", "w", encoding="utf-8") as f:
    f.write("""'use client';

import { Activity, ShieldAlert, FileText, Share2, Search, Filter, ChevronDown, ChevronRight, RefreshCw, Gift, UserX, ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { useState, useEffect } from 'react';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#f43f5e', '#84cc16'];

const trendData = [
  { name: 'May 23', critical: 24, high: 45, medium: 80, low: 40 },
  { name: 'May 24', critical: 35, high: 55, medium: 90, low: 30 },
  { name: 'May 25', critical: 18, high: 38, medium: 70, low: 50 },
  { name: 'May 26', critical: 28, high: 48, medium: 100, low: 45 },
  { name: 'May 27', critical: 45, high: 65, medium: 80, low: 35 },
  { name: 'May 28', critical: 40, high: 60, medium: 90, low: 55 },
  { name: 'May 29', critical: 58, high: 78, medium: 110, low: 65 },
];

export default function PatternsDashboard() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const res = await fetch('/api/patterns');
        if (res.ok) {
          const data = await res.json();
          setPatterns(data);
        }
      } catch (err) {
        console.error("Failed to fetch patterns", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatterns();
  }, []);

  const totalDetections = patterns.reduce((sum, p) => sum + p.total_detected, 0);

  return (
    <div className="p-8 space-y-6 flex flex-col h-full overflow-hidden">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fraud Patterns Overview</h1>
        <p className="text-gray-500 text-sm">Analyze AI-detected fraud patterns and emerging attack vectors.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-semibold">Active Patterns</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{patterns.filter(p => p.total_detected > 0).length || 10}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold">Total Detections</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{totalDetections}</h3>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start flex-1 min-h-0">
        
        <div className="flex-1 overflow-auto h-full space-y-4 pr-2">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading patterns...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {patterns.map((p, idx) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{p.title}</h3>
                        <p className="text-xs text-gray-500">{p.percentage}% of all fraud</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-red-200 bg-red-50 text-red-600">Critical</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-4 h-8 line-clamp-2">{p.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4 border-t border-gray-50 pt-4">
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium">Detected</p>
                      <p className="font-bold text-gray-900">{p.total_detected}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium">High Risk</p>
                      <p className="font-bold text-gray-900">{p.high_risk}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium">Critical</p>
                      <p className="font-bold text-gray-900">{p.critical}</p>
                    </div>
                  </div>

                  <Link href={`/patterns/${p.id}`} className="w-full block bg-gray-50 text-gray-700 text-xs font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors text-center">
                    Analyze Pattern
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-[320px] flex-shrink-0 space-y-6 overflow-y-auto pr-2 max-h-full">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Pattern Detection Trend</h3>
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
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Pattern Distribution</h3>
            <div className="flex items-center">
              <div className="w-24 h-24 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={patterns} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="total_detected">
                      {patterns.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 pl-4 space-y-2 text-[9px]">
                {patterns.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                      <span className="text-gray-600 font-medium truncate w-16">{item.title}</span>
                    </div>
                    <span className="text-gray-500 font-bold">{item.total_detected}</span>
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
"""
)
