import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard,
  User,
  Briefcase,
  Map,
  Target,
  FileText,
 MessageSquare,
  MessageSquarePlus,
Lightbulb,
Shield,
  LogOut,
  Sparkles,
  Moon,
  Sun
} from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile', roles: ['student'] },
  { to: '/roles', icon: Briefcase, label: 'Career Roles' },
  { to: '/gap', icon: Target, label: 'Skill Gap', roles: ['student'] },
  { to: '/roadmap', icon: Map, label: 'My Roadmap', roles: ['student'] },
  { to: '/resume', icon: FileText, label: 'Resume Analyzer', roles: ['student'] },
  { to: '/projects', icon: Lightbulb, label: 'Project Recommender', roles: ['student'] },
  {to: '/interview',icon: MessageSquarePlus, label: 'Mock Interview'},
  { to: '/chat', icon: MessageSquare, label: 'AI Advisor' },
  { to: '/admin', icon: Shield, label: 'Admin', roles: ['admin'] },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const nav = useNavigate()

  const visible = NAV.filter(n => !n.roles || n.roles.includes(user?.role))

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 glass border-r border-white/70 dark:border-slate-800 p-5 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles size={22} />
          </div>

          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-brand-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Career AI
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Smart Career Command Center
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {visible.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-brand-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Logged in as
          </p>

          <div className="mt-2 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logout()
              nav('/login')
            }}
            className="btn-ghost w-full justify-center text-sm mt-4 bg-white dark:bg-slate-900"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6 border-b border-white/70 dark:border-slate-800 glass sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Welcome back,
              </p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user?.name || 'Student'} 👋
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="h-10 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm hover:shadow-md transition"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={17} />
                    <span className="hidden sm:inline text-sm">Light</span>
                  </>
                ) : (
                  <>
                    <Moon size={17} />
                    <span className="hidden sm:inline text-sm">Dark</span>
                  </>
                )}
              </button>

              <div className="hidden md:flex items-center gap-3">
                <span className="badge">AI Powered</span>
                <span className="badge capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}