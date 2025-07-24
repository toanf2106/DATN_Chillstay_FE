import axios from 'axios'

// Lấy ID phiên hiện tại từ sessionStorage
const getSessionId = () => {
  return sessionStorage.getItem('current_tab_id')
}

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: 'http://localhost:8080', // URL API backend Spring Boot
  timeout: 30000, // Tăng timeout lên 30 giây
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
})

// Cấu hình retry cho các request bị lỗi
const MAX_RETRIES = 2; // Số lần thử lại tối đa
const RETRY_DELAY = 1000; // Delay giữa các lần thử lại (ms)

// Hàm thực hiện retry với delay
const retryRequest = (config, retryCount = 0) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Retry attempt ${retryCount + 1} for ${config.url}`);

      // Tạo request mới với cấu hình cũ
      axios(config)
        .then(response => resolve(response))
        .catch(error => {
          // Nếu vẫn còn lần thử lại và lỗi phù hợp để thử lại
          if (retryCount < MAX_RETRIES && shouldRetry(error)) {
            retryRequest(config, retryCount + 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        });
    }, RETRY_DELAY);
  });
};

// Hàm kiểm tra xem có nên retry không
const shouldRetry = (error) => {
  // Retry cho lỗi mạng, timeout hoặc server error (500)
  return !error.response ||
    error.code === 'ECONNABORTED' ||
    (error.response && error.response.status >= 500);
};

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

      // Xử lý retry cho lỗi server 500
      if (error.response.status >= 500 && !error.config.__isRetry) {
        console.log(`Server error (${error.response.status}) detected, attempting retry...`);

        // Đánh dấu request này đang được retry để tránh lặp vô hạn
        const newConfig = { ...error.config, __isRetry: true };
        return retryRequest(newConfig);
      }
    } else if (error.request) {
      console.error('No response received:', error.request)

      // Retry cho lỗi không nhận được response
      if (!error.config.__isRetry) {
        console.log('No response received, attempting retry...');
        const newConfig = { ...error.config, __isRetry: true };
        return retryRequest(newConfig);
      }
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

            // Thêm thông báo về việc phiên đăng nhập hết hạn
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('session-expired', {
                detail: { message: 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.' }
              }));
            }
          }

          // Chỉ redirect nếu không ở trang chủ, trang login hoặc trang tất cả homestay
          if (!isHomePage && !isLoginPage && !isAllHomestaysPage) {
            api.isRedirecting = true // Đánh dấu đang redirect

            // Tăng thời gian chờ để tránh reload quá nhanh
            setTimeout(() => {
              window.location.href = '/login?expired=true'
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
