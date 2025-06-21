<script setup>
import '@/Styles/JS/Header.js'
import '@/Styles/CSS/Header.css'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import notification from '@/utils/notification'
import { useAuthStore } from '@/stores/authStore'

const loginUsername = ref('')
const loginPassword = ref('')
const loginError = ref('')
const router = useRouter()
const authStore = useAuthStore()

// Sử dụng computed properties để lấy dữ liệu từ store
const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentUser = computed(() => authStore.user)

const passwordVisible = ref(false)
const signupPasswordVisible = ref(false)
const confirmPasswordVisible = ref(false)

function setupModalListeners() {
  // Lấy các phần tử DOM
  const modal = document.getElementById('authModal')
  const loginForm = document.getElementById('loginForm')
  const signupForm = document.getElementById('signupForm')
  const loginBtn = document.querySelector('.login-btn')
  const signupBtn = document.querySelector('.signup-btn')
  const closeBtn = document.querySelector('.close-button')
  const showSignupLink = document.getElementById('showSignup')
  const showLoginLink = document.getElementById('showLogin')

  // Function để reset form
  function resetForms() {
    resetLoginForm()
    // Reset signup form
    if (signupForm.querySelector('form')) {
      signupForm.querySelector('form').reset()
    }
  }

  if (loginBtn) {
    // Hiển thị modal khi nhấn nút đăng nhập
    loginBtn.addEventListener('click', function () {
      resetForms() // Reset form trước khi hiển thị
      modal.style.display = 'block'
      loginForm.style.display = 'block'
      signupForm.style.display = 'none'
      loginForm.classList.add('form-active')
      signupForm.classList.remove('form-active')
    })
  }

  if (signupBtn) {
    // Hiển thị modal khi nhấn nút đăng ký
    signupBtn.addEventListener('click', function () {
      resetForms() // Reset form trước khi hiển thị
      modal.style.display = 'block'
      loginForm.style.display = 'none'
      signupForm.style.display = 'block'
      signupForm.classList.add('form-active')
      loginForm.classList.remove('form-active')
    })
  }

  // Đóng modal khi nhấn nút đóng
  closeBtn.addEventListener('click', function () {
    modal.style.display = 'none'
    resetForms() // Reset form khi đóng modal
  })

  // Chuyển đổi giữa form đăng nhập và đăng ký
  showSignupLink.addEventListener('click', function (e) {
    e.preventDefault()
    resetForms() // Reset form khi chuyển đổi
    loginForm.style.display = 'none'
    signupForm.style.display = 'block'
    signupForm.classList.add('form-active')
    loginForm.classList.remove('form-active')
  })

  showLoginLink.addEventListener('click', function (e) {
    e.preventDefault()
    resetForms() // Reset form khi chuyển đổi
    loginForm.style.display = 'block'
    signupForm.style.display = 'none'
    loginForm.classList.add('form-active')
    signupForm.classList.remove('form-active')
  })

  // Đóng modal khi nhấn bên ngoài
  window.addEventListener('click', function (event) {
    if (event.target == modal) {
      modal.style.display = 'none'
      resetForms() // Reset form khi đóng modal
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

async function handleLogin() {
  try {
    // Đánh dấu đang trong quá trình đăng nhập để ngăn đóng modal
    window.isLoginProcessing = true

    // Hiển thị trạng thái loading
    const submitBtn = document.querySelector('#loginForm .submit-btn')
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Đang xử lý...'
    submitBtn.disabled = true

    loginError.value = ''
    console.log('Đang đăng nhập với:', loginUsername.value)

    // Sử dụng authStore để đăng nhập
    const result = await authStore.login(loginUsername.value, loginPassword.value)

    if (!result.success) {
      throw new Error('Đăng nhập thất bại')
    }

    // Gỡ bỏ sự kiện onclick để tránh xung đột
    const closeBtn = document.querySelector('.close-button')
    if (closeBtn) {
      closeBtn.onclick = null
    }

    // Tạm thời vô hiệu hóa window.onclick
    window.onclick = null

    // Đóng modal sử dụng hàm closeModal trong Header.js (tránh animation conflict)
    const modal = document.getElementById('authModal')
    modal.classList.remove('modal-active')

    // Đợi animation hoàn tất rồi mới ẩn modal
    setTimeout(() => {
      modal.style.display = 'none'
      // Xóa class active khỏi forms
      document.getElementById('loginForm').classList.remove('form-active')
      document.getElementById('signupForm').classList.remove('form-active')

      // Reset form sau khi đăng nhập thành công
      resetLoginForm()

      // Hủy cờ đang xử lý đăng nhập
      window.isLoginProcessing = false

      // Hiển thị thông báo đăng nhập thành công
      notification.success('Đăng nhập thành công!', {
        position: 'top-right',
        duration: 3000,
      })

      // Kiểm tra loại tài khoản và chuyển hướng
      const userData = result.userData
      if (userData.accountTypeId === 1 || userData.accountTypeId === 2) {
        // Nếu là nhân viên hoặc admin
        console.log('Đăng nhập thành công với quyền admin/nhân viên')
        router.push('/admin')
      } else {
        // Nếu là khách hàng
        console.log('Đăng nhập thành công với quyền khách hàng')
        router.push('/')
      }

      // Khôi phục các event handlers sau khi đã xử lý xong
      setupModalListeners()
    }, 300)
  } catch (e) {
    console.error('Lỗi đăng nhập:', e)
    loginError.value = 'Sai tài khoản hoặc mật khẩu!'
    notification.error('Sai tài khoản hoặc mật khẩu!', {
      position: 'top-right',
      duration: 5000,
    })

    // Hủy cờ đang xử lý đăng nhập
    window.isLoginProcessing = false

    // Khôi phục nút submit
    const submitBtn = document.querySelector('#loginForm .submit-btn')
    submitBtn.innerHTML = 'Đăng nhập'
    submitBtn.disabled = false

    // Bảo đảm modal vẫn hiển thị
    const modal = document.getElementById('authModal')
    if (modal) {
      modal.style.display = 'block'
      modal.classList.add('modal-active')
      document.getElementById('loginForm').classList.add('form-active')
    }
  }
}

function handleLogout() {
  // Sử dụng authStore để đăng xuất
  authStore.logout()

  // Thông báo đăng xuất thành công
  notification.success('Đăng xuất thành công!', {
    position: 'top-right',
    duration: 3000,
  })

  // Đợi 1 giây sau đó làm mới trang
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}
</script>
<template>
  <header>
    <nav class="navbar">
      <div class="logo">
        <a href="#"
          ><img src="@/assets/icon/chillLogo.png" alt="Chillstay Logo" /><span>Chillstay</span></a
        >
      </div>
      <ul class="nav-links">
        <li><a href="#">Trang Chủ</a></li>
        <li><a href="#">Bookings</a></li>
        <li><a href="#">Dịch Vụ</a></li>
        <li><a href="#">Tin Tức</a></li>
        <li><a href="#">Giảm Giá</a></li>
      </ul>

      <!-- Hiển thị nút đăng nhập/đăng ký khi chưa đăng nhập -->
      <div class="auth-buttons" v-if="!isLoggedIn">
        <button class="btn login-btn">Đăng Nhập</button>
        <button class="btn signup-btn">Đăng Ký</button>
      </div>

      <!-- Hiển thị tên người dùng và nút đăng xuất khi đã đăng nhập -->
      <div class="user-menu" v-else>
        <span class="username">Xin chào, {{ currentUser.username }}</span>
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
            <div v-if="loginError" style="color: red">{{ loginError }}</div>
          </form>
          <p class="form-switcher">Chưa có tài khoản? <a href="#" id="showSignup">Đăng ký</a></p>
        </div>

        <!-- Signup Form -->
        <div id="signupForm" class="auth-form" style="display: none">
          <h2>Đăng ký</h2>
          <form>
            <div class="input-group">
              <label for="signupUsername">Tên đăng nhập</label>
              <input type="text" id="signupUsername" name="signupUsername" required />
            </div>
            <div class="input-group">
              <label for="signupEmail">Email</label>
              <input type="email" id="signupEmail" name="signupEmail" required />
            </div>
            <div class="input-group">
              <label for="signupPassword">Mật khẩu</label>
              <div class="password-input-container">
                <input
                  :type="signupPasswordVisible ? 'text' : 'password'"
                  id="signupPassword"
                  name="signupPassword"
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
              <label for="confirmPassword">Xác nhận mật khẩu</label>
              <div class="password-input-container">
                <input
                  :type="confirmPasswordVisible ? 'text' : 'password'"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                />
                <span class="password-toggle" @click="toggleConfirmPasswordVisibility">
                  <font-awesome-icon
                    :icon="confirmPasswordVisible ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'"
                  />
                </span>
              </div>
            </div>
            <button type="submit" class="btn submit-btn">Đăng ký</button>
          </form>
          <p class="form-switcher">Đã có tài khoản? <a href="#" id="showLogin">Đăng nhập</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #ff1a1a;
}
</style>
