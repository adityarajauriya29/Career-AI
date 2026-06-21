import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  User,
  GraduationCap,
  Target,
  Code2,
  Heart,
  Save,
  Loader2,
  CheckCircle2
} from 'lucide-react'

const BRANCH_OPTIONS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Artificial Intelligence and Machine Learning',
  'Data Science',
  'Electronics and Communication',
  'Cyber Security',
  'Other'
]

const YEAR_OPTIONS = [1, 2, 3, 4]

const STUDY_HOUR_OPTIONS = [
  { label: '5 hours/week', value: 5 },
  { label: '10 hours/week', value: 10 },
  { label: '15 hours/week', value: 15 },
  { label: '20 hours/week', value: 20 },
  { label: '25+ hours/week', value: 25 }
]

const TARGET_ROLE_OPTIONS = [
  'AI Engineer',
  'Machine Learning Engineer',
  'Data Scientist',
  'Data Analyst',
  'MLOps Engineer',
  'GenAI Engineer',
  'Full Stack AI Developer',
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Cloud Engineer',
  'DevOps Engineer',
  'Cyber Security Analyst'
]

const INTEREST_OPTIONS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Generative AI',
  'Web Development',
  'Full Stack Development',
  'Data Science',
  'Cloud Computing',
  'DevOps',
  'Cyber Security',
  'Mobile App Development',
  'UI/UX Design',
  'Competitive Programming'
]

export default function Profile() {
  const [p, setP] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get('/profile').then(r => setP(r.data))
  }, [])

  if (!p) {
    return (
      <div className="card animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
      </div>
    )
  }

  const set = (k, v) => setP({ ...p, [k]: v })

  const toggleInterest = (interest) => {
    const current = Array.isArray(p.interests) ? p.interests : []

    if (current.includes(interest)) {
      set('interests', current.filter(i => i !== interest))
    } else {
      set('interests', [...current, interest])
    }
  }

  const save = async () => {
    setSaving(true)

    try {
      const payload = { ...p }

      delete payload.user_id
      delete payload.name
      delete payload.email

      payload.skills =
        typeof payload.skills === 'string'
          ? payload.skills.split(',').map(s => s.trim()).filter(Boolean)
          : payload.skills

      payload.interests =
        typeof payload.interests === 'string'
          ? payload.interests.split(',').map(s => s.trim()).filter(Boolean)
          : payload.interests

      await api.put('/profile', payload)

      setMsg('Profile saved successfully!')
      setTimeout(() => setMsg(''), 2500)
    } finally {
      setSaving(false)
    }
  }

  const skillsPreview =
    Array.isArray(p.skills)
      ? p.skills
      : typeof p.skills === 'string'
        ? p.skills.split(',').map(s => s.trim()).filter(Boolean)
        : []

  const selectedInterests =
    Array.isArray(p.interests)
      ? p.interests
      : typeof p.interests === 'string'
        ? p.interests.split(',').map(s => s.trim()).filter(Boolean)
        : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">
          Choose your academic details, target role, and interests for better AI recommendations.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1 bg-gradient-to-br from-brand-600 to-indigo-700 text-white border-0">
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
            <User size={32} />
          </div>

          <h2 className="text-2xl font-bold">
            {p.name || 'Student Profile'}
          </h2>

          <p className="text-sm text-blue-100 mt-1">
            {p.email || 'Update your profile information'}
          </p>

          <div className="mt-6 space-y-3">
            <ProfileMini label="Target Role" value={p.target_role || 'Not set'} />
            <ProfileMini label="Branch" value={p.branch || 'Not set'} />
            <ProfileMini label="Skills" value={skillsPreview.length} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <SectionHeader
              icon={GraduationCap}
              title="Academic Information"
              text="Select your college and study details."
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Branch">
                <select
                  className="input"
                  value={p.branch || ''}
                  onChange={e => set('branch', e.target.value)}
                >
                  <option value="">Select Branch</option>
                  {BRANCH_OPTIONS.map(branch => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Year">
                <select
                  className="input"
                  value={p.year || ''}
                  onChange={e => set('year', Number(e.target.value))}
                >
                  <option value="">Select Year</option>
                  {YEAR_OPTIONS.map(year => (
                    <option key={year} value={year}>
                      {year} Year
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="CGPA">
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={p.cgpa || ''}
                  onChange={e => set('cgpa', Number(e.target.value))}
                  placeholder="8.20"
                />
              </Field>

              <Field label="Weekly Study Hours">
                <select
                  className="input"
                  value={p.weekly_study_hours || ''}
                  onChange={e => set('weekly_study_hours', Number(e.target.value))}
                >
                  <option value="">Select Study Hours</option>
                  {STUDY_HOUR_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="card">
            <SectionHeader
              icon={Target}
              title="Career Goal"
              text="Select the role you want to prepare for."
            />

            <Field label="Target Role">
              <select
                className="input"
                value={p.target_role || ''}
                onChange={e => set('target_role', e.target.value)}
              >
                <option value="">Select Target Role</option>
                {TARGET_ROLE_OPTIONS.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="card">
            <SectionHeader
              icon={Code2}
              title="Skills"
              text="Add your current technical skills separated by commas."
            />

            <Field label="Skills">
              <textarea
                className="input min-h-[100px]"
                value={Array.isArray(p.skills) ? p.skills.join(', ') : p.skills || ''}
                onChange={e => set('skills', e.target.value)}
                placeholder="python, react, sql, machine learning"
              />
            </Field>

            {skillsPreview.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {skillsPreview.map(skill => (
                  <span key={skill} className="badge bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-blue-300">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <SectionHeader
              icon={Heart}
              title="Interests"
              text="Select your areas of interest."
            />

            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(interest => {
                const selected = selectedInterests.includes(interest)

                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`text-sm px-3 py-2 rounded-full border transition ${
                      selected
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                    }`}
                  >
                    {selected ? '✓ ' : ''}
                    {interest}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn-primary"
              onClick={save}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Profile
                </>
              )}
            </button>

            {msg && (
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 px-3 py-2 rounded-xl text-sm">
                <CheckCircle2 size={16} />
                {msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileMini({ label, value }) {
  return (
    <div className="p-3 rounded-2xl bg-white/10">
      <p className="text-xs text-blue-100">{label}</p>
      <p className="font-semibold mt-1">{value}</p>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="h-10 w-10 rounded-2xl bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-blue-300 flex items-center justify-center">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
        {label}
      </label>
      {children}
    </div>
  )
}