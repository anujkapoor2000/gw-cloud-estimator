import { useState, useMemo } from "react";

// ── Brand tokens ──────────────────────────────────────────────────────────────
var BLUE    = "#003087";
var LBLUE   = "#0067B1";
var RED     = "#E4002B";
var GREEN   = "#00875A";
var AMBER   = "#FF8B00";
var PURPLE  = "#6554C0";
var TEAL    = "#00A896";
var ORANGE  = "#FF6B35";
var CYAN    = "#0096D6";
var WHITE   = "#FFFFFF";
var G50     = "#F8FAFC";
var G100    = "#F0F2F5";
var G200    = "#E2E6EC";
var G300    = "#C8D0DC";
var G400    = "#9AAABF";
var G600    = "#5A6A82";
var G700    = "#3D4E63";
var G800    = "#2C3A4F";
var G900    = "#1A2535";

// ── SurePath phases ───────────────────────────────────────────────────────────
var SUREPATH_PHASES = [
  { id:"inception",    label:"Inception",     short:"INC", color:TEAL,   pct:0.08, desc:"Vision, scope, architecture blueprint, risk register" },
  { id:"elaboration",  label:"Elaboration",   short:"ELB", color:BLUE,   pct:0.14, desc:"Detailed design, proof of concepts, environment setup, data mapping" },
  { id:"construction", label:"Construction",  short:"CON", color:GREEN,  pct:0.52, desc:"Iterative sprint delivery across all in-scope modules" },
  { id:"transition",   label:"Transition",    short:"TRN", color:AMBER,  pct:0.16, desc:"UAT, data migration, cutover planning, parallel run" },
  { id:"hypercare",    label:"Hypercare",     short:"HYP", color:PURPLE, pct:0.10, desc:"Go-live support, defect resolution, knowledge transfer, handover" }
];

// ── GW Modules ────────────────────────────────────────────────────────────────
var GW_MODULES = [
  { id:"pc",          label:"PolicyCenter",     color:BLUE,   icon:"P",
    baseWeeks:{ low:16, med:28, high:44 },
    roles:["GW BA","GW Config Developer","GW Technical Lead","GW Integration Dev"] },
  { id:"cc",          label:"ClaimCenter",      color:TEAL,   icon:"C",
    baseWeeks:{ low:12, med:22, high:36 },
    roles:["GW BA","GW Config Developer","GW Technical Lead"] },
  { id:"bc",          label:"BillingCenter",    color:GREEN,  icon:"B",
    baseWeeks:{ low:8,  med:16, high:26 },
    roles:["GW BA","GW Config Developer"] },
  { id:"jutro",       label:"Jutro UI",         color:ORANGE, icon:"J",
    baseWeeks:{ low:6,  med:12, high:20 },
    roles:["Jutro UI Developer","GW Technical Lead"] },
  { id:"datahub",     label:"Data Hub",         color:PURPLE, icon:"D",
    baseWeeks:{ low:8,  med:14, high:22 },
    roles:["Data Engineer","GW Technical Lead","ETL Developer"] },
  { id:"integration", label:"Integration",      color:CYAN,   icon:"I",
    baseWeeks:{ low:10, med:18, high:30 },
    roles:["GW Integration Dev","Middleware Engineer","GW Technical Lead"] }
];

// ── Default rate card (GBP/day) ───────────────────────────────────────────────
var DEFAULT_RATES = {
  "GW Technical Lead":     { internal:850,  external:1350 },
  "GW Config Developer":   { internal:650,  external:1050 },
  "GW BA":                 { internal:700,  external:1100 },
  "GW Integration Dev":    { internal:750,  external:1200 },
  "Jutro UI Developer":    { internal:680,  external:1100 },
  "Data Engineer":         { internal:720,  external:1150 },
  "ETL Developer":         { internal:680,  external:1100 },
  "Middleware Engineer":   { internal:740,  external:1180 },
  "QA Lead":               { internal:700,  external:1100 },
  "QA Engineer":           { internal:550,  external:900  },
  "AI Test Engineer":      { internal:800,  external:1300 },
  "DevOps / Cloud Eng":    { internal:780,  external:1250 },
  "Project Manager":       { internal:800,  external:1300 },
  "Solution Architect":    { internal:950,  external:1500 },
  "Change Manager":        { internal:700,  external:1100 },
  "Technical Writer":      { internal:500,  external:800  }
};

var COMPLEXITY_MULT = { low:0.75, medium:1.0, high:1.45, critical:1.9 };
var COMPLEXITY_LABELS = { low:"Low", medium:"Medium", high:"High", critical:"Critical" };

var AI_ACCELERATORS = [
  { id:"ai_testing",    label:"AI-Based Testing",         icon:"🤖",
    saving:0.30, cost:25000, desc:"Automated test generation, self-healing scripts, regression intelligence. Reduces testing effort by ~30%" },
  { id:"tech_debt",     label:"Tech Debt Radar",          icon:"🔍",
    saving:0.20, cost:15000, desc:"Gosu code scanner with 300+ anti-pattern library. Identifies refactoring scope upfront, reducing rework by ~20%" },
  { id:"req_gathering", label:"Requirements Analyser",    icon:"📋",
    saving:0.15, cost:12000, desc:"NLP BRD parser auto-mapping requirements to GW capabilities. Reduces BA effort and scope creep by ~15%" },
  { id:"data_masking",  label:"Test DataHub & Masking",   icon:"🛡️",
    saving:0.10, cost:18000, desc:"AI-generated masked test data for CDA/GDPR compliance. Reduces data prep time by ~10%" }
];

// ── Utility helpers ───────────────────────────────────────────────────────────
function fmtN(n) { return n.toLocaleString(); }
function pct(v, t) { return t > 0 ? Math.round(v/t*100) : 0; }

// ── Small UI atoms ────────────────────────────────────────────────────────────
function NTTLogo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0 }}>
      <span style={{ fontFamily:"Arial Black,Arial,sans-serif", fontWeight:900, fontSize:17, color:BLUE }}>NTT</span>
      <span style={{ fontFamily:"Arial,sans-serif", fontWeight:700, fontSize:13, color:BLUE, marginLeft:3, letterSpacing:1 }}>DATA</span>
      <div style={{ width:26, height:3, background:RED, marginLeft:4, borderRadius:2 }} />
    </div>
  );
}

function Pill(props) {
  return (
    <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:10, fontWeight:700,
      background:props.bg||G100, color:props.color||G800, border:"1px solid "+(props.border||G200) }}>
      {props.label}
    </span>
  );
}

function Bar(props) {
  return (
    <div style={{ background:G200, borderRadius:99, height:props.h||8, overflow:"hidden", flexShrink:0 }}>
      <div style={{ width:Math.min(100,props.pct)+"%", background:props.color||BLUE, height:"100%", borderRadius:99, transition:"width 0.5s ease" }} />
    </div>
  );
}

function Card(props) {
  return (
    <div style={{ background:WHITE, borderRadius:12, border:"1px solid "+G200,
      boxShadow:"0 2px 8px rgba(0,0,0,0.06)", padding:props.p||"20px 24px", ...(props.style||{}) }}>
      {props.children}
    </div>
  );
}

function SectionTitle(props) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:18, fontWeight:800, color:G900, marginBottom:3 }}>{props.title}</div>
      {props.sub && <div style={{ fontSize:13, color:G600 }}>{props.sub}</div>}
    </div>
  );
}

function Tooltip(props) {
  return (
    <span title={props.text} style={{ cursor:"help", fontSize:11, color:G400, marginLeft:5, fontWeight:700 }}>?</span>
  );
}

// ── Slider input ──────────────────────────────────────────────────────────────
function SliderRow(props) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:12, fontWeight:600, color:G800 }}>{props.label}<Tooltip text={props.tip||""} /></span>
        <span style={{ fontSize:13, fontWeight:800, color:props.color||BLUE, minWidth:32, textAlign:"right" }}>{props.value}</span>
      </div>
      <input type="range" min={props.min||0} max={props.max||100} step={props.step||1}
        value={props.value} onChange={function(e){ props.onChange(Number(e.target.value)); }}
        style={{ width:"100%", accentColor:props.color||BLUE, cursor:"pointer" }} />
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
        <span style={{ fontSize:10, color:G400 }}>{props.min||0}</span>
        <span style={{ fontSize:10, color:G400 }}>{props.max||100}</span>
      </div>
    </div>
  );
}

// ── Complexity selector ───────────────────────────────────────────────────────
function ComplexityPicker(props) {
  var opts = ["low","medium","high","critical"];
  var colors = { low:GREEN, medium:AMBER, high:ORANGE, critical:RED };
  return (
    <div style={{ display:"flex", gap:6 }}>
      {opts.map(function(o) {
        var active = props.value === o;
        return (
          <button key={o} onClick={function(){ props.onChange(o); }}
            style={{ flex:1, padding:"5px 0", borderRadius:6, border:"1px solid "+(active?colors[o]:G200),
              background:active?colors[o]+"18":WHITE, color:active?colors[o]:G400,
              fontWeight:active?700:400, fontSize:10, cursor:"pointer", textTransform:"capitalize" }}>
            {COMPLEXITY_LABELS[o]}
          </button>
        );
      })}
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator(props) {
  var steps = ["Project","Modules","Requirements","Rate Card","Accelerators","Dashboard"];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, padding:"0 32px" }}>
      {steps.map(function(s, i) {
        var done = i < props.current;
        var active = i === props.current;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flex: i < steps.length-1 ? 1 : "none" }}>
            <div onClick={function(){ if(done) props.onGo(i); }}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:done?"pointer":"default" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:12, fontWeight:700,
                background: done?BLUE:active?BLUE:G200,
                color: (done||active)?WHITE:G400,
                border: active?"3px solid "+LBLUE:"3px solid transparent", transition:"all 0.2s" }}>
                {done ? "✓" : i+1}
              </div>
              <span style={{ fontSize:10, fontWeight:active?700:400, color:active?BLUE:done?G700:G400, whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i < steps.length-1 && (
              <div style={{ flex:1, height:2, background:done?BLUE:G200, margin:"0 4px", marginBottom:18, transition:"background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── STEP 1: Project Setup ─────────────────────────────────────────────────────
function StepProject(props) {
  var d = props.data;
  function upd(k,v){ props.onChange(Object.assign({}, d, { [k]:v })); }
  return (
    <div style={{ maxWidth:760, margin:"0 auto" }}>
      <SectionTitle title="Project Setup" sub="Define the engagement context, contract model, and currency" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Engagement Details</div>
          <label style={{ fontSize:12, color:G600, display:"block", marginBottom:4 }}>Project Name</label>
          <input value={d.name||""} onChange={function(e){upd("name",e.target.value);}}
            placeholder="e.g. Aviva GW Cloud Migration"
            style={{ width:"100%", padding:"8px 12px", borderRadius:7, border:"1px solid "+G200, fontSize:13, marginBottom:12, outline:"none" }} />
          <label style={{ fontSize:12, color:G600, display:"block", marginBottom:4 }}>Client Name</label>
          <input value={d.client||""} onChange={function(e){upd("client",e.target.value);}}
            placeholder="e.g. Aviva Insurance Ltd"
            style={{ width:"100%", padding:"8px 12px", borderRadius:7, border:"1px solid "+G200, fontSize:13, marginBottom:12, outline:"none" }} />
          <label style={{ fontSize:12, color:G600, display:"block", marginBottom:4 }}>GW Current Version</label>
          <select value={d.fromVersion||"8"} onChange={function(e){upd("fromVersion",e.target.value);}}
            style={{ width:"100%", padding:"8px 12px", borderRadius:7, border:"1px solid "+G200, fontSize:13, marginBottom:12, outline:"none" }}>
            {["7.x","8.x","9.x","10.x"].map(function(v){ return <option key={v} value={v}>{v}</option>; })}
          </select>
          <label style={{ fontSize:12, color:G600, display:"block", marginBottom:4 }}>Target GW Cloud Release</label>
          <select value={d.toVersion||"Jasper"} onChange={function(e){upd("toVersion",e.target.value);}}
            style={{ width:"100%", padding:"8px 12px", borderRadius:7, border:"1px solid "+G200, fontSize:13, outline:"none" }}>
            {["Innsbruck","Jasper","Kufri","Landmark"].map(function(v){ return <option key={v} value={v}>{v}</option>; })}
          </select>
        </Card>

        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Commercial Model</div>
          <label style={{ fontSize:12, color:G600, display:"block", marginBottom:8 }}>Contract Type</label>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {["T&M","Fixed Price","T&M+Fixed Hybrid"].map(function(ct){
              var active = d.contractType === ct;
              return (
                <button key={ct} onClick={function(){upd("contractType",ct);}}
                  style={{ flex:1, padding:"8px 4px", borderRadius:8, border:"1px solid "+(active?BLUE:G200),
                    background:active?BLUE+"12":WHITE, color:active?BLUE:G600,
                    fontWeight:active?700:400, fontSize:11, cursor:"pointer" }}>{ct}</button>
              );
            })}
          </div>
          <label style={{ fontSize:12, color:G600, display:"block", marginBottom:8 }}>Currency</label>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {["GBP","USD","EUR","INR"].map(function(c){
              var active = d.currency === c;
              return (
                <button key={c} onClick={function(){upd("currency",c);}}
                  style={{ flex:1, padding:"6px 0", borderRadius:7, border:"1px solid "+(active?TEAL:G200),
                    background:active?TEAL+"12":WHITE, color:active?TEAL:G600,
                    fontWeight:active?700:400, fontSize:12, cursor:"pointer" }}>{c}</button>
              );
            })}
          </div>
          <label style={{ fontSize:12, color:G600, display:"block", marginBottom:8 }}>Margin / Mark-up (%)</label>
          <SliderRow label="External Price Margin" value={d.margin||35} min={10} max={60} step={1}
            color={GREEN} tip="Applied on top of internal cost to derive client-facing price"
            onChange={function(v){upd("margin",v);}} />
          <label style={{ fontSize:12, color:G600, display:"block", marginBottom:8 }}>Contingency (%)</label>
          <SliderRow label="Risk Contingency Buffer" value={d.contingency||15} min={5} max={30} step={1}
            color={AMBER} tip="Added to Fixed Price engagements as risk buffer"
            onChange={function(v){upd("contingency",v);}} />
        </Card>
      </div>
    </div>
  );
}

// ── STEP 2: Module Scope ──────────────────────────────────────────────────────
function StepModules(props) {
  var d = props.data;
  function toggle(id) {
    var cur = d.selected || [];
    var next = cur.indexOf(id) >= 0 ? cur.filter(function(x){return x!==id;}) : cur.concat(id);
    props.onChange(Object.assign({}, d, { selected:next }));
  }
  var sel = d.selected || [];
  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <SectionTitle title="Module Scope" sub="Select all Guidewire modules in scope for this cloud migration" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {GW_MODULES.map(function(m) {
          var active = sel.indexOf(m.id) >= 0;
          return (
            <div key={m.id} onClick={function(){toggle(m.id);}}
              style={{ padding:"20px", borderRadius:12, border:"2px solid "+(active?m.color:G200),
                background:active?m.color+"0D":WHITE, cursor:"pointer", transition:"all 0.2s",
                boxShadow:active?"0 4px 16px "+m.color+"30":"0 2px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:active?m.color:G200,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:18, fontWeight:900, color:active?WHITE:G400, transition:"all 0.2s" }}>{m.icon}</div>
                <div style={{ width:22, height:22, borderRadius:"50%", border:"2px solid "+(active?m.color:G300),
                  background:active?m.color:WHITE, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, color:WHITE, fontWeight:700 }}>{active?"✓":""}</div>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:active?m.color:G800, marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:10, color:G600 }}>
                {m.baseWeeks.low}–{m.baseWeeks.high} weeks typical
              </div>
              <div style={{ marginTop:10 }}>
                {m.roles.slice(0,2).map(function(r){ return (
                  <span key={r} style={{ display:"inline-block", fontSize:9, padding:"1px 6px", borderRadius:3,
                    background:G100, color:G600, marginRight:4, marginBottom:3 }}>{r}</span>
                );})}
              </div>
            </div>
          );
        })}
      </div>
      {sel.length === 0 && (
        <div style={{ textAlign:"center", padding:"20px", color:AMBER, fontWeight:600, fontSize:13 }}>
          ⚠ Please select at least one module to continue
        </div>
      )}
    </div>
  );
}

// ── STEP 3: Requirements ──────────────────────────────────────────────────────
function StepRequirements(props) {
  var d = props.data;
  var mods = props.selectedModules || [];
  function updMod(modId, key, val) {
    var mdata = d[modId] || {};
    props.onChange(Object.assign({}, d, { [modId]: Object.assign({}, mdata, { [key]:val }) }));
  }
  function getMod(modId) {
    return d[modId] || { complexity:"medium", customScreens:10, integrations:5, dataVolume:"medium",
      productLines:2, gosuLoc:5000, testCases:50 };
  }

  var modDefs = GW_MODULES.filter(function(m){ return mods.indexOf(m.id) >= 0; });

  return (
    <div style={{ maxWidth:1000, margin:"0 auto" }}>
      <SectionTitle title="Requirements & Complexity" sub="Define scope and complexity per module — drives effort estimation" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:20 }}>
        {modDefs.map(function(m) {
          var md = getMod(m.id);
          return (
            <Card key={m.id} style={{ borderTop:"3px solid "+m.color }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:m.color,
                  display:"flex", alignItems:"center", justifyContent:"center", color:WHITE, fontWeight:900, fontSize:14 }}>{m.icon}</div>
                <div style={{ fontSize:14, fontWeight:800, color:m.color }}>{m.label}</div>
              </div>

              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:600, color:G600, marginBottom:6 }}>
                  Overall Complexity<Tooltip text="Drives the effort multiplier applied to base estimates" />
                </div>
                <ComplexityPicker value={md.complexity||"medium"} onChange={function(v){updMod(m.id,"complexity",v);}} />
              </div>

              {(m.id==="pc"||m.id==="cc"||m.id==="bc") && (
                <SliderRow label="Custom Screens / PCF" value={md.customScreens||10} min={0} max={100} step={5}
                  color={m.color} tip="Number of custom PCF screen overrides"
                  onChange={function(v){updMod(m.id,"customScreens",v);}} />
              )}
              {(m.id==="pc"||m.id==="cc"||m.id==="bc") && (
                <SliderRow label="Product Lines / LOBs" value={md.productLines||2} min={1} max={20} step={1}
                  color={m.color} tip="Number of lines of business in scope"
                  onChange={function(v){updMod(m.id,"productLines",v);}} />
              )}
              <SliderRow label="External Integrations" value={md.integrations||5} min={0} max={40} step={1}
                color={m.color} tip="Number of inbound/outbound API or batch integrations"
                onChange={function(v){updMod(m.id,"integrations",v);}} />
              {(m.id==="pc"||m.id==="cc"||m.id==="bc") && (
                <SliderRow label="Gosu / Config LOC (K)" value={md.gosuLoc||5} min={1} max={100} step={1}
                  color={m.color} tip="Estimated Gosu code in thousands of lines"
                  onChange={function(v){updMod(m.id,"gosuLoc",v);}} />
              )}
              {m.id==="datahub" && (
                <SliderRow label="Data Sources / Targets" value={md.integrations||5} min={1} max={30} step={1}
                  color={m.color} tip="Number of source and target data systems"
                  onChange={function(v){updMod(m.id,"integrations",v);}} />
              )}
              {m.id==="jutro" && (
                <SliderRow label="Custom UI Components" value={md.customScreens||10} min={0} max={60} step={2}
                  color={m.color} tip="Bespoke Jutro widgets and page layouts"
                  onChange={function(v){updMod(m.id,"customScreens",v);}} />
              )}
              <SliderRow label="Test Cases (est.)" value={md.testCases||50} min={10} max={500} step={10}
                color={m.color} tip="Total test cases across unit, integration and UAT"
                onChange={function(v){updMod(m.id,"testCases",v);}} />
            </Card>
          );
        })}
      </div>

      <Card style={{ marginTop:20, borderLeft:"4px solid "+BLUE }}>
        <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:12 }}>Global Parameters</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:G600, marginBottom:6 }}>Migration Type</div>
            <div style={{ display:"flex", gap:8 }}>
              {["Lift & Shift","Re-configure","Re-build"].map(function(t){
                var active = (d.migrationType||"Re-configure") === t;
                return (
                  <button key={t} onClick={function(){ props.onChange(Object.assign({},d,{migrationType:t})); }}
                    style={{ flex:1, padding:"7px 4px", borderRadius:7, border:"1px solid "+(active?BLUE:G200),
                      background:active?BLUE+"12":WHITE, color:active?BLUE:G600,
                      fontWeight:active?700:400, fontSize:10, cursor:"pointer" }}>{t}</button>
                );
              })}
            </div>
          </div>
          <div>
            <SliderRow label="Number of Environments" value={d.environments||4} min={2} max={8} step={1}
              color={TEAL} tip="Dev, SIT, UAT, Staging, Prod etc"
              onChange={function(v){ props.onChange(Object.assign({},d,{environments:v})); }} />
          </div>
          <div>
            <SliderRow label="Parallel Run Weeks" value={d.parallelRun||4} min={0} max={12} step={1}
              color={AMBER} tip="Weeks running old and new system in parallel before cutover"
              onChange={function(v){ props.onChange(Object.assign({},d,{parallelRun:v})); }} />
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── STEP 4: Rate Card ─────────────────────────────────────────────────────────
function StepRateCard(props) {
  var rates = props.data;
  function upd(role, type, val) {
    props.onChange(Object.assign({}, rates, { [role]: Object.assign({}, rates[role], { [type]: Number(val)||0 }) }));
  }
  var sym = props.currency === "USD" ? "$" : props.currency === "EUR" ? "€" : props.currency === "INR" ? "₹" : "£";

  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <SectionTitle title="Rate Card" sub={"Daily rates per role (" + sym + " / day). Edit to match your commercial model."} />
      <Card>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:0 }}>
          <div style={{ padding:"8px 12px", background:G100, fontSize:11, fontWeight:700, color:G600, borderRadius:"8px 0 0 0" }}>ROLE</div>
          <div style={{ padding:"8px 12px", background:G100, fontSize:11, fontWeight:700, color:BLUE, textAlign:"center" }}>INTERNAL ({sym}/day)</div>
          <div style={{ padding:"8px 12px", background:G100, fontSize:11, fontWeight:700, color:GREEN, textAlign:"center", borderRadius:"0 8px 0 0" }}>EXTERNAL ({sym}/day)</div>
          {Object.keys(rates).map(function(role, i) {
            var even = i%2===0;
            return [
              <div key={role+"l"} style={{ padding:"9px 12px", background:even?WHITE:G50, fontSize:12, fontWeight:600, color:G800, display:"flex", alignItems:"center", borderBottom:"1px solid "+G200 }}>{role}</div>,
              <div key={role+"i"} style={{ padding:"6px 12px", background:even?WHITE:G50, borderBottom:"1px solid "+G200, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <input type="number" value={rates[role].internal} onChange={function(e){upd(role,"internal",e.target.value);}}
                  style={{ width:"90px", padding:"5px 8px", borderRadius:6, border:"1px solid "+G200, fontSize:12, textAlign:"right", outline:"none", color:BLUE, fontWeight:600 }} />
              </div>,
              <div key={role+"e"} style={{ padding:"6px 12px", background:even?WHITE:G50, borderBottom:"1px solid "+G200, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <input type="number" value={rates[role].external} onChange={function(e){upd(role,"external",e.target.value);}}
                  style={{ width:"90px", padding:"5px 8px", borderRadius:6, border:"1px solid "+G200, fontSize:12, textAlign:"right", outline:"none", color:GREEN, fontWeight:600 }} />
              </div>
            ];
          })}
        </div>
      </Card>
      <div style={{ marginTop:12, fontSize:11, color:G400, textAlign:"center" }}>
        Rates in {props.currency||"GBP"} per person per day. 5-day working week assumed. Expenses and travel billed separately.
      </div>
    </div>
  );
}

// ── STEP 5: AI Accelerators ───────────────────────────────────────────────────
function StepAccelerators(props) {
  var d = props.data;
  function toggle(id) {
    var cur = d.selected || [];
    var next = cur.indexOf(id)>=0 ? cur.filter(function(x){return x!==id;}) : cur.concat(id);
    props.onChange(Object.assign({}, d, { selected:next }));
  }
  var sel = d.selected || [];
  return (
    <div style={{ maxWidth:860, margin:"0 auto" }}>
      <SectionTitle title="AI Accelerators" sub="Select NTT DATA AI tools to include — each reduces effort and improves quality" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
        {AI_ACCELERATORS.map(function(a) {
          var active = sel.indexOf(a.id) >= 0;
          return (
            <div key={a.id} onClick={function(){toggle(a.id);}}
              style={{ padding:"20px", borderRadius:12, border:"2px solid "+(active?TEAL:G200),
                background:active?TEAL+"08":WHITE, cursor:"pointer", transition:"all 0.2s",
                boxShadow:active?"0 4px 16px "+TEAL+"25":"0 2px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <span style={{ fontSize:28 }}>{a.icon}</span>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:GREEN, background:GREEN+"15",
                    padding:"2px 8px", borderRadius:4 }}>-{Math.round(a.saving*100)}% effort</span>
                  <div style={{ width:22, height:22, borderRadius:"50%", border:"2px solid "+(active?TEAL:G300),
                    background:active?TEAL:WHITE, display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, color:WHITE, fontWeight:700 }}>{active?"✓":""}</div>
                </div>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:active?TEAL:G800, marginBottom:6 }}>{a.label}</div>
              <div style={{ fontSize:11, color:G600, lineHeight:1.5, marginBottom:10 }}>{a.desc}</div>
              <div style={{ fontSize:11, fontWeight:600, color:active?TEAL:G400 }}>
                Tool licence / setup: £{(a.cost/1000).toFixed(0)}K
              </div>
            </div>
          );
        })}
      </div>
      {sel.length > 0 && (
        <Card style={{ borderLeft:"4px solid "+GREEN }}>
          <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:10 }}>Combined Accelerator Impact</div>
          <div style={{ display:"flex", gap:24 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:GREEN }}>
                {Math.round((1 - sel.reduce(function(acc,id){
                  var a = AI_ACCELERATORS.find(function(x){return x.id===id;});
                  return acc * (1 - (a?a.saving:0));
                },1)) * 100)}%
              </div>
              <div style={{ fontSize:11, color:G600 }}>Total effort reduction</div>
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:AMBER }}>
                £{(sel.reduce(function(acc,id){
                  var a = AI_ACCELERATORS.find(function(x){return x.id===id;});
                  return acc + (a?a.cost:0);
                },0)/1000).toFixed(0)}K
              </div>
              <div style={{ fontSize:11, color:G600 }}>Tool investment</div>
            </div>
            <div style={{ fontSize:11, color:G600, maxWidth:300, lineHeight:1.5 }}>
              Effort savings are applied multiplicatively. Net saving is less than the sum of individual savings.
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── ESTIMATION ENGINE ─────────────────────────────────────────────────────────
function computeEstimate(project, modules, requirements, rateCard, accelerators) {
  var selMods = modules.selected || [];
  var selAcc  = accelerators.selected || [];
  var margin  = (project.margin||35) / 100;
  var contingency = (project.contingency||15) / 100;
  var contractType = project.contractType || "T&M";

  // Effort multiplier from migration type
  var migMult = { "Lift & Shift":0.75, "Re-configure":1.0, "Re-build":1.5 }[requirements.migrationType||"Re-configure"] || 1.0;

  // AI saving multiplier
  var aiMult = selAcc.reduce(function(acc, id) {
    var a = AI_ACCELERATORS.find(function(x){ return x.id===id; });
    return acc * (1 - (a?a.saving:0));
  }, 1);

  var moduleResults = [];
  var totalDays = 0;

  selMods.forEach(function(modId) {
    var modDef = GW_MODULES.find(function(m){ return m.id===modId; });
    if (!modDef) return;
    var req = requirements[modId] || {};
    var complexity = req.complexity || "medium";
    var cMult = COMPLEXITY_MULT[complexity] || 1.0;

    // Base weeks from complexity band
    var baseWks = modDef.baseWeeks.med;
    if (complexity === "low") baseWks = modDef.baseWeeks.low;
    if (complexity === "high" || complexity === "critical") baseWks = modDef.baseWeeks.high;

    // Adjustments for scope size
    var screenAdj  = ((req.customScreens||10) - 10) * 0.8;
    var integAdj   = ((req.integrations||5)   - 5)  * 1.2;
    var lobAdj     = ((req.productLines||2)   - 2)  * 2.5;
    var gosuAdj    = ((req.gosuLoc||5)        - 5)  * 0.3;
    var testAdj    = ((req.testCases||50)     - 50) * 0.02;
    var envAdj     = ((requirements.environments||4) - 4) * 0.5;
    var parallelAdj= (requirements.parallelRun||4) * 0.25;

    var totalWeeks = Math.max(4, (baseWks + screenAdj + integAdj + lobAdj + gosuAdj + testAdj + envAdj + parallelAdj) * cMult * migMult);

    // Testing effort: base 20%, AI testing reduces to 14%
    var testPct = selAcc.indexOf("ai_testing") >= 0 ? 0.14 : 0.20;

    // Days breakdown
    var devDays  = Math.round(totalWeeks * 5 * 0.65 * aiMult);
    var testDays = Math.round(totalWeeks * 5 * testPct * aiMult);
    var baDays   = Math.round(totalWeeks * 5 * 0.20 * (selAcc.indexOf("req_gathering")>=0?0.85:1.0));
    var pmDays   = Math.round(totalWeeks * 5 * 0.10);
    var archDays = Math.round(totalWeeks * 5 * 0.08);
    var devopsDays= Math.round(totalWeeks * 5 * 0.05);

    var modDays = devDays + testDays + baDays + pmDays + archDays + devopsDays;
    totalDays += modDays;

    // Costs — simplified: use primary roles
    var primaryRoles = modDef.roles;
    var internalDayCost = primaryRoles.reduce(function(sum, r) {
      return sum + ((rateCard[r]||{}).internal||700);
    }, 0) / primaryRoles.length;
    var externalDayCost = primaryRoles.reduce(function(sum, r) {
      return sum + ((rateCard[r]||{}).external||1100);
    }, 0) / primaryRoles.length;

    var internalCost = modDays * internalDayCost;
    var externalPrice= modDays * externalDayCost;

    moduleResults.push({
      id: modId,
      label: modDef.label,
      color: modDef.color,
      complexity: complexity,
      totalWeeks: Math.round(totalWeeks),
      totalDays: modDays,
      devDays, testDays, baDays, pmDays, archDays, devopsDays,
      internalCost, externalPrice
    });
  });

  // Global testing overhead (QA Lead + infrastructure)
  var qaLeadDays  = Math.round(totalDays * 0.05);
  var qaEngDays   = Math.round(totalDays * 0.10 * (selAcc.indexOf("ai_testing")>=0 ? 0.60 : 1.0));
  var aiTestDays  = selAcc.indexOf("ai_testing")>=0 ? Math.round(totalDays * 0.04) : 0;

  var globalTestInternal = qaLeadDays * ((rateCard["QA Lead"]||{}).internal||700)
    + qaEngDays * ((rateCard["QA Engineer"]||{}).internal||550)
    + aiTestDays * ((rateCard["AI Test Engineer"]||{}).internal||800);
  var globalTestExternal = qaLeadDays * ((rateCard["QA Lead"]||{}).external||1100)
    + qaEngDays * ((rateCard["QA Engineer"]||{}).external||900)
    + aiTestDays * ((rateCard["AI Test Engineer"]||{}).external||1300);

  // PM + SA overhead
  var pmDaysGlobal = Math.round(totalDays * 0.08);
  var saDaysGlobal = Math.round(totalDays * 0.06);
  var changeDays   = Math.round(totalDays * 0.03);

  var overheadInternal = pmDaysGlobal * ((rateCard["Project Manager"]||{}).internal||800)
    + saDaysGlobal * ((rateCard["Solution Architect"]||{}).internal||950)
    + changeDays * ((rateCard["Change Manager"]||{}).internal||700);
  var overheadExternal = pmDaysGlobal * ((rateCard["Project Manager"]||{}).external||1300)
    + saDaysGlobal * ((rateCard["Solution Architect"]||{}).external||1500)
    + changeDays * ((rateCard["Change Manager"]||{}).external||1100);

  // AI tool costs
  var aiToolCost = selAcc.reduce(function(sum,id){
    var a = AI_ACCELERATORS.find(function(x){return x.id===id;});
    return sum + (a?a.cost:0);
  }, 0);
  var techDebtAdj = selAcc.indexOf("tech_debt")>=0 ? -totalDays*0.04*((rateCard["GW Config Developer"]||{}).internal||650) : 0;

  var totalInternalCost = moduleResults.reduce(function(s,m){return s+m.internalCost;},0)
    + globalTestInternal + overheadInternal + aiToolCost + techDebtAdj;
  var totalExternalBase = moduleResults.reduce(function(s,m){return s+m.externalPrice;},0)
    + globalTestExternal + overheadExternal + aiToolCost;

  var externalWithMargin = totalExternalBase * (1 + margin);
  var fixedPrice = contractType === "Fixed Price" || contractType === "T&M+Fixed Hybrid"
    ? externalWithMargin * (1 + contingency) : null;

  // SurePath phase breakdown (on total external price)
  var phases = SUREPATH_PHASES.map(function(ph) {
    return Object.assign({}, ph, {
      cost: externalWithMargin * ph.pct,
      internalCost: totalInternalCost * ph.pct,
      days: Math.round(totalDays * ph.pct)
    });
  });

  // Resource model
  var peakWeeks  = Math.max(...moduleResults.map(function(m){return m.totalWeeks;}));
  var totalWeeks = Math.round(peakWeeks * 1.15 + (requirements.parallelRun||4));

  var resourceModel = [
    { role:"Solution Architect",   days:saDaysGlobal,           phase:"All", peak:1 },
    { role:"Project Manager",      days:pmDaysGlobal,            phase:"All", peak:1 },
    { role:"GW Technical Lead",    days:Math.round(totalDays*0.12), phase:"ELB-CON", peak:selMods.length > 2 ? 2 : 1 },
    { role:"GW Config Developer",  days:Math.round(totalDays*0.25), phase:"CON",     peak:Math.max(2, Math.round(selMods.length*1.5)) },
    { role:"GW BA",                days:Math.round(totalDays*0.15), phase:"INC-ELB-TRN", peak:Math.ceil(selMods.length/2) },
    { role:"GW Integration Dev",   days:Math.round(totalDays*0.10), phase:"ELB-CON", peak: selMods.indexOf("integration")>=0 ? 2 : 1 },
    { role:"Jutro UI Developer",   days: selMods.indexOf("jutro")>=0 ? Math.round(totalDays*0.08):0, phase:"CON", peak:selMods.indexOf("jutro")>=0?2:0 },
    { role:"Data Engineer",        days: selMods.indexOf("datahub")>=0 ? Math.round(totalDays*0.08):0, phase:"ELB-CON-TRN", peak:selMods.indexOf("datahub")>=0?2:0 },
    { role:"QA Lead",              days:qaLeadDays,              phase:"ELB-CON-TRN", peak:1 },
    { role:"QA Engineer",          days:qaEngDays,               phase:"CON-TRN",     peak:Math.ceil(selMods.length/2) },
    { role:"AI Test Engineer",     days:aiTestDays,              phase:"CON-TRN",     peak:selAcc.indexOf("ai_testing")>=0?1:0 },
    { role:"DevOps / Cloud Eng",   days:Math.round(totalDays*0.06), phase:"All",      peak:1 },
    { role:"Change Manager",       days:changeDays,              phase:"TRN-HYP",     peak:1 },
    { role:"Technical Writer",     days:Math.round(totalDays*0.02), phase:"TRN-HYP", peak:1 }
  ].filter(function(r){ return r.days > 0; });

  return {
    moduleResults, phases, resourceModel,
    totalDays: totalDays + qaLeadDays + qaEngDays + aiTestDays + pmDaysGlobal + saDaysGlobal + changeDays,
    totalWeeks,
    totalInternalCost,
    externalWithMargin,
    fixedPrice,
    aiToolCost,
    techDebtSaving: -techDebtAdj,
    selMods, selAcc
  };
}

// ── STEP 6: Dashboard ─────────────────────────────────────────────────────────
function Dashboard(props) {
  var est = props.estimate;
  var proj= props.project;
  var sym = proj.currency==="USD"?"$":proj.currency==="EUR"?"€":proj.currency==="INR"?"₹":"£";
  var fmtC = function(n){ return sym + (n>=1000000?(n/1000000).toFixed(2)+"M":Math.round(n/1000)+"K"); };

  var [activeSection, setActiveSection] = useState("overview");
  var sections = [
    { id:"overview",   label:"Overview" },
    { id:"phases",     label:"SurePath Phases" },
    { id:"modules",    label:"Module Breakdown" },
    { id:"resources",  label:"Resource Model" },
    { id:"testing",    label:"Testing & QA" },
    { id:"commercial", label:"Commercial" }
  ];

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:900, color:G900 }}>{proj.name||"GW Cloud Migration"}</div>
          <div style={{ fontSize:13, color:G600 }}>{proj.client||""} · {proj.contractType||"T&M"} · {proj.currency||"GBP"}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Pill label={"v"+proj.fromVersion+" → "+proj.toVersion} color={BLUE} bg={BLUE+"12"} border={BLUE+"30"} />
          <Pill label={est.selMods.length+" Modules"} color={TEAL} bg={TEAL+"12"} border={TEAL+"30"} />
          <Pill label={est.selAcc.length+" AI Accelerators"} color={GREEN} bg={GREEN+"12"} border={GREEN+"30"} />
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Total Effort", value:fmtN(est.totalDays)+" days", sub:est.totalWeeks+" weeks", color:BLUE },
          { label:"Internal Cost", value:fmtC(est.totalInternalCost), sub:"NTT DATA cost", color:PURPLE },
          { label:"External Price", value:fmtC(est.externalWithMargin), sub:"T&M client price", color:GREEN },
          { label:"Fixed Price", value:est.fixedPrice?fmtC(est.fixedPrice):"N/A", sub:"incl. contingency", color:AMBER },
          { label:"AI Saving", value:est.techDebtSaving>0?fmtC(est.techDebtSaving+est.aiToolCost*0.5):"N/A", sub:"est. cost avoidance", color:TEAL }
        ].map(function(kpi, i) {
          return (
            <Card key={i} style={{ textAlign:"center", borderTop:"3px solid "+kpi.color }}>
              <div style={{ fontSize:11, color:G600, marginBottom:4 }}>{kpi.label}</div>
              <div style={{ fontSize:18, fontWeight:900, color:kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize:10, color:G400, marginTop:2 }}>{kpi.sub}</div>
            </Card>
          );
        })}
      </div>

      {/* Section nav */}
      <div style={{ display:"flex", gap:4, borderBottom:"2px solid "+G200, marginBottom:24 }}>
        {sections.map(function(s) {
          var active = activeSection === s.id;
          return (
            <button key={s.id} onClick={function(){setActiveSection(s.id);}}
              style={{ padding:"9px 16px", border:"none", background:"transparent", cursor:"pointer",
                fontWeight:active?700:500, fontSize:12, color:active?BLUE:G600,
                borderBottom:active?"3px solid "+BLUE:"3px solid transparent", marginBottom:-2 }}>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── Overview ── */}
      {activeSection==="overview" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Module Effort Split</div>
            {est.moduleResults.map(function(m) {
              var share = pct(m.totalDays, est.totalDays);
              return (
                <div key={m.id} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:m.color }}>{m.label}</span>
                    <span style={{ fontSize:11, color:G600 }}>{fmtN(m.totalDays)} days · {m.totalWeeks} wks · {share}%</span>
                  </div>
                  <Bar pct={share} color={m.color} h={8} />
                </div>
              );
            })}
          </Card>

          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>SurePath Phase Cost</div>
            {est.phases.map(function(ph) {
              return (
                <div key={ph.id} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:ph.color }}>{ph.label}</span>
                    <span style={{ fontSize:11, color:G600 }}>{fmtC(ph.cost)} · {ph.days} days</span>
                  </div>
                  <Bar pct={Math.round(ph.pct*100)} color={ph.color} h={8} />
                </div>
              );
            })}
          </Card>

          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>T&M vs Fixed Price</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div style={{ background:BLUE+"0A", borderRadius:10, padding:"16px", border:"1px solid "+BLUE+"30" }}>
                <div style={{ fontSize:11, color:G600, marginBottom:4 }}>T&M Price</div>
                <div style={{ fontSize:24, fontWeight:900, color:BLUE }}>{fmtC(est.externalWithMargin)}</div>
                <div style={{ fontSize:10, color:G400, marginTop:4 }}>No contingency · Actual days billed</div>
                <div style={{ fontSize:10, color:G400 }}>Margin: {proj.margin||35}%</div>
              </div>
              <div style={{ background:AMBER+"0A", borderRadius:10, padding:"16px", border:"1px solid "+AMBER+"30" }}>
                <div style={{ fontSize:11, color:G600, marginBottom:4 }}>Fixed Price</div>
                <div style={{ fontSize:24, fontWeight:900, color:AMBER }}>{est.fixedPrice?fmtC(est.fixedPrice):"N/A"}</div>
                <div style={{ fontSize:10, color:G400, marginTop:4 }}>Includes {proj.contingency||15}% contingency</div>
                <div style={{ fontSize:10, color:G400 }}>T&M + {fmtC(est.fixedPrice ? est.fixedPrice-est.externalWithMargin : 0)} buffer</div>
              </div>
            </div>
            <div style={{ marginTop:14, fontSize:11, color:G600 }}>
              <strong>Recommendation:</strong> {(proj.contractType||"T&M")==="Fixed Price"
                ? "Fixed price agreed — ensure change control is robust. Use contingency only for genuine scope changes."
                : (proj.contractType||"T&M")==="T&M"
                  ? "T&M gives flexibility for evolving scope. Monthly billing against agreed work packages."
                  : "Hybrid model: Fixed for Inception/Elaboration, T&M for Construction and beyond."}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Cost Breakdown</div>
            {[
              { label:"Module Delivery (Dev + Config)", val:est.moduleResults.reduce(function(s,m){return s+m.internalCost;},0), color:BLUE },
              { label:"QA / Testing", val:est.moduleResults.reduce(function(s,m){return s+m.testDays*(rateCard=>700)(est);},0) || est.totalInternalCost*0.18, color:TEAL },
              { label:"Project Mgmt & Architecture", val:est.totalInternalCost*0.12, color:PURPLE },
              { label:"AI Accelerator Tools", val:est.aiToolCost, color:GREEN },
              { label:"DevOps & Environments", val:est.totalInternalCost*0.05, color:ORANGE }
            ].map(function(row) {
              var share = pct(row.val, est.totalInternalCost);
              return (
                <div key={row.label} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:row.color, flexShrink:0 }} />
                  <span style={{ fontSize:11, color:G800, flex:1 }}>{row.label}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:row.color, minWidth:70, textAlign:"right" }}>{fmtC(row.val)}</span>
                  <span style={{ fontSize:10, color:G400, minWidth:30, textAlign:"right" }}>{share}%</span>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* ── SurePath Phases ── */}
      {activeSection==="phases" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:20 }}>
            {est.phases.map(function(ph) {
              return (
                <Card key={ph.id} style={{ borderTop:"4px solid "+ph.color, textAlign:"center" }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:ph.color,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:WHITE, fontWeight:900, fontSize:13, margin:"0 auto 10px" }}>{ph.short}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:ph.color, marginBottom:4 }}>{ph.label}</div>
                  <div style={{ fontSize:11, color:G600, marginBottom:10, minHeight:36, lineHeight:1.5 }}>{ph.desc}</div>
                  <div style={{ fontSize:18, fontWeight:900, color:G800 }}>{fmtC(ph.cost)}</div>
                  <div style={{ fontSize:10, color:G400, marginTop:2 }}>External price</div>
                  <div style={{ marginTop:6, fontSize:11, color:G600 }}>{ph.days} days · {Math.round(ph.pct*100)}%</div>
                  <div style={{ marginTop:8 }}><Bar pct={Math.round(ph.pct*100)} color={ph.color} h={5} /></div>
                </Card>
              );
            })}
          </div>
          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Phase Cost Comparison: Internal vs External</div>
            {est.phases.map(function(ph) {
              return (
                <div key={ph.id} style={{ display:"grid", gridTemplateColumns:"120px 1fr 1fr", gap:12, alignItems:"center", marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:ph.color }}>{ph.label}</div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:10, color:G600 }}>Internal</span>
                      <span style={{ fontSize:10, fontWeight:700, color:PURPLE }}>{fmtC(ph.internalCost)}</span>
                    </div>
                    <Bar pct={pct(ph.internalCost, est.totalInternalCost)*2} color={PURPLE} h={6} />
                  </div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:10, color:G600 }}>External</span>
                      <span style={{ fontSize:10, fontWeight:700, color:GREEN }}>{fmtC(ph.cost)}</span>
                    </div>
                    <Bar pct={pct(ph.cost, est.externalWithMargin)*2} color={GREEN} h={6} />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* ── Module Breakdown ── */}
      {activeSection==="modules" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
          {est.moduleResults.map(function(m) {
            var efforts = [
              { label:"Dev / Config", days:m.devDays, color:m.color },
              { label:"Testing",      days:m.testDays, color:TEAL },
              { label:"BA / Analysis",days:m.baDays,   color:AMBER },
              { label:"PM",           days:m.pmDays,   color:PURPLE },
              { label:"Architecture", days:m.archDays, color:BLUE },
              { label:"DevOps",       days:m.devopsDays, color:ORANGE }
            ];
            return (
              <Card key={m.id} style={{ borderLeft:"4px solid "+m.color }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:m.color }}>{m.label}</div>
                  <div style={{ display:"flex", gap:6 }}>
                    <Pill label={COMPLEXITY_LABELS[m.complexity]} color={COMPLEXITY_MULT[m.complexity]>=1.4?RED:COMPLEXITY_MULT[m.complexity]>=1.0?AMBER:GREEN} />
                    <Pill label={m.totalWeeks+" wks"} color={BLUE} bg={BLUE+"12"} border={BLUE+"30"} />
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                  <div style={{ background:G100, borderRadius:8, padding:"10px", textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:G800 }}>{fmtN(m.totalDays)}</div>
                    <div style={{ fontSize:10, color:G600 }}>Total Days</div>
                  </div>
                  <div style={{ background:GREEN+"0D", borderRadius:8, padding:"10px", textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:GREEN }}>{fmtC(m.externalPrice)}</div>
                    <div style={{ fontSize:10, color:G600 }}>External Price</div>
                  </div>
                </div>
                {efforts.filter(function(e){return e.days>0;}).map(function(e) {
                  return (
                    <div key={e.label} style={{ marginBottom:7 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                        <span style={{ fontSize:11, color:G600 }}>{e.label}</span>
                        <span style={{ fontSize:11, fontWeight:600, color:e.color }}>{e.days} days</span>
                      </div>
                      <Bar pct={pct(e.days, m.totalDays)*1.5} color={e.color} h={5} />
                    </div>
                  );
                })}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Resource Model ── */}
      {activeSection==="resources" && (
        <div>
          <Card style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Resource Plan — {est.totalWeeks} Week Programme</div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 80px 80px 80px 120px 120px", gap:0 }}>
              {["ROLE","DAYS","PEAK FTE","PHASE","INT. COST","EXT. PRICE"].map(function(h,i) {
                return (
                  <div key={i} style={{ padding:"8px 10px", background:G100, fontSize:10, fontWeight:700, color:G600,
                    borderBottom:"1px solid "+G200, borderRadius:i===0?"8px 0 0 0":i===5?"0 8px 0 0":"0" }}>{h}</div>
                );
              })}
              {est.resourceModel.map(function(r, idx) {
                var intRate = (props.rateCard[r.role]||{}).internal||700;
                var extRate = (props.rateCard[r.role]||{}).external||1100;
                var even = idx%2===0;
                return [
                  <div key={r.role+"n"} style={{ padding:"9px 10px", background:even?WHITE:G50, fontSize:12, fontWeight:600, color:G800, borderBottom:"1px solid "+G200 }}>{r.role}</div>,
                  <div key={r.role+"d"} style={{ padding:"9px 10px", background:even?WHITE:G50, fontSize:12, color:G800, textAlign:"center", borderBottom:"1px solid "+G200 }}>{r.days}</div>,
                  <div key={r.role+"f"} style={{ padding:"9px 10px", background:even?WHITE:G50, fontSize:12, color:r.peak>0?BLUE:G400, fontWeight:r.peak>0?700:400, textAlign:"center", borderBottom:"1px solid "+G200 }}>{r.peak}</div>,
                  <div key={r.role+"p"} style={{ padding:"9px 10px", background:even?WHITE:G50, fontSize:10, color:G600, borderBottom:"1px solid "+G200 }}>{r.phase}</div>,
                  <div key={r.role+"i"} style={{ padding:"9px 10px", background:even?WHITE:G50, fontSize:11, color:PURPLE, fontWeight:600, textAlign:"right", borderBottom:"1px solid "+G200 }}>{fmtC(r.days*intRate)}</div>,
                  <div key={r.role+"e"} style={{ padding:"9px 10px", background:even?WHITE:G50, fontSize:11, color:GREEN, fontWeight:600, textAlign:"right", borderBottom:"1px solid "+G200 }}>{fmtC(r.days*extRate)}</div>
                ];
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── Testing & QA ── */}
      {activeSection==="testing" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Testing Effort by Module</div>
            {est.moduleResults.map(function(m) {
              var testPct = pct(m.testDays, m.totalDays);
              return (
                <div key={m.id} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:m.color }}>{m.label}</span>
                    <span style={{ fontSize:11, color:G600 }}>{m.testDays} days · {testPct}% of module</span>
                  </div>
                  <Bar pct={testPct*2} color={m.color} h={7} />
                </div>
              );
            })}
          </Card>

          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>AI Testing Impact</div>
            {est.selAcc.indexOf("ai_testing") >= 0 ? (
              <div>
                <div style={{ background:GREEN+"0A", borderRadius:10, padding:"14px", border:"1px solid "+GREEN+"30", marginBottom:12 }}>
                  <div style={{ fontSize:24, fontWeight:900, color:GREEN }}>-30%</div>
                  <div style={{ fontSize:12, color:G800 }}>Testing effort reduction via AI test generation</div>
                  <div style={{ fontSize:11, color:G600, marginTop:4 }}>Self-healing scripts · Automated regression · Intelligent test selection</div>
                </div>
                <div style={{ fontSize:11, color:G800, lineHeight:1.7 }}>
                  <div style={{ marginBottom:6 }}>✓ Auto-generated test cases from Gosu code analysis</div>
                  <div style={{ marginBottom:6 }}>✓ Self-healing test scripts for PCF screen changes</div>
                  <div style={{ marginBottom:6 }}>✓ AI-driven regression scope selection (run only impacted tests)</div>
                  <div style={{ marginBottom:6 }}>✓ Coverage reporting integrated with CI/CD pipeline</div>
                </div>
              </div>
            ) : (
              <div style={{ padding:"20px", textAlign:"center", color:G400 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🤖</div>
                <div style={{ fontSize:13, fontWeight:600 }}>AI Testing not selected</div>
                <div style={{ fontSize:11, marginTop:4 }}>Enable in Accelerators step to see ~30% testing effort reduction</div>
              </div>
            )}
          </Card>

          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Test Strategy by Phase</div>
            {[
              { phase:"Inception", type:"Test Planning", effort:"Low", desc:"Test strategy document, environment plan" },
              { phase:"Elaboration", type:"Unit + Integration Setup", effort:"Medium", desc:"Test framework setup, smoke tests, API tests" },
              { phase:"Construction", type:"SIT + Regression", effort:"High", desc:"System integration testing, automated regression per sprint" },
              { phase:"Transition", type:"UAT + Performance", effort:"Critical", desc:"Client-led UAT, load testing, parallel run validation" },
              { phase:"Hypercare", type:"Production Monitoring", effort:"Low", desc:"Defect triage, smoke tests post go-live" }
            ].map(function(row, i) {
              var effortColors = { Low:GREEN, Medium:AMBER, High:ORANGE, Critical:RED };
              return (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10,
                  padding:"10px 12px", borderRadius:8, background:G50, border:"1px solid "+G200 }}>
                  <div style={{ minWidth:80, fontSize:11, fontWeight:700,
                    color:(SUREPATH_PHASES.find(function(p){return p.label===row.phase;})||{color:BLUE}).color }}>{row.phase}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:G800, marginBottom:2 }}>{row.type}</div>
                    <div style={{ fontSize:11, color:G600 }}>{row.desc}</div>
                  </div>
                  <Pill label={row.effort} color={effortColors[row.effort]} bg={effortColors[row.effort]+"15"} border={effortColors[row.effort]+"40"} />
                </div>
              );
            })}
          </Card>

          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Tech Debt Impact</div>
            {est.selAcc.indexOf("tech_debt") >= 0 ? (
              <div>
                <div style={{ background:TEAL+"0A", borderRadius:10, padding:"14px", border:"1px solid "+TEAL+"30", marginBottom:12 }}>
                  <div style={{ fontSize:24, fontWeight:900, color:TEAL }}>{est.techDebtSaving > 0 ? fmtC(est.techDebtSaving) : "~20%"}</div>
                  <div style={{ fontSize:12, color:G800 }}>Estimated rework avoided via early debt detection</div>
                </div>
                <div style={{ fontSize:11, color:G800, lineHeight:1.7 }}>
                  <div style={{ marginBottom:6 }}>✓ 300+ Gosu anti-pattern library scans codebase pre-migration</div>
                  <div style={{ marginBottom:6 }}>✓ Severity-ranked remediation backlog created in Inception</div>
                  <div style={{ marginBottom:6 }}>✓ Prevents late-stage surprises during cloud compliance review</div>
                  <div style={{ marginBottom:6 }}>✓ Feeds directly into Construction sprint planning</div>
                </div>
              </div>
            ) : (
              <div style={{ padding:"20px", textAlign:"center", color:G400 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                <div style={{ fontSize:13, fontWeight:600 }}>Tech Debt Radar not selected</div>
                <div style={{ fontSize:11, marginTop:4 }}>Enable in Accelerators step to quantify Gosu refactoring scope</div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Commercial ── */}
      {activeSection==="commercial" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Price Build-Up</div>
            {[
              { label:"Base Delivery Cost (Internal)", val:est.totalInternalCost - est.aiToolCost, color:G800 },
              { label:"AI Accelerator Tools", val:est.aiToolCost, color:GREEN },
              { label:"Sub-total Internal Cost", val:est.totalInternalCost, color:PURPLE, bold:true },
              { label:"External Rate Premium", val:est.externalWithMargin - est.totalInternalCost, color:AMBER },
              { label:"T&M External Price", val:est.externalWithMargin, color:BLUE, bold:true },
              { label:"Fixed Price Contingency", val:est.fixedPrice ? est.fixedPrice-est.externalWithMargin : 0, color:ORANGE },
              { label:"Fixed Price Total", val:est.fixedPrice||0, color:RED, bold:true }
            ].map(function(row) {
              return (
                <div key={row.label} style={{ display:"flex", justifyContent:"space-between",
                  padding:"8px 0", borderBottom:"1px solid "+G200,
                  fontWeight:row.bold?700:400 }}>
                  <span style={{ fontSize:12, color:row.bold?G900:G600 }}>{row.label}</span>
                  <span style={{ fontSize:12, color:row.color, fontWeight:row.bold?800:600 }}>{fmtC(row.val)}</span>
                </div>
              );
            })}
          </Card>

          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Margin Analysis</div>
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:G600 }}>Gross Margin (T&M)</span>
                <span style={{ fontSize:14, fontWeight:800, color:GREEN }}>{proj.margin||35}%</span>
              </div>
              <Bar pct={proj.margin||35} color={GREEN} h={10} />
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:G600 }}>Effective Margin (Fixed, post-contingency)</span>
                <span style={{ fontSize:14, fontWeight:800, color:AMBER }}>
                  {est.fixedPrice ? Math.round((est.fixedPrice-est.totalInternalCost)/est.fixedPrice*100) : 0}%
                </span>
              </div>
              <Bar pct={est.fixedPrice ? (est.fixedPrice-est.totalInternalCost)/est.fixedPrice*100 : 0} color={AMBER} h={10} />
            </div>
            <div style={{ background:G100, borderRadius:8, padding:"14px", marginTop:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G800, marginBottom:6 }}>Contract Recommendation</div>
              <div style={{ fontSize:11, color:G600, lineHeight:1.7 }}>
                {(proj.contractType||"T&M")==="T&M"
                  ? "T&M: Cap overall programme spend at "+fmtC(est.externalWithMargin*1.1)+" (+10% TBC). Monthly time-sheet approval required."
                  : (proj.contractType||"T&M")==="Fixed Price"
                    ? "Fixed Price: Ensure robust change control. SOW must define clearly what is in/out of scope. Use milestone-based payments."
                    : "Hybrid: Inception + Elaboration on T&M ("+fmtC(est.externalWithMargin*0.22)+"). Construction to Hypercare on Fixed Price ("+fmtC(est.fixedPrice||0)+")."}
              </div>
            </div>
          </Card>

          <Card style={{ gridColumn:"1 / -1" }}>
            <div style={{ fontSize:13, fontWeight:700, color:G800, marginBottom:14 }}>Payment Milestone Schedule</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
              {est.phases.map(function(ph, i) {
                var cumPct = est.phases.slice(0,i+1).reduce(function(s,p){return s+p.pct;},0);
                var milestonePrice = est.fixedPrice
                  ? ph.pct * est.fixedPrice
                  : ph.cost;
                return (
                  <div key={ph.id} style={{ background:ph.color+"0A", borderRadius:10, padding:"14px", border:"1px solid "+ph.color+"30", textAlign:"center" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:ph.color, marginBottom:4 }}>{ph.label.toUpperCase()}</div>
                    <div style={{ fontSize:16, fontWeight:900, color:G800 }}>{fmtC(milestonePrice)}</div>
                    <div style={{ fontSize:10, color:G400, marginTop:2 }}>at {Math.round(cumPct*100)}% complete</div>
                    <div style={{ fontSize:10, color:G600, marginTop:4 }}>{ph.days} days</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── ROOT COMPONENT ────────────────────────────────────────────────────────────
export default function App() {
  var [step, setStep] = useState(0);

  var [project, setProject] = useState({
    name:"", client:"", fromVersion:"9.x", toVersion:"Jasper",
    contractType:"T&M", currency:"GBP", margin:35, contingency:15
  });

  var [modules, setModules] = useState({ selected:["pc","cc","bc"] });

  var [requirements, setRequirements] = useState({
    migrationType:"Re-configure", environments:4, parallelRun:4
  });

  var [rateCard, setRateCard] = useState(DEFAULT_RATES);

  var [accelerators, setAccelerators] = useState({ selected:[] });

  var estimate = useMemo(function() {
    if ((modules.selected||[]).length === 0) return null;
    return computeEstimate(project, modules, requirements, rateCard, accelerators);
  }, [project, modules, requirements, rateCard, accelerators]);

  function canNext() {
    if (step===0) return (project.name||"").trim().length > 0;
    if (step===1) return (modules.selected||[]).length > 0;
    return true;
  }

  return (
    <div style={{ minHeight:"100vh", background:G100, fontFamily:"'Segoe UI',Trebuchet MS,Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ background:BLUE, padding:"0 32px", boxShadow:"0 2px 12px rgba(0,48,135,0.3)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center",
          justifyContent:"space-between", height:56 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <NTTLogo />
            <div style={{ width:1, height:28, background:"rgba(255,255,255,0.25)" }} />
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:WHITE }}>GW Cloud Migration Estimator</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.65)", letterSpacing:0.5 }}>SUREPATH METHODOLOGY · ON-PREMISE TO CLOUD</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {["PC","CC","BC","Jutro","DataHub","Integration"].map(function(m){
              return (
                <span key={m} style={{ fontSize:10, padding:"3px 8px", borderRadius:16,
                  background:"rgba(255,255,255,0.15)", color:WHITE, fontWeight:500 }}>{m}</span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ background:WHITE, padding:"16px 32px", borderBottom:"1px solid "+G200 }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <StepIndicator current={step} onGo={function(s){ if(s<step) setStep(s); }} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px" }}>
        {step===0 && <StepProject data={project} onChange={setProject} />}
        {step===1 && <StepModules data={modules} onChange={setModules} />}
        {step===2 && <StepRequirements data={requirements} selectedModules={modules.selected} onChange={setRequirements} />}
        {step===3 && <StepRateCard data={rateCard} onChange={setRateCard} currency={project.currency} />}
        {step===4 && <StepAccelerators data={accelerators} onChange={setAccelerators} />}
        {step===5 && estimate && <Dashboard estimate={estimate} project={project} rateCard={rateCard} />}
        {step===5 && !estimate && (
          <div style={{ textAlign:"center", padding:"60px", color:AMBER }}>
            <div style={{ fontSize:18, fontWeight:700 }}>⚠ No modules selected — go back and select at least one module</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ position:"sticky", bottom:0, background:WHITE, borderTop:"1px solid "+G200,
        padding:"14px 32px", boxShadow:"0 -4px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            {step > 0 && (
              <button onClick={function(){ setStep(step-1); }}
                style={{ padding:"10px 24px", borderRadius:8, border:"1px solid "+G200,
                  background:WHITE, color:G700, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                ← Back
              </button>
            )}
          </div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            {estimate && step < 5 && (
              <div style={{ fontSize:12, color:G600 }}>
                Est: <strong style={{ color:GREEN }}>
                  {project.currency==="USD"?"$":project.currency==="EUR"?"€":project.currency==="INR"?"₹":"£"}
                  {Math.round(estimate.externalWithMargin/1000)}K
                </strong> · <strong style={{ color:BLUE }}>{estimate.totalWeeks} weeks</strong>
              </div>
            )}
            {step < 5 && (
              <button onClick={function(){ if(canNext()) setStep(step+1); }}
                disabled={!canNext()}
                style={{ padding:"10px 28px", borderRadius:8, border:"none",
                  background:canNext()?BLUE:G300, color:WHITE, fontSize:13, fontWeight:700,
                  cursor:canNext()?"pointer":"not-allowed", transition:"background 0.2s" }}>
                {step===4 ? "View Dashboard →" : "Continue →"}
              </button>
            )}
            {step===5 && (
              <button onClick={function(){ setStep(0); }}
                style={{ padding:"10px 24px", borderRadius:8, border:"1px solid "+BLUE,
                  background:WHITE, color:BLUE, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                New Estimate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
