<template>
  <div class="dathome-adm-container">
    <!-- Header với tiêu đề và nút quay lại -->
    <div class="header-container">
      <h1 class="section-title">Đặt Homestay</h1>
      <button class="back-button" @click="goBack">
        <font-awesome-icon icon="fa-solid fa-arrow-left" />
        Quay lại trang Quản lý
      </button>
    </div>

    <!-- Main content -->
    <div class="content-section">
      <!-- Thanh tiến trình hoàn toàn mới -->
      <div class="booking-process">
        <div class="process-container">
          <!-- Thanh tiến trình chính -->
          <div class="process-bar">
            <div class="process-completed" :style="{ width: currentProgressWidth }"></div>
          </div>

          <!-- Các bước -->
          <div class="process-steps">
            <div
              v-for="(step, index) in bookingSteps"
              :key="index"
              class="process-step"
              :class="{
                'is-active': index === currentStep,
                'is-completed': index < currentStep,
                'is-upcoming': index > currentStep,
              }"
            >
              <div class="step-indicator">
                <div class="step-icon">
                  <i v-if="index < currentStep" class="fas fa-check"></i>
                  <span v-else>{{ index + 1 }}</span>
                </div>
              </div>
              <div class="step-name">{{ step.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step content based on current step -->
      <div class="step-content">
        <!-- Step 1: Chọn phòng -->
        <div v-if="currentStep === 0" class="select-room">
          <h2 class="content-title">Chọn Homestay của bạn</h2>

          <!-- Trạng thái đang tải -->
          <div v-if="isLoading" class="loading-container">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Đang tải dữ liệu homestay...</p>
          </div>

          <!-- Thông báo lỗi -->
          <div v-else-if="hasError" class="error-container">
            <i class="fas fa-exclamation-circle"></i>
            <p>{{ errorMessage }}</p>
            <button class="retry-btn" @click="fetchHomestayData">Thử lại</button>
          </div>

          <!-- Hiển thị danh sách homestay -->
          <div v-else class="homestays-grid">
            <div
              v-for="home in displayedHomestays"
              :key="home.id"
              class="homestay-card"
              :class="{ selected: selectedRoom === home.id }"
              @click="selectRoom(home)"
            >
              <div class="homestay-image">
                <img v-if="home.hinhAnh" :src="home.hinhAnh" :alt="home.tenHomestay" />
                <img v-else src="https://via.placeholder.com/300x200" :alt="home.tenHomestay" />
                <div class="homestay-rating">
                  <span class="stars">★</span> {{ home.danhGiaTrungBinh || '4.8' }} ({{
                    home.soDanhGia || '100'
                  }}
                  đánh giá)
                </div>
                <span class="homestay-status">Hoạt động</span>
              </div>
              <div class="homestay-content">
                <p class="homestay-location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ home.diaChi || 'Trung tâm Mộc Châu, Sơn La' }}
                </p>
                <h3>{{ home.tenHomestay }}</h3>
                <div class="homestay-details">
                  <span><i class="fas fa-home"></i> Homestay</span>
                  <span><i class="fas fa-ruler"></i> {{ home.dienTich || '35' }} m²</span>
                  <span><i class="fas fa-bed"></i> {{ roomCounts[home.id] || 0 }} phòng</span>
                </div>
                <div class="homestay-price">
                  <span class="price"
                    >{{
                      home.giaCaHomestay ? home.giaCaHomestay.toLocaleString('vi-VN') : '850,000'
                    }}₫</span
                  >
                  <span class="price-unit">/đêm</span>
                </div>
                <div class="select-indicator">
                  <i class="fas fa-check-circle"></i>
                  <span>Đã chọn</span>
                </div>
              </div>
            </div>

            <!-- Hiển thị tin nhắn nếu không có homestay nào -->
            <div v-if="displayedHomestays.length === 0" class="no-homestays-message">
              <i class="fas fa-home"></i>
              <p>Không có homestay nào hiện tại. Vui lòng thêm mới homestay.</p>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-secondary" @click="goBack">Hủy</button>
            <button class="btn btn-primary" @click="nextStep" :disabled="!selectedRoom">
              Tiếp tục
            </button>
          </div>
        </div>

        <!-- Step 2: Thông tin khách hàng -->
        <div v-if="currentStep === 1" class="customer-info booking-layout-page">
          <h2 class="content-title">Chi tiết về bạn</h2>

          <div class="booking-layout">
            <!-- Bên trái: Thông tin homestay đã chọn -->
            <div class="booking-sidebar">
              <div class="booking-property-card" v-if="getSelectedHomestay()">
                <div class="property-status">
                  <span class="property-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                  </span>
                </div>
                <h3 class="property-name">{{ getSelectedHomestay().tenHomestay }}</h3>
                <p class="property-address">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ getSelectedHomestay().diaChi || 'Trung tâm Mộc Châu, Sơn La' }}
                </p>
                <div class="property-image">
                  <img
                    :src="getSelectedHomestay().hinhAnh || 'https://via.placeholder.com/300x200'"
                    :alt="getSelectedHomestay().tenHomestay"
                  />
                </div>
                <div class="booking-details">
                  <div class="booking-dates">
                    <div class="check-date">
                      <div class="date-label">Nhận phòng</div>
                      <div class="date-picker">
                        <input
                          type="date"
                          v-model="checkInDate"
                          class="date-input"
                          :min="getTodayDate()"
                        />
                      </div>
                      <div class="date-time">13:00 - 14:00</div>
                    </div>
                    <div class="stay-duration">{{ calculateNights() }} đêm</div>
                    <div class="check-date">
                      <div class="date-label">Trả phòng</div>
                      <div class="date-picker">
                        <input
                          type="date"
                          v-model="checkOutDate"
                          class="date-input"
                          :min="getNextDay(checkInDate)"
                        />
                      </div>
                      <div class="date-time">9:30 - 11:00</div>
                    </div>
                  </div>
                </div>
                <div class="booking-amenities">
                  <div class="amenity"><i class="fas fa-wifi"></i> WiFi miễn phí</div>
                  <div class="amenity"><i class="fas fa-car"></i> Xe đưa đón sân bay</div>
                  <div class="amenity"><i class="fas fa-parking"></i> Chỗ đỗ xe</div>
                  <div class="amenity"><i class="fas fa-utensils"></i> Nhà hàng</div>
                </div>
                <div class="booking-price-summary">
                  <h4>Tóm tắt giá</h4>
                  <div class="price-row">
                    <span>Giá gốc ({{ calculateNights() || 1 }} đêm)</span>
                    <span
                      >{{
                        getSelectedHomestay() && getSelectedHomestay().giaCaHomestay
                          ? (
                              getSelectedHomestay().giaCaHomestay * (calculateNights() || 1)
                            ).toLocaleString('vi-VN')
                          : '850,000'
                      }}₫</span
                    >
                  </div>
                  <div class="price-row discount">
                    <span>Giảm giá</span>
                    <span>-150.000₫</span>
                  </div>
                  <div class="price-row">
                    <span>Thuế và phí</span>
                    <span>200.000₫</span>
                  </div>
                  <div class="price-row total">
                    <span>Tổng cộng</span>
                    <span>{{ getTotalPrice() }}₫</span>
                  </div>
                </div>
              </div>
              <div class="no-selection" v-else>
                <i class="fas fa-exclamation-circle"></i>
                <p>Bạn chưa chọn homestay nào. Vui lòng quay lại bước trước.</p>
              </div>
            </div>

            <!-- Bên phải: Form nhập thông tin khách hàng -->
            <div class="booking-form-container">
              <div class="form-section">
                <h3 class="form-title">Nhập thông tin chi tiết của bạn</h3>
                <p class="form-subtitle">
                  Vui lòng nhập thông tin của bạn bằng ký tự Latin để chỗ nghỉ có thể hiểu được
                </p>

                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">Họ Và Tên <span class="required">*</span></label>
                    <input
                      type="text"
                      id="firstName"
                      v-model="customerInfo.firstName"
                      placeholder="Nhập họ và tên của bạn"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label for="gender">Giới tính <span class="required">*</span></label>
                    <select id="gender" v-model="customerInfo.gender" required>
                      <option value="" disabled selected>Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label for="customerEmail">Địa chỉ email <span class="required">*</span></label>
                  <input
                    type="email"
                    id="customerEmail"
                    v-model="customerInfo.email"
                    placeholder="Nhập địa chỉ email"
                    required
                  />
                  <p class="field-hint">Email xác nhận đặt phòng sẽ được gửi đến địa chỉ này</p>
                </div>

                <div class="form-group">
                  <label for="customerPhone">Số điện thoại <span class="required">*</span></label>
                  <input
                    type="tel"
                    id="customerPhone"
                    v-model="customerInfo.phone"
                    placeholder="Nhập số điện thoại"
                    required
                  />
                  <p class="field-hint">
                    Có thể được sử dụng để thông báo trong trường hợp có vấn đề với việc đặt phòng
                  </p>
                </div>

                <div class="form-group">
                  <label for="specialRequests">Yêu cầu đặc biệt</label>
                  <textarea
                    id="specialRequests"
                    v-model="customerInfo.specialRequests"
                    placeholder="Nhập yêu cầu đặc biệt nếu có"
                  ></textarea>
                  <p class="field-hint">
                    Yêu cầu đặc biệt không đảm bảo sẽ được đáp ứng - tuy nhiên, chỗ nghỉ sẽ cố gắng
                    hết sức để thực hiện.
                  </p>
                </div>

                <div class="action-buttons">
                  <button class="btn btn-secondary" @click="prevStep">Quay lại</button>
                  <button
                    class="btn btn-primary"
                    @click="nextStep"
                    :disabled="!isCustomerInfoValid"
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Xác nhận và thanh toán -->
        <div v-if="currentStep === 2" class="payment">
          <h2 class="content-title">Thanh toán</h2>

          <div class="payment-methods">
            <h3>Chọn phương thức thanh toán</h3>

            <div class="payment-options">
              <div
                class="payment-option"
                :class="{ selected: selectedPayment === 'card' }"
                @click="selectPayment('card')"
              >
                <div class="option-icon"><i class="fas fa-credit-card"></i></div>
                <div class="option-details">
                  <div class="option-name">Thẻ tín dụng/ghi nợ</div>
                  <div class="option-desc">Thanh toán an toàn qua cổng VNPAY</div>
                </div>
                <div class="option-check"><i class="fas fa-check-circle"></i></div>
              </div>

              <div
                class="payment-option"
                :class="{ selected: selectedPayment === 'transfer' }"
                @click="selectPayment('transfer')"
              >
                <div class="option-icon"><i class="fas fa-university"></i></div>
                <div class="option-details">
                  <div class="option-name">Chuyển khoản ngân hàng</div>
                  <div class="option-desc">Chuyển khoản vào tài khoản của chúng tôi</div>
                </div>
                <div class="option-check"><i class="fas fa-check-circle"></i></div>
              </div>

              <div
                class="payment-option"
                :class="{ selected: selectedPayment === 'cash' }"
                @click="selectPayment('cash')"
              >
                <div class="option-icon"><i class="fas fa-money-bill-wave"></i></div>
                <div class="option-details">
                  <div class="option-name">Tiền mặt</div>
                  <div class="option-desc">Thanh toán khi nhận phòng</div>
                </div>
                <div class="option-check"><i class="fas fa-check-circle"></i></div>
              </div>
            </div>
          </div>

          <div class="booking-summary">
            <h3>Tóm tắt đặt phòng</h3>

            <!-- Hiển thị homestay đã chọn -->
            <div v-if="getSelectedHomestay()" class="summary-homestay">
              <div class="summary-homestay-card">
                <img
                  :src="getSelectedHomestay().hinhAnh || 'https://via.placeholder.com/300x200'"
                  :alt="getSelectedHomestay().tenHomestay"
                />
                <div class="summary-homestay-info">
                  <h4>{{ getSelectedHomestay().tenHomestay }}</h4>
                  <p>
                    <i class="fas fa-map-marker-alt"></i>
                    {{ getSelectedHomestay().diaChi || 'Trung tâm Mộc Châu, Sơn La' }}
                  </p>
                </div>
              </div>
            </div>

            <div class="summary-details">
              <div class="summary-item">
                <div class="item-label">Tên homestay</div>
                <div class="item-value">{{ getRoomName(selectedRoom) }}</div>
              </div>

              <div class="summary-item">
                <div class="item-label">Thời gian nhận phòng</div>
                <div class="item-value">{{ formatDisplayDate(checkInDate) }}</div>
              </div>

              <div class="summary-item">
                <div class="item-label">Thời gian trả phòng</div>
                <div class="item-value">{{ formatDisplayDate(checkOutDate) }}</div>
              </div>

              <div class="summary-item">
                <div class="item-label">Số đêm</div>
                <div class="item-value">{{ calculateNights() }} đêm</div>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-item">
                <div class="item-label">Giá phòng (2 đêm)</div>
                <div class="item-value">{{ getRoomPrice(selectedRoom) }}₫</div>
              </div>

              <div class="summary-item">
                <div class="item-label">Thuế và phí</div>
                <div class="item-value">200.000₫</div>
              </div>

              <div class="summary-item total">
                <div class="item-label">Tổng cộng</div>
                <div class="item-value">{{ getTotalPrice() }}₫</div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-secondary" @click="prevStep">Quay lại</button>
            <button class="btn btn-primary" @click="nextStep" :disabled="!selectedPayment">
              Xác nhận đặt phòng
            </button>
          </div>
        </div>

        <!-- Step 4: Hoàn tất -->
        <div v-if="currentStep === 3" class="confirmation">
          <div class="confirmation-content">
            <div class="confirmation-icon">
              <i class="fas fa-check-circle"></i>
            </div>

            <h2>Đặt phòng thành công!</h2>

            <p class="confirmation-message">
              Cảm ơn bạn đã đặt phòng tại Chillstay. Chúng tôi đã gửi email xác nhận đến địa chỉ
              email của bạn.
            </p>

            <div class="booking-info">
              <div class="info-item">
                <div class="info-label">Mã đặt phòng:</div>
                <div class="info-value">CS-2025-11-0358</div>
              </div>

              <div class="info-item">
                <div class="info-label">Tổng tiền:</div>
                <div class="info-value">{{ getTotalPrice() }}₫</div>
              </div>

              <div class="info-item">
                <div class="info-label">Trạng thái thanh toán:</div>
                <div class="info-value payment-status">
                  {{ selectedPayment === 'cash' ? 'Chưa thanh toán' : 'Đã thanh toán' }}
                </div>
              </div>
            </div>

            <div class="action-buttons centered">
              <button class="btn btn-primary" @click="goHome">Quay về trang chủ</button>
              <button class="btn btn-outline" @click="viewBookingDetails">
                Xem chi tiết đặt phòng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllHomeStay, getSoPhongByHomestayId } from '@/Service/HomeStayService'

export default {
  name: 'DatHomeADM',
  data() {
    return {
      currentStep: 0,
      bookingSteps: [
        { label: 'Bạn chọn' },
        { label: 'Chi tiết về bạn' },
        { label: 'Thanh toán' },
        { label: 'Hoàn tất' },
      ],
      selectedRoom: null,
      customerInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'Việt Nam',
        postalCode: '',
        specialRequests: '',
        gender: '',
      },
      selectedPayment: null,
      homestays: [],
      isLoading: true,
      hasError: false,
      errorMessage: '',
      roomCounts: {}, // Store room counts by homestay ID
      checkInDate: '',
      checkOutDate: '',
    }
  },
  computed: {
    currentProgressWidth() {
      const stepCount = this.bookingSteps.length - 1
      const progress = (this.currentStep / stepCount) * 100
      return `${progress}%`
    },
    isCustomerInfoValid() {
      return (
        this.customerInfo.firstName &&
        this.customerInfo.email &&
        this.customerInfo.phone &&
        this.customerInfo.gender
      )
    },
    // Lọc các homestay có trạng thái Hoạt động
    activeHomestays() {
      return this.homestays.filter(
        (home) => home.trangThai === true || home.trangThai === 'Hoạt động',
      )
    },
    // Hiển thị tối đa 6 homestay
    displayedHomestays() {
      return this.activeHomestays.slice(0, 6)
    },
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'admin-dat-homestay' })
    },
    nextStep() {
      if (this.currentStep < this.bookingSteps.length - 1) {
        this.currentStep++
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    selectRoom(homestay) {
      // Nếu homestay là ID (số) thì giữ nguyên, nếu là đối tượng thì lấy ID
      this.selectedRoom = typeof homestay === 'number' ? homestay : homestay.id
      // Lưu thông tin homestay đã chọn
      if (typeof homestay !== 'number') {
        this.selectedHomestay = homestay
      }
    },
    selectPayment(method) {
      this.selectedPayment = method
    },
    getRoomName(roomId) {
      // Nếu có dữ liệu homestay và ID khớp với ID đã chọn
      const selectedHome = this.homestays.find((home) => home.id === roomId)
      if (selectedHome) {
        return selectedHome.tenHomestay
      }

      // Fallback nếu không tìm thấy
      const roomNames = {
        1: 'Phòng Đơn',
        2: 'Phòng Đôi',
        3: 'Phòng Gia Đình',
      }
      return roomNames[roomId] || 'Chưa chọn phòng'
    },
    getRoomPrice(roomId) {
      // Nếu có dữ liệu homestay và ID khớp với ID đã chọn
      const selectedHome = this.homestays.find((home) => home.id === roomId)
      if (selectedHome && selectedHome.giaCaHomestay) {
        return selectedHome.giaCaHomestay.toLocaleString('vi-VN')
      }

      // Fallback nếu không tìm thấy
      const prices = {
        1: '1.600.000',
        2: '2.400.000',
        3: '3.600.000',
      }
      return prices[roomId] || '0'
    },
    getTotalPrice() {
      // Nếu có dữ liệu homestay và ID khớp với ID đã chọn
      const selectedHome = this.homestays.find((home) => home.id === this.selectedRoom)
      if (selectedHome && selectedHome.giaCaHomestay) {
        // Tính số đêm
        const nights = this.calculateNights() || 1
        // Giá phòng * số đêm
        const price = selectedHome.giaCaHomestay * nights
        // Giả sử thuế và phí là 200.000đ
        const tax = 200000
        return (price + tax).toLocaleString('vi-VN')
      }

      // Fallback nếu không tìm thấy
      const prices = {
        1: '1.800.000',
        2: '2.600.000',
        3: '3.800.000',
      }
      return prices[this.selectedRoom] || '0'
    },
    goHome() {
      this.$router.push({ name: 'home' })
    },
    viewBookingDetails() {
      // Implementation to view booking details
      console.log('View booking details')
    },
    // Lấy thông tin homestay đã chọn
    getSelectedHomestay() {
      if (this.selectedHomestay) {
        return this.selectedHomestay
      }

      // Nếu chưa có selectedHomestay nhưng có selectedRoom ID, tìm homestay theo ID
      if (this.selectedRoom) {
        return this.homestays.find((home) => home.id === this.selectedRoom)
      }

      return null
    },
    // Lấy số lượng phòng cho một homestay
    async fetchRoomCount(homestayId) {
      try {
        const response = await getSoPhongByHomestayId(homestayId)
        if (response && response.data !== undefined) {
          // Cập nhật số lượng phòng trong object roomCounts
          this.roomCounts = { ...this.roomCounts, [homestayId]: response.data }
        }
      } catch (error) {
        console.error(`Lỗi khi lấy số phòng cho homestay ${homestayId}:`, error)
        // Đặt giá trị mặc định nếu có lỗi
        this.roomCounts = { ...this.roomCounts, [homestayId]: 0 }
      }
    },

    // Lấy số lượng phòng cho tất cả homestays
    async fetchAllRoomCounts() {
      const promises = this.homestays.map((homestay) => this.fetchRoomCount(homestay.id))
      await Promise.all(promises)
      console.log('Đã lấy số lượng phòng cho tất cả homestays:', this.roomCounts)
    },

    // Gọi API để lấy dữ liệu homestay
    async fetchHomestayData() {
      try {
        this.isLoading = true
        this.hasError = false
        this.errorMessage = ''

        try {
          // Gọi API lấy dữ liệu homestay
          const res = await getAllHomeStay()
          console.log('Dữ liệu homestay từ API:', res.data)

          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            this.homestays = res.data.map((room) => ({
              ...room,
              capacity: room.capacity || 2, // Giả định capacity mặc định nếu không có
            }))

            // Lấy số lượng phòng cho mỗi homestay
            await this.fetchAllRoomCounts()
          } else {
            this.hasError = true
            this.errorMessage = 'Không có dữ liệu homestay nào được tìm thấy.'
            console.warn('API trả về dữ liệu không hợp lệ:', res.data)
          }
        } catch (apiError) {
          this.hasError = true
          if (apiError.response && apiError.response.status === 401) {
            this.errorMessage = 'API yêu cầu xác thực. Vui lòng kiểm tra cấu hình backend.'
            console.error('Lỗi 401 - API yêu cầu xác thực:', apiError.response.data)
          } else if (apiError.message.includes('Network Error')) {
            this.errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'
          } else {
            this.errorMessage =
              'Lỗi khi tải dữ liệu homestay: ' +
              (apiError.response?.data?.message || apiError.message)
          }
          console.error('Lỗi API chi tiết:', {
            message: apiError.message,
            status: apiError.response?.status,
            data: apiError.response?.data,
            url: apiError.config?.url,
          })
        }
      } catch (err) {
        console.error('Lỗi không xác định:', err)
        this.hasError = true
        this.errorMessage = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.'
      } finally {
        this.isLoading = false
      }
    },
    calculateNights() {
      if (this.checkInDate && this.checkOutDate) {
        const checkIn = new Date(this.checkInDate)
        const checkOut = new Date(this.checkOutDate)
        const diffTime = Math.abs(checkOut - checkIn)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
      }
      return 0
    },
    getTodayDate() {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    getNextDay(date) {
      if (!date) return ''
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      const year = nextDay.getFullYear()
      const month = String(nextDay.getMonth() + 1).padStart(2, '0')
      const day = String(nextDay.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatDisplayDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    },
  },
  // Gọi API khi component được khởi tạo
  mounted() {
    this.fetchHomestayData()

    // Khởi tạo ngày nhận phòng là hôm nay
    this.checkInDate = this.getTodayDate()

    // Khởi tạo ngày trả phòng là ngày mai
    this.checkOutDate = this.getNextDay(this.checkInDate)
  },
}
</script>

<style scoped>
.dathome-adm-container {
  /* padding: 20px; */
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Header container */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.8rem;
  color: #333;
  font-weight: 700;
  position: relative;
  padding-bottom: 10px;
  margin: 0;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  border-radius: 3px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(78, 115, 223, 0.1);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(78, 115, 223, 0.2);
}

/* Main content section */
.content-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: rgba(17, 12, 46, 0.1) 0px 10px 20px 0px;
  min-height: 200px;
}

/* Brand New Progress Bar */
.booking-process {
  padding: 10px 0 40px;
  margin-bottom: 20px;
  width: 100%;
}

.process-container {
  max-width: 1800px;
  margin: 0 auto;
  position: relative;
  padding: 0;
  width: 95%;
}

.process-bar {
  position: relative;
  height: 3px;
  background-color: #e8eef3;
  margin: 20px 0 50px;
  z-index: 1;
  width: 100%;
  border-radius: 1.5px;
}

.process-completed {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(to right, #00b8d9, #0065ff);
  transition: width 0.6s ease;
  border-radius: 1.5px;
}

.process-steps {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  z-index: 2;
  width: 100%;
}

.process-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
  position: relative;
  padding: 0 10px;
}

.step-indicator {
  margin-bottom: 12px;
}

.step-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #c1c7d0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #5e6c84;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.step-name {
  font-size: 14px;
  font-weight: 500;
  color: #5e6c84;
  text-align: center;
  transition: all 0.3s ease;
  white-space: nowrap;
}

/* Active Step */
.process-step.is-active .step-icon {
  background-color: white;
  border-color: #0065ff;
  color: #0065ff;
  box-shadow: 0 0 0 4px rgba(0, 101, 255, 0.2);
}

.process-step.is-active .step-name {
  color: #0065ff;
  font-weight: 600;
}

/* Completed Step */
.process-step.is-completed .step-icon {
  background-color: #0065ff;
  border-color: #0065ff;
  color: white;
}

.process-step.is-completed .step-name {
  color: #0065ff;
}

/* Mobile Responsive */
@media (max-width: 767px) {
  .process-bar {
    margin-bottom: 40px;
  }

  .step-icon {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .step-name {
    font-size: 12px;
  }
}

/* Step content */
.step-content {
  padding: 20px 0;
}

.content-title {
  font-size: 1.5rem;
  margin-bottom: 25px;
  color: #333;
  text-align: center;
  font-weight: 600;
}

/* Homestay selection */
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
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: 1px solid #e8e8e8;
  position: relative;
  cursor: pointer;
}

.homestay-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.homestay-card.selected {
  border-color: #4e73df;
  box-shadow: 0 8px 16px rgba(78, 115, 223, 0.25);
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
  transition: transform 0.3s ease;
}

.homestay-card:hover .homestay-image img {
  transform: scale(1.05);
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

.homestay-card:nth-child(3) .homestay-status {
  background: #9c27b0;
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
  margin-bottom: 15px;
  margin-top: 15px;
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

.select-indicator {
  display: none;
  margin-top: 5px;
  color: #28a745;
  font-weight: 600;
  font-size: 0.9rem;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background-color: rgba(40, 167, 69, 0.1);
  padding: 8px;
  border-radius: 8px;
}

.homestay-card.selected .select-indicator {
  display: flex;
}

/* Selected Homestay Summary */
.selected-homestay-summary {
  max-width: 800px;
  margin: 0 auto 30px;
  padding: 20px;
  border-radius: 12px;
  background-color: #f5f9fc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.selected-homestay-summary h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.selected-homestay-card {
  display: flex;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.selected-homestay-card .homestay-image {
  width: 180px;
  height: 140px;
  flex-shrink: 0;
}

.selected-homestay-card .homestay-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selected-homestay-card .homestay-details {
  padding: 15px;
  flex-grow: 1;
}

.selected-homestay-card h4 {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #6c757d;
  font-size: 0.9rem;
}

.detail-item i {
  width: 20px;
  margin-right: 8px;
  color: #0065ff;
}

.detail-item.price {
  margin-top: 12px;
  color: #0065ff;
  font-weight: 600;
  font-size: 1rem;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  color: #dc3545;
}

.no-selection i {
  font-size: 2rem;
  margin-bottom: 10px;
}

.no-selection p {
  font-size: 1rem;
}

/* Form styling */
.form-container {
  max-width: 800px;
  margin: 0 auto 30px;
  padding: 20px;
  border-radius: 12px;
  background-color: #f8f9fa;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

input,
textarea,
select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #4e73df;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

/* Payment methods */
.payment-methods {
  margin-bottom: 30px;
}

.payment-methods h3,
.booking-summary h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.payment-option {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  padding: 15px 20px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-option:hover {
  border-color: #4e73df;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.payment-option.selected {
  border-color: #4e73df;
  background-color: rgba(78, 115, 223, 0.05);
  box-shadow: 0 4px 10px rgba(78, 115, 223, 0.15);
}

.option-icon {
  width: 40px;
  height: 40px;
  background-color: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #4e73df;
}

.option-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.option-desc {
  font-size: 0.9rem;
  color: #6c757d;
}

.option-check {
  font-size: 1.2rem;
  color: #4e73df;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.payment-option.selected .option-check {
  opacity: 1;
}

/* Booking summary */
.booking-summary {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.summary-homestay {
  margin-bottom: 20px;
}

.summary-homestay-card {
  display: flex;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  margin-bottom: 15px;
}

.summary-homestay-card img {
  width: 120px;
  height: 90px;
  object-fit: cover;
}

.summary-homestay-info {
  padding: 12px 15px;
  flex-grow: 1;
}

.summary-homestay-info h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.summary-homestay-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.summary-homestay-info p i {
  margin-right: 6px;
  color: #0065ff;
  width: 16px;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-label {
  color: #6c757d;
  font-size: 0.95rem;
}

.item-value {
  font-weight: 500;
  color: #333;
}

.summary-divider {
  height: 1px;
  background-color: #dee2e6;
  margin: 10px 0;
}

.summary-item.total {
  margin-top: 10px;
  font-size: 1.1rem;
}

.summary-item.total .item-label {
  font-weight: 600;
  color: #333;
}

.summary-item.total .item-value {
  font-weight: 700;
  color: #4e73df;
}

/* Loading và Error Container */
.loading-container,
.error-container,
.no-homestays-message {
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
  color: #48cae4;
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

.no-homestays-message {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.no-homestays-message i {
  font-size: 3rem;
  color: #6c757d;
}

.no-homestays-message p {
  font-size: 1rem;
  color: #6c757d;
}

/* Action buttons */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.action-buttons.centered {
  justify-content: center;
  gap: 20px;
}

.btn {
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(78, 115, 223, 0.1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(78, 115, 223, 0.2);
}

.btn-primary:disabled {
  background: #a2aed0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.btn-outline {
  background-color: transparent;
  color: #4e73df;
  border: 2px solid #4e73df;
}

.btn-outline:hover {
  background-color: rgba(78, 115, 223, 0.1);
}

/* Confirmation page */
.confirmation {
  text-align: center;
  padding: 20px;
}

.confirmation-content {
  max-width: 600px;
  margin: 0 auto;
}

.confirmation-icon {
  font-size: 5rem;
  color: #1cc88a;
  margin-bottom: 20px;
  animation: pulse 1.5s infinite alternate;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.05);
  }
}

.confirmation h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
}

.confirmation-message {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 30px;
}

.booking-info {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin: 30px 0;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #6c757d;
}

.info-value {
  font-weight: 600;
  color: #333;
}

.payment-status {
  color: #f6c23e;
}

/* Responsive design */
@media (max-width: 768px) {
  .room-options {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .action-buttons {
    flex-direction: column-reverse;
    gap: 15px;
  }

  .action-buttons.centered {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .room-options {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .action-buttons {
    flex-direction: column-reverse;
    gap: 15px;
  }

  .action-buttons.centered {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

/* Booking.com Style Layout */
/* .booking-layout-page {
  background-color: #f5f8fa;
} */

.booking-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 0 auto;
  max-width: 1400px;
}

.booking-sidebar {
  flex: 1.5;
  min-width: 400px;
  max-width: 580px;
}

.booking-form-container {
  flex: 3;
  min-width: 350px;
}

/* Property Card */
.booking-property-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 20px;
}

.property-status {
  margin-bottom: 10px;
}

.property-rating {
  color: #febb02;
  font-size: 14px;
}

.property-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333;
}

.property-address {
  font-size: 14px;
  color: #6b6b6b;
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
  gap: 5px;
}

.property-address i {
  margin-top: 3px;
  color: #0071c2;
}

.property-image {
  margin-bottom: 15px;
  border-radius: 4px;
  overflow: hidden;
}

.property-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* Booking Details */
.booking-details {
  padding: 15px 0;
  border-top: 1px solid #e7e7e7;
  border-bottom: 1px solid #e7e7e7;
  margin-bottom: 15px;
}

.booking-dates {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.check-date {
  flex: 1;
}

.date-label {
  font-size: 12px;
  color: #6b6b6b;
  margin-bottom: 5px;
}

.date-value {
  font-weight: 700;
  font-size: 14px;
  color: #333;
}

.date-time {
  font-size: 12px;
  color: #6b6b6b;
  margin-top: 5px;
}

.stay-duration {
  position: relative;
  width: 60px;
  height: 30px;
  background-color: #ebf3ff;
  color: #0071c2;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

/* Amenities */
.booking-amenities {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 15px;
}

.amenity {
  font-size: 13px;
  color: #6b6b6b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.amenity i {
  color: #0071c2;
}

/* Price Summary */
.booking-price-summary {
  padding-top: 15px;
}

.booking-price-summary h4 {
  font-size: 16px;
  margin: 0 0 10px 0;
  color: #333;
}

.price-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
}

.price-row.discount {
  color: #008009;
}

.price-row.total {
  font-weight: 700;
  font-size: 16px;
  color: #333;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e7e7e7;
}

/* Form Section */
.form-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.form-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 5px 0;
  color: #333;
}

.form-subtitle {
  color: #6b6b6b;
  font-size: 14px;
  margin-bottom: 20px;
}

.form-group .required {
  color: #e41c00;
}

.field-hint {
  font-size: 12px;
  color: #6b6b6b;
  margin-top: 4px;
}

/* Form inputs */
.booking-form-container .form-group {
  margin-bottom: 20px;
}

.booking-form-container label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: 500;
}

.booking-form-container input,
.booking-form-container select,
.booking-form-container textarea {
  border: 1px solid #bdbdbd;
  border-radius: 4px;
  padding: 10px 12px;
  width: 100%;
  font-size: 14px;
}

.booking-form-container input:focus,
.booking-form-container select:focus,
.booking-form-container textarea:focus {
  border-color: #0071c2;
  box-shadow: 0 0 0 2px rgba(0, 113, 194, 0.15);
  outline: none;
}

.booking-form-container .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Action buttons for booking layout */
.booking-form-container .action-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

.booking-form-container .btn-primary {
  background-color: #0071c2;
  border-color: #0071c2;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
}

.booking-form-container .btn-primary:hover {
  background-color: #00487a;
}

.booking-form-container .btn-secondary {
  background-color: #fff;
  border: 1px solid #0071c2;
  color: #0071c2;
  margin-right: 15px;
}

/* Responsive adjustments for booking layout */
@media (max-width: 768px) {
  .booking-layout {
    flex-direction: column;
  }

  .booking-sidebar {
    max-width: 100%;
  }

  .booking-form-container .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

.date-picker {
  margin-bottom: 5px;
}

.date-input {
  border: 1px solid #bdbdbd;
  border-radius: 4px;
  padding: 8px 12px;
  width: 100%;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.date-input:focus {
  border-color: #0071c2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 113, 194, 0.15);
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.7;
  filter: invert(0.5) sepia(1) saturate(5) hue-rotate(175deg);
}
</style>
