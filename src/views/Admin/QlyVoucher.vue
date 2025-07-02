<template>
  <div class="voucher-container">
    <h1 class="page-title">Quản Lý Mã Giảm Giá</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Tìm kiếm mã giảm giá..."
              class="search-input"
              @input="handleSearch"
            />
            <button v-if="searchTerm" @click="clearSearch" class="clear-search-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="right-controls">
        <select
          class="form-select status-filter"
          v-model="selectedStatus"
          @change="handleStatusChange(selectedStatus)"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="valid">Còn hạn</option>
          <option value="expired">Hết hạn</option>
        </select>
        <button class="btn btn-primary add-button" @click="openAddModal">
          <font-awesome-icon icon="fa-solid fa-ticket-alt" />
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- Voucher Table -->
    <div class="table-responsive" v-if="!isLoading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã giảm giá</th>
            <th>Tên</th>
            <th>Giá trị</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Số lượng</th>
            <th>Giảm tối đa</th>
            <th>Homestay</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(voucher, index) in filteredVouchers"
            :key="voucher.id"
            @dblclick="viewVoucherDetail(voucher)"
          >
            <td class="text-center">{{ index + 1 }}</td>
            <td class="text-center">{{ voucher.maGiamGia }}</td>
            <td class="text-center">{{ voucher.tenGiamGia }}</td>
            <td class="text-center">{{ formatGiaTri(voucher.giaTri, voucher.loaiGiamGia) }}</td>
            <td class="text-center">{{ formatDate(voucher.ngayBatDau) }}</td>
            <td class="text-center">{{ formatDate(voucher.ngayKetThuc) }}</td>
            <td class="text-center">{{ voucher.soLuong }}</td>
            <td class="text-center">{{ voucher.giamToiDa ? `${voucher.giamToiDa.toLocaleString('vi-VN')} đ` : 'Không giới hạn' }}</td>
            <td class="text-center">{{ getHomeStayName(voucher.homeStayId) }}</td>
            <td class="text-center">
              <span :class="`badge ${isVoucherValid(voucher) ? 'bg-success' : 'bg-danger'}`">
                {{ isVoucherValid(voucher) ? 'Còn hạn' : 'Hết hạn' }}
              </span>
            </td>
            <td class="text-center">
              <div class="action-buttons">
                <button
                  class="btn btn-icon btn-warning-light"
                  title="Chỉnh sửa"
                  @click="editVoucher(voucher)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-icon btn-danger-light"
                  title="Xóa"
                  @click="confirmDelete(voucher)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <!-- Empty rows to ensure space for 10 rows -->
          <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
            <td colspan="11">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!isLoading && filteredVouchers.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy mã giảm giá nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!isLoading && filteredVouchers.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalElements }} mã giảm giá
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 0 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li
            v-for="page in displayedPages"
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

    <!-- Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
      <!-- Delete Confirmation -->
      <div class="confirmation-box">
        <button class="close-button" @click="cancelDelete">&times;</button>
        <div class="confirmation-body">
          <div class="confirm-icon-wrapper icon-danger">
            <i class="fas fa-trash-alt"></i>
          </div>
          <h4 class="confirm-title">Bạn có chắc chắn muốn xóa?</h4>
          <p class="confirm-text">
            Hành động này sẽ xóa vĩnh viễn mã giảm giá
            <strong>{{ selectedVoucher?.tenGiamGia }}</strong
            >. <br />Bạn không thể hoàn tác hành động này.
          </p>
        </div>
        <div class="confirmation-footer">
          <button class="btn btn-secondary" @click="cancelDelete">Hủy bỏ</button>
          <button class="btn btn-danger" @click="executeDelete" :disabled="deleting">
            <span
              v-if="deleting"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else>Xác nhận xóa</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết voucher -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="voucher-details-modal">
        <div class="modal-header">
          <h3>Chi Tiết Mã Giảm Giá</h3>
          <button class="close-button" @click="closeDetailModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-4">
              <div class="voucher-image-container">
                <div class="voucher-image">
                  <i class="fas fa-ticket-alt"></i>
                </div>
                <h4 class="text-center mt-3">{{ detailVoucher?.tenGiamGia }}</h4>
                <p class="text-center voucher-code">Mã: {{ detailVoucher?.maGiamGia }}</p>

                <div class="status-badge">
                  <label>Trạng Thái:</label>
                  <span
                    :class="`badge ${detailVoucher && isVoucherValid(detailVoucher) ? 'bg-success' : 'bg-danger'}`"
                  >
                    {{ detailVoucher && isVoucherValid(detailVoucher) ? 'Còn hạn' : 'Hết hạn' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="col-md-8">
              <div class="voucher-info">
                <div class="form-group">
                  <label>Mã Giảm Giá</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="detailVoucher?.maGiamGia"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Giá trị</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="
                      detailVoucher
                        ? formatGiaTri(detailVoucher.giaTri, detailVoucher.loaiGiamGia)
                        : ''
                    "
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Giá trị tối thiểu</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="
                      detailVoucher?.giaTriToiThieu
                        ? `${detailVoucher.giaTriToiThieu.toLocaleString('vi-VN')} VND`
                        : '0 VND'
                    "
                    readonly
                  />
                </div>

                <!-- Thêm trường giảm tối đa -->
                <div class="form-group">
                  <label>Giảm tối đa</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="
                      detailVoucher?.giamToiDa
                        ? `${detailVoucher.giamToiDa.toLocaleString('vi-VN')} VND`
                        : 'Không giới hạn'
                    "
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Ngày bắt đầu</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="detailVoucher?.ngayBatDau ? formatDate(detailVoucher.ngayBatDau) : ''"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Ngày kết thúc</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="detailVoucher?.ngayKetThuc ? formatDate(detailVoucher.ngayKetThuc) : ''"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Số lượng</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="detailVoucher?.soLuong || 0"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Homestay áp dụng</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="detailVoucher ? getHomeStayName(detailVoucher.homeStayId) : ''"
                    readonly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn btn-secondary">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Modal components for add/edit -->
    <div v-if="showModal" class="modal-overlay">
      <VoucherModal
        :voucher="selectedVoucher"
        :isEdit="isEdit"
        @close="closeModal"
        @save="saveVoucher"
      />
    </div>
  </div>
</template>

<script>
import VoucherModal from './components/VoucherModal.vue'
import { useVoucherManagement } from '@/Styles/JS/Voucher.js'
import { onMounted, ref, computed } from 'vue'
import { getAllHomeStay } from '@/Service/HomeStayService.js'
import notification from '@/utils/notification'

export default {
  name: 'QlyVoucher',
  components: {
    VoucherModal,
  },
  setup() {
    const voucherManagement = useVoucherManagement()
    const homeStayList = ref([])
    const deleting = ref(false)
    const showDeleteConfirm = ref(false)

    // Các biến mới thêm vào
    const emptyRows = computed(() => {
      const rowsCount = voucherManagement.filteredVouchers.value.length
      return rowsCount < 10 ? 10 - rowsCount : 0
    })

    const startItem = computed(() => {
      return voucherManagement.currentPage.value * voucherManagement.pageSize.value + 1
    })

    const endItem = computed(() => {
      const end = (voucherManagement.currentPage.value + 1) * voucherManagement.pageSize.value
      return end > voucherManagement.totalElements.value
        ? voucherManagement.totalElements.value
        : end
    })

    const getHomeStayName = (id) => {
      const hs = homeStayList.value.find((h) => h.id === id)
      return hs ? hs.tenHomestay || hs.tenHomeStay : ''
    }

    // Kiểm tra voucher còn hạn hay không
    const isVoucherValid = (voucher) => {
      const currentDate = new Date()
      const endDate = new Date(voucher.ngayKetThuc)
      return endDate >= currentDate && voucher.trangThai !== false
    }

    // Xác nhận xóa voucher
    const confirmDelete = (voucher) => {
      voucherManagement.selectedVoucher.value = { ...voucher }
      showDeleteConfirm.value = true
    }

    // Hủy xóa
    const cancelDelete = () => {
      showDeleteConfirm.value = false
      voucherManagement.selectedVoucher.value = null
      deleting.value = false
    }

    // Thực hiện xóa voucher
    const executeDelete = async () => {
      try {
        deleting.value = true
        await voucherManagement.deleteVoucher(voucherManagement.selectedVoucher.value.id)
        showDeleteConfirm.value = false
      } catch (error) {
        console.error('Lỗi khi xóa voucher:', error)
        notification.error('Có lỗi xảy ra khi xóa voucher')
      } finally {
        deleting.value = false
      }
    }

    // Xóa tìm kiếm
    const clearSearch = () => {
      voucherManagement.searchTerm.value = ''
      voucherManagement.loadVouchers()
    }

    // Xem chi tiết voucher
    const viewVoucherDetail = (voucher) => {
      voucherManagement.viewVoucherDetail(voucher)
    }

    // Đóng modal chi tiết
    const closeDetailModal = () => {
      voucherManagement.closeDetailModal()
    }

    onMounted(async () => {
      try {
        const res = await getAllHomeStay()
        homeStayList.value = res.data
      } catch {
        homeStayList.value = []
      }
      voucherManagement.loadVouchers()
    })

    return {
      ...voucherManagement,
      homeStayList,
      getHomeStayName,
      isVoucherValid,
      emptyRows,
      startItem,
      endItem,
      showDeleteConfirm,
      deleting,
      confirmDelete,
      cancelDelete,
      executeDelete,
      clearSearch,
      viewVoucherDetail,
      closeDetailModal,
    }
  },
}
</script>

<style scoped>
/* GENERAL CONTAINER & TITLE */
.voucher-container {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.06);
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 25px;
  color: #343a40;
  background: linear-gradient(90deg, #0d6efd 40%, #20c997 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

/* CONTROLS BAR */
.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  background-color: #ffffff;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

/* LEFT SIDE: SEARCH BOX */
.search-box {
  position: relative;
  width: 450px;
}

.search-control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input-wrapper {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9a9a9a;
  font-size: 1rem;
}

.search-input {
  width: 100%;
  border: 1px solid #e9ecef;
  padding: 12px 15px 12px 45px;
  border-radius: 30px;
  outline: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  background-color: #f8f9fa;
}

.search-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  background-color: #fff;
}

.clear-search-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9a9a9a;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.clear-search-btn:hover {
  color: #495057;
}

/* RIGHT SIDE: FILTERS & ADD BUTTON */
.right-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-filter {
  min-width: 180px;
  border-radius: 30px;
  padding: 10px 15px;
  border: 1px solid #e9ecef;
  background-color: #f8f9fa;
  font-size: 0.95rem;
  color: #495057;
}

.add-button {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 21px;
  font-weight: 600;
  padding: 0 20px;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #0d6efd, #0099ff);
  border: none;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
  background: linear-gradient(45deg, #0a58ca, #0077cc);
}

.add-button i {
  color: white;
  font-size: 1.2rem;
}

/* TABLE STYLES */
.table-responsive {
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 25px;
}

.table {
  margin-bottom: 0;
  background-color: #fff;
  border-collapse: separate;
  border-spacing: 0 8px; /* Khoảng cách giữa các hàng */
}

.table thead th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-bottom: 1px solid #dee2e6;
  border-top: none;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
  vertical-align: middle;
  text-align: center;
  padding: 10px 10px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table th:first-child {
  border-top-left-radius: 8px;
}

.table th:last-child {
  border-top-right-radius: 8px;
}

.table tbody tr {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  background-color: #fff;
}

.table tbody tr td {
  vertical-align: middle;
  padding: 10px 15px;
  color: #495057;
  border-top: none;
  position: relative;
}

/* Bo tròn cho ô đầu và cuối của mỗi hàng */
.table tbody tr td:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.table tbody tr td:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.table tbody tr:hover {
  background-color: #f1f7ff;
  transform: translateY(-1px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.table td.text-center {
  text-align: center;
}

.badge {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 20px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.btn-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-info-light {
  color: #0dcaf0;
  background-color: rgba(13, 202, 240, 0.1);
}
.btn-info-light:hover {
  background-color: rgba(13, 202, 240, 0.2);
}

.btn-warning-light {
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
}
.btn-warning-light:hover {
  background-color: rgba(255, 193, 7, 0.2);
}
.btn-danger-light {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
}
.btn-danger-light:hover {
  background-color: rgba(220, 53, 69, 0.2);
}

.empty-row td {
  border: none;
  padding: 8px;
  background: transparent;
  box-shadow: none;
}

.pagination-container {
  padding: 20px 10px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  background-color: #fff;
  border-radius: 12px;
  padding: 15px 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  margin-top: 15px;
}

.pagination-info {
  color: #6c757d;
  font-weight: 500;
}

.pagination {
  margin-bottom: 0;
}

.pagination .page-item .page-link {
  border-radius: 50% !important;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 5px;
  border: none;
  color: #495057;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  transition: all 0.2s ease;
}

.pagination .page-item.active .page-link {
  background: linear-gradient(45deg, #0d6efd, #0099ff);
  color: #fff;
  box-shadow: 0 4px 6px rgba(13, 110, 253, 0.3);
}

.pagination .page-item:not(.active) .page-link:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.pagination .page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading và Empty State */
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  flex-direction: column;
  gap: 15px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.loading-indicator .spinner-border {
  width: 3rem;
  height: 3rem;
  color: #0d6efd;
}

.loading-indicator span {
  margin-top: 15px;
  color: #6c757d;
  font-size: 1rem;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 4rem;
  color: #dce0e5;
  margin-bottom: 20px;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(30, 41, 59, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
  transition: opacity 0.3s ease;
}

/* Confirmation Box */
.confirmation-box {
  position: relative;
  padding: 30px 35px;
  border-radius: 16px;
  background-color: #fff;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 420px;
  max-width: 90%;
  text-align: center;
  animation: modal-pop-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes modal-pop-in {
  from {
    transform: translateY(-50px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.confirmation-box .close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f1f5f9;
  border: none;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.confirmation-box .close-button:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

.confirm-icon-wrapper {
  margin: 0 auto 20px auto;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: icon-pop-in 0.5s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  transform: scale(0);
}

@keyframes icon-pop-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.confirm-icon-wrapper i {
  color: #fff;
  font-size: 32px;
}

.icon-danger {
  background-color: #ef4444;
}

.confirm-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

.confirm-text {
  font-size: 1rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 30px;
}

.confirmation-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.confirmation-footer .btn {
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 0;
  flex: 1;
  border-radius: 30px;
  border: none;
  transition: all 0.2s ease;
}

.confirmation-footer .btn-secondary {
  background-color: #e2e8f0;
  color: #475569;
}
.confirmation-footer .btn-secondary:hover {
  background-color: #cbd5e1;
}
.confirmation-footer .btn-danger:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* Chi tiết voucher modal */
.voucher-details-modal {
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  width: 700px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-fade-in 0.3s ease;
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

.voucher-details-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8f9fa;
}

.voucher-details-modal .modal-header h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #343a40;
}

.voucher-details-modal .modal-body {
  padding: 25px;
}

.voucher-details-modal .modal-footer {
  padding: 15px 25px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.voucher-image-container {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.voucher-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  box-shadow: 0 10px 20px rgba(106, 17, 203, 0.2);
}

.voucher-image i {
  font-size: 60px;
  color: white;
}

.voucher-code {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0;
}

.status-badge {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-badge label {
  margin-bottom: 5px;
  font-weight: 500;
}

.voucher-info {
  padding: 8px;
}

.voucher-info .form-group {
  margin-bottom: 15px;
}

.voucher-info label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}

.voucher-info .form-control[readonly] {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  font-size: 0.95rem;
}
</style>
