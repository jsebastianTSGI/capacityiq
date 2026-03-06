// CapacityIQ — browser-compatible React app (no bundler)
const { useState, useMemo, useRef, useEffect, useCallback } = React;

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const STAFF_SEED = [
  { name:"Anne Hasuly",     hoursPerWeek:40, color:"#3b82f6" },
  { name:"Annie Fisher",    hoursPerWeek:40, color:"#8b5cf6" },
  { name:"Barry Geraci",    hoursPerWeek:40, color:"#10b981" },
  { name:"Bill Hentschel",  hoursPerWeek:40, color:"#f59e0b" },
  { name:"Corrin Nolin",    hoursPerWeek:40, color:"#ef4444" },
  { name:"David Buckley",   hoursPerWeek:40, color:"#06b6d4" },
  { name:"Ed Shearer",      hoursPerWeek:40, color:"#84cc16" },
  { name:"Ethan Johnson",   hoursPerWeek:40, color:"#f97316" },
  { name:"Harrison Brann",  hoursPerWeek:40, color:"#ec4899" },
  { name:"Jackie Campbell", hoursPerWeek:40, color:"#a855f7" },
  { name:"Jacob Frost",     hoursPerWeek:40, color:"#14b8a6" },
  { name:"Joshua Sebastian",hoursPerWeek:40, color:"#f43f5e" },
  { name:"Kaitlyn Dunn",    hoursPerWeek:20, color:"#6366f1" },
  { name:"Luke Strawson",   hoursPerWeek:40, color:"#22c55e" },
  { name:"Michael Booth",   hoursPerWeek:40, color:"#fb923c" },
  { name:"Mitchell Levi",   hoursPerWeek:40, color:"#0ea5e9" },
  { name:"Ryan Rendall",    hoursPerWeek:40, color:"#d946ef" },
  { name:"Tyler Zylinski",  hoursPerWeek:40, color:"#facc15" },
];

const PROJECTS_SEED = [
  { id:"0013-054",   name:"LBT - 6psi 30k Tank Barge Design",    status:"Active",    priority:"High",   budget:9000,  hourlyRate:190, color:"#3b82f6" },
  { id:"0106-037",   name:"Blessey - WEB 180 Modifications",      status:"Active",    priority:"Medium", budget:null,  hourlyRate:190, color:"#8b5cf6" },
  { id:"0130-TSGI",  name:"TSGI - Misc Projects",                  status:"Active",    priority:"Low",    budget:null,  hourlyRate:190, color:"#10b981" },
  { id:"0227-004",   name:"Buffalo Marine - B304 Modifications",   status:"Active",    priority:"Medium", budget:null,  hourlyRate:190, color:"#f59e0b" },
  { id:"0227-005",   name:"Buffalo Marine - B305 Modifications",   status:"Active",    priority:"Medium", budget:null,  hourlyRate:190, color:"#ef4444" },
  { id:"0227-006",   name:"Buffalo Marine - B407 Bunker Boom",     status:"Active",    priority:"Low",    budget:null,  hourlyRate:190, color:"#06b6d4" },
  { id:"0248-023",   name:"Kinder Morgan - Dock Barge Design",     status:"Active",    priority:"High",   budget:22500, hourlyRate:190, color:"#84cc16" },
  { id:"0274-25427", name:"BHGI - Transverse Strength Analysis",   status:"Active",    priority:"High",   budget:15000, hourlyRate:190, color:"#f97316" },
  { id:"0274-26430", name:"BHGI - EIV Capital",                    status:"Active",    priority:"Medium", budget:null,  hourlyRate:190, color:"#ec4899" },
  { id:"0274-26XXX", name:"BHGI - GDEB Sea Shuttle",               status:"Active",    priority:"Medium", budget:null,  hourlyRate:190, color:"#a855f7" },
  { id:"0274-XX2",   name:"BHGI - ULA Construction Oversight",     status:"Active",    priority:"Low",    budget:null,  hourlyRate:190, color:"#14b8a6" },
  { id:"0363-006",   name:"DonJon - Crane Barge Design",           status:"Active",    priority:"High",   budget:null,  hourlyRate:190, color:"#f43f5e" },
  { id:"0372-004",   name:"TXDOT - Maintenance Oversight",         status:"Active",    priority:"Medium", budget:null,  hourlyRate:190, color:"#6366f1" },
  { id:"0372-005",   name:"TXDOT - Specification Update",          status:"Active",    priority:"Low",    budget:null,  hourlyRate:190, color:"#22c55e" },
  { id:"0382-XXX",   name:"JFB - Spud Modifications",              status:"Active",    priority:"Low",    budget:null,  hourlyRate:190, color:"#fb923c" },
  { id:"0420-XX1",   name:"Mike Hooks - STROUD Repower",           status:"Tentative", priority:"Medium", budget:null,  hourlyRate:190, color:"#94a3b8" },
  { id:"0420-XX2",   name:"Mike Hooks - 27\" CSD Design",          status:"Tentative", priority:"Medium", budget:null,  hourlyRate:190, color:"#64748b" },
  { id:"0430-004",   name:"MDC - Soo Locks Crane Barge",           status:"Active",    priority:"High",   budget:null,  hourlyRate:190, color:"#0ea5e9" },
  { id:"0430-007",   name:"MDC - MSU Mooring Barge",               status:"Active",    priority:"High",   budget:null,  hourlyRate:190, color:"#d946ef" },
  { id:"0430-008",   name:"MDC - Leonard Widening",                status:"Active",    priority:"Medium", budget:null,  hourlyRate:190, color:"#facc15" },
  { id:"0430-009",   name:"MDC - CELRE Stop Log Barge",            status:"Active",    priority:"Medium", budget:null,  hourlyRate:190, color:"#4ade80" },
  { id:"0430-012",   name:"MDC - BROWNLEE Modifications",          status:"Active",    priority:"High",   budget:null,  hourlyRate:190, color:"#fb7185" },
  { id:"0430-014",   name:"MDC - Soo Locks AE Support",            status:"Tentative", priority:"Low",    budget:null,  hourlyRate:190, color:"#a3e635" },
  { id:"0430-XX1",   name:"MDC - Spud Barge Design",               status:"Tentative", priority:"Medium", budget:null,  hourlyRate:190, color:"#38bdf8" },
  { id:"0430-XX2",   name:"MDC - BGU Mooring Barge Design",        status:"Tentative", priority:"Low",    budget:null,  hourlyRate:190, color:"#c084fc" },
  { id:"0439-001",   name:"Curtin - DB Catalina",                  status:"Active",    priority:"Medium", budget:null,  hourlyRate:190, color:"#34d399" },
  { id:"0461-001",   name:"Shoreline - 180' Crane Barge Design",   status:"Active",    priority:"High",   budget:null,  hourlyRate:190, color:"#fbbf24" },
];

// Allocations stored as 0–100 (percent of that person's available hours/week)
const ALLOC_SEED = [
  {p:"0013-054", who:"Luke Strawson", wk:"2026-05", pct:100},{p:"0013-054", who:"Luke Strawson", wk:"2026-06", pct:100},
  {p:"0106-037", who:"Bill Hentschel", wk:"2026-08", pct:50},{p:"0106-037", who:"Bill Hentschel", wk:"2026-09", pct:50},
  {p:"0130-TSGI", who:"David Buckley", wk:"2026-07", pct:100},{p:"0130-TSGI", who:"David Buckley", wk:"2026-08", pct:100},{p:"0130-TSGI", who:"David Buckley", wk:"2026-09", pct:100},
  {p:"0130-TSGI", who:"Ed Shearer", wk:"2026-03", pct:25},{p:"0130-TSGI", who:"Ed Shearer", wk:"2026-04", pct:25},{p:"0130-TSGI", who:"Ed Shearer", wk:"2026-05", pct:25},{p:"0130-TSGI", who:"Ed Shearer", wk:"2026-06", pct:25},{p:"0130-TSGI", who:"Ed Shearer", wk:"2026-07", pct:25},{p:"0130-TSGI", who:"Ed Shearer", wk:"2026-08", pct:25},{p:"0130-TSGI", who:"Ed Shearer", wk:"2026-09", pct:25},{p:"0130-TSGI", who:"Ed Shearer", wk:"2026-10", pct:25},
  {p:"0130-TSGI", who:"Joshua Sebastian", wk:"2026-07", pct:50},{p:"0130-TSGI", who:"Joshua Sebastian", wk:"2026-08", pct:50},{p:"0130-TSGI", who:"Joshua Sebastian", wk:"2026-09", pct:50},{p:"0130-TSGI", who:"Joshua Sebastian", wk:"2026-10", pct:50},
  {p:"0248-023", who:"Luke Strawson", wk:"2026-10", pct:100},{p:"0248-023", who:"Luke Strawson", wk:"2026-11", pct:100},{p:"0248-023", who:"Luke Strawson", wk:"2026-12", pct:100},{p:"0248-023", who:"Luke Strawson", wk:"2026-13", pct:100},{p:"0248-023", who:"Luke Strawson", wk:"2026-14", pct:100},{p:"0248-023", who:"Luke Strawson", wk:"2026-15", pct:100},
  {p:"0274-26430", who:"Anne Hasuly", wk:"2026-08", pct:100},{p:"0274-26430", who:"Anne Hasuly", wk:"2026-09", pct:100},{p:"0274-26430", who:"Anne Hasuly", wk:"2026-10", pct:100},{p:"0274-26430", who:"Anne Hasuly", wk:"2026-11", pct:50},
  {p:"0274-26430", who:"Michael Booth", wk:"2026-08", pct:100},{p:"0274-26430", who:"Michael Booth", wk:"2026-09", pct:100},{p:"0274-26430", who:"Michael Booth", wk:"2026-10", pct:100},{p:"0274-26430", who:"Michael Booth", wk:"2026-11", pct:100},
  {p:"0363-006", who:"Luke Strawson", wk:"2026-07", pct:100},{p:"0363-006", who:"Luke Strawson", wk:"2026-08", pct:100},{p:"0363-006", who:"Luke Strawson", wk:"2026-09", pct:100},
  {p:"0363-006", who:"Jackie Campbell", wk:"2026-08", pct:50},{p:"0363-006", who:"Jackie Campbell", wk:"2026-09", pct:50},{p:"0363-006", who:"Jackie Campbell", wk:"2026-10", pct:100},{p:"0363-006", who:"Jackie Campbell", wk:"2026-11", pct:100},
  {p:"0372-004", who:"Ryan Rendall", wk:"2026-07", pct:100},{p:"0372-004", who:"Ryan Rendall", wk:"2026-08", pct:100},{p:"0372-004", who:"Ryan Rendall", wk:"2026-09", pct:100},{p:"0372-004", who:"Ryan Rendall", wk:"2026-10", pct:100},{p:"0372-004", who:"Ryan Rendall", wk:"2026-11", pct:100},{p:"0372-004", who:"Ryan Rendall", wk:"2026-12", pct:100},{p:"0372-004", who:"Ryan Rendall", wk:"2026-13", pct:100},{p:"0372-004", who:"Ryan Rendall", wk:"2026-14", pct:100},
  {p:"0372-004", who:"Bill Hentschel", wk:"2026-07", pct:25},{p:"0372-004", who:"Bill Hentschel", wk:"2026-08", pct:25},{p:"0372-004", who:"Bill Hentschel", wk:"2026-09", pct:25},{p:"0372-004", who:"Bill Hentschel", wk:"2026-10", pct:25},{p:"0372-004", who:"Bill Hentschel", wk:"2026-11", pct:25},{p:"0372-004", who:"Bill Hentschel", wk:"2026-12", pct:25},
  {p:"0430-007", who:"Corrin Nolin", wk:"2026-07", pct:100},{p:"0430-007", who:"Corrin Nolin", wk:"2026-08", pct:100},{p:"0430-007", who:"Corrin Nolin", wk:"2026-09", pct:100},{p:"0430-007", who:"Corrin Nolin", wk:"2026-10", pct:100},{p:"0430-007", who:"Corrin Nolin", wk:"2026-11", pct:100},{p:"0430-007", who:"Corrin Nolin", wk:"2026-12", pct:100},{p:"0430-007", who:"Corrin Nolin", wk:"2026-13", pct:100},{p:"0430-007", who:"Corrin Nolin", wk:"2026-14", pct:100},{p:"0430-007", who:"Corrin Nolin", wk:"2026-15", pct:100},{p:"0430-007", who:"Corrin Nolin", wk:"2026-16", pct:100},
  {p:"0430-007", who:"Ethan Johnson", wk:"2026-08", pct:100},{p:"0430-007", who:"Ethan Johnson", wk:"2026-09", pct:50},{p:"0430-007", who:"Ethan Johnson", wk:"2026-10", pct:100},{p:"0430-007", who:"Ethan Johnson", wk:"2026-11", pct:100},{p:"0430-007", who:"Ethan Johnson", wk:"2026-12", pct:100},{p:"0430-007", who:"Ethan Johnson", wk:"2026-13", pct:100},{p:"0430-007", who:"Ethan Johnson", wk:"2026-14", pct:100},{p:"0430-007", who:"Ethan Johnson", wk:"2026-15", pct:100},{p:"0430-007", who:"Ethan Johnson", wk:"2026-16", pct:100},
  {p:"0430-007", who:"Tyler Zylinski", wk:"2026-07", pct:100},{p:"0430-007", who:"Tyler Zylinski", wk:"2026-08", pct:100},
  {p:"0430-012", who:"Annie Fisher", wk:"2026-03", pct:100},{p:"0430-012", who:"Annie Fisher", wk:"2026-04", pct:100},{p:"0430-012", who:"Annie Fisher", wk:"2026-05", pct:100},{p:"0430-012", who:"Annie Fisher", wk:"2026-06", pct:100},{p:"0430-012", who:"Annie Fisher", wk:"2026-07", pct:100},{p:"0430-012", who:"Annie Fisher", wk:"2026-08", pct:100},
  {p:"0430-012", who:"Mitchell Levi", wk:"2026-03", pct:100},{p:"0430-012", who:"Mitchell Levi", wk:"2026-04", pct:100},{p:"0430-012", who:"Mitchell Levi", wk:"2026-05", pct:100},{p:"0430-012", who:"Mitchell Levi", wk:"2026-06", pct:100},{p:"0430-012", who:"Mitchell Levi", wk:"2026-07", pct:100},{p:"0430-012", who:"Mitchell Levi", wk:"2026-08", pct:100},
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getISOWeek(date) {
  const d = new Date(date); d.setHours(0,0,0,0);
  d.setDate(d.getDate()+4-(d.getDay()||7));
  const y=new Date(d.getFullYear(),0,1);
  return `${d.getFullYear()}-${String(Math.ceil((((d-y)/86400000)+1)/7)).padStart(2,"0")}`;
}
function weekStart(yw) {
  const[yr,wk]=yw.split("-").map(Number);
  const jan4=new Date(yr,0,4);
  const s=new Date(jan4); s.setDate(jan4.getDate()-(jan4.getDay()||7)+1);
  const d=new Date(s); d.setDate(d.getDate()+(wk-1)*7); return d;
}
function fmtWk(yw){ return weekStart(yw).toLocaleDateString("en-US",{month:"short",day:"numeric"}); }
function fmtDate(d){ return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }
function generateWeeks(startDate,count){
  const weeks=[]; let cur=new Date(startDate);
  const day=cur.getDay(); cur.setDate(cur.getDate()+(day===0?-6:1-day));
  for(let i=0;i<count;i++){weeks.push(getISOWeek(cur));cur.setDate(cur.getDate()+7);}
  return[...new Set(weeks)];
}
function allocKey(pid,person,wk){ return`${pid}||${person}||${wk}`; }

// Placeholder helpers — stored as "__PH_N__" in the person slot
function phKey(n){ return`__PH_${n}__`; }
function isPH(name){ return typeof name==="string"&&name.startsWith("__PH_")&&name.endsWith("__"); }
function phLabel(name){ const m=name.match(/^__PH_(\d+)__$/); return m?`TBD #${m[1]}`:"TBD"; }
// Placeholders count as a full 40h/wk person for capacity math
function phHoursPerWeek(){ return 40; }

// pct 0–300 for a placeholder; works same as regular person
function getPersonWeekPct(allocMap,pid,person,wk){ return allocMap[allocKey(pid,person,wk)]||0; }

// total % utilisation for a person in a week (sum across all projects)
function personWeekTotalPct(allocMap,person,wk){
  let t=0;
  for(const[k,v] of Object.entries(allocMap)){ const p=k.split("||"); if(p[1]===person&&p[2]===wk) t+=v; }
  return t;
}

// Convert pct allocation to hours for a person in a week (accounts for their hoursPerWeek)
function pctToHours(pct,hoursPerWeek){ return(pct/100)*(hoursPerWeek); }

// total hours a person (or placeholder) is allocated to a project across all weeks
function personProjectHours(allocMap,staffMap,pid,person){
  let t=0;
  const hpw=isPH(person)?phHoursPerWeek():(staffMap[person]?.hoursPerWeek||40);
  for(const[k,v] of Object.entries(allocMap)){
    const p=k.split("||"); if(p[0]===pid&&p[1]===person) t+=pctToHours(v,hpw);
  }
  return t;
}

// total hours allocated to a project (all people + placeholders, all weeks)
function totalHoursForProject(allocMap,staffMap,pid){
  let t=0;
  for(const[k,v] of Object.entries(allocMap)){
    if(k.startsWith(pid+"||")){
      const person=k.split("||")[1];
      const hpw=isPH(person)?phHoursPerWeek():(staffMap[person]?.hoursPerWeek||40);
      t+=pctToHours(v,hpw);
    }
  }
  return t;
}

// total available FTE-equivalent for team in a week (sum of each person's hoursPerWeek / 40)
function teamAvailableFTE(staffList,vacations,wk){
  return staffList.reduce((s,m)=>{
    if(isOnVacation(vacations,m.name,wk)) return s;
    return s+(m.hoursPerWeek/40);
  },0);
}

// hours each person has available in a week (hoursPerWeek minus vacation)
function personAvailableHours(staffMap,vacations,person,wk){
  if(isOnVacation(vacations,person,wk)) return 0;
  return staffMap[person]?.hoursPerWeek||40;
}

// team total allocated hours in a week (includes placeholders; placeholders don't go on vacation)
function teamWeekHours(allocMap,staffMap,vacations,wk){
  let t=0;
  for(const[k,v] of Object.entries(allocMap)){
    const[,person,w]=k.split("||");
    if(w===wk){
      if(isPH(person)){
        t+=pctToHours(v,phHoursPerWeek());
      } else if(!isOnVacation(vacations,person,wk)){
        const hpw=staffMap[person]?.hoursPerWeek||40;
        t+=pctToHours(v,hpw);
      }
    }
  }
  return t;
}

// vacation helpers  { name, startWk, endWk, label }
function isOnVacation(vacations,person,wk){
  return vacations.some(v=>v.name===person&&wk>=v.startWk&&wk<=v.endWk);
}

function fmtH(n){ return Math.round(n)+"h"; }
function fmtDollar(n){ return n==null?"—":"$"+n.toLocaleString(); }

// ─── SMALL UI COMPONENTS ─────────────────────────────────────────────────────
const PRIORITY_CFG={
  High:  {bg:"#450a0a",text:"#fca5a5",border:"#991b1b"},
  Medium:{bg:"#2d1b00",text:"#fde68a",border:"#92400e"},
  Low:   {bg:"#0a1628",text:"#93c5fd",border:"#1e40af"},
};
const STATUS_CFG={
  Active:   {bg:"#052e16",text:"#4ade80",border:"#166534"},
  Tentative:{bg:"#2d1b00",text:"#fbbf24",border:"#78350f"},
  Complete: {bg:"#0f172a",text:"#64748b",border:"#334155"},
};

function Chip({label,cfg,small}){
  const c=cfg[label]||{bg:"#1e2d40",text:"#94a3b8",border:"#334155"};
  return(
    <span style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`,borderRadius:99,
      padding:small?"2px 7px":"3px 10px",fontSize:small?9:11,fontWeight:700,whiteSpace:"nowrap",letterSpacing:.3}}>
      {label}
    </span>
  );
}

// ─── ALLOC CELL (% based) ────────────────────────────────────────────────────
const PCT_STEPS=[0,25,50,75,100];
function AllocCell({pct,onChange,color,overloaded,isVacation}){
  const[editing,setEditing]=useState(false);
  const[draft,setDraft]=useState("");
  const ref=useRef(null);
  useEffect(()=>{ if(editing) ref.current?.select(); },[editing]);

  if(isVacation) return(
    <td title="On vacation" style={{width:52,height:28,background:"#1a0a0a",textAlign:"center",fontSize:9,color:"#7f1d1d"}}>
      🏖
    </td>
  );

  function commit(){
    const n=parseInt(draft);
    if(!isNaN(n)&&n>=0&&n<=100){
      // snap to nearest 25
      const snapped=Math.round(n/25)*25;
      onChange(snapped);
    } else if(draft===""||draft==="0") onChange(0);
    setEditing(false);
  }
  if(editing) return(
    <td style={{padding:0,width:52}}>
      <input ref={ref}
        style={{width:"100%",height:28,textAlign:"center",fontSize:11,background:"#1e3a5f",color:"#fff",
          border:"1px solid #3b82f6",outline:"none",fontFamily:"'DM Mono',monospace"}}
        value={draft} onChange={e=>setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e=>{ if(e.key==="Enter")commit(); if(e.key==="Escape")setEditing(false); }}
        placeholder="0–100"/>
    </td>
  );
  const bg=pct>0?color+"28":"transparent";
  return(
    <td onClick={()=>{ setDraft(pct>0?String(pct):""); setEditing(true); }}
      style={{width:52,height:28,textAlign:"center",fontSize:10,cursor:"pointer",userSelect:"none",
        background:bg,border:pct>0?`1px solid ${color}44`:"1px solid transparent",
        color:overloaded?"#f87171":pct>0?"#e2e8f0":"transparent",
        fontWeight:overloaded?700:500,fontFamily:"'DM Mono',monospace",transition:"background .1s"}}
      title={pct>0?`${pct}% — click to edit`:"Click to set %"}>
      {pct>0?`${pct}%`:"·"}
    </td>
  );
}

// ─── PLACEHOLDER ALLOC CELL (allows 0–300%, represents unassigned headcount) ─
function PlaceholderCell({pct,onChange,color}){
  const[editing,setEditing]=useState(false);
  const[draft,setDraft]=useState("");
  const ref=useRef(null);
  useEffect(()=>{ if(editing) ref.current?.select(); },[editing]);

  function commit(){
    const n=parseInt(draft);
    if(!isNaN(n)&&n>=0&&n<=300){
      const snapped=Math.round(n/25)*25;
      onChange(snapped);
    } else if(draft===""||draft==="0") onChange(0);
    setEditing(false);
  }
  if(editing) return(
    <td style={{padding:0,width:52}}>
      <input ref={ref}
        style={{width:"100%",height:28,textAlign:"center",fontSize:11,background:"#2d1a00",color:"#fde68a",
          border:"1px solid #f59e0b",outline:"none",fontFamily:"'DM Mono',monospace"}}
        value={draft} onChange={e=>setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e=>{ if(e.key==="Enter")commit(); if(e.key==="Escape")setEditing(false); }}
        placeholder="0–300"/>
    </td>
  );
  // each 100% = 1 person; show as persons needed (e.g. 200% = "2×")
  const persons=pct/100;
  const bg=pct>0?"#f59e0b18":"transparent";
  const borderCol=pct>0?"#f59e0b55":"transparent";
  return(
    <td onClick={()=>{ setDraft(pct>0?String(pct):""); setEditing(true); }}
      style={{width:52,height:28,textAlign:"center",fontSize:10,cursor:"pointer",userSelect:"none",
        background:bg,border:`1px solid ${borderCol}`,
        color:pct>0?"#fde68a":"transparent",
        fontWeight:600,fontFamily:"'DM Mono',monospace",transition:"background .1s"}}
      title={pct>0?`${pct}% (≈${persons.toFixed(1)} people) — click to edit`:"Click to reserve unassigned headcount"}>
      {pct>0?(persons===Math.round(persons)?`${Math.round(persons)}×`:`${persons.toFixed(1)}×`):"·"}
    </td>
  );
}
function HealthRing({allocated,estimated}){
  if(!estimated) return(
    <div style={{width:80,height:80,borderRadius:"50%",border:"3px dashed #1e2d40",
      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:9,color:"#374151",textAlign:"center",lineHeight:1.4}}>No<br/>Budget</span>
    </div>
  );
  const pct=Math.min(allocated/estimated,1.5);
  const over=allocated>estimated;
  const color=over?"#f87171":pct>0.8?"#fbbf24":"#34d399";
  const r=32,circ=2*Math.PI*r,dash=Math.min(pct,1)*circ;
  return(
    <div style={{position:"relative",width:80,height:80,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <svg width={80} height={80} style={{position:"absolute",transform:"rotate(-90deg)"}}>
        <circle cx={40} cy={40} r={r} fill="none" stroke="#1e2d40" strokeWidth={6}/>
        <circle cx={40} cy={40} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div style={{textAlign:"center",zIndex:1}}>
        <div style={{fontSize:14,fontWeight:800,color,fontFamily:"'DM Mono',monospace"}}>{Math.round(pct*100)}%</div>
        <div style={{fontSize:8,color:over?"#f87171":"#4ade80",fontWeight:700}}>{over?"OVER":"OK"}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STAFF DETAIL PANEL
// ══════════════════════════════════════════════════════════════════════════════
function StaffDetail({member,staffMap,allocMap,projects,vacations,weeks,onClose,onUpdateStaff,onAddVacation,onRemoveVacation}){
  const[hpwDraft,setHpwDraft]=useState(String(member.hoursPerWeek));
  const[vacForm,setVacForm]=useState({label:"",start:"",end:""});
  const[showVacForm,setShowVacForm]=useState(false);

  useEffect(()=>{ setHpwDraft(String(member.hoursPerWeek)); },[member.name]);

  // Person's project involvement
  const myProjects=projects.filter(proj=>{
    return Object.keys(allocMap).some(k=>k.startsWith(proj.id+"||"+member.name+"||"));
  });

  // Total hours across all projects
  const totalHrs=myProjects.reduce((s,proj)=>s+personProjectHours(allocMap,staffMap,proj.id,member.name),0);

  // Weeks used on this person
  const myVacations=vacations.filter(v=>v.name===member.name);

  function saveHpw(){
    const n=parseInt(hpwDraft);
    if(!isNaN(n)&&n>0&&n<=80) onUpdateStaff(member.name,{hoursPerWeek:n});
  }

  function addVacation(){
    if(!vacForm.start||!vacForm.end) return;
    const startWk=getISOWeek(new Date(vacForm.start+"T12:00:00"));
    const endWk=getISOWeek(new Date(vacForm.end+"T12:00:00"));
    if(startWk>endWk) return;
    onAddVacation({name:member.name, startWk, endWk, label:vacForm.label||"Vacation",
      id:Date.now()+"_"+member.name});
    setVacForm({label:"",start:"",end:""});
    setShowVacForm(false);
  }

  const IS={background:"#0d1117",border:"1px solid #1e2d40",color:"#e2e8f0",
    borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none",width:"100%"};

  return(
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:520,background:"#0d1117",
      borderLeft:"1px solid #1e2d40",zIndex:200,display:"flex",flexDirection:"column",
      boxShadow:"-24px 0 80px #000c"}}>

      {/* Header */}
      <div style={{padding:"18px 22px 14px",borderBottom:"1px solid #1e2d40",background:"#131b2a",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:member.color+"33",
              border:`2px solid ${member.color}`,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:15,fontWeight:700,color:member.color}}>
              {member.name.split(" ").map(n=>n[0]).join("")}
            </div>
            <div>
              <div style={{fontSize:17,fontWeight:700,color:"#f1f5f9"}}>{member.name}</div>
              <div style={{fontSize:11,color:"#475569"}}>{member.hoursPerWeek}h/week available · {myProjects.length} active projects</div>
            </div>
          </div>
          <button onClick={onClose}
            style={{background:"#1e2433",border:"1px solid #1e2d40",color:"#64748b",cursor:"pointer",
              borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
            ✕
          </button>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"18px 22px",display:"flex",flexDirection:"column",gap:16}}>

        {/* Availability setting */}
        <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",padding:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:1,marginBottom:14}}>AVAILABILITY SETTINGS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5}}>Billable Hours / Week</label>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input value={hpwDraft} onChange={e=>setHpwDraft(e.target.value)}
                  style={{...IS,width:80,textAlign:"center",fontFamily:"'DM Mono',monospace"}}
                  onFocus={e=>e.target.style.borderColor="#3b82f6"}
                  onBlur={e=>{ e.target.style.borderColor="#1e2d40"; saveHpw(); }}/>
                <span style={{fontSize:12,color:"#64748b"}}>hrs/week</span>
              </div>
              <div style={{fontSize:10,color:"#374151",marginTop:4}}>40h = full time · 20h = half time</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <div style={{fontSize:11,color:"#64748b"}}>Quick Set</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[10,20,24,32,40].map(h=>(
                  <button key={h} onClick={()=>{ setHpwDraft(String(h)); onUpdateStaff(member.name,{hoursPerWeek:h}); }}
                    style={{padding:"4px 10px",borderRadius:6,fontSize:11,border:"none",cursor:"pointer",fontWeight:600,
                      background:member.hoursPerWeek===h?"#1e40af":"#1e2d40",
                      color:member.hoursPerWeek===h?"#93c5fd":"#64748b"}}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vacation blocks */}
        <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",padding:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:1}}>VACATION & TIME OFF</div>
            <button onClick={()=>setShowVacForm(p=>!p)}
              style={{background:"#1e40af",border:"none",color:"#93c5fd",borderRadius:6,
                padding:"4px 12px",fontSize:11,cursor:"pointer",fontWeight:700}}>
              + Add Block
            </button>
          </div>

          {showVacForm&&(
            <div style={{background:"#0d1117",borderRadius:10,border:"1px solid #1e2d40",padding:14,marginBottom:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div>
                  <label style={{fontSize:10,color:"#64748b",display:"block",marginBottom:4}}>Start Date</label>
                  <input type="date" value={vacForm.start} onChange={e=>setVacForm(p=>({...p,start:e.target.value}))}
                    style={{...IS,fontSize:12,colorScheme:"dark"}}/>
                </div>
                <div>
                  <label style={{fontSize:10,color:"#64748b",display:"block",marginBottom:4}}>End Date</label>
                  <input type="date" value={vacForm.end} onChange={e=>setVacForm(p=>({...p,end:e.target.value}))}
                    style={{...IS,fontSize:12,colorScheme:"dark"}}/>
                </div>
              </div>
              <div style={{marginBottom:10}}>
                <label style={{fontSize:10,color:"#64748b",display:"block",marginBottom:4}}>Label (optional)</label>
                <input value={vacForm.label} onChange={e=>setVacForm(p=>({...p,label:e.target.value}))}
                  placeholder="e.g. PTO, Conference, Holiday…"
                  style={{...IS,fontSize:12}}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={addVacation}
                  style={{background:"#1e40af",border:"none",color:"#93c5fd",borderRadius:7,
                    padding:"7px 16px",fontSize:12,cursor:"pointer",fontWeight:700}}>
                  Save
                </button>
                <button onClick={()=>setShowVacForm(false)}
                  style={{background:"none",border:"1px solid #1e2d40",color:"#64748b",
                    borderRadius:7,padding:"7px 12px",fontSize:12,cursor:"pointer"}}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {myVacations.length===0?(
            <div style={{textAlign:"center",padding:"14px 0",color:"#374151",fontSize:12}}>No time off scheduled</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {myVacations.map(v=>(
                <div key={v.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  background:"#0d1117",borderRadius:8,padding:"9px 12px",border:"1px solid #1e2d40"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14}}>🏖</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"#cbd5e1"}}>{v.label}</div>
                      <div style={{fontSize:10,color:"#475569",fontFamily:"'DM Mono',monospace"}}>
                        {fmtWk(v.startWk)} → {fmtWk(v.endWk)}
                      </div>
                    </div>
                  </div>
                  <button onClick={()=>onRemoveVacation(v.id)}
                    style={{background:"none",border:"1px solid #450a0a",color:"#f87171",
                      borderRadius:6,padding:"3px 10px",fontSize:11,cursor:"pointer"}}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project summary */}
        <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",padding:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:1}}>PROJECT INVOLVEMENT</div>
            <span style={{fontSize:11,color:"#374151"}}>{fmtH(totalHrs)} total allocated</span>
          </div>
          {myProjects.length===0?(
            <div style={{textAlign:"center",padding:"14px 0",color:"#374151",fontSize:12}}>Not assigned to any projects</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {myProjects.map(proj=>{
                const hrs=personProjectHours(allocMap,staffMap,proj.id,member.name);
                const pct=totalHrs>0?Math.round((hrs/totalHrs)*100):0;
                return(
                  <div key={proj.id}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div style={{width:3,height:16,borderRadius:1,background:proj.color}}/>
                        <div>
                          <span style={{fontSize:11,color:"#cbd5e1",fontWeight:500}}>{proj.name}</span>
                          <span style={{fontSize:9,color:"#475569",fontFamily:"'DM Mono',monospace",marginLeft:6}}>{proj.id}</span>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <Chip label={proj.priority} cfg={PRIORITY_CFG} small/>
                        <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#94a3b8"}}>{fmtH(hrs)}</span>
                      </div>
                    </div>
                    <div style={{height:4,background:"#0d1117",borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:proj.color,opacity:.8}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mini timeline: current 12 weeks util */}
        <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",padding:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:1,marginBottom:10}}>WEEKLY UTILIZATION (NEXT 12 WEEKS)</div>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {weeks.slice(0,12).map(wk=>{
              const onVac=isOnVacation(vacations,member.name,wk);
              const totalPct=onVac?0:personWeekTotalPct(allocMap,member.name,wk);
              const color=onVac?"#1a0a0a":totalPct>100?"#f87171":totalPct>85?"#fbbf24":totalPct>0?"#34d399":"#1e2d40";
              const textColor=onVac?"#7f1d1d":totalPct>100?"#f87171":totalPct>85?"#fbbf24":totalPct>0?"#34d399":"#374151";
              return(
                <div key={wk} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,width:48}}>
                  <div style={{fontSize:7,color:"#374151",fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap",textAlign:"center"}}>
                    {fmtWk(wk)}
                  </div>
                  <div style={{width:44,height:36,background:"#0d1117",borderRadius:4,overflow:"hidden",
                    display:"flex",flexDirection:"column",justifyContent:"flex-end",border:`1px solid ${color}33`}}>
                    {!onVac&&<div style={{width:"100%",height:`${Math.min(totalPct,100)}%`,background:color}}/>}
                    {onVac&&<div style={{width:"100%",height:"100%",background:"#1a0a0a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🏖</div>}
                  </div>
                  <span style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:textColor}}>
                    {onVac?"PTO":totalPct>0?`${totalPct}%`:""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROJECT DETAIL PANEL
// ══════════════════════════════════════════════════════════════════════════════
function ProjectDetail({proj,staffList,staffMap,allocMap,vacations,onClose,onUpdateProject}){
  const[budgetInput,setBudgetInput]=useState(proj.budget!=null?String(proj.budget):"");
  const[rateInput,setRateInput]=useState(String(proj.hourlyRate||190));
  const[statusVal,setStatusVal]=useState(proj.status);
  const[priorityVal,setPriorityVal]=useState(proj.priority||"Medium");

  useEffect(()=>{
    setBudgetInput(proj.budget!=null?String(proj.budget):"");
    setRateInput(String(proj.hourlyRate||190));
    setStatusVal(proj.status);
    setPriorityVal(proj.priority||"Medium");
  },[proj.id]);

  function save(extra={}){
    onUpdateProject(proj.id,{
      budget:parseFloat(budgetInput)||null,
      hourlyRate:parseFloat(rateInput)||190,
      status:statusVal,
      priority:priorityVal,
      ...extra
    });
  }

  const rate=parseFloat(rateInput)||190;
  const budget=parseFloat(budgetInput)||null;
  const totalHours=totalHoursForProject(allocMap,staffMap,proj.id);
  const estHours=budget?budget/rate:null;
  const health=estHours?totalHours/estHours:null;
  const healthColor=!health?null:health>1?"#f87171":health>0.8?"#fbbf24":"#34d399";

  const personSummary=staffList
    .map(m=>({...m,hours:personProjectHours(allocMap,staffMap,proj.id,m.name)}))
    .filter(x=>x.hours>0)
    .sort((a,b)=>b.hours-a.hours);

  // Placeholder summary — collect any TBD allocations across all weeks
  const phSummary=[];
  Object.keys(allocMap).forEach(k=>{
    const[pid,person]=k.split("||");
    if(pid===proj.id&&isPH(person)){
      const existing=phSummary.find(x=>x.key===person);
      const hrs=personProjectHours(allocMap,staffMap,proj.id,person);
      if(!existing&&hrs>0) phSummary.push({key:person,label:phLabel(person),hours:hrs});
    }
  });
  phSummary.sort((a,b)=>a.key.localeCompare(b.key));

  const unassigned=staffList.filter(m=>!personSummary.find(x=>x.name===m.name));
  const IS={background:"#0d1117",border:"1px solid #1e2d40",color:"#e2e8f0",
    borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none"};

  return(
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:500,background:"#0d1117",
      borderLeft:"1px solid #1e2d40",zIndex:200,display:"flex",flexDirection:"column",
      boxShadow:"-24px 0 80px #000c"}}>

      <div style={{padding:"18px 22px 14px",borderBottom:"1px solid #1e2d40",background:"#131b2a",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div style={{flex:1,minWidth:0,paddingRight:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{width:4,height:22,borderRadius:2,background:proj.color}}/>
              <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#475569"}}>{proj.id}</span>
            </div>
            <div style={{fontSize:17,fontWeight:700,color:"#f1f5f9",lineHeight:1.3,marginBottom:8}}>{proj.name}</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Chip label={statusVal} cfg={STATUS_CFG}/>
              <Chip label={priorityVal} cfg={PRIORITY_CFG}/>
            </div>
          </div>
          <button onClick={onClose}
            style={{background:"#1e2433",border:"1px solid #1e2d40",color:"#64748b",cursor:"pointer",
              borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
            ✕
          </button>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"18px 22px",display:"flex",flexDirection:"column",gap:16}}>

        {/* Status & Priority */}
        <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",padding:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:1,marginBottom:14}}>PROJECT SETTINGS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5}}>Status</label>
              <select value={statusVal}
                onChange={e=>{ setStatusVal(e.target.value); onUpdateProject(proj.id,{status:e.target.value}); }}
                style={{...IS,width:"100%",cursor:"pointer",
                  color:statusVal==="Active"?"#4ade80":statusVal==="Tentative"?"#fbbf24":"#64748b",fontWeight:700}}>
                {["Active","Tentative","Complete"].map(s=><option key={s} style={{color:"#e2e8f0"}}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5}}>Priority</label>
              <select value={priorityVal}
                onChange={e=>{ setPriorityVal(e.target.value); onUpdateProject(proj.id,{priority:e.target.value}); }}
                style={{...IS,width:"100%",cursor:"pointer",
                  color:priorityVal==="High"?"#fca5a5":priorityVal==="Medium"?"#fde68a":"#93c5fd",fontWeight:700}}>
                {["High","Medium","Low"].map(p=><option key={p} style={{color:"#e2e8f0"}}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Financials */}
        <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",padding:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:1,marginBottom:14}}>PROJECT FINANCIALS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div>
              <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5}}>Contract Value ($)</label>
              <input value={budgetInput} onChange={e=>setBudgetInput(e.target.value)}
                placeholder="e.g. 45000" style={{...IS,width:"100%",fontFamily:"'DM Mono',monospace"}}
                onFocus={e=>e.target.style.borderColor="#3b82f6"}
                onBlur={e=>{ e.target.style.borderColor="#1e2d40"; save(); }}/>
            </div>
            <div>
              <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5}}>Billing Rate ($/hr)</label>
              <input value={rateInput} onChange={e=>setRateInput(e.target.value)}
                placeholder="190" style={{...IS,width:"100%",fontFamily:"'DM Mono',monospace"}}
                onFocus={e=>e.target.style.borderColor="#3b82f6"}
                onBlur={e=>{ e.target.style.borderColor="#1e2d40"; save(); }}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[
              {label:"Budgeted Hours",value:estHours?fmtH(estHours):"—",sub:budget?fmtDollar(budget)+" contract":null,color:"#94a3b8"},
              {label:"Hours Allocated",value:fmtH(totalHours),sub:`${personSummary.length} people assigned`,color:"#e2e8f0"},
              {label:"Variance",
                value:estHours?(totalHours>estHours?"+":"")+fmtH(totalHours-estHours):"—",
                sub:estHours?(totalHours>estHours?"Over budget":"Under budget"):null,
                color:!estHours?"#64748b":totalHours>estHours?"#f87171":totalHours<estHours*0.8?"#34d399":"#fbbf24"},
            ].map(s=>(
              <div key={s.label} style={{background:"#0d1117",borderRadius:8,padding:"10px 12px",border:"1px solid #111827"}}>
                <div style={{fontSize:17,fontWeight:700,color:s.color,fontFamily:"'DM Mono',monospace"}}>{s.value}</div>
                <div style={{fontSize:10,color:"#475569",marginTop:2}}>{s.label}</div>
                {s.sub&&<div style={{fontSize:9,color:"#374151",marginTop:1}}>{s.sub}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Health gauge */}
        <div style={{background:"#131b2a",borderRadius:12,border:`1px solid ${healthColor?healthColor+"44":"#1e2d40"}`,padding:16,
          display:"flex",alignItems:"center",gap:16}}>
          <HealthRing allocated={totalHours} estimated={estHours}/>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:1,marginBottom:8}}>PROJECT HEALTH</div>
            {estHours?(
              <>
                <div style={{height:7,background:"#0d1117",borderRadius:4,overflow:"hidden",marginBottom:7}}>
                  <div style={{width:`${Math.min((totalHours/estHours)*100,100)}%`,height:"100%",background:healthColor,borderRadius:4}}/>
                </div>
                <div style={{fontSize:12,color:"#64748b"}}>
                  {totalHours>estHours
                    ?`⚠ Over by ${fmtH(totalHours-estHours)} — consider scope review`
                    :estHours-totalHours<estHours*.15
                    ?`⚡ ${fmtH(estHours-totalHours)} remaining — nearly fully staffed`
                    :`✓ ${fmtH(estHours-totalHours)} of budget remaining`}
                </div>
              </>
            ):(
              <div style={{fontSize:12,color:"#475569"}}>Enter a budget above to enable health tracking.</div>
            )}
          </div>
        </div>

        {/* Team allocation */}
        <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",padding:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:1}}>TEAM ALLOCATION</div>
            <span style={{fontSize:11,color:"#374151"}}>{personSummary.length} assigned · {fmtH(totalHours)}</span>
          </div>
          {personSummary.length===0&&phSummary.length===0?(
            <div style={{textAlign:"center",padding:"14px 0",color:"#374151",fontSize:12}}>No allocations yet — expand this project in the planner to assign staff.</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {personSummary.map(({name,hours,color:pc})=>{
                const barPct=totalHours>0?(hours/totalHours)*100:0;
                const ofBudget=estHours?Math.round((hours/estHours)*100):null;
                return(
                  <div key={name}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:pc}}/>
                        <span style={{fontSize:12,color:"#cbd5e1"}}>{name}</span>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#94a3b8"}}>{fmtH(hours)}</span>
                        {ofBudget!=null&&<span style={{fontSize:10,color:"#475569"}}>{ofBudget}% of budget</span>}
                      </div>
                    </div>
                    <div style={{height:5,background:"#0d1117",borderRadius:3,overflow:"hidden"}}>
                      <div style={{width:`${barPct}%`,height:"100%",background:proj.color,opacity:.8}}/>
                    </div>
                  </div>
                );
              })}
              {phSummary.length>0&&(
                <>
                  <div style={{fontSize:10,fontWeight:700,color:"#78350f",letterSpacing:.5,marginTop:4,paddingTop:8,borderTop:"1px dashed #1e2d40"}}>
                    ⏳ UNASSIGNED PLACEHOLDERS
                  </div>
                  {phSummary.map(({key,label,hours})=>{
                    const barPct=totalHours>0?(hours/totalHours)*100:0;
                    return(
                      <div key={key}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:12}}>⏳</span>
                            <span style={{fontSize:12,color:"#fde68a",fontWeight:600}}>{label}</span>
                            <span style={{fontSize:10,color:"#78350f"}}>needs assignment</span>
                          </div>
                          <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#f59e0b"}}>{fmtH(hours)}</span>
                        </div>
                        <div style={{height:5,background:"#0d1117",borderRadius:3,overflow:"hidden"}}>
                          <div style={{width:`${barPct}%`,height:"100%",background:"#f59e0b",opacity:.6}}/>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {unassigned.length>0&&personSummary.length>0&&(
          <div style={{background:"#0d1117",borderRadius:10,border:"1px dashed #1e2d40",padding:"12px 14px"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#374151",letterSpacing:1,marginBottom:8}}>NOT ASSIGNED</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {unassigned.map(m=>(
                <span key={m.name} style={{fontSize:11,color:"#475569",background:"#131b2a",
                  border:"1px solid #1e2d40",borderRadius:99,padding:"2px 10px"}}>{m.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ALL PROJECTS DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function ProjectsDashboard({projects,allocMap,staffList,staffMap,onUpdateProject,onSelectProject,onAddProject}){
  const[search,setSearch]=useState("");
  const[sortBy,setSortBy]=useState("priority");
  const[showAdd,setShowAdd]=useState(false);
  const[newProj,setNewProj]=useState({id:"",name:"",status:"Active",priority:"Medium",budget:"",hourlyRate:"190"});

  const COLORS=["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#84cc16","#f97316","#ec4899","#a855f7"];
  const PRIO_ORDER={High:0,Medium:1,Low:2};
  const STAT_ORDER={Active:0,Tentative:1,Complete:2};

  const filtered=projects
    .filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>{
      if(sortBy==="priority") return (PRIO_ORDER[a.priority]??3)-(PRIO_ORDER[b.priority]??3)||(STAT_ORDER[a.status]??3)-(STAT_ORDER[b.status]??3);
      if(sortBy==="status") return (STAT_ORDER[a.status]??3)-(STAT_ORDER[b.status]??3)||a.id.localeCompare(b.id);
      if(sortBy==="hours") return totalHoursForProject(allocMap,staffMap,b.id)-totalHoursForProject(allocMap,staffMap,a.id);
      return a.id.localeCompare(b.id);
    });

  const counts={Active:0,Tentative:0,Complete:0};
  projects.forEach(p=>{ if(counts[p.status]!=null) counts[p.status]++; });
  const totalBooked=projects.filter(p=>p.status!=="Complete").reduce((s,p)=>s+totalHoursForProject(allocMap,staffMap,p.id),0);

  const IS={background:"#0d1117",border:"1px solid #1e2d40",color:"#e2e8f0",borderRadius:7,padding:"7px 10px",fontSize:12,outline:"none",width:"100%"};

  return(
    <div style={{padding:"18px 22px"}}>
      {/* cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {[
          {label:"Active Projects",value:counts.Active,color:"#34d399",sub:"in progress"},
          {label:"Tentative",value:counts.Tentative,color:"#fbbf24",sub:"pending"},
          {label:"Complete",value:counts.Complete,color:"#64748b",sub:"closed"},
          {label:"Total Hrs Booked",value:fmtH(totalBooked),color:"#3b82f6",sub:"active + tentative"},
        ].map(s=>(
          <div key={s.label} style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",padding:"14px 16px"}}>
            <div style={{fontSize:26,fontWeight:800,color:s.color,fontFamily:"'DM Mono',monospace",letterSpacing:"-1px"}}>{s.value}</div>
            <div style={{fontSize:12,fontWeight:600,color:"#94a3b8",marginTop:2}}>{s.label}</div>
            <div style={{fontSize:10,color:"#374151"}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* toolbar */}
      <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects…"
          style={{flex:1,background:"#131b2a",border:"1px solid #1e2d40",color:"#e2e8f0",
            borderRadius:8,padding:"8px 14px",fontSize:13,outline:"none"}}/>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{background:"#131b2a",border:"1px solid #1e2d40",color:"#94a3b8",borderRadius:8,padding:"8px 12px",fontSize:12,cursor:"pointer"}}>
          <option value="priority">Sort: Priority</option>
          <option value="status">Sort: Status</option>
          <option value="id">Sort: ID</option>
          <option value="hours">Sort: Hours</option>
        </select>
        <button onClick={()=>setShowAdd(p=>!p)}
          style={{background:"#1e40af",border:"none",color:"#93c5fd",borderRadius:8,
            padding:"8px 18px",fontSize:13,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap"}}>
          + New Project
        </button>
      </div>

      {showAdd&&(
        <div style={{background:"#131b2a",border:"1px solid #3b82f6",borderRadius:12,padding:16,marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#3b82f6",letterSpacing:1,marginBottom:12}}>NEW PROJECT</div>
          <div style={{display:"grid",gridTemplateColumns:"130px 1fr 120px 120px 130px 120px",gap:10,marginBottom:12}}>
            {[
              {key:"id",label:"Project ID",ph:"0500-001"},
              {key:"name",label:"Project Name",ph:"Client — Description"},
              {key:"status",label:"Status",type:"select",opts:["Active","Tentative","Complete"]},
              {key:"priority",label:"Priority",type:"select",opts:["High","Medium","Low"]},
              {key:"budget",label:"Budget ($)",ph:"45000"},
              {key:"hourlyRate",label:"Rate ($/hr)",ph:"190"},
            ].map(f=>(
              <div key={f.key}>
                <label style={{fontSize:10,color:"#64748b",display:"block",marginBottom:4}}>{f.label}</label>
                {f.type==="select"?(
                  <select value={newProj[f.key]} onChange={e=>setNewProj(p=>({...p,[f.key]:e.target.value}))} style={IS}>
                    {f.opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                ):(
                  <input value={newProj[f.key]} onChange={e=>setNewProj(p=>({...p,[f.key]:e.target.value}))}
                    placeholder={f.ph} style={IS} onKeyDown={e=>e.key==="Enter"&&handleAdd()}/>
                )}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{
              if(!newProj.id.trim()||!newProj.name.trim()) return;
              onAddProject({id:newProj.id.trim(),name:newProj.name.trim(),status:newProj.status,
                priority:newProj.priority,budget:parseFloat(newProj.budget)||null,
                hourlyRate:parseFloat(newProj.hourlyRate)||190,color:COLORS[projects.length%COLORS.length]});
              setNewProj({id:"",name:"",status:"Active",priority:"Medium",budget:"",hourlyRate:"190"});
              setShowAdd(false);
            }}
              style={{background:"#1e40af",border:"none",color:"#93c5fd",borderRadius:8,
                padding:"8px 20px",fontSize:13,cursor:"pointer",fontWeight:700}}>
              Save
            </button>
            <button onClick={()=>setShowAdd(false)}
              style={{background:"none",border:"1px solid #1e2d40",color:"#64748b",borderRadius:8,padding:"8px 14px",fontSize:13,cursor:"pointer"}}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* table */}
      <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"#0d1117",borderBottom:"2px solid #1e2d40"}}>
              {["ID","Project Name","Status","Priority","People","Hrs Alloc.","Budget","Est. Hrs","Health",""].map(h=>(
                <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:10,color:"#475569",fontWeight:700,letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(proj=>{
              const hrs=totalHoursForProject(allocMap,staffMap,proj.id);
              const rate=proj.hourlyRate||190;
              const estH=proj.budget?proj.budget/rate:null;
              const health=estH?hrs/estH:null;
              const hc=!health?null:health>1?"#f87171":health>0.8?"#fbbf24":"#34d399";
              const people=[...new Set(Object.keys(allocMap).filter(k=>k.startsWith(proj.id+"||")).map(k=>k.split("||")[1]))].length;
              const dimmed=proj.status==="Complete";
              return(
                <tr key={proj.id} style={{borderBottom:"1px solid #111827",opacity:dimmed?.5:1}}
                  onMouseEnter={e=>e.currentTarget.style.background="#192030"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"9px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:3,height:32,borderRadius:2,background:proj.color,flexShrink:0}}/>
                      <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#64748b"}}>{proj.id}</span>
                    </div>
                  </td>
                  <td style={{padding:"9px 12px"}}>
                    <span style={{fontSize:13,color:"#e2e8f0",fontWeight:500}}>{proj.name}</span>
                  </td>
                  <td style={{padding:"9px 12px"}}>
                    <select value={proj.status}
                      onChange={e=>onUpdateProject(proj.id,{status:e.target.value})}
                      onClick={e=>e.stopPropagation()}
                      style={{background:"#0d1117",border:"1px solid #1e2d40",cursor:"pointer",borderRadius:6,
                        padding:"4px 8px",fontSize:11,fontWeight:700,
                        color:proj.status==="Active"?"#4ade80":proj.status==="Tentative"?"#fbbf24":"#64748b"}}>
                      {["Active","Tentative","Complete"].map(s=><option key={s} style={{color:"#e2e8f0"}}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"9px 12px"}}>
                    <select value={proj.priority||"Medium"}
                      onChange={e=>onUpdateProject(proj.id,{priority:e.target.value})}
                      onClick={e=>e.stopPropagation()}
                      style={{background:"#0d1117",border:"1px solid #1e2d40",cursor:"pointer",borderRadius:6,
                        padding:"4px 8px",fontSize:11,fontWeight:700,
                        color:(proj.priority==="High")?"#fca5a5":(proj.priority==="Low")?"#93c5fd":"#fde68a"}}>
                      {["High","Medium","Low"].map(p=><option key={p} style={{color:"#e2e8f0"}}>{p}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"9px 12px",textAlign:"center"}}>
                    <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:people>0?"#94a3b8":"#374151"}}>{people||"—"}</span>
                  </td>
                  <td style={{padding:"9px 12px"}}>
                    <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:hrs>0?"#e2e8f0":"#374151"}}>{hrs>0?fmtH(hrs):"—"}</span>
                  </td>
                  <td style={{padding:"9px 12px"}}>
                    <div style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#64748b"}}>{fmtDollar(proj.budget)}</div>
                    {proj.budget&&<div style={{fontSize:9,color:"#374151"}}>@${proj.hourlyRate||190}/hr</div>}
                  </td>
                  <td style={{padding:"9px 12px"}}>
                    <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#64748b"}}>{estH?fmtH(estH):"—"}</span>
                  </td>
                  <td style={{padding:"9px 12px",minWidth:120}}>
                    {health!=null?(
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                          <div style={{flex:1,height:4,background:"#0d1117",borderRadius:2,overflow:"hidden"}}>
                            <div style={{width:`${Math.min(health*100,100)}%`,height:"100%",background:hc}}/>
                          </div>
                          <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:hc}}>{Math.round(health*100)}%</span>
                        </div>
                        {health>1&&<span style={{fontSize:9,color:"#f87171",fontWeight:700}}>OVER</span>}
                      </div>
                    ):<span style={{fontSize:10,color:"#374151"}}>—</span>}
                  </td>
                  <td style={{padding:"9px 12px"}}>
                    <button onClick={()=>onSelectProject(proj)}
                      style={{background:"#1e2d40",border:"none",color:"#94a3b8",borderRadius:6,
                        padding:"5px 12px",fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#1e40af"}
                      onMouseLeave={e=>e.currentTarget.style.background="#1e2d40"}>
                      Detail →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROJECT FULL-PAGE VIEW
// ══════════════════════════════════════════════════════════════════════════════
function ProjectPage({proj,staffList,staffMap,allocMap,vacations,placeholderSlots,weeks,threshold,
  onUpdateProject,onSetAlloc,onSetPlaceholderSlots,onSetAllocMap,onSelectProject,plannerProjects,
  teamWeekData,personWeekData}){

  const[budgetInput,setBudgetInput]=useState(proj.budget!=null?String(proj.budget):"");
  const[rateInput,setRateInput]=useState(String(proj.hourlyRate||190));
  const[statusVal,setStatusVal]=useState(proj.status);
  const[priorityVal,setPriorityVal]=useState(proj.priority||"Medium");
  const[staffSort,setStaffSort]=useState("hours"); // "hours" | "name" | "alpha"

  useEffect(()=>{
    setBudgetInput(proj.budget!=null?String(proj.budget):"");
    setRateInput(String(proj.hourlyRate||190));
    setStatusVal(proj.status);
    setPriorityVal(proj.priority||"Medium");
  },[proj.id]);

  function save(extra={}){
    onUpdateProject(proj.id,{
      budget:parseFloat(budgetInput)||null,
      hourlyRate:parseFloat(rateInput)||190,
      status:statusVal,
      priority:priorityVal,
      ...extra
    });
  }

  const rate=parseFloat(rateInput)||190;
  const budget=parseFloat(budgetInput)||null;
  const totalHours=totalHoursForProject(allocMap,staffMap,proj.id);
  const estHours=budget?budget/rate:null;
  const health=estHours?totalHours/estHours:null;
  const healthColor=!health?null:health>1?"#f87171":health>0.8?"#fbbf24":"#34d399";

  // Per-person hours on this project
  const personData=staffList.map(m=>({
    ...m,
    hours:personProjectHours(allocMap,staffMap,proj.id,m.name),
  }));

  // Placeholder data
  const phSummary=[];
  Object.keys(allocMap).forEach(k=>{
    const[pid,person]=k.split("||");
    if(pid===proj.id&&isPH(person)){
      const hrs=personProjectHours(allocMap,staffMap,proj.id,person);
      if(!phSummary.find(x=>x.key===person)&&hrs>0)
        phSummary.push({key:person,label:phLabel(person),hours:hrs});
    }
  });
  phSummary.sort((a,b)=>a.key.localeCompare(b.key));

  const assignedData=personData.filter(m=>m.hours>0);
  const sortedStaff=[...staffList].sort((a,b)=>{
    if(staffSort==="hours") return personProjectHours(allocMap,staffMap,proj.id,b.name)-personProjectHours(allocMap,staffMap,proj.id,a.name);
    if(staffSort==="name") return a.name.localeCompare(b.name);
    return 0;
  });

  const slots=placeholderSlots[proj.id]||0;
  const LABEL_W=220;
  const IS={background:"#0d1117",border:"1px solid #1e2d40",color:"#e2e8f0",borderRadius:8,padding:"7px 11px",fontSize:12,outline:"none"};

  return(
    <div style={{padding:"12px 18px",display:"flex",gap:12}}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{width:248,flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>

        {/* Project identity card */}
        <div style={{background:"#131b2a",borderRadius:12,border:`2px solid ${proj.color}44`,padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:4,height:32,borderRadius:2,background:proj.color,flexShrink:0}}/>
            <div style={{minWidth:0}}>
              <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#475569",marginBottom:2}}>{proj.id}</div>
              <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis"}}>{proj.name}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            <Chip label={statusVal} cfg={STATUS_CFG}/>
            <Chip label={priorityVal} cfg={PRIORITY_CFG}/>
          </div>
          {/* quick status/priority change */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            <div>
              <div style={{fontSize:9,color:"#475569",marginBottom:3}}>STATUS</div>
              <select value={statusVal}
                onChange={e=>{ setStatusVal(e.target.value); onUpdateProject(proj.id,{status:e.target.value}); }}
                style={{...IS,width:"100%",fontSize:11,fontWeight:700,
                  color:statusVal==="Active"?"#4ade80":statusVal==="Tentative"?"#fbbf24":"#64748b"}}>
                {["Active","Tentative","Complete"].map(s=><option key={s} style={{color:"#e2e8f0"}}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:9,color:"#475569",marginBottom:3}}>PRIORITY</div>
              <select value={priorityVal}
                onChange={e=>{ setPriorityVal(e.target.value); onUpdateProject(proj.id,{priority:e.target.value}); }}
                style={{...IS,width:"100%",fontSize:11,fontWeight:700,
                  color:priorityVal==="High"?"#fca5a5":priorityVal==="Medium"?"#fde68a":"#93c5fd"}}>
                {["High","Medium","Low"].map(p=><option key={p} style={{color:"#e2e8f0"}}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Other projects list (click to switch) */}
        <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",overflow:"hidden"}}>
          <div style={{padding:"7px 12px",borderBottom:"1px solid #1e2d40",fontSize:10,fontWeight:700,color:"#475569",letterSpacing:.5}}>
            OTHER PROJECTS
          </div>
          <div style={{maxHeight:260,overflowY:"auto"}}>
            {plannerProjects.filter(p=>p.id!==proj.id).map(p=>{
              const hrs=totalHoursForProject(allocMap,staffMap,p.id);
              const estH=p.budget?(p.budget/(p.hourlyRate||190)):null;
              const h=estH?hrs/estH:null;
              return(
                <div key={p.id} onClick={()=>onSelectProject(p)}
                  style={{padding:"5px 12px",borderBottom:"1px solid #111827",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#1a2535"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:3,height:22,borderRadius:1,background:p.color,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:4,marginBottom:1}}>
                        <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#475569"}}>{p.id}</span>
                        <Chip label={p.priority||"Medium"} cfg={PRIORITY_CFG} small/>
                      </div>
                      <div style={{fontSize:11,color:"#cbd5e1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                      {estH&&<div style={{marginTop:2,height:2,background:"#0d1117",borderRadius:1,overflow:"hidden"}}>
                        <div style={{width:`${Math.min((hrs/estH)*100,100)}%`,height:"100%",background:h>1?"#f87171":h>0.8?"#fbbf24":"#34d399"}}/>
                      </div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff on this project */}
        <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",overflow:"hidden"}}>
          <div style={{padding:"7px 12px",borderBottom:"1px solid #1e2d40",fontSize:10,fontWeight:700,color:"#475569",letterSpacing:.5}}>
            ASSIGNED STAFF ({assignedData.length})
          </div>
          <div style={{maxHeight:200,overflowY:"auto"}}>
            {assignedData.length===0?(
              <div style={{padding:"12px",fontSize:11,color:"#374151",textAlign:"center"}}>None yet</div>
            ):assignedData.sort((a,b)=>b.hours-a.hours).map(m=>(
              <div key={m.name} style={{padding:"5px 12px",borderBottom:"1px solid #111827"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:m.color}}/>
                    <span style={{fontSize:11,color:"#cbd5e1"}}>{m.name}</span>
                  </div>
                  <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#94a3b8"}}>{fmtH(m.hours)}</span>
                </div>
              </div>
            ))}
            {phSummary.map(ph=>(
              <div key={ph.key} style={{padding:"5px 12px",borderBottom:"1px solid #111827"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:10}}>⏳</span>
                    <span style={{fontSize:11,color:"#fde68a",fontWeight:600}}>{ph.label}</span>
                  </div>
                  <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#f59e0b"}}>{fmtH(ph.hours)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:10}}>

        {/* ── PROJECT SUMMARY PANEL (replaces util bars) ── */}
        <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",padding:16}}>
          <div style={{fontSize:10,fontWeight:700,color:"#475569",letterSpacing:.5,marginBottom:12}}>PROJECT SUMMARY</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:12,alignItems:"start"}}>

            {/* Financials */}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div>
                  <div style={{fontSize:9,color:"#475569",marginBottom:4}}>CONTRACT VALUE ($)</div>
                  <input value={budgetInput} onChange={e=>setBudgetInput(e.target.value)}
                    placeholder="e.g. 45000"
                    style={{...IS,width:"100%",fontFamily:"'DM Mono',monospace"}}
                    onFocus={e=>e.target.style.borderColor="#3b82f6"}
                    onBlur={e=>{ e.target.style.borderColor="#1e2d40"; save(); }}/>
                </div>
                <div>
                  <div style={{fontSize:9,color:"#475569",marginBottom:4}}>BILLING RATE ($/HR)</div>
                  <input value={rateInput} onChange={e=>setRateInput(e.target.value)}
                    placeholder="190"
                    style={{...IS,width:"100%",fontFamily:"'DM Mono',monospace"}}
                    onFocus={e=>e.target.style.borderColor="#3b82f6"}
                    onBlur={e=>{ e.target.style.borderColor="#1e2d40"; save(); }}/>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                {[
                  {label:"Budgeted Hrs", value:estHours?fmtH(estHours):"—", color:"#94a3b8"},
                  {label:"Allocated Hrs", value:fmtH(totalHours), color:"#e2e8f0"},
                  {label:"Variance",
                    value:estHours?(totalHours>estHours?"+":"")+fmtH(totalHours-estHours):"—",
                    color:!estHours?"#64748b":totalHours>estHours?"#f87171":totalHours<estHours*.8?"#34d399":"#fbbf24"},
                ].map(s=>(
                  <div key={s.label} style={{background:"#0d1117",borderRadius:7,padding:"8px 10px",border:"1px solid #111827"}}>
                    <div style={{fontSize:15,fontWeight:700,color:s.color,fontFamily:"'DM Mono',monospace"}}>{s.value}</div>
                    <div style={{fontSize:9,color:"#475569",marginTop:1}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team allocation bars */}
            <div>
              <div style={{fontSize:9,color:"#475569",marginBottom:6}}>TEAM ALLOCATION ON THIS PROJECT</div>
              {assignedData.length===0&&phSummary.length===0?(
                <div style={{fontSize:11,color:"#374151",padding:"8px 0"}}>No staff allocated yet</div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {[...assignedData.sort((a,b)=>b.hours-a.hours),...phSummary.map(ph=>({name:ph.label,hours:ph.hours,color:"#f59e0b",isPH:true}))].map(m=>{
                    const pct=totalHours>0?Math.round((m.hours/totalHours)*100):0;
                    return(
                      <div key={m.name}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            {m.isPH?<span style={{fontSize:10}}>⏳</span>:<div style={{width:5,height:5,borderRadius:"50%",background:m.color}}/>}
                            <span style={{fontSize:11,color:m.isPH?"#fde68a":"#cbd5e1"}}>{m.name}</span>
                          </div>
                          <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#64748b"}}>{fmtH(m.hours)} · {pct}%</span>
                        </div>
                        <div style={{height:4,background:"#0d1117",borderRadius:2,overflow:"hidden"}}>
                          <div style={{width:`${pct}%`,height:"100%",background:m.color,opacity:m.isPH?.6:.85}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Health ring */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,paddingLeft:8,borderLeft:"1px solid #1e2d40"}}>
              <HealthRing allocated={totalHours} estimated={estHours}/>
              {healthColor&&(
                <div style={{fontSize:10,color:healthColor,fontWeight:700,textAlign:"center"}}>
                  {health>1?"OVER BUDGET":health>0.8?"NEAR LIMIT":"ON TRACK"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ALLOCATION GRID (filtered to this project) ── */}
        <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",overflow:"hidden",flex:1}}>
          <div style={{padding:"8px 14px",borderBottom:"1px solid #1e2d40",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:10,fontWeight:700,color:"#475569",letterSpacing:.5}}>WEEKLY ALLOCATION</span>
            <div style={{flex:1}}/>
            <span style={{fontSize:10,color:"#475569"}}>Sort staff by:</span>
            <div style={{display:"flex",background:"#0d1117",borderRadius:7,padding:2,border:"1px solid #1e2d40"}}>
              {[["hours","Hours"],["name","Name"]].map(([v,l])=>(
                <button key={v} onClick={()=>setStaffSort(v)}
                  style={{padding:"3px 10px",borderRadius:5,fontSize:10,fontWeight:600,border:"none",cursor:"pointer",
                    background:staffSort===v?"#1e40af":"transparent",color:staffSort===v?"#93c5fd":"#64748b"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"separate",borderSpacing:"1px",minWidth:"max-content"}}>
              <thead>
                <tr style={{background:"#0a0f1a"}}>
                  <th style={{width:LABEL_W,padding:"4px 14px",textAlign:"left",fontSize:9,color:"#374151",
                    position:"sticky",left:0,background:"#0a0f1a",zIndex:20}}>STAFF MEMBER</th>
                  {weeks.map(wk=>(
                    <th key={wk} style={{width:52,padding:"3px 0",textAlign:"center",fontSize:8,
                      color:"#374151",fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>
                      {fmtWk(wk)}
                    </th>
                  ))}
                  <th style={{padding:"3px 14px",fontSize:9,color:"#374151",textAlign:"right",whiteSpace:"nowrap"}}>Total Hrs</th>
                </tr>
              </thead>
              <tbody>
                {sortedStaff.map(m=>{
                  const projHrs=personProjectHours(allocMap,staffMap,proj.id,m.name);
                  const hasAny=projHrs>0;
                  return(
                    <tr key={m.name} style={{opacity:hasAny?1:0.35}}
                      onMouseEnter={e=>e.currentTarget.style.background="#192030"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"4px 14px",position:"sticky",left:0,background:"#131b2a",zIndex:10,borderBottom:"1px solid #111827"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{width:5,height:5,borderRadius:"50%",background:m.color,flexShrink:0}}/>
                          <div>
                            <div style={{fontSize:11,color:hasAny?"#e2e8f0":"#475569",fontWeight:hasAny?600:400}}>{m.name}</div>
                            <div style={{fontSize:9,color:"#374151"}}>{m.hoursPerWeek}h/wk available</div>
                          </div>
                        </div>
                      </td>
                      {weeks.map(wk=>{
                        const pct=allocMap[allocKey(proj.id,m.name,wk)]||0;
                        const totalPct=personWeekTotalPct(allocMap,m.name,wk);
                        const vacHere=isOnVacation(vacations,m.name,wk);
                        return(
                          <AllocCell key={wk} pct={vacHere?0:pct} color={proj.color}
                            overloaded={!vacHere&&totalPct>100&&pct>0}
                            isVacation={vacHere}
                            onChange={v=>onSetAlloc(proj.id,m.name,wk,v)}/>
                        );
                      })}
                      <td style={{padding:"4px 14px",textAlign:"right",borderBottom:"1px solid #111827",
                        fontSize:11,fontFamily:"'DM Mono',monospace",color:projHrs>0?"#94a3b8":"#374151"}}>
                        {projHrs>0?fmtH(projHrs):"—"}
                      </td>
                    </tr>
                  );
                })}

                {/* TBD placeholder rows */}
                {Array.from({length:slots},(_,i)=>{
                  const pk=phKey(i+1);
                  const phHrs=personProjectHours(allocMap,staffMap,proj.id,pk);
                  return(
                    <tr key={`ph-${i}`} style={{background:"#110d00"}}>
                      <td style={{padding:"4px 14px",position:"sticky",left:0,background:"#110d00",zIndex:10,borderBottom:"1px solid #111827"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontSize:11}}>⏳</span>
                          <div>
                            <div style={{fontSize:11,color:"#fde68a",fontWeight:600}}>TBD #{i+1}</div>
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                              <span style={{fontSize:9,color:"#78350f"}}>unassigned · 40h/wk</span>
                              <button onClick={()=>{
                                onSetPlaceholderSlots(prev=>{
                                  const next={...prev};
                                  const cur=next[proj.id]||0;
                                  if(cur<=1) delete next[proj.id]; else next[proj.id]=cur-1;
                                  return next;
                                });
                                onSetAllocMap(prev=>{
                                  const next={...prev};
                                  Object.keys(next).forEach(k=>{if(k.includes(`||${pk}||`)) delete next[k];});
                                  return next;
                                });
                              }}
                                style={{background:"none",border:"none",color:"#450a0a",cursor:"pointer",fontSize:9,padding:0}}>✕</button>
                            </div>
                          </div>
                        </div>
                      </td>
                      {weeks.map(wk=>{
                        const pct=allocMap[allocKey(proj.id,pk,wk)]||0;
                        return(
                          <PlaceholderCell key={wk} pct={pct} color={proj.color}
                            onChange={v=>onSetAlloc(proj.id,pk,wk,v)}/>
                        );
                      })}
                      <td style={{padding:"4px 14px",textAlign:"right",borderBottom:"1px solid #111827",
                        fontSize:11,fontFamily:"'DM Mono',monospace",color:"#f59e0b"}}>
                        {phHrs>0?fmtH(phHrs):"—"}
                      </td>
                    </tr>
                  );
                })}

                {/* Add TBD row */}
                <tr style={{background:"#090d14"}}>
                  <td colSpan={weeks.length+2} style={{padding:"5px 14px",borderBottom:"1px solid #111827"}}>
                    <button
                      onClick={()=>onSetPlaceholderSlots(prev=>({...prev,[proj.id]:(prev[proj.id]||0)+1}))}
                      style={{background:"none",border:"1px dashed #78350f",color:"#f59e0b",
                        borderRadius:6,padding:"3px 14px",fontSize:10,cursor:"pointer",fontWeight:600}}>
                      + Add TBD Placeholder
                    </button>
                  </td>
                </tr>

                {/* weekly project total row */}
                <tr style={{background:"#070b10"}}>
                  <td style={{padding:"4px 14px",position:"sticky",left:0,background:"#070b10",zIndex:10,
                    fontSize:9,fontWeight:700,color:"#475569",letterSpacing:.5}}>
                    PROJECT WEEK TOTAL (FTE)
                  </td>
                  {weeks.map(wk=>{
                    const staffFTE=staffList.reduce((s,m)=>{
                      const p=allocMap[allocKey(proj.id,m.name,wk)]||0;
                      return p===0?s:s+(p/100)*(m.hoursPerWeek/40);
                    },0);
                    const phFTE=Array.from({length:slots},(_,i)=>{
                      const p=allocMap[allocKey(proj.id,phKey(i+1),wk)]||0;
                      return p/100;
                    }).reduce((a,b)=>a+b,0);
                    const total=staffFTE+phFTE;
                    return(
                      <td key={wk} style={{textAlign:"center",fontSize:9,fontFamily:"'DM Mono',monospace",
                        color:total>0?"#34d399":"#374151",fontWeight:700}}>
                        {total>0?total.toFixed(1):""}
                      </td>
                    );
                  })}
                  <td style={{padding:"4px 14px",textAlign:"right",fontSize:11,fontFamily:"'DM Mono',monospace",
                    color:"#e2e8f0",fontWeight:700}}>
                    {fmtH(totalHours)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STAFF TAB (with add / remove employee)
// ══════════════════════════════════════════════════════════════════════════════
const STAFF_COLORS=["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#84cc16","#f97316",
  "#ec4899","#a855f7","#14b8a6","#f43f5e","#6366f1","#22c55e","#fb923c","#0ea5e9","#d946ef","#facc15",
  "#4ade80","#fb7185","#a3e635","#38bdf8","#c084fc","#34d399"];

function StaffTab({staffList,vacations,projects,allocMap,weeks,threshold,personWeekData,
  onSelectStaff,onAddStaff,onRemoveStaff}){
  const[showAdd,setShowAdd]=useState(false);
  const[newName,setNewName]=useState("");
  const[newHours,setNewHours]=useState("40");
  const[confirmRemove,setConfirmRemove]=useState(null); // name to confirm
  const nameRef=useRef(null);

  useEffect(()=>{ if(showAdd) nameRef.current?.focus(); },[showAdd]);

  function handleAdd(){
    const name=newName.trim();
    if(!name) return;
    if(staffList.find(m=>m.name===name)) return; // duplicate
    const usedColors=staffList.map(m=>m.color);
    const color=STAFF_COLORS.find(c=>!usedColors.includes(c))||STAFF_COLORS[staffList.length%STAFF_COLORS.length];
    onAddStaff({name,hoursPerWeek:parseInt(newHours)||40,color});
    setNewName(""); setNewHours("40"); setShowAdd(false);
  }

  const IS={background:"#0d1117",border:"1px solid #1e2d40",color:"#e2e8f0",
    borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none"};

  return(
    <div style={{padding:"18px 22px"}}>

      {/* ── toolbar ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,color:"#94a3b8"}}>
          {staffList.length} employees
        </div>
        <button onClick={()=>setShowAdd(p=>!p)}
          style={{background:"#1e40af",border:"none",color:"#93c5fd",borderRadius:8,
            padding:"7px 18px",fontSize:12,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:16,lineHeight:1}}>+</span> Add Employee
        </button>
      </div>

      {/* ── add employee form ── */}
      {showAdd&&(
        <div style={{background:"#131b2a",border:"1px solid #3b82f6",borderRadius:12,padding:18,marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#3b82f6",letterSpacing:1,marginBottom:14}}>NEW EMPLOYEE</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 160px",gap:12,marginBottom:14}}>
            <div>
              <label style={{fontSize:10,color:"#64748b",display:"block",marginBottom:5}}>Full Name</label>
              <input ref={nameRef} value={newName} onChange={e=>setNewName(e.target.value)}
                placeholder="e.g. Jane Smith"
                style={{...IS,width:"100%"}}
                onKeyDown={e=>{ if(e.key==="Enter") handleAdd(); if(e.key==="Escape") setShowAdd(false); }}/>
            </div>
            <div>
              <label style={{fontSize:10,color:"#64748b",display:"block",marginBottom:5}}>Billable Hrs / Week</label>
              <input value={newHours} onChange={e=>setNewHours(e.target.value)}
                placeholder="40" style={{...IS,width:"100%",fontFamily:"'DM Mono',monospace"}}
                onKeyDown={e=>{ if(e.key==="Enter") handleAdd(); }}/>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {[10,20,24,32,40].map(h=>(
              <button key={h} onClick={()=>setNewHours(String(h))}
                style={{padding:"4px 10px",borderRadius:6,fontSize:11,border:"none",cursor:"pointer",fontWeight:600,
                  background:newHours===String(h)?"#1e40af":"#1e2d40",
                  color:newHours===String(h)?"#93c5fd":"#64748b"}}>
                {h}h
              </button>
            ))}
            <div style={{flex:1}}/>
            <button onClick={()=>setShowAdd(false)}
              style={{background:"none",border:"1px solid #1e2d40",color:"#64748b",
                borderRadius:8,padding:"6px 14px",fontSize:12,cursor:"pointer"}}>
              Cancel
            </button>
            <button onClick={handleAdd}
              style={{background:"#1e40af",border:"none",color:"#93c5fd",
                borderRadius:8,padding:"6px 18px",fontSize:12,cursor:"pointer",fontWeight:700}}>
              Add Employee
            </button>
          </div>
          {newName&&staffList.find(m=>m.name===newName.trim())&&(
            <div style={{marginTop:8,fontSize:11,color:"#f87171"}}>⚠ An employee with this name already exists.</div>
          )}
        </div>
      )}

      {/* ── confirm remove dialog ── */}
      {confirmRemove&&(()=>{
        const member=staffList.find(m=>m.name===confirmRemove);
        const hasAllocs=Object.keys(allocMap).some(k=>k.split("||")[1]===confirmRemove);
        return(
          <div style={{position:"fixed",inset:0,background:"#000000aa",zIndex:300,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{background:"#131b2a",borderRadius:16,border:"1px solid #450a0a",padding:28,
              maxWidth:420,width:"90%",boxShadow:"0 24px 80px #000c"}}>
              <div style={{fontSize:18,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>Remove Employee?</div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,
                background:"#0d1117",borderRadius:10,padding:"12px 14px",border:"1px solid #1e2d40"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:member?.color+"33",
                  border:`2px solid ${member?.color}`,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:13,fontWeight:700,color:member?.color,flexShrink:0}}>
                  {confirmRemove.split(" ").map(n=>n[0]).join("")}
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"#f1f5f9"}}>{confirmRemove}</div>
                  <div style={{fontSize:11,color:"#475569"}}>{member?.hoursPerWeek}h/week</div>
                </div>
              </div>
              {hasAllocs&&(
                <div style={{background:"#2d1b00",border:"1px solid #92400e",borderRadius:8,
                  padding:"10px 14px",marginBottom:16,fontSize:12,color:"#fde68a"}}>
                  ⚠ This person has project allocations. Past hours will be preserved for project health tracking — only future assignments (this week onward) will be cleared.
                </div>
              )}
              <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>
                This cannot be undone. Their vacation blocks will also be removed.
              </div>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button onClick={()=>setConfirmRemove(null)}
                  style={{background:"none",border:"1px solid #1e2d40",color:"#94a3b8",
                    borderRadius:8,padding:"8px 18px",fontSize:13,cursor:"pointer"}}>
                  Cancel
                </button>
                <button onClick={()=>{ onRemoveStaff(confirmRemove); setConfirmRemove(null); }}
                  style={{background:"#450a0a",border:"1px solid #991b1b",color:"#fca5a5",
                    borderRadius:8,padding:"8px 18px",fontSize:13,cursor:"pointer",fontWeight:700}}>
                  Remove Employee
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── staff cards grid ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {staffList.map(member=>{
          const myVacs=vacations.filter(v=>v.name===member.name);
          const thisWkPct=personWeekData[member.name]?.[weeks[0]]?.allocatedPct||0;
          const onVacNow=isOnVacation(vacations,member.name,weeks[0]);
          const projCount=projects.filter(proj=>Object.keys(allocMap).some(k=>k.startsWith(proj.id+"||"+member.name+"||"))).length;
          return(
            <div key={member.name} style={{position:"relative"}}>
              <div
                onClick={()=>onSelectStaff(member)}
                style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",padding:16,
                  cursor:"pointer",transition:"border-color .15s",height:"100%"}}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=member.color; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="#1e2d40"; }}>

                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:member.color+"22",
                    border:`2px solid ${member.color}`,display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:14,fontWeight:700,color:member.color,flexShrink:0}}>
                    {member.name.split(" ").map(n=>n[0]).join("")}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{member.name}</div>
                    <div style={{fontSize:10,color:"#475569"}}>{member.hoursPerWeek}h/wk · {projCount} project{projCount!==1?"s":""}</div>
                  </div>
                  {onVacNow&&<span style={{fontSize:14}}>🏖</span>}
                </div>

                {/* mini week bars */}
                <div style={{display:"flex",gap:2,marginBottom:10}}>
                  {weeks.slice(0,8).map(wk=>{
                    const d=personWeekData[member.name]?.[wk]||{};
                    const pct=d.allocatedPct||0;
                    const color=d.onVac?"#1a0a0a":pct>100?"#f87171":pct>threshold?"#fbbf24":pct>0?"#34d399":"#1e2d40";
                    return(
                      <div key={wk} style={{flex:1,height:24,background:"#0d1117",borderRadius:3,overflow:"hidden",
                        display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                        {d.onVac
                          ?<div style={{height:"100%",background:"#1a0a0a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8}}>🏖</div>
                          :<div style={{width:"100%",height:`${Math.min(pct,100)}%`,background:color}}/>
                        }
                      </div>
                    );
                  })}
                </div>

                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:"#475569"}}>This week</span>
                  <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",fontWeight:700,
                    color:onVacNow?"#7f1d1d":thisWkPct>100?"#f87171":thisWkPct>threshold?"#fbbf24":thisWkPct>0?"#34d399":"#374151"}}>
                    {onVacNow?"PTO":thisWkPct>0?`${thisWkPct}%`:"—"}
                  </span>
                </div>
                {myVacs.length>0&&(
                  <div style={{marginTop:6,fontSize:10,color:"#475569"}}>
                    {myVacs.length} vacation block{myVacs.length>1?"s":""} scheduled
                  </div>
                )}
              </div>

              {/* remove button — top-right corner, above the card */}
              <button
                onClick={e=>{ e.stopPropagation(); setConfirmRemove(member.name); }}
                title="Remove employee"
                style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:"50%",
                  background:"#0d1117",border:"1px solid #1e2d40",color:"#475569",
                  cursor:"pointer",fontSize:12,lineHeight:1,display:"flex",alignItems:"center",
                  justifyContent:"center",zIndex:2,transition:"all .15s"}}
                onMouseEnter={e=>{ e.currentTarget.style.background="#450a0a"; e.currentTarget.style.borderColor="#991b1b"; e.currentTarget.style.color="#fca5a5"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="#0d1117"; e.currentTarget.style.borderColor="#1e2d40"; e.currentTarget.style.color="#475569"; }}>
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────────────────────
// API HELPERS
// ─────────────────────────────────────────────────────────────────────────────
async function api(path, method="GET", body=null, allow401=false){
  const opts={ method, credentials:"include", headers:{} };
  if(body){ opts.headers["Content-Type"]="application/json"; opts.body=JSON.stringify(body); }
  const res=await fetch(path,opts);
  if(res.status===401){
    if(allow401) return {authenticated:false};
    // session expired mid-session — reload to show login
    if(path!=="/api/auth/me") window.location.reload();
    return null;
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const[username,setUsername]=useState("");
  const[password,setPassword]=useState("");
  const[error,setError]=useState("");
  const[loading,setLoading]=useState(false);

  async function handleLogin(){
    if(!username||!password){ setError("Please enter your username and password."); return; }
    setLoading(true); setError("");
    const res=await api("/api/auth/login","POST",{username,password});
    setLoading(false);
    if(!res){ setError("Could not connect to server."); return; }
    if(res.error){ setError(res.error); return; }
    onLogin(res);
  }

  const IS={background:"#0d1117",border:"1px solid #1e2d40",color:"#e2e8f0",
    borderRadius:8,padding:"10px 14px",fontSize:14,outline:"none",width:"100%"};

  return(
    <div style={{minHeight:"100vh",background:"#0d1117",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:360,background:"#131b2a",borderRadius:16,border:"1px solid #1e2d40",
        padding:36,boxShadow:"0 24px 80px #000c"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32}}>
          <div style={{width:5,height:28,background:"linear-gradient(180deg,#3b82f6,#8b5cf6)",borderRadius:3}}/>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:"#f1f5f9",letterSpacing:"-0.5px"}}>CapacityIQ</div>
            <div style={{fontSize:11,color:"#475569"}}>Sign in to your account</div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5}}>USERNAME</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username"
              style={IS} autoFocus
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              onFocus={e=>e.target.style.borderColor="#3b82f6"}
              onBlur={e=>e.target.style.borderColor="#1e2d40"}/>
          </div>
          <div>
            <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5}}>PASSWORD</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
              style={IS}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              onFocus={e=>e.target.style.borderColor="#3b82f6"}
              onBlur={e=>e.target.style.borderColor="#1e2d40"}/>
          </div>
          {error&&<div style={{fontSize:12,color:"#f87171",background:"#2d0a0a",borderRadius:7,
            padding:"8px 12px",border:"1px solid #7f1d1d"}}>{error}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{background:"#1d4ed8",border:"none",color:"#fff",borderRadius:9,
              padding:"11px 0",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",
              opacity:loading?0.7:1,marginTop:4}}>
            {loading?"Signing in…":"Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ADMIN PANEL (admin only)
// ─────────────────────────────────────────────────────────────────────────────
function UserAdminPanel({onClose}){
  const[users,setUsers]=useState([]);
  const[newUsername,setNewUsername]=useState("");
  const[newPassword,setNewPassword]=useState("");
  const[newIsAdmin,setNewIsAdmin]=useState(false);
  const[error,setError]=useState("");
  const[success,setSuccess]=useState("");
  const[resetId,setResetId]=useState(null);
  const[resetPw,setResetPw]=useState("");

  useEffect(()=>{ loadUsers(); },[]);

  async function loadUsers(){
    const res=await api("/api/users");
    if(res) setUsers(res);
  }
  async function handleAdd(){
    setError(""); setSuccess("");
    if(!newUsername||!newPassword){ setError("Username and password are required."); return; }
    const res=await api("/api/users","POST",{username:newUsername,password:newPassword,is_admin:newIsAdmin});
    if(res?.error){ setError(res.error); return; }
    setSuccess(`User "${newUsername}" created.`);
    setNewUsername(""); setNewPassword(""); setNewIsAdmin(false);
    loadUsers();
  }
  async function handleDelete(id,username){
    if(!confirm(`Remove user "${username}"? They will no longer be able to log in.`)) return;
    await api(`/api/users/${id}`,"DELETE");
    loadUsers();
  }
  async function handleResetPassword(id){
    if(!resetPw||resetPw.length<6){ setError("New password must be at least 6 characters."); return; }
    const res=await api(`/api/users/${id}/reset-password`,"POST",{new_password:resetPw});
    if(res?.error){ setError(res.error); return; }
    setSuccess("Password updated."); setResetId(null); setResetPw("");
  }

  const IS={background:"#0d1117",border:"1px solid #1e2d40",color:"#e2e8f0",
    borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none"};

  return(
    <div style={{position:"fixed",inset:0,background:"#000000bb",zIndex:500,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#131b2a",borderRadius:16,border:"1px solid #1e2d40",
        padding:28,width:480,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 24px 80px #000c"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>User Management</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer"}}>✕</button>
        </div>

        {/* existing users */}
        <div style={{fontSize:10,fontWeight:700,color:"#475569",letterSpacing:.5,marginBottom:10}}>ACTIVE USERS</div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
          {users.map(u=>(
            <div key={u.id} style={{background:"#0d1117",borderRadius:9,padding:"10px 14px",
              border:"1px solid #1e2d40",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:"#1e2d40",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:700,color:"#94a3b8",flexShrink:0}}>
                {u.username[0].toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>{u.username}</div>
                <div style={{fontSize:10,color:"#475569"}}>{u.is_admin?"Admin":"User"} · joined {new Date(u.created_at).toLocaleDateString()}</div>
              </div>
              {resetId===u.id?(
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <input value={resetPw} onChange={e=>setResetPw(e.target.value)}
                    placeholder="new password" type="password"
                    style={{...IS,width:130,fontSize:12,padding:"5px 8px"}}/>
                  <button onClick={()=>handleResetPassword(u.id)}
                    style={{background:"#1e40af",border:"none",color:"#93c5fd",borderRadius:6,
                      padding:"5px 10px",fontSize:11,cursor:"pointer"}}>Save</button>
                  <button onClick={()=>setResetId(null)}
                    style={{background:"none",border:"1px solid #1e2d40",color:"#64748b",borderRadius:6,
                      padding:"5px 8px",fontSize:11,cursor:"pointer"}}>✕</button>
                </div>
              ):(
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setResetId(u.id);setResetPw("");setError("");setSuccess("");}}
                    style={{background:"none",border:"1px solid #1e2d40",color:"#64748b",borderRadius:6,
                      padding:"4px 10px",fontSize:11,cursor:"pointer"}}>Reset PW</button>
                  <button onClick={()=>handleDelete(u.id,u.username)}
                    style={{background:"none",border:"1px solid #450a0a",color:"#f87171",borderRadius:6,
                      padding:"4px 10px",fontSize:11,cursor:"pointer"}}>Remove</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* add new user */}
        <div style={{fontSize:10,fontWeight:700,color:"#475569",letterSpacing:.5,marginBottom:10}}>ADD NEW USER</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div>
            <label style={{fontSize:10,color:"#64748b",display:"block",marginBottom:4}}>Username</label>
            <input value={newUsername} onChange={e=>setNewUsername(e.target.value)}
              placeholder="username" style={{...IS,width:"100%"}}/>
          </div>
          <div>
            <label style={{fontSize:10,color:"#64748b",display:"block",marginBottom:4}}>Password</label>
            <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}
              placeholder="min 6 characters" style={{...IS,width:"100%"}}/>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <input type="checkbox" id="isAdmin" checked={newIsAdmin} onChange={e=>setNewIsAdmin(e.target.checked)}/>
          <label htmlFor="isAdmin" style={{fontSize:12,color:"#94a3b8",cursor:"pointer"}}>Grant admin access (can manage users)</label>
        </div>
        {error&&<div style={{fontSize:12,color:"#f87171",background:"#2d0a0a",borderRadius:7,
          padding:"8px 12px",border:"1px solid #7f1d1d",marginBottom:10}}>{error}</div>}
        {success&&<div style={{fontSize:12,color:"#34d399",background:"#022c22",borderRadius:7,
          padding:"8px 12px",border:"1px solid #065f46",marginBottom:10}}>{success}</div>}
        <button onClick={handleAdd}
          style={{background:"#1e40af",border:"none",color:"#93c5fd",borderRadius:8,
            padding:"9px 20px",fontSize:13,cursor:"pointer",fontWeight:700}}>
          + Add User
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD PANEL
// ─────────────────────────────────────────────────────────────────────────────
function ChangePasswordPanel({onClose}){
  const[current,setCurrent]=useState("");
  const[next,setNext]=useState("");
  const[confirm,setConfirm]=useState("");
  const[error,setError]=useState("");
  const[success,setSuccess]=useState(false);

  async function handleSave(){
    setError("");
    if(next.length<6){ setError("New password must be at least 6 characters."); return; }
    if(next!==confirm){ setError("Passwords do not match."); return; }
    const res=await api("/api/auth/change-password","POST",{current_password:current,new_password:next});
    if(res?.error){ setError(res.error); return; }
    setSuccess(true);
    setTimeout(onClose,1500);
  }
  const IS={background:"#0d1117",border:"1px solid #1e2d40",color:"#e2e8f0",
    borderRadius:8,padding:"9px 13px",fontSize:13,outline:"none",width:"100%"};
  return(
    <div style={{position:"fixed",inset:0,background:"#000000bb",zIndex:500,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#131b2a",borderRadius:16,border:"1px solid #1e2d40",
        padding:28,width:360,boxShadow:"0 24px 80px #000c"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>Change Password</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer"}}>✕</button>
        </div>
        {success?(
          <div style={{fontSize:13,color:"#34d399",textAlign:"center",padding:"16px 0"}}>✓ Password updated successfully!</div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[["Current Password",current,setCurrent],["New Password",next,setNext],["Confirm New Password",confirm,setConfirm]].map(([label,val,setter])=>(
              <div key={label}>
                <label style={{fontSize:10,color:"#64748b",display:"block",marginBottom:4}}>{label.toUpperCase()}</label>
                <input type="password" value={val} onChange={e=>setter(e.target.value)}
                  style={IS}
                  onFocus={e=>e.target.style.borderColor="#3b82f6"}
                  onBlur={e=>e.target.style.borderColor="#1e2d40"}/>
              </div>
            ))}
            {error&&<div style={{fontSize:12,color:"#f87171",background:"#2d0a0a",borderRadius:7,
              padding:"8px 12px",border:"1px solid #7f1d1d"}}>{error}</div>}
            <button onClick={handleSave}
              style={{background:"#1e40af",border:"none",color:"#93c5fd",borderRadius:8,
                padding:"9px 0",fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4}}>
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP WRAPPER — handles auth check before rendering planner
// ─────────────────────────────────────────────────────────────────────────────
function AppRoot(){
  const[authState,setAuthState]=useState(null); // null=loading, false=logged out, obj=logged in
  useEffect(()=>{
    api("/api/auth/me","GET",null,true).then(res=>{
      setAuthState(res?.authenticated?res:false);
    }).catch(()=>setAuthState(false));
  },[]);

  if(authState===null) return(
    <div style={{minHeight:"100vh",background:"#0d1117",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
        <div style={{width:36,height:36,border:"3px solid #1e2d40",borderTopColor:"#3b82f6",
          borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
        <div style={{fontSize:13,color:"#475569"}}>Loading CapacityIQ…</div>
      </div>
    </div>
  );
  if(!authState) return <LoginScreen onLogin={u=>setAuthState(u)}/>;
  return <CapacityPlanner currentUser={authState} onLogout={()=>setAuthState(false)}/>;
}

// Make AppRoot available globally for index.html to mount
window.AppRoot = AppRoot;

function CapacityPlanner({currentUser,onLogout}){
  // ── all data starts empty; loaded from API on mount ──
  const[staffList,setStaffList]=useState([]);
  const[projects,setProjects]=useState([]);
  const[allocMap,setAllocMap]=useState({});
  const[vacations,setVacations]=useState([]);
  const[placeholderSlots,setPlaceholderSlots]=useState({});
  const[loading,setLoading]=useState(true);
  const[saveError,setSaveError]=useState(null);

  const[nav,setNav]=useState("planner");
  const[plannerView,setPlannerView]=useState("team");
  const[selectedPerson,setSelectedPerson]=useState("");
  const[weekCount,setWeekCount]=useState(16);
  const[startOffset,setStartOffset]=useState(0);
  const[threshold,setThreshold]=useState(85);
  const[expandedProjects,setExpandedProjects]=useState({});
  const[detailProject,setDetailProject]=useState(null);
  const[focusedProject,setFocusedProject]=useState(null);
  const[detailStaff,setDetailStaff]=useState(null);
  const[showUserAdmin,setShowUserAdmin]=useState(false);
  const[showChangePw,setShowChangePw]=useState(false);
  const[showUserMenu,setShowUserMenu]=useState(false);

  // ── load everything from API on mount ──
  useEffect(()=>{
    api("/api/state").then(data=>{
      if(!data) return;
      setStaffList(data.staff||[]);
      setProjects(data.projects||[]);
      setAllocMap(data.allocMap||{});
      setVacations(data.vacations||[]);
      setPlaceholderSlots(data.placeholderSlots||{});
      if(data.staff?.length) setSelectedPerson(data.staff[0].name);
      setLoading(false);
    });
  },[]);

  // close user menu on outside click
  useEffect(()=>{
    if(!showUserMenu) return;
    const h=()=>setShowUserMenu(false);
    setTimeout(()=>document.addEventListener("click",h),0);
    return()=>document.removeEventListener("click",h);
  },[showUserMenu]);

  // staffMap for quick lookup
  const staffMap=useMemo(()=>{
    const m={};
    staffList.forEach(s=>{ m[s.name]=s; });
    return m;
  },[staffList]);

  const today=new Date();
  const baseDate=new Date(today);
  baseDate.setDate(baseDate.getDate()+startOffset*7);
  const weeks=useMemo(()=>generateWeeks(baseDate,weekCount),[startOffset,weekCount]);

  const plannerProjects=useMemo(()=>
    projects.filter(p=>p.status==="Active"||p.status==="Tentative")
      .sort((a,b)=>{
        const po={High:0,Medium:1,Low:2};
        return (po[a.priority]??3)-(po[b.priority]??3);
      })
  ,[projects]);

  function showErr(msg){ setSaveError(msg); setTimeout(()=>setSaveError(null),4000); }

  async function setAlloc(pid,person,wk,pct){
    // optimistic update
    setAllocMap(prev=>{
      const next={...prev}; const k=allocKey(pid,person,wk);
      if(pct===0) delete next[k]; else next[k]=pct; return next;
    });
    const res=await api("/api/allocations","POST",{project_id:pid,person_name:person,week_key:wk,pct});
    if(res?.error) showErr("Failed to save allocation.");
  }
  async function updateProject(id,updates){
    setProjects(prev=>prev.map(p=>p.id===id?{...p,...updates}:p));
    setDetailProject(prev=>prev&&prev.id===id?{...prev,...updates}:prev);
    const res=await api(`/api/projects/${id}`,"PATCH",updates);
    if(res?.error) showErr("Failed to save project.");
  }
  async function addProject(proj){
    setProjects(prev=>[...prev,proj]);
    const res=await api("/api/projects","POST",proj);
    if(res?.error){ showErr("Failed to add project."); setProjects(prev=>prev.filter(p=>p.id!==proj.id)); }
  }
  async function updateStaff(name,updates){
    setStaffList(prev=>prev.map(m=>m.name===name?{...m,...updates}:m));
    setDetailStaff(prev=>prev&&prev.name===name?{...prev,...updates}:prev);
    const res=await api(`/api/staff/${encodeURIComponent(name)}`,"PATCH",updates);
    if(res?.error) showErr("Failed to save staff changes.");
  }
  async function addVacation(vac){
    const res=await api("/api/vacations","POST",vac);
    if(res?.error){ showErr("Failed to add vacation."); return; }
    setVacations(prev=>[...prev,{...vac,id:res.id}]);
  }
  async function removeVacation(id){
    setVacations(prev=>prev.filter(v=>v.id!==id));
    const res=await api(`/api/vacations/${id}`,"DELETE");
    if(res?.error) showErr("Failed to remove vacation.");
  }
  async function addStaff(member){
    setStaffList(prev=>[...prev,member]);
    const res=await api("/api/staff","POST",member);
    if(res?.error){ showErr(res.error||"Failed to add employee."); setStaffList(prev=>prev.filter(m=>m.name!==member.name)); }
  }
  async function removeStaff(name){
    const todayWk=getISOWeek(new Date());
    setStaffList(prev=>prev.filter(m=>m.name!==name));
    setAllocMap(prev=>{
      const next={...prev};
      Object.keys(next).forEach(k=>{ const p=k.split("||"); if(p[1]===name&&p[2]>=todayWk) delete next[k]; });
      return next;
    });
    setVacations(prev=>prev.filter(v=>v.name!==name||v.endWk<todayWk));
    if(detailStaff?.name===name) setDetailStaff(null);
    if(selectedPerson===name) setSelectedPerson(staffList.find(m=>m.name!==name)?.name||"");
    const res=await api(`/api/staff/${encodeURIComponent(name)}`,"DELETE");
    if(res?.error) showErr("Failed to remove employee.");
  }
  async function handleSetPlaceholderSlots(updater){
    handleSetPlaceholderSlots(prev=>{
      const next=typeof updater==="function"?updater(prev):updater;
      // persist each changed key
      Object.keys(next).forEach(pid=>{
        if(next[pid]!==prev[pid])
          api(`/api/placeholder-slots/${encodeURIComponent(pid)}`,"POST",{count:next[pid]});
      });
      Object.keys(prev).forEach(pid=>{
        if(!(pid in next))
          api(`/api/placeholder-slots/${encodeURIComponent(pid)}`,"POST",{count:0});
      });
      return next;
    });
  }
  async function handleLogout(){
    await api("/api/auth/logout","POST");
    onLogout();
  }

  // team capacity calculations per week
  const teamWeekData=useMemo(()=>{
    const m={};
    weeks.forEach(wk=>{
      const available=teamAvailableFTE(staffList,vacations,wk)*40;
      const allocated=teamWeekHours(allocMap,staffMap,vacations,wk);
      m[wk]={available,allocated,pct:available>0?(allocated/available)*100:0};
    });
    return m;
  },[allocMap,staffMap,staffList,vacations,weeks]);

  const personWeekData=useMemo(()=>{
    const m={};
    staffList.forEach(s=>{
      m[s.name]={};
      weeks.forEach(wk=>{
        const onVac=isOnVacation(vacations,s.name,wk);
        const available=onVac?0:s.hoursPerWeek;
        const allocatedPct=onVac?0:personWeekTotalPct(allocMap,s.name,wk);
        const allocatedHrs=(allocatedPct/100)*s.hoursPerWeek;
        m[s.name][wk]={available,allocatedPct,allocatedHrs,onVac};
      });
    });
    return m;
  },[allocMap,staffList,vacations,weeks]);

  const capacityForecast=useMemo(()=>{
    const avail=weeks.filter(wk=>(teamWeekData[wk]?.pct||0)<threshold);
    let run=[],best=null;
    for(let i=0;i<avail.length;i++){
      const prev=i>0?weeks.indexOf(avail[i-1]):-999;
      if(weeks.indexOf(avail[i])-prev===1) run.push(avail[i]);
      else{ if(run.length>=4&&!best) best=run[0]; run=[avail[i]]; }
    }
    if(run.length>=4&&!best) best=run[0];
    return best||avail[0]||null;
  },[teamWeekData,weeks,threshold]);

  const liveDetailProject=detailProject?projects.find(p=>p.id===detailProject.id)||detailProject:null;
  const liveFocusedProject=focusedProject?projects.find(p=>p.id===focusedProject.id)||focusedProject:null;
  const liveDetailStaff=detailStaff?staffList.find(m=>m.name===detailStaff.name)||detailStaff:null;

  const LABEL_W=230;

  return(
    <div style={{fontFamily:"'DM Sans','Helvetica Neue',sans-serif",background:"#0d1117",minHeight:"100vh",color:"#e2e8f0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{height:5px;width:5px;}
        ::-webkit-scrollbar-track{background:#0d1117;}
        ::-webkit-scrollbar-thumb{background:#1e2d40;border-radius:3px;}
        select option{background:#131b2a!important;color:#e2e8f0!important;}
        input[type=date]{color-scheme:dark;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* overlays */}
      {showUserAdmin&&<UserAdminPanel onClose={()=>setShowUserAdmin(false)}/>}
      {showChangePw&&<ChangePasswordPanel onClose={()=>setShowChangePw(false)}/>}

      {/* save error toast */}
      {saveError&&(
        <div style={{position:"fixed",bottom:20,right:20,background:"#450a0a",border:"1px solid #991b1b",
          color:"#fca5a5",borderRadius:10,padding:"10px 16px",fontSize:13,zIndex:1000,
          boxShadow:"0 8px 32px #000c"}}>
          ⚠ {saveError}
        </div>
      )}

      {/* loading overlay */}
      {loading&&(
        <div style={{position:"fixed",inset:0,background:"#0d1117",zIndex:999,
          display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
          <div style={{width:36,height:36,border:"3px solid #1e2d40",borderTopColor:"#3b82f6",
            borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
          <div style={{fontSize:13,color:"#475569"}}>Loading your data…</div>
        </div>
      )}

      {/* ── TOPBAR ── */}
      <div style={{background:"#131b2a",borderBottom:"1px solid #1e2d40",height:52,
        display:"flex",alignItems:"center",padding:"0 18px",gap:0,position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginRight:20}}>
          <div style={{width:5,height:24,background:"linear-gradient(180deg,#3b82f6,#8b5cf6)",borderRadius:3}}/>
          <span style={{fontSize:15,fontWeight:800,color:"#f1f5f9",letterSpacing:"-0.5px"}}>CapacityIQ</span>
        </div>

        <div style={{display:"flex",gap:2,background:"#0d1117",borderRadius:9,padding:3,border:"1px solid #1e2d40"}}>
          {[["planner","📅 Planner"],["dashboard","📋 Projects"],["staff","👥 Staff"]].map(([id,label])=>(
            <button key={id} onClick={()=>{ setNav(id); if(id!=="project-detail") setFocusedProject(null); }}
              style={{padding:"5px 13px",borderRadius:7,fontSize:12,fontWeight:600,border:"none",cursor:"pointer",
                background:nav===id?"#1e40af":"transparent",color:nav===id?"#93c5fd":"#64748b"}}>
              {label}
            </button>
          ))}
          {nav==="project-detail"&&liveFocusedProject&&(
            <>
              <span style={{color:"#374151",fontSize:12,display:"flex",alignItems:"center",padding:"0 4px"}}>/</span>
              <button style={{padding:"5px 13px",borderRadius:7,fontSize:12,fontWeight:600,border:"none",cursor:"default",
                background:"#1e40af",color:"#93c5fd",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {liveFocusedProject.id}
              </button>
            </>
          )}
        </div>

        <div style={{flex:1}}/>

        {nav==="project-detail"&&(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",background:"#0d1117",border:"1px solid #1e2d40",borderRadius:8,overflow:"hidden"}}>
              <button onClick={()=>setStartOffset(p=>p-4)}
                style={{background:"none",border:"none",color:"#475569",cursor:"pointer",padding:"5px 10px",fontSize:12}}>◀</button>
              <span style={{fontSize:10,color:"#94a3b8",minWidth:56,textAlign:"center"}}>{weeks[0]&&fmtWk(weeks[0])}</span>
              <button onClick={()=>setStartOffset(p=>p+4)}
                style={{background:"none",border:"none",color:"#475569",cursor:"pointer",padding:"5px 10px",fontSize:12}}>▶</button>
            </div>
            <select value={weekCount} onChange={e=>setWeekCount(+e.target.value)}
              style={{background:"#1e2433",border:"1px solid #1e2d40",color:"#e2e8f0",borderRadius:7,padding:"5px 8px",fontSize:11}}>
              {[8,12,16,26,52].map(n=><option key={n} value={n}>{n}w</option>)}
            </select>
            <button onClick={()=>{ setNav("planner"); setFocusedProject(null); }}
              style={{background:"#1e2433",border:"1px solid #1e2d40",color:"#94a3b8",borderRadius:7,
                padding:"5px 14px",fontSize:11,cursor:"pointer",fontWeight:600}}>
              ← Back to Planner
            </button>
          </div>
        )}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",background:"#0d1117",borderRadius:8,padding:2,border:"1px solid #1e2d40"}}>
              {[["team","Team"],["individual","Individual"]].map(([v,l])=>(
                <button key={v} onClick={()=>setPlannerView(v)}
                  style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:600,border:"none",cursor:"pointer",
                    background:plannerView===v?"#1e40af":"transparent",color:plannerView===v?"#93c5fd":"#64748b"}}>
                  {l}
                </button>
              ))}
            </div>
            {plannerView==="individual"&&(
              <select value={selectedPerson} onChange={e=>setSelectedPerson(e.target.value)}
                style={{background:"#1e2433",border:"1px solid #1e2d40",color:"#e2e8f0",borderRadius:7,padding:"5px 9px",fontSize:11}}>
                {staffList.map(m=><option key={m.name}>{m.name}</option>)}
              </select>
            )}
            <div style={{display:"flex",alignItems:"center",gap:5,background:"#0d1117",border:"1px solid #1e2d40",borderRadius:8,padding:"4px 8px"}}>
              <span style={{fontSize:10,color:"#475569"}}>Cap.</span>
              <input type="range" min={50} max={100} value={threshold} onChange={e=>setThreshold(+e.target.value)}
                style={{width:55,accentColor:"#3b82f6"}}/>
              <span style={{fontSize:10,color:"#3b82f6",fontFamily:"'DM Mono',monospace",minWidth:28}}>{threshold}%</span>
            </div>
            <div style={{display:"flex",alignItems:"center",background:"#0d1117",border:"1px solid #1e2d40",borderRadius:8,overflow:"hidden"}}>
              <button onClick={()=>setStartOffset(p=>p-4)}
                style={{background:"none",border:"none",color:"#475569",cursor:"pointer",padding:"5px 10px",fontSize:12}}>◀</button>
              <span style={{fontSize:10,color:"#94a3b8",minWidth:56,textAlign:"center"}}>{weeks[0]&&fmtWk(weeks[0])}</span>
              <button onClick={()=>setStartOffset(p=>p+4)}
                style={{background:"none",border:"none",color:"#475569",cursor:"pointer",padding:"5px 10px",fontSize:12}}>▶</button>
            </div>
            <select value={weekCount} onChange={e=>setWeekCount(+e.target.value)}
              style={{background:"#1e2433",border:"1px solid #1e2d40",color:"#e2e8f0",borderRadius:7,padding:"5px 8px",fontSize:11}}>
              {[8,12,16,26,52].map(n=><option key={n} value={n}>{n}w</option>)}
            </select>
          </div>
        )}

        {/* user menu */}
        <div style={{position:"relative",marginLeft:12}}>
          <button onClick={e=>{ e.stopPropagation(); setShowUserMenu(p=>!p); }}
            style={{background:"#1e2d40",border:"1px solid #2d3f55",color:"#94a3b8",borderRadius:"50%",
              width:32,height:32,cursor:"pointer",fontSize:12,fontWeight:700,display:"flex",
              alignItems:"center",justifyContent:"center"}}>
            {currentUser.username[0].toUpperCase()}
          </button>
          {showUserMenu&&(
            <div style={{position:"absolute",right:0,top:38,background:"#131b2a",border:"1px solid #1e2d40",
              borderRadius:10,padding:6,minWidth:180,zIndex:100,boxShadow:"0 8px 32px #000c"}}>
              <div style={{padding:"6px 12px",fontSize:12,color:"#64748b",borderBottom:"1px solid #1e2d40",marginBottom:4}}>
                Signed in as <strong style={{color:"#94a3b8"}}>{currentUser.username}</strong>
              </div>
              <button onClick={()=>{ setShowChangePw(true); setShowUserMenu(false); }}
                style={{width:"100%",background:"none",border:"none",color:"#cbd5e1",textAlign:"left",
                  padding:"7px 12px",fontSize:12,cursor:"pointer",borderRadius:6}}
                onMouseEnter={e=>e.target.style.background="#1e2d40"}
                onMouseLeave={e=>e.target.style.background="none"}>
                🔑 Change Password
              </button>
              {currentUser.is_admin&&(
                <button onClick={()=>{ setShowUserAdmin(true); setShowUserMenu(false); }}
                  style={{width:"100%",background:"none",border:"none",color:"#cbd5e1",textAlign:"left",
                    padding:"7px 12px",fontSize:12,cursor:"pointer",borderRadius:6}}
                  onMouseEnter={e=>e.target.style.background="#1e2d40"}
                  onMouseLeave={e=>e.target.style.background="none"}>
                  👥 Manage Users
                </button>
              )}
              <div style={{borderTop:"1px solid #1e2d40",marginTop:4,paddingTop:4}}>
                <button onClick={handleLogout}
                  style={{width:"100%",background:"none",border:"none",color:"#f87171",textAlign:"left",
                    padding:"7px 12px",fontSize:12,cursor:"pointer",borderRadius:6}}
                  onMouseEnter={e=>e.target.style.background="#2d0a0a"}
                  onMouseLeave={e=>e.target.style.background="none"}>
                  → Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FORECAST BANNER ── */}
      {nav==="planner"&&capacityForecast&&(
        <div style={{background:"#071a0f",borderBottom:"1px solid #14532d",padding:"6px 18px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 8px #4ade80"}}/>
          <span style={{fontSize:12,color:"#86efac"}}>
            <strong>Open capacity:</strong> week of <strong>{fmtWk(capacityForecast)}</strong> — team drops below {threshold}% for 4+ consecutive weeks
          </span>
          <div style={{flex:1}}/>
          <span style={{fontSize:11,color:"#374151"}}>
            {staffList.length} staff · {Math.round(teamWeekData[weeks[0]]?.pct||0)}% utilized now
          </span>
        </div>
      )}

      {/* ══ STAFF TAB ══ */}
      {nav==="staff"&&(
        <StaffTab
          staffList={staffList}
          vacations={vacations}
          projects={projects}
          allocMap={allocMap}
          weeks={weeks}
          threshold={threshold}
          personWeekData={personWeekData}
          onSelectStaff={m=>setDetailStaff(m)}
          onAddStaff={addStaff}
          onRemoveStaff={removeStaff}/>
      )}

      {/* ══ PROJECT DETAIL PAGE ══ */}
      {nav==="project-detail"&&liveFocusedProject&&(
        <ProjectPage
          proj={liveFocusedProject}
          staffList={staffList}
          staffMap={staffMap}
          allocMap={allocMap}
          vacations={vacations}
          placeholderSlots={placeholderSlots}
          weeks={weeks}
          threshold={threshold}
          onUpdateProject={updateProject}
          onSetAlloc={setAlloc}
          onSetPlaceholderSlots={handleSetPlaceholderSlots}
          onSetAllocMap={setAllocMap}
          onSelectProject={p=>setFocusedProject(p)}
          plannerProjects={plannerProjects}
          teamWeekData={teamWeekData}
          personWeekData={personWeekData}/>
      )}

      {/* ══ DASHBOARD ══ */}
      {nav==="dashboard"&&(
        <ProjectsDashboard
          projects={projects}
          allocMap={allocMap}
          staffList={staffList}
          staffMap={staffMap}
          onUpdateProject={updateProject}
          onSelectProject={p=>setDetailProject(p)}
          onAddProject={addProject}/>
      )}

      {/* ══ PLANNER ══ */}
      {nav==="planner"&&(
        <div style={{padding:"12px 18px",display:"flex",gap:12}}>

          {/* sidebar */}
          <div style={{width:248,flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[
                {label:"Active",value:projects.filter(p=>p.status==="Active").length,color:"#34d399"},
                {label:"Tentative",value:projects.filter(p=>p.status==="Tentative").length,color:"#fbbf24"},
                {label:"Staff",value:staffList.length,color:"#8b5cf6"},
                {label:"Overloaded",value:staffList.filter(m=>personWeekData[m.name]?.[weeks[0]]?.allocatedPct>100).length,color:"#f87171"},
              ].map(s=>(
                <div key={s.label} style={{background:"#131b2a",borderRadius:9,padding:"8px 10px",border:"1px solid #1e2d40"}}>
                  <div style={{fontSize:18,fontWeight:800,color:s.color,fontFamily:"'DM Mono',monospace"}}>{s.value}</div>
                  <div style={{fontSize:9,color:"#475569",letterSpacing:.3}}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* project list */}
            <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",overflow:"hidden"}}>
              <div style={{padding:"8px 12px",borderBottom:"1px solid #1e2d40",fontSize:10,fontWeight:700,color:"#475569",letterSpacing:.5}}>
                ACTIVE & TENTATIVE
              </div>
              <div style={{maxHeight:290,overflowY:"auto"}}>
                {plannerProjects.map(proj=>{
                  const hrs=totalHoursForProject(allocMap,staffMap,proj.id);
                  const estH=proj.budget?(proj.budget/(proj.hourlyRate||190)):null;
                  const h=estH?hrs/estH:null;
                  return(
                    <div key={proj.id} onClick={()=>{ setFocusedProject(proj); setNav("project-detail"); }}
                      style={{padding:"6px 12px",borderBottom:"1px solid #111827",cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#1a2535"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div style={{width:3,height:26,borderRadius:1,background:proj.color,flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:1}}>
                            <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#475569"}}>{proj.id}</span>
                            <Chip label={proj.priority||"Medium"} cfg={PRIORITY_CFG} small/>
                          </div>
                          <div style={{fontSize:11,color:"#cbd5e1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proj.name}</div>
                          {estH&&(
                            <div style={{marginTop:2,height:2.5,background:"#0d1117",borderRadius:2,overflow:"hidden"}}>
                              <div style={{width:`${Math.min((hrs/estH)*100,100)}%`,height:"100%",
                                background:h>1?"#f87171":h>0.8?"#fbbf24":"#34d399"}}/>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* staff list */}
            <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",overflow:"hidden"}}>
              <div style={{padding:"8px 12px",borderBottom:"1px solid #1e2d40",fontSize:10,fontWeight:700,color:"#475569",letterSpacing:.5}}>STAFF</div>
              <div style={{maxHeight:220,overflowY:"auto"}}>
                {staffList.map(m=>{
                  const d=personWeekData[m.name]?.[weeks[0]]||{};
                  return(
                    <div key={m.name}
                      onClick={()=>{ if(plannerView==="individual") setSelectedPerson(m.name); else setDetailStaff(m); }}
                      style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 12px",
                        borderBottom:"1px solid #111827",cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#1a2535"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:5,height:5,borderRadius:"50%",background:m.color}}/>
                        <span style={{fontSize:11,color:"#cbd5e1"}}>{m.name}</span>
                        {d.onVac&&<span style={{fontSize:10}}>🏖</span>}
                      </div>
                      <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",
                        color:d.onVac?"#7f1d1d":d.allocatedPct>100?"#f87171":d.allocatedPct===0?"#374151":"#34d399"}}>
                        {d.onVac?"PTO":d.allocatedPct>0?`${d.allocatedPct}%`:"—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* timeline — single unified scrollable table */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{background:"#131b2a",borderRadius:12,border:"1px solid #1e2d40",overflow:"hidden"}}>

              {/* static header above the scroll area */}
              <div style={{padding:"8px 14px",borderBottom:"1px solid #1e2d40",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:10,fontWeight:700,color:"#475569",letterSpacing:.5}}>
                  {plannerView==="team"
                    ?"TEAM UTILIZATION  ·  PROJECT ALLOCATIONS"
                    :`${selectedPerson.toUpperCase()}  ·  WEEKLY UTILIZATION & ALLOCATIONS`}
                </span>
                <span style={{fontSize:10,color:"#374151"}}>% of each person's available hours</span>
              </div>

              {/* overflow:auto on both axes; thead rows are sticky so they freeze while tbody scrolls */}
              <div style={{overflowX:"auto",overflowY:"auto",maxHeight:"calc(100vh - 160px)"}}>
                <table style={{borderCollapse:"separate",borderSpacing:"1px",minWidth:"max-content"}}>
                  <thead style={{position:"sticky",top:0,zIndex:30}}>
                    {/* ── ROW 1: util bars — sticks at top:0 ── */}
                    <tr style={{background:"#0a0f1a"}}>
                      {/* corner cell: sticky on both axes */}
                      <th style={{width:LABEL_W,padding:"6px 12px",
                        position:"sticky",top:0,left:0,background:"#0a0f1a",zIndex:40,
                        textAlign:"left",fontSize:9,color:"#475569",fontWeight:700,letterSpacing:.5,verticalAlign:"bottom"}}>
                        {plannerView==="team"?"TEAM UTILIZATION":selectedPerson.split(" ")[0].toUpperCase()}
                      </th>
                      {weeks.map(wk=>{
                        let pct,color,label,isOpen=false;
                        if(plannerView==="team"){
                          const d=teamWeekData[wk]||{};
                          pct=d.pct||0;
                          color=pct>100?"#f87171":pct>threshold?"#fbbf24":pct>0?"#34d399":"#0d1117";
                          isOpen=capacityForecast===wk;
                          label=pct>0?Math.round(pct)+"%":"";
                        } else {
                          const d=personWeekData[selectedPerson]?.[wk]||{};
                          if(d.onVac){ pct=0; color="#1a0a0a"; label="🏖"; }
                          else{
                            pct=d.allocatedPct||0;
                            color=pct>100?"#f87171":pct>threshold?"#fbbf24":pct>0?"#34d399":"#0d1117";
                            label=pct>0?Math.round(pct)+"%":"";
                          }
                        }
                        return(
                          <th key={wk} style={{width:52,padding:"3px 1px",verticalAlign:"bottom",
                            position:"sticky",top:0,background:"#0a0f1a",zIndex:30}}>
                            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                              <span style={{fontSize:7,fontFamily:"'DM Mono',monospace",
                                color:pct>0?color:"transparent",fontWeight:700}}>
                                {label}
                              </span>
                              <div style={{width:44,height:48,background:"#070b10",borderRadius:3,overflow:"hidden",
                                display:"flex",flexDirection:"column",justifyContent:"flex-end",
                                outline:isOpen?"1px solid #4ade8066":"none"}}>
                                <div style={{width:"100%",height:`${Math.min(pct,100)}%`,background:color,
                                  transition:"height .2s"}}/>
                              </div>
                            </div>
                          </th>
                        );
                      })}
                      {plannerView==="team"&&<th style={{position:"sticky",top:0,background:"#0a0f1a",zIndex:30}}/>}
                    </tr>
                    {/* ── ROW 2: week date labels — sticks just below row 1 (~72px) ── */}
                    <tr style={{background:"#0d1320"}}>
                      <th style={{width:LABEL_W,padding:"4px 12px",textAlign:"left",fontSize:9,color:"#374151",
                        position:"sticky",top:72,left:0,background:"#0d1320",zIndex:40,borderBottom:"2px solid #1e2d40"}}>
                        {plannerView==="team"?"PROJECT / PERSON":"PROJECT"}
                      </th>
                      {weeks.map(wk=>{
                        const isOpen=capacityForecast===wk;
                        return(
                          <th key={wk} style={{width:52,padding:"3px 0",textAlign:"center",fontSize:8,
                            fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap",borderBottom:"2px solid #1e2d40",
                            position:"sticky",top:72,background:"#0d1320",zIndex:30,
                            color:isOpen?"#4ade80":"#475569"}}>
                            {fmtWk(wk)}
                          </th>
                        );
                      })}
                      {plannerView==="team"&&<th style={{padding:"3px 10px",fontSize:9,color:"#374151",
                        whiteSpace:"nowrap",textAlign:"right",borderBottom:"2px solid #1e2d40",
                        position:"sticky",top:72,background:"#0d1320",zIndex:30}}>Health</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {plannerView==="team"&&plannerProjects.map(proj=>{
                      const allocated=totalHoursForProject(allocMap,staffMap,proj.id);
                      const estH=proj.budget?(proj.budget/(proj.hourlyRate||190)):null;
                      const health=estH?allocated/estH:null;
                      const hc=!health?null:health>1?"#f87171":health>0.8?"#fbbf24":"#34d399";
                      const isExp=expandedProjects[proj.id];
                      return[
                        <tr key={proj.id}
                          onClick={()=>setExpandedProjects(p=>({...p,[proj.id]:!p[proj.id]}))}
                          style={{cursor:"pointer"}}
                          onMouseEnter={e=>e.currentTarget.style.background="#192030"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{padding:"5px 12px",position:"sticky",left:0,background:"#131b2a",zIndex:10,borderBottom:"1px solid #111827"}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <span style={{color:"#374151",fontSize:9,display:"inline-block",transition:"transform .15s",
                                transform:isExp?"rotate(90deg)":"none"}}>▶</span>
                              <div style={{width:3,height:26,borderRadius:1,background:proj.color,flexShrink:0}}/>
                              <div style={{minWidth:0}}>
                                <div style={{display:"flex",alignItems:"center",gap:5}}>
                                  <span style={{fontSize:9,color:"#475569",fontFamily:"'DM Mono',monospace"}}>{proj.id}</span>
                                  <Chip label={proj.priority||"Medium"} cfg={PRIORITY_CFG} small/>
                                </div>
                                <div style={{fontSize:11,fontWeight:600,color:"#cbd5e1",maxWidth:148,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proj.name}</div>
                              </div>
                            </div>
                          </td>
                          {weeks.map(wk=>{
                            const staffFTE=staffList.reduce((s,m)=>{
                              const p=allocMap[allocKey(proj.id,m.name,wk)]||0;
                              return p===0?s:s+(p/100)*(m.hoursPerWeek/40);
                            },0);
                            const slots=placeholderSlots[proj.id]||0;
                            const phFTE=Array.from({length:slots},(_,i)=>{
                              const p=allocMap[allocKey(proj.id,phKey(i+1),wk)]||0;
                              return p/100;
                            }).reduce((a,b)=>a+b,0);
                            const totalFTE=staffFTE+phFTE;
                            const hasPH=phFTE>0;
                            return(
                              <td key={wk} style={{textAlign:"center",fontSize:9,fontFamily:"'DM Mono',monospace",
                                background:totalFTE>0?proj.color+"1e":"transparent",
                                color:totalFTE>0?"#e2e8f0":"#1e2d40",borderBottom:"1px solid #111827",position:"relative"}}>
                                {totalFTE>0?totalFTE.toFixed(1):""}
                                {hasPH&&<span style={{position:"absolute",top:1,right:2,fontSize:7,color:"#f59e0b"}}>TBD</span>}
                              </td>
                            );
                          })}
                          <td style={{padding:"4px 10px",borderBottom:"1px solid #111827",minWidth:140}}>
                            {health!=null?(
                              <div style={{display:"flex",alignItems:"center",gap:5}}>
                                <div style={{width:55,height:4,background:"#0d1117",borderRadius:2,overflow:"hidden"}}>
                                  <div style={{width:`${Math.min(health*100,100)}%`,height:"100%",background:hc}}/>
                                </div>
                                <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:hc}}>{Math.round(health*100)}%</span>
                                {health>1&&<span style={{fontSize:8,color:"#f87171",fontWeight:700}}>OVER</span>}
                              </div>
                            ):<span style={{fontSize:9,color:"#374151"}}>—</span>}
                          </td>
                        </tr>,
                        ...(isExp?[
                          ...staffList.map(m=>{
                          const onVac=isOnVacation(vacations,m.name,weeks[0]);
                          return(
                            <tr key={`${proj.id}-${m.name}`} style={{background:"#090d14"}}>
                              <td style={{padding:"2px 12px 2px 28px",position:"sticky",left:0,background:"#090d14",zIndex:10,borderBottom:"1px solid #111827"}}>
                                <div style={{display:"flex",alignItems:"center",gap:5}}>
                                  <div style={{width:4,height:4,borderRadius:"50%",background:m.color}}/>
                                  <span style={{fontSize:10,color:"#475569"}}>{m.name}</span>
                                  <span style={{fontSize:9,color:"#374151"}}>({m.hoursPerWeek}h/wk)</span>
                                </div>
                              </td>
                              {weeks.map(wk=>{
                                const pct=allocMap[allocKey(proj.id,m.name,wk)]||0;
                                const totalPct=personWeekTotalPct(allocMap,m.name,wk);
                                const vacHere=isOnVacation(vacations,m.name,wk);
                                return(
                                  <AllocCell key={wk}
                                    pct={vacHere?0:pct}
                                    color={proj.color}
                                    overloaded={!vacHere&&totalPct>100&&pct>0}
                                    isVacation={vacHere}
                                    onChange={v=>setAlloc(proj.id,m.name,wk,v)}/>
                                );
                              })}
                              <td style={{borderBottom:"1px solid #111827"}}/>
                            </tr>
                          );
                          }),
                          // ── PLACEHOLDER (TBD) ROWS ──
                          ...Array.from({length:placeholderSlots[proj.id]||0},(_,i)=>{
                            const pk=phKey(i+1);
                            return(
                              <tr key={`${proj.id}-ph-${i}`} style={{background:"#110d00"}}>
                                <td style={{padding:"2px 12px 2px 28px",position:"sticky",left:0,background:"#110d00",zIndex:10,borderBottom:"1px solid #111827"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                                    <span style={{fontSize:10}}>⏳</span>
                                    <span style={{fontSize:10,color:"#f59e0b",fontWeight:600}}>TBD #{i+1}</span>
                                    <span style={{fontSize:9,color:"#78350f"}}>unassigned · 40h/wk</span>
                                    <button
                                      onClick={e=>{
                                        e.stopPropagation();
                                        // remove this slot and clear its alloc data
                                        handleSetPlaceholderSlots(prev=>{
                                          const next={...prev};
                                          const cur=next[proj.id]||0;
                                          if(cur<=1) delete next[proj.id]; else next[proj.id]=cur-1;
                                          return next;
                                        });
                                        setAllocMap(prev=>{
                                          const next={...prev};
                                          Object.keys(next).forEach(k=>{if(k.includes(`||${pk}||`)) delete next[k];});
                                          return next;
                                        });
                                      }}
                                      style={{background:"none",border:"none",color:"#450a0a",cursor:"pointer",fontSize:10,padding:"0 2px",marginLeft:2}}
                                      title="Remove this placeholder">✕</button>
                                  </div>
                                </td>
                                {weeks.map(wk=>{
                                  const pct=allocMap[allocKey(proj.id,pk,wk)]||0;
                                  return(
                                    <PlaceholderCell key={wk}
                                      pct={pct}
                                      color={proj.color}
                                      onChange={v=>setAlloc(proj.id,pk,wk,v)}/>
                                  );
                                })}
                                <td style={{borderBottom:"1px solid #111827"}}/>
                              </tr>
                            );
                          }),
                          // ── ADD TBD BUTTON ROW ──
                          <tr key={`${proj.id}-addph`} style={{background:"#090d14"}}>
                            <td colSpan={weeks.length+2} style={{padding:"4px 12px 4px 28px",borderBottom:"1px solid #111827"}}>
                              <button
                                onClick={e=>{
                                  e.stopPropagation();
                                  handleSetPlaceholderSlots(prev=>({...prev,[proj.id]:(prev[proj.id]||0)+1}));
                                }}
                                style={{background:"none",border:"1px dashed #78350f",color:"#f59e0b",
                                  borderRadius:6,padding:"3px 12px",fontSize:10,cursor:"pointer",fontWeight:600,
                                  display:"flex",alignItems:"center",gap:5}}>
                                <span>+</span> Add TBD Placeholder
                              </button>
                            </td>
                          </tr>
                        ]:[])
                      ];
                    })}

                    {plannerView==="individual"&&plannerProjects.map(proj=>(
                      <tr key={proj.id}
                        onMouseEnter={e=>e.currentTarget.style.background="#192030"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{padding:"4px 12px",position:"sticky",left:0,background:"#131b2a",zIndex:10,borderBottom:"1px solid #111827"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:3,height:22,borderRadius:1,background:proj.color}}/>
                            <div>
                              <div style={{display:"flex",alignItems:"center",gap:4}}>
                                <span style={{fontSize:9,color:"#475569",fontFamily:"'DM Mono',monospace"}}>{proj.id}</span>
                                <Chip label={proj.priority||"Medium"} cfg={PRIORITY_CFG} small/>
                              </div>
                              <div style={{fontSize:11,fontWeight:500,color:"#cbd5e1",maxWidth:165,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proj.name}</div>
                            </div>
                          </div>
                        </td>
                        {weeks.map(wk=>{
                          const pct=allocMap[allocKey(proj.id,selectedPerson,wk)]||0;
                          const totalPct=personWeekTotalPct(allocMap,selectedPerson,wk);
                          const vacHere=isOnVacation(vacations,selectedPerson,wk);
                          return(
                            <AllocCell key={wk} pct={vacHere?0:pct} color={proj.color}
                              overloaded={!vacHere&&totalPct>100&&pct>0}
                              isVacation={vacHere}
                              onChange={v=>setAlloc(proj.id,selectedPerson,wk,v)}/>
                          );
                        })}
                      </tr>
                    ))}

                    {/* totals */}
                    <tr style={{background:"#070b10"}}>
                      <td style={{padding:"4px 12px",position:"sticky",left:0,background:"#070b10",zIndex:10,
                        fontSize:9,fontWeight:700,color:"#374151",letterSpacing:.5}}>
                        {plannerView==="team"?"TEAM FTE TOTAL":"PERSON TOTAL %"}
                      </td>
                      {weeks.map(wk=>{
                        let tot,over;
                        if(plannerView==="team"){
                          const d=teamWeekData[wk]||{};
                          tot=d.pct?Math.round(d.pct)+"%":"";
                          over=(d.pct||0)>100;
                        } else {
                          const d=personWeekData[selectedPerson]?.[wk]||{};
                          tot=d.allocatedPct>0?`${d.allocatedPct}%`:"";
                          over=d.allocatedPct>100;
                        }
                        return(
                          <td key={wk} style={{textAlign:"center",fontSize:9,fontFamily:"'DM Mono',monospace",
                            color:over?"#f87171":tot?"#34d399":"#374151",fontWeight:700}}>
                            {tot||""}
                          </td>
                        );
                      })}
                      {plannerView==="team"&&<td/>}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── OVERLAYS ── */}
      {(liveDetailProject||liveDetailStaff)&&(
        <div onClick={()=>{ setDetailProject(null); setDetailStaff(null); }}
          style={{position:"fixed",inset:0,background:"#00000088",zIndex:150}}/>
      )}
      {liveDetailProject&&(
        <ProjectDetail
          proj={liveDetailProject}
          staffList={staffList}
          staffMap={staffMap}
          allocMap={allocMap}
          vacations={vacations}
          onClose={()=>setDetailProject(null)}
          onUpdateProject={updateProject}/>
      )}
      {liveDetailStaff&&(
        <StaffDetail
          member={liveDetailStaff}
          staffMap={staffMap}
          allocMap={allocMap}
          projects={projects.filter(p=>p.status!=="Complete")}
          vacations={vacations}
          weeks={weeks}
          onClose={()=>setDetailStaff(null)}
          onUpdateStaff={updateStaff}
          onAddVacation={addVacation}
          onRemoveVacation={removeVacation}/>
      )}
    </div>
  );
}
