import { useState, useEffect, useCallback } from "react";

const CREAM = "#F5EFE4";
const TERRA = "#C4501A";
const DARK = "#2C1A0E";
const CARD = "#FDF8F2";
const BORDER = "#E8DDD0";
const BADGE_URL = "https://drinksolzi.com/cdn/shop/files/SOLZI_Secondary_Logo_Terracotta.png";
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

// Movement categories — display label, spreadsheet value, items
const MOVEMENT_CATEGORIES = [
  {
    category: "Sampling",
    sheetCategory: "Marketing",
    items: ["Retail MAC", "Events", "Retail Pop-Up"],
  },
  {
    category: "Marketing",
    sheetCategory: "Marketing",
    items: ["Influencer Gifting", "Strategic Seeding", "UGC / Content", "Photoshoot", "Founder Use"],
  },
  {
    category: "Retail",
    sheetCategory: "Retail",
    items: ["First Case Free", "Retail Order"],
  },
  {
    category: "Customer",
    sheetCategory: "Customer",
    items: ["Offices", "Manual DTC Order"],
  },
  {
    category: "Shrinkage",
    sheetCategory: "Shrinkage",
    items: ["Damaged / Lost", "Adjustment"],
  },
];

function getSheetCategory(movementType) {
  for (const cat of MOVEMENT_CATEGORIES) {
    if (cat.items.includes(movementType)) return cat.sheetCategory;
  }
  return "Marketing";
}

// ── Stepper component ──────────────────────────────────────────────────────
function Stepper({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#8B7355", textTransform: "uppercase" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{
            width: 36, height: 36, borderRadius: "8px 0 0 8px",
            border: `1px solid ${BORDER}`, background: CARD,
            fontSize: 18, color: TERRA, cursor: "pointer", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >−</button>
        <input
          type="number"
          min="0"
          value={value}
          onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          style={{
            width: 52, height: 36, textAlign: "center",
            border: `1px solid ${BORDER}`, borderLeft: "none", borderRight: "none",
            background: "#fff", fontSize: 16, fontWeight: 700, color: DARK,
            outline: "none",
          }}
        />
        <button
          onClick={() => onChange(value + 1)}
          style={{
            width: 36, height: 36, borderRadius: "0 8px 8px 0",
            border: `1px solid ${BORDER}`, background: CARD,
            fontSize: 18, color: TERRA, cursor: "pointer", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >+</button>
      </div>
    </div>
  );
}

// ── Field Log Tab ──────────────────────────────────────────────────────────
function FieldLogTab({ onSubmitSuccess }) {
  const [movementType, setMovementType] = useState("");
  const [cases, setCases] = useState(0);
  const [looseCans, setLooseCans] = useState(0);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
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
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    const payload = {
      action: "fieldLog",
      date: dateStr,
      time: timeStr,
      movementType,
      sheetCategory: getSheetCategory(movementType),
      cases,
      cans: looseCans,
      totalCans,
      notes,
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus("success");
      showToast(`✓ Logged ${totalCans} cans — ${movementType}`, "success");
      // Reset
      setMovementType("");
      setCases(0);
      setLooseCans(0);
      setNotes("");
      setTimeout(() => {
        setStatus("idle");
        onSubmitSuccess && onSubmitSuccess();
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
      <SectionHeader>Movement Type</SectionHeader>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden", marginBottom: 16 }}>
        {MOVEMENT_CATEGORIES.map((cat, ci) => (
          <div key={cat.category}>
            <div style={{
              padding: "8px 14px 4px",
              fontSize: 11, fontWeight: 700, letterSpacing: 1,
              color: "#8B7355", textTransform: "uppercase",
              borderTop: ci > 0 ? `1px solid ${BORDER}` : "none",
            }}>
              {cat.category}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "4px 10px 10px" }}>
              {cat.items.map(item => (
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
                    transition: "all 0.15s",
                    gridColumn: cat.items.length % 2 !== 0 && item === cat.items[cat.items.length - 1] ? "1 / -1" : undefined,
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quantity */}
      <SectionHeader>Quantity</SectionHeader>
      <div style={{
        background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`,
        padding: "16px 12px", marginBottom: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", gap: 12 }}>
          <Stepper label="Cases (×12)" value={cases} onChange={setCases} />
          <div style={{ width: 1, height: 50, background: BORDER }} />
          <Stepper label="Loose Cans" value={looseCans} onChange={setLooseCans} />
        </div>
        <div style={{
          marginTop: 14,
          background: totalCans > 0 ? DARK : "#E8DDD0",
          borderRadius: 8, padding: "10px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ color: totalCans > 0 ? "#C4916A" : "#8B7355", fontSize: 13, fontWeight: 600 }}>Total cans</span>
          <span style={{ color: totalCans > 0 ? "#fff" : "#8B7355", fontSize: 22, fontWeight: 800 }}>{totalCans}</span>
        </div>
      </div>

      {/* Notes */}
      <SectionHeader>Notes (Optional)</SectionHeader>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="e.g. Venice pop-up..."
        rows={2}
        style={{
          width: "100%", boxSizing: "border-box",
          borderRadius: 10, border: `1px solid ${BORDER}`,
          padding: "10px 14px", fontSize: 14, color: DARK,
          background: CARD, resize: "none", outline: "none",
          fontFamily: "inherit", marginBottom: 20,
        }}
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
        {status === "loading" ? "Logging…" : status === "success" ? "✓ Logged!" : `Log ${totalCans > 0 ? totalCans + " cans" : "entry"}${movementType ? " — " + movementType : ""}`}
      </button>

      {toast && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "success" ? "#2E7D32" : "#B71C1C",
          color: "#fff", borderRadius: 10, padding: "10px 20px",
          fontSize: 14, fontWeight: 600, zIndex: 999,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          whiteSpace: "nowrap",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Inventory Count Tab ────────────────────────────────────────────────────
const FIXED_LOCATIONS = [
  "Full pallets", "Garage — other", "Garage fridge",
  "Outdoor fridge", "Airdrome", "David's car", "Sophy's car",
];

function InventoryCountTab() {
  const [locations, setLocations] = useState(
    Object.fromEntries(FIXED_LOCATIONS.map(l => [l, { cases: "", cans: "" }]))
  );
  const [extraLocations, setExtraLocations] = useState([]);
  const [newLocName, setNewLocName] = useState("");
  const [notes, setNotes] = useState("");
  const [ledgerExpected, setLedgerExpected] = useState("");
  const [status, setStatus] = useState("idle");
  const [toast, setToast] = useState(null);

  function allLocations() {
    const all = {};
    FIXED_LOCATIONS.forEach(l => { all[l] = locations[l]; });
    extraLocations.forEach(l => { all[l.name] = l; });
    return all;
  }

  function totalCans() {
    let t = 0;
    FIXED_LOCATIONS.forEach(l => {
      t += (parseFloat(locations[l].cases) || 0) * 12 + (parseInt(locations[l].cans) || 0);
    });
    extraLocations.forEach(l => {
      t += (parseFloat(l.cases) || 0) * 12 + (parseInt(l.cans) || 0);
    });
    return t;
  }

  function totalCasesFloat() {
    return totalCans() / 12;
  }

  const variance = ledgerExpected !== "" ? totalCans() - parseInt(ledgerExpected) : null;

  function updateFixed(loc, field, val) {
    setLocations(prev => ({ ...prev, [loc]: { ...prev[loc], [field]: val } }));
  }

  function updateExtra(idx, field, val) {
    setExtraLocations(prev => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l));
  }

  function addLocation() {
    const name = newLocName.trim();
    if (!name) return;
    setExtraLocations(prev => [...prev, { name, cases: "", cans: "" }]);
    setNewLocName("");
  }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSubmit() {
    setStatus("loading");
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekOf = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

    const payload = {
      action: "inventoryCount",
      date: dateStr,
      time: timeStr,
      weekOf,
      totalCases: totalCasesFloat().toFixed(2),
      totalLooseCans: 0,
      totalCans: totalCans(),
      ledgerExpected: ledgerExpected || "",
      variance: variance !== null ? variance : "",
      locations: JSON.stringify(allLocations()),
      notes,
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  function LocationRow({ label, data, onUpdate }) {
    const rowCans = (parseFloat(data.cases) || 0) * 12 + (parseInt(data.cans) || 0);
    return (
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 90px 90px 60px",
        gap: 8, alignItems: "center",
        padding: "10px 0", borderBottom: `1px solid ${BORDER}`,
      }}>
        <span style={{ fontSize: 13, color: DARK, fontWeight: 500 }}>{label}</span>
        <input
          type="number" min="0" step="0.5"
          placeholder="Cases"
          value={data.cases}
          onChange={e => onUpdate("cases", e.target.value)}
          style={inputStyle}
        />
        <input
          type="number" min="0"
          placeholder="Cans"
          value={data.cans}
          onChange={e => onUpdate("cans", e.target.value)}
          style={inputStyle}
        />
        <span style={{ fontSize: 13, color: "#8B7355", textAlign: "right", fontWeight: 600 }}>
          {rowCans > 0 ? rowCans : "—"}
        </span>
      </div>
    );
  }

  const inputStyle = {
    padding: "7px 8px", borderRadius: 7, border: `1px solid ${BORDER}`,
    background: "#fff", fontSize: 14, color: DARK, outline: "none",
    width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <SectionHeader>Weekly Count</SectionHeader>

      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 90px 90px 60px",
        gap: 8, padding: "0 0 6px",
      }}>
        <span style={{ fontSize: 11, color: "#8B7355", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Location</span>
        <span style={{ fontSize: 11, color: "#8B7355", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Cases</span>
        <span style={{ fontSize: 11, color: "#8B7355", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Cans</span>
        <span style={{ fontSize: 11, color: "#8B7355", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, textAlign: "right" }}>Total</span>
      </div>

      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "0 14px", marginBottom: 16 }}>
        {FIXED_LOCATIONS.map(loc => (
          <LocationRow
            key={loc}
            label={loc}
            data={locations[loc]}
            onUpdate={(field, val) => updateFixed(loc, field, val)}
          />
        ))}
        {extraLocations.map((loc, i) => (
          <LocationRow
            key={loc.name}
            label={loc.name}
            data={loc}
            onUpdate={(field, val) => updateExtra(i, field, val)}
          />
        ))}
        {/* Add location row */}
        <div style={{ display: "flex", gap: 8, padding: "10px 0" }}>
          <input
            type="text"
            placeholder="+ Add location"
            value={newLocName}
            onChange={e => setNewLocName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addLocation()}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={addLocation} style={{
            padding: "7px 14px", borderRadius: 7, border: `1px solid ${TERRA}`,
            background: "transparent", color: TERRA, fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>Add</button>
        </div>
      </div>

      {/* Totals card */}
      <div style={{ background: DARK, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: "#C4916A", fontSize: 13 }}>Total cases</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{totalCasesFloat().toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ledgerExpected !== "" ? 10 : 0 }}>
          <span style={{ color: "#C4916A", fontSize: 13 }}>Total cans</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{totalCans()}</span>
        </div>
        {ledgerExpected !== "" && variance !== null && (
          <div style={{
            display: "flex", justifyContent: "space-between",
            borderTop: "1px solid #4a3020", paddingTop: 10,
          }}>
            <span style={{ color: "#C4916A", fontSize: 13 }}>Variance</span>
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
      <SectionHeader>Ledger Expected (optional)</SectionHeader>
      <input
        type="number"
        placeholder="e.g. 1440"
        value={ledgerExpected}
        onChange={e => setLedgerExpected(e.target.value)}
        style={{ ...inputStyle, marginBottom: 16, display: "block", width: "100%", boxSizing: "border-box" }}
      />

      <SectionHeader>Notes (Optional)</SectionHeader>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Any notes about this count..."
        rows={2}
        style={{
          width: "100%", boxSizing: "border-box",
          borderRadius: 10, border: `1px solid ${BORDER}`,
          padding: "10px 14px", fontSize: 14, color: DARK,
          background: CARD, resize: "none", outline: "none",
          fontFamily: "inherit", marginBottom: 20,
        }}
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

      {toast && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "success" ? "#2E7D32" : "#B71C1C",
          color: "#fff", borderRadius: 10, padding: "10px 20px",
          fontSize: 14, fontWeight: 600, zIndex: 999,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          whiteSpace: "nowrap",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Dashboard Tab ──────────────────────────────────────────────────────────
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
    <div style={{ padding: 32, textAlign: "center", color: "#8B7355" }}>
      Loading dashboard…
    </div>
  );

  if (error || !data) return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <div style={{ color: "#B71C1C", marginBottom: 12 }}>Couldn't load dashboard</div>
      <button onClick={fetchData} style={{
        padding: "8px 20px", borderRadius: 8, border: `1px solid ${TERRA}`,
        background: "transparent", color: TERRA, fontWeight: 700, cursor: "pointer",
      }}>Retry</button>
    </div>
  );

  const { airdrome = 0, thirdParty = 0, totalOnHand = 0, weekCans = 0, recentEntries = [] } = data;

  function StatCard({ label, value, accent }) {
    return (
      <div style={{
        background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`,
        padding: "14px 16px", flex: 1,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#8B7355", textTransform: "uppercase", marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: accent || DARK }}>
          {Math.round(value)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <StatCard label="Airdrome" value={airdrome} />
        <StatCard label="3PL / Other" value={thirdParty} />
        <StatCard label="Total" value={totalOnHand} accent={TERRA} />
      </div>

      {/* This week */}
      <SectionHeader>This Week</SectionHeader>
      <div style={{
        background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`,
        padding: "14px 16px", marginBottom: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 14, color: "#8B7355" }}>Cans used</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: DARK }}>{Math.round(weekCans)}</span>
      </div>

      {/* Recent entries */}
      <SectionHeader>Recent Entries</SectionHeader>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        {recentEntries.length === 0 ? (
          <div style={{ padding: 20, color: "#8B7355", fontSize: 14, textAlign: "center" }}>No entries yet</div>
        ) : recentEntries.map((entry, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "11px 14px",
            borderBottom: i < recentEntries.length - 1 ? `1px solid ${BORDER}` : "none",
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{entry.movementType}</div>
              <div style={{ fontSize: 11, color: "#8B7355", marginTop: 2 }}>{entry.date}</div>
            </div>
            <div style={{
              fontSize: 15, fontWeight: 800, color: TERRA,
              background: "#FDE8DE", borderRadius: 8, padding: "4px 10px",
            }}>
              {Math.round(entry.totalCans)} cans
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "right", marginTop: 10 }}>
        <button onClick={fetchData} style={{
          fontSize: 12, color: "#8B7355", background: "none", border: "none",
          cursor: "pointer", textDecoration: "underline",
        }}>Refresh</button>
      </div>
    </div>
  );
}

// ── Shared section header ──────────────────────────────────────────────────
function SectionHeader({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
      color: "#8B7355", textTransform: "uppercase",
      marginBottom: 8, paddingLeft: 2,
    }}>
      {children}
    </div>
  );
}

// ── App Shell ──────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("fieldlog");
  const [dashRefreshKey, setDashRefreshKey] = useState(0);

  function handleFieldLogSuccess() {
    // Auto-refresh dashboard after a field log entry
    setDashRefreshKey(k => k + 1);
  }

  const tabs = [
    { id: "fieldlog", label: "Field Log" },
    { id: "inventory", label: "Inventory Count" },
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Fixed header */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: TERRA,
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      }}>
        {/* Logo bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 16px 4px", gap: 10 }}>
          <img src={BADGE_URL} alt="SOLZI" style={{ height: 28, width: 28, objectFit: "contain", filter: "brightness(10)" }} />
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: 2 }}>SOLZI</span>
        </div>
        {/* Tab bar */}
        <div style={{ display: "flex" }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: "8px 4px", border: "none",
                background: tab === t.id ? "rgba(255,255,255,0.2)" : "transparent",
                color: tab === t.id ? "#fff" : "rgba(255,255,255,0.65)",
                fontWeight: tab === t.id ? 700 : 400,
                fontSize: 12, cursor: "pointer",
                borderBottom: tab === t.id ? "2px solid #fff" : "2px solid transparent",
                transition: "all 0.15s",
                letterSpacing: 0.3,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content — offset by header height */}
      <div style={{ paddingTop: 82 }}>
        {tab === "fieldlog" && <FieldLogTab onSubmitSuccess={handleFieldLogSuccess} />}
        {tab === "inventory" && <InventoryCountTab />}
        {tab === "dashboard" && <DashboardTab refreshKey={dashRefreshKey} />}
      </div>
    </div>
  );
}
