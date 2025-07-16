<template>
  <div class="dathome-adm-container">
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
            <div class="step-icon">
              <transition name="fade-scale" mode="out-in">
                <i v-if="index < currentStep" key="check" class="fas fa-check"></i>
                <span v-else key="number">{{ index + 1 }}</span>
              </transition>
            </div>
            <div class="step-name">{{ step.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="content-section">
      <!-- Step content based on current step -->
      <div class="step-content">
        <!-- Step 1: Thông tin khách hàng (previously Step 2) -->
        <div v-if="currentStep === 0" class="customer-info booking-layout-page">
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
                          :class="{ 'is-invalid': validationErrors.checkInDate }"
                          :min="getTodayDate()"
                        />
                      </div>
                      <div class="date-time">13:00 - 14:00</div>
                    </div>
                    <div class="stay-duration">
                      <span>{{ calculateNights() }}</span>
                      <span class="night-text">đêm</span>
                    </div>
                    <div class="check-date">
                      <div class="date-label">Trả phòng</div>
                      <div class="date-picker">
                        <input
                          type="date"
                          v-model="checkOutDate"
                          class="date-input"
                          :class="{ 'is-invalid': validationErrors.checkOutDate }"
                          :min="getNextDay(checkInDate)"
                        />
                      </div>
                      <div class="date-time">9:30 - 11:00</div>
                    </div>
                  </div>
                </div>
                <!-- Cập nhật phần booking-amenities -->
                <h4 class="section-subtitle">
                  Tiện nghi của {{ getSelectedHomestay()?.tenHomestay || 'Homestay' }}
                </h4>
                <div class="booking-amenities">
                  <div v-if="isLoadingAmenities" class="amenities-loading">
                    <div class="spinner-container">
                      <i class="fas fa-spinner fa-spin"></i>
                      <span>Đang tải tiện nghi...</span>
                    </div>
                  </div>

                  <div
                    v-else-if="selectedHomestayTienNghis && selectedHomestayTienNghis.length > 0"
                    class="amenities-list"
                  >
                    <div
                      v-for="(item, index) in selectedHomestayTienNghis"
                      :key="index"
                      class="amenity-item"
                    >
                      <div class="amenity-content">
                        {{ item.tenTienNghi || item.tienNghi?.tenTienNghi }}
                        <span class="amenity-quantity">({{ item.soLuong || 1 }})</span>
                      </div>
                    </div>
                  </div>

                  <div v-else class="amenities-empty">
                    <span>Không có thông tin tiện nghi</span>
                  </div>
                </div>

                <div class="divider-section">
                  <hr />
                </div>

                <!-- Thêm phần hiển thị dịch vụ -->
                <h4 class="section-subtitle">
                  Dịch vụ của {{ getSelectedHomestay()?.tenHomestay || 'Homestay' }}
                </h4>
                <div class="booking-services">
                  <div v-if="isLoadingServices" class="services-loading">
                    <div class="spinner-container">
                      <i class="fas fa-spinner fa-spin"></i>
                      <span>Đang tải dịch vụ...</span>
                    </div>
                  </div>

                  <div
                    v-else-if="selectedHomestayDichVus && selectedHomestayDichVus.length > 0"
                    class="services-list"
                  >
                    <div
                      v-for="(service, index) in selectedHomestayDichVus"
                      :key="index"
                      class="service-item"
                    >
                      <div class="service-row">
                        <div class="service-checkbox">
                          <input
                            type="checkbox"
                            :id="'service-' + service.id"
                            v-model="service.isSelected"
                            @change="updateSelectedServices(service, service.isSelected)"
                          />
                          <label :for="'service-' + service.id" class="service-name">
                            {{ service.tenDichVu }}
                          </label>
                        </div>

                        <!-- Nút +/- hiển thị cùng hàng với tên dịch vụ -->
                        <div v-if="service.isSelected" class="quantity-controls">
                          <button
                            class="quantity-btn decrease"
                            @click="decreaseQuantity(service)"
                            :disabled="service.quantity <= 1"
                          >
                            <i class="fas fa-minus"></i>
                          </button>
                          <div class="quantity-value">{{ service.quantity || 1 }}</div>
                          <button class="quantity-btn increase" @click="increaseQuantity(service)">
                            <i class="fas fa-plus"></i>
                          </button>
                        </div>
                      </div>

                      <!-- Phần giá và thành tiền hiển thị trên cùng một hàng -->
                      <div class="service-price-row" v-if="service.isSelected">
                        <div class="service-price">
                          Đơn giá: {{ service.gia?.toLocaleString('vi-VN') || '0' }}₫
                        </div>
                        <div class="service-total-price">
                          Thành tiền:
                          {{
                            ((service.gia || 0) * (service.quantity || 1)).toLocaleString('vi-VN')
                          }}₫
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="services-empty">
                    <span>Không có thông tin dịch vụ</span>
                  </div>
                </div>

                <div class="divider-section">
                  <hr />
                </div>

                <div class="divider-section">
                  <hr />
                </div>

                <!-- Phần hiển thị giảm giá trong booking-price-summary -->
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
                    <span>
                      <span v-if="isLoadingGiamGia">
                        <i class="fas fa-spinner fa-spin"></i> Đang tải giảm giá...
                      </span>
                      <span v-else>
                        Giảm giá
                        <span v-if="giamGia && giamGia.giaTri">
                          ({{ giamGia.tenGiamGia }}: {{ giamGia.giaTri }}%)
                        </span>
                        <span v-else>(0%)</span>
                      </span>
                    </span>
                    <span>{{ getDiscountDisplayText() }}</span>
                  </div>
                  <!-- Thêm dòng tổng tiền dịch vụ nếu có -->
                  <div class="price-row" v-if="getTotalServicePrice() > 0">
                    <span>Dịch vụ</span>
                    <span>{{ getTotalServicePrice().toLocaleString('vi-VN') }}₫</span>
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
                <p class="form-subtitle">Vui lòng nhập thông tin của bạn</p>

                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">Họ Và Tên <span class="required">*</span></label>
                    <input
                      type="text"
                      id="firstName"
                      v-model="customerInfo.firstName"
                      placeholder="Nhập họ và tên của bạn"
                      :class="{ 'is-invalid': validationErrors.firstName }"
                      required
                    />
                    <div v-if="validationErrors.firstName" class="invalid-feedback">
                      {{ validationErrors.firstName }}
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="gender">Giới tính <span class="required">*</span></label>
                    <select
                      id="gender"
                      v-model="customerInfo.gender"
                      :class="{ 'is-invalid': validationErrors.gender }"
                      required
                    >
                      <option value="" disabled selected>Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                    <div v-if="validationErrors.gender" class="invalid-feedback">
                      {{ validationErrors.gender }}
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="customerEmail">Địa chỉ email <span class="required">*</span></label>
                  <input
                    type="email"
                    id="customerEmail"
                    v-model="customerInfo.email"
                    placeholder="Nhập địa chỉ email"
                    :class="{ 'is-invalid': validationErrors.email }"
                    required
                  />
                  <div v-if="validationErrors.email" class="invalid-feedback">
                    {{ validationErrors.email }}
                  </div>
                  <p class="field-hint">Email xác nhận đặt phòng sẽ được gửi đến địa chỉ này</p>
                </div>

                <div class="form-group">
                  <label for="customerPhone">Số điện thoại <span class="required">*</span></label>
                  <input
                    type="tel"
                    id="customerPhone"
                    v-model="customerInfo.phone"
                    placeholder="Nhập số điện thoại"
                    :class="{ 'is-invalid': validationErrors.phone }"
                    required
                  />
                  <div v-if="validationErrors.phone" class="invalid-feedback">
                    {{ validationErrors.phone }}
                  </div>
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
                  <button class="btn btn-secondary" @click="goBack">Quay lại</button>
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

        <!-- Step 2: Xác nhận và thanh toán (previously Step 3) -->
        <div v-if="currentStep === 1" class="payment">
          <h2 class="content-title">Thanh toán</h2>

          <div class="payment-methods">
            <h3>Chọn phương thức thanh toán</h3>

            <div class="payment-options">
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
                :class="{
                  selected: selectedPayment === 'cash',
                  disabled: !canUseCashPayment,
                }"
                @click="canUseCashPayment ? selectPayment('cash') : null"
              >
                <div class="option-icon"><i class="fas fa-money-bill-wave"></i></div>
                <div class="option-details">
                  <div class="option-name">Tiền mặt</div>
                  <div class="option-desc">Thanh toán khi nhận phòng</div>
                  <div v-if="!canUseCashPayment" class="option-restriction">
                    Chức năng đang giới hạn với tài khoản của bạn
                  </div>
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

              <!-- Thêm phần hiển thị dịch vụ đã chọn -->
              <div v-if="selectedServices.length > 0">
                <div class="summary-section-title">Dịch vụ đã chọn</div>
                <div
                  v-for="(service, index) in selectedServices"
                  :key="index"
                  class="summary-service-item"
                >
                  <div class="service-detail">
                    <div class="summary-service-name">{{ service.tenDichVu }}</div>
                    <div class="service-meta">
                      {{ service.quantity }} x {{ service.gia?.toLocaleString('vi-VN') }}₫
                    </div>
                  </div>
                  <div class="service-total">
                    {{ (service.gia * service.quantity).toLocaleString('vi-VN') }}₫
                  </div>
                </div>
                <div class="summary-divider"></div>
              </div>

              <div class="summary-item">
                <div class="item-label">Giá phòng ({{ calculateNights() }} đêm)</div>
                <div class="item-value">{{ getRoomPrice(selectedRoom) }}₫</div>
              </div>

              <div class="summary-item discount-item">
                <div class="item-label">
                  <span v-if="isLoadingGiamGia">
                    <i class="fas fa-spinner fa-spin"></i> Đang tải...
                  </span>
                  <span v-else>
                    Giảm giá
                    <span v-if="giamGia && giamGia.giaTri">
                      ({{ giamGia.tenGiamGia }}: {{ giamGia.giaTri }}%)
                    </span>
                    <span v-else>(0%)</span>
                  </span>
                </div>
                <div class="item-value discount-value">{{ getDiscountDisplayText() }}</div>
              </div>

              <!-- Hiển thị tổng tiền dịch vụ nếu có -->
              <div class="summary-item" v-if="getTotalServicePrice() > 0">
                <div class="item-label">Tổng tiền dịch vụ</div>
                <div class="item-value">{{ getTotalServicePrice().toLocaleString('vi-VN') }}₫</div>
              </div>

              <div class="summary-item total">
                <div class="item-label">Tổng cộng</div>
                <div class="item-value">{{ getTotalPrice() }}₫</div>
              </div>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-secondary" @click="prevStep" :disabled="isSubmitting">
              Quay lại
            </button>
            <button
              class="btn btn-primary"
              @click="nextStep"
              :disabled="!selectedPayment || isSubmitting"
            >
              <span v-if="isSubmitting">
                <i class="fas fa-spinner fa-spin"></i> Đang xử lý...
              </span>
              <span v-else>Xác nhận đặt phòng</span>
            </button>
          </div>
        </div>

        <!-- Step 3: Hoàn tất (previously Step 4) -->
        <div v-if="currentStep === 2" class="confirmation">
          <!-- ... existing confirmation content ... -->
          <div class="confirmation-content">
            <div v-if="selectedPayment === 'transfer' && paymentUrl">
              <!-- Hiển thị QR code thanh toán khi chọn chuyển khoản -->
              <div class="payment-qr-container">
                <h2>Thanh toán đặt phòng</h2>
                <p class="payment-instruction">Vui lòng quét mã QR để hoàn tất thanh toán</p>

                <div class="payment-link-container" v-if="paymentUrl">
                  <button class="open-payment-btn" @click="openPaymentModal">
                    <i class="fas fa-external-link-alt"></i> Mở trang thanh toán
                  </button>

                  <!-- Thêm nút làm mới trạng thái -->
                  <button
                    class="refresh-status-btn"
                    @click="forceFetchPaymentStatus"
                    v-if="paymentStatus === 'DangCho' || paymentStatus === 'Chưa thanh toán'"
                  >
                    <i class="fas fa-sync-alt"></i> Làm mới trạng thái
                  </button>
                </div>

                <!-- Modal thanh toán -->
                <teleport to="body">
                  <div
                    class="modal-overlay"
                    v-if="showPaymentModal"
                    @click.self="closePaymentModal"
                  >
                    <div class="modal-container">
                      <div class="modal-body">
                        <iframe
                          :src="paymentCheckoutUrl || paymentUrl"
                          class="payment-iframe"
                          allow="payment"
                          ref="paymentIframe"
                          @load="handleIframeLoad"
                          sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
                        ></iframe>
                      </div>
                      <div class="modal-footer">
                        <div
                          class="payment-status-value"
                          :class="'status-' + paymentStatus?.toLowerCase()"
                        >
                          {{ formatPaymentStatus(paymentStatus) }}
                          <span v-if="autoCheckingStatus" class="auto-checking"
                            >(Đang tự động cập nhật...)</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </teleport>
              </div>
            </div>

            <div v-else class="confirmation-normal">
              <div class="confirmation-icon">
                <i class="fas fa-check-circle"></i>
              </div>

              <h2>Đặt phòng thành công!</h2>

              <p class="confirmation-message">
                Cảm ơn bạn đã đặt phòng tại Chillstay. Chúng tôi đã gửi email xác nhận đến địa chỉ
                email của bạn.
              </p>
            </div>

            <div class="booking-info">
              <div class="info-item">
                <div class="info-label">Mã đặt phòng:</div>
                <div class="info-value">{{ bookingReference || 'CS-2025-11-0358' }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">Tổng tiền:</div>
                <div class="info-value">{{ getTotalPrice() }}₫</div>
              </div>

              <div class="info-item">
                <div class="info-label">Trạng thái thanh toán:</div>
                <div class="info-value payment-status">
                  {{ getPaymentStatusText }}
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

    <!-- Trong phần template, thêm modal xác nhận ở phía cuối nhưng trước </template> -->
    <teleport to="body">
      <div class="modal-overlay" v-if="showPaymentConfirm" @click.self="closePaymentConfirm">
        <div class="modal-container payment-confirm-modal">
          <div class="modal-header">
            <h3>Xác nhận phương thức thanh toán</h3>
          </div>
          <div class="modal-body payment-confirm-body">
            <p class="payment-confirm-message">Vui lòng chọn phương thức thanh toán</p>
            <div class="payment-info">
              <div class="payment-info-item">
                <span class="payment-info-label">Tổng tiền thanh toán:</span>
                <span class="payment-info-value">{{ getTotalPrice() }}₫</span>
              </div>
              <div class="payment-info-item">
                <span class="payment-info-label">Tiền cọc:</span>
                <span class="payment-info-value">{{ getDepositAmount() }}₫</span>
              </div>
            </div>
          </div>
          <div class="modal-footer payment-confirm-footer">
            <button class="btn btn-outline" @click="processPayment('deposit')">
              <i class="fas fa-wallet"></i> Thanh toán cọc
            </button>
            <button class="btn btn-primary" @click="processPayment('full')">
              <i class="fas fa-check-circle"></i> Thanh toán toàn bộ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Removed cash payment modal -->
  </div>
</template>

<script>
import { getAllHomeStay, getSoPhongByHomestayId2 } from '@/Service/HomeStayService'
import {
  getTienNghiByIdHomeStay,
  getDichVuByIdHomeStay,
  createDatHome,
  // createDatHomeChuyenKhoan,
  getGiamGiaByIdHomeStay,
  getSoLuongKhachHangByTaiKhoanId,
} from '@/Service/DatHomeService'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import notification from '@/utils/notification'
import PaymentService from '@/Service/PaymentService'

export default {
  name: 'DatHomeADM',
  data() {
    return {
      currentStep: 0,
      bookingSteps: [{ label: 'Chi tiết về bạn' }, { label: 'Thanh toán' }, { label: 'Hoàn tất' }],
      showPaymentModal: false,
      selectedRoom: null,
      customerInfo: {
        firstName: '',
        email: '',
        phone: '',
        address: '',
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
      selectedHomestayTienNghis: [], // Lưu tiện nghi của homestay đã chọn
      selectedHomestayDichVus: [], // Lưu dịch vụ của homestay đã chọn
      selectedServices: [], // Lưu dịch vụ được chọn
      bookingData: null,
      isSubmitting: false,
      bookingReference: null,
      isLoadingAmenities: true,
      isLoadingServices: true,
      giamGia: null, // Thêm state để lưu thông tin giảm giá
      isLoadingGiamGia: false, // Trạng thái đang tải giảm giá
      validationErrors: {}, // Add validation errors object
      paymentUrl: null,
      paymentCheckoutUrl: null,
      paymentStatus: 'Chưa thanh toán',
      autoCheckingStatus: false,
      checkingStatus: false,
      orderCode: null,
      statusCheckInterval: null,
      checkTimeout: null, // Timeout tổng cho việc kiểm tra thanh toán
      abortController: null, // AbortController để hủy request đang chờ
      showPaymentConfirm: false,
      paymentOption: 'ThanhToanToanBo', // Mặc định là thanh toán toàn bộ
      // Removed cash payment variables
      customerCount: 0, // Số lượng khách hàng đã đặt
      isLoadingCustomerCount: true, // Trạng thái đang tải số lượng khách hàng
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
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
    // Hiển thị toàn bộ homestay
    displayedHomestays() {
      return this.activeHomestays
    },
    getPaymentStatusText() {
      switch (this.paymentStatus) {
        case 'DangCho':
          return 'Đang chờ thanh toán'
        case 'ThanhCong':
          return 'Đã thanh toán'
        case 'ThatBai':
          return 'Thanh toán thất bại'
        case 'KhongXacDinh':
          return 'Không xác định'
        default:
          return this.selectedPayment === 'cash' ? 'Chưa thanh toán' : 'Đang chờ xử lý'
      }
    },
    // Kiểm tra xem có thể sử dụng chức năng thanh toán tiền mặt không
    canUseCashPayment() {
      return this.customerCount >= 3 && !this.isLoadingCustomerCount
    },
    // Removed cash payment computed properties
  },
  methods: {
    handleIframeLoad() {
      try {
        // Kiểm tra URL hiện tại của iframe
        const iframe = this.$refs.paymentIframe
        if (!iframe || !iframe.contentWindow) return

        // Thử lấy URL hiện tại của iframe
        // Lưu ý: Có thể gặp lỗi CORS nếu iframe từ domain khác
        const currentUrl = iframe.contentWindow.location.href
        console.log('Iframe URL changed:', currentUrl)

        // Kiểm tra nếu URL chứa các tham số thành công hoặc hủy
        if (
          currentUrl.includes('payment-success') ||
          currentUrl.includes('success=true') ||
          currentUrl.includes('status=success')
        ) {
          console.log('Thanh toán thành công, đóng modal')

          // Đóng modal
          this.showPaymentModal = false

          // Dừng việc kiểm tra tự động
          this.stopAutoStatusCheck()

          // Kiểm tra trạng thái thanh toán một lần cuối cùng
          setTimeout(() => {
            // Gọi API để cập nhật trạng thái cuối cùng
            PaymentService.checkPaymentStatus(this.orderCode)
              .then(() => {
                console.log('Đã gọi API cập nhật trạng thái lần cuối')
                // Cập nhật lại trạng thái sau lần cuối
                this.checkPaymentStatus()
              })
              .catch((err) => console.error('Lỗi khi cập nhật trạng thái lần cuối:', err))
          }, 1000)
        } else if (
          currentUrl.includes('payment-failure') ||
          currentUrl.includes('cancel=true') ||
          currentUrl.includes('status=cancel')
        ) {
          console.log('Phát hiện URL hủy thanh toán, cập nhật ngay trạng thái')

          // Đóng modal
          this.showPaymentModal = false

          // Dừng việc kiểm tra tự động
          this.stopAutoStatusCheck()

          // Thiết lập trạng thái ngay lập tức và lưu vào localStorage
          this.paymentStatus = 'ThatBai'
          localStorage.setItem('paymentStatus_' + this.orderCode, 'ThatBai')
          notification.error('Thanh toán đã bị hủy')

          // Gọi API với tín hiệu đã hủy để cập nhật trạng thái trong database
          PaymentService.checkPaymentStatus(this.orderCode, true)
            .then(() => {
              console.log('Đã gửi tín hiệu hủy thanh toán đến server')

              // Không cần kiểm tra lại trạng thái, vì đã xác định là thất bại
              // Nhưng vẫn gọi forceFetchPaymentStatus để ghi log
              setTimeout(() => {
                this.forceFetchPaymentStatus()
              }, 2000)
            })
            .catch((err) => console.error('Lỗi khi cập nhật trạng thái hủy:', err))
        }
      } catch (e) {
        // Xử lý lỗi CORS - không thể truy cập URL của iframe từ domain khác
        console.log('Không thể truy cập URL iframe do chính sách CORS', e)
      }
    },

    goBack() {
      this.$router.push({ name: 'admin-dat-homestay' })
    },
    nextStep() {
      if (this.currentStep < this.bookingSteps.length - 1) {
        if (this.currentStep === 0) {
          // Validate customer info before moving to payment step
          if (!this.validateCustomerInfo()) {
            return // Stop if validation fails
          }
        }

        if (this.currentStep === 1) {
          // Nếu đang ở bước thanh toán, kiểm tra phương thức thanh toán
          if (this.selectedPayment === 'transfer') {
            // Nếu là chuyển khoản, hiển thị modal xác nhận
            this.showPaymentConfirm = true
          } else {
            // Tiếp tục quy trình đặt phòng thông thường
            this.submitBooking()
          }
        } else {
          this.currentStep++
        }
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        // Nếu đang ở step 1 và quay về step 0, xóa hết dữ liệu đã chọn
        this.currentStep--
      }
    },

    // Gửi dữ liệu đặt phòng tới API
    async submitBooking() {
      if (!this.selectedPayment) {
        // Sử dụng notification utility để hiển thị thông báo
        notification.error('Vui lòng chọn phương thức thanh toán')
        return
      }

      try {
        this.isSubmitting = true

        // Lấy homestay đã chọn
        const selectedHomestay = this.getSelectedHomestay()
        if (!selectedHomestay || !this.user) {
          throw new Error('Không tìm thấy homestay đã chọn hoặc người dùng chưa đăng nhập')
        }

        // Validate customer information and dates with our enhanced validation method
        if (!this.validateCustomerInfo()) {
          this.isSubmitting = false
          return
        }

        // Chuẩn bị dữ liệu đặt phòng
        const bookingData = {
          // Thông tin khách hàng
          tenKhachHang: this.customerInfo.firstName.trim(),
          soDienThoai: this.customerInfo.phone.trim(),
          email: this.customerInfo.email.trim(),
          diaChi: this.customerInfo.address ? this.customerInfo.address.trim() : 'Không có',
          gioiTinh: this.customerInfo.gender,

          // Thông tin đặt phòng
          homeStayId: selectedHomestay.id,
          taiKhoanId: this.user.id, // Lấy từ user đã đăng nhập
          giamGiaId: this.giamGia ? this.giamGia.id : null, // Lấy ID giảm giá nếu có
          ngayNhanPhong: this.checkInDate,
          ngayTraPhong: this.checkOutDate,
          tongTien: this.calculateTotalAmount(),
          tongTienDichVu: this.getTotalServicePrice() || 0,
          noiDungYeuCau: this.customerInfo.specialRequests
            ? this.customerInfo.specialRequests.trim()
            : 'Không có yêu cầu đặc biệt',

          // Thêm dịch vụ đã chọn
          dichVu: this.selectedServices.map((service) => ({
            dichVuId: service.id,
            soLuong: service.quantity || 1,
          })),
        }

        console.log('Dữ liệu đặt phòng:', bookingData)

        // Gọi API đặt phòng dựa trên phương thức thanh toán
        let response
        if (this.selectedPayment === 'transfer') {
          // Nếu là chuyển khoản, gọi API tạo link thanh toán với trạng thái "DangCho"
          // response = await createDatHomeChuyenKhoan(bookingData)

          // Thêm loại thanh toán vào dữ liệu gửi đi
          const paymentData = {
            ...bookingData,
            paymentType: this.paymentOption, // 'Coc' hoặc 'ThanhToanToanBo'
          }

          // Gọi API tạo link thanh toán với tham số chỉ định loại thanh toán
          response = await PaymentService.createPaymentLink(paymentData)
          console.log('Đặt phòng với phương thức chuyển khoản:', response.data)

          // Lấy thông tin từ response
          if (response && response.data) {
            this.bookingData = response.data.datHome
            this.bookingReference =
              response.data.datHome?.maDatHome ||
              'CS-' + Math.floor(Math.random() * 900000 + 100000)

            // Lưu URL hình ảnh QR code
            this.paymentUrl = response.data.qrDataURL

            // Lưu URL thanh toán riêng nếu có
            this.paymentCheckoutUrl =
              response.data.checkoutURL ||
              response.data.paymentUrl ||
              response.data.payOsLink ||
              response.data.paymentLink
            this.orderCode = response.data.orderCode // Mã đơn hàng để kiểm tra trạng thái

            // Bắt đầu kiểm tra trạng thái thanh toán
            this.startAutoStatusCheck()

            // Hiển thị thông báo thành công
            notification.success('Đặt phòng thành công! Vui lòng hoàn tất thanh toán')

            // Chuyển đến bước hoàn tất
            this.currentStep++
          }
        } else {
          // Nếu là tiền mặt, sử dụng API đặt phòng thông thường với trạng thái "DaXacNhan"
          response = await createDatHome(bookingData)
          console.log('Đặt phòng với phương thức tiền mặt:', response.data)

          if (response && response.data) {
            this.bookingData = response.data
            this.bookingReference =
              response.data.maDatHome || 'CS-' + Math.floor(Math.random() * 900000 + 100000)

            // Hiển thị thông báo thành công bằng notification utility
            notification.success('Đặt phòng thành công!')

            // Chuyển đến bước hoàn tất
            this.currentStep++
          }
        }
      } catch (error) {
        console.error('Lỗi khi đặt phòng:', error)
        // Hiển thị thông báo lỗi bằng notification utility
        notification.error(`Đặt phòng thất bại: ${error.response?.data?.message || error.message}`)
      } finally {
        this.isSubmitting = false
      }
    },

    // Tính tổng tiền
    calculateTotalAmount() {
      const selectedHomestay = this.getSelectedHomestay()
      if (!selectedHomestay || !selectedHomestay.giaCaHomestay) return 0

      const nights = this.calculateNights() || 1
      const roomPrice = selectedHomestay.giaCaHomestay * nights
      const discountAmount = this.calculateDiscountAmount() // Số tiền giảm giá
      const servicePrice = this.getTotalServicePrice() // Thêm giá dịch vụ

      return roomPrice - discountAmount + servicePrice
    },

    // Tính tiền cọc (giả sử 30% tổng tiền)

    // Lấy tiện nghi cho homestay đã chọn
    async fetchSelectedHomestayTienNghis(homestayId) {
      try {
        console.log('Đang gọi API lấy tiện nghi cho homestay:', homestayId)
        this.isLoadingAmenities = true
        const response = await getTienNghiByIdHomeStay(homestayId)
        console.log('Kết quả API tiện nghi:', response)

        if (response && response.data) {
          this.selectedHomestayTienNghis = response.data
          console.log('Đã lưu tiện nghi của homestay:', this.selectedHomestayTienNghis)
        } else {
          console.warn('API tiện nghi trả về dữ liệu không hợp lệ:', response)
          this.selectedHomestayTienNghis = []
        }
      } catch (error) {
        console.error(`Lỗi khi lấy tiện nghi cho homestay ${homestayId}:`, error)
        console.error('Chi tiết lỗi API:', error.response || error.message)
        this.selectedHomestayTienNghis = []

        // Hiển thị thông báo lỗi
        notification.warning('Không thể tải tiện nghi của homestay')
      } finally {
        this.isLoadingAmenities = false
      }
    },

    // Lấy dịch vụ cho homestay đã chọn
    async fetchSelectedHomestayDichVus(homestayId) {
      try {
        console.log('Đang gọi API lấy dịch vụ cho homestay:', homestayId)
        this.isLoadingServices = true
        const response = await getDichVuByIdHomeStay(homestayId)
        console.log('Kết quả API dịch vụ:', response)

        if (response && response.data) {
          // Thêm thuộc tính isSelected và quantity cho mỗi dịch vụ
          this.selectedHomestayDichVus = response.data.map((service) => ({
            ...service,
            isSelected: false,
            quantity: 1,
          }))
          console.log('Đã lưu dịch vụ của homestay:', this.selectedHomestayDichVus)
        } else {
          console.warn('API dịch vụ trả về dữ liệu không hợp lệ:', response)
          this.selectedHomestayDichVus = []
        }
      } catch (error) {
        console.error(`Lỗi khi lấy dịch vụ cho homestay ${homestayId}:`, error)
        console.error('Chi tiết lỗi API:', error.response || error.message)
        this.selectedHomestayDichVus = []

        // Hiển thị thông báo lỗi
        notification.warning('Không thể tải dịch vụ của homestay')
      } finally {
        this.isLoadingServices = false
      }
    },

    selectRoom(homestay) {
      // Nếu homestay là ID (số) thì giữ nguyên, nếu là đối tượng thì lấy ID
      this.selectedRoom = typeof homestay === 'number' ? homestay : homestay.id
      console.log('Đã chọn homestay:', this.selectedRoom)

      // Lưu thông tin homestay đã chọn
      if (typeof homestay !== 'number') {
        console.log('Lưu thông tin homestay:', homestay)
        this.selectedHomestay = homestay

        // Lấy tiện nghi, dịch vụ và giảm giá cho homestay đã chọn
        if (homestay && homestay.id) {
          console.log('Bắt đầu lấy dữ liệu cho homestay ID:', homestay.id)
          this.fetchSelectedHomestayTienNghis(homestay.id)
          this.fetchSelectedHomestayDichVus(homestay.id)
          this.fetchGiamGiaByHomestay(homestay.id)
        } else {
          console.warn('Không thể lấy dữ liệu: homestay không có ID')
        }
      } else if (homestay && this.homestays) {
        // Nếu chỉ có ID, tìm homestay trong danh sách
        const selectedHome = this.homestays.find((h) => h.id === homestay)
        if (selectedHome) {
          console.log('Tìm thấy homestay từ ID:', selectedHome)
          this.selectedHomestay = selectedHome
          this.fetchSelectedHomestayTienNghis(homestay)
          this.fetchSelectedHomestayDichVus(homestay)
          this.fetchGiamGiaByHomestay(homestay)
        } else {
          console.warn('Không tìm thấy homestay với ID:', homestay)
        }
      }
    },
    selectPayment(method) {
      // Kiểm tra nếu là phương thức tiền mặt và không đủ điều kiện
      if (method === 'cash' && !this.canUseCashPayment) {
        notification.warning('Chức năng thanh toán tiền mặt đang giới hạn với tài khoản của bạn')
        return
      }
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
        // Số tiền giảm giá
        const discountAmount = this.calculateDiscountAmount()
        // Tổng giá dịch vụ
        const servicePrice = this.getTotalServicePrice()
        return (price - discountAmount + servicePrice).toLocaleString('vi-VN')
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
      this.$router.push({ name: 'admin-dat-homestay' })
    },
    viewBookingDetails() {
      if (this.bookingData && this.bookingData.id) {
        this.$router.push({ name: 'admin-dat-homestay', params: { id: this.bookingData.id } })
      } else {
        notification.error('Không thể xem chi tiết đặt phòng')
      }
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
        const response = await getSoPhongByHomestayId2(homestayId)
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
          return this.homestays // Return homestays for chaining
        } else {
          this.hasError = true
          this.errorMessage = 'Không có dữ liệu homestay nào được tìm thấy.'
          console.warn('API trả về dữ liệu không hợp lệ:', res.data)
          return [] // Return empty array
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
        return [] // Return empty array on error
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
    // Cập nhật danh sách dịch vụ đã chọn
    updateSelectedServices(service, isSelected) {
      if (isSelected) {
        // Thêm dịch vụ vào danh sách đã chọn nếu chưa có
        if (!this.selectedServices.some((s) => s.id === service.id)) {
          this.selectedServices.push({
            id: service.id,
            tenDichVu: service.tenDichVu,
            gia: service.gia,
            quantity: service.quantity || 1,
          })
        }
      } else {
        // Xóa dịch vụ khỏi danh sách đã chọn
        this.selectedServices = this.selectedServices.filter((s) => s.id !== service.id)
      }
      console.log('Danh sách dịch vụ đã chọn:', this.selectedServices)
    },

    // Tăng số lượng dịch vụ
    increaseQuantity(service) {
      service.quantity = (service.quantity || 1) + 1
      // Cập nhật số lượng trong danh sách dịch vụ đã chọn
      const selectedService = this.selectedServices.find((s) => s.id === service.id)
      if (selectedService) {
        selectedService.quantity = service.quantity

        // Thông báo nhỏ hiển thị giá đã cập nhật
        const serviceTotalPrice = service.gia * service.quantity
        const formattedPrice = serviceTotalPrice.toLocaleString('vi-VN')
        notification.info(
          `Đã cập nhật: ${service.quantity} ${service.tenDichVu} - ${formattedPrice}₫`,
        )
      }
    },

    // Giảm số lượng dịch vụ
    decreaseQuantity(service) {
      if (service.quantity > 1) {
        service.quantity -= 1
        // Cập nhật số lượng trong danh sách dịch vụ đã chọn
        const selectedService = this.selectedServices.find((s) => s.id === service.id)
        if (selectedService) {
          selectedService.quantity = service.quantity

          // Thông báo nhỏ hiển thị giá đã cập nhật
          const serviceTotalPrice = service.gia * service.quantity
          const formattedPrice = serviceTotalPrice.toLocaleString('vi-VN')
          notification.info(
            `Đã cập nhật: ${service.quantity} ${service.tenDichVu} - ${formattedPrice}₫`,
          )
        }
      }
    },

    // Tính tổng tiền dịch vụ
    getTotalServicePrice() {
      if (!this.selectedServices || this.selectedServices.length === 0) {
        return 0
      }
      return this.selectedServices.reduce((total, service) => {
        return total + (service.gia || 0) * (service.quantity || 1)
      }, 0)
    },

    // Lấy giảm giá cho homestay đã chọn
    async fetchGiamGiaByHomestay(homestayId) {
      try {
        console.log('Đang gọi API lấy giảm giá cho homestay:', homestayId)
        this.isLoadingGiamGia = true
        const response = await getGiamGiaByIdHomeStay(homestayId)

        if (response && response.data && response.data.id) {
          // Chỉ set giamGia khi API trả về dữ liệu hợp lệ có ID
          this.giamGia = response.data
          console.log('Đã lưu giảm giá của homestay:', this.giamGia)
        } else {
          // Không có giảm giá hoặc API trả về null
          console.log('Homestay không có giảm giá')
          this.giamGia = null
        }
      } catch (error) {
        // Xử lý các lỗi khác nếu có
        console.log('Không thể lấy thông tin giảm giá:', error)
        this.giamGia = null
      } finally {
        this.isLoadingGiamGia = false
      }
    },

    // Tính số tiền được giảm giá
    calculateDiscountAmount() {
      if (!this.giamGia || !this.giamGia.giaTri) return 0

      const selectedHomestay = this.getSelectedHomestay()
      if (!selectedHomestay || !selectedHomestay.giaCaHomestay) return 0

      const nights = this.calculateNights() || 1
      const roomPrice = selectedHomestay.giaCaHomestay * nights

      // Tính giảm giá dựa trên phần trăm
      let discountAmount = Math.round((roomPrice * this.giamGia.giaTri) / 100)

      // Kiểm tra giới hạn giảm tối đa nếu có
      if (this.giamGia.giamToiDa && discountAmount > this.giamGia.giamToiDa) {
        discountAmount = this.giamGia.giamToiDa
      }

      // Không giảm quá giá phòng
      return Math.min(discountAmount, roomPrice)
    },

    // Lấy chuỗi hiển thị giảm giá
    getDiscountDisplayText() {
      const discountAmount = this.calculateDiscountAmount()

      // Luôn hiển thị số tiền giảm giá (0đ nếu không có giảm giá)
      return `-${discountAmount.toLocaleString('vi-VN')}₫`
    },

    // Add validation method for customer information
    validateCustomerInfo() {
      // Clear previous errors
      this.validationErrors = {}

      let isValid = true

      // Validate firstName (required)
      if (!this.customerInfo.firstName || !this.customerInfo.firstName.trim()) {
        this.validationErrors.firstName = 'Họ và tên không được để trống'
        isValid = false
      }

      // Validate email (required, format)
      if (!this.customerInfo.email || !this.customerInfo.email.trim()) {
        this.validationErrors.email = 'Email không được để trống'
        isValid = false
      } else {
        const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        if (!emailRegex.test(this.customerInfo.email)) {
          this.validationErrors.email = 'Email không hợp lệ'
          isValid = false
        }
      }

      // Validate phone (required, format)
      if (!this.customerInfo.phone || !this.customerInfo.phone.trim()) {
        this.validationErrors.phone = 'Số điện thoại không được để trống'
        isValid = false
      } else {
        const phoneRegex = /^(0)[0-9]{9,10}$/
        if (!phoneRegex.test(this.customerInfo.phone)) {
          this.validationErrors.phone = 'Số điện thoại phải có 10-11 chữ số và bắt đầu bằng số 0'
          isValid = false
        }
      }

      // Validate gender (required)
      if (!this.customerInfo.gender) {
        this.validationErrors.gender = 'Vui lòng chọn giới tính'
        isValid = false
      }

      // Enhanced date validation
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Validate check-in date
      if (!this.checkInDate) {
        this.validationErrors.checkInDate = 'Vui lòng chọn ngày nhận phòng'
        isValid = false
      } else {
        const checkIn = new Date(this.checkInDate)
        if (checkIn < today) {
          this.validationErrors.checkInDate = 'Ngày nhận phòng không thể là ngày trong quá khứ'
          isValid = false
        }
      }

      // Validate check-out date
      if (!this.checkOutDate) {
        this.validationErrors.checkOutDate = 'Vui lòng chọn ngày trả phòng'
        isValid = false
      } else if (this.checkInDate) {
        const checkIn = new Date(this.checkInDate)
        const checkOut = new Date(this.checkOutDate)

        // Check if checkout date is after checkin date
        if (checkOut <= checkIn) {
          this.validationErrors.checkOutDate = 'Ngày trả phòng phải sau ngày nhận phòng'
          isValid = false
        }

        // Check for minimum stay (1 night)
        const oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds
        const diffDays = Math.round(Math.abs((checkOut - checkIn) / oneDay))
        if (diffDays < 1) {
          this.validationErrors.checkOutDate = 'Thời gian lưu trú tối thiểu là 1 đêm'
          isValid = false
        }

        // Check for maximum stay (30 days)
        if (diffDays > 30) {
          this.validationErrors.checkOutDate = 'Thời gian lưu trú tối đa là 30 đêm'
          isValid = false
        }
      }

      if (!isValid) {
        // Show the first error message using the notification utility
        const firstError = Object.values(this.validationErrors)[0]
        notification.error(firstError)
      }

      return isValid
    },
    formatPaymentStatus(status) {
      const statusMap = {
        DangCho: 'Đang chờ thanh toán',
        ThanhCong: 'Thanh toán thành công',
        ThatBai: 'Thanh toán thất bại',
        KhongXacDinh: 'Không xác định',
      }
      return statusMap[status] || status
    },
    // Open payment modal and start status checking
    openPaymentModal() {
      // Hiển thị modal và bắt đầu kiểm tra
      this.showPaymentModal = true
      this.startAutoStatusCheck()
    },

    // Đóng modal thanh toán và dừng kiểm tra trạng thái
    closePaymentModal() {
      console.log('Đóng modal thanh toán')

      // Đóng modal
      this.showPaymentModal = false

      // Dừng việc kiểm tra tự động
      this.stopAutoStatusCheck()
    },

    // Bắt đầu tự động kiểm tra trạng thái thanh toán
    startAutoStatusCheck() {
      if (!this.orderCode) return

      // Dừng interval cũ nếu có
      this.stopAutoStatusCheck()

      this.autoCheckingStatus = true
      console.log('Bắt đầu tự động kiểm tra trạng thái thanh toán')

      // Tạo một AbortController để kiểm soát việc hủy request
      this.abortController = new AbortController()

      // Thiết lập timeout tổng để tự động dừng sau 10 phút
      this.checkTimeout = setTimeout(
        () => {
          console.log('Đã hết thời gian chờ thanh toán (10 phút)')
          this.stopAutoStatusCheck()
          notification.warning('Đã hết thời gian chờ thanh toán')
        },
        10 * 60 * 1000,
      ) // 10 phút

      // Kiểm tra ngay lập tức một lần
      this.checkPaymentStatus()

      // Thiết lập interval để kiểm tra mỗi 3 giây theo yêu cầu
      this.statusCheckInterval = setInterval(() => {
        // Chỉ tiếp tục kiểm tra nếu chưa nhận được trạng thái cuối cùng
        if (this.paymentStatus !== 'ThanhCong' && this.paymentStatus !== 'ThatBai') {
          this.checkPaymentStatus()
        } else {
          // Nếu đã có trạng thái cuối cùng, dừng kiểm tra
          console.log('Đã nhận được trạng thái cuối cùng, dừng kiểm tra')
          this.stopAutoStatusCheck()
        }
      }, 3000) // Mỗi 3 giây theo yêu cầu
    },

    // Dừng tự động kiểm tra trạng thái
    stopAutoStatusCheck() {
      console.log('Đang dừng kiểm tra trạng thái thanh toán...')

      // Hủy timeout tổng nếu có
      if (this.checkTimeout) {
        clearTimeout(this.checkTimeout)
        this.checkTimeout = null
      }

      // Dừng interval kiểm tra
      if (this.statusCheckInterval) {
        clearInterval(this.statusCheckInterval)
        this.statusCheckInterval = null
      }

      // Hủy request đang chờ nếu có
      if (this.abortController) {
        this.abortController.abort()
        this.abortController = null
      }

      this.autoCheckingStatus = false
      console.log('Đã dừng tự động kiểm tra trạng thái thanh toán')
    },

    // Kiểm tra trạng thái thanh toán
    async checkPaymentStatus() {
      if (!this.orderCode || !this.abortController) return

      // Không cập nhật nếu đã biết trạng thái cuối cùng
      if (this.paymentStatus === 'ThatBai' || this.paymentStatus === 'ThanhCong') {
        console.log(`Đã xác định trạng thái cuối cùng (${this.paymentStatus}), không cập nhật nữa`)
        this.stopAutoStatusCheck() // Dừng kiểm tra tự động
        return
      }

      try {
        console.log('Đang kiểm tra trạng thái thanh toán...')

        // Gọi API để lấy thông tin thanh toán từ database với signal
        const dbStatus = await PaymentService.getPaymentStatusFromDB(
          this.orderCode,
          this.abortController.signal,
        )

        if (dbStatus && dbStatus.data) {
          const oldStatus = this.paymentStatus
          const newStatus = dbStatus.data.trangThai

          console.log(
            `Nhận được trạng thái từ server: ${newStatus} (hiện tại: ${this.paymentStatus})`,
          )

          // Chỉ cập nhật nếu chưa ở trạng thái cuối cùng
          if (this.paymentStatus !== 'ThatBai' && this.paymentStatus !== 'ThanhCong') {
            // Cập nhật trạng thái mới
            this.paymentStatus = newStatus

            // Xử lý khi trạng thái thay đổi
            if (oldStatus !== this.paymentStatus) {
              console.log(
                `Trạng thái thanh toán thay đổi từ ${oldStatus} thành ${this.paymentStatus}`,
              )

              if (this.paymentStatus === 'ThanhCong') {
                notification.success('Thanh toán thành công!')
                this.stopAutoStatusCheck() // Dừng kiểm tra khi thanh toán thành công
              } else if (this.paymentStatus === 'ThatBai') {
                notification.error('Thanh toán thất bại')
                this.stopAutoStatusCheck() // Dừng kiểm tra khi thanh toán thất bại
              }
            }
          } else {
            console.log(
              `Giữ nguyên trạng thái cuối cùng (${this.paymentStatus}), không cập nhật thành ${newStatus}`,
            )
          }
        }
      } catch (error) {
        // Bỏ qua lỗi khi request bị hủy (do dừng kiểm tra)
        if (error.name !== 'AbortError') {
          console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error)
        }
      }
    },
    getDepositAmount() {
      // Tiền cọc cố định là 500.000đ
      return '500.000'
    },
    processPayment(option) {
      // Xử lý lựa chọn của người dùng
      console.log(
        `Người dùng chọn: ${option === 'deposit' ? 'Thanh toán cọc' : 'Thanh toán toàn bộ'}`,
      )

      // Map giá trị từ UI sang giá trị phù hợp với database
      const paymentTypeMap = {
        deposit: 'Coc',
        full: 'ThanhToanToanBo',
      }

      // Lưu lại lựa chọn của người dùng đã được map
      this.paymentOption = paymentTypeMap[option]
      console.log('Loại thanh toán gửi đến server:', this.paymentOption)

      // Đóng modal xác nhận
      this.showPaymentConfirm = false

      // Gọi hàm đặt phòng
      this.submitBooking()
    },
    closePaymentConfirm() {
      this.showPaymentConfirm = false
    },
    // Bắt buộc cập nhật trạng thái thanh toán từ server
    async forceFetchPaymentStatus() {
      if (!this.orderCode) return

      // Không cập nhật nếu đã biết thanh toán thất bại
      if (this.paymentStatus === 'ThatBai') {
        console.log('Đã biết thanh toán thất bại, giữ nguyên trạng thái')
        notification.info('Trạng thái thanh toán: Thất bại')
        return
      }

      try {
        console.log('Đang bắt buộc cập nhật trạng thái thanh toán...')

        // Gọi API để lấy trạng thái hiện tại từ database
        const response = await PaymentService.getPaymentStatusFromDB(this.orderCode)

        if (response && response.data) {
          const newStatus = response.data.trangThai
          console.log(
            `Trạng thái thanh toán từ server: ${newStatus} (hiện tại: ${this.paymentStatus})`,
          )

          // Nếu đã hủy hoặc người dùng đã nhấn hủy, nhưng server vẫn trả về DangCho
          if (newStatus === 'DangCho' && window.location.href.includes('payment-failure')) {
            console.log('Phát hiện URL hủy nhưng server vẫn trả về DangCho, gửi tín hiệu hủy')
            // Gửi tín hiệu hủy thanh toán rõ ràng
            await PaymentService.checkPaymentStatus(this.orderCode, true)
            notification.warning('Đang cập nhật trạng thái hủy...')

            // Đặt trạng thái thành ThatBai ngay lập tức
            this.paymentStatus = 'ThatBai'
            notification.error('Thanh toán thất bại')

            return
          }

          // Chỉ cập nhật nếu chưa ở trạng thái cuối cùng hoặc nhận trạng thái cuối cùng mới
          if (
            (this.paymentStatus !== 'ThatBai' && this.paymentStatus !== 'ThanhCong') ||
            newStatus === 'ThanhCong' ||
            newStatus === 'ThatBai'
          ) {
            // Cập nhật trạng thái mới
            this.paymentStatus = newStatus

            // Nếu vẫn đang chờ xử lý sau khi đã hủy, gửi lại yêu cầu cập nhật
            if (this.paymentStatus === 'DangCho') {
              console.log('Vẫn đang ở trạng thái chờ xử lý sau khi hủy, gửi lại yêu cầu cập nhật')
              await PaymentService.checkPaymentStatus(this.orderCode, true)
              notification.warning('Đang cố gắng cập nhật trạng thái...')

              // Kiểm tra lại sau 3 giây
              setTimeout(() => this.forceFetchPaymentStatus(), 3000)
            } else if (this.paymentStatus === 'ThanhCong') {
              notification.success('Thanh toán thành công!')
            } else if (this.paymentStatus === 'ThatBai') {
              notification.error('Thanh toán thất bại')
            }
          } else {
            console.log(`Giữ nguyên trạng thái hiện tại: ${this.paymentStatus}`)
          }
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái thanh toán:', error)
        notification.error('Không thể cập nhật trạng thái thanh toán')
      }
    },

    // Removed cash payment methods

    // Phương thức lấy số lượng khách hàng theo ID tài khoản
    async fetchCustomerCount(taiKhoanId) {
      try {
        this.isLoadingCustomerCount = true
        const response = await getSoLuongKhachHangByTaiKhoanId(taiKhoanId)
        if (response && response.data !== undefined) {
          this.customerCount = response.data
          console.log('Số lượng khách hàng:', this.customerCount)
        }
      } catch (error) {
        console.error('Lỗi khi lấy số lượng khách hàng:', error)
        this.customerCount = 0
      } finally {
        this.isLoadingCustomerCount = false
      }
    },
  },
  // Gọi API khi component được khởi tạo
  mounted() {
    // Kiểm tra xem có id homestay trong route params không
    const homestayId = this.$route.params.id ? parseInt(this.$route.params.id) : null

    // Kiểm tra số lượng khách hàng nếu người dùng đã đăng nhập
    if (this.user && this.user.id) {
      this.fetchCustomerCount(this.user.id)
    }

    this.fetchHomestayData().then(() => {
      if (homestayId) {
        // Tìm homestay với id từ route params
        const selectedHomestay = this.homestays.find((home) => home.id === homestayId)
        if (selectedHomestay) {
          console.log('Đã tìm thấy homestay từ route params:', selectedHomestay.id)
          this.selectRoom(selectedHomestay)
        } else {
          console.warn('Không tìm thấy homestay với ID:', homestayId)
          // Nếu không tìm thấy, chọn homestay đầu tiên
          if (this.homestays && this.homestays.length > 0) {
            this.selectRoom(this.homestays[0])
          }
        }
      } else {
        // Nếu không có ID trong route, chọn homestay đầu tiên
        if (this.homestays && this.homestays.length > 0) {
          this.selectRoom(this.homestays[0])
        } else {
          console.warn('Không có homestay nào được tải')
        }
      }
    })

    // Khởi tạo ngày nhận phòng là hôm nay
    this.checkInDate = this.getTodayDate()

    // Khởi tạo ngày trả phòng là ngày mai
    this.checkOutDate = this.getNextDay(this.checkInDate)

    // Khôi phục trạng thái thanh toán từ localStorage nếu có
    if (this.orderCode) {
      const savedStatus = localStorage.getItem('paymentStatus_' + this.orderCode)
      if (savedStatus === 'ThatBai') {
        console.log('Khôi phục trạng thái thanh toán thất bại từ localStorage')
        this.paymentStatus = 'ThatBai'
      }
    }

    // Automatically set a selected room for testing since we removed the selection step
    // This should be replaced with actual logic to get the room ID from route params or other sources
    this.selectRoom(1)
  },
  // Đảm bảo dừng kiểm tra trạng thái khi component bị hủy
  beforeUnmount() {
    this.stopAutoStatusCheck()
    // Đảm bảo đóng modal khi component bị hủy
    this.showPaymentModal = false
  },
}
</script>

<style scoped>
.dathome-adm-container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Header container
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 5px;
} */

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
  border-radius: 0 0 16px 16px;
  padding: 0 30px 30px;
  box-shadow: rgba(17, 12, 46, 0.1) 0px 10px 20px 0px;
  min-height: 200px;
  position: relative;
  z-index: 1;
  margin-top: 0;
}

/* Brand New Progress Bar - Modern Design */
.booking-process {
  padding: 35px 0 60px;
  margin-bottom: 0;
  width: 100%;
  background: white;
  position: relative;
  z-index: 2;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.process-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  padding: 0;
  width: 85%;
}

.process-bar {
  position: relative;
  height: 3px;
  background: linear-gradient(
    to right,
    rgba(240, 240, 240, 0.5),
    rgba(240, 240, 240, 0.8),
    rgba(240, 240, 240, 0.5)
  );
  margin: 0;
  z-index: 1;
  width: 100%;
  border-radius: 3px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.process-completed {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(to right, #0071c2, #0095ff);
  transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(0, 113, 194, 0.4);
}

.process-steps {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  width: 100%;
  transform: translateY(-50%);
}

.process-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  color: #9e9e9e;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow:
    0 0 0 5px white,
    0 3px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.step-icon::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.step-icon:hover::after {
  opacity: 1;
}

.step-name {
  font-size: 14px;
  font-weight: 500;
  color: #757575;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  white-space: nowrap;
  position: absolute;
  top: 48px;
  transform: translateX(-50%);
  left: 50%;
  width: max-content;
  letter-spacing: 0.2px;
}

/* Active Step */
.process-step.is-active .step-icon {
  background: linear-gradient(135deg, #0071c2, #0095ff);
  border-color: #0095ff;
  color: white;
  transform: scale(1.05);
  box-shadow:
    0 0 0 5px white,
    0 5px 12px rgba(0, 113, 194, 0.3);
}

.process-step.is-active .step-name {
  color: #0071c2;
  font-weight: 600;
  transform: translateX(-50%) scale(1.05);
}

/* Completed Step */
.process-step.is-completed .step-icon {
  background: linear-gradient(135deg, #0071c2, #0095ff);
  border-color: #0095ff;
  color: white;
  box-shadow:
    0 0 0 5px white,
    0 3px 6px rgba(0, 113, 194, 0.2);
}

.process-step.is-completed .step-name {
  color: #0071c2;
}

/* Hover effects */
.process-step:not(.is-active):not(.is-completed):hover .step-icon {
  border-color: #bdbdbd;
  transform: scale(1.03);
  box-shadow:
    0 0 0 5px white,
    0 4px 8px rgba(0, 0, 0, 0.15);
}

.process-step:not(.is-active):not(.is-completed):hover .step-name {
  color: #424242;
}

/* Step content */
.step-content {
  padding-top: 20px;
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

.form-group {
  margin-bottom: 15px;
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

.payment-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}

.payment-option.disabled:hover {
  transform: none;
  box-shadow: none;
  border-color: #e0e0e0;
}

.option-restriction {
  margin-top: 8px;
  font-size: 12px;
  color: #dc3545;
  font-style: italic;
  padding: 4px 8px;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
  border-left: 3px solid #dc3545;
}

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
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
  padding-bottom: 0;
}

.btn {
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  min-width: 120px;
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

  .booking-amenities,
  .services-list {
    grid-template-columns: 1fr;
  }

  .booking-property-card {
    padding: 15px;
  }

  .property-name {
    font-size: 18px;
  }
}

/* Booking.com Style Layout */

.booking-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin: 0 auto;
  max-width: 1400px;
  align-items: stretch;
}

.booking-sidebar {
  flex: 1;
  min-width: 380px;
  max-width: 480px;
}

.booking-form-container {
  flex: 1.2;
  min-width: 350px;
}

/* Property Card */
.booking-property-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.booking-property-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
}

.property-status {
  margin-bottom: 10px;
}

.property-rating {
  color: #febb02;
  font-size: 14px;
  display: inline-block;
  background: rgba(254, 187, 2, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
}

.property-name {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333;
  position: relative;
  padding-bottom: 8px;
}

.property-name:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #0071c2, rgba(0, 113, 194, 0.3));
  border-radius: 3px;
}

.property-address {
  font-size: 14px;
  color: #6b6b6b;
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  background-color: rgba(0, 113, 194, 0.05);
  padding: 8px 10px;
  border-radius: 6px;
  width: fit-content;
}

.property-address i {
  margin-top: 3px;
  color: #0071c2;
}

.property-image {
  margin-bottom: 18px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.property-image img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.4s ease;
}

.property-image:hover img {
  transform: scale(1.03);
}

.booking-details {
  padding: 15px;
  margin: 20px 0;
  background-color: rgba(0, 113, 194, 0.03);
  border-radius: 8px;
  border: 1px dashed rgba(0, 113, 194, 0.2);
}

.booking-dates {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.check-date {
  flex: 1;
  position: relative;
  z-index: 1;
}

.date-label {
  font-size: 12px;
  color: #6b6b6b;
  margin-bottom: 5px;
  font-weight: 500;
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
  font-style: italic;
}

.stay-duration {
  position: relative;
  min-width: 60px;
  height: 30px;
  background-color: rgba(0, 113, 194, 0.1);
  color: #0071c2;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  margin: 0 10px;
  padding: 0 15px;
}

.stay-duration span {
  display: inline-block;
  vertical-align: middle;
}

.night-text {
  margin-left: 3px;
}

.stay-duration:before,
.stay-duration:after {
  content: '';
  position: absolute;
  top: 50%;
  width: 15px;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
}

.stay-duration:before {
  left: -15px;
}

.stay-duration:after {
  right: -15px;
}

.divider-section {
  margin: 25px 0;
}

.divider-section hr {
  border: none;
  height: 1px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0));
  margin: 0;
}

.booking-amenities {
  margin: 15px 0;
  border-radius: 8px;
  overflow: hidden;
}

.amenities-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 15px;
  margin-top: 10px;
}

.amenity-item {
  background: transparent;
  border-radius: 0;
  padding: 5px 0;
  border-left: none;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  box-shadow: none;
  cursor: pointer;
}

.amenity-item:hover {
  transform: translateX(3px);
  box-shadow: none;
}

.amenity-item:hover .amenity-content {
  color: #0071c2;
}

.amenity-item:hover .amenity-content:before {
  color: #0071c2;
  transform: scale(1.2);
}

.amenity-content {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.amenity-content:before {
  content: '•';
  color: #0071c2;
  font-size: 18px;
  margin-right: 5px;
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.amenity-quantity {
  color: #0071c2;
  font-weight: 500;
  font-size: 0.85em;
  margin-left: 4px;
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.amenities-loading,
.amenities-empty {
  text-align: center;
  padding: 15px;
  color: #6c757d;
  background-color: rgba(0, 113, 194, 0.03);
  border-radius: 8px;
  margin-top: 10px;
  border: 1px dashed rgba(0, 113, 194, 0.2);
}

.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #0071c2;
}

.section-subtitle {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 5px 0;
  color: #333;
  padding: 8px 0 8px 12px;
  border-left: 4px solid #0071c2;
  background-color: rgba(0, 113, 194, 0.05);
  border-radius: 0 6px 6px 0;
  display: flex;
  align-items: center;
}

.section-subtitle:before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #0071c2;
  margin-right: 8px;
}

.booking-services {
  margin: 15px 0;
  border-radius: 8px;
  overflow: hidden;
}

.services-loading,
.services-empty {
  text-align: center;
  padding: 15px;
  color: #6c757d;
  background-color: rgba(40, 167, 69, 0.03);
  border-radius: 8px;
  margin-top: 10px;
  border: 1px dashed rgba(40, 167, 69, 0.2);
}

.services-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 10px;
}

.service-item {
  background: rgba(40, 167, 69, 0.03);
  border-radius: 8px;
  padding: 12px 15px;
  transition: background-color 0.2s ease;
}

.service-item:hover {
  background-color: rgba(40, 167, 69, 0.08);
}

.service-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.service-checkbox {
  display: flex;
  align-items: center;
  flex: 1;
}

.service-checkbox input[type='checkbox'] {
  margin-right: 10px;
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #28a745;
}

.service-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  cursor: pointer;
}

.service-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-left: 28px;
  border: 1px dashed #e0e0e0;
}

.service-price {
  font-size: 14px;
  color: #6c757d;
}

.service-total-price {
  font-size: 14px;
  font-weight: 600;
  color: #28a745;
}

.quantity-controls {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 30px;
  padding: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

.quantity-btn {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 12px;
}

.quantity-btn.decrease {
  color: #dc3545;
}

.quantity-btn.increase {
  color: #28a745;
}

.quantity-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.quantity-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.quantity-value {
  font-size: 14px;
  margin: 0 8px;
  font-weight: 600;
  color: #333;
  min-width: 20px;
  text-align: center;
}

.service-total {
  font-weight: 600;
  color: #28a745;
  font-size: 14px;
  white-space: nowrap;
  text-align: right;
  min-width: 90px;
}

.divider-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.divider-section hr {
  border: none;
  height: 1px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0));
  margin: 0;
}

.booking-price-summary {
  padding-top: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.booking-price-summary h4 {
  font-size: 16px;
  margin: 0 0 12px 0;
  color: #333;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: relative;
}

.booking-price-summary h4:after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(to right, #0071c2, rgba(0, 113, 194, 0.3));
}

.price-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 10px;
  padding: 5px 0;
}

.price-row.discount {
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.05);
  padding: 8px;
  border-radius: 6px;
  margin: 8px 0;
}

.price-row.discount span:last-child {
  font-weight: 600;
}

.price-row.total {
  font-weight: 700;
  font-size: 16px;
  margin-top: 15px;
  padding-top: 12px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.price-row.total span:last-child {
  color: #0071c2;
  font-size: 18px;
}

.date-picker {
  margin-bottom: 5px;
  position: relative;
}

.date-input {
  border: 1px solid rgba(0, 113, 194, 0.2);
  border-radius: 6px;
  padding: 10px 12px;
  width: 100%;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.date-input:focus {
  border-color: #0071c2;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 113, 194, 0.15);
}

.date-input:hover {
  border-color: #0071c2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.7;
  filter: invert(0.5) sepia(1) saturate(5) hue-rotate(175deg);
  padding: 3px;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.date-input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
  background-color: rgba(0, 113, 194, 0.1);
}

.form-section {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  margin-bottom: 0;
}

.form-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
}

.form-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333;
  position: relative;
  padding-bottom: 8px;
}

.form-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #0071c2, rgba(0, 113, 194, 0.3));
  border-radius: 3px;
}

.form-subtitle {
  color: #6b6b6b;
  font-size: 14px;
  margin-bottom: 20px;
  background-color: rgba(0, 113, 194, 0.05);
  padding: 8px 10px;
  border-radius: 6px;
  width: fit-content;
}

.form-group {
  margin-bottom: 15px;
}

.form-group .required {
  color: #e41c00;
}

.field-hint {
  font-size: 12px;
  color: #6b6b6b;
  margin-top: 2px;
  margin-bottom: 0;
  font-style: italic;
}

.booking-form-container .form-group {
  margin-bottom: 20px;
}

.booking-form-container label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.booking-form-container input,
.booking-form-container select,
.booking-form-container textarea {
  border: 1px solid rgba(0, 113, 194, 0.2);
  border-radius: 6px;
  padding: 12px 15px;
  width: 100%;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.booking-form-container input:focus,
.booking-form-container select:focus,
.booking-form-container textarea:focus {
  border-color: #0071c2;
  box-shadow: 0 0 0 3px rgba(0, 113, 194, 0.15);
  outline: none;
}

.booking-form-container input:hover,
.booking-form-container select:hover,
.booking-form-container textarea:hover {
  border-color: #0071c2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.booking-form-container textarea {
  min-height: 80px;
  resize: vertical;
}

.booking-form-container .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.booking-form-container .action-buttons {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

@media (max-width: 767px) {
  .booking-process {
    padding: 25px 0 50px;
  }

  .process-container {
    width: 95%;
  }

  .step-icon {
    width: 30px;
    height: 30px;
    font-size: 13px;
  }

  .step-name {
    font-size: 12px;
    top: 42px;
  }
}

/* CSS cho phần hiển thị dịch vụ trong tóm tắt thanh toán */
.summary-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.summary-service-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 6px 0;
  border-bottom: 1px dotted rgba(0, 0, 0, 0.05);
}

.service-detail {
  flex: 1;
}

.summary-service-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.service-meta {
  font-size: 12px;
  color: #6c757d;
}

.summary-item.discount-item {
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.05);
  padding: 8px 10px;
  border-radius: 6px;
  margin: 8px 0;
}

.discount-value {
  font-weight: 600 !important;
  color: #28a745 !important;
}

/* Validation styles */
.is-invalid {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 80%;
  color: #dc3545;
}

.required {
  color: #dc3545;
}

.payment-qr-container {
  margin-bottom: 20px;
}

.payment-instruction {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 10px;
}

.qr-loading {
  text-align: center;
  color: #6c757d;
}

.payment-status-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

/* .payment-status-label {
  font-weight: 600;
  color: #333;
} */

.payment-status-value {
  font-weight: 500;
  color: #28a745;
}

.status-pending {
  color: #f6c23e;
}

.status-paid {
  color: #28a745;
}

.status-cancelled {
  color: #dc3545;
}

.auto-checking {
  font-size: 12px;
  color: #6c757d;
}

.check-status-btn {
  background: #48cae4;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.check-status-btn:hover {
  background: #0096c7;
}

.check-status-btn:disabled {
  background: #a2aed0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Styles cho modal thanh toán */
.payment-link-container {
  margin-top: 15px;
  width: 100%;
  text-align: center;
  padding: 10px 0;
}

.open-payment-btn {
  background: linear-gradient(135deg, #0071c2, #0095ff);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(0, 113, 194, 0.3);
}

.open-payment-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 113, 194, 0.4);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background-color: white;
  width: 100%;
  max-width: 1100px;
  height: 78vh;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #0071c2, #0095ff);
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.close-button:hover {
  transform: scale(1.1);
  color: #f8f9fa;
}

.modal-body {
  flex: 1;
  padding: 0;
  overflow: hidden;
  height: calc(100% - 120px); /* Adjust height to account for header and footer */
}

.payment-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.payment-qr {
  max-width: 300px;
  margin: 0 auto;
  display: block;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-footer .payment-status-value {
  font-size: 16px;
  font-weight: 600;
  padding: 8px 15px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.05);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.modal-footer .payment-status-value::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse 1.5s infinite;
}

.status-dangcho::before {
  background-color: #f6c23e;
}

.status-thanhcong::before {
  background-color: #28a745;
}

.status-thatbai::before {
  background-color: #dc3545;
}

.status-khongxacdinh::before {
  background-color: #6c757d;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
}

.auto-checking {
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
  margin-left: 5px;
}

.payment-confirm-modal {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  max-width: 450px;
  width: 90%;
  margin: 0 auto;
  overflow: hidden;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #0071c2, #0095ff);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
}

.close-button:hover {
  transform: rotate(90deg);
}

.payment-confirm-body {
  text-align: center;
  padding: 30px 20px;
  background-color: #f9f9f9;
}

.payment-confirm-message {
  font-size: 18px;
  color: #333;
  margin-bottom: 25px;
  font-weight: 500;
}

.payment-info {
  background-color: white;
  border-radius: 10px;
  padding: 15px 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.payment-info-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 16px;
}

.payment-info-label {
  font-weight: 600;
  color: #333;
}

.payment-info-value {
  font-weight: 500;
  color: #0071c2;
}

.payment-confirm-footer {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  gap: 15px;
}

.payment-confirm-footer .btn {
  flex: 1;
  font-size: 15px;
  padding: 12px 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-outline {
  background-color: white;
  border: 1px solid #0071c2;
  color: #0071c2;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.btn-outline:hover {
  background-color: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.1);
}

.btn-outline i {
  color: #0071c2;
}

.refresh-status-btn {
  background: #48cae4;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-left: 10px;
}

.refresh-status-btn:hover {
  background: #0096c7;
}

/* Thêm CSS cho modal tính tiền thối - Phiên bản cải tiến */
.cash-payment-modal {
  max-width: 680px;
  width: 95%;
  height: auto;
  min-height: unset;
  border-radius: 16px;
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.12),
    0 5px 15px rgba(0, 0, 0, 0.08);
  animation: modalFadeIn 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  overflow: hidden;
  border: 1px solid rgba(0, 113, 194, 0.1);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.cash-payment-body {
  padding: 28px;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
}

.cash-payment-body::before {
  content: '';
  position: absolute;
  top: -10px;
  right: -10px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(0, 113, 194, 0.06) 0%, rgba(0, 113, 194, 0) 70%);
  z-index: 0;
  border-radius: 50%;
}

.payment-details {
  background-color: #f9fafb;
  border-radius: 14px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  max-width: 92%;
  margin: 0 auto;
}

.payment-details:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
  position: relative;
}

.payment-row:last-child {
  border-bottom: none;
  margin-bottom: 5px;
  padding-bottom: 0;
}

.payment-label {
  font-weight: 600;
  color: #344054;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-label::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #0071c2;
}

.payment-row:nth-child(2) .payment-label::before {
  background-color: #ff6b6b;
}

.payment-row:nth-child(3) .payment-label::before {
  background-color: #37b24d;
}

.payment-value {
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.02em;
}

.total-amount {
  color: #0071c2;
  background: linear-gradient(90deg, #0071c2, #0096c7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  padding: 5px 12px;
}

.total-amount::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 113, 194, 0.08);
  border-radius: 20px;
  z-index: -1;
}

.change-amount {
  color: #2b8a3e;
  padding: 5px 15px;
  background-color: rgba(40, 167, 69, 0.08);
  border-radius: 20px;
  position: relative;
  transition: all 0.3s ease;
  font-size: 20px;
}

.change-amount::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid rgba(40, 167, 69, 0.12);
  border-radius: 20px;
  opacity: 0.7;
}

.change-amount.negative {
  color: #c92a2a;
  background-color: rgba(220, 53, 69, 0.08);
}

.change-amount.negative::after {
  border-color: rgba(220, 53, 69, 0.12);
}

.payment-input {
  position: relative;
  display: flex;
  align-items: center;
}

.cash-input {
  width: 280px;
  padding: 14px 35px 14px 16px;
  border: 2px solid #0071c2;
  border-radius: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #344054;
  text-align: right;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
}

.cash-input::placeholder {
  padding-left: 10px;
  text-align: left;
  font-size: 18px;
  font-weight: 450;
  /* color: #0071c2; */
  opacity: 0.55;
}

.cash-input:focus {
  border-color: #0095ff;
  outline: none;
  box-shadow:
    0 0 0 4px rgba(0, 113, 194, 0.15),
    0 2px 10px rgba(0, 0, 0, 0.07);
  transform: translateY(-1px);
}

.cash-input:hover {
  border-color: #0095ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.currency {
  position: absolute;
  right: 14px;
  font-weight: 600;
  color: #0071c2;
  font-size: 16px;
}

.quick-amounts {
  margin-top: 25px;
  background-color: #f0f9ff;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid rgba(0, 113, 194, 0.15);
  position: relative;
  overflow: hidden;
}

.quick-amounts::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(0, 113, 194, 0.1) 0%, rgba(0, 113, 194, 0) 70%);
  z-index: 0;
}

.quick-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 600;
  color: #0071c2;
  position: relative;
  padding-left: 20px;
  display: flex;
  align-items: center;
}

.quick-title::before {
  content: '\f0d6';
  font-family: 'Font Awesome 5 Free';
  position: absolute;
  left: 0;
  color: #0071c2;
  opacity: 0.8;
  font-size: 14px;
}

.quick-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 12px;
}

.quick-button {
  background-color: white;
  border: 1px solid rgba(0, 113, 194, 0.3);
  border-radius: 10px;
  padding: 10px 8px;
  font-size: 15px;
  font-weight: 600;
  color: #0071c2;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.quick-button::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 80%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
  pointer-events: none;
}

.quick-button:hover {
  background-color: #e7f5ff;
  border-color: #0071c2;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.quick-button:hover::after {
  opacity: 0.5;
}

.quick-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
}

.cash-payment-header {
  background: linear-gradient(135deg, #0071c2, #00a8e8);
  padding: 18px 24px;
  border-bottom: none;
}

.cash-payment-header h3 {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.cash-payment-header h3::before {
  content: '\f3d1';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  font-size: 16px;
}

.cash-payment-footer {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  background-color: #f9fafb;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.cash-payment-footer .btn {
  flex: 1;
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 10px;
  transition: all 0.3s ease;
}

.cash-payment-footer .btn-primary {
  background: linear-gradient(135deg, #0071c2, #00a8e8);
  box-shadow: 0 4px 10px rgba(0, 113, 194, 0.25);
}

.cash-payment-footer .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 113, 194, 0.35);
}

.cash-payment-footer .btn-primary:disabled {
  background: linear-gradient(135deg, #a2aed0, #b8c7e0);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cash-payment-footer .btn-secondary {
  background-color: white;
  color: #344054;
  border: 1px solid #d0d5dd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.cash-payment-footer .btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #98a2b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

.cash-payment-footer .btn i {
  margin-right: 6px;
  font-size: 14px;
}

/* Responsive adjustments */
@media (max-width: 520px) {
  .cash-payment-modal {
    width: 95%;
    margin: 10px;
    border-radius: 12px;
  }

  .cash-payment-body {
    padding: 20px;
  }

  .payment-details {
    padding: 18px;
  }

  .payment-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .payment-value,
  .payment-input {
    margin-top: 5px;
    width: 100%;
  }

  .cash-input {
    width: 100%;
  }

  .payment-label::before {
    width: 5px;
    height: 5px;
  }

  .quick-buttons {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
