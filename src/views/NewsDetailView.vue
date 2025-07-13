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
          <button @click="fetchNewsDetail" class="retry-btn">Thử lại</button>
        </div>

        <!-- News Detail Content -->
        <div v-else-if="news" class="news-detail-content">
          <div class="row">
            <div class="col-lg-8 content-main">
              <h1 class="news-title">{{ news.tieuDe }}</h1>

              <div class="news-meta">
                <span class="news-date"><i class="fas fa-calendar-alt"></i> {{ formatDate(news.ngayDang) }}</span>
                <span class="news-author"><i class="fas fa-user"></i> {{ news.tenTaiKhoan || 'ChillStay' }}</span>
              </div>

              <div class="news-main-image" v-if="news.anhBia">
                <img :src="fixImageUrl(news.anhBia)" :alt="news.tieuDe" />
                <div class="image-caption">{{ news.tieuDe }}</div>
              </div>

              <!-- Article Content with Interspersed Images -->
              <div class="article-content">
                <!-- If we have structured content, render it -->
                <template v-if="formattedContent && formattedContent.length > 0">
                  <div v-for="(block, index) in formattedContent" :key="index" :class="block.type">
                    <!-- Text block -->
                    <div v-if="block.type === 'text'" class="text-block" v-html="block.content"></div>

                    <!-- Image block -->
                    <div v-else-if="block.type === 'image'" class="image-block">
                      <img :src="block.src" :alt="block.alt || ''" @click="openLightbox(block.src)" />
                      <div class="image-caption" v-if="block.caption">{{ block.caption }}</div>
                    </div>
                  </div>
                </template>

                <!-- Fallback if no structured content -->
                <div v-else class="text-block">
                  <div v-html="processedContent"></div>

                  <!-- Intersperse a few images from the gallery -->
                  <template v-if="newsImages && newsImages.length > 0">
                    <div v-for="(image, idx) in firstThreeImages" :key="idx" class="image-block">
                      <img :src="fixImageUrl(image.duongDanAnh)" :alt="news.tieuDe" @click="openImageViewer(idx)" />
                      <div class="image-caption">{{ news.tieuDe }} - Hình ảnh {{ idx + 1 }}</div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- If there are more images, show them in the gallery -->
              <div class="news-gallery" v-if="newsImages && newsImages.length > 3">
                <h3 class="gallery-title">Hình ảnh khác</h3>
                <div class="gallery-grid">
                  <div v-for="(image, index) in remainingImages" :key="index" class="gallery-item">
                    <img :src="fixImageUrl(image.duongDanAnh)" :alt="`Hình ảnh ${index + 4}`"
                      @click="openImageViewer(index + 3)" />
                    <div class="image-overlay">
                      <button class="view-image-btn">
                        <i class="fas fa-search-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-4 sidebar">
              <div class="sidebar-section">
                <h3 class="sidebar-title">Tin tức liên quan</h3>
                <div class="related-list">
                  <div v-for="item in relatedNews" :key="item.id" class="related-item" @click="navigateToNews(item.id)">
                    <div class="related-image">
                      <img
                        :src="fixImageUrl(item.anhBia) || 'https://placehold.co/400x250/e9ecef/0d6efd?text=ChillStay+News'"
                        :alt="item.tieuDe" />
                    </div>
                    <div class="related-content">
                      <h4>{{ item.tieuDe }}</h4>
                      <span class="related-date"><i class="fas fa-calendar-alt"></i> {{ formatDate(item.ngayDang)
                        }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="sidebar-section cta-section">
                <h3 class="cta-title">Khám phá các homestay</h3>
                <p class="cta-text">Tìm kiếm và đặt những homestay tuyệt vời ngay hôm nay!</p>
                <router-link to="/homestays" class="cta-button">
                  <i class="fas fa-home"></i> Xem homestay
                </router-link>
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
import { useRoute, useRouter } from 'vue-router';
import { getTinTucById, getAllTinTuc } from '@/Service/TinTucService';
import { getAnhTinTucByTinTucId } from '@/Service/AnhTinTucService';
import api from '@/utils/api';

const route = useRoute();
const router = useRouter();
const news = ref(null);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const allNews = ref([]);
const showImageViewer = ref(false);
const currentImageIndex = ref(0);
const newsImages = ref([]);
const lightboxImage = ref(null); // For opening any image in lightbox

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

    // Lấy tất cả tin tức để hiển thị tin tức liên quan
    await fetchAllNews();
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

// Lấy tất cả tin tức để hiển thị tin tức liên quan
const fetchAllNews = async () => {
  try {
    const response = await getAllTinTuc();
    if (response && response.data) {
      allNews.value = response.data.filter(item => item.trangThai === true && item.id !== news.value.id);
    }
  } catch (err) {
    console.error('Error fetching all news:', err);
  }
};

// Tin tức liên quan (3 tin tức ngẫu nhiên)
const relatedNews = computed(() => {
  if (allNews.value.length <= 3) {
    return allNews.value;
  }

  // Lấy ngẫu nhiên 3 tin tức
  const shuffled = [...allNews.value].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
});

// Hình ảnh hiện tại trong image viewer
const currentImage = computed(() => {
  if (!newsImages.value || newsImages.value.length === 0) {
    return '';
  }
  return newsImages.value[currentImageIndex.value].duongDanAnh;
});

// Mở image viewer
const openImageViewer = (index) => {
  currentImageIndex.value = index;
  showImageViewer.value = true;
  document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
};

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

// Chuyển hướng đến tin tức khác
const navigateToNews = (id) => {
  if (id === Number(route.params.id)) return;
  router.push(`/tin-tuc/${id}`);
};

// Lấy dữ liệu khi component được tạo
onMounted(() => {
  fetchNewsDetail();
});

// First three images for display in the article
const firstThreeImages = computed(() => {
  if (!newsImages.value || newsImages.value.length === 0) return [];
  return newsImages.value.slice(0, 3);
});

// Remaining images for the gallery
const remainingImages = computed(() => {
  if (!newsImages.value || newsImages.value.length <= 3) return [];
  return newsImages.value.slice(3);
});

// Processed content with fixed image URLs
const processedContent = computed(() => {
  if (!news.value || !news.value.noiDung) return '';

  // Process the content to fix image URLs
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = news.value.noiDung;

  // Remove any red buttons or elements
  const redElements = tempDiv.querySelectorAll('button[style*="background-color: red"], button.btn-danger, .fa-trash, [style*="background-color: red"], [class*="btn-danger"]');
  redElements.forEach(el => el.remove());

  // Also remove any elements with class containing "btn" that might be red icons
  const btnElements = tempDiv.querySelectorAll('[class*="btn"]');
  btnElements.forEach(btn => {
    if (btn.classList.contains('btn-danger') ||
      (btn.style && btn.style.backgroundColor && btn.style.backgroundColor.includes('red'))) {
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
    }
  });

  return tempDiv.innerHTML;
});

// Formatted content for articles with interspersed images
const formattedContent = computed(() => {
  if (!news.value || !news.value.noiDung || !newsImages.value) return [];

  // Check if the content already has HTML tags for images
  if (news.value.noiDung.includes('<img')) {
    // Process the content to fix image URLs
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = news.value.noiDung;

    // Remove any red buttons or elements
    const redElements = tempDiv.querySelectorAll('button[style*="background-color: red"], button.btn-danger, .fa-trash, [style*="background-color: red"], [class*="btn-danger"]');
    redElements.forEach(el => el.remove());

    // Also remove any elements with class containing "btn" that might be red icons
    const btnElements = tempDiv.querySelectorAll('[class*="btn"]');
    btnElements.forEach(btn => {
      if (btn.classList.contains('btn-danger') ||
        (btn.style && btn.style.backgroundColor && btn.style.backgroundColor.includes('red'))) {
        btn.remove();
      }
    });

    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        // Fix image URL using our helper function
        const fixedSrc = fixImageUrl(src);
        img.setAttribute('src', fixedSrc);
      }
    });

    // Return the processed content
    return [{
      type: 'text',
      content: tempDiv.innerHTML
    }];
  }

  // For now, we'll create a simple algorithm to intersperse images
  // In a real app, you might have a structured format stored in the database
  const content = [];

  // Split content into paragraphs
  const paragraphs = news.value.noiDung.split('\n\n').filter(p => p.trim() !== '');

  // If we have multiple paragraphs and images, intersperse them
  if (paragraphs.length > 1 && newsImages.value.length > 0) {
    paragraphs.forEach((paragraph, index) => {
      // Add the paragraph
      content.push({
        type: 'text',
        content: paragraph.replace(/\n/g, '<br>')
      });

      // Add an image after some paragraphs if available
      if (index % 2 === 1 && newsImages.value[Math.floor(index / 2)]) {
        const image = newsImages.value[Math.floor(index / 2)];
        content.push({
          type: 'image',
          src: image.duongDanAnh,
          alt: news.value.tieuDe,
          caption: `${news.value.tieuDe} - Hình ảnh ${Math.floor(index / 2) + 1}`
        });
      }
    });

    return content;
  }

  // If there aren't multiple paragraphs or images, return empty array to use fallback
  return [];
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

  // Remove any elements with red background or red square icons
  const redElements = tempDiv.querySelectorAll('button[style*="background-color: red"], button.btn-danger, .fa-trash, [style*="background-color: red"], [class*="btn-danger"]');
  redElements.forEach(el => el.remove());

  // Also remove any square elements with class containing "btn" that might be red icons
  const squareButtons = tempDiv.querySelectorAll('button[class*="btn"]');
  squareButtons.forEach(btn => {
    // Check if it's a small square button that might be a delete/remove button
    if (btn.offsetWidth === btn.offsetHeight && btn.offsetWidth < 50) {
      btn.remove();
    }
  });

  const images = tempDiv.querySelectorAll('img');
  const imageUrls = [];

  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('data:')) {
      // Fix the image URL
      const fixedSrc = fixImageUrl(src);

      // Update the image src in the DOM
      img.setAttribute('src', fixedSrc);
      imageUrls.push(fixedSrc);
    }
  });

  // Update the content with fixed image URLs and removed red elements
  if (news.value && images.length > 0) {
    news.value.noiDung = tempDiv.innerHTML;
  }

  return imageUrls;
};
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

/* Container */
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 15px;
}

/* News Content Section */
.news-content-section {
  padding: 40px 0 60px;
  background-color: #f8f9fa;
}

/* Row and columns */
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.col-lg-8,
.col-lg-4 {
  position: relative;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
}

@media (min-width: 992px) {
  .col-lg-8 {
    flex: 0 0 66.666667%;
    max-width: 66.666667%;
  }

  .col-lg-4 {
    flex: 0 0 33.333333%;
    max-width: 33.333333%;
  }
}

/* News Detail Content */
.news-detail-content {
  margin-bottom: 30px;
}

.content-main {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.news-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 15px;
  line-height: 1.3;
}

.news-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
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

.news-main-image {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.news-main-image img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
}

.image-caption {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 15px;
  font-size: 0.9rem;
  text-align: center;
}

/* Gallery */
.news-gallery {
  margin-top: 40px;
}

.gallery-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2c3e50;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.gallery-item {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.gallery-item:hover {
  transform: translateY(-5px);
}

.gallery-item img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  transition: transform 0.5s;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-item .image-overlay {
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

.view-image-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.view-image-btn:hover {
  background: #ff6200;
  color: white;
  transform: scale(1.1);
}

/* Sidebar */
.sidebar {
  margin-top: 0;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
}

.sidebar-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.related-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
  transition: all 0.3s ease;
}

.related-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.related-item:hover {
  transform: translateX(5px);
}

.related-image {
  flex: 0 0 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.related-item:hover .related-image img {
  transform: scale(1.1);
}

.related-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.related-content h4 {
  font-size: 0.95rem;
  margin: 0 0 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s;
}

.related-item:hover .related-content h4 {
  color: #ff6200;
}

.related-date {
  color: #777;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.related-date i {
  color: #0096c7;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #4ddbff 0%, #0066cc 100%);
  color: white;
  text-align: center;
  border-radius: 12px;
}

.cta-title {
  color: white;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.cta-text {
  margin-bottom: 20px;
  font-size: 1rem;
}

.cta-button {
  display: inline-block;
  background: #ff6200;
  color: white;
  padding: 10px 25px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cta-button:hover {
  background: white;
  color: #0066cc;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
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
}

.image-container img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1010;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%) scale(1.1);
}

.nav-button.prev {
  left: 20px;
}

.nav-button.next {
  right: 20px;
}

.image-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* Article Content with Images */
.article-content {
  margin-bottom: 30px;
}

.text-block {
  margin-bottom: 25px;
  line-height: 1.8;
  color: #333;
  font-size: 1.1rem;
}

.text-block p {
  margin-bottom: 1rem;
}

.image-block {
  margin: 30px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
}

.image-block img {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.image-block:hover img {
  transform: scale(1.02);
}

.image-block .image-caption {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 15px;
  font-size: 0.9rem;
  text-align: center;
}

.article-content button.btn-danger,
.article-content .fa-trash,
.article-content [style*="background-color: red"],
.article-content [class*="btn-danger"],
.article-content button[style*="background-color: red"] {
  display: none !important;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .news-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {

  .content-main,
  .sidebar-section {
    padding: 20px;
  }

  .news-title {
    font-size: 1.5rem;
  }

  .news-meta {
    flex-direction: column;
    gap: 10px;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .gallery-item img {
    height: 150px;
  }

  .nav-button {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .related-image {
    flex: 0 0 70px;
    height: 50px;
  }
}

@media (max-width: 576px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .news-title {
    font-size: 1.3rem;
  }

  .breadcrumb .current {
    max-width: 150px;
  }

  .close-button {
    top: 10px;
    right: 10px;
    font-size: 2rem;
  }

  .nav-button {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .nav-button.prev {
    left: 10px;
  }

  .nav-button.next {
    right: 10px;
  }
}
</style>
