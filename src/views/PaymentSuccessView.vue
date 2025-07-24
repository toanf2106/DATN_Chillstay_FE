<template>
  <div class="payment-success-container">
    <div v-if="loading" class="loading-section">
      <div class="spinner"></div>
      <h2>Đang xử lý thanh toán của bạn...</h2>
      <p>Vui lòng không đóng trang này.</p>
    </div>

    <div v-else-if="error" class="error-section">
      <div class="error-icon">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <h2>Có lỗi xảy ra</h2>
      <p>{{ errorMessage }}</p>
      <div class="action-buttons">
        <router-link to="/" class="btn btn-primary">Về trang chủ</router-link>
      </div>
    </div>

    <div v-else class="success-section">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <h2>Thanh toán thành công!</h2>
      <p>Đơn đặt homestay của bạn đã được xác nhận.</p>

      <p>Mã thanh toán: <strong>{{ transactionId }}</strong></p>

      <p class="email-note">Chúng tôi đã gửi email xác nhận đặt phòng đến địa chỉ email của bạn.</p>

      <div class="action-buttons">
        <router-link to="/account" class="btn btn-secondary">Xem đơn đặt phòng</router-link>
        <router-link to="/" class="btn btn-primary">Về trang chủ</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import PaymentService from '@/Service/PaymentService'

export default {
  name: 'PaymentSuccessView',
  data() {
    return {
      loading: true,
      error: false,
      errorMessage: '',
      orderCode: '',
      transactionId: '',
      paymentData: null,
    }
  },
  async created() {
    try {
      // Lấy thông tin từ URL
      const urlParams = new URLSearchParams(window.location.search)
      this.orderCode = urlParams.get('orderCode') || ''

      // Xử lý các trường khác từ URL
      let status = urlParams.get('status') || ''
      let amount = urlParams.get('amount') || ''

      // Tìm mã giao dịch từ nhiều nguồn khác nhau (tùy thuộc vào cổng thanh toán)
      // VNPay
      let transactionId = urlParams.get('vnp_TransactionNo') || urlParams.get('vnp_TxnRef')

      // PayOS hoặc các cổng thanh toán khác
      if (!transactionId) {
        transactionId =
          urlParams.get('transactionId') ||
          urlParams.get('transaction_id') ||
          urlParams.get('paymentId') ||
          urlParams.get('payment_id')
      }

      // Đảm bảo rằng nếu không có mã giao dịch, chúng ta vẫn tạo một mã để hiển thị
      if (!transactionId) {

        transactionId = Date.now();

      }

      // Đảm bảo số tiền là số
      let amountValue = amount
      try {
        if (amount && !isNaN(parseFloat(amount))) {
          amountValue = parseFloat(amount)
        }
      } catch (e) {
        console.error('Lỗi khi xử lý số tiền:', e)
      }

      // Tạo đối tượng dữ liệu thanh toán
      this.paymentData = {
        orderCode: this.orderCode,
        status: status,
        code: status, // Để tương thích với cả hai kiểu API
        amount: amountValue,
        transactionId: transactionId,
      }

      console.log('Payment data:', this.paymentData)

      // Chỉ gửi thông tin khi có orderCode
      if (this.orderCode) {
        // Gửi thông báo đến backend để cập nhật trạng thái và gửi email
        const response = await PaymentService.notifyPaymentSuccess(this.paymentData)
        console.log('Payment notification sent:', response)

        // Cập nhật thông tin từ response nếu có
        if (response && response.transactionId) {
          this.transactionId = response.transactionId
        } else {
          this.transactionId = transactionId
        }
      } else {
        console.warn('No orderCode found in URL params')
      }

      this.loading = false
    } catch (error) {
      console.error('Error processing payment success:', error)
      this.loading = false
      this.error = true
      this.errorMessage = 'Không thể xác nhận thanh toán. Vui lòng liên hệ bộ phận hỗ trợ.'
    }
  },
}
</script>

<style scoped>
.payment-success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
}

.loading-section,
.success-section,
.error-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 600px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #2a7d4f;
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.success-icon,
.error-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.success-icon {
  color: #2a7d4f;
}

.error-icon {
  color: #dc3545;
}

h2 {
  margin-bottom: 1rem;
  color: #333;
}

p {
  color: #666;
  margin-bottom: 0.75rem;
}

.email-note {
  background-color: #e8f5e9;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1.5rem 0;
  color: #2a7d4f;
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
</style>
