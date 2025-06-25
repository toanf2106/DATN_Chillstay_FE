<template>
  <div class="nhan-vien-container">
    <h1 class="page-title">Quản Lý Nhân Viên</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <select v-model="searchType" class="search-type-select">
            <option value="all">Tất cả</option>
            <option value="maNhanVien">Mã nhân viên</option>
            <option value="hoTen">Họ tên</option>
            <option value="soDienThoai">Số điện thoại</option>
            <option value="email">Email</option>
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
          <option value="active">Đang làm việc</option>
          <option value="inactive">Đã nghỉ việc</option>
        </select>
        <button class="btn btn-primary add-button" @click="openAddModal">
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

    <!-- Staff Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã NV</th>
            <th>Họ Tên</th>
            <th>Số Điện Thoại</th>
            <th>Email</th>
            <th>Địa Chỉ</th>
            <th>Giới Tính</th>
            <th>Ngày Vào Làm</th>
            <th>Ngày Nghỉ Việc</th>
            <th>Trạng Thái</th>
            <th>Ảnh</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="nhanVien in paginatedStaff"
            :key="nhanVien.id"
            @dblclick="viewStaffDetails(nhanVien)"
          >
            <td class="text-center">{{ nhanVien.id }}</td>
            <td class="text-center">{{ nhanVien.maNhanVien }}</td>
            <td class="text-center">{{ nhanVien.hoTen }}</td>
            <td class="text-center">{{ nhanVien.soDienThoai }}</td>
            <td class="text-center">{{ nhanVien.email }}</td>
            <td class="text-center">{{ nhanVien.diaChi }}</td>
            <td class="text-center">{{ nhanVien.gioiTinh ? 'Nam' : 'Nữ' }}</td>
            <td class="text-center">{{ formatDate(nhanVien.ngayVaoLam) }}</td>
            <td class="text-center">{{ formatDate(nhanVien.ngayNghiLam) }}</td>
            <td class="text-center">
              <span :class="`badge ${nhanVien.trangThai ? 'bg-success' : 'bg-danger'}`">
                {{ nhanVien.trangThai ? 'Đang làm việc' : 'Nghỉ việc' }}
              </span>
            </td>
            <td class="text-center">
              <!-- Cải tiến phần hiển thị ảnh -->
              <div class="image-wrapper">
                <div v-if="imageLoadingStates[nhanVien.id]" class="image-loading">
                  <div class="spinner-border spinner-border-sm text-primary"></div>
                </div>
                <img
                  v-if="(nhanVien.anhBase64 || nhanVien.anh) && !imageErrors[nhanVien.id]"
                  :src="processImageUrl(nhanVien.anhBase64 || nhanVien.anh)"
                  :alt="`Ảnh ${nhanVien.hoTen}`"
                  class="staff-avatar"
                  :class="{ loading: imageLoadingStates[nhanVien.id] }"
                  @click="openImagePreview(nhanVien.anhBase64 || nhanVien.anh, nhanVien.hoTen)"
                  @load="handleImageLoad(nhanVien.id)"
                  @error="handleImageError(nhanVien.id)"
                />
                <div
                  v-else
                  class="no-image-placeholder"
                  @click="openImagePreview(null, nhanVien.hoTen)"
                >
                  <i class="fas fa-user-circle"></i>
                  <span>{{ imageErrors[nhanVien.id] ? 'Lỗi ảnh' : 'Chưa có ảnh' }}</span>
                </div>
              </div>
            </td>
            <td class="text-center">
              <div v-if="nhanVien.trangThai" class="action-buttons">
                <!-- <button
                  class="btn btn-icon btn-info-light"
                  title="Xem chi tiết"
                  @click="viewStaffDetails(nhanVien)"
                >
                  <i class="fas fa-eye"></i>
                </button> -->
                <button
                  class="btn btn-icon btn-warning-light"
                  title="Chỉnh sửa"
                  @click="openEditModal(nhanVien)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-icon btn-danger-light"
                  title="Xóa"
                  @click="confirmDelete(nhanVien)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div v-else class="action-buttons">
                <button
                  class="btn btn-icon btn-success-light"
                  title="Khôi phục"
                  @click="confirmRestore(nhanVien)"
                >
                  <i class="fas fa-reply"></i>
                </button>
              </div>
            </td>
          </tr>
          <!-- Empty rows to ensure space for 10 rows -->
          <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
            <td colspan="12">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && paginatedStaff.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy nhân viên nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredNhanVienList.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} nhân viên
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
            Hành động này sẽ xóa vĩnh viễn nhân viên
            <strong>{{ selectedStaff.hoTen }}</strong
            >. <br />Bạn không thể hoàn tác hành động này.
          </p>
        </div>
        <div class="confirmation-footer">
          <button class="btn btn-secondary" @click="cancelDelete">Hủy bỏ</button>
          <button class="btn btn-danger" @click="deleteStaff" :disabled="deleting">
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
            Hành động này sẽ khôi phục nhân viên
            <strong>{{ selectedStaff.hoTen }}</strong> trở lại.
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

    <!-- View Staff Details Modal -->
    <div v-if="showStaffDetailsModal" class="modal-overlay" @click.self="closeViewModal">
      <div class="staff-details-modal">
        <div class="modal-header">
          <h3>Chi Tiết Nhân Viên</h3>
          <button class="close-button" @click="closeViewModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-4">
              <div class="staff-avatar-display">
                <div class="avatar-preview">
                  <img
                    v-if="selectedStaff.anhBase64 || selectedStaff.anh"
                    :src="processImageUrl(selectedStaff.anhBase64 || selectedStaff.anh)"
                    :alt="`Ảnh ${selectedStaff.hoTen}`"
                    @error="handleProfileImageError"
                    class="uploaded-avatar"
                  />
                  <div v-else class="avatar-placeholder">
                    <i class="fas fa-user"></i>
                    <span>ảnh</span>
                  </div>
                </div>
                <h4 class="text-center mt-3">{{ selectedStaff.hoTen }}</h4>
                <p class="text-center staff-id">Mã NV: {{ selectedStaff.maNhanVien }}</p>

                <div class="status-badge">
                  <label>Trạng Thái:</label>
                  <span :class="`badge ${selectedStaff.trangThai ? 'bg-success' : 'bg-danger'}`">
                    {{ selectedStaff.trangThai ? 'Đang làm việc' : 'Nghỉ việc' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-8">
              <div class="staff-info">
                <div class="form-group">
                  <label>Mã Nhân viên</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="selectedStaff.maNhanVien"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="selectedStaff.soDienThoai"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Email</label>
                  <input type="email" class="form-control" :value="selectedStaff.email" readonly />
                </div>

                <div class="form-group gender-group">
                  <label>Giới Tính</label>
                  <div class="form-check-group">
                    <div class="form-check">
                      <input
                        type="radio"
                        id="view-gender-male"
                        :checked="selectedStaff.gioiTinh"
                        disabled
                        class="form-check-input"
                      />
                      <label class="form-check-label" for="view-gender-male">Nam</label>
                    </div>
                    <div class="form-check">
                      <input
                        type="radio"
                        id="view-gender-female"
                        :checked="!selectedStaff.gioiTinh"
                        disabled
                        class="form-check-input"
                      />
                      <label class="form-check-label" for="view-gender-female">Nữ</label>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>Ngày Vào Làm</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="formatDate(selectedStaff.ngayVaoLam)"
                    readonly
                  />
                </div>

                <div class="form-group" v-if="selectedStaff.ngayNghiLam">
                  <label>Ngày Nghỉ Làm</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="formatDate(selectedStaff.ngayNghiLam)"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Địa chỉ</label>
                  <textarea
                    class="form-control"
                    rows="3"
                    :value="selectedStaff.diaChi"
                    readonly
                  ></textarea>
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
            <p>Nhân viên chưa có ảnh</p>
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

    <!-- Thêm Modal Nhân Viên Mới -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="cancelAdd">
      <div class="add-staff-modal">
        <div class="modal-header">
          <h3>Thêm Nhân Viên Mới</h3>
          <button class="close-button" @click="cancelAdd">&times;</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-4">
              <div class="staff-avatar-upload">
                <div class="avatar-preview" @click="triggerFileInput">
                  <img
                    v-if="previewAvatar"
                    :src="previewAvatar"
                    alt="Avatar Preview"
                    class="uploaded-avatar"
                  />
                  <div v-else class="avatar-placeholder">
                    <i class="fas fa-user"></i>
                    <span>ảnh</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  @change="onFileSelected"
                  accept="image/*"
                  style="display: none"
                />
              </div>
            </div>
            <div class="col-md-8">
              <form @submit.prevent="submitAddStaff">
                <div class="form-group">
                  <label for="hoTen">Họ Tên</label>
                  <input
                    type="text"
                    id="hoTen"
                    v-model="newStaff.hoTen"
                    class="form-control"
                    :class="{ 'is-invalid': validation.hoTen }"
                    required
                  />
                  <div v-if="validation.hoTen" class="invalid-feedback">
                    {{ validation.hoTen }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    v-model="newStaff.email"
                    class="form-control"
                    :class="{ 'is-invalid': validation.email }"
                    required
                  />
                  <div v-if="validation.email" class="invalid-feedback">
                    {{ validation.email }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="soDienThoai">Số điện thoại</label>
                  <input
                    type="text"
                    id="soDienThoai"
                    v-model="newStaff.soDienThoai"
                    class="form-control"
                    :class="{ 'is-invalid': validation.soDienThoai }"
                    required
                  />
                  <div v-if="validation.soDienThoai" class="invalid-feedback">
                    {{ validation.soDienThoai }}
                  </div>
                </div>

                <div class="form-group gender-group">
                  <label>Giới Tính</label>
                  <div class="form-check-group">
                    <div class="form-check">
                      <input
                        type="radio"
                        id="gender-male"
                        name="gender"
                        v-model="newStaff.gioiTinh"
                        :value="true"
                        class="form-check-input"
                      />
                      <label class="form-check-label" for="gender-male">Nam</label>
                    </div>
                    <div class="form-check">
                      <input
                        type="radio"
                        id="gender-female"
                        name="gender"
                        v-model="newStaff.gioiTinh"
                        :value="false"
                        class="form-check-input"
                      />
                      <label class="form-check-label" for="gender-female">Nữ</label>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="diaChi">Địa chỉ</label>
                  <textarea
                    id="diaChi"
                    v-model="newStaff.diaChi"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label for="password">Mật khẩu (tùy chọn)</label>
                  <input
                    type="password"
                    id="password"
                    v-model="newStaff.password"
                    class="form-control"
                    placeholder="Để trống để sử dụng mật khẩu mặc định"
                  />
                  <small class="form-text text-muted">
                    Nếu không nhập, mật khẩu mặc định là "nv123"
                  </small>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="cancelAdd">Hủy</button>
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    <span
                      v-if="isSubmitting"
                      class="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span v-else>Thêm nhân viên</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chỉnh Sửa Modal Nhân Viên -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="cancelEdit">
      <div class="staff-details-modal">
        <div class="modal-header">
          <h3>Chỉnh sửa Nhân Viên</h3>
          <button class="close-button" @click="cancelEdit">&times;</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-4">
              <div class="staff-avatar-display">
                <div class="avatar-preview" @click="triggerEditFileInput">
                  <img
                    v-if="editPreviewAvatar || selectedStaff.anhBase64 || selectedStaff.anh"
                    :src="
                      editPreviewAvatar ||
                      processImageUrl(selectedStaff.anhBase64 || selectedStaff.anh)
                    "
                    alt="Avatar Preview"
                    class="uploaded-avatar"
                  />
                  <div v-else class="avatar-placeholder">
                    <i class="fas fa-user"></i>
                    <span>ảnh</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref="editFileInput"
                  @change="onEditFileSelected"
                  accept="image/*"
                  style="display: none"
                />
                <h4 class="text-center mt-3">{{ selectedStaff.hoTen }}</h4>
                <p class="text-center staff-id">Mã NV: {{ selectedStaff.maNhanVien }}</p>

                <!-- Hiển thị trạng thái -->
                <div class="status-badge">
                  <label>Trạng Thái:</label>
                  <span :class="`badge ${selectedStaff.trangThai ? 'bg-success' : 'bg-danger'}`">
                    {{ selectedStaff.trangThai ? 'Đang làm việc' : 'Nghỉ việc' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-8">
              <form @submit.prevent="submitEditStaff">
                <div class="form-group">
                  <label for="editHoTen">Họ Tên</label>
                  <input
                    type="text"
                    id="editHoTen"
                    v-model="selectedStaff.hoTen"
                    class="form-control"
                    :class="{ 'is-invalid': editValidation.hoTen }"
                    required
                  />
                  <div v-if="editValidation.hoTen" class="invalid-feedback">
                    {{ editValidation.hoTen }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="editSoDienThoai">Số điện thoại</label>
                  <input
                    type="text"
                    id="editSoDienThoai"
                    v-model="selectedStaff.soDienThoai"
                    class="form-control"
                    :class="{ 'is-invalid': editValidation.soDienThoai }"
                    required
                  />
                  <div v-if="editValidation.soDienThoai" class="invalid-feedback">
                    {{ editValidation.soDienThoai }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="editEmail">Email</label>
                  <input
                    type="email"
                    id="editEmail"
                    v-model="selectedStaff.email"
                    class="form-control"
                    :class="{ 'is-invalid': editValidation.email }"
                    required
                  />
                  <div v-if="editValidation.email" class="invalid-feedback">
                    {{ editValidation.email }}
                  </div>
                </div>

                <div class="form-group gender-group">
                  <label>Giới Tính</label>
                  <div class="form-check-group">
                    <div class="form-check">
                      <input
                        type="radio"
                        id="edit-gender-male"
                        name="edit-gender"
                        v-model="selectedStaff.gioiTinh"
                        :value="true"
                        class="form-check-input"
                      />
                      <label class="form-check-label" for="edit-gender-male">Nam</label>
                    </div>
                    <div class="form-check">
                      <input
                        type="radio"
                        id="edit-gender-female"
                        name="edit-gender"
                        v-model="selectedStaff.gioiTinh"
                        :value="false"
                        class="form-check-input"
                      />
                      <label class="form-check-label" for="edit-gender-female">Nữ</label>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="editDiaChi">Địa chỉ</label>
                  <textarea
                    id="editDiaChi"
                    v-model="selectedStaff.diaChi"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="cancelEdit">Hủy</button>
                  <button type="submit" class="btn btn-primary" :disabled="isEditing">
                    <span
                      v-if="isEditing"
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
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, reactive } from 'vue'
import {
  getAllNhanVien,
  deleteNhanVien,
  restoreNhanVien,
  addNhanVien,
  updateNhanVien,
  searchNhanVien,
  searchNhanVienByMa,
  searchNhanVienByTen,
  searchNhanVienBySoDienThoai,
  searchNhanVienByEmail,
} from '@/Service/NhanVienService'
import notification from '@/utils/notification'

export default {
  name: 'NhanVienView',
  setup() {
    // State variables
    const nhanVienList = ref([])
    const loading = ref(true)
    const currentPage = ref(0)
    const pageSize = ref(10)
    const totalPages = ref(0)
    const totalItems = ref(0)
    const searchKeyword = ref('')
    const searchTimeout = ref(null)
    const searchType = ref('all') // Loại tìm kiếm: all, maNhanVien, hoTen, soDienThoai, email

    // Thêm state cho form thêm nhân viên
    const showAddModal = ref(false)
    const showStaffDetailsModal = ref(false)
    const showEditModal = ref(false)
    const isSubmitting = ref(false)
    const isEditing = ref(false)
    const previewAvatar = ref(null)
    const editPreviewAvatar = ref(null)
    const selectedFile = ref(null)
    const editSelectedFile = ref(null)
    const fileInput = ref(null)
    const editFileInput = ref(null)

    // Đối tượng nhân viên mới
    const newStaff = ref({
      hoTen: '',
      email: '',
      soDienThoai: '',
      gioiTinh: true, // Mặc định là Nam
      diaChi: '',
      password: '',
      anh: null,
    })

    // Validation errors
    const validation = ref({
      hoTen: '',
      email: '',
      soDienThoai: '',
    })

    const editValidation = ref({
      hoTen: '',
      email: '',
      soDienThoai: '',
    })

    // Image handling states
    const imageLoadingStates = reactive({}) // Track loading state for each image
    const imageErrors = reactive({}) // Track error state for each image

    // Thêm biến để lọc theo trạng thái
    const statusFilter = ref('all')

    const selectedStaff = ref({})
    const previewImage = ref('')
    const previewImageTitle = ref('')
    const showImagePreview = ref(false)
    const deleting = ref(false)
    const restoring = ref(false)

    // Custom dialog state
    const showDeleteConfirm = ref(false)
    const showRestoreConfirm = ref(false)

    // Initialize modals on component mount
    onMounted(() => {
      // Load initial data
      fetchNhanVien()
    })

    // Image processing function
    const processImageUrl = (imagePath) => {
      if (!imagePath) return null

      // Nếu là chuỗi Base64 đầy đủ
      if (imagePath.startsWith('data:')) {
        return imagePath
      }

      // Nếu chỉ là chuỗi Base64 không có prefix, thêm prefix vào
      if (imagePath.length > 100 && !imagePath.startsWith('http')) {
        // Giả định là ảnh PNG nếu không biết định dạng
        return `data:image/png;base64,${imagePath}`
      }

      // Nếu là URL đầy đủ từ database
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }

      // Nếu là đường dẫn tương đối hoặc tên file
      // Điều chỉnh theo cấu hình server của bạn
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      return `${baseUrl}/images/${imagePath}`
    }

    // Image loading handlers
    const handleImageLoad = (staffId) => {
      imageLoadingStates[staffId] = false
      delete imageErrors[staffId]
    }

    const handleImageError = (staffId) => {
      imageLoadingStates[staffId] = false
      imageErrors[staffId] = true
      console.warn(`Failed to load image for staff ID: ${staffId}`)
    }

    const handleProfileImageError = (event) => {
      event.target.src = '/images/default-avatar.png'
    }

    const handlePreviewImageError = (event) => {
      event.target.src = '/images/default-avatar.png'
    }

    // Enhanced image preview
    const openImagePreview = (imageUrl, staffName) => {
      previewImage.value = imageUrl
      previewImageTitle.value = `Ảnh nhân viên: ${staffName}`
      showImagePreview.value = true
    }

    const closeImagePreview = () => {
      showImagePreview.value = false
      previewImage.value = ''
      previewImageTitle.value = ''
    }

    // Computed property để lọc danh sách nhân viên theo trạng thái
    const filteredNhanVienList = computed(() => {
      if (statusFilter.value === 'all') {
        return nhanVienList.value
      } else if (statusFilter.value === 'active') {
        return nhanVienList.value.filter((nv) => nv.trangThai === true)
      } else if (statusFilter.value === 'inactive') {
        return nhanVienList.value.filter((nv) => nv.trangThai === false)
      }
      return nhanVienList.value
    })

    // Computed properties cho phân trang
    const startItem = computed(() => {
      return currentPage.value * pageSize.value + 1
    })

    const endItem = computed(() => {
      const end = (currentPage.value + 1) * pageSize.value
      return end > totalItems.value ? totalItems.value : end
    })

    // Danh sách nhân viên đã phân trang
    const paginatedStaff = computed(() => {
      const filtered = filteredNhanVienList.value
      const start = currentPage.value * pageSize.value
      const end = Math.min(start + pageSize.value, filtered.length)
      return filtered.slice(start, end)
    })

    // Số dòng trống cần thêm vào để đảm bảo luôn có 10 dòng
    const emptyRows = computed(() => {
      const rowsCount = paginatedStaff.value.length
      return rowsCount < 10 ? 10 - rowsCount : 0
    })

    // Fetch all staff data
    const fetchNhanVien = async () => {
      loading.value = true
      try {
        const response = await getAllNhanVien()
        nhanVienList.value = response.data
        totalItems.value = nhanVienList.value.length
        totalPages.value = Math.ceil(totalItems.value / pageSize.value)

        // Initialize image loading states
        nhanVienList.value.forEach((staff) => {
          if (staff.anh) {
            imageLoadingStates[staff.id] = true
          }
        })
      } catch (error) {
        console.error('Error fetching staff data:', error)
        notification.error('Không thể tải dữ liệu nhân viên.')
      } finally {
        loading.value = false
      }
    }

    // Filter by status function
    const filterByStatus = () => {
      console.log('Filtering by status:', statusFilter.value)
      // Reset pagination when filter changes
      currentPage.value = 0
    }

    // Placeholder text dựa vào loại tìm kiếm
    const getSearchPlaceholder = () => {
      switch (searchType.value) {
        case 'maNhanVien':
          return 'Nhập mã nhân viên hoặc số cuối...'
        case 'hoTen':
          return 'Nhập tên nhân viên...'
        case 'soDienThoai':
          return 'Nhập số điện thoại...'
        case 'email':
          return 'Nhập email...'
        default:
          return 'Tìm kiếm theo mã, tên, SĐT hoặc email...'
      }
    }

    // Clear search
    const clearSearch = () => {
      searchKeyword.value = ''
      fetchNhanVien() // Tải lại toàn bộ danh sách
    }

    // Search function with debounce
    const onSearchChange = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }

      searchTimeout.value = setTimeout(async () => {
        currentPage.value = 0

        if (searchKeyword.value.trim() === '') {
          // Nếu không có từ khóa tìm kiếm, tải tất cả nhân viên
          await fetchNhanVien()
          return
        }

        // Hiển thị trạng thái loading
        loading.value = true

        try {
          let response

          // Gọi API tìm kiếm dựa vào loại tìm kiếm
          switch (searchType.value) {
            case 'maNhanVien':
              response = await searchNhanVienByMa(searchKeyword.value.trim())
              break
            case 'hoTen':
              response = await searchNhanVienByTen(searchKeyword.value.trim())
              break
            case 'soDienThoai':
              response = await searchNhanVienBySoDienThoai(searchKeyword.value.trim())
              break
            case 'email':
              response = await searchNhanVienByEmail(searchKeyword.value.trim())
              break
            default:
              // Tìm kiếm tất cả các trường
              response = await searchNhanVien(searchKeyword.value.trim())
              break
          }

          // Kiểm tra và xử lý kết quả
          if (response.data && response.data.success) {
            // Cập nhật danh sách nhân viên từ kết quả tìm kiếm
            nhanVienList.value = response.data.data || []

            // Cập nhật thông tin phân trang
            totalItems.value = nhanVienList.value.length
            totalPages.value = Math.ceil(totalItems.value / pageSize.value)

            // Hiển thị thông báo kết quả tìm kiếm (tùy chọn)
            if (nhanVienList.value.length > 0) {
              notification.info(`Tìm thấy ${nhanVienList.value.length} nhân viên phù hợp.`)
            } else {
              notification.info('Không tìm thấy nhân viên nào phù hợp với từ khóa tìm kiếm.')
            }

            // Khởi tạo trạng thái tải ảnh
            nhanVienList.value.forEach((staff) => {
              if (staff.anh) {
                imageLoadingStates[staff.id] = true
              }
            })
          } else {
            notification.error('Có lỗi xảy ra khi tìm kiếm nhân viên.')
            // Giữ nguyên danh sách hiện tại
          }
        } catch (error) {
          console.error('Lỗi khi tìm kiếm:', error)
          notification.error('Không thể tìm kiếm nhân viên.')
        } finally {
          loading.value = false
        }
      }, 500)
    }

    // Pagination
    const changePage = (page) => {
      if (page < 0 || page >= totalPages.value) return
      currentPage.value = page
      fetchNhanVien()
    }

    const viewStaffDetails = (staff) => {
      selectedStaff.value = { ...staff }
      showStaffDetailsModal.value = true
    }

    // Đóng modal chi tiết nhân viên
    const closeViewModal = () => {
      showStaffDetailsModal.value = false
    }

    // Placeholder function for edit button
    const openEditModal = (staff) => {
      selectedStaff.value = { ...staff }
      showEditModal.value = true
    }

    // Hiển thị modal thêm nhân viên
    const openAddModal = () => {
      showAddModal.value = true
      resetForm()
    }

    // Đóng modal thêm nhân viên và reset form
    const cancelAdd = () => {
      showAddModal.value = false
      resetForm()
    }

    // Reset form thêm nhân viên
    const resetForm = () => {
      newStaff.value = {
        hoTen: '',
        email: '',
        soDienThoai: '',
        gioiTinh: true,
        diaChi: '',
        password: '',
        anh: null,
      }
      previewAvatar.value = null
      selectedFile.value = null
      validation.value = {
        hoTen: '',
        email: '',
        soDienThoai: '',
      }
    }

    // Kích hoạt input file khi click vào vùng upload ảnh
    const triggerFileInput = () => {
      fileInput.value.click()
    }

    // Xử lý khi chọn file ảnh
    const onFileSelected = (event) => {
      const file = event.target.files[0]
      if (file) {
        selectedFile.value = file
        const reader = new FileReader()
        reader.onload = (e) => {
          previewAvatar.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    // Validate form thêm nhân viên
    const validateForm = () => {
      let isValid = true
      validation.value = {
        hoTen: '',
        email: '',
        soDienThoai: '',
      }

      // Validate họ tên
      if (!newStaff.value.hoTen.trim()) {
        validation.value.hoTen = 'Họ tên không được để trống'
        isValid = false
      }

      // Validate email
      if (!newStaff.value.email.trim()) {
        validation.value.email = 'Email không được để trống'
        isValid = false
      } else {
        const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        if (!emailRegex.test(newStaff.value.email)) {
          validation.value.email = 'Email không hợp lệ'
          isValid = false
        }
      }

      // Validate số điện thoại
      if (!newStaff.value.soDienThoai.trim()) {
        validation.value.soDienThoai = 'Số điện thoại không được để trống'
        isValid = false
      } else {
        const phoneRegex = /^(0)[0-9]{9,10}$/
        if (!phoneRegex.test(newStaff.value.soDienThoai)) {
          validation.value.soDienThoai = 'Số điện thoại phải có 10-11 chữ số và bắt đầu bằng số 0'
          isValid = false
        }
      }

      return isValid
    }

    // Xử lý form submit
    const submitAddStaff = async () => {
      // Validate form
      if (!validateForm()) {
        return
      }

      isSubmitting.value = true

      try {
        // Chuẩn bị FormData
        const formData = new FormData()

        // Thêm file ảnh nếu có
        if (selectedFile.value) {
          formData.append('file', selectedFile.value)
        }

        // Chuyển đổi dữ liệu nhân viên thành JSON string
        const staffData = { ...newStaff.value }

        // Xóa trường anh từ đối tượng JSON vì đã xử lý riêng với file
        delete staffData.anh

        // Thêm dữ liệu nhân viên dạng JSON
        formData.append('nhanVien', JSON.stringify(staffData))

        // Gọi API thêm nhân viên
        const response = await addNhanVien(formData)

        if (response.data && response.data.success) {
          notification.success(response.data.message || 'Thêm nhân viên thành công')
          showAddModal.value = false
          resetForm()
          fetchNhanVien() // Tải lại danh sách nhân viên
        } else {
          notification.error(response.data?.message || 'Có lỗi xảy ra khi thêm nhân viên')
        }
      } catch (error) {
        console.error('Error adding staff:', error)
        notification.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm nhân viên')
      } finally {
        isSubmitting.value = false
      }
    }

    // Triển khai chức năng xác nhận xóa với Vue dialog
    const confirmDelete = (staff) => {
      console.log('Confirm delete staff:', staff)
      selectedStaff.value = { ...staff }
      // Hiển thị dialog xác nhận
      showDeleteConfirm.value = true
    }

    // Hủy việc xóa
    const cancelDelete = () => {
      showDeleteConfirm.value = false
      selectedStaff.value = {}
      deleting.value = false
    }

    // Triển khai chức năng xóa nhân viên
    const deleteStaff = async () => {
      try {
        deleting.value = true
        console.log('Deleting staff with ID:', selectedStaff.value.id)

        // Gọi API xóa nhân viên
        const response = await deleteNhanVien(selectedStaff.value.id)
        console.log('Delete response:', response)

        // Ẩn dialog xác nhận
        showDeleteConfirm.value = false

        // Hiển thị thông báo thành công
        notification.success(`Đã xóa nhân viên ${selectedStaff.value.hoTen} thành công.`)

        // Tải lại danh sách nhân viên
        fetchNhanVien()
      } catch (error) {
        console.error('Error deleting staff:', error)

        // Hiển thị thông báo lỗi
        notification.error(
          `Không thể xóa nhân viên. Lỗi: ${error.response?.data?.message || 'Lỗi không xác định'}`,
        )
      } finally {
        deleting.value = false
      }
    }

    //Triển khai chức năng khôi phục nhân viên
    const confirmRestore = (staff) => {
      selectedStaff.value = { ...staff }
      showRestoreConfirm.value = true
    }

    const cancelRestore = () => {
      showRestoreConfirm.value = false
      selectedStaff.value = {}
      restoring.value = false
    }

    const executeRestore = async () => {
      try {
        restoring.value = true
        await restoreNhanVien(selectedStaff.value.id)
        notification.success(`Đã khôi phục nhân viên ${selectedStaff.value.hoTen} thành công.`)
        fetchNhanVien()
        cancelRestore() // Close modal on success
      } catch (error) {
        console.error('Error restoring staff:', error)
        notification.error(
          `Không thể khôi phục nhân viên. Lỗi: ${
            error.response?.data?.message || 'Lỗi không xác định'
          }`,
        )
        restoring.value = false // Keep modal open on error
      }
    }

    // Utility functions
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
    }

    // Kích hoạt input file khi click vào vùng upload ảnh trong form chỉnh sửa
    const triggerEditFileInput = () => {
      editFileInput.value.click()
    }

    // Xử lý khi chọn file ảnh trong form chỉnh sửa
    const onEditFileSelected = (event) => {
      const file = event.target.files[0]
      if (file) {
        editSelectedFile.value = file
        const reader = new FileReader()
        reader.onload = (e) => {
          editPreviewAvatar.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    // Validate form chỉnh sửa nhân viên
    const validateEditForm = () => {
      let isValid = true
      editValidation.value = {
        hoTen: '',
        email: '',
        soDienThoai: '',
      }

      // Validate họ tên
      if (!selectedStaff.value.hoTen?.trim()) {
        editValidation.value.hoTen = 'Họ tên không được để trống'
        isValid = false
      }

      // Validate email
      if (!selectedStaff.value.email?.trim()) {
        editValidation.value.email = 'Email không được để trống'
        isValid = false
      } else {
        const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        if (!emailRegex.test(selectedStaff.value.email)) {
          editValidation.value.email = 'Email không hợp lệ'
          isValid = false
        }
      }

      // Validate số điện thoại
      if (!selectedStaff.value.soDienThoai?.trim()) {
        editValidation.value.soDienThoai = 'Số điện thoại không được để trống'
        isValid = false
      } else {
        const phoneRegex = /^(0)[0-9]{9,10}$/
        if (!phoneRegex.test(selectedStaff.value.soDienThoai)) {
          editValidation.value.soDienThoai =
            'Số điện thoại phải có 10-11 chữ số và bắt đầu bằng số 0'
          isValid = false
        }
      }

      return isValid
    }

    // Đóng modal chỉnh sửa nhân viên và reset
    const cancelEdit = () => {
      showEditModal.value = false
      editPreviewAvatar.value = null
      editSelectedFile.value = null
      editValidation.value = {
        hoTen: '',
        email: '',
        soDienThoai: '',
      }
    }

    // Xử lý submit form chỉnh sửa
    const submitEditStaff = async () => {
      // Validate form
      if (!validateEditForm()) {
        return
      }

      isEditing.value = true

      try {
        // Chuẩn bị FormData
        const formData = new FormData()

        // Thêm file ảnh nếu có
        if (editSelectedFile.value) {
          formData.append('file', editSelectedFile.value)
        }

        // Chuyển đổi dữ liệu nhân viên thành JSON string
        const staffData = {
          hoTen: selectedStaff.value.hoTen,
          email: selectedStaff.value.email,
          soDienThoai: selectedStaff.value.soDienThoai,
          diaChi: selectedStaff.value.diaChi,
          gioiTinh: selectedStaff.value.gioiTinh,
        }

        // Thêm dữ liệu nhân viên dạng JSON
        formData.append('nhanVien', JSON.stringify(staffData))

        // Gọi API cập nhật nhân viên
        const response = await updateNhanVien(selectedStaff.value.id, formData)

        if (response.data && response.data.success) {
          notification.success(response.data.message || 'Cập nhật nhân viên thành công')
          showEditModal.value = false
          editPreviewAvatar.value = null
          editSelectedFile.value = null
          fetchNhanVien() // Tải lại danh sách nhân viên
        } else {
          notification.error(response.data?.message || 'Có lỗi xảy ra khi cập nhật nhân viên')
        }
      } catch (error) {
        console.error('Error updating staff:', error)
        notification.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhân viên')
      } finally {
        isEditing.value = false
      }
    }

    return {
      nhanVienList,
      filteredNhanVienList,
      loading,
      currentPage,
      totalPages,
      searchKeyword,
      searchType, // Thêm searchType vào return
      selectedStaff,
      previewImage,
      previewImageTitle,
      showImagePreview,
      deleting,
      showDeleteConfirm,
      statusFilter,
      restoring,
      showRestoreConfirm,
      showAddModal,
      showEditModal,
      showStaffDetailsModal,
      isSubmitting,
      isEditing,
      previewAvatar,
      editPreviewAvatar,
      newStaff,
      validation,
      editValidation,
      pageSize,
      totalItems,
      fileInput,
      editFileInput,
      imageLoadingStates,
      imageErrors,
      fetchNhanVien,
      confirmDelete,
      cancelDelete,
      deleteStaff,
      confirmRestore,
      cancelRestore,
      executeRestore,
      openAddModal,
      cancelAdd,
      submitAddStaff,
      triggerFileInput,
      onFileSelected,
      formatDate,
      processImageUrl,
      handleImageLoad,
      handleImageError,
      handleProfileImageError,
      handlePreviewImageError,
      openImagePreview,
      closeImagePreview,
      openEditModal,
      cancelEdit,
      submitEditStaff,
      triggerEditFileInput,
      onEditFileSelected,
      viewStaffDetails,
      closeViewModal,
      changePage,
      onSearchChange,
      filterByStatus,
      getSearchPlaceholder, // Thêm phương thức mới
      clearSearch, // Thêm phương thức mới
      startItem,
      endItem,
      paginatedStaff,
      emptyRows,
    }
  },
}
</script>

<style scoped>
/* GENERAL CONTAINER & TITLE */
.nhan-vien-container {
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

/* ENHANCED IMAGE STYLES */
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

.staff-avatar {
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

.staff-avatar:hover {
  transform: scale(1.15);
  border-color: #007bff;
  box-shadow: 0 5px 10px rgba(0, 123, 255, 0.3);
}

.staff-avatar.loading {
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

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* ENHANCED IMAGE PREVIEW MODAL */
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

/* EMPTY STATE */
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

/* ADD STAFF MODAL STYLES */
.add-staff-modal {
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 25px;
  border-top: 1px solid #e5e7eb;
  margin-top: 20px;
}

/* Avatar Upload Section */
.staff-avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-preview {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 2px dashed #d1d5db;
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
}

.avatar-preview:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #9ca3af;
  height: 100%;
  width: 100%;
  justify-content: center;
}

.avatar-placeholder i {
  font-size: 50px;
  margin-bottom: 10px;
}

.avatar-placeholder span {
  font-size: 14px;
  text-align: center;
}

.uploaded-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

/* Gender Radio Group */
.gender-group {
  margin-bottom: 20px;
}

.form-check-group {
  display: flex;
  gap: 30px;
  margin-top: 10px;
}

.form-check {
  display: flex;
  align-items: center;
}

.form-check-input {
  margin-right: 8px;
  width: 18px;
  height: 18px;
}

.form-check-label {
  font-size: 16px;
  color: #4b5563;
  cursor: pointer;
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

/* Staff details modal styling */
.staff-details-modal {
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  width: 700px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-fade-in 0.3s ease;
}

.staff-avatar-display {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.staff-avatar-display .avatar-preview {
  width: 150px;
  height: 150px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.staff-avatar-display .avatar-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.staff-avatar-display h4 {
  font-size: 1.2rem;
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
}

.staff-avatar-display .staff-id {
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

.staff-info {
  padding: 8px;
}

/* Chỉnh cho các input trong form chi tiết */
.staff-info .form-control[readonly] {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  cursor: text;
  padding: 8px 12px;
  font-size: 0.95rem;
}

/* Thêm margin cho các form group trong modal chi tiết */
.staff-info .form-group {
  margin-bottom: 12px;
}

.staff-info label {
  font-size: 0.9rem;
  margin-bottom: 5px;
}

/* Điều chỉnh kích thước của textarea */
.staff-info textarea.form-control {
  resize: none;
  height: 70px;
}

/* Đảm bảo hiển thị tiếng Việt đúng */
.staff-details-modal input,
.staff-details-modal textarea,
.staff-details-modal label,
.staff-details-modal span,
.staff-details-modal h3,
.staff-details-modal h4,
.staff-details-modal p {
  font-family: 'Roboto', sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.form-control {
  font-family: 'Roboto', sans-serif !important;
  font-size: 0.95rem;
}

/* Đảm bảo font chữ tiếng Việt hiển thị đúng trong modal */
.modal-header h3,
.modal-body h4,
.modal-body label,
.modal-body p,
.modal-body span {
  font-family: 'Roboto', sans-serif !important;
}

/* Điều chỉnh chi tiết cho từng label trong form */
.form-group label {
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
  display: block;
}
</style>
