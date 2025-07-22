import { defineStore } from 'pinia'
import { login as apiLogin, getAccountInfo } from '@/Service/authService'

// Tạo hoặc lấy ID phiên duy nhất cho mỗi tab
const getOrCreateSessionId = () => {
  // Tạo key duy nhất cho tab hiện tại
  const tabSessionKey = 'tab_session_' + Date.now().toString() + Math.random().toString(36).substring(2, 15)

  // Kiểm tra xem tab này đã có ID phiên được lưu trước đó chưa
  let sessionId = sessionStorage.getItem('current_tab_id')

  if (!sessionId) {
    // Nếu chưa có, tạo ID mới và lưu vào sessionStorage (chỉ tồn tại trong tab hiện tại)
    sessionId = tabSessionKey
    sessionStorage.setItem('current_tab_id', sessionId)
    console.log('Tạo ID phiên mới cho tab:', sessionId)
  } else {
    console.log('Sử dụng ID phiên đã có cho tab:', sessionId)
  }

  return sessionId
}

// Lấy ID phiên cho tab hiện tại
const SESSION_ID = getOrCreateSessionId()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoggedIn: false,
    isAdmin: false
  }),

  getters: {
    getUser: (state) => state.user,
    isAuthenticated: (state) => state.isLoggedIn,
    hasAdminAccess: (state) => state.isAdmin
  },

  actions: {
    // Đăng nhập
    async login(username, password) {
      try {
        const res = await apiLogin(username, password)
        const userData = res.data
        const token = userData.token

        // Lưu vào state
        this.user = userData
        this.token = token
        this.isLoggedIn = true
        this.isAdmin = userData.accountTypeId === 1 || userData.accountTypeId === 2

        // Lưu vào localStorage với ID phiên
        localStorage.setItem(`token_${SESSION_ID}`, token)
        localStorage.setItem(`user_${SESSION_ID}`, JSON.stringify(userData))
        if (this.isAdmin) {
          localStorage.setItem(`isAdmin_${SESSION_ID}`, 'true')
        }

        return { success: true, userData }
      } catch (error) {
        console.error('Lỗi đăng nhập:', error)
        return { success: false, error }
      }
    },
    async fetchUserAvatar() {
      if (this.user && this.user.username && !this.user.Anh) {
        try {
          const response = await getAccountInfo(this.user.username)
          const accountInfo = response.data
          if (accountInfo && accountInfo.Anh) {
            this.user.Anh = accountInfo.Anh

            // Cập nhật lại user trong localStorage
            const userStr = localStorage.getItem(`user_${SESSION_ID}`)
            if (userStr) {
              const user = JSON.parse(userStr)
              user.Anh = accountInfo.Anh
              localStorage.setItem(`user_${SESSION_ID}`, JSON.stringify(user))
            }
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin ảnh đại diện:', error)
        }
      }
    },

    // Đăng xuất
    logout() {
      console.log('Bắt đầu đăng xuất. Trạng thái hiện tại:', JSON.stringify(this.$state));
      try {
        // Đặt lại state trong Pinia một cách tường minh
        this.user = null;
        this.token = null;
        this.isLoggedIn = false;
        this.isAdmin = false;
        console.log('Trạng thái sau khi reset:', JSON.stringify(this.$state));

        // Xóa TOÀN BỘ localStorage và sessionStorage để đảm bảo không còn dữ liệu
        console.log('Xóa toàn bộ localStorage và sessionStorage...');
        localStorage.clear();
        sessionStorage.clear();
        console.log('Đã xóa xong localStorage và sessionStorage.');

        return true;
      } catch (error) {
        console.error('Lỗi nghiêm trọng khi đăng xuất:', error);
        return false;
      }
    },

    // Khôi phục trạng thái từ localStorage
    initAuth() {
      try {
        console.log('Bắt đầu initAuth. Kiểm tra localStorage cho phiên:', SESSION_ID)
        const userStr = localStorage.getItem(`user_${SESSION_ID}`)
        const token = localStorage.getItem(`token_${SESSION_ID}`)
        console.log('Token từ localStorage:', token ? 'Tồn tại' : 'Không tồn tại')
        console.log('Chuỗi user từ localStorage:', userStr ? 'Tồn tại' : 'Không tồn tại')

        // Kiểm tra xem có dữ liệu đăng nhập không
        if (userStr && token) {
          try {
            const user = JSON.parse(userStr)

            // Kiểm tra tính hợp lệ của dữ liệu user
            if (!user || !user.username || !user.accountTypeId) {
              console.error('Dữ liệu user không hợp lệ:', user)
              this.logout()
              return
            }

            this.user = user
            this.token = token
            this.isLoggedIn = true
            this.isAdmin = user.accountTypeId === 1 || user.accountTypeId === 2

            // Sau khi khôi phục, gọi API để lấy ảnh đại diện
            if (!user.Anh) {
              this.fetchUserAvatar()
            }

            console.log('Đã khôi phục trạng thái đăng nhập từ localStorage cho phiên hiện tại')
            console.log('Trạng thái đăng nhập:', {
              isLoggedIn: this.isLoggedIn,
              isAdmin: this.isAdmin,
              username: this.user?.username
            })
          } catch (parseError) {
            console.error('Lỗi khi phân tích dữ liệu user:', parseError)
            this.logout()
          }
        } else {
          console.log('Không tìm thấy dữ liệu đăng nhập trong localStorage')
          // Đảm bảo trạng thái đăng xuất
          this.user = null
          this.token = null
          this.isLoggedIn = false
          this.isAdmin = false
        }
      } catch (error) {
        console.error('Lỗi khi khôi phục trạng thái đăng nhập:', error)
        // Nếu có lỗi, xóa tất cả dữ liệu
        this.logout()
      }
    },

    // Kiểm tra quyền truy cập admin
    checkAdminAccess() {
      return this.isLoggedIn && this.isAdmin
    }
  }
})
