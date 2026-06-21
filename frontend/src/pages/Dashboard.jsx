import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import {
  Target,
  BookOpenCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Award,
  FolderGit2,
  BarChart3
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()

  const [progress, setProgress] = useState(null)
  const [profile, setProfile] = useState(null)
  const [readinessData, setReadinessData] = useState(null)
  const [resumeScore, setResumeScore] = useState(null)

  const loadDashboard = async () => {
    try {
      const [progressRes, profileRes, readinessRes, resumeScoreRes] =
        await Promise.all([
          api.get('/progress'),
          api.get('/profile'),
          api.get('/readiness'),
          api.get('/readiness/resume-score')
        ])

      setProgress(progressRes.data)
      setProfile(profileRes.data)
      setReadinessData(readinessRes.data)
      setResumeScore(resumeScoreRes.data)
    } catch (err) {
      console.error('Dashboard Error:', err)
    }
  }

  useEffect(() => {
    loadDashboard()

    const onFocus = () => loadDashboard()
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const readiness =
    readinessData?.overall_readiness ??
    profile?.latest_gap?.readiness_percentage ??
    0

  const breakdown = readinessData?.breakdown || {}

  const progressPercent =
    breakdown.roadmap_progress ??
    progress?.percentage ??
    0

  const skillsCount = profile?.skills?.length ?? 0

  const data = [
    { name: 'Ready', value: readiness },
    { name: 'Gap', value: Math.max(100 - readiness, 0) }
  ]

  const COLORS = ['#2563eb', '#e2e8f0']

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">
          Hi, {user?.name} 👋
        </h1>

        <p className="page-subtitle">
          Your AI-powered career command center.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 mb-6">
        <div className="card lg:col-span-2 bg-gradient-to-br from-brand-600 to-indigo-700 text-white border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-100">Target Career Role</p>
              <h2 className="text-3xl font-bold mt-2">
                {profile?.target_role || readinessData?.target_role || 'Not set'}
              </h2>
              <p className="text-sm text-blue-100 mt-3">
                Generate roadmaps, analyze gaps, and track your placement readiness.
              </p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles size={24} />
            </div>
          </div>
        </div>

        <StatCard
          title="Skills Tracked"
          value={skillsCount}
          icon={BookOpenCheck}
          subtitle="From profile & resume"
        />

        <StatCard
          title="Resume Score"
          value={`${resumeScore?.score ?? 0}/100`}
          icon={FileText}
          subtitle="Based on uploaded resume"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {user?.role === 'student' && (
          <div className="card lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">
                  Career Readiness
                </h2>
                <p className="text-xs text-slate-500">
                  For {profile?.target_role || readinessData?.target_role || 'target role'}
                </p>
              </div>

              <span className="badge">
                Smart Score
              </span>
            </div>

            <div className="relative h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={2}
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-brand-700">
                  {readiness}%
                </p>
                <p className="text-xs text-slate-500">
                  overall readiness
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-lg">
                Readiness Breakdown
              </h2>
              <p className="text-sm text-slate-500">
                Weighted score from skills, projects, certifications, roadmap, and resume.
              </p>
            </div>

            <BarChart3 className="text-brand-600" />
          </div>

          <div className="space-y-4">
            <ScoreBar
              label="Skill Match"
              value={breakdown.skill_match ?? 0}
              icon={Target}
            />

            <ScoreBar
              label="Project Strength"
              value={breakdown.project_strength ?? 0}
              icon={FolderGit2}
            />

            <ScoreBar
              label="Certification Strength"
              value={breakdown.certification_strength ?? 0}
              icon={Award}
            />

            <ScoreBar
              label="Roadmap Progress"
              value={breakdown.roadmap_progress ?? progressPercent}
              icon={TrendingUp}
            />

            <ScoreBar
              label="Resume Score"
              value={breakdown.resume_score ?? resumeScore?.score ?? 0}
              icon={FileText}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-lg">
                Strengths & Weaknesses
              </h2>
              <p className="text-sm text-slate-500">
                Based on your resume and profile.
              </p>
            </div>

            <CheckCircle2 className="text-green-600" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
              <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>

              {(readinessData?.strengths || []).length > 0 ? (
                <ul className="space-y-2">
                  {readinessData.strengths.map((item, i) => (
                    <li key={i} className="text-sm text-green-700">
                      ✓ {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-700">No strengths detected yet.</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
              <h3 className="font-semibold text-red-700 mb-2">Weaknesses</h3>

              {(readinessData?.weaknesses || []).length > 0 ? (
                <ul className="space-y-2">
                  {readinessData.weaknesses.map((item, i) => (
                    <li key={i} className="text-sm text-red-700">
                      • {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-red-700">No major weaknesses detected.</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-lg">
                Smart Recommendations
              </h2>
              <p className="text-sm text-slate-500">
                Suggested actions to improve your readiness.
              </p>
            </div>

            <Sparkles className="text-brand-600" />
          </div>

          <div className="space-y-3">
            {(readinessData?.recommendations || []).length > 0 ? (
              readinessData.recommendations.map((item, i) => (
                <SummaryRow
                  key={i}
                  title={`Recommendation ${i + 1}`}
                  text={item}
                  done={false}
                />
              ))
            ) : (
              <>
                <SummaryRow
                  title="Profile Status"
                  text={profile?.target_role ? 'Target role selected' : 'Set your target role to unlock AI guidance'}
                  done={!!profile?.target_role}
                />

                <SummaryRow
                  title="Resume Skills"
                  text={`${skillsCount} skills available in your profile`}
                  done={skillsCount > 0}
                />

                <SummaryRow
                  title="Roadmap Progress"
                  text={`${progressPercent}% of your roadmap completed`}
                  done={progressPercent > 0}
                />
              </>
            )}
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium mb-1">
              Recommended Next Step
            </p>

            <p className="text-sm text-slate-600">
              {profile?.target_role
                ? 'Continue your roadmap and complete pending skills to improve readiness.'
                : 'Go to Profile and choose your target career role first.'}
            </p>

            <div className="mt-3 flex items-center text-sm text-brand-700 font-medium">
              Open Roadmap <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

          <p className="text-xs text-slate-500 mt-2">
            {subtitle}
          </p>
        </div>

        <div className="h-11 w-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function ScoreBar({ label, value, icon: Icon }) {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-brand-600" />
          <span className="text-sm font-medium">{label}</span>
        </div>

        <span className="text-sm font-semibold">{safeValue}%</span>
      </div>

      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}

function SummaryRow({ title, text, done }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
      <div
        className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center ${
          done
            ? 'bg-green-100 text-green-700'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        <CheckCircle2 size={16} />
      </div>

      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="text-sm text-slate-500">
          {text}
        </p>
      </div>
    </div>
  )
}