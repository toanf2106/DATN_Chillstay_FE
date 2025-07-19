import api from '../utils/api'

class PaymentService {
  // Tạo link thanh toán với số tiền cố định (dùng cho test)
  async createFixedPaymentLink() {
    try {
      const response = await api.post('/api/payment/create-fixed-link')
      return response.data
    } catch (error) {
      console.error('Error creating fixed payment link:', error)
      throw error
    }
  }

  // Tạo link thanh toán cho đơn đặt homestay
  async createPaymentLink(datHomeData) {
    try {
      // Gọi API tạo link thanh toán với dữ liệu đặt homestay và loại thanh toán
      const response = await api.post('/api/payment/create-dathome-payment', datHomeData, {
        params: {
          paymentMethod: datHomeData.paymentType // 'Coc' hoặc 'ThanhToanToanBo'
        }
      })
      return response
    } catch (error) {
      console.error('Lỗi khi tạo link thanh toán:', error)
      throw error
    }
  }

  // Tạo link thanh toán cho số tiền còn lại
  async createPaymentRemaining(amount, idDatHome) {
    try {
      const response = await api.post('/api/payment/create-payment-remaining', null, {
        params: {
          amount: amount,
          idDatHome: idDatHome
        }
      })
      return response.data
    } catch (error) {
      console.error('Lỗi khi tạo link thanh toán số tiền còn lại:', error)
      throw error
    }
  }

  // Lấy thông tin thanh toán dựa trên orderCode
  async getPaymentInfo(orderCode) {
    try {
      const response = await api.get(`/api/payment/info/${orderCode}`)
      return response.data
    } catch (error) {
      console.error(`Error getting payment info for order ${orderCode}:`, error)
      throw error
    }
  }

  // Hủy link thanh toán
  async cancelPaymentLink(orderCode, reason = '') {
    try {
      const response = await api.delete(`/api/payment/cancel-link/${orderCode}`, {
        params: { reason }
      })
      return response.data
    } catch (error) {
      console.error(`Error cancelling payment link for order ${orderCode}:`, error)
      throw error
    }
  }

  // Kiểm tra trạng thái thanh toán thủ công (thay thế webhook)
  async checkPaymentStatus(orderCode, isUserCancelled = false) {
    try {
      // Thêm tham số isUserCancelled để thông báo nếu người dùng đã hủy
      const response = await api.post(`/api/payment/check-status/${orderCode}`, {
        isUserCancelled: isUserCancelled
      })
      return response.data
    } catch (error) {
      console.error(`Lỗi khi kiểm tra trạng thái thanh toán cho đơn ${orderCode}:`, error)
      throw error
    }
  }

  // Lấy thông tin thanh toán từ database (để hiển thị trạng thái cập nhật)
  async getPaymentStatusFromDB(orderCode, signal) {
    try {
      const response = await api.get(`/api/payment/status/${orderCode}`, {
        signal: signal // Thêm signal để có thể hủy request
      })
      return response
    } catch (error) {
      console.error(`Lỗi khi lấy trạng thái thanh toán từ database cho đơn hàng ${orderCode}:`, error)
      throw error
    }
  }
}

export default new PaymentService()
