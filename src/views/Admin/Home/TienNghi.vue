<template>
  <div class="tiennghi-container">
    <h1 class="page-title">Quản Lý Tiện Nghi</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input type="text" v-model="searchText" placeholder="Tìm kiếm tiện nghi..." class="search-input"
              @input="onSearchChange" />
          </div>
        </div>
      </div>

      <div class="right-controls">
        <select class="form-select status-filter" v-model="filterStatus" @change="filterByStatus">
          <option value="Đang hoạt động">Đang hoạt động</option>
          <option value="Ngừng hoạt động">Ngừng hoạt động</option>
        </select>
        <button class="btn btn-primary add-button" @click="showAddModal">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Tien Nghi Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Tiện Nghi</th>
            <th>Đơn Vị</th>
            <th>Mô Tả</th>
            <th>Trạng Thái</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tienNghiList" :key="item.id" @dblclick="showDetailModal(item)">
            <td class="text-center">{{ item.id }}</td>
            <td class="text-center">{{ item.tenTienNghi }}</td>
            <td class="text-center">{{ item.donVi }}</td>
            <td class="text-center">{{ item.moTa }}</td>
            <td class="text-center">
              <span :class="`badge ${item.trangThai === 'Đang hoạt động' ? 'bg-success' : 'bg-danger'}`">
                {{ item.trangThai }}
              </span>
            </td>
            <td class="text-center">
              <div v-if="item.trangThai === 'Đang hoạt động'" class="action-buttons">
                <button class="btn btn-icon btn-warning-light" title="Chỉnh sửa" @click="editTienNghi(item)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-danger-light" title="Xóa" @click="deleteTienNghi(item.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div v-else class="action-buttons">
                <button class="btn btn-icon btn-success-light" title="Khôi phục" @click="showRestoreConfirmModal(item)">
                  <i class="fas fa-reply"></i>
                </button>
              </div>
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
    <div v-if="!loading && tienNghiList.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy tiện nghi nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && totalItems > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} tiện nghi
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 0 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: currentPage === page - 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 2)">
              <i class="fas fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Confirmation Modals -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete()">
      <!-- Delete Confirmation -->
      <div class="confirmation-box">
        <button class="close-button" @click="cancelDelete">&times;</button>
        <div class="confirmation-body">
          <div class="confirm-icon-wrapper icon-danger">
            <i class="fas fa-trash-alt"></i>
          </div>
          <h4 class="confirm-title">Bạn có chắc chắn muốn xóa?</h4>
          <p class="confirm-text">
            Hành động này sẽ xóa tiện nghi với ID
            <strong>{{ selectedTienNghiId }}</strong>. <br />Bạn có thể khôi phục lại sau này.
          </p>
        </div>
        <div class="confirmation-footer">
          <button class="btn btn-secondary" @click="cancelDelete">Hủy bỏ</button>
          <button class="btn btn-danger" @click="confirmDelete" :disabled="processing">
            <span v-if="processing" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-else>Xác nhận xóa</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Restore Confirmation Modal -->
    <div v-if="showRestoreConfirm" class="modal-overlay" @click.self="cancelRestore()">
      <div class="confirmation-box">
        <button class="close-button" @click="cancelRestore">&times;</button>
        <div class="confirmation-body">
          <div class="confirm-icon-wrapper icon-success">
            <i class="fas fa-undo"></i>
          </div>
          <h4 class="confirm-title">Bạn có chắc chắn muốn khôi phục?</h4>
          <p class="confirm-text">
            Hành động này sẽ khôi phục tiện nghi
            <strong>{{ selectedTienNghiToRestore?.tenTienNghi }}</strong> (ID: {{ selectedTienNghiToRestore?.id }}).
          </p>
        </div>
        <div class="confirmation-footer">
          <button class="btn btn-secondary" @click="cancelRestore">Hủy bỏ</button>
          <button class="btn btn-success" @click="confirmRestore" :disabled="processing">
            <span v-if="processing" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-else>Xác nhận khôi phục</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Form Thêm/Sửa Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="cancelForm">
      <div class="modal-form">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Sửa Tiện Nghi' : 'Thêm Tiện Nghi Mới' }}</h3>
          <button class="close-button" @click="cancelForm">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveTienNghi" class="tien-nghi-form">
            <div class="form-group">
              <label for="tenTienNghi">Tên Tiện Nghi <span class="required">*</span></label>
              <input id="tenTienNghi" v-model="form.tenTienNghi" class="form-control"
                :class="{ 'is-invalid': errorsFromBackend.tenTienNghi }" placeholder="Nhập tên tiện nghi"
                maxlength="100" required />
              <small class="form-text text-muted">Tối đa 100 ký tự</small>
              <div v-if="errorsFromBackend.tenTienNghi" class="error-feedback">{{ errorsFromBackend.tenTienNghi }}</div>
            </div>
            <div class="form-group">
              <label for="donVi">Đơn Vị <span class="required">*</span></label>
              <input id="donVi" v-model="form.donVi" class="form-control"
                :class="{ 'is-invalid': errorsFromBackend.donVi }" placeholder="Nhập đơn vị tính" maxlength="20"
                required />
              <small class="form-text text-muted">Tối đa 20 ký tự</small>
              <div v-if="errorsFromBackend.donVi" class="error-feedback">{{ errorsFromBackend.donVi }}</div>
            </div>
            <div class="form-group">
              <label for="moTa">Mô Tả</label>
              <textarea id="moTa" v-model="form.moTa" class="form-control"
                :class="{ 'is-invalid': errorsFromBackend.moTa }" placeholder="Nhập mô tả về tiện nghi (không bắt buộc)"
                rows="3" maxlength="255"></textarea>
              <small class="form-text text-muted">Tối đa 255 ký tự</small>
              <div v-if="errorsFromBackend.moTa" class="error-feedback">{{ errorsFromBackend.moTa }}</div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="cancelForm">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary" :disabled="processing">
                <span v-if="processing" class="spinner-border spinner-border-sm" role="status"
                  aria-hidden="true"></span>
                <span v-else>{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Tien Nghi Details Modal -->
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="staff-details-modal">
        <div class="modal-header">
          <h3>Chi Tiết Tiện Nghi</h3>
          <button class="close-button" @click="showDetail = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">ID:</span>
              <span class="detail-value">{{ detailTienNghi.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tên tiện nghi:</span>
              <span class="detail-value">{{ detailTienNghi.tenTienNghi }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Đơn vị:</span>
              <span class="detail-value">{{ detailTienNghi.donVi }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Mô tả:</span>
              <span class="detail-value">{{ detailTienNghi.moTa || 'Không có' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Trạng thái:</span>
              <span :class="`badge ${detailTienNghi.trangThai === 'Đang hoạt động' ? 'bg-success' : 'bg-danger'}`">
                {{ detailTienNghi.trangThai }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { searchTienNghi, addTienNghi, updateTienNghi, deleteTienNghi as deleteTienNghiAPI, restoreTienNghi as restoreTienNghiAPI } from '@/Service/TienNghiService'
import notification from '@/utils/notification'

const tienNghiList = ref([])
const showForm = ref(false)
const isEdit = ref(false)
const filterStatus = ref('Đang hoạt động')
const searchText = ref('')
const loading = ref(true)
const processing = ref(false)
const showDeleteConfirm = ref(false)
const selectedTienNghiId = ref(null)
const showRestoreConfirm = ref(false)
const selectedTienNghiToRestore = ref(null)
const errorsFromBackend = ref({})

const form = ref({
  id: null,
  tenTienNghi: '',
  donVi: '',
  moTa: '',
  trangThai: 'Đang hoạt động',
})

// Chi tiết tiện nghi
const showDetail = ref(false)
const detailTienNghi = ref({})

// Phân trang
const currentPage = ref(0) // API sử dụng 0-based page index
const pageSize = ref(10) // Số hàng mỗi trang là 10
const totalItems = ref(0)
const totalPages = ref(1)

// Tính toán số hàng trống để bảng luôn có kích thước cố định
const emptyRows = computed(() => {
  const currentItems = tienNghiList.value.length
  return currentItems < pageSize.value ? pageSize.value - currentItems : 0
})

// Chuyển đổi giá trị trạng thái hiển thị sang boolean cho API
const statusForApi = computed(() => {
  if (filterStatus.value === 'Đang hoạt động') return true
  if (filterStatus.value === 'Ngừng hoạt động') return false
  return null
})

// Thông tin phân trang
const startItem = computed(() =>
  totalItems.value > 0 ? currentPage.value * pageSize.value + 1 : 0
)
const endItem = computed(() => {
  const end = (currentPage.value + 1) * pageSize.value
  return end > totalItems.value ? totalItems.value : end
})

// Hiển thị các trang phân trang
const displayedPages = computed(() => {
  const maxDisplayed = 5
  const pages = []
  if (totalPages.value <= maxDisplayed) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  } else {
    if (currentPage.value <= 3) {
      pages.push(1, 2, 3, 4, 5)
    } else if (currentPage.value >= totalPages.value - 4) {
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) pages.push(i)
    } else {
      for (let i = currentPage.value - 1; i <= currentPage.value + 3; i++) pages.push(i)
    }
  }
  return pages
})

// Theo dõi sự thay đổi của searchText, filterStatus, currentPage, pageSize
watch([searchText, filterStatus, currentPage, pageSize], fetchTienNghi, { deep: true })

async function fetchTienNghi() {
  loading.value = true
  try {
    const response = await searchTienNghi({
      keyword: searchText.value.trim(),
      status: statusForApi.value,
      page: currentPage.value,
      size: pageSize.value
    })

    // Xử lý dữ liệu trả về từ API
    tienNghiList.value = response.data.content.map(item => ({
      ...item,
      trangThai: item.trangThai ? 'Đang hoạt động' : 'Ngừng hoạt động'
    }))

    // Cập nhật thông tin phân trang
    totalItems.value = response.data.totalElements
    totalPages.value = response.data.totalPages || 1

    // Điều chỉnh trang hiện tại nếu nó vượt quá tổng số trang
    if (currentPage.value >= totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value - 1
    }
  } catch (error) {
    notification.error('Lỗi khi tải dữ liệu tiện nghi')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchTienNghi)

// Xử lý khi thay đổi tìm kiếm
function onSearchChange() {
  // Đặt lại trang về 0 khi thay đổi từ khóa tìm kiếm
  currentPage.value = 0
}

// Xử lý khi thay đổi trạng thái
function filterByStatus() {
  // Đặt lại trang về 0 khi thay đổi trạng thái
  currentPage.value = 0
}

// Thay đổi trang (hiển thị dựa trên index 1)
function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page - 1 // Chuyển đổi từ 1-based UI sang 0-based API
}

function showAddModal() {
  showForm.value = true
  isEdit.value = false
  errorsFromBackend.value = {}
  form.value = {
    id: null,
    tenTienNghi: '',
    donVi: '',
    moTa: '',
    trangThai: 'Đang hoạt động',
  }
}

function editTienNghi(item) {
  showForm.value = true
  isEdit.value = true
  errorsFromBackend.value = {}
  form.value = { ...item }
}

function cancelForm() {
  showForm.value = false
  errorsFromBackend.value = {}
}

function showDetailModal(item) {
  detailTienNghi.value = { ...item }
  showDetail.value = true
}

function deleteTienNghi(id) {
  selectedTienNghiId.value = id
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  selectedTienNghiId.value = null
}

async function confirmDelete() {
  processing.value = true
  try {
    await deleteTienNghiAPI(selectedTienNghiId.value)
    notification.success('Đã xóa tiện nghi thành công!')
    await fetchTienNghi()
  } catch (error) {
    notification.error('Lỗi khi xóa tiện nghi')
    console.error(error)
  } finally {
    processing.value = false
    showDeleteConfirm.value = false
  }
}

function showRestoreConfirmModal(item) {
  selectedTienNghiToRestore.value = item
  showRestoreConfirm.value = true
}

function cancelRestore() {
  showRestoreConfirm.value = false
  selectedTienNghiToRestore.value = null
}

async function confirmRestore() {
  processing.value = true
  try {
    await restoreTienNghiAPI(selectedTienNghiToRestore.value.id)
    notification.success('Đã khôi phục tiện nghi thành công!')
    await fetchTienNghi()
  } catch (error) {
    notification.error('Lỗi khi khôi phục tiện nghi')
    console.error(error)
  } finally {
    processing.value = false
    showRestoreConfirm.value = false
  }
}

// Validation function based on TienNghi.java entity constraints
const validateForm = () => {
  let ok = true;
  errorsFromBackend.value = {};

  // Tên tiện nghi (required, max 100 chars)
  if (!form.value.tenTienNghi.trim()) {
    errorsFromBackend.value.tenTienNghi = 'Tên tiện nghi không được để trống';
    ok = false;
  } else if (form.value.tenTienNghi.length > 100) {
    errorsFromBackend.value.tenTienNghi = 'Tên tiện nghi tối đa 100 ký tự';
    ok = false;
  }

  // Đơn vị (required, max 20 chars)
  if (!form.value.donVi.trim()) {
    errorsFromBackend.value.donVi = 'Đơn vị không được để trống';
    ok = false;
  } else if (form.value.donVi.length > 20) {
    errorsFromBackend.value.donVi = 'Đơn vị tối đa 20 ký tự';
    ok = false;
  }

  // Mô tả (max 255 chars)
  if (form.value.moTa && form.value.moTa.length > 255) {
    errorsFromBackend.value.moTa = 'Mô tả tối đa 255 ký tự';
    ok = false;
  }

  return ok;
};

async function saveTienNghi() {
  if (!validateForm()) return;  // dừng nếu lỗi

  processing.value = true
  try {
    const payload = {
      ...form.value,
      trangThai: form.value.trangThai === 'Đang hoạt động',
    }
    if (isEdit.value) {
      await updateTienNghi(form.value.id, payload)
      notification.success('Cập nhật tiện nghi thành công!')
      showForm.value = false
      await fetchTienNghi()
    } else {
      await addTienNghi(payload)
      notification.success('Thêm tiện nghi mới thành công!')
      showForm.value = false
      await fetchTienNghi()
    }
  } catch (error) {
    console.error('Lỗi khi lưu tiện nghi:', error);

    if (error.response && error.response.data) {
      // Xử lý lỗi từ backend
      errorsFromBackend.value = error.response.data;

      // Hiển thị thông báo lỗi chung nếu có
      if (error.response.data.message) {
        notification.error(error.response.data.message);
      } else if (typeof error.response.data === 'string') {
        notification.error(error.response.data);
      } else {
        notification.error('Lỗi khi lưu tiện nghi. Vui lòng kiểm tra các trường thông tin.');
      }
    } else {
      notification.error('Lỗi khi kết nối với máy chủ');
    }
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
/* Main Container Styling */
.tien-nghi-container {
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
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

.search-input-wrapper:hover .search-icon {
  color: #495057;
}

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
  padding: 0 20px;
  gap: 10px;
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

.table-responsive {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 20px;
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

.table .badge {
  padding: 6px 12px;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 0.85rem;
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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  border: none;
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

.btn-success-light {
  background-color: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

.btn-success-light:hover {
  background-color: rgba(40, 167, 69, 0.3);
  color: #218838;
}

.btn-info-light {
  color: #0284c7;
  background-color: rgba(2, 132, 199, 0.15);
}

.btn-info-light:hover {
  background-color: rgba(2, 132, 199, 0.3);
  color: #0270aa;
}

.empty-row td {
  padding: 24.5px !important;
  border-bottom: none !important;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

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

.pagination-container {
  padding: 20px 10px 10px;
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
}

/* Button styles */
.btn {
  padding: 10px 16px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #0d6efd, #0099ff);
  border-color: transparent;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0a58ca, #0077cc);
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #5a6268;
  transform: translateY(-2px);
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
  transform: translateY(-2px);
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
  transform: translateY(-2px);
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 15px;
}

.modal-form,
.staff-details-modal,
.confirmation-box {
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  width: 550px;
  max-width: 95%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-fade-in 0.3s ease;
  overflow: hidden;
}

.staff-details-modal {
  width: 500px;
}

.confirmation-box {
  width: 450px;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 25px;
  max-height: 70vh;
  overflow-y: auto;
}

.tien-nghi-form .form-group {
  margin-bottom: 20px;
}

.tien-nghi-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}

.tien-nghi-form .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
}

/* Detail View Styling */
.detail-content {
  padding: 5px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.detail-label {
  font-weight: 500;
  color: #4b5563;
  width: 120px;
  flex-shrink: 0;
}

.detail-value {
  flex-grow: 1;
  color: #111827;
}

/* Confirmation Modal */
.confirmation-body {
  text-align: center;
  padding: 25px 30px;
}

.confirm-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin-bottom: 15px;
  font-size: 28px;
}

.icon-danger {
  background-color: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.icon-success {
  background-color: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #111827;
}

.confirm-text {
  color: #6b7280;
  font-size: 15px;
  margin-bottom: 0;
}

.confirmation-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 15px 25px 25px;
  border-top: 1px solid #e5e7eb;
}

/* Form fields */
.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.25s ease;
  color: #495057;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25);
  outline: none;
}

/* Backend validation error styling */
.is-invalid {
  border-color: #dc2626 !important;
}

.error-feedback {
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}

.required {
  color: #dc2626;
  margin-left: 3px;
}

.form-text {
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 4px;
}
</style>
