<template>
  <div class="khach-hang-container">
    <div class="card">
      <div class="card-header">
        <h4>Thông tin Khách hàng</h4>
      </div>

      <div class="card-body">
        <div class="row mb-3">
          <!-- Tìm kiếm - completely separated layout -->
          <!-- Search input on the far left -->
          <div class="col-md-4">
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                placeholder="Nhập từ khóa tìm kiếm..."
                v-model="searchTerm"
                @keyup.enter="searchKhachHang(0)"
              />
              <button class="btn btn-primary" @click="searchKhachHang(0)">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>

          <!-- Empty space in the middle -->
          <div class="col-md-4"></div>

          <!-- Field selector on the far right -->
          <div class="col-md-4 text-end">
            <select v-model="searchField" class="form-select" style="max-width: 200px; float: right;">
              <option value="all">Tất cả trường</option>
              <option value="id">ID</option>
              <option value="maKhachHang">Mã khách hàng</option>
              <option value="hoTen">Họ tên</option>
              <option value="soDienThoai">Số điện thoại</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>

        <!-- Bảng khách hàng -->
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>TK ID</th>
                <th>Mã khách hàng</th>
                <th>Họ và tên</th>
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
                <td>{{ khachHang.taiKhoan?.id || khachHang.taikhoanID }}</td>
                <td>{{ khachHang.maKhachHang }}</td>
                <td>{{ khachHang.hoTen }}</td>
                <td>{{ khachHang.soDienThoai }}</td>
                <td>{{ khachHang.email }}</td>
                <td>{{ khachHang.gioiTinh ? 'Nam' : 'Nữ' }}</td>
                <td>{{ formatDate(khachHang.ngayTao) }}</td>
                <td>
                  <span
                    :class="{
                      'badge rounded-pill': true,
                      'bg-success': khachHang.trangThai,
                      'bg-danger': !khachHang.trangThai,
                    }"
                  >
                    {{ khachHang.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-info"
                    @click="openViewModal(khachHang)"
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

        <!-- Phân trang - Moved to bottom with even spacing -->
        <div class="pagination-container mt-3">
          <div class="pagination-info">
            Hiển thị {{ displayedKhachHang.length > 0 ? startIndex + 1 : 0 }} đến
            {{ endIndex }} trong số {{ totalElements }} khách hàng
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

    <!-- Modal Xem chi tiết - Custom modal implementation -->
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
                <p><strong>TK ID:</strong> {{ viewedKhachHang.taiKhoan?.id || viewedKhachHang.taikhoanID }}</p>
                <p><strong>Mã khách hàng:</strong> {{ viewedKhachHang.maKhachHang }}</p>
                <p><strong>Họ tên:</strong> {{ viewedKhachHang.hoTen }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Email:</strong> {{ viewedKhachHang.email }}</p>
                <p><strong>Số điện thoại:</strong> {{ viewedKhachHang.soDienThoai }}</p>
                <p><strong>Giới tính:</strong> {{ viewedKhachHang.gioiTinh ? 'Nam' : 'Nữ' }}</p>
                <p><strong>Ngày tạo:</strong> {{ formatDate(viewedKhachHang.ngayTao) }}</p>
                <p><strong>Trạng thái:</strong>
                  <span
                    :class="{
                      'badge rounded-pill': true,
                      'bg-success': viewedKhachHang.trangThai,
                      'bg-danger': !viewedKhachHang.trangThai,
                    }"
                  >
                    {{ viewedKhachHang.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
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
import { getKhachHangPaginated, searchKhachHangAPI, getAllKhachHang } from '@/Service/khachHangService'
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
    const itemsPerPage = ref(10)
    const showViewModal = ref(false)
    const totalPages = ref(0)
    const totalElements = ref(0)
    const startIndex = ref(0)
    const endIndex = ref(0)
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
        notification.info('Đang tải dữ liệu khách hàng...')

        const response = await getAllKhachHang()
        console.log('Loaded all customer data:', response)

        if (response && response.data) {
          // If data is directly in response.data (not paginated)
          displayedKhachHang.value = response.data
          totalElements.value = response.data.length
          // Set up basic pagination
          totalPages.value = Math.ceil(totalElements.value / itemsPerPage.value)
          updatePaginationInfo()
        }

        loading.value = false
        notification.success('Đã tải dữ liệu khách hàng thành công')
      } catch (error) {
        console.error('Error loading all customers:', error)
        notification.error('Không thể tải dữ liệu khách hàng')
        loading.value = false
      }
    }

    const loadKhachHangPage = async (page = 0) => {
      try {
        loading.value = true
        notification.info('Đang tải dữ liệu khách hàng...')

        console.log(`DEBUG - Loading page ${page} with ${itemsPerPage.value} items per page`)
        const response = await getKhachHangPaginated(page, itemsPerPage.value)
        console.log('DEBUG - Pagination API response:', response)

        if (!response || !response.data) {
          console.log('DEBUG - Invalid response - no data property:', response)
          notification.error('Dữ liệu trả về không đúng định dạng')
          loading.value = false
          return
        }

        // Log the raw data for debugging
        console.log('DEBUG - Response data structure:', {
          isArray: Array.isArray(response.data),
          dataType: typeof response.data,
          hasContent: !!response.data.content,
          contentType: response.data.content ? typeof response.data.content : 'N/A',
          contentIsArray: response.data.content ? Array.isArray(response.data.content) : false
        })

        // Handle Spring Data format (the most common)
        if (response.data.content && Array.isArray(response.data.content)) {
          console.log('DEBUG - Using Spring Data pagination format')
          displayedKhachHang.value = response.data.content
          totalPages.value = response.data.totalPages || 0
          totalElements.value = response.data.totalElements || 0
          currentPage.value = response.data.number || 0
        }
        // Handle custom format with data array
        else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('DEBUG - Using custom pagination with data array')
          displayedKhachHang.value = response.data.data
          totalPages.value = response.data.totalPages || 0
          totalElements.value = response.data.totalElements || 0
          currentPage.value = page
        }
        // Handle direct array response
        else if (Array.isArray(response.data)) {
          console.log('DEBUG - Using direct array response')
          // If no pagination is provided, we paginate the data ourselves
          const allData = response.data
          const totalItems = allData.length
          const totalPgs = Math.ceil(totalItems / itemsPerPage.value) || 1
          const startIdx = page * itemsPerPage.value
          const endIdx = Math.min(startIdx + itemsPerPage.value, totalItems)

          displayedKhachHang.value = allData.slice(startIdx, endIdx)
          totalElements.value = totalItems
          totalPages.value = totalPgs
          currentPage.value = page
        }
        // Handle unexpected formats - try to salvage whatever data possible
        else {
          console.log('DEBUG - Unexpected response format, attempting to recover data')

          // If we don't have any expected format, fallback to getting all data
          const allDataResponse = await getAllKhachHang()
          console.log('DEBUG - Fallback getAllKhachHang response:', allDataResponse)

          if (allDataResponse && allDataResponse.data) {
            const allData = Array.isArray(allDataResponse.data)
              ? allDataResponse.data
              : Array.isArray(allDataResponse.data.content)
                ? allDataResponse.data.content
                : []

            const totalItems = allData.length
            const totalPgs = Math.ceil(totalItems / itemsPerPage.value) || 1
            const startIdx = page * itemsPerPage.value
            const endIdx = Math.min(startIdx + itemsPerPage.value, totalItems)

            displayedKhachHang.value = allData.slice(startIdx, endIdx)
            totalElements.value = totalItems
            totalPages.value = totalPgs
            currentPage.value = page

            console.log('DEBUG - Recovered with manual pagination:', {
              total: totalItems,
              pages: totalPgs,
              currentItems: displayedKhachHang.value.length
            })
          } else {
            console.log('DEBUG - Could not recover data')
            displayedKhachHang.value = []
            totalElements.value = 0
            totalPages.value = 0
            currentPage.value = 0
            notification.warning('Không thể tải dữ liệu khách hàng')
          }
        }

        // Update pagination info regardless of which path was taken
        updatePaginationInfo()

        // Log the success outcome
        console.log('DEBUG - Final data state after loading:', {
          items: displayedKhachHang.value.length,
          totalElements: totalElements.value,
          totalPages: totalPages.value,
          currentPage: currentPage.value
        })

        if (displayedKhachHang.value.length > 0) {
          notification.success(`Đã tải ${displayedKhachHang.value.length} khách hàng`)
        } else {
          notification.info('Không có dữ liệu khách hàng')
        }

        loading.value = false
      } catch (error) {
        console.error('ERROR - Loading customers failed:', error)
        console.log('DEBUG - Error details:', error.response?.data || error.message)

        // Try recovery with getAllKhachHang
        try {
          console.log('DEBUG - Attempting recovery with getAllKhachHang')
          const recovery = await getAllKhachHang()

          if (recovery && recovery.data) {
            const allData = Array.isArray(recovery.data) ? recovery.data : []
            displayedKhachHang.value = allData
            totalElements.value = allData.length
            totalPages.value = 1
            currentPage.value = 0
            updatePaginationInfo()
            notification.warning('Đã tải dữ liệu, nhưng phân trang không khả dụng')
          } else {
            displayedKhachHang.value = []
            totalElements.value = 0
            totalPages.value = 0
            notification.error('Không thể tải dữ liệu khách hàng')
          }
        } catch (recoveryError) {
          console.error('ERROR - Recovery attempt failed:', recoveryError)
          displayedKhachHang.value = []
          totalElements.value = 0
          totalPages.value = 0
          notification.error(`Không thể tải dữ liệu: ${error.message || 'Lỗi không xác định'}`)
        }

        loading.value = false
      }
    }

    const updatePaginationInfo = () => {
      startIndex.value = currentPage.value * itemsPerPage.value
      endIndex.value = Math.min(startIndex.value + displayedKhachHang.value.length, totalElements.value)
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

        // Create search params based on selected field
        const searchParams = {}

        // Simplified search logic - only search in the selected field
        if (searchField.value === 'all') {
          // When "all" is selected, try to apply the same term to all searchable fields
          searchParams.maKhachHang = searchValue
          searchParams.hoTen = searchValue
          searchParams.soDienThoai = searchValue
          searchParams.email = searchValue

          // Only add ID if the search term is a number
          if (!isNaN(searchValue)) {
            searchParams.id = searchValue
          }
        } else {
          // For specific field searches
          searchParams[searchField.value] = searchValue
        }

        console.log(`DEBUG - Search request:`)
        console.log(`- Search field: ${searchField.value}`)
        console.log(`- Search term: ${searchValue}`)
        console.log(`- Page: ${page}, Size: ${itemsPerPage.value}`)
        console.log(`- Params:`, searchParams)

        // Check base URL from API configuration
        console.log(`DEBUG - Base URL: ${import.meta.env.VITE_API_URL || 'Not configured - check api.js'}`);

        const response = await searchKhachHangAPI(searchParams, page, itemsPerPage.value)
        console.log('DEBUG - Search response:', response)

        if (response && response.data) {
          // Check what kind of data structure we received
          console.log('DEBUG - Response data type:', Array.isArray(response.data) ? 'Array' : typeof response.data)

          if (response.data.content) {
            console.log('DEBUG - Using Spring Data pagination format')
            displayedKhachHang.value = response.data.content
            totalPages.value = response.data.totalPages || 0
            totalElements.value = response.data.totalElements || 0
            currentPage.value = response.data.number || 0
          } else if (response.data.data && Array.isArray(response.data.data)) {
            console.log('DEBUG - Using custom pagination format with data array')
            displayedKhachHang.value = response.data.data
            totalPages.value = response.data.totalPages || 0
            totalElements.value = response.data.totalElements || 0
            currentPage.value = page
          } else if (Array.isArray(response.data)) {
            console.log('DEBUG - Using direct array response')
            displayedKhachHang.value = response.data
            totalElements.value = response.data.length
            totalPages.value = Math.ceil(totalElements.value / itemsPerPage.value)
            currentPage.value = 0
          } else {
            console.log('DEBUG - Unexpected data format:', response.data)
            displayedKhachHang.value = []
            totalElements.value = 0
            totalPages.value = 0
          }

          // Log the final state
          console.log('DEBUG - After search:')
          console.log(`- Items: ${displayedKhachHang.value.length}`)
          console.log(`- Total elements: ${totalElements.value}`)
          console.log(`- Total pages: ${totalPages.value}`)
          console.log(`- Current page: ${currentPage.value}`)

          updatePaginationInfo()

          if (displayedKhachHang.value.length > 0) {
            notification.success(`Tìm thấy ${totalElements.value} khách hàng`)
          } else {
            notification.info('Không tìm thấy khách hàng nào phù hợp')
          }
        } else {
          console.log('DEBUG - Empty or invalid response')
          notification.warning('Không có dữ liệu trả về từ server')
          displayedKhachHang.value = []
          totalElements.value = 0
          totalPages.value = 0
          updatePaginationInfo()
        }

        loading.value = false
      } catch (error) {
        console.error('Error searching customers:', error)
        console.log('DEBUG - Error details:', error.response?.data || error.message)
        notification.error(`Không thể tìm kiếm khách hàng: ${error.message || 'Lỗi không xác định'}`)
        loading.value = false
      }
    }

    const openViewModal = (khachHang) => {
      // Set the viewed customer data
      viewedKhachHang.value = { ...khachHang }
      // Show modal
      showViewModal.value = true
      // Disable body scroll
      document.body.style.overflow = 'hidden'
    }

    const closeViewModal = () => {
      showViewModal.value = false
      document.body.style.overflow = ''
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
      console.log('KhachHang component mounted, loading data...')
      // Try to load paginated data first
      loadKhachHangPage(0)
    })

    return {
      displayedKhachHang,
      viewedKhachHang,
      searchTerm,
      searchField,
      currentPage,
      totalPages,
      totalElements,
      startIndex,
      endIndex,
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

.custom-modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 1rem;
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

