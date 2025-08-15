// src/Service/api.js
import axios from 'axios'

/* ================= Helpers ================= */

// Lấy ID phiên hiện tại từ sessionStorage (để đọc token theo từng tab)
const getSessionId = () => sessionStorage.getItem('current_tab_id')

// Chỉ log ở môi trường dev
const log = (...args) => {
  if (import.meta.env?.DEV) console.log(...args)
}

// Xác định BASE_URL tự động cho cả localhost và domain
function getBaseURL() {
  const envVal = (import.meta.env?.VITE_API_BASE ?? '').trim()
  if (envVal) return envVal.replace(/\/+$/, '') // dùng đúng những gì bạn set

  const { hostname } = window.location
  // Khi dev trên máy: FE chạy 5173, BE chạy 8080 -> gọi thẳng BE
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080'
  }
  // Khi lên server: FE & BE cùng domain; Nginx proxy đường /api sang BE
  return '/api'
}

const BASE_URL = getBaseURL()

/* ================= Axios instance ================= */

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json; charset=utf-8',
  },
})

/* ================= Retry logic ================= */

const MAX_RETRIES = 2
const RETRY_DELAY = 1000

const shouldRetry = (error) => {
  return (
    !error.response ||
    error.code === 'ECONNABORTED' ||
    error.response?.status === 429 ||
    (error.response && error.response.status >= 500)
  )
}

const retryRequest = (config, retryCount = 0) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      log(`Retry attempt ${retryCount + 1} for ${config.url}`)
      // Dùng chính instance `api` để giữ nguyên baseURL & interceptors
      api
        .request(config)
        .then(resolve)
        .catch((error) => {
          if (retryCount < MAX_RETRIES && shouldRetry(error)) {
            retryRequest(config, retryCount + 1).then(resolve).catch(reject)
          } else {
            reject(error)
          }
        })
    }, RETRY_DELAY)
  })

/* ================= Interceptors ================= */

// Request: thêm token (trừ các endpoint public), đảm bảo header UTF-8
api.interceptors.request.use(
  (config) => {
    // ensure charset
    if (
      !config.headers['Content-Type'] ||
      String(config.headers['Content-Type']).includes('application/json')
    ) {
      config.headers['Content-Type'] = 'application/json; charset=utf-8'
    }
    if (!config.headers['Accept']) {
      config.headers['Accept'] = 'application/json; charset=utf-8'
    }

    // Các API công khai không cần token
    const publicEndpoints = [
      '/api/register',
      '/api/login',
      '/api/gui-lai-xac-nhan',
      '/api/quen-mat-khau',
      '/api/dat-lai-mat-khau',
      '/api/kiem-tra-token',
      '/api/xac-nhan-tai-khoan',
    ]

    const url = config.url || ''
    const method = (config.method || 'get').toLowerCase()

    const isPublicEndpoint =
      publicEndpoints.some((ep) => url.includes(ep)) ||
      (method === 'get' && url.startsWith('/api/')) // tuỳ back-end, bạn đang mở GET public

    if (!isPublicEndpoint) {
      const sessionId = getSessionId()
      if (sessionId) {
        const token = localStorage.getItem(`token_${sessionId}`)
        if (token) config.headers.Authorization = `Bearer ${token}`
      }
    }

    log(`API Request: ${method.toUpperCase()} ${config.baseURL}${url}`)
    if (config.data) log('Request data:', JSON.stringify(config.data, null, 2))
    return config
  },
  (error) => Promise.reject(error),
)

// Response: log, retry, xử lý 401
api.interceptors.response.use(
  (response) => {
    log(`API Response [${response.status}]:`, response.config?.url)
    return response
  },
  (error) => {
    console.error('API Error:', error.message)

    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
      console.error('Headers:', error.response.headers)
      console.error('Request URL:', error.config?.url)
      console.error('Request Method:', error.config?.method)
      if (error.config?.data) console.error('Request Data:', error.config.data)

      if ((error.response.status >= 500 || error.response.status === 429) && !error.config.__isRetry) {
        const newConfig = { ...error.config, __isRetry: true }
        return retryRequest(newConfig)
      }
    } else if (error.request) {
      console.error('No response received:', error.request)
      if (!error.config.__isRetry) {
        const newConfig = { ...error.config, __isRetry: true }
        return retryRequest(newConfig)
      }
    }

    // 401: clear token theo phiên, tránh loop
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/api/login')
      if (!api.isRedirecting) {
        if (!isLoginRequest) {
          const currentPath = window.location.pathname
          const isHome = currentPath === '/' || currentPath === '/home'
          const isLogin = currentPath === '/login'
          const isAllHomestays = currentPath === '/all-homestays'

          const sessionId = getSessionId()
          if (sessionId) {
            localStorage.removeItem(`token_${sessionId}`)
            localStorage.removeItem(`user_${sessionId}`)
            localStorage.removeItem(`isAdmin_${sessionId}`)
            if (window.dispatchEvent) {
              window.dispatchEvent(
                new CustomEvent('session-expired', {
                  detail: { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' },
                }),
              )
            }
          }

          if (!isHome && !isLogin && !isAllHomestays) {
            api.isRedirecting = true
            setTimeout(() => {
              window.location.href = '/login?expired=true'
              setTimeout(() => (api.isRedirecting = false), 1000)
            }, 500)
          }
        } else {
          log('Đăng nhập thất bại: Sai tên đăng nhập hoặc mật khẩu')
        }
      } else {
        log('Đang redirect vì 401, bỏ qua...')
      }
    }

    return Promise.reject(error)
  },
)

export default api
