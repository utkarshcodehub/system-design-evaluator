import React, { useState } from 'react'
import Hero from './components/Hero'
import ProblemSelector from './components/ProblemSelector'
import DesignForm from './components/DesignForm'
import EvaluationPanel from './components/EvaluationPanel'
import HistoryPanel from './components/HistoryPanel'
import GeneratePanel from './components/GeneratePanel'

const TABS = [
  { id: 'design',  label: 'Design' },
  { id: 'history', label: 'History' },
]

export default function App() {
  const [tab, setTab]               = useState('design')
  const [view, setView]             = useState('hero') // hero | selector | form | result | generate

  // Design flow state
  const [problem, setProblem]       = useState(null)
  const [evaluation, setEvaluation] = useState(null)
  const [followups, setFollowups]   = useState([])
  const [design, setDesign]         = useState(null)
  const [prefilled, setPrefilled]   = useState(null)

  const reset = () => {
    setProblem(null); setEvaluation(null)
    setFollowups([]); setDesign(null)
    setPrefilled(null); setView('hero')
    setTab('design')
  }

  const handleEvaluateGenerated = ({ problem: p, design: d }) => {
    setPrefilled({ problem: p, design: d })
    setProblem(p)
    setEvaluation(null)
    setFollowups([])
    setView('form')
    setTab('design')
  }

  const designContent = () => {
    if (view === 'generate') return <GeneratePanel onEvaluateDesign={handleEvaluateGenerated} />
    if (view === 'hero')     return <Hero onStart={() => setView('selector')} onGenerate={() => setView('generate')} />
    if (view === 'selector') return <ProblemSelector onSelect={p => { setProblem(p); setView('form') }} onBack={() => setView('hero')} />
    if (view === 'form')     return (
      <DesignForm
        problem={problem}
        onBack={() => { setProblem(null); setPrefilled(null); setView('selector') }}
        onEvaluated={(ev, fq, ds) => { setEvaluation(ev); setFollowups(fq); setDesign(ds); setView('result') }}
        initialValues={prefilled?.problem === problem ? prefilled.design : undefined}
      />
    )
    if (view === 'result')   return (
      <EvaluationPanel
        problem={problem}
        design={design}
        evaluation={evaluation}
        followups={followups}
        onRetry={() => setView('form')}
        onReset={reset}
      />
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={reset} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="w-7 h-7 rounded bg-ink flex items-center justify-center">
              <span className="text-amber text-xs font-mono font-bold">SD</span>
            </span>
            <span className="font-display text-lg text-ink">System Design Evaluator</span>
          </button>

          <nav className="flex items-center gap-1 bg-border/50 rounded-lg p-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-body font-medium transition-all
                  ${tab === t.id ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {tab === 'history' ? <HistoryPanel /> : designContent()}
      </main>
    </div>
  )
}