import { useState } from "react";

// ── CONFIG ───────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzYaSp7AMpD0S2YOahtIjznWQLU0wXJm66IgiHtZpz985nzoPg9RE3TAakoruIosY9z/exec";

const C = {
  espresso: "#2B1A0E", orange: "#D84E1F", cream: "#F5EDD8", gold: "#C8973A",
  terra: "#A8402A", sage: "#4A6B3A", muted: "#7A6A58", border: "#E0D5C0",
  rowline: "#F0E9D8", card: "#FFFFFF",
};

// UI label -> movement type stored in the sheet (full names)
const GROUPS = [
  { header: "Sampling", items: [
    ["Retail MAC", "Sampling - Retail MAC"],
    ["Events", "Sampling - Events"],
    ["Retail Pop-Up", "Sampling - Popups"],
  ]},
  { header: "Marketing", items: [
    ["Influencer Gifting", "Influencer Gifting"],
    ["Strategic Seeding", "Strategic Seeding"],
    ["UGC / Content", "UGC / Content"],
    ["Photoshoot", "Photoshoot"],
    ["Founder Use", "Founder Use"],
  ]},
  { header: "Retail", items: [
    ["First Case Free", "First Case Free"],
    ["Retail Order", "Retail Order"],
  ]},
  { header: "Customer", items: [
    ["Offices", "Offices"],
    ["Manual DTC Order", "DTC Order"],
  ]},
  { header: "Shrinkage", items: [
    ["Damaged / Lost", "Damaged / Lost"],
    ["Adjustment", "Adjustment"],
  ]},
];

const FIXED_LOCATIONS = [
  "Full pallets", "Garage other", "Garage fridge", "Outdoor fridge",
  "Airdrome", "David car", "Sophy car",
];

export default function App() {
  const [screen, setScreen]   = useState("field-log");
  const [menuOpen, setMenu]   = useState(false);

  // Field log
  const [moveLabel, setMoveLabel] = useState(null);
  const [moveType, setMoveType]   = useState(null);
  const [flCases, setFlCases]     = useState(0);
  const [flCans, setFlCans]       = useState(0);
  const [flNotes, setFlNotes]     = useState("");
  const [flState, setFlState]     = useState("idle"); // idle | busy | done
  const [lastLog, setLastLog]     = useState(null);

  // Inventory count
  const [counts, setCounts]   = useState(() =>
    FIXED_LOCATIONS.map((l) => ({ location: l, cases: 0, cans: 0, fixed: true }))
  );
  const [cntNotes, setCntNotes] = useState("");
  const [cntState, setCntState] = useState("idle");

  // Dashboard
  const [dash, setDash]       = useState(null);
  const [dashState, setDash2] = useState("idle"); // idle | loading | error | ready

  function go(s) {
    setScreen(s); setMenu(false);
    if (s === "dashboard") loadDashboard();
  }

  async function post(payload) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), mode: "no-cors",
      });
      return true;
    } catch (e) { console.error(e); return false; }
  }

  // ── Field log submit ──
  async function submitLog() {
    if (!moveType) { alert("Pick a movement type"); return; }
    const total = flCases * 12 + flCans;
    if (total <= 0) { alert("Enter a quantity"); return; }
    setFlState("busy");
    const ok = await post({ action: "log_entry", movementType: moveType, cases: flCases, cans: flCans, notes: flNotes.trim() });
    if (ok) {
      const t = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      setLastLog({ label: moveLabel, total, time: t });
      setFlState("done");
      setMoveLabel(null); setMoveType(null); setFlCases(0); setFlCans(0); setFlNotes("");
      setTimeout(() => setFlState("idle"), 3500);
    } else { setFlState("idle"); alert("Error — check connection"); }
  }

  // ── Inventory count helpers ──
  function setLoc(i, field, val) {
    setCounts((c) => c.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  }
  function addLocation() {
    setCounts((c) => [...c, { location: "", cases: 0, cans: 0, fixed: false }]);
  }
  const countTotalCases = Math.round(
    counts.reduce((s, r) => s + r.cases * 12 + r.cans, 0) / 12 * 10
  ) / 10;

  async function submitCount() {
    const filled = counts.filter((r) => (r.cases > 0 || r.cans > 0) && r.location.trim());
    if (filled.length === 0) { alert("Enter at least one count"); return; }
    setCntState("busy");
    const ok = await post({
      action: "inventory_count",
      locations: filled.map((r) => ({ location: r.location.trim(), cases: r.cases, cans: r.cans })),
      notes: cntNotes.trim(),
    });
    if (ok) {
      setCntState("done");
      setCounts(FIXED_LOCATIONS.map((l) => ({ location: l, cases: 0, cans: 0, fixed: true })));
      setCntNotes("");
      setTimeout(() => setCntState("idle"), 3500);
    } else { setCntState("idle"); alert("Error saving count"); }
  }

  // ── Dashboard ──
  async function loadDashboard() {
    setDash2("loading");
    try {
      const r = await fetch(`${APPS_SCRIPT_URL}?action=dashboard&t=${Date.now()}`);
      setDash(await r.json()); setDash2("ready");
    } catch (e) { setDash2("error"); }
  }

  const title = screen === "field-log" ? "Field Log" : screen === "inventory-count" ? "Inventory Count" : "Dashboard";

  return (
    <div style={S.app}>
      <div style={S.topbar}>
        <span style={S.menuBtn} onClick={() => setMenu(!menuOpen)}>☰</span>
        <span style={S.logo}>SOLZI</span>
        <span style={{ width: 24 }} />
      </div>
      <div style={S.subbar}>{title}</div>

      {menuOpen && <div style={S.overlay} onClick={() => setMenu(false)} />}
      <div style={{ ...S.drawer, left: menuOpen ? 0 : -260 }}>
        <div style={S.drawerBrand}>SOLZI</div>
        {[["field-log", "Field Log"], ["inventory-count", "Inventory Count"], ["dashboard", "Dashboard"]].map(([k, l]) => (
          <div key={k} style={{ ...S.drawerItem, ...(screen === k ? S.drawerActive : {}) }} onClick={() => go(k)}>{l}</div>
        ))}
      </div>

      {/* ── FIELD LOG ── */}
      {screen === "field-log" && (
        <div style={S.screen}>
          {flState === "done" && lastLog && (
            <div style={S.banner}>✓ Just logged · {lastLog.total} cans · {lastLog.label} · {lastLog.time}</div>
          )}

          <div style={S.label}>MOVEMENT TYPE</div>
          <div style={S.card}>
            {GROUPS.map((g) => (
              <div key={g.header} style={{ marginBottom: 12 }}>
                <div style={S.catLabel}>{g.header}</div>
                <div style={S.typeGrid}>
                  {g.items.map(([lbl, type]) => (
                    <button key={lbl} style={{ ...S.typeBtn, ...(moveType === type ? S.typeBtnSel : {}) }}
                      onClick={() => { setMoveLabel(lbl); setMoveType(type); }}>{lbl}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={S.label}>QUANTITY</div>
          <div style={S.card}>
            <div style={{ display: "flex", gap: 10 }}>
              <Stepper title="CASES" value={flCases} set={setFlCases} />
              <div style={{ borderLeft: `1px solid ${C.border}` }} />
              <Stepper title="LOOSE CANS" value={flCans} set={setFlCans} />
            </div>
            <div style={S.totalMini}>
              <span style={{ fontSize: 11, color: "rgba(245,237,216,0.7)" }}>Total cans</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: C.gold }}>{flCases * 12 + flCans}</span>
            </div>
          </div>

          <div style={S.label}>NOTES (OPTIONAL)</div>
          <div style={S.card}><textarea rows={2} value={flNotes} style={S.textarea} placeholder="e.g. Venice pop-up…" onChange={(e) => setFlNotes(e.target.value)} /></div>

          <button style={{ ...S.submit, background: flState === "done" ? C.sage : C.orange }} disabled={flState === "busy"} onClick={submitLog}>
            {flState === "busy" ? "Logging…" : flState === "done" ? "✓ Logged!" : "Log Entry"}
          </button>
        </div>
      )}

      {/* ── INVENTORY COUNT ── */}
      {screen === "inventory-count" && (
        <div style={S.screen}>
          {cntState === "done" && <div style={S.banner}>✓ Count saved</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 2px 6px" }}>
            <span style={S.colHead}>CASES</span><span style={S.colHead}>CANS</span>
          </div>
          <div style={S.card}>
            {counts.map((r, i) => (
              <div key={i} style={S.locRow}>
                {r.fixed
                  ? <span style={{ fontSize: 13, color: C.espresso }}>{r.location}</span>
                  : <input value={r.location} placeholder="New location…" style={S.locInput} onChange={(e) => setLoc(i, "location", e.target.value)} />}
                <span style={{ display: "flex", gap: 8 }}>
                  <input type="number" min="0" value={r.cases || ""} style={S.cell} onChange={(e) => setLoc(i, "cases", parseInt(e.target.value) || 0)} />
                  <input type="number" min="0" value={r.cans || ""} style={S.cell} onChange={(e) => setLoc(i, "cans", parseInt(e.target.value) || 0)} />
                </span>
              </div>
            ))}
            <div style={S.addRow} onClick={addLocation}>
              <span style={S.addIcon}>+</span><span style={{ fontSize: 13, fontWeight: 500 }}>Add location</span>
            </div>
          </div>

          <div style={S.totalBar}>
            <span style={{ fontSize: 12, color: "rgba(245,237,216,0.7)" }}>Total on hand</span>
            <span><span style={{ fontSize: 20, fontWeight: 500, color: C.gold }}>{countTotalCases}</span><span style={{ fontSize: 12, color: "rgba(245,237,216,0.55)" }}> cases</span></span>
          </div>

          <div style={S.label}>NOTES (OPTIONAL)</div>
          <div style={S.card}><textarea rows={2} value={cntNotes} style={S.textarea} placeholder="e.g. weekly count…" onChange={(e) => setCntNotes(e.target.value)} /></div>

          <button style={{ ...S.submit, background: cntState === "done" ? C.sage : C.gold, color: cntState === "done" ? "#fff" : C.espresso }} disabled={cntState === "busy"} onClick={submitCount}>
            {cntState === "busy" ? "Saving…" : cntState === "done" ? "✓ Saved!" : "Save Count"}
          </button>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {screen === "dashboard" && (
        <div style={S.screen}>
          {dashState === "loading" && <div style={S.dashMsg}>Loading…</div>}
          {dashState === "error" && <div style={S.dashErr}>Couldn't load dashboard.</div>}
          {dashState === "ready" && dash && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={S.label}>INVENTORY</span>
                <span style={S.refresh} onClick={loadDashboard}>↻ refresh</span>
              </div>

              <div style={S.totalCard}>
                <div style={{ fontSize: 10, letterSpacing: "0.07em", color: "rgba(245,237,216,0.6)" }}>TOTAL ON HAND</div>
                <div style={{ fontSize: 32, fontWeight: 500, color: C.gold, lineHeight: 1.1 }}>{dash.totalOnHandCases ?? "—"}</div>
                <div style={{ fontSize: 11, color: "rgba(245,237,216,0.55)" }}>cases{dash.countDate ? ` · counted ${dash.countDate}` : ""}</div>
              </div>

              <div style={{ ...S.card, marginTop: 9 }}>
                <div style={S.catLabel}>PER LEDGER</div>
                {(dash.ledger || []).map((l, i) => (
                  <div key={i} style={S.ledRow}><span style={{ fontSize: 12 }}>{l.label}</span><span style={{ fontSize: 13, fontWeight: 500 }}>{l.cases} cases</span></div>
                ))}
                {dash.airdromeGap !== null && dash.airdromeGap !== undefined && (
                  <div style={{ ...S.ledRow, borderTop: `1px solid ${C.border}`, marginTop: 4, paddingTop: 9 }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>Airdrome gap (counted − ledger)</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: dash.airdromeGap < 0 ? C.terra : C.sage }}>{dash.airdromeGap > 0 ? "+" : ""}{dash.airdromeGap} cases</span>
                  </div>
                )}
              </div>

              <div style={{ ...S.label, marginTop: 15 }}>THIS WEEK</div>
              <div style={S.weekBar}>
                <span style={{ fontSize: 11, opacity: 0.85 }}>Cans used</span>
                <span style={{ fontSize: 22, fontWeight: 500 }}>{dash.weekTotalCans || 0}</span>
              </div>
              <div style={S.card}>
                {Object.keys(dash.byCategory || {}).length === 0
                  ? <div style={S.empty}>No entries this week</div>
                  : Object.entries(dash.byCategory).map(([c, q]) => (
                      <div key={c} style={S.ledRow}><span style={{ fontSize: 12 }}>{c}</span><span style={{ fontSize: 13, fontWeight: 500, color: C.terra }}>{q} cans</span></div>
                    ))}
              </div>

              <div style={{ ...S.label, marginTop: 15 }}>RECENT ENTRIES</div>
              <div style={S.card}>
                {(dash.recent || []).length === 0
                  ? <div style={S.empty}>No entries yet</div>
                  : dash.recent.map((r, i) => (
                      <div key={i} style={{ padding: "7px 0", borderBottom: i < dash.recent.length - 1 ? `1px solid ${C.rowline}` : "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, fontWeight: 500 }}>{r.type}</span><span style={{ fontSize: 13, fontWeight: 500, color: C.orange }}>−{r.qty}</span></div>
                        <div style={{ fontSize: 10, color: C.muted }}>{r.date}</div>
                      </div>
                    ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Stepper({ title, value, set }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 5, letterSpacing: "0.05em" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <button style={S.stepBtn} onClick={() => set(Math.max(0, value - 1))}>−</button>
        <input type="number" min="0" value={value || ""} style={S.stepVal} onChange={(e) => set(Math.max(0, parseInt(e.target.value) || 0))} />
        <button style={S.stepBtn} onClick={() => set(value + 1)}>+</button>
      </div>
    </div>
  );
}

const S = {
  app: { display: "flex", flexDirection: "column", minHeight: "100dvh", background: C.cream, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: C.espresso },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", background: C.espresso, color: C.cream, padding: "calc(env(safe-area-inset-top,0px) + 13px) 16px 6px", position: "sticky", top: 0, zIndex: 10 },
  menuBtn: { fontSize: 18, cursor: "pointer", width: 24 },
  logo: { fontSize: 18, fontWeight: 500, letterSpacing: "0.22em", color: C.gold },
  subbar: { background: C.espresso, color: "rgba(245,237,216,0.65)", fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "center", padding: "0 0 11px", position: "sticky", top: 0, zIndex: 9 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 20 },
  drawer: { position: "fixed", top: 0, width: 240, height: "100%", background: C.espresso, color: C.cream, zIndex: 30, transition: "left 0.25s ease", paddingTop: "calc(env(safe-area-inset-top,0px) + 24px)" },
  drawerBrand: { padding: "0 20px 20px", fontSize: 22, fontWeight: 500, letterSpacing: "0.2em", color: C.gold, borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 8 },
  drawerItem: { padding: "15px 20px", fontSize: 15, fontWeight: 500, cursor: "pointer", color: "rgba(255,255,255,0.7)" },
  drawerActive: { color: C.gold, background: "rgba(200,151,58,0.12)" },
  screen: { flex: 1, overflowY: "auto", padding: "14px 16px calc(env(safe-area-inset-bottom,0px) + 20px)" },
  banner: { background: C.sage, color: "#fff", borderRadius: 9, padding: "9px 12px", fontSize: 12, fontWeight: 500, marginBottom: 12 },
  label: { fontSize: 10, fontWeight: 500, letterSpacing: "0.09em", color: C.muted, margin: "0 0 6px 2px" },
  card: { background: C.card, borderRadius: 12, padding: 13, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  catLabel: { fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", color: C.muted, marginBottom: 6 },
  typeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 },
  typeBtn: { padding: "9px 6px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, color: C.espresso, cursor: "pointer", textAlign: "center", lineHeight: 1.25 },
  typeBtnSel: { background: C.orange, color: "#fff", borderColor: C.orange, fontWeight: 500 },
  stepBtn: { width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.border}`, background: "#fff", fontSize: 16, cursor: "pointer", color: C.espresso, lineHeight: 1 },
  stepVal: { width: 38, height: 30, border: `1px solid ${C.border}`, borderRadius: 7, textAlign: "center", fontSize: 15, fontWeight: 500, color: C.espresso, outline: "none" },
  totalMini: { marginTop: 10, background: C.espresso, borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  textarea: { width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 11px", fontSize: 14, fontFamily: "inherit", resize: "none", color: C.espresso, outline: "none", boxSizing: "border-box" },
  submit: { width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 4 },
  colHead: { fontSize: 9, fontWeight: 500, letterSpacing: "0.05em", color: C.muted, width: 46, textAlign: "center" },
  locRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.rowline}` },
  locInput: { border: "none", background: "transparent", fontSize: 13, color: C.espresso, fontStyle: "italic", outline: "none", width: 120 },
  cell: { width: 46, height: 28, border: `1px solid ${C.border}`, borderRadius: 6, textAlign: "center", fontSize: 13, fontWeight: 500, color: C.espresso, outline: "none" },
  addRow: { display: "flex", alignItems: "center", gap: 7, padding: "11px 0 4px", color: C.orange, cursor: "pointer" },
  addIcon: { width: 20, height: 20, borderRadius: "50%", border: `1px solid ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  totalBar: { background: C.espresso, borderRadius: 10, padding: "11px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  totalCard: { background: C.espresso, borderRadius: 11, padding: "15px 16px", textAlign: "center" },
  ledRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" },
  weekBar: { background: C.orange, color: "#fff", borderRadius: 9, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  refresh: { fontSize: 10, color: C.orange, fontWeight: 500, cursor: "pointer" },
  empty: { textAlign: "center", color: C.muted, fontSize: 12, padding: "16px 0" },
  dashMsg: { textAlign: "center", padding: 28, color: C.muted, fontSize: 14 },
  dashErr: { background: "#fff3f3", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.terra },
};
