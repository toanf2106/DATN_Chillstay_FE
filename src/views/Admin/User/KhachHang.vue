<template>
  <div class="khach-hang-container">
    <div class="card">
      <div class="card-header">
        <h4>Thông tin Khách hàng</h4>
      </div>

      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <!-- Tìm kiếm - Compact version -->
          <div class="d-flex" style="max-width: 400px;">
            <select class="form-select form-select-sm me-1" style="max-width: 85px;" v-model="searchField">
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
                <th>ID</th>
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
              <tr v-for="khachHang in displayedKhachHang" :key="khachHang.id">
                <td>{{ khachHang.id }}</td>
                <td>{{ khachHang.taikhoanID }}</td>
                <td>{{ khachHang.maKhachHang }}</td>
                <td>{{ khachHang.tenKhachHang || khachHang.hoTen }}</td>
                <td>{{ khachHang.soDienThoai }}</td>
                <td>{{ khachHang.email }}</td>
                <td>{{ (khachHang.gioiTinh === 1 || khachHang.gioiTinh === true) ? 'Nam' : 'Nữ' }}</td>
                <td>{{ formatDate(khachHang.ngayTao) }}</td>
                <td>
                  <span
                    :class="{
                      'badge rounded-pill': true,
                      'bg-success': khachHang.trangThai === 1 || khachHang.trangThai === true,
                      'bg-danger': khachHang.trangThai === 0 || khachHang.trangThai === false,
                    }"
                  >
                    {{ (khachHang.trangThai === 1 || khachHang.trangThai === true) ? 'Hoạt động' : 'Không hoạt động' }}
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
                <td colspan="10" class="text-center">
                  Không có dữ liệu khách hàng
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Phân trang -->
        <div v-if="!loading && displayedKhachHang.length > 0" class="pagination-container mt-3">
          <div class="pagination-info">
            Hiển thị {{ displayedKhachHang.length > 0 ? 1 : 0 }} đến
            {{ displayedKhachHang.length }} trong số {{ totalElements }} khách hàng
          </div>
          <div class="pagination-controls">
            <ul class="pagination mb-0">
              <li :class="{ 'page-item': true, disabled: currentPage === 0 }">
                <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">
                  Trước
                </a>
              </li>
              <li
                v-for="page in paginationItems"
                :key="page.value"
                :class="{
                  'page-item': true,
                  active: page.value === currentPage,
                  disabled: page.type === 'ellipsis'
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
                <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">
                  Tiếp
                </a>
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
            <button type="button" class="btn-close" @click="closeViewModal" aria-label="Close"></button>
          </div>
          <div class="custom-modal-body" v-if="viewedKhachHang">
            <div class="row mb-3">
              <div class="col-md-6">
                <p><strong>ID:</strong> {{ viewedKhachHang.id }}</p>
                <p><strong>Tài khoản:</strong> {{ viewedKhachHang.taikhoanID }}</p>
                <p><strong>Mã khách hàng:</strong> {{ viewedKhachHang.maKhachHang }}</p>
                <p><strong>Họ tên:</strong> {{ viewedKhachHang.tenKhachHang || viewedKhachHang.hoTen }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Email:</strong> {{ viewedKhachHang.email }}</p>
                <p><strong>Số điện thoại:</strong> {{ viewedKhachHang.soDienThoai }}</p>
                <p><strong>Giới tính:</strong> {{ (viewedKhachHang.gioiTinh === 1 || viewedKhachHang.gioiTinh === true) ? 'Nam' : 'Nữ' }}</p>
                <p><strong>Ngày tạo:</strong> {{ formatDate(viewedKhachHang.ngayTao) }}</p>
                <p><strong>Trạng thái:</strong>
                  <span
                    :class="{
                      'badge rounded-pill': true,
                      'bg-success': viewedKhachHang.trangThai === 1 || viewedKhachHang.trangThai === true,
                      'bg-danger': viewedKhachHang.trangThai === 0 || viewedKhachHang.trangThai === false,
                    }"
                  >
                    {{ (viewedKhachHang.trangThai === 1 || viewedKhachHang.trangThai === true) ? 'Hoạt động' : 'Không hoạt động' }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="custom-modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeViewModal">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { getKhachHangPaginated, searchKhachHangAPI, getAllKhachHang, getKhachHangById } from '@/Service/khachHangService'
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
          totalPages.value = 1 // Single page for all data
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
        notification.error(`Không thể tải dữ liệu khách hàng: ${error.message || 'Lỗi không xác định'}`)
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
          totalPages.value = 1
          currentPage.value = 0
        }
        else if (response.data.content && Array.isArray(response.data.content)) {
          // Spring Data pagination format
          displayedKhachHang.value = response.data.content
          totalElements.value = response.data.totalElements || response.data.content.length
          totalPages.value = response.data.totalPages || 1
          currentPage.value = response.data.number || 0
        }
        else {
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
            totalPages.value = 1
            currentPage.value = 0
          }
          else if (response.data.content && Array.isArray(response.data.content)) {
            // Paginated result
            displayedKhachHang.value = response.data.content
            totalElements.value = response.data.totalElements || response.data.content.length
            totalPages.value = response.data.totalPages || 1
            currentPage.value = response.data.number || 0
          }
          else {
            // Single object result
            displayedKhachHang.value = [response.data]
            totalElements.value = 1
            totalPages.value = 1
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
        notification.error(`Không thể tìm kiếm khách hàng: ${error.message || 'Lỗi không xác định'}`)
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
      if (!dateStr) return '';
      try {
        // Using a simpler date format that doesn't require locale support
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch (error) {
        console.error('Date formatting error:', error);
        return dateStr; // Return the original string if formatting fails
      }
    };

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
      loadAllKhachHang
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
.khach-hang-container {
  padding: 20px;
}

.search-container {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

/* Pagination styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #dee2e6;
}

.pagination-info {
  color: #6c757d;
}

.pagination-controls {
  margin-left: auto;
}

/* Custom modal implementation */
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
}

.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1999;
}

.custom-modal-dialog {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 1.75rem auto;
  z-index: 2001;
}

.custom-modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  outline: 0;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.5);
  z-index: 2002;
}

.custom-modal-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  border-top-left-radius: calc(0.3rem - 1px);
  border-top-right-radius: calc(0.3rem - 1px);
}

.custom-modal-title {
  margin-bottom: 0;
  line-height: 1.5;
}

.btn-close {
  box-sizing: content-box;
  width: 1em;
  height: 1em;
  padding: 0.25em 0.25em;
  color: #000;
  background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat;
  border: 0;
  border-radius: 0.25rem;
  opacity: 0.5;
  cursor: pointer;
}

.btn-close:hover {
  color: #000;
  text-decoration: none;
  opacity: 0.75;
}

.custom-modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
}

.custom-modal-footer {
  display: flex;
  flex-wrap: wrap;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  padding: 0.75rem;
  border-top: 1px solid #dee2e6;
  border-bottom-right-radius: calc(0.3rem - 1px);
  border-bottom-left-radius: calc(0.3rem - 1px);
}
</style>

