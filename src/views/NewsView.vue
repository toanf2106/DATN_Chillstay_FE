<template>
  <div class="news-container">
    <!-- Breadcrumb -->
    <div class="breadcrumb-container">
      <div class="container">
        <nav class="breadcrumb">
          <router-link to="/">Trang chủ</router-link>
          <span class="separator">/</span>
          <span class="current">Tin tức</span>
        </nav>
      </div>
    </div>

    <!-- Banner Section -->
    <section class="news-banner">
      <div class="container">
        <h1 class="page-title">Mộc Châu: Khám phá Sự đặc sắc và </h1>
        <h1 class="page-title"> Cập nhật tin tức mới nhất</h1>
        <p class="page-description">Mộc Châu: Sắc Màu Cao Nguyên – Khám phá và Cập nhật</p>
        <p class="page-description"> những điều thú vị từ vùng đất mộng mơ giữa đại ngàn.</p>
        <div class="banner-divider"></div>
      </div>
    </section>

    <!-- News Content Section -->
    <section class="news-content">
      <div class="container">
        <!-- Loading indicator -->
        <div v-if="loading" class="loading-indicator">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
        </div>

        <!-- Error message -->
        <div v-else-if="error" class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ errorMessage }}</p>
          <button @click="fetchNews" class="retry-btn">Thử lại</button>
        </div>

        <div v-else>
          <!-- Hàng tin tức 1 -->
          <div class="news-section">
            <div class="news-grid">
              <div v-for="news in displayedNews" :key="news.id" class="news-card" @click="navigateToNews(news.id)">
                <div class="news-image">
                  <img :src="news.anhBia || 'https://placehold.co/400x250/e9ecef/0d6efd?text=ChillStay+News'"
                    :alt="news.tieuDe" />
                  <div class="image-overlay">
                    <button class="view-btn">
                      <i class="fas fa-eye"></i> Xem chi tiết
                    </button>
                  </div>
                </div>
                <div class="news-body">
                  <h3 class="news-title">{{ news.tieuDe }}</h3>
                  <p class="news-excerpt">{{ truncateText(news.noiDung, 100) }}</p>
                  <div class="news-meta">
                    <span class="news-date"><i class="fas fa-calendar-alt"></i> {{ formatDate(news.ngayDang) }}</span>
                    <span class="news-author"><i class="fas fa-user"></i> {{ news.tenTaiKhoan || 'ChillStay' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Phân trang -->
          <div class="pagination-container">
            <button class="pagination-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </button>

            <button v-for="page in totalPages" :key="page" class="pagination-btn"
              :class="{ active: currentPage === page }" @click="changePage(page)">
              {{ page }}
            </button>

            <button class="pagination-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getAllTinTuc } from '@/Service/TinTucService';
import { useRouter } from 'vue-router';

// State variables
const allNews = ref([]);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const router = useRouter();

// Phân trang
const currentPage = ref(1);
const itemsPerPage = 9; // Hiển thị 9 tin tức mỗi trang (3 hàng x 3 cột)

// Fetch news data
const fetchNews = async () => {
  loading.value = true;
  error.value = false;

  try {
    const response = await getAllTinTuc();
    if (response && response.data) {
      // Filter only active news
      allNews.value = response.data.filter(item => item.trangThai === true);
    } else {
      throw new Error('Không có dữ liệu tin tức');
    }
  } catch (err) {
    error.value = true;
    errorMessage.value = err.message || 'Đã xảy ra lỗi khi tải tin tức';
    console.error('Error fetching news:', err);
  } finally {
    loading.value = false;
  }
};

// Tính tổng số trang
const totalPages = computed(() => {
  return Math.ceil(allNews.value.length / itemsPerPage);
});

// Lấy tin tức hiển thị cho trang hiện tại
const displayedNews = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return allNews.value.slice(startIndex, endIndex);
});

// Thay đổi trang
const changePage = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Reset về trang 1 khi dữ liệu thay đổi
watch(allNews, () => {
  currentPage.value = 1;
});

// Navigate to news detail
const navigateToNews = (id) => {
  router.push(`/tin-tuc/${id}`);
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Không xác định';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Không xác định';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Truncate text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength) + '...';
};

// Fetch data on component mount
onMounted(() => {
  fetchNews();
});
</script>

<style scoped>
/* Breadcrumb */
.breadcrumb-container {
  background-color: #f5f5f5;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.breadcrumb a {
  color: #0066cc;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb a:hover {
  color: #ff6200;
}

.breadcrumb .separator {
  margin: 0 10px;
  color: #999;
}

.breadcrumb .current {
  color: #666;
  font-weight: 500;
}

/* Banner Section */
.news-banner {
  background: white;
  color: rgb(14, 13, 13);
  padding: 40px 0;
  text-align: left;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 15px;
  line-height: 1.3;
  text-align: left;
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 0 15px;
  text-align: left;
}

.banner-divider {
  height: 3px;
  width: 60px;
  background-color: #4ddbff;
  margin: 20px 0;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* News Content */
.news-content {
  padding: 40px 0 60px;
  background-color: #f8f9fa;
}

/* News Section */
.news-section {
  margin-bottom: 30px;
}

/* News Grid */
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  padding: 0;
}

.news-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #f1f1f1;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.news-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.news-card:hover .news-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.news-card:hover .image-overlay {
  opacity: 1;
}

.view-btn {
  background: #ff6200;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-btn:hover {
  background: #4ddbff;
  transform: translateY(-2px);
}

.news-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.news-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 12px;
  color: #2c3e50;
  line-height: 1.4;
  transition: color 0.3s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card:hover .news-title {
  color: #ff6200;
}

.news-excerpt {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  flex-grow: 1;
  font-size: 0.95rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.news-date,
.news-author {
  color: #777;
  display: flex;
  align-items: center;
  gap: 5px;
}

.news-date i,
.news-author i {
  color: #0096c7;
}

/* Phân trang */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 8px;
}

.pagination-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: white;
  border: 1px solid #e0e0e0;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.pagination-btn.active {
  background-color: #ff6200;
  color: white;
  border-color: #ff6200;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .news-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .pagination-btn {
    min-width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
}

/* Loading and Error States */
.loading-indicator,
.error-message {
  text-align: center;
  padding: 50px 0;
}

.loading-indicator .spinner-border {
  width: 3rem;
  height: 3rem;
  color: #0096c7;
}

.error-message {
  color: #ff6200;
}

.error-message i {
  font-size: 2rem;
  margin-bottom: 15px;
}

.retry-btn {
  background: #ff6200;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  margin-top: 15px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #4ddbff;
  transform: translateY(-2px);
}
</style>
