<template>
  <div class="review-details-container">
    <div class="page-header">
      <router-link :to="{ name: 'admin-danh-gia' }" class="back-link"><i class="fas fa-arrow-left"></i> Quay lại</router-link>
      <h1 v-if="homestay">Đánh giá cho {{ homestay.tenHomestay }}</h1>
      <h1 v-else>Đang tải...</h1>
    </div>

    <div v-if="!loading && reviews.length > 0" class="average-rating-container">
      <span class="average-score">{{ averageRating }}</span>
      <div class="rating-stars">
        <template v-for="n in 5" :key="n">
            <i v-if="averageRating >= n" class="fas fa-star filled"></i>
            <i v-else-if="averageRating > n - 1 && averageRating < n" class="fas fa-star-half-alt filled"></i>
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
                <button @click="setStarFilter(null)" :class="{ active: selectedStarFilter === null }">Tất cả</button>
                <button @click="setStarFilter(5)" :class="{ active: selectedStarFilter === 5 }">5 Sao</button>
                <button @click="setStarFilter(4)" :class="{ active: selectedStarFilter === 4 }">4+ Sao</button>
                <button @click="setStarFilter(3)" :class="{ active: selectedStarFilter === 3 }">3+ Sao</button>
                <button @click="setStarFilter(2)" :class="{ active: selectedStarFilter === 2 }">2+ Sao</button>
                <button @click="setStarFilter(1)" :class="{ active: selectedStarFilter === 1 }">1+ Sao</button>
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
                  <img src="/public/images/default-avatar.png" alt="User avatar">
                </div>
                <div class="user-info">
                  <div class="username">{{ getReviewCustomerName(review.khachHangId) }}</div>
                  <div class="rating-stars">
                    <template v-for="n in 5" :key="n">
                      <i v-if="Math.floor(review.diemSo) >= n" class="fas fa-star filled"></i>
                      <i v-else-if="Math.floor(review.diemSo) === n-1 && (review.diemSo % 1) >= 0.5" class="fas fa-star-half-alt filled"></i>
                      <i v-else class="far fa-star"></i>
                    </template>
                  </div>
                </div>
              </div>
              <div class="card-top-actions">
                <div class="review-status-indicator" :class="review.isHidden ? 'status-hidden' : 'status-visible'">
                  {{ review.isHidden ? 'Đang ẩn' : 'Đang hiện' }}
                </div>
                <button @click="toggleLike(review.id)" class="like-button" :class="{ liked: review.isLiked }">
                  <i class="fas fa-thumbs-up"></i> Hữu ích ({{ review.likes }})
                </button>
              </div>
              <div class="review-metadata">
                <span class="review-date">{{ formatDate(review.thoiGianDanhGia) }}</span>
              </div>
              <div class="review-content">
                {{ review.noiDung }}
              </div>
              <div class="review-actions">
                <button @click="hideReview(review.id)" class="action-button hide-button">
                  <i :class="review.isHidden ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                  {{ review.isHidden ? 'Hiện' : 'Ẩn' }}
                </button>
                <button @click="deleteReview(review.id)" class="action-button delete-button">
                  <i class="fas fa-trash-alt"></i> Xoá
                </button>
              </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getHomeStayById } from '@/Service/HomeStayService';
import { getAllDanhGia } from '@/Service/DanhGiaService';
import { getKhachHangById } from '@/Service/khachHangService';

export default {
  name: 'ReviewDetails',
  setup() {
    const route = useRoute();
    const homestay = ref(null);
    const reviews = ref([]);
    const loading = ref(true);
    const reviewCustomers = ref({});
    const homestayId = route.params.homestayId;
    const selectedStarFilter = ref(null);
    const visibilityFilter = ref('all'); // 'all', 'visible', 'hidden'

    const fetchData = async () => {
      try {
        loading.value = true;

        // Fetch homestay details
        const homestayRes = await getHomeStayById(homestayId);
        homestay.value = homestayRes.data;

        // Fetch all reviews and filter
        const reviewsRes = await getAllDanhGia();
        const filteredReviews = reviewsRes.data.filter(r => r.homeStayId == homestayId);

        // Add state properties to each review
        reviews.value = filteredReviews.map(r => ({ ...r, isHidden: false, isDeleted: false, likes: 0, isLiked: false }));

        // Fetch customer names for the reviews
        const customerIds = [...new Set(filteredReviews.map(r => r.khachHangId))];
        const customerPromises = customerIds.map(id => {
          if (!reviewCustomers.value[id]) {
            return getKhachHangById(id).then(res => {
              reviewCustomers.value[id] = res.data.tenKhachHang;
            }).catch(err => console.error(`Error fetching customer ${id}:`, err));
          }
          return Promise.resolve();
        });
        await Promise.all(customerPromises);

      } catch (error) {
        console.error("Error fetching review details:", error);
      } finally {
        loading.value = false;
      }
    };

    const getReviewCustomerName = (customerId) => {
      return reviewCustomers.value[customerId] || 'Khách hàng ẩn danh';
    };

    const setStarFilter = (stars) => {
      selectedStarFilter.value = stars;
    };

    const hideReview = (reviewId) => {
      const review = reviews.value.find(r => r.id === reviewId);
      if (review) {
        review.isHidden = !review.isHidden;
      }
    };

    const deleteReview = (reviewId) => {
      const review = reviews.value.find(r => r.id === reviewId);
      if (review) {
        review.isDeleted = true;
      }
    };

    const toggleLike = (reviewId) => {
      const review = reviews.value.find(r => r.id === reviewId);
      if (review) {
        if (review.isLiked) {
          review.likes--;
        } else {
          review.likes++;
        }
        review.isLiked = !review.isLiked;
      }
    };

    const averageRating = computed(() => {
      if (!reviews.value || reviews.value.length === 0) {
        return 0;
      }
      const totalStars = reviews.value.reduce((acc, review) => acc + review.diemSo, 0);
      return (totalStars / reviews.value.length).toFixed(1);
    });

    const filteredReviews = computed(() => {
      // 1. Filter by deletion status
      let tempReviews = reviews.value.filter(r => !r.isDeleted);

      // 2. Filter by visibility status
      if (visibilityFilter.value === 'visible') {
        tempReviews = tempReviews.filter(r => !r.isHidden);
      } else if (visibilityFilter.value === 'hidden') {
        tempReviews = tempReviews.filter(r => r.isHidden);
      }

      // 3. Filter by star rating
      if (selectedStarFilter.value !== null) {
        const minRating = selectedStarFilter.value;
        if (minRating === 5) {
          return tempReviews.filter(review => review.diemSo === 5);
        }
        const maxRating = minRating + 1;
        return tempReviews.filter(review =>
          review.diemSo >= minRating && review.diemSo < maxRating
        );
      }

      return tempReviews;
    });

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    onMounted(fetchData);

    return {
      homestay,
      reviews,
      loading,
      getReviewCustomerName,
      formatDate,
      selectedStarFilter,
      setStarFilter,
      hideReview,
      deleteReview,
      toggleLike,
      averageRating,
      visibilityFilter,
      filteredReviews
    };
  }
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

.loading-state, .empty-state {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.empty-state i, .loading-state i {
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

.review-filter-controls span, .select-filter label {
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
  transition: opacity 0.3s ease, background-color 0.3s ease;
}

.danh-gia-card.shopee-style.is-hidden {
  opacity: 0.6;
  background-color: #f9f9f9;
}

.review-header { display: flex; align-items: flex-start; margin-bottom: 10px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; margin-right: 12px; flex-shrink: 0; }
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.user-info { flex-grow: 1; }
.username { font-weight: 600; color: #333; font-size: 15px; margin-bottom: 4px; }
.rating-stars { display: flex; gap: 2px; }
.rating-stars i { color: #ccc; font-size: 14px; }
.rating-stars i.filled { color: #ee4d2d; }
.review-metadata { margin-left: 52px; color: #757575; font-size: 13px; margin-bottom: 12px; }
.review-content { margin-left: 52px; color: #222; font-size: 14px; line-height: 1.6; }
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
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
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
    font-size: 12px;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 15px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.status-visible {
    color: #27ae60;
    background-color: #eafaf1;
    border: 1px solid #a3e9a4;
}
.status-hidden {
    color: #c0392b;
    background-color: #fdedec;
    border: 1px solid #f5b7b1;
}
</style>
