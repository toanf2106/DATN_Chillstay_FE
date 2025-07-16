<script setup>
import { ref, onMounted,  } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { forgotPassword, resetPassword, checkResetToken } from '@/Service/authService';
import notification from '@/utils/notification';

defineOptions({
  name: 'ForgotPasswordForm'
});

// Các biến cho form quên mật khẩu
const email = ref('');
const emailError = ref('');
const emailSuccess = ref('');
const isEmailProcessing = ref(false);

// Các biến cho form đặt lại mật khẩu
const token = ref('');
const matKhauMoi = ref('');
const xacNhanMatKhau = ref('');
const matKhauError = ref('');
const matKhauSuccess = ref('');
const isResetProcessing = ref(false);

// Hiển thị mật khẩu
const matKhauVisible = ref(false);
const xacNhanMatKhauVisible = ref(false);

const route = useRoute();
const router = useRouter();

onMounted(() => {
  // Kiểm tra xem có token trong URL không
  if (route.query.token) {
    token.value = route.query.token;

    // Kiểm tra token có hợp lệ không
    checkResetToken(token.value)
      .then(response => {
        if (!response.data.valid) {
          matKhauError.value = 'Token không hợp lệ hoặc đã hết hạn';
          notification.error('Token không hợp lệ hoặc đã hết hạn', {
            position: 'top-right',
            duration: 5000
          });
          router.push('/quen-mat-khau');
        }
      })
      .catch(error => {
        console.error('Lỗi kiểm tra token:', error);
        matKhauError.value = 'Không thể xác thực token';
        notification.error('Không thể xác thực token', {
          position: 'top-right',
          duration: 5000
        });
        router.push('/quen-mat-khau');
      });
  }
});

// Hàm xử lý quên mật khẩu
async function handleForgotPassword() {
  try {
    // Reset thông báo
    emailError.value = '';
    emailSuccess.value = '';

    // Validate email
    if (!email.value) {
      emailError.value = 'Vui lòng nhập email của bạn';
      return;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.value)) {
      emailError.value = 'Email không hợp lệ';
      return;
    }

    isEmailProcessing.value = true;

    // Đảm bảo email được format đúng trước khi gửi đi
    const trimmedEmail = email.value.trim().toLowerCase();
    console.log('Đang gửi yêu cầu quên mật khẩu cho email (đã chuẩn hóa):', trimmedEmail);

    // Gọi API quên mật khẩu
    const response = await forgotPassword(trimmedEmail);
    console.log('Kết quả từ API:', response.data);

    emailSuccess.value = 'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu';
    notification.success('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu', {
      position: 'top-right',
      duration: 5000
    });

    // Reset form
    email.value = '';
  } catch (error) {
    console.error('Lỗi quên mật khẩu:', error);

    // Hiển thị message lỗi từ API nếu có
    if (error.response && error.response.data) {
      if (typeof error.response.data === 'string') {
        emailError.value = error.response.data;
      } else if (error.response.data.message) {
        emailError.value = error.response.data.message;
      } else {
        emailError.value = 'Có lỗi xảy ra khi xử lý yêu cầu';
      }
    } else {
      emailError.value = 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.';
    }

    notification.error(emailError.value, {
      position: 'top-right',
      duration: 5000
    });
  } finally {
    isEmailProcessing.value = false;
  }
}

// Hàm xử lý đặt lại mật khẩu
async function handleResetPassword() {
  try {
    // Reset thông báo
    matKhauError.value = '';
    matKhauSuccess.value = '';

    // Validate mật khẩu
    if (!matKhauMoi.value) {
      matKhauError.value = 'Vui lòng nhập mật khẩu mới';
      return;
    }

    // Kiểm tra độ dài mật khẩu (ít nhất 8 ký tự)
    if (matKhauMoi.value.length < 8) {
      matKhauError.value = 'Mật khẩu phải có ít nhất 8 ký tự';
      return;
    }

    // Kiểm tra mật khẩu xác nhận
    if (!xacNhanMatKhau.value) {
      matKhauError.value = 'Vui lòng xác nhận mật khẩu';
      return;
    }

    if (matKhauMoi.value !== xacNhanMatKhau.value) {
      matKhauError.value = 'Mật khẩu xác nhận không khớp';
      return;
    }

    isResetProcessing.value = true;

    // Gọi API đặt lại mật khẩu
    await resetPassword(token.value, matKhauMoi.value);

    matKhauSuccess.value = 'Đặt lại mật khẩu thành công';
    notification.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập', {
      position: 'top-right',
      duration: 5000
    });

    // Chuyển hướng về trang đăng nhập sau 2 giây
    setTimeout(() => {
      router.push('/');
    }, 2000);
  } catch (error) {
    console.error('Lỗi đặt lại mật khẩu:', error);
    matKhauError.value = error.response?.data || 'Token không hợp lệ hoặc đã hết hạn';
    notification.error(matKhauError.value, {
      position: 'top-right',
      duration: 5000
    });
  } finally {
    isResetProcessing.value = false;
  }
}

function toggleMatKhauVisibility() {
  matKhauVisible.value = !matKhauVisible.value;
}

function toggleXacNhanMatKhauVisibility() {
  xacNhanMatKhauVisible.value = !xacNhanMatKhauVisible.value;
}
</script>

<template>
  <div class="password-container">
    <!-- Form quên mật khẩu (hiển thị khi không có token) -->
    <div v-if="!token" class="forgot-password-container">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title text-center">Quên mật khẩu</h3>
          <p class="text-center text-muted mb-4">
            Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu
          </p>

          <form @submit.prevent="handleForgotPassword">
            <div class="form-group mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                id="email"
                v-model="email"
                class="form-control"
                placeholder="Nhập email của bạn"
                :disabled="isEmailProcessing"
              />
            </div>

            <div v-if="emailError" class="alert alert-danger mt-3">
              {{ emailError }}
            </div>

            <div v-if="emailSuccess" class="alert alert-success mt-3">
              {{ emailSuccess }}
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 mt-3"
              :disabled="isEmailProcessing"
            >
              <span v-if="isEmailProcessing" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEmailProcessing ? 'Đang xử lý...' : 'Gửi yêu cầu' }}
            </button>
          </form>

          <div class="text-center mt-3">
            <a href="#" @click.prevent="router.push('/')">Quay lại đăng nhập</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Form đặt lại mật khẩu (hiển thị khi có token) -->
    <div v-else class="reset-password-container">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title text-center">Đặt lại mật khẩu</h3>
          <p class="text-center text-muted mb-4">
            Nhập mật khẩu mới của bạn
          </p>

          <form @submit.prevent="handleResetPassword">
            <div class="form-group mb-3">
              <label for="matKhauMoi" class="form-label">Mật khẩu mới</label>
              <div class="password-input-container">
                <input
                  :type="matKhauVisible ? 'text' : 'password'"
                  id="matKhauMoi"
                  v-model="matKhauMoi"
                  class="form-control"
                  placeholder="Nhập mật khẩu mới"
                  :disabled="isResetProcessing"
                />
                <span class="password-toggle" @click="toggleMatKhauVisibility">
                  <i :class="matKhauVisible ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </span>
              </div>
            </div>

            <div class="form-group mb-3">
              <label for="xacNhanMatKhau" class="form-label">Xác nhận mật khẩu</label>
              <div class="password-input-container">
                <input
                  :type="xacNhanMatKhauVisible ? 'text' : 'password'"
                  id="xacNhanMatKhau"
                  v-model="xacNhanMatKhau"
                  class="form-control"
                  placeholder="Xác nhận mật khẩu mới"
                  :disabled="isResetProcessing"
                />
                <span class="password-toggle" @click="toggleXacNhanMatKhauVisibility">
                  <i :class="xacNhanMatKhauVisible ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </span>
              </div>
            </div>

            <div v-if="matKhauError" class="alert alert-danger mt-3">
              {{ matKhauError }}
            </div>

            <div v-if="matKhauSuccess" class="alert alert-success mt-3">
              {{ matKhauSuccess }}
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 mt-3"
              :disabled="isResetProcessing"
            >
              <span v-if="isResetProcessing" class="spinner-border spinner-border-sm me-2"></span>
              {{ isResetProcessing ? 'Đang xử lý...' : 'Đặt lại mật khẩu' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  background-color: #f8f9fa;
}

.card {
  width: 100%;
  max-width: 500px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.card-title {
  color: #2a7d4f;
  font-weight: bold;
  margin-bottom: 20px;
}

.form-control {
  padding: 12px;
  border-radius: 5px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}

.form-control:focus {
  border-color: #2a7d4f;
  box-shadow: 0 0 0 0.2rem rgba(42, 125, 79, 0.25);
}

.form-label {
  font-weight: 600;
  color: #333;
}

.btn-primary {
  background-color: #2a7d4f;
  border-color: #2a7d4f;
  font-weight: bold;
  padding: 12px;
  transition: all 0.3s;
}

.btn-primary:hover {
  background-color: #216b42;
  border-color: #216b42;
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

.password-toggle:hover {
  color: #2a7d4f;
}

a {
  color: #2a7d4f;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
