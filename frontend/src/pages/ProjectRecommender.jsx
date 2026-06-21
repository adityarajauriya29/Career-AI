import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  Lightbulb,
  Loader2,
  Sparkles,
  RefreshCw,
  Clock,
  BadgeCheck
} from 'lucide-react'

export default function ProjectRecommender() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const loadProjects = async () => {
    setLoading(true)
    setErr('')

    try {
      const res = await api.get('/projects/recommended')
      setData(res.data)
    } catch (e) {
      setErr(e.response?.data?.detail || 'Failed to load project recommendations')
    } finally {
      setLoading(false)
    }
  }

  const regenerate = async () => {
    setLoading(true)
    setErr('')

    try {
      await api.delete('/projects/cache')
      const res = await api.get('/projects/recommended')
      setData(res.data)
    } catch (e) {
      setErr(e.response?.data?.detail || 'Failed to regenerate projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const projects = data?.projects || []

  const grouped = {
    Beginner: projects.filter(p => p.difficulty === 'Beginner'),
    Intermediate: projects.filter(p => p.difficulty === 'Intermediate'),
    Advanced: projects.filter(p => p.difficulty === 'Advanced')
  }

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">AI Project Recommender</h1>
          <p className="page-subtitle">
            Get project ideas based on your target role, current skills, and missing skills.
          </p>
        </div>

        <button
          onClick={regenerate}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <RefreshCw size={18} />
          )}
          Regenerate
        </button>
      </div>

      {err && (
        <div className="mb-5 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-sm">
          {err}
        </div>
      )}

      {data && (
        <div className="card mb-6 bg-gradient-to-br from-brand-600 to-indigo-700 text-white border-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-blue-100">Target Role</p>
              <h2 className="text-3xl font-bold mt-1">
                {data.target_role}
              </h2>
              <p className="text-sm text-blue-100 mt-3">
                {data.note}
              </p>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles size={28} />
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([level, list]) => (
            list.length > 0 && (
              <div key={level}>
                <h2 className="text-xl font-bold mb-4">
                  {level} Projects
                </h2>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {list.map((project, index) => (
                    <ProjectCard key={`${level}-${index}`} project={project} />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="card text-center py-14">
          <div className="text-5xl mb-4">💡</div>
          <h3 className="text-xl font-bold mb-2">
            No projects found
          </h3>
          <p className="text-sm text-slate-500">
            Set your target role and skills in profile, then try again.
          </p>
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <div className="card h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-11 w-11 rounded-2xl bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-blue-300 flex items-center justify-center">
          <Lightbulb size={22} />
        </div>

        <span className={`text-xs px-3 py-1 rounded-full ${
          project.difficulty === 'Beginner'
            ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
            : project.difficulty === 'Intermediate'
              ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300'
              : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
        }`}>
          {project.difficulty}
        </span>
      </div>

      <h3 className="font-bold text-lg mb-2">
        {project.title}
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        {project.description}
      </p>

      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
        <Clock size={16} />
        {project.duration}
      </div>

      {project.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills.map(skill => (
            <span key={skill} className="badge bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-blue-300">
              {skill}
            </span>
          ))}
        </div>
      )}

      {project.features?.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">Features</p>
          <ul className="space-y-1">
            {project.features.map((feature, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2">
                <BadgeCheck size={15} className="text-green-600 mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {project.why_recommended && (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Why recommended
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {project.why_recommended}
          </p>
        </div>
      )}

      {project.learning_outcome && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          <b>Outcome:</b> {project.learning_outcome}
        </p>
      )}
    </div>
  )
}