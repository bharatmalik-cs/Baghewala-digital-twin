import React from 'react';
import { AlertCircle, Flame, CheckCircle2 } from 'lucide-react';

export const WellSelector = ({ activeWellId, onSelectWell, fieldSummary }) => {
  const wells = fieldSummary?.wells || [];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider pr-2 border-r border-slate-700">
        Baghewala Wells:
      </span>
      {!wells.length && <span className="text-xs text-slate-500">Loading field inventory…</span>}
      {wells.map((well) => {
        const isActive = well.well_id === activeWellId;
        const isFluidPound = well.anomaly === 'FLUID_POUND';
        const isInjection = well.phase === 'INJECTION';

        return (
          <button
            key={well.well_id}
            onClick={() => onSelectWell(well.well_id)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/80 text-amber-200 shadow-lg shadow-amber-500/10'
                : 'glass-card text-slate-300 hover:bg-slate-800/80 hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span>{well.well_id}</span>
                {isInjection ? (
                  <span className="p-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                    <Flame className="w-3.5 h-3.5" />
                  </span>
                ) : isFluidPound ? (
                  <span className="p-0.5 bg-rose-500/20 text-rose-400 rounded animate-bounce">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="p-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {isInjection ? 'CSS Injection' : `${well.oil_rate_bopd || 0} BOPD`}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
