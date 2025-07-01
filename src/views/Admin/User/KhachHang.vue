<template>
  <div class="khach-hang-container">
    <div class="card">
      <div class="card-header">
        <h4>Thông tin Khách hàng</h4>
      </div>

      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <!-- Tìm kiếm - Compact version -->
          <div class="d-flex" style="max-width: 400px">
            <select
              class="form-select form-select-sm me-1"
              style="max-width: 85px"
              v-model="searchField"
            >
              <option value="all">Tất cả</option>
              <option value="id">ID</option>
              <option value="maKhachHang">Mã</option>
              <option value="tenKhachHang">Tên</option>
              <option value="soDienThoai">SĐT</option>
              <option value="email">Email</option>
            </select>
            <div class="input-group input-group-sm">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="Tìm kiếm..."
                v-model="searchTerm"
                @keyup.enter="searchKhachHang(0)"
              />
              <button class="btn btn-primary btn-sm" @click="searchKhachHang(0)">
                <i class="fas fa-search"></i>
              </button>
            </div>

            <!-- Button to load all data -->
            <button class="btn btn-success btn-sm ms-1" @click="loadAllKhachHang">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center my-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="mt-2">Đang tải dữ liệu khách hàng...</p>
        </div>

        <!-- Bảng khách hàng -->
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tài khoản</th>
                <th>Mã khách hàng</th>
                <th>Tên khách hàng</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Giới tính</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(khachHang, index) in displayedKhachHang" :key="khachHang.id">
                <td>{{ startItem + index }}</td>
                <td>{{ khachHang.taikhoanID }}</td>
                <td>{{ khachHang.maKhachHang }}</td>
                <td>{{ khachHang.tenKhachHang || khachHang.hoTen }}</td>
                <td>{{ khachHang.soDienThoai }}</td>
                <td>{{ khachHang.email }}</td>
                <td>
                  {{ khachHang.gioiTinh === 1 || khachHang.gioiTinh === true ? 'Nam' : 'Nữ' }}
                </td>
                <td>{{ formatDate(khachHang.ngayTao) }}</td>
                <td>
                  <span
                    :class="{
                      'badge rounded-pill': true,
                      'bg-success': khachHang.trangThai === 1 || khachHang.trangThai === true,
                      'bg-danger': khachHang.trangThai === 0 || khachHang.trangThai === false,
                    }"
                  >
                    {{
                      khachHang.trangThai === 1 || khachHang.trangThai === true
                        ? 'Hoạt động'
                        : 'Không hoạt động'
                    }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-info me-1"
                    @click="openViewModal(khachHang)"
                    title="Xem chi tiết"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="displayedKhachHang.length === 0">
                <td colspan="10" class="text-center">Không có dữ liệu khách hàng</td>
              </tr>
              <!-- Thêm các hàng trống để luôn có 10 dòng -->
              <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
                <td colspan="10">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Phân trang -->
        <div v-if="!loading && displayedKhachHang.length > 0" class="pagination-container mt-3">
          <div class="pagination-info">
            Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalElements }} khách hàng
          </div>
          <div class="pagination-controls">
            <ul class="pagination mb-0">
              <li :class="{ 'page-item': true, disabled: currentPage === 0 }">
                <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)"> Trước </a>
              </li>
              <li
                v-for="page in paginationItems"
                :key="page.value"
                :class="{
                  'page-item': true,
                  active: page.value === currentPage,
                  disabled: page.type === 'ellipsis',
                }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="page.type === 'ellipsis' ? null : goToPage(page.value)"
                >
                  {{ page.label }}
                </a>
              </li>
              <li
                :class="{
                  'page-item': true,
                  disabled: currentPage === totalPages - 1 || totalPages === 0,
                }"
              >
                <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)"> Tiếp </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xem chi tiết -->
    <div v-if="showViewModal" class="custom-modal">
      <div class="custom-modal-backdrop" @click="closeViewModal"></div>
      <div class="custom-modal-dialog">
        <div class="custom-modal-content">
          <div class="custom-modal-header">
            <h5 class="custom-modal-title">Chi tiết khách hàng</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeViewModal"
              aria-label="Close"
            ></button>
          </div>
          <div class="custom-modal-body" v-if="viewedKhachHang">
            <div class="row mb-3">
              <div class="col-md-6">
                <p><strong>ID:</strong> {{ viewedKhachHang.id }}</p>
                <p><strong>Tài khoản:</strong> {{ viewedKhachHang.taikhoanID }}</p>
                <p><strong>Mã khách hàng:</strong> {{ viewedKhachHang.maKhachHang }}</p>
                <p>
                  <strong>Họ tên:</strong>
                  {{ viewedKhachHang.tenKhachHang || viewedKhachHang.hoTen }}
                </p>
              </div>
              <div class="col-md-6">
                <p><strong>Email:</strong> {{ viewedKhachHang.email }}</p>
                <p><strong>Số điện thoại:</strong> {{ viewedKhachHang.soDienThoai }}</p>
                <p>
                  <strong>Giới tính:</strong>
                  {{
                    viewedKhachHang.gioiTinh === 1 || viewedKhachHang.gioiTinh === true
                      ? 'Nam'
                      : 'Nữ'
                  }}
                </p>
                <p><strong>Ngày tạo:</strong> {{ formatDate(viewedKhachHang.ngayTao) }}</p>
                <p>
                  <strong>Trạng thái:</strong>
                  <span
                    :class="{
                      'badge rounded-pill': true,
                      'bg-success':
                        viewedKhachHang.trangThai === 1 || viewedKhachHang.trangThai === true,
                      'bg-danger':
                        viewedKhachHang.trangThai === 0 || viewedKhachHang.trangThai === false,
                    }"
                  >
                    {{
                      viewedKhachHang.trangThai === 1 || viewedKhachHang.trangThai === true
                        ? 'Hoạt động'
                        : 'Không hoạt động'
                    }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="custom-modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeViewModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import {
  getKhachHangPaginated,
  searchKhachHangAPI,
  getAllKhachHang,
  getKhachHangById,
} from '@/Service/khachHangService'
import notification from '@/utils/notification'

export default {
  name: 'KhachHang',
  setup() {
    // Data
    const displayedKhachHang = ref([])
    const viewedKhachHang = ref(null)
    const searchTerm = ref('')
    const searchField = ref('all')
    const currentPage = ref(0) // 0-based for API
    const showViewModal = ref(false)
    const totalPages = ref(0)
    const totalElements = ref(0)
    const loading = ref(false)
    const pageSize = 10 // Cố định hiển thị 10 dòng mỗi trang

    // Computed properties
    // Số dòng trống cần thêm vào để luôn đảm bảo có 10 dòng
    const emptyRows = computed(() => {
      const rowCount = displayedKhachHang.value.length
      return rowCount < 10 ? Array.from({ length: 10 - rowCount }, (_, i) => i + 1) : []
    })

    // Computed pagination items to show
    const paginationItems = computed(() => {
      const items = []
      const maxVisiblePages = 5

      if (totalPages.value <= maxVisiblePages) {
        // If total pages are fewer than max, show all pages
        for (let i = 0; i < totalPages.value; i++) {
          items.push({ type: 'page', value: i, label: i + 1 })
        }
      } else {
        // Always show first page
        items.push({ type: 'page', value: 0, label: 1 })

        if (currentPage.value > 2) {
          // Show ellipsis if current page is far from start
          items.push({ type: 'ellipsis', value: -1, label: '...' })
        }

        // Show pages around current page
        const start = Math.max(1, Math.min(currentPage.value - 1, totalPages.value - 4))
        const end = Math.min(start + 2, totalPages.value - 2)

        for (let i = start; i <= end; i++) {
          items.push({ type: 'page', value: i, label: i + 1 })
        }

        if (currentPage.value < totalPages.value - 3) {
          // Show ellipsis if current page is far from end
          items.push({ type: 'ellipsis', value: -1, label: '...' })
        }

        // Always show last page
        items.push({ type: 'page', value: totalPages.value - 1, label: totalPages.value })
      }

      return items
    })

    // Computed properties cho hiển thị số thứ tự đúng
    const startItem = computed(() => {
      return currentPage.value * pageSize + 1
    })

    const endItem = computed(() => {
      const end = (currentPage.value + 1) * pageSize
      return end > totalElements.value ? totalElements.value : end
    })

    // Methods to load data from backend
    const loadAllKhachHang = async () => {
      try {
        loading.value = true
        notification.info('Đang tải tất cả dữ liệu khách hàng...')

        const response = await getAllKhachHang()
        console.log('Loaded all customer data:', response)

        if (response && response.data) {
          displayedKhachHang.value = Array.isArray(response.data) ? response.data : [response.data]
          totalElements.value = displayedKhachHang.value.length
          totalPages.value = Math.ceil(totalElements.value / pageSize) // Sử dụng pageSize ở đây
          currentPage.value = 0

          notification.success(`Đã tải ${displayedKhachHang.value.length} khách hàng thành công`)
        } else {
          notification.warning('Không có dữ liệu khách hàng')
          displayedKhachHang.value = []
          totalElements.value = 0
          totalPages.value = 0
        }

        loading.value = false
      } catch (error) {
        console.error('Error loading all customers:', error)
        notification.error(
          `Không thể tải dữ liệu khách hàng: ${error.message || 'Lỗi không xác định'}`,
        )
        loading.value = false
      }
    }

    const loadKhachHangPage = async (page = 0) => {
      try {
        loading.value = true
        notification.info('Đang tải dữ liệu khách hàng...')

        console.log(`DEBUG - Loading page ${page}`)
        const response = await getKhachHangPaginated(page)
        console.log('DEBUG - Pagination API response:', response)

        if (!response || !response.data) {
          console.log('DEBUG - Invalid response - no data property:', response)
          notification.error('Dữ liệu trả về không đúng định dạng')
          loading.value = false
          return
        }

        // Handle different response formats
        if (Array.isArray(response.data)) {
          // Direct array response
          displayedKhachHang.value = response.data
          totalElements.value = response.data.length
          totalPages.value = Math.ceil(totalElements.value / pageSize) // Sử dụng pageSize ở đây
          currentPage.value = 0
        } else if (response.data.content && Array.isArray(response.data.content)) {
          // Spring Data pagination format
          displayedKhachHang.value = response.data.content
          totalElements.value = response.data.totalElements || response.data.content.length
          totalPages.value = response.data.totalPages || Math.ceil(totalElements.value / pageSize) // Sử dụng pageSize ở đây
          currentPage.value = response.data.number || 0
        } else {
          // Fallback to using the data as is
          displayedKhachHang.value = [response.data]
          totalElements.value = 1
          totalPages.value = 1
          currentPage.value = 0
        }

        if (displayedKhachHang.value.length > 0) {
          notification.success(`Đã tải ${displayedKhachHang.value.length} khách hàng`)
        } else {
          notification.info('Không có dữ liệu khách hàng')
        }

        loading.value = false
      } catch (error) {
        console.error('ERROR - Loading customers failed:', error)
        displayedKhachHang.value = []
        totalElements.value = 0
        totalPages.value = 0
        notification.error(`Không thể tải dữ liệu: ${error.message || 'Lỗi không xác định'}`)
        loading.value = false
      }
    }

    const goToPage = (page) => {
      if (page >= 0 && page < totalPages.value && page !== currentPage.value) {
        if (searchTerm.value.trim() !== '') {
          searchKhachHang(page)
        } else {
          loadKhachHangPage(page)
        }
      }
    }

    const searchKhachHang = async (page = 0) => {
      try {
        const searchValue = searchTerm.value.trim()
        if (searchValue === '') {
          return loadKhachHangPage(0) // Reset to first page with all data
        }

        loading.value = true
        notification.info('Đang tìm kiếm khách hàng...')

        // Apply the search term to the selected search field or all fields
        const searchParams = {}

        if (searchField.value === 'all') {
          // Search in all fields
          if (!isNaN(searchValue)) {
            searchParams.id = searchValue
          }
          searchParams.maKhachHang = searchValue
          searchParams.tenKhachHang = searchValue
          searchParams.soDienThoai = searchValue
          searchParams.email = searchValue
        } else {
          // Search in selected field only
          searchParams[searchField.value] = searchValue
        }

        console.log(`DEBUG - Search request:`)
        console.log(`- Search term: ${searchValue}`)
        console.log(`- Search field: ${searchField.value}`)
        console.log(`- Page: ${page}`)
        console.log(`- Params:`, searchParams)

        const response = await searchKhachHangAPI(searchParams, page)
        console.log('DEBUG - Search response:', response)

        if (response && response.data) {
          if (Array.isArray(response.data)) {
            // Direct array result
            displayedKhachHang.value = response.data
            totalElements.value = response.data.length
            totalPages.value = Math.ceil(totalElements.value / pageSize) // Sử dụng pageSize
            currentPage.value = 0
          } else if (response.data.content && Array.isArray(response.data.content)) {
            // Paginated result
            displayedKhachHang.value = response.data.content
            totalElements.value = response.data.totalElements || response.data.content.length
            totalPages.value = response.data.totalPages || Math.ceil(totalElements.value / pageSize) // Sử dụng pageSize
            currentPage.value = response.data.number || 0
          } else {
            // Single object result
            displayedKhachHang.value = [response.data]
            totalElements.value = 1
            totalPages.value = Math.ceil(totalElements.value / pageSize) // Sử dụng pageSize
            currentPage.value = 0
          }

          if (displayedKhachHang.value.length > 0) {
            notification.success(`Tìm thấy ${displayedKhachHang.value.length} khách hàng`)
          } else {
            notification.info('Không tìm thấy khách hàng nào phù hợp')
          }
        } else {
          notification.warning('Không có dữ liệu trả về từ server')
          displayedKhachHang.value = []
          totalElements.value = 0
          totalPages.value = 0
        }

        loading.value = false
      } catch (error) {
        console.error('Error searching customers:', error)
        notification.error(
          `Không thể tìm kiếm khách hàng: ${error.message || 'Lỗi không xác định'}`,
        )
        loading.value = false
        displayedKhachHang.value = []
        totalElements.value = 0
        totalPages.value = 0
      }
    }

    const openViewModal = async (khachHang) => {
      try {
        // Attempt to get detailed info if only a basic record is available
        if (!khachHang.taiKhoan && khachHang.id) {
          const response = await getKhachHangById(khachHang.id)
          if (response && response.data) {
            viewedKhachHang.value = response.data
          } else {
            viewedKhachHang.value = { ...khachHang }
          }
        } else {
          // Use the data we already have
          viewedKhachHang.value = { ...khachHang }
        }

        // Show modal
        showViewModal.value = true
        // Disable body scroll
        document.body.style.overflow = 'hidden'

        // Thêm class để ngăn scroll
        document.documentElement.classList.add('modal-open')
      } catch (error) {
        console.error('Error fetching customer details:', error)
        notification.error('Không thể tải thông tin chi tiết khách hàng')
        viewedKhachHang.value = { ...khachHang } // Fall back to what we have
        showViewModal.value = true
        document.body.style.overflow = 'hidden'
        document.documentElement.classList.add('modal-open')
      }
    }

    const closeViewModal = () => {
      showViewModal.value = false
      // Ensure body overflow is restored
      document.body.style.overflow = 'auto'
      // Xóa class ngăn scroll
      document.documentElement.classList.remove('modal-open')
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      try {
        // Using a simpler date format that doesn't require locale support
        const date = new Date(dateStr)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      } catch (error) {
        console.error('Date formatting error:', error)
        return dateStr // Return the original string if formatting fails
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      console.log('KhachHang component mounted, loading all data...')
      // Load all data immediately
      loadAllKhachHang()
    })

    return {
      displayedKhachHang,
      viewedKhachHang,
      searchTerm,
      searchField,
      currentPage,
      totalPages,
      totalElements,
      showViewModal,
      paginationItems,
      loading,
      openViewModal,
      closeViewModal,
      searchKhachHang,
      goToPage,
      formatDate,
      loadKhachHangPage,
      loadAllKhachHang,
      emptyRows,
      pageSize,
      startItem,
      endItem,
    }
  },
}
</script>

<style>
/* Global styles - needed for modal */
:global(.modal-open) {
  overflow: hidden;
  padding-right: 17px; /* Để tránh nhảy layout khi scroll biến mất */
}
</style>

<style scoped>
/* GENERAL CONTAINER & TITLE */
.khach-hang-container {
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

/* Card styling */
.card {
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 25px;
}

.card-header {
  background: linear-gradient(135deg, #0d6efd 0%, #0088ff 50%, #00a1ff 100%);
  padding: 20px 30px;
  border-bottom: none;
  position: relative;
  overflow: hidden;
}

.card-header:before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(30deg);
  pointer-events: none;
}

.card-header h4 {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
}

.card-body {
  padding: 25px;
  background-color: #fff;
}

/* SEARCH AND CONTROLS */
.d-flex {
  display: flex !important;
}

.justify-content-between {
  justify-content: space-between !important;
}

.align-items-center {
  align-items: center !important;
}

.mb-2 {
  margin-bottom: 0.5rem !important;
}

.me-1 {
  margin-right: 0.25rem !important;
}

.ms-1 {
  margin-left: 0.25rem !important;
}

.form-select {
  height: 38px;
  border: 1px solid #e9ecef;
  border-radius: 21px;
  box-shadow: none;
  font-size: 14px;
  padding: 0 12px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  background-color: #fff;
}

.input-group {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  width: 100%;
}

.input-group-sm > .form-control {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.2rem;
}

.form-control-sm {
  height: 38px;
  border: 1px solid #e9ecef;
  border-top-left-radius: 19px;
  border-bottom-left-radius: 19px;
  box-shadow: none;
  font-size: 14px;
  padding: 0 16px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  background-color: #fff;
}

.btn {
  display: inline-block;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.2rem;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(45deg, #0d6efd, #0099ff);
  border: none;
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
  background: linear-gradient(45deg, #0a58ca, #0077cc);
}

.btn-success {
  background: linear-gradient(45deg, #198754, #20c997);
  border: none;
  box-shadow: 0 4px 10px rgba(25, 135, 84, 0.3);
  transition: all 0.3s ease;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(25, 135, 84, 0.4);
  background: linear-gradient(45deg, #157347, #1aa179);
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
  border-spacing: 0 8px;
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
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table tbody tr:nth-child(1) {
  animation-delay: 0.05s;
}
.table tbody tr:nth-child(2) {
  animation-delay: 0.1s;
}
.table tbody tr:nth-child(3) {
  animation-delay: 0.15s;
}
.table tbody tr:nth-child(4) {
  animation-delay: 0.2s;
}
.table tbody tr:nth-child(5) {
  animation-delay: 0.25s;
}
.table tbody tr:nth-child(6) {
  animation-delay: 0.3s;
}
.table tbody tr:nth-child(7) {
  animation-delay: 0.35s;
}
.table tbody tr:nth-child(8) {
  animation-delay: 0.4s;
}
.table tbody tr:nth-child(9) {
  animation-delay: 0.45s;
}
.table tbody tr:nth-child(10) {
  animation-delay: 0.5s;
}

.table tbody tr td {
  vertical-align: middle;
  padding: 10px 15px;
  color: #495057;
  border-top: none;
  position: relative;
}

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

.rounded-pill {
  border-radius: 50rem !important;
}

.bg-success {
  background-color: #198754 !important;
}

.bg-danger {
  background-color: #dc3545 !important;
}

/* BUTTONS */
.btn-info {
  color: #fff;
  background: linear-gradient(45deg, #0dcaf0, #0aa2c0);
  border: none;
  box-shadow: 0 4px 10px rgba(13, 202, 240, 0.3);
  transition: all 0.3s ease;
}

.btn-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(13, 202, 240, 0.4);
  background: linear-gradient(45deg, #0bacce, #098aa3);
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

/* LOADING INDICATOR */
.spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: -0.125em;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  100% {
    transform: rotate(360deg);
  }
}

.text-center {
  text-align: center !important;
}

.my-3 {
  margin-top: 1rem !important;
  margin-bottom: 1rem !important;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
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

/* Pagination styles */
.pagination-container {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  margin-top: 15px;
}

.pagination-info {
  color: #6c757d;
  font-weight: 500;
}

.pagination-controls {
  margin-left: auto;
}

.pagination {
  display: flex;
  padding-left: 0;
  list-style: none;
  border-radius: 0.25rem;
  margin-bottom: 0;
}

.page-item {
  margin: 0 2px;
}

.page-item:first-child .page-link {
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}

.page-item:last-child .page-link {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}

.page-item.active .page-link {
  z-index: 3;
  color: #fff;
  background: linear-gradient(45deg, #0d6efd, #0099ff);
  border-color: #0d6efd;
  box-shadow: 0 4px 6px rgba(13, 110, 253, 0.3);
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  cursor: not-allowed;
  background-color: #fff;
  border-color: #dee2e6;
  opacity: 0.5;
}

.page-link {
  position: relative;
  display: block;
  padding: 0.5rem 0.75rem;
  margin-left: -1px;
  line-height: 1.25;
  color: #495057;
  background-color: #f8f9fa;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50% !important;
}

.page-link:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
  color: #0056b3;
  text-decoration: none;
}

/* CUSTOM MODAL IMPLEMENTATION */
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(30, 41, 59, 0.6);
  z-index: 1999;
  backdrop-filter: blur(4px);
}

.custom-modal-dialog {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 1.75rem auto;
  z-index: 2001;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.custom-modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 16px;
  outline: 0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 2002;
  overflow: hidden;
}

.custom-modal-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background: linear-gradient(135deg, #0d6efd 0%, #0088ff 50%, #00a1ff 100%);
  position: relative;
  overflow: hidden;
}

.custom-modal-header:before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(30deg);
  pointer-events: none;
}

.custom-modal-title {
  margin-bottom: 0;
  line-height: 1.5;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  z-index: 1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.custom-modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 25px 30px;
  max-height: 70vh;
  overflow-y: auto;
}

.custom-modal-footer {
  display: flex;
  flex-wrap: wrap;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  padding: 20px 30px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.custom-modal-footer .btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 30px;
  transition: all 0.3s ease;
}

.custom-modal-footer .btn-secondary {
  background-color: #f1f3f5;
  color: #495057;
  border: none;
  min-width: 120px;
}

.custom-modal-footer .btn-secondary:hover {
  background-color: #e9ecef;
  color: #212529;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

/* Row styling */
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.col-md-6 {
  position: relative;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  flex: 0 0 50%;
  max-width: 50%;
}

.mb-3 {
  margin-bottom: 1rem !important;
}

/* Create animation for the modal */
@keyframes modal-pop-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Style for modal when open to prevent body scroll */
:global(.modal-open) {
  overflow: hidden;
  padding-right: 17px; /* Để tránh nhảy layout khi scroll biến mất */
}

/* Enhanced form elements */
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #3a3a3a;
  font-size: 15px;
  transition: all 0.2s;
  position: relative;
}

.form-group label::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, #0d6efd, #00c6ff);
  transition: width 0.3s ease;
}

.form-group:focus-within label::after {
  width: 30px;
}

.form-group:focus-within label {
  color: #0d6efd;
}

.table-hover tbody tr:hover {
  background-color: #f1f7ff;
}

.empty-row td {
  border: none;
  padding: 8px;
  background: transparent;
  box-shadow: none;
}

.empty-row:hover {
  transform: none !important;
  box-shadow: none !important;
  background-color: transparent !important;
  cursor: default !important;
}
</style>
