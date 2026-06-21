import axios from 'axios'

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  'http://127.0.0.1:9000/api'

const api = axios.create({
  baseURL: API_BASE,
})

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('access_token')

  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`
  }

  return cfg
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')

      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api