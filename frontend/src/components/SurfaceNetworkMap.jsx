import React from 'react';
import { Sliders, Gauge, ArrowRight, Server, Layers } from 'lucide-react';

export const SurfaceNetworkMap = ({ telemetry, onUpdateChoke }) => {
  const hydraulics = telemetry?.hydraulics || {};
  const chokePct = telemetry?.choke_pct ?? 75.0;

  const pip = hydraulics.pump_intake_pressure_bar ?? 32.5;
  const whp = hydraulics.wellhead_pressure_bar ?? 14.8;
  const chokeDp = hydraulics.choke_dp_bar ?? 2.1;
  const postChokeP = hydraulics.post_choke_pressure_bar ?? 12.7;
  const flowlineDp = hydraulics.flowline_dp_bar ?? 4.2;
  const separatorP = hydraulics.separator_pressure_bar ?? 8.5;
  const reynolds = hydraulics.reynolds_number ?? 450.0;

  return (
    <div className="glass-panel p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            WELL-TO-SURFACE FLOWLINE HYDRAULIC NETWORK
          </h2>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Flow Regime: {reynolds < 2100 ? 'Laminar Heavy Oil Flow' : 'Turbulent Multiphase Flow'}
        </div>
      </div>

      {/* Network Nodes Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-auto py-2">
        {/* Node 1: Pump Intake (PIP) */}
        <div className="glass-card p-3 border-l-4 border-l-cyan-500 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold">1. Pump Intake</span>
            <span className="p-1 bg-cyan-500/20 text-cyan-400 rounded"><Layers className="w-3.5 h-3.5" /></span>
          </div>
          <div className="text-lg font-bold text-slate-100">{pip} <span className="text-xs text-cyan-400 font-normal">bar</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Depth: 1050m</div>
          <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
            <ArrowRight className="w-5 h-5 text-slate-500 animate-pulse" />
          </div>
        </div>

        {/* Node 2: Wellhead Tree (WHP) */}
        <div className="glass-card p-3 border-l-4 border-l-amber-500 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold">2. Wellhead (WHP)</span>
            <span className="p-1 bg-amber-500/20 text-amber-400 rounded"><Gauge className="w-3.5 h-3.5" /></span>
          </div>
          <div className="text-lg font-bold text-slate-100">{whp} <span className="text-xs text-amber-400 font-normal">bar</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Surface Tree</div>
          <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
            <ArrowRight className="w-5 h-5 text-slate-500 animate-pulse" />
          </div>
        </div>

        {/* Node 3: Choke Valve */}
        <div className="glass-card p-3 border-l-4 border-l-purple-500 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold">3. Surface Choke</span>
            <span className="p-1 bg-purple-500/20 text-purple-400 rounded"><Sliders className="w-3.5 h-3.5" /></span>
          </div>
          <div className="text-lg font-bold text-slate-100">{postChokeP} <span className="text-xs text-purple-400 font-normal">bar</span></div>
          <div className="text-[10px] text-slate-400 mt-1">ΔP Choke: -{chokeDp} bar</div>
          <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
            <ArrowRight className="w-5 h-5 text-slate-500 animate-pulse" />
          </div>
        </div>

        {/* Node 4: Baghewala Field Separator */}
        <div className="glass-card p-3 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold">4. Central Separator</span>
            <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded"><Server className="w-3.5 h-3.5" /></span>
          </div>
          <div className="text-lg font-bold text-slate-100">{separatorP} <span className="text-xs text-emerald-400 font-normal">bar</span></div>
          <div className="text-[10px] text-slate-400 mt-1">2.4 km Pipeline (ΔP -{flowlineDp} bar)</div>
        </div>
      </div>

      {/* Interactive Choke Slider */}
      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-300">Surface Choke Valve Aperture Control</span>
          <span className="text-purple-400 font-bold">{chokePct}% Open</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={chokePct}
          onChange={(e) => onUpdateChoke(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>
    </div>
  );
};
