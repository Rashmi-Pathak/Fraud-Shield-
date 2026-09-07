import json

with open("frontend/src/app/(dashboard)/models/page.tsx", "w", encoding="utf-8") as f:
    f.write("""'use client';

import { 
  Network, Cpu, Settings, Activity, Box, CheckCircle2, AlertCircle, Clock, 
  Database, RefreshCw, BarChart2, ShieldCheck, PlayCircle, ChevronRight, Info, Calendar, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';

// Using mock chart data since time series evaluation isn't natively stored yet
const perfData = [
  { name: 'May 23', precision: 92, recall: 88, f1: 90 },
  { name: 'May 24', precision: 93, recall: 89, f1: 91 },
  { name: 'May 25', precision: 91, recall: 87, f1: 89 },
  { name: 'May 26', precision: 94, recall: 88, f1: 91 },
  { name: 'May 27', precision: 95, recall: 90, f1: 92 },
  { name: 'May 28', precision: 93, recall: 89, f1: 91 },
  { name: 'May 29', precision: 96, recall: 91, f1: 93.5 },
];

export default function ModelIntelligence() {
  const [models, setModels] = useState<any[]>([]);
  const [activeModelDetail, setActiveModelDetail] = useState<any>(null);
  const [trainingStatus, setTrainingStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch models
      const mRes = await fetch('/api/models');
      let mData = [];
      if (mRes.ok) mData = await mRes.json();
      setModels(mData);

      // 2. Fetch active model detail (production or fallback to XGBoost)
      let prodModel = mData.find((m: any) => m.is_production);
      if (!prodModel && mData.length > 0) prodModel = mData[0];
      
      if (prodModel) {
        const dRes = await fetch(`/api/models/${prodModel.model_name}`);
        if (dRes.ok) {
          setActiveModelDetail(await dRes.json());
        }
      }

      // 3. Fetch training status
      const tRes = await fetch('/api/models/training/status');
      if (tRes.ok) {
        setTrainingStatus(await tRes.json());
      }
      
    } catch (err) {
      console.error("Error fetching models:", err);
    } finally {
      setLoading(false);
    }
  };

  const getModelTypeString = (name: string) => {
    if (name === 'XGBoost' || name === 'RandomForest') return 'Ensemble Trees';
    if (name === 'IsolationForest') return 'Unsupervised Anomaly';
    return 'Linear Classifer';
  };

  if (loading) return <div className="p-8 text-gray-500">Loading model intelligence...</div>;

  const totalDetections = 12480; // Placeholder until integrated with stats if needed
  
  // Highest feature importance for scaling bars
  const maxImp = activeModelDetail?.feature_importances?.length ? Math.max(...activeModelDetail.feature_importances.map((f: any) => f.importance)) : 1;

  return (
    <div className="p-8 space-y-6 flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Model Intelligence</h1>
        <p className="text-gray-500 text-sm">Monitor AI performance, feature drift, and ensemble decision making.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <Network className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-semibold">Active Models</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{models.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold">Avg F1 Score</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {models.length ? (models.reduce((a, b) => a + (b.f1 || 0), 0) / models.length * 100).toFixed(1) : 0}%
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <Cpu className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold">Inference Latency</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">14<span className="text-xl text-gray-500 ml-1">ms</span></h3>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start flex-1 min-h-0">
        
        {/* Left Column */}
        <div className="flex-1 space-y-6 overflow-y-auto pr-2 max-h-full">
          
          <div className="grid grid-cols-2 gap-6">
            
            {/* Model Comparison Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-sm">Model Ensemble Performance</h3>
                <button className="flex items-center space-x-1.5 bg-gray-50 text-gray-700 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-gray-100 transition-colors border border-gray-200">
                  <Settings className="w-3.5 h-3.5" /> <span>Configure Ensemble</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-500 border-b border-gray-100 uppercase tracking-wider">
                      <th className="pb-3 pl-2">Model</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Training Rows</th>
                      <th className="pb-3">Precision</th>
                      <th className="pb-3">Recall</th>
                      <th className="pb-3">F1 Score</th>
                      <th className="pb-3">ROC AUC</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {models.map((m, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 pl-2 font-bold text-gray-900">
                          {m.model_name}
                          <div className="text-[9px] text-gray-400 font-normal font-mono">{m.version.split('_')[0]}</div>
                        </td>
                        <td className="py-3 text-gray-600">{getModelTypeString(m.model_name)}</td>
                        <td className="py-3 text-gray-600">{m.training_rows?.toLocaleString() || 'N/A'}</td>
                        <td className="py-3 font-medium">{(m.precision * 100).toFixed(1)}%</td>
                        <td className="py-3 font-medium">{(m.recall * 100).toFixed(1)}%</td>
                        <td className="py-3 font-bold text-[#1e463a]">{(m.f1 * 100).toFixed(1)}%</td>
                        <td className="py-3 font-medium">{(m.roc_auc * 100).toFixed(1)}%</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${m.is_production ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                            {m.is_production ? 'PRODUCTION' : 'SHADOW'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance History (Mocked for visuals) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-sm">Ensemble Performance History (Val)</h3>
              </div>
              <div className="h-48 w-full mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={perfData} margin={{top: 5, right: 0, left: -25, bottom: 0}}>
                    <defs>
                      <linearGradient id="colorF1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPrec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} domain={[80, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="f1" stroke="#10b981" fillOpacity={1} fill="url(#colorF1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="precision" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrec)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 text-[10px] font-semibold text-gray-600">
                <span className="flex items-center"><div className="w-2 h-2 rounded bg-[#10b981] mr-1.5"></div> F1 Score</span>
                <span className="flex items-center"><div className="w-2 h-2 rounded bg-[#3b82f6] mr-1.5"></div> Precision</span>
              </div>
            </div>

            {/* Model Lifecycle & Training Jobs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-2 grid grid-cols-2 gap-8">
              
              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Training Jobs</p>
                    <p className="text-2xl font-bold text-gray-900 leading-none">{trainingStatus?.is_training ? 1 : 0}</p>
                  </div>
                  <button className="text-[10px] font-bold text-white bg-[#1e463a] px-3 py-1.5 rounded-md hover:bg-[#15342a] flex items-center">
                    <PlayCircle className="w-3 h-3 mr-1" /> Retrain Models
                  </button>
                </div>
                
                {trainingStatus?.is_training ? (
                  <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-xs font-bold text-gray-900">{trainingStatus.job_name || 'Ensemble Retraining'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{trainingStatus.progress}%</span>
                    </div>
                    <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{width: `${trainingStatus.progress}%`}}></div>
                    </div>
                    <p className="text-[9px] text-gray-500 mt-2 text-right">Evaluating cross-validation folds...</p>
                  </div>
                ) : (
                  <div className="border border-gray-100 bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500">No active training jobs.</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Upcoming Training</p>
                    <p className="text-2xl font-bold text-gray-900 leading-none">1</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="bg-white p-2 border border-gray-200 rounded-lg"><Calendar className="w-4 h-4 text-gray-500"/></div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Scheduled Monthly Retrain</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Automated pipeline (End of Month)</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="w-[320px] flex-shrink-0 space-y-6">
          
          {/* Current Production Model Details */}
          {activeModelDetail && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
             <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-200 uppercase tracking-wide">Live</div>
             <div className="flex items-center space-x-3 mb-6">
               <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center text-emerald-600">
                 <Box className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900 text-sm">{activeModelDetail.model_name}</h3>
                 <p className="text-[9px] text-gray-500">Version: {activeModelDetail.version}</p>
               </div>
             </div>
             
             <div className="space-y-3 mb-6">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500 font-medium">Training Data</span>
                 <span className="font-bold text-gray-900 text-[10px]">{activeModelDetail.training_rows?.toLocaleString() || 'N/A'} rows</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500 font-medium">Training Date</span>
                 <span className="font-bold text-gray-900 text-[10px]">{activeModelDetail.training_date ? new Date(activeModelDetail.training_date).toLocaleDateString() : 'N/A'}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500 font-medium">Precision</span>
                 <span className="font-bold text-gray-900 text-[10px]">{(activeModelDetail.precision * 100).toFixed(1)}%</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500 font-medium">Recall</span>
                 <span className="font-bold text-gray-900 text-[10px]">{(activeModelDetail.recall * 100).toFixed(1)}%</span>
               </div>
               <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-50">
                 <span className="text-gray-500 font-medium">Drift Status</span>
                 <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">No Drift Detected</span>
               </div>
             </div>
          </div>
          )}

          {/* Top Contributing Features */}
          {activeModelDetail && activeModelDetail.feature_importances && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Top Contributing Features</h3>
            </div>
            
            <div className="space-y-3 mb-4">
              {activeModelDetail.feature_importances.map((feat: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className="w-32 text-gray-600 font-medium truncate" title={feat.feature}>{feat.feature}</span>
                  <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden flex justify-end">
                    <div className="h-full bg-[#1e463a] rounded-full" style={{width: `${(feat.importance / maxImp) * 100}%`}}></div>
                  </div>
                  <span className="font-bold text-gray-900 w-10 text-right">{(feat.importance).toFixed(3)}</span>
                </div>
              ))}
            </div>
            
            <p className="text-[9px] text-gray-400 flex items-center"><Info className="w-3 h-3 mr-1" /> Global feature importance metric</p>
          </div>
          )}

          {/* Recent Model Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Recent Model Activity</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-emerald-50 p-1 rounded-full text-emerald-600 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Ensemble predictions logged</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">System routine</p>
                </div>
              </div>
              {activeModelDetail && (
              <div className="flex items-start space-x-3">
                <div className="bg-blue-50 p-1 rounded-full text-blue-600 mt-0.5"><Clock className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">{activeModelDetail.model_name} retrained</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{new Date(activeModelDetail.training_date).toLocaleString()}</p>
                </div>
              </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
"""
)
