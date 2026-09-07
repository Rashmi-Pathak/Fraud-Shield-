'use client';

import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Database, Server, Wifi } from 'lucide-react';

type Health = {
  status: string;
  checked_at: string;
  components: Record<string, { status: string; detail?: string; latency_ms?: number | null }>;
  performance: Record<string, number | null>;
  models: Array<{ name: string; status: string; load_latency_ms?: number | null; error?: string }>;
  database_details: { status: string; query_latency_ms?: number; system_events_count?: number };
  live_stream: { status: string; transactions_processed: number; current_speed?: number; current_mode?: string; throughput_per_second?: number };
  recent_events: Array<{ event_type: string; message: string; severity: string; timestamp?: string }>;
};

const labels: Record<string, string> = {
  fastapi: 'FastAPI',
  sqlite: 'SQLite',
  ml_models: 'ML Models',
  feature_engine: 'Feature Engine',
  rule_engine: 'Rule Engine',
  websocket: 'WebSocket',
  stream_simulator: 'Stream Simulator',
};

export default function SystemHealth() {
  const [health, setHealth] = useState<Health | null>(null);
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  useEffect(() => {
    const load = () => fetch('/api/system/health').then((response) => response.ok ? response.json() : Promise.reject()).then((data) => { setHealth(data); setBackendUnavailable(false); }).catch(() => setBackendUnavailable(true));
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const value = (metric: string, suffix = '') => health?.performance?.[metric] == null ? 'N/A' : `${health.performance[metric]}${suffix}`;
  const statusClass = (status?: string) => status === 'OPERATIONAL' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-orange-600 bg-orange-50 border-orange-100';

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
        <p className="text-gray-500 text-sm mt-1">Live status for the local FastAPI, SQLite, ML, rules, and streaming services.</p>
      </div>
      {backendUnavailable && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">Backend unavailable</div>}
      {health?.components.sqlite?.status === 'ERROR' && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">Database unavailable</div>}
      {health?.components.ml_models?.status === 'ERROR' && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">ML service unavailable</div>}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><CheckCircle2 className="w-5 h-5 text-emerald-600 mb-3" /><p className="text-xs text-gray-500">Overall Status</p><p className="text-2xl font-bold text-gray-900">{health?.status || 'N/A'}</p></div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><Activity className="w-5 h-5 text-blue-600 mb-3" /><p className="text-xs text-gray-500">API Response</p><p className="text-2xl font-bold text-gray-900">{value('api_response_time_ms', ' ms')}</p></div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><Database className="w-5 h-5 text-indigo-600 mb-3" /><p className="text-xs text-gray-500">Database Latency</p><p className="text-2xl font-bold text-gray-900">{value('database_latency_ms', ' ms')}</p></div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><Server className="w-5 h-5 text-orange-600 mb-3" /><p className="text-xs text-gray-500">CPU Usage</p><p className="text-2xl font-bold text-gray-900">{value('cpu_percent', '%')}</p></div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Components</h3>
          <div className="space-y-3">
            {Object.entries(labels).map(([key, label]) => {
              const component = health?.components[key];
              return <div key={key} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-gray-700"><Wifi className="w-4 h-4 text-blue-500" />{label}</span><span className={`text-[10px] font-bold px-2 py-1 rounded border ${statusClass(component?.status)}`}>{component?.status || 'NOT_CONFIGURED'}</span></div>;
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Live Stream</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500">State</p><p className="font-bold text-gray-900">{health?.live_stream.status || 'N/A'}</p></div>
            <div><p className="text-gray-500">Processed</p><p className="font-bold text-gray-900">{health?.live_stream.transactions_processed ?? 'N/A'}</p></div>
            <div><p className="text-gray-500">Speed</p><p className="font-bold text-gray-900">{health?.live_stream.current_speed ?? 'N/A'}</p></div>
            <div><p className="text-gray-500">Throughput</p><p className="font-bold text-gray-900">{health?.live_stream.throughput_per_second == null ? 'N/A' : `${health.live_stream.throughput_per_second.toFixed(2)} tx/s`}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Model Artifacts</h3>
        <div className="grid grid-cols-2 gap-3">
          {(health?.models || []).map((model) => <div key={model.name} className="flex items-center justify-between border-b border-gray-50 py-2 text-sm"><span>{model.name}</span><span className={`text-[10px] font-bold px-2 py-1 rounded border ${statusClass(model.status)}`}>{model.status}</span></div>)}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Recent System Events</h3>
        {(health?.recent_events || []).length === 0 ? <p className="text-sm text-gray-500">No recorded events.</p> : <div className="space-y-3">{health?.recent_events.map((event, index) => <div key={`${event.event_type}-${index}`} className="flex justify-between border-b border-gray-50 pb-2 text-sm"><span><strong>{event.event_type}</strong> {event.message}</span><span className="text-gray-500">{event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}</span></div>)}</div>}
      </div>
    </div>
  );
}
