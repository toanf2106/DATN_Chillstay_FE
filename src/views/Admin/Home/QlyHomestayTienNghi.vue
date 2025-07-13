<template>
  <div class="homestay-tiennghi-container">
    <h1 class="page-title">Quản Lý Tiện Nghi Homestay</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Tìm kiếm theo tên homestay..."
              class="search-input"
              @input="handleSearch"
            />
            <button v-if="searchTerm" @click="searchTerm = ''" class="clear-search-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
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

    <!-- Homestay Tiện Nghi Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Homestay</th>
            <th>Tiện Nghi</th>
            <th>Số Lượng</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in paginatedItems"
            :key="`${item.homeStay.id}-${item.tienNghi.id}`"
          >
            <td class="text-center">{{ index + 1 + currentPage * pageSize }}</td>
            <td class="text-center">{{ item.homeStay.tenHomestay }}</td>
            <td class="text-center">{{ item.tienNghi.tenTienNghi }}</td>
            <td class="text-center">{{ item.soLuong }}</td>
            <td class="text-center">
              <span
                :class="`badge ${item.trangThai ? 'bg-success' : 'bg-danger'} status-badge`"
              >
                {{ item.trangThai ? 'Hoạt động' : 'Khóa' }}
              </span>
            </td>
          </tr>
          <!-- Empty rows to ensure space for 10 rows -->
          <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
            <td colspan="5">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && filteredItems.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy tiện nghi nào cho homestay.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredItems.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} tiện nghi
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
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getAllHomeStay } from '@/Service/HomeStayService'
import api from '@/utils/api'
import { useToast } from '@/stores/notificationStore'

export default {
  name: 'QlyHomestayTienNghi',
  setup() {
    const toast = useToast()
    const homestayTienNghiList = ref([])
    const searchTerm = ref('')
    const apiError = ref(false)
    const apiErrorMessage = ref('')
    const loading = ref(false)

    // Pagination
    const currentPage = ref(0)
    const pageSize = ref(10)
    const totalPages = ref(1)

    // API calls
    const fetchData = async () => {
      try {
        loading.value = true
        // Lấy tất cả homestay
        const homestaysResponse = await getAllHomeStay()
        const homestays = homestaysResponse.data || []

        // Tạo mảng tạm để lưu tất cả các tiện nghi của homestay
        const allTienNghi = []

        // Lấy tiện nghi cho từng homestay
        for (const homestay of homestays) {
          try {
            const response = await api.get(`/api/homestay-tiennghi/by-homestay/${homestay.id}`)
            const tienNghiList = response.data || []

            // Thêm vào mảng tổng
            allTienNghi.push(...tienNghiList)
          } catch (error) {
            console.error(`Lỗi khi lấy tiện nghi cho homestay ${homestay.id}:`, error)
          }
        }

        homestayTienNghiList.value = allTienNghi
        apiError.value = false

        // Cập nhật thông tin phân trang
        totalPages.value = Math.ceil(homestayTienNghiList.value.length / pageSize.value) || 1
      } catch (e) {
        apiError.value = true
        apiErrorMessage.value = 'Không thể tải dữ liệu tiện nghi homestay. Vui lòng thử lại sau.'
        console.error('Error fetching homestay tien nghi data:', e)
      } finally {
        loading.value = false
      }
    }

    // Filtered items
    const filteredItems = computed(() => {
      let filtered = homestayTienNghiList.value

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm.value) {
        const key = searchTerm.value.toLowerCase()
        filtered = filtered.filter((item) =>
          item.homeStay?.tenHomestay?.toLowerCase().includes(key)
        )
      }

      return filtered
    })

    // Computed properties cho phân trang
    const paginatedItems = computed(() => {
      const start = currentPage.value * pageSize.value
      const end = start + pageSize.value
      return filteredItems.value.slice(start, end)
    })

    const totalItems = computed(() => filteredItems.value.length)

    const startItem = computed(() => {
      if (totalItems.value === 0) return 0
      return currentPage.value * pageSize.value + 1
    })

    const endItem = computed(() => {
      const end = (currentPage.value + 1) * pageSize.value
      return end > totalItems.value ? totalItems.value : end
    })

    const emptyRows = computed(() => {
      const itemsOnPage = paginatedItems.value.length
      return itemsOnPage < pageSize.value ? pageSize.value - itemsOnPage : 0
    })

    // Pagination methods
    const changePage = (page) => {
      if (page < 0 || page >= totalPages.value) return
      currentPage.value = page
    }

    // Search methods
    const handleSearch = () => {
      currentPage.value = 0 // Reset về trang đầu tiên khi tìm kiếm
    }

    // Fetch data on component mount
    onMounted(() => {
      fetchData()
    })

    return {
      homestayTienNghiList,
      searchTerm,
      apiError,
      apiErrorMessage,
      loading,
      currentPage,
      pageSize,
      totalPages,
      paginatedItems,
      totalItems,
      startItem,
      endItem,
      emptyRows,
      filteredItems,
      changePage,
      handleSearch
    }
  },
}
</script>

<style scoped>
.homestay-tiennghi-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
}

.controls-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-box {
  flex: 1;
  max-width: 500px;
}

.search-control-group {
  display: flex;
  gap: 10px;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 35px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.right-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.status-filter {
  width: auto;
  min-width: 150px;
}

.add-button {
  padding: 8px 16px;
  border-radius: 6px;
}

.table {
  width: 100%;
  margin-bottom: 0;
  color: #212529;
  border-collapse: collapse;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  text-align: center;
  vertical-align: middle;
  padding: 12px 8px;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  padding: 12px 8px;
  vertical-align: middle;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.status-badge:hover {
  transform: scale(1.05);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-warning-light {
  background-color: #fff3cd;
  border-color: #ffeeba;
  color: #856404;
}

.btn-warning-light:hover {
  background-color: #ffeeba;
}

.btn-danger-light {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.btn-danger-light:hover {
  background-color: #f5c6cb;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-info {
  color: #6c757d;
  font-size: 14px;
}

.pagination {
  margin: 0;
}

.page-link {
  color: #007bff;
  background-color: #fff;
  border: 1px solid #dee2e6;
  padding: 6px 12px;
  transition: all 0.2s;
}

.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.empty-row td {
  padding: 10px;
  border-top: 1px solid #dee2e6;
}

@media (max-width: 768px) {
  .controls-container {
    flex-direction: column;
  }

  .search-box {
    max-width: 100%;
    margin-bottom: 10px;
  }

  .right-controls {
    justify-content: space-between;
    width: 100%;
  }

  .pagination-container {
    flex-direction: column;
    align-items: center;
  }

  .pagination-info {
    margin-bottom: 10px;
  }
}
</style>
