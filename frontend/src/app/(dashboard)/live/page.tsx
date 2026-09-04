'use client';

import { 
  Play, Pause, Square, Activity, FileText, ShieldAlert, AlertTriangle, 
  Database, ChevronRight, Settings 
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function LiveMonitor() {
  const [status, setStatus] = useState("Disconnected");
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState("Sequential");
  const [scenario, setScenario] = useState("");
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
      totalProcessed: 0,
      fraudDetected: 0,
      highRisk: 0,
      txSec: 0
  });
  
  const [riskData, setRiskData] = useState([
    { name: 'Low (0-29)', value: 0, color: '#10b981' },
    { name: 'Medium (30-59)', value: 0, color: '#f59e0b' },
    { name: 'High (60-79)', value: 0, color: '#f97316' },
    { name: 'Critical (80-100)', value: 0, color: '#ef4444' },
  ]);

  const [activityData, setActivityData] = useState<any[]>([]);
  
  const ws = useRef<WebSocket | null>(null);
  
  const autoScroll = useRef(true);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectWs();
    return () => {
        if (ws.current) ws.current.close();
    };
  }, []);

  const connectWs = () => {
    ws.current = new WebSocket('ws://localhost:8000/ws/live');
    
    ws.current.onopen = () => {
        setStatus("Connected");
    };
    
    ws.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "status") {
            setStatus(msg.data);
        } else if (msg.type === "transaction") {
            handleTransaction(msg.data);
        }
    };
    
    ws.current.onclose = () => {
        setStatus("Disconnected");
        setTimeout(connectWs, 3000); // Reconnect
    };
  };

  const handleTransaction = (data: any) => {
    const { transaction, prediction, detections, alert, is_critical } = data;
    
    // Add to list
    const newTx = {
      time: new Date(transaction.event_time).toLocaleTimeString(),
      id: transaction.transaction_id,
      card: transaction.card_id ? transaction.card_id.slice(-4) : '0000',
      amount: transaction.amount.toLocaleString(undefined, {minimumFractionDigits: 2}),
      merchant: transaction.merchant_category,
      loc: transaction.city ? `${transaction.city}, ${transaction.country}` : transaction.country,
      dev: transaction.device_type || 'Unknown',
      score: prediction.risk_score,
      level: prediction.risk_level,
      patterns: detections.length > 0 ? detections.map((d: any) => d.category).join(', ') : '-',
      isCritical: is_critical
    };
    
    setTransactions(prev => {
        const next = [...prev, newTx];
        if (next.length > 100) return next.slice(next.length - 100);
        return next;
    });

    if (alert) {
      setAlerts(prev => {
        const next = [{ ...alert, txId: transaction.transaction_id, amount: transaction.amount, loc: newTx.loc, time: newTx.time }, ...prev];
        if (next.length > 20) return next.slice(0, 20);
        return next;
      });
    }

    setMetrics(prev => ({
        ...prev,
        totalProcessed: prev.totalProcessed + 1,
        fraudDetected: prev.fraudDetected + (is_critical ? 1 : 0),
        highRisk: prev.highRisk + (prediction.risk_level === "HIGH" ? 1 : 0)
    }));

    setRiskData(prev => {
        const n = [...prev];
        if (prediction.risk_score < 30) n[0].value += 1;
        else if (prediction.risk_score < 60) n[1].value += 1;
        else if (prediction.risk_score < 80) n[2].value += 1;
        else n[3].value += 1;
        return n;
    });

    setActivityData(prev => {
        const t = new Date().toLocaleTimeString();
        if (prev.length === 0 || prev[prev.length - 1].time !== t) {
            const next = [...prev, { time: t, count: 1 }];
            if (next.length > 30) return next.slice(next.length - 30);
            return next;
        } else {
            const next = [...prev];
            next[next.length - 1].count += 1;
            return next;
        }
    });

    if (autoScroll.current && tableRef.current) {
        tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
         const acts = [...activityData];
         const now = new Date().getTime();
         const recents = acts.slice(-5).reduce((a,b) => a+b.count, 0); // Last 5 seconds approx
         return {...prev, txSec: recents / 5};
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activityData]);

  const sendCommand = (action: string, extras = {}) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ action, ...extras }));
      }
  };

  const handleStart = () => sendCommand("START");
  const handlePause = () => sendCommand("PAUSE");
  const handleStop = () => sendCommand("STOP");
  
  const handleSpeed = (s: number) => {
      setSpeed(s);
      sendCommand("SET_SPEED", { speed: s });
  };

  const handleMode = (m: string) => {
      setMode(m);
      sendCommand("SET_MODE", { mode: m, scenario });
  };

  const handleScenario = (s: string) => {
      setScenario(s);
      sendCommand("SET_MODE", { mode: "Scenario", scenario: s });
  };

  const totalRisk = riskData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Live Monitor</h1>
          <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold border border-emerald-100">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live
          </div>
        </div>
        <p className="text-gray-500 text-sm">Real-time transaction stream and fraud detection in action</p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-50 p-3 rounded-xl"><Activity className="w-6 h-6 text-emerald-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Transactions / sec</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold text-gray-900">{metrics.txSec.toFixed(1)}</h3>
              <span className="text-xs text-emerald-600 font-medium">Live rate</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-yellow-50 p-3 rounded-xl"><FileText className="w-6 h-6 text-yellow-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Transactions Today</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold text-gray-900">{metrics.totalProcessed.toLocaleString()}</h3>
              <span className="text-xs text-gray-500">Total processed</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-red-50 p-3 rounded-xl"><ShieldAlert className="w-6 h-6 text-red-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Fraud Detected</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold text-gray-900">{metrics.fraudDetected}</h3>
              <span className="text-xs text-red-500 font-medium">Today so far</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4 border-l-4 border-l-purple-500">
          <div className="bg-purple-50 p-3 rounded-xl"><AlertTriangle className="w-6 h-6 text-purple-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">High Risk</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold text-gray-900">{metrics.highRisk}</h3>
              <span className="text-xs text-purple-600 font-medium">Needs attention</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-xl"><Database className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Stream Status</p>
            <div className="flex items-baseline space-x-2">
              <h3 className={`text-xl font-bold ${status === 'Running' ? 'text-emerald-600' : 'text-orange-600'}`}>{status}</h3>
            </div>
            <span className="text-xs text-gray-500">Receiving live data</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Stream Section */}
        <div className="flex-1 space-y-6">
          
          {/* Controls */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex flex-col space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Stream Controls</span>
              <div className="flex space-x-2">
                <button onClick={handleStart} className="flex items-center space-x-1 px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-lg border border-emerald-200">
                  <Play className="w-4 h-4" /> <span>Start</span>
                </button>
                <button onClick={handlePause} className="flex items-center space-x-1 px-4 py-2 bg-orange-50 text-orange-700 font-semibold text-sm rounded-lg border border-orange-200">
                  <Pause className="w-4 h-4" /> <span>Pause</span>
                </button>
                <button onClick={handleStop} className="flex items-center space-x-1 px-4 py-2 bg-red-50 text-red-700 font-semibold text-sm rounded-lg border border-red-200">
                  <Square className="w-4 h-4" /> <span>Stop</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Stream Speed</span>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {[0.25, 0.5, 1, 2, 5, 10].map((s) => (
                  <button 
                    key={s}
                    onClick={() => handleSpeed(s)}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-md ${speed === s ? 'bg-[#1e463a] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Stream Mode</span>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={() => handleMode("Sequential")} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${mode === "Sequential" ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}>Sequential</button>
                <button onClick={() => handleMode("Random")} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${mode === "Random" ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}>Random</button>
                <button onClick={() => handleMode("Scenario")} className={`px-4 py-1.5 text-sm font-semibold flex items-center space-x-1 rounded-md ${mode === "Scenario" ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}>
                  <Settings className="w-3 h-3" /> <span>Scenario</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Scenario</span>
              <select 
                value={scenario}
                onChange={(e) => handleScenario(e.target.value)}
                disabled={mode !== 'Scenario'}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e463a]/20 w-48 disabled:opacity-50">
                <option value="">Select Scenario</option>
                <option value="Card Testing">Card Testing</option>
                <option value="Velocity Attack">Velocity Attack</option>
                <option value="Impossible Travel">Impossible Travel</option>
                <option value="New Device">New Device</option>
                <option value="High Value">High Value Anomaly</option>
              </select>
            </div>
          </div>

          {/* Stream Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Live Transaction Stream</h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 cursor-pointer">
                  <span>Auto scroll</span>
                  <input type="checkbox" className="hidden" checked={autoScroll.current} onChange={(e) => autoScroll.current = e.target.checked} />
                  <div className={`w-8 h-5 rounded-full relative transition-colors ${autoScroll.current ? 'bg-[#1e463a]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${autoScroll.current ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </label>
                <Link href="/analyze" className="text-sm font-semibold text-[#1e463a] flex items-center border border-gray-200 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <Activity className="w-4 h-4 mr-1" /> View Analytics
                </Link>
              </div>
            </div>
            
            <div className="overflow-auto flex-1" ref={tableRef}>
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                  <tr className="text-xs font-semibold text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Transaction ID</th>
                    <th className="px-4 py-3 font-medium">Card</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Merchant</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Device</th>
                    <th className="px-4 py-3 font-medium">Risk Score</th>
                    <th className="px-4 py-3 font-medium">Risk Level</th>
                    <th className="px-4 py-3 font-medium">Detected Patterns</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {transactions.map((txn, idx) => (
                    <tr key={idx} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${txn.isCritical ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{txn.time}</td>
                      <td className="px-4 py-3 text-[#1e463a] font-medium whitespace-nowrap underline cursor-pointer">
                        <Link href={`/transactions/${txn.id}`}>{txn.id}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap font-mono text-xs">**** **** **** {txn.card}</td>
                      <td className="px-4 py-3 text-gray-900 font-semibold whitespace-nowrap">₹{txn.amount}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{txn.merchant}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap flex items-center space-x-1">
                        <span className="text-base">{txn.loc.includes('India') ? '🇮🇳' : '🌐'}</span> <span>{txn.loc}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{txn.dev}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-bold ${txn.isCritical ? 'text-red-600' : txn.score > 50 ? 'text-orange-600' : txn.score > 30 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                          {txn.score}/100
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          txn.level === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                          txn.level === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          txn.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {txn.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-medium min-w-[200px]">{txn.patterns}</td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-gray-400 cursor-pointer" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-6 flex-shrink-0">
          
          {/* Live Alerts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-[300px] overflow-auto flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Live Alerts</h3>
              <Link href="/alerts" className="text-xs font-bold text-[#1e463a] hover:underline">View All</Link>
            </div>
            <div className="space-y-3 flex-1 overflow-auto pr-1">
              {alerts.length === 0 ? <p className="text-gray-400 text-sm text-center mt-4">No recent alerts</p> : 
               alerts.map((a, i) => (
                <div key={i} className={`border rounded-xl p-3 relative overflow-hidden ${
                    a.severity === 'CRITICAL' ? 'bg-red-50/50 border-red-100' : 'bg-orange-50/50 border-orange-100'
                }`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${a.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                  <div className="flex justify-between items-start mb-1">
                    <Link href={`/transactions/${a.txId}`} className="text-sm font-bold text-gray-900 hover:underline">{a.txId}</Link>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${a.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{a.severity}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">₹{a.amount.toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-gray-400 font-normal ml-1">{a.loc}</span></p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-gray-400">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Risk Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">Live Risk Distribution</h3>
            <div className="flex items-center justify-between h-32">
              <div className="w-1/2 h-full relative">
                {totalRisk === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">No data</div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                )}
              </div>
              <div className="w-1/2 space-y-2 text-xs">
                {riskData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-600 font-medium">{item.name.split(' ')[0]}</span>
                    </div>
                    <span className="font-bold text-gray-900">{totalRisk > 0 ? ((item.value / totalRisk) * 100).toFixed(1) : '0'}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stream Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-1">Stream Activity</h3>
            <p className="text-[10px] text-gray-500 mb-4">Live transactions</p>
            <div className="h-32 w-full">
              {activityData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">No data</div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAct)" />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
