import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserPlus, Loader2 } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  })

  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'student'
      })

      nav('/')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => {
    setForm(f => ({
      ...f,
      [k]: v
    }))
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-brand-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center mb-5">
          <UserPlus size={28} />
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Create Student Account
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Register as a student to access AI roadmap, resume analyzer, and career guidance.
        </p>

        {err && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">
            {err}
          </div>
        )}

        <input
          className="input mb-3"
          placeholder="Full name"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
        />

        <input
          className="input mb-3"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          required
        />

        <input
          className="input mb-4"
          type="password"
          placeholder="Password (min 8)"
          value={form.password}
          onChange={e => set('password', e.target.value)}
          required
          minLength={8}
        />

        <div className="mb-6 p-3 rounded-xl bg-brand-50 dark:bg-slate-800 text-sm text-brand-700 dark:text-blue-300 border border-brand-100 dark:border-slate-700">
          Account type: <b>Student</b>
        </div>

        <button
          className="btn-primary w-full justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating...
            </>
          ) : (
            'Register'
          )}
        </button>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 text-center">
          Have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}