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

      <!-- Nút thêm đánh giá sẽ được xử lý logic sau -->
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

    <div class="review-filter-controls" v-if="!loading && reviews.length > 0">
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
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Đang tải đánh giá...
    </div>

    <div v-else-if="!filteredReviews || filteredReviews.length === 0" class="empty-state">
      <i class="fas fa-comment-slash"></i>
      <p>Chưa có đánh giá nào</p>
    </div>
    <div v-else class="reviews-list">
      <div class="danh-gia-card" v-for="review in filteredReviews" :key="review.id">
        <div class="review-header">
          <div class="review-user-info">
            <div class="user-avatar">
              <img src="/images/default-avatar.png" alt="User avatar" />
            </div>
            <div class="user-info">
              <router-link
                :to="{ name: 'tai-khoan-danh-gia', params: { customerId: review.khachHangId } }"
                class="username-link"
              >
                {{ getReviewCustomerName(review.khachHangId) }}
              </router-link>
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
          <div class="review-actions-top">
            <button
              @click="toggleLike(review)"
              class="like-button"
              :class="{ liked: review.isLiked }"
            >
              <i class="fas fa-thumbs-up"></i> Hữu ích ({{ review.likes || 0 }})
            </button>
          </div>
        </div>
        <div class="review-metadata">
          <span class="review-date">{{ formatDate(review.thoiGianDanhGia) }}</span>
        </div>
        <div class="review-content">
          {{ review.noiDung }}
        </div>

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

    <!-- Modal thêm đánh giá mới -->
    <div v-if="isReviewModalVisible" class="modal-backdrop">
      <div class="modal-content">
        <button @click="closeReviewModal" class="close-modal-btn">&times;</button>
        <h3>Viết đánh giá của bạn</h3>
        <form @submit.prevent="submitReview" class="review-form">
          <!-- Form content here -->
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getHomeStayById } from '@/Service/HomeStayService'
import { getAllDanhGia } from '@/Service/DanhGiaService'
import { getKhachHangById } from '@/Service/khachHangService'
// Các import khác nếu cần

export default {
  name: 'PublicReviewDetails',
  setup() {
    const route = useRoute()
    const homestay = ref(null)
    const reviews = ref([])
    const loading = ref(true)
    const reviewCustomers = ref({})
    const homestayId = parseInt(route.params.homestayId, 10)
    const selectedStarFilter = ref(null)
    const isReviewModalVisible = ref(false)

    const fetchData = async () => {
      try {
        loading.value = true
        const homestayRes = await getHomeStayById(homestayId)
        homestay.value = homestayRes.data

        const reviewsRes = await getAllDanhGia()
        const filteredForHomestay = reviewsRes.data.filter(
          (r) => r.homeStayId == homestayId && r.trangThai !== false,
        )
        reviews.value = filteredForHomestay.map((serverReview) => ({
          ...serverReview,
          images: serverReview.anhDanhGias || [],
          likes: 0,
          isLiked: false,
        }))

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

    const getReviewCustomerName = (customerId) => reviewCustomers.value[customerId] || 'Khách hàng'

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

    const setStarFilter = (stars) => {
      selectedStarFilter.value = stars
    }

    const averageRating = computed(() => {
      if (!reviews.value || reviews.value.length === 0) return 0
      const totalStars = reviews.value.reduce((acc, review) => acc + review.diemSo, 0)
      return (totalStars / reviews.value.length).toFixed(1)
    })

    const filteredReviews = computed(() => {
      if (selectedStarFilter.value !== null) {
        const star = selectedStarFilter.value
        if (star === 5) return reviews.value.filter((review) => review.diemSo === 5)
        return reviews.value.filter((review) => review.diemSo >= star && review.diemSo < star + 1)
      }
      return reviews.value
    })

    const toggleLike = (review) => {
      if (review.isLiked) {
        review.likes--
      } else {
        review.likes++
      }
      review.isLiked = !review.isLiked
    }

    const openAddReviewModal = () => {
      isReviewModalVisible.value = true
    }
    const closeReviewModal = () => {
      isReviewModalVisible.value = false
    }
    const submitReview = () => {
      /* Logic gửi đánh giá */
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
      averageRating,
      filteredReviews,
      isReviewModalVisible,
      openAddReviewModal,
      closeReviewModal,
      submitReview,

      toggleLike,
    }
  },
}
</script>

<style scoped>
/* Copying styles from the previous clean version */
.review-details-container {
  padding: 20px;
  width: 800px;
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
.review-filter-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}
.review-filter-controls span {
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
.review-filter-controls button:hover:not(.active) {
  background-color: #f0f0f0;
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
}
.review-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}
.review-user-info {
  display: flex;
  align-items: flex-start;
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
.username-link {
  text-decoration: none;
  color: #2d3748;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;
  display: inline-block;
}
.username-link:hover {
  text-decoration: underline;
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
.review-actions-top {
  flex-shrink: 0;
}
.like-button {
  background: #f1f1f1;
  border: 1px solid #e0e0e0;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.like-button:hover {
  background-color: #e7e7e7;
}
.like-button.liked {
  background-color: #e3f2fd;
  color: #1e88e5;
  border-color: #bbdefb;
}
.like-button .fa-thumbs-up {
  transition: transform 0.2s;
}
.like-button.liked .fa-thumbs-up {
  transform: scale(1.1);
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
}
.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px 30px;
  width: 90%;
  max-width: 500px;
}
.close-modal-btn {
  float: right;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
