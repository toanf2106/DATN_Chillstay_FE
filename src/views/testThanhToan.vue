<template>
  <div class="test-payment-container">
    <h1>Test Thanh Toán</h1>
    <button @click="createPaymentLink" class="create-payment-btn">Tạo Link Thanh Toán</button>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading-indicator">Đang xử lý...</div>

    <!-- Modal hiển thị trang thanh toán -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <button @click="closeModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <iframe
            :src="paymentUrl"
            class="payment-iframe"
            allow="payment"
            ref="paymentIframe"
            @load="handleIframeLoad"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PaymentService from '../Service/PaymentService'

export default {
  name: 'TestThanhToan',
  data() {
    return {
      paymentUrl: null,
      orderCode: null,
      loading: false,
      error: null,
      showPaymentModal: false,
      checkingPaymentStatus: false,
    }
  },
  methods: {
    async createPaymentLink() {
      this.loading = true
      this.error = null

      try {
        // Gọi API để tạo link thanh toán qua PaymentService
        const result = await PaymentService.createFixedPaymentLink()

        console.log('Payment link response:', result)
        this.paymentUrl = result.checkoutUrl
        this.orderCode = result.orderCode

        // Mở modal khi có URL thanh toán
        this.showPaymentModal = true

        // Bắt đầu kiểm tra trạng thái thanh toán
        this.startCheckingPaymentStatus()
      } catch (error) {
        console.error('Lỗi khi tạo link thanh toán:', error)
        this.error = 'Không thể tạo link thanh toán. Vui lòng thử lại sau.'
      } finally {
        this.loading = false
      }
    },
    closeModal() {
      this.showPaymentModal = false
      this.stopCheckingPaymentStatus()
    },
    handleIframeLoad() {
      try {
        // Kiểm tra URL hiện tại của iframe
        const iframe = this.$refs.paymentIframe
        if (!iframe || !iframe.contentWindow) return

        // Thử lấy URL hiện tại của iframe
        // Lưu ý: Có thể gặp lỗi CORS nếu iframe từ domain khác
        const currentUrl = iframe.contentWindow.location.href
        console.log('Iframe URL changed:', currentUrl)

        // Kiểm tra nếu URL chứa các tham số thành công hoặc hủy
        if (
          currentUrl.includes('payment-success') ||
          currentUrl.includes('success=true') ||
          currentUrl.includes('status=success')
        ) {
          console.log('Payment successful, closing modal')
          this.showPaymentModal = false
        } else if (
          currentUrl.includes('payment-failure') ||
          currentUrl.includes('cancel=true') ||
          currentUrl.includes('status=cancel')
        ) {
          console.log('Payment cancelled, closing modal')
          this.showPaymentModal = false
        }
      } catch (e) {
        // Xử lý lỗi CORS - không thể truy cập URL của iframe từ domain khác
        console.log('Cannot access iframe URL due to CORS policy', e)
      }
    },
    startCheckingPaymentStatus() {
      if (!this.orderCode) return

      this.checkingPaymentStatus = true
      this.paymentStatusInterval = setInterval(async () => {
        if (!this.showPaymentModal) {
          this.stopCheckingPaymentStatus()
          return
        }

        try {
          // Kiểm tra trạng thái thanh toán từ API qua PaymentService
          const paymentInfo = await PaymentService.getPaymentInfo(this.orderCode)
          console.log('Payment status:', paymentInfo)

          // Nếu trạng thái là đã thanh toán hoặc đã hủy, đóng modal
          if (
            paymentInfo &&
            (paymentInfo.status === 'PAID' ||
              paymentInfo.status === 'CANCELLED' ||
              paymentInfo.status === 'FAILED')
          ) {
            console.log('Payment completed with status:', paymentInfo.status)
            this.showPaymentModal = false
            this.stopCheckingPaymentStatus()
          }
        } catch (error) {
          console.error('Error checking payment status:', error)
        }
      }, 2000) // Kiểm tra mỗi 2 giây
    },
    stopCheckingPaymentStatus() {
      if (this.paymentStatusInterval) {
        clearInterval(this.paymentStatusInterval)
        this.checkingPaymentStatus = false
      }
    },
  },
  beforeUnmount() {
    // Đảm bảo dừng interval khi component bị hủy
    this.stopCheckingPaymentStatus()
  },
}
</script>

<style scoped>
.test-payment-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.create-payment-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 20px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  width: 100%;
  max-width: 1150px;
  height: 80vh;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/*
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
} */

.close-button {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #000;
}

.modal-body {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.payment-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.error-message {
  color: #f44336;
  margin: 20px 0;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}

.loading-indicator {
  margin: 20px 0;
  font-style: italic;
  color: #666;
}
</style>
