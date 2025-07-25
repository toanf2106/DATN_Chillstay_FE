<template>
  <div class="account-container">
    <h1 class="page-title">Quản Lý Tài Khoản</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchKeyword"
              placeholder="Tìm kiếm tài khoản..."
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
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
        <select class="form-select status-filter" v-model="roleFilter" @change="filterByRole">
          <option value="all">Tất cả loại tài khoản</option>
          <option v-for="role in accountRoles" :key="role" :value="role">{{ role }}</option>
        </select>
        <button class="btn btn-primary add-button" @click="showAddModal = true">
          <font-awesome-icon icon="fa-solid fa-user-plus" />
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Accounts Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Đăng Nhập</th>
            <th>Email</th>
            <th>Số Điện Thoại</th>
            <th>Vai Trò</th>
            <th>Ngày Tạo</th>
            <th>Trạng Thái</th>
            <th>Ảnh</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(account, index) in paginatedAccounts"
            :key="account.id"
            @dblclick="viewAccountDetails(account)"
          >
            <td class="text-center">{{ startItem + index }}</td>
            <td class="text-center">{{ account.tenDangNhap }}</td>
            <td class="text-center">{{ account.email }}</td>
            <td class="text-center">{{ account.soDienThoai || 'N/A' }}</td>
            <td class="text-center">{{ account.tenLoai }}</td>
            <td class="text-center">{{ formatDate(account.ngayTao) }}</td>
            <td class="text-center">
              <span :class="`badge ${account.trangThai ? 'bg-success' : 'bg-danger'}`">
                {{ account.trangThai ? 'Đang hoạt động' : 'Đã khóa' }}
              </span>
            </td>
            <td class="text-center">
              <div class="image-wrapper">
                <div v-if="imageLoadingStates[account.id]" class="image-loading">
                  <div class="spinner-border spinner-border-sm text-primary"></div>
                </div>
                <img
                  v-if="(account.anhBase64 || account.anh) && !imageErrors[account.id]"
                  :src="processImageUrl(account.anhBase64 || account.anh)"
                  :alt="`Ảnh ${account.tenDangNhap}`"
                  class="account-avatar"
                  :class="{ loading: imageLoadingStates[account.id] }"
                  @click.stop="
                    openImagePreview(account.anhBase64 || account.anh, account.tenDangNhap)
                  "
                  @load="handleImageLoad(account.id)"
                  @error="handleImageError(account.id)"
                />
                <div
                  v-else
                  class="no-image-placeholder"
                  @click.stop="openImagePreview(null, account.tenDangNhap)"
                >
                  <i class="fas fa-user-circle"></i>
                  <span>{{ imageErrors[account.id] ? 'Lỗi ảnh' : 'Chưa có ảnh' }}</span>
                </div>
              </div>
            </td>
            <td class="text-center">
              <div v-if="account.trangThai" class="action-buttons">
                <button
                  class="btn btn-icon btn-warning-light"
                  title="Chỉnh sửa"
                  @click.stop="openEditModal(account)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-icon btn-danger-light"
                  title="Khóa"
                  @click.stop="confirmDelete(account)"
                >
                  <i class="fas fa-lock"></i>
                </button>
              </div>
              <div v-else class="action-buttons">
                <button
                  class="btn btn-icon btn-success-light"
                  title="Mở khóa"
                  @click.stop="confirmRestore(account)"
                >
                  <i class="fas fa-unlock"></i>
                </button>
              </div>
            </td>
          </tr>
          <!-- Empty rows -->
          <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
            <td colspan="9">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && paginatedAccounts.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy tài khoản nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredAccountList.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} tài khoản
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

    <!-- Add Account Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="add-account-modal">
        <div class="modal-header">
          <h3>Thêm Tài Khoản Mới</h3>
          <button class="close-button" @click="closeAddModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitAddAccount">
            <div class="row">
              <div class="col-md-4">
                <div class="account-avatar-display">
                  <div class="avatar-preview" @click="triggerImageUpload">
                    <img
                      v-if="newAccount.anhPreview"
                      :src="newAccount.anhPreview"
                      class="uploaded-avatar"
                      @error="handleUploadImageError"
                    />
                    <div v-else class="avatar-placeholder">
                      <i class="fas fa-user"></i>
                      <span>Click để chọn ảnh</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref="imageInput"
                    style="display: none"
                    accept="image/*"
                    @change="handleImageUpload"
                  />
                </div>
              </div>
              <div class="col-md-8">
                <div class="form-group">
                  <label>Tên đăng nhập <span class="required-mark">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="newAccount.tenDangNhap"
                    required
                    :class="{ 'is-invalid': validationErrors.tenDangNhap }"
                  />
                  <div class="invalid-feedback" v-if="validationErrors.tenDangNhap">
                    {{ validationErrors.tenDangNhap }}
                  </div>
                  <small class="form-text text-muted"
                    >Chỉ được dùng chữ cái và số, không dấu, không ký tự đặc biệt.</small
                  >
                </div>

                <div class="form-group">
                  <label>Họ và tên <span class="required-mark">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="newAccount.hoTen"
                    required
                    :class="{ 'is-invalid': validationErrors.hoTen }"
                  />
                  <div class="invalid-feedback" v-if="validationErrors.hoTen">
                    {{ validationErrors.hoTen }}
                  </div>
                </div>

                <div class="form-group">
                  <label>Mật khẩu <span class="required-mark">*</span></label>
                  <input
                    type="password"
                    class="form-control"
                    v-model="newAccount.matKhau"
                    :class="{ 'is-invalid': validationErrors.matKhau }"
                  />
                  <div class="invalid-feedback" v-if="validationErrors.matKhau">
                    {{ validationErrors.matKhau }}
                  </div>
                  <small class="form-text text-muted"
                    >Để trống để sử dụng mật khẩu mặc định: 123456</small
                  >
                </div>

                <div class="form-group">
                  <label>Email <span class="required-mark">*</span></label>
                  <input
                    type="email"
                    class="form-control"
                    v-model="newAccount.email"
                    required
                    :class="{ 'is-invalid': validationErrors.email }"
                  />
                  <div class="invalid-feedback" v-if="validationErrors.email">
                    {{ validationErrors.email }}
                  </div>
                </div>

                <div class="form-group">
                  <label>Số điện thoại <span class="required-mark">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="newAccount.soDienThoai"
                    required
                    :class="{ 'is-invalid': validationErrors.soDienThoai }"
                  />
                  <div class="invalid-feedback" v-if="validationErrors.soDienThoai">
                    {{ validationErrors.soDienThoai }}
                  </div>
                  <small class="form-text text-muted"
                    >Số điện thoại phải có 10-11 chữ số và bắt đầu bằng số 0.</small
                  >
                </div>

                <div class="form-group">
                  <label>Loại tài khoản <span class="required-mark">*</span></label>
                  <select class="form-control" v-model="newAccount.loaiTaiKhoan" required>
                    <option v-for="role in accountTypes" :key="role.id" :value="role.id">
                      {{ role.tenLoai }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeAddModal">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary" :disabled="isAddingAccount">
                <span
                  v-if="isAddingAccount"
                  class="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span v-else>Tạo tài khoản</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Account Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="cancelEdit">
      <div class="account-details-modal">
        <div class="modal-header">
          <h3>Chỉnh sửa Tài Khoản</h3>
          <button class="close-button" @click="cancelEdit">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEdit">
            <div class="row">
              <div class="col-md-4">
                <div class="account-avatar-display">
                  <div class="avatar-preview" @click="triggerImageUploadInEdit">
                    <!-- Ưu tiên sử dụng anhPreview nếu có (ảnh mới được chọn) -->
                    <img
                      v-if="selectedAccount.anhPreview"
                      :src="selectedAccount.anhPreview"
                      :alt="`Ảnh ${selectedAccount.tenDangNhap}`"
                      @error="handleProfileImageError"
                      class="uploaded-avatar"
                    />
                    <!-- Nếu không có anhPreview, sử dụng URL từ server -->
                    <img
                      v-else-if="selectedAccount.anh"
                      :src="processImageUrl(selectedAccount.anh)"
                      :alt="`Ảnh ${selectedAccount.tenDangNhap}`"
                      @error="handleProfileImageError"
                      class="uploaded-avatar"
                    />
                    <div v-else class="avatar-placeholder">
                      <i class="fas fa-user"></i>
                      <span>Click để chọn ảnh</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref="editImageInput"
                    style="display: none"
                    accept="image/*"
                    @change="handleEditImageUpload"
                  />
                  <h4 class="text-center mt-3">{{ selectedAccount.tenDangNhap }}</h4>
                  <p class="text-center account-id">ID: {{ selectedAccount.id }}</p>
                </div>
              </div>
              <div class="col-md-8">
                <div class="form-group">
                  <label>Email <span class="required-mark">*</span></label>
                  <input
                    type="email"
                    class="form-control"
                    v-model="selectedAccount.email"
                    required
                  />
                  <div class="invalid-feedback" v-if="formErrors.email">
                    {{ formErrors.email }}
                  </div>
                </div>

                <div class="form-group">
                  <label>Mật khẩu</label>
                  <input
                    type="password"
                    class="form-control"
                    v-model="selectedAccount.matKhau"
                    placeholder="Để trống nếu không thay đổi mật khẩu"
                  />
                  <small class="form-text text-muted"
                    >Để trống nếu không muốn thay đổi mật khẩu.</small
                  >
                </div>

                <div class="form-group">
                  <label>Số điện thoại <span class="required-mark">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="selectedAccount.soDienThoai"
                    required
                  />
                  <div class="invalid-feedback" v-if="formErrors.soDienThoai">
                    {{ formErrors.soDienThoai }}
                  </div>
                  <small class="form-text text-muted"
                    >Số điện thoại phải có 10-11 chữ số và bắt đầu bằng số 0.</small
                  >
                </div>

                <div class="form-group">
                  <label>Loại tài khoản <span class="required-mark">*</span></label>
                  <select class="form-control" v-model="selectedAccount.loaiTaiKhoan" required>
                    <option v-for="role in accountTypes" :key="role.id" :value="role.id">
                      {{ role.tenLoai }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="cancelEdit">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span
                  v-if="isSubmitting"
                  class="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span v-else>Lưu thay đổi</span>
              </button>
            </div>
          </form>
        </div>
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
            <i class="fas fa-lock"></i>
          </div>
          <h4 class="confirm-title">Xác nhận khóa tài khoản?</h4>
          <p class="confirm-text">
            Bạn có chắc chắn muốn khóa tài khoản
            <strong>{{ selectedAccount.tenDangNhap }}</strong
            >? <br />
            Tài khoản này sẽ không thể đăng nhập cho đến khi được mở khóa.
          </p>
        </div>
        <div class="confirmation-footer">
          <button class="btn btn-secondary" @click="cancelDelete">Hủy bỏ</button>
          <button class="btn btn-danger" @click="executeDelete" :disabled="deleting">
            <span
              v-if="deleting"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else>Xác nhận khóa</span>
          </button>
        </div>
      </div>

      <!-- Restore Confirmation -->
      <div v-if="showRestoreConfirm" class="confirmation-box">
        <button class="close-button" @click="cancelRestore">&times;</button>
        <div class="confirmation-body">
          <div class="confirm-icon-wrapper icon-success">
            <i class="fas fa-unlock"></i>
          </div>
          <h4 class="confirm-title">Xác nhận mở khóa?</h4>
          <p class="confirm-text">
            Bạn có chắc chắn muốn mở khóa tài khoản
            <strong>{{ selectedAccount.tenDangNhap }}</strong
            >? <br />
            Tài khoản này sẽ có thể đăng nhập sau khi được mở khóa.
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
            <span v-else>Xác nhận mở khóa</span>
          </button>
        </div>
      </div>
    </div>

    <!-- View Account Details Modal -->
    <div v-if="showAccountDetailsModal" class="modal-overlay" @click.self="closeViewModal">
      <div class="account-details-modal">
        <div class="modal-header">
          <h3>Chi Tiết Tài Khoản</h3>
          <button class="close-button" @click="closeViewModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-4">
              <div class="account-avatar-display">
                <div class="avatar-preview">
                  <img
                    v-if="selectedAccount.anh"
                    :src="processImageUrl(selectedAccount.anh)"
                    :alt="`Ảnh ${selectedAccount.tenDangNhap}`"
                    @error="handleProfileImageError"
                    class="uploaded-avatar"
                  />
                  <div v-else class="avatar-placeholder">
                    <i class="fas fa-user"></i>
                    <span>ảnh</span>
                  </div>
                </div>
                <h4 class="text-center mt-3">{{ selectedAccount.tenDangNhap }}</h4>
                <p class="text-center account-id">ID: {{ selectedAccount.id }}</p>

                <div class="status-badge">
                  <label>Trạng Thái:</label>
                  <span :class="`badge ${selectedAccount.trangThai ? 'bg-success' : 'bg-danger'}`">
                    {{ selectedAccount.trangThai ? 'Đang hoạt động' : 'Đã khóa' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-8">
              <div class="account-info">
                <div class="form-group">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="selectedAccount.tenDangNhap"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    class="form-control"
                    :value="selectedAccount.email"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="selectedAccount.soDienThoai || 'N/A'"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Vai trò</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="selectedAccount.tenLoai"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Ngày Tạo</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="formatDate(selectedAccount.ngayTao)"
                    readonly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeViewModal" class="btn btn-secondary">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Enhanced Image Preview Modal -->
    <div v-if="showImagePreview" class="image-preview-overlay" @click.self="closeImagePreview">
      <div class="image-preview-container">
        <div class="image-preview-header">
          <h5>{{ previewImageTitle }}</h5>
          <button class="close-preview" @click="closeImagePreview">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="image-preview-body">
          <div v-if="!previewImage" class="no-preview-image">
            <i class="fas fa-user-circle"></i>
            <p>Tài khoản chưa có ảnh</p>
          </div>
          <img
            v-else
            :src="processImageUrl(previewImage)"
            :alt="previewImageTitle"
            class="preview-image"
            @error="handlePreviewImageError"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, reactive } from 'vue'
import {
  getAllTaiKhoan,
  deleteTaiKhoan,
  restoreTaiKhoan,
  addTaiKhoan,
  updateTaiKhoan,
  searchTaiKhoan,
} from '@/Service/TaiKhoan'
import notification from '@/utils/notification'

export default {
  name: 'AccountT',
  setup() {
    // State variables
    const accounts = ref([])
    const loading = ref(true)
    const currentPage = ref(0)
    const pageSize = ref(10)
    const totalPages = ref(0)
    const totalItems = ref(0)
    const searchKeyword = ref('')
    const statusFilter = ref('all')
    const roleFilter = ref('all')
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const searchTimeout = ref(null)
    const accountRoles = ref([])
    const imageInput = ref(null)
    const accountTypes = ref([])

    // Add new state variables for adding a new account
    const newAccount = ref({
      tenDangNhap: '',
      email: '',
      soDienThoai: '',
      matKhau: '',
      loaiTaiKhoan: null,
      anh: '',
      anhPreview: null,
      trangThai: true, // Default to active status
      hoTen: '', // Thêm trường họ tên
    })
    const validationErrors = ref({})
    const isAddingAccount = ref(false)

    // Delete and restore states
    const showDeleteConfirm = ref(false)
    const showRestoreConfirm = ref(false)
    const selectedAccount = ref({})
    const deleting = ref(false)
    const restoring = ref(false)

    // Add new state variables for account details and image preview
    const showAccountDetailsModal = ref(false)
    const showImagePreview = ref(false)
    const previewImage = ref('')
    const previewImageTitle = ref('')

    // Add image state variables
    const imageLoadingStates = reactive({}) // Track loading state for each image
    const imageErrors = reactive({}) // Track error state for each image

    // Add form errors and submission state
    const formErrors = ref({})
    const isSubmitting = ref(false)

    const editImageInput = ref(null)

    // Fetch all accounts data
    const fetchAccounts = async () => {
      loading.value = true
      try {
        const response = await getAllTaiKhoan()
        accounts.value = response.data
        totalItems.value = accounts.value.length
        totalPages.value = Math.ceil(totalItems.value / pageSize.value)
        // Lấy danh sách loại tài khoản duy nhất
        accountRoles.value = [...new Set(accounts.value.map((acc) => acc.tenLoai))]

        // Initialize image loading states
        accounts.value.forEach((account) => {
          if (account.anh) {
            imageLoadingStates[account.id] = true
          }
        })
      } catch (error) {
        console.error('Error fetching accounts data:', error)
        notification.error('Không thể tải dữ liệu tài khoản.')
      } finally {
        loading.value = false
      }
    }

    // Initialize component
    onMounted(() => {
      console.log('AccountT component mounted - Loading account data')

      // Tải danh sách tài khoản
      fetchAccounts()

      // Tải danh sách loại tài khoản
      fetchAccountTypes()

      // Kiểm tra kết nối tới GCS (chỉ logging thông tin)
      console.log('Using GCS for avatar storage')
    })

    // Fetch account types for dropdown
    const fetchAccountTypes = async () => {
      try {
        // For now, we'll hardcode some types
        // In a real app, you'd fetch this from an API
        accountTypes.value = [
          { id: 2, tenLoai: 'Admin' },
          { id: 1, tenLoai: 'Nhân viên' },
          { id: 3, tenLoai: 'Khách hàng' },
        ]
      } catch (error) {
        console.error('Error fetching account types:', error)
      }
    }

    // Delete (Lock) functions
    const confirmDelete = (account) => {
      selectedAccount.value = { ...account }
      showDeleteConfirm.value = true
    }

    const cancelDelete = () => {
      showDeleteConfirm.value = false
      selectedAccount.value = {}
      deleting.value = false
    }

    // Phương thức executeDelete (khóa tài khoản) đã được cập nhật để xử lý thông báo tốt hơn
    const executeDelete = async () => {
      try {
        deleting.value = true
        console.log('Locking account with ID:', selectedAccount.value.id)

        // Gọi API để khóa tài khoản
        const response = await deleteTaiKhoan(selectedAccount.value.id)
        console.log('Lock response:', response)

        // Ẩn hộp thoại xác nhận
        showDeleteConfirm.value = false

        // Hiển thị thông báo thành công
        notification.success(`Đã khóa tài khoản ${selectedAccount.value.tenDangNhap} thành công.`)

        // Tải lại danh sách tài khoản
        fetchAccounts()
      } catch (error) {
        console.error('Error locking account:', error)
        notification.error(
          `Không thể khóa tài khoản. Lỗi: ${error.response?.data?.message || error.response?.data || 'Lỗi không xác định'}`,
        )
      } finally {
        deleting.value = false
      }
    }

    // Restore (Unlock) functions
    const confirmRestore = (account) => {
      selectedAccount.value = { ...account }
      showRestoreConfirm.value = true
    }

    const cancelRestore = () => {
      showRestoreConfirm.value = false
      selectedAccount.value = {}
      restoring.value = false
    }

    // Phương thức executeRestore (mở khóa tài khoản) được cập nhật để xử lý thông báo tốt hơn
    const executeRestore = async () => {
      try {
        restoring.value = true
        console.log('Unlocking account with ID:', selectedAccount.value.id)

        // Gọi API để mở khóa tài khoản
        const response = await restoreTaiKhoan(selectedAccount.value.id)
        console.log('Unlock response:', response)

        // Ẩn hộp thoại xác nhận
        showRestoreConfirm.value = false

        // Hiển thị thông báo thành công
        notification.success(
          `Đã mở khóa tài khoản ${selectedAccount.value.tenDangNhap} thành công.`,
        )

        // Tải lại danh sách tài khoản
        fetchAccounts()
      } catch (error) {
        console.error('Error unlocking account:', error)
        notification.error(
          `Không thể mở khóa tài khoản. Lỗi: ${error.response?.data?.message || error.response?.data || 'Lỗi không xác định'}`,
        )
      } finally {
        restoring.value = false
      }
    }

    // Computed property để lọc danh sách tài khoản theo trạng thái và loại tài khoản
    const filteredAccountList = computed(() => {
      let filtered = accounts.value
      // Lọc theo trạng thái
      if (statusFilter.value === 'active') {
        filtered = filtered.filter((acc) => acc.trangThai === true)
      } else if (statusFilter.value === 'inactive') {
        filtered = filtered.filter((acc) => acc.trangThai === false)
      }
      // Lọc theo loại tài khoản
      if (roleFilter.value !== 'all') {
        filtered = filtered.filter((acc) => acc.tenLoai === roleFilter.value)
      }
      return filtered
    })

    // Computed properties cho phân trang
    const startItem = computed(() => {
      return currentPage.value * pageSize.value + 1
    })

    const endItem = computed(() => {
      const end = (currentPage.value + 1) * pageSize.value
      return end > totalItems.value ? totalItems.value : end
    })

    // Danh sách tài khoản đã phân trang
    const paginatedAccounts = computed(() => {
      const filtered = filteredAccountList.value
      const start = currentPage.value * pageSize.value
      const end = Math.min(start + pageSize.value, filtered.length)
      return filtered.slice(start, end)
    })

    // Số dòng trống cần thêm vào để đảm bảo luôn có 10 dòng
    const emptyRows = computed(() => {
      const rowsCount = paginatedAccounts.value.length
      return rowsCount < 10 ? 10 - rowsCount : 0
    })

    // Filter by status function
    const filterByStatus = () => {
      console.log('Filtering by status:', statusFilter.value)
      // Reset pagination when filter changes
      currentPage.value = 0
    }

    // Lọc theo loại tài khoản
    const filterByRole = () => {
      currentPage.value = 0
    }

    // Clear search
    const clearSearch = () => {
      searchKeyword.value = ''
      fetchAccounts() // Load all accounts
    }

    // Search function - to be implemented
    const onSearchChange = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }

      searchTimeout.value = setTimeout(() => {
        // Reset to first page
        currentPage.value = 0

        // If no search term, reload all data
        if (searchKeyword.value.trim() === '') {
          fetchAccounts()
          return
        }

        // Perform the search
        performSearch()
      }, 500)
    }

    // New function to handle search
    const performSearch = async () => {
      if (searchKeyword.value.trim().length < 1) {
        return
      }

      loading.value = true
      try {
        // Check if backend search endpoint exists, if not, do frontend filtering
        try {
          const response = await searchTaiKhoan(searchKeyword.value.trim())
          accounts.value = response.data
        } catch {
          console.warn('Backend search not available, using frontend filtering')
          // Fallback to frontend filtering
          const term = searchKeyword.value.trim().toLowerCase()
          const allAccounts = await getAllTaiKhoan()
          accounts.value = allAccounts.data.filter(
            (account) =>
              (account.tenDangNhap && account.tenDangNhap.toLowerCase().includes(term)) ||
              (account.email && account.email.toLowerCase().includes(term)) ||
              (account.soDienThoai && account.soDienThoai.toLowerCase().includes(term)),
          )
        }

        totalItems.value = accounts.value.length
        totalPages.value = Math.ceil(totalItems.value / pageSize.value)
      } catch (error) {
        console.error('Error searching accounts:', error)
        notification.error('Không thể tìm kiếm tài khoản.')
        // If search fails, load all accounts
        fetchAccounts()
      } finally {
        loading.value = false
      }
    }

    // Pagination
    const changePage = (page) => {
      if (page < 0 || page >= totalPages.value) return
      currentPage.value = page
    }

    // Image processing function
    const processImageUrl = (imagePath) => {
      if (!imagePath) return null

      // Nếu là URL đầy đủ (từ GCS hoặc nguồn khác)
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }

      // Fallback cho trường hợp còn lại (đường dẫn tương đối)
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      return `${baseUrl}/images/${imagePath}`
    }

    // Utility functions
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
    }

    // Add view account details function
    const viewAccountDetails = (account) => {
      selectedAccount.value = { ...account }
      showAccountDetailsModal.value = true

      // Đảm bảo ảnh được xử lý đúng cách
      if (selectedAccount.value.anh) {
        // Đánh dấu ảnh đang tải
        imageLoadingStates[selectedAccount.value.id] = true
      }
    }

    // Close modal function
    const closeViewModal = () => {
      showAccountDetailsModal.value = false
    }

    // Image preview functions
    const openImagePreview = (imageUrl, accountName) => {
      previewImage.value = imageUrl
      previewImageTitle.value = `Ảnh tài khoản: ${accountName}`
      showImagePreview.value = true

      // Nếu không có ảnh hoặc URL ảnh không hợp lệ
      if (!imageUrl || (typeof imageUrl === 'string' && imageUrl.trim() === '')) {
        previewImage.value = null
        notification.info('Tài khoản chưa có ảnh đại diện')
      }
      // Đảm bảo URL ảnh từ GCS được xử lý đúng
      else if (typeof imageUrl === 'string') {
        // URL từ GCS đã được xử lý bởi processImageUrl() khi hiển thị trong danh sách
        console.log('Showing image preview from URL:', imageUrl)
      }
    }

    const closeImagePreview = () => {
      showImagePreview.value = false
      previewImage.value = ''
      previewImageTitle.value = ''
    }

    // Image error handlers
    const handleProfileImageError = (event) => {
      console.warn('Failed to load profile image')

      // Sử dụng ảnh mặc định từ public/images
      event.target.src = '/images/default-avatar.png'

      // Nếu vẫn không tải được ảnh mặc định, ẩn ảnh và hiển thị biểu tượng người dùng
      event.target.onerror = () => {
        event.target.style.display = 'none'
        // Hiển thị thông báo lỗi
        notification.warning('Không thể tải ảnh đại diện')
      }
    }

    const handlePreviewImageError = (event) => {
      console.warn('Failed to load preview image')

      // Sử dụng ảnh mặc định
      event.target.src = '/images/default-avatar.png'

      // Nếu vẫn không tải được, ẩn ảnh và hiển thị thông báo
      event.target.onerror = () => {
        event.target.style.display = 'none'
        // Hiển thị thông báo trong modal
        const previewBody = document.querySelector('.image-preview-body')
        if (previewBody) {
          const errorMsg = document.createElement('div')
          errorMsg.className = 'no-preview-image'
          errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i><p>Không thể tải ảnh</p>'
          previewBody.appendChild(errorMsg)
        }

        // Hiển thị thông báo cho người dùng
        notification.warning('Không thể tải ảnh xem trước')
      }
    }

    // Update image handling functions
    const handleImageLoad = (accountId) => {
      imageLoadingStates[accountId] = false
      delete imageErrors[accountId]
    }

    const handleImageError = (accountId) => {
      imageLoadingStates[accountId] = false
      imageErrors[accountId] = true
      console.warn(`Failed to load image for account ID: ${accountId}`)

      // Thử tải lại ảnh hoặc sử dụng ảnh mặc định
      const accountWithError = accounts.value.find((acc) => acc.id === accountId)
      if (accountWithError) {
        // Sử dụng ảnh mặc định thay vì hiển thị lỗi
        accountWithError.anh = '/images/default-avatar.png'
      }
    }

    // Image upload handling
    const triggerImageUpload = () => {
      imageInput.value.click()
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Kiểm tra file type
      if (!file.type.match('image.*')) {
        notification.error('Vui lòng chọn một tệp hình ảnh hợp lệ')
        return
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        notification.error('Kích thước ảnh không được vượt quá 5MB')
        return
      }

      // Lưu trữ file để upload lên server thay vì sử dụng base64
      newAccount.value.anhFile = file

      // Tạo URL preview để hiển thị ảnh
      newAccount.value.anhPreview = URL.createObjectURL(file)
    }

    const handleUploadImageError = (event) => {
      event.target.src = '/images/default-avatar.png'
    }

    // Close add modal and reset form
    const closeAddModal = () => {
      showAddModal.value = false
      newAccount.value = {
        tenDangNhap: '',
        email: '',
        soDienThoai: '',
        matKhau: '',
        loaiTaiKhoan: null,
        anh: '',
        anhPreview: null,
        trangThai: true, // Always default to active status
        hoTen: '', // Reset trường họ tên
      }
      validationErrors.value = {}
    }

    // Add new account function
    const submitAddAccount = async () => {
      isAddingAccount.value = true
      validationErrors.value = {}

      // Validate inputs
      if (
        !newAccount.value.tenDangNhap ||
        !newAccount.value.email ||
        !newAccount.value.soDienThoai ||
        !newAccount.value.hoTen
      ) {
        if (!newAccount.value.tenDangNhap) {
          notification.error('Tên đăng nhập là bắt buộc')
        }
        if (!newAccount.value.hoTen) {
          notification.error('Họ và tên là bắt buộc')
        }
        if (!newAccount.value.email) {
          notification.error('Email là bắt buộc')
        }
        if (!newAccount.value.soDienThoai) {
          notification.error('Số điện thoại là bắt buộc')
        }
        isAddingAccount.value = false
        return
      }

      try {
        // Gọi API để thêm tài khoản mới với FormData
        addTaiKhoan(newAccount.value)
          .then((response) => {
            console.log('Add account response:', response)
            notification.success('Tài khoản đã được tạo thành công.')
            closeAddModal()
            fetchAccounts()
          })
          .catch((error) => {
            console.error('Error adding account:', error)

            // Xử lý lỗi và hiển thị thông báo
            let errorMessage = 'Có lỗi xảy ra khi tạo tài khoản'
            if (error.response && error.response.data) {
              errorMessage = error.response.data
            }

            // Hiển thị thông báo lỗi cụ thể
            if (errorMessage.includes('Tên đăng nhập đã tồn tại')) {
              notification.error('Tên đăng nhập đã tồn tại trong hệ thống')
            } else if (errorMessage.includes('Email đã tồn tại')) {
              notification.error('Email đã tồn tại trong hệ thống')
            } else if (errorMessage.includes('Số điện thoại đã tồn tại')) {
              notification.error('Số điện thoại đã tồn tại trong hệ thống')
            } else if (errorMessage.includes('Tên đăng nhập không được chứa ký tự đặc biệt')) {
              notification.error('Tên đăng nhập không được chứa ký tự đặc biệt')
            } else if (errorMessage.includes('Định dạng email không hợp lệ')) {
              notification.error('Định dạng email không hợp lệ')
            } else if (errorMessage.includes('Số điện thoại phải có 10-11 chữ số')) {
              notification.error('Số điện thoại phải có 10-11 chữ số và bắt đầu bằng số 0')
            } else {
              notification.error(`Không thể tạo tài khoản: ${errorMessage}`)
            }
          })
          .finally(() => {
            isAddingAccount.value = false
          })
      } catch (error) {
        console.error('Error submitting form:', error)
        notification.error('Có lỗi xảy ra khi xử lý form')
        isAddingAccount.value = false
      }
    }

    // Add new styles for account details modal
    const accountAvatarDisplay = {
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }

    const avatarPreview = {
      width: '150px',
      height: '150px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }

    const avatarPreviewHover = {
      transform: 'scale(1.05)',
      boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
    }

    const avatarPlaceholder = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: '#9ca3af',
      height: '100%',
      width: '100%',
      justifyContent: 'center',
    }

    const avatarPlaceholderIcon = {
      fontSize: '50px',
      marginBottom: '10px',
    }

    const avatarPlaceholderSpan = {
      fontSize: '14px',
      textAlign: 'center',
    }

    const uploadedAvatar = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }

    // Edit functions
    const openEditModal = (account) => {
      // Xóa URL tạm thời cũ nếu có
      if (selectedAccount.value && selectedAccount.value._tempImageUrl) {
        URL.revokeObjectURL(selectedAccount.value._tempImageUrl)
      }

      // Tạo bản sao để tránh sửa đổi dữ liệu gốc
      selectedAccount.value = JSON.parse(JSON.stringify(account))
      selectedAccount.value.matKhau = '' // Xóa trường mật khẩu

      // Khởi tạo các trường liên quan đến ảnh
      selectedAccount.value._tempImageUrl = null
      selectedAccount.value.anhPreview = null
      selectedAccount.value.anhFile = null

      showEditModal.value = true
      formErrors.value = {}

      console.log('Mở modal chỉnh sửa tài khoản:', selectedAccount.value.tenDangNhap)
    }

    const cancelEdit = () => {
      // Xóa URL tạm thời để tránh rò rỉ bộ nhớ
      if (selectedAccount.value && selectedAccount.value._tempImageUrl) {
        URL.revokeObjectURL(selectedAccount.value._tempImageUrl)
        selectedAccount.value._tempImageUrl = null
        selectedAccount.value.anhPreview = null
      }

      showEditModal.value = false
      formErrors.value = {}
    }

    const submitEdit = async () => {
      formErrors.value = {}
      isSubmitting.value = true

      try {
        // Validate đầu vào
        if (!selectedAccount.value.email) {
          notification.error('Email không được để trống')
          isSubmitting.value = false
          return
        }

        if (!selectedAccount.value.soDienThoai) {
          notification.error('Số điện thoại không được để trống')
          isSubmitting.value = false
          return
        }

        // Gọi API để cập nhật tài khoản
        updateTaiKhoan(selectedAccount.value.id, selectedAccount.value)
          .then(() => {
            notification.success('Cập nhật tài khoản thành công')
            showEditModal.value = false

            // Tải lại danh sách tài khoản
            fetchAccounts()
          })
          .catch((error) => {
            console.error('Error updating account:', error)

            // Xử lý thông báo lỗi
            let errorMessage = 'Có lỗi xảy ra khi cập nhật tài khoản'
            if (error.response && error.response.data) {
              errorMessage = error.response.data
            }

            if (errorMessage.includes('Email đã tồn tại')) {
              notification.error('Email đã tồn tại trong hệ thống')
            } else if (errorMessage.includes('Số điện thoại đã tồn tại')) {
              notification.error('Số điện thoại đã tồn tại trong hệ thống')
            } else {
              notification.error(`Không thể cập nhật tài khoản: ${errorMessage}`)
            }
          })
          .finally(() => {
            isSubmitting.value = false
          })
      } catch (error) {
        console.error('Error submitting form:', error)
        notification.error('Có lỗi xảy ra khi xử lý form')
        isSubmitting.value = false
      }
    }

    // Handle image upload in edit mode
    const triggerImageUploadInEdit = () => {
      editImageInput.value.click()
    }

    const handleEditImageUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Kiểm tra định dạng file
      if (!file.type.match('image.*')) {
        notification.error('Vui lòng chọn một tệp hình ảnh hợp lệ')
        return
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        notification.error('Kích thước ảnh không được vượt quá 5MB')
        return
      }

      // Lưu trữ file để upload lên server
      selectedAccount.value.anhFile = file

      // Hủy URL cũ nếu có để tránh rò rỉ bộ nhớ
      if (selectedAccount.value._tempImageUrl) {
        URL.revokeObjectURL(selectedAccount.value._tempImageUrl)
      }

      // Tạo URL preview để hiển thị ảnh và lưu tạm thời
      const tempUrl = URL.createObjectURL(file)
      selectedAccount.value._tempImageUrl = tempUrl // Lưu URL tạm thời để có thể hủy sau này
      selectedAccount.value.anhPreview = tempUrl // Dùng cho hiển thị

      console.log('Tạo preview URL mới cho ảnh:', tempUrl)

      // Force render component
      selectedAccount.value = { ...selectedAccount.value }
    }

    return {
      accounts,
      loading,
      currentPage,
      pageSize,
      searchKeyword,
      statusFilter,
      roleFilter,
      showAddModal,
      showEditModal,
      filteredAccountList,
      totalItems,
      totalPages,
      paginatedAccounts,
      startItem,
      endItem,
      emptyRows,
      processImageUrl,
      formatDate,
      changePage,
      clearSearch,
      onSearchChange,
      filterByStatus,
      filterByRole,
      fetchAccounts,
      // Delete and restore
      showDeleteConfirm,
      showRestoreConfirm,
      selectedAccount,
      deleting,
      restoring,
      confirmDelete,
      cancelDelete,
      executeDelete,
      confirmRestore,
      cancelRestore,
      executeRestore,
      // New variables
      showAccountDetailsModal,
      showImagePreview,
      previewImage,
      previewImageTitle,
      viewAccountDetails,
      closeViewModal,
      openImagePreview,
      closeImagePreview,
      handleProfileImageError,
      handlePreviewImageError,
      // Add new image handling state variables and functions
      imageLoadingStates,
      imageErrors,
      handleImageLoad,
      handleImageError,
      accountRoles,
      // Add new account variables and functions
      newAccount,
      validationErrors,
      isAddingAccount,
      submitAddAccount,
      imageInput,
      triggerImageUpload,
      handleImageUpload,
      handleUploadImageError,
      closeAddModal,
      accountTypes,
      accountAvatarDisplay,
      avatarPreview,
      avatarPreviewHover,
      avatarPlaceholder,
      avatarPlaceholderIcon,
      avatarPlaceholderSpan,
      uploadedAvatar,
      formErrors,
      isSubmitting,
      fetchAccountTypes,
      openEditModal,
      cancelEdit,
      submitEdit,
      editImageInput,
      triggerImageUploadInEdit,
      handleEditImageUpload,
    }
  },
}
</script>

<style scoped>
/* GENERAL CONTAINER & TITLE */
.account-container {
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

.add-button {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 21px;
  font-weight: 600;
  padding: 0 20px;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #0d6efd, #0099ff);
  border: none;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
  background: linear-gradient(45deg, #0a58ca, #0077cc);
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
  border-collapse: collapse;
  border-spacing: 0;
}

.table thead th {
  background-color: #e9ecef;
  color: #212529;
  font-weight: 700;
  border-bottom: 2px solid #dee2e6;
  border-top: none;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
  vertical-align: middle;
  text-align: center;
  padding: 12px 10px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

.btn-info-light {
  color: #0dcaf0;
  background-color: rgba(13, 202, 240, 0.1);
}
.btn-info-light:hover {
  background-color: rgba(13, 202, 240, 0.2);
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
.btn-success-light {
  color: #198754;
  background-color: rgba(25, 135, 84, 0.1);
}
.btn-success-light:hover {
  background-color: rgba(25, 135, 84, 0.2);
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

/* Loading indicator */
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

/* Empty state */
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

/* Account avatar styles */
.image-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50px;
}

.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.account-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.account-avatar:hover {
  transform: scale(1.15);
  border-color: #007bff;
  box-shadow: 0 5px 10px rgba(0, 123, 255, 0.3);
}

.account-avatar.loading {
  opacity: 0.6;
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: 2px dashed #dee2e6;
  border-radius: 50%;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 10px;
  text-align: center;
  background-color: #f8f9fa;
}

.no-image-placeholder:hover {
  border-color: #007bff;
  color: #007bff;
  background-color: #e9f3ff;
  transform: scale(1.1);
}

.no-image-placeholder i {
  font-size: 22px;
  margin-bottom: 2px;
}

.no-image-placeholder span {
  font-size: 8px;
  line-height: 1;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
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

/* Add and Edit Modal Styles */
.add-account-modal,
.account-details-modal {
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  width: 800px;
  max-width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-fade-in 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #343a40;
}

.modal-body {
  padding: 25px;
}

.modal-header .close-button {
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

.modal-header .close-button:hover {
  background-color: #e2e8f0;
  color: #1e293b;
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

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
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
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  outline: none;
}

.form-control.is-invalid {
  border-color: #ef4444;
}

.invalid-feedback {
  color: #ef4444;
  font-size: 14px;
  margin-top: 5px;
}

/* Staff Avatar Upload Section */
.avatar-preview {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 3px dashed #d1d5db;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  background-color: #f9fafb;
  transition: all 0.3s ease;
  margin-bottom: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  position: relative;
}
.avatar-preview:hover {
  border-color: #3b82f6;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}
.avatar-preview::before {
  content: '\f030';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: #fff;
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.avatar-preview:hover::before {
  opacity: 0.7;
}
.avatar-preview::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  transition: all 0.3s ease;
  z-index: 1;
}
.avatar-preview:hover::after {
  background-color: rgba(0, 0, 0, 0.3);
}
.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #9ca3af;
  height: 100%;
  width: 100%;
  justify-content: center;
  z-index: 0;
}
.avatar-placeholder i {
  font-size: 64px;
  margin-bottom: 15px;
  color: #adb5bd;
  transition: all 0.3s ease;
}
.avatar-placeholder span {
  font-size: 16px;
  text-align: center;
  max-width: 80%;
  color: #6c757d;
  transition: all 0.3s ease;
}
.avatar-preview:hover .avatar-placeholder i {
  color: #3b82f6;
}
.uploaded-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s;
  z-index: 0;
}

/* Add new styles for account details modal */
.account-avatar-display {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.account-avatar-display .avatar-preview {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
  border: 3px dashed #d1d5db;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.account-avatar-display .avatar-preview:hover {
  border-color: #0d6efd;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.account-avatar-display .avatar-preview:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  transition: all 0.3s ease;
}

.account-avatar-display .avatar-preview:hover:after {
  background-color: rgba(0, 0, 0, 0.1);
}

.account-avatar-display h4 {
  font-size: 1.2rem;
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
}

.account-avatar-display .account-id {
  font-size: 0.85rem;
}

.status-badge {
  padding-top: 15px;
  text-align: center;
}

.status-badge label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge .badge {
  font-size: 0.9rem;
  padding: 6px 12px;
}

.account-info {
  padding: 8px;
}

/* Styles for inputs in details view */
.account-info .form-control[readonly] {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  cursor: text;
  padding: 8px 12px;
  font-size: 0.95rem;
}

/* Image preview styles */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

.image-preview-container {
  background: #fff;
  border-radius: 12px;
  max-width: 90%;
  max-height: 90%;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

.image-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.image-preview-header h5 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.close-preview {
  background: transparent;
  border: none;
  font-size: 18px;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-preview:hover {
  background-color: #e9ecef;
  color: #495057;
}

.image-preview-body {
  padding: 20px;
  text-align: center;
  max-height: 70vh;
  overflow: auto;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.no-preview-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6c757d;
}

.no-preview-image i {
  font-size: 4rem;
  margin-bottom: 15px;
  color: #dee2e6;
}

.no-preview-image p {
  font-size: 1.1rem;
  margin: 0;
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

.required-mark {
  color: #dc3545;
  margin-left: 3px;
}

/* Modal footer styling */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  margin-top: 20px;
}

.form-text {
  color: #6c757d;
  font-size: 12px;
  margin-top: 5px;
}

/* Fix for the file input styling */
.avatar-preview {
  position: relative;
  overflow: hidden;
}

.avatar-preview:hover {
  cursor: pointer;
  border-color: #3b82f6;
}

.uploaded-avatar {
  transition: all 0.3s ease;
}

.avatar-preview:hover .uploaded-avatar {
  opacity: 0.8;
}

.form-check {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.form-check-input {
  margin-right: 10px;
  width: 18px;
  height: 18px;
}

.form-check-label {
  margin-bottom: 0;
  user-select: none;
}

/* Form styling improvements */
.add-account-modal {
  max-width: 850px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 6px 12px rgba(0, 0, 0, 0.08),
    0 30px 60px -12px rgba(50, 50, 93, 0.25);
  transform: translateY(0);
  animation: modal-slide-down 0.4s ease;
}

@keyframes modal-slide-down {
  0% {
    opacity: 0;
    transform: translateY(-30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  background: linear-gradient(90deg, #0d6efd 0%, #0099ff 100%);
  padding: 20px 30px;
  border-bottom: none;
}

.modal-header h3 {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.modal-header .close-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-header .close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 30px 35px;
  background-color: #fff;
}

.form-group {
  margin-bottom: 22px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #3a3a3a;
  font-size: 15px;
  transition: all 0.2s;
}

.form-control {
  height: 48px;
  padding: 10px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
  box-shadow: none;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  background-color: #fff;
}

.form-control.is-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15);
}

.form-select {
  height: 48px;
  cursor: pointer;
}

.invalid-feedback {
  position: absolute;
  font-size: 13px;
  color: #dc3545;
  margin-top: 4px;
}

.form-text {
  color: #6c757d;
  font-size: 13px;
  margin-top: 6px;
}

.required-mark {
  color: #dc3545;
  margin-left: 3px;
  font-weight: 700;
}

/* Avatar upload section */
.account-avatar-display {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.avatar-preview {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
  border: 3px dashed #d1d5db;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.avatar-preview:hover {
  border-color: #0d6efd;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.avatar-preview:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  transition: all 0.3s ease;
}

.avatar-preview:hover:after {
  background-color: rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  width: 100%;
  height: 100%;
}

.avatar-placeholder i {
  font-size: 64px;
  margin-bottom: 15px;
  color: #adb5bd;
}

.avatar-placeholder span {
  font-size: 16px;
  text-align: center;
  max-width: 80%;
  color: #6c757d;
}

.uploaded-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s;
}

/* Modal footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 10px 30px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

.modal-footer .btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 30px;
  transition: all 0.3s ease;
}

.modal-footer .btn-secondary {
  background-color: #e9ecef;
  color: #495057;
  border: none;
}

.modal-footer .btn-secondary:hover {
  background-color: #dee2e6;
  color: #212529;
}

.modal-footer .btn-primary {
  background: linear-gradient(45deg, #0d6efd, #0099ff);
  border: none;
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
}

.modal-footer .btn-primary:hover {
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
  transform: translateY(-2px);
}

.modal-footer .btn-primary:active {
  transform: translateY(0);
}

.modal-footer .btn-primary:disabled {
  background: linear-gradient(45deg, #6c757d, #adb5bd);
  box-shadow: none;
  opacity: 0.8;
}

/* Form row styling */
.row {
  margin: 0 -15px;
}

.col-md-4,
.col-md-8 {
  padding: 0 15px;
}

/* Custom Radio Button Styling - Complete Reset */
.gender-group {
  margin: 15px 0;
}

.form-check-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  gap: 30px;
}

.form-check {
  position: relative;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
}

.form-check-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.form-check-label {
  position: relative;
  padding-left: 30px;
  margin: 0;
  cursor: pointer;
  font-size: 16px;
  color: #4b5563;
  display: inline-block;
  border: none;
  text-decoration: none !important;
  line-height: normal;
}

.form-check-label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid #c1c1c1;
  border-radius: 50%;
  background-color: white;
}

.form-check-input:checked + .form-check-label {
  color: #0d6efd;
}

.form-check-input:checked + .form-check-label::before {
  background-color: #0d6efd;
  border: none;
}

.form-check-input:checked + .form-check-label::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
}

/* Remove any link-like styling */
.gender-group a,
.gender-group a:hover,
.gender-group a:active,
.gender-group a:visited,
.gender-group label,
.gender-group label::after,
.gender-group label::before {
  text-decoration: none !important;
  border-bottom: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.form-check-label::after {
  border-bottom: none !important;
}

/* Override any global underlines or borders that might be applied */
.form-check-label {
  border-bottom: none !important;
  text-decoration: none !important;
}

/* Target WordPress-like themes that might add underlines */
.form-check-label > span,
.form-check-label > * {
  text-decoration: none !important;
  border-bottom: none !important;
}

/* --- ĐỒNG BỘ CSS VỚI NHANVIEN.VUE --- */
.add-account-modal {
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  width: 800px;
  max-width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 6px 12px rgba(0, 0, 0, 0.08),
    0 30px 60px -12px rgba(50, 50, 93, 0.25);
  transform: translateY(0);
  animation: modal-slide-down 0.4s ease;
}
@keyframes modal-slide-down {
  0% {
    opacity: 0;
    transform: translateY(-30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.add-account-modal .modal-header,
.account-details-modal .modal-header {
  background: linear-gradient(135deg, #0d6efd 0%, #0088ff 50%, #00a1ff 100%);
  padding: 20px 30px;
  border-bottom: none;
  position: relative;
  overflow: hidden;
}
.add-account-modal .modal-header:before,
.account-details-modal .modal-header:before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(30deg);
  pointer-events: none;
}
.add-account-modal .modal-header h3,
.account-details-modal .modal-header h3 {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
}
.add-account-modal .modal-header .close-button,
.account-details-modal .modal-header .close-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  z-index: 1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.add-account-modal .modal-header .close-button:hover,
.account-details-modal .modal-header .close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}
.add-account-modal .modal-body,
.account-details-modal .modal-body {
  padding: 30px 30px 5px 30px;
  background-color: #fff;
}
.account-avatar-display {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.account-avatar-display .avatar-preview {
  width: 150px;
  height: 150px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border: 3px dashed #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #f9fafb;
}
.account-avatar-display .avatar-preview:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
  border-color: #3b82f6;
}
.account-avatar-display .avatar-preview::before {
  content: '\f030';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: #fff;
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.account-avatar-display .avatar-preview:hover::before {
  opacity: 0.7;
}
.account-avatar-display .avatar-preview::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  transition: all 0.3s ease;
  z-index: 1;
}
.account-avatar-display .avatar-preview:hover::after {
  background-color: rgba(0, 0, 0, 0.3);
}
.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #9ca3af;
  height: 100%;
  width: 100%;
  justify-content: center;
  z-index: 0;
}
.avatar-placeholder i {
  font-size: 64px;
  margin-bottom: 15px;
  color: #adb5bd;
  transition: all 0.3s ease;
}
.avatar-placeholder span {
  font-size: 16px;
  text-align: center;
  max-width: 80%;
  color: #6c757d;
  transition: all 0.3s ease;
}
.account-avatar-display .avatar-preview:hover .avatar-placeholder i {
  color: #3b82f6;
}
.uploaded-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s;
  z-index: 0;
}
.account-avatar-display h4 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
  color: #333;
}
.account-avatar-display .account-id {
  font-size: 0.9rem;
  color: #6c757d;
}
.status-badge {
  padding-top: 15px;
  text-align: center;
}
.status-badge label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  font-weight: 500;
}
.status-badge .badge {
  font-size: 0.9rem;
  padding: 8px 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.account-info {
  padding: 8px;
}
.account-info .form-control[readonly] {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  cursor: text;
  padding: 8px 14px;
  font-size: 0.95rem;
  color: #333;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #3a3a3a;
  font-size: 15px;
  transition: all 0.2s;
  position: relative;
}
.form-group label::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, #0d6efd, #00c6ff);
  transition: width 0.3s ease;
}
.form-group:focus-within label::after {
  width: 30px;
}
.form-group:focus-within label {
  color: #0d6efd;
}
.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.18);
  background-color: #fff;
}
.form-control.is-invalid {
  animation: shake 0.5s ease-in-out;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-5px);
  }
  40%,
  80% {
    transform: translateX(5px);
  }
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.add-account-modal .form-group,
.account-details-modal .form-group {
  animation: fadeInUp 0.4s ease backwards;
}
.add-account-modal .form-group:nth-child(1),
.account-details-modal .form-group:nth-child(1) {
  animation-delay: 0.1s;
}
.add-account-modal .form-group:nth-child(2),
.account-details-modal .form-group:nth-child(2) {
  animation-delay: 0.15s;
}
.add-account-modal .form-group:nth-child(3),
.account-details-modal .form-group:nth-child(3) {
  animation-delay: 0.2s;
}
.add-account-modal .form-group:nth-child(4),
.account-details-modal .form-group:nth-child(4) {
  animation-delay: 0.25s;
}
.add-account-modal .form-group:nth-child(5),
.account-details-modal .form-group:nth-child(5) {
  animation-delay: 0.3s;
}
.add-account-modal .form-group:nth-child(6),
.account-details-modal .form-group:nth-child(6) {
  animation-delay: 0.35s;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 10px 35px 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background-color: #fff;
}
.modal-footer .btn {
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 30px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.modal-footer .btn-secondary {
  background-color: #f1f3f5;
  color: #495057;
  border: none;
  min-width: 120px;
}
.modal-footer .btn-secondary:hover {
  background-color: #e9ecef;
  color: #212529;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}
.modal-footer .btn-primary {
  background: linear-gradient(45deg, #0d6efd, #0099ff);
  border: none;
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
  min-width: 150px;
}
.modal-footer .btn-primary:hover {
  background: linear-gradient(45deg, #0b5ed7, #0084ff);
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
  transform: translateY(-2px);
}
.modal-footer .btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(13, 110, 253, 0.3);
}
.modal-footer .btn-primary:disabled {
  background: linear-gradient(45deg, #6c757d, #adb5bd);
  box-shadow: none;
  opacity: 0.8;
}
</style>
