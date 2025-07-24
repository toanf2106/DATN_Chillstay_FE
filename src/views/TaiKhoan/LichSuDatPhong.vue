<template>
  <div class="booking-history">
    <h2>Lịch sử đặt phòng</h2>
    <div v-if="isLoading" class="loading-container">
      <div class="loader"></div>
      <p>Đang tải dữ liệu...</p>
    </div>
    <div v-else-if="filteredBookings.length === 0" class="no-bookings">
      <p>Bạn chưa có lịch sử đặt phòng nào.</p>
    </div>
    <div v-else>
      <div class="booking-list">
        <div v-for="booking in filteredBookings" :key="booking.id" class="booking-item">
          <div class="booking-details">
            <h3 class="homestay-name">{{ booking.tenHomestay }}</h3>
            <p><strong>Mã đặt phòng:</strong> {{ booking.maDatHome }}</p>
            <p><strong>Ngày nhận phòng:</strong> {{ formatDate(booking.ngayNhanPhong) }}</p>
            <p><strong>Ngày trả phòng:</strong> {{ formatDate(booking.ngayTraPhong) }}</p>
            <p>
              <strong>Trạng thái:</strong>
              <span class="status" :class="getStatusClass(booking.trangThai)">
                {{ getStatusLabel(booking.trangThai) }}
              </span>
            </p>
          </div>
          <div class="booking-actions">
            <button
              v-if="isReviewable(booking)"
              @click="openReviewModal(booking)"
              class="review-button"
            >
              Đánh giá
            </button>
            <!-- Changed button to a span for "Reviewed" state -->
            <span
              v-else-if="booking.trangThai === 'HoanThanh' || booking.trangThai === 'DaCheckOut'"
              class="reviewed-label"
            >
              Đã đánh giá
            </span>
            <button @click="viewBookingDetails(booking)" class="details-button">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
    <ReviewModal
      v-if="isReviewModalVisible"
      :booking="selectedBookingForReview"
      @close="closeReviewModal"
      @submit="handleReviewSubmit"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue' // onMounted is no longer needed, replaced by watch
import { useRouter } from 'vue-router'
import { getAllDatHome } from '@/Service/DatHomeService'
import { useAuthStore } from '@/stores/authStore'
import ReviewModal from '@/components/ReviewModal.vue'
import { createDanhGia, getDanhGiaByKhachHangId } from '@/Service/DanhGiaService'
import { getThongTinNguoiDungByTaiKhoanId } from '@/Service/ThongTinNguoiDungService'

const router = useRouter()
const authStore = useAuthStore()

const bookings = ref([])
const reviewedBookingIds = ref(new Set())
const isLoading = ref(true)
const isReviewModalVisible = ref(false)
const selectedBookingForReview = ref(null)

const fetchUserAndBookings = async () => {
  isLoading.value = true
  if (!authStore.user || !authStore.user.id) {
    isLoading.value = false
    console.warn('Người dùng chưa đăng nhập, không thể tải lịch sử đặt phòng.')
    return
  }

  try {
    console.log(`Bắt đầu lấy dữ liệu cho TaiKhoan ID: ${authStore.user.id}`)

    const userInfoResponse = await getThongTinNguoiDungByTaiKhoanId(authStore.user.id)
    const customerId = userInfoResponse.data?.id
    console.log(`Tìm thấy KhachHang ID: ${customerId}`)

    if (!customerId) {
      console.warn('Không tìm thấy thông tin khách hàng tương ứng với tài khoản.')
      const bookingsResponse = await getAllDatHome()
      bookings.value = bookingsResponse.data
      isLoading.value = false
      return
    }

    const [reviewsResponse, bookingsResponse] = await Promise.all([
      getDanhGiaByKhachHangId(customerId),
      getAllDatHome()
    ])

    const reviewsData = reviewsResponse.data || []
    const reviewedIds = new Set(reviewsData.map((review) => review.datHomeId))
    reviewedBookingIds.value = reviewedIds
    console.log('Các ID đơn hàng đã được đánh giá:', reviewedBookingIds.value)

    bookings.value = bookingsResponse.data || []

  } catch (error) {
    console.error('Đã xảy ra lỗi trong quá trình tải dữ liệu:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for changes in user login state instead of using onMounted
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser && newUser.id) {
      // User is logged in, fetch data
      fetchUserAndBookings()
    } else {
      // User is not logged in or has logged out, clear data
      isLoading.value = false
      bookings.value = []
      reviewedBookingIds.value = new Set()
    }
  },
  { immediate: true } // Run the watcher immediately on component mount
)

const filteredBookings = computed(() => {
  if (!authStore.user || !authStore.user.id) return []
  // Filter client-side based on the correct TaiKhoanId
  return bookings.value.filter((booking) => booking.taiKhoanId === authStore.user.id)
})

const formatDate = (dateString) => {
  if (!dateString) return 'Chưa có thông tin'
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('vi-VN', options)
}

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

const openReviewModal = (booking) => {
  selectedBookingForReview.value = booking
  isReviewModalVisible.value = true
}

const closeReviewModal = () => {
  isReviewModalVisible.value = false
  selectedBookingForReview.value = null
}

const isReviewable = (booking) => {
  const isCompleted = booking.trangThai === 'HoanThanh' || booking.trangThai === 'DaCheckOut'
  const isNotReviewed = !reviewedBookingIds.value.has(booking.id)
  return isCompleted && isNotReviewed
}

const handleReviewSubmit = async (reviewData) => {
  const payload = {
    diemSo: reviewData.quality,
    noiDung: reviewData.comment,
    datHomeId: reviewData.bookingId
  }
  const imageFiles = reviewData.images.map((img) => img.file)

  try {
    await createDanhGia(payload, imageFiles)
    alert('Cảm ơn bạn đã gửi đánh giá!')
    reviewedBookingIds.value.add(reviewData.bookingId)
    closeReviewModal()
  } catch (error) {
    console.error('Lỗi khi gửi đánh giá:', error)
    alert('Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại.')
  }
}

const viewBookingDetails = (booking) => {
  router.push({ name: 'booking-detail', params: { id: booking.id } })
}
</script>

<style scoped>
.booking-history {
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  max-width: 900px;
  margin: 2rem auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 2rem;
}

.loading-container,
.no-bookings {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.booking-list {
  display: grid;
  gap: 1.5rem;
}

.booking-item {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.3s ease;
}

.booking-item:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.booking-details {
  flex-grow: 1;
}

.homestay-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 1rem;
}

.booking-details p {
  margin: 0.5rem 0;
  color: #555;
}

.status {
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-weight: 500;
  color: #fff;
  font-size: 0.9rem;
}

.status-choxacnhan {
  background-color: #ffc107;
}
.status-daxacnhan {
  background-color: #28a745;
}
.status-dahuy {
  background-color: #6c757d;
}
.status-dacheckin {
  background-color: #17a2b8;
}
.status-dacheckout {
  background-color: #8e44ad;
}
.status-hoanthanh {
  background-color: #007bff;
}

.booking-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.review-button,
.details-button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
  text-align: center;
}

.review-button {
  background-color: #28a745;
  color: white;
}

.review-button:hover {
  background-color: #218838;
}

.review-button.reviewed {
  background-color: #6c757d;
  cursor: not-allowed;
}
.review-button.reviewed:hover {
  background-color: #5a6268;
}

.reviewed-label {
  font-style: italic;
  color: #888;
  font-size: 0.9rem;
  padding: 0.6rem 1.2rem;
  text-align: center;
  display: inline-block;
  min-height: 38px; /* Match button height */
}

.details-button {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
}

.details-button:hover {
  background-color: #e0e0e0;
}
</style>
