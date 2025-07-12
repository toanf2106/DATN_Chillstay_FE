<template>
  <div class="booking-page">
    <!-- Header với tiến trình đặt phòng -->
    <div class="booking-header">
      <div class="booking-progress">
        <div class="progress-step completed">
          <div class="step-number">1</div>
          <div class="step-text">Bạn chọn</div>
        </div>
        <div class="progress-line"></div>
        <div class="progress-step active">
          <div class="step-number">2</div>
          <div class="step-text">Chi tiết về bạn</div>
        </div>
        <div class="progress-line"></div>
        <div class="progress-step">
          <div class="step-number">3</div>
          <div class="step-text">Hoàn tất đặt phòng</div>
        </div>
      </div>
    </div>

    <div class="booking-container">
      <!-- Thông tin homestay đã chọn -->
      <div class="booking-summary">
        <div class="homestay-preview">
          <img :src="homestay.anhDaiDien || defaultImage" alt="Homestay" class="homestay-image" />
          <div class="homestay-rating">
            <span class="rating-value">{{ homestay.danhGiaTrungBinh || '7.8' }}</span>
            <span class="rating-text">Tốt</span>
            <span class="rating-count">{{ homestay.soDanhGia || '25' }} đánh giá</span>
          </div>
        </div>
        <div class="homestay-info">
          <div class="homestay-type">Khách sạn căn hộ</div>
          <h2 class="homestay-name">{{ homestay.tenHomestay || 'The Song Vung Tau Hao\'s Homestay' }}</h2>
          <div class="homestay-address">
            <i class="fas fa-map-marker-alt"></i>
            {{ homestay.diaChi || '28 Thị Sách, Phường Thắng Tam, Thành phố Vũng Tàu, 78000 Vũng Tàu, Việt Nam' }}
          </div>
          <div class="homestay-features">
            <div class="feature">
              <i class="fas fa-wifi"></i> WiFi miễn phí
            </div>
            <div class="feature">
              <i class="fas fa-car"></i> Xe đưa đón sân bay
            </div>
            <div class="feature">
              <i class="fas fa-parking"></i> Chỗ đỗ xe
            </div>
            <div class="feature">
              <i class="fas fa-swimming-pool"></i> Hồ bơi
            </div>
          </div>
        </div>
      </div>

      <!-- Thông tin đặt phòng - Đổi vị trí form và sidebar -->
      <div class="booking-details">
        <!-- Sidebar chuyển sang bên trái -->
        <div class="booking-sidebar">
          <div class="sidebar-section">
            <h4>Tóm tắt đặt phòng</h4>
            <div class="booking-dates-summary">
              <div class="date-item">
                <div class="date-label">Nhận phòng</div>
                <div class="date-value">T7, 9 tháng 8 2025</div>
              </div>
              <div class="date-item">
                <div class="date-label">Trả phòng</div>
                <div class="date-value">CN, 17 tháng 8 2025</div>
              </div>
              <div class="date-item">
                <div class="date-label">Tổng thời gian</div>
                <div class="date-value">8 đêm</div>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h4>Chi tiết giá</h4>
            <div class="price-summary-sidebar">
              <div class="price-row">
                <div class="price-label">Giá gốc (8 đêm)</div>
                <div class="price-value">{{ formatPrice(homestay.giaCaHomestay * 8) }}</div>
              </div>
              <div class="price-row discount" v-if="discount > 0">
                <div class="price-label">Giảm giá</div>
                <div class="price-value">- {{ formatPrice(discount) }}</div>
              </div>
              <div class="price-row total">
                <div class="price-label">Tổng cộng</div>
                <div class="price-value">{{ formatPrice(totalPrice) }}</div>
              </div>
              <div class="price-row deposit">
                <div class="price-label">Đặt cọc (30%)</div>
                <div class="price-value">{{ formatPrice(depositAmount) }}</div>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h4>Chính sách hủy</h4>
            <div class="cancellation-policy">
              <p>Miễn phí hủy trước 7 ngày trước ngày nhận phòng.</p>
              <p>Nếu hủy trong vòng 7 ngày trước ngày nhận phòng, bạn sẽ mất tiền cọc.</p>
            </div>
          </div>
        </div>

        <!-- Form nhập thông tin chuyển sang bên phải và mở rộng -->
        <div class="booking-form-container">
          <div class="booking-form-header">
            <h3>Nhập thông tin chi tiết của bạn</h3>
            <div class="form-note">
              <i class="fas fa-info-circle"></i>
              <span>Gần xong rồi! Chi cần điền phần thông tin còn lại</span>
            </div>
          </div>

          <form class="booking-form" @submit.prevent="submitBooking">
            <!-- Thông tin cá nhân -->
            <div class="form-section">
              <h4>Thông tin cá nhân</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="lastName">Họ <span class="required">*</span></label>
                  <input type="text" id="lastName" v-model="bookingInfo.lastName" placeholder="vd: Nguyễn" required />
                </div>
                <div class="form-group">
                  <label for="firstName">Tên <span class="required">*</span></label>
                  <input type="text" id="firstName" v-model="bookingInfo.firstName" placeholder="vd: Tuấn" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="email">Địa chỉ email <span class="required">*</span></label>
                  <input type="email" id="email" v-model="bookingInfo.email" placeholder="Email của bạn" required />
                  <div class="form-hint">Email xác nhận đặt phòng sẽ được gửi đến địa chỉ này</div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="country">Quốc gia/Vùng <span class="required">*</span></label>
                  <select id="country" v-model="bookingInfo.country" required>
                    <option value="VN">Việt Nam</option>
                    <option value="US">Hoa Kỳ</option>
                    <option value="JP">Nhật Bản</option>
                    <option value="KR">Hàn Quốc</option>
                    <option value="CN">Trung Quốc</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Số điện thoại <span class="required">*</span></label>
                  <div class="phone-input">
                    <select id="phoneCode" v-model="bookingInfo.phoneCode">
                      <option value="+84">VN +84</option>
                      <option value="+1">US +1</option>
                      <option value="+81">JP +81</option>
                      <option value="+82">KR +82</option>
                      <option value="+86">CN +86</option>
                    </select>
                    <input type="tel" id="phone" v-model="bookingInfo.phone" placeholder="Số điện thoại của bạn"
                      required />
                  </div>
                  <div class="form-hint">Để xác minh đơn đặt và để chỗ nghỉ liên lạc khi cần</div>
                </div>
              </div>
            </div>

            <!-- Thông tin đặt phòng -->
            <div class="form-section">
              <h4>Chi tiết đặt phòng</h4>
              <div class="booking-dates">
                <div class="date-box">
                  <div class="date-label">Nhận phòng</div>
                  <div class="date-value">T7, 9 tháng 8 2025</div>
                  <div class="date-time">14:00 - 20:00</div>
                </div>
                <div class="date-arrow">→</div>
                <div class="date-box">
                  <div class="date-label">Trả phòng</div>
                  <div class="date-value">CN, 17 tháng 8 2025</div>
                  <div class="date-time">07:00 - 12:00</div>
                </div>
              </div>
              <div class="stay-duration">
                <div class="duration-label">Tổng thời gian lưu trú:</div>
                <div class="duration-value">8 đêm</div>
              </div>
            </div>

            <!-- Yêu cầu đặc biệt -->
            <div class="form-section">
              <h4>Yêu cầu đặc biệt</h4>
              <textarea v-model="bookingInfo.specialRequests"
                placeholder="Nhập yêu cầu đặc biệt của bạn ở đây (không đảm bảo đáp ứng, nhưng chỗ nghỉ sẽ cố gắng hết sức)"
                rows="4"></textarea>
            </div>

            <!-- Tổng tiền -->
            <div class="form-section price-summary">
              <h4>Tóm tắt giá</h4>
              <div class="price-details">
                <div class="price-row">
                  <div class="price-label">Giá gốc (8 đêm)</div>
                  <div class="price-value">{{ formatPrice(homestay.giaCaHomestay * 8) }}</div>
                </div>
                <div class="price-row discount" v-if="discount > 0">
                  <div class="price-label">Giảm giá</div>
                  <div class="price-value">- {{ formatPrice(discount) }}</div>
                </div>
                <div class="price-row total">
                  <div class="price-label">Tổng cộng</div>
                  <div class="price-value">{{ formatPrice(totalPrice) }}</div>
                </div>
                <div class="price-row deposit">
                  <div class="price-label">Đặt cọc (30%)</div>
                  <div class="price-value">{{ formatPrice(depositAmount) }}</div>
                </div>
              </div>
            </div>

            <!-- Nút đặt phòng -->
            <div class="form-actions">
              <button type="submit" class="submit-btn">
                Đặt ngay
              </button>
              <div class="booking-note">
                <i class="fas fa-shield-alt"></i>
                <span>Thanh toán an toàn và bảo mật</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getHomeStayById } from '@/Service/HomeStayService';
import { useNotificationStore } from '@/stores/notificationStore';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();

const homestay = ref({});
const isLoading = ref(true);
const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';

const bookingInfo = ref({
  firstName: '',
  lastName: '',
  email: '',
  country: 'VN',
  phoneCode: '+84',
  phone: '',
  specialRequests: '',
});

// Giả lập dữ liệu mẫu
const discount = ref(200000); // Giảm giá 200,000 VND
const basePrice = computed(() => homestay.value?.giaCaHomestay || 1200000);
const totalPrice = computed(() => (basePrice.value * 8) - discount.value);
const depositAmount = computed(() => Math.round(totalPrice.value * 0.3));

// Format giá tiền
const formatPrice = (price) => {
  if (!price) return '0₫';
  return price.toLocaleString('vi-VN') + '₫';
};

// Lấy thông tin homestay từ API
const fetchHomestayData = async () => {
  isLoading.value = true;
  try {
    const homestayId = route.params.id;
    if (!homestayId) {
      throw new Error('Không tìm thấy ID homestay');
    }

    console.log('Đang tải thông tin homestay với ID:', homestayId);
    const response = await getHomeStayById(homestayId);

    if (response.data) {
      homestay.value = response.data;
      console.log('Dữ liệu homestay từ API:', homestay.value);
    } else {
      throw new Error('Không tìm thấy thông tin homestay');
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin homestay:', error);
    notificationStore.showNotification({
      type: 'error',
      message: 'Không thể tải thông tin homestay. Vui lòng thử lại sau.',
    });
  } finally {
    isLoading.value = false;
  }
};

// Xử lý đặt phòng
const submitBooking = () => {
  // Hiển thị thông báo đặt phòng thành công
  notificationStore.showNotification({
    type: 'success',
    message: 'Đặt phòng thành công! Vui lòng kiểm tra email để xác nhận.',
  });

  // Chuyển hướng đến trang xác nhận
  setTimeout(() => {
    router.push('/');
  }, 2000);
};

onMounted(() => {
  fetchHomestayData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

.booking-page {
  font-family: 'Roboto', sans-serif;
  background-color: #f5f5f5;
  color: #333;
  min-height: 100vh;
}

/* Header và tiến trình */
.booking-header {
  background-color: #003580;
  padding: 20px 0;
}

.booking-progress {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  position: relative;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 5px;
}

.progress-step.completed .step-number,
.progress-step.active .step-number {
  background-color: #fff;
  color: #003580;
}

.progress-line {
  height: 2px;
  width: 100px;
  background-color: rgba(255, 255, 255, 0.3);
  margin: 0 15px;
}

.progress-step.completed+.progress-line {
  background-color: white;
}

/* Container chính */
.booking-container {
  max-width: 1500px;
  margin: 30px auto;
  padding: 0 20px;
}

/* Thông tin homestay đã chọn */
.booking-summary {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.homestay-preview {
  position: relative;
  width: 200px;
  flex-shrink: 0;
}

.homestay-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.homestay-rating {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: #003580;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
}

.rating-value {
  margin-right: 5px;
}

.rating-text {
  margin-right: 5px;
}

.rating-count {
  font-size: 12px;
  opacity: 0.8;
}

.homestay-info {
  margin-left: 20px;
  flex-grow: 1;
}

.homestay-type {
  color: #6b6b6b;
  font-size: 14px;
  margin-bottom: 5px;
}

.homestay-name {
  font-size: 22px;
  margin: 0 0 10px;
}

.homestay-address {
  color: #6b6b6b;
  font-size: 14px;
  margin-bottom: 15px;
}

.homestay-features {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.feature {
  font-size: 14px;
  color: #333;
}

.feature i {
  color: #0071c2;
  margin-right: 5px;
}

/* Layout form đặt phòng và sidebar - THAY ĐỔI VỊ TRÍ */
.booking-details {
  display: flex;
  gap: 30px;
}

.booking-form-container {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.booking-sidebar {
  width: 300px;
  flex-shrink: 0;
}

/* Header form */
.booking-form-header {
  margin-bottom: 25px;
}

.booking-form-header h3 {
  font-size: 20px;
  margin: 0 0 10px;
}

.form-note {
  display: flex;
  align-items: center;
  color: #6b6b6b;
  font-size: 14px;
}

.form-note i {
  color: #0071c2;
  margin-right: 8px;
}

/* Form sections */
.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e7e7e7;
}

.form-section h4 {
  font-size: 18px;
  margin: 0 0 15px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.required {
  color: #e41749;
}

input[type="text"],
input[type="email"],
input[type="tel"],
select,
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
}

.form-hint {
  font-size: 12px;
  color: #6b6b6b;
  margin-top: 5px;
}

.phone-input {
  display: flex;
}

.phone-input select {
  width: 120px;
  margin-right: 10px;
}

/* Booking dates */
.booking-dates {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.date-box {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  flex: 1;
}

.date-arrow {
  margin: 0 15px;
  font-size: 20px;
  color: #6b6b6b;
}

.date-label {
  font-size: 13px;
  color: #6b6b6b;
  margin-bottom: 5px;
}

.date-value {
  font-weight: 500;
  font-size: 16px;
}

.date-time {
  font-size: 13px;
  color: #6b6b6b;
  margin-top: 5px;
}

.stay-duration {
  display: flex;
  justify-content: flex-end;
  font-size: 14px;
}

.duration-label {
  margin-right: 10px;
  color: #6b6b6b;
}

.duration-value {
  font-weight: 500;
}

/* Price summary */
.price-details {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.price-row:last-child {
  margin-bottom: 0;
}

.price-row.discount {
  color: #008009;
}

.price-row.total {
  font-weight: bold;
  font-size: 18px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
}

.price-row.deposit {
  font-weight: 500;
  color: #0071c2;
}

/* Form actions */
.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.submit-btn {
  background-color: #0071c2;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  margin-bottom: 15px;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #005999;
}

.booking-note {
  font-size: 14px;
  color: #6b6b6b;
  display: flex;
  align-items: center;
}

.booking-note i {
  margin-right: 8px;
  color: #0071c2;
}

/* Sidebar */
.sidebar-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sidebar-section h4 {
  font-size: 16px;
  margin: 0 0 15px;
}

.booking-dates-summary .date-item {
  margin-bottom: 15px;
}

.cancellation-policy p {
  font-size: 14px;
  margin: 0 0 10px;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 992px) {
  .booking-details {
    flex-direction: column;
  }

  .booking-sidebar {
    width: 100%;
    order: -1;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .booking-summary {
    flex-direction: column;
  }

  .homestay-preview {
    width: 100%;
    margin-bottom: 20px;
  }

  .homestay-info {
    margin-left: 0;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .booking-progress {
    padding: 0 20px;
  }

  .progress-line {
    width: 50px;
  }
}
</style>
