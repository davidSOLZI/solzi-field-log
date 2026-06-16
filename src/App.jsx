import { useState, useEffect, useCallback } from "react";

const CREAM = "#F5EFE4";
const TERRA = "#C4501A";
const DARK = "#2C1A0E";
const CARD = "#FDF8F2";
const BORDER = "#E8DDD0";
const GOLD = "#C4916A";
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

// ── Movement categories ────────────────────────────────────────────────────
// Display category | sheet location | items
const CATEGORIES = [
  {
    label: "Sampling",
    sheetLocation: "Marketing",
    items: ["Retail MAC", "Events", "Retail Pop-Up"],
  },
  {
    label: "Marketing",
    sheetLocation: "Marketing",
    items: ["Influencer Gifting", "Strategic Seeding", "UGC / Content", "Photoshoot", "Founder Use"],
  },
  {
    label: "Retail",
    sheetLocation: "Retail",
    items: ["First Case Free", "Retail Order"],
  },
  {
    label: "Customer",
    sheetLocation: "Customer",
    items: ["Offices", "Manual DTC Order"],
  },
  {
    label: "Shrinkage",
    sheetLocation: "Loss",
    items: ["Damaged / Lost", "Adjustment"],
  },
];

function getSheetLocation(movementType) {
  for (const cat of CATEGORIES) {
    if (cat.items.includes(movementType)) return cat.sheetLocation;
  }
  return "Marketing";
}

// ── Ledger column order (10 cols) ─────────────────────────────────────────
// WEEK START | DATE | LOCATION FROM | LOCATION TO | MOVEMENT TYPE | CASES | CANS | TOTAL CANS | NOTES | SOURCE

// ── Shared styles ─────────────────────────────────────────────────────────
const s = {
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.2,
    color: "#8B7355",
    textTransform: "uppercase",
    marginBottom: 8,
    paddingLeft: 2,
  },
  card: {
    background: CARD,
    borderRadius: 12,
    border: `1px solid ${BORDER}`,
    marginBottom: 16,
  },
  input: {
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${BORDER}`,
    background: "#fff",
    fontSize: 14,
    color: DARK,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
};

// ── Stepper ───────────────────────────────────────────────────────────────
function Stepper({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#8B7355", textTransform: "uppercase" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{
            width: 36, height: 38, borderRadius: "8px 0 0 8px",
            border: `1px solid ${BORDER}`, background: CARD,
            fontSize: 20, color: TERRA, cursor: "pointer", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1,
          }}
        >−</button>
        <input
          type="number"
          min="0"
          value={value === 0 ? "" : value}
          placeholder="0"
          onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          style={{
            width: 54, height: 38, textAlign: "center",
            border: `1px solid ${BORDER}`, borderLeft: "none", borderRight: "none",
            background: "#fff", fontSize: 17, fontWeight: 700, color: DARK,
            outline: "none", fontFamily: "inherit",
          }}
        />
        <button
          onClick={() => onChange(value + 1)}
          style={{
            width: 36, height: 38, borderRadius: "0 8px 8px 0",
            border: `1px solid ${BORDER}`, background: CARD,
            fontSize: 20, color: TERRA, cursor: "pointer", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1,
          }}
        >+</button>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: type === "success" ? "#2E7D32" : "#B71C1C",
      color: "#fff", borderRadius: 10, padding: "10px 22px",
      fontSize: 14, fontWeight: 600, zIndex: 999,
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      whiteSpace: "nowrap",
    }}>{msg}</div>
  );
}

// ── FIELD LOG TAB ─────────────────────────────────────────────────────────
function FieldLogTab({ onSuccess }) {
  const [movementType, setMovementType] = useState("");
  const [cases, setCases] = useState(0);
  const [looseCans, setLooseCans] = useState(0);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("idle");
  const [toast, setToast] = useState(null);

  const totalCans = cases * 12 + looseCans;
  const ready = movementType && totalCans > 0;

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSubmit() {
    if (!ready) return;
    setStatus("loading");

    const now = new Date();
    // Week start = Monday
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now);
    weekStart.setDate(diff);
    const fmt = (d) => d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    const dateStr = fmt(now);
    const weekStr = fmt(weekStart);

    const sheetLocation = getSheetLocation(movementType);

    // 10-col Ledger row
    const row = [
      weekStr,          // WEEK START
      dateStr,          // DATE
      "Airdrome Garage",// LOCATION FROM
      sheetLocation,    // LOCATION TO
      movementType,     // MOVEMENT TYPE
      cases,            // CASES
      looseCans,        // CANS
      totalCans,        // TOTAL CANS
      notes,            // NOTES
      "Field Log",      // SOURCE
    ];

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fieldLog", row }),
      });
      setStatus("success");
      showToast(`✓ Logged ${totalCans} cans — ${movementType}`, "success");
      setMovementType("");
      setCases(0);
      setLooseCans(0);
      setNotes("");
      setTimeout(() => {
        setStatus("idle");
        onSuccess && onSuccess();
      }, 2000);
    } catch {
      setStatus("error");
      showToast("Failed to log. Check connection.", "error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      {/* Movement Type */}
      <div style={s.sectionLabel}>Movement Type</div>
      <div style={{ ...s.card, overflow: "hidden" }}>
        {CATEGORIES.map((cat, ci) => (
          <div key={cat.label}>
            <div style={{
              padding: "8px 14px 4px",
              fontSize: 10, fontWeight: 700, letterSpacing: 1,
              color: "#8B7355", textTransform: "uppercase",
              borderTop: ci > 0 ? `1px solid ${BORDER}` : "none",
              background: "#F9F4EE",
            }}>
              {cat.label}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: cat.items.length === 1 ? "1fr" : "1fr 1fr",
              gap: 8, padding: "8px 10px 10px",
            }}>
              {cat.items.map((item, idx) => {
                const isLast = idx === cat.items.length - 1;
                const isOdd = cat.items.length % 2 !== 0;
                return (
                  <button
                    key={item}
                    onClick={() => setMovementType(item)}
                    style={{
                      padding: "10px 6px",
                      borderRadius: 8,
                      border: movementType === item ? `2px solid ${TERRA}` : `1px solid ${BORDER}`,
                      background: movementType === item ? "#FDE8DE" : "#fff",
                      color: movementType === item ? TERRA : DARK,
                      fontWeight: movementType === item ? 700 : 400,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.12s",
                      gridColumn: isLast && isOdd ? "1 / -1" : undefined,
                    }}
                  >{item}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quantity */}
      <div style={s.sectionLabel}>Quantity</div>
      <div style={{ ...s.card, padding: "16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <Stepper label="Cases (×12)" value={cases} onChange={setCases} />
          <div style={{ width: 1, height: 52, background: BORDER }} />
          <Stepper label="Loose Cans" value={looseCans} onChange={setLooseCans} />
        </div>
        <div style={{
          marginTop: 14,
          background: totalCans > 0 ? DARK : "#E8DDD0",
          borderRadius: 8, padding: "10px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          transition: "background 0.2s",
        }}>
          <span style={{ color: totalCans > 0 ? GOLD : "#8B7355", fontSize: 13, fontWeight: 600 }}>Total cans</span>
          <span style={{ color: totalCans > 0 ? "#fff" : "#8B7355", fontSize: 22, fontWeight: 800 }}>{totalCans}</span>
        </div>
      </div>

      {/* Notes */}
      <div style={s.sectionLabel}>Notes (Optional)</div>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="e.g. Venice pop-up..."
        rows={2}
        style={{ ...s.input, resize: "none", marginBottom: 20 }}
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!ready || status === "loading"}
        style={{
          width: "100%", padding: "14px",
          borderRadius: 12, border: "none",
          background: status === "success" ? "#2E7D32" : ready ? TERRA : "#C8B8A2",
          color: "#fff", fontSize: 16, fontWeight: 700,
          cursor: ready ? "pointer" : "default",
          transition: "background 0.3s",
        }}
      >
        {status === "loading" ? "Logging…"
          : status === "success" ? "✓ Logged!"
          : `Log ${totalCans > 0 ? totalCans + " cans" : "entry"}${movementType ? " — " + movementType : ""}`}
      </button>

      <Toast msg={toast?.msg} type={toast?.type} />
    </div>
  );
}

// ── INVENTORY COUNT TAB ───────────────────────────────────────────────────
const FIXED_LOCS = [
  "Full pallets", "Garage — other", "Garage fridge",
  "Outdoor fridge", "Airdrome", "David's car", "Sophy's car",
];

function InventoryCountTab() {
  const initLocs = () => Object.fromEntries(FIXED_LOCS.map(l => [l, { cases: "", cans: "" }]));
  const [locs, setLocs] = useState(initLocs());
  const [extraLocs, setExtraLocs] = useState([]);
  const [newLocName, setNewLocName] = useState("");
  const [ledgerExpected, setLedgerExpected] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("idle");
  const [toast, setToast] = useState(null);

  function totalCans() {
    let t = 0;
    FIXED_LOCS.forEach(l => {
      t += (parseFloat(locs[l].cases) || 0) * 12 + (parseInt(locs[l].cans) || 0);
    });
    extraLocs.forEach(l => {
      t += (parseFloat(l.cases) || 0) * 12 + (parseInt(l.cans) || 0);
    });
    return t;
  }

  function totalCasesDisplay() {
    const v = totalCans() / 12;
    // Round to max 2 decimal places, strip trailing zeros
    return parseFloat(v.toFixed(2));
  }

  const variance = ledgerExpected !== "" ? totalCans() - parseInt(ledgerExpected) : null;

  function updateFixed(loc, field, val) {
    setLocs(prev => ({ ...prev, [loc]: { ...prev[loc], [field]: val } }));
  }
  function updateExtra(idx, field, val) {
    setExtraLocs(prev => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l));
  }
  function addLoc() {
    const name = newLocName.trim();
    if (!name) return;
    setExtraLocs(prev => [...prev, { name, cases: "", cans: "" }]);
    setNewLocName("");
  }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSubmit() {
    setStatus("loading");
    const now = new Date();
    const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const weekStart = new Date(now);
    const day = now.getDay();
    weekStart.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const allLocs = {};
    FIXED_LOCS.forEach(l => { allLocs[l] = locs[l]; });
    extraLocs.forEach(l => { allLocs[l.name] = { cases: l.cases, cans: l.cans }; });

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "inventoryCount",
          date: fmt(now),
          time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          weekOf: `${fmt(weekStart)} – ${fmt(weekEnd)}`,
          totalCases: totalCasesDisplay(),
          totalCans: totalCans(),
          ledgerExpected: ledgerExpected || "",
          variance: variance !== null ? variance : "",
          locations: JSON.stringify(allLocs),
          notes,
        }),
      });
      setStatus("success");
      showToast("✓ Count submitted!", "success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      showToast("Failed to submit.", "error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const inputSm = {
    ...s.input,
    padding: "7px 8px",
    fontSize: 13,
    borderRadius: 7,
  };

  function LocRow({ label, data, onUpdate }) {
    const rowCans = (parseFloat(data.cases) || 0) * 12 + (parseInt(data.cans) || 0);
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(90px,1fr) 78px 78px 48px",
        gap: 6, alignItems: "center",
        padding: "9px 0",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <span style={{ fontSize: 13, color: DARK, fontWeight: 500, paddingRight: 4 }}>{label}</span>
        <input
          type="number" min="0" step="0.5" placeholder="Cases"
          value={data.cases}
          onChange={e => onUpdate("cases", e.target.value)}
          style={inputSm}
        />
        <input
          type="number" min="0" placeholder="Cans"
          value={data.cans}
          onChange={e => onUpdate("cans", e.target.value)}
          style={inputSm}
        />
        <span style={{ fontSize: 12, color: "#8B7355", textAlign: "right", fontWeight: 600 }}>
          {rowCans > 0 ? rowCans : "—"}
        </span>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <div style={s.sectionLabel}>Weekly Count</div>

      {/* Column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(90px,1fr) 78px 78px 48px",
        gap: 6, paddingBottom: 6,
      }}>
        {["Location", "Cases", "Cans", "Total"].map((h, i) => (
          <span key={h} style={{
            fontSize: 10, color: "#8B7355", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 0.8,
            textAlign: i === 3 ? "right" : "left",
          }}>{h}</span>
        ))}
      </div>

      <div style={{ ...s.card, padding: "0 14px" }}>
        {FIXED_LOCS.map(loc => (
          <LocRow
            key={loc} label={loc} data={locs[loc]}
            onUpdate={(field, val) => updateFixed(loc, field, val)}
          />
        ))}
        {extraLocs.map((loc, i) => (
          <LocRow
            key={loc.name} label={loc.name} data={loc}
            onUpdate={(field, val) => updateExtra(i, field, val)}
          />
        ))}
        {/* Add location */}
        <div style={{ display: "flex", gap: 8, padding: "10px 0" }}>
          <input
            type="text" placeholder="+ Add location"
            value={newLocName}
            onChange={e => setNewLocName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addLoc()}
            style={{ ...inputSm, flex: 1 }}
          />
          <button onClick={addLoc} style={{
            padding: "7px 14px", borderRadius: 7,
            border: `1px solid ${TERRA}`, background: "transparent",
            color: TERRA, fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>Add</button>
        </div>
      </div>

      {/* Totals card */}
      <div style={{
        background: DARK, borderRadius: 12, padding: "14px 16px", marginBottom: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: GOLD, fontSize: 13 }}>Total cases</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{totalCasesDisplay()}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: variance !== null ? 10 : 0 }}>
          <span style={{ color: GOLD, fontSize: 13 }}>Total cans</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{totalCans()}</span>
        </div>
        {variance !== null && (
          <div style={{
            display: "flex", justifyContent: "space-between",
            borderTop: "1px solid #4a3020", paddingTop: 10,
          }}>
            <span style={{ color: GOLD, fontSize: 13 }}>Variance vs ledger</span>
            <span style={{
              fontWeight: 700, fontSize: 16,
              color: Math.abs(variance) <= 12 ? "#81C784" : Math.abs(variance) <= 24 ? "#FFD54F" : "#E57373",
            }}>
              {variance > 0 ? "+" : ""}{variance} cans
            </span>
          </div>
        )}
      </div>

      {/* Ledger expected */}
      <div style={s.sectionLabel}>Ledger Expected (optional)</div>
      <input
        type="number" placeholder="e.g. 1440"
        value={ledgerExpected}
        onChange={e => setLedgerExpected(e.target.value)}
        style={{ ...s.input, marginBottom: 16 }}
      />

      <div style={s.sectionLabel}>Notes (Optional)</div>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Any notes about this count..."
        rows={2}
        style={{ ...s.input, resize: "none", marginBottom: 20 }}
      />

      <button
        onClick={handleSubmit}
        disabled={status === "loading" || totalCans() === 0}
        style={{
          width: "100%", padding: "14px",
          borderRadius: 12, border: "none",
          background: status === "success" ? "#2E7D32" : totalCans() > 0 ? TERRA : "#C8B8A2",
          color: "#fff", fontSize: 16, fontWeight: 700,
          cursor: totalCans() > 0 ? "pointer" : "default",
        }}
      >
        {status === "loading" ? "Submitting…" : status === "success" ? "✓ Submitted!" : "Submit Count"}
      </button>

      <Toast msg={toast?.msg} type={toast?.type} />
    </div>
  );
}

// ── DASHBOARD TAB ─────────────────────────────────────────────────────────
function DashboardTab({ refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=dashboard`);
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#8B7355" }}>Loading dashboard…</div>
  );
  if (error || !data) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ color: "#B71C1C", marginBottom: 12 }}>Couldn't load dashboard</div>
      <button onClick={fetchData} style={{
        padding: "8px 20px", borderRadius: 8,
        border: `1px solid ${TERRA}`, background: "transparent",
        color: TERRA, fontWeight: 700, cursor: "pointer",
      }}>Retry</button>
    </div>
  );

  const {
    airdromeCases = 0,
    thirdPartyCases = 0,
    totalCases = 0,
    weeklyUsage = { Customer: 0, Retail: 0, Marketing: 0 },
    thisWeekCans = 0,
    thisWeekCases = 0,
    recentEntries = [],
  } = data;

  return (
    <div style={{ padding: "16px 16px 100px" }}>

      {/* Total On Hand */}
      <div style={s.sectionLabel}>Total On Hand</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Airdrome", value: airdromeCases },
          { label: "3PL", value: thirdPartyCases },
          { label: "Total", value: totalCases, accent: true },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{
            ...s.card,
            flex: 1, marginBottom: 0,
            padding: "12px 14px",
            background: accent ? DARK : CARD,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: accent ? GOLD : "#8B7355", marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: accent ? "#fff" : DARK }}>
              {Math.round(value)}
            </div>
            <div style={{ fontSize: 10, color: accent ? GOLD : "#8B7355", marginTop: 2 }}>cases</div>
          </div>
        ))}
      </div>

      {/* Usage by category */}
      <div style={s.sectionLabel}>Usage (Cases)</div>
      <div style={{ ...s.card, padding: "0 0" }}>
        {[
          { label: "Customer", value: weeklyUsage.Customer },
          { label: "Retail", value: weeklyUsage.Retail },
          { label: "Marketing", value: weeklyUsage.Marketing },
        ].map(({ label, value }, i, arr) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px",
            borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none",
          }}>
            <span style={{ fontSize: 14, color: DARK }}>{label}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: TERRA }}>{Math.round(value)}</span>
          </div>
        ))}
      </div>

      {/* This week */}
      <div style={s.sectionLabel}>This Week</div>
      <div style={{ ...s.card, padding: "12px 16px", display: "flex", gap: 16 }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#8B7355", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Cans</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: DARK }}>{Math.round(thisWeekCans)}</div>
        </div>
        <div style={{ width: 1, background: BORDER }} />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#8B7355", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Cases</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: DARK }}>{Math.round(thisWeekCases)}</div>
        </div>
      </div>

      {/* Recent entries */}
      <div style={s.sectionLabel}>Recent Entries</div>
      <div style={{ ...s.card, overflow: "hidden" }}>
        {recentEntries.length === 0 ? (
          <div style={{ padding: 20, color: "#8B7355", fontSize: 14, textAlign: "center" }}>No entries yet</div>
        ) : recentEntries.map((entry, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "11px 14px",
            borderBottom: i < recentEntries.length - 1 ? `1px solid ${BORDER}` : "none",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{entry.movementType}</div>
              {entry.notes && (
                <div style={{ fontSize: 11, color: "#8B7355", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {entry.notes}
                </div>
              )}
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{entry.date}</div>
            </div>
            <div style={{
              fontSize: 14, fontWeight: 800, color: TERRA,
              background: "#FDE8DE", borderRadius: 8, padding: "4px 10px",
              marginLeft: 10, whiteSpace: "nowrap",
            }}>
              {Math.round(entry.totalCans)} cans
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "right", marginTop: 8 }}>
        <button onClick={fetchData} style={{
          fontSize: 12, color: "#8B7355", background: "none",
          border: "none", cursor: "pointer", textDecoration: "underline",
        }}>Refresh</button>
      </div>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("fieldlog");
  const [dashRefresh, setDashRefresh] = useState(0);

  const TABS = [
    { id: "fieldlog",  label: "Field Log" },
    { id: "inventory", label: "Inventory Count" },
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Fixed header + tab bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: TERRA,
        boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
      }}>
        {/* Logo row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, padding: "10px 16px 2px",
        }}>
          <img
            src="https://drinksolzi.com/cdn/shop/files/SOLZI_Secondary_Logo_Terracotta.png"
            alt="SOLZI"
            style={{ height: 26, width: 26, objectFit: "contain", filter: "brightness(10)" }}
            onError={e => { e.target.style.display = "none"; }}
          />
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 17, letterSpacing: 2.5 }}>SOLZI</span>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: "8px 4px 9px",
                border: "none", background: "transparent",
                color: tab === t.id ? "#fff" : "rgba(255,255,255,0.6)",
                fontWeight: tab === t.id ? 700 : 400,
                fontSize: 12, cursor: "pointer",
                borderBottom: tab === t.id ? "2.5px solid #fff" : "2.5px solid transparent",
                transition: "all 0.15s",
                letterSpacing: 0.2,
                fontFamily: "inherit",
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Scrollable content — offset below fixed header */}
      <div style={{ paddingTop: 80 }}>
        {tab === "fieldlog"  && <FieldLogTab onSuccess={() => setDashRefresh(k => k + 1)} />}
        {tab === "inventory" && <InventoryCountTab />}
        {tab === "dashboard" && <DashboardTab refreshKey={dashRefresh} />}
      </div>
    </div>
  );
}
