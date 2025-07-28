<template>
  <div class="news-detail-container">
    <!-- Breadcrumb -->
    <div class="breadcrumb-container">
      <div class="container">
        <nav class="breadcrumb">
          <router-link to="/">Trang chủ</router-link>
          <span class="separator">/</span>
          <router-link to="/tin-tuc">Tin tức</router-link>
          <span class="separator">/</span>
          <span class="current">{{ news?.tieuDe || 'Chi tiết tin tức' }}</span>
        </nav>
      </div>
    </div>

    <!-- Content Section -->
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
          <button @click="() => fetchNewsDetail(route.params.id)" class="retry-btn">Thử lại</button>
        </div>

        <!-- News Detail Content -->
        <div v-else-if="news" class="row">
          <!-- Main Content Column -->
          <div class="col-lg-8 content-main">
            <h1 class="news-title">{{ news.tieuDe }}</h1>

            <div class="news-meta">
              <div class="meta-item">
                <i class="fas fa-calendar-alt"></i>
                <span>Ngày đăng: {{ formatDate(news.ngayDang) }}</span>
              </div>
              <div v-if="news.ngaySua" class="meta-item">
                <i class="fas fa-edit"></i>
                <span>Ngày sửa cuối cùng: {{ formatDate(news.ngaySua) }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-user"></i>
                <span>{{ news.tenTaiKhoan || 'Admin' }}</span>
              </div>
            </div>

            <!-- Article Content -->
            <div class="article-content" v-html="processedContent"></div>
          </div>

          <!-- Related News Sidebar -->
          <aside class="col-lg-4 sidebar">
            <div class="related-news-widget">
              <h3 class="widget-title">Tin tức liên quan</h3>
              <div v-if="relatedNews.length > 0" class="related-news-list">
                <router-link v-for="related in relatedNews" :key="related.id" :to="`/tin-tuc/${related.id}`"
                  class="related-news-item">
                  <div class="related-news-image">
                    <img :src="fixImageUrl(related.anhBia)" :alt="related.tieuDe" />
                  </div>
                  <div class="related-news-info">
                    <h4 class="related-news-title">{{ related.tieuDe }}</h4>
                    <span class="related-news-date"><i class="fas fa-calendar-alt"></i> {{ formatDate(related.ngayDang)
                    }}</span>
                  </div>
                </router-link>
              </div>
              <div v-else class="no-related-news">
                <p>Không có tin tức liên quan.</p>
              </div>
            </div>
          </aside>
        </div>

        <!-- Not Found -->
        <div v-else class="not-found">
          <i class="fas fa-newspaper"></i>
          <h2>Không tìm thấy tin tức</h2>
          <p>Tin tức bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <router-link to="/tin-tuc" class="back-btn">Quay lại trang tin tức</router-link>
        </div>
      </div>
    </section>

    <!-- Lightbox for any image -->
    <div class="image-viewer" v-if="lightboxImage" @click="closeLightbox">
      <button class="close-button" @click="closeLightbox">&times;</button>
      <div class="image-container" @click.stop>
        <img :src="fixImageUrl(lightboxImage)" :alt="news?.tieuDe" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { getTinTucById, getAllTinTuc } from '@/Service/TinTucService';
import api from '@/utils/api';

const route = useRoute();

const news = ref(null);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const lightboxImage = ref(null);
const relatedNews = ref([]);
const refreshInterval = ref(null);

// Thời gian làm mới tin tức liên quan (30 giây)
const REFRESH_INTERVAL_MS = 30000;

const fixImageUrl = (url) => {
  if (!url) return 'https://placehold.co/100x70/e9ecef/0d6efd?text=ChillStay';
  if (url.startsWith('http') || url.startsWith('blob:')) {
    return url;
  }
  return new URL(url, api.defaults.baseURL).href;
};

const fetchAllNews = async () => {
  try {
    const response = await getAllTinTuc();
    if (response && response.data) {
      // Lọc ra các tin tức có trạng thái active và không phải tin tức hiện tại
      const filteredNews = response.data
        .filter(item => item.id !== parseInt(route.params.id) && item.trangThai);

      // Xáo trộn mảng tin tức để hiển thị ngẫu nhiên
      const shuffledNews = [...filteredNews].sort(() => Math.random() - 0.5);

      // Lấy tối đa 5 tin tức
      relatedNews.value = shuffledNews.slice(0, 5);
    }
  } catch (err) {
    console.error('Error fetching all news:', err);
  }
};

const fetchNewsDetail = async (id) => {
  if (!id || isNaN(id)) {
    error.value = true;
    errorMessage.value = 'ID tin tức không hợp lệ.';
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = false;
  try {
    const response = await getTinTucById(id);
    if (response && response.data) {
      news.value = response.data;
    } else {
      throw new Error('Không tìm thấy tin tức.');
    }
  } catch (err) {
    error.value = true;
    errorMessage.value = err.message || 'Đã xảy ra lỗi khi tải tin tức.';
    console.error(`Error fetching news detail for ID ${id}:`, err);
    news.value = null;
  } finally {
    loading.value = false;
  }
};

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

onMounted(async () => {
  await fetchNewsDetail(route.params.id);
  await fetchAllNews();

  // Thiết lập interval để làm mới tin tức liên quan
  refreshInterval.value = setInterval(fetchAllNews, REFRESH_INTERVAL_MS);
});

onBeforeUnmount(() => {
  // Xóa interval khi component unmount
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});

watch(() => route.params.id, async (newId) => {
  if (newId) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await fetchNewsDetail(newId);
    await fetchAllNews();

    // Reset interval khi chuyển tin tức
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
    }
    refreshInterval.value = setInterval(fetchAllNews, REFRESH_INTERVAL_MS);
  }
});

const processedContent = computed(() => {
  if (!news.value || !news.value.noiDung) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = news.value.noiDung;

  // Xóa các nút xóa ảnh
  tempDiv.querySelectorAll('.image-delete-btn, button[class*="btn-danger"]').forEach(el => el.remove());

  // Xử lý tất cả các ảnh
  const images = tempDiv.querySelectorAll('img');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('data:')) {
      img.setAttribute('src', fixImageUrl(src));
      img.style.cursor = 'pointer';
      img.onclick = () => openLightbox(img.src);

      // Vô hiệu hóa việc nhập chú thích ảnh
      img.setAttribute('title', '');
      img.setAttribute('alt', news.value.tieuDe || '');

      // Xóa các trường nhập liệu chú thích nếu có
      const parent = img.parentNode;
      if (parent) {
        const captionInputs = parent.querySelectorAll('input[type="text"], textarea');
        captionInputs.forEach(input => {
          input.setAttribute('disabled', 'disabled');
          input.style.display = 'none';
        });
      }
    }
  });

  // Vô hiệu hóa tất cả các trường nhập chú thích
  tempDiv.querySelectorAll('.caption-input, .image-caption, [contenteditable="true"]').forEach(el => {
    el.setAttribute('contenteditable', 'false');
    el.style.pointerEvents = 'none';
    el.style.userSelect = 'none';
  });

  return tempDiv.innerHTML;
});

const openLightbox = (src) => {
  lightboxImage.value = src;
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  lightboxImage.value = null;
  document.body.style.overflow = '';
};

</script>

<style scoped>
.news-detail-container {
  background-color: #fff;
  font-family: 'Roboto', sans-serif;
  color: #333;
}

/* Breadcrumb */
.breadcrumb-container {
  background-color: #f8f9fa;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 15px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb .separator {
  margin: 0 8px;
  color: #6c757d;
}

.breadcrumb .current {
  color: #343a40;
  font-weight: 500;
}

/* Content Section */
.news-content-section {
  padding: 40px 0;
}

.content-main {
  /* padding-right: 30px; */
  /* Đã xóa để làm rộng khu vực nội dung */
}

.news-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 20px;
  line-height: 1.3;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-item i {
  color: #007bff;
}

.article-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #34495e;
}

:deep(.article-content p) {
  margin-bottom: 1.5rem;
}

:deep(.article-content img) {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  /* Tăng độ bo tròn */
  margin: 2.5rem auto;
  display: block;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
  /* Tăng cường hiệu ứng đổ bóng */
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

:deep(.article-content img:hover) {
  transform: translateY(-5px);
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.15);
  /* Hiệu ứng hover rõ nét hơn */
}

:deep(.article-content h2),
:deep(.article-content h3) {
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

/* Sidebar */
.sidebar {
  padding-left: 20px;
  border-left: 1px solid #e9ecef;
}

@media (max-width: 991px) {
  .sidebar {
    padding-left: 0;
    border-left: none;
    margin-top: 40px;
    padding-top: 40px;
    border-top: 1px solid #e9ecef;
  }
}

.related-news-widget {
  position: sticky;
  top: 20px;
}

.widget-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 25px;
  padding-bottom: 10px;
  border-bottom: 3px solid #007bff;
  display: inline-block;
}

.related-news-item {
  display: flex;
  gap: 15px;
  text-decoration: none;
  color: inherit;
  margin-bottom: 20px;
  transition: all 0.2s ease-in-out;
}

.related-news-item:hover .related-news-title {
  color: #007bff;
}

.related-news-item:hover .related-news-image img {
  transform: scale(1.05);
}

.related-news-image {
  flex-shrink: 0;
  width: 100px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
}

.related-news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.related-news-title {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-news-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.related-news-date i {
  margin-right: 5px;
}

/* Loading and Error States */
.loading-indicator,
.error-message,
.not-found {
  text-align: center;
  padding: 60px 0;
}

.error-message,
.not-found {
  color: #6c757d;
}

/* Image Viewer */
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 25px;
  font-size: 2.5rem;
  color: #fff;
  opacity: 0.8;
  background: none;
  border: none;
  cursor: pointer;
}

.image-container img {
  max-width: 90vw;
  max-height: 90vh;
}
</style>
