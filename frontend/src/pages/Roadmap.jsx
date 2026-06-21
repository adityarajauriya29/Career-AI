import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Map,
  Sparkles,
  Target,
  BookOpen,
  Rocket
} from 'lucide-react'

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState(null)
  const [completed, setCompleted] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState({})
  const [error, setError] = useState('')
  const [roadmapType, setRoadmapType] = useState('month')

  useEffect(() => {
    loadRoadmap()
    loadProgress()
  }, [])

  const loadRoadmap = async () => {
    try {
      const res = await api.get('/roadmap')
      setRoadmap(res.data)

      if (res.data.roadmap_type) {
        setRoadmapType(res.data.roadmap_type)
      }
    } catch (err) {
      console.error('Failed to load roadmap', err)
    }
  }

  const loadProgress = async () => {
    try {
      const res = await api.get('/progress')
      const map = {}

      ;(res.data.items || []).forEach(item => {
        if (item.completed) map[item.skill] = true
      })

      setCompleted(map)
    } catch (err) {
      console.error('Failed to load progress', err)
    }
  }

  const generateRoadmap = async () => {
    setLoading(true)
    setError('')

    try {
      const profileRes = await api.get('/profile')
      const targetRole = profileRes.data.target_role

      if (!targetRole) {
        setError('Please set a target role in Profile first')
        return
      }

      const res = await api.post('/roadmap/generate', {
        target_role: targetRole,
        weekly_hours: 10,
        roadmap_type: roadmapType
      })

      setRoadmap(res.data)
      setCompleted({})
      await loadProgress()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to generate roadmap')
    } finally {
      setLoading(false)
    }
  }

  const markComplete = async (skill) => {
    if (completed[skill] || saving[skill]) return

    setSaving(prev => ({ ...prev, [skill]: true }))

    try {
      await api.post('/progress/update', { skill, completed: true })
      setCompleted(prev => ({ ...prev, [skill]: true }))
    } catch (err) {
      console.error('Failed to mark complete', err)
      alert('Failed to update progress')
    } finally {
      setSaving(prev => ({ ...prev, [skill]: false }))
    }
  }

  const roadmapItems = roadmap?.roadmap || roadmap?.months || []

  const allSkills = roadmapItems.flatMap(item =>
    item.skills || item.topics || []
  )

  const uniqueSkills = [...new Set(allSkills)]
  const totalCount = uniqueSkills.length
  const completedCount = uniqueSkills.filter(s => completed[s]).length
  const percentage = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="page-title">Your AI Roadmap</h1>
          <p className="page-subtitle">
            Build a personalized learning journey for your target career role.
          </p>
        </div>

        <div className="card p-3 flex flex-col sm:flex-row gap-3">
          <select
            value={roadmapType}
            onChange={(e) => setRoadmapType(e.target.value)}
            className="input min-w-[170px]"
          >
            <option value="month">Month Wise</option>
            <option value="week">Week Wise</option>
          </select>

          <button
            onClick={generateRoadmap}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Roadmap
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {roadmap && (
        <div className="grid lg:grid-cols-4 gap-5 mb-6">
          <div className="card bg-gradient-to-br from-brand-600 to-indigo-700 text-white border-0 lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-blue-100">Target Role</p>
                <h2 className="text-2xl font-bold mt-1">
                  {roadmap.target_role}
                </h2>

                <p className="text-sm text-blue-100 mt-3">
                  {roadmap.roadmap_type === 'week'
                    ? '12-week focused learning plan'
                    : '6-month structured learning plan'}
                </p>
              </div>

              <Map size={32} className="text-white/80" />
            </div>
          </div>

          <MiniStat
            icon={CalendarDays}
            title="Roadmap Type"
            value={roadmap.roadmap_type === 'week' ? 'Week Wise' : 'Month Wise'}
          />

          <MiniStat
            icon={Target}
            title="Skills Tracked"
            value={totalCount}
          />
        </div>
      )}

      {totalCount > 0 && (
        <div className="card mb-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div>
              <h2 className="font-semibold">Learning Progress</h2>
              <p className="text-sm text-slate-500">
                {completedCount}/{totalCount} skills completed
              </p>
            </div>

            <div className="text-3xl font-bold text-brand-700">
              {percentage}%
            </div>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {roadmap && (
        <div className={`mb-5 p-4 rounded-2xl text-sm border ${
          roadmap.ai_used
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
        }`}>
          <div className="font-semibold">
            {roadmap.ai_used ? '✅ AI roadmap ready' : '⚠ Fallback roadmap used'}
          </div>
          <p>{roadmap.note || 'Roadmap loaded successfully.'}</p>
          {roadmap.from_cache && (
            <p className="mt-1 text-xs">Loaded from saved roadmap cache.</p>
          )}
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && roadmapItems.length > 0 && (
        <div className="relative">
          <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-200 hidden md:block"></div>

          <div className="space-y-5">
            {roadmapItems.map((item, idx) => {
              const title =
                item.title ||
                (item.month ? `Month ${item.month}` : `Step ${idx + 1}`)

              const focus =
                item.focus ||
                item.topic ||
                item.description ||
                ''

              const skills =
                item.skills ||
                item.topics ||
                []

              const doneSkills = skills.filter(s => completed[s]).length
              const stepPercent = skills.length
                ? Math.round((doneSkills / skills.length) * 100)
                : 0

              return (
                <div key={idx} className="relative md:pl-16">
                  <div className="hidden md:flex absolute left-0 top-5 h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white items-center justify-center shadow-md">
                    {completedCount > 0 && stepPercent === 100 ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <BookOpen size={22} />
                    )}
                  </div>

                  <div className="card">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge">{title}</span>
                          <span className="badge">{stepPercent}% done</span>
                        </div>

                        <h2 className="font-bold text-xl">
                          {focus}
                        </h2>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock size={15} />
                        {roadmap.roadmap_type === 'week' ? '1 week' : '1 month'}
                      </div>
                    </div>

                    {item.outcome && (
                      <p className="text-sm text-slate-600 mb-4">
                        <b>Outcome:</b> {item.outcome}
                      </p>
                    )}

                    {item.tasks && item.tasks.length > 0 && (
                      <Section title="Tasks" items={item.tasks} />
                    )}

                    {item.resources && item.resources.length > 0 && (
                      <Section title="Resources" items={item.resources} />
                    )}

                    {item.project && (
                      <div className="mb-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                        <div className="flex items-center gap-2 font-semibold text-indigo-700 mb-1">
                          <Rocket size={16} />
                          Project
                        </div>
                        <p className="text-sm text-slate-700">
                          {item.project}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-sm mb-2">
                        Skills to Complete
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {skills.map(s => {
                          const isDone = !!completed[s]
                          const isSaving = !!saving[s]

                          return (
                            <button
                              key={s}
                              onClick={() => markComplete(s)}
                              disabled={isDone || isSaving}
                              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                                isDone
                                  ? 'bg-green-500 text-white cursor-default'
                                  : 'bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 cursor-pointer'
                              } ${isSaving ? 'opacity-50' : ''}`}
                            >
                              {isDone ? '✓ ' : ''}
                              {s}
                              {isSaving && ' ...'}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!roadmap && !loading && (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-xl font-bold mb-2">
            No roadmap generated yet
          </h3>
          <p className="text-slate-500 text-sm mb-5">
            Select Month Wise or Week Wise and generate your AI-powered roadmap.
          </p>

          <button onClick={generateRoadmap} className="btn-primary">
            <Sparkles size={18} />
            Generate My Roadmap
          </button>
        </div>
      )}
    </div>
  )
}

function MiniStat({ icon: Icon, title, value }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="text-xl font-bold mt-2">{value}</h2>
        </div>

        <div className="h-10 w-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

function Section({ title, items }) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-sm mb-2">{title}</h3>

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm text-slate-600 flex gap-2"
          >
            <span className="text-brand-600 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}