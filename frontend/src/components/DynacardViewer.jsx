import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DynacardViewer = ({ telemetry, onFixAnomaly }) => {
  const surfaceCard = telemetry?.srp_physics?.surface_card || [];
  const downholeCard = telemetry?.srp_physics?.downhole_card || [];
  const peakLoad = telemetry?.srp_physics?.peak_load_lb ?? 14200.0;
  const minLoad = telemetry?.srp_physics?.min_load_lb ?? 3100.0;
  const peakTorque = telemetry?.srp_physics?.peak_torque_k_in_lb ?? 185.4;
  const fillage = telemetry?.srp_physics?.pump_fillage_pct ?? 88.0;
  const anomaly = telemetry?.srp_physics?.anomaly_detected ?? 'NORMAL';
  const confidence = telemetry?.srp_physics?.confidence_pct ?? 98.5;

  const isAnomaly = anomaly !== 'NORMAL' && anomaly !== 'INJECTION_STANDBY';
  const anomalyLabel = String(anomaly || 'NORMAL').replace(/_/g, ' ');

  return (
    <div className="glass-panel p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            REAL-TIME DYNAMOMETER CARDS (DYNACARD)
          </h2>
        </div>
        {/* Diagnostic Anomaly Badge */}
        <div className="flex items-center gap-2">
          {isAnomaly ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/20 border border-rose-500/50 rounded-lg text-rose-300 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>{anomalyLabel} ({confidence}%)</span>
              <button
                onClick={onFixAnomaly}
                className="ml-2 px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] rounded uppercase font-bold transition-all cursor-pointer"
              >
                Auto-Fix
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NORMAL FILLAGE ({confidence}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Metric summary bar */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="glass-card p-2 text-center">
          <div className="text-[10px] text-slate-400 uppercase">Peak Load</div>
          <div className="text-sm font-bold text-slate-100">{(peakLoad || 0).toLocaleString()} <span className="text-[10px] text-slate-400">lbs</span></div>
        </div>
        <div className="glass-card p-2 text-center">
          <div className="text-[10px] text-slate-400 uppercase">Min Load</div>
          <div className="text-sm font-bold text-slate-100">{(minLoad || 0).toLocaleString()} <span className="text-[10px] text-slate-400">lbs</span></div>
        </div>
        <div className="glass-card p-2 text-center">
          <div className="text-[10px] text-slate-400 uppercase">Gearbox Torque</div>
          <div className="text-sm font-bold text-amber-400">{peakTorque} <span className="text-[10px] text-slate-400">k-in-lb</span></div>
        </div>
        <div className="glass-card p-2 text-center">
          <div className="text-[10px] text-slate-400 uppercase">Pump Fillage</div>
          <div className={`text-sm font-bold ${fillage < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {fillage}%
          </div>
        </div>
      </div>

      {/* Dynamic Recharts Plot */}
      <div className="flex-1 min-h-[260px] bg-slate-950/70 p-2 rounded-lg border border-slate-800">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <XAxis
              type="number"
              dataKey="position_in"
              name="Position"
              unit=" in"
              stroke="#64748b"
              fontSize={11}
              domain={[0, 'auto']}
            />
            <YAxis
              type="number"
              dataKey="load_lb"
              name="Load"
              unit=" lbs"
              stroke="#64748b"
              fontSize={11}
              domain={['auto', 'auto']}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            {/* Surface Dynacard Line */}
            <Scatter
              name="Surface Polished Rod Card"
              data={surfaceCard}
              fill="#f59e0b"
              line={{ stroke: '#f59e0b', strokeWidth: 2 }}
            />
            {/* Solved Downhole Pump Card */}
            <Scatter
              name="Solved Downhole Pump Card (1D Wave Eq)"
              data={downholeCard}
              fill="#06b6d4"
              line={{ stroke: '#06b6d4', strokeWidth: 2, strokeDasharray: '4 4' }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
