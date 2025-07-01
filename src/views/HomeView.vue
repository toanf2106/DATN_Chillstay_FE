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
            Khám phá những homestay độc đáo tại trung tâm Mộc Châu với tầm nhìn núi non tuyệt đẹp.
          </p>
          <div class="hero-search">
            <div class="search-box">
              <div class="search-input">
                <i class="fas fa-map-marker-alt search-icon"></i>
                <input type="text" placeholder="Trung tâm Mộc Châu" value="Trung tâm Mộc Châu, Sơn La" readonly />
              </div>
              <div class="search-input">
                <i class="fas fa-calendar-alt search-icon"></i>
                <input type="date" placeholder="Ngày đến" />
              </div>
              <div class="search-input">
                <i class="fas fa-calendar-alt search-icon"></i>
                <input type="date" placeholder="Ngày về" />
              </div>
              <div class="search-input">
                <i class="fas fa-users search-icon"></i>
                <select>
                  <option>1 khách</option>
                  <option>2 khách</option>
                  <option>3 khách</option>
                  <option>4+ khách</option>
                </select>
              </div>
              <button class="search-btn">
                <i class="fas fa-search"></i>
                Tìm Homestay
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
            <h3>Tầm Nhìn Núi Non</h3>
            <p>Thưởng thức cảnh quan núi non hùng vĩ và khí hậu mát mẻ quanh năm.</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-home feature-icon"></i>
            <h3>Vị Trí Tập Trung</h3>
            <p>Hơn 20 homestay trong cùng khu vực, dễ dàng di chuyển và trải nghiệm.</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-concierge-bell feature-icon"></i>
            <h3>Quản Lý Thống Nhất</h3>
            <p>Chất lượng dịch vụ đồng nhất với hỗ trợ 24/7 từ một chủ quản lý.</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-parking feature-icon"></i>
            <h3>Tiện Ích Chung</h3>
            <p>Bãi đỗ xe, nhà hàng, quán cà phê và nhiều tiện ích được chia sẻ.</p>
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
        </div>

        <!-- Lưới Homestay -->
        <div v-else class="homestays-grid">
          <div class="homestay-card" v-for="home in activeHomestays" :key="home.id">
            <div class="homestay-image">
              <img v-if="home.hinhAnh" :src="home.hinhAnh" :alt="home.tenHomestay" />
              <span class="homestay-status">Hoạt động</span>
            </div>
            <div class="homestay-content">
              <h3>{{ home.tenHomestay }}</h3>
              <p class="homestay-location">
                <i class="fas fa-map-marker-alt"></i> {{ home.diaChi }}
              </p>
              <div class="homestay-details">
                <span><i class="fas fa-ruler"></i> {{ home.dienTich }} m²</span>
                <span><i class="fas fa-bed"></i> {{ home.loaiPhong }}</span>
                <span><i class="fas fa-user"></i> {{ home.chuSoHuu }}</span>
              </div>
              <div class="homestay-rating">
                <span class="stars">★★★★★</span>
                <span class="rating-text">{{ home.danhGiaTrungBinh || '4.7' }} ({{ home.soDanhGia || 95 }} đánh
                  giá)</span>
              </div>
              <div class="homestay-price">
                <span class="price">{{ home.giaCaHomestay ? home.giaCaHomestay.toLocaleString('vi-VN') : '' }}₫</span>
                <span class="price-unit">/đêm</span>
              </div>
              <button class="book-now-btn" @click="navigateToBooking">Đặt Ngay</button>
            </div>
          </div>
        </div>

        <div class="view-more">
          <button class="view-more-btn">Xem Tất Cả Homestay</button>
        </div>
      </div>
    </section>

    <!-- Phần Kêu Gọi Hành Động -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Sẵn Sàng Khám Phá Mộc Châu?</h2>
          <p>Đặt phòng ngay để trải nghiệm hệ thống homestay độc đáo với tầm nhìn núi non hùng vĩ.</p>
          <div class="cta-buttons">
            <button class="cta-btn primary" @click="navigateToBooking">Đặt Phòng Ngay</button>
            <button class="cta-btn secondary">Liên Hệ Tư Vấn</button>
          </div>
        </div>
      </div>
    </section>
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

// Phương thức chuyển đến trang Booking
const navigateToBooking = () => {
  router.push('/booking');
};

// Lọc chỉ các homestay có trạng thái Hoạt động (chấp nhận cả boolean true hoặc chuỗi "Hoạt động")
const activeHomestays = computed(() => {
  console.log('Tổng số homestay:', homestays.value.length);
  const result = homestays.value.filter(home => home.trangThai === true || home.trangThai === 'Hoạt động');
  console.log('Số homestay đang hoạt động:', result.length);
  return result;
});

// Kiểm tra token xác thực
const checkAuth = () => {
  const sessionId = sessionStorage.getItem('current_tab_id');
  if (!sessionId) return false;
  const token = localStorage.getItem(`token_${sessionId}`);
  return !!token;
};

onMounted(async () => {
  try {
    isLoading.value = true;
    hasError.value = false;

    if (!checkAuth()) {
      console.log('Chưa đăng nhập, hiển thị dữ liệu mẫu');
      homestays.value = getSampleHomestays();
      isLoading.value = false;
      return;
    }

    const res = await getAllHomeStay();
    console.log('Dữ liệu homestay:', res.data);

    if (res.data && Array.isArray(res.data)) {
      homestays.value = res.data;
    } else {
      console.warn('API trả về dữ liệu không phải mảng:', res.data);
      homestays.value = [];
    }
  } catch (err) {
    console.error('Lỗi khi lấy homestay:', err);
    hasError.value = true;
    errorMessage.value = err.message || 'Không thể tải dữ liệu homestay';

    if (err.response && err.response.status === 401) {
      console.log('Lỗi xác thực, hiển thị dữ liệu mẫu');
      homestays.value = getSampleHomestays();
    }
  } finally {
    isLoading.value = false;
  }
});

// Dữ liệu mẫu cho người dùng chưa đăng nhập hoặc lỗi
const getSampleHomestays = () => {
  return [
    {
      id: 1,
      tenHomestay: 'Nhà Sàn Mộc Châu 1',
      hinhAnh: '/images/homestay/mocchau1.jpg',
      diaChi: 'Bản Lác, Mộc Châu',
      giaCaHomestay: 2500000,
      danhGiaTrungBinh: 4.8,
      soDanhGia: 120,
      dienTich: 150.5,
      tinhTrang: 'Sạch sẽ, mới',
      chuSoHuu: 'Nguyễn Văn Hùng',
      loaiPhong: 'Nhà sàn',
      trangThai: 'Hoạt động',
    },
    {
      id: 2,
      tenHomestay: 'Bungalow Đồi Chè',
      hinhAnh: '/images/homestay/mocchau2.jpg',
      diaChi: 'Tiểu khu 32, Mộc Châu',
      giaCaHomestay: 1800000,
      danhGiaTrungBinh: 4.7,
      soDanhGia: 95,
      dienTich: 80,
      tinhTrang: 'Tiện nghi',
      chuSoHuu: 'Trần Thị Mai',
      loaiPhong: 'Bungalow',
      trangThai: 'Hoạt động',
    },
    {
      id: 3,
      tenHomestay: 'Villa Thung Lũng',
      hinhAnh: '/images/homestay/mocchau3.jpg',
      diaChi: 'Bản Áng, Mộc Châu',
      giaCaHomestay: 4500000,
      danhGiaTrungBinh: 4.9,
      soDanhGia: 85,
      dienTich: 200.75,
      tinhTrang: 'Sang trọng',
      chuSoHuu: 'Nguyễn Văn Hùng',
      loaiPhong: 'Villa',
      trangThai: 'Khóa',
    },
  ];
};
</script>

<style scoped>
/* Nhập Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

/* Đặt lại và kiểu cơ bản */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-container {
  font-family: 'Poppins', sans-serif;
  color: #2d2d2d;
  background: #f5f7fa;
}

/* Container */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Phần Hero */
.hero-section {
  background: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80') no-repeat center/cover;
  color: #fff;
  padding: 120px 0;
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
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.highlight {
  color: #ffcc00;
}

.hero-subtitle {
  font-size: 1.25rem;
  font-weight: 300;
  max-width: 600px;
  margin: 0 auto 32px;
}

.hero-search {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.search-box {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 1.1rem;
}

.search-input input,
.search-input select {
  width: 100%;
  padding: 12px 12px 12px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.search-input input:focus,
.search-input select:focus {
  outline: none;
  border-color: #3b82f6;
}

.search-input input[readonly] {
  background: #f3f4f6;
  cursor: not-allowed;
}

.search-btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s ease;
}

.search-btn:hover {
  background: #2563eb;
}

/* Phần Tính Năng */
.features-section {
  padding: 80px 0;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 48px;
  color: #1f2937;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  color: #3b82f6;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.feature-card p {
  font-size: 0.9rem;
  color: #6b7280;
}

/* Phần Homestay */
.homestays-section {
  padding: 80px 0;
}

.homestays-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.homestay-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.homestay-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.homestay-image {
  position: relative;
}

.homestay-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.homestay-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: #10b981;
  color: #fff;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.homestay-content {
  padding: 20px;
}

.homestay-content h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #1f2937;
}

.homestay-location {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.homestay-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  color: #6b7280;
}

.homestay-details span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.homestay-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stars {
  color: #f59e0b;
  font-size: 0.9rem;
}

.rating-text {
  font-size: 0.85rem;
  color: #6b7280;
}

.homestay-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 16px;
}

.price {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.price-unit {
  font-size: 0.9rem;
  color: #6b7280;
}

.book-now-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.book-now-btn:hover {
  background: #2563eb;
}

.view-more {
  text-align: center;
  margin-top: 32px;
}

.view-more-btn {
  padding: 12px 24px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.view-more-btn:hover {
  background: #2563eb;
}

/* Phần Kêu Gọi Hành Động */
.cta-section {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: #fff;
  padding: 80px 0;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.25rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.cta-content p {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 32px;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.cta-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cta-btn.primary {
  background: #ffcc00;
  color: #1f2937;
}

.cta-btn.primary:hover {
  background: #eab308;
}

.cta-btn.secondary {
  background: transparent;
  border: 2px solid #fff;
  color: #fff;
}

.cta-btn.secondary:hover {
  background: #fff;
  color: #1f2937;
}

/* Trạng thái Tải và Lỗi */
.loading-container,
.error-container {
  text-align: center;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-container p {
  font-size: 1.1rem;
  color: #3b82f6;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.error-container p {
  font-size: 1.1rem;
  color: #ef4444;
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
}
</style>