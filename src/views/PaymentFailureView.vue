<template>
  <div class="payment-failure-container">
    <div class="failure-section">
      <div class="failure-icon">
        <i class="fas fa-times-circle"></i>
      </div>
      <h2>Thanh toán không thành công</h2>
      <p>Đã xảy ra sự cố trong quá trình thanh toán của bạn.</p>
      <p v-if="errorMessage" class="error-details">{{ errorMessage }}</p>

      <div class="options-section">
        <h3>Bạn có thể:</h3>
        <ul>
          <li>Thử lại với phương thức thanh toán khác</li>
          <li>Kiểm tra thông tin thẻ/tài khoản của bạn</li>
          <li>Liên hệ ngân hàng của bạn nếu tiền đã bị trừ</li>
          <li>Liên hệ với bộ phận hỗ trợ của chúng tôi</li>
        </ul>
      </div>

      <div class="action-buttons">
        <router-link to="/" class="btn btn-secondary">Về trang chủ</router-link>
        <button @click="goBack" class="btn btn-primary">Thử lại</button>
      </div>

      <div class="support-section">
        <p>Cần giúp đỡ? Liên hệ với chúng tôi</p>
        <p class="contact-info">
          <i class="fas fa-phone"></i> 0123.456.789 &nbsp;|&nbsp;
          <i class="fas fa-envelope"></i> support@chillstay.com
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentFailureView',
  data() {
    return {
      errorMessage: ''
    };
  },
  created() {
    // Lấy thông tin lỗi từ URL parameters nếu có
    const urlParams = new URLSearchParams(window.location.search);
    const errorCode = urlParams.get('errorCode');
    const errorMsg = urlParams.get('message');

    if (errorMsg) {
      this.errorMessage = errorMsg;
    } else if (errorCode) {
      // Ánh xạ mã lỗi thành thông báo nếu cần
      const errorMessages = {
        '01': 'Giao dịch bị từ chối bởi ngân hàng.',
        '02': 'Thông tin thẻ không hợp lệ.',
        '03': 'Tài khoản không đủ số dư.',
        '99': 'Lỗi không xác định.'
      };
      this.errorMessage = errorMessages[errorCode] || 'Có lỗi xảy ra trong quá trình thanh toán.';
    }
  },
  methods: {
    goBack() {
      window.history.go(-1);
    }
  }
}
</script>

<style scoped>
.payment-failure-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
}

.failure-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 600px;
}

.failure-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  color: #dc3545;
}

h2 {
  margin-bottom: 1rem;
  color: #333;
}

h3 {
  margin: 1.5rem 0 0.5rem 0;
  color: #444;
  font-size: 1.2rem;
}

p {
  color: #666;
  margin-bottom: 0.75rem;
}

.error-details {
  background-color: #f8d7da;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
  color: #721c24;
}

.options-section {
  text-align: left;
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.options-section ul {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.options-section li {
  margin-bottom: 0.5rem;
  color: #666;
}

.action-buttons {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #2a7d4f;
  color: white;
}

.btn-secondary {
  background-color: #e9ecef;
  color: #343a40;
}

.btn-primary:hover {
  background-color: #236b42;
}

.btn-secondary:hover {
  background-color: #dee2e6;
}

.support-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.contact-info {
  font-weight: bold;
  color: #2a7d4f;
}
</style>
