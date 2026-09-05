import React, { useState } from 'react';
import { Cpu, TrendingUp, CheckCircle, Sliders, DollarSign, Sparkles, ShieldAlert, ClipboardCheck } from 'lucide-react';

export const OptimizationPanel = ({ telemetry, onUpdateSPM, onEvaluateOptimization, onAcceptOptimization }) => {
  const [crudePrice, setCrudePrice] = useState(75);
  const [steamCost, setSteamCost] = useState(18);
  const [powerCost, setPowerCost] = useState(0.12);

  const optimization = telemetry?.optimization || {};
  const currentProfit = optimization.current_daily_profit_usd;
  const optProfit = optimization.optimized_daily_profit_usd;
  const potentialGain = optimization.potential_gain_usd_day;
  const gainPct = optimization.gain_percentage;
  const recs = optimization.recommendations || [];

  const currentSPM = telemetry?.spm ?? 6.0;

  return (
    <div className="glass-panel p-4 flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-spin-slow" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            AI PRESCRIPTIVE OPTIMIZER & WHAT-IF CONTROL ROOM
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEvaluateOptimization({ crude_price_usd_bbl: crudePrice, steam_cost_usd_ton: steamCost, electricity_cost_usd_kwh: powerCost })}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            <span>EVALUATE SCENARIO</span>
          </button>
        </div>
      </div>

      {/* Financial uplift banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="glass-card p-3 border-l-4 border-l-amber-500">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Net Daily Margin</div>
          <div className="text-lg font-bold text-slate-100">{currentProfit == null ? '—' : `$${currentProfit.toLocaleString()}`} <span className="text-xs text-slate-400">/ day</span></div>
        </div>

        <div className="glass-card p-3 border-l-4 border-l-emerald-500">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Optimized Daily Margin</div>
          <div className="text-lg font-bold text-emerald-400">{optProfit == null ? '—' : `$${optProfit.toLocaleString()}`} <span className="text-xs text-emerald-500">/ day</span></div>
        </div>

        <div className="glass-card p-3 border-l-4 border-l-cyan-500 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Net Value Uplift</div>
            <div className="text-lg font-bold text-cyan-300">{potentialGain == null ? '—' : `$${potentialGain.toLocaleString()}`} <span className="text-xs text-cyan-400">/ day</span></div>
          </div>
          <div className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded font-bold text-xs">
            {gainPct == null ? '—' : `${gainPct >= 0 ? '+' : ''}${gainPct}%`}
          </div>
        </div>
      </div>

      {/* AI Prescriptive Recommendations List */}
      <div className="mb-4 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Prescriptive Action Plan:
        </div>
        <ul className="space-y-1.5">
          {(recs || []).map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px]">
          <span className="text-slate-400"><ShieldAlert className="inline w-3 h-3 mr-1 text-amber-400" />{optimization.method || 'Waiting for model evaluation'}</span>
          {optimization.decision_status === 'REVIEW_REQUIRED' && (
            <button onClick={onAcceptOptimization} className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
              <ClipboardCheck className="w-3 h-3" /> ACCEPT AFTER REVIEW
            </button>
          )}
        </div>
      </div>

      {/* Interactive Controls & Economics Sandbox */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real-time SPM Speed Slider */}
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" /> Live SRP Speed (SPM)
            </span>
            <span className="text-amber-400 font-bold">{currentSPM} SPM</span>
          </div>
          <input
            type="range"
            min="2.0"
            max="11.0"
            step="0.2"
            value={currentSPM}
            onChange={(e) => onUpdateSPM(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>2.0 SPM (Min Stress)</span>
            <span>6.5 SPM (Normal)</span>
            <span>11.0 SPM (Max Stroke)</span>
          </div>
        </div>

        {/* Economic Parameter Sandbox Inputs */}
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col justify-between gap-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Market Economics Sandbox
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Crude ($/bbl)</label>
              <input
                type="number"
                value={crudePrice}
                onChange={(e) => setCrudePrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Steam ($/ton)</label>
              <input
                type="number"
                value={steamCost}
                onChange={(e) => setSteamCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Power ($/kWh)</label>
              <input
                type="number"
                step="0.01"
                value={powerCost}
                onChange={(e) => setPowerCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
