<template>
  <div class="booking-container">
    <!-- Hiển thị trạng thái tải -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải thông tin homestay...</p>
    </div>

    <!-- Hiển thị lỗi nếu có -->
    <div v-else-if="hasError" class="error-container">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <h3>Đã xảy ra lỗi</h3>
      <p>{{ errorMessage }}</p>
      <button class="btn primary-btn" @click="goBack">Quay lại</button>
    </div>

    <!-- Hiển thị thông tin chi tiết homestay -->
    <div v-else-if="homestay" class="booking-content">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/">Trang chủ</router-link>
        <span class="separator">/</span>
        <router-link to="/all-homestays">Tất cả homestay</router-link>
        <span class="separator">/</span>
        <span class="current">{{ homestay.tenHomestay }}</span>
      </div>

      <!-- Thông tin cơ bản và hình ảnh -->
      <div class="homestay-header">
        <h1>{{ homestay.tenHomestay }}</h1>
        <div class="homestay-meta">
          <div class="location">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ homestay.diaChi }}</span>
          </div>
          <div class="rating">
            <span class="stars">★★★★★</span>
            <span>{{ homestay.danhGiaTrungBinh || '4.7' }} ({{ homestay.soDanhGia || 95 }} đánh giá)</span>
          </div>
        </div>
      </div>

      <!-- Gallery hình ảnh -->
      <div class="homestay-gallery">
        <div class="main-image">
          <img :src="homestay.hinhAnh || defaultImage" :alt="homestay.tenHomestay" />
        </div>
        <div class="thumbnail-images">
          <img v-for="(image, index) in additionalImages" :key="index" :src="image"
            :alt="`${homestay.tenHomestay} - Ảnh ${index + 1}`" @click="setMainImage(image)" />
        </div>
      </div>

      <!-- Thông tin chi tiết và đặt phòng -->
      <div class="booking-details">
        <div class="homestay-info">
          <h2>Thông tin chi tiết</h2>

          <div class="info-section">
            <h3>Mô tả</h3>
            <p>{{ homestay.moTa ||
              "Homestay xinh đẹp tọa lạc tại trung tâm Mộc Châu với tầm nhìn núi non hùng vĩ, " +
              "không gian yên bình và thiết kế hiện đại kết hợp với nét văn hóa địa phương. " +
              "Đây là nơi lý tưởng để nghỉ dưỡng, thư giãn và khám phá vẻ đẹp thiên nhiên của Mộc Châu." }}</p>
          </div>

          <div class="info-section">
            <h3>Thông tin cơ bản</h3>
            <div class="info-grid">
              <div class="info-item">
                <i class="fas fa-ruler"></i>
                <span>Diện tích: {{ homestay.dienTich || '50' }} m²</span>
              </div>
              <div class="info-item">
                <i class="fas fa-bed"></i>
                <span>Loại: {{ homestay.loaiHomeStay || 'Homestay' }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-user"></i>
                <span>Chủ sở hữu: {{ homestay.chuSoHuu || 'ChillStay' }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-users"></i>
                <span>Sức chứa: {{ homestay.sucChua || '4' }} người</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>Tiện nghi</h3>
            <div class="amenities-grid">
              <div class="amenity-item" v-for="(amenity, index) in amenities" :key="index">
                <i :class="amenity.icon"></i>
                <span>{{ amenity.name }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>Quy định</h3>
            <div class="rules">
              <div class="rule-item">
                <i class="fas fa-clock"></i>
                <div>
                  <strong>Nhận phòng:</strong> Sau 14:00
                </div>
              </div>
              <div class="rule-item">
                <i class="fas fa-clock"></i>
                <div>
                  <strong>Trả phòng:</strong> Trước 12:00
                </div>
              </div>
              <div class="rule-item">
                <i class="fas fa-smoking-ban"></i>
                <div>
                  <strong>Hút thuốc:</strong> Không hút thuốc trong phòng
                </div>
              </div>
              <div class="rule-item">
                <i class="fas fa-paw"></i>
                <div>
                  <strong>Thú cưng:</strong> Không cho phép
                </div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>Đánh giá từ khách hàng</h3>
            <div class="reviews-summary">
              <div class="overall-rating">
                <span class="rating-number">{{ homestay.danhGiaTrungBinh || '4.7' }}</span>
                <div class="stars">★★★★★</div>
                <span class="review-count">{{ homestay.soDanhGia || '95' }} đánh giá</span>
              </div>
              <div class="rating-bars">
                <div class="rating-bar-item">
                  <span>Sạch sẽ</span>
                  <div class="bar-container">
                    <div class="bar" style="width: 95%"></div>
                  </div>
                  <span>4.8</span>
                </div>
                <div class="rating-bar-item">
                  <span>Vị trí</span>
                  <div class="bar-container">
                    <div class="bar" style="width: 90%"></div>
                  </div>
                  <span>4.5</span>
                </div>
                <div class="rating-bar-item">
                  <span>Giá trị</span>
                  <div class="bar-container">
                    <div class="bar" style="width: 92%"></div>
                  </div>
                  <span>4.6</span>
                </div>
                <div class="rating-bar-item">
                  <span>Dịch vụ</span>
                  <div class="bar-container">
                    <div class="bar" style="width: 94%"></div>
                  </div>
                  <span>4.7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form đặt phòng -->
        <div class="booking-form-container">
          <div class="booking-form">
            <h3>Đặt phòng</h3>
            <div class="price-info">
              <span class="price">{{ formatPrice(homestay.giaCaHomestay) }}</span>
              <span class="price-unit">/ đêm</span>
            </div>

            <div class="form-group">
              <label for="check-in">Ngày nhận phòng</label>
              <input type="date" id="check-in" v-model="checkInDate" :min="today" @change="calculateTotalPrice" />
            </div>

            <div class="form-group">
              <label for="check-out">Ngày trả phòng</label>
              <input type="date" id="check-out" v-model="checkOutDate" :min="minCheckoutDate"
                @change="calculateTotalPrice" />
            </div>

            <div class="form-group">
              <label for="guests">Số khách</label>
              <select id="guests" v-model="guestCount">
                <option v-for="i in maxGuests" :key="i" :value="i">{{ i }} khách</option>
              </select>
            </div>

            <div class="price-breakdown">
              <div class="price-row">
                <span>{{ formatPrice(homestay.giaCaHomestay) }} x {{ nightCount }} đêm</span>
                <span>{{ formatPrice(basePrice) }}</span>
              </div>
              <div class="price-row">
                <span>Phí dịch vụ</span>
                <span>{{ formatPrice(serviceFee) }}</span>
              </div>
              <div class="price-row">
                <span>Thuế</span>
                <span>{{ formatPrice(tax) }}</span>
              </div>
              <div class="price-row total">
                <span>Tổng cộng</span>
                <span>{{ formatPrice(totalPrice) }}</span>
              </div>
            </div>

            <button class="btn book-now-btn" @click="bookNow">Đặt ngay</button>
            <p class="booking-note">Bạn chưa bị trừ tiền</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getHomeStayById } from '@/Service/HomeStayService';

const route = useRoute();
const router = useRouter();
const homestay = ref(null);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';

// Dữ liệu đặt phòng
const today = new Date().toISOString().split('T')[0];
const checkInDate = ref(today);
const checkOutDate = ref(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
const guestCount = ref(2);
const maxGuests = 10;

// Tính toán giá
const basePrice = ref(0);
const serviceFee = ref(0);
const tax = ref(0);
const totalPrice = ref(0);

// Tính số đêm
const nightCount = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 1;
  const start = new Date(checkInDate.value);
  const end = new Date(checkOutDate.value);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1;
});

// Ngày checkout tối thiểu
const minCheckoutDate = computed(() => {
  if (!checkInDate.value) return today;
  return checkInDate.value;
});

// Hình ảnh bổ sung (mô phỏng)
const additionalImages = ref([
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1564078516393-cf04bd966897?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
]);

// Danh sách tiện nghi
const amenities = [
  { name: 'WiFi miễn phí', icon: 'fas fa-wifi' },
  { name: 'Điều hòa', icon: 'fas fa-snowflake' },
  { name: 'TV', icon: 'fas fa-tv' },
  { name: 'Bếp', icon: 'fas fa-utensils' },
  { name: 'Máy giặt', icon: 'fas fa-tshirt' },
  { name: 'Chỗ đậu xe', icon: 'fas fa-parking' },
  { name: 'Hồ bơi', icon: 'fas fa-swimming-pool' },
  { name: 'Bữa sáng', icon: 'fas fa-coffee' }
];

// Lấy thông tin homestay từ API
const fetchHomestayData = async () => {
  isLoading.value = true;
  hasError.value = false;
  errorMessage.value = '';

  try {
    const homestayId = route.params.id;

    if (!homestayId) {
      throw new Error('Không tìm thấy ID homestay');
    }

    console.log('Đang tải thông tin homestay với ID:', homestayId);
    const response = await getHomeStayById(homestayId);

    if (response.data) {
      homestay.value = response.data;
      calculateTotalPrice();
    } else {
      throw new Error('Không tìm thấy thông tin homestay');
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin homestay:', error);
    hasError.value = true;
    errorMessage.value = error.message || 'Đã xảy ra lỗi khi tải thông tin homestay';
  } finally {
    isLoading.value = false;
  }
};

// Tính tổng giá tiền
const calculateTotalPrice = () => {
  if (!homestay.value || !homestay.value.giaCaHomestay) {
    basePrice.value = 0;
    serviceFee.value = 0;
    tax.value = 0;
    totalPrice.value = 0;
    return;
  }

  const price = homestay.value.giaCaHomestay;
  basePrice.value = price * nightCount.value;
  serviceFee.value = basePrice.value * 0.05; // Phí dịch vụ 5%
  tax.value = basePrice.value * 0.08; // Thuế 8%
  totalPrice.value = basePrice.value + serviceFee.value + tax.value;
};

// Format giá tiền
const formatPrice = (price) => {
  if (!price) return '0₫';
  return price.toLocaleString('vi-VN') + '₫';
};

// Đặt hình ảnh chính
const setMainImage = (image) => {
  if (homestay.value) {
    homestay.value.hinhAnh = image;
  }
};

// Xử lý đặt phòng
const bookNow = () => {
  // Kiểm tra đăng nhập
  // Trong thực tế, bạn sẽ kiểm tra trạng thái đăng nhập từ store
  const isLoggedIn = false; // Giả định chưa đăng nhập

  if (!isLoggedIn) {
    alert('Vui lòng đăng nhập để đặt phòng');
    // Hiển thị modal đăng nhập hoặc chuyển hướng đến trang đăng nhập
    return;
  }

  // Xử lý đặt phòng
  alert(`Đặt phòng thành công!\nHomestay: ${homestay.value.tenHomestay}\nNgày nhận phòng: ${checkInDate.value}\nNgày trả phòng: ${checkOutDate.value}\nSố khách: ${guestCount.value}\nTổng tiền: ${formatPrice(totalPrice.value)}`);
};

// Quay lại trang trước
const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchHomestayData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

.booking-container {
  font-family: 'Roboto', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

/* Loading và Error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  text-align: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #007bff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-icon {
  color: #dc3545;
  font-size: 48px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.primary-btn {
  background-color: #007bff;
  color: white;
}

.primary-btn:hover {
  background-color: #0056b3;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 10px;
  color: #6c757d;
}

.current {
  color: #6c757d;
  font-weight: 500;
}

/* Homestay Header */
.homestay-header {
  margin-bottom: 20px;
}

.homestay-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #212529;
}

.homestay-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #6c757d;
  font-size: 14px;
}

.location,
.rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stars {
  color: #ffc107;
}

/* Gallery */
.homestay-gallery {
  margin-bottom: 30px;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.thumbnail-images img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.thumbnail-images img:hover {
  opacity: 0.8;
}

/* Booking Details */
.booking-details {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .booking-details {
    grid-template-columns: 1fr;
  }
}

/* Homestay Info */
.homestay-info {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.homestay-info h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #212529;
}

.info-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
}

.info-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.info-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #212529;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item i {
  color: #007bff;
  width: 20px;
  text-align: center;
}

/* Amenities */
.amenities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.amenity-item i {
  color: #007bff;
  width: 20px;
  text-align: center;
}

/* Rules */
.rules {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.rule-item i {
  color: #007bff;
  width: 20px;
  text-align: center;
  margin-top: 3px;
}

/* Reviews */
.reviews-summary {
  display: flex;
  gap: 30px;
}

.overall-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.rating-number {
  font-size: 48px;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

.review-count {
  color: #6c757d;
  font-size: 14px;
}

.rating-bars {
  flex: 1;
}

.rating-bar-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.rating-bar-item span {
  width: 60px;
}

.rating-bar-item span:last-child {
  width: 30px;
  text-align: right;
}

.bar-container {
  flex: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  margin: 0 10px;
}

.bar {
  height: 100%;
  background-color: #007bff;
  border-radius: 4px;
}

/* Booking Form */
.booking-form-container {
  align-self: flex-start;
  position: sticky;
  top: 20px;
}

.booking-form {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.booking-form h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #212529;
}

.price-info {
  display: flex;
  align-items: baseline;
  margin-bottom: 20px;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #212529;
}

.price-unit {
  color: #6c757d;
  margin-left: 5px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.price-breakdown {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.price-row.total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
  font-weight: 700;
  font-size: 16px;
}

.book-now-btn {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  margin-top: 20px;
}

.book-now-btn:hover {
  background-color: #0056b3;
}

.booking-note {
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  color: #6c757d;
}

@media (max-width: 576px) {
  .booking-container {
    padding: 10px;
  }

  .main-image {
    height: 250px;
  }

  .reviews-summary {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
