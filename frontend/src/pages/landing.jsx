import { Link } from 'react-router-dom'
import {
  Sparkles,
  Map,
  Target,
  FileText,
  MessageSquare,
  Briefcase,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#070b1d] text-white overflow-hidden">
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="font-bold text-xl">Career AI</h1>
            <p className="text-xs text-slate-400">Smart Career Command Center</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#about">About</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2 rounded-xl border border-white/20 hover:bg-white/10"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold shadow-lg"
          >
            Register
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm text-blue-200 mb-6">
            <Sparkles size={16} />
            AI-powered career guidance for students
          </div>

          <h2 className="text-5xl md:text-7xl font-extrabold leading-tight">
            Build Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
              Dream Career
            </span>
            With AI
          </h2>

          <p className="text-slate-300 text-lg mt-6 max-w-xl leading-relaxed">
            Generate personalized roadmaps, analyze skill gaps, evaluate resumes,
            track readiness, and prepare for interviews using AI.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to="/register"
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold flex items-center gap-2 shadow-lg"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              className="px-7 py-4 rounded-2xl border border-white/20 hover:bg-white/10"
            >
              Login
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-10 text-sm text-slate-300">
            <MiniStat value="AI" label="Roadmaps" />
            <MiniStat value="ATS" label="Resume Score" />
            <MiniStat value="24/7" label="Career Advisor" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 bg-blue-500/20 blur-3xl rounded-full"></div>

          <div className="relative rounded-[2rem] bg-white/10 border border-white/10 shadow-2xl p-6 backdrop-blur">
            <div className="rounded-3xl bg-[#0d132b] border border-white/10 p-6">
              <h3 className="text-xl font-bold mb-5">Career Readiness</h3>

              <div className="space-y-4">
                <Progress label="Skill Match" value="78%" />
                <Progress label="Roadmap Progress" value="62%" />
                <Progress label="Resume Score" value="84%" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <DashboardCard icon={Target} title="Skill Gap" />
                <DashboardCard icon={Map} title="Roadmap" />
                <DashboardCard icon={FileText} title="Resume ATS" />
                <DashboardCard icon={MessageSquare} title="AI Advisor" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Platform Features</h2>
        <p className="text-slate-400 text-center mb-12">
          Everything a student needs to plan and improve career readiness.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <Feature icon={Map} title="AI Roadmap" text="Personalized month-wise or week-wise learning roadmap." />
          <Feature icon={Target} title="Skill Gap Analysis" text="Compare your skills with target role requirements." />
          <Feature icon={FileText} title="Resume Analyzer" text="Extract skills, projects, certifications, and ATS score." />
          <Feature icon={Briefcase} title="Project Recommender" text="Get AI project ideas based on missing skills." />
          <Feature icon={MessageSquare} title="Mock Interview" text="Practice interview questions and get AI feedback." />
          <Feature icon={Sparkles} title="AI Career Advisor" text="Ask career questions and receive practical guidance." />
        </div>
      </section>

      <section id="how" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Step num="01" title="Create Profile" text="Add skills, interests, CGPA, branch, and target role." />
          <Step num="02" title="Analyze Gap" text="System compares your skills with industry role requirements." />
          <Step num="03" title="Follow Roadmap" text="AI generates a personalized plan with projects and resources." />
        </div>
      </section>

      <section id="about" className="max-w-7xl mx-auto px-6 py-20 pb-28">
        <div className="rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-700 p-10 md:p-14 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to start your career journey?</h2>
          <p className="text-blue-100 mb-8">
            Register now and get your personalized AI career roadmap.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-700 font-bold"
          >
            Create Student Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
      <p className="text-2xl font-bold text-cyan-300">{value}</p>
      <p>{label}</p>
    </div>
  )
}

function Progress({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span>{label}</span>
        <span className="text-cyan-300">{value}</span>
      </div>
      <div className="h-3 rounded-full bg-white/10">
        <div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: value }}></div>
      </div>
    </div>
  )
}

function DashboardCard({ icon: Icon, title }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
      <Icon className="text-cyan-300 mb-3" size={24} />
      <p className="font-semibold">{title}</p>
    </div>
  )
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-3xl bg-white/10 border border-white/10 p-6 hover:bg-white/[0.14] transition">
      <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-cyan-300 flex items-center justify-center mb-5">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-slate-400">{text}</p>
    </div>
  )
}

function Step({ num, title, text }) {
  return (
    <div className="rounded-3xl bg-white/10 border border-white/10 p-6">
      <p className="text-cyan-300 font-bold mb-4">{num}</p>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-slate-400">{text}</p>
    </div>
  )
}