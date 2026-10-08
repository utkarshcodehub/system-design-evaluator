import React, { useState } from 'react'

const API = import.meta.env.VITE_API_URL

const SECTION_META = {
  requirements: { label: 'Requirements',        icon: '📋', color: 'border-blue-200 bg-blue-50/40' },
  capacity:     { label: 'Capacity Estimation', icon: '📐', color: 'border-purple-200 bg-purple-50/40' },
  high_level:   { label: 'High-Level Design',   icon: '🏗️', color: 'border-amber/40 bg-amber-light/60' },
  deep_dive:    { label: 'Deep Dive',           icon: '🔬', color: 'border-green-200 bg-green-50/40' },
  tradeoffs:    { label: 'Trade-offs',          icon: '⚖️', color: 'border-red-200 bg-red-50/40' },
}

const EXAMPLES = [
  'A food delivery app like Swiggy for Tier-2 Indian cities',
  'A real-time cricket score notification system for 50M users',
  'A UPI payment gateway handling 1B transactions per day',
  'A hyperlocal job board for blue-collar workers in India',
]

const formatText = (text) => {
  if (typeof text !== 'string') return text
  return text.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t')
}

export default function GeneratePanel({ onEvaluateDesign }) {
  const [idea, setIdea]       = useState('')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleGenerate = async (inputIdea) => {
    const text = (inputIdea || idea).trim()
    if (!text) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: text }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Generation failed')
      }
      setResult(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto fade-up">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-ink text-cream text-xs font-body
                        font-medium px-3 py-1.5 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber inline-block" />
          AI System Design Generator
        </div>
        <h1 className="font-display text-4xl text-ink mb-3">
          Describe your idea.<br />
          <span className="text-amber">Get a full system design.</span>
        </h1>
        <p className="text-muted font-body text-base max-w-lg mx-auto leading-relaxed">
          No jargon needed. Write your project idea in plain English — the AI will produce a
          senior-level design across all five sections.
        </p>
      </div>

      {/* Input card */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <label className="block text-xs text-muted font-body uppercase tracking-widest mb-3">
          Your project idea
        </label>
        <textarea
          rows={4}
          value={idea}
          onChange={e => setIdea(e.target.value)}
          placeholder="e.g. I want to build a real-time chat app like WhatsApp for college students in India, supporting 5M users..."
          className="w-full border border-border rounded-xl px-4 py-3 bg-cream font-body text-sm
                     text-ink placeholder-muted focus:outline-none focus:border-amber leading-relaxed"
          style={{ fontFamily: 'DM Sans, system-ui, sans-serif', resize: 'vertical' }}
        />

        {/* Example prompts */}
        <div className="mt-4 mb-5">
          <p className="text-xs text-muted font-body mb-2">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => { setIdea(ex); handleGenerate(ex) }}
                className="text-xs font-body px-3 py-1.5 border border-border rounded-lg
                           text-muted hover:text-ink hover:border-amber transition-all bg-cream">
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          {error && <p className="text-red-500 text-xs font-body">{error}</p>}
          <div className="ml-auto flex gap-3">
            {result && (
              <button onClick={() => { setResult(null); setIdea('') }}
                className="px-4 py-2.5 text-sm font-body font-medium border border-border
                           rounded-xl text-muted hover:text-ink transition-colors">
                Clear
              </button>
            )}
            <button onClick={() => handleGenerate()} disabled={loading || !idea.trim()}
              className={`px-7 py-2.5 rounded-xl text-sm font-body font-medium transition-all
                ${loading
                  ? 'bg-amber text-ink evaluating cursor-wait'
                  : 'bg-ink text-cream hover:bg-navy disabled:opacity-40 disabled:cursor-not-allowed'}`}>
              {loading ? 'Generating…' : result ? 'Regenerate' : 'Generate Design →'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div className="space-y-4 fade-up">
          {Object.keys(SECTION_META).map(k => (
            <div key={k} className="bg-white border border-border rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-border" />
                <div className="h-4 w-32 bg-border rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-border rounded w-full" />
                <div className="h-3 bg-border rounded w-5/6" />
                <div className="h-3 bg-border rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="fade-up">
          {/* Title bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl text-ink">{result.title}</h2>
              <p className="text-muted text-xs font-body mt-1">AI-generated system design · 5 sections</p>
            </div>
            <button
              onClick={() => onEvaluateDesign({
                problem: result.title,
                design: {
                  requirements: formatText(result.requirements),
                  capacity:     formatText(result.capacity),
                  high_level:   formatText(result.high_level),
                  deep_dive:    formatText(result.deep_dive),
                  tradeoffs:    formatText(result.tradeoffs),
                }
              })}
              className="px-5 py-2.5 bg-amber text-ink text-sm font-body font-semibold
                         rounded-xl hover:bg-amber/90 transition-all flex items-center gap-2">
              <span>Evaluate this Design</span>
              <span>→</span>
            </button>
          </div>

          {/* Section cards */}
          <div className="space-y-4">
            {Object.entries(SECTION_META).map(([key, meta]) => (
              result[key] && (
                <div key={key} className={`border rounded-2xl p-6 ${meta.color}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-9 h-9 rounded-xl bg-white border border-border flex items-center
                                     justify-center text-lg shadow-sm">{meta.icon}</span>
                    <h3 className="font-body font-semibold text-ink text-sm">{meta.label}</h3>
                  </div>
                  <p className="font-body text-sm text-ink leading-relaxed whitespace-pre-line">
                    {formatText(result[key])}
                  </p>
                </div>
              )
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={() => handleGenerate()}
              className="px-6 py-2.5 border border-border rounded-xl text-sm font-body
                         font-medium text-muted hover:text-ink hover:border-ink transition-colors">
              ↺ Regenerate
            </button>
            <button
              onClick={() => onEvaluateDesign({
                problem: result.title,
                design: {
                  requirements: formatText(result.requirements),
                  capacity:     formatText(result.capacity),
                  high_level:   formatText(result.high_level),
                  deep_dive:    formatText(result.deep_dive),
                  tradeoffs:    formatText(result.tradeoffs),
                }
              })}
              className="px-8 py-2.5 bg-ink text-cream text-sm font-body font-medium
                         rounded-xl hover:bg-navy transition-all">
              Evaluate this Design →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}