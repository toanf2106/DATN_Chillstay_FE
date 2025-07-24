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
.dathome-container {
  padding: 2rem;
  background-color: #f4f6fb;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #333;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #3cb371;
}

.stat-card h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #206243;
}

.table-container {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
}

.bookings-table th,
.bookings-table td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.bookings-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #6c757d;
}

.payment-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.payment-row:hover {
  background-color: #f8f9fa;
}

.status-badge {
  padding: 0.4em 0.8em;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-paid {
  background-color: #d4edda;
  color: #155724;
}

.status-unpaid {
  background-color: #f8d7da;
  color: #721c24;
}

.status-deposited {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-unknown {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-cash {
  background-color: #fff3cd;
  color: #856404;
}

.status-transfer {
  background-color: #cce5ff;
  color: #004085;
}

.status-vietqr {
  background-color: #e2f4e8;
  color: #0f5132;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
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
  padding: 0.5rem 0.75rem;
  margin: 0 2px;
  border-radius: 5px;
  color: #3cb371;
  text-decoration: none;
  border: 1px solid #dee2e6;
}

.page-item.active .page-link {
  background-color: #3cb371;
  color: white;
  border-color: #3cb371;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

/* Modal styles - Updated from TienNghi.vue */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 15px;
}

.staff-details-modal {
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  width: 550px;
  max-width: 95%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-fade-in 0.3s ease;
  overflow: hidden;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 25px;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-content {
  padding: 5px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.detail-label {
  font-weight: 500;
  color: #4b5563;
  width: 150px;
  flex-shrink: 0;
}

.detail-value {
  flex-grow: 1;
  color: #111827;
}

/* Button styling from TienNghi.vue */
.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.btn-info-light {
  color: #0284c7;
  background-color: #e0f2fe;
}

.btn-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Filter buttons */
.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background-color: #e9ecef;
}

.filter-btn.active {
  background-color: #3cb371;
  color: white;
  border-color: #3cb371;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
