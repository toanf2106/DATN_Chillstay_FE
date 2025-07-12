<template>
  <div class="home-container">
    <!-- Phần Hero -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            ChillStay <span class="highlight">Mộc Châu</span>
          </h1>
          <p class="hero-subtitle">
            Khám phá những homestay độc đáo, retreat yên bình tại trung tâm Mộc Châu với tầm nhìn núi non hùng vĩ, trải
            nghiệm eco-friendly và văn hóa địa phương.
          </p>
          <div class="hero-search">
            <div class="search-box">
              <div class="search-input">
                <i class="fas fa-search search-icon"></i>
                <input type="text" placeholder="Nhập tên homestay" v-model="searchName" />
              </div>
              <div class="search-input dropdown">
                <i class="fas fa-map-marker-alt search-icon"></i>
                <select v-model="searchLocation">
                  <option>Tất cả địa điểm</option>
                  <option>Trung tâm Mộc Châu</option>
                  <option>Bản Ba Phách</option>
                  <option>Thung lũng Nà Ka</option>
                </select>
              </div>
              <div class="search-input dropdown">
                <i class="fas fa-tag search-icon"></i>
                <select v-model="searchPrice">
                  <option>Tất cả mức giá</option>
                  <option>Dưới 500 nghìn</option>
                  <option>500 nghìn - 1 triệu</option>
                  <option>1 - 1.5 triệu</option>
                  <option>Trên 1.5 triệu</option>
                </select>
              </div>
              <button class="search-btn" @click="handleSearch">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Phần Tính Năng -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Tại Sao Chọn ChillStay Mộc Châu?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <i class="fas fa-mountain feature-icon"></i>
            <h3>Tầm Nhìn Núi Non Hùng Vĩ</h3>
            <p>Thưởng thức cảnh quan thiên nhiên, phong cảnh tuyệt đẹp và khí hậu mát mẻ quanh năm.</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-home feature-icon"></i>
            <h3>Vị Trí Tập Trung</h3>
            <p>Hơn 20 homestay, cottage, và villa trong cùng khu vực, dễ dàng di chuyển và khám phá.</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-concierge-bell feature-icon"></i>
            <h3>Quản Lý Thống Nhất</h3>
            <p>Dịch vụ hospitality đồng nhất với hỗ trợ 24/7 từ chủ nhà thân thiện.</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-parking feature-icon"></i>
            <h3>Tiện Ích Chung</h3>
            <p>Bãi đỗ xe, nhà hàng, quán cà phê, và tiện ích eco-friendly được chia sẻ.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Phần Homestay Nổi Bật -->
    <section class="homestays-section">
      <div class="container">
        <h2 class="section-title">Homestay Nổi Bật Tại Mộc Châu</h2>

        <!-- Trạng thái đang tải -->
        <div v-if="isLoading" class="loading-container">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu...</p>
        </div>

        <!-- Thông báo lỗi -->
        <div v-else-if="hasError" class="error-container">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ errorMessage }}</p>
          <button class="retry-btn" @click="fetchHomestayData">Thử lại</button>
        </div>

        <!-- Lưới Homestay -->
        <div v-else class="homestays-grid">
          <div class="homestay-card" v-for="home in displayedHomestays" :key="home.id">
            <div class="homestay-image">
              <img v-if="home.hinhAnh" :src="home.hinhAnh" :alt="home.tenHomestay" />
              <div class="homestay-rating">
                <span class="stars">★</span> {{ home.danhGiaTrungBinh || '4.7' }} ({{ home.soDanhGia || '95' }} đánh
                giá)
              </div>
              <span class="homestay-status">Hoạt động</span>
            </div>
            <div class="homestay-content">
              <p class="homestay-location">
                <i class="fas fa-map-marker-alt"></i> {{ home.diaChi || 'Trung tâm Mộc Châu, Sơn La' }}
              </p>
              <h3>{{ home.tenHomestay }}</h3>
              <div class="homestay-details">
                <span><i class="fas fa-home"></i> Homestay</span>
                <span><i class="fas fa-ruler"></i> {{ home.dienTich || '80' }} m²</span>
                <span><i class="fas fa-bed"></i> {{ home.loaiPhong || '2-4 người/căn' }}</span>
              </div>
              <div class="homestay-price">
                <span class="price">{{ home.giaCaHomestay ? home.giaCaHomestay.toLocaleString('vi-VN') : '850,000'
                }}₫</span>
                <span class="price-unit">/đêm</span>
              </div>
              <button class="book-now-btn" @click="navigateToBooking(home.id)">Đặt ngay</button>
            </div>
          </div>
        </div>

        <div class="view-more">
          <button class="view-more-btn" @click="viewAllHomestays">Xem Tất Cả Homestay</button>
        </div>
      </div>
    </section>

    <!-- Phần Đánh giá Trải nghiệm -->
    <section class="reviews-section">
      <div class="container">
        <div class="reviews-content">
          <div class="reviews-header">
            <h2 class="section-title">Đánh giá từ những người đã trải nghiệm</h2>
            <p class="reviews-subtitle">Khách hàng chia sẻ về những kỷ niệm tuyệt vời trên chuyến du lịch với chúng tôi.
            </p>
          </div>

          <div class="reviews-slider" v-if="!isLoadingReviews">
            <div class="review-quote" v-if="activeReview">
              <div class="quote-icon">"</div>
              <p class="quote-text">{{ activeReview.content }}</p>
              <div class="author-info">
                <strong>{{ activeReview.author }}</strong> - {{ activeReview.location }}
              </div>
            </div>
          </div>

          <div class="review-tabs">
            <button v-for="(review, index) in reviews" :key="index"
              :class="['tab-button', { 'active': activeReviewIndex === index }]" @click="activeReviewIndex = index">
              {{ review.author }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Phần Tin tức & Khám phá -->
    <section class="news-section">
      <div class="container">
        <div class="news-header">
          <div>
            <h2 class="section-title">Mộc Châu: Khám phá sự đặc sắc và cập nhật tin tức mới nhất</h2>
            <p class="news-subtitle">Mộc Châu: Bí mật và cuộc sống trong lành - Khám phá và cập nhật những tin tức hấp
              dẫn từ điểm đến tuyệt vời này.</p>
          </div>
          <div class="news-divider"></div>
        </div>

        <div class="news-grid">
          <div v-for="(article, index) in newsArticles" :key="index" class="news-card">
            <div class="news-image">
              <img :src="article.image" :alt="article.title" />
            </div>
            <h3 class="news-title">{{ article.title }}</h3>
            <p class="news-excerpt">{{ article.excerpt }}</p>
            <a href="#" class="news-read-more">Đọc thêm</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Phần Kêu Gọi Hành Động -->

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAllHomeStay } from '@/Service/HomeStayService';
import { useRouter } from 'vue-router';

const router = useRouter();
const homestays = ref([]);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');

// Thêm các state cho form tìm kiếm
const searchName = ref('');
const searchLocation = ref('Tất cả địa điểm');
const searchPrice = ref('Tất cả mức giá');

// Thêm dữ liệu đánh giá mẫu
const isLoadingReviews = ref(false);
const activeReviewIndex = ref(0);
const reviews = ref([
  {
    id: 1,
    author: 'Chị Linh - Anh Dũng',
    location: 'Hà Nội',
    content: 'Tour du homestay 2 ngày 1 đêm rất tuyệt vời, tôi được ngắm vẻ đẹp cả vùng Mộc Châu, khám phá các làng dân tộc. Nhân viên tư vấn nhiệt tình, phục vụ chu đáo. Đồ ăn ngon, phòng ốc đẹp. Đây thực sự là trải nghiệm đáng nhớ, mình sẽ tiếp tục ủng hộ và giới thiệu cho bạn bè. Cảm ơn ChillStay!',
    rating: 5
  },
  {
    id: 2,
    author: 'Chị Thu Hà',
    location: 'TP. Hồ Chí Minh',
    content: 'Phòng homestay rất sạch sẽ và trang trí đẹp mắt, view nhìn ra thung lũng tuyệt vời. Chủ homestay rất thân thiện và nhiệt tình giới thiệu những địa điểm đẹp ở Mộc Châu. Bữa sáng ngon miệng với nhiều món đặc sản địa phương. Chắc chắn sẽ quay lại vào dịp tiếp theo!',
    rating: 5
  },
  {
    id: 3,
    author: 'Anh Khánh',
    location: 'Đà Nẵng',
    content: 'Lần đầu tiên đến Mộc Châu và lựa chọn ChillStay là quyết định đúng đắn. Không gian yên tĩnh, gần gũi thiên nhiên nhưng vẫn đầy đủ tiện nghi. Đặc biệt ấn tượng với cách bài trí mang đậm văn hóa dân tộc Thái. Nhân viên chu đáo và luôn sẵn sàng hỗ trợ mọi lúc.',
    rating: 4
  },
  {
    id: 4,
    author: 'Bạn Minh Hoàng',
    location: 'Hải Phòng',
    content: 'ChillStay là điểm đến hoàn hảo cho chuyến phượt Mộc Châu của nhóm mình. Phòng rộng rãi, sạch sẽ, giá cả hợp lý. Đặc biệt, được ngủ trong những căn nhà gỗ giữa khung cảnh thiên nhiên tuyệt đẹp là trải nghiệm khó quên. Chủ homestay rất nhiệt tình giới thiệu các địa điểm thú vị xung quanh.',
    rating: 5
  },
  {
    id: 5,
    author: 'Cô Thanh Hằng và bạn',
    location: 'Thái Nguyên',
    content: 'Đã tới nhiều homestay ở Mộc Châu nhưng ChillStay là nơi để lại ấn tượng nhất. Không gian thoáng đãng, view đẹp, đồ ăn ngon và phong cách phục vụ chuyên nghiệp. Đặc biệt thích không gian cà phê nhỏ trong khu vực homestay, rất thích hợp để ngồi ngắm mây trôi và thưởng thức đồ uống.',
    rating: 5
  }
]);

// Thêm dữ liệu tin tức mẫu
const newsArticles = ref([
  {
    id: 1,
    title: "Top 3 đồi chè đẹp nhất đáng để ghé thăm tại Mộc Châu",
    excerpt: "Những đồi chè xanh mướt trải dài tạo nên khung cảnh tuyệt đẹp là điểm đến không thể bỏ qua khi du lịch Mộc Châu.",
    image: "https://images.unsplash.com/photo-1598968693740-7ed0a5c0a8a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    date: "20/05/2023"
  },
  {
    id: 2,
    title: "Ẩm thực Mộc Châu - Món ngon đặc sản không thể bỏ lỡ",
    excerpt: "Khám phá các món ăn đặc trưng của Mộc Châu từ thịt trâu gác bếp, cá suối nướng đến rau đặc sản vùng cao.",
    image: "https://images.unsplash.com/photo-1569058242253-92a0c8223b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    date: "15/06/2023"
  },
  {
    id: 3,
    title: "Top 3 khu nghỉ dưỡng gần thác Dải Yếm dành cho gia đình",
    excerpt: "Chỉ cần rời khỏi thành phố khoảng 1-2 giờ đồng hồ, bạn đã có thể tận hưởng không gian nghỉ dưỡng tuyệt vời.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    date: "10/07/2023"
  }
]);

// Đánh giá hiện tại đang được hiển thị
const activeReview = computed(() => {
  return reviews.value[activeReviewIndex.value];
});

// Phương thức tìm kiếm
const handleSearch = () => {
  console.log('Đang tìm kiếm với:', {
    tên: searchName.value,
    địaĐiểm: searchLocation.value,
    giáCả: searchPrice.value
  });

  // Chuyển đến trang kết quả tìm kiếm với các tham số tương ứng
  router.push({
    path: '/all-homestays',
    query: {
      name: searchName.value,
      location: searchLocation.value !== 'Tất cả địa điểm' ? searchLocation.value : null,
      price: searchPrice.value !== 'Tất cả mức giá' ? searchPrice.value : null
    }
  });
};

// Phương thức chuyển đến trang Booking
const navigateToBooking = (homestayId) => {
  router.push(`/homestay/${homestayId}`);
};

// Lọc chỉ các homestay có trạng thái Hoạt động (chấp nhận cả boolean true hoặc chuỗi "Hoạt động")
const activeHomestays = computed(() => {
  console.log('Tổng số homestay:', homestays.value.length);
  const result = homestays.value.filter(home => home.trangThai === true || home.trangThai === 'Hoạt động');
  console.log('Số homestay đang hoạt động:', result.length);
  return result;
});

// Hiển thị 6 homestay trên trang chủ thay vì 3
const displayedHomestays = computed(() => {
  return activeHomestays.value.slice(0, 6);
});

// Phương thức chuyển đến trang hiển thị tất cả homestay
const viewAllHomestays = () => {
  console.log('Chuyển hướng đến trang tất cả homestay');
  router.push('/all-homestays');
};

const fetchHomestayData = async () => {
  try {
    isLoading.value = true;
    hasError.value = false;
    errorMessage.value = '';

    try {
      // Gọi API để lấy dữ liệu homestay (endpoint công khai /api/homestay/all)
      const res = await getAllHomeStay();
      console.log('Dữ liệu homestay từ API:', res.data);

      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        homestays.value = res.data.map(room => ({
          ...room,
          capacity: room.capacity || 2, // Giả định capacity mặc định nếu không có
        }));
      } else {
        hasError.value = true;
        errorMessage.value = 'Không có dữ liệu homestay nào được tìm thấy từ API.';
        console.warn('API trả về dữ liệu không hợp lệ:', res.data);
      }
    } catch (apiError) {
      hasError.value = true;
      if (apiError.response && apiError.response.status === 401) {
        errorMessage.value = 'API yêu cầu xác thực nhưng không có dữ liệu công khai. Vui lòng kiểm tra cấu hình backend.';
        console.error('Lỗi 401 - API yêu cầu xác thực:', apiError.response.data);
      } else if (apiError.message.includes('Network Error')) {
        errorMessage.value = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else {
        errorMessage.value = 'Lỗi khi tải dữ liệu homestay: ' + (apiError.response?.data?.message || apiError.message);
      }
      console.error('Lỗi API chi tiết:', {
        message: apiError.message,
        status: apiError.response?.status,
        data: apiError.response?.data,
        url: apiError.config?.url,
      });
    }
  } catch (err) {
    console.error('Lỗi không xác định:', err);
    hasError.value = true;
    errorMessage.value = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchHomestayData();
});
</script>

<style scoped>
/* Nhập Google Fonts (giống Mixivivu sử dụng font sans-serif hiện đại) */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

/* Đặt lại và kiểu cơ bản */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-container {
  font-family: 'Roboto', sans-serif;
  color: #333;
  background: #f8f9fa;
  /* Nền xám nhạt giống Mixivivu */
}

/* Container */
.container {
  max-width: 1140px;
  /* Tương tự Mixivivu */
  margin: 0 auto;
  padding: 0 15px;
}

/* Phần Hero */
.hero-section {
  background: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80') no-repeat center/cover;
  color: #fff;
  padding: 100px 0;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
  /* Gradient giống Mixivivu */
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 15px;
  line-height: 1.2;
  text-align: left;
}

.highlight {
  color: #ff6200;
  /* Màu cam nổi bật giống Mixivivu */
}

.hero-subtitle {
  font-size: 1.2rem;
  font-weight: 400;
  margin-bottom: 30px;
  opacity: 0.9;
  text-align: left;
}

.hero-search {
  background: #fff;
  border-radius: 30px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin: 0 auto;
}

.search-box {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .search-box {
    flex-wrap: nowrap;
  }
}

.search-input {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input input,
.search-input select {
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.search-input.dropdown select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236c757d' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 20px center;
  padding-right: 40px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1rem;
}

.search-input input:focus,
.search-input select:focus {
  outline: none;
  border-color: #48cae4;
  box-shadow: 0 0 0 3px rgba(72, 202, 228, 0.2);
}

.search-input input[readonly] {
  background: #f8f9fa;
  cursor: not-allowed;
}

.search-btn {
  background: #48cae4;
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  min-width: 120px;
  text-align: center;
}

.search-btn:hover {
  background: #0096c7;
}

/* Phần Tính Năng */
.features-section {
  padding: 60px 0;
  background: #fff;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  text-align: left;
  margin-bottom: 25px;
  color: #333;
  padding-left: 10px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-card {
  background: #fff;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e8e8e8;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 2rem;
  color: #48cae4;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
}

.feature-card p {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.5;
}

/* Phần Homestay - updated with border */
.homestays-section {
  padding: 60px 0;
  background: #f8f9fa;
}

/* Cập nhật phần CSS cho Homestay Cards */
.homestays-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.homestay-card {
  background: #fff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e8e8e8;
  position: relative;
}

.homestay-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.homestay-image {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.homestay-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.homestay-status {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 4px 12px;
  background: #28a745;
  color: #fff;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 2;
}

.homestay-rating {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(255, 193, 7, 0.9);
  color: #fff;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stars {
  color: #fff;
  font-size: 0.85rem;
}

.rating-text {
  color: #fff;
  font-size: 0.8rem;
}

.homestay-content {
  padding: 20px;
}

.homestay-location {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: #6c757d;
}

.homestay-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
}

.homestay-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
  font-size: 0.85rem;
  color: #6c757d;
}

.homestay-details span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.homestay-price {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 20px;
}

.price {
  font-size: 1.4rem;
  font-weight: 600;
  color: #48cae4;
}

.price-unit {
  font-size: 0.9rem;
  color: #6c757d;
}

.book-now-btn {
  width: 100%;
  padding: 12px;
  background: #48cae4;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  text-align: center;
}

.book-now-btn:hover {
  background: #0096c7;
}

.view-more {
  text-align: center;
  margin-top: 35px;
}

.view-more-btn {
  padding: 12px 30px;
  background: #48cae4;
  color: #fff;
  border: none;
  border-radius: 30px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.view-more-btn:hover {
  background: #0096c7;
}

/* Phần Kêu Gọi Hành Động */
.cta-section {
  background: linear-gradient(135deg, #48cae4, #0096c7);
  color: #fff;
  padding: 60px 0;
  text-align: center;
  border-radius: 0;
}

.cta-content h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.cta-content p {
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto 30px;
  color: #e9ecef;
}

.cta-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.cta-btn {
  padding: 12px 30px;
  border-radius: 30px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cta-btn.primary {
  background: #ff6200;
  /* Màu cam nổi bật giống Mixivivu */
  color: #fff;
}

.cta-btn.primary:hover {
  background: #e65100;
}

.cta-btn.secondary {
  background: transparent;
  border: 2px solid #fff;
  color: #fff;
}

.cta-btn.secondary:hover {
  background: #fff;
  color: #007bff;
}

/* Trạng thái Tải và Lỗi */
.loading-container,
.error-container {
  text-align: center;
  padding: 35px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
  border: 1px solid #e8e8e8;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.loading-container p {
  font-size: 1rem;
  color: #007bff;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.error-container p {
  font-size: 1rem;
  color: #dc3545;
}

.retry-btn {
  background: #48cae4;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #0096c7;
}

/* Phần Đánh giá */
.reviews-section {
  padding: 80px 0;
  background: #e6f7fb;
  position: relative;
  overflow: hidden;
}

.reviews-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNDQwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBvcGFjaXR5PSIwLjEiIGQ9Ik0tMzUwLjM1OSAtMjI0LjQxNUMzOS4zNzEgLTQ0Ni44OTMgNzAwLjQyMyA3Ni4wNDggMTIxMy45NSAzNTYuMDg1QzE3MjcuNDggNjM2LjEyMyAxNjQ4LjE1IDEyNjEuMjMgMTI1OC40MiAxNDgzLjcxQzg2OC42ODggMTcwNi4xOSAyMDcuNjM2IDExODMuMjUgLTMwNS44ODkgOTAzLjIxNEMtODE5LjQxNCA2MjMuMTc2IC03NDAuMDg5IC0xLjkzOCAtMzUwLjM1OSAtMjI0LjQxNVoiIHN0cm9rZT0iIzQ4Y2FlNCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.4;
  z-index: 1;
}

.reviews-section::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 50px;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDE0NDAgODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE0NDAsMEgwVjgwQzI0MCw1MCA0ODAsMjAgNzIwLDIwQzk2MCwyMCAxMjAwLDUwIDE0NDAsODBWMFoiIGZpbGw9IiNlNmY3ZmIiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+');
  background-size: cover;
  z-index: 1;
}

.reviews-content {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.reviews-header {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.reviews-slider {
  position: relative;
  margin-bottom: 40px;
}

.review-quote {
  background: #fff;
  border-radius: 15px;
  padding: 40px 40px 40px 60px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  border-left: 4px solid #48cae4;
}

.quote-icon {
  position: absolute;
  top: 30px;
  left: 30px;
  font-size: 6rem;
  color: #48cae4;
  opacity: 0.2;
  font-family: Georgia, serif;
  line-height: 0;
  height: 40px;
}

.quote-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 20px;
}

.author-info {
  color: #666;
  font-size: 0.95rem;
  text-align: right;
  font-weight: 500;
}

.review-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.tab-button {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: #f0f9fc;
  border-color: #48cae4;
}

.tab-button.active {
  background: #48cae4;
  color: #fff;
  border-color: #48cae4;
}

@media (max-width: 768px) {
  .review-tabs {
    justify-content: center;
  }

  .reviews-subtitle {
    text-align: left;
    margin-left: 0;
  }
}

/* Phần Tin tức */
.news-section {
  padding: 80px 0;
  background: #fff;
}

.news-header {
  margin-bottom: 40px;
  position: relative;
}

.news-subtitle {
  font-size: 1.1rem;
  color: #666;
  max-width: 800px;
  margin-top: 5px;
  padding-left: 10px;
}

.news-divider {
  width: 80px;
  height: 4px;
  background: #48cae4;
  margin: 15px 0 0 10px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.news-card {
  background: #fff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e8e8e8;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.news-image {
  height: 220px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-card:hover .news-image img {
  transform: scale(1.05);
}

.news-title {
  padding: 20px 20px 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.news-excerpt {
  padding: 0 20px 15px;
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
}

.news-read-more {
  display: inline-block;
  padding: 0 20px 20px;
  color: #48cae4;
  font-weight: 500;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.news-read-more:hover {
  color: #0096c7;
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}

/* Thiết kế Responsive */
@media (max-width: 1024px) {
  .search-box {
    flex-direction: column;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .homestays-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .search-btn {
    width: 100%;
  }
}
</style>
