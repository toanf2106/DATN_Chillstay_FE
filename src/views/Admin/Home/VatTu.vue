<template>
  <div class="vat-tu-container">
    <h1 class="page-title">Quản Lý Vật Tư</h1>

    <div class="controls-container">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          v-model="searchText"
          placeholder="Tìm kiếm vật tư..."
          class="search-input"
          @input="onSearchChange"
        />
      </div>

      <div class="right-controls">
        <select class="form-select status-filter" v-model="filterStatus" @change="filterByStatus">
          <option value="Đang hoạt động">Đang hoạt động</option>
          <option value="Ngừng hoạt động">Ngừng hoạt động</option>
        </select>
        <button class="btn btn-primary add-button" @click="showAddModal">
          <i class="fas fa-plus-circle"></i>
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Vat Tu Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>ID</th>
            <th>Tên Vật Tư</th>
            <th>Đơn Vị</th>
            <th>Mô Tả</th>
            <th>Trạng Thái</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, idx) in pagedVatTuList"
            :key="item.id"
            @dblclick="showDetailModal(item)"
          >
            <td class="text-center">{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
            <td class="text-center">{{ item.id }}</td>
            <td class="text-center">{{ item.tenVatTu }}</td>
            <td class="text-center">{{ item.donVi }}</td>
            <td class="text-center">{{ item.moTa }}</td>
            <td class="text-center">
              <span
                :class="`badge ${item.trangThai === 'Đang hoạt động' ? 'bg-success' : 'bg-danger'}`"
              >
                {{ item.trangThai }}
              </span>
            </td>
            <td class="text-center">
              <div v-if="item.trangThai === 'Đang hoạt động'" class="action-buttons">
                <button
                  class="btn btn-icon btn-warning-light"
                  title="Chỉnh sửa"
                  @click="editVatTu(item)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-icon btn-danger-light"
                  title="Xóa"
                  @click="deleteVatTu(item.id)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div v-else class="action-buttons">
                <button
                  class="btn btn-icon btn-success-light"
                  title="Khôi phục"
                  @click="restoreVatTu(item)"
                >
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
    <div v-if="!loading && pagedVatTuList.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy vật tư nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredVatTuList.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} vật tư
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link nav-arrow" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link nav-arrow" href="#" @click.prevent="changePage(currentPage + 1)">
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
            Hành động này sẽ xóa vật tư với ID
            <strong>{{ selectedVatTuId }}</strong
            >. <br />Bạn có thể khôi phục lại sau này.
          </p>
        </div>
        <div class="confirmation-footer">
          <button class="btn btn-secondary" @click="cancelDelete">Hủy bỏ</button>
          <button class="btn btn-danger" @click="confirmDelete" :disabled="processing">
            <span
              v-if="processing"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else>Xác nhận xóa</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Form Thêm/Sửa Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="cancelForm">
      <div class="modal-form">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Sửa Vật Tư' : 'Thêm Vật Tư Mới' }}</h3>
          <button class="close-button" @click="cancelForm">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveVatTu" class="vat-tu-form">
            <div class="form-group">
              <label for="tenVatTu">Tên Vật Tư</label>
              <input
                id="tenVatTu"
                v-model="form.tenVatTu"
                class="form-control"
                placeholder="Nhập tên vật tư"
                required
              />
            </div>
            <div class="form-group">
              <label for="donVi">Đơn Vị</label>
              <input
                id="donVi"
                v-model="form.donVi"
                class="form-control"
                placeholder="Nhập đơn vị tính"
                required
              />
            </div>
            <div class="form-group">
              <label for="moTa">Mô Tả</label>
              <textarea
                id="moTa"
                v-model="form.moTa"
                class="form-control"
                placeholder="Nhập mô tả về vật tư (không bắt buộc)"
                rows="3"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="cancelForm">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary">
                {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Vat Tu Details Modal -->
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="staff-details-modal">
        <div class="modal-header">
          <h3>Chi Tiết Vật Tư</h3>
          <button class="close-button" @click="showDetail = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">ID:</span>
              <span class="detail-value">{{ detailVatTu.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tên vật tư:</span>
              <span class="detail-value">{{ detailVatTu.tenVatTu }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Đơn vị:</span>
              <span class="detail-value">{{ detailVatTu.donVi }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Mô tả:</span>
              <span class="detail-value">{{ detailVatTu.moTa || 'Không có' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Trạng thái:</span>
              <span
                :class="`badge ${detailVatTu.trangThai === 'Đang hoạt động' ? 'bg-success' : 'bg-danger'}`"
              >
                {{ detailVatTu.trangThai }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'
import notification from '@/utils/notification'
import {
  getVatTuList,
  createVatTu,
  updateVatTu,
  deleteVatTu as apiDeleteVatTu,
  resetVatTu as apiResetVatTu,
  searchVatTu,
} from '@/Service/vatTuService'

const vatTuList = ref([])
const showForm = ref(false)
const isEdit = ref(false)
const filterStatus = ref('Đang hoạt động')
const searchText = ref('')
const loading = ref(true)
const processing = ref(false)
const showDeleteConfirm = ref(false)
const selectedVatTuId = ref(null)
const form = ref({
  id: null,
  tenVatTu: '',
  donVi: '',
  moTa: '',
  trangThai: 'Đang hoạt động',
})

// Chi tiết vật tư
const showDetail = ref(false)
const detailVatTu = ref({})

const currentPage = ref(1)
const pageSize = ref(10) // Tăng số hàng mỗi trang lên 10 như trang nhân viên

// Tính toán số hàng trống để bảng luôn có kích thước cố định
const emptyRows = computed(() => {
  const currentItems = pagedVatTuList.value.length
  return currentItems < pageSize.value ? pageSize.value - currentItems : 0
})

// Lọc theo trạng thái và từ khóa tìm kiếm
const filteredVatTuList = computed(() =>
  vatTuList.value.filter(
    (v) =>
      v.trangThai === filterStatus.value &&
      (v.tenVatTu.toLowerCase().includes(searchText.value.trim().toLowerCase()) ||
        String(v.id).includes(searchText.value.trim()) ||
        v.donVi.toLowerCase().includes(searchText.value.trim().toLowerCase()) ||
        (v.moTa && v.moTa.toLowerCase().includes(searchText.value.trim().toLowerCase()))),
  ),
)

// Danh sách vật tư đã phân trang
const pagedVatTuList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredVatTuList.value.slice(start, start + pageSize.value)
})

// Tổng số trang
const totalPages = computed(() => Math.ceil(filteredVatTuList.value.length / pageSize.value) || 1)

// Thông tin phân trang
const totalItems = computed(() => filteredVatTuList.value.length)
const startItem = computed(() =>
  filteredVatTuList.value.length > 0 ? (currentPage.value - 1) * pageSize.value + 1 : 0,
)
const endItem = computed(() => {
  const end = currentPage.value * pageSize.value
  return end > totalItems.value ? totalItems.value : end
})

async function fetchVatTu() {
  loading.value = true
  try {
    const res = await api.get('/api/vattu/all')
    vatTuList.value = res.data.map((v) => ({
      ...v,
      trangThai: v.trangThai ? 'Đang hoạt động' : 'Ngừng hoạt động',
    }))
  } catch (error) {
    notification.error('Lỗi khi tải dữ liệu vật tư')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchVatTu)

// Xử lý khi thay đổi tìm kiếm
function onSearchChange() {
  currentPage.value = 1
}

// Xử lý khi thay đổi trạng thái
function filterByStatus() {
  currentPage.value = 1
}

// Thay đổi trang
function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

function showAddModal() {
  showForm.value = true
  isEdit.value = false
  form.value = {
    id: null,
    tenVatTu: '',
    donVi: '',
    moTa: '',
    trangThai: 'Đang hoạt động',
  }
}

function editVatTu(item) {
  showForm.value = true
  isEdit.value = true
  form.value = { ...item }
}

function cancelForm() {
  showForm.value = false
}

function showDetailModal(item) {
  detailVatTu.value = { ...item }
  showDetail.value = true
}

function deleteVatTu(id) {
  selectedVatTuId.value = id
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  selectedVatTuId.value = null
}

async function confirmDelete() {
  processing.value = true
  try {
    await apiDeleteVatTu(selectedVatTuId.value)
    notification.success('Đã xóa vật tư thành công!')
    await fetchVatTu()
  } catch (error) {
    notification.error('Lỗi khi xóa vật tư')
    console.error(error)
  } finally {
    processing.value = false
    showDeleteConfirm.value = false
  }
}

async function restoreVatTu(item) {
  processing.value = true
  try {
    await api.put(`/api/vattu/update/${item.id}`, {
      ...item,
      trangThai: true,
    })
    notification.success('Đã khôi phục vật tư thành công!')
    await fetchVatTu()
  } catch (error) {
    notification.error('Lỗi khi khôi phục vật tư')
    console.error(error)
  } finally {
    processing.value = false
  }
}

async function saveVatTu() {
  processing.value = true
  try {
    const payload = {
      ...form.value,
      trangThai: form.value.trangThai === 'Đang hoạt động',
    }
    if (isEdit.value) {
      await updateVatTu(form.value.id, payload)
      notification.success('Cập nhật vật tư thành công!')
    } else {
      await createVatTu(payload)
      notification.success('Thêm vật tư mới thành công!')
    }
    showForm.value = false
    await fetchVatTu()
  } catch (error) {
    notification.error('Lỗi khi lưu vật tư')
    console.error(error)
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
/* Main Container Styling */
.vat-tu-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  padding: 25px;
  margin-bottom: 30px;
  min-height: 80vh;
}

.page-title {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 25px;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 10px;
}

/* Controls Styling */
.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-box {
  position: relative;
  flex-grow: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  outline: none;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-filter {
  padding: 10px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  min-width: 180px;
}

.add-button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 0;
  border: none;
  background-color: #2563eb;
  transition: all 0.2s ease;
}

.add-button:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
}

.add-button i {
  font-size: 20px;
}

/* Table Styling */
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.table th {
  background-color: #f3f4f6;
  padding: 12px 15px;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.table tr:last-child td {
  border-bottom: none;
}

.table tbody tr:hover {
  background-color: #f9fafb;
}

.table .badge {
  padding: 6px 12px;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 0.85rem;
}

.bg-success {
  background-color: #10b981 !important;
}

.bg-danger {
  background-color: #ef4444 !important;
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
  border: none;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.btn-warning-light {
  color: #d97706;
  background-color: #fef3c7;
}

.btn-danger-light {
  color: #dc2626;
  background-color: #fee2e2;
}

.btn-success-light {
  color: #059669;
  background-color: #d1fae5;
}

.btn-info-light {
  color: #0284c7;
  background-color: #e0f2fe;
}

.btn-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.empty-row td {
  height: 54px;
  background-color: #f9fafb;
}

/* Loading Indicator */
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  flex-wrap: wrap;
  gap: 15px;
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
  gap: 8px;
}

.page-item {
  margin: 0;
}

.page-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #4b5563;
  background-color: #f9fafb;
  border: none;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.page-link:hover {
  background-color: #e5e7eb;
}

.page-item.active .page-link {
  background-color: #2563eb;
  color: #fff;
}

.page-item.disabled .page-link {
  color: #d1d5db;
  pointer-events: none;
  cursor: default;
  opacity: 0.6;
  background-color: #f3f4f6;
}

.nav-arrow {
  color: #6b7280;
  font-size: 12px;
  background-color: #f9fafb;
}

/* Button Styling */
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

.btn:focus {
  box-shadow: none;
}

.btn-primary {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-primary:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.btn-secondary {
  background-color: #6b7280;
  border-color: #6b7280;
}

.btn-secondary:hover {
  background-color: #4b5563;
  border-color: #4b5563;
}

.btn-danger {
  background-color: #dc2626;
  border-color: #dc2626;
}

.btn-danger:hover {
  background-color: #b91c1c;
  border-color: #b91c1c;
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

.vat-tu-form .form-group {
  margin-bottom: 20px;
}

.vat-tu-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}

.vat-tu-form .form-actions {
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
  background-color: #fee2e2;
  color: #dc2626;
}

.icon-success {
  background-color: #d1fae5;
  color: #059669;
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

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  font-family: 'Roboto', sans-serif !important;
  font-size: 0.95rem;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  outline: none;
}

/* Đảm bảo hiển thị tiếng Việt đúng */
input,
textarea,
label,
span,
h3,
h4,
p,
button {
  font-family: 'Roboto', sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
