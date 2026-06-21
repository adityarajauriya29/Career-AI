import axios from 'axios'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:9000/api'
const api = axios.create({ baseURL: API_BASE })
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('access_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('access_token'); localStorage.removeItem('user')
    if (!location.pathname.startsWith('/login')) location.href = '/login'
  }
  return Promise.reject(err)
})
export default api
