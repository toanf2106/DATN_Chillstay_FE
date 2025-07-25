<template>
  <div class="review-details-container">
    <div class="page-header">
      <div style="display: flex; align-items: center; gap: 20px">
        <router-link :to="{ name: 'admin-danh-gia' }" class="back-link"
          ><i class="fas fa-arrow-left"></i> Quay lại</router-link
        >
        <h1 v-if="homestay">Đánh giá cho {{ homestay.tenHomestay }}</h1>
        <h1 v-else>Đang tải...</h1>
      </div>
      <!-- Removed Add Review Button -->
    </div>

    <div v-if="!loading && reviews.length > 0" class="average-rating-container">
      <span class="average-score">{{ averageRating }}</span>
      <div class="rating-stars">
        <template v-for="n in 5" :key="n">
          <i v-if="averageRating >= n" class="fas fa-star filled"></i>
          <i
            v-else-if="averageRating > n - 1 && averageRating < n"
            class="fas fa-star-half-alt filled"
          ></i>
          <i v-else class="far fa-star"></i>
        </template>
      </div>
      <span class="total-reviews">({{ reviews.length }} đánh giá)</span>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Đang tải đánh giá...
    </div>
    <div v-else>
      <div class="review-filter-controls">
        <div>
          <span>Lọc theo sao:</span>
          <button @click="setStarFilter(null)" :class="{ active: selectedStarFilter === null }">
            Tất cả
          </button>
          <button @click="setStarFilter(5)" :class="{ active: selectedStarFilter === 5 }">
            5 Sao
          </button>
          <button @click="setStarFilter(4)" :class="{ active: selectedStarFilter === 4 }">
            4+ Sao
          </button>
          <button @click="setStarFilter(3)" :class="{ active: selectedStarFilter === 3 }">
            3+ Sao
          </button>
          <button @click="setStarFilter(2)" :class="{ active: selectedStarFilter === 2 }">
            2+ Sao
          </button>
          <button @click="setStarFilter(1)" :class="{ active: selectedStarFilter === 1 }">
            1+ Sao
          </button>
        </div>
        <div class="select-filter">
          <label for="visibility-select">Trạng thái:</label>
          <select id="visibility-select" v-model="visibilityFilter">
            <option value="all">Tất cả</option>
            <option value="visible">Hiện</option>
            <option value="hidden">Ẩn</option>
          </select>
        </div>
      </div>
      <div v-if="filteredReviews.length === 0" class="empty-state">
        <i class="fas fa-comment-slash"></i>
        <p>Chưa có đánh giá nào phù hợp</p>
      </div>
      <div v-else class="reviews-list">
        <div
          class="danh-gia-card shopee-style"
          v-for="review in filteredReviews"
          :key="review.id"
          :class="{ 'is-hidden': review.isHidden }"
        >
          <div class="review-header">
            <div class="user-avatar">
              <img src="/images/default-avatar.png" alt="User avatar" />
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
          <div class="card-top-actions">
            <div
              class="review-status-indicator"
              :class="review.isHidden ? 'status-hidden' : 'status-visible'"
            >
              {{ review.isHidden ? 'Đang ẩn' : 'Đang hiện' }}
            </div>
            <button
              @click="toggleLike(review.id)"
              class="like-button"
              :class="{ liked: review.isLiked }"
            >
              <i class="fas fa-thumbs-up"></i> Hữu ích ({{ review.likes }})
            </button>
          </div>
          <div class="review-metadata">
            <span class="review-date">{{ formatDate(review.thoiGianDanhGia) }}</span>
          </div>
          <div class="review-content">
            {{ review.noiDung }}
          </div>
          <!-- Phần hiển thị ảnh đánh giá -->
          <div v-if="review.anhDanhGias && review.anhDanhGias.length > 0" class="review-images">
            <div
              v-for="image in review.anhDanhGias"
              :key="image.id"
              class="review-image-item"
              @click="openImageModal(image.duongDanAnh)"
            >
              <img :src="image.duongDanAnh" alt="Ảnh đánh giá" class="review-image" />
            </div>
          </div>
          <!-- Removed Review Actions (Manage Photos button) -->
        </div>
      </div>
    </div>
    <!-- Image Modal -->
    <div v-if="isImageModalOpen" class="image-modal-overlay" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <span class="close-modal" @click="closeImageModal">&times;</span>
        <img :src="currentModalImage" alt="Ảnh đánh giá phóng to" class="modal-image" />
      </div>
    </div>
    <!-- Removed Admin Anh Danh Gia Modal -->
    <!-- Removed Add Review Modal -->
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getHomeStayById } from '@/Service/HomeStayService'
import { getAllDanhGia } from '@/Service/DanhGiaService'
import { getKhachHangById } from '@/Service/khachHangService'

export default {
  name: 'ReviewDetails',
  components: {
    // AdminAnhDanhGiaModal removed
  },
  setup() {
    const route = useRoute()
    const homestay = ref(null)
    const reviews = ref([])
    const loading = ref(true)
    const reviewCustomers = ref({})
    const homestayId = route.params.homestayId
    const selectedStarFilter = ref(null)
    const visibilityFilter = ref('all') // 'all', 'visible', 'hidden'
    const isImageModalOpen = ref(false)
    const currentModalImage = ref('')

    const openImageModal = (imageUrl) => {
      currentModalImage.value = imageUrl
      isImageModalOpen.value = true
    }

    const closeImageModal = () => {
      isImageModalOpen.value = false
      currentModalImage.value = ''
    }

    const fetchData = async () => {
      try {
        loading.value = true

        // Fetch homestay details
        const homestayRes = await getHomeStayById(homestayId)
        homestay.value = homestayRes.data

        // Fetch all reviews and filter
        const reviewsRes = await getAllDanhGia()
        const filteredReviewsFromServer = reviewsRes.data.filter((r) => r.homeStayId == homestayId)

        // Map server data to our component's review model
        reviews.value = filteredReviewsFromServer.map((serverReview) => {
          const existingReview = reviews.value.find((r) => r.id === serverReview.id)
          return {
            ...serverReview,
            isHidden: existingReview ? existingReview.isHidden : serverReview.trangThai === false,
            isDeleted: existingReview ? existingReview.isDeleted : false,
            likes: existingReview ? existingReview.likes : 0,
            isLiked: existingReview ? existingReview.isLiked : false,
          }
        })

        // Fetch customer names for the reviews
        const customerIds = [...new Set(reviews.value.map((r) => r.khachHangId))]
        const customerPromises = customerIds.map((id) => {
          if (!reviewCustomers.value[id]) {
            return getKhachHangById(id)
              .then((res) => {
                reviewCustomers.value[id] = res.data.tenKhachHang
              })
              .catch((err) => console.error(`Error fetching customer ${id}:`, err))
          }
          return Promise.resolve()
        })
        await Promise.all(customerPromises)
      } catch (error) {
        console.error('Error fetching review details:', error)
      } finally {
        loading.value = false
      }
    }

    const getReviewCustomerName = (customerId) => {
      return reviewCustomers.value[customerId] || 'Khách hàng ẩn danh'
    }

    const setStarFilter = (stars) => {
      selectedStarFilter.value = stars
    }

    const toggleLike = (reviewId) => {
      const review = reviews.value.find((r) => r.id === reviewId)
      if (review) {
        if (review.isLiked) {
          review.likes--
        } else {
          review.likes++
        }
        review.isLiked = !review.isLiked
      }
    }

    const averageRating = computed(() => {
      if (!reviews.value || reviews.value.length === 0) {
        return 0
      }
      const totalStars = reviews.value.reduce((acc, review) => acc + review.diemSo, 0)
      return (totalStars / reviews.value.length).toFixed(1)
    })

    const filteredReviews = computed(() => {
      let tempReviews = reviews.value.filter((r) => !r.isDeleted)

      if (visibilityFilter.value === 'visible') {
        tempReviews = tempReviews.filter((r) => !r.isHidden)
      } else if (visibilityFilter.value === 'hidden') {
        tempReviews = tempReviews.filter((r) => r.isHidden)
      }

      if (selectedStarFilter.value !== null) {
        const minRating = selectedStarFilter.value
        return tempReviews.filter((review) => review.diemSo >= minRating)
      }

      return tempReviews
    })

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

    onMounted(fetchData)

    return {
      homestay,
      reviews,
      loading,
      getReviewCustomerName,
      formatDate,
      selectedStarFilter,
      setStarFilter,
      toggleLike,
      averageRating,
      visibilityFilter,
      filteredReviews,
      isImageModalOpen,
      currentModalImage,
      openImageModal,
      closeImageModal,
    }
  },
}
</script>

<style scoped>
.review-details-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
}

.back-link {
  text-decoration: none;
  color: #555;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-link:hover {
  background-color: #f0f0f0;
}

.average-rating-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fef9e7;
  border-radius: 8px;
  border: 1px solid #fceecf;
}

.average-rating-container .average-score {
  font-size: 24px;
  font-weight: bold;
  color: #d4ac0d;
}

.average-rating-container .rating-stars i {
  color: #f5b041;
}

.average-rating-container .total-reviews {
  font-size: 14px;
  color: #666;
}

.review-filter-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.empty-state i,
.loading-state i {
  font-size: 48px;
  margin-bottom: 15px;
}

.review-filter-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.review-filter-controls span,
.select-filter label {
  font-weight: 500;
  color: #333;
  margin-right: 10px;
}

.review-filter-controls button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.review-filter-controls button.active {
  background-color: #ee4d2d;
  color: white;
  border-color: #ee4d2d;
}

.select-filter {
  display: flex;
  align-items: center;
}

#visibility-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  font-size: 14px;
}

.review-filter-controls button:hover:not(.active) {
  background-color: #f0f0f0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.danh-gia-card.shopee-style {
  border: 1px solid #e0e0e0;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  position: relative;
  transition:
    opacity 0.3s ease,
    background-color 0.3s ease;
}

.danh-gia-card.shopee-style.is-hidden {
  opacity: 0.6;
  background-color: #f9f9f9;
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
  color: #333;
  font-size: 15px;
  margin-bottom: 4px;
}
.rating-stars {
  display: flex;
  gap: 2px;
}
.rating-stars i {
  color: #ccc;
  font-size: 14px;
}
.rating-stars i.filled {
  color: #ee4d2d;
}
.review-metadata {
  margin-left: 52px;
  color: #757575;
  font-size: 13px;
  margin-bottom: 12px;
}
.review-content {
  margin-left: 52px;
  color: #222;
  font-size: 14px;
  line-height: 1.6;
}
.review-actions {
  margin-left: 52px;
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f8f8f8;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #f0f0f0;
}

.hide-button {
  color: #555;
}

.delete-button {
  color: #d9534f;
}

.delete-button:hover {
  background-color: #d9534f;
  color: white;
  border-color: #d43f3a;
}
.card-top-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.like-button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: #f8f8f8;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  color: #555;
}

.like-button:hover {
  background-color: #e0e0e0;
}

.like-button.liked {
  background-color: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.like-button.liked:hover {
  background-color: #357abd;
}
.review-status-indicator {
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.status-visible {
  background-color: #48bb78; /* Green */
}
.status-hidden {
  background-color: #f56565; /* Red */
}
.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}
.review-image-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.review-image-item:hover {
  transform: scale(1.05);
}
.review-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.image-modal-content {
  position: relative;
  max-width: 80%;
  max-height: 80%;
}
.modal-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
.close-modal {
  position: absolute;
  top: -25px;
  right: 0px;
  color: white;
  font-size: 30px;
  font-weight: bold;
  cursor: pointer;
}
.danh-gia-card.shopee-style {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition:
    box-shadow 0.3s,
    background-color 0.3s ease;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}
.danh-gia-card.shopee-style.is-hidden {
  background-color: #fff5f5;
  border-left: 5px solid #e53e3e;
  opacity: 0.8;
}
.review-status-indicator {
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.status-visible {
  background-color: #48bb78; /* Green */
}
.status-hidden {
  background-color: #f56565; /* Red */
}
.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.user-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  border: 2px solid #eee;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.username {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}
.rating-stars .fas,
.rating-stars .far {
  color: #ffc107;
  font-size: 16px;
}
.review-metadata {
  color: #757575;
  font-size: 13px;
  margin-bottom: 15px;
}
.review-content {
  color: #424242;
  line-height: 1.6;
  margin-bottom: 15px;
}
.review-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}
.action-button {
  background: none;
  border: 1px solid #ccc;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
  font-size: 14px;
}
.action-button i {
  margin-right: 8px;
}
.hide-button:hover {
  background-color: #fefcbf; /* Light yellow */
  border-color: #f7b731;
}
.delete-button:hover {
  background-color: #fed7d7; /* Light red */
  border-color: #e53e3e;
  color: #c53030;
}
.like-button {
  background: none;
  border: 1px solid #ccc;
  padding: 5px 10px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.like-button.liked {
  background-color: #2979ff;
  color: white;
  border-color: #2979ff;
}
.like-button:hover {
  background-color: #e3f2fd;
}
.card-top-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.manage-photos-button:hover {
  background-color: #e0e7ff; /* Light blue */
  border-color: #6366f1;
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
  z-index: 1051;
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
</style>
