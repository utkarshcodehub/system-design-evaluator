import React, { useState } from 'react'

const API = import.meta.env.VITE_API_URL

const SECTIONS = [
  {
    key: 'requirements',
    label: 'Requirements Clarification',
    hint: 'Functional vs non-functional. Scale targets. What are you NOT building?',
    rows: 5,
  },
  {
    key: 'capacity',
    label: 'Capacity Estimation',
    hint: 'DAU, QPS, storage estimates. Back-of-the-envelope numbers.',
    rows: 4,
  },
  {
    key: 'high_level',
    label: 'High-Level Design',
    hint: 'Major components, data flow, client-server-DB interactions. Describe your architecture diagram.',
    rows: 6,
  },
  {
    key: 'deep_dive',
    label: 'Deep Dive',
    hint: 'DB schema, API contracts, key algorithms, specific component internals.',
    rows: 7,
  },
  {
    key: 'tradeoffs',
    label: 'Bottlenecks & Trade-offs',
    hint: 'Single points of failure, scalability limits, consistency vs availability choices.',
    rows: 4,
  },
]

const EMPTY = { requirements: '', capacity: '', high_level: '', deep_dive: '', tradeoffs: '' }

export default function DesignForm({ problem, onBack, onEvaluated, initialValues }) {
  const [form, setForm]     = useState({ ...EMPTY, ...initialValues })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)
  const [active, setActive] = useState('requirements')

  const filled   = Object.values(form).filter(v => v.trim()).length
  const progress = Math.round((filled / SECTIONS.length) * 100)
  const isPreFilled = initialValues && Object.values(initialValues).some(v => v?.trim())

  const handleEvaluate = async () => {
    setLoading(true); setError(null)
    try {
      const evRes = await fetch(`${API}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, ...form }),
      })
      if (!evRes.ok) throw new Error('Evaluation failed')
      const ev = await evRes.json()

      const fqRes = await fetch(`${API}/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, evaluation: ev }),
      })
      const fq = fqRes.ok ? await fqRes.json() : { questions: [] }

      fetch(`${API}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem,
          design: form,
          evaluation: ev,
          band: ev.band || '',
          overall_score: ev.overall_score || 0,
        }),
      }).catch(() => {})

      onEvaluated(ev, fq.questions || [], form)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto fade-up">
      {/* Problem header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-muted hover:text-ink transition-colors text-sm font-body">
          ← Back
        </button>
        <div className="flex-1">
          <h2 className="font-display text-2xl text-ink">{problem}</h2>
          {isPreFilled && (
            <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-body text-amber-900
                             bg-amber-light border border-amber/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber inline-block" />
              Pre-filled from AI Generator — review and edit before evaluating
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-amber rounded-full transition-all duration-500"
                 style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-muted font-mono">{filled}/{SECTIONS.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Sidebar nav */}
        <div className="col-span-1 space-y-1">
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActive(s.key)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-body font-medium transition-all
                ${active === s.key ? 'bg-ink text-cream' : 'text-muted hover:text-ink hover:bg-white'}`}>
              <span className={`inline-block w-2 h-2 rounded-full mr-2 transition-colors
                ${form[s.key]?.trim() ? 'bg-amber' : 'bg-border'}`} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Active section */}
        <div className="col-span-4">
          {SECTIONS.filter(s => s.key === active).map(s => (
            <div key={s.key} className="bg-white border border-border rounded-xl p-6 fade-up">
              <h3 className="font-display text-xl text-ink mb-1">{s.label}</h3>
              <p className="text-muted text-xs font-body mb-4">{s.hint}</p>
              <textarea
                rows={s.rows}
                value={form[s.key]}
                onChange={e => setForm(f => ({ ...f, [s.key]: e.target.value }))}
                placeholder={`Write your ${s.label.toLowerCase()} here...`}
                className="w-full border border-border rounded-lg px-4 py-3 bg-cream
                           focus:outline-none focus:border-amber text-ink placeholder-muted"
              />
            </div>
          ))}

          <div className="mt-4 flex items-center justify-between">
            {error && <p className="text-red-500 text-sm font-body">{error}</p>}
            <div className="ml-auto flex gap-3">
              {active !== SECTIONS[SECTIONS.length - 1].key && (
                <button onClick={() => {
                  const idx = SECTIONS.findIndex(s => s.key === active)
                  setActive(SECTIONS[idx + 1].key)
                }} className="px-4 py-2 text-sm font-medium font-body text-muted hover:text-ink border border-border rounded-lg transition-colors">
                  Next →
                </button>
              )}
              <button onClick={handleEvaluate} disabled={loading || filled === 0}
                className={`px-6 py-2 rounded-lg text-sm font-medium font-body transition-all
                  ${loading
                    ? 'bg-amber text-ink evaluating cursor-wait'
                    : 'bg-ink text-cream hover:bg-navy disabled:opacity-40 disabled:cursor-not-allowed'}`}>
                {loading ? 'Evaluating…' : 'Evaluate Design'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}