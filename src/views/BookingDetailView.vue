<template>
  <div class="booking-detail-view">
    <div v-if="isLoading" class="loading-container">
      <div class="loader"></div>
      <p>Đang tải chi tiết đặt phòng...</p>
    </div>
    <div v-else-if="!booking" class="error-container">
      <p>Không tìm thấy thông tin đặt phòng.</p>
    </div>
    <div v-else class="booking-content">
      <h2 class="page-title">Chi tiết đặt phòng</h2>
      <div class="booking-card">
        <div class="card-header">
          <h3>{{ booking.tenHomestay }}</h3>
          <span class="status" :class="getStatusClass(booking.trangThai)">
            {{ getStatusLabel(booking.trangThai) }}
          </span>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Mã đặt phòng:</span>
              <span class="value">{{ booking.maDatHome }}</span>
            </div>
            <div class="info-item">
              <span class="label">Ngày đặt:</span>
              <span class="value">{{ formatDate(booking.ngayDat) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Ngày nhận phòng:</span>
              <span class="value">{{ formatDate(booking.ngayNhanPhong) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Ngày trả phòng:</span>
              <span class="value">{{ formatDate(booking.ngayTraPhong) }}</span>
            </div>
          </div>
          <hr />
          <div class="info-grid">
             <div class="info-item">
              <span class="label">Tên khách hàng:</span>
              <span class="value">{{ booking.tenKhachHang }}</span>
            </div>
            <div class="info-item">
              <span class="label">Số điện thoại:</span>
              <span class="value">{{ booking.soDienThoai }}</span>
            </div>
            <div class="info-item">
              <span class="label">Email:</span>
              <span class="value">{{ booking.email }}</span>
            </div>
          </div>
          <hr />
          <div class="pricing-details">
            <div class="price-item">
              <span class="label">Tổng tiền phòng:</span>
              <span class="value">{{ formatCurrency(booking.tongTien) }}</span>
            </div>
            <div class="price-item">
              <span class="label">Giảm giá:</span>
              <span class="value">- {{ formatCurrency(booking.soTienGiam) }}</span>
            </div>
            <div class="price-item total">
              <span class="label">Thanh toán:</span>
              <span class="value">{{ formatCurrency(booking.tongTien - booking.soTienGiam) }}</span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button @click="goBack" class="back-button">Quay lại</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDatHomeById } from '@/Service/DatHomeService'

const route = useRoute()
const router = useRouter()

const booking = ref(null)
const isLoading = ref(true)

const fetchBookingDetails = async () => {
  isLoading.value = true
  try {
    const response = await getDatHomeById(route.params.id)
    booking.value = response.data
  } catch (error) {
    console.error('Lỗi khi tải chi tiết đặt phòng:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchBookingDetails)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('vi-VN', options)
}

const formatCurrency = (value) => {
    if (typeof value !== 'number') {
        return '0 ₫';
    }
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const getStatusLabel = (status) => {
  const statusMap = {
    ChoXacNhan: 'Chờ xác nhận',
    DaXacNhan: 'Đã xác nhận',
    DaHuy: 'Đã hủy',
    DaCheckIn: 'Đã check-in',
    DaCheckOut: 'Đã check-out',
    HoanThanh: 'Hoàn thành'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  return `status-${status.toLowerCase()}`
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.booking-detail-view {
  padding: 2rem;
  background-color: #f9f9f9;
  min-height: 100vh;
}
.page-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.2rem;
  color: #333;
}
.booking-card {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background-color: #007bff;
  color: white;
}
.card-header h3 {
  margin: 0;
  font-size: 1.8rem;
}
.card-body {
  padding: 2rem;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.info-item {
  display: flex;
  flex-direction: column;
}
.label {
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
}
.value {
  font-weight: 600;
  color: #333;
}
hr {
  border: 0;
  border-top: 1px solid #eee;
  margin: 2rem 0;
}
.pricing-details {
  margin-top: 1.5rem;
}
.price-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 1.1rem;
}
.price-item.total {
  font-weight: bold;
  font-size: 1.3rem;
  border-top: 2px solid #eee;
  padding-top: 1rem;
  margin-top: 1rem;
}
.card-footer {
  padding: 1.5rem 2rem;
  text-align: right;
  background-color: #f7f7f7;
}
.back-button {
  padding: 0.8rem 1.6rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.back-button:hover {
  background-color: #5a6268;
}

.status {
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-weight: 500;
  color: #fff;
  font-size: 0.9rem;
  text-transform: uppercase;
}
.status-choxacnhan { background-color: #ffc107; }
.status-daxacnhan { background-color: #28a745; }
.status-dahuy { background-color: #dc3545; }
.status-dacheckin { background-color: #17a2b8; }
.status-dacheckout { background-color: #6f42c1; }
.status-hoanthanh { background-color: #007bff; }

.loading-container, .error-container {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: #666;
}
.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
