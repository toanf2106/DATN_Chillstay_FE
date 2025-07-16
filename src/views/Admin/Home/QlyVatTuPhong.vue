<template>
  <div class="vattu-phong-container">
    <h1 class="page-title">Quản Lý Vật Tư Phòng</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Tìm kiếm theo tên phòng hoặc vật tư..."
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
        <select class="form-select status-filter" v-model="filterStatus" @change="filterByStatus">
          <option value="all">Tất cả</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Ngừng hoạt động</option>
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

    <!-- Vật Tư Phòng Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Phòng</th>
            <th>Vật tư</th>
            <th>Số lượng</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in paginatedItems"
            :key="`${item.phong?.id}-${item.vatTu?.id}`"
          >
            <td class="text-center">{{ index + 1 + currentPage * pageSize }}</td>
            <td class="text-center">{{ item.phong?.tenPhong }}</td>
            <td class="text-center">{{ item.vatTu?.tenVatTu }}</td>
            <td class="text-center">{{ item.soLuong }} {{ item.vatTu?.donVi || 'cái' }}</td>
            <td class="text-center">
              <span :class="`badge ${item.trangThai ? 'bg-success' : 'bg-danger'}`">
                {{ item.trangThai ? 'Hoạt động' : 'Ngừng hoạt động' }}
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
      <p>Không tìm thấy vật tư phòng nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredItems.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} vật tư phòng
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
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from '@/stores/notificationStore'
import { getAllVatTuPhong } from '@/Service/vatTuPhongService'

export default {
  name: 'QlyVatTuPhong',
  setup() {
    const toast = useToast()
    const vatTuPhongList = ref([])
    const searchTerm = ref('')
    const filterStatus = ref('all')
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
        const response = await getAllVatTuPhong()
        vatTuPhongList.value = response.data || []
        apiError.value = false

        // Cập nhật thông tin phân trang
        totalPages.value = Math.ceil(vatTuPhongList.value.length / pageSize.value) || 1
      } catch (e) {
        apiError.value = true
        apiErrorMessage.value = 'Không thể tải dữ liệu vật tư phòng. Vui lòng thử lại sau.'
        console.error('Error fetching vat tu phong data:', e)
        toast.error('Không thể tải dữ liệu vật tư phòng')
      } finally {
        loading.value = false
      }
    }

    // Filtered items
    const filteredItems = computed(() => {
      let filtered = vatTuPhongList.value

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm.value) {
        const key = searchTerm.value.toLowerCase()
        filtered = filtered.filter((item) =>
          item.phong?.tenPhong?.toLowerCase().includes(key) ||
          item.vatTu?.tenVatTu?.toLowerCase().includes(key)
        )
      }

      // Lọc theo trạng thái
      if (filterStatus.value !== 'all') {
        const status = filterStatus.value === 'true'
        filtered = filtered.filter(item => item.trangThai === status)
      }

      return filtered
    })

    // Cập nhật totalPages khi filteredItems thay đổi
    watch(filteredItems, (newItems) => {
      totalPages.value = Math.ceil(newItems.length / pageSize.value) || 1
      // Reset về trang đầu nếu trang hiện tại vượt quá tổng số trang
      if (currentPage.value >= totalPages.value) {
        currentPage.value = 0
      }
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

    // Filter methods
    const filterByStatus = () => {
      currentPage.value = 0 // Reset về trang đầu tiên khi lọc
    }

    // Fetch data on component mount
    onMounted(() => {
      fetchData()
    })

    return {
      vatTuPhongList,
      searchTerm,
      filterStatus,
      apiError,
      apiErrorMessage,
      loading,
      currentPage,
      pageSize,
      filteredItems,
      paginatedItems,
      totalItems,
      totalPages,
      startItem,
      endItem,
      emptyRows,
      changePage,
      handleSearch,
      filterByStatus
    }
  }
}
</script>

<style scoped>
.vattu-phong-container {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  width: 50%;
}

.search-control-group {
  display: flex;
  align-items: center;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 35px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
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
}

.right-controls {
  display: flex;
  gap: 10px;
}

.status-filter {
  width: auto;
  min-width: 150px;
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.table-responsive {
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  text-align: center;
  padding: 12px 8px;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 10px 8px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

tr:hover td {
  background-color: #f8f9fa;
}

.badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.8rem;
}

.bg-success {
  background-color: #28a745 !important;
}

.bg-danger {
  background-color: #dc3545 !important;
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
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.btn-warning-light:hover {
  background-color: #ffc107;
  color: #fff;
}

.btn-danger-light {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid #dc3545;
}

.btn-danger-light:hover {
  background-color: #dc3545;
  color: #fff;
}

.btn-success-light {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 1px solid #28a745;
}

.btn-success-light:hover {
  background-color: #28a745;
  color: #fff;
}

.empty-row td {
  border-bottom: none;
  background-color: #fff !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 15px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination {
  margin: 0;
}

.page-link {
  color: #0d6efd;
  padding: 6px 12px;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.nav-arrow {
  padding: 6px 10px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-form {
  background-color: #fff;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.required {
  color: #dc3545;
}

/* Confirmation box */
.confirmation-box {
  background-color: #fff;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.confirmation-body {
  padding: 30px 20px;
  text-align: center;
}

.confirm-icon-wrapper {
  width: 70px;
  height: 70px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.icon-danger {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.icon-success {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.confirm-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.confirm-text {
  color: #6c757d;
  margin-bottom: 0;
}

.confirmation-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  border-top: 1px solid #e9ecef;
}
</style>
