import { useState, useRef, useEffect } from 'react'
import api from '../services/api'
import ReactMarkdown from 'react-markdown'
import { Send, Loader2, Bot, User } from 'lucide-react'

export default function Chatbot() {
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  const send = async () => {
    if (!input.trim() || loading) return

    const q = input.trim()
    setInput('')

    const nextMsgs = [...msgs, { role: 'user', content: q }]
    setMsgs(nextMsgs)

    setLoading(true)

    try {
      const { data } = await api.post('/chatbot/ask', {
        question: q,
        history: msgs
      })

      setMsgs(m => [
        ...m,
        {
          role: 'assistant',
          content:
            data.answer ||
            data.response ||
            data.message ||
            'No response received.'
        }
      ])
    } catch (err) {
      setMsgs(m => [
        ...m,
        {
          role: 'assistant',
          content: err.response?.data?.detail || 'Something went wrong. Please try again.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-9rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="page-title">AI Career Advisor</h1>
        <p className="page-subtitle">
          Ask career questions, project ideas, roadmap doubts, and placement preparation tips.
        </p>
      </div>

      <div className="card flex-1 overflow-y-auto space-y-5 mb-4">
        {msgs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">
              Ask your AI Career Advisor
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Try: “How do I become an AI Engineer?” or “What should I learn after Python?”
            </p>
          </div>
        )}

        {msgs.map((m, i) => {
          const isUser = m.role === 'user'

          return (
            <div
              key={i}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className={`text-xs mb-1 ${isUser ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {isUser ? 'You' : 'Advisor'}
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-li:my-1">
                  <ReactMarkdown>
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>

              {isUser && (
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-100 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
              )}
            </div>
          )
        })}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            Advisor is thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask a career question..."
        />

        <button
          className="btn-primary"
          onClick={send}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
          Send
        </button>
      </div>
    </div>
  )
}