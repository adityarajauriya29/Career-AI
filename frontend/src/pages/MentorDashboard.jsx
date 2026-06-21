import { useEffect, useState } from 'react'
import api from '../services/api'
export default function MentorDashboard() {
  const [students, setStudents] = useState([])
  useEffect(()=>{ api.get('/mentor/students').then(r=>setStudents(r.data)).catch(()=>{}) },[])
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mentor Dashboard</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b"><th className="p-3">Name</th><th>Branch</th><th>Year</th><th>Target</th><th>Readiness</th></tr></thead>
          <tbody>{students.map(s=>(
            <tr key={s.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{s.name}</td><td>{s.branch||'—'}</td><td>{s.year||'—'}</td><td>{s.target_role||'—'}</td><td><span className="font-semibold text-brand-700">{s.readiness}%</span></td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
