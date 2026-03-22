import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
const AUTH_TOKEN_STORAGE_KEY = 'aurelia_auth_token'
const AUTH_USER_STORAGE_KEY = 'aurelia_auth_user'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

function attachAuthToken(config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (!token) {
    return config
  }

  const headers = config.headers instanceof AxiosHeaders
    ? config.headers
    : new AxiosHeaders(config.headers)

  headers.set('Authorization', `Bearer ${token}`)
  config.headers = headers

  return config
}

api.interceptors.request.use(attachAuthToken)
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
)

export { API_BASE_URL, AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY }
export default api
