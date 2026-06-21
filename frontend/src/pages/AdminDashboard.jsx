import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  Users,
  GraduationCap,
  Shield,
  FileText,
  Map,
  Briefcase
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(cleanStats(r.data)))
      .catch(() => {})

    api.get('/admin/users')
      .then(r => {
        const filtered = (r.data || []).filter(
          u => u.role === 'student' || u.role === 'admin'
        )
        setUsers(filtered)
      })
      .catch(() => {})
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">
          Manage students and monitor the AI Career Roadmap platform.
        </p>
      </div>

      {stats && (
        <div className="grid md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          <StatCard
            title="Students"
            value={stats.students || 0}
            icon={GraduationCap}
          />

          <StatCard
            title="Admins"
            value={stats.admins || 0}
            icon={Shield}
          />

          <StatCard
            title="Profiles"
            value={stats.profiles || 0}
            icon={Users}
          />

          <StatCard
            title="Roadmaps"
            value={stats.roadmaps || 0}
            icon={Map}
          />

          <StatCard
            title="Career Roles"
            value={stats.career_roles || stats.roles || 0}
            icon={Briefcase}
          />
        </div>
      )}

      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Users</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing only Student and Admin accounts.
            </p>
          </div>

          <span className="badge">
            {users.length} users
          </span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <tr
                key={u._id}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <td className="p-3 font-medium">
                  {u.name}
                </td>

                <td className="p-3 text-slate-600 dark:text-slate-300">
                  {u.email}
                </td>

                <td className="p-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      u.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                        : 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            No student/admin users found.
          </div>
        )}
      </div>
    </div>
  )
}

function cleanStats(stats) {
  const users = stats.users || stats.total_users || 0
  const students = stats.students || stats.student || 0
  const admins = stats.admins || stats.admin || 0

  return {
    students,
    admins,
    profiles: stats.profiles || stats.total_profiles || 0,
    roadmaps: stats.roadmaps || stats.total_roadmaps || 0,
    career_roles: stats.career_roles || stats.roles || 0,
    users
  }
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div className="h-11 w-11 rounded-2xl bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-blue-300 flex items-center justify-center">
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}