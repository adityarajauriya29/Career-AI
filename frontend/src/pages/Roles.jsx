import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  Briefcase,
  Clock,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  FolderGit2,
  Code2
} from 'lucide-react'

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    const fetchAIRoles = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await api.get('/roles/ai/recommended')

        setRoles(res.data.recommended_roles || [])
        setMeta(res.data)
      } catch (err) {
        console.error(err)
        setError('Unable to generate AI career roles. Showing default roles.')

        const fallback = await api.get('/roles')
        setRoles(fallback.data || [])
        setMeta({
          ai_used: false,
          from_cache: false,
          note: 'Default career roles loaded.'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAIRoles()
  }, [])

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="page-title">AI Career Roles Catalog</h1>
          <p className="page-subtitle">
            Generating career paths based on your selected target role.
          </p>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">AI Career Roles Catalog</h1>
          <p className="page-subtitle">
            Roles are generated based on your selected target role in profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge">
            {roles.length} roles
          </span>

          {meta?.from_cache && (
            <span className="badge">
              Cached
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {meta && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-sm ${
            meta.ai_used
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {meta.ai_used ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}

            <div>
              <p className="font-semibold">
                {meta.ai_used ? 'AI roles generated successfully' : 'Fallback roles shown'}
              </p>

              <p className="mt-1">
                {meta.note || 'Career roles loaded successfully.'}
              </p>

              {meta.target_role && (
                <p className="mt-1 text-xs">
                  Target Role: {meta.target_role}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-5">
        {roles.map((r, index) => (
          <div key={r.name || index} className="card group">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Briefcase size={22} />
              </div>

              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                r.difficulty === 'Advanced'
                  ? 'bg-red-50 text-red-700'
                  : r.difficulty === 'Intermediate'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-green-50 text-green-700'
              }`}>
                {r.difficulty || 'Intermediate'}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-brand-700 transition">
              {r.name}
            </h3>

            <p className="text-sm text-slate-600 mb-4 min-h-[44px]">
              {r.description}
            </p>

            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Clock size={16} />
              <span>{r.duration_months || 6} months learning duration</span>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Code2 size={16} className="text-brand-600" />
                <h4 className="text-sm font-semibold">
                  Required Skills
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {(r.required_skills || []).map((s) => (
                  <span key={s} className="badge">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {r.recommended_projects && r.recommended_projects.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FolderGit2 size={16} className="text-indigo-600" />
                  <h4 className="text-sm font-semibold">
                    Recommended Projects
                  </h4>
                </div>

                <ul className="space-y-2">
                  {r.recommended_projects.map((project, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2">
                      <Sparkles size={14} className="text-brand-600 mt-0.5 shrink-0" />
                      <span>{project}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">🎯</div>
          <h3 className="text-xl font-bold mb-2">No roles available</h3>
          <p className="text-sm text-slate-500">
            Set a target role in your profile to generate AI-based career roles.
          </p>
        </div>
      )}
    </div>
  )
}