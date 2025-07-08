<template>
  <div class="dathome-container">
    <h1 class="section-title">Quản lý đặt Homestay</h1>
    <!-- Statistics Cards -->
    <div class="stats-cards">
      <div class="stat-card" @mouseenter="createRipple($event)">
        <div class="card-front">
          <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
          <h2>Tổng Đặt Phòng</h2>
          <div class="stat-value">{{ totalBookings }}</div>
        </div>
        <div class="card-details">
          <p>Tổng số lượt đặt homestay</p>
          <div class="progress-bar">
            <div class="progress" :style="{ width: '100%', backgroundColor: '#4e73df' }"></div>
          </div>
        </div>
        <span class="ripple"></span>
      </div>

      <div class="stat-card" @mouseenter="createRipple($event)">
        <div class="card-front">
          <div class="stat-icon"><i class="fas fa-clock"></i></div>
          <h2>Chờ Xác Nhận</h2>
          <div class="stat-value">{{ pendingBookings }}</div>
        </div>
        <div class="card-details">
          <p>Đang chờ xác nhận</p>
          <div class="progress-bar">
            <div
              class="progress"
              :style="{ width: pendingPercent + '%', backgroundColor: '#f6c23e' }"
            ></div>
          </div>
        </div>
        <span class="ripple"></span>
      </div>

      <div class="stat-card" @mouseenter="createRipple($event)">
        <div class="card-front">
          <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
          <h2>Đã Cọc</h2>
          <div class="stat-value">{{ depositedBookings }}</div>
        </div>
        <div class="card-details">
          <p>Đã đặt cọc</p>
          <div class="progress-bar">
            <div
              class="progress"
              :style="{ width: depositedPercent + '%', backgroundColor: '#36b9cc' }"
            ></div>
          </div>
        </div>
        <span class="ripple"></span>
      </div>

      <div class="stat-card" @mouseenter="createRipple($event)">
        <div class="card-front">
          <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
          <h2>Đã Xác Nhận</h2>
          <div class="stat-value">{{ confirmedBookings }}</div>
        </div>
        <div class="card-details">
          <p>Đã xác nhận đặt phòng</p>
          <div class="progress-bar">
            <div
              class="progress"
              :style="{ width: confirmedPercent + '%', backgroundColor: '#1cc88a' }"
            ></div>
          </div>
        </div>
        <span class="ripple"></span>
      </div>

      <div class="stat-card" @mouseenter="createRipple($event)">
        <div class="card-front">
          <div class="stat-icon"><i class="fas fa-door-open"></i></div>
          <h2>Chờ Nhận</h2>
          <div class="stat-value">{{ waitingCheckinBookings }}</div>
        </div>
        <div class="card-details">
          <p>Chờ khách check-in</p>
          <div class="progress-bar">
            <div
              class="progress"
              :style="{ width: waitingCheckinPercent + '%', backgroundColor: '#4e73df' }"
            ></div>
          </div>
        </div>
        <span class="ripple"></span>
      </div>

      <div class="stat-card" @mouseenter="createRipple($event)">
        <div class="card-front">
          <div class="stat-icon"><i class="fas fa-door-closed"></i></div>
          <h2>Chờ Trả</h2>
          <div class="stat-value">{{ waitingCheckoutBookings }}</div>
        </div>
        <div class="card-details">
          <p>Chờ khách check-out</p>
          <div class="progress-bar">
            <div
              class="progress"
              :style="{ width: waitingCheckoutPercent + '%', backgroundColor: '#e74a3b' }"
            ></div>
          </div>
        </div>
        <span class="ripple"></span>
      </div>

      <div class="stat-card" @mouseenter="createRipple($event)">
        <div class="card-front">
          <div class="stat-icon"><i class="fas fa-flag-checkered"></i></div>
          <h2>Hoàn Thành</h2>
          <div class="stat-value">{{ completedBookings }}</div>
        </div>
        <div class="card-details">
          <p>Hoàn tất dịch vụ</p>
          <div class="progress-bar">
            <div
              class="progress"
              :style="{ width: completedPercent + '%', backgroundColor: '#858796' }"
            ></div>
          </div>
        </div>
        <span class="ripple"></span>
      </div>
    </div>

    <!-- View Toggle Button -->
    <div class="view-toggle-container">
      <button
        class="view-toggle-btn"
        :class="{ active: currentView === 'calendar' }"
        @click="switchToCalendarView"
      >
        <font-awesome-icon icon="fa-solid fa-calendar-alt" class="btn-icon" />
        Xem lịch
      </button>
      <button
        class="view-toggle-btn"
        :class="{ active: currentView === 'detail' }"
        @click="switchToDetailView"
      >
        <font-awesome-icon icon="fa-solid fa-list" class="btn-icon" />
        Xem chi tiết
      </button>
    </div>

    <!-- Main Content -->
    <div class="content-section">
      <!-- Calendar View -->
      <div v-show="currentView === 'calendar'" class="calendar-container">
        <div id="calendar" ref="fullCalendar"></div>
      </div>

      <!-- Detailed Bookings View -->
      <div v-show="currentView === 'detail'" class="bookings-detail-view">
        <h2>Danh sách đặt phòng</h2>
        <div class="table-container">
          <table class="bookings-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã đặt phòng</th>
                <th>Khách hàng</th>
                <th>Homestay</th>
                <th>Thời gian bắt đầu</th>
                <th>Thời gian kết thúc</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody v-if="isLoading">
              <tr>
                <td colspan="8" class="text-center">
                  <div class="loading">Đang tải dữ liệu...</div>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="(booking, index) in paginatedBookings" :key="booking.id">
                <td>{{ startItem + index }}</td>
                <td>#{{ booking.maDatHome }}</td>
                <td>{{ booking.tenKhachHang }}</td>
                <td>{{ booking.tenHomestay }}</td>
                <td>{{ formatDate(booking.ngayNhanPhong) }}</td>
                <td>{{ formatDate(booking.ngayTraPhong) }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(booking.trangThai)">
                    {{ getStatusLabel(booking.trangThai) }}
                  </span>
                </td>
                <td>
                  <button class="action-btn view-btn" @click="viewBookingDetails(booking)">
                    <font-awesome-icon icon="fa-solid fa-eye" />
                  </button>
                  <button class="action-btn edit-btn" @click="editBooking(booking)">
                    <font-awesome-icon icon="fa-solid fa-edit" />
                  </button>
                  <button class="action-btn delete-btn" @click="deleteBooking(booking.id)">
                    <font-awesome-icon icon="fa-solid fa-trash" />
                  </button>
                </td>
              </tr>
              <!-- Empty rows to always show exactly 5 rows -->
              <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
                <td colspan="8">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Fixed Pagination -->
        <div class="pagination-container">
          <div class="pagination-info">
            Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} đặt phòng
            <span class="pagination-note">(5 đặt phòng mỗi trang)</span>
          </div>
          <nav aria-label="Page navigation">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 0 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                  <i class="fas fa-chevron-left"></i>
                </a>
              </li>
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: page - 1 === currentPage }"
              >
                <a class="page-link" href="#" @click.prevent="changePage(page - 1)">{{ page }}</a>
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages - 1 || totalPages === 0 }"
              >
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                  <i class="fas fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Card View -->
      </div>
    </div>

    <!-- Card View Section -->
    <div class="booking-cards-section" v-show="currentView === 'detail'">
      <h2 class="section-title">Xem đặt phòng dạng thẻ</h2>
      <div v-if="isLoading" class="loading">Đang tải dữ liệu...</div>
      <div v-else class="booking-cards">
        <div
          v-for="booking in displayedBookings"
          :key="booking.id"
          class="booking-card"
          @click="viewBookingDetails(booking)"
        >
          <div class="card-header">
            <div class="card-booking-code">#</div>
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
                  <span>{{ formatDateDay(booking.ngayNhanPhong) }}</span>
                </div>
                <div class="date-arrow">
                  <i class="fas fa-arrow-right"></i>
                </div>
                <div class="date-item">
                  <i class="fas fa-calendar-times"></i>
                  <span>{{ formatDateDay(booking.ngayTraPhong) }}</span>
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

    <!-- Booking Details Modal (Hidden by default) -->
    <div class="booking-modal" v-if="showModal">
      <div class="modal-content">
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

        <div v-if="selectedBooking" class="booking-details">
          <div class="modal-columns">
            <div class="modal-column">
              <div class="booking-section payment-section">
                <div class="section-content">
                  <h3>Thông tin thanh toán</h3>
                  <div class="payment-summary">
                    <div class="payment-item">
                      <span class="payment-label">Giá Homestay:</span>
                      <span class="payment-value">{{
                        formatCurrency(selectedBooking.giaCaHomestay)
                      }}</span>
                    </div>
                    <div class="payment-item" v-if="selectedBooking.tenGiamGia">
                      <span class="payment-label">
                        Giảm giá ({{ selectedBooking.tenGiamGia }}):
                      </span>
                      <span class="payment-value discount"
                        >- {{ formatCurrency(selectedBooking.soTienGiam) }}</span
                      >
                    </div>
                    <div class="payment-item">
                      <span class="payment-label">Tổng tiền dịch vụ:</span>
                      <span class="payment-value">{{
                        formatCurrency(selectedBooking.tongTienDichVu)
                      }}</span>
                    </div>
                    <div class="payment-item">
                      <span class="payment-label">Số tiền cọc:</span>
                      <span class="payment-value deposit">{{
                        formatCurrency(selectedBooking.soTienCoc)
                      }}</span>
                    </div>
                    <div class="payment-divider"></div>
                    <div class="payment-item total">
                      <span class="payment-label">Tổng tiền:</span>
                      <span class="payment-value total-value">{{
                        formatCurrency(selectedBooking.tongTien)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Thêm trường ghi chú khi cập nhật trạng thái -->
              <div class="booking-section status-section" v-if="showStatusActions">
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
                    <!-- <label for="statusNote">Ghi chú:</label> -->
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
              </div>
            </div>
            <div class="modal-column">
              <div class="booking-section customer-section">
                <div class="section-content">
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
                </div>
              </div>

              <div class="booking-section booking-info-section">
                <div class="section-content">
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
                        formatDate(selectedBooking.ngayDat)
                      }}</span>
                    </div>
                    <div class="date-range-box">
                      <div class="date-range-item">
                        <span class="range-label">Check-in</span>
                        <span class="range-value">{{
                          formatDate(selectedBooking.ngayNhanPhong)
                        }}</span>
                      </div>
                      <div class="date-arrow">→</div>
                      <div class="date-range-item">
                        <span class="range-label">Check-out</span>
                        <span class="range-value">{{
                          formatDate(selectedBooking.ngayTraPhong)
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Các nút hành động -->
              <div class="booking-actions">
                <button
                  v-if="selectedBooking.trangThai === 'ChoXacNhan'"
                  class="action-button confirm-btn"
                  @click="updateBookingStatus(selectedBooking.id, 'DaCoc')"
                >
                  Đã cọc
                </button>
                <button
                  v-if="selectedBooking.trangThai === 'ChoXacNhan'"
                  class="action-button cancel-btn"
                  @click="updateBookingStatus(selectedBooking.id, 'DaHuy')"
                >
                  Hủy đặt phòng
                </button>
                <button
                  v-if="selectedBooking.trangThai === 'DaCoc'"
                  class="action-button confirm-btn"
                  @click="updateBookingStatus(selectedBooking.id, 'DaXacNhan')"
                >
                  Xác nhận đặt phòng
                </button>
                <button
                  v-if="selectedBooking.trangThai === 'DaXacNhan'"
                  class="action-button confirm-btn"
                  @click="handleCheckIn(selectedBooking.id)"
                >
                  Check-in
                </button>
                <button
                  v-if="selectedBooking.trangThai === 'DaCheckIn'"
                  class="action-button confirm-btn"
                  @click="handleCheckOut(selectedBooking.id)"
                >
                  Check-out
                </button>
                <button
                  v-if="selectedBooking.trangThai === 'DaCheckOut'"
                  class="action-button confirm-btn"
                  @click="updateBookingStatus(selectedBooking.id, 'HoanThanh')"
                >
                  Hoàn thành
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getAllDatHome,
  getDatHomeById,
  deleteDatHome,
  getDatHomeByTrangThai,
  updateStatus,
  checkIn,
  checkOut,
} from '@/Service/DatHomeService'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'DatHome',
  data() {
    return {
      showModal: false,
      bookings: [],
      currentMonth: 'July 2025',
      viewMode: 'month',
      calendar: null,
      selectedBooking: null,
      currentView: 'calendar', // 'calendar' or 'detail'
      calendarLoaded: false,
      fullCalendarLoaded: false,
      isLoading: true,
      // Thống kê
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      waitingCheckinBookings: 0,
      waitingCheckoutBookings: 0,
      depositedBookings: 0,
      completedBookings: 0,
      // Pagination
      currentPage: 0,
      itemsPerPage: 5, // Fixed at 5 items per page
      // Card view
      visibleBookingsCount: 8, // Số lượng thẻ hiển thị ban đầu
      loadMoreStep: 8, // Số lượng thẻ hiển thị thêm mỗi lần nhấn nút
      // Trạng thái mới
      statusNote: '',
      showStatusActions: false,
      // Check-in/out notes
      checkInNote: '',
      checkOutNote: '',
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
  },
  mounted() {
    this.fetchBookings()
    this.fetchStatistics()
    this.loadFullCalendarScripts().then(() => {
      this.fullCalendarLoaded = true
      this.initializeCalendar()
    })
  },
  methods: {
    createRipple(event) {
      const button = event.currentTarget
      const ripple = button.querySelector('.ripple')

      // Remove any existing animation
      ripple.style.animation = 'none'

      // Force reflow to ensure the animation gets restarted
      void ripple.offsetWidth

      // Add the animation
      ripple.style.animation = 'ripple 0.6s ease-out'
    },
    async fetchBookings() {
      try {
        this.isLoading = true
        const response = await getAllDatHome()
        this.bookings = response.data
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
        const allResponse = await getAllDatHome()
        this.totalBookings = allResponse.data.length

        // Lấy số đặt phòng chờ xác nhận
        const pendingResponse = await getDatHomeByTrangThai('ChoXacNhan')
        this.pendingBookings = pendingResponse.data.length

        // Lấy số đặt phòng đã xác nhận
        const confirmedResponse = await getDatHomeByTrangThai('DaXacNhan')
        this.confirmedBookings = confirmedResponse.data.length

        // Lấy số đặt phòng chờ check-in (đã xác nhận)
        this.waitingCheckinBookings = confirmedResponse.data.length

        // Lấy số đặt phòng chờ check-out (đã check-in)
        const waitingCheckoutResponse = await getDatHomeByTrangThai('DaCheckIn')
        this.waitingCheckoutBookings = waitingCheckoutResponse.data.length

        // Lấy số đặt phòng đã cọc
        const depositedResponse = await getDatHomeByTrangThai('DaCoc')
        this.depositedBookings = depositedResponse.data.length

        // Lấy số đặt phòng đã hoàn thành
        const completedResponse = await getDatHomeByTrangThai('HoanThanh')
        this.completedBookings = completedResponse.data.length
      } catch (error) {
        console.error('Lỗi khi tải thống kê:', error)
      }
    },

    async updateBookingStatus(id, newStatus) {
      if (!this.currentUser) {
        alert('Bạn cần đăng nhập để thực hiện thao tác này!')
        return
      }

      try {
        const userId = this.currentUser.id
        await updateStatus(id, newStatus, userId, this.statusNote)

        // Cập nhật lại dữ liệu
        await this.fetchBookings()
        await this.fetchStatistics()

        // Đóng modal và reset ghi chú
        this.showModal = false
        this.statusNote = ''
        this.showStatusActions = false
        this.checkInNote = ''
        this.checkOutNote = ''

        alert(`Cập nhật trạng thái thành công!`)
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error)
        alert('Đã xảy ra lỗi khi cập nhật trạng thái')
      }
    },

    async deleteBooking(id) {
      if (confirm('Bạn có chắc chắn muốn xóa đặt phòng này không?')) {
        try {
          await deleteDatHome(id)
          await this.fetchBookings()
          await this.fetchStatistics()
          alert('Xóa đặt phòng thành công!')
        } catch (error) {
          console.error('Lỗi khi xóa đặt phòng:', error)
          alert('Đã xảy ra lỗi khi xóa đặt phòng')
        }
      }
    },

    async viewBookingDetails(booking) {
      try {
        const response = await getDatHomeById(booking.id)
        this.selectedBooking = response.data
        this.showModal = true
        this.showStatusActions = true
      } catch (error) {
        console.error('Lỗi khi tải chi tiết đặt phòng:', error)
        alert('Đã xảy ra lỗi khi tải chi tiết đặt phòng')
      }
    },

    editBooking(booking) {
      // Chuyển đến trang chi tiết đặt phòng
      this.$router.push(`/admin/datHome-detail/${booking.id}`)
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
      const events = this.bookings.map((booking) => {
        const statusColorMap = {
          ChoXacNhan: '#f6c23e',
          DaCoc: '#36b9cc',
          DaXacNhan: '#1cc88a',
          DaCheckIn: '#e74a3b',
          DaCheckOut: '#8e44ad',
          HoanThanh: '#4e73df',
          DaHuy: '#858796',
        }

        return {
          id: booking.id,
          resourceId: 'homestay-' + booking.id, // Tạm dùng ID để phân biệt
          title: `${booking.tenKhachHang} (${this.formatDateShort(booking.ngayNhanPhong)} - ${this.formatDateShort(booking.ngayTraPhong)})`,
          start: booking.ngayNhanPhong,
          end: booking.ngayTraPhong,
          color: statusColorMap[booking.trangThai] || '#858796',
          extendedProps: {
            status: booking.trangThai,
          },
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
          })

          // Render the calendar
          this.calendar.render()
          this.calendarLoaded = true

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
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    formatDateShort(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      })
    },
    formatDateDay(date) {
      if (!date) return ''
      const d = new Date(date)
      return (
        d.getDate().toString().padStart(2, '0') +
        '-' +
        (d.getMonth() + 1).toString().padStart(2, '0')
      )
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
        alert('Bạn cần đăng nhập để thực hiện thao tác này!')
        return
      }

      try {
        const userId = this.currentUser.id
        await checkIn(bookingId, userId, this.checkInNote)
        await this.fetchBookings()
        await this.fetchStatistics()
        this.checkInNote = '' // Reset note
        alert('Check-in thành công!')
        this.showModal = false // Đóng modal sau khi thực hiện thao tác
      } catch (error) {
        console.error('Lỗi khi check-in:', error)
        alert('Đã xảy ra lỗi khi check-in')
      }
    },
    async handleCheckOut(bookingId) {
      if (!this.currentUser) {
        alert('Bạn cần đăng nhập để thực hiện thao tác này!')
        return
      }

      try {
        const userId = this.currentUser.id
        await checkOut(bookingId, userId, this.checkOutNote)
        await this.fetchBookings()
        await this.fetchStatistics()
        this.checkOutNote = '' // Reset note
        alert('Check-out thành công!')
        this.showModal = false // Đóng modal sau khi thực hiện thao tác
      } catch (error) {
        console.error('Lỗi khi check-out:', error)
        alert('Đã xảy ra lỗi khi check-out')
      }
    },
    loadMoreBookings() {
      // Tăng số lượng thẻ hiển thị lên theo bước
      this.visibleBookingsCount += this.loadMoreStep
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
  flex: 1;
  min-width: 180px;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background-color: #fff;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.card-front {
  position: relative;
  z-index: 2;
}

.stat-icon {
  font-size: 1.8rem;
  margin-bottom: 5px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.stat-card h2 {
  color: #444;
  font-size: 0.85rem;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  position: relative;
  letter-spacing: -0.5px;
  z-index: 2;
  transition: all 0.3s ease;
}

.card-details {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s ease;
  margin-top: 0;
}

.card-details p {
  margin: 10px 0;
  font-size: 0.85rem;
  color: #666;
}

.progress-bar {
  height: 6px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 10px;
}

.progress {
  height: 100%;
  background-color: #4e73df;
  transition: width 0.5s ease;
}

.ripple {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 70%);
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
  z-index: 0;
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.4;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

.stat-card:hover {
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.25),
    0 10px 10px rgba(0, 0, 0, 0.22);
  transform: translateY(-5px);
}

.stat-card:hover .stat-value {
  transform: scale(1.1);
}

.stat-card:hover .stat-icon {
  transform: translateY(-5px);
}

.stat-card:hover .card-details {
  max-height: 100px;
  opacity: 1;
  margin-top: 15px;
}

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

.delete-btn {
  color: #f44336;
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
  margin-bottom: 12px;
  margin-right: 12px;
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
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
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
  margin-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 20px;
  animation: fade-in 0.5s ease forwards;
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
  min-height: 500px; /* Ensure consistent height */
  position: relative; /* For positioning the pagination */
  padding-bottom: 80px; /* Space for the pagination */
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
  text-align: left;
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
  height: 59px; /* Match the height of regular rows */
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

/* Bookings Detail View */
.bookings-detail-view {
  width: 100%;
  position: relative;
  height: 100%;
}

/* Status badges */
.status-confirmed {
  background-color: rgba(67, 160, 71, 0.15);
  color: #43a047;
  border-left: 3px solid #43a047;
}

.status-pending {
  background-color: rgba(255, 160, 0, 0.15);
  color: #ffa000;
  border-left: 3px solid #ffa000;
}

.status-in-progress {
  background-color: rgba(229, 57, 53, 0.15);
  color: #e53935;
  border-left: 3px solid #e53935;
}

.status-deposit {
  background-color: rgba(0, 172, 193, 0.15);
  color: #00acc1;
  border-left: 3px solid #00acc1;
}

.status-completed {
  background-color: rgba(2, 136, 209, 0.15);
  color: #0288d1;
  border-left: 3px solid #0288d1;
}

.status-cancelled {
  background-color: rgba(93, 64, 55, 0.15);
  color: #5d4037;
  border-left: 3px solid #5d4037;
}

.status-check-out {
  background-color: rgba(142, 36, 170, 0.15);
  color: #8e24aa;
  border-left: 3px solid #8e24aa;
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
  padding: 20px 0;
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
  max-width: 1100px;
  position: relative;
  max-height: 92vh;
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
  gap: 30px;
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
  -webkit-text-fill-color: transparent;
}

.booking-info-section .section-icon {
  background: linear-gradient(135deg, rgba(54, 185, 204, 0.1) 0%, rgba(54, 185, 204, 0.05) 100%);
  box-shadow: 0 8px 15px rgba(54, 185, 204, 0.1);
}

.booking-info-section .section-icon i {
  background: linear-gradient(135deg, #36b9cc 0%, #2a8c9a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.payment-section .section-icon {
  background: linear-gradient(135deg, rgba(246, 194, 62, 0.1) 0%, rgba(246, 194, 62, 0.05) 100%);
  box-shadow: 0 8px 15px rgba(246, 194, 62, 0.1);
}

.payment-section .section-icon i {
  background: linear-gradient(135deg, #f6c23e 0%, #dfa82b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.action-section .section-icon {
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.1) 0%, rgba(78, 115, 223, 0.05) 100%);
  box-shadow: 0 8px 15px rgba(78, 115, 223, 0.1);
}

.action-section .section-icon i {
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-section .section-icon {
  background: linear-gradient(135deg, rgba(231, 74, 59, 0.1) 0%, rgba(231, 74, 59, 0.05) 100%);
  box-shadow: 0 8px 15px rgba(231, 74, 59, 0.1);
}

.status-section .section-icon i {
  background: linear-gradient(135deg, #e74a3b 0%, #cf372a 100%);
  -webkit-background-clip: text;
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
  height: 59px; /* Match the height of regular rows */
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
</style>
