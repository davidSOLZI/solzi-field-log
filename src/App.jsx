import { useState, useEffect } from 'react'

const SCRIPT = 'https://script.google.com/macros/s/AKfycbzYaSp7AMpD0S2YOahtIjznWQLU0wXJm66IgiHtZpz985nzoPg9RE3TAakoruIosY9z/exec'
const CPX = 12 // cans per case

const C = {
  cream:    '#F5EFE4',
  surf:     '#EDE5D6',
  surf2:    '#E0D4C0',
  bdr:      '#D4C4A8',
  bdrMid:   '#BEA98C',
  org:      '#C4501A',
  orgDk:    '#9C3D12',
  esp:      '#1E1008',
  brn:      '#5C3D22',
  brnMid:   '#7A5235',
  brnMt:    '#9C7B58',
  hdr:      '#851714',
  hdrDk:    '#6e1110',
  grn:      '#2D5A27',
  grnBg:    '#EAF0E8',
  amb:      '#7A5200',
  ambBg:    '#FFF3CD',
  red:      '#851714',
  redBg:    '#FDEAEA',
}

const TYPES = {
  Marketing: [
    'Sampling - Events', 'Sampling - Popups', 'Sampling - Retail MAC',
    'Strategic Seeding', 'Influencer Gifting', 'UGC / Content',
    'Photoshoot', 'Founder Use',
  ],
  Retail:    ['First Case Free', 'Retail Order'],
  Customer:  ['DTC Order', 'Offices', 'Paid Placement'],
  Shrinkage: ['Damaged / Lost'],
}

const LOCS = [
  { k: 'pallets',        l: 'Full pallets'   },
  { k: 'garage_other',   l: 'Garage other'   },
  { k: 'garage_fridge',  l: 'Garage fridge'  },
  { k: 'outdoor_fridge', l: 'Outdoor fridge' },
  { k: 'airdrome',       l: 'Airdrome'       },
  { k: 'david_car',      l: "David's car"    },
  { k: 'sophy_car',      l: "Sophy's car"    },
]

const QS = [1, 2, 4, 6, 12, 24]

// ── Shared primitives ─────────────────────────────────────────────────────────

function SecHead({ children, mt = 20 }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: C.brnMt, borderBottom: `1px solid ${C.bdr}`,
      paddingBottom: 8, marginTop: mt, marginBottom: 12,
    }}>{children}</div>
  )
}

function Card({ children, highlight }) {
  return (
    <div style={{
      background: C.surf, borderRadius: 12, padding: '12px 14px',
      border: highlight ? `1.5px solid ${C.org}` : 'none',
    }}>{children}</div>
  )
}

function MetricCard({ label, value, sub, highlight }) {
  return (
    <Card highlight={highlight}>
      <div style={{ fontSize: 11, color: C.brnMt, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 700, color: C.esp }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.brnMt, marginTop: 2 }}>{sub}</div>}
    </Card>
  )
}

function PrimaryBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: 15, borderRadius: 12, border: 'none',
      background: disabled ? C.brnMt : C.org,
      color: '#fff', fontSize: 16, fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      letterSpacing: '0.02em', marginTop: 16,
    }}>{children}</button>
  )
}

function Toast({ msg, type }) {
  if (!msg) return null
  return (
    <div style={{
      background: type === 'ok' ? C.grnBg : C.redBg,
      color: type === 'ok' ? C.grn : C.red,
      borderRadius: 10, padding: '11px 14px',
      fontSize: 14, textAlign: 'center', marginTop: 10,
    }}>{msg}</div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────

function Header({ user, onUser }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: C.hdr,
      padding: 'env(safe-area-inset-top, 44px) 16px 10px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/apple-touch-icon.png"
          onError={e => {
            e.target.onerror = null
            e.target.src = 'https://drinksolzi.com/cdn/shop/files/solzi-badge-logo_-seek-the-unexpected-solar-burst-rgb.svg?v=1770842938'
          }}
          alt="SOLZI"
          style={{ width: 36, height: 36, borderRadius: 7, objectFit: 'cover', background: 'rgba(255,255,255,0.1)' }}
        />
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.06em', color: '#fff' }}>SOLZI</div>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
            Inventory Tracker
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {['David', 'Sophy'].map(u => (
          <button key={u} onClick={() => onUser(u)} style={{
            padding: '5px 13px', borderRadius: 20,
            border: `1.5px solid ${u === user ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)'}`,
            background: u === user ? 'rgba(255,255,255,0.18)' : 'transparent',
            color: u === user ? '#fff' : 'rgba(255,255,255,0.65)',
            fontSize: 13, fontWeight: u === user ? 600 : 400, cursor: 'pointer',
          }}>{u}</button>
        ))}
      </div>
    </div>
  )
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

function TabBar({ tab, onTab }) {
  return (
    <div style={{
      position: 'sticky', top: 73, zIndex: 99,
      background: C.hdrDk, display: 'flex',
    }}>
      {[['field', 'Field Log'], ['count', 'Inventory Count'], ['dash', 'Dashboard']].map(([id, label]) => (
        <button key={id} onClick={() => onTab(id)} style={{
          flex: 1, padding: '10px 4px 9px', background: 'transparent', border: 'none',
          color: tab === id ? '#fff' : 'rgba(255,255,255,0.5)',
          fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', cursor: 'pointer',
          borderBottom: tab === id ? '2.5px solid #fff' : '2.5px solid transparent',
        }}>{label}</button>
      ))}
    </div>
  )
}

// ── Field Log ─────────────────────────────────────────────────────────────────

function FieldLogTab({ user }) {
  const [movType, setMovType] = useState(null)
  const [qty, setQty] = useState(null)
  const [customQty, setCustomQty] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(type, msg) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4500)
  }

  function reset() {
    setMovType(null); setQty(null); setCustomQty(''); setNotes('')
  }

  async function submit() {
    if (!movType) { showToast('err', 'Select a movement type'); return }
    const q = qty || parseInt(customQty)
    if (!q || q < 1) { showToast('err', 'Enter a quantity'); return }
    setLoading(true)
    try {
      const r = await fetch(SCRIPT, {
        method: 'POST', redirect: 'follow',
        body: JSON.stringify({ action: 'log_entry', submitter: user, movementType: movType, cans: q, notes }),
      })
      const d = await r.json()
      if (d.status === 'ok') { showToast('ok', `✓ ${q} cans logged — ${movType}`); reset() }
      else showToast('err', 'Error: ' + (d.message || 'unknown'))
    } catch { showToast('err', 'Network error. Try again.') }
    finally { setLoading(false) }
  }

  const inputStyle = {
    border: `1.5px solid ${C.bdr}`, borderRadius: 10,
    background: C.surf, color: C.esp,
    fontSize: 16, fontFamily: 'inherit',
  }

  return (
    <div style={{ padding: '16px 16px 32px' }}>
      <SecHead mt={0}>Movement type</SecHead>

      {Object.entries(TYPES).map(([cat, types]) => (
        <div key={cat}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: C.brnMt, margin: '14px 0 8px',
          }}>{cat}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {types.map(t => (
              <button key={t} onClick={() => setMovType(t)} style={{
                padding: '8px 13px', borderRadius: 20,
                border: `1.5px solid ${movType === t ? C.org : C.bdr}`,
                background: movType === t ? C.org : C.surf,
                color: movType === t ? '#fff' : C.brn,
                fontSize: 13, fontWeight: movType === t ? 600 : 400,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{t}</button>
            ))}
          </div>
        </div>
      ))}

      <SecHead mt={22}>Quantity (cans)</SecHead>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
        {QS.map(q => (
          <button key={q} onClick={() => { setQty(q); setCustomQty('') }} style={{
            width: 46, height: 46, borderRadius: 10,
            border: `1.5px solid ${qty === q ? C.org : C.bdr}`,
            background: qty === q ? C.org : C.surf,
            color: qty === q ? '#fff' : C.brn,
            fontSize: 16, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{q}</button>
        ))}
        <input
          type="number" min="1" placeholder="custom" value={customQty}
          onChange={e => { setCustomQty(e.target.value); setQty(null) }}
          style={{ ...inputStyle, flex: 1, minWidth: 80, height: 46, textAlign: 'center', padding: '0 10px' }}
        />
      </div>

      <SecHead mt={22}>Notes (optional)</SecHead>
      <textarea
        placeholder="Location, person, event name…"
        value={notes} onChange={e => setNotes(e.target.value)} rows={3}
        style={{ ...inputStyle, width: '100%', padding: '11px 13px', resize: 'none', minHeight: 72 }}
      />

      <PrimaryBtn onClick={submit} disabled={loading}>
        {loading ? 'Logging…' : 'Log Entry'}
      </PrimaryBtn>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}

// ── Inventory Count ───────────────────────────────────────────────────────────

function InventoryCountTab() {
  const initLocs = Object.fromEntries(LOCS.map(l => [l.k, { cases: 0, cans: 0 }]))
  const [locs, setLocs] = useState(initLocs)
  const [ledger, setLedger] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetch(SCRIPT + '?action=inventory_ledger', { redirect: 'follow' })
      .then(r => r.json())
      .then(d => { if (d.airdromeCases !== undefined) setLedger(d.airdromeCases) })
      .catch(() => {})
  }, [])

  function showToast(type, msg) {
    setToast({ type, msg }); setTimeout(() => setToast(null), 4500)
  }

  function setLoc(key, field, val) {
    setLocs(prev => ({ ...prev, [key]: { ...prev[key], [field]: parseFloat(val) || 0 } }))
  }

  // Derived
  const locTotals = Object.fromEntries(LOCS.map(l => [l.k, locs[l.k].cases * CPX + locs[l.k].cans]))
  const totalCans  = Object.values(locTotals).reduce((s, v) => s + v, 0)
  const obsRound   = Math.round(totalCans / CPX * 100) / 100

  // Gap
  const gap      = ledger !== null ? totalCans / CPX - ledger : null
  const gapRound = gap !== null ? Math.round(gap * 100) / 100 : null
  const gapCans  = gap !== null ? Math.round(gap * CPX) : null
  const absGap   = gapRound !== null ? Math.abs(gapRound) : null

  let gapColor, gapBg, gapLabel
  if (absGap === null) {
    gapColor = C.brnMt; gapBg = C.surf; gapLabel = '—'
  } else if (absGap <= 1) {
    gapColor = C.grn; gapBg = C.grnBg; gapLabel = '✓ Within tolerance'
  } else if (absGap <= 2) {
    gapColor = C.amb; gapBg = C.ambBg; gapLabel = '⚠ Minor variance'
  } else {
    gapColor = C.red; gapBg = C.redBg; gapLabel = '✕ Significant variance — recount'
  }

  async function saveCount() {
    const locsPayload = LOCS.map(l => ({ name: l.l, cases: locs[l.k].cases, cans: locs[l.k].cans }))
    const shrinkage   = ledger !== null ? Math.round((obsRound - ledger) * 100) / 100 : null
    setLoading(true)
    try {
      const r = await fetch(SCRIPT, {
        method: 'POST', redirect: 'follow',
        body: JSON.stringify({
          action: 'inventory_count', locations: locsPayload,
          totalCans: Math.round(totalCans), ledgerCases: ledger,
          observedCases: obsRound, shrinkage,
        }),
      })
      const d = await r.json()
      if (d.status === 'ok') showToast('ok', '✓ Count saved to sheet')
      else showToast('err', 'Error: ' + (d.message || 'unknown'))
    } catch { showToast('err', 'Network error. Try again.') }
    finally { setLoading(false) }
  }

  const numInput = (key, field) => ({
    type: 'number', min: 0, inputMode: 'numeric',
    value: locs[key][field] === 0 ? '' : locs[key][field],
    placeholder: '0',
    onChange: e => setLoc(key, field, e.target.value),
    style: {
      width: '100%', textAlign: 'right',
      border: `1.5px solid ${C.bdr}`, borderRadius: 8,
      padding: '7px 8px', background: C.surf,
      color: C.esp, fontSize: 15, fontFamily: 'inherit',
    },
  })

  return (
    <div style={{ padding: '16px 16px 32px' }}>
      <SecHead mt={0}>Location counts</SecHead>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 54px', gap: '0 6px', paddingBottom: 8 }}>
        {['Location', 'Cases', '+ Cans', 'Total'].map((h, i) => (
          <div key={h} style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: C.brnMt,
            textAlign: i === 0 ? 'left' : 'right',
          }}>{h}</div>
        ))}
      </div>

      {LOCS.map((loc, i) => (
        <div key={loc.k} style={{
          display: 'grid', gridTemplateColumns: '1fr 72px 72px 54px', gap: '0 6px',
          borderTop: i === 0 ? `1px solid ${C.bdr}` : 'none',
          borderBottom: `1px solid ${C.bdr}`, padding: '5px 0', alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, color: C.brn, whiteSpace: 'nowrap' }}>{loc.l}</span>
          <input {...numInput(loc.k, 'cases')} />
          <input {...numInput(loc.k, 'cans')} />
          <div style={{ textAlign: 'right', fontSize: 13, color: C.brnMt, padding: '0 4px' }}>
            {Math.round(locTotals[loc.k])}
          </div>
        </div>
      ))}

      {/* Total bar */}
      <div style={{
        background: C.org, color: '#fff', borderRadius: 12,
        padding: '14px 16px', margin: '14px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>
            Total on hand
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
            {Math.round(totalCans).toLocaleString()} cans
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{obsRound.toFixed(2)} cases</div>
      </div>

      <SecHead>Vs. Airdrome ledger</SecHead>

      {/* Compare cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
        {[
          ['Ledger',   ledger !== null ? ledger : '…',              'cases'],
          ['Observed', obsRound.toFixed(2),                          'cases'],
          ['Gap',      gapRound !== null ? (gap >= 0 ? '+' : '') + gapRound.toFixed(2) : '—',
                       gapCans !== null ? (gapCans >= 0 ? '+' : '') + gapCans + ' cans' : 'cans'],
        ].map(([lbl, val, sub], i) => (
          <div key={lbl} style={{
            background: i === 2 ? gapBg : C.surf,
            borderRadius: 10, padding: '10px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: C.brnMt, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{lbl}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: i === 2 ? gapColor : C.esp }}>{val}</div>
            <div style={{ fontSize: 10, color: C.brnMt, marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Gap status bar */}
      {gap !== null && (
        <div style={{
          background: gapBg, borderRadius: 12, padding: '12px 16px', marginBottom: 4,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: gapColor }}>
            {gapLabel}
          </span>
          <span style={{ fontSize: 18, fontWeight: 700, color: gapColor }}>
            {(gap >= 0 ? '+' : '') + gapRound.toFixed(2)} cases
          </span>
        </div>
      )}

      <PrimaryBtn onClick={saveCount} disabled={loading}>
        {loading ? 'Saving…' : 'Save Count'}
      </PrimaryBtn>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function DashboardTab() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr]       = useState(false)

  async function load() {
    setLoading(true); setErr(false)
    try {
      const r = await fetch(SCRIPT + '?action=dashboard', { redirect: 'follow' })
      setData(await r.json())
    } catch { setErr(true) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const inv    = data?.inventory    || {}
  const usage  = data?.usage        || {}
  const week   = data?.thisWeek     || {}
  const recent = data?.recentEntries || []

  const c   = parseFloat(usage.customer?.cases)  || 0
  const r   = parseFloat(usage.retail?.cases)    || 0
  const m   = parseFloat(usage.marketing?.cases) || 0
  const tot = c + r + m
  const pct = n => tot > 0 ? Math.round(n / tot * 100) + '%' : '—'

  return (
    <div style={{ padding: '4px 16px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <button onClick={load} style={{
          padding: '5px 11px', borderRadius: 8,
          border: `1.5px solid ${C.bdr}`, background: 'transparent',
          color: C.brnMt, fontSize: 12, cursor: 'pointer',
        }}>↻ Refresh</button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 48, color: C.brnMt }}>Loading…</div>
      )}
      {err && (
        <div style={{ textAlign: 'center', padding: 24, color: C.red, fontSize: 13 }}>
          Could not load data. Check connection and try refreshing.
        </div>
      )}

      {!loading && !err && (
        <>
          {/* ── Total on hand ── */}
          <SecHead mt={8}>Total on hand</SecHead>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8 }}>
            <MetricCard label="Airdrome" value={inv.airdrome ?? '—'} sub="cases" />
            <MetricCard label="3PL"      value={inv.threepl  ?? '—'} sub="cases" />
            <MetricCard
              label="Total" value={inv.total ?? '—'}
              sub={`cases · ${Math.round((inv.total || 0) * CPX).toLocaleString()} cans`}
              highlight
            />
          </div>

          {/* ── Usage to date ── */}
          <SecHead>Usage to date</SecHead>
          <Card>
            {[['Customer', c, pct(c)], ['Retail', r, pct(r)], ['Marketing', m, pct(m)]].map(([lbl, n, p]) => (
              <div key={lbl} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '9px 0', borderBottom: `1px solid ${C.bdr}`, fontSize: 14,
              }}>
                <span style={{ color: C.brn }}>{lbl}</span>
                <span style={{ fontWeight: 500, color: C.esp }}>
                  {n} cases{' '}
                  <span style={{ fontSize: 11, color: C.brnMt, fontWeight: 400 }}>{p}</span>
                </span>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '10px 0 2px', fontSize: 14, fontWeight: 700,
              borderTop: `1px solid ${C.bdrMid}`, marginTop: 4,
            }}>
              <span style={{ color: C.brn }}>Total outbound</span>
              <span style={{ color: C.esp }}>{tot} cases</span>
            </div>
          </Card>

          {/* ── This week ── */}
          <SecHead>This week</SecHead>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MetricCard label="Cans out"  value={Math.round(week.cans  || 0).toLocaleString()} sub="this week" />
            <MetricCard label="Cases out" value={(week.cases || 0).toFixed(1)}                  sub="this week" />
          </div>

          {/* ── Recent entries ── */}
          <SecHead>Recent entries</SecHead>
          <Card>
            {recent.length === 0 && (
              <div style={{ textAlign: 'center', padding: 16, color: C.brnMt, fontSize: 14 }}>No entries yet.</div>
            )}
            {recent.map((e, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '44px 1fr 52px', gap: '0 10px',
                padding: '8px 0',
                borderBottom: i < recent.length - 1 ? `1px solid ${C.bdr}` : 'none',
                alignItems: 'start',
              }}>
                <span style={{ fontSize: 12, color: C.brnMt, paddingTop: 2 }}>{e.date}</span>
                <div>
                  <div style={{ fontSize: 14, color: C.esp, lineHeight: 1.3 }}>{e.notes || '—'}</div>
                  <div style={{ fontSize: 11, color: C.brnMt, marginTop: 2 }}>{e.movType}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.brn, textAlign: 'right', paddingTop: 2 }}>
                  {Math.round(e.cans || 0)} cans
                </span>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab]   = useState('field')
  const [user, setUser] = useState('David')

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: C.cream, color: C.esp,
      minHeight: '100dvh',
      paddingBottom: 'env(safe-area-inset-bottom, 24px)',
    }}>
      <Header user={user} onUser={setUser} />
      <TabBar tab={tab} onTab={setTab} />
      {tab === 'field' && <FieldLogTab user={user} />}
      {tab === 'count' && <InventoryCountTab />}
      {tab === 'dash'  && <DashboardTab />}
    </div>
  )
}
