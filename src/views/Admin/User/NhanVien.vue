<template>
  <div class="nhan-vien-container">
    <h1 class="page-title">Quản Lý Nhân Viên</h1>

    <div class="controls-container">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="Tìm kiếm theo tên, mã NV..."
          class="search-input"
          @input="onSearchChange"
        />
      </div>

      <div class="right-controls">
        <select class="form-select status-filter" v-model="statusFilter" @change="filterByStatus">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang làm việc</option>
          <option value="inactive">Đã nghỉ việc</option>
        </select>
        <button class="btn btn-primary add-button" @click="openAddModal">
          <font-awesome-icon icon="fa-solid fa-user-plus" />
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Staff Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã NV</th>
            <th>Họ Tên</th>
            <th>Số Điện Thoại</th>
            <th>Email</th>
            <th>Địa Chỉ</th>
            <th>Giới Tính</th>
            <th>Ngày Vào Làm</th>
            <th>Ngày Nghỉ Việc</th>
            <th>Trạng Thái</th>
            <th>Ảnh</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="nhanVien in paginatedStaff" :key="nhanVien.id">
            <td class="text-center">{{ nhanVien.id }}</td>
            <td class="text-center">{{ nhanVien.maNhanVien }}</td>
            <td class="text-center">{{ nhanVien.hoTen }}</td>
            <td class="text-center">{{ nhanVien.soDienThoai }}</td>
            <td class="text-center">{{ nhanVien.email }}</td>
            <td class="text-center">{{ nhanVien.diaChi }}</td>
            <td class="text-center">{{ nhanVien.gioiTinh ? 'Nam' : 'Nữ' }}</td>
            <td class="text-center">{{ formatDate(nhanVien.ngayVaoLam) }}</td>
            <td class="text-center">{{ formatDate(nhanVien.ngayNghiLam) }}</td>
            <td class="text-center">
              <span :class="`badge ${nhanVien.trangThai ? 'bg-success' : 'bg-danger'}`">
                {{ nhanVien.trangThai ? 'Đang làm việc' : 'Nghỉ việc' }}
              </span>
            </td>
            <td class="text-center">
              <img
                v-if="nhanVien.anh"
                :src="nhanVien.anh"
                alt="Ảnh nhân viên"
                class="staff-avatar"
                @click="openImagePreview(nhanVien.anh)"
              />
              <span v-else>Không có ảnh</span>
            </td>
            <td class="text-center">
              <div v-if="nhanVien.trangThai" class="action-buttons">
                <button
                  class="btn btn-icon btn-info-light"
                  title="Xem chi tiết"
                  @click="viewStaffDetails(nhanVien)"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  class="btn btn-icon btn-warning-light"
                  title="Chỉnh sửa"
                  @click="openEditModal(nhanVien)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-icon btn-danger-light"
                  title="Xóa"
                  @click="confirmDelete(nhanVien)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div v-else class="action-buttons">
                <button
                  class="btn btn-icon btn-success-light"
                  title="Khôi phục"
                  @click="confirmRestore(nhanVien)"
                >
                  <i class="fas fa-reply"></i>
                </button>
              </div>
            </td>
          </tr>
          <!-- Empty rows to ensure space for 10 rows -->
          <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
            <td colspan="12">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && paginatedStaff.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy nhân viên nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredNhanVienList.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} nhân viên
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

    <!-- Confirmation Modals -->
    <div
      v-if="showDeleteConfirm || showRestoreConfirm"
      class="modal-overlay"
      @click.self="showDeleteConfirm ? cancelDelete() : cancelRestore()"
    >
      <!-- Delete Confirmation -->
      <div v-if="showDeleteConfirm" class="confirmation-box">
        <button class="close-button" @click="cancelDelete">&times;</button>
        <div class="confirmation-body">
          <div class="confirm-icon-wrapper icon-danger">
            <i class="fas fa-trash-alt"></i>
          </div>
          <h4 class="confirm-title">Bạn có chắc chắn muốn xóa?</h4>
          <p class="confirm-text">
            Hành động này sẽ xóa vĩnh viễn nhân viên
            <strong>{{ selectedStaff.hoTen }}</strong
            >. <br />Bạn không thể hoàn tác hành động này.
          </p>
        </div>
        <div class="confirmation-footer">
          <button class="btn btn-secondary" @click="cancelDelete">Hủy bỏ</button>
          <button class="btn btn-danger" @click="deleteStaff" :disabled="deleting">
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

      <!-- Restore Confirmation -->
      <div v-if="showRestoreConfirm" class="confirmation-box">
        <button class="close-button" @click="cancelRestore">&times;</button>
        <div class="confirmation-body">
          <div class="confirm-icon-wrapper icon-success">
            <i class="fas fa-reply"></i>
          </div>
          <h4 class="confirm-title">Xác nhận khôi phục?</h4>
          <p class="confirm-text">
            Hành động này sẽ khôi phục nhân viên
            <strong>{{ selectedStaff.hoTen }}</strong> trở lại.
          </p>
        </div>
        <div class="confirmation-footer">
          <button class="btn btn-secondary" @click="cancelRestore">Hủy bỏ</button>
          <button class="btn btn-primary" @click="executeRestore" :disabled="restoring">
            <span
              v-if="restoring"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else>Xác nhận</span>
          </button>
        </div>
      </div>
    </div>

    <!-- View Staff Details Modal -->
    <div
      class="modal fade"
      id="viewStaffModal"
      tabindex="-1"
      aria-labelledby="viewStaffModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="viewStaffModalLabel">Chi Tiết Nhân Viên</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="staff-details">
              <div class="staff-profile">
                <div class="profile-image">
                  <img :src="selectedStaff.anh || 'default-avatar.png'" alt="Ảnh nhân viên" />
                </div>
                <div class="profile-info">
                  <h3>{{ selectedStaff.hoTen }}</h3>
                  <p class="staff-id">Mã NV: {{ selectedStaff.maNhanVien }}</p>
                </div>
              </div>
              <div class="detail-section">
                <div class="detail-row">
                  <div class="detail-label">Số Điện Thoại:</div>
                  <div class="detail-value">{{ selectedStaff.soDienThoai }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Email:</div>
                  <div class="detail-value">{{ selectedStaff.email }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Địa Chỉ:</div>
                  <div class="detail-value">{{ selectedStaff.diaChi }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Giới Tính:</div>
                  <div class="detail-value">{{ selectedStaff.gioiTinh ? 'Nam' : 'Nữ' }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Ngày Vào Làm:</div>
                  <div class="detail-value">{{ formatDate(selectedStaff.ngayVaoLam) }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Trạng Thái:</div>
                  <div class="detail-value">
                    <span :class="`badge ${selectedStaff.trangThai ? 'bg-success' : 'bg-danger'}`">
                      {{ selectedStaff.trangThai ? 'Đang làm việc' : 'Nghỉ việc' }}
                    </span>
                  </div>
                </div>
                <div class="detail-row" v-if="selectedStaff.ngayNghiLam">
                  <div class="detail-label">Ngày Nghỉ Làm:</div>
                  <div class="detail-value">{{ formatDate(selectedStaff.ngayNghiLam) }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div
      class="modal fade"
      id="imagePreviewModal"
      tabindex="-1"
      aria-labelledby="imagePreviewModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="imagePreviewModalLabel">Xem Ảnh</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body text-center">
            <img :src="previewImage" class="img-fluid" alt="Preview Image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { Modal } from 'bootstrap'
import { getAllNhanVien, deleteNhanVien, restoreNhanVien } from '@/Service/NhanVienService'
import notification from '@/utils/notification'

export default {
  name: 'NhanVienView',
  setup() {
    // State variables
    const nhanVienList = ref([])
    const loading = ref(true)
    const currentPage = ref(0)
    const pageSize = ref(10)
    const totalPages = ref(0)
    const totalItems = ref(0)
    const searchKeyword = ref('')
    const searchTimeout = ref(null)

    // Thêm biến để lọc theo trạng thái
    const statusFilter = ref('all')

    const selectedStaff = ref({})
    const previewImage = ref('')
    const deleting = ref(false)
    const restoring = ref(false)

    // Custom dialog state
    const showDeleteConfirm = ref(false)
    const showRestoreConfirm = ref(false)

    // Modal instances
    let viewStaffModal = null
    let imagePreviewModal = null

    // Initialize modals on component mount
    onMounted(() => {
      // Khởi tạo các modal
      viewStaffModal = new Modal(document.getElementById('viewStaffModal'))
      imagePreviewModal = new Modal(document.getElementById('imagePreviewModal'))

      // Load initial data
      fetchNhanVien()
    })

    // Computed property để lọc danh sách nhân viên theo trạng thái
    const filteredNhanVienList = computed(() => {
      if (statusFilter.value === 'all') {
        return nhanVienList.value
      } else if (statusFilter.value === 'active') {
        return nhanVienList.value.filter((nv) => nv.trangThai === true)
      } else if (statusFilter.value === 'inactive') {
        return nhanVienList.value.filter((nv) => nv.trangThai === false)
      }
      return nhanVienList.value
    })

    // Computed properties cho phân trang
    const startItem = computed(() => {
      return currentPage.value * pageSize.value + 1
    })

    const endItem = computed(() => {
      const end = (currentPage.value + 1) * pageSize.value
      return end > totalItems.value ? totalItems.value : end
    })

    // Danh sách nhân viên đã phân trang
    const paginatedStaff = computed(() => {
      const filtered = filteredNhanVienList.value
      const start = currentPage.value * pageSize.value
      const end = Math.min(start + pageSize.value, filtered.length)
      return filtered.slice(start, end)
    })

    // Số dòng trống cần thêm vào để đảm bảo luôn có 10 dòng
    const emptyRows = computed(() => {
      const rowsCount = paginatedStaff.value.length
      return rowsCount < 10 ? 10 - rowsCount : 0
    })

    // Fetch all staff data
    const fetchNhanVien = async () => {
      loading.value = true
      try {
        const response = await getAllNhanVien()
        nhanVienList.value = response.data
        totalItems.value = nhanVienList.value.length
        totalPages.value = Math.ceil(totalItems.value / pageSize.value)
      } catch (error) {
        console.error('Error fetching staff data:', error)
        notification.error('Không thể tải dữ liệu nhân viên.')
      } finally {
        loading.value = false
      }
    }

    // Filter by status function
    const filterByStatus = () => {
      console.log('Filtering by status:', statusFilter.value)
      // Reset pagination when filter changes
      currentPage.value = 0
    }

    // Search function with debounce
    const onSearchChange = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }

      searchTimeout.value = setTimeout(() => {
        currentPage.value = 0
        fetchNhanVien()
      }, 500)
    }

    // Pagination
    const changePage = (page) => {
      if (page < 0 || page >= totalPages.value) return
      currentPage.value = page
      fetchNhanVien()
    }

    const viewStaffDetails = (staff) => {
      selectedStaff.value = { ...staff }
      viewStaffModal.show()
    }

    const openImagePreview = (imageUrl) => {
      previewImage.value = imageUrl
      imagePreviewModal.show()
    }

    // Placeholder function for edit button
    const openEditModal = (staff) => {
      console.log('Edit functionality not implemented yet', staff.id)
      // Placeholder for future implementation
      notification.info('Chức năng chỉnh sửa sẽ được triển khai sau.')
    }

    // Triển khai chức năng xác nhận xóa với Vue dialog
    const confirmDelete = (staff) => {
      console.log('Confirm delete staff:', staff)
      selectedStaff.value = { ...staff }
      // Hiển thị dialog xác nhận
      showDeleteConfirm.value = true
    }

    // Hủy việc xóa
    const cancelDelete = () => {
      showDeleteConfirm.value = false
      selectedStaff.value = {}
      deleting.value = false
    }

    // Triển khai chức năng xóa nhân viên
    const deleteStaff = async () => {
      try {
        deleting.value = true
        console.log('Deleting staff with ID:', selectedStaff.value.id)

        // Gọi API xóa nhân viên
        const response = await deleteNhanVien(selectedStaff.value.id)
        console.log('Delete response:', response)

        // Ẩn dialog xác nhận
        showDeleteConfirm.value = false

        // Hiển thị thông báo thành công
        notification.success(`Đã xóa nhân viên ${selectedStaff.value.hoTen} thành công.`)

        // Tải lại danh sách nhân viên
        fetchNhanVien()
      } catch (error) {
        console.error('Error deleting staff:', error)

        // Hiển thị thông báo lỗi
        notification.error(
          `Không thể xóa nhân viên. Lỗi: ${error.response?.data?.message || 'Lỗi không xác định'}`,
        )
      } finally {
        deleting.value = false
      }
    }

    //Triển khai chức năng khôi phục nhân viên
    const confirmRestore = (staff) => {
      selectedStaff.value = { ...staff }
      showRestoreConfirm.value = true
    }

    const cancelRestore = () => {
      showRestoreConfirm.value = false
      selectedStaff.value = {}
      restoring.value = false
    }

    const executeRestore = async () => {
      try {
        restoring.value = true
        await restoreNhanVien(selectedStaff.value.id)
        notification.success(`Đã khôi phục nhân viên ${selectedStaff.value.hoTen} thành công.`)
        fetchNhanVien()
        cancelRestore() // Close modal on success
      } catch (error) {
        console.error('Error restoring staff:', error)
        notification.error(
          `Không thể khôi phục nhân viên. Lỗi: ${
            error.response?.data?.message || 'Lỗi không xác định'
          }`,
        )
        restoring.value = false // Keep modal open on error
      }
    }

    // Utility functions
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
    }

    // Add button handler
    const openAddModal = () => {
      // This will be implemented later when we implement the add functionality
      console.log('Open add staff modal')
      // For now, just show a notification
      notification.info('Tính năng thêm nhân viên sẽ được phát triển sau.')
    }

    return {
      nhanVienList,
      filteredNhanVienList,
      loading,
      currentPage,
      totalPages,
      searchKeyword,
      selectedStaff,
      previewImage,
      deleting,
      showDeleteConfirm,
      statusFilter,
      restoring,
      showRestoreConfirm,

      fetchNhanVien,
      filterByStatus,
      onSearchChange,
      changePage,
      viewStaffDetails,
      openImagePreview,
      formatDate,
      openEditModal,
      confirmDelete,
      cancelDelete,
      deleteStaff,
      openAddModal,
      confirmRestore,
      cancelRestore,
      executeRestore,

      startItem,
      endItem,
      paginatedStaff,
      emptyRows,
    }
  },
}
</script>

<style scoped>
/* GENERAL CONTAINER & TITLE */
.nhan-vien-container {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #343a40;
  background: linear-gradient(90deg, #0d6efd 40%, #20c997 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* CONTROLS BAR */
.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px; /* Spacing between controls and table */
}

/* LEFT SIDE: SEARCH BOX */
.search-box {
  position: relative;
  width: 350px;
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
  border: 1px solid #dee2e6;
  padding: 10px 15px 10px 45px; /* Left padding for icon */
  border-radius: var(--border-radius);
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  font-size: 1rem;
}

.search-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  z-index: 2;
}

.search-button {
  border: 1px solid #dee2e6;
  border-left: none;
  background-color: #fff;
  padding: 8px 12px;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  color: #495057;
  transition: background-color 0.2s;
  margin-left: -1px; /* Overlap borders */
}

.search-button:hover {
  background-color: #e9ecef;
}

/* RIGHT SIDE: FILTER & BUTTON */
.right-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-filter {
  height: 38px;
  border-color: #dee2e6;
  box-shadow: none; /* remove bootstrap's default */
  font-size: 14px;
}

.status-filter:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
}

.add-button {
  height: 38px;
  display: flex;
  align-items: center;
}

/* TABLE STYLES */
.table-responsive {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.table {
  margin-bottom: 0;
  background-color: #fff;
}

.table th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  border-top: none;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
  vertical-align: middle;
  text-align: center;
}

.table td {
  vertical-align: middle;
  padding: 15px 10px;
  color: #495057;
  border-top: 1px solid #f1f1f1;
}

.table td.text-center {
  text-align: center;
}

.table tbody tr:hover {
  background-color: #f1f7ff;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 5px;
  justify-content: center;
}

.pagination-container {
  padding: 20px 0 10px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.pagination .page-item .page-link {
  border-radius: 50% !important;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 5px;
  border: none;
  color: #495057;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  color: #fff;
  box-shadow: 0 4px 6px rgba(13, 110, 253, 0.3);
}

.pagination .page-item:not(.active) .page-link:hover {
  background-color: #e9ecef;
}

.empty-row td {
  border: none;
}

/* CONFIRMATION MODAL STYLES (SHARED) */
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

.icon-success {
  background-color: #0d6efd;
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
  border-radius: 8px;
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
}
.confirmation-footer .btn-primary:hover {
  opacity: 0.9;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--secondary-color);
}
.empty-icon {
  font-size: 4rem;
  color: #dce0e5;
  margin-bottom: 20px;
}
.add-button {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 1rem;
  padding: 10px 20px;
  border: none;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
}

/* Keep old action button styles if any, or other styles you want to preserve */
.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  transition: all 0.2s ease;
}
.btn-icon:hover {
  transform: translateY(-2px);
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
.btn-success-light {
  color: #198754;
  background-color: rgba(25, 135, 84, 0.1);
}
.btn-success-light:hover {
  background-color: rgba(25, 135, 84, 0.2);
}
.staff-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}
.staff-avatar:hover {
  transform: scale(1.1);
}
</style>
