<template>
  <div class="phu-phi-container">
    <h1 class="page-title">Quản Lý Phụ Phí</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <select v-model="searchType" class="search-type-select">
            <option value="all">Tất cả</option>
            <option value="tenPhuPhi">Tên phụ phí</option>
            <option value="loaiPhuPhi">Loại phụ phí</option>
          </select>
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchKeyword"
              :placeholder="getSearchPlaceholder()"
              class="search-input"
              @input="onSearchChange"
            />
            <button v-if="searchKeyword" @click="clearSearch" class="clear-search-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="right-controls">
        <select class="form-select status-filter" v-model="statusFilter" @change="filterByStatus">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang áp dụng</option>
          <option value="inactive">Không áp dụng</option>
        </select>
        <button class="btn-add" @click="openAddModal">
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

    <!-- Phụ Phí Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Phụ Phí</th>
            <th>Giá Trị</th>
            <th>Loại Phụ Phí</th>
            <th>Giờ Giới Hạn</th>
            <th>Ngày Áp Dụng</th>
            <th>Trạng Thái</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="phuPhi in paginatedPhuPhi" :key="phuPhi.id">
            <td class="text-center">{{ phuPhi.id }}</td>
            <td class="text-center">{{ phuPhi.tenPhuPhi }}</td>
            <td class="text-center">{{ formatCurrency(phuPhi.giaTri) }}</td>
            <td class="text-center">{{ phuPhi.loaiPhuPhi }}</td>
            <td class="text-center">{{ formatTime(phuPhi.gioGioiHan) }}</td>
            <td class="text-center">{{ formatDate(phuPhi.ngayApDung) }}</td>
            <td class="text-center">
              <span :class="`badge ${phuPhi.trangThai ? 'bg-success' : 'bg-danger'}`">
                {{ phuPhi.trangThai ? 'Đang áp dụng' : 'Không áp dụng' }}
              </span>
            </td>
            <td class="text-center">
              <div v-if="phuPhi.trangThai" class="action-buttons">
                <button
                  class="btn btn-icon btn-warning-light"
                  title="Chỉnh sửa"
                  @click="openEditModal(phuPhi)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-icon btn-danger-light"
                  title="Xóa"
                  @click="confirmDelete(phuPhi)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div v-else class="action-buttons">
                <button
                  class="btn btn-icon btn-success-light"
                  title="Khôi phục"
                  @click="confirmRestore(phuPhi)"
                >
                  <i class="fas fa-reply"></i>
                </button>
              </div>
            </td>
          </tr>
          <!-- Empty rows to ensure space for 10 rows -->
          <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
            <td colspan="8">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && paginatedPhuPhi.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy phụ phí nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredPhuPhiList.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} phụ phí
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

  <!-- Confirmation Modals -->
  <div
    v-if="showDeleteConfirm || showRestoreConfirm"
    class="modal-overlay"
    @click.self="showDeleteConfirm ? cancelDelete() : cancelRestore()"
  >
    <!-- Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="confirmation-box">
      <button class="close-button" @click="cancelDelete">&times;</button>
      <div class="confirmation-body">
        <div class="confirm-icon-wrapper icon-danger">
          <i class="fas fa-trash-alt"></i>
        </div>
        <h4 class="confirm-title">Bạn có chắc chắn muốn xóa?</h4>
        <p class="confirm-text">
          Hành động này sẽ xóa phụ phí
          <strong>{{ selectedPhuPhi.tenPhuPhi }}</strong
          >. <br />Bạn có thể khôi phục lại sau.
        </p>
      </div>
      <div class="confirmation-footer">
        <button class="btn btn-secondary" @click="cancelDelete">Hủy bỏ</button>
        <button class="btn btn-danger" @click="deletePhuPhi" :disabled="deleting">
          <span
            v-if="deleting"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span v-else>Xác nhận xóa</span>
        </button>
      </div>
    </div>

    <!-- Restore Confirmation -->
    <div v-if="showRestoreConfirm" class="confirmation-box">
      <button class="close-button" @click="cancelRestore">&times;</button>
      <div class="confirmation-body">
        <div class="confirm-icon-wrapper icon-success">
          <i class="fas fa-reply"></i>
        </div>
        <h4 class="confirm-title">Xác nhận khôi phục?</h4>
        <p class="confirm-text">
          Hành động này sẽ khôi phục phụ phí
          <strong>{{ selectedPhuPhi.tenPhuPhi }}</strong> trở lại.
        </p>
      </div>
      <div class="confirmation-footer">
        <button class="btn btn-secondary" @click="cancelRestore">Hủy bỏ</button>
        <button class="btn btn-primary" @click="executeRestore" :disabled="restoring">
          <span
            v-if="restoring"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span v-else>Xác nhận</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Chỉnh Sửa Modal Phụ Phí -->
  <div v-if="showEditModal" class="modal-overlay" @click.self="cancelEdit">
    <div class="edit-phu-phi-modal">
      <div class="modal-header">
        <div class="header-content">
          <h3><i class="fas fa-edit animated-icon"></i> Chỉnh sửa Phụ Phí</h3>
          <p class="subtitle">Cập nhật thông tin phụ phí trong hệ thống</p>
        </div>
        <button class="close-button" @click="cancelEdit">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitEditPhuPhi">
          <div class="form-section">
            <h4 class="section-title">Thông tin cơ bản</h4>

            <div class="form-group animate-field">
              <label for="editTenPhuPhi">
                <i class="fas fa-tag field-icon"></i>
                Tên Phụ Phí
              </label>
              <div class="input-container">
                <input
                  type="text"
                  id="editTenPhuPhi"
                  v-model="editedPhuPhi.tenPhuPhi"
                  class="form-control luxury-input"
                  :class="{ 'is-invalid': editValidation.tenPhuPhi }"
                  required
                  placeholder="Nhập tên phụ phí"
                />
                <div class="input-highlight"></div>
              </div>
              <div v-if="editValidation.tenPhuPhi" class="invalid-feedback">
                {{ editValidation.tenPhuPhi }}
              </div>
            </div>

            <div class="dual-field">
              <div class="form-group animate-field">
                <label for="editGiaTri">
                  <i class="fas fa-money-bill-wave field-icon"></i>
                  Giá Trị
                </label>
                <div class="input-container">
                  <div class="premium-input-group">
                    <input
                      type="number"
                      id="editGiaTri"
                      v-model="editedPhuPhi.giaTri"
                      class="form-control luxury-input"
                      :class="{ 'is-invalid': editValidation.giaTri }"
                      required
                      placeholder="Nhập giá trị"
                    />
                    <div class="input-highlight"></div>
                    <span class="input-suffix">VNĐ</span>
                  </div>
                </div>
                <div v-if="editValidation.giaTri" class="invalid-feedback">
                  {{ editValidation.giaTri }}
                </div>
              </div>

              <div class="form-group animate-field">
                <label for="editLoaiPhuPhi">
                  <i class="fas fa-layer-group field-icon"></i>
                  Loại Phụ Phí
                </label>
                <div class="input-container">
                  <select
                    id="editLoaiPhuPhi"
                    v-model="editedPhuPhi.loaiPhuPhi"
                    class="form-control luxury-input luxury-select"
                    :class="{ 'is-invalid': editValidation.loaiPhuPhi }"
                    required
                  >
                    <option value="" disabled selected>Chọn loại phụ phí</option>
                    <option value="Đến/Đi">Đến/Đi</option>
                    <option value="Ngày Lễ">Ngày Lễ</option>
                    <option value="Cuối Tuần">Cuối Tuần</option>
                    <option value="Phát Sinh">Phát Sinh</option>
                  </select>
                  <div class="select-icon">
                    <i class="fas fa-chevron-down"></i>
                  </div>
                  <div class="input-highlight"></div>
                </div>
                <div v-if="editValidation.loaiPhuPhi" class="invalid-feedback">
                  {{ editValidation.loaiPhuPhi }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-title">Thời gian áp dụng</h4>

            <div class="dual-field">
              <div class="form-group animate-field">
                <label for="editGioGioiHan">
                  <i class="far fa-clock field-icon"></i>
                  Giờ Giới Hạn
                </label>
                <div class="input-container">
                  <input
                    type="time"
                    id="editGioGioiHan"
                    v-model="editedPhuPhi.gioGioiHan"
                    class="form-control luxury-input"
                  />
                  <div class="input-highlight"></div>
                </div>
                <small class="text-muted">Thời gian áp dụng giới hạn</small>
              </div>

              <div class="form-group animate-field">
                <label for="editNgayApDung">
                  <i class="far fa-calendar-alt field-icon"></i>
                  Ngày Áp Dụng
                </label>
                <div class="input-container">
                  <input
                    type="date"
                    id="editNgayApDung"
                    v-model="editedPhuPhi.ngayApDung"
                    class="form-control luxury-input"
                  />
                  <div class="input-highlight"></div>
                </div>
                <small class="text-muted">Ngày bắt đầu áp dụng</small>
              </div>
            </div>
          </div>

          <div class="form-section status-section">
            <!-- <h4 class="section-title">Cài đặt trạng thái</h4> -->
            <div class="status-toggle-container">
              <div class="status-text">
                <div class="status-label">Trạng thái:</div>
                <div class="status-value" :class="editedPhuPhi.trangThai ? 'active' : 'inactive'">
                  {{ editedPhuPhi.trangThai ? 'Đang áp dụng' : 'Không áp dụng' }}
                </div>
              </div>
              <label class="premium-switch">
                <input type="checkbox" v-model="editedPhuPhi.trangThai" />
                <span class="slider">
                  <span class="on">ON</span>
                  <span class="off">OFF</span>
                </span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="cancelEdit">
              <i class="fas fa-times"></i>
              <span>Hủy bỏ</span>
            </button>
            <button type="submit" class="btn-save" :disabled="isEditing">
              <span v-if="isEditing" class="spinner"></span>
              <span v-else>
                <i class="fas fa-save"></i>
                <span>Lưu thay đổi</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Thêm Modal Phụ Phí Mới -->
  <div v-if="showAddModal" class="modal-overlay" @click.self="cancelAdd">
    <div class="edit-phu-phi-modal">
      <div class="modal-header">
        <div class="header-content">
          <h3><i class="fas fa-plus animated-icon"></i> Thêm Phụ Phí Mới</h3>
          <p class="subtitle">Thêm thông tin phụ phí mới vào hệ thống</p>
        </div>
        <button class="close-button" @click="cancelAdd">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitAddPhuPhi">
          <div class="form-section">
            <h4 class="section-title">Thông tin cơ bản</h4>

            <div class="form-group animate-field">
              <label for="addTenPhuPhi">
                <i class="fas fa-tag field-icon"></i>
                Tên Phụ Phí
              </label>
              <div class="input-container">
                <input
                  type="text"
                  id="addTenPhuPhi"
                  v-model="newPhuPhi.tenPhuPhi"
                  class="form-control luxury-input"
                  :class="{ 'is-invalid': addValidation.tenPhuPhi }"
                  required
                  placeholder="Nhập tên phụ phí"
                />
                <div class="input-highlight"></div>
              </div>
              <div v-if="addValidation.tenPhuPhi" class="invalid-feedback">
                {{ addValidation.tenPhuPhi }}
              </div>
            </div>

            <div class="dual-field">
              <div class="form-group animate-field">
                <label for="addGiaTri">
                  <i class="fas fa-money-bill-wave field-icon"></i>
                  Giá Trị
                </label>
                <div class="input-container">
                  <div class="premium-input-group">
                    <input
                      type="number"
                      id="addGiaTri"
                      v-model="newPhuPhi.giaTri"
                      class="form-control luxury-input"
                      :class="{ 'is-invalid': addValidation.giaTri }"
                      required
                      placeholder="Nhập giá trị"
                    />
                    <div class="input-highlight"></div>
                    <span class="input-suffix">VNĐ</span>
                  </div>
                </div>
                <div v-if="addValidation.giaTri" class="invalid-feedback">
                  {{ addValidation.giaTri }}
                </div>
              </div>

              <div class="form-group animate-field">
                <label for="addLoaiPhuPhi">
                  <i class="fas fa-layer-group field-icon"></i>
                  Loại Phụ Phí
                </label>
                <div class="input-container">
                  <select
                    id="addLoaiPhuPhi"
                    v-model="newPhuPhi.loaiPhuPhi"
                    class="form-control luxury-input luxury-select"
                    :class="{ 'is-invalid': addValidation.loaiPhuPhi }"
                    required
                  >
                    <option value="" disabled selected>Chọn loại phụ phí</option>
                    <option value="Dịch Vụ">Dịch Vụ</option>
                    <option value="Phụ Thu">Phụ Thu</option>
                    <option value="Phát Sinh">Phát Sinh</option>
                  </select>
                  <div class="select-icon">
                    <i class="fas fa-chevron-down"></i>
                  </div>
                  <div class="input-highlight"></div>
                </div>
                <div v-if="addValidation.loaiPhuPhi" class="invalid-feedback">
                  {{ addValidation.loaiPhuPhi }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-title">Thời gian áp dụng</h4>

            <div class="dual-field">
              <div class="form-group animate-field">
                <label for="addGioGioiHan">
                  <i class="far fa-clock field-icon"></i>
                  Giờ Giới Hạn
                </label>
                <div class="input-container">
                  <input
                    type="time"
                    id="addGioGioiHan"
                    v-model="newPhuPhi.gioGioiHan"
                    class="form-control luxury-input"
                  />
                  <div class="input-highlight"></div>
                </div>
                <small class="text-muted">Thời gian áp dụng giới hạn</small>
              </div>

              <div class="form-group animate-field">
                <label for="addNgayApDung">
                  <i class="far fa-calendar-alt field-icon"></i>
                  Ngày Áp Dụng
                </label>
                <div class="input-container">
                  <input
                    type="date"
                    id="addNgayApDung"
                    v-model="newPhuPhi.ngayApDung"
                    class="form-control luxury-input"
                  />
                  <div class="input-highlight"></div>
                </div>
                <small class="text-muted">Ngày bắt đầu áp dụng</small>
              </div>
            </div>
          </div>

          <div class="form-section status-section">
            <!-- <h4 class="section-title">Cài đặt trạng thái</h4> -->
            <div class="status-toggle-container">
              <div class="status-text">
                <div class="status-label">Trạng thái:</div>
                <div class="status-value" :class="newPhuPhi.trangThai ? 'active' : 'inactive'">
                  {{ newPhuPhi.trangThai ? 'Đang áp dụng' : 'Không áp dụng' }}
                </div>
              </div>
              <label class="premium-switch">
                <input type="checkbox" v-model="newPhuPhi.trangThai" />
                <span class="slider">
                  <span class="on">ON</span>
                  <span class="off">OFF</span>
                </span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="cancelAdd">
              <i class="fas fa-times"></i>
              <span>Hủy bỏ</span>
            </button>
            <button type="submit" class="btn-save" :disabled="isAdding">
              <span v-if="isAdding" class="spinner"></span>
              <span v-else>
                <i class="fas fa-plus"></i>
                <span>Thêm mới</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import {
  getAllPhuPhi,
  deletePhuPhiById,
  restorePhuPhiById,
  updatePhuPhi,
  createPhuPhi,
} from '@/Service/phuPhiService'
import notification from '@/utils/notification'

export default {
  name: 'PhuPhi',
  setup() {
    // State variables
    const phuPhiList = ref([])
    const loading = ref(true)
    const currentPage = ref(0)
    const pageSize = ref(10)
    const totalPages = ref(0)
    const totalItems = ref(0)
    const searchKeyword = ref('')
    const searchTimeout = ref(null)
    const searchType = ref('all')
    const statusFilter = ref('all')
    const showDeleteConfirm = ref(false)
    const showRestoreConfirm = ref(false)
    const selectedPhuPhi = ref({})
    const deleting = ref(false)
    const restoring = ref(false)
    const showEditModal = ref(false)
    const isEditing = ref(false)
    const editedPhuPhi = ref({})
    const editValidation = ref({
      tenPhuPhi: '',
      giaTri: '',
      loaiPhuPhi: '',
    })
    const showAddModal = ref(false)
    const isAdding = ref(false)
    const newPhuPhi = ref({
      tenPhuPhi: '',
      giaTri: '',
      loaiPhuPhi: '',
      gioGioiHan: null,
      ngayApDung: null,
      trangThai: true, // Mặc định đang áp dụng
    })
    const addValidation = ref({
      tenPhuPhi: '',
      giaTri: '',
      loaiPhuPhi: '',
    })

    // Fetch phụ phí data
    const fetchPhuPhi = async () => {
      loading.value = true
      try {
        const response = await getAllPhuPhi()
        phuPhiList.value = response.data || []
        totalItems.value = phuPhiList.value.length
        totalPages.value = Math.ceil(totalItems.value / pageSize.value)
      } catch (error) {
        console.error('Error fetching phu phi data:', error)
        notification.error('Không thể tải dữ liệu phụ phí.')
      } finally {
        loading.value = false
      }
    }

    // Computed property để lọc danh sách phụ phí theo trạng thái
    const filteredPhuPhiList = computed(() => {
      if (statusFilter.value === 'all') {
        return phuPhiList.value
      } else if (statusFilter.value === 'active') {
        return phuPhiList.value.filter((pp) => pp.trangThai === true)
      } else if (statusFilter.value === 'inactive') {
        return phuPhiList.value.filter((pp) => pp.trangThai === false)
      }
      return phuPhiList.value
    })

    // Computed properties cho phân trang
    const startItem = computed(() => {
      return currentPage.value * pageSize.value + 1
    })

    const endItem = computed(() => {
      const end = (currentPage.value + 1) * pageSize.value
      return end > totalItems.value ? totalItems.value : end
    })

    // Danh sách phụ phí đã phân trang
    const paginatedPhuPhi = computed(() => {
      const filtered = filteredPhuPhiList.value
      const start = currentPage.value * pageSize.value
      const end = Math.min(start + pageSize.value, filtered.length)
      return filtered.slice(start, end)
    })

    // Số dòng trống cần thêm vào để đảm bảo luôn có 10 dòng
    const emptyRows = computed(() => {
      const rowsCount = paginatedPhuPhi.value.length
      return rowsCount < 10 ? 10 - rowsCount : 0
    })

    // Filter by status function
    const filterByStatus = () => {
      console.log('Filtering by status:', statusFilter.value)
      // Reset pagination when filter changes
      currentPage.value = 0
    }

    // Placeholder text dựa vào loại tìm kiếm
    const getSearchPlaceholder = () => {
      switch (searchType.value) {
        case 'tenPhuPhi':
          return 'Nhập tên phụ phí...'
        case 'loaiPhuPhi':
          return 'Nhập loại phụ phí...'
        default:
          return 'Tìm kiếm phụ phí...'
      }
    }

    // Clear search
    const clearSearch = () => {
      searchKeyword.value = ''
      fetchPhuPhi() // Tải lại toàn bộ danh sách
    }

    // Search function with debounce
    const onSearchChange = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }

      searchTimeout.value = setTimeout(() => {
        // Hiện tại backend chưa có API tìm kiếm nên tạm thời tìm kiếm local
        if (searchKeyword.value.trim() === '') {
          fetchPhuPhi()
          return
        }

        const keyword = searchKeyword.value.toLowerCase().trim()
        let filteredList = []

        switch (searchType.value) {
          case 'tenPhuPhi':
            filteredList = phuPhiList.value.filter(
              (item) => item.tenPhuPhi && item.tenPhuPhi.toLowerCase().includes(keyword),
            )
            break
          case 'loaiPhuPhi':
            filteredList = phuPhiList.value.filter(
              (item) => item.loaiPhuPhi && item.loaiPhuPhi.toLowerCase().includes(keyword),
            )
            break
          default:
            // Tìm kiếm tất cả các trường
            filteredList = phuPhiList.value.filter(
              (item) =>
                (item.tenPhuPhi && item.tenPhuPhi.toLowerCase().includes(keyword)) ||
                (item.loaiPhuPhi && item.loaiPhuPhi.toLowerCase().includes(keyword)),
            )
            break
        }

        phuPhiList.value = filteredList
        totalItems.value = filteredList.length
        totalPages.value = Math.ceil(totalItems.value / pageSize.value)
        currentPage.value = 0
      }, 500)
    }

    // Pagination
    const changePage = (page) => {
      if (page < 0 || page >= totalPages.value) return
      currentPage.value = page
    }

    // Format functions
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
    }

    const formatTime = (timeString) => {
      if (!timeString) return 'N/A'
      return timeString
    }

    const formatCurrency = (value) => {
      if (!value) return '0 đ'
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value)
    }

    // Triển khai chức năng xác nhận xóa
    const confirmDelete = (phuPhi) => {
      selectedPhuPhi.value = { ...phuPhi }
      showDeleteConfirm.value = true
    }

    // Hủy việc xóa
    const cancelDelete = () => {
      showDeleteConfirm.value = false
      selectedPhuPhi.value = {}
      deleting.value = false
    }

    // Triển khai chức năng xóa phụ phí
    const deletePhuPhi = async () => {
      try {
        deleting.value = true
        console.log('Deleting phu phi with ID:', selectedPhuPhi.value.id)

        // Gọi API xóa phụ phí
        const response = await deletePhuPhiById(selectedPhuPhi.value.id)
        console.log('Delete response:', response)

        // Ẩn dialog xác nhận
        showDeleteConfirm.value = false

        // Hiển thị thông báo thành công
        notification.success(`Đã xóa phụ phí ${selectedPhuPhi.value.tenPhuPhi} thành công.`)

        // Tải lại danh sách phụ phí
        fetchPhuPhi()
      } catch (error) {
        console.error('Error deleting phu phi:', error)

        // Hiển thị thông báo lỗi
        notification.error(
          `Không thể xóa phụ phí. Lỗi: ${error.response?.data?.message || 'Lỗi không xác định'}`,
        )
      } finally {
        deleting.value = false
      }
    }

    //Triển khai chức năng khôi phục phụ phí
    const confirmRestore = (phuPhi) => {
      selectedPhuPhi.value = { ...phuPhi }
      showRestoreConfirm.value = true
    }

    const cancelRestore = () => {
      showRestoreConfirm.value = false
      selectedPhuPhi.value = {}
      restoring.value = false
    }

    const executeRestore = async () => {
      try {
        restoring.value = true
        await restorePhuPhiById(selectedPhuPhi.value.id)
        notification.success(`Đã khôi phục phụ phí ${selectedPhuPhi.value.tenPhuPhi} thành công.`)
        fetchPhuPhi()
        cancelRestore() // Close modal on success
      } catch (error) {
        console.error('Error restoring phu phi:', error)
        notification.error(
          `Không thể khôi phục phụ phí. Lỗi: ${
            error.response?.data?.message || 'Lỗi không xác định'
          }`,
        )
        restoring.value = false // Keep modal open on error
      }
    }

    // Hiển thị modal chỉnh sửa
    const openEditModal = (phuPhi) => {
      editedPhuPhi.value = { ...phuPhi }
      showEditModal.value = true
    }

    // Đóng modal chỉnh sửa
    const cancelEdit = () => {
      showEditModal.value = false
      editedPhuPhi.value = {}
      editValidation.value = {
        tenPhuPhi: '',
        giaTri: '',
        loaiPhuPhi: '',
      }
    }

    // Validate form chỉnh sửa
    const validateEditForm = () => {
      let isValid = true
      editValidation.value = {
        tenPhuPhi: '',
        giaTri: '',
        loaiPhuPhi: '',
      }

      // Validate tên phụ phí
      if (!editedPhuPhi.value.tenPhuPhi?.trim()) {
        editValidation.value.tenPhuPhi = 'Tên phụ phí không được để trống'
        isValid = false
      }

      // Validate giá trị
      if (!editedPhuPhi.value.giaTri) {
        editValidation.value.giaTri = 'Giá trị không được để trống'
        isValid = false
      } else if (editedPhuPhi.value.giaTri <= 0) {
        editValidation.value.giaTri = 'Giá trị phải lớn hơn 0'
        isValid = false
      }

      // Validate loại phụ phí
      if (!editedPhuPhi.value.loaiPhuPhi?.trim()) {
        editValidation.value.loaiPhuPhi = 'Loại phụ phí không được để trống'
        isValid = false
      }

      return isValid
    }

    // Xử lý submit form chỉnh sửa
    const submitEditPhuPhi = async () => {
      // Validate form
      if (!validateEditForm()) {
        return
      }

      isEditing.value = true

      try {
        const response = await updatePhuPhi(editedPhuPhi.value.id, editedPhuPhi.value)

        if (response.data) {
          notification.success('Cập nhật phụ phí thành công')
          showEditModal.value = false
          fetchPhuPhi() // Tải lại danh sách phụ phí
        } else {
          notification.error('Có lỗi xảy ra khi cập nhật phụ phí')
        }
      } catch (error) {
        console.error('Error updating phu phi:', error)
        notification.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật phụ phí')
      } finally {
        isEditing.value = false
      }
    }

    // Hiển thị modal thêm phụ phí mới
    const openAddModal = () => {
      showAddModal.value = true
      resetAddForm()
    }

    // Đóng modal thêm mới
    const cancelAdd = () => {
      showAddModal.value = false
      resetAddForm()
    }

    // Reset form thêm mới
    const resetAddForm = () => {
      newPhuPhi.value = {
        tenPhuPhi: '',
        giaTri: '',
        loaiPhuPhi: '',
        gioGioiHan: null,
        ngayApDung: null,
        trangThai: true,
      }
      addValidation.value = {
        tenPhuPhi: '',
        giaTri: '',
        loaiPhuPhi: '',
      }
    }

    // Validate form thêm mới
    const validateAddForm = () => {
      let isValid = true
      addValidation.value = {
        tenPhuPhi: '',
        giaTri: '',
        loaiPhuPhi: '',
      }

      // Validate tên phụ phí
      if (!newPhuPhi.value.tenPhuPhi?.trim()) {
        addValidation.value.tenPhuPhi = 'Tên phụ phí không được để trống'
        isValid = false
      }

      // Validate giá trị
      if (!newPhuPhi.value.giaTri) {
        addValidation.value.giaTri = 'Giá trị không được để trống'
        isValid = false
      } else if (Number(newPhuPhi.value.giaTri) <= 0) {
        addValidation.value.giaTri = 'Giá trị phải lớn hơn 0'
        isValid = false
      }

      // Validate loại phụ phí
      if (!newPhuPhi.value.loaiPhuPhi) {
        addValidation.value.loaiPhuPhi = 'Vui lòng chọn loại phụ phí'
        isValid = false
      }

      return isValid
    }

    // Xử lý submit form thêm mới
    const submitAddPhuPhi = async () => {
      // Validate form
      if (!validateAddForm()) {
        return
      }

      isAdding.value = true

      try {
        const response = await createPhuPhi(newPhuPhi.value)

        if (response.data) {
          notification.success('Thêm phụ phí mới thành công')
          showAddModal.value = false
          resetAddForm()
          fetchPhuPhi() // Tải lại danh sách phụ phí
        } else {
          notification.error('Có lỗi xảy ra khi thêm phụ phí')
        }
      } catch (error) {
        console.error('Error adding phu phi:', error)
        notification.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm phụ phí')
      } finally {
        isAdding.value = false
      }
    }

    onMounted(() => {
      fetchPhuPhi()
    })

    return {
      phuPhiList,
      filteredPhuPhiList,
      loading,
      currentPage,
      totalPages,
      searchKeyword,
      searchType,
      statusFilter,
      pageSize,
      totalItems,
      fetchPhuPhi,
      formatDate,
      formatTime,
      formatCurrency,
      changePage,
      onSearchChange,
      filterByStatus,
      getSearchPlaceholder,
      clearSearch,
      startItem,
      endItem,
      paginatedPhuPhi,
      emptyRows,
      showDeleteConfirm,
      showRestoreConfirm,
      selectedPhuPhi,
      deleting,
      restoring,
      confirmDelete,
      cancelDelete,
      deletePhuPhi,
      confirmRestore,
      cancelRestore,
      executeRestore,
      showEditModal,
      editedPhuPhi,
      editValidation,
      isEditing,
      openEditModal,
      cancelEdit,
      submitEditPhuPhi,
      showAddModal,
      newPhuPhi,
      addValidation,
      isAdding,
      openAddModal,
      cancelAdd,
      submitAddPhuPhi,
    }
  },
}
</script>

<style scoped>
/* GENERAL CONTAINER & TITLE */
.phu-phi-container {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.06);
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 25px;
  color: #343a40;
  background: linear-gradient(90deg, #0d6efd 40%, #20c997 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

/* CONTROLS BAR */
.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  background-color: #ffffff;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

/* LEFT SIDE: SEARCH BOX */
.search-box {
  position: relative;
  width: 450px;
}

.search-control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-type-select {
  min-width: 120px;
  height: 42px;
  border: 1px solid #e9ecef;
  border-radius: 21px;
  padding: 0 12px;
  background-color: #f8f9fa;
  outline: none;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.search-type-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  background-color: #fff;
}

.search-input-wrapper {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9a9a9a;
  font-size: 1rem;
}

.search-input {
  width: 100%;
  border: 1px solid #e9ecef;
  padding: 12px 15px 12px 45px;
  border-radius: 30px;
  outline: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  background-color: #f8f9fa;
}

.search-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  background-color: #fff;
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
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background-color: #e9ecef;
  color: #343a40;
}

/* RIGHT SIDE: FILTER & BUTTON */
.right-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-filter {
  height: 42px;
  border: 1px solid #e9ecef;
  border-radius: 21px;
  box-shadow: none;
  font-size: 14px;
  padding: 0 18px;
  min-width: 180px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.status-filter:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  background-color: #fff;
}

/* TABLE STYLES */
.table-responsive {
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 25px;
}

.table {
  margin-bottom: 0;
  background-color: #fff;
  border-collapse: separate;
  border-spacing: 0 8px; /* Khoảng cách giữa các hàng */
}

.table thead th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-bottom: 1px solid #dee2e6;
  border-top: none;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
  vertical-align: middle;
  text-align: center;
  padding: 10px 10px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table th:first-child {
  border-top-left-radius: 8px;
}

.table th:last-child {
  border-top-right-radius: 8px;
}

.table tbody tr {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  background-color: #fff;
}

.table tbody tr td {
  vertical-align: middle;
  padding: 10px 15px;
  color: #495057;
  border-top: none;
  position: relative;
}

/* Bo tròn cho ô đầu và cuối của mỗi hàng */
.table tbody tr td:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.table tbody tr td:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.table tbody tr:hover {
  background-color: #f1f7ff;
  transform: translateY(-1px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.table td.text-center {
  text-align: center;
}

.badge {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 20px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.btn-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-warning-light {
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
}
.btn-warning-light:hover {
  background-color: rgba(255, 193, 7, 0.2);
}
.btn-danger-light {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
}
.btn-danger-light:hover {
  background-color: rgba(220, 53, 69, 0.2);
}

.empty-row td {
  border: none;
  padding: 8px;
  background: transparent;
  box-shadow: none;
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

/* Loading và Empty State */
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  flex-direction: column;
  gap: 15px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.loading-indicator .spinner-border {
  width: 3rem;
  height: 3rem;
  color: #0d6efd;
}

.loading-indicator span {
  margin-top: 15px;
  color: #6c757d;
  font-size: 1rem;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 4rem;
  color: #dce0e5;
  margin-bottom: 20px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table tbody tr {
  animation: fadeIn 0.3s ease forwards;
}

.table tbody tr:nth-child(1) {
  animation-delay: 0.05s;
}
.table tbody tr:nth-child(2) {
  animation-delay: 0.1s;
}
.table tbody tr:nth-child(3) {
  animation-delay: 0.15s;
}
.table tbody tr:nth-child(4) {
  animation-delay: 0.2s;
}
.table tbody tr:nth-child(5) {
  animation-delay: 0.25s;
}
.table tbody tr:nth-child(6) {
  animation-delay: 0.3s;
}
.table tbody tr:nth-child(7) {
  animation-delay: 0.35s;
}
.table tbody tr:nth-child(8) {
  animation-delay: 0.4s;
}
.table tbody tr:nth-child(9) {
  animation-delay: 0.45s;
}
.table tbody tr:nth-child(10) {
  animation-delay: 0.5s;
}

/* CONFIRMATION MODAL STYLES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(30, 41, 59, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
  transition: opacity 0.3s ease;
}

.confirmation-box {
  position: relative;
  padding: 30px 35px;
  border-radius: 16px;
  background-color: #fff;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 420px;
  max-width: 90%;
  text-align: center;
  animation: modal-pop-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes modal-pop-in {
  from {
    transform: translateY(-50px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.confirmation-box .close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f1f5f9;
  border: none;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.confirmation-box .close-button:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

.confirm-icon-wrapper {
  margin: 0 auto 20px auto;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: icon-pop-in 0.5s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  transform: scale(0);
}

@keyframes icon-pop-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.confirm-icon-wrapper i {
  color: #fff;
  font-size: 32px;
}

.icon-danger {
  background-color: #ef4444;
}

.icon-success {
  background-color: #0d6efd;
}

.confirm-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

.confirm-text {
  font-size: 1rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 30px;
}

.confirmation-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.confirmation-footer .btn {
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 0;
  flex: 1;
  border-radius: 30px;
  border: none;
  transition: all 0.2s ease;
}

.confirmation-footer .btn-secondary {
  background-color: #e2e8f0;
  color: #475569;
}
.confirmation-footer .btn-secondary:hover {
  background-color: #cbd5e1;
}
.confirmation-footer .btn-danger:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
.confirmation-footer .btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-success-light {
  color: #198754;
  background-color: rgba(25, 135, 84, 0.1);
}
.btn-success-light:hover {
  background-color: rgba(25, 135, 84, 0.2);
}

/* ANIMATION KEYFRAMES */
@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-slide-in {
  from {
    opacity: 0;
    transform: translateY(-70px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes float-in {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes highlight {
  0% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* MODAL OVERLAY */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  animation: modal-fade-in 0.3s ease forwards;
}

/* EDIT PHU PHI MODAL */
.edit-phu-phi-modal {
  position: relative;
  width: 650px;
  max-width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 5px 15px rgba(0, 0, 0, 0.07);
  animation: modal-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Scrollbar styling */
.edit-phu-phi-modal::-webkit-scrollbar {
  width: 6px;
}
.edit-phu-phi-modal::-webkit-scrollbar-track {
  background: transparent;
}
.edit-phu-phi-modal::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.2);
  border-radius: 10px;
}
.edit-phu-phi-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 123, 255, 0.4);
}

/* HEADER */
.modal-header {
  padding: 15px 30px 20px;
  background: linear-gradient(135deg, #0c63e4 0%, #0099ff 100%);
  color: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  transform: rotate(30deg);
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.subtitle {
  margin: 5px 0 0;
  font-size: 0.95rem;
  opacity: 0.85;
  font-weight: 400;
}

.animated-icon {
  display: inline-block;
  animation: pulse 2s infinite;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 34px;
  height: 34px;
  font-size: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 3;
  backdrop-filter: blur(10px);
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

/* BODY */
.modal-body {
  padding: 5px 0 0;
  background-color: #fff;
}

.form-section {
  padding: 15px 30px;
  animation: float-in 0.5s ease forwards;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
  position: relative;
  padding-left: 15px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(to bottom, #0c63e4, #0099ff);
  border-radius: 4px;
}

.animate-field {
  opacity: 0;
  transform: translateY(20px);
  animation: float-in 0.5s ease forwards;
}

.animate-field:nth-child(1) {
  animation-delay: 0.1s;
}

.animate-field:nth-child(2) {
  animation-delay: 0.2s;
}

.animate-field:nth-child(3) {
  animation-delay: 0.3s;
}

/* FORM GROUPS */
.form-group {
  margin-bottom: 25px;
  position: relative;
}

.form-group label {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.field-icon {
  margin-right: 8px;
  color: #0c63e4;
  font-size: 1rem;
}

.input-container {
  position: relative;
  z-index: 1;
}

.luxury-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background-color: #f8fafc;
  color: #333;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.luxury-input:focus {
  outline: none;
  border-color: #0c63e4;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.1);
  transform: translateY(-2px);
}

.input-highlight {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(to right, #0c63e4, #0099ff);
  transition: all 0.3s ease;
  transform: translateX(-50%);
  z-index: 3;
}

.luxury-input:focus + .input-highlight {
  width: 100%;
}

.input-container:hover .input-highlight {
  width: 80%;
}

/* PREMIUM INPUT GROUP */
.premium-input-group {
  position: relative;
}

.input-suffix {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  font-weight: 600;
  color: #0c63e4;
  z-index: 3;
}

.premium-input-group .luxury-input {
  padding-right: 50px;
}

/* DUAL FIELD */
.dual-field {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* STATUS TOGGLE */
.status-section {
  background-color: #f8fafc;
}

.status-toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.status-toggle-container:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.status-text {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-label {
  font-weight: 600;
  color: #555;
}

.status-value {
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.status-value.active {
  background-color: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.status-value.inactive {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

/* PREMIUM SWITCH */
.premium-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  cursor: pointer;
}

.premium-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e9ecef;
  transition: 0.4s;
  border-radius: 30px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.slider:before {
  position: absolute;
  content: '';
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.premium-switch input:checked + .slider {
  background: linear-gradient(to right, #0c63e4, #0099ff);
}

.premium-switch input:checked + .slider:before {
  transform: translateX(30px);
}

.premium-switch input:focus + .slider {
  box-shadow: 0 0 1px #0c63e4;
}

.slider .on,
.slider .off {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.65rem;
  font-weight: 700;
  transition: opacity 0.3s ease;
}

.slider .on {
  left: 8px;
  color: white;
  opacity: 0;
}

.slider .off {
  right: 8px;
  color: #777;
  opacity: 1;
}

.premium-switch input:checked + .slider .on {
  opacity: 1;
}

.premium-switch input:checked + .slider .off {
  opacity: 0;
}

/* FOOTER */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 25px 30px 30px;
  border-top: none;
}

.btn-cancel,
.btn-save {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 25px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background-color: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background-color: #e2e8f0;
  color: #475569;
  transform: translateY(-2px);
}

.btn-save {
  background: linear-gradient(135deg, #0c63e4 0%, #0099ff 100%);
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(12, 99, 228, 0.2);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(12, 99, 228, 0.3);
}

.btn-save:active {
  transform: translateY(0);
}

.btn-save::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
  transition: all 0.8s ease;
  opacity: 0;
}

.btn-save:hover::after {
  opacity: 1;
  transform: rotate(30deg);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 5px;
  animation: float-in 0.3s ease forwards;
}

.text-muted {
  display: block;
  color: #64748b;
  font-size: 0.85rem;
  margin-top: 5px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dual-field {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .modal-header {
    padding: 20px 25px;
  }

  .form-section {
    padding: 20px 25px;
  }

  .modal-footer {
    padding: 20px 25px 25px;
  }
}

/* Thêm CSS cho select */
.input-container {
  position: relative;
  z-index: 1;
}

.luxury-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  padding-right: 30px;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #0c63e4;
  pointer-events: none;
  z-index: 3;
  transition: transform 0.3s ease;
}

.luxury-input:focus ~ .select-icon {
  transform: translateY(-50%) rotate(180deg);
}

.luxury-select option {
  background-color: #fff;
  color: #333;
  padding: 12px;
}

/* Hover state for select dropdown */
.luxury-select:hover {
  border-color: #0c63e4;
}

/* Animation for dropdown menu */
.luxury-select option:hover {
  background-color: #f0f7ff;
}

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0c63e4 0%, #0099ff 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(12, 99, 228, 0.2);
  margin-left: 15px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.btn-add:hover {
  transform: translateY(-2px) rotate(90deg);
  box-shadow: 0 4px 10px rgba(12, 99, 228, 0.3);
  background: linear-gradient(135deg, #0957ce 0%, #0084e2 100%);
}

.btn-add:active {
  transform: translateY(0);
}

.btn-add i {
  font-size: 16px;
  color: white;
}
</style>
