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

      <div class="right-controls">
        <select
          class="form-select status-filter"
          v-model="selectedStatus"
          @change="handleStatusChange"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
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
              <span :class="`badge ${item.trangThai ? 'bg-success' : 'bg-danger'} status-badge`">
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
    const selectedStatus = ref('all')

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

      // Lọc theo trạng thái
      if (selectedStatus.value !== 'all') {
        const isActive = selectedStatus.value === 'active'
        filtered = filtered.filter((item) => item.trangThai === isActive)
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

    // Status filter method
    const handleStatusChange = () => {
      currentPage.value = 0 // Reset về trang đầu tiên khi lọc trạng thái
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
      formatCurrency,
      selectedStatus,
      handleStatusChange
    }
  },
}
</script>

<style scoped>
.homestay-dichvu-container {
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

.btn-info-light {
  background-color: rgba(13, 202, 240, 0.15);
  color: #0dcaf0;
}

.btn-info-light:hover {
  background-color: rgba(13, 202, 240, 0.3);
  color: #0aa2c0;
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
