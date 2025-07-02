<template>
  <div class="confirmation-container">
    <div class="confirmation-card">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang xác nhận tài khoản của bạn...</p>
      </div>

      <div v-else-if="confirmed" class="success">
        <div class="success-icon">✓</div>
        <h2>Xác nhận thành công!</h2>
        <p>Tài khoản của bạn đã được xác nhận và kích hoạt thành công.</p>
        <p>Bây giờ bạn có thể đăng nhập và bắt đầu sử dụng dịch vụ của chúng tôi.</p>
        <router-link to="/" class="btn login-btn">
          Đăng nhập ngay
        </router-link>
      </div>

      <div v-else class="error">
        <div class="error-icon">✕</div>
        <h2>Xác nhận thất bại</h2>
        <p>{{ errorMessage }}</p>
        <p v-if="detailError">Chi tiết: {{ detailError }}</p>
        <p>Vui lòng thử lại hoặc liên hệ với bộ phận hỗ trợ.</p>
        <router-link to="/" class="btn home-btn">
          Về trang chủ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api';
import notification from '@/utils/notification';

const route = useRoute();
const loading = ref(true);
const confirmed = ref(false);
const errorMessage = ref('Có lỗi xảy ra trong quá trình xác nhận tài khoản');
const detailError = ref('');

onMounted(async () => {
  try {
    // Lấy token từ URL
    const token = route.query.token;

    if (!token) {
      loading.value = false;
      errorMessage.value = 'Token xác nhận không hợp lệ';
      return;
    }

    // Gọi API xác nhận tài khoản với token
    const response = await api.get(`/api/xac-nhan-tai-khoan?token=${token}`);

    if (response.data && response.data.confirmed) {
      confirmed.value = true;
      notification.success('Xác nhận tài khoản thành công!', {
        position: 'top-center',
        duration: 5000
      });
    } else {
      errorMessage.value = 'Xác nhận tài khoản thất bại';
      if (response.data && response.data.message) {
        detailError.value = response.data.message;
      }
    }
  } catch (error) {
    if (error.response) {
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage.value = error.response.data;
        } else if (error.response.data.message) {
          errorMessage.value = error.response.data.message;
        } else {
          errorMessage.value = 'Xác nhận tài khoản thất bại';
        }

        detailError.value = `Mã lỗi: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage.value = 'Không thể kết nối đến máy chủ';
      detailError.value = 'Vui lòng kiểm tra kết nối mạng của bạn';
    } else {
      errorMessage.value = 'Có lỗi xảy ra khi xác nhận tài khoản';
      detailError.value = error.message;
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.confirmation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  background-color: #f8f9fa;
}

.confirmation-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.loading, .success, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2a7d4f;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-icon, .error-icon {
  font-size: 64px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.success-icon {
  background-color: #d4edda;
  color: #2a7d4f;
}

.error-icon {
  background-color: #f8d7da;
  color: #dc3545;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

p {
  color: #666;
  line-height: 1.5;
  margin-bottom: 10px;
}

.btn {
  display: inline-block;
  background-color: #2a7d4f;
  color: white;
  padding: 12px 24px;
  margin-top: 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #236b42;
}

.home-btn {
  background-color: #6c757d;
}

.home-btn:hover {
  background-color: #5a6268;
}
</style>
