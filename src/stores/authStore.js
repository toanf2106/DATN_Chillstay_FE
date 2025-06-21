import { defineStore } from 'pinia'
import { login as apiLogin } from '@/Service/authService'

// Tạo ID phiên duy nhất cho mỗi tab
const SESSION_ID = Date.now().toString() + Math.random().toString(36).substring(2, 15)
console.log('Tab Session ID:', SESSION_ID)

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

    // Đăng xuất
    logout() {
      console.log('Bắt đầu đăng xuất, xóa localStorage...')
      // Xóa state
      this.user = null
      this.token = null
      this.isLoggedIn = false
      this.isAdmin = false

      // Xóa localStorage cho phiên hiện tại
      localStorage.removeItem(`token_${SESSION_ID}`)
      localStorage.removeItem(`user_${SESSION_ID}`)
      localStorage.removeItem(`isAdmin_${SESSION_ID}`)
      console.log('localStorage đã được xóa cho phiên hiện tại.')
    },

    // Khôi phục trạng thái từ localStorage
    initAuth() {
      try {
        console.log('Bắt đầu initAuth. Kiểm tra localStorage cho phiên:', SESSION_ID)
        const userStr = localStorage.getItem(`user_${SESSION_ID}`)
        const token = localStorage.getItem(`token_${SESSION_ID}`)
        console.log('Token từ localStorage:', token)
        console.log('Chuỗi user từ localStorage:', userStr)

        if (userStr && token) {
          const user = JSON.parse(userStr)
          this.user = user
          this.token = token
          this.isLoggedIn = true
          this.isAdmin = user.accountTypeId === 1 || user.accountTypeId === 2
          console.log('Đã khôi phục trạng thái đăng nhập từ localStorage cho phiên hiện tại')
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
