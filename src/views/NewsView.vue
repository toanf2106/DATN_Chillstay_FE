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
        <!-- Remove search container -->

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

        <!-- News Grid -->
        <div v-else class="news-grid">
          <div v-for="news in paginatedNews" :key="news.id" class="news-card" @click="navigateToNews(news.id)">
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

          <!-- Empty state -->
          <div v-if="paginatedNews.length === 0" class="empty-state">
            <i class="fas fa-newspaper empty-icon"></i>
            <p>Không tìm thấy tin tức nào.</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" v-if="!loading && totalPages > 1">
          <nav aria-label="Page navigation">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 0 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                  <i class="fas fa-chevron-left"></i>
                </a>
              </li>
              <li v-for="page in displayedPages" :key="page" class="page-item"
                :class="{ active: page - 1 === currentPage }">
                <a class="page-link" href="#" @click.prevent="changePage(page - 1)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 || totalPages === 0 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                  <i class="fas fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAllTinTuc } from '@/Service/TinTucService';
import { useRouter } from 'vue-router';

// State variables
const allNews = ref([]);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const currentPage = ref(0);
const pageSize = ref(6); // 6 news items per page
const router = useRouter();

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

// Paginated news
const paginatedNews = computed(() => {
  const start = currentPage.value * pageSize.value;
  const end = start + pageSize.value;
  return allNews.value.slice(start, end);
});

// Total items
const totalItems = computed(() => {
  return allNews.value.length;
});

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / pageSize.value) || 1;
});

// Display 5 pages at a time in pagination
const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];

  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current < 2) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
    } else if (current > total - 3) {
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    } else {
      for (let i = current - 1; i <= current + 3; i++) {
        pages.push(i);
      }
    }
  }

  return pages;
});

// Change page
const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
  }
};

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
  padding: 50px 0;
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
  margin: 25px 0;
}

/* Container */
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 15px;
}

/* News Content */
.news-content {
  padding: 40px 0 60px;
  background-color: #f8f9fa;
}

/* News Grid */
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  padding: 10px;
}

.news-card {
  background: white;
  border-radius: 12px;
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
  height: 220px;
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
  font-size: 1.4rem;
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
}

.news-date,
.news-author {
  color: #777;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.news-date i,
.news-author i {
  color: #0096c7;
}

/* Loading and Error States */
.loading-indicator,
.error-message,
.empty-state {
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

.empty-state {
  color: #6c757d;
}

.empty-state .empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

/* Pagination */
.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  gap: 8px;
}

.page-item {
  margin: 0;
}

.page-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  color: #333;
  text-decoration: none;
  border: 1px solid #ddd;
  transition: all 0.3s ease;
  font-weight: 500;
}

.page-link:hover {
  background: #f0f7ff;
  border-color: #4ddbff;
}

.page-item.active .page-link {
  background: #ff6200;
  color: white;
  border-color: #ff6200;
}

.page-item.disabled .page-link {
  color: #aaa;
  cursor: not-allowed;
  background: #f5f5f5;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .news-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem;
  }

  .news-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .news-image {
    height: 180px;
  }
}

@media (max-width: 576px) {
  .news-banner {
    padding: 30px 0 20px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-description {
    font-size: 0.9rem;
  }

  .news-card {
    border-radius: 8px;
  }

  .news-body {
    padding: 15px;
  }

  .news-title {
    font-size: 1.2rem;
  }
}
</style>
