import React from 'react';
import { MapPin, Flame, Server, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';

export const FieldMap = ({ activeWellId, onSelectWell, fieldSummary }) => {
  const wells = fieldSummary?.wells || [
    { well_id: 'BGW-01', well_name: 'Pad-A #01', phase: 'PRODUCTION', anomaly: 'NORMAL', oil_rate_bopd: 135.2, x: 28, y: 35 },
    { well_id: 'BGW-04', well_name: 'Pad-A #04', phase: 'PRODUCTION', anomaly: 'FLUID_POUND', oil_rate_bopd: 82.5, x: 38, y: 48 },
    { well_id: 'BGW-07', well_name: 'Pad-B #07', phase: 'INJECTION', anomaly: 'NORMAL', oil_rate_bopd: 0.0, x: 68, y: 32 },
    { well_id: 'BGW-12', well_name: 'Pad-C #12', phase: 'PRODUCTION', anomaly: 'VISCOUS_DRAG', oil_rate_bopd: 110.0, x: 75, y: 70 }
  ];

  // Plant coordinates
  const plantX = 52;
  const plantY = 52;

  return (
    <div className="glass-panel p-4 flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            BAGHEWALA FIELD SPATIAL GIS NETWORK MAP (BIKANER-NAGAUR BASIN)
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">28.02° N, 72.15° E</span>
      </div>

      {/* Spatial GIS Map Box */}
      <div className="relative flex-1 min-h-[320px] bg-slate-950/90 rounded-lg border border-slate-800 overflow-hidden">
        {/* Topography grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

        {/* Surface Trunk Pipelines connecting Wells to Central Facility */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {wells.map((w) => {
            const isInj = w.phase === 'INJECTION';
            return (
              <line
                key={w.well_id}
                x1={`${w.x}%`}
                y1={`${w.y}%`}
                x2={`${plantX}%`}
                y2={`${plantY}%`}
                stroke={isInj ? '#06b6d4' : '#f59e0b'}
                strokeWidth={2}
                strokeDasharray={isInj ? '6 4' : 'none'}
                className="opacity-75"
              />
            );
          })}
        </svg>

        {/* Central Steam Boiler Plant & Gathering Station */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center cursor-pointer"
          style={{ left: `${plantX}%`, top: `${plantY}%` }}
        >
          <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl border border-cyan-400/50 shadow-xl shadow-cyan-500/20 glow-pulse">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div className="bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold text-cyan-300 mt-1 shadow">
            Central Gathering & Steam Plant
          </div>
        </div>

        {/* Well Node Markers */}
        {wells.map((w) => {
          const isSelected = w.well_id === activeWellId;
          const isFluidPound = w.anomaly === 'FLUID_POUND';
          const isInj = w.phase === 'INJECTION';

          return (
            <div
              key={w.well_id}
              onClick={() => onSelectWell(w.well_id)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              style={{ left: `${w.x}%`, top: `${w.y}%` }}
            >
              <div
                className={`p-2 rounded-full border transition-all duration-300 flex items-center justify-center ${
                  isSelected
                    ? 'scale-125 bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/30'
                    : isFluidPound
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse'
                    : isInj
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400'
                }`}
              >
                {isInj ? (
                  <Flame className="w-4 h-4 text-cyan-400" />
                ) : isFluidPound ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
              </div>

              {/* Hover label */}
              <div className="bg-slate-900/95 border border-slate-700 px-2.5 py-1 rounded-lg shadow-xl text-left mt-1 text-[11px] min-w-[110px] group-hover:scale-105 transition-all">
                <div className="font-bold text-slate-100 flex items-center justify-between">
                  <span>{w.well_id}</span>
                  <span className="text-[9px] text-slate-400">{w.phase}</span>
                </div>
                <div className="text-[10px] text-amber-400 font-mono">
                  {isInj ? '115 TPD Steam' : `${w.oil_rate_bopd || 120} BOPD`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
