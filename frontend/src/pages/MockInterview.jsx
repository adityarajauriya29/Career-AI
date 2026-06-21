import { useState } from 'react'
import api from '../services/api'
import { Loader2 } from 'lucide-react'

export default function MockInterview() {
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState(null)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateQuestions = async () => {
    setLoading(true)
    setEvaluation(null)
    setSelected(null)
    setAnswer('')

    try {
      const { data } = await api.get('/interview/questions')
      setQuestions(data.questions || [])
    } finally {
      setLoading(false)
    }
  }

  const evaluate = async () => {
    if (!selected || !answer.trim()) return

    setLoading(true)

    try {
      const { data } = await api.post('/interview/evaluate', {
        question: selected.question,
        answer
      })

      setEvaluation(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">AI Mock Interview</h1>

      <button
        className="btn-primary mb-6"
        onClick={generateQuestions}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Loading...
          </>
        ) : (
          'Generate Interview Questions'
        )}
      </button>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4 text-slate-900 dark:text-white">
            Questions
          </h2>

          {questions.map((q, i) => (
            <div
              key={i}
              onClick={() => {
                setSelected(q)
                setEvaluation(null)
                setAnswer('')
              }}
              className={`p-4 border rounded-xl mb-3 cursor-pointer transition ${
                selected?.question === q.question
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-500'
              }`}
            >
              <div className="font-medium text-slate-900 dark:text-white">
                {q.question}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {q.type} • {q.difficulty}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          {selected ? (
            <>
              <h2 className="font-semibold mb-3 text-slate-900 dark:text-white">
                Your Answer
              </h2>

              <textarea
                className="input min-h-[180px]"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Write your answer here..."
              />

              <button
                className="btn-primary mt-4"
                onClick={evaluate}
                disabled={loading || !answer.trim()}
              >
                {loading ? 'Evaluating...' : 'Evaluate Answer'}
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select a question to start answering.
            </p>
          )}

          {evaluation && (
            <div className="mt-6 text-slate-900 dark:text-slate-100">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                Score: {evaluation.score}/10
              </div>

              <div className="mt-4">
                <h3 className="font-semibold">Strengths</h3>
                <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
                  {(evaluation.strengths || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold">Improvements</h3>
                <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
                  {(evaluation.improvements || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold">Feedback</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {evaluation.feedback}
                </p>
              </div>

              {evaluation.ideal_answer && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold mb-1">Ideal Answer</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {evaluation.ideal_answer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}