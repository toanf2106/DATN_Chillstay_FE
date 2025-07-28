<template>
  <header>
    <div class="navbar">
      <div class="logo">
        <router-link to="/">
          <img src="../assets/Icon/LogoChill.png" alt="Chillstay Logo" />
          <span>Chillstay</span>
        </router-link>
      </div>
      <ul class="nav-links">
        <li>
          <router-link to="/" :class="{ 'active-link': currentPath === '/' }">Trang Chủ</router-link>
        </li>
        <li>
          <router-link to="/all-homestays" :class="{ 'active-link': currentPath === '/all-homestays' }">Tìm
            Homestay</router-link>
        </li>
        <li>
          <router-link to="/tin-tuc" :class="{ 'active-link': currentPath === '/tin-tuc' }">Tin Tức</router-link>
        </li>
        <li>
          <router-link to="/danh-gia" :class="{ 'active-link': currentPath === '/danh-gia' }">Đánh Giá</router-link>
        </li>
      </ul>

      <!-- Hiển thị nút đăng nhập/đăng ký khi chưa đăng nhập -->
      <div v-if="!isUserLoggedIn" class="auth-buttons">
        <button class="btn login-btn" @click="openLoginModal">Đăng Nhập</button>
        <button class="btn signup-btn" @click="openSignupModal">Đăng Ký</button>
      </div>

      <!-- Hiển thị tên người dùng và menu dropdown khi đã đăng nhập -->
      <div v-else class="user-profile">
        <!-- Nút hiển thị thông tin người dùng -->
        <div @click="toggleUserMenu" class="user-info">
          <img :src="getUserAvatarUrl()" alt="User Avatar" class="user-avatar" @error="handleAvatarError" />
          <span class="username">Xin chào, {{ currentUserData?.username || 'Không có tên' }}</span>
          <i class="fas fa-caret-down"></i>
        </div>

        <!-- Dropdown menu -->
        <div class="user-menu" v-if="showUserMenu">
          <router-link to="/tai-khoan" class="menu-item">
            <i class="fas fa-user"></i>
            <span>Tài khoản</span>
          </router-link>
          <div class="menu-divider"></div>
          <a href="#" @click.prevent="logoutUser" class="menu-item">
            <i class="fas fa-sign-out-alt"></i>
            <span>Đăng xuất</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Modal đăng nhập/đăng ký -->
    <div class="modal" :class="{ 'modal-active': modalVisible }" ref="authModal">
      <div class="modal-content">
        <span class="close-button" @click="closeModalIfNotProcessing">&times;</span>
        <div class="form-container">
          <!-- Login Form -->
          <div class="auth-form" :class="{ 'form-active': activeForm === 'login' }" v-show="activeForm === 'login'">
            <h2>Đăng Nhập</h2>
            <form @submit.prevent="loginUser">
              <div class="input-container">
                <input type="text" v-model="loginForm.username" placeholder=" " required ref="loginUsernameInput" />
                <label>Tên đăng nhập</label>
              </div>
              <div class="input-container">
                <input :type="passwordVisible ? 'text' : 'password'" v-model="loginForm.password" placeholder=" "
                  required />
                <label>Mật khẩu</label>
                <span class="toggle-password" @click.stop.prevent="togglePasswordVisibility">
                  <i class="fas" :class="passwordVisible ? 'fa-eye-slash' : 'fa-eye'"></i>
                </span>
              </div>
              <div v-if="loginError" class="form-error">{{ loginError }}</div>
              <button type="submit" class="submit-btn" :disabled="isLoginProcessing">
                <span v-if="isLoginProcessing" class="loading-spinner"></span>
                <span v-else>ĐĂNG NHẬP</span>
              </button>
            </form>
            <div class="form-links">
              <p class="forgot-password">
                <a href="#" @click.prevent="switchForm('forgot')">Quên mật khẩu?</a>
              </p>
              <p class="form-switcher">
                Chưa có tài khoản? <a href="#" @click.prevent="switchForm('signup')">Đăng ký</a>
              </p>
            </div>
          </div>

          <!-- Signup Form -->
          <div class="auth-form" :class="{ 'form-active': activeForm === 'signup' }" v-show="activeForm === 'signup'">
            <h2>Đăng Ký</h2>
            <form @submit.prevent="signupUser">
              <div class="input-container">
                <input type="text" v-model="signupForm.username" placeholder=" " required />
                <label>Tên đăng nhập</label>
              </div>
              <div class="input-container">
                <input type="email" v-model="signupForm.email" placeholder=" " required />
                <label>Email</label>
              </div>
              <div class="input-container">
                <input :type="signupPasswordVisible ? 'text' : 'password'" v-model="signupForm.password" placeholder=" "
                  required />
                <label>Mật khẩu</label>
                <span class="toggle-password" @click.stop.prevent="toggleSignupPasswordVisibility">
                  <i class="fas" :class="signupPasswordVisible ? 'fa-eye-slash' : 'fa-eye'"></i>
                </span>
              </div>
              <div class="input-container">
                <input :type="confirmPasswordVisible ? 'text' : 'password'" v-model="signupForm.confirmPassword"
                  placeholder=" " required />
                <label>Xác nhận mật khẩu</label>
                <span class="toggle-password" @click.stop.prevent="toggleConfirmPasswordVisibility">
                  <i class="fas" :class="confirmPasswordVisible ? 'fa-eye-slash' : 'fa-eye'"></i>
                </span>
              </div>
              <div class="terms-agree">
                <input type="checkbox" id="agreeTerms" v-model="signupForm.agreeTerms" required />
                <label for="agreeTerms">Tôi đồng ý với <a href="#">điều khoản dịch vụ</a></label>
              </div>
              <button type="submit" class="submit-btn" :disabled="isRegisterProcessing">
                <span v-if="isRegisterProcessing" class="loading-spinner"></span>
                <span v-else>ĐĂNG KÝ</span>
              </button>
            </form>
            <p class="form-switcher">
              Đã có tài khoản? <a href="#" @click.prevent="switchForm('login')">Đăng nhập</a>
            </p>
          </div>

          <!-- Forgot Password Form -->
          <div class="auth-form" :class="{ 'form-active': activeForm === 'forgot' }" v-show="activeForm === 'forgot'">
            <h2>Quên mật khẩu</h2>
            <p class="instruction">Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu</p>
            <form @submit.prevent="forgotPasswordRequest">
              <div class="input-container">
                <input type="email" v-model="forgotPasswordForm.email" placeholder=" " required
                  :disabled="isEmailProcessing" />
                <label>Email</label>
              </div>
              <div v-if="forgotPasswordError" class="form-error">{{ forgotPasswordError }}</div>
              <div v-if="forgotPasswordSuccess" class="alert-success">
                {{ forgotPasswordSuccess }}
              </div>
              <button type="submit" class="submit-btn" :disabled="isEmailProcessing">
                <span v-if="isEmailProcessing" class="loading-spinner"></span>
                <span v-else>GỬI YÊU CẦU</span>
              </button>
            </form>
            <p class="form-switcher">
              Quay lại <a href="#" @click.prevent="switchForm('login')">Đăng nhập</a>
            </p>
          </div>

          <!-- Email Verification Form -->
          <div class="auth-form" :class="{ 'form-active': activeForm === 'verification' }"
            v-show="activeForm === 'verification'">
            <h2>Xác nhận email</h2>
            <p class="instruction">Nhập email của bạn để nhận hướng dẫn xác nhận email</p>
            <form @submit.prevent="resendVerificationEmail">
              <div class="input-container">
                <input type="email" v-model="verificationForm.email" placeholder=" " required
                  :disabled="isVerificationEmailProcessing" />
                <label>Email</label>
              </div>
              <div v-if="verificationEmailError" class="form-error">
                {{ verificationEmailError }}
              </div>
              <div v-if="verificationEmailSuccess" class="alert-success">
                {{ verificationEmailSuccess }}
              </div>
              <button type="submit" class="submit-btn" :disabled="isVerificationEmailProcessing">
                <span v-if="isVerificationEmailProcessing" class="loading-spinner"></span>
                <span v-else>GỬI LẠI EMAIL XÁC NHẬN</span>
              </button>
            </form>
            <p class="form-switcher">
              Quay lại <a href="#" @click.prevent="switchForm('login')">Đăng nhập</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from '@/stores/authStore'
import notification from '@/utils/notification'
import api from '@/utils/api'
import { getTaiKhoanById } from '@/Service/TaiKhoan'

export default {
  name: 'HeaderNav',
  data() {
    return {
      currentPath: '/',
      modalVisible: false,
      activeForm: 'login',
      showUserMenu: false, // Biến kiểm soát dropdown menu
      defaultAvatarUrl: '/images/default-avatar.png', // Đường dẫn tới thư mục public
      apiBaseUrl: import.meta.env.VITE_API_URL || '', // Base URL cho API
      accountData: {
        anh: null
      },
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
      },
      signupForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
      },
      forgotPasswordForm: {
        email: '',
      },
      verificationForm: {
        email: '', // Thêm form xác nhận email
      },
      loginError: '',
      signupError: '', // Biến hiển thị lỗi đăng ký
      forgotPasswordError: '', // Biến hiển thị lỗi quên mật khẩu
      forgotPasswordSuccess: '', // Biến hiển thị thông báo thành công
      verificationEmailError: '', // Biến hiển thị lỗi xác nhận email
      verificationEmailSuccess: '', // Biến hiển thị thành công xác nhận email
      isEmailProcessing: false, // Biến kiểm soát trạng thái xử lý gửi email
      isVerificationEmailProcessing: false, // Biến kiểm soát trạng thái xử lý gửi email xác nhận
      passwordVisible: false,
      signupPasswordVisible: false,
      confirmPasswordVisible: false,
      isLoginProcessing: false,
      isRegisterProcessing: false,
      avatarError: false, // Để xử lý lỗi khi không tải được avatar
    }
  },
  computed: {
    isUserLoggedIn() {
      return this.authStore && this.authStore.isLoggedIn
    },
    currentUserData() {
      return this.authStore && this.authStore.user
    },
  },
  created() {
    this.currentPath = this.$route.path
    const savedPath = localStorage.getItem('lastVisitedPath')
    if (savedPath) {
      this.currentPath = savedPath
    }
    this.authStore = useAuthStore()
  },
  mounted() {
    this.$router.afterEach((to) => {
      this.currentPath = to.path
      localStorage.setItem('lastVisitedPath', to.path)
    })

    // Thêm listener để đóng dropdown khi click ra ngoài
    document.addEventListener('click', this.handleOutsideClick)

    // Thêm event listener cho ESC key
    document.addEventListener('keydown', this.handleEscKey)

    // Ghi log trạng thái đăng nhập khi component mounted
    console.log('HeaderNav mounted, auth state:', {
      isLoggedIn: this.isUserLoggedIn,
      user: this.currentUserData,
    })

    // Tải thông tin tài khoản nếu đã đăng nhập
    if (this.isUserLoggedIn) {
      this.loadAccountData();
    }
  },
  beforeUnmount() {
    // Xóa event listener khi component bị hủy
    document.removeEventListener('click', this.handleOutsideClick)
    document.removeEventListener('keydown', this.handleEscKey)
  },
  methods: {
    // Phương thức lấy URL ảnh đại diện từ tài khoản
    getUserAvatarUrl() {
      // Ưu tiên sử dụng ảnh từ accountData nếu đã được tải
      if (this.accountData && this.accountData.anh) {
        return this.accountData.anh;
      }

      // Nếu không có trong accountData, kiểm tra từ authStore
      if (!this.currentUserData) return this.defaultAvatarUrl;

      // Kiểm tra các trường dữ liệu có thể chứa ảnh đại diện
      const avatarUrl = this.currentUserData.anhDaiDien || this.currentUserData.anh ||
        this.currentUserData.avatar || this.currentUserData.Anh;

      return avatarUrl || this.defaultAvatarUrl;
    },

    // Xử lý lỗi khi không tải được avatar
    handleAvatarError(event) {
      console.log('Không thể tải ảnh đại diện, sử dụng ảnh mặc định')
      event.target.src = this.defaultAvatarUrl
      this.avatarError = true
    },

    // Tải thông tin tài khoản để lấy ảnh mới nhất
    async loadAccountData() {
      try {
        if (!this.isUserLoggedIn || !this.authStore.user) return;

        // Lấy ID tài khoản từ authStore
        const userId = this.authStore.user.id || this.authStore.user.userId || this.authStore.user.accountId;

        if (!userId) {
          console.warn('Không tìm thấy ID tài khoản trong authStore.user');
          return;
        }

        console.log('Tải thông tin tài khoản để cập nhật ảnh đại diện...');
        const response = await getTaiKhoanById(userId);

        if (response.data && response.data.anh) {
          this.accountData.anh = response.data.anh;
          console.log('Đã cập nhật ảnh đại diện:', this.accountData.anh);
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin tài khoản:', error);
      }
    },

    // Mới: Mở/đóng menu người dùng
    toggleUserMenu(event) {
      // Dừng sự kiện lan tỏa để không kích hoạt document click
      if (event) {
        event.stopPropagation()
      }
      this.showUserMenu = !this.showUserMenu
      console.log('Toggle user menu:', this.showUserMenu)
    },

    // Mới: Đóng menu khi click ra ngoài
    handleOutsideClick(event) {
      const userProfile = this.$el.querySelector('.user-profile')
      if (this.showUserMenu && userProfile && !userProfile.contains(event.target)) {
        this.showUserMenu = false
      }
    },

    // Phương thức xử lý ESC key
    handleEscKey(event) {
      if (event.key === 'Escape') {
        this.closeModalIfNotProcessing()
        this.showUserMenu = false
      }
    },

    // Các phương thức xử lý modal
    openLoginModal() {
      if (this.isUserLoggedIn) return

      this.resetForms()
      this.activeForm = 'login'
      this.modalVisible = true

      // Focus vào input username sau khi modal hiển thị
      this.$nextTick(() => {
        if (this.$refs.loginUsernameInput) {
          this.$refs.loginUsernameInput.focus()
        }
      })
    },

    openSignupModal() {
      if (this.isUserLoggedIn) return

      this.resetForms()
      this.activeForm = 'signup'
      this.modalVisible = true
    },

    closeModalIfNotProcessing() {
      if (!this.isLoginProcessing && !this.isRegisterProcessing) {
        this.modalVisible = false
      }
    },

    switchForm(formName) {
      this.resetForms()
      this.activeForm = formName
    },

    resetForms() {
      this.loginForm = {
        username: '',
        password: '',
        rememberMe: false,
      }

      this.signupForm = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
      }

      this.forgotPasswordForm = {
        email: '',
      }

      this.verificationForm = {
        email: '',
      }

      this.loginError = ''
      this.signupError = ''
      this.forgotPasswordError = ''
      this.forgotPasswordSuccess = ''
      this.verificationEmailError = ''
      this.verificationEmailSuccess = ''
      this.passwordVisible = false
      this.signupPasswordVisible = false
      this.confirmPasswordVisible = false
    },

    // Xử lý hiển thị/ẩn mật khẩu
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible
    },

    toggleSignupPasswordVisibility() {
      this.signupPasswordVisible = !this.signupPasswordVisible
    },

    toggleConfirmPasswordVisibility() {
      this.confirmPasswordVisible = !this.confirmPasswordVisible
    },

    // Phương thức xử lý đăng nhập
    async loginUser() {
      try {
        this.isLoginProcessing = true
        this.loginError = ''

        const result = await this.authStore.login(this.loginForm.username, this.loginForm.password)

        if (!result.success) {
          // Xử lý các trường hợp lỗi đăng nhập
          if (result.error?.response?.data?.error === 'email_not_verified') {
            this.loginError = result.error.response.data.message

            // Chuyển sang form xác nhận email
            this.verificationForm.email = result.error.response.data.email || ''
            this.switchForm('verification')

            notification.warning('Vui lòng xác nhận email trước khi đăng nhập', {
              position: 'top-right',
              duration: 5000,
            })
            return
          }

          if (result.error?.response?.status === 403) {
            this.loginError = 'Tài khoản đã bị khóa!'
            notification.error('Tài khoản đã bị khóa!', {
              position: 'top-right',
              duration: 5000,
            })
            return
          }

          this.loginError = 'Sai tài khoản hoặc mật khẩu!'
          notification.error('Sai tài khoản hoặc mật khẩu!', {
            position: 'top-right',
            duration: 5000,
          })
          return
        }

        // Đăng nhập thành công
        notification.success('Đăng nhập thành công!', {
          position: 'top-right',
          duration: 3000,
        })

        this.modalVisible = false

        const userData = result.userData
        console.log('Login successful, user data:', userData)

        // Tải thông tin tài khoản để lấy ảnh đại diện
        await this.loadAccountData();

        // Chuyển hướng sau khi đăng nhập
        setTimeout(() => {
          if (userData.accountTypeId === 1 || userData.accountTypeId === 2) {
            this.$router.push('/admin')
          } else {
            const redirectUrl = localStorage.getItem('redirectAfterLogin')
            if (redirectUrl) {
              localStorage.removeItem('redirectAfterLogin')
              this.$router.push(redirectUrl)
            } else {
              this.$router.push('/')
            }
          }
        }, 100)
      } catch (error) {
        console.error('Lỗi đăng nhập:', error)
        this.loginError = 'Đã xảy ra lỗi khi đăng nhập!'
        notification.error('Đã xảy ra lỗi khi đăng nhập!', {
          position: 'top-right',
          duration: 5000,
        })
      } finally {
        this.isLoginProcessing = false
      }
    },

    // Xử lý đăng ký
    async signupUser() {
      try {
        this.isRegisterProcessing = true
        this.signupError = ''

        // Kiểm tra các trường đầu vào
        if (!this.validateSignupForm()) {
          this.isRegisterProcessing = false
          return
        }

        // Chuẩn bị dữ liệu để gửi đến API
        const userData = {
          tenDangNhap: this.signupForm.username,
          matKhau: this.signupForm.password,
          email: this.signupForm.email,
          soDienThoai: '', // Không yêu cầu trong form hiện tại
          gioiTinh: true, // Mặc định là Nam
        }

        // Gọi API đăng ký
        await api.post('/api/register', userData)

        // Xử lý thành công
        notification.success(
          'Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác nhận tài khoản.',
          {
            position: 'top-right',
            duration: 5000,
          },
        )

        // Đóng modal và chuyển sang form đăng nhập
        this.modalVisible = false
        this.resetForms()

        // Tự động điền tên đăng nhập vào form đăng nhập
        this.loginForm.username = this.signupForm.username

        // Sau 1 giây, hiện lại modal với form đăng nhập
        setTimeout(() => {
          this.openLoginModal()
        }, 1000)
      } catch (error) {
        console.error('Lỗi đăng ký:', error)

        // Xử lý các lỗi từ server
        let errorMessage = 'Đăng ký thất bại!'

        if (error.response && error.response.data) {
          errorMessage = error.response.data

          if (errorMessage.includes('Tài khoản đã tồn tại')) {
            errorMessage = 'Tên đăng nhập đã tồn tại!'
          } else if (errorMessage.includes('Email đã tồn tại')) {
            errorMessage = 'Email đã được sử dụng!'
          }
        }

        notification.error(errorMessage, {
          position: 'top-right',
          duration: 5000,
        })
      } finally {
        this.isRegisterProcessing = false
      }
    },

    // Kiểm tra hợp lệ form đăng ký
    validateSignupForm() {
      // Kiểm tra tên đăng nhập
      if (!this.signupForm.username.trim()) {
        notification.error('Tên đăng nhập không được để trống!', {
          position: 'top-right',
          duration: 3000,
        })
        return false
      }

      // Kiểm tra email
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.signupForm.email.trim()) {
        notification.error('Email không được để trống!', {
          position: 'top-right',
          duration: 3000,
        })
        return false
      } else if (!regexEmail.test(this.signupForm.email.trim())) {
        notification.error('Email không hợp lệ!', {
          position: 'top-right',
          duration: 3000,
        })
        return false
      }

      // Kiểm tra mật khẩu
      if (!this.signupForm.password) {
        notification.error('Mật khẩu không được để trống!', {
          position: 'top-right',
          duration: 3000,
        })
        return false
      } else if (this.signupForm.password.length < 8) {
        notification.error('Mật khẩu phải có ít nhất 8 ký tự!', {
          position: 'top-right',
          duration: 3000,
        })
        return false
      }

      // Kiểm tra xác nhận mật khẩu
      if (!this.signupForm.confirmPassword) {
        notification.error('Vui lòng xác nhận mật khẩu!', {
          position: 'top-right',
          duration: 3000,
        })
        return false
      } else if (this.signupForm.confirmPassword !== this.signupForm.password) {
        notification.error('Mật khẩu xác nhận không khớp!', {
          position: 'top-right',
          duration: 3000,
        })
        return false
      }

      // Kiểm tra điều khoản
      if (!this.signupForm.agreeTerms) {
        notification.error('Vui lòng đồng ý với điều khoản dịch vụ!', {
          position: 'top-right',
          duration: 3000,
        })
        return false
      }

      return true
    },

    // Xử lý quên mật khẩu
    async forgotPasswordRequest() {
      try {
        this.isEmailProcessing = true
        this.forgotPasswordError = ''
        this.forgotPasswordSuccess = ''

        // Kiểm tra email
        const email = this.forgotPasswordForm.email.trim()
        if (!email) {
          this.forgotPasswordError = 'Vui lòng nhập email của bạn'
          return
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!regexEmail.test(email)) {
          this.forgotPasswordError = 'Email không hợp lệ'
          return
        }

        // Gọi API để yêu cầu khôi phục mật khẩu
        await api.post('/api/quen-mat-khau', { email })

        // Xử lý thành công
        this.forgotPasswordSuccess = 'Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn!'
        notification.success('Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn!', {
          position: 'top-right',
          duration: 3000,
        })

        // Đóng modal sau 3 giây
        setTimeout(() => {
          this.modalVisible = false
          this.resetForms()
        }, 3000)
      } catch (error) {
        console.error('Lỗi quên mật khẩu:', error)

        // Xử lý các lỗi từ server
        if (error.response && error.response.data) {
          if (typeof error.response.data === 'string') {
            this.forgotPasswordError = error.response.data
          } else if (error.response.data.message) {
            this.forgotPasswordError = error.response.data.message
          } else {
            this.forgotPasswordError = 'Có lỗi xảy ra khi xử lý yêu cầu'
          }
        } else {
          this.forgotPasswordError = 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.'
        }

        notification.error(this.forgotPasswordError, {
          position: 'top-right',
          duration: 5000,
        })
      } finally {
        this.isEmailProcessing = false
      }
    },

    // Thêm phương thức gửi lại email xác nhận
    async resendVerificationEmail() {
      try {
        this.isVerificationEmailProcessing = true
        this.verificationEmailError = ''
        this.verificationEmailSuccess = ''

        // Kiểm tra email
        const email = this.verificationForm.email.trim()
        if (!email) {
          this.verificationEmailError = 'Vui lòng nhập email của bạn'
          return
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!regexEmail.test(email)) {
          this.verificationEmailError = 'Email không hợp lệ'
          return
        }

        // Gọi API để gửi lại email xác nhận
        await api.post('/api/gui-lai-xac-nhan', { email })

        this.verificationEmailSuccess =
          'Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.'
        notification.success('Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.', {
          position: 'top-right',
          duration: 5000,
        })

        // Đóng modal sau khoảng thời gian
        setTimeout(() => {
          this.switchForm('login')
        }, 3000)
      } catch (error) {
        console.error('Lỗi gửi lại email xác nhận:', error)

        // Xử lý lỗi từ server
        if (error.response && error.response.data) {
          if (typeof error.response.data === 'string') {
            this.verificationEmailError = error.response.data
          } else if (error.response.data.message) {
            this.verificationEmailError = error.response.data.message
          } else {
            this.verificationEmailError = 'Có lỗi xảy ra khi gửi email xác nhận'
          }
        } else {
          this.verificationEmailError = 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.'
        }

        notification.error(this.verificationEmailError, {
          position: 'top-right',
          duration: 5000,
        })
      } finally {
        this.isVerificationEmailProcessing = false
      }
    },

    // Chức năng đăng xuất
    async logoutUser() {
      try {
        await this.authStore.logout()
        this.showUserMenu = false // Đóng dropdown khi đăng xuất
        notification.success('Đăng xuất thành công!', {
          position: 'top-right',
          duration: 2000,
        })
        if (this.$router.currentRoute.value.path !== '/') {
          this.$router.push('/')
        }
      } catch (error) {
        console.error('Lỗi khi đăng xuất:', error)
        notification.error('Có lỗi xảy ra khi đăng xuất', {
          position: 'top-right',
          duration: 3000,
        })
      }
    },

    // Giữ nguyên các phương thức còn lại
  },
  watch: {
    // Theo dõi sự thay đổi của trạng thái đăng nhập
    'authStore.isLoggedIn': {
      handler(newValue) {
        if (newValue === true) {
          // Khi đăng nhập thành công, tải thông tin tài khoản
          this.loadAccountData();
        } else {
          // Khi đăng xuất, reset dữ liệu tài khoản
          this.accountData.anh = null;
        }
      }
    }
  }
}
</script>

<style scoped>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@500;700&family=Open+Sans:wght@400;600&family=Poppins:wght@300;400;500;600&display=swap');

/* General body styling */
body {
  font-family: 'Roboto', 'Open Sans', sans-serif;
  margin: 0;
  padding: 0;
  color: #333;
  line-height: 1.6;
}

.logo img {
  position: absolute;
  margin-top: 0px;
  width: auto;
  height: 50px;
  object-fit: contain;
  margin-right: 10px;
  transition: transform 0.3s ease;
}

.logo:hover img {
  transform: scale(1.05);
}

/* Header styling - updated to match Mixivivu */
header {
  background-color: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  padding: 0.5em 0;
  border-bottom: 1px solid #e9e9e9;
}

/* Navigation bar styling */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Logo styling */
.logo a {
  text-decoration: none;
  color: #0056b3;
  font-size: 1.5em;
  font-weight: bold;
  text-shadow: none;
  display: flex;
  align-items: center;
  position: relative;
  transition: all 0.3s ease;
}

.logo span {
  margin-left: 110px;
  font-weight: 500;
  color: #42c3c8;
  font-family: 'Roboto', sans-serif;
  letter-spacing: 0.5px;
  font-size: 1.4em;
  transition: all 0.3s ease;
}

.logo:hover span {
  color: #3ab0b5;
  text-shadow: 0 0 5px rgba(66, 195, 200, 0.3);
}

/* Navigation links styling */
.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

.nav-links li {
  margin-left: 2.5em;
  position: relative;
  overflow: hidden;
}

.nav-links a {
  text-decoration: none;
  color: #333333;
  font-size: 0.95em;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  padding: 0.5em 0;
  position: relative;
  transition: all 0.3s ease;
  letter-spacing: 0.2px;
  display: inline-block;
}

.nav-links a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #42c3c8;
  transition: width 0.3s ease;
}

.nav-links a:hover {
  color: #42c3c8;
  transform: translateY(-2px);
  text-shadow: 0 0 1px rgba(66, 195, 200, 0.2);
}

.nav-links a:hover::after {
  width: 100%;
  box-shadow: 0 0 5px rgba(66, 195, 200, 0.5);
}

/* Active link styling */
.active-link,
.router-link-active {
  color: #42c3c8 !important;
  font-weight: 600 !important;
}

.active-link::after,
.router-link-active::after {
  width: 100% !important;
  height: 3px !important;
  background: linear-gradient(90deg, #42c3c8, #3ab0b5) !important;
}

/* Authentication buttons styling */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
}

.auth-buttons .btn {
  padding: 0.6em 1.5em;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: none;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  letter-spacing: 0.3px;
}

.login-btn {
  background-color: #ffffff;
  color: #42c3c8;
  border: 2px solid #42c3c8 !important;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(66, 195, 200, 0.1), transparent);
  transition: left 0.7s ease;
}

.login-btn:hover {
  background-color: #f5fdfd;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(66, 195, 200, 0.2);
  color: #3ab0b5;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(66, 195, 200, 0.3);
}

.signup-btn {
  background: linear-gradient(135deg, #42c3c8, #3ab0b5);
  color: #ffffff;
  border: 2px solid transparent !important;
  background-size: 200% 100%;
  background-position: 0 0;
}

.signup-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s ease;
}

.signup-btn:hover {
  background-position: 100% 0;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(66, 195, 200, 0.3);
}

.signup-btn:hover::before {
  left: 100%;
}

.signup-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(66, 195, 200, 0.4);
}

/* Ripple effect */
.auth-buttons .btn::after {
  content: '';
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition:
    transform 0.5s,
    opacity 1s;
}

.auth-buttons .btn:active::after {
  transform: scale(0, 0);
  opacity: 0.3;
  transition: 0s;
}

/* Modal Styling - modified for new structure but keeping visual style */
.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: none;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease-out;
  pointer-events: none;
}

.modal-active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  display: block;
}

.modal-content {
  width: 450px;
  background: white;
  border-radius: 25px;
  padding: 45px 40px;
  box-shadow: 0 18px 35px rgba(0, 119, 182, 0.2);
  position: relative;
  border: 1px solid rgba(72, 202, 228, 0.2);
  overflow: hidden;
  animation: modalFadeIn 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  margin: 7% auto;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #48cae4, #0096c7, #0077b6, #0096c7);
  z-index: 1;
}

@keyframes modalFadeIn {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.close-button {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 10;
}

.close-button:hover {
  color: #0077b6;
  background-color: rgba(0, 119, 182, 0.1);
}

.form-container {
  position: relative;
  margin-top: 10px;
}

.auth-form {
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  display: none;
}

.auth-form.form-active {
  display: block;
  opacity: 1;
  transform: translateY(0);
  animation: formAppear 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

.auth-form.form-hiding {
  display: block;
  opacity: 0;
  transform: translateY(-15px);
  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
}

.auth-form h2 {
  font-size: 2em;
  color: #0077b6;
  text-align: center;
  margin-bottom: 35px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  position: relative;
}

/*
.auth-form h2::after {
  content: '';
  position: absolute;
  height: 3px;
  background: linear-gradient(90deg, #48cae4, #0096c7, #0077b6);
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  border-radius: 3px;
  animation: underlineMove 2s ease-in-out infinite;
} */

#signupForm h2::after {
  animation: underlineMoveShort 2s ease-in-out infinite;
}

@keyframes underlineMoveShort {
  0% {
    width: 30px;
    left: 40%;
  }

  50% {
    width: 70px;
    left: 60%;
  }

  100% {
    width: 30px;
    left: 40%;
  }
}

@keyframes underlineMove {
  0% {
    width: 40px;
    left: 30%;
  }

  50% {
    width: 100px;
    left: 70%;
  }

  100% {
    width: 40px;
    left: 30%;
  }
}

/* Input styling */
.input-container {
  position: relative;
  margin-bottom: 25px;
}

.input-container input {
  width: 100%;
  padding: 16px 20px;
  font-size: 15px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s;
}

.input-container input:focus {
  border-color: #0096c7;
  box-shadow: 0 0 0 2px rgba(0, 150, 199, 0.2);
}

/* Floating Label */
.input-container label {
  position: absolute;
  left: 20px;
  top: 16px;
  color: #888;
  font-size: 15px;
  font-family: 'Poppins', sans-serif;
  pointer-events: none;
  transition: all 0.3s ease;
}

.input-container input:focus~label,
.input-container input:not(:placeholder-shown)~label {
  top: -10px;
  left: 15px;
  font-size: 13px;
  color: #0096c7;
  background-color: white;
  padding: 0 5px;
  border-radius: 3px;
}

/* Password Input Styling */
.toggle-password {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #aaa;
  font-size: 18px;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.toggle-password:hover {
  color: #0096c7;
}

.input-container:has(.toggle-password) input {
  padding-right: 45px;
}

/* Submit Button Styling */
.submit-btn {
  width: 100%;
  height: 55px;
  background: linear-gradient(90deg, #48cae4, #0077b6);
  border: none;
  border-radius: 50px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Poppins', sans-serif;
  margin-top: 10px;
  position: relative;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #0096c7, #005f8d);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 119, 182, 0.25);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-switcher {
  text-align: center;
  margin-top: 20px;
  font-size: 0.95rem;
  color: #666;
}

.form-switcher a {
  color: #0096c7;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  z-index: 5;
}

.form-switcher a:hover {
  text-decoration: underline;
  color: #0077b6;
}

/* Form Links */
.form-links {
  text-align: center;
  margin-top: 30px;
  color: #666;
  font-size: 15px;
  font-family: 'Poppins', sans-serif;
}

.form-links a {
  color: #0096c7;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  z-index: 5;
}

.form-links a:hover {
  text-decoration: underline;
}

/* Terms Agree Styling */
.terms-agree {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  font-family: 'Poppins', sans-serif;
}

.terms-agree input {
  margin-right: 10px;
  accent-color: #0096c7;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.terms-agree label {
  font-weight: normal;
  margin-bottom: 0;
  cursor: pointer;
}

.terms-agree a {
  color: #0096c7;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  z-index: 5;
}

.terms-agree a:hover {
  text-decoration: underline;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  to {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
}

@keyframes formAppear {
  0% {
    opacity: 0.5;
    transform: translateY(10px) scale(0.98);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .navbar {
    flex-direction: column;
  }

  .logo {
    margin-bottom: 1em;
  }

  .auth-buttons {
    margin-top: 1em;
  }

  .modal-content {
    width: 90%;
    margin: 10% auto;
    padding: 30px;
  }
}

/* Forgot Password Link */
.forgot-password {
  text-align: right;
  margin-bottom: 10px;
}

.forgot-password a {
  color: #0096c7;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  position: relative;
  z-index: 5;
}

.forgot-password a:hover {
  text-decoration: underline;
}

.instruction {
  text-align: center;
  color: #666;
  margin-bottom: 25px;
  font-size: 14px;
  line-height: 1.5;
  font-family: 'Poppins', sans-serif;
}

.form-error {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  margin: 10px 0;
  text-align: center;
  position: relative;
  z-index: 5;
}

/* Phần styles mới cho user profile và dropdown */
.user-profile {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(66, 195, 200, 0.1);
  border: 1px solid rgba(66, 195, 200, 0.3);
  padding: 8px 15px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-info:hover {
  background-color: rgba(66, 195, 200, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #42c3c8;
}

.username {
  color: #333;
  font-weight: 500;
  font-size: 14px;
  margin-right: 5px;
}

.user-info i {
  color: #42c3c8;
  font-size: 14px;
}

.user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 9999;
  border: 1px solid rgba(66, 195, 200, 0.2);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: rgba(66, 195, 200, 0.1);
}

.menu-item i {
  color: #42c3c8;
  width: 20px;
  text-align: center;
}

.menu-divider {
  height: 1px;
  background-color: #eee;
  margin: 5px 0;
}

/* Animations for dropdown */
.fade-dropdown-enter-active,
.fade-dropdown-leave-active {
  transition: all 0.3s;
}

.fade-dropdown-enter-from,
.fade-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Styles cho thông báo thành công */
.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 8px 12px;
  margin: 10px 0;
  font-size: 14px;
  text-align: center;
}
</style>
