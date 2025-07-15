<template>
  <div class="test-payment-container">
    <h1>Test Thanh Toán</h1>
    <button @click="createPaymentLink" class="create-payment-btn">Tạo Link Thanh Toán</button>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading-indicator">Đang xử lý...</div>

    <div v-if="orderCode" class="payment-info">
      <h3>Thông tin thanh toán:</h3>
      <p><strong>Order Code:</strong> {{ orderCode }}</p>
      <p>
        <strong>Trạng thái:</strong>
        <span :class="'status-' + paymentStatus?.toLowerCase()">{{
          formatStatus(paymentStatus)
        }}</span>
        <span v-if="autoCheckingStatus" class="auto-checking">(Đang tự động cập nhật...)</span>
      </p>
      <button @click="checkPaymentStatus" class="check-status-btn" :disabled="checkingStatus">
        {{ checkingStatus ? 'Đang kiểm tra...' : 'Kiểm tra thủ công' }}
      </button>
    </div>

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
      paymentStatus: null,
      checkingStatus: false,
      autoCheckingStatus: false,
      statusCheckInterval: null,
    }
  },
  methods: {
    async createPaymentLink() {
      this.loading = true
      this.error = null
      this.paymentStatus = null
      this.stopAutoStatusCheck() // Dừng interval trước đó nếu có

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

        // Bắt đầu tự động kiểm tra trạng thái từ database
        this.startAutoStatusCheck()
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
      // Không dừng việc tự động kiểm tra trạng thái vì chúng ta vẫn muốn nó tiếp tục sau khi đóng modal
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
          // Kiểm tra trạng thái thanh toán sau khi thành công
          setTimeout(() => this.checkPaymentStatus(), 1000)
        } else if (
          currentUrl.includes('payment-failure') ||
          currentUrl.includes('cancel=true') ||
          currentUrl.includes('status=cancel')
        ) {
          console.log('Payment cancelled, closing modal')
          this.showPaymentModal = false
          // Kiểm tra trạng thái thanh toán sau khi hủy
          setTimeout(() => this.checkPaymentStatus(), 1000)
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
            // Cập nhật trạng thái thanh toán
            await this.checkPaymentStatus()
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
    // Bắt đầu tự động kiểm tra trạng thái từ database
    startAutoStatusCheck() {
      if (!this.orderCode) return

      this.autoCheckingStatus = true
      console.log('Bắt đầu tự động kiểm tra trạng thái thanh toán')

      // Kiểm tra ngay lập tức một lần
      this.checkPaymentStatus(false)

      // Thiết lập interval để kiểm tra mỗi 2 giây
      this.statusCheckInterval = setInterval(() => {
        this.checkPaymentStatus(false)
      }, 2000)
    },
    // Dừng tự động kiểm tra trạng thái
    stopAutoStatusCheck() {
      if (this.statusCheckInterval) {
        clearInterval(this.statusCheckInterval)
        this.statusCheckInterval = null
        this.autoCheckingStatus = false
        console.log('Đã dừng tự động kiểm tra trạng thái thanh toán')
      }
    },
    // Kiểm tra trạng thái thanh toán
    // showLoading: nếu true sẽ hiển thị trạng thái đang kiểm tra, false sẽ kiểm tra ngầm
    async checkPaymentStatus(showLoading = true) {
      if (!this.orderCode) return

      if (showLoading) {
        this.checkingStatus = true
      }
      this.error = null

      try {
        // Gọi API để kiểm tra trạng thái thanh toán thủ công
        const response = await PaymentService.checkPaymentStatus(this.orderCode)
        console.log('Manual payment status check:', response)

        // Gọi API để lấy thông tin thanh toán từ database
        const dbStatus = await PaymentService.getPaymentStatusFromDB(this.orderCode)
        console.log('DB payment status:', dbStatus)

        if (dbStatus && dbStatus.data) {
          this.paymentStatus = dbStatus.data.trangThai

          // Nếu trạng thái là trạng thái cuối cùng (ThanhCong hoặc ThatBai), dừng việc tự động kiểm tra
          if (this.paymentStatus === 'ThanhCong' || this.paymentStatus === 'ThatBai') {
            this.stopAutoStatusCheck()
          }
        } else {
          this.paymentStatus = 'UNKNOWN'
        }
      } catch (error) {
        console.error('Error checking payment status manually:', error)
        if (showLoading) {
          this.error = 'Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại sau.'
        }
      } finally {
        if (showLoading) {
          this.checkingStatus = false
        }
      }
    },
    formatStatus(status) {
      const statusMap = {
        DangCho: 'Đang chờ thanh toán',
        ThanhCong: 'Thanh toán thành công',
        ThatBai: 'Thanh toán thất bại',
        KhongXacDinh: 'Không xác định',
        UNKNOWN: 'Không có thông tin',
      }

      return statusMap[status] || status
    },
  },
  beforeUnmount() {
    // Đảm bảo dừng tất cả các interval khi component bị hủy
    this.stopCheckingPaymentStatus()
    this.stopAutoStatusCheck()
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

.check-status-btn {
  background-color: #2196f3;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.check-status-btn:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

.payment-info {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  border-left: 4px solid #2196f3;
}

/* Trạng thái thanh toán */
.status-dangcho {
  color: #ff9800;
  font-weight: bold;
}

.status-thanhcong {
  color: #4caf50;
  font-weight: bold;
}

.status-thatbai {
  color: #f44336;
  font-weight: bold;
}

.status-khongxacdinh,
.status-unknown {
  color: #9e9e9e;
  font-style: italic;
}

.auto-checking {
  color: #2196f3;
  font-size: 0.9em;
  margin-left: 8px;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
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
