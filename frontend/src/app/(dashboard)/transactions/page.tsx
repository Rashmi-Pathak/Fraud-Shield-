'use client';

import { 
  Wallet, ShieldAlert, ShieldCheck, AlertTriangle, ArrowUpRight, 
  Search, Calendar, Filter, Download, X, Square, Eye, CheckSquare,
  ArrowRight, CreditCard, Clock, MapPin, IndianRupee, Globe
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Transactions() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 50, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState("All");
  
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [page, size, riskLevel]);

  const fetchData = async (currentSearch = search) => {
    setLoading(true);
    try {
      let url = `/api/transactions?page=${page}&size=${size}`;
      if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
      if (riskLevel !== 'All') url += `&risk_level=${encodeURIComponent(riskLevel.toUpperCase())}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        if (d.items.length > 0 && !selectedTx) {
            setSelectedTx(d.items[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: any) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchData(search);
    }
  };

  return (
    <div className="p-8 space-y-6 flex h-full">
      
      <div className="flex-1 min-w-0 pr-6 space-y-6 flex flex-col">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">View and analyze all transactions with advanced filtering and insights.</p>
        </div>

        {/* Filters and Table Container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1">
          
          {/* Main Filters Bar */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between space-x-4 bg-white">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by ID, customer, card... (Press Enter)" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e463a]/20" 
              />
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="w-4 h-4 text-[#1e463a]" /> <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Secondary Filters Row */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Risk Level</label>
                <div className="relative">
                  <select value={riskLevel} onChange={e => {setRiskLevel(e.target.value); setPage(1);}} className="w-full appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                    <option>All</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <svg className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1 h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-white sticky top-0 shadow-sm z-10">
                <tr className="text-[11px] font-semibold text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3"><Square className="w-4 h-4 text-gray-300" /></th>
                  <th className="px-4 py-3 font-medium">Transaction ID</th>
                  <th className="px-4 py-3 font-medium flex items-center space-x-1"><span>Date & Time</span></th>
                  <th className="px-4 py-3 font-medium">Card</th>
                  <th className="px-4 py-3 font-medium">Merchant</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-center">Risk Score</th>
                  <th className="px-4 py-3 font-medium text-center">Risk Level</th>
                  <th className="px-4 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {loading ? (
                    <tr><td colSpan={9} className="text-center py-8 text-gray-400">Loading...</td></tr>
                ) : data.items.map((row: any, i) => {
                  const p = row.prediction || { risk_score: 0, risk_level: 'Unknown' };
                  const isSel = selectedTx && selectedTx.transaction_id === row.transaction_id;
                  const dt = new Date(row.event_time);
                  
                  return (
                  <tr key={i} onClick={() => setSelectedTx(row)} className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${isSel ? 'bg-emerald-50/30' : ''}`}>
                    <td className="px-4 py-3.5">{isSel ? <CheckSquare className="w-4 h-4 text-[#1e463a]" /> : <Square className="w-4 h-4 text-gray-300" />}</td>
                    <td className="px-4 py-3.5"><Link href={`/transactions/${row.transaction_id}`} className="font-bold text-[#1e463a] hover:underline">{row.transaction_id}</Link></td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-900">{dt.toLocaleDateString()}</p>
                      <p className="text-[10px] text-gray-500">{dt.toLocaleTimeString()}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-gray-600">**** {row.card_id.slice(-4)}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-900">{row.merchant_category}</p>
                      <p className="text-[10px] text-gray-500">{row.city ? `${row.city}, ` : ''}{row.country}</p>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-gray-900 text-right">₹{row.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`font-bold ${p.risk_score >= 80 ? 'text-red-600' : p.risk_score >= 60 ? 'text-orange-500' : p.risk_score >= 30 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                        {p.risk_score}/100
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.risk_level === 'CRITICAL' ? 'text-red-600 bg-red-50 border border-red-100' :
                        p.risk_level === 'HIGH' ? 'text-orange-600 bg-orange-50 border border-orange-100' :
                        p.risk_level === 'MEDIUM' ? 'text-yellow-600 bg-yellow-50 border border-yellow-100' :
                        'text-emerald-600 bg-emerald-50 border border-emerald-100'
                      }`}>
                        {p.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link href={`/transactions/${row.transaction_id}`} className="p-1.5 border border-gray-200 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></Link>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
             <span>Showing {(page - 1) * size + 1} to {Math.min(page * size, data.total)} of {data.total} results</span>
             <div className="flex items-center space-x-4">
               <div className="flex space-x-1">
                 <button onClick={() => setPage(Math.max(1, page - 1))} className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 font-semibold text-gray-700">Prev</button>
                 <span className="px-3 py-1.5 font-bold">Page {page} of {data.pages}</span>
                 <button onClick={() => setPage(Math.min(data.pages, page + 1))} className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 font-semibold text-gray-700">Next</button>
               </div>
               <div className="relative">
                 <select value={size} onChange={e => {setSize(parseInt(e.target.value)); setPage(1);}} className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                   <option value="10">10 / page</option>
                   <option value="50">50 / page</option>
                   <option value="100">100 / page</option>
                 </select>
                 <svg className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Details Pane */}
      {selectedTx && (
      <div className="w-[320px] bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Transaction Details</h3>
          <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          <div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                (selectedTx.prediction?.risk_level || 'UNKNOWN') === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' :
                (selectedTx.prediction?.risk_level || 'UNKNOWN') === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                (selectedTx.prediction?.risk_level || 'UNKNOWN') === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
                {selectedTx.prediction?.risk_level || 'UNKNOWN'} Risk
            </span>
            <div className="flex items-center space-x-2 mt-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{selectedTx.transaction_id}</h2>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">{new Date(selectedTx.event_time).toLocaleString()}</p>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-5">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 mb-1">Amount</p>
              <p className="text-xl font-bold text-gray-900">₹{selectedTx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-gray-500 mb-1">Risk Score</p>
              <p className="text-xl font-bold text-red-600">{selectedTx.prediction?.risk_score || 0}<span className="text-sm font-medium text-gray-500">/100</span></p>
            </div>
          </div>

          <div className="space-y-4 text-xs border-b border-gray-100 pb-5">
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-semibold">Card Number</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900 font-mono">**** **** **** {selectedTx.card_id.slice(-4)}</span>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-semibold">Customer ID</span>
              <span className="font-bold text-gray-900">{selectedTx.customer_id}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-semibold">Merchant</span>
              <div className="text-right">
                <p className="font-bold text-gray-900">{selectedTx.merchant_category}</p>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-semibold">Transaction Type</span>
              <span className="font-bold text-gray-900">{selectedTx.transaction_type}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-semibold">Payment Channel</span>
              <span className="font-bold text-gray-900">{selectedTx.payment_channel}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-semibold">Device</span>
              <span className="font-bold text-gray-900">{selectedTx.device_id}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-semibold">Location</span>
              <span className="font-bold text-gray-900">{selectedTx.city ? `${selectedTx.city}, ` : ''}{selectedTx.country}</span>
            </div>
          </div>

          {selectedTx.prediction && selectedTx.prediction.recommended_action && (
          <div>
            <h4 className="font-bold text-gray-900 text-xs mb-3">Recommended Action</h4>
            <div className={`border rounded-lg p-4 flex items-start space-x-3 ${
                selectedTx.prediction.recommended_action === 'BLOCK' ? 'bg-red-50 border-red-100 text-red-700' :
                selectedTx.prediction.recommended_action === 'REVIEW' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}>
              <div className="p-1.5 rounded-md shrink-0"><ShieldAlert className="w-4 h-4"/></div>
              <div>
                <p className="text-xs font-bold">{selectedTx.prediction.recommended_action} TRANSACTION</p>
              </div>
            </div>
          </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <Link href={`/transactions/${selectedTx.transaction_id}`} className="w-full bg-[#1e463a] text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-[#15342a] transition-colors flex items-center justify-center">
            View Full Analysis <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      </div>
      )}

    </div>
  );
}
