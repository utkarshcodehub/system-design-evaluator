import React from 'react'

const SECTION_LABELS = {
  requirements: 'Requirements',
  capacity: 'Capacity',
  high_level: 'High-Level Design',
  deep_dive: 'Deep Dive',
  tradeoffs: 'Trade-offs',
}

const BAND_COLORS = {
  Junior: 'bg-red-50 text-red-700 border-red-200',
  Mid:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  Senior: 'bg-blue-50 text-blue-700 border-blue-200',
  Staff:  'bg-green-50 text-green-700 border-green-200',
}

function ScoreBar({ score }) {
  const pct = (score / 10) * 100
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#E8A838' : score >= 4 ? '#f97316' : '#ef4444'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`, background:color}} />
      </div>
      <span className="text-sm font-mono font-medium text-ink w-8 text-right">{score}/10</span>
    </div>
  )
}

export default function EvaluationPanel({ problem, design, evaluation, followups, onRetry, onReset }) {
  const { scores, overall_score, band, summary, strengths, gaps } = evaluation

  return (
    <div className="max-w-5xl mx-auto fade-up">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl text-ink">{problem}</h2>
          <p className="text-muted text-sm font-body mt-1">Evaluation complete</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onRetry} className="px-4 py-2 text-sm font-body font-medium border border-border rounded-lg hover:border-ink transition-colors">
            Revise Design
          </button>
          <button onClick={onReset} className="px-4 py-2 text-sm font-body font-medium bg-ink text-cream rounded-lg hover:bg-navy transition-colors">
            New Problem
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: scores */}
        <div className="col-span-3 space-y-4">
          {scores && Object.entries(scores).map(([key, val]) => (
            <div key={key} className="bg-white border border-border rounded-xl p-5 fade-up">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-body font-semibold text-ink text-sm">{SECTION_LABELS[key] || key}</h4>
              </div>
              <ScoreBar score={val.score} />
              <p className="text-muted text-xs font-body mt-3 leading-relaxed">{val.comment}</p>
            </div>
          ))}
        </div>

        {/* Right: summary panel */}
        <div className="col-span-2 space-y-4">
          {/* Band card */}
          <div className="bg-white border border-border rounded-xl p-5 text-center">
            <p className="text-xs text-muted font-body mb-2 uppercase tracking-widest">Overall Band</p>
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border font-body ${BAND_COLORS[band] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
              {band}
            </span>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="font-display text-4xl text-ink">{overall_score}</span>
              <span className="text-muted font-body text-sm">/10</span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h4 className="font-body font-semibold text-ink text-sm mb-2">Summary</h4>
            <p className="text-muted text-xs font-body leading-relaxed">{summary}</p>
          </div>

          {/* Strengths */}
          {strengths?.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <h4 className="font-body font-semibold text-green-800 text-sm mb-3">✓ Strengths</h4>
              <ul className="space-y-1.5">
                {strengths.map((s, i) => (
                  <li key={i} className="text-xs text-green-700 font-body flex gap-2">
                    <span>•</span><span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {gaps?.length > 0 && (
            <div className="bg-amber-light border border-amber/30 rounded-xl p-5">
              <h4 className="font-body font-semibold text-amber-800 text-sm mb-3">⚠ Gaps</h4>
              <ul className="space-y-1.5">
                {gaps.map((g, i) => (
                  <li key={i} className="text-xs text-amber-900 font-body flex gap-2">
                    <span>•</span><span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up questions */}
          {followups?.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-5">
              <h4 className="font-body font-semibold text-ink text-sm mb-3">🎤 Interviewer Follow-ups</h4>
              <ol className="space-y-3">
                {followups.map((q, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-xs text-amber font-bold mt-0.5">{i+1}.</span>
                    <p className="text-xs text-ink font-body leading-relaxed">{q}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
