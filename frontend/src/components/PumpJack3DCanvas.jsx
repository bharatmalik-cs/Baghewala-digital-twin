import React, { useEffect, useRef } from 'react';
import { Activity, Gauge, Flame, Cpu } from 'lucide-react';

export const PumpJack3DCanvas = ({ telemetry }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const spm = telemetry?.spm ?? 6.0;
  const phase = telemetry?.phase ?? 'PRODUCTION';
  const heatedRadius = telemetry?.css_physics?.heated_radius_m ?? 14.5;
  const tempC = telemetry?.css_physics?.reservoir_temp_c ?? 145.0;
  const viscosityCp = telemetry?.css_physics?.oil_viscosity_cp ?? 45.0;
  const isInjection = phase === 'INJECTION';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;
    let lastTime = performance.now();

    const render = (now) => {
      const dt = (now - lastTime) / 1000.0;
      lastTime = now;

      // Angular velocity from SPM
      const omega = (spm * 2.0 * Math.PI) / 60.0;
      if (!isInjection) {
        angle = (angle + omega * dt) % (2 * Math.PI);
      } else {
        angle = 0; // Stationary beam during steam injection
      }

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Ground Line
      const groundY = h * 0.40;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // -------------------------------------------------------------
      // 1. DOWNHOLE RESERVOIR & WELLBORE (Bottom Section)
      // -------------------------------------------------------------
      const wellheadX = w * 0.72;

      // Reservoir Layer Fill (Jodhpur Sandstone Rock Matrix)
      const resTopY = h * 0.65;
      const resBottomY = h;
      const resGrad = ctx.createLinearGradient(0, resTopY, 0, resBottomY);
      resGrad.addColorStop(0, '#1e1b4b');
      resGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = resGrad;
      ctx.fillRect(0, resTopY, w, resBottomY - resTopY);

      // Thermal Plume Glow in Reservoir Matrix
      const plumeX = wellheadX;
      const plumeY = (resTopY + resBottomY) / 2;
      const maxPlumeR = Math.min(180, heatedRadius * 7.5);

      const plumeGrad = ctx.createRadialGradient(plumeX, plumeY, 5, plumeX, plumeY, maxPlumeR);
      if (isInjection) {
        plumeGrad.addColorStop(0, 'rgba(6, 182, 212, 0.85)'); // Steam cyan injection core
        plumeGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.5)');
        plumeGrad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
      } else {
        plumeGrad.addColorStop(0, 'rgba(245, 158, 11, 0.8)'); // Heated amber oil plume
        plumeGrad.addColorStop(0.6, 'rgba(225, 29, 72, 0.3)');
        plumeGrad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
      }
      ctx.fillStyle = plumeGrad;
      ctx.beginPath();
      ctx.arc(plumeX, plumeY, maxPlumeR, 0, Math.PI * 2);
      ctx.fill();

      // Casing Outer Boundary
      const tubingW = 24;
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.fillRect(wellheadX - tubingW / 2 - 8, groundY, tubingW + 16, h - groundY);
      ctx.strokeRect(wellheadX - tubingW / 2 - 8, groundY, tubingW + 16, h - groundY);

      // Production Tubing Inner Pipe
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(wellheadX - tubingW / 2, groundY, tubingW, h - groundY);
      ctx.strokeRect(wellheadX - tubingW / 2, groundY, tubingW, h - groundY);

      // Sucker Rod Stroke Motion Calculations
      const strokeAmplitude = 26; // Canvas pixels stroke length
      const rodOffset = isInjection ? 0 : Math.sin(angle) * strokeAmplitude;
      const rodTopY = groundY - 30 + rodOffset;
      const rodBottomY = h * 0.85 + rodOffset;

      // Sucker Rod Line
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(wellheadX, rodTopY);
      ctx.lineTo(wellheadX, rodBottomY);
      ctx.stroke();

      // Downhole Pump Barrel & Plunger Valve
      const pumpY = h * 0.85 + rodOffset;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(wellheadX - 8, pumpY - 12, 16, 24);

      // Travelling Ball Valve (Open on downstroke, closed on upstroke)
      const isUpstroke = !isInjection && Math.cos(angle) < 0;
      ctx.fillStyle = isUpstroke ? '#ef4444' : '#10b981';
      ctx.beginPath();
      ctx.arc(wellheadX, pumpY + (isUpstroke ? -3 : 4), 4, 0, Math.PI * 2);
      ctx.fill();

      // -------------------------------------------------------------
      // 2. SURFACE PUMP JACK UNIT (Top Left Section)
      // -------------------------------------------------------------
      const samsonX = w * 0.38;
      const samsonTopY = groundY - 110;

      // Samson Post (A-Frame Support)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(samsonX, samsonTopY);
      ctx.lineTo(samsonX - 50, groundY);
      ctx.moveTo(samsonX, samsonTopY);
      ctx.lineTo(samsonX + 50, groundY);
      ctx.stroke();

      // Walking Beam Pivot Angle
      const beamAngle = isInjection ? 0 : Math.sin(angle) * 0.22;
      const beamLength = 160;

      const rearBeamX = samsonX - Math.cos(beamAngle) * (beamLength * 0.6);
      const rearBeamY = samsonTopY + Math.sin(beamAngle) * (beamLength * 0.6);
      const frontBeamX = samsonX + Math.cos(beamAngle) * (beamLength * 0.75);
      const frontBeamY = samsonTopY - Math.sin(beamAngle) * (beamLength * 0.75);

      // Walking Beam Body
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(rearBeamX, rearBeamY);
      ctx.lineTo(frontBeamX, frontBeamY);
      ctx.stroke();

      // Horsehead Curved Arc at Front
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(frontBeamX, frontBeamY, 28, -Math.PI / 2, Math.PI / 3);
      ctx.lineTo(frontBeamX, frontBeamY);
      ctx.fill();

      // Bridle Wire Cable connecting Horsehead to Polished Rod
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(frontBeamX + 22, frontBeamY + 10);
      ctx.lineTo(wellheadX, rodTopY);
      ctx.stroke();

      // Rotating Crank Counterweight & Pitman Arm
      const crankPivotX = samsonX - 70;
      const crankPivotY = groundY - 40;
      const crankRadius = 32;

      const crankX = crankPivotX + Math.cos(angle) * crankRadius;
      const crankY = crankPivotY + Math.sin(angle) * crankRadius;

      // Crank Arm
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(crankPivotX, crankPivotY);
      ctx.lineTo(crankX, crankY);
      ctx.stroke();

      // Counterweight Mass
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(crankX, crankY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Pitman Arm (connecting Crank to Rear Walking Beam)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(crankX, crankY);
      ctx.lineTo(rearBeamX, rearBeamY);
      ctx.stroke();

      // Gearbox Housing
      ctx.fillStyle = '#334155';
      ctx.fillRect(crankPivotX - 25, crankPivotY + 10, 50, 30);

      // Animation Loop
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [spm, phase, heatedRadius, isInjection]);

  return (
    <div className="glass-panel p-4 flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-slate-100 tracking-wide uppercase">
            3D DIGITAL TWIN WELLBORE & SURFACE PUMP JACK SCHEMATIC
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-amber-400" /> SPM: <strong className="text-slate-100">{spm}</strong>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Flame className="w-3.5 h-3.5 text-cyan-400" /> Temp: <strong className="text-slate-100">{tempC}°C</strong>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" /> Visc: <strong className="text-slate-100">{viscosityCp} cP</strong>
          </span>
        </div>
      </div>

      {/* Canvas container */}
      <div className="relative flex-1 min-h-[360px] bg-slate-950/80 rounded-lg border border-slate-800 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={650}
          height={380}
          className="w-full h-full object-contain"
        />

        {/* Legend overlays */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1">
          <div className="font-bold text-amber-400 border-b border-slate-700/60 pb-1 mb-1">SURFACE LIFT UNIT</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Walking Beam
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Polished Rod String
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Crank Counterweight
          </div>
        </div>

        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1">
          <div className="font-bold text-cyan-400 border-b border-slate-700/60 pb-1 mb-1">JODHPUR SANDSTONE</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span> Thermal Radius: {heatedRadius} m
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span> Heavy Crude Viscosity: {viscosityCp} cP
          </div>
        </div>
      </div>
    </div>
  );
};
