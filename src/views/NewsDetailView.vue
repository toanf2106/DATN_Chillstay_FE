<template>
  <div class="news-detail-container" @mousedown.prevent="allowCopyOnly" @contextmenu.prevent>
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
          <button @click="fetchNewsDetail" class="retry-btn">Thử lại</button>
        </div>

        <!-- News Detail Content -->
        <div v-else-if="news" class="news-detail-content">
          <div class="row">
            <div class="col-lg-12 content-main">
              <h1 class="news-title">{{ news.tieuDe }}</h1>

              <div class="news-meta">
                <span class="news-date"><i class="fas fa-calendar-alt"></i> {{ formatDate(news.ngayDang) }}</span>
                <span class="news-author"><i class="fas fa-user"></i> {{ news.tenTaiKhoan || 'ChillStay' }}</span>
              </div>

              <div class="news-main-image" v-if="news.anhBia">
                <img :src="fixImageUrl(news.anhBia)" :alt="news.tieuDe" />
                <div class="image-caption" v-if="!isSimpleImageId(news.tieuDe) && shouldDisplayCaption(news.tieuDe)">{{
                  getCustomCaption(news.tieuDe) }}</div>
              </div>

              <!-- Article Content with Interspersed Images -->
              <div class="article-content">
                <!-- Fallback if no structured content -->
                <div class="text-block">
                  <div v-html="processedContent"></div>
                </div>
              </div>
            </div>
          </div>
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

    <!-- Image Viewer Modal -->
    <div class="image-viewer" v-if="showImageViewer" @click="closeImageViewer">
      <button class="close-button" @click="closeImageViewer">&times;</button>
      <button class="nav-button prev" @click.stop="prevImage" v-if="newsImages && newsImages.length > 1">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="image-container" @click.stop>
        <img :src="fixImageUrl(currentImage)" :alt="news?.tieuDe" />
      </div>
      <button class="nav-button next" @click.stop="nextImage" v-if="newsImages && newsImages.length > 1">
        <i class="fas fa-chevron-right"></i>
      </button>
      <div class="image-counter" v-if="newsImages && newsImages.length > 1">
        {{ currentImageIndex + 1 }} / {{ newsImages.length }}
      </div>
    </div>

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
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getTinTucById } from '@/Service/TinTucService';
import { getAnhTinTucByTinTucId } from '@/Service/AnhTinTucService';
import api from '@/utils/api';

const route = useRoute();
const news = ref(null);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const showImageViewer = ref(false);
const currentImageIndex = ref(0);
const newsImages = ref([]);
const lightboxImage = ref(null); // For opening any image in lightbox

// Prevent editing but allow copying text
const allowCopyOnly = (event) => {
  // Allow selection for copying
  if (event.shiftKey || event.ctrlKey) {
    // Only allow selection if user is trying to copy (Ctrl or Shift key)
    return true;
  }

  // Prevent all other interactions
  return false;
};

// Function to check if a caption is just a simple image identifier (like "anh1", "anh2", etc.)
const isSimpleImageId = (text) => {
  if (!text) return false;

  // Check if it's in the format "anhX" where X is a number
  const simpleImagePattern = /^anh\d+$/i;
  return simpleImagePattern.test(text);
};

// Function to check if a specific caption should be displayed
const shouldDisplayCaption = (caption) => {
  if (!caption) return false;

  // Check if the caption matches exactly the one we want to hide
  if (caption === 'Mộc Châu - Điểm đến thiên nhiên hàng đầu thế giới') {
    return false;
  }

  return true;
};

// Function to get custom caption if needed
const getCustomCaption = (caption) => {
  if (!caption) return '';

  // Replace specific captions with custom ones
  if (caption.includes('Mộc Châu - Điểm đến thiên nhiên hàng đầu thế giới')) {
    return 'Cảnh đẹp Mộc Châu';
  }

  return caption;
};

// Function to fix image URLs
const fixImageUrl = (url) => {
  if (!url) return '';

  // If it's already an absolute URL, return it as is
  if (url.startsWith('http')) {
    return url;
  }

  // If it's a relative URL
  if (url.startsWith('/')) {
    // Add origin
    return window.location.origin + url;
  } else {
    // Add API base URL
    return api.defaults.baseURL + '/' + url;
  }
};

// Lấy chi tiết tin tức theo ID
const fetchNewsDetail = async () => {
  const id = route.params.id;
  if (!id) {
    error.value = true;
    errorMessage.value = 'ID tin tức không hợp lệ';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = false;

    const response = await getTinTucById(id);
    if (response && response.data) {
      news.value = response.data;
      // Sau khi có thông tin tin tức, lấy danh sách ảnh
      await fetchNewsImages(id);

      // Also extract images from HTML content
      if (news.value.noiDung && news.value.noiDung.includes('<img')) {
        const contentImages = extractImagesFromHtml(news.value.noiDung);
        if (contentImages.length > 0) {
          // Add these images to newsImages if they're not already there
          contentImages.forEach(imgUrl => {
            if (!newsImages.value.some(img => img.duongDanAnh === imgUrl)) {
              newsImages.value.push({
                duongDanAnh: imgUrl,
                tinTucId: id
              });
            }
          });
        }
      }
    } else {
      throw new Error('Không tìm thấy tin tức');
    }
  } catch (err) {
    error.value = true;
    errorMessage.value = err.message || 'Đã xảy ra lỗi khi tải tin tức';
    console.error('Error fetching news detail:', err);
  } finally {
    loading.value = false;
  }
};

// Lấy danh sách ảnh của tin tức
const fetchNewsImages = async (id) => {
  try {
    const response = await getAnhTinTucByTinTucId(id);
    if (response && response.data) {
      newsImages.value = response.data;
    }
  } catch (err) {
    console.error('Error fetching news images:', err);
  }
};

// Hình ảnh hiện tại trong image viewer
const currentImage = computed(() => {
  if (!newsImages.value || newsImages.value.length === 0) {
    return '';
  }
  return newsImages.value[currentImageIndex.value].duongDanAnh;
});

// Đóng image viewer
const closeImageViewer = () => {
  showImageViewer.value = false;
  document.body.style.overflow = ''; // Restore scrolling
};

// Hình ảnh trước
const prevImage = () => {
  if (!newsImages.value || newsImages.value.length === 0) {
    return;
  }
  currentImageIndex.value = (currentImageIndex.value - 1 + newsImages.value.length) % newsImages.value.length;
};

// Hình ảnh tiếp theo
const nextImage = () => {
  if (!newsImages.value || newsImages.value.length === 0) {
    return;
  }
  currentImageIndex.value = (currentImageIndex.value + 1) % newsImages.value.length;
};

// Định dạng ngày
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

// Lấy dữ liệu khi component được tạo
onMounted(() => {
  fetchNewsDetail();

  // Make all content non-editable
  document.addEventListener('selectstart', (e) => {
    // Only allow selection if Ctrl key is pressed (for copying)
    if (!e.ctrlKey) {
      e.preventDefault();
    }
  });

  // Prevent paste events
  document.addEventListener('paste', (e) => {
    if (e.target.closest('.news-detail-container')) {
      e.preventDefault();
    }
  });

  // Prevent drag events
  document.addEventListener('dragstart', (e) => {
    if (e.target.closest('.news-detail-container')) {
      e.preventDefault();
    }
  });

  // Prevent input events
  document.addEventListener('beforeinput', (e) => {
    if (e.target.closest('.news-detail-container')) {
      e.preventDefault();
    }
  });
});

// Processed content with fixed image URLs
const processedContent = computed(() => {
  if (!news.value || !news.value.noiDung) return '';

  // Process the content to fix image URLs
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = news.value.noiDung;

  // Remove all delete buttons and controls
  const deleteButtons = tempDiv.querySelectorAll('.image-delete-btn, .btn-danger, button[class*="btn-danger"], [data-image-id], button[style*="background-color: #dc3545"]');
  deleteButtons.forEach(el => el.remove());

  // Remove any red buttons or elements
  const redElements = tempDiv.querySelectorAll('button[style*="background-color: red"], .fa-trash, [style*="background-color: red"]');
  redElements.forEach(el => el.remove());

  // Remove any elements with class containing "btn" that might be delete buttons
  const btnElements = tempDiv.querySelectorAll('[class*="btn"]');
  btnElements.forEach(btn => {
    if (btn.classList.contains('btn-danger') ||
      (btn.style && btn.style.backgroundColor &&
        (btn.style.backgroundColor.includes('red') || btn.style.backgroundColor.includes('#dc3545'))) ||
      btn.closest('.article-image')) {
      btn.remove();
    }
  });

  // Fix image URLs
  const images = tempDiv.querySelectorAll('img');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('data:')) {
      // Fix image URL using our helper function
      const fixedSrc = fixImageUrl(src);
      img.setAttribute('src', fixedSrc);

      // Add click handler for lightbox
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openLightbox(fixedSrc));
    }
  });

  return tempDiv.innerHTML;
});

// Open any image in lightbox
const openLightbox = (src) => {
  lightboxImage.value = src;
  document.body.style.overflow = 'hidden';
};

// Close lightbox
const closeLightbox = () => {
  lightboxImage.value = null;
  document.body.style.overflow = '';
};

// Extract images from HTML content
const extractImagesFromHtml = (htmlContent) => {
  if (!htmlContent) return [];

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Remove any delete buttons and controls
  const deleteButtons = tempDiv.querySelectorAll('.image-delete-btn, .btn-danger, button[class*="btn-danger"], [data-image-id]');
  deleteButtons.forEach(el => el.remove());

  // Remove any elements with red background or red square icons
  const redElements = tempDiv.querySelectorAll('button[style*="background-color: red"], .fa-trash, [style*="background-color: red"]');
  redElements.forEach(el => el.remove());

  // Also remove any square elements with class containing "btn" that might be red icons
  const squareButtons = tempDiv.querySelectorAll('button[class*="btn"]');
  squareButtons.forEach(btn => {
    // Remove all buttons in the image container that could be delete buttons
    if (btn.closest('.article-image')) {
      btn.remove();
    }
  });

  // Get all image sources
  const images = tempDiv.querySelectorAll('img');
  const sources = [];
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('data:')) {
      sources.push(src);
    }
  });

  return sources;
};
</script>

<style scoped>
/* News Detail Page Styles */
.news-detail-container {
  background-color: #f8f9fa;
  font-family: 'Roboto', sans-serif;
  color: #333;
  min-height: 100vh;
  padding-bottom: 40px;
  user-select: text;
  /* Allow text selection but not editing */
}

.news-detail-container img,
.news-detail-container .image-block,
.news-detail-container .news-main-image {
  pointer-events: auto;
  /* Allow clicking on images for lightbox */
  user-select: none;
  /* Prevent image selection */
}

/* Strengthened styles to prevent editing */
.news-detail-container {
  user-select: none;
  /* Prevent selection by default */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: auto;
  /* Allow clicking for navigation */
  cursor: default;
}

/* Allow selection only when pressing Ctrl for copying */
.news-detail-container.allow-select {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.news-detail-container [contenteditable] {
  -webkit-user-modify: read-only;
  -moz-user-modify: read-only;
  user-modify: read-only;
  cursor: default;
}

.news-detail-container * {
  -webkit-user-modify: read-only !important;
  -moz-user-modify: read-only !important;
  user-modify: read-only !important;
}

.text-block {
  cursor: default !important;
  pointer-events: none;
}

.text-block a,
.breadcrumb a,
.back-btn {
  pointer-events: auto;
  /* Allow clicking links */
}

.news-detail-container input,
.news-detail-container textarea {
  pointer-events: none !important;
}

/* Breadcrumb */
.breadcrumb-container {
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
  padding: 10px 0;
  margin-bottom: 20px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
}

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
}

.breadcrumb a {
  color: #0096c7;
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb a:hover {
  color: #ff6200;
}

.separator {
  color: #adb5bd;
  margin: 0 8px;
}

.current {
  color: #6c757d;
  font-weight: 500;
}

/* Content Section */
.news-content-section {
  padding: 15px 0 30px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 15px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.col-lg-12 {
  position: relative;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
}

@media (min-width: 992px) {
  .col-lg-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

.news-detail-content {
  border-radius: 12px;
  overflow: hidden;
}

/* Main Content */
.content-main {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.news-title {
  font-size: 1.6rem;
  color: #2c3e50;
  margin-bottom: 12px;
  line-height: 1.3;
  font-weight: 700;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.news-date,
.news-author {
  display: flex;
  align-items: center;
  gap: 5px;
}

.news-date i,
.news-author i {
  color: #0096c7;
}

.news-main-image {
  margin: 0 -20px 20px;
  position: relative;
}

.news-main-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
  max-height: 400px;
}

.image-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 20px;
  font-size: 0.85rem;
}

/* Article Content */
.article-content {
  font-size: 0.95rem;
  line-height: 1.5;
}

.text-block {
  margin-bottom: 15px;
}

.text-block p {
  margin-bottom: 15px;
}

.image-block {
  margin: 15px 0;
  position: relative;
}

.image-block img {
  width: 100%;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.image-block img:hover {
  transform: scale(1.01);
}

/* Image Gallery */
.news-gallery {
  margin-top: 40px;
}

.gallery-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}

.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  height: 180px;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
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

.gallery-item:hover .image-overlay {
  opacity: 1;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.view-image-btn {
  background: none;
  border: 2px solid white;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-image-btn:hover {
  background: white;
  color: #0096c7;
}

/* Loading and Error States */
.loading-indicator,
.error-message,
.not-found {
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
  padding: 50px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
}

.error-message i {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.retry-btn {
  background: #ff6200;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 50px;
  margin-top: 15px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #0096c7;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.not-found {
  color: #6c757d;
  padding: 50px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
}

.not-found i {
  font-size: 3.5rem;
  margin-bottom: 15px;
  opacity: 0.5;
  color: #0096c7;
}

.not-found h2 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #2c3e50;
}

.back-btn {
  display: inline-block;
  background: #ff6200;
  color: white;
  padding: 10px 25px;
  border-radius: 50px;
  text-decoration: none;
  margin-top: 20px;
  transition: all 0.3s;
  font-weight: 500;
}

.back-btn:hover {
  background: #0096c7;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Image Viewer */
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 2.5rem;
  cursor: pointer;
  z-index: 1010;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.close-button:hover {
  opacity: 1;
}

.image-container {
  max-width: 90%;
  max-height: 90%;
  position: relative;
}

.image-container img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1010;
  transition: all 0.3s ease;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.prev {
  left: 20px;
}

.next {
  right: 20px;
}

.image-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .content-main {
    padding: 15px;
  }

  .news-title {
    font-size: 1.4rem;
  }

  .news-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .news-main-image {
    margin: 0 -15px 15px;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .news-title {
    font-size: 1.3rem;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .nav-button {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}
</style>
