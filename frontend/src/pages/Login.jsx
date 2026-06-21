import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Loader2, Mail, ShieldCheck, LockKeyhole } from 'lucide-react'
import api from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMsg, setForgotMsg] = useState('')
  const [forgotErr, setForgotErr] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)

    try {
      await login(email, password)
      nav('/')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const openForgot = () => {
    setForgotOpen(true)
    setForgotStep(1)
    setForgotEmail(email || '')
    setOtp('')
    setNewPassword('')
    setForgotMsg('')
    setForgotErr('')
  }

  const sendOtp = async () => {
    if (!forgotEmail.trim()) {
      setForgotErr('Please enter your registered email')
      return
    }

    setForgotLoading(true)
    setForgotErr('')
    setForgotMsg('')

    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: forgotEmail
      })

      setForgotMsg(data.message || 'OTP sent successfully')
      setForgotStep(2)
    } catch (e) {
      setForgotErr(e.response?.data?.detail || 'Failed to send OTP')
    } finally {
      setForgotLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setForgotErr('Please enter OTP')
      return
    }

    setForgotLoading(true)
    setForgotErr('')
    setForgotMsg('')

    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: forgotEmail,
        otp
      })

      setForgotMsg(data.message || 'OTP verified successfully')
      setForgotStep(3)
    } catch (e) {
      setForgotErr(e.response?.data?.detail || 'Invalid OTP')
    } finally {
      setForgotLoading(false)
    }
  }

  const resetPassword = async () => {
    if (newPassword.length < 8) {
      setForgotErr('Password must be at least 8 characters')
      return
    }

    setForgotLoading(true)
    setForgotErr('')
    setForgotMsg('')

    try {
      const { data } = await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp,
        new_password: newPassword
      })

      setForgotMsg(data.message || 'Password reset successfully')
      setPassword('')
      setForgotStep(4)

      setTimeout(() => {
        setForgotOpen(false)
        setForgotStep(1)
      }, 1800)
    } catch (e) {
      setForgotErr(e.response?.data?.detail || 'Failed to reset password')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-brand-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Sign in to your Career AI account
        </p>

        {err && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">
            {err}
          </div>
        )}

        <label className="block text-sm font-medium mb-1">
          Email
        </label>

        <input
          className="input mb-4"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          type="email"
          placeholder="Enter your email"
        />

        <label className="block text-sm font-medium mb-1">
          Password
        </label>

        <div className="relative mb-2">
          <input
            className="input pr-12"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
          />

          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-brand-600"
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={openForgot}
            className="text-sm text-brand-600 font-medium hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button
          className="btn-primary w-full justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 text-center">
          No account?{' '}
          <Link to="/register" className="text-brand-600 font-medium">
            Register
          </Link>
        </p>
      </form>

      {forgotOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="card w-full max-w-md relative">
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-1">
              Reset Password
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Verify your email using OTP and create a new password.
            </p>

            {forgotErr && (
              <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">
                {forgotErr}
              </div>
            )}

            {forgotMsg && (
              <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm border border-green-200">
                {forgotMsg}
              </div>
            )}

            {forgotStep === 1 && (
              <div>
                <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-blue-300 flex items-center justify-center mb-4">
                  <Mail size={24} />
                </div>

                <label className="block text-sm font-medium mb-1">
                  Registered Email
                </label>

                <input
                  className="input mb-5"
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="Enter registered email"
                />

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={forgotLoading}
                  className="btn-primary w-full"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div>
                <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-blue-300 flex items-center justify-center mb-4">
                  <ShieldCheck size={24} />
                </div>

                <label className="block text-sm font-medium mb-1">
                  Enter OTP
                </label>

                <input
                  className="input mb-5"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                />

                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={forgotLoading}
                  className="btn-primary w-full"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <button
                  type="button"
                  onClick={sendOtp}
                  className="btn-ghost w-full mt-3"
                >
                  Resend OTP
                </button>
              </div>
            )}

            {forgotStep === 3 && (
              <div>
                <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-blue-300 flex items-center justify-center mb-4">
                  <LockKeyhole size={24} />
                </div>

                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>

                <div className="relative mb-5">
                  <input
                    className="input pr-12"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-brand-600"
                  >
                    {showNewPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resetPassword}
                  disabled={forgotLoading}
                  className="btn-primary w-full"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            )}

            {forgotStep === 4 && (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="font-bold text-lg mb-1">
                  Password Reset Successful
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You can now login with your new password.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}