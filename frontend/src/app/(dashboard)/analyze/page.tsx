'use client';

import { 
  ShieldCheck, ArrowRight, IndianRupee, Clock, Smartphone, Globe, CreditCard, 
  ChevronDown, Search, AlertTriangle, CheckCircle2, BookmarkPlus, Activity, Network, ShieldAlert
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useState } from 'react';

export default function AnalyzeTransaction() {
  const [formData, setFormData] = useState({
    amount: "78400.00",
    card_id: "CARD_8921",
    customer_id: "CUST_55621",
    transaction_type: "ONLINE_PURCHASE",
    merchant_id: "MERCH_1234",
    merchant_category: "Electronics",
    payment_channel: "WEB",
    card_present: "No",
    device_id: "DEV_9911",
    device_type: "MOBILE",
    operating_system: "iOS",
    browser: "Safari",
    country: "India",
    state: "Delhi",
    city: "Delhi",
    latitude: "28.6139",
    longitude: "77.2090",
    timestamp: new Date().toISOString().slice(0,16)
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const clearAll = () => {
    setFormData({
      amount: "", card_id: "", customer_id: "", transaction_type: "", merchant_id: "", merchant_category: "", payment_channel: "", card_present: "No", device_id: "", device_type: "", operating_system: "", browser: "", country: "", state: "", city: "", latitude: "", longitude: "", timestamp: new Date().toISOString().slice(0,16)
    });
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        transaction_id: "TXN_" + Math.floor(Math.random() * 1000000),
        amount: parseFloat(formData.amount),
        card_id: formData.card_id,
        customer_id: formData.customer_id,
        merchant_id: formData.merchant_id,
        merchant_category: formData.merchant_category,
        device_id: formData.device_id,
        device_type: formData.device_type,
        operating_system: formData.operating_system,
        browser: formData.browser,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        transaction_type: formData.transaction_type,
        payment_channel: formData.payment_channel,
        card_present: formData.card_present === "Yes",
        timestamp: formData.timestamp + ":00",
        currency: "INR",
        international_transaction: false,
        installment: 0,
        is_recurring: false
      };

      const res = await fetch("/api/transactions/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(Array.isArray(data.detail) ? data.detail.map(d => d.msg).join(", ") : (data.detail || "Analysis failed"));
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label: string, name: string, type = "text") => (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input type={type} name={name} value={(formData as any)[name]} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1e463a]/20" />
    </div>
  );

  const renderSelect = (label: string, name: string, options: string[]) => (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <div className="relative">
        <select name={name} value={(formData as any)[name]} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#1e463a]/20">
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );

  // Parse result components
  let probData = [];
  if (result) {
    probData = [{val: 0}, {val: result.fraud_probability * 20}, {val: result.fraud_probability * 50}, {val: result.fraud_probability * 80}, {val: result.fraud_probability * 100}];
  }

  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analyze Transaction</h1>
        <p className="text-gray-500 text-sm">Enter transaction details to analyze fraud risk and get AI-powered insights.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Column: Form */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center space-x-2">
                <FileIcon className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-800">Transaction Details</h3>
              </div>
              <button onClick={clearAll} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Clear All</button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Row 1 */}
                {renderInput("Amount (₹)", "amount", "number")}
                {renderInput("Card ID", "card_id")}
                {renderInput("Customer ID", "customer_id")}
                {renderSelect("Transaction Type", "transaction_type", ["ONLINE_PURCHASE", "POS_PURCHASE", "ATM_WITHDRAWAL"])}

                {/* Row 2 */}
                {renderInput("Merchant ID", "merchant_id")}
                {renderInput("Merchant Category", "merchant_category")}
                {renderSelect("Payment Channel", "payment_channel", ["WEB", "MOBILE_APP", "POS", "ATM"])}
                {renderSelect("Card Present", "card_present", ["Yes", "No"])}
                
                {/* Row 3 */}
                {renderInput("Device ID", "device_id")}
                {renderSelect("Device Type", "device_type", ["MOBILE", "DESKTOP", "TABLET"])}
                {renderInput("OS", "operating_system")}
                {renderInput("Browser", "browser")}

                {/* Row 4 */}
                {renderInput("Country", "country")}
                {renderInput("State", "state")}
                {renderInput("City", "city")}
                {renderInput("Latitude", "latitude", "number")}

                {/* Row 5 */}
                {renderInput("Longitude", "longitude", "number")}
                {renderInput("Timestamp", "timestamp", "datetime-local")}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="mt-6">
                <button onClick={handleAnalyze} disabled={loading} className="w-full bg-[#1e463a] text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#1e463a]/20 hover:bg-[#15342a] transition-all disabled:opacity-70">
                  <ShieldCheck className="w-5 h-5" /> <span>{loading ? "Analyzing..." : "Analyze Transaction"}</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Detailed Explanations */}
          {result && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Risk Factors</h3>
              <div className="space-y-4">
                {Object.entries(result.risk_factors || {}).map(([key, val]: any, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="text-sm font-medium text-gray-600">{key.replace(/_/g, " ").toUpperCase()}</span>
                        <span className="text-sm font-bold text-gray-900">{typeof val === 'number' ? val.toFixed(2) : val}</span>
                    </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Model Prediction Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 w-32">
                    <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center"><Activity className="w-3 h-3 text-emerald-700" /></div>
                    <span className="text-xs font-bold text-gray-700">XGBoost</span>
                  </div>
                  <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${result.xgboost_probability * 100}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-gray-900 w-10 text-right">{(result.xgboost_probability * 100).toFixed(1)}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 w-32">
                    <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center"><Network className="w-3 h-3 text-emerald-700" /></div>
                    <span className="text-xs font-bold text-gray-700">Random Forest</span>
                  </div>
                  <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${result.random_forest_probability * 100}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-gray-900 w-10 text-right">{(result.random_forest_probability * 100).toFixed(1)}%</span>
                </div>
                
                <div className="mt-6 bg-[#f4f7f6] p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-6 h-6 text-[#1e463a]" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Final Risk Score</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{result.risk_score}/100</span>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Right Column: Result */}
        <div className="w-[450px] space-y-6 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
            {!result ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-20">
                   <ShieldCheck className="w-16 h-16 mb-4 text-gray-200" />
                   <p className="font-medium">Run analysis to see results</p>
               </div>
            ) : (
            <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Analysis Result</h3>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-bold border uppercase ${
                  result.risk_level === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-100' :
                  result.risk_level === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                  result.risk_level === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                  'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>
                <AlertTriangle className="w-3 h-3" /> <span>{result.risk_level} Risk</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 border-b border-gray-100 pb-6">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Fraud Probability</p>
                <p className="text-4xl font-bold text-red-600">{(result.fraud_probability * 100).toFixed(1)}%</p>
                <div className="h-10 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={probData}>
                        <defs>
                          <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="val" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorProb)" />
                      </AreaChart>
                    </ResponsiveContainer>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs font-semibold text-gray-600 mb-1 w-full text-center">Risk Score</p>
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                    <circle cx="48" cy="48" r="40" stroke={result.risk_score > 75 ? "#dc2626" : result.risk_score > 50 ? "#f97316" : "#10b981"} strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - result.risk_score/100)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center mt-1">
                    <span className="text-2xl font-bold text-gray-900 leading-none">{result.risk_score}<span className="text-sm text-gray-500 font-medium">/100</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-600 mb-3">Recommended Action</p>
              <div className={`border rounded-xl p-4 ${
                  result.recommended_action === 'BLOCK' ? 'bg-red-50 border-red-200' :
                  result.recommended_action === 'REVIEW' ? 'bg-orange-50 border-orange-200' :
                  'bg-emerald-50 border-emerald-200'
              }`}>
                <div className={`flex items-center justify-center space-x-2 font-bold mb-2 ${
                    result.recommended_action === 'BLOCK' ? 'text-red-700' :
                    result.recommended_action === 'REVIEW' ? 'text-orange-700' :
                    'text-emerald-700'
                }`}>
                  <ShieldAlert className="w-5 h-5" /> <span>{result.recommended_action} TRANSACTION</span>
                </div>
              </div>
            </div>
            
            {result.fraud_categories && result.fraud_categories.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-semibold text-gray-600">Detected Patterns ({result.fraud_categories.length})</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.fraud_categories.map((c: string) => (
                    <span key={c} className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded text-[11px] font-bold">{c.replace(/_/g, " ")}</span>
                ))}
              </div>
            </div>
            )}
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const FileIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
