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
        <img :src="getImageUrl(booking.hinhAnh)" alt="Ảnh homestay" class="homestay-image-header" />
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

          <!-- Service Details -->
          <div v-if="services.length > 0" class="service-details">
            <h4>Dịch vụ đã sử dụng</h4>
            <ul>
              <li v-for="service in services" :key="service.id">
                <span>{{ service.dichVu.tenDichVu }} (x{{ service.soLuong }})</span>
                <span>{{ formatCurrency(service.thanhTien) }}</span>
              </li>
            </ul>
          </div>

          <!-- Surcharge Details -->
          <div v-if="surcharges.length > 0" class="surcharge-details">
             <hr v-if="services.length > 0"/>
            <h4>Phụ phí</h4>
            <ul>
              <li v-for="surcharge in surcharges" :key="surcharge.id">
                <span>{{ surcharge.phuPhi.tenPhuPhi }}</span>
                <span>{{ formatCurrency(surcharge.gia) }}</span>
              </li>
            </ul>
          </div>

          <hr v-if="services.length > 0 || surcharges.length > 0" />

          <div class="pricing-details">
            <div class="price-item">
              <span class="label">Tổng tiền phòng:</span>
              <span class="value">{{ formatCurrency(booking.tongTien) }}</span>
            </div>
            <div class="price-item">
              <span class="label">Giảm giá:</span>
              <span class="value">- {{ formatCurrency(calculateActualDiscount()) }}</span>
            </div>
            <div class="price-item total">
              <span class="label">Thanh toán:</span>
              <span class="value">{{ formatCurrency(booking.tongTien) }}</span>
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
import { getDichVuChiTietByDatHomeId } from '@/Service/dichVuService'
import { getPhuPhiChiTietByDatHomeId } from '@/Service/phuPhiService'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()

const booking = ref(null)
const services = ref([])
const surcharges = ref([])
const isLoading = ref(true)

const fetchBookingDetails = async () => {
  isLoading.value = true
  const bookingId = route.params.id;
  try {
    const [bookingResponse, servicesResponse, surchargesResponse] = await Promise.allSettled([
      getDatHomeById(bookingId),
      getDichVuChiTietByDatHomeId(bookingId),
      getPhuPhiChiTietByDatHomeId(bookingId)
    ]);

    if (bookingResponse.status === 'fulfilled') {
      booking.value = bookingResponse.value.data;
    }
    if (servicesResponse.status === 'fulfilled' && servicesResponse.value.data) {
      services.value = servicesResponse.value.data;
    }
    if (surchargesResponse.status === 'fulfilled' && surchargesResponse.value.data) {
      surcharges.value = surchargesResponse.value.data;
    }

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

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/images/default-thumbnail.jpg'; // Path to a default image
  }
  try {
    // Use URL constructor for robust path joining
    const baseUrl = new URL(api.defaults.baseURL);
    // The pathname will handle slashes correctly.
    const fullUrl = new URL(imagePath, baseUrl);
    return fullUrl.href;
  } catch (e) {
    console.error('Error creating image URL:', e);
    return '/images/default-thumbnail.jpg'; // Fallback on error
  }
}

const calculateActualDiscount = () => {
  if (!booking.value) return 0;

  // Nếu có soTienGiam và khác 0, sử dụng nó
  if (booking.value.soTienGiam && booking.value.soTienGiam > 0) {
    return booking.value.soTienGiam;
  }

  // Nếu không, tính dựa trên giá trị giảm giá và giá homestay
  if (booking.value.giaTri && booking.value.giaCaHomestay) {
    // Tính số ngày lưu trú
    const checkin = new Date(booking.value.ngayNhanPhong);
    const checkout = new Date(booking.value.ngayTraPhong);
    const nights = Math.max(1, Math.round((checkout - checkin) / (1000 * 60 * 60 * 24)));

    // Tính số tiền giảm
    const roomPrice = booking.value.giaCaHomestay * nights;
    let discount = roomPrice * (booking.value.giaTri / 100);

    // Kiểm tra giới hạn
    return Math.min(discount, roomPrice);
  }

  // Có thể tính từ chênh lệch giá
  if (booking.value.giaCaHomestay && booking.value.tongTien) {
    const difference = booking.value.giaCaHomestay - booking.value.tongTien;
    if (difference > 0) return difference;
  }

  // Nếu không tính được, hiển thị 0
  return 0;
};
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

.homestay-image-header {
  width: 100%;
  height: 300px;
  object-fit: cover;
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
.service-details, .surcharge-details {
  margin-top: 1.5rem;
}

.service-details h4, .surcharge-details h4 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
}

.service-details ul, .surcharge-details ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.service-details li, .surcharge-details li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}
</style>
