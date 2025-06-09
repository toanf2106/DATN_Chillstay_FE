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
        <li><a href="#">Trang Chủ</a></li>
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
      </div>
    </div>
  </div>
</template>
