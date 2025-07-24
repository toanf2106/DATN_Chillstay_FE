<template>
  <div class="news-view-container">
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

    <!-- Page Header -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Tin Tức & Sự Kiện</h1>
        <p class="page-subtitle">Cập nhật những thông tin mới nhất về du lịch và các sự kiện tại ChillStay.</p>
      </div>
    </section>

    <!-- News Content Section -->
    <section class="news-content-section">
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

        <!-- News Grid -->
        <div v-else class="news-grid">
          <div v-for="news in displayedNews" :key="news.id" class="news-card" @click="navigateToNews(news.id)">
            <div class="card-image-container">
              <img :src="news.anhBia || 'https://placehold.co/400x250/e9ecef/cccccc?text=ChillStay'" :alt="news.tieuDe"
                class="card-image" />
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ news.tieuDe }}</h3>
              <p class="card-excerpt">{{ truncateText(news.noiDung, 80) }}</p>
              <div class="card-meta">
                <span class="card-date">{{ formatDate(news.ngayDang) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && !error && totalPages > 1" class="pagination-container">
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
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getAllTinTuc } from '@/Service/TinTucService';
import { useRouter } from 'vue-router';

const allNews = ref([]);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const router = useRouter();

const currentPage = ref(1);
const itemsPerPage = 9; // 3x3 grid

const fetchNews = async () => {
  loading.value = true;
  error.value = false;
  try {
    const response = await getAllTinTuc();
    if (response && response.data) {
      allNews.value = response.data
        .filter(item => item.trangThai === true)
        .sort((a, b) => new Date(b.ngayDang) - new Date(a.ngayDang));
    } else {
      throw new Error('Không có dữ liệu tin tức');
    }
  } catch (err) {
    errorMessage.value = err.message || 'Đã xảy ra lỗi khi tải tin tức';
    error.value = true;
    console.error('Error fetching news:', err);
  } finally {
    loading.value = false;
  }
};

const totalPages = computed(() => Math.ceil(allNews.value.length / itemsPerPage));

const displayedNews = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return allNews.value.slice(startIndex, endIndex);
});

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

watch(allNews, () => {
  currentPage.value = 1;
});

const navigateToNews = (id) => {
  router.push(`/tin-tuc/${id}`);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const truncateText = (html, maxLength) => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const imageWrappers = tempDiv.querySelectorAll('.article-image, .image-container-editable');
  imageWrappers.forEach(wrapper => wrapper.remove());
  let text = tempDiv.textContent || tempDiv.innerText || '';
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

onMounted(() => {
  fetchNews();
});
</script>

<style scoped>
.news-view-container {
  background-color: #ffffff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* Breadcrumb */
.breadcrumb-container {
  background-color: #f8f9fa;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.breadcrumb a {
  color: #555;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb a:hover {
  color: #007bff;
}

.breadcrumb .separator {
  margin: 0 10px;
  color: #999;
}

.breadcrumb .current {
  color: #333;
  font-weight: 500;
}

/* Page Header */
.page-header {
  text-align: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
}

/* News Content Section */
.news-content-section {
  padding: 50px 0;
}

/* News Grid */
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

/* News Card */
.news-card {
  background-color: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.news-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.card-image-container {
  width: 100%;
  padding-top: 65%;
  /* Aspect ratio for the image */
  position: relative;
  overflow: hidden;
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.news-card:hover .card-image {
  transform: scale(1.05);
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #343a40;
  margin: 0 0 10px;
  line-height: 1.4;
  height: 5.25rem;
  /* Fallback for older browsers */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  /* Limit to 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-excerpt {
  font-size: 0.95rem;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 15px;
  flex-grow: 1;
}

.card-meta {
  margin-top: auto;
}

.card-date {
  font-size: 0.85rem;
  color: #888;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  gap: 10px;
}

.pagination-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #dee2e6;
  color: #007bff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.pagination-btn.active {
  background-color: #007bff;
  color: #fff;
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.4);
}

.pagination-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: #6c757d;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 2.2rem;
  }
}

/* Loading and Error States */
.loading-indicator,
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 0;
  width: 100%;
}

.loading-indicator .spinner-border {
  width: 3.5rem;
  height: 3.5rem;
  color: #007bff;
}

.error-message {
  color: #dc3545;
}

.error-message i {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.error-message p {
  font-size: 1.1rem;
}

.retry-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  margin-top: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}
</style>
