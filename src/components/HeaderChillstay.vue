<script setup>
import '@/Styles/JS/Header.js'
import '@/Styles/CSS/Header.css'
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
        <li><a href="#">Trang Chủ</a> </li>
        <li><a href="#">Bookings</a></li>
        <li><a href="#">Dịch Vụ</a></li>
        <li><a href="#">Tin Tức</a></li>
        <li><a href="#">Liên Hệ</a></li>
      </ul>
      <div class="auth-buttons">
        <button class="btn login-btn">Đăng Nhập</button>
        <button class="btn signup-btn">Đăng Ký</button>
      </div>
    </nav>
  </header>

  <!-- The Modal -->
  <div id="authModal" class="modal">
    <!-- Modal content -->
    <div class="modal-content">
      <span class="close-button">&times;</span>
      <div class="form-container">
        <!-- Login Form -->
        <div id="loginForm" class="auth-form">
          <h2>Login</h2>
          <form>
            <div class="input-group">
              <label for="loginEmail">Email</label>
              <input type="email" id="loginEmail" name="loginEmail" required />
            </div>
            <div class="input-group">
              <label for="loginPassword">Password</label>
              <input type="password" id="loginPassword" name="loginPassword" required />
            </div>
            <button type="submit" class="btn submit-btn">Login</button>
          </form>
          <p class="form-switcher">
            Don't have an account? <a href="#" id="showSignup">Sign Up</a>
          </p>
        </div>

        <!-- Signup Form -->
        <div id="signupForm" class="auth-form" style="display: none">
          <h2>Sign Up</h2>
          <form>
            <div class="input-group">
              <label for="signupName">Full Name</label>
              <input type="text" id="signupName" name="signupName" required />
            </div>
            <div class="input-group">
              <label for="signupEmail">Email</label>
              <input type="email" id="signupEmail" name="signupEmail" required />
            </div>
            <div class="input-group">
              <label for="signupPassword">Password</label>
              <input type="password" id="signupPassword" name="signupPassword" required />
            </div>
            <div class="input-group">
              <label for="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required />
            </div>
            <button type="submit" class="btn submit-btn">Sign Up</button>
          </form>
          <p class="form-switcher">Already have an account? <a href="#" id="showLogin">Login</a></p>
        </div>

        <!-- Admin Login Form -->
        <div id="adminLoginForm" class="auth-form" style="display: none">
          <h2>Admin Login</h2>
          <form @submit.prevent="adminLogin">
            <div class="input-group">
              <label for="adminUsername">Username</label>
              <input type="text" id="adminUsername" v-model="adminUsername" required />
            </div>
            <div class="input-group">
              <label for="adminPassword">Password</label>
              <input type="password" id="adminPassword" v-model="adminPassword" required />
            </div>
            <button type="submit" class="btn submit-btn">Login as Admin</button>
          </form>
          <p class="form-switcher">
            Not an admin? <a href="#" id="showLogin">Back to User Login</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      adminUsername: '',
      adminPassword: '',
    }
  },
  methods: {
    adminLogin() {
      // Xác thực đăng nhập admin
      if (this.adminUsername === 'admin' && this.adminPassword === 'admin123') {
        // Lưu trạng thái đăng nhập vào localStorage
        localStorage.setItem('isAdmin', 'true')

        // Đóng modal
        document.getElementById('authModal').style.display = 'none'

        alert('Admin login successful!')
        // Chuyển hướng đến trang admin
        window.location.href = '/admin-dashboard'
      } else {
        alert('Invalid admin credentials')
      }
    },
  },
  mounted() {
    // Lấy các phần tử DOM
    const modal = document.getElementById('authModal')
    const loginForm = document.getElementById('loginForm')
    const signupForm = document.getElementById('signupForm')
    const adminForm = document.getElementById('adminLoginForm')
    const loginBtn = document.querySelector('.login-btn')
    const signupBtn = document.querySelector('.signup-btn')
    const closeBtn = document.querySelector('.close-button')
    const showSignupLink = document.getElementById('showSignup')
    const showLoginLink = document.getElementById('showLogin')

    // Thêm link để chuyển đến form admin
    const loginFormElement = document.getElementById('loginForm')
    if (loginFormElement) {
      const adminLink = document.createElement('p')
      adminLink.className = 'form-switcher'
      adminLink.innerHTML = '<a href="#" id="showAdmin">Admin Login</a>'
      loginFormElement.appendChild(adminLink)

      // Thêm event listener cho admin link
      document.getElementById('showAdmin').addEventListener('click', function (e) {
        e.preventDefault()
        loginForm.style.display = 'none'
        signupForm.style.display = 'none'
        adminForm.style.display = 'block'
      })
    }

    // Hiển thị modal khi nhấn nút đăng nhập
    loginBtn.addEventListener('click', function () {
      modal.style.display = 'block'
      loginForm.style.display = 'block'
      signupForm.style.display = 'none'
      adminForm.style.display = 'none'
    })

    // Hiển thị modal khi nhấn nút đăng ký
    signupBtn.addEventListener('click', function () {
      modal.style.display = 'block'
      loginForm.style.display = 'none'
      signupForm.style.display = 'block'
      adminForm.style.display = 'none'
    })

    // Đóng modal khi nhấn nút đóng
    closeBtn.addEventListener('click', function () {
      modal.style.display = 'none'
    })

    // Chuyển đổi giữa form đăng nhập và đăng ký
    showSignupLink.addEventListener('click', function (e) {
      e.preventDefault()
      loginForm.style.display = 'none'
      signupForm.style.display = 'block'
      adminForm.style.display = 'none'
    })

    showLoginLink.addEventListener('click', function (e) {
      e.preventDefault()
      loginForm.style.display = 'block'
      signupForm.style.display = 'none'
      adminForm.style.display = 'none'
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
