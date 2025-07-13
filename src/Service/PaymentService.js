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

  // Tạo link thanh toán cho đơn đặt home
  async createDatHomePaymentLink(datHomeId) {
    try {
      const response = await api.post(`/api/payment/create-dathome-link/${datHomeId}`)
      return response.data
    } catch (error) {
      console.error(`Error creating payment link for dat home ${datHomeId}:`, error)
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
}

export default new PaymentService()
