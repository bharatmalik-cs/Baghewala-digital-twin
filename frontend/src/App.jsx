import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Bot, ClipboardCheck, Download, Flame, Gauge, LoaderCircle, MapPin, Pause, Play, Save, Send, ShieldCheck, SlidersHorizontal, Thermometer, Waves, X } from 'lucide-react';
import './console.css';
import { applyOptimization, connectWellWebSocket, fetchFieldSummary, fetchWellActions, fetchWellTelemetry, sendChatMessage, updateWellControls } from './services/api';

const n = (v, d = 0) => v == null ? '—' : Number(v).toLocaleString('en-IN', { maximumFractionDigits: d });
const phases = { INJECTION: 'Steam injection', SOAKING: 'Heat soak', PRODUCTION: 'Production' };

export default function App() {
  const [field, setField] = useState(null), [wellId, setWellId] = useState('BGW-01'), [t, setT] = useState(null), [actions, setActions] = useState([]);
  const [connected, setConnected] = useState(false), [busy, setBusy] = useState(false), [notice, setNotice] = useState(null), [reply, setReply] = useState(''), [question, setQuestion] = useState('');
  const [draft, setDraft] = useState({ spm: 0, choke_pct: 70 }), [market, setMarket] = useState({ crude_price_usd_bbl: 75, steam_cost_usd_ton: 18, electricity_cost_usd_kwh: .12 });
  const [paused, setPaused] = useState(false);
  const [route, setRoute] = useState('operations'); // 'operations', 'css-cycle', 'artificial-lift', 'decision-log', 'ai-evaluator'

  const getActions = async id => { const r = await fetchWellActions(id || wellId); if (r) setActions(r.actions || []); };
  useEffect(() => { const load = async () => setField(await fetchFieldSummary()); load(); const timer = setInterval(load, 8000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    let ws;
    const poll = async () => {
      if (paused) return;
      const r = await fetchWellTelemetry(wellId);
      if (r) { setT(r); setConnected(true); }
    };
    (async () => {
      const r = await fetchWellTelemetry(wellId);
      if (r) { setT(r); setConnected(true); setDraft({ spm:r.spm, choke_pct:r.choke_pct }); }
      getActions(wellId);
      ws = connectWellWebSocket(wellId, x => { if (!paused) { setT(x); setConnected(true); } }, () => setConnected(false));
    })();
    const timer = setInterval(poll, 6000);
    return () => { ws?.close(); clearInterval(timer); };
  }, [wellId, paused]);

  const save = async updates => { setBusy(true); const r = await updateWellControls(wellId, updates); setBusy(false); if (r) { setT(r); setDraft({ spm:r.spm, choke_pct:r.choke_pct }); getActions(); setNotice(['success','Setpoint saved to the simulated twin.']); } else setNotice(['error','Could not save. Check the FastAPI service.']); };
  const evaluate = async () => { setBusy(true); const r = await applyOptimization(wellId, market); setBusy(false); if (r) { setT(r); getActions(); setNotice(['info','Scenario evaluated. Review its risk flag before accepting.']); } else setNotice(['error','Scenario evaluation failed. Check the FastAPI service.']); };
  const ask = async preset => { const q = preset || question; if (!q) return; setBusy(true); setQuestion(''); const r = await sendChatMessage(wellId, q); setBusy(false); setReply(r?.response || 'Assistant unavailable.'); };
  const exportData = () => { const url = URL.createObjectURL(new Blob([JSON.stringify({ exported_at:new Date().toISOString(), source:'SIMULATED_DEMO', telemetry:t, actions }, null, 2)],{type:'application/json'})); const a=document.createElement('a'); a.href=url;a.download=`${wellId}-twin-snapshot.json`;a.click();URL.revokeObjectURL(url); };

  const css=t?.css_physics, srp=t?.srp_physics, hyd=t?.hydraulics, opt=t?.optimization, nn=t?.neural_network_surrogate, fault=srp?.anomaly_detected && !['NORMAL','INJECTION_STANDBY'].includes(srp.anomaly_detected);

  return (
    <main className="ops-shell">
      {/* SIDEBAR NAVIGATION */}
      <aside className="ops-sidebar">
        <div className="brand">
          <div className="brand-mark"><Waves size={19}/></div>
          <div><b>OILFIELD</b><span>OPERATIONS TWIN</span></div>
        </div>
        <div className="site-label"><MapPin size={14}/><span>Baghewala · Rajasthan</span></div>
        <nav>
          <button className={route==='operations'?'active':''} onClick={()=>setRoute('operations')}><Activity size={17}/><span>Operations desk</span></button>
          <button className={route==='css-cycle'?'active':''} onClick={()=>setRoute('css-cycle')}><Flame size={17}/><span>CSS cycle plan</span></button>
          <button className={route==='artificial-lift'?'active':''} onClick={()=>setRoute('artificial-lift')}><Gauge size={17}/><span>Artificial lift</span></button>
          <button className={route==='decision-log'?'active':''} onClick={()=>setRoute('decision-log')}><ClipboardCheck size={17}/><span>Decision log</span></button>
          <button className={route==='ai-evaluator'?'active':''} onClick={()=>setRoute('ai-evaluator')}><Bot size={17}/><span>Neural AI Evaluator</span></button>
        </nav>
        <div className="side-foot">
          <span className="eyebrow">Data environment</span>
          <strong><i className={`status-dot ${connected?'online':''}`}/> SIMULATED TWIN</strong>
          <p>Hackathon demonstration only. Field deployment needs historian integration and operator approval.</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <section className="ops-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Well-to-surface decision support</span>
            <h1>
              {route === 'operations' && 'Baghewala operations desk'}
              {route === 'css-cycle' && 'CSS Thermal Cycle Management'}
              {route === 'artificial-lift' && 'Artificial Lift & Dynacards'}
              {route === 'decision-log' && 'Operator Decision Audit Trace'}
              {route === 'ai-evaluator' && 'Hybrid Neural Network Workbench'}
            </h1>
            <p>
              {route === 'operations' && 'CSS thermal recovery and SRP lift performance in one operating view.'}
              {route === 'css-cycle' && 'Marx-Langenheim heat front model & Andrade/Walther viscosity reduction.'}
              {route === 'artificial-lift' && '1D Wave equation dynacard solver & surface/downhole pump load mechanics.'}
              {route === 'decision-log' && 'Timestamped audit log of all operator setpoint changes & AI evaluations.'}
              {route === 'ai-evaluator' && '0ms JSON Neural Network forward-pass regressor & classifier predictions.'}
            </p>
          </div>
          <div className="top-actions">
            <button className="button secondary" onClick={()=>setPaused(!paused)}>{paused?<Play size={15}/>:<Pause size={15}/>}{paused?'Resume feed':'Pause feed'}</button>
            <span className={`connection ${connected && !paused?'live':''}`}><i className="status-dot"/>{paused?'Stream paused':connected?'Live simulated feed':'Connecting'}</span>
            <button className="button secondary" onClick={exportData}><Download size={15}/>Export snapshot</button>
          </div>
        </header>

        {notice&&<div className={`notice ${notice[0]}`}><span>{notice[1]}</span><button onClick={()=>setNotice(null)}><X size={15}/></button></div>}

        {/* FIELD INVENTORY STRIP */}
        <section className="well-strip">
          <div className="well-strip-head">
            <div><span className="eyebrow">Field inventory</span><strong>{field?`${field.active_wells_count} modelled wells`:'Loading inventory'}</strong></div>
            <span>OIL reference: Jodhpur Sandstone, ~1,150 m</span>
          </div>
          <div className="well-tabs">
            {(field?.wells||[]).map(w=>(
              <button key={w.well_id} onClick={()=>setWellId(w.well_id)} className={w.well_id===wellId?'selected':''}>
                <i className={`well-icon ${w.anomaly!=='NORMAL'&&w.anomaly!=='INJECTION_STANDBY'?'warning':''}`}>
                  {w.anomaly!=='NORMAL'&&w.anomaly!=='INJECTION_STANDBY'?<AlertTriangle size={14}/>:<Activity size={14}/>}
                </i>
                <span><b>{w.well_id}</b><small>{phases[w.phase]||w.phase}</small></span>
                <em>{w.phase==='PRODUCTION'?`${n(w.oil_rate_bopd,1)} BOPD`:'CSS active'}</em>
              </button>
            ))}
          </div>
        </section>

        {/* ROUTE 1: MAIN OPERATIONS DESK */}
        {route === 'operations' && (
          <>
            <section className="hero-grid">
              <article className="well-card">
                <div className="card-header">
                  <div><span className="eyebrow">Selected asset</span><h2>{t?.well_name||wellId}</h2></div>
                  <span className={`pill ${fault?'danger':'good'}`}>{fault?srp.anomaly_detected.replace('_',' '):t?'OPERATING NORMALLY':'LOADING'}</span>
                </div>
                <div className="metric-row">
                  <Metric label="Oil rate" value={`${n(t?.oil_rate_bopd,1)} BOPD`} icon={<Activity/>}/>
                  <Metric label="Pump speed" value={`${n(t?.spm,1)} SPM`} icon={<Gauge/>}/>
                  <Metric label="Pump fillage" value={`${n(srp?.pump_fillage_pct)}%`} icon={<Waves/>}/>
                  <Metric label="Reservoir temp." value={`${n(css?.reservoir_temp_c)} °C`} icon={<Thermometer/>}/>
                </div>
                <div className="well-path">
                  <Point label="Reservoir" value={`${n(hyd?.reservoir_pressure_bar,1)} bar`}/>
                  <Point label="Pump intake" value={`${n(hyd?.pump_intake_pressure_bar,1)} bar`}/>
                  <Point label="Wellhead" value={`${n(hyd?.wellhead_pressure_bar,1)} bar`}/>
                  <Point label="Separator" value={`${n(hyd?.separator_pressure_bar,1)} bar`}/>
                </div>
              </article>
              <article className="shift-card">
                <span className="eyebrow">Shift decision</span>
                <h2>{fault?'Protect the rod pump before increasing drawdown.':'Maintain surveillance; test the economic operating window.'}</h2>
                <p>{actions[0]?.detail||'No operator actions recorded for this well.'}</p>
                <div className="shift-footer"><ShieldCheck size={17}/><span>Human approval remains in the control path</span></div>
              </article>
            </section>

            <section className="dashboard-grid">
              <article className="panel css-panel">
                <Title icon={<Flame/>} title="CSS cycle control" detail={t?`Day ${t.days_in_phase} · ${phases[t.phase]}`:'Loading'}/>
                <div className="phase-track">
                  {Object.entries(phases).map(([key,label],i)=>(
                    <button key={key} className={t?.phase===key?'current':''} onClick={()=>save({phase:key})}>
                      <span>{i+1}</span><b>{label}</b><small>{key==='INJECTION'?'Steam / pump off':key==='SOAKING'?'Heat diffusion':'Lift enabled'}</small>
                    </button>
                  ))}
                </div>
                <div className="thermal-grid">
                  <Item label="Thermal radius" value={`${n(css?.heated_radius_m,1)} m`} sub="Modelled heated zone"/>
                  <Item label="Oil viscosity" value={`${n(css?.oil_viscosity_cp)} cP`} sub="At modelled temperature"/>
                  <Item label="Cumulative SOR" value={`${n(css?.csor,2)} bbl/bbl`} sub="Steam / produced oil"/>
                </div>
                <div className="model-note"><ShieldCheck size={15}/><span>Phase transitions apply safe simulated controls; they are not automatic field instructions.</span></div>
              </article>

              <article className="panel lift-panel">
                <Title icon={<SlidersHorizontal/>} title="SRP operating envelope" detail={srp?.anomaly_detected?.replace('_',' ')||'Loading'}/>
                <Range label="Polished-rod speed" value={draft.spm} unit="SPM" min="0" max="10" step=".1" disabled={t?.phase!=='PRODUCTION'} onChange={v=>setDraft(d=>({...d,spm:v}))}/>
                <Range label="Choke opening" value={draft.choke_pct} unit="%" min="20" max="100" onChange={v=>setDraft(d=>({...d,choke_pct:v}))}/>
                <div className="lift-metrics">
                  <Item label="Peak rod load" value={`${n(srp?.peak_load_lb)} lbf`}/>
                  <Item label="Torque" value={`${n(srp?.peak_torque_k_in_lb,1)} k-in·lbf`}/>
                  <Item label="Power" value={`${n(srp?.power_kw,1)} kW`}/>
                </div>
                <button className="button dark full" disabled={busy||t?.phase!=='PRODUCTION'} onClick={()=>save(draft)}><Save size={15}/>Save operating setpoint</button>
              </article>

              <article className="panel optimizer-panel">
                <Title icon={<Gauge/>} title="Constrained scenario optimizer" detail={opt?.candidates_considered?`Hybrid AI Search · ${opt.candidates_considered} candidates`:"Physics-informed search · 2,025 candidates"}/>
                <p className="panel-copy">NN narrows 2,025 fine candidates in 0ms; First-Principles Physics re-verifies top 5 to enforce rod load & fillage safety gates.</p>
                <div className="economics">
                  <EconomicInput label="Crude / bbl" value={market.crude_price_usd_bbl} step="1" onChange={v=>setMarket(s=>({...s,crude_price_usd_bbl:v}))}/>
                  <EconomicInput label="Steam / tonne" value={market.steam_cost_usd_ton} step="1" onChange={v=>setMarket(s=>({...s,steam_cost_usd_ton:v}))}/>
                  <EconomicInput label="Power / kWh" value={market.electricity_cost_usd_kwh} step=".01" onChange={v=>setMarket(s=>({...s,electricity_cost_usd_kwh:v}))}/>
                </div>
                <button className="button primary full" disabled={busy||!t} onClick={evaluate}>{busy?<LoaderCircle className="spin" size={16}/>:<Play size={16}/>}Evaluate scenario</button>
                {opt&&(
                  <div className="recommendation">
                    <span className="eyebrow">Recommended reviewed target</span>
                    <strong>{n(opt.target_spm,1)} SPM <i/> {n(opt.target_choke_pct)}% choke</strong>
                    <p>{opt.recommendations?.[0]}</p>
                    <em className={`risk ${opt.selected_scenario?.risk_flag==='NORMAL'?'normal':''}`}>{opt.selected_scenario?.risk_flag?.replace('_',' ')}</em>
                    <div className="money"><span>Estimated margin change</span><b>{opt.potential_gain_usd_day>=0?'+':''}${n(opt.potential_gain_usd_day)}/day</b></div>
                    {opt.nn_second_opinion?.predicted_margin_usd_day&&(
                      <div style={{fontSize:'11px',color:'var(--muted)',marginBottom:'10px'}}>
                        <span>NN Second Opinion: </span><b style={{color:'var(--green)',fontFamily:'DM Mono'}}>${n(opt.nn_second_opinion.predicted_margin_usd_day)}/day</b> ({opt.nn_second_opinion.predicted_risk_flag})
                      </div>
                    )}
                    <button className="button approve" disabled={busy||opt.decision_status!=='REVIEW_REQUIRED'} onClick={()=>save({spm:opt.target_spm,choke_pct:opt.target_choke_pct,steam_rate_tpd:opt.target_steam_tpd})}><ClipboardCheck size={15}/>Accept after review</button>
                  </div>
                )}
                {nn&&(
                  <div className="model-note" style={{marginTop:'14px',display:'flex',flexDirection:'column',gap:'6px'}}>
                    <div style={{display:'flex',justify:'space-between',width:'100%',alignItems:'center'}}>
                      <strong style={{fontSize:'11px',color:'var(--forest)'}}>🧠 MLP Neural Network Surrogate</strong>
                      <em className={`risk ${nn.predicted_risk_flag==='NORMAL'?'normal':''}`}>{nn.predicted_risk_flag.replace('_',' ')}</em>
                    </div>
                    <div style={{display:'flex',justify:'space-between',width:'100%',fontSize:'11px'}}>
                      <span>Predicted Net Margin:</span><b style={{color:'var(--green)',fontFamily:'DM Mono'}}>${n(nn.predicted_margin_usd_day)}/day</b>
                    </div>
                  </div>
                )}
              </article>

              <article className="panel assistant-panel">
                <Title icon={<Bot/>} title="Operations assistant" detail="Current twin context"/>
                <p className="panel-copy">Domain guidance grounded in the simulated well snapshot, not an unverified LLM claim.</p>
                <div className="assistant-prompts">
                  <button onClick={()=>ask('Diagnose the current rod-pump condition and explain the safe next check.')}>Diagnose lift condition <Send size={13}/></button>
                  <button onClick={()=>ask('What CSS phase gate should the operator review for this well?')}>Review CSS phase gate <Send size={13}/></button>
                </div>
                {reply&&<div className="assistant-reply">{reply}</div>}
                <div className="ask-box">
                  <input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()} placeholder="Ask about this well…"/>
                  <button onClick={()=>ask()}><Send size={15}/></button>
                </div>
              </article>

              <article className="panel audit-panel">
                <Title icon={<ClipboardCheck/>} title="Decision trace" detail="Latest simulated actions"/>
                <div className="audit-list">
                  {actions.length?actions.map((a,i)=>(
                    <div key={`${a.timestamp}-${i}`}>
                      <i className="audit-dot"/>
                      <section><b>{a.event.replaceAll('_',' ')}</b><p>{a.detail}</p></section>
                      <time>{new Date(a.timestamp*1000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</time>
                    </div>
                  )):<p className="empty">No actions recorded yet.</p>}
                </div>
              </article>
            </section>
          </>
        )}

        {/* ROUTE 2: CSS CYCLE PLAN */}
        {route === 'css-cycle' && (
          <section className="dashboard-grid" style={{gridTemplateColumns:'1.5fr 1fr'}}>
            <article className="panel">
              <Title icon={<Flame/>} title="CSS Thermal Recovery Management" detail={`Well ${wellId} · Marx-Langenheim Model`}/>
              <p className="panel-copy">Cyclic Steam Stimulation injects 240°C steam to reduce heavy oil viscosity from 3,500 cP to below 50 cP before initiating production.</p>
              <div className="phase-track" style={{marginBottom:'20px'}}>
                {Object.entries(phases).map(([key,label],i)=>(
                  <button key={key} className={t?.phase===key?'current':''} onClick={()=>save({phase:key})}>
                    <span>{i+1}</span><b>{label}</b><small>{key==='INJECTION'?'Steam / pump off':key==='SOAKING'?'Heat diffusion':'Lift enabled'}</small>
                  </button>
                ))}
              </div>
              <div className="thermal-grid">
                <Item label="Thermal Radius" value={`${n(css?.heated_radius_m,2)} m`} sub="Plume heat front"/>
                <Item label="Mean Reservoir Temp" value={`${n(css?.reservoir_temp_c,1)} °C`} sub="Pay zone average"/>
                <Item label="Crude Viscosity" value={`${n(css?.oil_viscosity_cp)} cP`} sub="Andrade/Walther formula"/>
                <Item label="Cumulative SOR" value={`${n(css?.csor,2)} bbl/bbl`} sub="Total steam/produced oil"/>
                <Item label="Instantaneous SOR" value={`${n(css?.isor,2)} bbl/bbl`} sub="Current injection efficiency"/>
                <Item label="Steam Rate" value={`${n(t?.steam_rate_tpd)} TPD`} sub="High pressure steam"/>
              </div>
            </article>

            <article className="panel">
              <Title icon={<ShieldCheck/>} title="CSS Phase Transition Rules" detail="Operational Safety Gates"/>
              <div className="model-note" style={{marginBottom:'16px'}}>
                <span><b>Rule 1</b>: Steam Injection phase disables Sucker Rod Pump (0 SPM) to prevent high-temperature rod string damage.</span>
              </div>
              <div className="model-note" style={{marginBottom:'16px'}}>
                <span><b>Rule 2</b>: Maintain Soak Phase for 5 to 7 days until mean reservoir temperature stabilizes above 120°C.</span>
              </div>
              <div className="model-note">
                <span><b>Rule 3</b>: Terminate steam injection if Cumulative SOR exceeds 8.0 bbl/bbl to prevent thermal breakthrough.</span>
              </div>
            </article>
          </section>
        )}

        {/* ROUTE 3: ARTIFICIAL LIFT */}
        {route === 'artificial-lift' && (
          <section className="dashboard-grid" style={{gridTemplateColumns:'1.2fr 1fr'}}>
            <article className="panel">
              <Title icon={<Gauge/>} title="Sucker Rod Pump Mechanics" detail={`Well ${wellId} · 1D Wave Equation Solver`}/>
              <p className="panel-copy">1D Damped Wave Equation decouples rod string elasticity to isolate downhole plunger load vs displacement.</p>
              <Range label="Polished-rod speed" value={draft.spm} unit="SPM" min="0" max="10" step=".1" disabled={t?.phase!=='PRODUCTION'} onChange={v=>setDraft(d=>({...d,spm:v}))}/>
              <Range label="Choke opening" value={draft.choke_pct} unit="%" min="20" max="100" onChange={v=>setDraft(d=>({...d,choke_pct:v}))}/>
              <div className="lift-metrics" style={{marginTop:'20px'}}>
                <Item label="Peak Rod Load" value={`${n(srp?.peak_load_lb)} lbf`}/>
                <Item label="Gearbox Torque" value={`${n(srp?.peak_torque_k_in_lb,1)} k-in·lbf`}/>
                <Item label="Motor Power" value={`${n(srp?.power_kw,1)} kW`}/>
                <Item label="Pump Fillage" value={`${n(srp?.pump_fillage_pct)}%`}/>
                <Item label="Stroke Length" value={`${n(t?.stroke_length_in)} in`}/>
                <Item label="Anomaly Detected" value={srp?.anomaly_detected?.replace('_',' ')||"NORMAL"}/>
              </div>
              <button className="button dark full" disabled={busy||t?.phase!=='PRODUCTION'} onClick={()=>save(draft)} style={{marginTop:'16px'}}><Save size={15}/>Save Setpoint</button>
            </article>

            <article className="panel">
              <Title icon={<Activity/>} title="Dynacard Diagnostics" detail="Downhole Health Classification"/>
              <div className="recommendation" style={{marginTop:'0'}}>
                <span className="eyebrow">Diagnosed Condition</span>
                <strong>{srp?.anomaly_detected?.replace('_',' ')||"NORMAL"}</strong>
                <p>{srp?.anomaly_detected === 'FLUID_POUND' ? 'Pump speed exceeds fluid inflow. Reduce SPM to 4.5–5.5 SPM.' : srp?.anomaly_detected === 'GAS_LOCK' ? 'Free gas trapped in pump barrel. Widen choke by 15–20%.' : srp?.anomaly_detected === 'VISCOUS_DRAG' ? 'Heavy oil slows rod fall. Maintain low SPM.' : 'Operating normally inside safe envelope.'}</p>
                <em className={`risk ${srp?.anomaly_detected==='NORMAL'||srp?.anomaly_detected==='INJECTION_STANDBY'?'normal':''}`}>{srp?.anomaly_detected?.replace('_',' ')}</em>
              </div>
            </article>
          </section>
        )}

        {/* ROUTE 4: DECISION LOG */}
        {route === 'decision-log' && (
          <section className="dashboard-grid" style={{gridTemplateColumns:'1fr'}}>
            <article className="panel audit-panel">
              <Title icon={<ClipboardCheck/>} title="Operator Decision Audit Trace" detail="Historical Simulated Events & Setpoints"/>
              <div className="audit-list">
                {actions.length?actions.map((a,i)=>(
                  <div key={`${a.timestamp}-${i}`}>
                    <i className="audit-dot"/>
                    <section><b>{a.event.replaceAll('_',' ')}</b><p>{a.detail}</p></section>
                    <time>{new Date(a.timestamp*1000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</time>
                  </div>
                )):<p className="empty">No actions recorded yet.</p>}
              </div>
            </article>
          </section>
        )}

        {/* ROUTE 5: NEURAL AI EVALUATOR */}
        {route === 'ai-evaluator' && (
          <section className="dashboard-grid" style={{gridTemplateColumns:'1.2fr 1fr'}}>
            <article className="panel">
              <Title icon={<Bot/>} title="🧠 MLP Neural Network Workbench" detail="Pure JavaScript 0ms Forward Pass (inference.js)"/>
              <p className="panel-copy">Evaluates trained MLP Neural Networks (margin_regressor.json & risk_classifier.json) directly in browser memory without scikit-learn or PyTorch.</p>
              {nn ? (
                <div className="thermal-grid" style={{marginTop:'16px'}}>
                  <Item label="NN Predicted Margin" value={`$${n(nn.predicted_margin_usd_day)}/day`} sub="MLP Regressor Output"/>
                  <Item label="NN Predicted Risk" value={nn.predicted_risk_flag.replace('_',' ')} sub="MLP Classifier Output"/>
                  <Item label="Physics Verified Target" value={`$${n(opt?.optimized_daily_profit_usd)}/day`} sub="First-Principles Physics"/>
                </div>
              ) : <p className="empty">Loading Neural Network weights…</p>}
            </article>

            <article className="panel">
              <Title icon={<ShieldCheck/>} title="Hybrid AI Architecture" detail="Safety & Verification Gate"/>
              <div className="model-note" style={{marginBottom:'12px'}}>
                <span><b>1. NN Fast Shortlist</b>: 2,025 fine candidates evaluated in 0ms using pure matrix multiplication.</span>
              </div>
              <div className="model-note" style={{marginBottom:'12px'}}>
                <span><b>2. Physics Re-verification</b>: Top shortlisted candidates re-verified by First-Principles Physics.</span>
              </div>
              <div className="model-note">
                <span><b>3. Safety Gate</b>: Real physics engines remain the sole authority on equipment risk flags.</span>
              </div>
            </article>
          </section>
        )}
      </section>
    </main>
  );
}

function Metric({label,value,icon}){return <div className="metric"><i>{icon}</i><div><small>{label}</small><strong>{value}</strong></div></div>}; 
function Point({label,value}){return <div><small>{label}</small><b>{value}</b></div>}; 
function Item({label,value,sub}){return <div className="data-item"><small>{label}</small><strong>{value}</strong>{sub&&<span>{sub}</span>}</div>}; 
function Title({icon,title,detail}){return <div className="panel-title"><i>{icon}</i><div><h2>{title}</h2><p>{detail}</p></div></div>}; 
function Range({label,value,unit,min,max,step=1,disabled,onChange}){return <div className="range-field"><label>{label}<b>{n(value,step<1?1:0)} {unit}</b></label><input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={e=>onChange(Number(e.target.value))}/><span>{min}<i/>{max} {unit}</span></div>}; 
function EconomicInput({label,value,step,onChange}){return <label className="number-input"><span>{label}</span><div><i>$</i><input type="number" value={value} step={step} onChange={e=>onChange(Number(e.target.value))}/></div></label>};
