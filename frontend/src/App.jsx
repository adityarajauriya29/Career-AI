import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import Roles from './pages/Roles.jsx'
import Roadmap from './pages/Roadmap.jsx'
import GapAnalysis from './pages/GapAnalysis.jsx'
import Resume from './pages/Resume.jsx'
import Chatbot from './pages/Chatbot.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ProjectRecommender from './pages/ProjectRecommender.jsx'
import MockInterview from './pages/MockInterview.jsx'

import Layout from './components/Layout.jsx'
import Protected from './components/Protected.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/gap" element={<GapAnalysis />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/projects" element={<ProjectRecommender />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/interview" element={<MockInterview />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}