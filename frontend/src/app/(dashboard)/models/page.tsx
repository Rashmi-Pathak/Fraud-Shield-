'use client';

import { 
  Box, Target, ShieldCheck, AlertTriangle, Loader2, Lightbulb, 
  ChevronDown, Eye, Calendar, Clock, CheckCircle2, AlertCircle, BarChart2,
  ArrowUpRight, ArrowDownRight, ArrowRight, ShieldAlert, FileText, Cpu,
  ChevronRight, Info
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar 
} from 'recharts';
import Link from 'next/link';

// Mock Data
const performanceData = [
  { name: 'May 23', acc: 92.5, prec: 91.0, rec: 90.5, f1: 91.2 },
  { name: 'May 24', acc: 93.0, prec: 91.5, rec: 91.0, f1: 91.8 },
  { name: 'May 25', acc: 92.8, prec: 91.2, rec: 90.8, f1: 91.5 },
  { name: 'May 26', acc: 93.5, prec: 92.5, rec: 92.0, f1: 92.2 },
  { name: 'May 27', acc: 93.2, prec: 92.0, rec: 91.5, f1: 91.9 },
  { name: 'May 28', acc: 94.0, prec: 93.0, rec: 92.5, f1: 92.8 },
  { name: 'May 29', acc: 94.1, prec: 93.2, rec: 92.8, f1: 93.0 },
];

const modelComparison = [
  { name: 'FraudShield v2.4.1', type: 'Ensemble', acc: '94.1%', prec: '93.2%', rec: '92.8%', f1: '93.0%', auc: '0.967', status: 'Live', isProd: true },
  { name: 'FraudShield v2.3.0', type: 'XGBoost', acc: '92.3%', prec: '91.1%', rec: '90.2%', f1: '90.6%', auc: '0.945', status: 'Archived', isProd: false },
  { name: 'FraudShield v2.2.1', type: 'Random Forest', acc: '89.7%', prec: '88.2%', rec: '87.6%', f1: '87.9%', auc: '0.921', status: 'Archived', isProd: false },
  { name: 'FraudShield v2.1.0', type: 'Logistic Regression', acc: '85.6%', prec: '84.3%', rec: '83.1%', f1: '83.7%', auc: '0.872', status: 'Archived', isProd: false },
];

const featureImportance = [
  { name: 'Transaction Amount', value: 28.7 },
  { name: 'Transaction Frequency', value: 18.9 },
  { name: 'Time of Transaction', value: 14.3 },
  { name: 'Device Reputation', value: 10.6 },
  { name: 'Location Anomaly', value: 8.4 },
  { name: 'Merchant Category', value: 6.1 },
  { name: 'IP Reputation', value: 4.2 },
  { name: 'Account Age', value: 3.2 },
  { name: 'Others', value: 5.6 },
];

export default function ModelIntelligence() {
  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Model Intelligence</h1>
        <p className="text-gray-500 text-sm">Monitor, evaluate and optimize AI models for fraud detection.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <Box className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold">Active Models</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">8</h3>
          </div>
          <div className="flex items-center text-xs text-emerald-600 font-bold">
            <ArrowUpRight className="w-3 h-3 mr-1" /> 2 vs last 7 days
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold">Avg. Model Accuracy</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">94.1%</h3>
          </div>
          <div className="flex items-center text-xs text-emerald-600 font-bold">
            <ArrowUpRight className="w-3 h-3 mr-1" /> 1.8% vs last 7 days
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold">Fraud Detection Rate</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">93.6%</h3>
          </div>
          <div className="flex items-center text-xs text-emerald-600 font-bold">
            <ArrowUpRight className="w-3 h-3 mr-1" /> 2.3% vs last 7 days
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold">False Positive Rate</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">0.42%</h3>
          </div>
          <div className="flex items-center text-xs text-emerald-600 font-bold">
            <ArrowDownRight className="w-3 h-3 mr-1" /> 0.08% vs last 7 days
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <Loader2 className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold">Models in Training</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">2</h3>
          </div>
          <div className="flex items-center text-xs text-gray-500 font-bold">
            <span className="mr-1">-</span> No change
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        
        {/* Left Column */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Model Performance Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Model Performance Overview</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <select className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                    <option>All Models</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                <button className="flex items-center space-x-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50">
                  <Calendar className="w-3.5 h-3.5" /> <span>May 23, 2025 - May 29, 2025</span> <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Accuracy</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">94.1%</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center"><ArrowUpRight className="w-2.5 h-2.5 mr-0.5"/> 1.8%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Precision</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">93.2%</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center"><ArrowUpRight className="w-2.5 h-2.5 mr-0.5"/> 2.1%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Recall</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">92.8%</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center"><ArrowUpRight className="w-2.5 h-2.5 mr-0.5"/> 1.6%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">F1 Score</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">93.0%</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center"><ArrowUpRight className="w-2.5 h-2.5 mr-0.5"/> 1.9%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">AUC - ROC</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">0.967</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center"><ArrowUpRight className="w-2.5 h-2.5 mr-0.5"/> 0.012</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-6 text-[10px] font-semibold text-gray-500 mb-2">
              <span className="flex items-center"><div className="w-2 h-1 rounded-full bg-[#10b981] mr-1.5"></div> Accuracy</span>
              <span className="flex items-center"><div className="w-2 h-1 rounded-full bg-[#f59e0b] mr-1.5"></div> Precision</span>
              <span className="flex items-center"><div className="w-2 h-1 rounded-full bg-[#0ea5e9] mr-1.5"></div> Recall</span>
              <span className="flex items-center"><div className="w-2 h-1 rounded-full bg-[#8b5cf6] mr-1.5"></div> F1 Score</span>
            </div>
            
            <div className="h-48 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{top: 5, right: 10, left: -20, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                  <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="acc" stroke="#10b981" strokeWidth={2} dot={{r:3}} />
                  <Line type="monotone" dataKey="prec" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} />
                  <Line type="monotone" dataKey="rec" stroke="#0ea5e9" strokeWidth={2} dot={{r:3}} />
                  <Line type="monotone" dataKey="f1" stroke="#8b5cf6" strokeWidth={2} dot={{r:3}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 flex items-center text-xs">
              <Lightbulb className="w-4 h-4 text-emerald-600 mr-2" />
              <p>Your models are performing better than last week. <span className="font-bold">Fraud detection rate improved by 2.3%.</span></p>
            </div>
          </div>

          {/* Model Comparison */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Model Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white">
                  <tr className="text-[11px] font-semibold text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-3 font-medium">Model Name</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Accuracy</th>
                    <th className="px-4 py-3 font-medium">Precision</th>
                    <th className="px-4 py-3 font-medium">Recall</th>
                    <th className="px-4 py-3 font-medium">F1 Score</th>
                    <th className="px-4 py-3 font-medium">AUC - ROC</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {modelComparison.map((mod, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-bold text-gray-900">{mod.name}</p>
                        {mod.isProd && <p className="text-[9px] text-gray-500 mt-0.5">(Production)</p>}
                      </td>
                      <td className="px-4 py-4 text-gray-600">{mod.type}</td>
                      <td className="px-4 py-4 font-bold text-emerald-600">{mod.acc}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">{mod.prec}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">{mod.rec}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">{mod.f1}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">{mod.auc}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${mod.status === 'Live' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                          <span className={`text-[10px] font-semibold ${mod.status === 'Live' ? 'text-emerald-700' : 'text-gray-500'}`}>{mod.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 hover:text-gray-600"><Eye className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-center">
              <button className="flex items-center space-x-2 text-xs font-bold text-[#1e463a] border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
                <BarChart2 className="w-3.5 h-3.5" /> <span>Compare All Models</span>
              </button>
            </div>
          </div>

          {/* Model Training & Development */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Model Training & Development</h3>
            
            <div className="grid grid-cols-2 gap-6">
              
              <div className="border-r border-gray-100 pr-6">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Models in Training</p>
                    <p className="text-2xl font-bold text-gray-900 leading-none">2</p>
                  </div>
                  <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline">View All</Link>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-gray-100 rounded"><Cpu className="w-3 h-3 text-gray-600"/></div>
                        <span className="font-bold text-gray-900">FraudShield v2.5.0</span>
                      </div>
                      <span className="font-bold text-gray-600 text-[10px]">68%</span>
                    </div>
                    <p className="text-[9px] text-gray-500 mb-2">Training Progress</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{width: '68%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-gray-100 rounded"><Cpu className="w-3 h-3 text-gray-600"/></div>
                        <span className="font-bold text-gray-900">Merchant Risk Model v1.1</span>
                      </div>
                      <span className="font-bold text-gray-600 text-[10px]">32%</span>
                    </div>
                    <p className="text-[9px] text-gray-500 mb-2">Training Progress</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{width: '32%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Upcoming Training</p>
                    <p className="text-2xl font-bold text-gray-900 leading-none">1</p>
                  </div>
                  <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline">View All</Link>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="bg-white p-2 border border-gray-200 rounded-lg"><Calendar className="w-4 h-4 text-gray-500"/></div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">FraudShield v2.6.0</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Scheduled on Jun 10, 2025</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="w-[320px] flex-shrink-0 space-y-6">
          
          {/* Current Production Model */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
             <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-200 uppercase tracking-wide">Live</div>
             <div className="flex items-center space-x-3 mb-6">
               <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center text-emerald-600">
                 <Box className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900 text-sm">FraudShield v2.4.1</h3>
                 <p className="text-[9px] text-gray-500">Deployed on May 20, 2025</p>
               </div>
             </div>
             
             <div className="space-y-3 mb-6">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500 font-medium">Model Type</span>
                 <span className="font-bold text-gray-900 text-[10px]">Ensemble (XGBoost + LR)</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500 font-medium">Training Data</span>
                 <span className="font-bold text-gray-900 text-[10px]">12.4M Transactions</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500 font-medium">Features Used</span>
                 <span className="font-bold text-gray-900 text-[10px]">186</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500 font-medium">Last Retrained</span>
                 <span className="font-bold text-gray-900 text-[10px]">May 20, 2025</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500 font-medium">Next Retrain</span>
                 <span className="font-bold text-gray-900 text-[10px]">Jun 20, 2025</span>
               </div>
               <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-50">
                 <span className="text-gray-500 font-medium">Drift Status</span>
                 <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">No Significant Drift</span>
               </div>
             </div>

             <button className="w-full border border-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                View Model Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
             </button>
          </div>

          {/* Top Contributing Features */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Top Contributing Features</h3>
              <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline flex items-center">View All <ChevronRight className="w-3 h-3 ml-0.5" /></Link>
            </div>
            
            <div className="space-y-3 mb-4">
              {featureImportance.map((feat, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className="w-32 text-gray-600 font-medium truncate">{feat.name}</span>
                  <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden flex justify-end">
                    <div className="h-full bg-[#1e463a] rounded-full" style={{width: `${(feat.value / 28.7) * 100}%`}}></div>
                  </div>
                  <span className="font-bold text-gray-900 w-8 text-right">{feat.value}%</span>
                </div>
              ))}
            </div>
            
            <p className="text-[9px] text-gray-400 flex items-center"><Info className="w-3 h-3 mr-1" /> Based on SHAP values</p>
          </div>

          {/* Recent Model Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Recent Model Activity</h3>
              <Link href="#" className="text-[10px] font-bold text-[#1e463a] hover:underline flex items-center">View All <ChevronRight className="w-3 h-3 ml-0.5" /></Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-emerald-50 p-1 rounded-full text-emerald-600 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">FraudShield v2.4.1 deployed to production</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">May 20, 2025 • 10:32 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-50 p-1 rounded-full text-blue-600 mt-0.5"><Clock className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Model retrained successfully</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">May 20, 2025 • 02:15 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-50 p-1 rounded-full text-yellow-600 mt-0.5"><AlertCircle className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Feature drift detected in 'Location Anomaly'</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">May 19, 2025 • 11:48 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-emerald-50 p-1 rounded-full text-emerald-600 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">FraudShield v2.4.1 training completed</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">May 19, 2025 • 09:22 PM</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
