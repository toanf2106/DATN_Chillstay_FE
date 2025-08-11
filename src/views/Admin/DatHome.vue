<template>
  <div class="dathome-container">
    <h1 class="section-title">Quản lý đặt Homestay</h1>
    <div class="stats-cards">
      <div class="stat-card">
        <div class="card-front">
          <h2>Tổng Đặt Phòng</h2>
          <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-value">{{ totalBookings }}</div>
        </div>
        <div class="card-details">
          <p>Tổng số lượt đặt homestay</p>
          <div class="progress-bar">
            <div class="progress" :style="{ width: '100%', backgroundColor: '#4e73df' }"></div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-front">
          <h2>Chờ Xác Nhận</h2>
          <div class="stat-icon"><i class="fas fa-clock"></i></div>
          <div class="stat-value">{{ pendingBookings }}</div>
        </div>
        <div class="card-details">
          <p>Đang chờ xác nhận</p>
          <div class="progress-bar">
            <div class="progress" :style="{ width: pendingPercent + '%', backgroundColor: '#f6c23e' }"></div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-front">
          <h2>Đã Xác Nhận</h2>
          <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
          <div class="stat-value">{{ confirmedBookings }}</div>
        </div>
        <div class="card-details">
          <p>Đã xác nhận đặt phòng</p>
          <div class="progress-bar">
            <div class="progress" :style="{ width: confirmedPercent + '%', backgroundColor: '#1cc88a' }"></div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-front">
          <h2>Chờ Nhận</h2>
          <div class="stat-icon"><i class="fas fa-door-open"></i></div>
          <div class="stat-value">{{ waitingCheckinBookings }}</div>
        </div>
        <div class="card-details">
          <p>Chờ khách check-in</p>
          <div class="progress-bar">
            <div class="progress" :style="{ width: waitingCheckinPercent + '%', backgroundColor: '#4e73df' }"></div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-front">
          <h2>Chờ Trả</h2>
          <div class="stat-icon"><i class="fas fa-door-closed"></i></div>
          <div class="stat-value">{{ waitingCheckoutBookings }}</div>
        </div>
        <div class="card-details">
          <p>Chờ khách check-out</p>
          <div class="progress-bar">
            <div class="progress" :style="{ width: waitingCheckoutPercent + '%', backgroundColor: '#e74a3b' }"></div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-front">
          <h2>Hoàn Thành</h2>
          <div class="stat-icon"><i class="fas fa-flag-checkered"></i></div>
          <div class="stat-value">{{ completedBookings }}</div>
        </div>
        <div class="card-details">
          <p>Hoàn tất dịch vụ</p>
          <div class="progress-bar">
            <div class="progress" :style="{ width: completedPercent + '%', backgroundColor: '#858796' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="view-toggle-container">
      <button class="view-toggle-btn" :class="{ active: currentView === 'calendar' }" @click="switchToCalendarView">
        <font-awesome-icon icon="fa-solid fa-calendar-alt" class="btn-icon" />
        Xem lịch
      </button>
      <button class="view-toggle-btn" :class="{ active: currentView === 'detail' }" @click="switchToDetailView">
        <font-awesome-icon icon="fa-solid fa-list" class="btn-icon" />
        Xem chi tiết
      </button>
      <button class="view-toggle-btn" @click="navigateToDatHomeADM">
        <font-awesome-icon icon="fa-solid fa-tasks" class="btn-icon" />
        Đặt Homestay
      </button>
    </div>

    <div class="content-section">
      <div v-show="currentView === 'calendar'" class="calendar-container">
        <div id="calendar" ref="fullCalendar"></div>
      </div>

      <div v-show="currentView === 'detail'" class="bookings-detail-view">
        <div class="section-header">
          <h2>Lịch Sử Thay Đổi Trạng Thái</h2>
          <div class="search-box">
            <input type="text" v-model="historySearchQuery" placeholder="Tìm theo mã đặt home..."
              class="search-input" />
            <i class="fas fa-search search-icon"></i>
          </div>
        </div>
        <div class="table-container">
          <table class="bookings-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã đặt phòng</th>
                <th>Khách hàng</th>
                <th>Homestay</th>
                <th>Ngày tạo</th>
                <th>Thời gian nhận phòng</th>
                <th>Thời gian trả phòng</th>
                <th>Trạng thái</th>
                <th>Lịch sử thay đổi</th>
              </tr>
            </thead>
            <tbody v-if="isLoading">
              <tr>
                <td colspan="9" class="text-center">
                  <div class="loading">Đang tải dữ liệu...</div>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="(booking, index) in filteredHistoryBookings" :key="booking.id">
                <td>{{ startItem + index }}</td>
                <td class="text-left">{{ booking.maDatHome }}</td>
                <td>{{ booking.tenKhachHang }}</td>
                <td>{{ booking.tenHomestay }}</td>
                <td>{{ formatDate(booking.ngayDat, 'dateOnly') }}</td>
                <td>{{ formatDate(booking.ngayNhanPhong, 'dateOnly') }}</td>
                <td>{{ formatDate(booking.ngayTraPhong, 'dateOnly') }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(booking.trangThai)">
                    {{ getStatusLabel(booking.trangThai) }}
                  </span>
                </td>
                <td>
                  <button class="action-btn history-btn" @click="showBookingLogs(booking.id)">
                    <font-awesome-icon icon="fa-solid fa-history" />
                    <span>Xem lịch sử</span>
                  </button>
                </td>
              </tr>
              <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
                <td colspan="9"><span class="sr-only">Empty row</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="pagination-container" v-if="currentView === 'detail'">
        <div class="pagination-info">
          Hiển thị {{ historySearchQuery ? filteredHistoryBookings.length : startItem }} đến
          {{ historySearchQuery ? Math.min(filteredHistoryBookings.length, endItem) : endItem }}
          trong số {{ historySearchQuery ? filteredHistoryCount : totalItems }} đặt phòng
          <span class="pagination-note">(5 đặt phòng mỗi trang)</span>
        </div>
        <nav aria-label="Page navigation">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 0 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                <i class="fas fa-chevron-left"></i>
              </a>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page - 1 === currentPage }">
              <a class="page-link" href="#" @click.prevent="changePage(page - 1)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 || totalPages === 0 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                <i class="fas fa-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="booking-cards-section" v-show="currentView === 'detail'">
      <h2 class="section-title">Lịch Sử Đặt Homestay</h2>

      <div class="filter-container">
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="Tìm theo mã đặt home hoặc số điện thoại..."
            class="search-input" />
          <i class="fas fa-search search-icon"></i>
        </div>
        <div class="filter-box">
          <select v-model="statusFilter" class="status-filter">
            <option value="">Tất cả trạng thái</option>
            <option value="ChoXacNhan">Chờ xác nhận</option>
            <option value="DaXacNhan">Đã xác nhận</option>
            <option value="DaCheckIn">Chờ trả phòng</option>
            <option value="DaCheckOut">Đã trả phòng</option>
            <option value="HoanThanh">Hoàn thành</option>
            <option value="DaHuy">Đã hủy</option>
          </select>
        </div>
      </div>

      <div v-if="isLoading" class="loading">Đang tải dữ liệu...</div>
      <div v-else class="booking-cards">
        <div v-for="booking in filteredBookings" :key="booking.id" class="booking-card"
          @click="viewBookingDetails(booking)">
          <div class="card-header">
            <div class="card-booking-code">{{ booking.maDatHome }}</div>
            <div class="card-status">
              <span class="status-badge-card" :class="getStatusClass(booking.trangThai)">
                {{ getStatusLabel(booking.trangThai) }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <div class="card-customer">
              <i class="fas fa-user"></i>
              <span>{{ booking.tenKhachHang }}</span>
            </div>
            <div class="card-homestay">
              <i class="fas fa-home"></i>
              <span>{{ booking.tenHomestay }}</span>
            </div>
            <div class="card-dates">
              <div class="date-range">
                <div class="date-item">
                  <i class="fas fa-calendar-check"></i>
                  <span>{{ formatDate(booking.ngayNhanPhong, 'dayOnly') }}</span>
                </div>
                <div class="date-arrow">
                  <i class="fas fa-arrow-right"></i>
                </div>
                <div class="date-item">
                  <i class="fas fa-calendar-times"></i>
                  <span>{{ formatDate(booking.ngayTraPhong, 'dayOnly') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card-load-more" v-if="bookings.length > visibleBookingsCount && !isLoading">
        <button class="load-more-btn" @click="loadMoreBookings">
          <i class="fas fa-plus-circle"></i>
          Xem thêm đặt phòng
        </button>
        <div class="showing-count">
          Hiện thị {{ Math.min(visibleBookingsCount, bookings.length) }} trong số
          {{ bookings.length }} đặt phòng
        </div>
      </div>
    </div>

    <div class="booking-modal" v-if="showModal">
      <div class="modal-content" style="display: flex; flex-direction: column">
        <div class="modal-header">
          <div class="header-left">
            <h2 class="modal-title">Chi tiết đặt phòng</h2>
            <div class="booking-id">
              Mã đặt phòng:
              <strong>{{ selectedBooking?.maDatHome }}</strong>
            </div>
          </div>
          <div class="header-right">
            <div v-if="selectedBooking" class="modal-status">
              <span :class="getStatusClass(selectedBooking.trangThai)">
                {{ getStatusLabel(selectedBooking.trangThai) }}
              </span>
            </div>
            <button class="close-btn" @click="showModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div v-if="selectedBooking" class="booking-details" style="flex: 1; overflow-y: auto; padding-bottom: 20px">
          <div class="modal-columns" style="min-height: 400px">
            <div class="modal-column" style="flex: 7; display: flex; flex-direction: column">
              <div style="display: flex; gap: 15px; height: 100%; flex: 1">
                <div class="booking-section customer-section"
                  style="flex: 1; height: 100%; display: flex; flex-direction: column">
                  <div class="section-content" style="flex: 1">
                    <h3>Thông tin khách hàng</h3>
                    <div class="info-item">
                      <span class="info-label">Tên khách hàng:</span>
                      <span class="info-value">{{ selectedBooking.tenKhachHang }}</span>
                    </div>

                    <div class="info-item">
                      <span class="info-label">Số điện thoại:</span>
                      <span class="info-value">{{ selectedBooking.soDienThoai }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Email:</span>
                      <span class="info-value">{{ selectedBooking.email }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Yêu cầu đặc biệt:</span>
                      <span class="info-value">{{
                        selectedBooking.yeuCauDacBiet || 'Không có'
                        }}</span>
                    </div>
                  </div>
                </div>

                <div class="booking-section booking-info-section"
                  style="flex: 1; height: 100%; display: flex; flex-direction: column">
                  <div class="section-content" style="flex: 1">
                    <h3>Thông tin Homestay</h3>
                    <div class="info-item">
                      <span class="info-label">Homestay:</span>
                      <span class="info-value">{{ selectedBooking.tenHomestay }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Địa chỉ:</span>
                      <span class="info-value">{{ selectedBooking.diaChi }}</span>
                    </div>
                    <div class="date-box">
                      <div class="info-item date-item">
                        <span class="info-label">Ngày đặt:</span>
                        <span class="info-value date-value">{{
                          formatDate(selectedBooking.ngayDat, 'dateOnly')
                          }}</span>
                      </div>

                      <div class="info-item" v-if="
                        selectedBooking.trangThai === 'DaXacNhan' &&
                        selectedBooking.daGiaHanCheckIn
                      ">
                        <span class="info-label">Thời hạn check-in:</span>
                        <span class="info-value">
                          {{ formatDateTime(selectedBooking.thoiGianGiaHanCheckIn) }}
                          <span class="extension-info" v-if="selectedBooking.soLanGiaHan">
                            (đã gia hạn {{ selectedBooking.soLanGiaHan }}/3 lần)
                          </span>
                        </span>
                      </div>
                      <div class="date-range-box">
                        <div class="date-range-item">
                          <span class="range-label">Check-in (13:00 - 14:00)</span>
                          <span class="range-value">{{
                            formatDate(selectedBooking.ngayNhanPhong, 'dateOnly')
                            }}</span>
                        </div>
                        <div class="date-arrow">→</div>
                        <div class="date-range-item">
                          <span class="range-label">Check-out (9:30 - 11:00)</span>
                          <span class="range-value">{{
                            formatDate(selectedBooking.ngayTraPhong, 'dateOnly')
                            }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Thêm phần hiển thị dịch vụ và phụ phí -->
              <div class="booking-section service-section" style="margin-top: 15px">
                <div class="section-content">
                  <div class="service-header">
                    <div class="service-tabs">
                      <div class="service-tab" :class="{ active: activeTab === 'dichvu' }"
                        @click="activeTab = 'dichvu'">
                        <i class="fas fa-concierge-bell"></i> Dịch vụ
                      </div>
                      <div v-if="selectedBooking && selectedBooking.trangThai === 'DaCheckIn'" class="service-tab"
                        :class="{ active: activeTab === 'phuphi' }" @click="activeTab = 'phuphi'">
                        <i class="fas fa-money-bill-wave"></i> Phụ phí
                      </div>
                    </div>
                    <div class="service-action-buttons">
                      <button v-if="activeTab === 'dichvu'" class="btn-add-service" @click="addService">
                        <i class="fas fa-plus"></i> Thêm dịch vụ
                      </button>
                      <button v-if="
                        activeTab === 'phuphi' &&
                        selectedBooking &&
                        selectedBooking.trangThai === 'DaCheckIn'
                      " class="btn-add-surcharge" @click="addSurcharge">
                        <i class="fas fa-plus"></i> Thêm phụ phí
                      </button>
                    </div>
                  </div>

                  <!-- Tab dịch vụ -->
                  <div v-if="activeTab === 'dichvu'" class="service-content">
                    <!-- Loading state -->
                    <div class="service-loading" v-if="isLoadingDichVu">
                      <i class="fas fa-spinner fa-spin"></i>
                      <p>Đang tải dịch vụ...</p>
                    </div>

                    <!-- Empty state -->
                    <div class="service-empty"
                      v-else-if="!selectedBooking.dichVus || selectedBooking.dichVus.length === 0">
                      <i class="fas fa-concierge-bell"></i>
                      <p>Chưa có dịch vụ nào được sử dụng</p>
                    </div>

                    <!-- Service list -->
                    <div class="service-list" v-else>
                      <div class="service-item" v-for="(service, index) in selectedBooking.dichVus" :key="index">
                        <div class="service-details">
                          <span class="service-name">{{ service.tenDichVu }}</span>
                          <div class="service-info">
                            <span class="service-price">{{
                              formatCurrency(service.giaDichVu)
                              }}</span>
                          </div>
                        </div>
                        <div class="service-actions">
                          <div class="quantity-controls">
                            <button class="quantity-btn" @click="decrementServiceQuantity(service)">
                              <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-value">{{ service.soLuong }}</span>
                            <button class="quantity-btn" @click="incrementServiceQuantity(service)">
                              <i class="fas fa-plus"></i>
                            </button>
                          </div>
                          <button class="delete-btn" @click="removeService(service, index)">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                      <div class="service-total-row">
                        <span class="service-total-label">Tổng tiền dịch vụ:</span>
                        <span class="service-total-value">{{
                          formatCurrency(calculateServiceTotal())
                          }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Tab phụ phí - chỉ hiển thị khi đang ở trạng thái check-in -->
                  <div v-if="
                    activeTab === 'phuphi' &&
                    selectedBooking &&
                    selectedBooking.trangThai === 'DaCheckIn'
                  " class="service-content">
                    <!-- Empty state -->
                    <div class="service-empty" v-if="!selectedBooking.phuPhis || selectedBooking.phuPhis.length === 0">
                      <i class="fas fa-money-bill-wave"></i>
                      <p>Chưa có phụ phí nào được thêm</p>
                    </div>

                    <!-- Surcharge list -->
                    <div class="service-list" v-else>
                      <div class="service-item" v-for="(phuPhi, index) in selectedBooking.phuPhis" :key="index">
                        <div class="service-details">
                          <span class="service-name">{{ phuPhi.tenPhuPhi }}</span>
                          <div class="service-info">
                            <span class="service-price">{{
                              formatCurrency(phuPhi.giaPhuPhi)
                              }}</span>
                          </div>
                        </div>
                        <div class="service-actions">
                          <button class="delete-btn" @click="removePhuPhi(phuPhi, index)">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                      <div class="service-total-row">
                        <span class="service-total-label">Tổng tiền phụ phí:</span>
                        <span class="service-total-value">{{
                          formatCurrency(calculatePhuPhiTotal())
                          }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- <div class="booking-section status-section" v-if="showStatusActions">
                <div class="section-content">
                  <h3>Cập nhật trạng thái</h3>
                  <div
                    class="form-group"
                    v-if="
                      selectedBooking.trangThai === 'ChoXacNhan' ||
                      selectedBooking.trangThai === 'DaCoc' ||
                      selectedBooking.trangThai === 'DaCheckOut'
                    "
                  >
                    <textarea
                      id="statusNote"
                      class="form-control"
                      v-model="statusNote"
                      placeholder="Nhập ghi chú cho việc thay đổi trạng thái"
                      rows="3"
                    ></textarea>
                  </div>

                  <div class="form-group" v-if="selectedBooking.trangThai === 'DaXacNhan'">
                    <label for="checkInNote">Ghi chú Check-in:</label>
                    <textarea
                      id="checkInNote"
                      class="form-control"
                      v-model="checkInNote"
                      placeholder="Nhập ghi chú cho việc check-in"
                      rows="3"
                    ></textarea>
                  </div>

                  <div class="form-group" v-if="selectedBooking.trangThai === 'DaCheckIn'">
                    <label for="checkOutNote">Ghi chú Check-out:</label>
                    <textarea
                      id="checkOutNote"
                      class="form-control"
                      v-model="checkOutNote"
                      placeholder="Nhập ghi chú cho việc check-out"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div> -->
            </div>
            <div class="modal-column" style="flex: 5; display: flex; flex-direction: column">
              <div class="booking-section payment-section" style="height: 100%; display: flex; flex-direction: column">
                <div class="section-content" style="flex: 1">
                  <h3>Thông tin thanh toán</h3>
                  <div class="payment-summary">
                    <div class="payment-item">
                      <span class="payment-label">Giá Homestay:</span>
                      <span class="payment-value">{{
                        formatCurrency(selectedBooking.tongTien)
                        }}</span>
                    </div>
                    <div class="payment-item" v-if="selectedBooking.tenGiamGia">
                      <span class="payment-label">
                        Giảm giá ({{ selectedBooking.tenGiamGia }}):
                      </span>
                      <span class="payment-value discount">- {{ formatCurrency(calculateActualDiscount()) }}</span>
                    </div>
                    <div class="payment-item">
                      <span class="payment-label">Tổng tiền dịch vụ:</span>
                      <span class="payment-value">{{
                        formatCurrency(selectedBooking.tongTienDichVu)
                        }}</span>
                    </div>
                    <div class="payment-item">
                      <span class="payment-label">Tổng tiền phụ phí (nếu có):</span>
                      <span class="payment-value">{{
                        formatCurrency(calculatePhuPhiTotal())
                        }}</span>
                    </div>

                    <div class="payment-divider"></div>
                    <div class="payment-item total">
                      <span class="payment-label">Tổng tiền:</span>
                      <span class="payment-value total-value">{{
                        formatCurrency(calculateTotalAmount())
                        }}</span>
                    </div>

                    <!-- Thêm hiển thị số tiền đã thanh toán -->
                    <div class="payment-item">
                      <span class="payment-label">Đã thanh toán:</span>
                      <span class="payment-value paid">{{
                        formatCurrency(soTienDaThanhToan)
                        }}</span>
                    </div>
                    <div class="payment-item" v-if="calculateRemainingAmount() > 0">
                      <span class="payment-label">Còn lại phải thanh toán:</span>
                      <span class="payment-value remaining">{{
                        formatCurrency(calculateRemainingAmount())
                        }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="
            border-top: 1px solid #eee;
            padding: 16px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            background-color: #f8f9fa;
            border-radius: 0 0 18px 18px;
          ">
          <button v-if="selectedBooking && selectedBooking.trangThai === 'ChoXacNhan'" class="action-button cancel-btn"
            @click="updateBookingStatus(selectedBooking.id, 'DaHuy')">
            Hủy đặt phòng
          </button>
          <button v-if="selectedBooking && selectedBooking.trangThai === 'ChoXacNhan'" class="action-button confirm-btn"
            @click="updateBookingStatus(selectedBooking.id, 'DaXacNhan')">
            Xác nhận đặt phòng
          </button>
          <button v-if="selectedBooking && selectedBooking.trangThai === 'DaXacNhan'" class="action-button confirm-btn"
            @click="handleCheckIn(selectedBooking.id)">
            Check-in
          </button>
          <button v-if="selectedBooking && selectedBooking.trangThai === 'DaCheckIn'" class="action-button confirm-btn"
            @click="handleCheckOut(selectedBooking.id)"
            :disabled="calculateRemainingAmount() > 0 && paymentStatus !== 'ThanhCong'" :class="{
              'disabled-btn': calculateRemainingAmount() > 0 && paymentStatus !== 'ThanhCong',
            }">
            Check-out
            <span v-if="calculateRemainingAmount() > 0 && paymentStatus !== 'ThanhCong'" class="payment-required-text">
              (Cần thanh toán số tiền còn lại)
            </span>
          </button>
          <!-- Sửa nút thanh toán ngay để hiển thị số tiền còn lại -->
          <button v-if="
            selectedBooking &&
            calculateRemainingAmount() > 0 &&
            paymentStatus !== 'ThanhCong' &&
            selectedBooking.trangThai === 'DaCheckIn'
          " class="action-button payment-btn" @click="createPaymentForRemaining" :disabled="isLoadingPayment">
            {{ isLoadingPayment ? 'Đang xử lý...' : 'Thanh toán ngay' }} ({{
              formatCurrency(calculateRemainingAmount())
            }})
          </button>
          <button v-if="selectedBooking && selectedBooking.trangThai === 'DaCheckOut'" class="action-button confirm-btn"
            @click="updateBookingStatus(selectedBooking.id, 'HoanThanh')">
            Hoàn thành
          </button>
          <!-- Thêm nút gia hạn check-in ngay sau nút check-in -->
          <button v-if="selectedBooking && selectedBooking.trangThai === 'DaXacNhan'" class="action-button extend-btn"
            @click="handleExtendCheckIn(selectedBooking.id)">
            Gia hạn Check-in
          </button>

          <div class="extension-container" v-if="selectedBooking && selectedBooking.trangThai === 'DaXacNhan'">
            <!-- Hiển thị thông tin gia hạn -->
            <div class="extension-info-container" v-if="extensionInfo && extensionInfo.success">
              <div class="extension-info-item">
                <span class="extension-label">Thời hạn mới:</span>
                <span class="extension-value">{{
                  extensionInfo.hanCheckIn ? formatDateTime(extensionInfo.hanCheckIn) : 'N/A'
                  }}</span>
              </div>
              <div class="extension-info-item">
                <span class="extension-label">Đã gia hạn:</span>
                <span class="extension-value">{{ extensionInfo.soLanGiaHan }}/3 lần</span>
              </div>
              <div class="extension-info-item">
                <span class="extension-label">Còn lại:</span>
                <span class="extension-value">{{ extensionInfo.soLanGiaHanConLai }} lần</span>
              </div>
              <div class="extension-info-item" v-if="extensionInfo.timeString">
                <span class="extension-label">Tổng thời gian gia hạn:</span>
                <span class="extension-value">{{ extensionInfo.timeString }}</span>
              </div>
            </div>

            <!-- Hiển thị thông báo lỗi -->
            <div class="extension-error" v-if="extensionInfo && !extensionInfo.success">
              {{ extensionInfo.error }}
            </div>
          </div>

          <!-- Thêm cảnh báo về việc không hoàn tiền cọc -->
          <div v-if="selectedBooking && selectedBooking.trangThai === 'DaXacNhan'" class="auto-cancel-warning">
            <i class="fas fa-exclamation-triangle"></i>
            Lưu ý: Nếu không check-in đúng thời hạn, đơn sẽ tự động bị hủy và không hoàn tiền cọc.
          </div>
        </div>
      </div>
    </div>

    <div class="booking-modal" v-if="showLogModal">
      <div class="modal-content logs-modal-content">
        <div class="modal-header">
          <div class="header-left">
            <h2 class="modal-title">Lịch sử thay đổi trạng thái</h2>
            <div class="booking-id" v-if="currentBookingInfo">
              <span class="info-label">Mã đặt phòng:</span>
              <strong>{{ currentBookingInfo.maDatHome }}</strong> |
              <span class="info-label">Khách hàng:</span>
              <strong>{{ currentBookingInfo.tenKhachHang }}</strong> |
              <span class="info-label">Homestay:</span>
              <strong>{{ currentBookingInfo.tenHomestay }}</strong>
            </div>
          </div>
          <div class="header-right">
            <button class="close-btn" @click="showLogModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="booking-details">
          <div class="log-table-container">
            <div v-if="loadingLogs" class="loading">Đang tải dữ liệu...</div>

            <table class="log-table" v-else-if="currentBookingLogs && currentBookingLogs.length > 0">
              <thead>
                <tr>
                  <th width="5%">STT</th>
                  <th width="15%">Thời gian thay đổi</th>
                  <th width="35%">Thay đổi trạng thái</th>
                  <th width="15%">Người thực hiện</th>
                  <th width="10%">Mã NV</th>
                  <th width="20%">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(log, index) in sortedLogs" :key="log.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ formatDate(log.thoiGianThayDoi, 'dateOnly') }}</td>
                  <td>
                    <div class="status-change">
                      <span v-if="log.trangThaiCu" class="status-badge" :class="getStatusClass(log.trangThaiCu)">
                        {{ getStatusLabel(log.trangThaiCu) }}
                      </span>
                      <span v-else class="status-badge status-new">Mới tạo</span>
                      <i class="fas fa-arrow-right status-arrow"></i>
                      <span class="status-badge" :class="getStatusClass(log.trangThaiMoi)">
                        {{ getStatusLabel(log.trangThaiMoi) }}
                      </span>
                    </div>
                  </td>
                  <td>{{ log.hoTenThucHien || 'N/A' }}</td>
                  <td>{{ log.maNhanVienThucHien || 'N/A' }}</td>
                  <td>{{ log.ghiChu || 'Không có ghi chú' }}</td>
                </tr>
              </tbody>
            </table>

            <div v-else class="no-logs">
              <i class="fas fa-history"></i>
              <p>Chưa có lịch sử thay đổi nào</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div class="modal-overlay" v-if="showPaymentModal">
        <div class="modal-container payment-iframe-container">
          <div class="modal-body payment-iframe-body">
            <div v-if="!paymentUrl" class="payment-loading">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Đang tải trang thanh toán...</span>
            </div>
            <iframe v-else :src="paymentUrl" class="payment-iframe" allow="payment"
              sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
              @load="handleIframeLoad" ref="paymentIframe"></iframe>
            <div class="payment-countdown">
              <span class="countdown-label">Thời gian còn lại:</span>
              <span class="countdown-timer" :class="{ 'time-low': remainingTimeSeconds < 60 }">
                {{ formatRemainingTime() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div class="modal-overlay" v-if="showPaymentMethodModal" @click.self="cancelPaymentMethod">
        <div class="modal-container payment-method-modal">
          <div class="modal-header">
            <h3>Chọn phương thức thanh toán</h3>
            <button class="close-btn" @click="cancelPaymentMethod">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body payment-method-body">
            <div class="payment-amount">
              <p>Số tiền cần thanh toán:</p>
              <div class="amount-value">{{ formatCurrency(calculateRemainingAmount()) }}</div>
            </div>

            <div class="payment-methods">
              <button class="payment-method-btn qr-payment" @click="processQRPayment">
                <div class="method-icon">
                  <i class="fas fa-qrcode"></i>
                </div>
                <div class="method-info">
                  <h4>Thanh toán QR</h4>
                  <p>Quét mã QR để thanh toán</p>
                </div>
              </button>

              <button class="payment-method-btn cash-payment" @click="processCashPayment">
                <div class="method-icon">
                  <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="method-info">
                  <h4>Thanh toán tiền mặt</h4>
                  <p>Khách hàng thanh toán bằng tiền mặt</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Modal thanh toán tiền mặt -->
    <teleport to="body">
      <div class="modal-overlay" v-if="showCashPaymentModal" @click.self="closeCashPaymentModal">
        <div class="modal-container cash-payment-modal">
          <div class="modal-header">
            <h3>Thanh toán tiền mặt</h3>
            <button class="close-btn" @click="closeCashPaymentModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body cash-payment-body">
            <div class="payment-details">
              <div class="payment-row">
                <span class="payment-label">Tổng tiền thanh toán:</span>
                <span class="payment-value total-amount">{{ formatCurrency(soTienConLai) }}</span>
              </div>
              <div class="payment-row">
                <span class="payment-label">Tiền khách đưa:</span>
                <div class="payment-input">
                  <input type="number" v-model.number="cashReceived" @input="calculateChange"
                    placeholder="Nhập số tiền khách đưa" min="0" step="10000" class="cash-input" />
                  <span class="currency">₫</span>
                </div>
              </div>
              <div class="payment-row">
                <span class="payment-label">Tiền thối lại:</span>
                <span class="payment-value change-amount" :class="{ negative: changeAmount < 0 }">
                  {{ changeAmount.toLocaleString('vi-VN') }}₫
                </span>
              </div>
              <div class="quick-amounts">
                <p class="quick-title">Chọn nhanh số tiền:</p>
                <div class="quick-buttons">
                  <button v-for="(amount, index) in quickAmounts" :key="index" @click="setQuickAmount(amount)"
                    class="quick-button">
                    {{ formatCurrency(amount) }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer cash-payment-footer">
            <button class="btn btn-secondary" @click="closeCashPaymentModal">
              <i class="fas fa-times"></i> Hủy
            </button>
            <button class="btn btn-primary" @click="confirmCashPayment"
              :disabled="cashReceived === null || cashReceived < soTienConLai">
              <i class="fas fa-check-circle"></i> Xác nhận thanh toán
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Modal thêm dịch vụ -->
    <teleport to="body">
      <div class="modal-overlay" v-if="showAddServiceModal" @click.self="closeAddServiceModal">
        <div class="modal-container add-service-modal">
          <div class="modal-header">
            <div class="header-content">
              <h3>
                <i class="fas fa-concierge-bell"></i>
                Thêm dịch vụ cho đặt Home
              </h3>
            </div>
            <button class="close-btn" @click="closeAddServiceModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body add-service-body">
            <!-- Search section -->
            <div class="search-section">
              <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Tìm kiếm dịch vụ..." class="search-input" />
              </div>
            </div>

            <!-- Services list -->
            <div class="services-container">
              <div class="services-header">
                <h4>Danh sách dịch vụ có sẵn</h4>
                <span class="services-count">Tìm thấy {{ availableServices.length }} dịch vụ</span>
              </div>

              <div class="services-grid" v-if="availableServices.length > 0">
                <!-- Service items dưới dạng checkbox -->
                <div class="service-checkbox-item" v-for="service in availableServices" :key="service.id">
                  <div class="service-checkbox-content">
                    <div class="checkbox-wrapper">
                      <input type="checkbox" :id="`service-${service.id}`" v-model="service.selected"
                        @change="onServiceSelectionChange(service)" class="service-checkbox" />
                      <label :for="`service-${service.id}`" class="checkbox-label">
                        <div class="service-main-info">
                          <div class="service-name-price">
                            <h5 class="service-name">{{ service.name }}</h5>
                            <div class="service-price">
                              <span class="price">{{ formatCurrency(service.price) }}</span>
                              <span class="unit">/ {{ service.unit }}</span>
                            </div>
                          </div>
                          <div class="service-quantity-controls" v-if="service.selected">
                            <div class="quantity-controls">
                              <button type="button" class="qty-btn minus" @click="decrementQuantity(service)"
                                :disabled="service.quantity <= 1">
                                <i class="fas fa-minus"></i>
                              </button>
                              <input type="number" class="qty-input" v-model.number="service.quantity"
                                @input="onQuantityChange(service)" min="1" max="99" />
                              <button type="button" class="qty-btn plus" @click="incrementQuantity(service)"
                                :disabled="service.quantity >= 99">
                                <i class="fas fa-plus"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Loading state -->
              <div class="loading-state" v-if="isLoadingServices">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải danh sách dịch vụ...</p>
              </div>

              <!-- Empty state -->
              <div class="empty-state" v-if="!isLoadingServices && availableServices.length === 0">
                <i class="fas fa-concierge-bell"></i>
                <h4>Không có dịch vụ nào</h4>
                <p>Hiện tại chưa có dịch vụ nào có sẵn để thêm</p>
              </div>
            </div>
          </div>

          <div class="modal-footer add-service-footer">
            <div class="selected-summary">
              <span class="selected-count">Đã chọn: <strong>{{ selectedServiceIds.length }}</strong> dịch vụ</span>
              <span class="total-amount">Tổng tiền: <strong>{{ formatCurrency(calculateSelectedTotal())
                  }}</strong></span>
            </div>
            <div class="footer-actions">
              <button class="btn btn-secondary" @click="closeAddServiceModal">
                <i class="fas fa-times"></i> Hủy
              </button>
              <button class="btn btn-primary" :disabled="selectedServiceIds.length === 0" @click="addSelectedServices">
                <i class="fas fa-plus-circle"></i> Thêm dịch vụ ({{ selectedServiceIds.length }})
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Modal thêm phụ phí -->
    <teleport to="body">
      <div class="modal-overlay" v-if="showAddSurchargeModal" @click.self="closeAddSurchargeModal">
        <div class="modal-container add-surcharge-modal">
          <div class="modal-header">
            <div class="header-content">
              <h3>
                <i class="fas fa-money-bill-wave"></i>
                Thêm phụ phí cho đặt Home
              </h3>
            </div>
            <button class="close-btn" @click="closeAddSurchargeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body add-surcharge-body">
            <!-- Search section -->
            <div class="search-section">
              <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Tìm kiếm phụ phí..." class="search-input" />
              </div>
            </div>

            <!-- Services list -->
            <div class="surcharges-container">
              <div class="surcharges-header">
                <h4>Danh sách phụ phí có sẵn</h4>
                <span class="surcharges-count">Tìm thấy {{ availableSurcharges.length }} phụ phí</span>
              </div>

              <div class="surcharges-grid" v-if="availableSurcharges.length > 0">
                <!-- Service items dưới dạng checkbox -->
                <div class="surcharge-checkbox-item" v-for="surcharge in availableSurcharges" :key="surcharge.id">
                  <div class="surcharge-checkbox-content">
                    <div class="checkbox-wrapper">
                      <input type="checkbox" :id="`surcharge-${surcharge.id}`" v-model="surcharge.selected"
                        @change="onSurchargeSelectionChange(surcharge)" class="surcharge-checkbox" />
                      <label :for="`surcharge-${surcharge.id}`" class="checkbox-label">
                        <div class="surcharge-main-info">
                          <div class="surcharge-name-price">
                            <h5 class="surcharge-name">{{ surcharge.name }}</h5>
                            <div class="surcharge-price">
                              <span class="price">{{ formatCurrency(surcharge.price) }}</span>
                              <span class="unit">/ {{ surcharge.unit }}</span>
                            </div>
                          </div>
                          <div class="surcharge-quantity-controls" v-if="surcharge.selected">
                            <div class="quantity-controls">
                              <button type="button" class="qty-btn minus" @click="decrementSurchargeQuantity(surcharge)"
                                :disabled="surcharge.quantity <= 1">
                                <i class="fas fa-minus"></i>
                              </button>
                              <input type="number" class="qty-input" v-model.number="surcharge.quantity"
                                @input="onSurchargeQuantityChange(surcharge)" min="1" max="99" />
                              <button type="button" class="qty-btn plus" @click="incrementSurchargeQuantity(surcharge)"
                                :disabled="surcharge.quantity >= 99">
                                <i class="fas fa-plus"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Loading state -->
              <div class="loading-state" v-if="isLoadingPhuPhi">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải danh sách phụ phí...</p>
              </div>

              <!-- Empty state -->
              <div class="empty-state" v-if="!isLoadingPhuPhi && availableSurcharges.length === 0">
                <i class="fas fa-money-bill-wave"></i>
                <h4>Không có phụ phí nào</h4>
                <p>Hiện tại chưa có phụ phí nào có sẵn để thêm</p>
              </div>
            </div>
          </div>

          <div class="modal-footer add-surcharge-footer">
            <div class="selected-summary">
              <span class="selected-count">Đã chọn: <strong>{{ selectedSurchargeIds.length }}</strong> phụ phí</span>
              <span class="total-amount">Tổng tiền:
                <strong>{{ formatCurrency(calculateSelectedSurchargeTotal()) }}</strong></span>
            </div>
            <div class="footer-actions">
              <button class="btn btn-secondary" @click="closeAddSurchargeModal">
                <i class="fas fa-times"></i> Hủy
              </button>
              <button class="btn btn-primary" :disabled="selectedSurchargeIds.length === 0"
                @click="addSelectedSurcharges">
                <i class="fas fa-plus-circle"></i> Thêm phụ phí ({{ selectedSurchargeIds.length }})
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import {
  getAllDatHomesByStatus,
  getAllDatHomes,
  updateStatus,
  confirmAndCancelOverlaps,
  checkIn,
  checkOut,
  extendCheckIn,
  getDatHomeById,
} from '@/Service/DatHomeService'
import axios from 'axios' // Used for fetching booking logs
import { useAuthStore } from '@/stores/authStore'
import notification from '@/utils/notification' // Import notification utility
import { showCelebration } from '@/utils/fireworks' // Import hiệu ứng pháo hoa
import PaymentService from '@/Service/PaymentService'
import ThanhToanService from '@/Service/ThanhToan'
import dichVuChiTietService from '@/Service/dichVuChiTietService'
import { getDichVuByHomestay } from '@/Service/dichVuService'
export default {
  name: 'DatHome',
  data() {
    return {
      showModal: false,
      bookings: [],
      calendar: null,
      selectedBooking: null,
      currentView: 'calendar',
      fullCalendarLoaded: false,
      isLoading: true,

      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      waitingCheckinBookings: 0,
      waitingCheckoutBookings: 0,
      depositedBookings: 0,
      completedBookings: 0,
      currentPage: 0,
      itemsPerPage: 5,
      visibleBookingsCount: 8,
      loadMoreStep: 8,
      statusNote: '',
      showStatusActions: false,
      checkInNote: '',
      checkOutNote: '',
      datHomeLogs: [],
      showLogModal: false,
      currentBookingLogs: [],
      currentBookingInfo: null,
      loadingLogs: false,
      // Thanh toán
      soTienDaThanhToan: 0,
      soTienConLai: 0,
      isLoadingPayment: false,
      showPaymentModal: false,
      paymentUrl: '',
      paymentOrderCode: '',
      paymentStatus: 'DangCho', // Trạng thái thanh toán: DangCho, ThanhCong, ThatBai
      autoCheckingStatus: false, // Đánh dấu đang tự động kiểm tra
      statusCheckInterval: null, // Interval cho việc kiểm tra tự động
      checkingPaymentStatus: false, // Đánh dấu đang kiểm tra thủ công
      abortController: null, // AbortController để hủy request
      paymentTimeoutSeconds: 300, // Thời gian thanh toán: 5 phút = 300 giây
      remainingTimeSeconds: 300, // Thời gian còn lại
      paymentTimer: null, // Timer để đếm ngược

      // Lựa chọn phương thức thanh toán
      showPaymentMethodModal: false,

      // Tab dịch vụ và phụ phí
      activeTab: 'dichvu',
      isLoadingDichVu: false,

      // Thanh toán tiền mặt
      showCashPaymentModal: false,
      cashReceived: null,
      changeAmount: 0,
      quickAmounts: [],

      // Modal thêm dịch vụ
      showAddServiceModal: false,
      availableServices: [], // Danh sách dịch vụ có sẵn
      selectedServiceIds: [], // Các dịch vụ đã chọn để thêm
      isLoadingServices: false, // Loading khi lấy danh sách dịch vụ
      serviceQuantities: {}, // Số lượng cho từng dịch vụ được chọn

      extensionInfo: null, // Thêm biến để lưu thông tin gia hạn

      // Modal thêm phụ phí
      showAddSurchargeModal: false,
      availableSurcharges: [], // Danh sách phụ phí có sẵn
      selectedSurchargeIds: [], // Các phụ phí đã chọn để thêm
      isLoadingPhuPhi: false, // Loading khi lấy danh sách phụ phí
      surchargeQuantities: {}, // Số lượng cho từng phụ phí được chọn

      searchQuery: '',
      statusFilter: '',
      historySearchQuery: '',
    }
  },
  computed: {
    pendingPercent() {
      return this.totalBookings > 0
        ? Math.round((this.pendingBookings / this.totalBookings) * 100)
        : 0
    },
    depositedPercent() {
      return this.totalBookings > 0
        ? Math.round((this.depositedBookings / this.totalBookings) * 100)
        : 0
    },
    confirmedPercent() {
      return this.totalBookings > 0
        ? Math.round((this.confirmedBookings / this.totalBookings) * 100)
        : 0
    },
    waitingCheckinPercent() {
      return this.totalBookings > 0
        ? Math.round((this.waitingCheckinBookings / this.totalBookings) * 100)
        : 0
    },
    waitingCheckoutPercent() {
      return this.totalBookings > 0
        ? Math.round((this.waitingCheckoutBookings / this.totalBookings) * 100)
        : 0
    },
    completedPercent() {
      return this.totalBookings > 0
        ? Math.round((this.completedBookings / this.totalBookings) * 100)
        : 0
    },
    paginatedBookings() {
      const start = this.currentPage * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.bookings.slice(start, end)
    },
    sortedBookings() {
      // Sắp xếp theo ngày đặt mới nhất
      return [...this.bookings].sort((a, b) => {
        const dateA = new Date(a.ngayDat).getTime()
        const dateB = new Date(b.ngayDat).getTime()
        return dateB - dateA // Sắp xếp giảm dần (mới nhất trước)
      })
    },
    displayedBookings() {
      return this.sortedBookings.slice(0, this.visibleBookingsCount)
    },
    totalPages() {
      return Math.ceil(this.bookings.length / this.itemsPerPage)
    },
    // Computed properties for pagination info
    startItem() {
      return this.bookings.length > 0 ? this.currentPage * this.itemsPerPage + 1 : 0
    },
    endItem() {
      const end = (this.currentPage + 1) * this.itemsPerPage
      return end > this.totalItems ? this.totalItems : end
    },
    totalItems() {
      return this.bookings.length
    },
    // Empty rows to always show 5 rows
    emptyRows() {
      const rowsCount = this.paginatedBookings.length
      return rowsCount < 5 ? 5 - rowsCount : 0
    },
    // Lấy thông tin người dùng hiện tại
    currentUser() {
      const authStore = useAuthStore()
      return authStore.user
    },
    // Sắp xếp và lọc logs theo thời gian gần nhất và mã đặt home
    sortedLogs() {
      if (!this.currentBookingLogs || this.currentBookingLogs.length === 0) return []

      // Sắp xếp theo thời gian gần nhất
      return [...this.currentBookingLogs].sort((a, b) => {
        const dateA = new Date(a.thoiGianThayDoi).getTime()
        const dateB = new Date(b.thoiGianThayDoi).getTime()
        return dateB - dateA
      })
    },

    filteredHistoryBookings() {
      if (!this.historySearchQuery) {
        return this.paginatedBookings
      }

      const query = this.historySearchQuery.toLowerCase().trim()
      return this.bookings
        .filter((booking) => {
          if (booking.maDatHome) {
            return booking.maDatHome.toLowerCase().startsWith(query)
          }
          return false
        })
        .slice(this.currentPage * this.itemsPerPage, (this.currentPage + 1) * this.itemsPerPage)
    },

    filteredHistoryCount() {
      if (!this.historySearchQuery) {
        return this.totalItems
      }

      const query = this.historySearchQuery.toLowerCase().trim()
      return this.bookings.filter((booking) => {
        if (booking.maDatHome) {
          return booking.maDatHome.toLowerCase().startsWith(query)
        }
        return false
      }).length
    },

    filteredBookings() {
      if (!this.searchQuery && !this.statusFilter) {
        return this.displayedBookings
      }

      return this.sortedBookings
        .filter((booking) => {
          // Lọc theo trạng thái nếu có
          if (this.statusFilter && booking.trangThai !== this.statusFilter) {
            return false
          }

          // Lọc theo query nếu có
          if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase().trim()
            // Tìm theo mã đặt home - kiểm tra xem mã có bắt đầu bằng query không
            if (booking.maDatHome && booking.maDatHome.toLowerCase().startsWith(query)) {
              return true
            }

            // Tìm theo số điện thoại khách hàng
            // Kiểm tra trong nhiều vị trí có thể có số điện thoại
            const soDienThoai =
              booking.soDienThoai ||
              (booking.khachHang && booking.khachHang.soDienThoai) ||
              booking.sdt ||
              ''

            if (soDienThoai && soDienThoai.startsWith(query)) {
              return true
            }

            // Nếu không tìm thấy theo cả mã đặt home và số điện thoại
            return false
          }

          return true
        })
        .slice(0, this.visibleBookingsCount)
    },
  },
  mounted() {
    this.fetchBookings()
    this.fetchStatistics()
    this.loadFullCalendarScripts().then(() => {
      this.fullCalendarLoaded = true
      this.initializeCalendar()
    })
  },

  watch: {
    // Theo dõi trạng thái của booking để chuyển tab khi cần
    'selectedBooking.trangThai': function (newVal) {
      // Nếu trạng thái không phải là DaCheckIn và đang ở tab phụ phí
      if (newVal !== 'DaCheckIn' && this.activeTab === 'phuphi') {
        // Chuyển về tab dịch vụ
        this.activeTab = 'dichvu'
      }
    },
  },
  methods: {
    navigateToDatHomeADM() {
      // Sử dụng tên route đã được định nghĩa trong router
      this.$router.push({ name: 'DatHomeADM' })
    },
    async fetchBookings() {
      try {
        this.isLoading = true
        const response = await getAllDatHomes()
        this.bookings = response.data

        // Log để kiểm tra cấu trúc dữ liệu booking
        if (this.bookings.length > 0) {
          console.log('Cấu trúc booking:', this.bookings[0])
          console.log('Số điện thoại có tồn tại không:', 'soDienThoai' in this.bookings[0])
        }

        this.isLoading = false

        // Nếu đang ở chế độ lịch, cập nhật lịch
        if (this.currentView === 'calendar' && this.fullCalendarLoaded && this.calendar) {
          this.updateCalendarEvents()
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách đặt phòng:', error)
        this.isLoading = false
      }
    },

    async fetchStatistics() {
      try {
        // Lấy tổng số đặt phòng
        const allResponse = await getAllDatHomes()
        this.totalBookings = allResponse.data.length

        // Lấy số đặt phòng chờ xác nhận
        const pendingResponse = await getAllDatHomesByStatus('ChoXacNhan')
        this.pendingBookings = pendingResponse.data.length

        // Lấy số đặt phòng đã xác nhận
        const confirmedResponse = await getAllDatHomesByStatus('DaXacNhan')
        this.confirmedBookings = confirmedResponse.data.length

        // Lấy số đặt phòng chờ check-in (đã xác nhận)
        this.waitingCheckinBookings = confirmedResponse.data.length

        // Lấy số đặt phòng chờ check-out (đã check-in)
        const waitingCheckoutResponse = await getAllDatHomesByStatus('DaCheckIn')
        this.waitingCheckoutBookings = waitingCheckoutResponse.data.length

        // Lấy số đặt phòng đã cọc
        const depositedResponse = await getAllDatHomesByStatus('DaCoc')
        this.depositedBookings = depositedResponse.data.length

        // Lấy số đặt phòng đã hoàn thành
        const completedResponse = await getAllDatHomesByStatus('HoanThanh')
        this.completedBookings = completedResponse.data.length
      } catch (error) {
        console.error('Lỗi khi tải thống kê:', error)
      }
    },

    async updateBookingStatus(id, newStatus) {
      if (!this.currentUser) {
        notification.warning('Bạn cần đăng nhập để thực hiện thao tác này!')
        return
      }

      try {
        const userId = this.currentUser.id

        if (newStatus === 'DaXacNhan') {
          // Nếu đang xác nhận đặt phòng, sử dụng API mới để hủy các đơn trùng lặp
          await confirmAndCancelOverlaps(id, userId, this.statusNote)
          notification.success(
            `Xác nhận đặt phòng thành công! Các đơn trùng lặp đã được tự động hủy.`,
          )
        } else {
          // Đối với các trạng thái khác, sử dụng API thông thường
          await updateStatus(id, newStatus, userId, this.statusNote)

          // Hiển thị pháo hoa nếu trạng thái là hoàn thành
          if (newStatus === 'HoanThanh') {
            this.showFireworks()
            notification.success(`Chúc mừng! Đặt phòng đã hoàn thành thành công!`)
          } else {
            notification.success(`Cập nhật trạng thái thành công!`)
          }
        }

        // Cập nhật lại dữ liệu
        await this.fetchBookings()
        await this.fetchStatistics()

        // Đóng modal và reset ghi chú
        this.showModal = false
        this.statusNote = ''
        this.showStatusActions = false
        this.checkInNote = ''
        this.checkOutNote = ''
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error)
        notification.error('Đã xảy ra lỗi khi cập nhật trạng thái')
      }
    },

    // Phương thức hiển thị pháo hoa (sử dụng utility function)
    showFireworks() {
      // Gọi hiệu ứng pháo hoa từ utility
      showCelebration()
    },

    async viewBookingDetails(booking) {
      try {
        try {
          const response = await getDatHomeById(booking.id)
          this.selectedBooking = response.data
        } catch (error) {
          console.error('Lỗi khi lấy thông tin đặt phòng:', error)
        }

        // Reset thông tin gia hạn khi mở modal mới
        this.extensionInfo = null

        // Debug: In ra cấu trúc dữ liệu để kiểm tra tên trường homestay ID
        console.log('selectedBooking structure:', this.selectedBooking)
        console.log('Available keys:', Object.keys(this.selectedBooking))

        this.showModal = true
        this.showStatusActions = true

        // Reset trạng thái thanh toán khi mở chi tiết đặt phòng mới
        this.paymentStatus = 'DangCho'
        this.soTienDaThanhToan = 0
        this.soTienConLai = 0

        // Đặt tab mặc định là dịch vụ
        this.activeTab = 'dichvu'

        // Lấy thông tin số tiền đã thanh toán khi mở chi tiết
        if (this.selectedBooking) {
          await this.getTongTienDatHome(this.selectedBooking.id)
          // Gọi API lấy dịch vụ chi tiết
          this.fetchDichVuChiTiet()
          // Gọi API lấy phụ phí chi tiết
          this.loadPhuPhiChiTiet(this.selectedBooking.id)
        }
      } catch (error) {
        console.error('Lỗi khi tải chi tiết đặt phòng:', error)
        notification.error('Đã xảy ra lỗi khi tải chi tiết đặt phòng')
      }
    },

    switchToCalendarView() {
      this.currentView = 'calendar'

      // Wait for DOM update then render calendar
      this.$nextTick(() => {
        if (this.fullCalendarLoaded) {
          if (this.calendar) {
            this.updateCalendarEvents()
            // If calendar exists, just render it
            this.calendar.render()
          } else {
            // If calendar doesn't exist yet, initialize it
            this.initializeCalendar()
          }
        }
      })
    },
    switchToDetailView() {
      this.currentView = 'detail'
    },
    updateCalendarEvents() {
      if (!this.calendar) return

      // Xóa tất cả sự kiện hiện tại
      this.calendar.removeAllEvents()

      // Chuyển đổi bookings thành sự kiện FullCalendar
      const events = this.bookings
        .filter((b) => b.trangThai !== 'DaHuy') // Ẩn các đơn đã hủy khỏi lịch
        .map((booking) => {
          const statusColorMap = {
            ChoXacNhan: '#f6c23e',
            DaCoc: '#36b9cc',
            DaXacNhan: '#1cc88a',
            DaCheckIn: '#e74a3b',
            DaCheckOut: '#8e44ad',
            HoanThanh: '#4e73df',
            DaHuy: '#858796',
          }

          const statusLabels = {
            ChoXacNhan: 'Chờ xác nhận',
            DaCoc: 'Đã cọc',
            DaXacNhan: 'Đã xác nhận',
            DaCheckIn: 'Đã check-in',
            DaCheckOut: 'Đã check-out',
            HoanThanh: 'Hoàn thành',
            DaHuy: 'Đã hủy',
          }

          // Tạo tiêu đề sự kiện với đầy đủ thông tin
          const title = `${booking.tenKhachHang} - ${booking.tenHomestay}
          [${statusLabels[booking.trangThai] || booking.trangThai}]`

          // Thêm 1 ngày vào ngày kết thúc để FullCalendar hiển thị đúng khoảng thời gian
          const endDate = new Date(booking.ngayTraPhong)
          endDate.setDate(endDate.getDate() + 1)

          return {
            id: booking.id,
            resourceId: 'homestay-' + booking.homestayId,
            title: title,
            start: booking.ngayNhanPhong,
            end: endDate.toISOString().split('T')[0], // Format lại thành YYYY-MM-DD
            color: statusColorMap[booking.trangThai] || '#858796',
            extendedProps: {
              status: booking.trangThai,
              homestayName: booking.tenHomestay,
              customerName: booking.tenKhachHang,
              bookingCode: booking.maDatHome,
              realEndDate: booking.ngayTraPhong, // Lưu ngày kết thúc thực tế
            },
            allDay: true,
          }
        })

      // Thêm sự kiện mới
      this.calendar.addEventSource(events)
    },
    initializeCalendar() {
      // Make sure FullCalendar is loaded and we're in calendar view
      if (!this.fullCalendarLoaded || !window.FullCalendar) {
        console.error('FullCalendar not loaded yet')
        return
      }

      this.$nextTick(() => {
        const calendarEl = this.$refs.fullCalendar

        if (!calendarEl) {
          console.error('Calendar element not found')
          return
        }

        try {
          // Clean up existing calendar if it exists
          if (this.calendar) {
            this.calendar.destroy()
            this.calendar = null
          }

          // Initialize FullCalendar
          this.calendar = new window.FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: 'auto',
            headerToolbar: {
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            },
            locale: 'vi',
            eventClick: this.handleEventClick,
            events: [], // Sẽ được cập nhật sau bằng updateCalendarEvents()
            eventDidMount: function (info) {
              const event = info.event
              const props = event.extendedProps

              // Sử dụng ngày kết thúc thực tế từ dữ liệu ban đầu
              const realEndDate = props.realEndDate
                ? new Date(props.realEndDate).toLocaleDateString('vi-VN')
                : 'N/A'
              const startDate = new Date(event.start).toLocaleDateString('vi-VN')

              // Lấy trạng thái và màu sắc tương ứng
              const statusLabels = {
                ChoXacNhan: 'Chờ xác nhận',
                DaCoc: 'Đã cọc',
                DaXacNhan: 'Đã xác nhận',
                DaCheckIn: 'Đã check-in',
                DaCheckOut: 'Đã check-out',
                HoanThanh: 'Hoàn thành',
                DaHuy: 'Đã hủy',
              }

              const statusLabel = statusLabels[props.status] || props.status

              // Tạo tooltip tùy chỉnh
              const tooltip = document.createElement('div')
              tooltip.classList.add('custom-tooltip')
              tooltip.innerHTML = `
                <div class="tooltip-header">
                  <i class="fas fa-user"></i> ${props.customerName}
                </div>
                <div class="tooltip-body">
                  <div class="tooltip-info">
                    <i class="fas fa-home"></i> ${props.homestayName || 'N/A'}
                  </div>
                  <div class="tooltip-info">
                    <i class="fas fa-calendar-check"></i> Từ: ${startDate}
                  </div>
                  <div class="tooltip-info">
                    <i class="fas fa-calendar-times"></i> Đến: ${realEndDate}
                  </div>
                  <div class="tooltip-status ${props.status}">
                    <i class="fas fa-info-circle"></i> ${statusLabel}
                  </div>
                </div>
              `

              // Thêm style cho tooltip
              tooltip.style.cssText = `
                display: none;
                position: absolute;
                background: white;
                color: #333;
                border-radius: 8px;
                box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
                padding: 0;
                width: 250px;
                z-index: 10000;
                font-family: Arial, sans-serif;
                overflow: hidden;
              `

              // Thêm style cho header
              const header = tooltip.querySelector('.tooltip-header')
              header.style.cssText = `
                background: #4e73df;
                color: white;
                padding: 10px 15px;
                font-weight: bold;
                font-size: 14px;
              `

              // Thêm style cho body
              const body = tooltip.querySelector('.tooltip-body')
              body.style.cssText = `
                padding: 10px 15px;
              `

              // Thêm style cho các thông tin
              const infos = tooltip.querySelectorAll('.tooltip-info')
              infos.forEach((info) => {
                info.style.cssText = `
                  margin-bottom: 8px;
                  display: flex;
                  align-items: center;
                `
              })

              // Thêm style cho trạng thái
              const status = tooltip.querySelector('.tooltip-status')
              status.style.cssText = `
                margin-top: 10px;
                padding: 5px 10px;
                border-radius: 20px;
                display: inline-block;
                font-weight: bold;
                font-size: 12px;
                color: white;
              `

              // Màu sắc cho từng trạng thái
              if (status.classList.contains('ChoXacNhan')) {
                status.style.backgroundColor = '#f6c23e'
              } else if (status.classList.contains('DaCoc')) {
                status.style.backgroundColor = '#36b9cc'
              } else if (status.classList.contains('DaXacNhan')) {
                status.style.backgroundColor = '#1cc88a'
              } else if (status.classList.contains('DaCheckIn')) {
                status.style.backgroundColor = '#e74a3b'
              } else if (status.classList.contains('DaCheckOut')) {
                status.style.backgroundColor = '#8e44ad'
              } else if (status.classList.contains('HoanThanh')) {
                status.style.backgroundColor = '#4e73df'
              } else if (status.classList.contains('DaHuy')) {
                status.style.backgroundColor = '#858796'
              }

              // Style cho icons
              const icons = tooltip.querySelectorAll('i')
              icons.forEach((icon) => {
                icon.style.cssText = `
                  margin-right: 8px;
                  width: 16px;
                  text-align: center;
                `
              })

              // Thêm tooltip vào document
              document.body.appendChild(tooltip)

              // Hiển thị tooltip khi hover
              info.el.addEventListener('mouseenter', function () {
                const rect = info.el.getBoundingClientRect()
                tooltip.style.display = 'block'
                tooltip.style.top = rect.top + window.scrollY - tooltip.offsetHeight - 10 + 'px'
                tooltip.style.left =
                  rect.left + window.scrollX + rect.width / 2 - tooltip.offsetWidth / 2 + 'px'

                // Thêm mũi tên
                const arrow = document.createElement('div')
                arrow.style.cssText = `
                  position: absolute;
                  bottom: -10px;
                  left: calc(50% - 10px);
                  width: 0;
                  height: 0;
                  border-left: 10px solid transparent;
                  border-right: 10px solid transparent;
                  border-top: 10px solid white;
                `
                tooltip.appendChild(arrow)
              })

              // Ẩn tooltip khi mouse leave
              info.el.addEventListener('mouseleave', function () {
                tooltip.style.display = 'none'
                // Xóa mũi tên
                const arrow = tooltip.querySelector('div[style*="position: absolute"]')
                if (arrow) {
                  arrow.remove()
                }
              })
            },
          })

          // Render the calendar
          this.calendar.render()

          // Cập nhật sự kiện từ bookings
          this.updateCalendarEvents()
        } catch (error) {
          console.error('Error initializing calendar:', error)
        }
      })
    },
    loadFullCalendarScripts() {
      return new Promise((resolve) => {
        // Load FullCalendar CSS
        if (!document.getElementById('fullcalendar-css')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.css'
          link.id = 'fullcalendar-css'
          document.head.appendChild(link)
        }

        // Không cần tải Tippy.js nữa, chúng ta sẽ dùng tooltip tự tạo

        // Load Font Awesome nếu cần
        if (!document.getElementById('fontawesome')) {
          const fontAwesome = document.createElement('link')
          fontAwesome.rel = 'stylesheet'
          fontAwesome.href =
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
          fontAwesome.id = 'fontawesome'
          document.head.appendChild(fontAwesome)
        }

        // Check if FullCalendar is already loaded
        if (window.FullCalendar) {
          resolve()
          return
        }

        // Load FullCalendar JS
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.js'
        script.onload = () => {
          // Load locale
          const localeScript = document.createElement('script')
          localeScript.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/locales/vi.js'
          localeScript.onload = () => {
            console.log('FullCalendar scripts loaded')
            resolve()
          }
          document.head.appendChild(localeScript)
        }
        script.onerror = (error) => {
          console.error('Error loading FullCalendar script:', error)
          resolve() // Resolve anyway to prevent blocking
        }
        document.head.appendChild(script)
      })
    },
    handleEventClick(info) {
      const bookingId = parseInt(info.event.id)
      const booking = this.bookings.find((b) => b.id === bookingId)

      if (booking) {
        this.viewBookingDetails(booking)
      }
    },
    // Hàm định dạng ngày tháng hợp nhất
    formatDate(date, format = 'full') {
      if (!date) return ''
      const d = new Date(date)

      switch (format) {
        case 'dayOnly':
          return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
        case 'dateOnly':
          return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
        case 'short':
          return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
          })
        default:
          return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
      }
    },
    formatCurrency(value) {
      if (!value) return '0 VNĐ'
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value)
    },
    getStatusLabel(status) {
      const statusMap = {
        ChoXacNhan: 'Chờ xác nhận',
        DaCoc: 'Đã cọc',
        DaXacNhan: 'Đã xác nhận',
        DaCheckIn: 'Đã check-in',
        DaCheckOut: 'Đã check-out',
        HoanThanh: 'Hoàn thành',
        DaHuy: 'Đã hủy',
      }
      return statusMap[status] || status
    },
    getStatusClass(status) {
      const statusClassMap = {
        ChoXacNhan: 'status-pending',
        DaCoc: 'status-deposit',
        DaXacNhan: 'status-confirmed',
        DaCheckIn: 'status-in-progress',
        DaCheckOut: 'status-check-out',
        HoanThanh: 'status-completed',
        DaHuy: 'status-cancelled',
      }
      return statusClassMap[status] || ''
    },
    // Pagination method
    changePage(page) {
      if (page < 0 || page >= this.totalPages) return
      this.currentPage = page
    },
    async handleCheckIn(bookingId) {
      if (!this.currentUser) {
        notification.warning('Bạn cần đăng nhập để thực hiện thao tác này!')
        return
      }

      // Kiểm tra thời gian hiện tại có phù hợp để check-in không
      const now = new Date()
      const checkInTime = 0 // 12h trưa
      if (now.getHours() < checkInTime) {
        notification.warning(
          `Chưa đến thời gian check-in. Vui lòng quay lại sau ${checkInTime}:00.`,
        )
        return
      }

      try {
        const userId = this.currentUser.id
        await checkIn(bookingId, userId, this.checkInNote)
        await this.fetchBookings()
        await this.fetchStatistics()
        this.checkInNote = '' // Reset note
        notification.success('Check-in thành công!')
        this.showModal = false // Đóng modal sau khi thực hiện thao tác
      } catch (error) {
        console.error('Lỗi khi check-in:', error)
        notification.error('Đã xảy ra lỗi khi check-in')
      }
    },
    async handleCheckOut(bookingId) {
      if (!this.currentUser) {
        notification.warning('Bạn cần đăng nhập để thực hiện thao tác này!')
        return
      }

      try {
        const userId = this.currentUser.id
        await checkOut(bookingId, userId, this.checkOutNote)
        await this.fetchBookings()
        await this.fetchStatistics()
        this.checkOutNote = '' // Reset note
        notification.success('Check-out thành công!')
        this.showModal = false // Đóng modal sau khi thực hiện thao tác
      } catch (error) {
        console.error('Lỗi khi check-out:', error)
        notification.error('Đã xảy ra lỗi khi check-out')
      }
    },
    loadMoreBookings() {
      // Tăng số lượng thẻ hiển thị lên theo bước
      this.visibleBookingsCount += this.loadMoreStep
    },

    async showBookingLogs(bookingId) {
      try {
        this.loadingLogs = true

        // Lấy thông tin booking để hiển thị trong header
        const bookingInfo = this.bookings.find((booking) => booking.id === bookingId)
        this.currentBookingInfo = bookingInfo

        // Lấy lịch sử thay đổi
        const response = await axios.get(`http://localhost:8080/api/datHomeLog/${bookingId}`)
        this.currentBookingLogs = response.data
        this.showLogModal = true
        this.loadingLogs = false
      } catch (error) {
        console.error('Lỗi khi tải lịch sử thay đổi:', error)
        notification.error('Đã xảy ra lỗi khi tải lịch sử thay đổi')
        this.loadingLogs = false
      }
    },

    // Lấy thông tin số tiền đã thanh toán
    async getTongTienDatHome(idDatHome) {
      try {
        const response = await ThanhToanService.tongTienDatHome(idDatHome)
        // Xử lý cả trường hợp response là null
        // API trả về số tiền trực tiếp, không phải object có tongTienDaThanhToan
        this.soTienDaThanhToan =
          response && response.data !== null && response.data !== undefined
            ? Number(response.data)
            : 0

        // Đảm bảo lấy giá trị tongTien từ selectedBooking
        if (this.selectedBooking && this.selectedBooking.tongTien) {
          this.soTienConLai = this.selectedBooking.tongTien - this.soTienDaThanhToan
        } else {
          this.soTienConLai = 0
        }

        console.log('Số tiền đã thanh toán:', this.soTienDaThanhToan)
        console.log('Tổng tiền:', this.selectedBooking.tongTien)
        console.log('Số tiền còn lại:', this.soTienConLai)

        // Nếu không còn số tiền phải thanh toán, cập nhật trạng thái thanh toán thành công
        if (this.soTienConLai <= 0) {
          this.paymentStatus = 'ThanhCong'
          console.log('Đã thanh toán đủ, cập nhật trạng thái thành ThanhCong')
        } else {
          this.paymentStatus = 'DangCho'
          console.log('Chưa thanh toán đủ, trạng thái thanh toán: DangCho')
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin tổng tiền đã thanh toán:', error)
        // Đặt giá trị mặc định nếu có lỗi
        this.soTienDaThanhToan = 0
        this.soTienConLai = this.selectedBooking ? this.selectedBooking.tongTien : 0
      }
    },

    // Tạo link thanh toán cho số tiền còn lại - Cập nhật để hiển thị modal lựa chọn
    async createPaymentForRemaining() {
      const remainingAmount = this.calculateRemainingAmount()
      if (remainingAmount <= 0) return

      // Hiển thị modal lựa chọn phương thức thanh toán
      this.showPaymentMethodModal = true

      // Tính nhanh các mức tiền gợi ý cho thanh toán tiền mặt
      this.generateQuickAmounts(remainingAmount)
    },

    // Chọn phương thức thanh toán QR
    async processQRPayment() {
      this.isLoadingPayment = true
      this.showPaymentMethodModal = false

      try {
        const remainingAmount = this.calculateRemainingAmount()
        const response = await PaymentService.createPaymentRemaining(
          remainingAmount,
          this.selectedBooking.id,
        )
        console.log('Response thanh toán:', response)

        if (response && response.checkoutUrl) {
          this.paymentUrl = response.checkoutUrl
          this.paymentOrderCode = response.orderCode || ''
          this.showPaymentModal = true

          // Khởi tạo trạng thái và AbortController
          this.paymentStatus = 'DangCho'
          this.abortController = new AbortController()

          // Bắt đầu kiểm tra trạng thái thanh toán
          this.startAutoStatusCheck()

          // Bắt đầu đếm ngược thời gian thanh toán
          this.startPaymentCountdown()
        } else {
          notification.error('Không nhận được link thanh toán từ hệ thống')
        }
      } catch (error) {
        console.error('Lỗi khi tạo link thanh toán:', error)
        notification.error('Không thể tạo link thanh toán')
      } finally {
        this.isLoadingPayment = false
      }
    },

    // Chọn phương thức thanh toán tiền mặt
    processCashPayment() {
      this.showPaymentMethodModal = false
      this.showCashPaymentModal = true
      this.cashReceived = null
      this.changeAmount = 0
    },

    // Hủy thanh toán
    cancelPaymentMethod() {
      this.showPaymentMethodModal = false
    },

    // Tạo các mức tiền gợi ý
    generateQuickAmounts(amount) {
      const totalAmount = amount || this.calculateRemainingAmount()

      // Làm tròn tổng tiền lên 10.000
      const roundedTotal = Math.ceil(totalAmount / 10000) * 10000

      this.quickAmounts = [
        roundedTotal,
        roundedTotal + 50000,
        roundedTotal + 100000,
        roundedTotal + 200000,
        roundedTotal + 500000,
        roundedTotal + 1000000,
      ]
    },

    // Xử lý chọn nhanh số tiền
    setQuickAmount(amount) {
      this.cashReceived = amount
      this.calculateChange()
    },

    // Tính tiền thối
    calculateChange() {
      if (this.cashReceived === null) {
        this.changeAmount = 0
        return
      }

      const remainingAmount = this.calculateRemainingAmount()
      this.changeAmount = this.cashReceived - remainingAmount
    },

    // Đóng modal thanh toán tiền mặt
    closeCashPaymentModal() {
      this.showCashPaymentModal = false
      this.cashReceived = null
      this.changeAmount = 0
    },

    // Xác nhận thanh toán tiền mặt
    async confirmCashPayment() {
      const remainingAmount = this.calculateRemainingAmount()
      if (this.cashReceived < remainingAmount) {
        notification.warning('Số tiền khách đưa phải lớn hơn hoặc bằng tổng tiền thanh toán')
        return
      }

      try {
        // Gọi API thanh toán tiền mặt
        const remainingAmount = this.calculateRemainingAmount()
        await ThanhToanService.createThanhToanTienMat(
          this.selectedBooking.id,
          this.cashReceived,
          this.changeAmount,
          remainingAmount,
        )

        notification.success('Thanh toán tiền mặt thành công!')

        // Cập nhật trạng thái thanh toán thành công
        this.paymentStatus = 'ThanhCong'

        // Cập nhật thông tin số tiền đã thanh toán
        if (this.selectedBooking && this.selectedBooking.id) {
          await this.getTongTienDatHome(this.selectedBooking.id)
        }

        // Đóng modal
        this.closeCashPaymentModal()
      } catch (error) {
        console.error('Lỗi khi xử lý thanh toán tiền mặt:', error)
        notification.error('Không thể hoàn tất thanh toán tiền mặt')
      }
    },

    // Bắt đầu đếm ngược thời gian thanh toán
    startPaymentCountdown() {
      // Reset thời gian còn lại
      this.remainingTimeSeconds = this.paymentTimeoutSeconds

      // Xóa timer cũ nếu có
      this.stopPaymentCountdown()

      // Tạo timer mới
      this.paymentTimer = setInterval(() => {
        // Giảm thời gian còn lại
        this.remainingTimeSeconds--

        // Nếu hết thời gian
        if (this.remainingTimeSeconds <= 0) {
          this.stopPaymentCountdown()
          this.cancelPayment()
        }
      }, 1000)
    },

    // Dừng đếm ngược
    stopPaymentCountdown() {
      if (this.paymentTimer) {
        clearInterval(this.paymentTimer)
        this.paymentTimer = null
      }
    },

    // Hủy thanh toán khi hết thời gian
    async cancelPayment() {
      // Hiển thị thông báo
      notification.warning('Hết thời gian thanh toán (5 phút). Link thanh toán đã bị hủy.')

      // Hủy link thanh toán nếu có mã giao dịch
      if (this.paymentOrderCode) {
        try {
          await PaymentService.cancelPaymentLink(this.paymentOrderCode, 'Hết thời gian thanh toán')
        } catch (error) {
          console.error('Lỗi khi hủy link thanh toán:', error)
        }
      }

      // Đóng modal
      this.closePaymentModal()
    },

    // Định dạng thời gian còn lại dưới dạng mm:ss
    formatRemainingTime() {
      const minutes = Math.floor(this.remainingTimeSeconds / 60)
      const seconds = this.remainingTimeSeconds % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },

    closePaymentModal() {
      // Đóng modal
      this.showPaymentModal = false

      // Xóa thông tin thanh toán URL
      this.paymentUrl = ''

      // Dừng việc kiểm tra trạng thái tự động
      this.stopAutoStatusCheck()

      // Dừng đếm ngược
      this.stopPaymentCountdown()
    },

    openPaymentUrl() {
      if (this.paymentUrl) {
        window.open(this.paymentUrl, '_blank')
      }
    },

    handleIframeLoad() {
      try {
        const iframe = this.$refs.paymentIframe
        if (!iframe || !iframe.contentWindow) return

        try {
          const currentUrl = iframe.contentWindow.location.href
          console.log('Iframe URL changed:', currentUrl)

          if (
            currentUrl.includes('payment-success') ||
            currentUrl.includes('success=true') ||
            currentUrl.includes('status=success')
          ) {
            console.log('Payment successful, closing modal')
            // Gọi kiểm tra trạng thái thanh toán thay vì đóng modal ngay
            this.checkPaymentStatus(true)
          } else if (
            currentUrl.includes('payment-failure') ||
            currentUrl.includes('cancel=true') ||
            currentUrl.includes('status=cancel')
          ) {
            console.log('Payment cancelled, closing modal')
            this.closePaymentModal()
            notification.info('Thanh toán đã bị hủy')
          }
        } catch (e) {
          console.log('Cannot access iframe URL due to CORS policy', e)
        }
      } catch (error) {
        console.error('Error handling iframe load:', error)
      }
    },

    // Định dạng trạng thái thanh toán để hiển thị
    formatPaymentStatus(status) {
      const statusMap = {
        DangCho: 'Đang chờ thanh toán',
        ThanhCong: 'Thanh toán thành công',
        ThatBai: 'Thanh toán thất bại',
        KhongXacDinh: 'Không xác định',
      }

      return statusMap[status] || status
    },

    // Kiểm tra xem có thể check-out không (dựa vào trạng thái thanh toán)
    canCheckOut() {
      // Nếu không có tiền còn lại hoặc đã thanh toán thành công thì có thể check-out
      return this.soTienConLai <= 0 || this.paymentStatus === 'ThanhCong'
    },

    // Bắt đầu tự động kiểm tra trạng thái thanh toán
    startAutoStatusCheck() {
      if (!this.paymentOrderCode) return

      // Dừng interval cũ nếu có
      this.stopAutoStatusCheck()

      this.autoCheckingStatus = true
      console.log('Bắt đầu tự động kiểm tra trạng thái thanh toán')

      // Tạo một AbortController để kiểm soát việc hủy request
      this.abortController = new AbortController()

      // Kiểm tra ngay lập tức một lần
      this.checkPaymentStatus(false)

      // Thiết lập interval để kiểm tra mỗi 3 giây
      this.statusCheckInterval = setInterval(() => {
        // Chỉ tiếp tục kiểm tra nếu chưa nhận được trạng thái cuối cùng
        if (this.paymentStatus !== 'ThanhCong' && this.paymentStatus !== 'ThatBai') {
          this.checkPaymentStatus(false)
        } else {
          // Nếu đã có trạng thái cuối cùng, dừng kiểm tra
          console.log('Đã nhận được trạng thái cuối cùng, dừng kiểm tra')
          this.stopAutoStatusCheck()
        }
      }, 3000)
    },

    // Dừng tự động kiểm tra trạng thái
    stopAutoStatusCheck() {
      console.log('Đang dừng kiểm tra trạng thái thanh toán...')

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
    async checkPaymentStatus(showLoading = true) {
      if (!this.paymentOrderCode || !this.abortController) return

      // Không cập nhật nếu đã biết trạng thái cuối cùng
      if (this.paymentStatus === 'ThatBai' || this.paymentStatus === 'ThanhCong') {
        console.log(`Đã xác định trạng thái cuối cùng (${this.paymentStatus}), không cập nhật nữa`)
        this.stopAutoStatusCheck() // Dừng kiểm tra tự động
        return
      }

      if (showLoading) {
        this.checkingPaymentStatus = true
      }

      try {
        console.log('Đang kiểm tra trạng thái thanh toán...')

        // Gọi API để lấy thông tin thanh toán từ database với signal
        const dbStatus = await PaymentService.getPaymentStatusFromDB(
          this.paymentOrderCode,
          this.abortController?.signal,
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

                // Cập nhật lại thông tin tổng tiền đã thanh toán
                if (this.selectedBooking && this.selectedBooking.id) {
                  await this.getTongTienDatHome(this.selectedBooking.id)
                }

                this.stopAutoStatusCheck() // Dừng kiểm tra khi thanh toán thành công
                // Đóng modal thanh toán nếu đang mở
                if (this.showPaymentModal) {
                  this.closePaymentModal()
                }
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
      } finally {
        if (showLoading) {
          this.checkingPaymentStatus = false
        }
      }
    },

    calculateServiceTotal() {
      if (
        !this.selectedBooking ||
        !this.selectedBooking.dichVus ||
        this.selectedBooking.dichVus.length === 0
      ) {
        return 0
      }

      return this.selectedBooking.dichVus.reduce((total, service) => {
        return total + Number(service.tongTien || 0)
      }, 0)
    },

    calculatePhuPhiTotal() {
      if (
        !this.selectedBooking ||
        !this.selectedBooking.phuPhis ||
        this.selectedBooking.phuPhis.length === 0
      ) {
        return 0
      }

      return this.selectedBooking.phuPhis.reduce((total, phuPhi) => {
        return total + phuPhi.giaPhuPhi
      }, 0)
    },

    // Tính tổng tiền chính xác
    calculateTotalAmount() {
      if (!this.selectedBooking) return 0

      // Ưu tiên dùng tổng tiền từ đơn đặt (datHome)
      if (this.selectedBooking.tongTien !== undefined && this.selectedBooking.tongTien !== null) {
        return Number(this.selectedBooking.tongTien) || 0
      }

      // Fallback: tính lại từ các phần nếu không có tongTien
      const giaCaHomestay = Number(this.selectedBooking.giaCaHomestay || 0)
      const giamGia = Number(this.calculateActualDiscount() || 0)
      const tongTienDichVu = Number(this.selectedBooking.tongTienDichVu || 0)
      const tongTienPhuPhi = this.calculatePhuPhiTotal()

      return giaCaHomestay - giamGia + tongTienDichVu + tongTienPhuPhi
    },

    // Tính số tiền còn lại phải thanh toán
    calculateRemainingAmount() {
      const tongTien = this.calculateTotalAmount()
      return tongTien - this.soTienDaThanhToan
    },

    // Update tổng tiền
    updateTotalServiceAmount() {
      if (!this.selectedBooking) return

      // Tính tiền dịch vụ và phụ phí tách biệt
      const serviceTotal = this.calculateServiceTotal()
      const phuPhiTotal = this.calculatePhuPhiTotal()

      // Update tiền dịch vụ (chỉ tính phần dịch vụ, không bao gồm phụ phí)
      this.selectedBooking.tongTienDichVu = serviceTotal

      // Lưu tổng tiền phụ phí riêng nếu chưa có
      if (!this.selectedBooking.tongTienPhuPhi) {
        this.selectedBooking.tongTienPhuPhi = 0
      }
      this.selectedBooking.tongTienPhuPhi = phuPhiTotal

      // Nếu đã có tổng tiền từ backend (datHome.tongTien), giữ nguyên để tránh sai lệch
      if (this.selectedBooking.tongTien !== undefined && this.selectedBooking.tongTien !== null) {
        // Cập nhật số tiền còn lại dựa trên tongTien hiện tại
        this.soTienConLai = (Number(this.selectedBooking.tongTien) || 0) - this.soTienDaThanhToan
        return
      }

      // Fallback: tính tổng tiền nếu backend chưa cung cấp tongTien
      const giaCaHomestay = Number(this.selectedBooking.giaCaHomestay || 0)
      const giamGia = Number(this.calculateActualDiscount() || 0)
      const tongTien = giaCaHomestay - giamGia + serviceTotal + phuPhiTotal

      // Set tổng
      this.selectedBooking.tongTien = tongTien

      // Update còn lại
      this.soTienConLai = tongTien - this.soTienDaThanhToan

      console.log('Đã cập nhật tổng tiền:', {
        tongTienDichVu: serviceTotal,
        tongTienPhuPhi: phuPhiTotal,
        tongTien: tongTien,
        soTienConLai: this.soTienConLai,
      })
    },

    // Thêm dịch vụ
    async addService() {
      try {
        // Mở modal
        this.showAddServiceModal = true

        // Bắt đầu loading
        this.isLoadingServices = true

        // Lấy ID homestay
        const homestayId =
          this.selectedBooking?.homestayId ||
          this.selectedBooking?.homeStayId ||
          this.selectedBooking?.HomeStay_ID ||
          this.selectedBooking?.idHomestay ||
          this.selectedBooking?.id_homestay

        if (!this.selectedBooking || !homestayId) {
          notification.error('Không tìm thấy thông tin homestay')
          this.isLoadingServices = false
          return
        }

        console.log('Đang tải dịch vụ cho homestay ID:', homestayId)
        console.log('selectedBooking:', this.selectedBooking)

        // Gọi API lấy dịch vụ theo homestay
        const response = await getDichVuByHomestay(homestayId)

        // Xử lý dữ liệu trả về
        if (response && response.data) {
          this.availableServices = response.data.map((service) => ({
            id: service.id,
            name: service.tenDichVu,
            description: service.moTa || 'Không có mô tả',
            price: service.gia,
            unit: service.donVi || 'Lần',
            category: this.getCategoryFromService(service.tenDichVu), // Phân loại từ tên dịch vụ
            image: service.anhDichVu || '/images/default-service.jpg',
            selected: false,
            quantity: 1,
            originalData: service, // Giữ lại dữ liệu gốc từ API
          }))

          console.log('Đã tải thành công', this.availableServices.length, 'dịch vụ')
        } else {
          this.availableServices = []
          console.log('Không có dịch vụ nào được tìm thấy')
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách dịch vụ:', error)
        console.error('Chi tiết lỗi:', error.response?.data || error.message)

        if (error.response?.status === 404) {
          notification.error('Không tìm thấy dịch vụ cho homestay này')
        } else if (error.response?.status === 500) {
          notification.error('Lỗi server khi tải dịch vụ')
        } else {
          notification.error(
            'Không thể tải danh sách dịch vụ: ' + (error.response?.data?.message || error.message),
          )
        }

        this.availableServices = []
      } finally {
        // Kết thúc loading
        this.isLoadingServices = false
      }
    },

    // Phân loại dịch vụ dựa trên tên (tạm thời)
    getCategoryFromService(serviceName) {
      const name = serviceName.toLowerCase()

      if (name.includes('massage') || name.includes('spa')) {
        return 'Spa & Massage'
      } else if (
        name.includes('ăn') ||
        name.includes('uống') ||
        name.includes('buffet') ||
        name.includes('cơm') ||
        name.includes('món')
      ) {
        return 'Ăn uống'
      } else if (name.includes('xe') || name.includes('đưa đón') || name.includes('vận chuyển')) {
        return 'Vận chuyển'
      } else {
        return 'Khác'
      }
    },

    // Đóng modal thêm dịch vụ
    closeAddServiceModal() {
      this.showAddServiceModal = false
      // Reset dữ liệu nếu cần
      this.resetServiceSelection()
    },

    // Reset lựa chọn dịch vụ
    resetServiceSelection() {
      this.availableServices.forEach((service) => {
        service.selected = false
        service.quantity = 0
      })
      this.selectedServiceIds = []
      this.serviceQuantities = {}
    },

    onServiceSelectionChange(service) {
      if (service.selected) {
        // Thêm vào danh sách đã chọn
        if (!this.selectedServiceIds.includes(service.id)) {
          this.selectedServiceIds.push(service.id)
        }

        if (service.quantity < 1) {
          service.quantity = 1
        }
      } else {
        const index = this.selectedServiceIds.indexOf(service.id)
        if (index > -1) {
          this.selectedServiceIds.splice(index, 1)
        }
      }

      console.log('Dịch vụ đã chọn:', this.selectedServiceIds)
    },

    // Tăng số lượng dịch vụ
    incrementQuantity(service) {
      if (service.quantity < 99) {
        service.quantity++
      }
    },

    // Giảm số lượng dịch vụ
    decrementQuantity(service) {
      if (service.quantity > 1) {
        service.quantity--
      }
    },

    // Xử lý khi thay đổi số lượng bằng input
    onQuantityChange(service) {
      // Đảm bảo quantity trong khoảng hợp lệ
      if (service.quantity < 1) {
        service.quantity = 1
      } else if (service.quantity > 99) {
        service.quantity = 99
      }
    },

    // Tính tổng tiền các dịch vụ đã chọn
    calculateSelectedTotal() {
      if (!this.availableServices || this.availableServices.length === 0) {
        return 0
      }
      return this.availableServices
        .filter((service) => service.selected)
        .reduce((total, service) => {
          return total + service.price * service.quantity
        }, 0)
    },

    // Tăng số lượng dịch vụ
    incrementServiceQuantity(service) {
      if (!service) return
      service.soLuong++
      service.tongTien = service.soLuong * service.giaDichVu
      this.updateServiceQuantity(service)
    },

    // Giảm số lượng dịch vụ
    decrementServiceQuantity(service) {
      if (!service || service.soLuong <= 1) return
      service.soLuong--
      service.tongTien = service.soLuong * service.giaDichVu
      this.updateServiceQuantity(service)
    },

    // Cập nhật số lượng dịch vụ lên server
    updateServiceQuantity(service) {
      if (!service || !this.selectedBooking) return

      console.log(`Cập nhật số lượng dịch vụ ${service.tenDichVu}: ${service.soLuong}`)

      dichVuChiTietService
        .updateQuantity(service.id, service.soLuong)
        .then((response) => {
          console.log('Cập nhật số lượng thành công:', response.data)
          // Cập nhật lại dữ liệu hiển thị
          service.tongTien = response.data.tongGia

          // Cập nhật tổng tiền dịch vụ trong thông tin thanh toán
          this.updateTotalServiceAmount()

          // Hiển thị thông báo thành công
          notification.success('Cập nhật số lượng thành công')
        })
        .catch((error) => {
          console.error('Lỗi khi cập nhật số lượng:', error)
          notification.error('Cập nhật số lượng thất bại')
        })
    },

    // Xóa dịch vụ
    removeService(service, index) {
      if (!service || !this.selectedBooking || !this.selectedBooking.dichVus) return

      if (confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.tenDichVu}" không?`)) {
        console.log(`Xóa dịch vụ ${service.tenDichVu}`)

        dichVuChiTietService
          .deleteDichVuChiTiet(service.id)
          .then((response) => {
            console.log('Xóa dịch vụ thành công:', response.data)

            // Xóa khỏi mảng hiển thị
            this.selectedBooking.dichVus.splice(index, 1)

            // Cập nhật tổng tiền dịch vụ trong thông tin thanh toán
            this.updateTotalServiceAmount()

            // Hiển thị thông báo thành công
            notification.success('Xóa dịch vụ thành công')
          })
          .catch((error) => {
            console.error('Lỗi khi xóa dịch vụ:', error)
            notification.error('Xóa dịch vụ thất bại')
          })
      }
    },

    // Lấy danh sách dịch vụ chi tiết theo idDatHome
    fetchDichVuChiTiet() {
      if (!this.selectedBooking || !this.selectedBooking.id) return

      // Sử dụng phương thức loadDichVuChiTiet để thống nhất việc lấy dịch vụ chi tiết
      this.loadDichVuChiTiet(this.selectedBooking.id)
    },

    // Phương thức xử lý khi nhấn nút thêm phụ phí
    async addSurcharge() {
      try {
        // Hiển thị modal thêm phụ phí
        this.showAddSurchargeModal = true

        // Bắt đầu loading
        this.isLoadingPhuPhi = true

        // Import hàm getAllPhuPhiPhatSinhActive từ phuPhiService
        const { getAllPhuPhiPhatSinhActive } = await import('@/Service/phuPhiService')

        // Gọi API lấy tất cả phụ phí phát sinh đang hoạt động
        const response = await getAllPhuPhiPhatSinhActive()

        // Xử lý dữ liệu trả về
        if (response && response.data) {
          this.availableSurcharges = response.data.map((surcharge) => ({
            id: surcharge.id,
            name: surcharge.tenPhuPhi,
            description: surcharge.moTa || 'Không có mô tả',
            price: surcharge.giaTri, // Sửa từ giaPhuPhi thành giaTri theo đúng Entity
            unit: surcharge.loaiPhuPhi || 'Lần', // Sử dụng loaiPhuPhi làm đơn vị nếu không có donVi
            selected: false,
            quantity: 1,
            originalData: surcharge, // Giữ lại dữ liệu gốc từ API
          }))

          console.log('Đã tải thành công', this.availableSurcharges.length, 'phụ phí')
        } else {
          this.availableSurcharges = []
          console.log('Không có phụ phí nào được tìm thấy')
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách phụ phí:', error)
        console.error('Chi tiết lỗi:', error.response?.data || error.message)

        if (error.response?.status === 404) {
          notification.error('Không tìm thấy phụ phí nào')
        } else if (error.response?.status === 500) {
          notification.error('Lỗi server khi tải phụ phí')
        } else {
          notification.error(
            'Không thể tải danh sách phụ phí: ' + (error.response?.data?.message || error.message),
          )
        }

        this.availableSurcharges = []
      } finally {
        // Kết thúc loading
        this.isLoadingPhuPhi = false
      }
    },

    incrementPhuPhiQuantity(phuPhi) {
      if (!phuPhi) return
      phuPhi.soLuong++
      this.updatePhuPhiQuantity(phuPhi)
    },

    decrementPhuPhiQuantity(phuPhi) {
      if (!phuPhi || phuPhi.soLuong <= 1) return
      phuPhi.soLuong--
      this.updatePhuPhiQuantity(phuPhi)
    },

    updatePhuPhiQuantity(phuPhi) {
      if (!phuPhi || !this.selectedBooking) return

      console.log(`Cập nhật số lượng phụ phí ${phuPhi.tenPhuPhi}: ${phuPhi.soLuong}`)

      phuPhi.tongTien = phuPhi.soLuong * phuPhi.giaPhuPhi

      this.updateTotalServiceAmount()

      notification.success('Cập nhật số lượng phụ phí thành công')
    },

    removePhuPhi(phuPhi, index) {
      if (!phuPhi || !this.selectedBooking || !this.selectedBooking.phuPhis) return

      if (confirm(`Bạn có chắc chắn muốn xóa phụ phí "${phuPhi.tenPhuPhi}" không?`)) {
        console.log(`Xóa phụ phí ${phuPhi.tenPhuPhi} với ID: ${phuPhi.id}`)

        // Hiển thị trạng thái đang xóa
        notification.info('Đang xóa phụ phí...')

        // Gọi API xóa phụ phí
        import('@/Service/phuPhiChiTietService')
          .then(({ default: phuPhiChiTietService }) => {
            phuPhiChiTietService
              .deletePhuPhiChiTiet(phuPhi.id)
              .then(() => {
                // Xóa khỏi mảng hiển thị sau khi API thành công
                this.selectedBooking.phuPhis.splice(index, 1)
                // Cập nhật lại tổng tiền
                this.updateTotalServiceAmount()
                // Thông báo thành công
                notification.success('Xóa phụ phí thành công')
              })
              .catch((error) => {
                console.error('Lỗi khi xóa phụ phí:', error)
                notification.error(
                  'Xóa phụ phí thất bại: ' + (error.response?.data?.message || error.message),
                )
              })
          })
          .catch((error) => {
            console.error('Lỗi khi import service:', error)
            notification.error('Có lỗi xảy ra khi tải dịch vụ')
          })
      }
    },

    calculateActualDiscount() {
      if (!this.selectedBooking) return 0

      if (this.selectedBooking.soTienGiam && this.selectedBooking.soTienGiam > 0) {
        return this.selectedBooking.soTienGiam
      }

      if (this.selectedBooking.giaTri && this.selectedBooking.tongTien) {
        const roomTotal = Number(this.selectedBooking.tongTien) || 0
        let discount = roomTotal * (this.selectedBooking.giaTri / 100)
        return Math.min(discount, roomTotal)
      }

      return 0
    },

    addSelectedServices() {
      if (!this.selectedBooking || this.selectedServiceIds.length === 0) return

      this.isLoadingServices = true

      const existingServices = this.selectedBooking.dichVus || []

      const promises = []
      const newServices = []

      for (const id of this.selectedServiceIds) {
        const service = this.availableServices.find((s) => s.id === id)
        const quantity = service.quantity || 1

        const existingService = existingServices.find(
          (es) =>
            es.dichVuId === service.id ||
            (service.originalData && es.tenDichVu === service.originalData.tenDichVu),
        )

        if (existingService) {
          const promise = dichVuChiTietService.updateQuantity(
            existingService.id,
            existingService.soLuong + quantity,
          )
          promises.push(promise)
        } else {
          newServices.push({
            datHomeId: this.selectedBooking.id,
            dichVuId: service.id,
            soLuong: quantity,
            thoiGianSuDung: new Date().toISOString(),
            tongGia: service.price * quantity,
            ghiChu: '',
            trangThai: true,
          })
        }
      }

      if (newServices.length > 0) {
        const addNewServicesPromise = dichVuChiTietService.addMultipleDichVuChiTiet(newServices)
        promises.push(addNewServicesPromise)
      }

      // Xử lý tất cả các promise
      Promise.all(promises)
        .then(() => {
          if (newServices.length > 0 && promises.length > newServices.length) {
            notification.success('Đã thêm và cập nhật dịch vụ thành công')
          } else if (newServices.length > 0) {
            notification.success('Đã thêm dịch vụ thành công')
          } else {
            notification.success('Đã cập nhật số lượng dịch vụ thành công')
          }

          this.loadDichVuChiTiet(this.selectedBooking.id)

          this.closeAddServiceModal()
        })
        .catch((error) => {
          console.error('Lỗi khi xử lý dịch vụ:', error)
          notification.error('Có lỗi xảy ra khi xử lý dịch vụ')
        })
        .finally(() => {
          this.isLoadingServices = false
        })
    },

    loadDichVuChiTiet(datHomeId) {
      if (!datHomeId) return
      this.isLoadingServices = true
      dichVuChiTietService
        .getAllDichVuChiTietByIdDatHome(datHomeId)
        .then((response) => {
          if (response && response.data) {
            const dichVus = response.data.map((item) => ({
              id: item.id,
              dichVuId: item.dichVu.id,
              tenDichVu: item.dichVu.tenDichVu,
              giaDichVu: item.dichVu.gia,
              soLuong: item.soLuong,
              tongTien: item.tongGia,
              ghiChu: item.ghiChu,
              thoiGianSuDung: item.thoiGianSuDung,
              trangThai: item.trangThai,
            }))

            if (this.selectedBooking) {
              this.selectedBooking.dichVus = dichVus
            }

            this.updateTotalServiceAmount()
          }
        })
        .catch((error) => {
          console.error('Lỗi khi tải dịch vụ chi tiết:', error)

          if (this.selectedBooking) {
            this.selectedBooking.dichVus = []
          }
        })
        .finally(() => {
          this.isLoadingServices = false
        })
    },

    // Thêm phương thức xử lý gia hạn check-in
    async handleExtendCheckIn(bookingId) {
      if (!this.currentUser) {
        notification.warning('Bạn cần đăng nhập để thực hiện thao tác này!')
        return
      }

      // Kiểm tra chỉ cho phép gia hạn từ 12:50 ngày nhận phòng
      const now = new Date()
      const checkinDate =
        this.selectedBooking && this.selectedBooking.ngayNhanPhong
          ? new Date(this.selectedBooking.ngayNhanPhong)
          : null
      if (checkinDate) {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfCheckin = new Date(
          checkinDate.getFullYear(),
          checkinDate.getMonth(),
          checkinDate.getDate(),
        )
        if (startOfToday < startOfCheckin) {
          notification.warning(
            'Chưa đến ngày check-in. Chỉ có thể gia hạn từ 12:50 ngày nhận phòng.',
          )
          return
        }
        if (startOfToday.getTime() === startOfCheckin.getTime()) {
          const threshold = new Date(checkinDate)
          threshold.setHours(12, 50, 0, 0)
          if (now < threshold) {
            notification.warning('Chưa đến giờ gia hạn check-in (chỉ từ 12:50).')
            return
          }
        }
      }

      try {
        const userId = this.currentUser.id
        const ghiChu = 'Gia hạn thêm 2 giờ để chờ check-in'

        // Gọi API gia hạn
        const response = await extendCheckIn(bookingId, userId, ghiChu)

        // Lấy dữ liệu từ response
        if (response && response.data) {
          const { datHome, soLanGiaHan, soLanGiaHanConLai, hanCheckIn } = response.data

          // Cập nhật thông tin đơn đặt phòng
          if (datHome) {
            this.selectedBooking = datHome
          }

          // Cập nhật thông tin hiển thị gia hạn
          this.extensionInfo = {
            success: true,
            hanCheckIn: hanCheckIn ? new Date(hanCheckIn) : null,
            soLanGiaHan,
            soLanGiaHanConLai,
            tongThoiGianGiaHan: soLanGiaHan * 120,
            timeString: `${soLanGiaHan * 2} giờ`,
          }

          // Cập nhật danh sách đơn hàng
          await this.fetchBookings()
          notification.success('Đã gia hạn check-in thành công!')
        }
      } catch (error) {
        console.error('Lỗi khi gia hạn check-in:', error)
        this.extensionInfo = {
          success: false,
          error: error.response?.data || 'Đã xảy ra lỗi khi gia hạn check-in',
        }
        notification.error(error.response?.data || 'Đã xảy ra lỗi khi gia hạn check-in')
      }
    },

    // Format datetime for display
    formatDateTime(datetimeString) {
      if (!datetimeString) return 'N/A'
      const datetime = new Date(datetimeString)
      return datetime.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    },

    closeAddSurchargeModal() {
      this.showAddSurchargeModal = false
      this.resetSurchargeSelection()
    },

    resetSurchargeSelection() {
      this.availableSurcharges.forEach((surcharge) => {
        surcharge.selected = false
        surcharge.quantity = 0
      })
      this.selectedSurchargeIds = []
      this.surchargeQuantities = {}
    },

    onSurchargeSelectionChange(surcharge) {
      if (surcharge.selected) {
        if (!this.selectedSurchargeIds.includes(surcharge.id)) {
          this.selectedSurchargeIds.push(surcharge.id)
        }
        if (surcharge.quantity < 1) {
          surcharge.quantity = 1
        }
      } else {
        const index = this.selectedSurchargeIds.indexOf(surcharge.id)
        if (index > -1) {
          this.selectedSurchargeIds.splice(index, 1)
        }
      }

      console.log('Phụ phí đã chọn:', this.selectedSurchargeIds)
    },

    incrementSurchargeQuantity(surcharge) {
      if (surcharge.quantity < 99) {
        surcharge.quantity++
      }
    },

    decrementSurchargeQuantity(surcharge) {
      if (surcharge.quantity > 1) {
        surcharge.quantity--
      }
    },

    onSurchargeQuantityChange(surcharge) {
      if (surcharge.quantity < 1) {
        surcharge.quantity = 1
      } else if (surcharge.quantity > 99) {
        surcharge.quantity = 99
      }
    },

    calculateSelectedSurchargeTotal() {
      if (!this.availableSurcharges || this.availableSurcharges.length === 0) {
        return 0
      }
      return this.availableSurcharges
        .filter((surcharge) => surcharge.selected)
        .reduce((total, surcharge) => {
          return total + surcharge.price * surcharge.quantity
        }, 0)
    },

    addSelectedSurcharges() {
      if (!this.selectedBooking || this.selectedSurchargeIds.length === 0) return

      this.isLoadingPhuPhi = true

      import('@/Service/phuPhiChiTietService')
        .then(({ default: phuPhiChiTietService }) => {
          const phuPhiChiTietDtos = this.selectedSurchargeIds.map((id) => {
            const surcharge = this.availableSurcharges.find((s) => s.id === id)
            return {
              datHomeId: this.selectedBooking.id,
              phuPhiId: surcharge.id,
              thoiGianApDung: new Date().toISOString(),
              moTa: `Thêm phụ phí ${surcharge.name} từ modal`,
              trangThai: true,
            }
          })

          phuPhiChiTietService
            .addMultiplePhuPhiChiTiet(phuPhiChiTietDtos)
            .then(() => {
              notification.success('Đã thêm phụ phí thành công')
              this.loadPhuPhiChiTiet(this.selectedBooking.id)
              this.closeAddSurchargeModal()
            })
            .catch((error) => {
              console.error('Lỗi khi thêm phụ phí:', error)
              notification.error('Có lỗi xảy ra khi thêm phụ phí')
            })
            .finally(() => {
              this.isLoadingPhuPhi = false
            })
        })
        .catch((error) => {
          console.error('Lỗi khi import service:', error)
          notification.error('Có lỗi xảy ra khi tải dịch vụ')
          this.isLoadingPhuPhi = false
        })
    },

    loadPhuPhiChiTiet(datHomeId) {
      if (!datHomeId) return
      this.isLoadingPhuPhi = true
      import('@/Service/phuPhiChiTietService')
        .then(({ default: phuPhiChiTietService }) => {
          phuPhiChiTietService
            .getPhuPhiChiTietByDatHomeId(datHomeId)
            .then((response) => {
              if (response && response.data) {
                const phuPhis = response.data.map((item) => ({
                  id: item.id,
                  phuPhiId: item.phuPhiId,
                  tenPhuPhi: item.tenPhuPhi,
                  giaPhuPhi: item.giaTri,
                  thoiGianApDung: item.thoiGianApDung,
                  moTa: item.moTa,
                  trangThai: item.trangThai,
                }))
                if (this.selectedBooking) {
                  this.selectedBooking.phuPhis = phuPhis
                }
              }
            })
            .catch((error) => {
              console.error('Lỗi khi tải phụ phí chi tiết:', error)
              if (this.selectedBooking) {
                this.selectedBooking.phuPhis = []
              }
            })
            .finally(() => {
              this.isLoadingPhuPhi = false
            })
        })
        .catch((error) => {
          console.error('Lỗi khi import service:', error)
          this.isLoadingPhuPhi = false
        })
    },
  },
}
</script>

<style scoped>
.dathome-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Statistics Cards */
.stats-cards {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stat-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease;
  flex: 1;
  min-width: 180px;
  margin-bottom: 15px;
  border: none;
  text-align: center;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(78, 115, 223, 0.4);
  transition: all 0.3s ease;
  animation: hueRotate 5s infinite linear;
}

@keyframes hueRotate {
  0% {
    filter: hue-rotate(0deg);
  }

  100% {
    filter: hue-rotate(360deg);
  }
}

@keyframes shadowRainbow {
  0% {
    box-shadow: 0 8px 25px rgba(255, 0, 0, 0.5) !important;
  }

  14% {
    box-shadow: 0 8px 25px rgba(255, 127, 0, 0.5) !important;
  }

  28% {
    box-shadow: 0 8px 25px rgba(255, 255, 0, 0.5) !important;
  }

  42% {
    box-shadow: 0 8px 25px rgba(0, 255, 0, 0.5) !important;
  }

  56% {
    box-shadow: 0 8px 25px rgba(0, 0, 255, 0.5) !important;
  }

  70% {
    box-shadow: 0 8px 25px rgba(75, 0, 130, 0.5) !important;
  }

  84% {
    box-shadow: 0 8px 25px rgba(148, 0, 211, 0.5) !important;
  }

  100% {
    box-shadow: 0 8px 25px rgba(255, 0, 0, 0.5) !important;
  }
}

.card-front {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.stat-card h2 {
  color: #555;
  font-size: 0.95rem;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  text-align: center;
  width: 100%;
  padding: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.card-details {
  margin-top: 15px;
  opacity: 1;
  text-align: center;
}

.card-details p {
  margin: 10px 0;
  font-size: 0.85rem;
  color: #777;
}

.progress-bar {
  height: 6px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 10px;
}

.progress {
  height: 100%;
  background-color: #4e73df;
  transition: width 0.5s ease;
}

/* Hiệu ứng hover đơn giản chỉ thay đổi viền */

/* Card colors */
.stat-card:nth-child(1) .stat-icon {
  color: #4e73df;
}

.stat-card:nth-child(2) .stat-icon {
  color: #f6c23e;
}

.stat-card:nth-child(3) .stat-icon {
  color: #36b9cc;
}

.stat-card:nth-child(4) .stat-icon {
  color: #1cc88a;
}

.stat-card:nth-child(5) .stat-icon {
  color: #4e73df;
}

.stat-card:nth-child(6) .stat-icon {
  color: #e74a3b;
}

.stat-card:nth-child(7) .stat-icon {
  color: #5a5c69;
}

/* View Toggle Buttons */
.view-toggle-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  gap: 12px;
}

.view-toggle-container {
  animation: toggle-fade-in 0.6s ease forwards;
  animation-delay: 0.4s;
  opacity: 0;
}

@keyframes toggle-fade-in {
  to {
    opacity: 1;
  }
}

.view-toggle-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 14px;
  background-color: #f8f9fa;
  color: #555;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow:
    rgba(0, 0, 0, 0.08) 0px 2px 5px,
    rgba(0, 0, 0, 0.03) 0px 0px 0px 1px;
  position: relative;
  overflow: hidden;
  min-width: 130px;
  justify-content: center;
}

.view-toggle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.3) 0%, rgba(78, 115, 223, 0) 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.view-toggle-btn.active {
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  color: white;
  box-shadow:
    rgba(0, 0, 0, 0.12) 0px 4px 12px,
    inset 0px 2px 5px rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.view-toggle-btn.active::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
  opacity: 1;
}

.view-toggle-btn:hover:not(.active) {
  transform: translateY(-4px);
  box-shadow: rgba(0, 0, 0, 0.12) 0px 6px 14px;
}

.view-toggle-btn:hover::before {
  opacity: 1;
}

.btn-icon {
  font-size: 1.1rem;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.view-toggle-btn:hover .btn-icon {
  transform: scale(1.3) rotate(15deg);
}

.view-toggle-btn.active .btn-icon {
  animation: icon-bounce 0.8s ease;
}

@keyframes icon-bounce {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.4);
  }
}

/* Action buttons */
.action-btn {
  padding: 8px;
  border: none;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  margin-right: 5px;
  transition: all 0.2s ease;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 3px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 10px;
}

.view-btn {
  color: #2196f3;
}

.edit-btn {
  color: #ff9800;
}

.history-btn {
  color: #8e24aa;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
}

.history-btn span {
  font-size: 0.85rem;
}

.action-btn:hover svg {
  transform: scale(1.2);
}

/* Modal action buttons */
.booking-actions {
  display: flex;
  justify-content: flex-start;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.action-button {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 4px 12px,
    0 1px 2px rgba(0, 0, 0, 0.08);
  min-width: 150px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  margin-right: 8px;
  letter-spacing: 0.5px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0) 100%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  z-index: -1;
}

.confirm-btn {
  background: linear-gradient(135deg, #36b9cc 0%, #1a8a98 100%);
  color: white;
}

.cancel-btn {
  background: linear-gradient(135deg, #e74a3b 0%, #c23321 100%);
  color: white;
}

.action-button:hover {
  transform: translateY(-3px);
  box-shadow:
    rgba(0, 0, 0, 0.15) 0px 8px 15px,
    0 2px 3px rgba(0, 0, 0, 0.1);
}

.action-button:hover::before {
  transform: translateX(100%);
}

.action-button:active {
  transform: translateY(-1px);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 5px;
}

.booking-actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: auto;
  margin-bottom: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 20px;
  animation: fade-in 0.5s ease forwards;
  position: sticky;
  bottom: 0;
  background-color: white;
  width: 100%;
  z-index: 100;
  box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.05);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes button-entrance {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Main Content Section */
.content-section {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: rgba(17, 12, 46, 0.1) 0px 10px 20px 0px;
  min-height: 500px;
  /* Ensure consistent height */
  position: relative;
  /* For positioning the pagination */
  padding-bottom: 80px;
  /* Space for the pagination */
  transition: all 0.3s ease;
}

.section-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 24px;
  font-weight: 700;
  position: relative;
  padding-bottom: 10px;
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

/* Table styling */
.table-container {
  overflow-x: auto;
  margin-bottom: 10px;
  border-radius: 12px;
  box-shadow: rgba(17, 12, 46, 0.05) 0px 5px 15px 0px;
}

.bookings-detail-view h2 {
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
  font-size: 1.4rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.bookings-detail-view .section-header h2 {
  margin-bottom: 0;
  flex: 1;
  color: #333;
  font-weight: 600;
  font-size: 1.4rem;
}

.bookings-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  overflow: hidden;
}

.bookings-table th,
.bookings-table td {
  padding: 14px 18px;
  text-align: center;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.bookings-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
  position: relative;
  border-top: 1px solid #eee;
  border-bottom: 2px solid #4e73df;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.bookings-table tr {
  transition: all 0.2s ease;
}

.bookings-table tbody tr:hover {
  background-color: #f8f9fa;
  transform: scale(1.005);
  box-shadow: rgba(17, 12, 46, 0.05) 0px 3px 10px 0px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
  text-align: center;
  min-width: 100px;
  box-shadow: rgba(17, 12, 46, 0.05) 0px 2px 5px 0px;
}

/* Pagination */
.pagination-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background-color: white;
  border-top: 1px solid #eee;
  border-radius: 0 0 16px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: rgba(17, 12, 46, 0.03) 0px -5px 10px 0px;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination-note {
  font-size: 0.8rem;
  color: #939ba2;
  font-style: italic;
  margin-left: 5px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.page-item {
  list-style: none;
}

.page-link {
  padding: 8px 14px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  color: #4e73df;
  background-color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  box-shadow: rgba(17, 12, 46, 0.05) 0px 2px 5px 0px;
}

.page-link:hover {
  background-color: #f8f9fc;
  color: #2e59d9;
  transform: translateY(-2px);
  box-shadow: rgba(17, 12, 46, 0.1) 0px 4px 10px 0px;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  color: white;
  border-color: #4e73df;
  box-shadow: rgba(17, 12, 46, 0.1) 0px 4px 10px 0px;
  transform: translateY(-2px);
}

/* Empty row styling */
.empty-row td {
  border-bottom: 1px solid #eee;
  padding: 14px 18px;
  height: 59px;
  /* Match the height of regular rows */
  font-size: 0;
  color: transparent;
  position: relative;
  overflow: hidden;
}

.empty-row:hover {
  background-color: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

/* Thêm style cho modal chi tiết */
.booking-details {
  padding: 10px;
  overflow-y: visible;
}

.booking-info-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.booking-section {
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  word-wrap: break-word;
}

.booking-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.booking-section h3 {
  margin-bottom: 15px;
  color: #4e73df;
  font-size: 1.1rem;
  position: relative;
  padding-left: 15px;
  font-weight: 600;
}

.booking-section h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 20px;
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  border-radius: 3px;
}

.booking-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
  right: 0;
  border-radius: 0 0 18px 18px;
  z-index: 50;
}

.action-button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.confirm-btn {
  background-color: #1cc88a;
  color: white;
}

.cancel-btn {
  background-color: #e74a3b;
  color: white;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #6c757d;
}

/* Status badges thêm màu */
.status-completed {
  background-color: rgba(78, 115, 223, 0.1);
  color: #4e73df;
}

.status-cancelled {
  background-color: rgba(133, 135, 150, 0.1);
  color: #858796;
}

.status-deposit {
  background-color: rgba(54, 185, 204, 0.1);
  color: #36b9cc;
}

.status-check-out {
  background-color: rgba(142, 68, 173, 0.1);
  color: #8e44ad;
}

/* Form control styles */
.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.form-control {
  display: block;
  width: 100%;
  padding: 1px 12px;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

textarea.form-control {
  resize: vertical;
}

.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #a1c0ff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
}

/* Calendar container */
.calendar-container {
  height: 100%;
  min-height: 500px;
}

/* Calendar customization */
:deep(.fc) {
  max-width: 100%;
  margin: 0 auto;
}

:deep(.fc .fc-daygrid-day) {
  height: 100px;
}

:deep(.fc .fc-timegrid-slot) {
  height: 50px;
}

:deep(.fc-button) {
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  box-shadow: rgba(17, 12, 46, 0.1) 0px 4px 10px 0px;
  transition: all 0.3s ease;
}

:deep(.fc-button:hover) {
  background: linear-gradient(135deg, #3a57c2 0%, #304ba9 100%);
  transform: translateY(-2px);
}

:deep(.fc-daygrid-day-number) {
  font-size: 1rem;
  font-weight: 500;
}

/* Tùy chỉnh hiển thị sự kiện trên lịch */
:deep(.fc-event) {
  border-radius: 6px;
  padding: 2px 4px;
  margin-bottom: 2px;
  overflow: hidden;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

:deep(.fc-event:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

:deep(.fc-event-title) {
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1px 0;
}

:deep(.fc-event-time) {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Tùy chỉnh hiển thị ngày trong lịch */
:deep(.fc-day-today) {
  background-color: rgba(78, 115, 223, 0.05) !important;
}

:deep(.fc-day-past) {
  opacity: 0.85;
}

:deep(.fc-day-future) {
  background-color: rgba(255, 255, 255, 0.7);
}

:deep(.tippy-box) {
  background-color: white;
  color: #333;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  border: 1px solid #eee;
}

:deep(.tippy-arrow) {
  color: white;
}

/* Bookings Detail View */
.bookings-detail-view {
  width: 100%;
  position: relative;
  height: 100%;
}

/* Status badges */
.status-confirmed,
.status-DaXacNhan {
  background-color: #e8f5e9;
  color: #1b5e20;
  border: 1px solid #a5d6a7;
}

.status-pending,
.status-ChoXacNhan {
  background-color: #fff3e0;
  color: #e65100;
  border: 1px solid #ffcc80;
}

.status-in-progress,
.status-DaCheckIn {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.status-deposit,
.status-DaCoc {
  background-color: #e0f7fa;
  color: #006064;
  border: 1px solid #80deea;
}

.status-completed,
.status-HoanThanh {
  background-color: #e1f5fe;
  color: #01579b;
  border: 1px solid #81d4fa;
}

.status-cancelled,
.status-DaHuy {
  background-color: #efebe9;
  color: #3e2723;
  border: 1px solid #bcaaa4;
}

.status-check-out,
.status-DaCheckOut {
  background-color: #f3e5f5;
  color: #4a148c;
  border: 1px solid #ce93d8;
}

.status-new {
  background-color: #e1f5fe;
  color: #0288d1;
  border: 1px solid #81d4fa;
}

/* Modal */
.booking-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.booking-modal {
  animation: modal-backdrop-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.modal-content {
  background-color: white;
  padding: 0;
  border-radius: 18px;
  width: 95%;
  max-width: 1550px;
  position: relative;
  height: 95vh;
  max-height: 95vh;
  overflow-y: auto;
  margin: 20px auto;
  box-shadow:
    rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
  animation: modal-slide-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  transform-origin: center top;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(78, 115, 223, 0.5) rgba(0, 0, 0, 0.05);
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0 18px 18px 0;
}

.modal-content::-webkit-scrollbar-thumb {
  background-color: rgba(78, 115, 223, 0.5);
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.05);
}

@keyframes modal-backdrop-in {
  from {
    backdrop-filter: blur(0px);
    background-color: rgba(0, 0, 0, 0);
  }

  to {
    backdrop-filter: blur(5px);
    background-color: rgba(0, 0, 0, 0.6);
  }
}

@keyframes modal-slide-in {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(0.95);
  }

  70% {
    opacity: 1;
    transform: translateY(10px) scale(1.02);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 30px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #f8f9fc 0%, #f0f4ff 100%);
  border-radius: 18px 18px 0 0;
  position: relative;
  overflow: hidden;
  animation: header-slide-in 0.6s ease-out forwards;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
  z-index: 1;
  pointer-events: none;
}

@keyframes header-slide-in {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.header-left {
  display: flex;
  flex-direction: column;
}

.modal-title {
  font-size: 1.5rem;
  margin: 0;
  color: #333;
  font-weight: 600;
}

.booking-id {
  color: #6c757d;
  font-size: 0.95rem;
  margin-top: 5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.modal-status .status-badge,
.modal-status .status-badge-card,
.modal-status .status-pending,
.modal-status .status-confirmed,
.modal-status .status-deposit,
.modal-status .status-in-progress,
.modal-status .status-check-out,
.modal-status .status-completed,
.modal-status .status-cancelled {
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  border-left: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  font-size: 0.7rem;
  animation: pulse-status 1.5s infinite;
}

@keyframes pulse-status {
  0% {
    opacity: 0.5;
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    transform: scale(1.2);
  }

  100% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.close-btn {
  font-size: 1.3rem;
  cursor: pointer;
  z-index: 10;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  color: #666;
  position: relative;
  overflow: hidden;
}

.close-btn::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(231, 74, 59, 0.8) 0%, rgba(231, 74, 59, 0) 70%);
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.close-btn i {
  position: relative;
  z-index: 2;
}

.close-btn:hover {
  background-color: #e74a3b;
  color: white;
  transform: rotate(180deg);
  box-shadow: 0 0 15px rgba(231, 74, 59, 0.5);
}

.close-btn:hover::before {
  transform: scale(1.5);
  opacity: 0;
}

/* Booking details */
.booking-details {
  padding: 2 0px 25px 0px;
  overflow-y: visible;
}

/* Two-column layout */
.modal-columns {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.modal-column {
  flex: 1;
}

.booking-section {
  margin-bottom: 25px;
  border-radius: 16px;
  padding: 24px;
  box-shadow:
    rgba(50, 50, 93, 0.1) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.05) 0px 8px 16px -8px;
  background-color: #fff;
  position: relative;
  border: 1px solid #f0f0f0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: section-fade-in 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.booking-section:hover {
  box-shadow:
    rgba(50, 50, 93, 0.15) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.1) 0px 8px 16px -8px;
  border-color: rgba(78, 115, 223, 0.2);
}

@keyframes section-fade-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.customer-section {
  animation-delay: 0.1s;
}

.booking-info-section {
  animation-delay: 0.2s;
}

.payment-section {
  animation-delay: 0.3s;
}

.status-section {
  animation-delay: 0.4s;
}

.section-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 18px;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.section-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.2) 0%, rgba(78, 115, 223, 0.05) 100%);
  z-index: 1;
  border-radius: 18px;
}

.section-icon i {
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: icon-float 3s ease infinite;
}

.customer-section .section-icon {
  background: linear-gradient(135deg, rgba(28, 200, 138, 0.1) 0%, rgba(28, 200, 138, 0.05) 100%);
  box-shadow: 0 8px 15px rgba(28, 200, 138, 0.1);
}

.customer-section .section-icon i {
  background: linear-gradient(135deg, #1cc88a 0%, #16a678 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.booking-info-section .section-icon {
  background: linear-gradient(135deg, rgba(54, 185, 204, 0.1) 0%, rgba(54, 185, 204, 0.05) 100%);
  box-shadow: 0 8px 15px rgba(54, 185, 204, 0.1);
}

.booking-info-section .section-icon i {
  background: linear-gradient(135deg, #36b9cc 0%, #2a8c9a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.payment-section .section-icon {
  background: linear-gradient(135deg, rgba(246, 194, 62, 0.1) 0%, rgba(246, 194, 62, 0.05) 100%);
  box-shadow: 0 8px 15px rgba(246, 194, 62, 0.1);
}

.payment-section .section-icon i {
  background: linear-gradient(135deg, #f6c23e 0%, #dfa82b 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.action-section .section-icon {
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.1) 0%, rgba(78, 115, 223, 0.05) 100%);
  box-shadow: 0 8px 15px rgba(78, 115, 223, 0.1);
}

.action-section .section-icon i {
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-section .section-icon {
  background: linear-gradient(135deg, rgba(231, 74, 59, 0.1) 0%, rgba(231, 74, 59, 0.05) 100%);
  box-shadow: 0 8px 15px rgba(231, 74, 59, 0.1);
}

.status-section .section-icon i {
  background: linear-gradient(135deg, #e74a3b 0%, #cf372a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes icon-float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

.booking-section:hover .section-icon {
  transform: scale(1.05);
}

.section-content {
  flex: 1;
}

.booking-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  position: relative;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

/* Info items styling */
.info-item,
.payment-item {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.info-label,
.payment-label {
  color: #6c757d;
  font-weight: 500;
  font-size: 0.9rem;
}

.info-value,
.payment-value {
  font-weight: 500;
  color: #333;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

/* Date display */
.date-box {
  margin-top: 15px;
}

.date-range-box {
  display: flex;
  align-items: center;
  background-color: #f8f9fc;
  border-radius: 12px;
  padding: 15px;
  margin-top: 10px;
}

.date-range-item {
  flex: 1;
  text-align: center;
}

.range-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.range-value {
  font-weight: 600;
  color: #333;
}

.date-arrow {
  color: #adb5bd;
  padding: 0 10px;
}

/* Payment section */
.payment-summary {
  background-color: #f8f9fc;
  border-radius: 12px;
  padding: 15px;
}

.payment-item {
  padding: 8px 0;
}

.payment-divider {
  height: 1px;
  background-color: #dee2e6;
  margin: 10px 0;
}

.discount {
  color: #e74a3b;
}

.deposit {
  color: #36b9cc;
}

.total {
  font-weight: 700;
}

.total-value {
  color: #4e73df;
  font-size: 1.1rem;
}

/* Styles cho phần dịch vụ */
.service-section {
  margin-top: 15px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow:
    rgba(50, 50, 93, 0.1) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.05) 0px 8px 16px -8px;
  border: 1px solid #f0f0f0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: section-fade-in 0.6s ease-out forwards;
  animation-delay: 0.35s;
  opacity: 0;
  transform: translateY(20px);
}

.service-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  position: relative;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.service-loading,
.service-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 12px;
  color: #6c757d;
  gap: 10px;
  border: 1px dashed #dee2e6;
}

.service-loading i {
  font-size: 2.5rem;
  color: #4e73df;
  margin-bottom: 5px;
}

.service-empty i {
  font-size: 2.5rem;
  color: #adb5bd;
}

.service-empty p {
  font-size: 1rem;
  margin: 0;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.service-item:hover {
  background-color: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border-color: rgba(78, 115, 223, 0.2);
}

.service-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.service-name {
  font-weight: 600;
  color: #344054;
  font-size: 1rem;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6c757d;
  font-size: 0.9rem;
}

.service-quantity {
  font-weight: 500;
}

.service-price {
  color: #0071c2;
}

.service-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f0f7ff;
  border-radius: 8px;
  padding: 4px 8px;
}

.quantity-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background-color: white;
  color: #4e73df;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.quantity-btn:hover {
  background-color: #4e73df;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.quantity-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.quantity-value {
  font-weight: 600;
  color: #344054;
  min-width: 20px;
  text-align: center;
}

.delete-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: #fff0f0;
  color: #e74a3b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: #e74a3b;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.service-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #e7f5ff;
  border-radius: 10px;
  margin-top: 10px;
}

.service-total-label {
  font-weight: 600;
  color: #344054;
}

.service-total-value {
  font-weight: 700;
  color: #0071c2;
  font-size: 1.2rem;
}

/* Styles cho header service */
.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

/* Styles cho tabs */
.service-tabs {
  display: flex;
  gap: 5px;
}

.service-tab {
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
  color: #6c757d;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.service-tab i {
  font-size: 1.1rem;
}

.service-tab:hover {
  color: #4e73df;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.service-tab.active {
  color: #4e73df;
  border-bottom-color: #4e73df;
}

.service-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #4e73df;
  border-radius: 3px 3px 0 0;
}

/* Styles cho nút thêm */
.service-action-buttons {
  display: flex;
  gap: 10px;
}

.btn-add-service,
.btn-add-surcharge {
  background-color: #4e73df;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-add-service:hover,
.btn-add-surcharge:hover {
  background-color: #375bcb;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-add-service:active,
.btn-add-surcharge:active {
  transform: translateY(0);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
}

.btn-add-service i,
.btn-add-surcharge i {
  font-size: 0.85rem;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

/* Empty row styling */
.empty-row td {
  border-bottom: 1px solid #eee;
  padding: 14px 18px;
  height: 59px;
  /* Match the height of regular rows */
  font-size: 0;
  color: transparent;
  position: relative;
  overflow: hidden;
}

/* Form styling */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: rgba(17, 12, 46, 0.03) 0px 2px 5px 0px;
  background-color: #f8f9fa;
}

.form-control:focus {
  border-color: #4e73df;
  outline: none;
  box-shadow: rgba(78, 115, 223, 0.15) 0px 0px 0px 3px;
  background-color: #fff;
}

.form-control::placeholder {
  color: #aab0b6;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

.form-select {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23495057' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 15px;
}

/* Note box */
.note-box {
  padding: 15px;
  border-radius: 12px;
  background-color: rgba(255, 253, 231, 0.5);
  border: 1px solid rgba(255, 160, 0, 0.2);
  margin-bottom: 20px;
  position: relative;
}

.note-box::before {
  content: '📝';
  position: absolute;
  left: 15px;
  top: 15px;
  font-size: 1.2rem;
}

.note-box textarea {
  border: none;
  background: transparent;
  width: 100%;
  padding: 0 0 0 35px;
  min-height: 80px;
  resize: vertical;
}

.note-box textarea:focus {
  outline: none;
}

/* Status change form */
.status-form {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fc 0%, #ffffff 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  box-shadow: rgba(17, 12, 46, 0.03) 0px 2px 5px 0px;
}

.status-form h3 {
  margin-bottom: 20px;
  color: #4e73df;
  position: relative;
  padding-left: 15px;
  font-weight: 600;
}

.status-form h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 20px;
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  border-radius: 3px;
}

/* Loading animation */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(78, 115, 223, 0.2);
  border-top-color: #4e73df;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive design */
@media (max-width: 992px) {
  .stats-cards {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .stat-card {
    min-width: calc(33.333% - 10px);
    margin-bottom: 15px;
  }

  .view-toggle-container {
    margin-bottom: 15px;
  }
}

@media (max-width: 768px) {
  .stat-card {
    min-width: calc(50% - 10px);
  }

  .modal-content {
    width: 95%;
    padding: 20px;
  }

  .booking-info-row {
    flex-direction: column;
  }

  .booking-section {
    width: 100%;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .page-link {
    min-width: 30px;
    padding: 6px 10px;
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .stat-card {
    min-width: 100%;
  }

  .stats-cards {
    flex-direction: column;
  }

  .view-toggle-container {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .view-toggle-btn {
    width: 100%;
    justify-content: center;
  }

  .pagination {
    gap: 3px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 10px;
  }

  .pagination-info {
    text-align: center;
  }
}

/* Animated elements */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-cards .stat-card {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}

.stats-cards .stat-card:nth-child(1) {
  animation-delay: 0.1s;
}

.stats-cards .stat-card:nth-child(2) {
  animation-delay: 0.2s;
}

.stats-cards .stat-card:nth-child(3) {
  animation-delay: 0.3s;
}

.stats-cards .stat-card:nth-child(4) {
  animation-delay: 0.4s;
}

.stats-cards .stat-card:nth-child(5) {
  animation-delay: 0.5s;
}

.stats-cards .stat-card:nth-child(6) {
  animation-delay: 0.6s;
}

.stats-cards .stat-card:nth-child(7) {
  animation-delay: 0.7s;
}

.section-title {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Hover effects */
.bookings-table tbody tr {
  position: relative;
  z-index: 1;
}

.bookings-table tbody tr::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0%;
  height: 2px;
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  transition: width 0.3s ease;
  z-index: -1;
}

.bookings-table tbody tr:hover::after {
  width: 100%;
}

/* Card View Styling */
.booking-cards-section {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: rgba(17, 12, 46, 0.1) 0px 10px 20px 0px;
  min-height: 500px;
  margin-top: 30px;
}

.cards-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  position: relative;
  padding-left: 15px;
  border-left: 4px solid #4e73df;
}

.booking-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.booking-card {
  background-color: white;
  border-radius: 14px;
  box-shadow:
    rgba(0, 0, 0, 0.05) 0px 2px 10px,
    rgba(0, 0, 0, 0.02) 0px 0px 0px 1px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  border: 1px solid transparent;
  width: calc(25% - 15px);
  position: relative;
  animation: card-fade-in 0.6s ease forwards;
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.booking-card:nth-child(1) {
  animation-delay: 0.1s;
}

.booking-card:nth-child(2) {
  animation-delay: 0.2s;
}

.booking-card:nth-child(3) {
  animation-delay: 0.3s;
}

.booking-card:nth-child(4) {
  animation-delay: 0.4s;
}

.booking-card:nth-child(5) {
  animation-delay: 0.5s;
}

.booking-card:nth-child(6) {
  animation-delay: 0.6s;
}

.booking-card:nth-child(7) {
  animation-delay: 0.7s;
}

.booking-card:nth-child(8) {
  animation-delay: 0.8s;
}

.booking-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.1) 0%, rgba(255, 255, 255, 0) 50%);
  opacity: 0;
  transition: all 0.5s ease;
  z-index: 1;
  pointer-events: none;
}

.booking-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    rgba(50, 50, 93, 0.15) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.1) 0px 8px 16px -8px;
  border-color: rgba(78, 115, 223, 0.3);
}

.booking-card:hover::before {
  opacity: 1;
}

@keyframes card-fade-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-booking-code {
  font-weight: 600;
  font-size: 1rem;
  color: #666;
}

.status-badge-card {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 20px;
  font-weight: 500;
  display: inline-block;
  text-align: center;
}

.card-body {
  padding: 0 15px 15px;
}

.card-customer,
.card-homestay {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-customer i,
.card-homestay i {
  width: 20px;
  color: #6c757d;
}

.card-customer span,
.card-homestay span {
  font-weight: 500;
  font-size: 0.95rem;
  color: #333;
}

.card-dates {
  margin-top: 15px;
}

.date-range {
  display: flex;
  align-items: center;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #495057;
  flex: 1;
}

.date-item i {
  color: #6c757d;
}

.date-arrow {
  padding: 0 15px;
  color: #6c757d;
}

.card-pagination {
  margin-top: 10px;
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
}

.card-nav {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.card-nav .pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.active-page {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4e73df;
  color: white;
  border-radius: 5px;
  font-weight: 600;
}

.prev-btn,
.next-btn {
  list-style: none;
}

.prev-btn a,
.next-btn a {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #666;
  border-radius: 5px;
}

.prev-btn a:hover,
.next-btn a:hover {
  background-color: #ddd;
}

.prev-btn.disabled a,
.next-btn.disabled a {
  opacity: 0.5;
  cursor: default;
}

@media (max-width: 1400px) {
  .booking-card {
    width: calc(33.333% - 15px);
  }
}

@media (max-width: 992px) {
  .booking-card {
    width: calc(50% - 10px);
  }
}

@media (max-width: 768px) {
  .booking-card {
    width: 100%;
  }
}

/* Card Load More */
.card-load-more {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.card-load-more {
  position: relative;
  animation: load-more-fade-in 0.8s ease forwards;
  animation-delay: 1s;
  opacity: 0;
}

@keyframes load-more-fade-in {
  to {
    opacity: 1;
  }
}

.load-more-btn {
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 14px 32px;
  font-size: 1.05rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 5px 15px,
    inset 0px 2px 5px rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.load-more-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.5s ease;
}

.load-more-btn:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow:
    rgba(0, 0, 0, 0.15) 0px 10px 20px,
    inset 0px 2px 5px rgba(255, 255, 255, 0.4);
  letter-spacing: 0.5px;
}

.load-more-btn:hover::before {
  left: 100%;
}

.load-more-btn:active {
  transform: translateY(-2px);
}

.load-more-btn i {
  font-size: 1.2rem;
  transition: all 0.5s ease;
}

.load-more-btn:hover i {
  transform: rotate(180deg);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: rotate(180deg) scale(1);
  }

  50% {
    transform: rotate(180deg) scale(1.2);
  }

  100% {
    transform: rotate(180deg) scale(1);
  }
}

.showing-count {
  color: #6c757d;
  font-size: 0.9rem;
  text-align: center;
}

.log-table-container {
  max-height: 50vh;
  overflow-y: auto;
  margin: 15px 0;
  border-radius: 8px;
  box-shadow: rgba(17, 12, 46, 0.05) 0px 5px 15px 0px;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

.log-table th,
.log-table td {
  padding: 5px 15px;
  text-align: center;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.log-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 2px solid #4e73df;
}

.log-table tbody tr:nth-child(odd) {
  background-color: #f8f9fa;
}

.log-table tbody tr:hover {
  background-color: #edf2f7;
}

.no-logs {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.no-logs i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #adb5bd;
}

.status-change {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 10px;
}

.status-badge {
  padding: 12px 22px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 500;
  min-width: 130px;
  text-align: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  border-left: none;
}

.status-arrow {
  color: #6c757d;
  font-size: 1.4rem;
  margin: 0 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 50%;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

/* Add box shadow to status badges in the log modal */
.log-table .status-badge {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  transition: all 0.3s ease;
}

.log-table .status-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

/* Add animation for status changes */
.log-table tr:hover .status-arrow {
  animation: pulse-arrow 1.5s infinite;
}

@keyframes pulse-arrow {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .log-table-container {
    max-height: 300px;
  }

  .log-table th,
  .log-table td {
    padding: 8px;
    font-size: 0.9rem;
  }
}

/* Specific styling for the logs modal */
.logs-modal-content {
  max-width: 1300px !important;
}

@keyframes modal-backdrop-in {
  from {
    backdrop-filter: blur(0px);
    background-color: rgba(0, 0, 0, 0);
  }

  to {
    backdrop-filter: blur(5px);
    background-color: rgba(0, 0, 0, 0.6);
  }
}

/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.payment-btn {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
}

.payment-btn:hover {
  background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
}

.payment-btn:disabled {
  background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.modal-body {
  padding: 30px;
}

.payment-info {
  text-align: center;
}

.payment-text {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 10px;
}

.payment-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #4e73df;
  margin-bottom: 20px;
}

.payment-order {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.payment-code {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.payment-actions {
  margin: 30px 0;
}

.payment-note {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
  background-color: #fff3cd;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  border-left: 4px solid #ffc107;
}

.payment-actions .action-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
}

.payment-iframe-container {
  width: 90%;
  max-width: 1100px;
  height: 75vh;
  display: flex;
  flex-direction: column;
}

.payment-iframe-body {
  flex: 1;
  padding: 0;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.payment-iframe {
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
  border-radius: 0 0 16px 16px;
}

.payment-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 15px;
}

.payment-loading i {
  font-size: 2rem;
  color: #4e73df;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.disabled-btn {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, #adb5bd 0%, #8e959c 100%) !important;
}

.payment-required-text {
  font-size: 0.8rem;
  font-style: italic;
  margin-left: 5px;
  font-weight: normal;
}

.payment-countdown {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 15px;
  border-radius: 10px 0 0 0;
  font-weight: 800;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
}

.countdown-label {
  font-size: 0.85rem;
}

.countdown-timer {
  font-size: 1rem;
  font-family: monospace;
}

.time-low {
  color: #ff6b6b;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

/* Styles cho modal chọn phương thức thanh toán */
.payment-method-modal {
  max-width: 650px;
  width: 95%;
  min-height: unset;
}

.payment-method-body {
  padding: 30px;
}

.payment-amount {
  text-align: center;
  margin-bottom: 30px;
}

.payment-amount p {
  color: #666;
  font-size: 1rem;
  margin-bottom: 10px;
}

.amount-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0071c2;
}

.payment-methods {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.payment-method-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-width: 250px;
}

.payment-method-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 113, 194, 0.3);
}

.qr-payment:hover {
  border-color: #4e73df;
}

.cash-payment:hover {
  border-color: #28a745;
}

.method-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.qr-payment .method-icon {
  color: #4e73df;
  background-color: rgba(78, 115, 223, 0.1);
}

.cash-payment .method-icon {
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
}

.method-info {
  flex: 1;
  text-align: left;
}

.method-info h4 {
  font-size: 1.1rem;
  margin: 0 0 5px 0;
  color: #333;
}

.method-info p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

/* Styles cho modal tính tiền thối */
.cash-payment-modal {
  max-width: 680px;
  width: 95%;
  min-height: unset;
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
  background-clip: text;
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
  font-size: 16px;
  font-weight: 450;
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
}

.quick-title {
  font-size: 14px;
  color: #555;
  margin-top: 0;
  margin-bottom: 15px;
  font-weight: 500;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.quick-button {
  padding: 10px 5px;
  background-color: white;
  border: 1px solid #d1e9ff;
  border-radius: 8px;
  font-size: 15px;
  color: #0071c2;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
}

.quick-button:hover {
  background-color: rgba(0, 113, 194, 0.06);
  border-color: #83c0ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary {
  background-color: #f1f3f5;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  background-color: #e9ecef;
  color: #212529;
}

.btn-primary {
  background: linear-gradient(135deg, #0071c2 0%, #0096c7 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(0, 113, 194, 0.1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 113, 194, 0.2);
}

.btn-primary:disabled {
  background: linear-gradient(135deg, #adb5bd 0%, #868e96 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 30px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  border-radius: 0 0 16px 16px;
}

/* Modal thêm dịch vụ */
.add-service-modal {
  max-width: 1200px;
  width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.add-service-modal .modal-header {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-service-modal .header-content h3 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-service-modal .header-content h3 i {
  color: #0071c2;
}

.add-service-modal .booking-info {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.add-service-modal .booking-info strong {
  color: #333;
}

.add-service-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* Search section */
.search-section {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #0071c2;
  box-shadow: 0 0 0 3px rgba(0, 113, 194, 0.1);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  color: #666;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  border-color: #0071c2;
  color: #0071c2;
}

.filter-tab.active {
  background-color: #0071c2;
  border-color: #0071c2;
  color: white;
}

/* Services container */
.services-container {
  padding: 20px 30px;
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.services-header h4 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.services-count {
  color: #666;
  font-size: 14px;
}

/* Services grid - Checkbox style */
.services-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.service-checkbox-item {
  border: 2px solid #eee;
  border-radius: 16px;
  overflow: hidden;
  background-color: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.service-checkbox-item:hover {
  border-color: #0071c2;
  box-shadow: 0 4px 20px rgba(0, 113, 194, 0.15);
  transform: translateY(-2px);
}

.service-checkbox-content {
  padding: 20px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.service-checkbox {
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
  accent-color: #0071c2;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.service-checkbox:checked {
  transform: scale(1.1);
}

.checkbox-label {
  flex: 1;
  cursor: pointer;
  margin: 0;
}

.service-main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 15px;
}

.service-name-price {
  flex: 1;
  min-width: 0;
  /* Cho phép flex shrink */
}

/* Service quantity controls - hiển thị cùng hàng */
.service-quantity-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.service-quantity-controls .quantity-controls {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  width: fit-content;
  background: white;
}

.service-quantity-controls .subtotal {
  color: #0071c2;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.service-name {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.service-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.service-price .price {
  color: #0071c2;
  font-size: 16px;
  font-weight: 700;
}

.service-price .unit {
  color: #666;
  font-size: 13px;
}

.service-category-badge {
  background-color: rgba(0, 113, 194, 0.1);
  color: #0071c2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.service-description {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  margin-bottom: 10px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 12px;
  border-radius: 50%;
}

.qty-btn:hover:not(:disabled) {
  background-color: #0071c2;
  color: white;
  border-color: #0071c2;
  transform: scale(1.1);
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 50px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  outline: none;
  background-color: white;
  margin: 0 2px;
  transition: border-color 0.3s ease;
}

.qty-input:focus {
  border-color: #0071c2;
  box-shadow: 0 0 0 2px rgba(0, 113, 194, 0.2);
}

.subtotal {
  color: #333;
  font-size: 14px;
}

.subtotal strong {
  color: #0071c2;
  font-weight: 600;
}

/* Selected state */
.service-checkbox-item:has(.service-checkbox:checked) {
  border-color: #0071c2;
  background-color: rgba(0, 113, 194, 0.05);
  box-shadow: 0 4px 20px rgba(0, 113, 194, 0.2);
  transform: translateY(-1px);
}

.service-checkbox-item:has(.service-checkbox:checked) .service-name {
  color: #0071c2;
  font-weight: 700;
}

.service-checkbox-item:has(.service-checkbox:checked) .service-price .price {
  color: #0071c2;
  font-weight: 700;
}

/* Original service card styles - keep for future reference */
.service-card {
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  background-color: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.service-card:hover {
  border-color: #0071c2;
  box-shadow: 0 4px 20px rgba(0, 113, 194, 0.1);
  transform: translateY(-2px);
}

.service-image {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.service-card:hover .service-image img {
  transform: scale(1.05);
}

.service-category {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 113, 194, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.service-content {
  padding: 15px;
}

.service-name {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.service-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.service-price {
  margin-bottom: 15px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.service-price .price {
  color: #0071c2;
  font-size: 18px;
  font-weight: 700;
}

.service-price .unit {
  color: #666;
  font-size: 13px;
}

.service-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: none;
  background-color: #f8f9fa;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.qty-btn:hover:not(:disabled) {
  background-color: #0071c2;
  color: white;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 50px;
  height: 30px;
  border: none;
  text-align: center;
  font-size: 14px;
  outline: none;
}

.add-btn {
  padding: 8px 16px;
  border: 1px solid #0071c2;
  background-color: white;
  color: #0071c2;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  min-width: 80px;
  justify-content: center;
}

.add-btn:hover {
  background-color: #0071c2;
  color: white;
}

.add-btn.added {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.add-btn.added:hover {
  background-color: #218838;
  border-color: #218838;
}

/* Loading và Empty states */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.loading-state i,
.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #ddd;
}

.loading-state i {
  color: #0071c2;
}

.empty-state h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Footer */
.add-service-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  border-top: 1px solid #eee;
  background-color: #f8f9fa;
}

.selected-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selected-count,
.total-amount {
  font-size: 14px;
  color: #666;
}

.selected-count strong,
.total-amount strong {
  color: #0071c2;
  font-weight: 600;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .add-service-modal {
    width: 95vw;
    max-height: 95vh;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    justify-content: center;
  }

  .add-service-footer {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .footer-actions {
    justify-content: center;
  }
}

.extend-btn {
  background-color: #f0ad4e;
  color: #fff;
}

.extension-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.extension-info-container {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 12px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.extension-info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.extension-label {
  font-weight: 500;
  color: #333;
}

.extension-value {
  font-weight: 600;
  color: #007bff;
}

.extension-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  padding: 12px;
  margin-top: 5px;
  font-size: 14px;
}

.auto-cancel-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  margin-top: 10px;
  width: 100%;
}

.auto-cancel-warning i {
  margin-right: 8px;
  color: #f0ad4e;
}

.booking-details-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.detail-label {
  font-weight: 600;
  color: #333;
}

.detail-value {
  font-weight: 500;
  color: #666;
}

.extension-info {
  font-size: 0.9rem;
  color: #888;
  margin-left: 10px;
}

/* Modal thêm phụ phí */
.add-surcharge-modal {
  max-width: 1200px;
  width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.add-surcharge-modal .modal-header {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-surcharge-modal .header-content h3 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-surcharge-modal .header-content h3 i {
  color: #0071c2;
}

.add-surcharge-modal .booking-info {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.add-surcharge-modal .booking-info strong {
  color: #333;
}

.add-surcharge-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* Search section */
.search-section {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #0071c2;
  box-shadow: 0 0 0 3px rgba(0, 113, 194, 0.1);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  color: #666;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  border-color: #0071c2;
  color: #0071c2;
}

.filter-tab.active {
  background-color: #0071c2;
  border-color: #0071c2;
  color: white;
}

/* Services container */
.surcharges-container {
  padding: 20px 30px;
}

.surcharges-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.surcharges-header h4 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.surcharges-count {
  color: #666;
  font-size: 14px;
}

/* Services grid - Checkbox style */
.surcharges-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.surcharge-checkbox-item {
  border: 2px solid #eee;
  border-radius: 16px;
  overflow: hidden;
  background-color: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.surcharge-checkbox-item:hover {
  border-color: #0071c2;
  box-shadow: 0 4px 20px rgba(0, 113, 194, 0.15);
  transform: translateY(-2px);
}

.surcharge-checkbox-content {
  padding: 20px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.surcharge-checkbox {
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
  accent-color: #0071c2;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.surcharge-checkbox:checked {
  transform: scale(1.1);
}

.checkbox-label {
  flex: 1;
  cursor: pointer;
  margin: 0;
}

.surcharge-main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 15px;
}

.surcharge-name-price {
  flex: 1;
  min-width: 0;
  /* Cho phép flex shrink */
}

/* Service quantity controls - hiển thị cùng hàng */
.surcharge-quantity-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.surcharge-quantity-controls .quantity-controls {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  width: fit-content;
  background: white;
}

.surcharge-quantity-controls .subtotal {
  color: #0071c2;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.surcharge-name {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.surcharge-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.surcharge-price .price {
  color: #0071c2;
  font-size: 16px;
  font-weight: 700;
}

.surcharge-price .unit {
  color: #666;
  font-size: 13px;
}

.surcharge-category-badge {
  background-color: rgba(0, 113, 194, 0.1);
  color: #0071c2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.surcharge-description {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  margin-bottom: 10px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 12px;
  border-radius: 50%;
}

.qty-btn:hover:not(:disabled) {
  background-color: #0071c2;
  color: white;
  border-color: #0071c2;
  transform: scale(1.1);
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 50px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  outline: none;
  background-color: white;
  margin: 0 2px;
  transition: border-color 0.3s ease;
}

.qty-input:focus {
  border-color: #0071c2;
  box-shadow: 0 0 0 2px rgba(0, 113, 194, 0.2);
}

.subtotal {
  color: #333;
  font-size: 14px;
}

.subtotal strong {
  color: #0071c2;
  font-weight: 600;
}

/* Selected state */
.surcharge-checkbox-item:has(.surcharge-checkbox:checked) {
  border-color: #0071c2;
  background-color: rgba(0, 113, 194, 0.05);
  box-shadow: 0 4px 20px rgba(0, 113, 194, 0.2);
  transform: translateY(-1px);
}

.surcharge-checkbox-item:has(.surcharge-checkbox:checked) .surcharge-name {
  color: #0071c2;
  font-weight: 700;
}

.surcharge-checkbox-item:has(.surcharge-checkbox:checked) .surcharge-price .price {
  color: #0071c2;
  font-weight: 700;
}

/* Original service card styles - keep for future reference */
.surcharge-card {
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  background-color: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.surcharge-card:hover {
  border-color: #0071c2;
  box-shadow: 0 4px 20px rgba(0, 113, 194, 0.1);
  transform: translateY(-2px);
}

.surcharge-image {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.surcharge-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.surcharge-card:hover .surcharge-image img {
  transform: scale(1.05);
}

.surcharge-category {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 113, 194, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.surcharge-content {
  padding: 15px;
}

.surcharge-name {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.surcharge-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.surcharge-price {
  margin-bottom: 15px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.surcharge-price .price {
  color: #0071c2;
  font-size: 18px;
  font-weight: 700;
}

.surcharge-price .unit {
  color: #666;
  font-size: 13px;
}

.surcharge-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: none;
  background-color: #f8f9fa;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.qty-btn:hover:not(:disabled) {
  background-color: #0071c2;
  color: white;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 50px;
  height: 30px;
  border: none;
  text-align: center;
  font-size: 14px;
  outline: none;
}

.add-btn {
  padding: 8px 16px;
  border: 1px solid #0071c2;
  background-color: white;
  color: #0071c2;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  min-width: 80px;
  justify-content: center;
}

.add-btn:hover {
  background-color: #0071c2;
  color: white;
}

.add-btn.added {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.add-btn.added:hover {
  background-color: #218838;
  border-color: #218838;
}

/* Loading và Empty states */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.loading-state i,
.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #ddd;
}

.loading-state i {
  color: #0071c2;
}

.empty-state h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Footer */
.add-surcharge-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  border-top: 1px solid #eee;
  background-color: #f8f9fa;
}

.selected-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selected-count,
.total-amount {
  font-size: 14px;
  color: #666;
}

.selected-count strong,
.total-amount strong {
  color: #0071c2;
  font-weight: 600;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .add-surcharge-modal {
    width: 95vw;
    max-height: 95vh;
  }

  .surcharges-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    justify-content: center;
  }

  .add-surcharge-footer {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .footer-actions {
    justify-content: center;
  }
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 350px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #4e73df;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 1px solid #e3e6f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  border-color: #4e73df;
  box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.15);
}

.filter-box {
  margin-left: 15px;
}

.status-filter {
  padding: 12px 40px 12px 15px;
  border: 1px solid #e3e6f0;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  min-width: 200px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234e73df' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.status-filter option {
  padding: 10px;
  background-color: #fff;
  color: #495057;
}

.status-filter:focus {
  border-color: #4e73df;
  outline: none;
  box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.15);
}
</style>
