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
          @change="handleStatusChange"
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
            <td class="text-center">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
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
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li
            v-for="page in displayedPages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages || totalPages === 0 }"
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
    const currentPage = ref(1)
    const pageSize = ref(10)

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
    const totalPages = computed(() => {
      return Math.ceil(filteredLoaiHomestays.value.length / pageSize.value) || 1
    })

    const paginatedLoaiHomestays = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredLoaiHomestays.value.slice(start, end)
    })

    const totalItems = computed(() => filteredLoaiHomestays.value.length)

    const startItem = computed(() => {
      if (totalItems.value === 0) return 0
      return (currentPage.value - 1) * pageSize.value + 1
    })

    const endItem = computed(() => {
      const end = currentPage.value * pageSize.value
      return Math.min(end, totalItems.value)
    })

    const displayedPages = computed(() => {
      const maxDisplayed = 5
      const pages = []
      if (totalPages.value <= maxDisplayed) {
        for (let i = 1; i <= totalPages.value; i++) pages.push(i)
      } else {
        if (currentPage.value <= 3) {
          pages.push(1, 2, 3, 4, 5)
        } else if (currentPage.value >= totalPages.value - 2) {
          for (let i = totalPages.value - 4; i <= totalPages.value; i++) pages.push(i)
        } else {
          for (let i = currentPage.value - 2; i <= currentPage.value + 2; i++) pages.push(i)
        }
      }
      return pages
    })

    const emptyRows = computed(() => {
      const remainingRows = pageSize.value - paginatedLoaiHomestays.value.length
      return remainingRows > 0 ? remainingRows : 0
    })

    const handleSearch = () => {
      currentPage.value = 1
    }

    const handleStatusChange = () => {
      currentPage.value = 1
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
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
      displayedPages,
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
.loai-homestay-container {
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 25px;
  color: #343a40;
  background: linear-gradient(135deg, #0d6efd 20%, #20c997 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #ffffff;
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

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
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 16px;
  transition: color 0.25s ease;
}

.search-input-wrapper:hover .search-icon,
.search-input:focus ~ .search-icon {
  color: #0d6efd;
}

.search-input {
  width: 100%;
  border: 2px solid #dee2e6;
  padding: 14px 18px 14px 48px;
  border-radius: 50px;
  outline: none;
  transition: all 0.25s ease;
  font-size: 1rem;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  color: #495057;
  font-weight: 500;
}

.search-input:hover {
  border-color: #adb5bd;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.search-input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25);
}

.clear-search-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  font-size: 1.1rem;
}

.clear-search-btn:hover {
  color: #343a40;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-filter {
  min-width: 180px;
  border-radius: 50px;
  padding: 14px 18px;
  border: 2px solid #dee2e6;
  background-color: #ffffff;
  font-size: 0.95rem;
  color: #495057;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236c757d' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 18px center;
  padding-right: 42px;
}

.status-filter:hover {
  border-color: #adb5bd;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.status-filter:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25);
  outline: none;
}

.add-button {
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  font-weight: 600;
  padding: 0;
  width: 48px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
  border: none;
  background: linear-gradient(135deg, #0d6efd, #0099ff);
  color: white;
}

.add-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
  background: linear-gradient(135deg, #0a58ca, #0077cc);
}

.add-button i {
  font-size: 1.2rem;
}

.alert-warning {
  border-radius: 12px;
  background-color: #fff3cd;
  border-color: #ffeeba;
  color: #856404;
  font-weight: 500;
}

.table-responsive {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 20px;
}

.table {
  border-collapse: separate;
  border-spacing: 0;
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

.table tbody tr:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}

.table tbody td {
  padding: 15px 10px;
  vertical-align: middle;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.95rem;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.status-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  border: none;
}

.btn-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-warning-light {
  background-color: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.btn-warning-light:hover {
  background-color: rgba(255, 193, 7, 0.3);
  color: #e0a800;
}

.btn-danger-light {
  background-color: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.btn-danger-light:hover {
  background-color: rgba(220, 53, 69, 0.3);
  color: #bd2130;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.empty-state {
  text-align: center;
  padding: 50px 0;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.pagination-container {
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
  background-color: #f8f9fa;
}

.empty-row td {
  padding: 24.5px !important;
  border-bottom: 1px solid #e9ecef !important;
}

.empty-row:last-child td {
  border-bottom: none !important;
}
</style>
