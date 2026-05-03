import React, { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL

const BAND_COLORS = {
  Junior: 'text-red-600',
  Mid:    'text-yellow-600',
  Senior: 'text-blue-600',
  Staff:  'text-green-600',
}

export default function HistoryPanel() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch(`${API}/sessions`)
      .then(r => r.json())
      .then(d => setSessions(d.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center text-muted font-body py-20">Loading history…</div>
  if (!sessions.length) return (
    <div className="text-center py-20 fade-up">
      <p className="font-display text-2xl text-ink mb-2">No sessions yet</p>
      <p className="text-muted font-body text-sm">Complete a design evaluation to see it here.</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto fade-up">
      <h2 className="font-display text-2xl text-ink mb-6">Past Sessions</h2>
      <div className="space-y-3">
        {sessions.map(s => (
          <div key={s.id} className="bg-white border border-border rounded-xl px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-body font-medium text-ink text-sm">{s.problem}</p>
              <p className="text-muted text-xs font-body mt-0.5">
                {new Date(s.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-body font-semibold text-sm ${BAND_COLORS[s.band] || 'text-muted'}`}>{s.band}</span>
              <span className="font-mono text-ink text-sm font-medium">{s.overall_score}<span className="text-muted">/10</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
