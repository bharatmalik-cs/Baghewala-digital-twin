import React from 'react';
import { Flame, Activity, Zap, Layers, AlertTriangle, ShieldCheck, Palette } from 'lucide-react';

export const Header = ({ fieldSummary, currentTheme = 'cyberpunk', onSelectTheme, isConnected }) => {
  const totalOil = fieldSummary?.total_oil_bopd ?? '—';
  const totalSteam = fieldSummary?.total_steam_tpd ?? '—';
  const fieldCSOR = fieldSummary?.field_csor ?? '—';
  const totalPower = fieldSummary?.total_power_kw ?? '—';
  const hasAlert = fieldSummary?.wells?.some(w => w.anomaly !== 'NORMAL' && w.anomaly !== 'INJECTION_STANDBY');

  const themes = [
    { id: 'cyberpunk', name: 'Cyberpunk', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50' },
    { id: 'thermal', name: 'Thermal Lava', bg: 'bg-orange-600/30 text-orange-400 border-orange-500/50' },
    { id: 'emerald', name: 'Emerald Field', bg: 'bg-emerald-600/30 text-emerald-400 border-emerald-500/50' },
    { id: 'neon', name: 'Neon Violet', bg: 'bg-purple-600/30 text-purple-300 border-purple-500/50' }
  ];

  return (
    <header className="glass-panel gradient-border-box p-4 mb-6 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-cyan-500/30 border border-amber-400/50 rounded-2xl shadow-xl shadow-amber-500/20 glow-pulse">
            <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                BAGHEWALA DIGITAL TWIN
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/40 rounded-full shadow">
                Simulated twin · review required
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Cyclic Steam Stimulation (CSS) & Sucker Rod Pump (SRP) Optimization | Oil India Limited (OIL) Heavy Oil Field
            </p>
          </div>
        </div>

        {/* Live Field Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          {/* Total Crude Oil */}
          <div className="glow-card-amber p-3 flex items-center gap-3 rounded-xl">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 rounded-xl font-black shadow-lg shadow-amber-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-amber-300 uppercase tracking-wider font-bold">Field Oil Rate</div>
              <div className="text-xl font-black text-slate-100">{totalOil} <span className="text-xs text-amber-400 font-normal">BOPD</span></div>
            </div>
          </div>

          {/* Steam Rate */}
          <div className="glow-card-cyan p-3 flex items-center gap-3 rounded-xl">
            <div className="p-2.5 bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 rounded-xl font-black shadow-lg shadow-cyan-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-300 uppercase tracking-wider font-bold">Steam Inj. Rate</div>
              <div className="text-xl font-black text-slate-100">{totalSteam} <span className="text-xs text-cyan-400 font-normal">TPD</span></div>
            </div>
          </div>

          {/* Field cSOR */}
          <div className="glow-card-emerald p-3 flex items-center gap-3 rounded-xl">
            <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 rounded-xl font-black shadow-lg shadow-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">Field cSOR</div>
              <div className="text-xl font-black text-slate-100">{fieldCSOR} <span className="text-xs text-emerald-400 font-normal">bbl/bbl</span></div>
            </div>
          </div>

          {/* Total Power */}
          <div className="glow-card-purple p-3 flex items-center gap-3 rounded-xl">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 text-slate-950 rounded-xl font-black shadow-lg shadow-purple-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">Active Power</div>
              <div className="text-xl font-black text-slate-100">{totalPower} <span className="text-xs text-purple-400 font-normal">kW</span></div>
            </div>
          </div>
        </div>

        {/* Theme Switcher & Status Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Theme Selector Dropdown / Pill */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shadow-inner">
            <Palette className="w-4 h-4 text-amber-400 ml-1" />
            <div className="flex items-center gap-1">
              {themes.map((t) => {
                const isSelected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTheme(t.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? `${t.bg} border shadow-md scale-105`
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alert Status Badge */}
          {!isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-500/20 border border-slate-500/50 text-slate-300 rounded-xl text-xs font-bold">
              <Activity className="w-4 h-4" /><span>CONNECTING TO TWIN</span>
            </div>
          ) : hasAlert ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/20 border border-rose-500/50 text-rose-300 rounded-xl text-xs font-bold animate-pulse shadow-lg shadow-rose-500/20">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>ANOMALY ALERT</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>OPTIMAL STATE</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
