<template>
  <div class="dich-vu-container">
    <h1 class="page-title">Quản Lý Dịch Vụ</h1>

    <div class="controls-container">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input type="text" v-model="searchText" placeholder="Tìm kiếm dịch vụ..." class="search-input"
          @input="onSearchChange" />
      </div>

      <div class="right-controls">
        <select class="form-select status-filter" v-model="filterStatus" @change="filterByStatus">
          <option value="true">Đang hoạt động</option>
          <option value="false">Ngừng hoạt động</option>
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
          <tr v-for="item in pagedDichVuList" :key="item.id" @dblclick="showDetailModal(item)">
            <td class="text-center">{{ item.id }}</td>
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
              <div v-if="item.trangThai" class="action-buttons">
                <button class="btn btn-icon btn-warning-light" title="Chỉnh sửa" @click="editDichVu(item)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-danger-light" title="Xóa" @click="deleteDichVu(item.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div v-else class="action-buttons">
                <button class="btn btn-icon btn-success-light" title="Khôi phục" @click="restoreDichVu(item)">
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
      <p>Không tìm thấy dịch vụ nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && totalItems > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} dịch vụ
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 0 }">
            <a class="page-link nav-arrow" href="#" @click.prevent="changePage(currentPage)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page - 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
            <a class="page-link nav-arrow" href="#" @click.prevent="changePage(currentPage + 2)">
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
                <option value="phan">phần</option>
                <option value="lan">lần</option>
                <option value="goi">gói</option>
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
const filterStatus = ref('true')
const searchText = ref('')
const loading = ref(true)
const processing = ref(false)
const showDeleteConfirm = ref(false)
const showRestoreConfirm = ref(false)
const selectedDichVuId = ref(null)
const selectedDichVuToRestore = ref(null)
const errorsFromBackend = ref({})

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

// Phân trang - API sử dụng 0-based, UI sử dụng 1-based
const currentPage = ref(0) // API page index bắt đầu từ 0
const pageSize = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)

// Tính toán số hàng trống để bảng luôn có kích thước cố định
const emptyRows = computed(() => {
  const currentItems = dichVuList.value.length
  return currentItems < pageSize.value ? pageSize.value - currentItems : 0
})

// Dịch vụ được hiển thị trên bảng
const pagedDichVuList = computed(() => dichVuList.value)

// Theo dõi sự thay đổi để load lại dữ liệu
watch([searchText, filterStatus, currentPage, pageSize], fetchDichVu, { deep: true })

// Thông tin phân trang hiển thị cho người dùng
const startItem = computed(() =>
  totalItems.value > 0 ? currentPage.value * pageSize.value + 1 : 0
)
const endItem = computed(() => {
  const end = (currentPage.value + 1) * pageSize.value
  return end > totalItems.value ? totalItems.value : end
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

  // Log để debug
  console.log('Tìm homestay với ID:', numericId, 'Kết quả:', homestay ? homestay.tenHomestay : 'Không tìm thấy');
  console.log('Danh sách homestay có sẵn:', homestays.value.map(h => ({ id: h.id, ten: h.tenHomestay })));

  return homestay ? homestay.tenHomestay : `Homestay ID: ${id}`
}

async function fetchDichVu() {
  loading.value = true
  try {
    // Tải dữ liệu homestay trước
    const homestaysRes = await getAllHomeStay()
    console.log('Homestay data loaded:', homestaysRes)
    homestays.value = homestaysRes.data || []

    // Sau đó tải dữ liệu dịch vụ
    try {
      console.log('Fetching all dich vu data...')

      // Gọi API lấy tất cả dịch vụ
      const response = await getAllDichVu()

      console.log('API response:', response)

      if (!response.data) {
        console.error('Invalid response format:', response)
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

      // Cập nhật thông tin phân trang
      totalItems.value = dichVuList.value.length
      totalPages.value = Math.ceil(totalItems.value / pageSize.value)

      // Filter thêm theo trạng thái và tìm kiếm nếu có
      dichVuList.value = dichVuList.value.filter(item => {
        // Lọc theo trạng thái
        const statusMatch = item.trangThai === (filterStatus.value === 'true')

        // Lọc theo keyword nếu có
        const keyword = searchText.value.trim().toLowerCase()
        const keywordMatch = !keyword ||
          (item.tenDichVu && item.tenDichVu.toLowerCase().includes(keyword)) ||
          (item.maDichVu && item.maDichVu.toLowerCase().includes(keyword))

        return statusMatch && keywordMatch
      })

      // Áp dụng phân trang client-side
      const startIndex = currentPage.value * pageSize.value
      const endIndex = startIndex + pageSize.value
      dichVuList.value = dichVuList.value.slice(startIndex, endIndex)

    } catch (error) {
      console.error('Error loading dich vu data:', error)
      if (error.response) {
        console.log('Error response:', error.response.status, error.response.data)
      }
      notification.error('Lỗi khi tải dữ liệu dịch vụ. Vui lòng kiểm tra console để biết chi tiết.')
    }
  } catch (error) {
    notification.error('Lỗi khi tải dữ liệu')
    console.error('Fetch error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchDichVu)

// Xử lý khi thay đổi tìm kiếm
function onSearchChange() {
  currentPage.value = 0 // Reset về trang đầu tiên
  fetchDichVu() // Tải lại dữ liệu với từ khóa mới
}

// Xử lý khi thay đổi trạng thái
function filterByStatus() {
  currentPage.value = 0 // Reset về trang đầu tiên
  fetchDichVu() // Tải lại dữ liệu với trạng thái mới
}

// Thay đổi trang
function changePage(page) {
  // UI hiển thị từ 1, nhưng logic bắt đầu từ 0
  const newPage = page - 1
  if (newPage < 0 || newPage >= totalPages.value) return
  currentPage.value = newPage

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
async function restoreDichVu(item) {
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
.dich-vu-container {
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

.dich-vu-form .form-group {
  margin-bottom: 20px;
}

.dich-vu-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}

.dich-vu-form .form-actions {
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

.dich-vu-form .form-group {
  margin-bottom: 20px;
}

.dich-vu-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}

.dich-vu-form .form-control:invalid {
  border-color: #5e77f1;
}

.dich-vu-form .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
}

/* Backend validation error styling */
.is-invalid {
  border-color: #fbfbfd !important;
}

.error-feedback {
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}
</style>
