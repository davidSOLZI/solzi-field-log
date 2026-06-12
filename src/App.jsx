import { useState, useEffect } from 'react'

const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL
const CANS_PER_CASE = 12

const LOGO_URL = 'https://drinksolzi.com/cdn/shop/files/solzi-solzi-solar-burst-rgb.svg?v=1770826910'
const BADGE_URL = 'https://drinksolzi.com/cdn/shop/files/solzi-badge-logo_-seek-the-unexpected-solar-burst-rgb.svg?v=1770842938'

const MOVEMENT_TYPES = {
  'Sampling': ['Sampling - Events', 'Sampling - Retail MAC', 'Sampling - Popups'],
  'Marketing': ['Strategic Seeding', 'Founder Use', 'Influencer Gifting', 'Photoshoot', 'UGC / Content'],
  'Retail': ['First Case Free', 'Retail Order'],
  'Customer': ['DTC Order', 'Offices'],
  'Shrinkage': ['Damaged / Lost'],
}

const B = {
  bg:        '#F5EFE4',
  surface:   '#EDE5D6',
  border:    '#D4C4A8',
  accent:    '#C4501A',
  accentDk:  '#9C3D12',
  accentLt:  '#E8714A',
  text:      '#1E1008',
  textMid:   '#5C3D22',
  textMuted: '#9C7B58',
  green:     '#2D5A27',
  greenLt:   '#EAF0E8',
  white:     '#FFFDF8',
}

const s = {
  app: {
    minHeight: '100dvh',
    background: B.bg,
    color: B.text,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    paddingBottom: 60,
  },
  header: {
    padding: '48px 20px 16px',
    borderBottom: `1px solid ${B.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: B.white,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoImg: {
    width: 38,
    height: 38,
    objectFit: 'contain',
  },
  wordmark: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: B.text,
    margin: 0,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: '0.18em',
    color: B.textMuted,
    textTransform: 'uppercase',
    margin: '1px 0 0',
  },
  userBtn: (active) => ({
    padding: '6px 14px',
    borderRadius: 20,
    border: `1.5px solid ${active ? B.accent : B.border}`,
    background: active ? B.accent : 'transparent',
    color: active ? B.white : B.textMuted,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  invPanel: {
    margin: '14px 20px 0',
    background: B.white,
    borderRadius: 12,
    border: `1px solid ${B.border}`,
    overflow: 'hidden',
  },
  invHeader: {
    padding: '8px 14px',
    background: B.surface,
    borderBottom: `1px solid ${B.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invHeaderLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: B.textMid,
  },
  invRefresh: {
    fontSize: 11,
    color: B.textMuted,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
  },
  invGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 0,
  },
  invCell: (last) => ({
    padding: '10px 14px',
    borderRight: last ? 'none' : `1px solid ${B.border}`,
  }),
  invCellLabel: {
    fontSize: 10,
    color: B.textMuted,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  invCellValue: (isTotal) => ({
    fontSize: isTotal ? 20 : 18,
    fontWeight: 700,
    color: isTotal ? B.accent : B.text,
    lineHeight: 1,
  }),
  invCellUnit: {
    fontSize: 10,
    color: B.textMuted,
    marginTop: 1,
  },
  section: {
    padding: '18px 20px 0',
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: B.textMuted,
    marginBottom: 10,
    fontWeight: 600,
  },
  categoryBlock: {
    marginBottom: 6,
    background: B.white,
    borderRadius: 12,
    border: `1px solid ${B.border}`,
    overflow: 'hidden',
  },
  categoryHeader: (active) => ({
    padding: '11px 14px',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: active ? B.white : B.textMid,
    background: active ? B.accent : B.surface,
    cursor: 'pointer',
    borderBottom: active ? `1px solid ${B.accentDk}` : 'none',
    transition: 'all 0.15s',
  }),
  typeGrid: {
    padding: '10px 12px 12px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 7,
  },
  typeBtn: (active) => ({
    padding: '7px 13px',
    borderRadius: 20,
    border: `1.5px solid ${active ? B.accent : B.border}`,
    background: active ? B.accentLt : B.bg,
    color: active ? B.white : B.textMid,
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  }),
  qtySection: {
    padding: '16px 20px 0',
  },
  qtyBlock: {
    background: B.white,
    borderRadius: 12,
    border: `1px solid ${B.border}`,
    overflow: 'hidden',
    marginBottom: 8,
  },
  qtyBlockHeader: {
    padding: '8px 14px',
    background: B.surface,
    borderBottom: `1px solid ${B.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  qtyBlockLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: B.textMid,
  },
  qtyRow: {
    padding: '10px 12px',
    display: 'flex',
    gap: 7,
    alignItems: 'center',
    flexWrap: 'nowrap',
    overflowX: 'auto',
  },
  canCylTop: (active) => ({
    width: 32,
    height: 8,
    borderRadius: '50%',
    background: active ? B.accentDk : B.border,
    border: `2px solid ${active ? B.accentDk : B.border}`,
  }),
  canCylBody: (active) => ({
    width: 32,
    height: 22,
    background: active ? B.accent : B.surface,
    border: `2px solid ${active ? B.accent : B.border}`,
    borderTop: 'none',
    borderBottom: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: active ? B.white : B.textMid,
  }),
  canCylBottom: (active) => ({
    width: 32,
    height: 8,
    borderRadius: '50%',
    background: active ? B.accentDk : B.border,
    border: `2px solid ${active ? B.accentDk : B.border}`,
  }),
  caseBtn: (active) => ({
    width: 42,
    height: 42,
    borderRadius: 6,
    border: `2px solid ${active ? B.accent : B.border}`,
    background: active ? B.accent : B.bg,
    color: active ? B.white : B.textMid,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  }),
  customInput: {
    width: 42,
    height: 42,
    padding: '0 4px',
    borderRadius: 8,
    border: `2px solid ${B.border}`,
    background: B.bg,
    color: B.text,
    fontSize: 13,
    textAlign: 'center',
    outline: 'none',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  totalPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: B.greenLt,
    border: `1px solid ${B.green}`,
    borderRadius: 20,
    padding: '5px 14px',
    fontSize: 13,
    color: B.green,
    fontWeight: 600,
    marginTop: 8,
    marginLeft: 20,
  },
  notesInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: `1.5px solid ${B.border}`,
    background: B.white,
    color: B.text,
    fontSize: 14,
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  submitBtn: (ready) => ({
    width: '100%',
    padding: '16px',
    borderRadius: 12,
    border: 'none',
    background: ready ? B.accent : B.border,
    color: ready ? B.white : B.textMuted,
    fontSize: 16,
    fontWeight: 700,
    cursor: ready ? 'pointer' : 'default',
    letterSpacing: '0.04em',
    transition: 'all 0.2s',
    marginTop: 20,
  }),
  toast: (type) => ({
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    borderRadius: 24,
    background: type === 'success' ? B.green : '#8B2020',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    zIndex: 100,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  }),
}

const CAN_PRESETS = [1, 2, 3, 4, 6]
const CASE_PRESETS = [1, 2, 3, 4, 6]

function CylinderBtn({ n, active, onClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }} onClick={onClick}>
      <div style={s.canCylTop(active)} />
      <div style={s.canCylBody(active)}>+{n}</div>
      <div style={s.canCylBottom(active)} />
    </div>
  )
}

function CylinderCustom({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ ...s.canCylTop(false), background: B.border }} />
      <div style={{ ...s.canCylBody(false), width: 42, padding: 0 }}>
        <input
          type="number"
          min="0"
          placeholder="?"
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: B.textMid,
            fontFamily: 'inherit',
          }}
        />
      </div>
      <div style={{ ...s.canCylBottom(false), background: B.border }} />
    </div>
  )
}

function InventoryPanel() {
  const [inv, setInv] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchInv() {
    setLoading(true)
    try {
      const res = await fetch(SCRIPT_URL)
      const data = await res.json()
      if (data.status === 'ok') {
        setInv({
          airdrome: Math.round(data.airdrome),
          tpl: Math.round(data.tpl),
          total: Math.round(data.total),
        })
      }
    } catch {
      setInv(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInv() }, [])

  const cells = [
    { label: 'Airdrome', value: inv?.airdrome },
    { label: '3PL', value: inv?.tpl },
    { label: 'Total', value: inv?.total, isTotal: true },
  ]

  return (
    <div style={s.invPanel}>
      <div style={s.invHeader}>
        <span style={s.invHeaderLabel}>Inventory</span>
        <button style={s.invRefresh} onClick={fetchInv}>↻ refresh</button>
      </div>
      <div style={s.invGrid}>
        {cells.map((c, i) => (
          <div key={c.label} style={s.invCell(i === cells.length - 1)}>
            <div style={s.invCellLabel}>{c.label}</div>
            <div style={s.invCellValue(c.isTotal)}>
              {loading ? '—' : inv ? c.value.toLocaleString() : '—'}
            </div>
            <div style={s.invCellUnit}>cases</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState('David')
  const [movementType, setMovementType] = useState(null)
  const [canQty, setCanQty] = useState(0)
  const [customCans, setCustomCans] = useState('')
  const [caseQty, setCaseQty] = useState(0)
  const [customCases, setCustomCases] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const totalCans =
    (caseQty === 'custom' ? (parseInt(customCases) || 0) : caseQty) * CANS_PER_CASE +
    (canQty === 'custom' ? (parseInt(customCans) || 0) : canQty)

  const ready = movementType && totalCans > 0

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function resetForm() {
    setMovementType(null)
    setCanQty(0)
    setCaseQty(0)
    setCustomCans('')
    setCustomCases('')
    setNotes('')
  }

  async function handleSubmit() {
    if (!ready || submitting) return
    setSubmitting(true)
    const now = new Date()
    const date = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const cases = caseQty === 'custom' ? (parseInt(customCases) || 0) : caseQty
    const cans = canQty === 'custom' ? (parseInt(customCans) || 0) : canQty
    const payload = { date, time, submittedBy: user, movementType, cases, cans, totalCans, notes }
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      showToast(`Logged ${totalCans} cans ✓`, 'success')
      resetForm()
    } catch {
      showToast('Connection error — try again', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const displayCases = caseQty === 'custom' ? (parseInt(customCases) || 0) : caseQty
  const displayCans = canQty === 'custom' ? (parseInt(customCans) || 0) : canQty

  return (
    <div style={s.app}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoRow}>
          <img src={LOGO_URL} alt="SOLZI" style={s.logoImg} />
          <div>
            <p style={s.wordmark}>SOLZI</p>
            <p style={s.subtitle}>Field Log</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['David', 'Sophy'].map(u => (
            <button key={u} style={s.userBtn(user === u)} onClick={() => setUser(u)}>{u}</button>
          ))}
        </div>
      </div>

      {/* Inventory Panel */}
      <InventoryPanel />

      {/* Movement Types */}
      <div style={s.section}>
        <p style={s.sectionLabel}>Movement Type</p>
        {Object.entries(MOVEMENT_TYPES).map(([cat, types]) => (
          <div key={cat} style={s.categoryBlock}>
            <div style={s.categoryHeader(types.includes(movementType))}>
              {cat}
            </div>
            <div style={s.typeGrid}>
              {types.map(t => (
                <button
                  key={t}
                  style={s.typeBtn(movementType === t)}
                  onClick={() => setMovementType(t)}
                >{t}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quantity */}
      <div style={s.qtySection}>
        <p style={s.sectionLabel}>Quantity</p>
        <div style={s.qtyBlock}>
          <div style={s.qtyBlockHeader}>
            <span style={{ fontSize: 16 }}>📦</span>
            <span style={s.qtyBlockLabel}>Cases <span style={{ fontWeight: 400, fontSize: 10, color: B.textMuted }}>(12 cans each)</span></span>
          </div>
          <div style={s.qtyRow}>
            {CASE_PRESETS.map(n => (
              <button
                key={n}
                style={s.caseBtn(caseQty === n)}
                onClick={() => { setCaseQty(n); setCustomCases('') }}
              >+{n}</button>
            ))}
            <input
              type="number"
              min="0"
              placeholder="?"
              value={customCases}
              style={s.customInput}
              onChange={e => { setCustomCases(e.target.value); setCaseQty('custom') }}
            />
          </div>
        </div>

        <div style={s.qtyBlock}>
          <div style={s.qtyBlockHeader}>
            <span style={{ fontSize: 16 }}>🥤</span>
            <span style={s.qtyBlockLabel}>Cans <span style={{ fontWeight: 400, fontSize: 10, color: B.textMuted }}>(individual)</span></span>
          </div>
          <div style={s.qtyRow}>
            {CAN_PRESETS.map(n => (
              <CylinderBtn
                key={n}
                n={n}
                active={canQty === n}
                onClick={() => { setCanQty(n); setCustomCans('') }}
              />
            ))}
            <CylinderCustom
              value={customCans}
              onChange={e => { setCustomCans(e.target.value); setCanQty('custom') }}
            />
          </div>
        </div>

        {totalCans > 0 && (
          <div style={s.totalPill}>
            ✓ {totalCans} cans total
            {displayCases > 0 && displayCans > 0 && (
              <span style={{ fontWeight: 400, color: B.green }}>
                &nbsp;({displayCases} case{displayCases !== 1 ? 's' : ''} + {displayCans} can{displayCans !== 1 ? 's' : ''})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={{ ...s.section, marginTop: 16 }}>
        <p style={s.sectionLabel}>Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></p>
        <textarea
          rows={2}
          placeholder="Location, person, event name..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={s.notesInput}
        />
      </div>

      {/* Submit */}
      <div style={{ padding: '0 20px' }}>
        <button style={s.submitBtn(ready)} onClick={handleSubmit} disabled={!ready || submitting}>
          {submitting ? 'Logging...' : ready ? `Log ${totalCans} cans — ${movementType}` : 'Select type + quantity'}
        </button>
      </div>

      {/* Badge watermark */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28, opacity: 0.18 }}>
        <img src={BADGE_URL} alt="" style={{ width: 60, height: 60 }} />
      </div>

      {toast && <div style={s.toast(toast.type)}>{toast.msg}</div>}
    </div>
  )
}
