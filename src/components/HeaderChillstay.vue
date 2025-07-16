<script setup>
import '@/Styles/CSS/Header.css'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import notification from '@/utils/notification'
import { useAuthStore } from '@/stores/authStore'
import api from '@/utils/api'

const loginUsername = ref('')
const loginPassword = ref('')
const loginError = ref('')

// Biến cho form đăng ký
const tenDangNhap = ref('')
const email = ref('')
const soDienThoai = ref('')
const matKhau = ref('')
const xacNhanMatKhau = ref('')
const gioiTinh = ref(true) // Mặc định là Nam (true trong UI, false trong DB)
const signupError = ref('')

const router = useRouter()
const authStore = useAuthStore()

// Computed properties để lấy dữ liệu từ store
const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentUser = computed(() => authStore.user)

// Trạng thái hiển thị mật khẩu
const passwordVisible = ref(false)
const signupPasswordVisible = ref(false)
const confirmPasswordVisible = ref(false)

// Biến toàn cục kiểm soát việc đóng modal
window.isLoginProcessing = false
window.isRegisterProcessing = false

// Function để đóng modal với animation
function closeModal(modal) {
  modal.classList.remove('modal-active')
  setTimeout(function () {
    modal.style.display = 'none'
    const loginForm = document.getElementById('loginForm')
    const signupForm = document.getElementById('signupForm')
    if (loginForm) loginForm.classList.remove('form-active')
    if (signupForm) signupForm.classList.remove('form-active')
  }, 300)
}

function setupModalListeners() {
  // Lấy các phần tử DOM
  const modal = document.getElementById('authModal')
  const loginForm = document.getElementById('loginForm')
  const signupForm = document.getElementById('signupForm')
  const forgotPasswordForm = document.getElementById('forgotPasswordForm')
  const emailVerificationForm = document.getElementById('emailVerificationForm')
  const loginBtn = document.querySelector('.login-btn')
  const signupBtn = document.querySelector('.signup-btn')
  const closeBtn = document.querySelector('.close-button')
  const showSignupLink = document.getElementById('showSignup')
  const showLoginLink = document.getElementById('showLogin')
  const showForgotPasswordLink = document.getElementById('forgotPassword')
  const showLoginFromForgotLink = document.getElementById('showLoginFromForgot')
  const showLoginFromVerificationLink = document.getElementById('showLoginFromVerification')

  // Function để reset form
  function resetForms() {
    resetLoginForm()
    resetSignupForm()
    resetForgotPasswordForm()
    resetVerificationForm()
  }

  // Function để mở modal với animation
  function openModal(formToShow) {
    modal.style.display = 'block'
    setTimeout(function () {
      modal.classList.add('modal-active')
      if (formToShow === 'login') {
        loginForm.style.display = 'block'
        signupForm.style.display = 'none'
        forgotPasswordForm.style.display = 'none'
        emailVerificationForm.style.display = 'none'
        loginForm.classList.add('form-active')
        setTimeout(function () {
          const inputElem = loginForm.querySelector('input[type="text"]')
          if (inputElem) inputElem.focus()
        }, 300)
      } else if (formToShow === 'signup') {
        loginForm.style.display = 'none'
        signupForm.style.display = 'block'
        forgotPasswordForm.style.display = 'none'
        emailVerificationForm.style.display = 'none'
        signupForm.classList.add('form-active')
        setTimeout(function () {
          const inputElem = signupForm.querySelector('input[type="text"]')
          if (inputElem) inputElem.focus()
        }, 300)
      } else if (formToShow === 'forgot') {
        loginForm.style.display = 'none'
        signupForm.style.display = 'none'
        forgotPasswordForm.style.display = 'block'
        emailVerificationForm.style.display = 'none'
        forgotPasswordForm.classList.add('form-active')
        setTimeout(function () {
          const inputElem = forgotPasswordForm.querySelector('input[type="email"]')
          if (inputElem) inputElem.focus()
        }, 300)
      } else if (formToShow === 'verification') {
        loginForm.style.display = 'none'
        signupForm.style.display = 'none'
        forgotPasswordForm.style.display = 'none'
        emailVerificationForm.style.display = 'block'
        emailVerificationForm.classList.add('form-active')
        setTimeout(function () {
          const inputElem = emailVerificationForm.querySelector('input[type="email"]')
          if (inputElem) inputElem.focus()
        }, 300)
      }
    }, 10)
  }

  // Function để chuyển đổi giữa các form
  function switchForm(fromForm, toForm) {
    fromForm.classList.add('form-hiding')
    setTimeout(function () {
      fromForm.style.display = 'none'
      fromForm.classList.remove('form-active')
      fromForm.classList.remove('form-hiding')
      toForm.style.display = 'block'
      setTimeout(function () {
        toForm.classList.add('form-active')
        const inputElem =
          toForm.querySelector('input[type="text"]') || toForm.querySelector('input[type="email"]')
        if (inputElem) inputElem.focus()
      }, 10)
    }, 200)
  }

  // Các event handlers
  if (loginBtn) {
    loginBtn.addEventListener('click', function (e) {
      e.preventDefault()
      resetForms()
      openModal('login')
    })
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', function (e) {
      e.preventDefault()
      resetForms()
      openModal('signup')
    })
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      if (!window.isLoginProcessing && !window.isRegisterProcessing) {
        closeModal(modal)
        resetForms()
      }
    })
  }

  if (showSignupLink) {
    showSignupLink.addEventListener('click', function (e) {
      e.preventDefault()
      resetForms()
      switchForm(loginForm, signupForm)
    })
  }

  if (showLoginLink) {
    showLoginLink.addEventListener('click', function (e) {
      e.preventDefault()
      resetForms()
      switchForm(signupForm, loginForm)
    })
  }

  if (showForgotPasswordLink) {
    showForgotPasswordLink.addEventListener('click', function (e) {
      e.preventDefault()
      resetForms()
      switchForm(loginForm, forgotPasswordForm)
    })
  }

  if (showLoginFromForgotLink) {
    showLoginFromForgotLink.addEventListener('click', function (e) {
      e.preventDefault()
      resetForms()
      switchForm(forgotPasswordForm, loginForm)
    })
  }

  if (showLoginFromVerificationLink) {
    showLoginFromVerificationLink.addEventListener('click', function (e) {
      e.preventDefault()
      resetForms()
      switchForm(emailVerificationForm, loginForm)
    })
  }

  window.onclick = function (event) {
    if (event.target == modal && !window.isLoginProcessing && !window.isRegisterProcessing) {
      closeModal(modal)
      resetForms()
    }
  }

  // Thêm hiệu ứng cho input fields
  const inputFields = document.querySelectorAll('.auth-form input')
  inputFields.forEach(function (input) {
    input.addEventListener('focus', function () {
      this.parentNode.classList.add('input-focused')
    })

    input.addEventListener('blur', function () {
      if (!this.value) {
        this.parentNode.classList.remove('input-focused')
      }
    })

    if (input.value) {
      input.parentNode.classList.add('input-focused')
    }
  })
}

// Kiểm tra trạng thái đăng nhập khi component được tạo
onMounted(() => {
  setupModalListeners()
})

function resetLoginForm() {
  loginUsername.value = ''
  loginPassword.value = ''
  loginError.value = ''
  passwordVisible.value = false
}

function resetSignupForm() {
  tenDangNhap.value = ''
  email.value = ''
  soDienThoai.value = ''
  matKhau.value = ''
  xacNhanMatKhau.value = ''
  gioiTinh.value = true
  signupError.value = ''
  signupPasswordVisible.value = false
  confirmPasswordVisible.value = false
}

function togglePasswordVisibility() {
  passwordVisible.value = !passwordVisible.value
}

function toggleSignupPasswordVisibility() {
  signupPasswordVisible.value = !signupPasswordVisible.value
}

function toggleConfirmPasswordVisibility() {
  confirmPasswordVisible.value = !confirmPasswordVisible.value
}

// Biến cho form quên mật khẩu
const forgotEmail = ref('')
const forgotEmailError = ref('')
const forgotEmailSuccess = ref('')
const isEmailProcessing = ref(false)

// Biến cho form xác nhận email
const verificationEmail = ref('')
const verificationEmailError = ref('')
const verificationEmailSuccess = ref('')
const isVerificationEmailProcessing = ref(false)

// Hàm xử lý quên mật khẩu trong modal
async function handleForgotPassword() {
  try {
    // Reset thông báo
    forgotEmailError.value = ''
    forgotEmailSuccess.value = ''

    // Validate email
    if (!forgotEmail.value) {
      forgotEmailError.value = 'Vui lòng nhập email của bạn'
      return
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regexEmail.test(forgotEmail.value)) {
      forgotEmailError.value = 'Email không hợp lệ'
      return
    }

    isEmailProcessing.value = true
    const submitBtn = document.querySelector('#forgotPasswordForm .submit-btn')
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Đang xử lý...'
    submitBtn.disabled = true

    // Đảm bảo email được format đúng trước khi gửi đi
    const trimmedEmail = forgotEmail.value.trim().toLowerCase()

    // Gọi API quên mật khẩu từ authService
    const { forgotPassword } = await import('@/Service/authService')
    await forgotPassword(trimmedEmail)

    forgotEmailSuccess.value = 'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu'
    notification.success('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu', {
      position: 'top-right',
      duration: 5000,
    })

    // Reset form sau khi thành công
    setTimeout(() => {
      const modal = document.getElementById('authModal')
      closeModal(modal)
      resetForgotPasswordForm()
    }, 2000)
  } catch (error) {
    console.error('Lỗi quên mật khẩu:', error)

    // Hiển thị message lỗi từ API nếu có
    if (error.response && error.response.data) {
      if (typeof error.response.data === 'string') {
        forgotEmailError.value = error.response.data
      } else if (error.response.data.message) {
        forgotEmailError.value = error.response.data.message
      } else {
        forgotEmailError.value = 'Có lỗi xảy ra khi xử lý yêu cầu'
      }
    } else {
      forgotEmailError.value = 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.'
    }

    notification.error(forgotEmailError.value, {
      position: 'top-right',
      duration: 5000,
    })
  } finally {
    isEmailProcessing.value = false
    const submitBtn = document.querySelector('#forgotPasswordForm .submit-btn')
    if (submitBtn) {
      submitBtn.innerHTML = 'Gửi yêu cầu'
      submitBtn.disabled = false
    }
  }
}

function resetForgotPasswordForm() {
  forgotEmail.value = ''
  forgotEmailError.value = ''
  forgotEmailSuccess.value = ''
}

async function handleLogin() {
  try {
    window.isLoginProcessing = true
    const submitBtn = document.querySelector('#loginForm .submit-btn')
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Đang xử lý...'
    submitBtn.disabled = true
    loginError.value = ''

    const result = await authStore.login(loginUsername.value, loginPassword.value)

    if (!result.success) {
      // Kiểm tra trường hợp tài khoản chưa xác nhận email
      if (
        result.error &&
        result.error.response &&
        result.error.response.data &&
        result.error.response.data.error === 'email_not_verified'
      ) {
        loginError.value = result.error.response.data.message

        // Chuyển sang form xác nhận email
        showEmailVerificationForm(result.error.response.data.email)

        notification.warning('Vui lòng xác nhận email trước khi đăng nhập', {
          position: 'top-right',
          duration: 5000,
        })

        // Cập nhật trạng thái xử lý và nút submit
        window.isLoginProcessing = false
        submitBtn.innerHTML = 'Đăng nhập'
        submitBtn.disabled = false
        return
      }

      if (result.error && result.error.response && result.error.response.status === 403) {
        loginError.value = 'Tài khoản đã bị khóa!'
        notification.error('Tài khoản đã bị khóa!', {
          position: 'top-right',
          duration: 5000,
        })
        throw new Error('Tài khoản đã bị khóa')
      }
      throw new Error('Đăng nhập thất bại')
    }

    const closeBtn = document.querySelector('.close-button')
    if (closeBtn) {
      closeBtn.onclick = null
    }
    window.onclick = null
    const modal = document.getElementById('authModal')
    closeModal(modal)
    resetLoginForm()
    window.isLoginProcessing = false

    notification.success('Đăng nhập thành công!', {
      position: 'top-right',
      duration: 3000,
    })

    const userData = result.userData
    if (userData.accountTypeId === 1 || userData.accountTypeId === 2) {
      router.push('/admin')
    } else {
      router.push('/')
    }

    setupModalListeners()
  } catch (e) {
    console.error('Lỗi đăng nhập:', e)
    if (!loginError.value) {
      loginError.value = 'Sai tài khoản hoặc mật khẩu!'
      notification.error('Sai tài khoản hoặc mật khẩu!', {
        position: 'top-right',
        duration: 5000,
      })
    }

    window.isLoginProcessing = false
    const submitBtn = document.querySelector('#loginForm .submit-btn')
    submitBtn.innerHTML = 'Đăng nhập'
    submitBtn.disabled = false

    const modal = document.getElementById('authModal')
    if (modal) {
      modal.style.display = 'block'
      modal.classList.add('modal-active')
      document.getElementById('loginForm').classList.add('form-active')
    }
  }
}

// Kiểm tra các trường trong form đăng ký
function validateForm() {
  let isValid = true
  signupError.value = ''

  // Kiểm tra tên đăng nhập
  if (tenDangNhap.value === '') {
    signupError.value = 'Tên đăng nhập không được để trống!'
    isValid = false
  }

  // Kiểm tra email
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (email.value === '') {
    signupError.value = 'Email không được để trống!'
    isValid = false
  } else if (!regexEmail.test(email.value)) {
    signupError.value = 'Email không hợp lệ!'
    isValid = false
  }

  // Kiểm tra số điện thoại
  const regexSdt = /^(0[3|5|7|8|9])+([0-9]{8})$/
  if (soDienThoai.value === '') {
    signupError.value = 'Số điện thoại không được để trống!'
    isValid = false
  } else if (!regexSdt.test(soDienThoai.value)) {
    signupError.value = 'Số điện thoại không hợp lệ!'
    isValid = false
  }

  // Kiểm tra mật khẩu
  const regexMatKhau = /^.{8,}$/
  if (matKhau.value === '') {
    signupError.value = 'Mật khẩu không được để trống!'
    isValid = false
  } else if (!regexMatKhau.test(matKhau.value)) {
    signupError.value = 'Mật khẩu phải có ít nhất 8 ký tự!'
    isValid = false
  }

  // Kiểm tra mật khẩu nhập lại
  if (xacNhanMatKhau.value === '') {
    signupError.value = 'Vui lòng nhập lại mật khẩu!'
    isValid = false
  } else if (xacNhanMatKhau.value !== matKhau.value) {
    signupError.value = 'Mật khẩu nhập lại không khớp!'
    isValid = false
  }

  return isValid
}

// Hàm xử lý đăng ký
async function handleRegister() {
  try {
    window.isRegisterProcessing = true
    signupError.value = ''

    const submitBtn = document.querySelector('#signupForm .submit-btn')
    submitBtn.innerHTML = '<span class="loading-spinner"></span> ĐANG XỬ LÝ...'
    submitBtn.disabled = true

    // Kiểm tra các trường hợp lệ
    if (!validateForm()) {
      submitBtn.innerHTML = 'ĐĂNG KÝ'
      submitBtn.disabled = false
      window.isRegisterProcessing = false
      return
    }

    // Tạo đối tượng chứa thông tin đăng ký
    const taiKhoan = {
      tenDangNhap: tenDangNhap.value,
      matKhau: matKhau.value,
      email: email.value,
      soDienThoai: soDienThoai.value,
      gioiTinh: !gioiTinh.value, // Chuyển đổi: true trong UI = Nam = false trong DB
    }

    // Gọi API đăng ký
    await api.post('/api/register', taiKhoan)

    // Xử lý thành công
    notification.success(
      'Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác nhận tài khoản.',
      {
        position: 'top-right',
        duration: 5000,
      },
    )

    // Đóng modal
    const modal = document.getElementById('authModal')
    closeModal(modal)

    // Reset form
    resetSignupForm()

    // Hủy cờ đăng ký và khôi phục nút
    window.isRegisterProcessing = false
    submitBtn.innerHTML = 'ĐĂNG KÝ'
    submitBtn.disabled = false

    // Chuyển sang form đăng nhập sau khi đăng ký thành công
    setTimeout(() => {
      const loginForm = document.getElementById('loginForm')
      const signupForm = document.getElementById('signupForm')
      if (loginForm && signupForm) {
        loginForm.style.display = 'block'
        signupForm.style.display = 'none'
        loginForm.classList.add('form-active')
        loginUsername.value = tenDangNhap.value // Tự động điền tên đăng nhập
      }
    }, 500)
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
      } else if (errorMessage.includes('Số điện thoại đã tồn tại')) {
        errorMessage = 'Số điện thoại đã được sử dụng!'
      }
    }

    signupError.value = errorMessage
    notification.error(errorMessage, {
      position: 'top-right',
      duration: 5000,
    })
  } finally {
    // Đảm bảo luôn khôi phục trạng thái nút và cờ xử lý
    window.isRegisterProcessing = false
    const submitBtn = document.querySelector('#signupForm .submit-btn')
    if (submitBtn) {
      submitBtn.innerHTML = 'ĐĂNG KÝ'
      submitBtn.disabled = false
    }
  }
}

function handleLogout() {
  try {
    authStore.logout()
    notification.success('Đăng xuất thành công!', {
      position: 'top-right',
      duration: 2000,
    })
    if (router.currentRoute.value.path !== '/') {
      router.push('/')
    }
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error)
    notification.error('Có lỗi xảy ra khi đăng xuất', {
      position: 'top-right',
      duration: 3000,
    })
  }
}

// Hàm hiển thị form xác nhận email
function showEmailVerificationForm(email) {
  verificationEmail.value = email || ''
  const modal = document.getElementById('authModal')
  const loginForm = document.getElementById('loginForm')
  const verificationForm = document.getElementById('emailVerificationForm')

  if (modal && loginForm && verificationForm) {
    loginForm.classList.add('form-hiding')
    setTimeout(function () {
      loginForm.style.display = 'none'
      loginForm.classList.remove('form-active')
      loginForm.classList.remove('form-hiding')
      verificationForm.style.display = 'block'
      setTimeout(function () {
        verificationForm.classList.add('form-active')
      }, 10)
    }, 200)
  }
}

// Hàm gửi lại email xác nhận
async function resendVerificationEmail() {
  try {
    verificationEmailError.value = ''
    verificationEmailSuccess.value = ''

    if (!verificationEmail.value) {
      verificationEmailError.value = 'Vui lòng nhập email của bạn'
      return
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regexEmail.test(verificationEmail.value)) {
      verificationEmailError.value = 'Email không hợp lệ'
      return
    }

    isVerificationEmailProcessing.value = true
    const submitBtn = document.querySelector('#emailVerificationForm .submit-btn')
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Đang xử lý...'
    submitBtn.disabled = true

    // Gọi API gửi lại email xác nhận
    await api.post('/api/gui-lai-xac-nhan', { email: verificationEmail.value })

    verificationEmailSuccess.value =
      'Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.'
    notification.success('Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.', {
      position: 'top-right',
      duration: 5000,
    })
  } catch (error) {
    console.error('Lỗi gửi lại email xác nhận:', error)

    if (error.response && error.response.data) {
      if (typeof error.response.data === 'string') {
        verificationEmailError.value = error.response.data
      } else if (error.response.data.message) {
        verificationEmailError.value = error.response.data.message
      } else {
        verificationEmailError.value = 'Có lỗi xảy ra khi gửi email xác nhận'
      }
    } else {
      verificationEmailError.value = 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.'
    }

    notification.error(verificationEmailError.value, {
      position: 'top-right',
      duration: 5000,
    })
  } finally {
    isVerificationEmailProcessing.value = false
    const submitBtn = document.querySelector('#emailVerificationForm .submit-btn')
    if (submitBtn) {
      submitBtn.innerHTML = 'Gửi lại email xác nhận'
      submitBtn.disabled = false
    }
  }
}

function resetVerificationForm() {
  verificationEmail.value = ''
  verificationEmailError.value = ''
  verificationEmailSuccess.value = ''
}
</script>

<template>
  <header>
    <nav class="navbar">
      <div class="logo">
        <router-link to="/">
          <img src="@/assets/icon/LogoChill.png" alt="Chillstay Logo" />
          <span>Chillstay</span>
        </router-link>
      </div>
      <ul class="nav-links">
        <li><router-link to="/">Trang Chủ</router-link></li>
        <li><router-link to="/all-homestays">Tìm Homestay</router-link></li>
        <li><a href="#">Dịch Vụ</a></li>
        <li><router-link to="/tin-tuc">Tin Tức</router-link></li>
        <li><a href="#">Giảm Giá</a></li>
      </ul>

      <!-- Hiển thị nút đăng nhập/đăng ký khi chưa đăng nhập -->
      <div class="auth-buttons" v-if="!isLoggedIn">
        <button class="btn login-btn">Đăng Nhập</button>
        <button class="btn signup-btn">Đăng Ký</button>
      </div>

      <!-- Hiển thị tên người dùng và nút đăng xuất khi đã đăng nhập -->
      <div class="user-menu" v-else>
        <span class="username">Xin chào, {{ currentUser?.username }}</span>
        <button class="btn logout-btn" @click="handleLogout">Đăng Xuất</button>
      </div>
    </nav>
  </header>

  <!-- The Modal -->
  <div id="authModal" class="modal">
    <div class="modal-content">
      <span class="close-button">&times;</span>
      <div class="form-container">
        <!-- Login Form -->
        <div id="loginForm" class="auth-form">
          <h2>Đăng nhập</h2>
          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <label for="loginUsername">Tên đăng nhập</label>
              <input type="text" id="loginUsername" v-model="loginUsername" required />
            </div>
            <div class="input-group">
              <label for="loginPassword">Mật khẩu</label>
              <div class="password-input-container">
                <input
                  :type="passwordVisible ? 'text' : 'password'"
                  id="loginPassword"
                  v-model="loginPassword"
                  required
                />
                <span class="password-toggle" @click="togglePasswordVisibility">
                  <font-awesome-icon
                    :icon="passwordVisible ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'"
                  />
                </span>
              </div>
            </div>
            <button type="submit" class="btn submit-btn">Đăng nhập</button>
            <div v-if="loginError" class="form-error">{{ loginError }}</div>
          </form>
          <div class="form-links">
            <p class="forgot-password">
              <a href="#" id="forgotPassword">Quên mật khẩu?</a>
            </p>
            <p class="form-switcher">Chưa có tài khoản? <a href="#" id="showSignup">Đăng ký</a></p>
          </div>
        </div>

        <!-- Signup Form theo thiết kế mới -->
        <div id="signupForm" class="auth-form" style="display: none">
          <h2>Đăng ký</h2>
          <form @submit.prevent="handleRegister" class="signup-form-container">
            <div class="input-group">
              <label for="tenDangNhap">Tên đăng nhập</label>
              <input type="text" id="tenDangNhap" v-model="tenDangNhap" required />
            </div>

            <div class="input-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="email" required />
            </div>

            <div class="input-group">
              <label for="soDienThoai">Số điện thoại</label>
              <input type="text" id="soDienThoai" v-model="soDienThoai" required />
            </div>

            <div class="input-group radio-group-container">
              <label>Giới tính</label>
              <div class="radio-group">
                <div class="radio-option">
                  <input type="radio" id="radioNam" :value="true" v-model="gioiTinh" checked />
                  <label for="radioNam">Nam</label>
                </div>
                <div class="radio-option">
                  <input type="radio" id="radioNu" :value="false" v-model="gioiTinh" />
                  <label for="radioNu">Nữ</label>
                </div>
              </div>
            </div>

            <div class="input-group">
              <label for="matKhau">Mật khẩu</label>
              <div class="password-input-container">
                <input
                  :type="signupPasswordVisible ? 'text' : 'password'"
                  id="matKhau"
                  v-model="matKhau"
                  required
                />
                <span class="password-toggle" @click="toggleSignupPasswordVisibility">
                  <font-awesome-icon
                    :icon="signupPasswordVisible ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'"
                  />
                </span>
              </div>
            </div>

            <div class="input-group">
              <label for="xacNhanMatKhau">Xác nhận mật khẩu</label>
              <div class="password-input-container">
                <input
                  :type="confirmPasswordVisible ? 'text' : 'password'"
                  id="xacNhanMatKhau"
                  v-model="xacNhanMatKhau"
                  required
                />
                <span class="password-toggle" @click="toggleConfirmPasswordVisibility">
                  <font-awesome-icon
                    :icon="confirmPasswordVisible ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'"
                  />
                </span>
              </div>
            </div>

            <button type="submit" class="btn submit-btn">ĐĂNG KÝ</button>
            <div v-if="signupError" class="form-error error-message">{{ signupError }}</div>
          </form>
          <p class="form-switcher">Đã có tài khoản? <a href="#" id="showLogin">Đăng nhập</a></p>
        </div>

        <!-- Forgot Password Form -->
        <div id="forgotPasswordForm" class="auth-form" style="display: none">
          <h2>Quên mật khẩu</h2>
          <p class="text-center text-muted mb-4">
            Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu
          </p>
          <form @submit.prevent="handleForgotPassword">
            <div class="input-group">
              <label for="forgotEmail">Email</label>
              <input
                type="email"
                id="forgotEmail"
                v-model="forgotEmail"
                class="form-control"
                placeholder="Nhập email của bạn"
                :disabled="isEmailProcessing"
              />
            </div>

            <div v-if="forgotEmailError" class="form-error">
              {{ forgotEmailError }}
            </div>

            <div v-if="forgotEmailSuccess" class="alert-success">
              {{ forgotEmailSuccess }}
            </div>

            <button type="submit" class="btn submit-btn" :disabled="isEmailProcessing">
              {{ isEmailProcessing ? 'Đang xử lý...' : 'Gửi yêu cầu' }}
            </button>
          </form>
          <p class="form-switcher">Quay lại <a href="#" id="showLoginFromForgot">Đăng nhập</a></p>
        </div>

        <!-- Email Verification Form -->
        <div id="emailVerificationForm" class="auth-form" style="display: none">
          <h2>Xác nhận email</h2>
          <p class="text-center text-muted mb-4">
            Nhập email của bạn để nhận hướng dẫn xác nhận email
          </p>
          <form @submit.prevent="resendVerificationEmail">
            <div class="input-group">
              <label for="verificationEmail">Email</label>
              <input
                type="email"
                id="verificationEmail"
                v-model="verificationEmail"
                class="form-control"
                placeholder="Nhập email của bạn"
                :disabled="isVerificationEmailProcessing"
              />
            </div>

            <div v-if="verificationEmailError" class="form-error">
              {{ verificationEmailError }}
            </div>

            <div v-if="verificationEmailSuccess" class="alert-success">
              {{ verificationEmailSuccess }}
            </div>

            <button type="submit" class="btn submit-btn" :disabled="isVerificationEmailProcessing">
              {{ isVerificationEmailProcessing ? 'Đang xử lý...' : 'Gửi lại email xác nhận' }}
            </button>
          </form>
          <p class="form-switcher">
            Quay lại <a href="#" id="showLoginFromVerification">Đăng nhập</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
/* Cập nhật CSS để giống với thiết kế trong ảnh */
.modal-content {
  background-color: white;
  border-radius: 8px;
  max-width: 500px;
  padding: 30px;
  position: relative;
}

.modal h2 {
  color: #48cae4;
  text-align: center;
  font-size: 28px;
  margin-bottom: 30px;
  font-weight: bold;
  border-bottom: 2px solid #48cae4;
  padding-bottom: 10px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.input-group input[type='text'],
.input-group input[type='email'],
.input-group input[type='password'] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.radio-group-container {
  margin-bottom: 15px;
}

.radio-group {
  display: flex;
  gap: 30px;
  margin-top: 5px;
}

.radio-option {
  display: flex;
  align-items: center;
}

.radio-option input[type='radio'] {
  margin-right: 5px;
}

.radio-option label {
  color: #2a7d4f;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #48cae4;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
  text-transform: uppercase;
}

.submit-btn:hover {
  background-color: #0096c7;
}

.form-switcher {
  text-align: center;
  margin-top: 20px;
}

.form-switcher a {
  color: #2a7d4f;
  text-decoration: none;
  font-weight: 500;
}

.form-error {
  color: red;
  font-size: 12px;
  margin-top: 4px;
}

.error-message {
  margin: 10px 0;
  font-size: 14px;
  text-align: center;
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
}

/* Thêm CSS cho user menu */
.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-weight: 500;
  color: #333;
}

.logout-btn {
  background-color: #48cae4;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #0096c7;
}

.form-links {
  margin-top: 15px;
}

.forgot-password {
  text-align: center;
  margin-bottom: 10px;
}

.forgot-password a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password a:hover {
  color: #2a7d4f;
  text-decoration: underline;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 8px 12px;
  margin: 10px 0;
  font-size: 14px;
}

/* Styling for auth buttons */
.auth-buttons .btn {
  border-radius: 20px;
  padding: 10px 20px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.login-btn {
  background-color: #fff;
  color: #48cae4;
  border: 2px solid #48cae4;
}

.login-btn:hover {
  background-color: #e6f7fb;
}

.signup-btn {
  background-color: #48cae4;
  color: #fff;
  border: 2px solid #48cae4;
}

.signup-btn:hover {
  background-color: #0096c7;
}

/* Logo styling */
.logo span {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #48cae4, #0077b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}

/* Import Google Font */
</style>
