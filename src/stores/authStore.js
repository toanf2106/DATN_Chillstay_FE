import { defineStore } from 'pinia'
import { login as apiLogin, getAccountInfo } from '@/Service/authService'

// Tạo hoặc lấy ID phiên duy nhất cho mỗi tab
const getOrCreateSessionId = () => {
  // Kiểm tra xem tab này đã có ID phiên được lưu trước đó chưa
  let sessionId = sessionStorage.getItem('current_tab_id')

  if (!sessionId) {
    // Nếu chưa có, tạo ID mới và lưu vào sessionStorage (chỉ tồn tại trong tab hiện tại)
    sessionId = 'tab_session_' + Date.now().toString() + Math.random().toString(36).substring(2, 15)
    sessionStorage.setItem('current_tab_id', sessionId)
    console.log('Tạo ID phiên mới cho tab:', sessionId)
  } else {
    console.log('Sử dụng ID phiên đã có cho tab:', sessionId)
  }

  return sessionId
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoggedIn: false,
    isAdmin: false,
    lastAdminRoute: '/admin' // Lưu trạng thái trang admin cuối cùng
  }),

  getters: {
    getUser: (state) => state.user,
    isAuthenticated: (state) => state.isLoggedIn,
    hasAdminAccess: (state) => state.isAdmin,
    getLastAdminRoute: (state) => state.lastAdminRoute
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
        // ID 2 cho Admin và ID 1 cho NhanVien từ cơ sở dữ liệu
        this.isAdmin = userData.accountTypeId === 2 ||
                       userData.accountTypeId === 1 ||
                       userData.accountTypeName?.toUpperCase() === 'ADMIN' ||
                       userData.accountTypeName?.toUpperCase() === 'NHANVIEN'

        // Làm mới sessionStorage để đảm bảo phiên mới hoàn toàn sạch
        sessionStorage.removeItem('wasAdmin');

        // Lưu vào localStorage với ID phiên
        const SESSION_ID = getOrCreateSessionId()
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
            const SESSION_ID = getOrCreateSessionId()
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
        // Lưu trạng thái admin trước khi đăng xuất (để xử lý điều hướng)
        const wasAdmin = this.isAdmin;

        // Đặt lại state trong Pinia một cách tường minh
        this.user = null;
        this.token = null;
        this.isLoggedIn = false;
        this.isAdmin = false;
        console.log('Trạng thái sau khi reset:', JSON.stringify(this.$state));

        // Lấy ID phiên hiện tại
        const sessionId = sessionStorage.getItem('current_tab_id');

        // Xóa dữ liệu đăng nhập khỏi localStorage
        if (sessionId) {
          localStorage.removeItem(`token_${sessionId}`);
          localStorage.removeItem(`user_${sessionId}`);
          localStorage.removeItem(`isAdmin_${sessionId}`);
          localStorage.removeItem(`lastAdminRoute_${sessionId}`); // Xóa lastAdminRoute
        }

        // Đánh dấu là admin trước đó (nhưng không xóa current_tab_id)
        sessionStorage.setItem('wasAdmin', wasAdmin);

        console.log('Đã xóa xong dữ liệu xác thực.');

        return true;
      } catch (error) {
        console.error('Lỗi nghiêm trọng khi đăng xuất:', error);
        return false;
      }
    },

    // Khôi phục trạng thái từ localStorage
    initAuth() {
      try {
        // Lấy ID phiên hiện tại hoặc tạo mới nếu không có
        const SESSION_ID = getOrCreateSessionId();

        console.log('Bắt đầu initAuth. Kiểm tra localStorage cho phiên:', SESSION_ID)
        const userStr = localStorage.getItem(`user_${SESSION_ID}`)
        const token = localStorage.getItem(`token_${SESSION_ID}`)
        const lastAdminRouteSaved = localStorage.getItem(`lastAdminRoute_${SESSION_ID}`)

        console.log('Token từ localStorage:', token ? 'Tồn tại' : 'Không tồn tại')
        console.log('Chuỗi user từ localStorage:', userStr ? 'Tồn tại' : 'Không tồn tại')

        // Khôi phục lastAdminRoute nếu có
        if (lastAdminRouteSaved) {
          this.lastAdminRoute = lastAdminRouteSaved;
        }

        // Kiểm tra xem có dữ liệu đăng nhập không
        if (userStr && token) {
          try {
            const user = JSON.parse(userStr)

            // Kiểm tra tính hợp lệ của dữ liệu user
            if (!user || !user.username) {
              console.error('Dữ liệu user không hợp lệ:', user)
              this.logout()
              return
            }

            // Kiểm tra token có phải là JWT hợp lệ không
            if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
              console.error('Token không có định dạng JWT hợp lệ')
              this.logout()
              return
            }

            this.user = user
            this.token = token
            this.isLoggedIn = true

            this.isAdmin = user.accountTypeId === 2 ||
                           user.accountTypeId === 1 ||
                           user.accountTypeName?.toUpperCase() === 'ADMIN' ||
                           user.accountTypeName?.toUpperCase() === 'NHANVIEN'

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
      // Cập nhật điều kiện kiểm tra quyền admin
      this.isAdmin = this.user && (
        // ID 2 cho Admin và ID 1 cho NhanVien từ cơ sở dữ liệu
        this.user.accountTypeId === 2 ||
        this.user.accountTypeId === 1 ||
        // Kiểm tra tên loại tài khoản nếu có (không phân biệt hoa thường)
        this.user.accountTypeName?.toUpperCase() === 'ADMIN' ||
        // Kiểm tra thêm tên loại là 'NhanVien'
        this.user.accountTypeName?.toUpperCase() === 'NHANVIEN'
      );
      return this.isLoggedIn && this.isAdmin;
    },

    // Lưu đường dẫn admin cuối cùng
    saveLastAdminRoute(path) {
      try {
        this.lastAdminRoute = path;
        // Lấy ID phiên hiện tại
        const sessionId = sessionStorage.getItem('current_tab_id');
        if (sessionId && this.isLoggedIn && this.isAdmin) {
          localStorage.setItem(`lastAdminRoute_${sessionId}`, path);
        }
      } catch (error) {
        console.error('Lỗi khi lưu đường dẫn admin cuối cùng:', error);
      }
    }
  }
})
