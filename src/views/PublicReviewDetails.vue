<template>
  <div class="review-details-container">
    <div class="page-header">
      <div style="display: flex; align-items: center; gap: 20px">
        <router-link :to="{ name: 'danh-gia' }" class="back-link"
          ><i class="fas fa-arrow-left"></i> Quay lại</router-link
        >
        <h1 v-if="homestay">Đánh giá cho {{ homestay.tenHomestay }}</h1>
        <h1 v-else>Đang tải...</h1>
      </div>
      <button @click="openAddReviewModal" class="add-review-btn" :disabled="!canReview">
        <i class="fas fa-plus"></i> Thêm đánh giá
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Đang tải đánh giá...
    </div>
    <div v-else-if="!reviews || reviews.length === 0" class="empty-state">
      <i class="fas fa-comment-slash"></i>
      <p>Chưa có đánh giá nào</p>
    </div>
    <div v-else class="reviews-list">

        <div
          class="danh-gia-card"
          v-for="review in reviews"
          :key="review.id"
        >
          <div class="review-header">
            <div class="user-avatar">
              <img src="/public/images/default-avatar.png" alt="User avatar">
            </div>
            <div class="user-info">
              <!-- Make the username a clickable link -->
              <router-link :to="{ name: 'tai-khoan-danh-gia', params: { customerId: review.khachHangId } }" class="username-link">
                {{ getReviewCustomerName(review.khachHangId) }}
              </router-link>
              <div class="rating-stars">
                <template v-for="n in 5" :key="n">
                  <i v-if="Math.floor(review.diemSo) >= n" class="fas fa-star filled"></i>
                  <i v-else-if="Math.floor(review.diemSo) === n-1 && (review.diemSo % 1) >= 0.5" class="fas fa-star-half-alt filled"></i>
                  <i v-else class="far fa-star"></i>
                </template>
              </div>
            </div>

          </div>
          <div class="user-info">
            <div class="username">{{ getReviewCustomerName(review.khachHangId) }}</div>
            <div class="rating-stars">
              <template v-for="n in 5" :key="n">
                <i v-if="Math.floor(review.diemSo) >= n" class="fas fa-star filled"></i>
                <i
                  v-else-if="Math.floor(review.diemSo) === n - 1 && review.diemSo % 1 >= 0.5"
                  class="fas fa-star-half-alt filled"
                ></i>
                <i v-else class="far fa-star"></i>
              </template>
            </div>
          </div>
        </div>
        <div class="review-metadata">
          <span class="review-date">{{ formatDate(review.thoiGianDanhGia) }}</span>
        </div>
        <div class="review-content">
          {{ review.noiDung }}
        </div>

        <!-- Image Gallery in Review Card -->
        <div v-if="review.images && review.images.length > 0" class="review-image-gallery">
          <div v-for="image in review.images" :key="image.id" class="gallery-item">
            <img :src="image.duongDanAnh" alt="Ảnh đánh giá" />
          </div>
        </div>
        <div v-else class="no-images-placeholder">
          <span>(Chưa có ảnh)</span>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="isReviewModalVisible" class="modal-backdrop">
      <div class="modal-content">
        <button @click="closeReviewModal" class="close-modal-btn">&times;</button>
        <h3>Viết đánh giá của bạn</h3>
        <form @submit.prevent="submitReview" class="review-form">
          <div class="form-group">
            <label>Bạn đánh giá bao nhiêu sao?</label>
            <div class="star-rating">
              <span
                v-for="star in 5"
                :key="star"
                @click="setRating(star)"
                :class="{ filled: star <= newReview.diemSo }"
              >
                <i class="fas fa-star"></i>
              </span>
            </div>
            <div v-if="formErrors.diemSo" class="error-text">{{ formErrors.diemSo }}</div>
          </div>
          <div class="form-group">
            <label for="review-content">Nội dung đánh giá:</label>
            <textarea
              id="review-content"
              v-model="newReview.noiDung"
              rows="5"
              placeholder="Hãy chia sẻ cảm nhận của bạn về homestay này..."
            ></textarea>
            <div v-if="formErrors.noiDung" class="error-text">{{ formErrors.noiDung }}</div>
          </div>
          <div class="form-group">
            <label>Thêm hình ảnh (tối đa 5 ảnh):</label>
            <input
              type="file"
              @change="handleImageUpload"
              multiple
              accept="image/*"
              class="file-input"
            />
            <div class="image-preview-container">
              <div v-for="(image, index) in imagePreviews" :key="index" class="image-preview">
                <img :src="image.src" :alt="image.file.name" />
                <button @click="removeImage(index)" class="remove-image-btn">&times;</button>
              </div>
            </div>
          </div>
          <button type="submit" class="submit-review-btn" :disabled="isSubmitting">
            <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin"></i> Đang gửi...</span>
            <span v-else>Gửi đánh giá</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { getHomeStayById } from '@/Service/HomeStayService'
import { getAllDanhGia, createDanhGia, uploadAnhDanhGia } from '@/Service/DanhGiaService'
import { getKhachHangById } from '@/Service/khachHangService'
import { useToast } from '@/stores/notificationStore'
import { useAuthStore } from '@/stores/authStore'
import { getAllDatHome } from '@/Service/DatHomeService'
import { getThongTinNguoiDungByTaiKhoanId } from '@/Service/ThongTinNguoiDungService'

export default {
  name: 'PublicReviewDetails',
  setup() {
    const route = useRoute()
    const toast = useToast()
    const authStore = useAuthStore()
    const homestay = ref(null)
    const reviews = ref([])
    const loading = ref(true)
    const reviewCustomers = ref({})
    const homestayId = parseInt(route.params.homestayId, 10)
    const isReviewModalVisible = ref(false)
    const isSubmitting = ref(false)
    const canReview = ref(false)
    const userKhachHangId = ref(null)
    const canReviewLoading = ref(true)

    const newReview = reactive({
      datHomeId: null,
      khachHangId: null,
      homeStayId: homestayId,
      diemSo: 0,
      noiDung: '',
    })

    const imageFiles = ref([])
    const imagePreviews = ref([])
    const formErrors = reactive({})

    const setRating = (rating) => {
      newReview.diemSo = rating
      if (formErrors.diemSo) delete formErrors.diemSo
    }

    const handleImageUpload = (event) => {
      const files = Array.from(event.target.files)
      if (imageFiles.value.length + files.length > 5) {
        toast.error('Bạn chỉ có thể tải lên tối đa 5 ảnh.')
        return
      }

      files.forEach((file) => {
        imageFiles.value.push(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreviews.value.push({ src: e.target.result, file: file })
        }
        reader.readAsDataURL(file)
      })
    }

    const removeImage = (index) => {
      const removedFile = imagePreviews.value[index].file
      imagePreviews.value.splice(index, 1)
      const fileIndex = imageFiles.value.findIndex((f) => f === removedFile)
      if (fileIndex > -1) {
        imageFiles.value.splice(fileIndex, 1)
      }
    }

    const validateForm = () => {
      const errors = {}
      if (newReview.diemSo === 0) {
        errors.diemSo = 'Vui lòng chọn số sao đánh giá.'
      }
      if (!newReview.noiDung.trim()) {
        errors.noiDung = 'Nội dung đánh giá không được để trống.'
      }
      Object.assign(formErrors, errors)
      return Object.keys(errors).length === 0
    }

    const submitReview = async () => {
      if (!validateForm()) return

      isSubmitting.value = true
      try {
        const reviewPayload = {
          ...newReview,
          khachHangId: userKhachHangId.value,
        }
        // Step 1: Create the review text content
        const response = await createDanhGia(reviewPayload)
        const createdReviewId = response.data.id

        // Step 2: If review creation is successful and there are images, upload them
        if (createdReviewId && imageFiles.value.length > 0) {
          const uploadPromises = imageFiles.value.map((file) =>
            uploadAnhDanhGia(file, createdReviewId),
          )
          await Promise.all(uploadPromises)
        }

        toast.success('Đánh giá của bạn đã được gửi thành công!')
        closeReviewModal()
        await fetchData() // Refresh the reviews list
      } catch (error) {
        console.error('Lỗi khi gửi đánh giá:', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
      } finally {
        isSubmitting.value = false
      }
    }

    const resetForm = () => {
      newReview.diemSo = 0
      newReview.noiDung = ''
      imageFiles.value = []
      imagePreviews.value = []
      for (const key in formErrors) {
        delete formErrors[key]
      }
    }

    const checkCanReview = async () => {
      if (!authStore.isLoggedIn) {
        canReview.value = false
        canReviewLoading.value = false
        return
      }

      try {
        const userInfoResponse = await getThongTinNguoiDungByTaiKhoanId(authStore.user.id)
        if (userInfoResponse.data) {
          userKhachHangId.value = userInfoResponse.data.id
          newReview.khachHangId = userInfoResponse.data.id

          const allBookingsRes = await getAllDatHome()
          const userBookings = allBookingsRes.data.filter(
            (booking) =>
              booking.khachHangId === userKhachHangId.value &&
              booking.homestayId === homestayId &&
              (booking.trangThai === 'HoanThanh' || booking.trangThai === 'DaCheckOut'),
          )

          if (userBookings.length > 0) {
            // Check if the user has already reviewed this homestay
            const reviewsRes = await getAllDanhGia()
            const existingReview = reviewsRes.data.find(
              (review) =>
                review.khachHangId === userKhachHangId.value && review.homeStayId === homestayId,
            )

            if (existingReview) {
              canReview.value = false
              toast.info('Bạn đã đánh giá homestay này rồi.')
            } else {
              canReview.value = true
              newReview.datHomeId = userBookings[0].id // Use the first completed/checked-out booking
            }
          } else {
            canReview.value = false
          }
        } else {
          canReview.value = false
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra quyền đánh giá:', error)
        canReview.value = false
      } finally {
        canReviewLoading.value = false
      }
    }

    const fetchData = async () => {
      try {
        loading.value = true

        const homestayRes = await getHomeStayById(homestayId)
        homestay.value = homestayRes.data

        const reviewsRes = await getAllDanhGia()

        const filteredForHomestay = reviewsRes.data.filter((r) => r.homeStayId == homestayId)

        const activeReviews = filteredForHomestay.filter((r) => r.trangThai !== false)

        reviews.value = activeReviews.map((serverReview) => {
          return {
            ...serverReview,
            images: serverReview.anhDanhGias || [],
          }
        })

        const customerIds = [...new Set(reviews.value.map((r) => r.khachHangId))]
        const customerPromises = customerIds.map((id) => {
          if (!reviewCustomers.value[id]) {
            return getKhachHangById(id).then((res) => {
              reviewCustomers.value[id] = res.data.tenKhachHang
            })
          }
          return Promise.resolve()
        })
        await Promise.all(customerPromises)
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu đánh giá:', error)
      } finally {
        loading.value = false
      }
    }

    const getReviewCustomerName = (customerId) => {
      return reviewCustomers.value[customerId] || 'Khách hàng ẩn danh'
    }

    const openAddReviewModal = () => {
      if (!canReview.value) {
        toast.warning('Bạn cần hoàn thành một kỳ nghỉ tại đây để có thể đánh giá.')
        return
      }
      resetForm()
      isReviewModalVisible.value = true
    }

    const closeReviewModal = () => {
      isReviewModalVisible.value = false
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }
      return new Date(dateString).toLocaleDateString('vi-VN', options)
    }

    onMounted(async () => {
      await checkCanReview()
      await fetchData()
    })

    return {
      homestay,
      reviews,
      loading,
      getReviewCustomerName,
      formatDate,
      isReviewModalVisible,
      openAddReviewModal,
      closeReviewModal,
      newReview,
      setRating,
      submitReview,
      isSubmitting,
      handleImageUpload,
      imagePreviews,
      removeImage,
      formErrors,
      canReview,
      canReviewLoading,
    }
  },
}
</script>

<style scoped>
/* Reset all styles to ensure no conflicts */
.review-details-container * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.review-details-container {
  padding: 20px;
  max-width: 800px;
  margin: 40px auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  border-bottom: 1px solid #eef2f7;
  padding-bottom: 15px;
}

.page-header h1 {
  font-size: 24px;
  color: #1a202c;
  font-weight: 700;
}

.back-link {
  text-decoration: none;
  color: #4a5568;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-link:hover {
  background-color: #f7fafc;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 0;
  font-size: 18px;
  color: #718096;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #cbd5e0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.danh-gia-card {
  border: 1px solid #e2e8f0;
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  position: relative; /* Ensure positioning context */
}

.review-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex-grow: 1;
}

.username {
  font-weight: 600;
  color: #2d3748;
  font-size: 15px;
  margin-bottom: 4px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars i {
  color: #d1d5db;
  font-size: 14px;
}

.rating-stars i.filled {
  color: #f59e0b;
}

.review-metadata {
  margin-left: 52px;
  color: #718096;
  font-size: 13px;
  margin-bottom: 12px;
}

.review-content {
  margin-left: 52px;
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.review-image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
  margin-left: 52px;
}

.gallery-item {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-images-placeholder {
  margin-left: 52px;
  margin-top: 10px;
  color: #a0aec0;
  font-size: 13px;
  font-style: italic;
}

/* Add Review Button Styles */
.add-review-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.add-review-btn:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.add-review-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.add-review-btn i {
  font-size: 14px;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px 30px;
  width: 90%;
  max-width: 500px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.close-modal-btn {
  position: sticky;
  top: 0;
  right: -10px;
  float: right;
  font-size: 24px;
  font-weight: bold;
  color: #888;
  background: white;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  z-index: 10;
}
.close-modal-btn:hover {
  color: #333;
}

/* Form Styles */
.review-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.star-rating {
  display: flex;
  gap: 5px;
  font-size: 24px;
  color: #ccc;
  cursor: pointer;
}

.star-rating .fa-star {
  transition: color 0.2s;
}

.star-rating span:hover i,
.star-rating span.filled i {
  color: #f59e0b;
}

textarea {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.file-input {
  width: 100%;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.image-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}

.submit-review-btn {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-review-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-review-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}
.error-text {
  color: #e53e3e;
  font-size: 13px;
  margin-top: 5px;
}
.username-link {
    font-weight: 600;
    color: #2d3748;
    font-size: 15px;
    margin-bottom: 4px;
    text-decoration: none;
    transition: color 0.2s;
}
.username-link:hover {
    color: #007bff; /* Highlight on hover */
}
</style>
