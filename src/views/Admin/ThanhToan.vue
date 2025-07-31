<template>
  <div class="dathome-container">
    <h1 class="section-title">Quản lý Thanh toán</h1>

    <!-- Statistics Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="card-front">
          <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
          <h2>Tổng doanh thu</h2>
          <div class="stat-value">{{ formatCurrency(totalRevenue) }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="card-front">
          <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
          <h2>Đã thanh toán</h2>
          <div class="stat-value">{{ formatCurrency(paidAmount) }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="card-front">
          <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
          <h2>Chưa thanh toán</h2>
          <div class="stat-value">{{ formatCurrency(unpaidAmount) }}</div>
        </div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="content-section">
      <div class="bookings-detail-view">
        <h2>Chi tiết thanh toán</h2>

        <!-- Filter buttons for payment methods -->
        <div class="filter-buttons">
          <button
            class="filter-btn"
            :class="{ active: selectedPaymentMethod === null }"
            @click="filterByMethod(null)">
            Tất cả
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedPaymentMethod === 'TienMat' }"
            @click="filterByMethod('TienMat')">
            Tiền mặt
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedPaymentMethod === 'ChuyenKhoan' }"
            @click="filterByMethod('ChuyenKhoan')">
            Chuyển khoản
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedPaymentMethod === 'VietQR' }"
            @click="filterByMethod('VietQR')">
            VietQR
          </button>
        </div>

        <div class="table-container">
          <table class="bookings-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã giao dịch</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Loại thanh toán</th>
                <th>Thời gian</th>
                <th>Tiền đã nhận</th>
                <th>Tiền trả lại</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody v-if="isLoading">
              <tr>
                <td colspan="10" class="text-center">
                  <div class="loading">Đang tải dữ liệu...</div>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="(payment, index) in paginatedPayments" :key="payment.id" class="payment-row"
                @dblclick="viewDetails(payment)">
                <td>{{ startItem + index }}</td>
                <td>{{ payment.maGiaoDich || 'N/A' }}</td>
                <td>{{ payment.datHome && payment.datHome.khachHang ? payment.datHome.khachHang.tenKhachHang : 'N/A' }}
                </td>
                <td>{{ formatCurrency(payment.soTien) }}</td>
                <td>{{ getStatusLabel(payment.phuongThuc) }}</td>
                <td>{{ getStatusLabel(payment.loaiThanhToan) }}</td>
                <td>{{ formatDate(payment.thoiGianThanhToan || payment.ngayThanhToan) }}</td>
                <td>{{ formatCurrency(payment.tienDaNhan) }}</td>
                <td>{{ formatCurrency(payment.soTienTraLai) }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(payment.trangThai)">
                    {{ getStatusLabel(payment.trangThai) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-container">
          <div class="pagination-info">
            Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }}
          </div>
          <nav aria-label="Page navigation">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 0 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">‹</a>
              </li>
              <li v-for="page in totalPages" :key="page" class="page-item"
                :class="{ active: page - 1 === currentPage }">
                <a class="page-link" href="#" @click.prevent="changePage(page - 1)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">›</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal for payment details - Updated with TienNghi.vue style -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="staff-details-modal">
        <div class="modal-header">
          <h3>Chi Tiết Thanh Toán</h3>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-content" v-if="selectedPayment">
            <div class="detail-item">
              <span class="detail-label">Mã giao dịch:</span>
              <span class="detail-value">{{ selectedPayment.maGiaoDich || 'Không có' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Khách hàng:</span>
              <span class="detail-value">{{ selectedPayment.datHome && selectedPayment.datHome.khachHang ?
                selectedPayment.datHome.khachHang.tenKhachHang : 'Không có' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Mã đặt phòng:</span>
              <span class="detail-value">{{ selectedPayment.datHome ? selectedPayment.datHome.maDatHome : 'Không có'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Số tiền:</span>
              <span class="detail-value">{{ formatCurrency(selectedPayment.soTien) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Phương thức:</span>
              <span class="detail-value">{{ getStatusLabel(selectedPayment.phuongThuc) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Loại thanh toán:</span>
              <span class="detail-value">{{ getStatusLabel(selectedPayment.loaiThanhToan) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Thời gian:</span>
              <span class="detail-value">{{ formatDate(selectedPayment.thoiGianThanhToan ||
                selectedPayment.ngayThanhToan) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tiền đã nhận:</span>
              <span class="detail-value">{{ formatCurrency(selectedPayment.tienDaNhan) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tiền trả lại:</span>
              <span class="detail-value">{{ formatCurrency(selectedPayment.soTienTraLai) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Trạng thái:</span>
              <span class="detail-value">
                <span class="status-badge" :class="getStatusClass(selectedPayment.trangThai)">
                  {{ getStatusLabel(selectedPayment.trangThai) }}
                </span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Lý do thất bại:</span>
              <span class="detail-value">{{ selectedPayment.lyDoThatbai || 'Không có' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Nội dung CK:</span>
              <span class="detail-value">{{ selectedPayment.noiDungCk || 'Không có' }}</span>
            </div>
            <div class="detail-item"
              v-if="selectedPayment.datHome && selectedPayment.datHome.chiTietDatHomes && selectedPayment.datHome.chiTietDatHomes.length > 0">
              <span class="detail-label">Chi tiết đặt phòng:</span>
              <span class="detail-value">
                <div v-for="(detail, index) in selectedPayment.datHome.chiTietDatHomes" :key="index">
                  Phòng {{ detail.phong ? detail.phong.tenPhong : 'Không có' }}: {{ detail.soLuong }} đêm
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllThanhToan } from '@/Service/thanhToanService'
import '@/Styles/CSS/Admin.css'

export default {
  name: 'ThanhToan',
  data() {
    return {
      payments: [],
      filteredPayments: [],
      selectedPaymentMethod: null,
      isLoading: true,
      currentPage: 0,
      itemsPerPage: 5,
      showModal: false,
      selectedPayment: null
    }
  },
  computed: {
    totalRevenue() {
      return this.filteredPayments.reduce((sum, p) => sum + (p.soTien || 0), 0);
    },
    paidAmount() {
      return this.filteredPayments
        .filter(p => p.trangThai === 'ThanhToan')
        .reduce((sum, p) => sum + (p.soTien || 0), 0);
    },
    unpaidAmount() {
      return this.filteredPayments
        .filter(p => p.trangThai !== 'ThanhToan')
        .reduce((sum, p) => sum + (p.soTien || 0), 0);
    },
    paginatedPayments() {
      const start = this.currentPage * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredPayments.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredPayments.length / this.itemsPerPage);
    },
    totalItems() {
      return this.filteredPayments.length;
    },
    startItem() {
      return this.totalItems > 0 ? this.currentPage * this.itemsPerPage + 1 : 0;
    },
    endItem() {
      return Math.min((this.currentPage + 1) * this.itemsPerPage, this.totalItems);
    }
  },
  methods: {
    async fetchPayments() {
      this.isLoading = true;
      try {
        const response = await getAllThanhToan();
        this.payments = response.data;
        this.applyFilters();
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thanh toán:', error);
      } finally {
        this.isLoading = false;
      }
    },
    filterByMethod(method) {
      this.selectedPaymentMethod = method;
      this.currentPage = 0; // Reset to first page
      this.applyFilters();
    },
    applyFilters() {
      if (this.selectedPaymentMethod) {
        this.filteredPayments = this.payments.filter(p => p.phuongThuc === this.selectedPaymentMethod);
      } else {
        this.filteredPayments = [...this.payments];
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },
    formatCurrency(value) {
      if (typeof value !== 'number') {
        return '0 VND';
      }
      return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    },
    getStatusLabel(status) {
      const statusMap = {
        ThanhToan: 'Thanh toán',
        ChuaThanhToan: 'Chưa thanh toán',
        DaCoc: 'Đã cọc',
        ThanhCong: 'Thành công',
        ThatBai: 'Thất bại',
        Coc: 'Cọc',
        ThanhToanToanBo: 'Thanh toán toàn bộ',
        TienMat: 'Tiền mặt',
        ChuyenKhoan: 'Chuyển khoản',
        VietQR: 'VietQR',
        DangCho: 'Đang chờ',
        DANGCHO: 'Đang chờ',
        NULL: 'Không có',
        'null': 'Không có'
      };
      return statusMap[status] || status || 'Không xác định';
    },
    getStatusClass(status) {
      const classMap = {
        ThanhToan: 'status-paid',
        ChuaThanhToan: 'status-unpaid',
        DaCoc: 'status-deposited',
        ThanhCong: 'status-paid',
        ThatBai: 'status-unpaid',
        Coc: 'status-deposited',
        ThanhToanToanBo: 'status-paid',
        TienMat: 'status-cash',
        ChuyenKhoan: 'status-transfer',
        VietQR: 'status-vietqr',
        DangCho: 'status-waiting',
        DANGCHO: 'status-waiting',
      };
      return classMap[status] || 'status-unknown';
    },
    viewDetails(payment) {
      console.log('Opening modal for payment:', payment);
      this.selectedPayment = payment;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedPayment = null;
    },
    changePage(page) {
      if (page >= 0 && page < this.totalPages) {
        this.currentPage = page;
      }
    }
  },
  created() {
    this.fetchPayments();
  }
};
</script>

<style scoped>
/* Main container styling inspired by BookingView */
.dathome-container {
  padding: 2.5rem;
  background-color: #f8f9fa; /* Light gray background */
  font-family: 'Roboto', sans-serif;
}

/* Section title with a modern touch */
.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #2c3e50;
  position: relative;
  padding-bottom: 1rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 70px;
  height: 4px;
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  border-radius: 2px;
}

/* Stat cards with improved design */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.8rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.8rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2.8rem;
  margin-bottom: 1rem;
  color: #4e73df;
}

/* Custom colors for each stat card */
.stat-card:nth-child(1) .stat-icon {
  color: #f39c12;
}

.stat-card:nth-child(2) .stat-icon {
  color: #27ae60;
}

.stat-card:nth-child(3) .stat-icon {
  color: #e74c3c;
}

.stat-card h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: #6c757d;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

/* Content section styling */
.content-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
}

.bookings-detail-view h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

/* Filter buttons with a modern look */
.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 1.8rem;
}

.filter-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 50px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.filter-btn:hover {
  background-color: #e9ecef;
  border-color: #4e73df;
  color: #4e73df;
}

.filter-btn.active {
  background: linear-gradient(135deg, #4e73df 0%, #3a57c2 100%);
  color: white;
  border-color: #4e73df;
  box-shadow: 0 2px 8px rgba(78, 115, 223, 0.3);
}

/* Table styling */
.table-container {
  overflow-x: auto;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.bookings-table th,
.bookings-table td {
  padding: 1rem 1.2rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  white-space: nowrap;
}

.bookings-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 0.85rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.payment-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.payment-row:hover {
  background-color: #f1f3f5;
}

/* Status badges */
.status-badge {
  padding: 0.4em 0.9em;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  text-transform: capitalize;
}
.status-paid {
  background-color: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}
.status-unpaid {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}
.status-deposited {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}
.status-waiting {
  background-color: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.pagination-info {
  font-size: 0.9rem;
  color: #6c757d;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.page-item .page-link {
  padding: 0.6rem 1rem;
  margin: 0 4px;
  border-radius: 8px;
  color: #4e73df;
  text-decoration: none;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.page-item.active .page-link {
  background-color: #4e73df;
  color: white;
  border-color: #4e73df;
}

/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.staff-details-modal {
  background-color: #fff;
  border-radius: 12px;
  width: 600px;
  max-width: 95%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: modal-fade-in 0.3s ease-out;
}

.modal-header {
  padding: 1.2rem 1.8rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #6c757d;
  cursor: pointer;
}

.modal-body {
  padding: 1.8rem;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-item {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f3f5;
}

.detail-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
}

.detail-value {
  color: #2c3e50;
  font-size: 0.9rem;
}
</style>
