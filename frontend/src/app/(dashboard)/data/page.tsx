'use client';

import { 
  Database, Server, Network, ShieldCheck, Star, ChevronDown, Calendar, 
  BarChart2, MoreVertical, CheckCircle2, Clock, Activity, HardDrive, Lock, 
  Settings, AlertTriangle, Upload, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const qualityTrends: any[] = [];

export default function DataCenter() {
  const [summary, setSummary] = useState<any>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [quality, setQuality] = useState<any>(null);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sumRes, dsRes, qualRes, plRes] = await Promise.all([
        fetch('/api/data/summary'),
        fetch('/api/data/datasets'),
        fetch('/api/data/quality'),
        fetch('/api/data/pipeline-status')
      ]);
      if (sumRes.ok) setSummary(await sumRes.json());
      if (dsRes.ok) setDatasets(await dsRes.json());
      if (qualRes.ok) setQuality(await qualRes.json());
      if (plRes.ok) setPipelines(await plRes.json());
    } catch (e) {
      console.error(e);
      setBackendError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    setUploadError(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/data/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok) setUploadResult(data);
      else setUploadError(data.detail || 'Upload failed');
    } catch (e: any) {
      setUploadError('Upload failed: ' + e.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getPipelineStatusStyle = (status: string) => {
    if (status === 'Running') return 'text-emerald-600 bg-emerald-50';
    if (status === 'Completed') return 'text-blue-600 bg-blue-50';
    if (status === 'Scheduled') return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-500 bg-gray-100'; // NOT CONFIGURED
  };

  const getPipelineIcon = (status: string) => {
    if (status === 'Running') return <Activity className="w-5 h-5" />;
    if (status === 'Completed') return <CheckCircle2 className="w-5 h-5" />;
    if (status === 'Scheduled') return <Clock className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const qualityIssues = quality ? [
    { label: 'Missing Values', val: quality.missing_values, color: 'text-orange-500' },
    { label: 'Duplicate IDs', val: quality.duplicate_ids, color: 'text-red-500' },
    { label: 'Invalid Timestamps', val: quality.invalid_timestamps, color: 'text-orange-500' },
    { label: 'Invalid Amounts', val: quality.invalid_amounts, color: 'text-red-500' },
    { label: 'Invalid Categorical', val: quality.invalid_categorical, color: 'text-orange-500' },
    { label: 'Unknown Fields', val: quality.unknown_fields, color: 'text-gray-400' },
  ] : [];

  if (!loading && backendError && !summary) {
    return <div className="p-8 text-center text-gray-500">Backend unavailable</div>;
  }

  const totalQualityIssues = qualityIssues.reduce((s, i) => s + i.val, 0);
  const qualityScore = summary?.total_transactions > 0
    ? Math.max(0, 100 - (totalQualityIssues / summary.total_transactions) * 100).toFixed(1)
    : "N/A";

  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Center</h1>
          <p className="text-gray-500 text-sm mt-1">Manage, monitor and secure all your data assets and system resources.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchAll} className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-gray-50">
            <RefreshCw className="w-3.5 h-3.5" /> <span>Refresh</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center space-x-2 bg-[#1e463a] text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-[#15342a] disabled:opacity-60">
            <Upload className="w-3.5 h-3.5" /> <span>{uploading ? 'Uploading...' : 'Upload Dataset'}</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
        </div>
      </div>

      {/* Upload Result Banner */}
      {uploadResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-800">✓ Upload validated: {uploadResult.filename}</p>
            <p className="text-xs text-emerald-700 mt-1">
              {uploadResult.total_rows.toLocaleString()} rows · {uploadResult.duplicates_found} duplicates found · {uploadResult.missing_values} missing values
            </p>
            <p className="text-[10px] text-emerald-600 mt-1">Columns: {uploadResult.columns.slice(0, 8).join(', ')}{uploadResult.columns.length > 8 ? ' ...' : ''}</p>
          </div>
          <button onClick={() => setUploadResult(null)} className="text-emerald-500 hover:text-emerald-800 text-xs font-bold">Dismiss</button>
        </div>
      )}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex justify-between items-center">
          <p className="text-sm font-bold text-red-700">{uploadError}</p>
          <button onClick={() => setUploadError(null)} className="text-red-500 text-xs font-bold">Dismiss</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><Database className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Transactions</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : (summary?.total_transactions || 0).toLocaleString()}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-orange-50 text-orange-500 p-3 rounded-xl"><Server className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Fraud Cases</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : (summary?.total_fraud || 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl"><Network className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Fraud Rate</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : (summary?.fraud_percentage || 0).toFixed(2)}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-500 p-3 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Unique Customers</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : (summary?.unique_customers || 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl"><Star className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Quality Score</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : qualityScore}%</h3>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Column */}
        <div className="flex-1 space-y-6">

          {/* Datasets Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Datasets</h3>
            {loading ? (
              <p className="text-sm text-gray-500 py-8 text-center">Loading...</p>
            ) : datasets.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No datasets found. Upload a CSV to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-semibold text-gray-500 border-b border-gray-100">
                      <th className="px-2 py-3">Dataset Name</th>
                      <th className="px-2 py-3">Source</th>
                      <th className="px-2 py-3">Records</th>
                      <th className="px-2 py-3">Size</th>
                      <th className="px-2 py-3">Last Updated</th>
                      <th className="px-2 py-3">Quality</th>
                      <th className="px-2 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {datasets.map((ds: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-2 py-4 font-bold text-gray-900">{ds.name}</td>
                        <td className="px-2 py-4 text-gray-600">{ds.source}</td>
                        <td className="px-2 py-4 font-medium text-gray-900">{typeof ds.records === 'number' ? ds.records.toLocaleString() : ds.records}</td>
                        <td className="px-2 py-4 text-gray-600">{ds.size}</td>
                        <td className="px-2 py-4 text-gray-500">{ds.updated}</td>
                        <td className="px-2 py-4 font-bold text-gray-900">{ds.quality_score}</td>
                        <td className="px-2 py-4">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{ds.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Data Pipeline Monitor */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Data Pipeline Monitor</h3>
            </div>
            
            <div className="grid grid-cols-5 gap-4 relative">
              <div className="absolute top-10 left-10 right-10 h-0.5 bg-gray-100 -z-10"></div>
              {pipelines.map((p: any, i: number) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between relative">
                  <div>
                    <p className="text-[10px] font-bold text-gray-900 leading-tight mb-2 h-6">{p.name}</p>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getPipelineStatusStyle(p.status)}`}>{p.status}</span>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <div className={`p-2 rounded-full ${getPipelineStatusStyle(p.status)}`}>
                      {getPipelineIcon(p.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Quality */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Data Quality Report</h3>
              {totalQualityIssues === 0 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">No Issues Detected</span>
              )}
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Calculating...</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {qualityIssues.map((q, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-500 mb-1">{q.label}</p>
                    <p className={`text-2xl font-bold ${q.val > 0 ? q.color : 'text-gray-900'}`}>{q.val}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div className="w-[320px] flex-shrink-0 space-y-6">

          {/* Summary Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Dataset Statistics</h3>
            <div className="space-y-3 text-xs">
              {[
                { label: 'Total Transactions', val: summary?.total_transactions?.toLocaleString() },
                { label: 'Fraud Transactions', val: summary?.total_fraud?.toLocaleString() },
                { label: 'Legitimate Transactions', val: summary?.total_legitimate?.toLocaleString() },
                { label: 'Fraud Rate', val: summary?.fraud_percentage?.toFixed(2) + '%' },
                { label: 'Unique Customers', val: summary?.unique_customers?.toLocaleString() },
                { label: 'Unique Cards', val: summary?.unique_cards?.toLocaleString() },
                { label: 'Unique Devices', val: summary?.unique_devices?.toLocaleString() },
                { label: 'Unique Merchants', val: summary?.unique_merchants?.toLocaleString() },
                { label: 'Feature Columns', val: summary?.unique_features },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-gray-500 font-medium">{row.label}</span>
                  <span className="font-bold text-gray-900">{loading ? '...' : row.val ?? 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Trend Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Quality Score Trend</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityTrends} margin={{top: 5, right: 0, left: -25, bottom: 0}}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} domain={[92, 98]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
