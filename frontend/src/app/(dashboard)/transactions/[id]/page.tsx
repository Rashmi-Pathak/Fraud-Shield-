'use client';

import { 
  Download, BookmarkPlus, ChevronRight, Copy, CreditCard, User, Globe, 
  MapPin, Monitor, Clock, FileText, Activity, ShieldAlert, ArrowRight,
  Network, AlertTriangle, ShieldCheck, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function TransactionDetail() {
  const params = useParams();
  const id = params.id as string;
  
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/transactions/${id}`);
        if (res.ok) {
          const detail = await res.json();
          setData(detail);
          
          if (detail.transaction?.card_id) {
            const hRes = await fetch(`/api/transactions?card_id=${encodeURIComponent(detail.transaction.card_id)}&size=5&sort_by=event_time&sort_desc=true`);
            if (hRes.ok) {
              const hData = await hRes.json();
              setHistory(hData.items.reverse()); // Show chronologically
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetail();
  }, [id]);

  if (loading) {
      return <div className="p-8 text-gray-500">Loading transaction details...</div>;
  }

  if (!data || !data.transaction) {
      return <div className="p-8 text-gray-500">Transaction not found.</div>;
  }

  const tx = data.transaction;
  const pred = data.prediction || { risk_score: 0, risk_level: 'UNKNOWN', fraud_probability: 0, xgboost_probability: 0, random_forest_probability: 0, isolation_forest_score: 0, recommended_action: 'ALLOW' };
  
  const probData = [{val: 0}, {val: pred.fraud_probability * 20}, {val: pred.fraud_probability * 50}, {val: pred.fraud_probability * 80}, {val: pred.fraud_probability * 100}];
  
  const modelBreakdownData = [
    { name: 'XGBoost', value: pred.xgboost_probability * 100, color: '#10b981' },
    { name: 'Random Forest', value: pred.random_forest_probability * 100, color: '#f59e0b' },
    { name: 'Isolation Forest', value: Math.max(0, pred.isolation_forest_score * 100), color: '#ef4444' },
  ];

  // Map SHAP or risk factors
  
  const shapData = shapExpl ? shapExpl.contributions.map((c: any) => ({
    name: c.feature,
    value: Math.abs(c.contribution),
    raw: c.contribution
  })) : [];


  const riskLevelColor = pred.risk_level === 'CRITICAL' ? 'text-red-600 bg-red-50 border-red-100' :
                         pred.risk_level === 'HIGH' ? 'text-orange-600 bg-orange-50 border-orange-100' :
                         pred.risk_level === 'MEDIUM' ? 'text-yellow-600 bg-yellow-50 border-yellow-100' :
                         'text-emerald-600 bg-emerald-50 border-emerald-100';

  const riskScoreColor = pred.risk_score >= 80 ? '#dc2626' : pred.risk_score >= 60 ? '#f97316' : '#10b981';

  return (
    <div className="p-8 space-y-6">
      
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium mb-2">
            <Link href="/transactions" className="hover:text-gray-900">Transactions</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-bold">{tx.transaction_id}</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${riskLevelColor}`}>{pred.risk_level} Risk</span>
          </div>
          <p className="text-gray-500 text-xs mt-1">Comprehensive analysis and insights for this transaction</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-gray-50">
            <Download className="w-4 h-4" /> <span>Download Report</span>
          </button>
          <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-gray-50">
            <BookmarkPlus className="w-4 h-4" /> <span>Add to Watchlist</span>
          </button>
        </div>
      </div>

      {/* Top Grid (5 cards) */}
      <div className="grid grid-cols-5 gap-4">
        
        {/* Fraud Probability */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-700 mb-2">Fraud Probability</p>
          <p className="text-3xl font-bold text-red-600">{(pred.fraud_probability * 100).toFixed(1)}%</p>
          <div className="h-12 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={probData}>
                <defs>
                  <linearGradient id="colorProbSm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorProbSm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Score */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-gray-700 mb-2 w-full text-left">Risk Score</p>
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="#f3f4f6" strokeWidth="6" fill="none" />
              <circle cx="40" cy="40" r="34" stroke={riskScoreColor} strokeWidth="6" fill="none" strokeDasharray="213.6" strokeDashoffset={213.6 * (1 - pred.risk_score/100)} strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900 leading-none">{pred.risk_score}<span className="text-[10px] text-gray-500 font-medium">/100</span></span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-red-600 mt-2">{pred.risk_level}</span>
        </div>

        {/* Risk Level */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-700 mb-4">Risk Level</p>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${
                pred.risk_level === 'CRITICAL' ? 'bg-red-50 text-red-600' :
                pred.risk_level === 'HIGH' ? 'bg-orange-50 text-orange-600' :
                pred.risk_level === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' :
                'bg-emerald-50 text-emerald-600'
            }`}><ShieldAlert className="w-6 h-6" /></div>
            <div>
              <p className="text-lg font-bold text-gray-900">{pred.risk_level}</p>
            </div>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-700 mb-4">Recommended Action</p>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-full ${
                pred.recommended_action === 'BLOCK' ? 'bg-red-50 text-red-600' :
                pred.recommended_action === 'REVIEW' ? 'bg-orange-50 text-orange-600' :
                'bg-emerald-50 text-emerald-600'
            }`}><Globe className="w-6 h-6" /></div>
            <div>
              <p className={`text-xs font-bold ${
                pred.recommended_action === 'BLOCK' ? 'text-red-600' :
                pred.recommended_action === 'REVIEW' ? 'text-orange-600' :
                'text-emerald-600'
              }`}>{pred.recommended_action} TRANSACTION</p>
            </div>
          </div>
        </div>

        {/* Detection Time */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-700 mb-4">Event Time</p>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full"><Clock className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-gray-900">{new Date(tx.event_time).toLocaleDateString()}</p>
              <p className="text-xs font-bold text-gray-900">{new Date(tx.event_time).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
        
      </div>

      {/* Middle Grid (3 cols) */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Transaction Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="w-4 h-4 text-[#1e463a]" />
            <h3 className="font-bold text-gray-900 text-sm">Transaction Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2 text-gray-500"><FileText className="w-3.5 h-3.5"/> <span>Transaction ID</span></div>
              <div className="flex items-center space-x-1.5"><span className="font-bold text-gray-900">{tx.transaction_id}</span><Copy className="w-3 h-3 text-gray-400"/></div>
            </div>
            <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2 text-gray-500"><Activity className="w-3.5 h-3.5"/> <span>Amount</span></div>
              <span className="font-bold text-gray-900">₹{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2 text-gray-500"><Globe className="w-3.5 h-3.5"/> <span>Merchant</span></div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{tx.merchant_category}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 flex items-center justify-end">{tx.merchant_id}</p>
              </div>
            </div>
            <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2 text-gray-500"><CreditCard className="w-3.5 h-3.5"/> <span>Card Number</span></div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900 font-mono">**** **** **** {tx.card_id.slice(-4)}</span>
              </div>
            </div>
            <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2 text-gray-500"><User className="w-3.5 h-3.5"/> <span>Customer ID</span></div>
              <span className="font-bold text-gray-900">{tx.customer_id}</span>
            </div>
            <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2 text-gray-500"><FileText className="w-3.5 h-3.5"/> <span>Transaction Type</span></div>
              <span className="font-medium text-gray-900">{tx.transaction_type}</span>
            </div>
            <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2 text-gray-500"><Monitor className="w-3.5 h-3.5"/> <span>Payment Channel</span></div>
              <span className="font-medium text-gray-900">{tx.payment_channel}</span>
            </div>
            <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2 text-gray-500"><MapPin className="w-3.5 h-3.5"/> <span>Location</span></div>
              <span className="font-medium text-gray-900">{tx.city ? `${tx.city}, ` : ''}{tx.country}</span>
            </div>
            <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2 text-gray-500"><Monitor className="w-3.5 h-3.5"/> <span>Device</span></div>
              <span className="font-medium text-gray-900">{tx.device_id}</span>
            </div>
          </div>
        </div>
        
        {/* Why Was This Flagged? */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-sm mb-6">Fraud Detections & Risk Factors</h3>
          <div className="space-y-6">
            {data.detections.length === 0 && data.risk_factors.length === 0 && (
                <p className="text-sm text-gray-500">No flags detected.</p>
            )}
            
            {data.detections.map((d: any, i: number) => (
            <div key={i} className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="text-red-500 bg-red-50 p-1.5 rounded-lg"><FileText className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{d.fraud_category}</p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{d.reason || d.fraud_subcategory}</p>
                </div>
              </div>
            </div>
            ))}

            {data.risk_factors.map((f: string, i: number) => (
            <div key={i + 100} className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="text-orange-500 bg-orange-50 p-1.5 rounded-lg"><Activity className="w-4 h-4" /></div>
                <div>
                  <p className="text-[11px] font-medium text-gray-700">{f}</p>
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>

        {/* Model Prediction Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-6">Model Prediction Breakdown</h3>
            <div className="flex items-center justify-between">
              <div className="w-32 h-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={modelBreakdownData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} stroke="none" dataKey="value">
                      {modelBreakdownData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-semibold text-gray-500">Score</span>
                  <span className="text-xl font-bold text-gray-900 leading-none">{pred.risk_score}<span className="text-[10px] font-medium text-gray-500">/100</span></span>
                </div>
              </div>
              <div className="flex-1 pl-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
                    <span className="text-xs font-bold text-gray-700">XGBoost</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{(pred.xgboost_probability * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></div>
                    <span className="text-xs font-bold text-gray-700">Random Forest</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{(pred.random_forest_probability * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></div>
                    <span className="text-xs font-bold text-gray-700">Isolation Forest</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{(pred.isolation_forest_score * 100).toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]"></div>
                    <span className="text-xs font-bold text-gray-700">Rule Engine Score</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-900">{pred.rule_risk_score}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid (2 cols) */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Risk Factors (SHAP) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex space-x-6">
          <div className="flex-1 overflow-auto">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Historical Context</h3>
            <div className="space-y-3 mt-4 pr-4 text-xs text-gray-600">
                                {shapData.length === 0 ? "No contextual features found." : 
                    shapData.map((d: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[10px] border-b border-gray-50 pb-2">
                        <span className="w-24 text-gray-600 truncate" title={d.name}>{d.name}</span>
                        <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden flex justify-end">
                          <div className={`h-full rounded-full ${d.raw > 0 ? 'bg-[#ef4444]' : 'bg-[#10b981]'}`} style={{width: `${(d.value / Math.max(...shapData.map((s:any)=>s.value))) * 100}%`}}></div>
                        </div>
                        <span className={`font-bold w-12 text-right ${d.raw > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                          {d.raw > 0 ? '+' : ''}{(d.raw).toFixed(3)}
                        </span>
                      </div>
                    ))
                }
            </div>
          </div>
        </div>

        {/* Recent Transaction History */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-sm">Recent Transaction History <span className="text-gray-400 font-normal text-xs ml-1">(This Card)</span></h3>
            <Link href={`/transactions?card_id=${tx.card_id}`} className="text-[10px] font-bold text-[#1e463a] hover:underline">View All</Link>
          </div>
          
          <div className="relative border-l border-gray-200 ml-2 space-y-6 pb-2">
            {history.length === 0 ? (
                <div className="pl-6 text-xs text-gray-400">Loading history...</div>
            ) : history.map((t, i) => {
              const dt = new Date(t.event_time);
              const isCurrent = t.transaction_id === tx.transaction_id;
              return (
              <div key={i} className="pl-6 relative">
                <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${isCurrent ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className={`font-medium w-28 inline-block ${isCurrent ? 'text-red-600' : 'text-gray-900'}`}>{dt.toLocaleDateString()} {dt.toLocaleTimeString()}</span>
                    <span className="text-gray-500">{t.city || t.country}</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <span className="font-bold text-gray-900">₹{t.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>

      </div>

    </div>
  );
}
