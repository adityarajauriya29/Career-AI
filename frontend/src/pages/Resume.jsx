import { useState } from 'react'
import api from '../services/api'
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  BadgeCheck,
  Code2,
  FolderGit2
} from 'lucide-react'

export default function Resume() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [resumeScore, setResumeScore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const upload = async () => {
    if (!file) return

    setLoading(true)
    setErr('')
    setResult(null)
    setResumeScore(null)

    try {
      const fd = new FormData()
      fd.append('file', file)

      const { data } = await api.post('/resume/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setResult(data)

      try {
        const scoreRes = await api.get('/readiness/resume-score')
        setResumeScore(scoreRes.data)
      } catch (scoreErr) {
        console.error('Resume score error:', scoreErr)
      }
    } catch (e) {
      setErr(e.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const analysis = result?.analysis || {}
  const skills = analysis.skills || []
  const certifications = analysis.certifications || []
  const projects = analysis.projects || []

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">Resume Analyzer</h1>
        <p className="page-subtitle">
          Upload your resume and automatically extract skills, certifications, projects, and ATS score.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center mb-4">
            <UploadCloud size={28} />
          </div>

          <h2 className="text-xl font-bold mb-2">Upload Resume</h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Only PDF files are supported. Maximum file size is 5MB.
          </p>

          <label className="block border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-5 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-slate-800 transition">
            <FileText className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium">
              {file ? file.name : 'Choose PDF Resume'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Click to browse
            </p>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </label>

          <button
            className="btn-primary w-full mt-5"
            onClick={upload}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                Analyze Resume
              </>
            )}
          </button>

          {err && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              {err}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          {!result && !loading && (
            <div className="card text-center py-14">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-xl font-bold mb-2">
                No resume analyzed yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload your resume to extract skills, update your profile, and calculate ATS score.
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          )}

          {result && (
            <>
              <div
                className={`card border ${
                  result.ai_used
                    ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900'
                    : 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.ai_used ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <AlertTriangle size={22} />
                  )}

                  <div>
                    <h3 className="font-semibold">
                      {result.ai_used ? 'AI Resume Analysis Completed' : 'Fallback Parser Used'}
                    </h3>

                    <p className="text-sm mt-1">{result.note}</p>

                    <p className="text-xs mt-2">
                      Raw Text Length: {result.raw_text_length || analysis.raw_text_length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {resumeScore && (
                <div className="card bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm opacity-80">
                        Resume ATS Score
                      </p>

                      <h2 className="text-5xl font-bold mt-2">
                        {resumeScore.ats_score?.score || 0}
                      </h2>

                      <p className="mt-2">
                        Status: {resumeScore.ats_score?.status || 'Not Available'}
                      </p>
                    </div>

                    <div className="text-7xl opacity-20">
                      📄
                    </div>
                  </div>
                </div>
              )}

              {resumeScore?.ats_score && (
                <div className="card">
                  <h3 className="font-semibold mb-4">
                    ATS Breakdown
                  </h3>

                  <div className="space-y-3">
                    <ScoreRow
                      title="Readability"
                      value={resumeScore.ats_score.breakdown?.readability_score || 0}
                      total={20}
                    />

                    <ScoreRow
                      title="Keywords Match"
                      value={resumeScore.ats_score.breakdown?.keyword_score || 0}
                      total={30}
                    />

                    <ScoreRow
                      title="Sections"
                      value={resumeScore.ats_score.breakdown?.section_score || 0}
                      total={20}
                    />

                    <ScoreRow
                      title="Projects"
                      value={resumeScore.ats_score.breakdown?.project_score || 0}
                      total={15}
                    />

                    <ScoreRow
                      title="Certifications"
                      value={resumeScore.ats_score.breakdown?.certification_score || 0}
                      total={15}
                    />
                  </div>
                </div>
              )}

              {resumeScore?.ats_score?.suggestions?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-3">
                    ATS Improvement Suggestions
                  </h3>

                  <ul className="space-y-2">
                    {resumeScore.ats_score.suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <MiniCard
                  icon={Code2}
                  title="Skills"
                  value={skills.length}
                />

                <MiniCard
                  icon={BadgeCheck}
                  title="Certifications"
                  value={certifications.length}
                />

                <MiniCard
                  icon={FolderGit2}
                  title="Projects"
                  value={projects.length}
                />
              </div>

              <ResultCard title={`Detected Skills (${skills.length})`} icon={Code2}>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s} className="badge bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-blue-300">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No skills detected.</p>
                )}
              </ResultCard>

              <ResultCard title={`Certifications (${certifications.length})`} icon={BadgeCheck}>
                {certifications.length > 0 ? (
                  <ul className="space-y-2">
                    {certifications.map((c, i) => (
                      <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2">
                        <span className="text-brand-600">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No certifications detected.</p>
                )}
              </ResultCard>

              <ResultCard title={`Projects Detected (${projects.length})`} icon={FolderGit2}>
                {projects.length > 0 ? (
                  <div className="space-y-3">
                    {projects.map((p, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {typeof p === 'string' ? (
                          <p className="text-sm text-slate-700 dark:text-slate-300">{p}</p>
                        ) : (
                          <>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {p.title}
                            </p>

                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                              {p.description}
                            </p>

                            {p.technologies && p.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {p.technologies.map((t) => (
                                  <span key={t} className="text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No projects detected.</p>
                )}
              </ResultCard>

              {result.updated_profile && (
                <div className="card bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 size={18} />
                    Profile Updated
                  </div>

                  <p className="text-sm mt-1">
                    Skills, certifications, and projects have been merged into your profile.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniCard({ icon: Icon, title, value }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>

        <div className="h-10 w-10 rounded-2xl bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-blue-300 flex items-center justify-center">
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

function ResultCard({ title, icon: Icon, children }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-9 w-9 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-blue-300 flex items-center justify-center">
          <Icon size={18} />
        </div>

        <h3 className="font-semibold">{title}</h3>
      </div>

      {children}
    </div>
  )
}

function ScoreRow({ title, value, total }) {
  const percentage = total ? Math.min((Number(value) / total) * 100, 100) : 0

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600 dark:text-slate-300">{title}</span>
        <span className="font-medium">
          {value}/{total}
        </span>
      </div>

      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
        <div
          className="h-2 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}