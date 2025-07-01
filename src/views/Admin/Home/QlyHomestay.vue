<template>
  <div class="homestay-container">
    <h1 class="page-title">Quản Lý Homestay</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Tìm kiếm homestay..."
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
          <font-awesome-icon icon="fa-solid fa-building-user" />
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

    <!-- Homestay Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Homestay</th>
            <th>Chủ sở hữu</th>
            <th>Diện tích</th>
            <th>Giá</th>
            <th>Địa chỉ</th>
            <th>Tình trạng</th>
            <th>Loại Phòng</th>
            <th>Trạng thái</th>
            <th>Hình ảnh</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(hs, index) in filteredHomestays"
            :key="hs.id"
            @dblclick="viewHomestayDetails(hs)"
          >
            <td class="text-center">{{ index + 1 }}</td>
            <td class="text-center">{{ hs.tenHomestay }}</td>
            <td class="text-center">{{ getChuName(hs.idChuHomeStay) }}</td>
            <td class="text-center">{{ hs.dienTich }} m²</td>
            <td class="text-center">{{ formatCurrency(hs.giaCaHomestay) }}</td>
            <td class="text-center">{{ hs.diaChi }}</td>
            <td class="text-center">{{ hs.tinhTrang }}</td>
            <td class="text-center">{{ getLoaiName(hs.idLoaiHomeStay) }}</td>
            <td class="text-center">
              <span :class="`badge ${hs.trangThai ? 'bg-success' : 'bg-danger'}`">
                {{ hs.trangThai ? 'Hoạt động' : 'Khóa' }}
              </span>
            </td>
            <td class="text-center">
              <div class="image-wrapper">
                <img
                  v-if="hs.hinhAnh"
                  :src="getImageUrl(hs.hinhAnh)"
                  :alt="hs.tenHomestay"
                  class="homestay-image"
                />
                <div v-else class="no-image-placeholder">
                  <i class="fas fa-home"></i>
                  <span>Không có ảnh</span>
                </div>
              </div>
            </td>
            <td class="text-center">
              <div class="action-buttons">
                <button
                  class="btn btn-icon btn-warning-light"
                  title="Chỉnh sửa"
                  @click="editHomestay(hs)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-icon btn-danger-light"
                  title="Xóa"
                  @click="deleteHomestay(hs.id)"
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
    <div v-if="!loading && filteredHomestays.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy homestay nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredHomestays.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} homestay
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
  <HomestayModal
    v-if="showModal"
    :homestay="selectedHomestay"
    :loaiList="loaiList"
    :chuList="chuList"
    :isEdit="isEdit"
    :isViewMode="isViewMode"
    @close="closeModal"
    @save="saveHomestay"
    @edit="editFromViewMode"
  />
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import {
  getAllHomeStay,
  getLoaiHomeStay,
  getChuHomeStay,
  createHomestay,
  updateHomestay,
  deleteHomestayAPI,
} from '@/Service/HomeStayService'
import HomestayModal from '../components/HomestayModal.vue'
import { useToast } from '@/stores/notificationStore'

export default {
  name: 'QlyHomestay',
  components: {
    HomestayModal,
  },
  setup() {
    const toast = useToast()
    const homestays = ref([])
    const loaiList = ref([])
    const chuList = ref([])
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
    const selectedHomestay = ref(null)
    const isEdit = ref(false)
    const isViewMode = ref(false)

    // API calls
    const fetchData = async () => {
      try {
        loading.value = true
        const [hsRes, loaiRes, chuRes] = await Promise.all([
          getAllHomeStay(),
          getLoaiHomeStay(),
          getChuHomeStay(),
        ])
        homestays.value = hsRes.data || []
        loaiList.value = loaiRes.data || []
        chuList.value = chuRes.data || []
        apiError.value = false

        // Cập nhật thông tin phân trang
        totalPages.value = Math.ceil(homestays.value.length / pageSize.value) || 1
      } catch (e) {
        apiError.value = true

        // Kiểm tra lỗi cụ thể để hiển thị thông báo phù hợp
        if (e.response && e.response.status === 404) {
          apiErrorMessage.value =
            'Không thể kết nối đến API chủ homestay. Vui lòng kiểm tra đường dẫn API hoặc khởi động lại server.'
        } else {
          apiErrorMessage.value = 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
        }
      } finally {
        loading.value = false
      }
    }

    // Helpers
    const getLoaiName = (id) => {
      const loai = loaiList.value.find((l) => l.id === id)
      return loai?.tenLoaiHomestay || 'Không xác định'
    }

    const getChuName = (id) => {
      const chu = chuList.value.find((c) => c.id === id)
      if (!chu) return 'Không xác định'
      return chu.hotenChuHomestay || 'Không xác định'
    }

    const formatCurrency = (num) => new Intl.NumberFormat('vi-VN').format(num)
    const getImageUrl = (img) => {
      // Nếu không có ảnh
      if (!img) return '/images/placeholder-house.jpg'

      // Nếu là URL GCS hoặc URL đầy đủ
      if (img.startsWith('http')) return img

      return img
    }

    const filteredHomestays = computed(() => {
      let filtered = homestays.value

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm.value) {
        const key = searchTerm.value.toLowerCase()
        filtered = filtered.filter(
          (h) =>
            h.tenHomestay?.toLowerCase().includes(key) || h.diaChi?.toLowerCase().includes(key),
        )
      }

      // Lọc theo trạng thái
      if (selectedStatus.value !== 'all') {
        const isActive = selectedStatus.value === 'active'
        filtered = filtered.filter((h) => h.trangThai === isActive)
      }

      return filtered
    })

    // Computed properties cho phân trang
    const paginatedHomestays = computed(() => {
      const start = currentPage.value * pageSize.value
      const end = start + pageSize.value
      return filteredHomestays.value.slice(start, end)
    })

    const totalItems = computed(() => filteredHomestays.value.length)

    const startItem = computed(() => {
      return totalItems.value === 0 ? 0 : currentPage.value * pageSize.value + 1
    })

    const endItem = computed(() => {
      const end = (currentPage.value + 1) * pageSize.value
      return end > totalItems.value ? totalItems.value : end
    })

    const emptyRows = computed(() => {
      const rowsCount = paginatedHomestays.value.length
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
      selectedHomestay.value = null
      showModal.value = true
    }

    const editHomestay = (homestay) => {
      isEdit.value = true
      isViewMode.value = false
      selectedHomestay.value = { ...homestay }
      showModal.value = true
    }

    // View homestay details
    const viewHomestayDetails = (homestay) => {
      isEdit.value = false
      isViewMode.value = true
      selectedHomestay.value = { ...homestay }
      showModal.value = true
    }

    // Handle edit from view mode
    const editFromViewMode = () => {
      isViewMode.value = false
      isEdit.value = true
    }

    const closeModal = () => {
      showModal.value = false
      setTimeout(() => {
        selectedHomestay.value = null
        isEdit.value = false
        isViewMode.value = false
      }, 300) // Delay để hoàn tất animation
    }

    const saveHomestay = async (formData) => {
      try {
        // Kiểm tra xem formData có phải là FormData object không
        if (formData instanceof FormData) {
          // Lấy homestay JSON từ FormData
          const homestayJson = formData.get('homestay')
          if (homestayJson) {
            if (isEdit.value && selectedHomestay.value && selectedHomestay.value.id) {
              const homestayId = parseInt(selectedHomestay.value.id, 10)
              await updateHomestay(homestayId, formData)
              toast.success('Cập nhật homestay thành công')
            } else {
              await createHomestay(formData)
              toast.success('Thêm homestay thành công')
            }
          } else {
            throw new Error('Dữ liệu homestay không hợp lệ')
          }
        } else {
          // Xử lý trường hợp dữ liệu không phải FormData (trường hợp cũ)
          if (isEdit.value && formData.id) {
            const homestayId = parseInt(formData.id, 10)
            await updateHomestay(homestayId, formData)
            toast.success('Cập nhật homestay thành công')
          } else {
            await createHomestay(formData)
            toast.success('Thêm homestay thành công')
          }
        }

        closeModal()
        fetchData() // Tải lại danh sách sau khi lưu
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu homestay'
        toast.error(errorMessage)
      }
    }

    const deleteHomestay = async (id) => {
      if (confirm('Bạn có chắc chắn muốn xóa homestay này?')) {
        try {
          await deleteHomestayAPI(id)
          toast.success('Xóa homestay thành công')
          fetchData()
        } catch {
          toast.error('Lỗi khi xóa homestay')
        }
      }
    }

    onMounted(fetchData)

    return {
      searchTerm,
      filteredHomestays,
      paginatedHomestays,
      getLoaiName,
      getChuName,
      formatCurrency,
      getImageUrl,
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
      selectedHomestay,
      isEdit,
      isViewMode,
      openAddModal,
      editHomestay,
      viewHomestayDetails,
      editFromViewMode,
      closeModal,
      saveHomestay,
      deleteHomestay,
      // Các danh sách để truyền xuống modal
      loaiList,
      chuList,
    }
  },
}
</script>

<style scoped>
/* GENERAL CONTAINER & TITLE */
.homestay-container {
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

/* Image styling */
.image-wrapper {
  position: relative;
  width: 70px;
  height: 50px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 5px;
}

.homestay-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  color: #6c757d;
}

.no-image-placeholder i {
  font-size: 1.2rem;
  margin-bottom: 2px;
}

.no-image-placeholder span {
  font-size: 0.7rem;
}

/* Badge styling */
.badge {
  padding: 6px 10px;
  font-weight: 500;
  font-size: 0.8rem;
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

/* Loading indicator */
.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 50px 0;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 15px;
}

.empty-state p {
  color: #6c757d;
  font-size: 1.1rem;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.95rem;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  color: #0d6efd;
  border: 1px solid #dee2e6;
  margin: 0 2px;
  border-radius: 4px;
  padding: 8px 12px;
}

.page-link:hover {
  background-color: #e9ecef;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
}

/* Empty rows */
.empty-row td {
  padding: 10px !important;
  border-bottom: none !important;
}

/* Alert styling */
.alert {
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}
</style>
