import { useEffect, useState } from 'react'
import api from '../services/api'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function GapAnalysis() {
  const [roles, setRoles] = useState([])
  const [target, setTarget] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(()=>{ api.get('/roles').then(r=>{ setRoles(r.data); setTarget(r.data[0]?.name||'') }) },[])
  const run = async () => {
    setLoading(true)
    try { const { data } = await api.post('/gap/analyze', { target_role: target }); setResult(data) }
    finally { setLoading(false) }
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Skill Gap Analysis</h1>
      <div className="card mb-6 flex items-end gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium">Target Role</label>
          <select className="input" value={target} onChange={e=>setTarget(e.target.value)}>
            {roles.map(r => <option key={r.name}>{r.name}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={run} disabled={loading||!target}>{loading?'Analyzing...':'Analyze'}</button>
      </div>
      {result && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold mb-3">Readiness Score</h3>
            <div className="text-5xl font-bold text-brand-700">{result.readiness_percentage}%</div>
            <p className="text-slate-500 mt-2">{result.total_matched} of {result.total_required} required skills matched.</p>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-3">Overview</h3>
            <div style={{width:'100%',height:200}}>
              <ResponsiveContainer>
                <BarChart data={[{name:'Matched',v:result.matched_skills.length},{name:'Missing',v:result.missing_skills.length}]}>
                  <XAxis dataKey="name"/><YAxis/><Tooltip/>
                  <Bar dataKey="v" fill="#2563eb"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-3 text-green-700">✓ Matched Skills</h3>
            <div className="flex flex-wrap gap-2">{result.matched_skills.map(s=><span key={s} className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded">{s}</span>)}</div>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-3 text-amber-700">✗ Missing Skills</h3>
            <div className="flex flex-wrap gap-2">{result.missing_skills.map(s=><span key={s} className="text-sm bg-amber-50 text-amber-700 px-2 py-1 rounded">{s}</span>)}</div>
          </div>
        </div>
      )}
    </div>
  )
}
