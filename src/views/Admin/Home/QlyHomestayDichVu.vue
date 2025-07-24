<template>
  <div class="homestay-dichvu-container">
    <h1 class="page-title">Quản Lý Dịch Vụ Homestay</h1>

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

    <!-- Homestay Dịch Vụ Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Homestay</th>
            <th>Tên Dịch Vụ</th>
            <th>Giá</th>
            <th>Đơn Vị</th>
            <th>Mô Tả</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in paginatedItems"
            :key="`${item.homeStay?.id}-${item.id}`"
          >
            <td class="text-center">{{ index + 1 + currentPage * pageSize }}</td>
            <td class="text-center">{{ item.homeStay?.tenHomestay }}</td>
            <td class="text-center">{{ item.tenDichVu }}</td>
            <td class="text-center">{{ formatCurrency(item.gia) }}</td>
            <td class="text-center">{{ item.donVi }}</td>
            <td class="text-center">{{ item.moTa }}</td>
            <td class="text-center">
              <span :class="`badge ${item.trangThai ? 'bg-success' : 'bg-danger'}`">
                {{ item.trangThai ? 'Hoạt động' : 'Ngừng hoạt động' }}
              </span>
            </td>
          </tr>
          <!-- Empty rows to ensure space for 10 rows -->
          <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
            <td colspan="7">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && filteredItems.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy dịch vụ nào cho homestay.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredItems.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} dịch vụ
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
import { getAllDichVu } from '@/Service/dichVuService'
import { useToast } from '@/stores/notificationStore'

export default {
  name: 'QlyHomestayDichVu',
  setup() {
    const toast = useToast()
    const homestayDichVuList = ref([])
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

        // Tạo mảng tạm để lưu tất cả các dịch vụ của homestay
        const allDichVu = []

        // Lấy tất cả dịch vụ một lần
        try {
          const dichVuResponse = await getAllDichVu()
          const allDichVuList = dichVuResponse.data || []

          // Xử lý dịch vụ cho từng homestay
          for (const homestay of homestays) {
            // Lọc các dịch vụ thuộc về homestay hiện tại
            const filteredDichVu = allDichVuList.filter(dichVu =>
              dichVu.homeStay && dichVu.homeStay.id === homestay.id
            )

            // Thêm thông tin homestay vào mỗi dịch vụ nếu chưa có
            const dichVuWithHomestay = filteredDichVu.map(dichVu => ({
              ...dichVu,
              homeStay: dichVu.homeStay || homestay
            }))

            // Thêm vào mảng tổng
            allDichVu.push(...dichVuWithHomestay)
          }
        } catch (error) {
          apiError.value = true
          apiErrorMessage.value = 'Không thể tải dữ liệu dịch vụ. Vui lòng thử lại sau.'
          toast.error('Không thể tải dữ liệu dịch vụ')
          console.error('Error fetching dich vu data:', error)
        }

        homestayDichVuList.value = allDichVu
        apiError.value = false

        // Cập nhật thông tin phân trang
        totalPages.value = Math.ceil(homestayDichVuList.value.length / pageSize.value) || 1
      } catch (e) {
        apiError.value = true
        apiErrorMessage.value = 'Không thể tải dữ liệu dịch vụ homestay. Vui lòng thử lại sau.'
        console.error('Error fetching homestay dich vu data:', e)
      } finally {
        loading.value = false
      }
    }

    // Format currency
    const formatCurrency = (value) => {
      if (!value) return '0 đ'
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    }

    // Filtered items
    const filteredItems = computed(() => {
      let filtered = homestayDichVuList.value

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm.value) {
        const key = searchTerm.value.toLowerCase()
        filtered = filtered.filter((item) =>
          item.homeStay?.tenHomestay?.toLowerCase().includes(key) ||
          item.tenDichVu?.toLowerCase().includes(key)
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
      homestayDichVuList,
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
      handleSearch,
      formatCurrency
    }
  },
}
</script>

<style scoped>
.homestay-dichvu-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  flex-grow: 1;
  max-width: 500px;
}

.search-control-group {
  display: flex;
  gap: 10px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 35px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
}

.alert {
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffecb5;
  color: #664d03;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #6b7280;
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
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.page-item {
  margin: 0 2px;
}

.page-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  color: #4b5563;
  text-decoration: none;
}

.page-item.active .page-link {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  pointer-events: none;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th {
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  padding: 12px 16px;
  text-align: center;
  border-bottom: 2px solid #e5e7eb;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.empty-row td {
  border-bottom: 1px solid #e5e7eb;
  height: 53px; /* Match the height of regular rows */
}

.table-hover tbody tr:hover {
  background-color: #f9fafb;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.bg-success {
  background-color: #10b981;
  color: white;
}

.bg-danger {
  background-color: #ef4444;
  color: white;
}
</style>
