<template>
  <div class="home-container">
    <!-- Phần Hero -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Đặt Phòng <span class="highlight">Homestay</span>
          </h1>
          <p class="hero-subtitle">
            Chọn ngày, số khách và tìm phòng phù hợp cho chuyến đi của bạn tại Mộc Châu!
          </p>
          <div class="hero-search">
            <form class="search-box" @submit.prevent="searchRooms">
              <div class="search-input">
                <i class="fas fa-calendar-alt search-icon"></i>
                <input type="date" v-model="checkIn" placeholder="Ngày nhận phòng" required />
              </div>
              <div class="search-input">
                <i class="fas fa-calendar-alt search-icon"></i>
                <input type="date" v-model="checkOut" placeholder="Ngày trả phòng" required />
              </div>
              <div class="search-input">
                <i class="fas fa-users search-icon"></i>
                <select v-model="guests" required>
                  <option v-for="n in 6" :key="n" :value="n">{{ n }} khách</option>
                </select>
              </div>
              <button type="submit" class="search-btn">
                <i class="fas fa-search"></i> Tìm Phòng
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Phần Danh Sách Phòng -->
    <section class="rooms-section py-5">
      <div class="container">
        <h2 class="section-title">Phòng Khả Dụng</h2>
        <!-- Trạng thái đang tải -->
        <div v-if="isLoading" class="loading-container">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu...</p>
        </div>

        <!-- Thông báo lỗi -->
        <div v-else-if="hasError" class="error-container">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ errorMessage }}</p>
          <button class="btn btn-primary mt-3" @click="retryFetch">Thử lại</button>
        </div>

        <!-- Lưới phòng -->
        <div v-else class="rooms-grid">
          <div class="room-card" v-for="room in filteredRooms" :key="room.id">
            <div class="room-image">
              <img v-if="room.hinhAnh" :src="room.hinhAnh" :alt="room.tenHomestay" />
              <span class="room-status">{{ room.trangThai }}</span>
            </div>
            <div class="room-content">
              <h3>{{ room.tenHomestay }}</h3>
              <p class="room-location">
                <i class="fas fa-map-marker-alt"></i> {{ room.diaChi }}
              </p>
              <div class="room-details">
                <span><i class="fas fa-bed"></i> {{ room.loaiPhong || 'Phòng tiêu chuẩn' }}</span>
                <span><i class="fas fa-users"></i> {{ room.sucChua || 2 }} khách</span>
              </div>
              <div class="room-rating">
                <span class="stars">★★★★★</span>
                <span class="rating-text">{{ room.danhGiaTrungBinh || '4.7' }} ({{ room.soDanhGia || 95 }} đánh
                  giá)</span>
              </div>
              <div class="room-price">
                <span class="price">{{ room.giaCaHomestay ? room.giaCaHomestay.toLocaleString('vi-VN') : '0' }}₫</span>
                <span class="price-unit">/đêm</span>
              </div>
              <button class="book-now-btn" @click="bookRoom(room)">Đặt Ngay</button>
            </div>
          </div>
        </div>

        <div v-if="filteredRooms.length === 0 && !isLoading && !hasError" class="text-center mt-4">
          <p class="text-muted">Không có phòng nào khả dụng cho lựa chọn của bạn.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAllHomeStay } from '@/Service/HomeStayService';

const checkIn = ref('');
const checkOut = ref('');
const guests = ref(1);
const homestays = ref([]);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');

// Lấy dữ liệu homestay từ API
const fetchData = async () => {
  try {
    isLoading.value = true;
    hasError.value = false;

    const res = await getAllHomeStay();
    console.log('API Response:', res);
    console.log('Homestay Data:', res.data);

    if (res && res.data && Array.isArray(res.data)) {
      homestays.value = res.data;
      console.log('Homestays loaded:', homestays.value.length);

      // Kiểm tra cấu trúc dữ liệu của homestay đầu tiên nếu có
      if (homestays.value.length > 0) {
        console.log('Sample homestay structure:', JSON.stringify(homestays.value[0], null, 2));
      }
    } else {
      console.warn('API trả về dữ liệu không phải mảng hoặc rỗng:', res);
      homestays.value = getSampleData(); // Sử dụng dữ liệu mẫu nếu không có dữ liệu thực
    }
  } catch (err) {
    console.error('Lỗi khi lấy homestay:', err);
    hasError.value = true;
    errorMessage.value = err.message || 'Không thể tải dữ liệu homestay';
    homestays.value = getSampleData(); // Sử dụng dữ liệu mẫu khi có lỗi
  } finally {
    isLoading.value = false;
  }
};

// Dữ liệu mẫu khi không có dữ liệu thực
const getSampleData = () => {
  return [
    {
      id: 1,
      tenHomestay: 'ChillStay View Núi',
      loaiPhong: 'Phòng Gia Đình',
      giaCaHomestay: 450000,
      sucChua: 4,
      dienTich: 40,
      trangThai: 'Hoạt động',
      diaChi: 'Mộc Châu, Sơn La',
      hinhAnh: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      danhGiaTrungBinh: 4.8,
      soDanhGia: 120
    },
    {
      id: 2,
      tenHomestay: 'ChillStay Premium',
      loaiPhong: 'Phòng VIP',
      giaCaHomestay: 750000,
      sucChua: 2,
      dienTich: 35,
      trangThai: 'Hoạt động',
      diaChi: 'Tiểu khu 32, Mộc Châu',
      hinhAnh: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      danhGiaTrungBinh: 4.9,
      soDanhGia: 85
    },
    {
      id: 3,
      tenHomestay: 'ChillStay Cozy',
      loaiPhong: 'Phòng Đôi',
      giaCaHomestay: 350000,
      sucChua: 2,
      dienTich: 25,
      trangThai: 'Hoạt động',
      diaChi: 'Bản Áng, Mộc Châu',
      hinhAnh: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      danhGiaTrungBinh: 4.7,
      soDanhGia: 95
    },
  ];
};

onMounted(() => {
  // Thiết lập ngày mặc định (hôm nay và ngày mai)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  checkIn.value = formatDate(today);
  checkOut.value = formatDate(tomorrow);

  fetchData();
});

// Định dạng ngày YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Thử lại khi có lỗi
const retryFetch = () => {
  fetchData();
};

// Lọc phòng dựa trên ngày và số khách
const filteredRooms = computed(() => {
  // Kiểm tra xem homestays có dữ liệu không
  if (homestays.value.length === 0) return [];

  // Lọc các homestay có trạng thái Hoạt động (chấp nhận cả boolean true hoặc chuỗi "Hoạt động")
  const activeHomestays = homestays.value.filter(h => h.trangThai === true || h.trangThai === 'Hoạt động');
  console.log('Homestay đang hoạt động:', activeHomestays.length);

  // Nếu không có tiêu chí tìm kiếm, trả về tất cả homestay đang hoạt động
  if (!checkIn.value || !checkOut.value || !guests.value) {
    return activeHomestays;
  }

  // Lọc theo số khách (nếu có thông tin về sức chứa)
  return activeHomestays.filter(h => {
    // Sử dụng giá trị mặc định nếu không có thông tin sức chứa
    const capacity = h.sucChua || h.soNguoi || 2;
    return capacity >= guests.value;
  });
});

// Hàm tìm phòng
const searchRooms = () => {
  console.log('Tìm phòng với:', { checkIn: checkIn.value, checkOut: checkOut.value, guests: guests.value });
  // Fetch data sẽ được thực hiện thông qua computed property
};

const bookRoom = (room) => {
  // Implement the logic to book a room
  console.log('Đặt phòng:', room);
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

/* Phần Danh Sách Phòng */
.rooms-section {
  padding: 80px 0;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 48px;
  color: #1f2937;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.room-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.room-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.room-image {
  position: relative;
}

.room-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.room-status {
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

.room-content {
  padding: 20px;
}

.room-content h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #1f2937;
}

.room-location {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.room-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  color: #6b7280;
}

.room-details span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.room-rating {
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

.room-price {
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

.btn-primary {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.btn-primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
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
  .rooms-grid {
    grid-template-columns: 1fr;
  }
}
</style>