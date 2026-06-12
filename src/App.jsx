import { useState } from 'react'

const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

const CANS_PER_CASE = 12

const MOVEMENT_TYPES = {
  'Sampling': ['Retail MAC', 'Event', 'Popup', 'Office Drop'],
  'Marketing': ['Strategic Seeding', 'Influencer Gifting', 'UGC / Content', 'Photoshoot', 'Founder Use'],
  'Trade': ['First Case Free', 'Wholesale Sample'],
  'Shrinkage': ['Damaged / Lost', 'Adjustment'],
}

const B = {
  bg:       '#1A0A05',
  surface:  '#2A1108',
  border:   '#3D1A0A',
  accent:   '#C4501A',
  accentLt: '#E07040',
  text:     '#F5E6D8',
  muted:    '#8C6050',
  pill:     '#3D1A0A',
  pillText: '#E07040',
  success:  '#2A6040',
  successText: '#7FD0A0',
}

const s = {
  app: {
    minHeight: '100dvh',
    background: B.bg,
    color: B.text,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '0 0 80px',
  },
  header: {
    padding: '52px 20px 20px',
    borderBottom: `1px solid ${B.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  wordmark: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: B.text,
    margin: 0,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: '0.15em',
    color: B.muted,
    textTransform: 'uppercase',
    margin: '2px 0 0',
  },
  userBtn: (active) => ({
    padding: '6px 14px',
    borderRadius: 20,
    border: `1px solid ${active ? B.accent : B.border}`,
    background: active ? B.accent : 'transparent',
    color: active ? '#fff' : B.muted,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  section: {
    padding: '20px 20px 0',
  },
  label: {
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: B.muted,
    marginBottom: 10,
  },
  categoryRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  catBtn: (active) => ({
    padding: '7px 14px',
    borderRadius: 20,
    border: `1px solid ${active ? B.accent : B.border}`,
    background: active ? B.accent : B.surface,
    color: active ? '#fff' : B.text,
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  }),
  typeBtn: (active) => ({
    padding: '8px 14px',
    borderRadius: 8,
    border: `1px solid ${active ? B.accentLt : B.border}`,
    background: active ? '#3D1A0A' : B.surface,
    color: active ? B.accentLt : B.muted,
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  }),
  qtySection: {
    padding: '0 20px',
    marginTop: 20,
  },
  qtyRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  qtyLabel: {
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: B.muted,
    width: 44,
    flexShrink: 0,
  },
  qtyBtn: (active) => ({
    padding: '8px 0',
    width: 44,
    borderRadius: 8,
    border: `1px solid ${active ? B.accent : B.border}`,
    background: active ? B.accent : B.surface,
    color: active ? '#fff' : B.text,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s',
  }),
  customInput: {
    width: 52,
    padding: '8px 6px',
    borderRadius: 8,
    border: `1px solid ${B.border}`,
    background: B.surface,
    color: B.text,
    fontSize: 14,
    textAlign: 'center',
    outline: 'none',
  },
  totalLine: {
    marginTop: 4,
    fontSize: 13,
    color: B.muted,
    paddingLeft: 52,
  },
  totalCans: {
    color: B.accentLt,
    fontWeight: 600,
  },
  notesInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: `1px solid ${B.border}`,
    background: B.surface,
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
    background: ready ? B.accent : B.surface,
    color: ready ? '#fff' : B.muted,
    fontSize: 16,
    fontWeight: 600,
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
    background: type === 'success' ? B.success : '#5C1A1A',
    color: type === 'success' ? B.successText : '#F0A0A0',
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    zIndex: 100,
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  }),
}

const CAN_PRESETS = [1, 2, 3, 4, 6]
const CASE_PRESETS = [1, 2, 3, 4, 6]

export default function App() {
  const [user, setUser] = useState('David')
  const [category, setCategory] = useState(null)
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
    setCategory(null)
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

    const payload = {
      date,
      time,
      submittedBy: user,
      movementType,
      cases,
      cans,
      totalCans,
      notes,
    }

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      showToast(`Logged ${totalCans} cans ✓`, 'success')
      resetForm()
    } catch (err) {
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
        <div>
          <p style={s.wordmark}>SOLZI</p>
          <p style={s.subtitle}>Field Log</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['David', 'Sophy'].map(u => (
            <button key={u} style={s.userBtn(user === u)} onClick={() => setUser(u)}>{u}</button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div style={s.section}>
        <p style={s.label}>Category</p>
        <div style={s.categoryRow}>
          {Object.keys(MOVEMENT_TYPES).map(cat => (
            <button
              key={cat}
              style={s.catBtn(category === cat)}
              onClick={() => {
                setCategory(cat)
                setMovementType(null)
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Movement Type */}
      {category && (
        <div style={{ ...s.section, marginTop: 12 }}>
          <p style={s.label}>Type</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MOVEMENT_TYPES[category].map(t => (
              <button
                key={t}
                style={s.typeBtn(movementType === t)}
                onClick={() => setMovementType(t)}
              >{t}</button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div style={s.qtySection}>
        {/* Cases row */}
        <p style={{ ...s.label, marginTop: 20, marginBottom: 10 }}>Quantity</p>
        <div style={s.qtyRow}>
          <span style={s.qtyLabel}>Cases</span>
          {CASE_PRESETS.map(n => (
            <button
              key={n}
              style={s.qtyBtn(caseQty === n)}
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

        {/* Cans row */}
        <div style={s.qtyRow}>
          <span style={s.qtyLabel}>Cans</span>
          {CAN_PRESETS.map(n => (
            <button
              key={n}
              style={s.qtyBtn(canQty === n)}
              onClick={() => { setCanQty(n); setCustomCans('') }}
            >+{n}</button>
          ))}
          <input
            type="number"
            min="0"
            placeholder="?"
            value={customCans}
            style={s.customInput}
            onChange={e => { setCustomCans(e.target.value); setCanQty('custom') }}
          />
        </div>

        {/* Total */}
        {totalCans > 0 && (
          <p style={s.totalLine}>
            Total: <span style={s.totalCans}>{totalCans} cans</span>
            {displayCases > 0 && displayCans > 0 && (
              <span style={{ color: B.muted }}> ({displayCases} case{displayCases !== 1 ? 's' : ''} + {displayCans} can{displayCans !== 1 ? 's' : ''})</span>
            )}
          </p>
        )}
      </div>

      {/* Notes */}
      <div style={{ ...s.section, marginTop: 20 }}>
        <p style={s.label}>Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></p>
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

      {/* Toast */}
      {toast && <div style={s.toast(toast.type)}>{toast.msg}</div>}
    </div>
  )
}
