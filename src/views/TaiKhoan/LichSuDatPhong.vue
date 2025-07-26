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
          <img :src="getImageUrl(booking.hinhAnh)" alt="Ảnh homestay" class="homestay-image" />
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
            <!-- Nút Đánh giá: Chỉ hiện khi trạng thái là REVIEWABLE. -->
            <button v-if="getBookingReviewState(booking) === 'REVIEWABLE'" @click="openReviewModal(booking)" class="review-button">
              Đánh giá
            </button>
            <!-- Chữ "Đã đánh giá": Chỉ hiện khi trạng thái là REVIEWED. -->
            <span v-if="getBookingReviewState(booking) === 'REVIEWED'" class="reviewed-label">
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
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAllDatHome } from '@/Service/DatHomeService'
import { useAuthStore } from '@/stores/authStore'
import ReviewModal from '@/components/ReviewModal.vue'
import { createDanhGia, getAllDanhGia } from '@/Service/DanhGiaService' // Use getAllDanhGia
import { getAllKhachHang } from '@/Service/khachHangService' // Import service to get all customers
import api from '@/utils/api'
import notification from '@/utils/notification'

const router = useRouter()
const authStore = useAuthStore()

const allBookings = ref([])
const reviewedBookingIds = ref(new Set()) // Logic changed: now tracks reviewed BOOKING IDs (datHomeId)
const userCustomerIds = ref([])
const isLoading = ref(true)
const isReviewModalVisible = ref(false)
const selectedBookingForReview = ref(null)

/**
 * Determines the review state of a booking.
 * This state is updated immediately after a success or error notification is shown.
 * @param {object} booking - The booking object.
 * @returns {'REVIEWABLE' | 'REVIEWED' | 'NOT_REVIEWABLE'}
 */
const getBookingReviewState = (booking) => {
  const isCompleted = booking.trangThai === 'HoanThanh' || booking.trangThai === 'DaCheckOut'

  // A booking can only be reviewed if it's completed.
  if (!isCompleted) {
    return 'NOT_REVIEWABLE'
  }

  // If the booking ID is in our list, it means a notification has been shown
  // (either success or "already reviewed" error), so it's considered reviewed.
  if (reviewedBookingIds.value.has(booking.id)) {
    return 'REVIEWED'
  }

  // If it's completed but not in the list, it's ready to be reviewed.
  return 'REVIEWABLE'
}

const fetchAllDataAndProcess = async () => {
  isLoading.value = true
  if (!authStore.user || !authStore.user.id) {
    isLoading.value = false
    return
  }

  try {
    // Để giữ trạng thái "Đã đánh giá" khi tải lại trang, chúng ta thực hiện quy trình sau:
    // 1. Lấy tất cả dữ liệu cần thiết từ server, bao gồm cả các đánh giá đã tồn tại.
    // 2. Dựa trên dữ liệu đó, xây dựng lại trạng thái cho giao diện.

    console.log('[Persistence] Bắt đầu đồng bộ hóa trạng thái từ server...')

    const [allCustomersRes, allReviewsRes, allBookingsRes] = await Promise.all([
      getAllKhachHang(),
      // Bước 1.1: Lấy tất cả các bài đánh giá đã được lưu vĩnh viễn trong cơ sở dữ liệu.
      getAllDanhGia(),
      getAllDatHome()
    ])

    // Bước 1.2: Xác định các hồ sơ khách hàng của người dùng hiện tại.
    const currentUserTaiKhoanId = authStore.user.id
    const customersForUser = (allCustomersRes.data || []).filter(
      (customer) => customer.taiKhoan && customer.taiKhoan.id === currentUserTaiKhoanId
    )
    userCustomerIds.value = customersForUser.map((c) => c.id)

    // Bước 2: Xây dựng lại danh sách các lượt đặt phòng đã được đánh giá.
    // Đây là bước cốt lõi để giữ lại trạng thái "Đã đánh giá" sau khi tải lại trang.
    const reviewedSetFromServer = new Set()
    ;(allReviewsRes.data || []).forEach((review) => {
      // Kiểm tra xem bài đánh giá có thuộc về người dùng hiện tại và có mã đặt phòng không.
      if (userCustomerIds.value.includes(review.khachHangId) && review.datHomeId) {
        // Nếu có, thêm mã đặt phòng vào danh sách đã được đánh giá.
        reviewedSetFromServer.add(review.datHomeId)
      }
    })

    // Cập nhật "bộ nhớ" của giao diện với dữ liệu bền vững từ server.
    reviewedBookingIds.value = reviewedSetFromServer
    console.log('[Persistence] Đồng bộ hóa hoàn tất. Các ID đã đánh giá:', reviewedBookingIds.value)


    // Lưu lại toàn bộ lịch sử đặt phòng để hiển thị.
    allBookings.value = allBookingsRes.data || []
    } catch (error) {
    console.error('Đã xảy ra lỗi trong quá trình tải dữ liệu bền vững:', error)
    } finally {
    isLoading.value = false
  }
}

watch(() => authStore.user, (newUser) => {
    if (newUser && newUser.id) {
      fetchAllDataAndProcess()
    } else {
      // Clear data on logout
      isLoading.value = false
      allBookings.value = []
      reviewedBookingIds.value = new Set()
      userCustomerIds.value = []
    }
  },
  { immediate: true }
)

const filteredBookings = computed(() => {
  const user = authStore.user
  if (!user || !user.id) {
    return []
  }
  const userId = user.id
  // Filter bookings that belong to the current user's account ID
  const userBookings = allBookings.value.filter((booking) => booking.taiKhoanId === userId)
  return userBookings.sort((a, b) => b.id - a.id)
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
    // Thêm các trạng thái khác nếu có
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  return `status-${status.toLowerCase()}`
}

const openReviewModal = (booking) => {
  // Dòng dưới đây sẽ in ID ra console để bạn có thể sao chép.
  console.log(`ID của lượt đặt phòng "${booking.tenHomestay}" (mã: ${booking.maDatHome}) là:`, booking.id)
  selectedBookingForReview.value = booking
  isReviewModalVisible.value = true
}

const closeReviewModal = () => {
  isReviewModalVisible.value = false;
  selectedBookingForReview.value = null;
}

const handleReviewSubmit = async (reviewData) => {
  try {
    const formData = new FormData()
    const danhGiaJson = {
    diemSo: reviewData.quality,
    noiDung: reviewData.comment,
    datHomeId: reviewData.bookingId,
      khachHangId: reviewData.idKhachHang,
      homeStayId: reviewData.homestayId
    }

    formData.append('danhGia', JSON.stringify(danhGiaJson))

    if (reviewData.images && reviewData.images.length > 0) {
      for (const file of reviewData.images) {
        formData.append('files', file)
      }
    }

    // Call API to create the review
    await createDanhGia(formData)

    // On successful submission, show a success toast and update the UI
    notification.success('Cảm ơn bạn đã gửi đánh giá!')

    const bookingToUpdate = selectedBookingForReview.value
    if (bookingToUpdate) {
      // Add the booking's ID to the reviewed set to change its state to "Reviewed"
      const updatedReviewedIds = new Set(reviewedBookingIds.value)
      updatedReviewedIds.add(bookingToUpdate.id)
      reviewedBookingIds.value = updatedReviewedIds

      console.log(`[UI Update] Booking ID ${bookingToUpdate.id} is now marked as reviewed.`)
    }

    // Close the modal
    closeReviewModal()
  } catch (error) {
    console.error('Lỗi khi gửi đánh giá:', error.response?.data || error)
    const errorMessage =
      error.response?.data?.message || 'Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại.'
    notification.error(errorMessage)

    // Synchronize state if the backend reports the review already exists
    if (errorMessage.includes('Bạn đã đánh giá')) {
      const booking = selectedBookingForReview.value
      if (booking) {
        const newReviewedIds = new Set(reviewedBookingIds.value)
        newReviewedIds.add(booking.id)
        reviewedBookingIds.value = newReviewedIds
  }
    }
    closeReviewModal()
  }
}

const viewBookingDetails = (booking) => {
  // Có thể chuyển đến một trang chi tiết đặt phòng nếu có
  router.push({ name: 'booking-detail', params: { id: booking.id } })
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
  gap: 1.5rem; /* Add gap between image and details */
  align-items: center;
  transition: box-shadow 0.3s ease;
}

.homestay-image {
  width: 150px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
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

.details-button {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
}

.details-button:hover {
  background-color: #e0e0e0;
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
</style>
