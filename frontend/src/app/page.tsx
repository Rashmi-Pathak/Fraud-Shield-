'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ArrowRight, Play, CheckCircle2, 
  IndianRupee, Clock, Globe, Smartphone, Store, 
  CreditCard, Activity, Network, ListOrdered
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [summary, setSummary] = useState<any>(null);
  const [recentTransaction, setRecentTransaction] = useState<any>(null);

  useEffect(() => {
    Promise.all([fetch('/api/dashboard/summary'), fetch('/api/dashboard/recent-transactions?limit=1')])
      .then(async ([summaryResponse, transactionResponse]) => {
        if (summaryResponse.ok) setSummary(await summaryResponse.json());
        if (transactionResponse.ok) setRecentTransaction((await transactionResponse.json())[0] || null);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7f6] overflow-x-hidden">
      
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-yellow-400 z-10"></div>
            <div className="w-4 h-4 rounded-full bg-[#1e463a]"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-[#1e463a]">
            FraudShield <span className="font-medium">AI</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#1e463a]/80">
          <Link href="#" className="text-[#1e463a] border-b-2 border-[#1e463a] pb-1">Home</Link>
          <Link href="#" className="hover:text-[#1e463a]">Features</Link>
          <Link href="#" className="hover:text-[#1e463a]">How It Works</Link>
          <Link href="#" className="hover:text-[#1e463a]">Fraud Types</Link>
          <Link href="#" className="hover:text-[#1e463a]">Models</Link>
          <Link href="#" className="hover:text-[#1e463a]">Pricing</Link>
          <Link href="#" className="hover:text-[#1e463a] flex items-center">
            Resources <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/live" className="text-sm font-semibold text-[#1e463a] hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">Open Live Monitor</Link>
          <Link href="/dashboard" className="text-sm font-semibold bg-[#1e463a] text-white px-5 py-2.5 rounded-lg hover:bg-[#15342a] transition-colors flex items-center">
            Explore Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className="space-y-8 z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
            <ShieldCheck className="w-4 h-4" />
            <span>AI-Powered Fraud Detection Platform</span>
          </div>
          
          <h1 className="text-6xl font-extrabold text-[#1e463a] leading-tight tracking-tight">
            Detect Fraud <br />
            Before It Becomes <br />
            <span className="text-yellow-500">Loss.</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-md leading-relaxed">
            FraudShield AI uses advanced machine learning, real-time analytics, and behavioral intelligence to detect suspicious transactions instantly and protect your business.
          </p>
          
          <div className="flex items-center space-x-4 pt-4">
            <Link href="/analyze" className="bg-[#1e463a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#15342a] transition-all flex items-center shadow-lg shadow-[#1e463a]/20">
              Analyze Transaction <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/live" className="bg-white text-[#1e463a] px-6 py-3 rounded-xl font-semibold border border-gray-200 hover:border-gray-300 transition-all shadow-sm flex items-center group">
              View Live Monitor
              <span className="relative flex h-3 w-3 ml-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-6 pt-6 text-sm font-semibold text-gray-600">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Real-time Protection</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-5 h-5 text-yellow-500" />
              <span>Smart AI Models</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-5 h-5 text-[#1e463a]" />
              <span>Enterprise Security</span>
            </div>
          </div>
        </div>

        {/* Right Content - Interactive UI Representation */}
        <div className="relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-emerald-100 to-yellow-50 rounded-full blur-3xl -z-10 opacity-60"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-6 shadow-2xl shadow-gray-200/50 border border-white/40 backdrop-blur-xl relative"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#1e463a]">Live Transaction Analysis</h3>
              <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold border border-emerald-100">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </div>
            </div>

            <div className="space-y-4">
              {/* Transaction Mini Card */}
              <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">{recentTransaction?.payment_channel || 'N/A'}</div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{recentTransaction?.transaction_id || 'No recent transaction'}</p>
                    <p className="text-sm font-semibold text-gray-900">{recentTransaction?.merchant || 'Awaiting transaction data'}</p>
                    <p className="text-xs text-gray-500">{recentTransaction ? new Date(recentTransaction.time).toLocaleString() : 'Live database feed'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{recentTransaction ? `₹ ${recentTransaction.amount.toLocaleString()}` : 'N/A'}</p>
                  <p className="text-xs text-gray-400">{recentTransaction ? recentTransaction.risk_level : 'No data'}</p>
                </div>
              </div>

              {/* Analysis Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Probability Card */}
                <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Fraud Probability</p>
                  <p className="text-3xl font-bold text-red-600">{summary ? `${summary.fraud_rate.toFixed(1)}%` : 'N/A'}</p>
                  <div className="h-12 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[]}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="val" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Score Card */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                  <p className="text-xs font-semibold text-gray-600 mb-2 w-full text-left">Risk Score</p>
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                      <circle cx="48" cy="48" r="40" stroke="#dc2626" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - (recentTransaction?.risk_score || 0) / 100)} strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{recentTransaction?.risk_score ?? 'N/A'}</span>
                      <span className="text-[10px] font-bold text-red-500 uppercase">{recentTransaction?.risk_level ?? 'UNKNOWN'}</span>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Patterns Detected */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                   <p className="text-xs font-semibold text-gray-600">Detected Patterns</p>
                   <Link href="/analyze" className="text-xs font-bold text-[#1e463a] flex items-center hover:underline">
                     View Full Analysis <ArrowRight className="w-3 h-3 ml-1" />
                   </Link>
                </div>
                <div className="space-y-2">
                  {(recentTransaction ? [{ label: recentTransaction.risk_level, color: 'bg-red-500' }] : []).map((pat, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${pat.color}`}></div>
                      <span className="text-xs text-gray-700 font-medium">{pat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Footer decorative shape */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400 rounded-br-full -z-10 opacity-90 transform -translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1e463a] rounded-tl-full -z-10 opacity-90 transform translate-x-1/4 translate-y-1/4"></div>
      
    </div>
  );
}
