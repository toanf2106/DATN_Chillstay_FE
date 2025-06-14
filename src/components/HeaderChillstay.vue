<script setup>
import '@/Styles/JS/Header.js'
import '@/Styles/CSS/Header.css'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/Service/authService.js'
import notification from '@/utils/notification'

const loginUsername = ref('')
const loginPassword = ref('')
const loginError = ref('')
const router = useRouter()
const isLoggedIn = ref(false)
const currentUser = ref(null)

// Kiểm tra trạng thái đăng nhập khi component được tạo
onMounted(() => {
  checkLoginStatus()
})

function checkLoginStatus() {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    currentUser.value = JSON.parse(userStr)
    isLoggedIn.value = true
  } else {
    isLoggedIn.value = false
    currentUser.value = null
  }
}

async function handleLogin() {
  try {
    loginError.value = ''
    console.log('Đang đăng nhập với:', loginUsername.value)

    // Gọi API đăng nhập
    const res = await login(loginUsername.value, loginPassword.value)
    console.log('Kết quả đăng nhập:', res.data)

    const userData = res.data
    const token = userData.token

    // Lưu thông tin vào localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))

    // Cập nhật trạng thái đăng nhập
    currentUser.value = userData
    isLoggedIn.value = true

    // Đóng modal
    document.getElementById('authModal').style.display = 'none'

    // Hiển thị thông báo đăng nhập thành công
    notification.success('Đăng nhập thành công!', {
      position: 'top-right',
      duration: 3000,
    })

    // Kiểm tra loại tài khoản
    if (userData.accountTypeId === 1 || userData.accountTypeId === 2) {
      // Nếu là nhân viên hoặc admin
      console.log('Đăng nhập thành công với quyền admin/nhân viên')
      localStorage.setItem('isAdmin', 'true')
      router.push('/admin')
    } else {
      // Nếu là khách hàng
      console.log('Đăng nhập thành công với quyền khách hàng')
      router.push('/')
    }
  } catch (e) {
    console.error('Lỗi đăng nhập:', e)
    loginError.value = 'Sai tài khoản hoặc mật khẩu!'
    notification.error('Sai tài khoản hoặc mật khẩu!', {
      position: 'top-right',
      duration: 5000,
    })
  }
}

function handleLogout() {
  // Hiển thị confirm dialog
  notification
    .confirm({
      message: 'Bạn có chắc chắn muốn đăng xuất?',
    })
    .then((confirmed) => {
      if (confirmed) {
        // Xóa dữ liệu từ localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('isAdmin')

        // Cập nhật trạng thái đăng nhập
        isLoggedIn.value = false
        currentUser.value = null

        // Chuyển về trang chủ
        router.push('/')

        // Thông báo đăng xuất thành công
        notification.success('Đăng xuất thành công!', {
          position: 'top-right',
          duration: 3000,
        })
      }
    })
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
          <h2>Login</h2>
          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <label for="loginUsername">Tên đăng nhập</label>
              <input type="text" id="loginUsername" v-model="loginUsername" required />
            </div>
            <div class="input-group">
              <label for="loginPassword">Mật khẩu</label>
              <input type="password" id="loginPassword" v-model="loginPassword" required />
            </div>
            <button type="submit" class="btn submit-btn">Đăng nhập</button>
            <div v-if="loginError" style="color: red">{{ loginError }}</div>
          </form>
          <p class="form-switcher">Chưa có tài khoản? <a href="#" id="showSignup">Đăng ký</a></p>
        </div>

        <!-- Signup Form -->
        <div id="signupForm" class="auth-form" style="display: none">
          <h2>Sign Up</h2>
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
              <input type="password" id="signupPassword" name="signupPassword" required />
            </div>
            <div class="input-group">
              <label for="confirmPassword">Xác nhận mật khẩu</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required />
            </div>
            <button type="submit" class="btn submit-btn">Đăng ký</button>
          </form>
          <p class="form-switcher">Đã có tài khoản? <a href="#" id="showLogin">Đăng nhập</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    // Lấy các phần tử DOM
    const modal = document.getElementById('authModal')
    const loginForm = document.getElementById('loginForm')
    const signupForm = document.getElementById('signupForm')
    const loginBtn = document.querySelector('.login-btn')
    const signupBtn = document.querySelector('.signup-btn')
    const closeBtn = document.querySelector('.close-button')
    const showSignupLink = document.getElementById('showSignup')
    const showLoginLink = document.getElementById('showLogin')

    if (loginBtn) {
      // Hiển thị modal khi nhấn nút đăng nhập
      loginBtn.addEventListener('click', function () {
        modal.style.display = 'block'
        loginForm.style.display = 'block'
        signupForm.style.display = 'none'
      })
    }

    if (signupBtn) {
      // Hiển thị modal khi nhấn nút đăng ký
      signupBtn.addEventListener('click', function () {
        modal.style.display = 'block'
        loginForm.style.display = 'none'
        signupForm.style.display = 'block'
      })
    }

    // Đóng modal khi nhấn nút đóng
    closeBtn.addEventListener('click', function () {
      modal.style.display = 'none'
    })

    // Chuyển đổi giữa form đăng nhập và đăng ký
    showSignupLink.addEventListener('click', function (e) {
      e.preventDefault()
      loginForm.style.display = 'none'
      signupForm.style.display = 'block'
    })

    showLoginLink.addEventListener('click', function (e) {
      e.preventDefault()
      loginForm.style.display = 'block'
      signupForm.style.display = 'none'
    })

    // Đóng modal khi nhấn bên ngoài
    window.addEventListener('click', function (event) {
      if (event.target == modal) {
        modal.style.display = 'none'
      }
    })
  },
}
</script>

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
