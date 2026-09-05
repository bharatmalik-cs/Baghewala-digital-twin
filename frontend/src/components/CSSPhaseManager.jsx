import React from 'react';
import { Flame, Layers, Thermometer, Clock, ArrowRight } from 'lucide-react';

export const CSSPhaseManager = ({ telemetry, onUpdatePhase }) => {
  const phase = telemetry?.phase ?? 'PRODUCTION';
  const daysInPhase = telemetry?.days_in_phase ?? 14.2;
  const tempC = telemetry?.css_physics?.reservoir_temp_c ?? 145.0;
  const viscosityCp = telemetry?.css_physics?.oil_viscosity_cp ?? 45.0;
  const heatedRadius = telemetry?.css_physics?.heated_radius_m ?? 14.5;
  const isor = telemetry?.css_physics?.isor ?? 2.8;
  const csor = telemetry?.css_physics?.csor ?? 3.4;

  const phases = ['INJECTION', 'SOAKING', 'PRODUCTION'];

  return (
    <div className="glass-panel p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            CYCLIC STEAM STIMULATION (CSS) THERMAL MANAGER
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>Day {daysInPhase} in {phase}</span>
        </div>
      </div>

      {/* Phase timeline tabs */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {phases.map((p, idx) => {
          const isCurrent = p === phase;
          return (
            <button
              key={p}
              onClick={() => onUpdatePhase(p)}
              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                isCurrent
                  ? 'bg-gradient-to-b from-amber-500/30 to-orange-600/30 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1 font-bold text-xs">
                <span>Phase {idx + 1}: {p}</span>
              </div>
              <div className="text-[10px] opacity-80">
                {p === 'INJECTION' ? 'High-P Steam' : p === 'SOAKING' ? 'Heat Diffusion' : 'Heavy Crude Flow'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Thermal & Fluid Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Reservoir Temp */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
            <Thermometer className="w-4 h-4 text-rose-400" /> Reservoir Temp
          </div>
          <div className="text-xl font-bold text-slate-100">{tempC} <span className="text-xs text-rose-400">°C</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Base: 45°C | Steam: 240°C</div>
        </div>

        {/* Heavy Oil Viscosity */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
            <Flame className="w-4 h-4 text-amber-400" /> Crude Viscosity
          </div>
          <div className="text-xl font-bold text-slate-100">{viscosityCp} <span className="text-xs text-amber-400">cP</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Initial Dead Oil: 3500 cP</div>
        </div>

        {/* Heated Radius */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
            <Layers className="w-4 h-4 text-cyan-400" /> Heated Radius (r_h)
          </div>
          <div className="text-xl font-bold text-slate-100">{heatedRadius} <span className="text-xs text-cyan-400">m</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Marx-Langenheim Model</div>
        </div>

        {/* SOR Metrics */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
            <Layers className="w-4 h-4 text-emerald-400" /> SOR (iSOR / cSOR)
          </div>
          <div className="text-xl font-bold text-slate-100">{isor} / {csor}</div>
          <div className="text-[10px] text-slate-400 mt-1">bbl Steam / bbl Oil</div>
        </div>
      </div>

      {/* Thermal plume visual bar */}
      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-300">Baghewala Pay Zone Heat Dissipation (18m Thickness)</span>
          <span className="text-amber-400 font-bold">{Math.round((heatedRadius / 25.0) * 100)}% Max Radius</span>
        </div>
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (heatedRadius / 25.0) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
