import axios from 'axios'

// Lấy ID phiên hiện tại từ sessionStorage
const getSessionId = () => {
  return sessionStorage.getItem('current_tab_id')
}

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: 'http://localhost:8080', // URL API backend Spring Boot
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
    'Accept-Charset': 'utf-8',
  },
})

// Interceptor để thêm token vào header của mỗi request
api.interceptors.request.use(
  (config) => {
    // Đảm bảo charset UTF-8 được thiết lập cho mọi request
    if (!config.headers['Content-Type'] || config.headers['Content-Type'].includes('application/json')) {
      config.headers['Content-Type'] = 'application/json; charset=utf-8'
    }

    const sessionId = getSessionId()
    if (sessionId) {
      const token = localStorage.getItem(`token_${sessionId}`)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // Thêm log chi tiết cho request
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    if (config.data) {
      console.log('Request data:', JSON.stringify(config.data, null, 2))
    }

    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  },
)

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => {

    // Log success response
    console.log(`API Response [${response.status}]:`, response.config.url)

    // Đảm bảo xử lý dữ liệu UTF-8 đúng cách

    return response
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
      console.error('Headers:', error.response.headers)
      console.error('Request URL:', error.config.url)
      console.error('Request Method:', error.config.method)
      if (error.config.data) {
        console.error('Request Data:', error.config.data)
      }
    } else if (error.request) {
      console.error('No response received:', error.request)
    }

    // Xử lý lỗi 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.log('Lỗi xác thực:', error.response.data)

      // Kiểm tra xem lỗi có phải từ đường dẫn login hay không
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('/api/login')

      // Nếu không phải lỗi từ request login thì mới logout và redirect
      if (!isLoginRequest) {
        console.log('Token hết hạn hoặc không hợp lệ, đăng xuất...')

        // Xóa dữ liệu localStorage cho phiên hiện tại
        const sessionId = getSessionId()
        if (sessionId) {
          localStorage.removeItem(`token_${sessionId}`)
          localStorage.removeItem(`user_${sessionId}`)
          localStorage.removeItem(`isAdmin_${sessionId}`)
        }

        // Reload trang để App.vue có thể khởi tạo lại trạng thái
        setTimeout(() => {
          window.location.href = '/'
        }, 100)
      } else {
        // Nếu là lỗi đăng nhập, chỉ log ra console và không redirect
        console.log('Đăng nhập thất bại: Sai tên đăng nhập hoặc mật khẩu')
      }
    }
    return Promise.reject(error)
  }
)

export default api
