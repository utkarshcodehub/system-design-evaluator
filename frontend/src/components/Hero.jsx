import React, { useState } from 'react'

const STEPS = [
  {
    num: '01',
    title: 'Pick a problem',
    desc: 'Choose from 10 classic system design questions — Twitter, Uber, Netflix — or enter your own.',
    icon: '🎯',
  },
  {
    num: '02',
    title: 'Fill your design',
    desc: 'Work through structured sections: requirements, capacity, architecture, deep dive, trade-offs.',
    icon: '✏️',
  },
  {
    num: '03',
    title: 'Get evaluated',
    desc: 'AI scores each section 1–10 across completeness, correctness, and depth — like a real interviewer.',
    icon: '📊',
  },
  {
    num: '04',
    title: 'Face follow-ups',
    desc: 'Receive 3 targeted follow-up questions probing the exact gaps in your design.',
    icon: '🎤',
  },
]

const DEMO = {
  problem: 'Design a URL Shortener',
  section: 'High-Level Design',
  userInput: `Client → API Gateway → App Server → DB (PostgreSQL)
Short URL: base62(auto_increment_id)
Redirect: 301 cached at CDN layer
Write path: generate ID → store mapping → return short URL`,
  score: 7,
  comment: 'Solid architecture with correct use of base62 encoding. Missing discussion of read replicas given the heavy read/write skew (typically 100:1). CDN mention is good — consider elaborating on TTL strategy for popular vs cold links.',
  band: 'Mid',
}

export default function Hero({ onStart, onGenerate }) {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <div className="max-w-4xl mx-auto fade-up">

      {/* Hero headline */}
      <div className="text-center mb-16 pt-6">
        <div className="inline-flex items-center gap-2 bg-amber-light border border-amber/30 text-amber-900
                        text-xs font-body font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber inline-block" />
          AI-powered mock interviewer
        </div>
        <h1 className="font-display text-5xl text-ink leading-tight mb-5">
          Practice system design<br />
          <span className="text-amber">like an interview.</span>
        </h1>
        <p className="text-muted font-body text-lg max-w-xl mx-auto leading-relaxed mb-8">
          Describe your architecture in plain text. Get scored feedback on each section,
          gap analysis, and targeted follow-up questions — the same way a staff engineer would probe you.
        </p>

        {/* Three buttons in a row */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={onStart}
            className="px-8 py-3 bg-ink text-cream font-body font-medium rounded-xl
                       hover:bg-navy transition-all hover:shadow-lg text-sm">
            Start Evaluating →
          </button>
          <button onClick={onGenerate}
            className="px-7 py-3 bg-amber text-ink font-body font-semibold rounded-xl
                       hover:bg-amber/90 transition-all text-sm">
            Generate System Design ✦
          </button>
          <button onClick={() => setDemoOpen(v => !v)}
            className="px-6 py-3 border border-border text-ink font-body font-medium rounded-xl
                       hover:border-ink transition-colors text-sm">
            {demoOpen ? 'Hide Demo' : 'See an Example'}
          </button>
        </div>
      </div>

      {/* Example demo card */}
      {demoOpen && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden mb-14 fade-up shadow-sm">
          <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-cream/50">
            <div>
              <p className="font-body font-semibold text-ink text-sm">{DEMO.problem}</p>
              <p className="text-muted text-xs font-body mt-0.5">Section: {DEMO.section}</p>
            </div>
            <span className="bg-amber-light border border-amber/30 text-amber-900 text-xs
                             font-medium px-3 py-1 rounded-full font-body">{DEMO.band} Band</span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-6">
              <p className="text-xs text-muted font-body uppercase tracking-widest mb-3">Your Input</p>
              <pre className="font-mono text-xs text-ink leading-relaxed whitespace-pre-wrap bg-cream
                              rounded-lg p-4 border border-border">{DEMO.userInput}</pre>
            </div>
            <div className="p-6">
              <p className="text-xs text-muted font-body uppercase tracking-widest mb-3">AI Evaluation</p>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-display text-3xl text-ink">{DEMO.score}</span>
                  <span className="text-muted font-body text-sm">/10</span>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-amber rounded-full" style={{ width: `${DEMO.score * 10}%` }} />
                  </div>
                </div>
              </div>
              <p className="text-ink text-xs font-body leading-relaxed">{DEMO.comment}</p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted font-body mb-2">Follow-up question:</p>
                <p className="text-xs text-ink font-body italic leading-relaxed">
                  "If your service handles 10B redirects/day, how would you size your CDN cache
                  and what TTL would you set for viral vs long-tail URLs?"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mb-16">
        <p className="text-xs text-muted font-body uppercase tracking-widest text-center mb-8">How it works</p>
        <div className="grid grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div key={s.num} className="relative">
              {i < STEPS.length - 1 && (
                <div className="absolute top-6 left-[calc(50%+20px)] right-[-50%] h-px bg-border z-0" />
              )}
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center
                                justify-center text-xl mx-auto mb-3 shadow-sm">
                  {s.icon}
                </div>
                <p className="font-mono text-xs text-amber mb-1">{s.num}</p>
                <p className="font-body font-semibold text-ink text-sm mb-1">{s.title}</p>
                <p className="text-muted text-xs font-body leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What gets scored */}
      <div className="bg-ink rounded-2xl p-8 mb-8 text-center">
        <p className="font-display text-2xl text-cream mb-2">5 sections. Scored like a real interview.</p>
        <p className="text-muted font-body text-sm mb-6">Each section scored 1–10 with specific feedback and an overall band.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {['Requirements', 'Capacity', 'High-Level Design', 'Deep Dive', 'Trade-offs'].map(s => (
            <span key={s} className="bg-white/10 text-cream text-xs font-body px-3 py-1.5 rounded-lg border border-white/10">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center gap-6">
          {['Junior', 'Mid', 'Senior', 'Staff'].map(b => (
            <div key={b} className="text-center">
              <div className={`text-xs font-mono font-bold mb-1
                ${b === 'Junior' ? 'text-red-400' : b === 'Mid' ? 'text-yellow-400' : b === 'Senior' ? 'text-blue-400' : 'text-green-400'}`}>
                {b}
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/40 text-xs font-body mt-2">Overall band based on aggregate score</p>
      </div>

      <div className="text-center pb-4">
        <button onClick={onStart}
          className="px-10 py-3 bg-amber text-ink font-body font-semibold rounded-xl
                     hover:bg-amber/90 transition-all text-sm">
          Start Your First Evaluation →
        </button>
      </div>
    </div>
  )
}