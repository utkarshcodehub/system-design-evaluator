import React, { useState } from 'react'

const PROBLEMS = [
  { id: 'twitter',     label: 'Design Twitter',               icon: '🐦', tag: 'Social' },
  { id: 'url',         label: 'Design a URL Shortener',        icon: '🔗', tag: 'Infra' },
  { id: 'whatsapp',    label: 'Design WhatsApp',              icon: '💬', tag: 'Messaging' },
  { id: 'netflix',     label: 'Design Netflix',               icon: '🎬', tag: 'Streaming' },
  { id: 'uber',        label: 'Design Uber',                  icon: '🚗', tag: 'Geo' },
  { id: 'youtube',     label: 'Design YouTube',               icon: '📺', tag: 'Streaming' },
  { id: 'instagram',   label: 'Design Instagram',             icon: '📸', tag: 'Social' },
  { id: 'dropbox',     label: 'Design Dropbox',               icon: '📦', tag: 'Storage' },
  { id: 'search',      label: 'Design a Search Engine',       icon: '🔍', tag: 'Search' },
  { id: 'ratelimiter', label: 'Design a Rate Limiter',        icon: '⚡', tag: 'Infra' },
]

const TAG_COLORS = {
  Social:    'bg-blue-50 text-blue-700',
  Infra:     'bg-purple-50 text-purple-700',
  Messaging: 'bg-green-50 text-green-700',
  Streaming: 'bg-red-50 text-red-700',
  Geo:       'bg-yellow-50 text-yellow-700',
  Storage:   'bg-orange-50 text-orange-700',
  Search:    'bg-teal-50 text-teal-700',
}

export default function ProblemSelector({ onSelect, onBack }) {
  const [custom, setCustom] = useState('')

  return (
    <div className="max-w-3xl mx-auto fade-up">
      <div className="mb-8">
        <button onClick={onBack} className="text-muted hover:text-ink transition-colors text-sm font-body">
          ← Back
        </button>
      </div>

      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl text-ink mb-3">Pick your problem</h1>
        <p className="text-muted font-body text-base">Choose a classic system design question or enter your own.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {PROBLEMS.map(p => (
          <button key={p.id} onClick={() => onSelect(p.label)}
            className="group flex items-center gap-4 bg-white border border-border rounded-xl px-5 py-4
                       hover:border-amber hover:shadow-md transition-all text-left">
            <span className="text-2xl">{p.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-body font-medium text-ink text-sm truncate">{p.label}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${TAG_COLORS[p.tag]}`}>
                {p.tag}
              </span>
            </div>
            <span className="text-border group-hover:text-amber transition-colors text-lg">→</span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-5">
        <p className="font-body font-medium text-ink text-sm mb-3">Or enter a custom problem</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && custom.trim() && onSelect(custom.trim())}
            placeholder="e.g. Design a ride-sharing service like Rapido..."
            className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm font-body
                       focus:outline-none focus:border-amber bg-cream placeholder-muted"
          />
          <button onClick={() => custom.trim() && onSelect(custom.trim())}
            className="px-5 py-2.5 bg-ink text-cream text-sm font-medium rounded-lg hover:bg-navy transition-colors">
            Start
          </button>
        </div>
      </div>
    </div>
  )
}