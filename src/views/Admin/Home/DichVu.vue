<template>
  <div class="phong-container">
    <h1 class="page-title">Quản Lý Dịch Vụ</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchText"
              placeholder="Tìm kiếm dịch vụ..."
              class="search-input"
              @input="onSearchChange"
            />
            <button v-if="searchText" @click="clearSearch" class="clear-search-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="right-controls">
        <select
          class="form-select status-filter"
          v-model="filterStatus"
          @change="handleStatusChange(filterStatus)"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Ngừng hoạt động</option>
        </select>
        <button class="btn btn-primary add-button" @click="showAddModal">
          <i class="fas fa-plus-circle"></i>
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
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Dich Vu Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã</th>
            <th>Tên Dịch Vụ</th>
            <th>Giá</th>
            <th>Đơn Vị</th>
            <th>Homestay</th>
            <th>Mô Tả</th>
            <th>Trạng Thái</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in pagedDichVuList" :key="item.id" @dblclick="showDetailModal(item)">
            <td class="text-center">{{ calculateIndex(index) }}</td>
            <td class="text-center">{{ item.maDichVu }}</td>
            <td class="text-center">{{ item.tenDichVu }}</td>
            <td class="text-center">{{ formatCurrency(item.gia) }}</td>
            <td class="text-center">{{ item.donVi }}</td>
            <td class="text-center">{{ getHomestayName(item.homestayID) }}</td>
            <td class="text-center">{{ truncateText(item.moTa, 50) }}</td>
            <td class="text-center">
              <span :class="`badge ${item.trangThai ? 'bg-success' : 'bg-danger'}`">
                {{ item.trangThai ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
              </span>
            </td>
            <td class="text-center">
              <div class="action-buttons">
                <button class="btn btn-icon btn-warning-light" title="Chỉnh sửa" @click="editDichVu(item)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-danger-light" title="Xóa" @click="deleteDichVu(item.id)">
                  <i class="fas fa-trash"></i>
                </button>
                <button v-if="!item.trangThai" class="btn btn-icon btn-success-light" title="Khôi phục" @click="restoreDichVu(item)">
                  <i class="fas fa-reply"></i>
                </button>
              </div>
            </td>
          </tr>
          <!-- Empty rows to ensure space for 10 rows -->
          <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
            <td colspan="9">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && pagedDichVuList.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p v-if="searchText">Không tìm thấy dịch vụ nào phù hợp với từ khóa "{{ searchText }}".</p>
      <p v-else>Không tìm thấy dịch vụ nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && totalItems > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} dịch vụ
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li
            v-for="page in displayedPages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages || totalPages === 0 }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete()">
      <div class="confirmation-box">
        <button class="close-button" @click="cancelDelete">&times;</button>
        <div class="confirmation-body">
          <div class="confirm-icon-wrapper icon-danger">
            <i class="fas fa-trash-alt"></i>
          </div>
          <h4 class="confirm-title">Bạn có chắc chắn muốn xóa?</h4>
          <p class="confirm-text">
            Hành động này sẽ xóa dịch vụ với ID
            <strong>{{ selectedDichVuId }}</strong>. <br />Bạn có thể khôi phục lại sau này.
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
            Hành động này sẽ khôi phục dịch vụ
            <strong>{{ selectedDichVuToRestore?.tenDichVu }}</strong>.
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
          <h3>{{ isEdit ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới' }}</h3>
          <button class="close-button" @click="cancelForm">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveDichVu" class="dich-vu-form">
            <div class="form-group">
              <label for="tenDichVu">Tên Dịch Vụ <span class="required">*</span></label>
              <input id="tenDichVu" v-model="form.tenDichVu" class="form-control"
                :class="{ 'is-invalid': errorsFromBackend.tenDichVu }" placeholder="Nhập tên dịch vụ" maxlength="100"
                required />
              <small class="form-text text-muted">Tối đa 100 ký tự</small>
              <div v-if="errorsFromBackend.tenDichVu" class="error-feedback">{{ errorsFromBackend.tenDichVu }}</div>
            </div>
            <div class="form-group">
              <label for="homestayID">Homestay <span class="required">*</span></label>
              <select id="homestayID" v-model="form.homestayID" class="form-control"
                :class="{ 'is-invalid': errorsFromBackend.homestayID }" required>
                <option value="" disabled>Chọn Homestay</option>
                <option v-for="hs in homestays" :key="hs.id" :value="hs.id">
                  {{ hs.tenHomestay }}
                </option>
              </select>
              <small class="form-text text-muted">Bắt buộc chọn homestay</small>
              <div v-if="errorsFromBackend.homestayID" class="error-feedback">{{ errorsFromBackend.homestayID }}</div>
            </div>
            <div class="form-group">
              <label for="gia">Giá <span class="required">*</span></label>
              <input id="gia" v-model="form.gia" type="number" step="1000" min="1000" class="form-control"
                :class="{ 'is-invalid': errorsFromBackend.gia }" placeholder="Nhập giá dịch vụ (tối thiểu 1.000)"
                required />
              <small class="form-text text-muted">Giá phải lớn hơn hoặc bằng 1.000</small>
              <div v-if="errorsFromBackend.gia" class="error-feedback">{{ errorsFromBackend.gia }}</div>
            </div>
            <div class="form-group">
              <label for="donVi">Đơn Vị <span class="required">*</span></label>
              <select id="donVi" v-model="form.donVi" class="form-control"
                :class="{ 'is-invalid': errorsFromBackend.donVi }" required>
                <option value="" disabled>Chọn đơn vị tính</option>
                <option value="phần">Phần</option>
                <option value="lần">Lần</option>
                <option value="gói">Gói</option>
                <option value="kg">Kg</option>
                <option value="chuyến">Chuyến</option>
                <option value="suất">Suất</option>
                <option value="lượt">Lượt</option>
              </select>
              <small class="form-text text-muted">Đơn vị không được để trống</small>
              <div v-if="errorsFromBackend.donVi" class="error-feedback">{{ errorsFromBackend.donVi }}</div>
            </div>
            <div class="form-group">
              <label for="moTa">Mô Tả</label>
              <textarea id="moTa" v-model="form.moTa" class="form-control"
                :class="{ 'is-invalid': errorsFromBackend.moTa }" placeholder="Nhập mô tả về dịch vụ (không bắt buộc)"
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

    <!-- View Dich Vu Details Modal -->
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="staff-details-modal">
        <div class="modal-header">
          <h3>Chi Tiết Dịch Vụ</h3>
          <button class="close-button" @click="showDetail = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">ID:</span>
              <span class="detail-value">{{ detailDichVu.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Mã dịch vụ:</span>
              <span class="detail-value">{{ detailDichVu.maDichVu }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tên dịch vụ:</span>
              <span class="detail-value">{{ detailDichVu.tenDichVu }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Giá:</span>
              <span class="detail-value">{{ formatCurrency(detailDichVu.gia) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Đơn vị:</span>
              <span class="detail-value">{{ detailDichVu.donVi }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Homestay:</span>
              <span class="detail-value">{{ getHomestayName(detailDichVu.homestayID) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Mô tả:</span>
              <span class="detail-value">{{ detailDichVu.moTa || 'Không có' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Trạng thái:</span>
              <span :class="`badge ${detailDichVu.trangThai ? 'bg-success' : 'bg-danger'}`">
                {{ detailDichVu.trangThai ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
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
import {
  addDichVu,
  updateDichVu,
  deleteDichVu as deleteDichVuAPI,
  restoreDichVu as restoreDichVuAPI,
  getAllDichVu
} from '@/Service/dichVuService'
import { getAllHomeStay } from '@/Service/HomeStayService'
import notification from '@/utils/notification'

const dichVuList = ref([])
const homestays = ref([])
const showForm = ref(false)
const isEdit = ref(false)
const filterStatus = ref('all')
const searchText = ref('')
const loading = ref(true)
const processing = ref(false)
const showDeleteConfirm = ref(false)
const showRestoreConfirm = ref(false)
const selectedDichVuId = ref(null)
const selectedDichVuToRestore = ref(null)
const errorsFromBackend = ref({})
const apiError = ref(false)
const apiErrorMessage = ref('')

const form = ref({
  id: null,
  tenDichVu: '',
  homestayID: '',
  gia: '',
  donVi: 'Ngày', // Giá trị mặc định theo ràng buộc CHECK trong database
  moTa: '',
  trangThai: true
})

// Chi tiết dịch vụ
const showDetail = ref(false)
const detailDichVu = ref({})

// Phân trang - UI sử dụng 1-based
const currentPage = ref(1) // UI page index bắt đầu từ 1
const pageSize = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)

// Tính toán số hàng trống để bảng luôn có kích thước cố định
const emptyRows = computed(() => {
  const currentItems = pagedDichVuList.value.length
  return currentItems < pageSize.value ? pageSize.value - currentItems : 0
})

// Dịch vụ được hiển thị trên bảng
const pagedDichVuList = computed(() => {
  // Áp dụng phân trang client-side
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return dichVuList.value.slice(startIndex, endIndex)
})

const filteredDichVuList = computed(() => {
  let filtered = dichVuList.value;

  if (searchText.value) {
    const lowerCaseSearchTerm = searchText.value.trim().toLowerCase()
    filtered = filtered.filter(
      (item) =>
        (item.tenDichVu && item.tenDichVu.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.maDichVu && item.maDichVu.toLowerCase().includes(lowerCaseSearchTerm))
    )
  }

  if (filterStatus.value !== 'all') {
    const isActive = filterStatus.value === 'true'
    filtered = filtered.filter((item) => item.trangThai === isActive)
  }

  return filtered;
})

// Theo dõi sự thay đổi để load lại dữ liệu
watch([searchText, filterStatus], () => {
  currentPage.value = 1; // Reset về trang đầu tiên khi thay đổi lọc
}, { deep: true })

// Thông tin phân trang hiển thị cho người dùng
const startItem = computed(() => {
  if (totalItems.value === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
})

const endItem = computed(() => {
  const end = currentPage.value * pageSize.value;
  return Math.min(end, totalItems.value);
})

// Phân trang hiển thị
const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5; // Số trang tối đa hiển thị

  if (totalPages.value <= maxPages) {
    // Hiển thị tất cả trang nếu tổng số trang ít hơn maxPages
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Hiển thị một số trang xung quanh trang hiện tại
    let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages.value, startPage + maxPages - 1);

    // Điều chỉnh nếu không đủ trang ở phía trước
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  }

  return pages;
})

// Format giá tiền
function formatCurrency(value) {
  if (!value) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

// Rút ngắn nội dung text
function truncateText(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Lấy tên Homestay
function getHomestayName(id) {
  // Kiểm tra nếu id là null hoặc undefined
  if (id === null || id === undefined) {
    return "Chưa gán homestay";
  }

  // Đảm bảo id là số
  const numericId = Number(id);

  // Tìm homestay trong danh sách
  const homestay = homestays.value.find(h => h.id === numericId);

  return homestay ? homestay.tenHomestay : `Homestay ID: ${id}`
}

// Tính toán index cho STT
function calculateIndex(index) {
  return (currentPage.value - 1) * pageSize.value + index + 1;
}

async function fetchDichVu() {
  loading.value = true
  apiError.value = false
  try {
    // Tải dữ liệu homestay trước
    const homestaysRes = await getAllHomeStay()
    homestays.value = homestaysRes.data || []

    // Sau đó tải dữ liệu dịch vụ
    try {
      // Gọi API lấy tất cả dịch vụ
      const response = await getAllDichVu()

      if (!response.data) {
        apiError.value = true
        apiErrorMessage.value = 'Dữ liệu dịch vụ không đúng định dạng'
        notification.error('Dữ liệu dịch vụ không đúng định dạng')
        return
      }

      // Xử lý dữ liệu từ API
      dichVuList.value = response.data.map(dv => {
        // Tìm ID homestay từ các khả năng khác nhau
        let homestayId = null
        if (dv.homeStay && dv.homeStay.id) {
          homestayId = dv.homeStay.id
        } else if (dv.HomeStay_ID !== undefined) {
          homestayId = dv.HomeStay_ID
        } else if (dv.homestayID !== undefined) {
          homestayId = dv.homestayID
        } else if (dv.homeStayID !== undefined) {
          homestayId = dv.homeStayID
        }

        return {
          ...dv,
          // Đảm bảo trangThai là boolean
          trangThai: typeof dv.trangThai === 'boolean' ? dv.trangThai : dv.trangThai === 1,
          // Lưu ID homestay riêng để dễ tham chiếu
          homestayID: homestayId
        }
      })

      // Áp dụng lọc trước khi tính toán phân trang
      let filteredList = dichVuList.value;

      // Lọc theo trạng thái
      if (filterStatus.value !== 'all') {
        const isActive = filterStatus.value === 'true'
        filteredList = filteredList.filter(item => item.trangThai === isActive)
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchText.value.trim()) {
        const keyword = searchText.value.trim().toLowerCase()
        filteredList = filteredList.filter(
          item =>
            (item.tenDichVu && item.tenDichVu.toLowerCase().includes(keyword)) ||
            (item.maDichVu && item.maDichVu.toLowerCase().includes(keyword))
        )
      }

      // Cập nhật thông tin phân trang
      totalItems.value = filteredList.length
      totalPages.value = Math.ceil(totalItems.value / pageSize.value) || 1

      // Kiểm tra và điều chỉnh trang hiện tại nếu vượt quá số trang
      if (currentPage.value > totalPages.value) {
        currentPage.value = Math.max(1, totalPages.value)
      }

    } catch (error) {
      apiError.value = true
      apiErrorMessage.value = 'Lỗi khi tải dữ liệu dịch vụ. Vui lòng thử lại.'
      notification.error('Lỗi khi tải dữ liệu dịch vụ. Vui lòng kiểm tra console để biết chi tiết.')
      console.error('Error loading dich vu data:', error)
    }
  } catch (error) {
    apiError.value = true
    apiErrorMessage.value = 'Lỗi khi tải dữ liệu. Vui lòng thử lại.'
    notification.error('Lỗi khi tải dữ liệu')
    console.error('Fetch error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchDichVu)

// Xử lý khi thay đổi tìm kiếm
function onSearchChange() {
  currentPage.value = 1 // Reset về trang đầu tiên
  fetchDichVu() // Tải lại dữ liệu với từ khóa mới
}

// Xóa từ khóa tìm kiếm
function clearSearch() {
  searchText.value = ''
  currentPage.value = 1
  fetchDichVu()
}

// Xử lý khi thay đổi trạng thái
function handleStatusChange(status) {
  currentPage.value = 1 // Reset về trang đầu tiên
  filterStatus.value = status // Cập nhật trạng thái lọc
  fetchDichVu() // Tải lại dữ liệu với trạng thái mới
}

// Thay đổi trang
function changePage(page) {
  // Kiểm tra trang hợp lệ
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page

  // Tải lại dữ liệu với trang mới
  fetchDichVu()
}

function showAddModal() {
  showForm.value = true
  isEdit.value = false
  errorsFromBackend.value = {}
  form.value = {
    id: null,
    tenDichVu: '',
    homestayID: '',
    gia: '',
    donVi: 'Ngày', // Giá trị mặc định theo ràng buộc CHECK trong database
    moTa: '',
    trangThai: true
  }
}

function editDichVu(item) {
  showForm.value = true
  isEdit.value = true
  errorsFromBackend.value = {}
  form.value = {
    ...item,
    // Đảm bảo homestayID được đặt đúng
    homestayID: item.homestayID || (item.homeStay ? item.homeStay.id : null)
  }
}

function cancelForm() {
  showForm.value = false
  errorsFromBackend.value = {}
}

function showDetailModal(item) {
  detailDichVu.value = { ...item }
  showDetail.value = true
}

function deleteDichVu(id) {
  selectedDichVuId.value = id
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  selectedDichVuId.value = null
}

async function confirmDelete() {
  processing.value = true
  try {
    await deleteDichVuAPI(selectedDichVuId.value)
    notification.success('Đã xóa dịch vụ thành công!')
    await fetchDichVu()
  } catch (error) {
    notification.error('Lỗi khi xóa dịch vụ')
    console.error(error)
  } finally {
    processing.value = false
    showDeleteConfirm.value = false
  }
}

// Hiển thị modal xác nhận khôi phục
function showRestoreConfirmModal(item) {
  selectedDichVuToRestore.value = item
  showRestoreConfirm.value = true
}

function cancelRestore() {
  showRestoreConfirm.value = false
  selectedDichVuToRestore.value = null
}

async function confirmRestore() {
  processing.value = true
  try {
    // Sử dụng API khôi phục
    await restoreDichVuAPI(selectedDichVuToRestore.value.id)
    notification.success('Đã khôi phục dịch vụ thành công!')
    await fetchDichVu()
  } catch (error) {
    notification.error('Lỗi khi khôi phục dịch vụ')
    console.error(error)
  } finally {
    processing.value = false
    showRestoreConfirm.value = false
  }
}

// Sử dụng function cũ để tương thích với code hiện tại
function restoreDichVu(item) {
  showRestoreConfirmModal(item)
}

// Thêm client-side validation trước khi gửi form
const validateForm = () => {
  let ok = true;
  errorsFromBackend.value = {};               // reset lỗi cũ

  // Tên
  if (!form.value.tenDichVu.trim()) {
    errorsFromBackend.value.tenDichVu = 'Tên dịch vụ không được để trống';
    ok = false;
  } else if (form.value.tenDichVu.length > 100) {
    errorsFromBackend.value.tenDichVu = 'Tên dịch vụ tối đa 100 ký tự';
    ok = false;
  }

  // Giá
  const giaNumber = Number(form.value.gia);
  if (!giaNumber && giaNumber !== 0) {
    errorsFromBackend.value.gia = 'Giá không được để trống';
    ok = false;
  } else if (giaNumber < 1000) {
    errorsFromBackend.value.gia = 'Giá phải lớn hơn hoặc bằng 1 000';
    ok = false;
  }

  // Homestay
  if (!form.value.homestayID) {
    errorsFromBackend.value.homestayID = 'Vui lòng chọn homestay';
    ok = false;
  }

  // Đơn vị
  if (!form.value.donVi) {
    errorsFromBackend.value.donVi = 'Vui lòng chọn đơn vị';
    ok = false;
  }

  return ok;
};

async function saveDichVu() {
  if (!validateForm()) return;   // dừng nếu lỗi

  processing.value = true;
  try {
    const formattedData = {
      ...form.value,
      gia: parseFloat(form.value.gia || 0),
      trangThai: Boolean(form.value.trangThai),
      homeStay: {
        id: parseInt(form.value.homestayID || 0)
      }
    }

    if (isEdit.value) {
      await updateDichVu(form.value.id, formattedData)
      notification.success('Cập nhật dịch vụ thành công!')
      showForm.value = false
      await fetchDichVu()
    } else {
      await addDichVu(formattedData)
      notification.success('Thêm dịch vụ mới thành công!')
      showForm.value = false
      await fetchDichVu()
    }
  } catch (error) {
    console.error('Lỗi khi lưu dịch vụ:', error);

    if (error.response && error.response.data) {
      // Xử lý lỗi từ backend
      errorsFromBackend.value = error.response.data;

      // Hiển thị thông báo lỗi chung nếu có
      if (error.response.data.message) {
        notification.error(error.response.data.message);
      } else if (typeof error.response.data === 'string') {
        notification.error(error.response.data);
      } else {
        notification.error('Lỗi khi lưu dịch vụ. Vui lòng kiểm tra các trường thông tin.');
      }
    } else {
      notification.error('Lỗi khi kết nối với máy chủ');
    }
  } finally {
    processing.value = false;
  }
}
</script>

<style scoped>
/* Main Container Styling */
.phong-container {
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  min-height: 80vh;
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

/* Controls Styling */
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

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  line-height: 1;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  background-color: #f3f4f6;
  color: #6b7280;
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

/* Alert Styling */
.alert {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.alert-warning {
  background-color: #fff8e1;
  color: #f57c00;
  border-left: 4px solid #f57c00;
}

.btn-close {
  font-size: 18px;
  font-weight: 700;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
}

/* Table Styling */
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

.empty-row td {
  padding: 24.5px !important;
  border-bottom: none !important;
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

/* Form styling */
.dich-vu-form .form-group {
  margin-bottom: 20px;
}

.dich-vu-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}

.dich-vu-form .form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.dich-vu-form .form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  outline: none;
}

.dich-vu-form .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
}

.dich-vu-form .btn {
  padding: 10px 16px;
  font-weight: 500;
  border-radius: 8px;
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

/* Form validation styling */
.required {
  color: #dc2626;
  margin-left: 3px;
}

.form-text {
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 4px;
}

.is-invalid {
  border-color: #dc2626 !important;
}

.error-feedback {
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
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
