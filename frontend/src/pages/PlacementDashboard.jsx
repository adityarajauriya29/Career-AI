import { useEffect, useState } from 'react'
import api from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

export default function PlacementDashboard() {
  const [d, setD] = useState(null)
  useEffect(()=>{ api.get('/placement/overview').then(r=>setD(r.data)).catch(()=>{}) },[])
  if(!d) return <div>Loading...</div>
  const buckets = Object.entries(d.readiness_distribution).map(([k,v])=>({name:k, value:v}))
  const skills = d.top_skills.map(([k,v])=>({name:k, count:v}))
  const COLORS = ['#ef4444','#f59e0b','#3b82f6','#10b981']
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Placement Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card"><div className="text-slate-500 text-sm">Total Students</div><div className="text-3xl font-bold">{d.total_students}</div></div>
        <div className="card"><div className="text-slate-500 text-sm">Avg Readiness</div><div className="text-3xl font-bold">{d.average_readiness}%</div></div>
        <div className="card"><div className="text-slate-500 text-sm">Branches</div><div className="text-3xl font-bold">{Object.keys(d.branches).length}</div></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card"><h3 className="font-semibold mb-3">Readiness Distribution</h3>
          <div style={{height:260}}><ResponsiveContainer><PieChart>
            <Pie data={buckets} dataKey="value" nameKey="name" outerRadius={90}>
              {buckets.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
            </Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div>
        </div>
        <div className="card"><h3 className="font-semibold mb-3">Top Skills</h3>
          <div style={{height:260}}><ResponsiveContainer><BarChart data={skills}>
            <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} interval={0}/><YAxis/><Tooltip/>
            <Bar dataKey="count" fill="#2563eb"/></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  )
}
