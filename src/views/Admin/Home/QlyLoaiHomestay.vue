<template>
  <div class="loai-homestay-container">
    <h1 class="page-title">Quản Lý Loại Homestay</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Tìm kiếm loại homestay..."
              class="search-input"
              @input="handleSearch"
            />
            <button v-if="searchTerm" @click="searchTerm = ''" class="clear-search-btn">
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
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
        <button class="btn btn-primary add-button" @click="openAddModal">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>

    <!-- API Error Alert -->
    <div v-if="apiError" class="alert alert-warning">
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>Lưu ý:</strong> {{ apiErrorMessage }}
      <button type="button" class="btn-close float-end" @click="apiError = false"></button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- Loại Homestay Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Loại Homestay</th>
            <th>Mô tả</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(loai, index) in paginatedLoaiHomestays"
            :key="loai.id"
            @dblclick="viewLoaiHomestayDetails(loai)"
          >
            <td class="text-center">{{ index + 1 + currentPage * pageSize }}</td>
            <td class="text-center">{{ loai.tenLoaiHomestay }}</td>
            <td class="text-center">{{ loai.moTa || 'Không có mô tả' }}</td>
            <td class="text-center">{{ formatDate(loai.ngayTao) }}</td>
            <td class="text-center">
              <span
                :class="`badge ${loai.trangThai ? 'bg-success' : 'bg-danger'} status-badge`"
                @click="toggleStatus(loai.id)"
              >
                {{ loai.trangThai ? 'Hoạt động' : 'Khóa' }}
              </span>
            </td>
            <td class="text-center">
              <div class="action-buttons">
                <button
                  class="btn btn-icon btn-warning-light"
                  title="Chỉnh sửa"
                  @click="editLoaiHomestay(loai)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-icon btn-danger-light"
                  title="Xóa"
                  @click="confirmDelete(loai.id)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <!-- Empty rows to ensure space for 10 rows -->
          <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
            <td colspan="6">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && filteredLoaiHomestays.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy loại homestay nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredLoaiHomestays.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} loại homestay
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
  </div>

  <!-- Modal component cho thêm/sửa/xem chi tiết -->
  <LoaiHomestayModal
    v-if="showModal"
    :loaiHomestay="selectedLoaiHomestay"
    :isEdit="isEdit"
    :isViewMode="isViewMode"
    @close="closeModal"
    @save="saveLoaiHomestay"
    @edit="editFromViewMode"
    @delete="handleDeleteLoaiHomestay"
  />
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import {
  getLoaiHomeStay,
  createLoaiHomestay,
  updateLoaiHomestay,
  deleteLoaiHomestay,
  changeLoaiHomestayStatus,
} from '@/Service/HomeStayService'
import LoaiHomestayModal from '../components/LoaiHomestayModal.vue'
import { useToast } from '@/stores/notificationStore'

export default {
  name: 'QlyLoaiHomestay',
  components: {
    LoaiHomestayModal,
  },
  setup() {
    const toast = useToast()
    const loaiHomestays = ref([])
    const searchTerm = ref('')
    const apiError = ref(false)
    const apiErrorMessage = ref('')
    const selectedStatus = ref('all')
    const loading = ref(false)

    // Pagination
    const currentPage = ref(0)
    const pageSize = ref(10)
    const totalPages = ref(1)

    // State for modal
    const showModal = ref(false)
    const selectedLoaiHomestay = ref(null)
    const isEdit = ref(false)
    const isViewMode = ref(false)

    // API calls
    const fetchData = async () => {
      try {
        loading.value = true
        const response = await getLoaiHomeStay()
        // Đảm bảo dữ liệu được cập nhật
        loaiHomestays.value = []
        setTimeout(() => {
          loaiHomestays.value = response.data || []
        }, 0)

        apiError.value = false

        // Cập nhật thông tin phân trang
        totalPages.value = Math.ceil(loaiHomestays.value.length / pageSize.value) || 1
      } catch (e) {
        apiError.value = true
        apiErrorMessage.value = 'Không thể tải dữ liệu loại homestay. Vui lòng thử lại sau.'
        console.error('Error fetching loai homestay data:', e)
      } finally {
        loading.value = false
      }
    }

    // Format date
    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('vi-VN')
    }

    // Filtered loai homestays
    const filteredLoaiHomestays = computed(() => {
      let filtered = loaiHomestays.value

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm.value) {
        const key = searchTerm.value.toLowerCase()
        filtered = filtered.filter((l) => l.tenLoaiHomestay?.toLowerCase().includes(key))
      }

      // Lọc theo trạng thái
      if (selectedStatus.value !== 'all') {
        const isActive = selectedStatus.value === 'active'
        filtered = filtered.filter((l) => l.trangThai === isActive)
      }

      return filtered
    })

    // Computed properties cho phân trang
    const paginatedLoaiHomestays = computed(() => {
      const start = currentPage.value * pageSize.value
      const end = start + pageSize.value
      return filteredLoaiHomestays.value.slice(start, end)
    })

    const totalItems = computed(() => filteredLoaiHomestays.value.length)

    const startItem = computed(() => {
      return totalItems.value === 0 ? 0 : currentPage.value * pageSize.value + 1
    })

    const endItem = computed(() => {
      const end = (currentPage.value + 1) * pageSize.value
      return end > totalItems.value ? totalItems.value : end
    })

    const emptyRows = computed(() => {
      const rowsCount = paginatedLoaiHomestays.value.length
      return rowsCount < pageSize.value ? pageSize.value - rowsCount : 0
    })

    const handleSearch = () => {
      currentPage.value = 0
    }

    const handleStatusChange = (status) => {
      selectedStatus.value = status
      currentPage.value = 0
    }

    const changePage = (page) => {
      if (page >= 0 && page < totalPages.value) {
        currentPage.value = page
      }
    }

    // Modal functions
    const openAddModal = () => {
      isEdit.value = false
      isViewMode.value = false
      selectedLoaiHomestay.value = null
      showModal.value = true
    }

    const editLoaiHomestay = (loaiHomestay) => {
      isEdit.value = true
      isViewMode.value = false
      selectedLoaiHomestay.value = { ...loaiHomestay }
      showModal.value = true
    }

    const viewLoaiHomestayDetails = (loaiHomestay) => {
      isEdit.value = false
      isViewMode.value = true
      selectedLoaiHomestay.value = { ...loaiHomestay }
      showModal.value = true
    }

    const editFromViewMode = () => {
      isViewMode.value = false
      isEdit.value = true
    }

    const closeModal = () => {
      showModal.value = false
      setTimeout(() => {
        selectedLoaiHomestay.value = null
        isEdit.value = false
        isViewMode.value = false
      }, 300)
    }

    // Save loai homestay (create or update)
    const saveLoaiHomestay = async (loaiHomestayData) => {
      try {
        if (loaiHomestayData.id) {
          // Update existing loai homestay
          await updateLoaiHomestay(loaiHomestayData.id, loaiHomestayData)
          toast.success('Cập nhật loại homestay thành công!')
        } else {
          // Create new loai homestay
          await createLoaiHomestay(loaiHomestayData)
          toast.success('Thêm loại homestay mới thành công!')
        }
        closeModal()
        fetchData()
      } catch (error) {
        console.error('Error saving loai homestay:', error)
        toast.error(
          'Có lỗi xảy ra khi lưu loại homestay. Vui lòng thử lại sau!'
        )
      }
    }

    // Delete loai homestay
    const confirmDelete = (id) => {
      if (confirm('Bạn có chắc chắn muốn xóa loại homestay này không?')) {
        handleDeleteLoaiHomestay(id)
      }
    }

    const handleDeleteLoaiHomestay = async (id) => {
      try {
        await deleteLoaiHomestay(id)
        toast.success('Xóa loại homestay thành công!')
        fetchData()
        if (showModal.value) closeModal()
      } catch (error) {
        console.error('Error deleting loai homestay:', error)
        toast.error(
          'Có lỗi xảy ra khi xóa loại homestay. Vui lòng thử lại sau!'
        )
      }
    }

    const toggleStatus = async (id) => {
      try {
        const response = await changeLoaiHomestayStatus(id)
        console.log('Kết quả đổi trạng thái:', response.data)
        toast.success('Cập nhật trạng thái loại homestay thành công!')
        fetchData()
      } catch (error) {
        console.error('Error toggling loai homestay status:', error)
        toast.error('Có lỗi xảy ra khi cập nhật trạng thái loại homestay. Vui lòng thử lại sau!')
      }
    }

    onMounted(fetchData)

    return {
      searchTerm,
      filteredLoaiHomestays,
      paginatedLoaiHomestays,
      formatDate,
      handleSearch,
      apiError,
      apiErrorMessage,
      selectedStatus,
      handleStatusChange,
      loading,
      // Pagination
      currentPage,
      pageSize,
      totalPages,
      totalItems,
      startItem,
      endItem,
      emptyRows,
      changePage,
      // Modal state và functions
      showModal,
      selectedLoaiHomestay,
      isEdit,
      isViewMode,
      openAddModal,
      editLoaiHomestay,
      viewLoaiHomestayDetails,
      editFromViewMode,
      closeModal,
      saveLoaiHomestay,
      confirmDelete,
      handleDeleteLoaiHomestay,
      toggleStatus,
    }
  },
}
</script>

<style scoped>
/* GENERAL CONTAINER & TITLE */
.loai-homestay-container {
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

/* TABLE STYLES */
.table-responsive {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 20px;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding: 15px 10px;
  text-align: center;
  font-size: 0.95rem;
}

.table tbody td {
  padding: 15px 10px;
  vertical-align: middle;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.95rem;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

/* Action buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
}

.btn-warning-light {
  background-color: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  border: none;
}

.btn-warning-light:hover {
  background-color: rgba(255, 193, 7, 0.3);
  color: #e0a800;
}

.btn-danger-light {
  background-color: rgba(220, 53, 69, 0.15);
  color: #dc3545;
  border: none;
}

.btn-danger-light:hover {
  background-color: rgba(220, 53, 69, 0.3);
  color: #bd2130;
}

/* Badge styling */
.badge {
  padding: 6px 10px;
  border-radius: 4px;
  font-weight: 500;
}

.bg-success {
  background-color: #198754 !important;
}

.bg-danger {
  background-color: #dc3545 !important;
}

.status-badge {
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination {
  margin: 0;
  gap: 5px;
}

.page-item .page-link {
  border-radius: 4px;
  color: #0d6efd;
  border: 1px solid #dee2e6;
  padding: 6px 12px;
  font-size: 0.9rem;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

/* Loading indicator */
.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

/* Alert styling */
.alert {
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffecb5;
  color: #664d03;
}

.btn-close {
  background: transparent;
  border: 0;
  font-size: 1.25rem;
  padding: 0.25rem;
  cursor: pointer;
  opacity: 0.5;
}

.btn-close:hover {
  opacity: 1;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
}

.empty-icon {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 15px;
}

.empty-state p {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
}

/* Empty rows */
.empty-row td {
  padding: 10px !important;
  border-bottom: 1px solid #e9ecef;
}
</style>
