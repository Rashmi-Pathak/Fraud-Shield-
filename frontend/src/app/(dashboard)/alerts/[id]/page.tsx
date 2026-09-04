'use client';

import { 
  ArrowLeft, ChevronDown, User, CreditCard, DollarSign, Monitor, Clock, 
  MapPin, Building, FileText, AlertTriangle, UserPlus, Zap, CheckCircle, 
  XCircle, ArrowUpCircle, Eye, MessageSquare, Target, Hash, Activity, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AlertInvestigation() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/alerts/${id}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const actionReq = async (endpoint: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/${endpoint}`, { method: 'POST' });
      if (res.ok) {
        fetchData(); // Reload
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading alert details...</div>;
  if (!data || !data.alert) return <div className="p-8 text-gray-500">Alert not found.</div>;

  const a = data.alert;
  const tx = data.transaction || {};
  const pred = data.prediction || {};
  
  const isCrit = a.severity === 'CRITICAL';
  const isHigh = a.severity === 'HIGH';
  const isMed = a.severity === 'MEDIUM';

  return (
    <div className="p-8 space-y-6 flex gap-6 h-full overflow-hidden">
      
      <div className="flex-1 min-w-0 space-y-6 overflow-y-auto pr-2 pb-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium mb-2">
              <Link href="/alerts" className="hover:text-gray-900">Fraud Alerts</Link>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              <span className="text-gray-900 font-bold">Alert Investigation</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Alert Investigation</h1>
            <p className="text-gray-500 text-sm mt-1">Investigate, analyze and take action on fraud alerts</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/alerts" className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4" /> <span>Back to Alerts</span>
            </Link>
          </div>
        </div>

        {/* Top Info Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><User className="w-5 h-5"/></div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Alert ID</p>
              <p className="font-bold text-gray-900 text-sm">{a.id}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">{new Date(a.created_at).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg shrink-0 ${isCrit ? 'bg-red-50 text-red-600' : isHigh ? 'bg-orange-50 text-orange-500' : 'bg-yellow-50 text-yellow-600'}`}><Target className="w-5 h-5"/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Risk Score</p>
                <div className="flex items-baseline space-x-1">
                  <span className="font-bold text-gray-900 text-lg leading-none">{pred.risk_score || 0}</span>
                  <span className="text-[10px] text-gray-500">/ 100</span>
                </div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isCrit ? 'bg-red-50 text-red-600 border-red-100' : isHigh ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>{a.severity}</span>
          </div>

          <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><Activity className="w-5 h-5"/></div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Alert Title</p>
              <p className="font-bold text-gray-900 text-xs truncate max-w-[100px]">{a.title}</p>
            </div>
          </div>

          <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg shrink-0"><User className="w-5 h-5"/></div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Status</p>
              <p className="font-bold text-blue-600 text-xs">{a.status}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Current Phase</p>
            </div>
          </div>

          <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center space-x-3">
            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg shrink-0"><Clock className="w-5 h-5"/></div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Current Label</p>
              <p className="font-bold text-gray-900 text-xs">{data.label}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 text-xs font-semibold">
            <button className="py-3 border-b-2 border-[#1e463a] text-[#1e463a]">Alert Overview</button>
            <Link href={`/transactions/${a.transaction_id}`} className="py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">View Full Transaction Context</Link>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-sm mb-2">Transaction Summary</h3>
          <p className="text-xs text-gray-600 mb-6">{a.description || 'This transaction generated alerts based on anomalous activity.'}</p>

          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-start space-x-3 border-r border-gray-100 pr-4">
              <div className="p-1.5 bg-gray-50 rounded-full text-gray-500"><User className="w-4 h-4"/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold">Customer</p>
                <p className="font-bold text-gray-900 text-sm">{tx.customer_id}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border-r border-gray-100 pr-4">
              <div className="p-1.5 bg-gray-50 rounded-full text-gray-500"><CreditCard className="w-4 h-4"/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold">Card</p>
                <p className="font-bold text-gray-900 text-sm">**** {tx.card_id?.slice(-4)}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-1.5 bg-emerald-50 rounded-full text-emerald-600"><DollarSign className="w-4 h-4"/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold">Amount</p>
                <p className="font-bold text-gray-900 text-sm">₹ {(tx.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border-r border-gray-100 pr-4">
              <div className="p-1.5 bg-gray-50 rounded-full text-gray-500"><Monitor className="w-4 h-4"/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold">Channel</p>
                <p className="font-bold text-gray-900 text-sm">{tx.payment_channel}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border-r border-gray-100 pr-4">
              <div className="p-1.5 bg-gray-50 rounded-full text-gray-500"><Clock className="w-4 h-4"/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold">Transaction Time</p>
                <p className="font-bold text-gray-900 text-sm">{tx.event_time ? new Date(tx.event_time).toLocaleString() : ''}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-1.5 bg-gray-50 rounded-full text-gray-500"><MapPin className="w-4 h-4"/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold">Location</p>
                <p className="font-bold text-gray-900 text-sm">{tx.city ? `${tx.city}, ` : ''}{tx.country}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border-r border-gray-100 pr-4">
              <div className="p-1.5 bg-gray-50 rounded-full text-gray-500"><Building className="w-4 h-4"/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold">Merchant</p>
                <p className="font-bold text-gray-900 text-sm">{tx.merchant_category}</p>
                <p className="text-[10px] text-gray-400">{tx.merchant_id}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border-r border-gray-100 pr-4">
              <div className="p-1.5 bg-gray-50 rounded-full text-gray-500"><Monitor className="w-4 h-4"/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold">Device</p>
                <p className="font-bold text-gray-900 text-sm">{tx.device_id}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-1.5 bg-gray-50 rounded-full text-gray-500"><FileText className="w-4 h-4"/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold">Reference ID</p>
                <p className="font-bold text-gray-900 text-sm">{tx.transaction_id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Indicators */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 text-sm">Risk Indicators Triggered ({data.detections.length})</h3>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {data.detections.length === 0 && <p className="text-xs text-gray-500 col-span-6">No specific fraud rules triggered natively.</p>}
            {data.detections.map((det: any, i: number) => (
            <div key={i} className="col-span-2 bg-red-50 border border-red-100 rounded-lg p-3">
              <div className="flex items-center space-x-1.5 text-red-600 mb-1"><AlertTriangle className="w-3 h-3"/><span className="text-[10px] font-bold leading-tight">{det.fraud_category}</span></div>
              <p className="text-[8px] text-red-700">{det.reason}</p>
            </div>
            ))}
          </div>
        </div>

        {/* AI Model Insight */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-sm mb-6">AI Model Insight</h3>
          <div className="flex items-center space-x-8">
            <div className="w-32 h-32 relative shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="50" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                <circle cx="64" cy="64" r="50" stroke="#dc2626" strokeWidth="12" fill="none" strokeDasharray="314.16" strokeDashoffset={314.16 * (1 - (pred.risk_score || 0)/100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 leading-none">{pred.risk_score || 0}</span>
                <span className="text-[9px] text-gray-500 font-semibold mt-1">Risk Score</span>
              </div>
            </div>
            
            <div className="flex-1 text-xs text-gray-600 pr-6 border-r border-gray-100">
              The AI model has processed this transaction against historical baseline behaviors and detected multiple anomalies. The risk score encompasses rule engine checks, Random Forest voting, and XGBoost probabilities.
            </div>

            <div className="flex-1 space-y-4 pr-6 border-r border-gray-100">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-600 font-semibold">XGBoost Prob</span>
                <span className="font-bold text-gray-900">{(pred.xgboost_probability * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-600 font-semibold">Random Forest Prob</span>
                <span className="font-bold text-gray-900">{(pred.random_forest_probability * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-600 font-semibold">Isolation Forest</span>
                <span className="font-bold text-gray-900">{(pred.isolation_forest_score * 100).toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-600 font-semibold">Rule Risk Score</span>
                <span className="font-bold text-gray-900">{pred.rule_risk_score}</span>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-800 mb-3">Model Risk Factors</p>
              <div className="space-y-2 text-[10px] h-24 overflow-y-auto pr-1">
                {data.risk_factors.map((rf: string, idx: number) => (
                  <div key={idx} className="flex justify-between items-start text-xs border-b border-gray-50 pb-1 mb-1">
                    <span className="text-gray-600">{rf}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[320px] shrink-0 space-y-6 overflow-y-auto max-h-full pr-2">
        
        {/* Investigation Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Investigation Actions</h3>
          
          <div className="space-y-3">
            {a.status === 'OPEN' && (
            <button onClick={() => actionReq('start-investigation')} className="w-full text-left bg-white border border-blue-200 rounded-xl p-3 flex items-start space-x-3 hover:bg-blue-50 transition-colors group">
              <div className="bg-blue-50 text-blue-600 rounded-full p-1 group-hover:bg-blue-100 mt-0.5"><Eye className="w-4 h-4" /></div>
              <div>
                <p className="text-[11px] font-bold text-blue-900">Start Investigation</p>
                <p className="text-[9px] text-blue-600 mt-0.5">Mark alert as Investigating</p>
              </div>
            </button>
            )}

            <button onClick={() => actionReq('confirm-legitimate')} className="w-full text-left bg-white border border-gray-100 rounded-xl p-3 flex items-start space-x-3 hover:bg-emerald-50 transition-colors group">
              <div className="bg-emerald-50 text-emerald-600 rounded-full p-1 group-hover:bg-emerald-100 mt-0.5"><CheckCircle className="w-4 h-4" /></div>
              <div>
                <p className="text-[11px] font-bold text-gray-900">Confirm Legitimate</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Label CONFIRMED_LEGIT</p>
              </div>
            </button>
            <button onClick={() => actionReq('confirm-fraud')} className="w-full text-left bg-white border border-gray-100 rounded-xl p-3 flex items-start space-x-3 hover:bg-red-50 transition-colors group">
              <div className="bg-red-50 text-red-600 rounded-full p-1 group-hover:bg-red-100 mt-0.5"><XCircle className="w-4 h-4" /></div>
              <div>
                <p className="text-[11px] font-bold text-gray-900">Confirm Fraud</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Label CONFIRMED_FRAUD</p>
              </div>
            </button>
            <button onClick={() => actionReq('dismiss')} className="w-full text-left bg-white border border-gray-100 rounded-xl p-3 flex items-start space-x-3 hover:bg-gray-50 transition-colors group">
              <div className="bg-gray-100 text-gray-600 rounded-full p-1 group-hover:bg-gray-200 mt-0.5"><MessageSquare className="w-4 h-4" /></div>
              <div>
                <p className="text-[11px] font-bold text-gray-900">Dismiss Alert</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Close without labeling</p>
              </div>
            </button>
          </div>
        </div>

        {/* Alert Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-sm">Alert Timeline</h3>
          </div>
          
          <div className="relative border-l border-gray-200 ml-2 space-y-6 pb-2">
            {data.timeline.map((evt: any, i: number) => {
              const dt = new Date(evt.timestamp);
              return (
              <div key={i} className="pl-6 relative">
                <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white ${evt.severity === 'USER' ? 'bg-blue-500' : 'bg-[#1e463a]'}`}></div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-900">{evt.message}</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">{dt.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">{evt.severity}</span>
                </div>
              </div>
            )})}

            {a.status !== 'CLOSED' && a.status !== 'DISMISSED' && (
            <div className="pl-6 relative">
              <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white bg-gray-300"></div>
              <div>
                <p className="text-[11px] font-bold text-gray-600">Pending Action</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Waiting for analyst decision</p>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
