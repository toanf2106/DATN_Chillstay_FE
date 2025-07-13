import axios from 'axios'

// Lấy ID phiên hiện tại từ sessionStorage
const getSessionId = () => {
  return sessionStorage.getItem('current_tab_id')
}

// Xác định baseURL dựa trên môi trường
let apiBaseUrl = 'http://localhost:8080'

// Nếu có baseURL được lưu trong localStorage, sử dụng nó (cho phép thay đổi runtime)
const savedBaseUrl = localStorage.getItem('api_base_url')
if (savedBaseUrl) {
  apiBaseUrl = savedBaseUrl
}

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: apiBaseUrl, // URL API backend Spring Boot
  timeout: 30000, // Tăng timeout lên 30 giây
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
})

// Thêm hàm helper để thay đổi baseURL khi cần
api.changeBaseURL = (newBaseURL) => {
  api.defaults.baseURL = newBaseURL
  localStorage.setItem('api_base_url', newBaseURL)
  console.log(`API base URL changed to: ${newBaseURL}`)
}

// Interceptor để thêm token vào header của mỗi request
api.interceptors.request.use(
  (config) => {
    // Đảm bảo charset UTF-8 được thiết lập cho mọi request
    if (!config.headers['Content-Type'] || config.headers['Content-Type'].includes('application/json')) {
      config.headers['Content-Type'] = 'application/json; charset=utf-8'
    }

    // Danh sách các API endpoints công khai không cần token
    const publicEndpoints = [
      // API xác thực
      '/api/register',
      '/api/login',
      '/api/gui-lai-xac-nhan',
      '/api/quen-mat-khau',
      '/api/dat-lai-mat-khau',
      '/api/kiem-tra-token',
      '/api/xac-nhan-tai-khoan',
      // Tất cả các GET request tự động được cho phép trong interceptor
    ];

    // Kiểm tra xem URL hiện tại có phải là API công khai không
    const isPublicEndpoint =
      // Là một trong các API công khai đã định nghĩa
      publicEndpoints.some(endpoint => config.url && config.url.includes(endpoint)) ||
      // Hoặc là GET request đến API
      (config.method && config.method.toLowerCase() === 'get' && config.url && config.url.startsWith('/api/'));

    // Chỉ thêm token nếu không phải là API công khai
    if (!isPublicEndpoint) {
      const sessionId = getSessionId()
      if (sessionId) {
        const token = localStorage.getItem(`token_${sessionId}`)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
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

    // Nếu response là FormData hoặc File, không log nội dung
    if (response.data instanceof FormData || response.data instanceof File) {
      console.log('Response contains binary data (not logging content)')
    } else {
      // Giới hạn kích thước log để tránh quá tải console
      const responseSize = JSON.stringify(response.data).length
      if (responseSize > 10000) {
        console.log(`Response data (truncated): ${JSON.stringify(response.data).substring(0, 1000)}... [${responseSize} bytes total]`)
      } else {
        console.log('Response data:', response.data)
      }
    }

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
      console.error('This might be a network issue or the server is not running at', api.defaults.baseURL)
    }

    // Xử lý lỗi 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.log('Lỗi xác thực:', error.response.data)

      // Kiểm tra xem lỗi có phải từ đường dẫn login hay không
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('/api/login')

      // Biến cờ static để đảm bảo chỉ redirect một lần
      if (!api.isRedirecting) {
        // Nếu không phải lỗi từ request login và không phải ở trang login/home thì mới logout và redirect
        if (!isLoginRequest) {
          console.log('Token hết hạn hoặc không hợp lệ, đăng xuất...')

          // Kiểm tra đường dẫn hiện tại
          const currentPath = window.location.pathname
          const isHomePage = currentPath === '/' || currentPath === '/home'
          const isLoginPage = currentPath === '/login'
          const isAllHomestaysPage = currentPath === '/all-homestays'

          // Xóa dữ liệu localStorage cho phiên hiện tại
          const sessionId = getSessionId()
          if (sessionId) {
            localStorage.removeItem(`token_${sessionId}`)
            localStorage.removeItem(`user_${sessionId}`)
            localStorage.removeItem(`isAdmin_${sessionId}`)
          }

          // Chỉ redirect nếu không ở trang chủ, trang login hoặc trang tất cả homestay
          if (!isHomePage && !isLoginPage && !isAllHomestaysPage) {
            api.isRedirecting = true // Đánh dấu đang redirect

            // Tăng thời gian chờ để tránh reload quá nhanh
            setTimeout(() => {
              window.location.href = '/'
              // Reset biến cờ sau khi đã redirect
              setTimeout(() => {
                api.isRedirecting = false
              }, 1000)
            }, 500)
          }
        } else {
          // Nếu là lỗi đăng nhập, chỉ log ra console và không redirect
          console.log('Đăng nhập thất bại: Sai tên đăng nhập hoặc mật khẩu')
        }
      } else {
        console.log('Đã có redirect đang xử lý, bỏ qua...')
      }
    }
    return Promise.reject(error)
  }
)

export default api
