import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Layers, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const AnalyticsReport = ({ fieldSummary }) => {
  const [exported, setExported] = useState(false);

  // Synthetic 12-cycle historical CSS production trend data
  const trendData = [
    { cycle: 'C1', oil: 85, steam: 350, csor: 4.1 },
    { cycle: 'C2', oil: 120, steam: 410, csor: 3.4 },
    { cycle: 'C3', oil: 165, steam: 480, csor: 2.9 },
    { cycle: 'C4', oil: 210, steam: 520, csor: 2.5 },
    { cycle: 'C5', oil: 280, steam: 680, csor: 2.4 },
    { cycle: 'C6', oil: 340, steam: 810, csor: 2.38 },
    { cycle: 'C7', oil: 412, steam: 920, csor: 2.23 }
  ];

  const handleExport = () => {
    const reportObj = {
      field: "Baghewala Heavy Oil Field (Oil India Limited)",
      timestamp: new Date().toISOString(),
      summary: fieldSummary,
      historical_trend: trendData
    };
    const blob = new Blob([JSON.stringify(reportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Baghewala_DigitalTwin_Report_${Date.now()}.json`;
    a.click();
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const wells = fieldSummary?.wells || [];

  return (
    <div className="glass-panel p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            FIELD HISTORICAL ANALYTICS & EXECUTIVE REPORT GENERATOR
          </h2>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{exported ? 'REPORT DOWNLOADED!' : 'EXPORT OIL FIELD REPORT'}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Area Chart */}
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex flex-col">
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> Cumulative Production vs Steam Injected
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="cycle" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
                <Area type="monotone" dataKey="oil" name="Oil BOPD" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOil)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Well Summary Table */}
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" /> Baghewala Well Pad Status Summary
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-1.5">Well ID</th>
                  <th className="pb-1.5">Phase</th>
                  <th className="pb-1.5">Oil (BOPD)</th>
                  <th className="pb-1.5">SPM</th>
                  <th className="pb-1.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {wells.map((w) => (
                  <tr key={w.well_id}>
                    <td className="py-1.5 font-bold">{w.well_id}</td>
                    <td className="py-1.5 font-mono text-[11px]">{w.phase}</td>
                    <td className="py-1.5 text-amber-400 font-bold">{w.oil_rate_bopd}</td>
                    <td className="py-1.5">{w.spm}</td>
                    <td className="py-1.5">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        w.anomaly === 'FLUID_POUND' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {w.anomaly}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
