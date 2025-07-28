<template>
  <div class="homestay-container">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <h1 class="page-title">Quản Lý Tin Tức</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <div class="search-input-wrapper">
            <input type="text" v-model="searchQuery" placeholder="Tìm kiếm tin tức..." class="search-input"
              @input="handleSearch" />
            <i class="fas fa-search search-icon"></i>
            <button v-if="searchQuery" @click="searchQuery = ''; loadTinTuc()" class="clear-search-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="right-controls">
        <select class="form-select status-filter" v-model="selectedStatus" @change="handleStatusChange(selectedStatus)">
          <option value="active">Đang hiển thị</option>
          <option value="inactive">Đã ẩn</option>
        </select>
        <button class="btn btn-primary add-button" @click="openAddModal">
          <i class="fas fa-newspaper"></i>
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
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- News Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th width="5%" class="text-center">STT</th>
            <th width="10%" class="text-center">Mã tin tức</th>
            <th width="15%" class="text-center">Tiêu đề</th>
            <th width="20%" class="text-center">Nội dung</th>
            <th width="10%" class="text-center">Người đăng</th>
            <th width="10%" class="text-center">Ngày đăng</th>
            <th width="10%" class="text-center">Ảnh bìa</th>
            <th width="5%" class="text-center">Trạng thái</th>
            <th width="15%" class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody v-if="!loading">
          <tr v-for="(item, index) in paginatedTinTucs" :key="item.id" @dblclick="showDetail(item)"
            style="cursor: pointer;" :id="'news-row-' + item.id" :ref="'news-row-' + item.id"
            :class="{ 'highlight-blue': item.id === highlightedId }">
            <td class="text-center">{{ index + 1 + currentPage * pageSize }}</td>
            <td class="text-center">{{ item.maTinTuc }}</td>
            <td class="text-center">{{ item.tieuDe }}</td>
            <td class="text-center">
              <div class="content-truncate" :title="stripHtmlAndTruncate(item.noiDung, 0)">{{
                stripHtmlAndTruncate(item.noiDung, 100) }}</div>
            </td>
            <td class="text-center">{{ item.tenTaiKhoan || 'Không xác định' }}</td>
            <td class="text-center">{{ formatDate(item.ngayDang) }}</td>
            <td class="text-center">
              <div class="image-wrapper">
                <img v-if="item.anhBia" :src="item.anhBia" :alt="item.tieuDe" class="thumbnail-image" />
                <div v-else class="no-image-placeholder">
                  <i class="fas fa-newspaper"></i>
                </div>
              </div>
            </td>
            <td class="text-center">
              <span :class="['badge', item.trangThai ? 'bg-success' : 'bg-secondary']">
                {{ item.trangThai ? 'Đang hiển thị' : 'Đã ẩn' }}
              </span>
            </td>
            <td class="text-center">
              <div class="action-buttons">
                <button class="btn btn-icon btn-warning-light" title="Chỉnh sửa" @click.stop="openEditModal(item)"
                  v-if="item.trangThai">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-danger-light" title="Xóa" @click.stop="confirmDelete(item.id)"
                  v-if="item.trangThai">
                  <i class="fas fa-trash"></i>
                </button>
                <button v-else class="btn btn-icon btn-success-light" title="Khôi phục"
                  @click.stop="restoreTinTuc(item.id)">
                  <i class="fas fa-undo"></i>
                </button>
              </div>
            </td>
          </tr>
          <!-- Empty rows to ensure space -->
          <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
            <td colspan="9">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && filteredTinTucs.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy tin tức nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredTinTucs.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} tin tức
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 0 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page - 1 === currentPage }">
            <a class="page-link" href="#" @click.prevent="changePage(page - 1)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 || totalPages === 0 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <!-- Modal Thêm/Sửa tin tức -->
  <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
    <div class="modal-editor">
      <div class="modal-header">
        <h3>{{ isEditing ? 'Cập nhật tin tức' : 'Thêm tin tức mới' }}</h3>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-4">
              <div class="news-avatar-display">
                <div class="avatar-preview" @click="triggerFileInput">
                  <img v-if="coverImagePreview || form.anhBia" :src="coverImagePreview || form.anhBia" alt="Ảnh bìa"
                    class="uploaded-avatar" />
                  <div v-else class="avatar-placeholder">
                    <i class="fas fa-newspaper"></i>
                    <span>Thêm ảnh bìa</span>
                  </div>
                </div>
                <input type="file" ref="fileInput" @change="handleCoverImageChange" accept="image/*"
                  style="display: none" />

                <h4 class="text-center mt-3">{{ form.tieuDe || 'Tin tức mới' }}</h4>
                <p class="text-center news-id" v-if="isEditing && form.maTinTuc">
                  Mã: {{ form.maTinTuc }}
                </p>
              </div>
            </div>
            <div class="col-md-8">
              <div class="mb-3">
                <label class="form-label">Tiêu đề <span class="text-danger">*</span></label>
                <input type="text" v-model="form.tieuDe" class="form-control" required maxlength="100"
                  placeholder="Nhập tiêu đề tin tức (tối đa 100 ký tự)" @input="handleTitleChange"
                  @paste="handleTitlePaste" />
                <small class="form-text text-muted">Tối đa 100 ký tự. Còn lại: {{ 100 - form.tieuDe.length }} ký
                  tự</small>
              </div>
              <div class="mb-3">
                <label class="form-label">Nội dung <span class="text-danger">*</span></label>
                <div class="content-editor-wrapper">
                  <div class="content-editor-toolbar">
                    <button type="button" @click="formatText('bold')" class="toolbar-button" title="Chữ đậm">
                      <i class="fas fa-bold"></i>
                    </button>
                    <button type="button" @click="formatText('italic')" class="toolbar-button" title="Chữ nghiêng">
                      <i class="fas fa-italic"></i>
                    </button>
                    <button type="button" @click="formatText('underline')" class="toolbar-button" title="Gạch chân">
                      <i class="fas fa-underline"></i>
                    </button>
                    <div class="toolbar-divider"></div>
                    <button type="button" @click="formatText('justifyLeft')" class="toolbar-button" title="Căn trái">
                      <i class="fas fa-align-left"></i>
                    </button>
                    <button type="button" @click="formatText('justifyCenter')" class="toolbar-button" title="Căn giữa">
                      <i class="fas fa-align-center"></i>
                    </button>
                    <button type="button" @click="formatText('justifyRight')" class="toolbar-button" title="Căn phải">
                      <i class="fas fa-align-right"></i>
                    </button>
                    <button type="button" @click="formatText('justifyFull')" class="toolbar-button" title="Căn đều">
                      <i class="fas fa-align-justify"></i>
                    </button>
                    <div class="toolbar-divider"></div>
                    <button type="button" @click="insertImage" class="toolbar-button image-button"
                      title="Chèn ảnh (chỉ cho nội dung)">
                      <i class="fas fa-image"></i>
                    </button>
                    <button type="button" @click="insertParagraph" class="toolbar-button" title="Chèn đoạn văn">
                      <i class="fas fa-paragraph"></i>
                    </button>
                    <div class="toolbar-divider"></div>
                    <button type="button" @click="clearFormatting" class="toolbar-button" title="Xóa định dạng">
                      <i class="fas fa-remove-format"></i>
                    </button>
                    <button type="button" @click="toggleFullscreen" class="toolbar-button"
                      :title="isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'">
                      <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
                    </button>
                  </div>

                  <div class="content-editor-container">
                    <div class="content-editor" contenteditable="true" ref="contentEditor" @input="handleContentChange"
                      @paste="handlePaste"></div>
                  </div>

                  <textarea v-model="form.noiDung" name="noiDung" class="form-control d-none" required
                    maxlength="10000"></textarea>

                  <input type="file" ref="imageInput" @change="handleImageSelected" accept="image/*"
                    style="display: none" />
                </div>
              </div>
              <div class="mb-3" v-if="isEditing">
                <label class="form-label">Trạng thái</label>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" v-model="form.trangThai" id="trangThaiSwitch">
                  <label class="form-check-label" for="trangThaiSwitch">
                    {{ form.trangThai ? 'Đang hiển thị' : 'Đã ẩn' }}
                  </label>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
                  {{ isEditing ? 'Lưu' : 'Lưu' }}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal Chi tiết tin tức -->
  <div class="modal-overlay" v-if="showDetailModal" @click.self="closeDetailModal">
    <div class="homestay-details-modal">
      <div class="modal-header">
        <h3>Chi tiết tin tức</h3>
        <button class="close-button" @click="closeDetailModal">&times;</button>
      </div>
      <div class="modal-body" v-if="detailItem">
        <div class="row">
          <div class="col-md-4">
            <div class="homestay-avatar-display">
              <div class="avatar-preview view-mode">
                <img v-if="detailItem.anhBia" :src="detailItem.anhBia" alt="Ảnh bìa" class="uploaded-avatar" />
                <div v-else class="avatar-placeholder">
                  <i class="fas fa-newspaper"></i>
                  <span>Chưa có ảnh</span>
                </div>
              </div>

              <h4 class="text-center mt-3 news-title-preview">{{ detailItem.tieuDe || 'Tin tức' }}</h4>
              <p class="text-center homestay-id" v-if="detailItem.maTinTuc">
                Mã: {{ detailItem.maTinTuc }}
              </p>

              <div class="status-badge">
                <label>Trạng Thái:</label>
                <span :class="`badge ${detailItem.trangThai ? 'bg-success' : 'bg-secondary'}`">
                  {{ detailItem.trangThai ? 'Đang hiển thị' : 'Đã ẩn' }}
                </span>
              </div>

              <div class="mt-3 text-center">
                <button type="button" class="btn btn-info" @click="toggleImageGallery">
                  <i class="fas fa-images me-1"></i> Xem chi tiết ảnh
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <div class="staff-info">
              <div class="form-group">
                <label>Tiêu đề</label>
                <div class="form-control news-title-display">{{ detailItem.tieuDe }}</div>
              </div>

              <div class="form-group">
                <label>Người đăng</label>
                <input type="text" class="form-control" v-model="detailItem.tenTaiKhoan" readonly />
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Ngày đăng</label>
                    <input type="text" class="form-control" :value="formatDate(detailItem.ngayDang)" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Trạng thái</label>
                    <input type="text" class="form-control" :value="detailItem.trangThai ? 'Đang hiển thị' : 'Đã ẩn'"
                      readonly />
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>Nội dung</label>
                <div class="content-preview-box">
                  <div ref="contentPreview" v-html="processedDetailContent" class="content-preview-html non-editable">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gallery ảnh chi tiết -->
        <div class="modal-overlay" v-if="showImageGallery && detailItem" @click.self="toggleImageGallery">
          <div class="image-gallery-modal">
            <div class="gallery-header">
              <h3 class="gallery-title">Ảnh chi tiết - {{ detailItem.tieuDe }}</h3>
              <div class="gallery-subtitle">Danh sách ảnh ({{ detailItem.anhBia ? 1 + extractedImages.length :
                extractedImages.length }})</div>
              <button class="gallery-close-btn" @click="toggleImageGallery">
                <i class="fas fa-times"></i> Đóng
              </button>
            </div>

            <div class="gallery-content">
              <!-- Hiển thị tất cả ảnh trong một lưới -->
              <div class="gallery-section">
                <h5 class="section-title">Tất cả hình ảnh</h5>
                <div class="gallery-grid">
                  <!-- Ảnh bìa (nếu có) -->
                  <div v-if="detailItem.anhBia" class="gallery-item cover-item">
                    <div class="cover-badge">Ảnh bìa</div>
                    <img :src="detailItem.anhBia" :alt="detailItem.tieuDe" class="gallery-img" />
                  </div>

                  <!-- Các ảnh từ nội dung -->
                  <div v-for="(image, index) in extractedImages" :key="index" class="gallery-item">
                    <img :src="image" :alt="`Hình ảnh ${index + 1}`" class="gallery-img" />
                  </div>
                </div>
              </div>

              <!-- Thông báo khi không có ảnh nào -->
              <div v-if="!detailItem.anhBia && extractedImages.length === 0" class="no-images">
                <p>Không có ảnh nào để hiển thị</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeDetailModal">
            <i class="fas fa-times me-1"></i> Đóng
          </button>
          <button type="button" class="btn btn-primary" @click="openEditModal(detailItem)"
            v-if="detailItem && detailItem.trangThai">
            <i class="fas fa-edit me-1"></i> Sửa
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal chi tiết đã được thiết kế bên trên -->
</template>

<script>
import {
  getAllTinTuc,
  addTinTuc,
  updateTinTuc,
  deleteTinTuc,
  prepareTinTucData,
  testApiConnection
} from "@/Service/TinTucService";
import { useAuthStore } from "@/stores/authStore";
import { getAnhTinTucByTinTucId } from '@/Service/AnhTinTucService';

export default {
  name: 'TinTucManagement',
  data() {
    return {
      tinTucs: [],
      isEditing: false,
      isSubmitting: false,
      isFullscreen: false,
      currentRange: null, // Thêm biến để lưu vị trí con trỏ
      form: {
        id: null,
        maTinTuc: '',
        tieuDe: '',
        noiDung: '',
        trangThai: true,
        anhBia: '',
        anhBiaFile: null,
        taiKhoanId: null
      },
      showModal: false,
      showDetailModal: false,
      detailItem: null,
      detailImageList: [], // Thêm danh sách ảnh chi tiết
      coverImagePreview: null,
      showImageGallery: false,
      extractedImages: [], // Danh sách các ảnh được trích xuất từ nội dung
      searchQuery: '',
      searchTimeout: null, // Added for debouncing
      loading: false,
      apiError: false,
      apiErrorMessage: '',
      selectedStatus: 'active', // Mặc định là 'active'

      // Rich content editor
      showPreview: false,
      uploadingImage: false,
      contentImages: [], // Khởi tạo mảng để lưu trữ file ảnh trong nội dung

      // Pagination
      currentPage: 0,
      pageSize: 10,
      highlightedId: null,
    }
  },
  computed: {
    // Lọc tin tức theo từ khóa tìm kiếm và trạng thái
    filteredTinTucs() {
      let filtered = this.tinTucs;

      // Lọc theo từ khóa tìm kiếm
      if (this.searchQuery) {
        const key = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) => item.tieuDe?.toLowerCase().includes(key) ||
            item.noiDung?.toLowerCase().includes(key) ||
            item.maTinTuc?.toLowerCase().includes(key)
        );
      }

      // Lọc theo trạng thái
      if (this.selectedStatus !== 'all') {
        const isActive = this.selectedStatus === 'active';
        filtered = filtered.filter((item) => item.trangThai === isActive);
      }

      return filtered;
    },

    // Tin tức đã phân trang
    paginatedTinTucs() {
      const start = this.currentPage * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredTinTucs.slice(start, end);
    },

    // Tổng số tin tức sau khi lọc
    totalItems() {
      return this.filteredTinTucs.length;
    },

    // Tổng số trang sau khi lọc
    totalPages() {
      if (this.totalItems === 0) return 1;
      return Math.ceil(this.totalItems / this.pageSize);
    },

    // Vị trí bắt đầu của trang hiện tại
    startItem() {
      if (this.totalItems === 0) return 0;
      return this.currentPage * this.pageSize + 1;
    },

    // Vị trí kết thúc của trang hiện tại
    endItem() {
      const end = (this.currentPage + 1) * this.pageSize;
      return end > this.totalItems ? this.totalItems : end;
    },

    // Số hàng trống để đảm bảo chiều cao bảng
    emptyRows() {
      const rowsCount = this.paginatedTinTucs.length;
      return rowsCount < this.pageSize ? this.pageSize - rowsCount : 0;
    },

    // Xử lý nội dung chi tiết tin tức để loại bỏ nút xóa
    processedDetailContent() {
      if (!this.detailItem || !this.detailItem.noiDung) return '';

      // Tạo một div tạm để xử lý HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.detailItem.noiDung;

      // Xóa tất cả các nút xóa
      const deleteButtons = tempDiv.querySelectorAll('.image-delete-btn, .btn-danger, button[class*="btn-danger"], [data-image-id]');
      deleteButtons.forEach(btn => btn.remove());

      // Xóa các nút có icon thùng rác
      const trashIcons = tempDiv.querySelectorAll('.fa-trash');
      trashIcons.forEach(icon => {
        const parentButton = icon.closest('button');
        if (parentButton) {
          parentButton.remove();
        }
      });

      return tempDiv.innerHTML;
    }
  },
  mounted() {
    this.loadTinTuc();

    // Lấy ID tài khoản hiện tại từ authStore
    const authStore = useAuthStore();
    if (authStore.user && authStore.user.id) {
      this.form.taiKhoanId = authStore.user.id;
    }
  },
  methods: {
    stripHtmlAndTruncate(html, maxLength) {
      if (!html) return '';

      // Create a temporary div to parse the HTML string
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Find and remove all image containers to exclude their text content
      const imageWrappers = tempDiv.querySelectorAll('.article-image, .image-container-editable');
      imageWrappers.forEach(wrapper => wrapper.remove());

      // Get the text content, which now excludes text from image containers
      let text = tempDiv.textContent || tempDiv.innerText || '';

      // Remove extra whitespace and newlines
      text = text.replace(/\s+/g, ' ').trim();

      // If maxLength is 0, return the full stripped text for the title attribute
      if (maxLength === 0) {
        return text;
      }

      // Truncate the text if it exceeds maxLength
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
      }

      return text;
    },
    // Cập nhật giá trị nội dung từ editor
    updateContentValue() {
      if (this.$refs.contentEditor) {
        this.form.noiDung = this.$refs.contentEditor.innerHTML;
      }
    },

    async loadTinTuc() {
      try {
        this.loading = true;
        this.apiError = false;

        // Thử kết nối API test trước
        try {
          const testRes = await testApiConnection();
          console.log('API test response:', testRes.data);
        } catch (testError) {
          console.warn('API test không hoạt động:', testError);
        }

        // Tiếp tục với API chính
        const res = await getAllTinTuc();
        this.tinTucs = res.data;
      } catch (error) {
        console.error('Lỗi khi tải danh sách tin tức:', error);
        this.apiError = true;
        this.apiErrorMessage = 'Không thể tải dữ liệu tin tức. Vui lòng thử lại sau.';
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      if (!date) return 'N/A';
      date = new Date(date);
      return date.toLocaleDateString('vi-VN');
    },

    // Xử lý tìm kiếm
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 0;
      }, 300);
    },

    // Xử lý thay đổi trạng thái
    handleStatusChange(status) {
      this.selectedStatus = status;
      this.currentPage = 0;
    },

    // Thay đổi trang
    changePage(page) {
      if (page >= 0 && page < this.totalPages) {
        this.currentPage = page;
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    // Định dạng văn bản
    formatText(command) {
      document.execCommand(command, false, null);
      this.updateContentValue();
    },

    // Chèn đoạn văn bản
    insertParagraph() {
      document.execCommand('insertParagraph', false, null);
      this.updateContentValue();
    },

    // Chèn ảnh từ máy tính
    insertImage() {
      // Đảm bảo focus vào editor nội dung trước khi chèn ảnh
      this.$refs.contentEditor.focus();

      // Lưu vị trí con trỏ hiện tại trong editor nội dung
      this.saveCurrentSelection();

      // Kích hoạt input file để chọn ảnh
      this.$refs.imageInput.click();
    },

    // Lưu vị trí con trỏ hiện tại
    saveCurrentSelection() {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        this.currentRange = selection.getRangeAt(0).cloneRange();
      }
    },

    // Khôi phục vị trí con trỏ đã lưu
    restoreSelection() {
      if (this.currentRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(this.currentRange);
      }
    },

    // Xử lý khi ảnh được chọn
    handleImageSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chỉ chọn file hình ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      // Khôi phục vị trí con trỏ trong editor nội dung
      this.restoreSelection();

      // Kiểm tra xem con trỏ có trong editor nội dung không
      const isInContentEditor = this.isSelectionInContentEditor();
      if (!isInContentEditor) {
        alert('Vui lòng đặt con trỏ vào phần nội dung trước khi chèn ảnh');
        return;
      }

      const tempId = `temp-id-${Date.now()}`;
      const blobUrl = URL.createObjectURL(file);
      const uniqueFileName = `${tempId}-${file.name}`;

      this.contentImages.push({ id: uniqueFileName, file: file });

      // Create elements manually for more control
      const wrapper = document.createElement('div');
      wrapper.className = 'article-image image-container-editable';
      wrapper.contentEditable = false;
      wrapper.id = `${tempId}-wrapper`;

      const figure = document.createElement('figure');
      const img = document.createElement('img');
      img.src = blobUrl;
      img.dataset.fileId = uniqueFileName;
      img.alt = 'Ảnh tạm thời';
      img.style.maxWidth = '100%';

      const figcaption = document.createElement('figcaption');
      figcaption.contentEditable = true;
      figcaption.className = 'image-caption';
      figcaption.textContent = 'Nhập chú thích ảnh';

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-sm btn-danger image-delete-btn';
      deleteBtn.dataset.imageId = uniqueFileName;
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Xóa';
      deleteBtn.onclick = () => {
        const fileIndex = this.contentImages.findIndex(i => i.id === uniqueFileName);
        if (fileIndex > -1) this.contentImages.splice(fileIndex, 1);
        wrapper.remove();
        this.updateContentValue();
      };

      figure.appendChild(img);
      figure.appendChild(figcaption);
      wrapper.appendChild(figure);
      wrapper.appendChild(deleteBtn);

      // Create a new paragraph to type in after the image
      const newParagraph = document.createElement('p');
      newParagraph.innerHTML = '<br>';

      // Insert into the editor at the current cursor position
      const selection = window.getSelection();
      if (selection.getRangeAt && selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const fragment = document.createDocumentFragment();
        fragment.appendChild(wrapper);
        fragment.appendChild(newParagraph);
        range.insertNode(fragment);

        // Move cursor to the new paragraph
        range.setStart(newParagraph, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback for older browsers
        this.$refs.contentEditor.appendChild(wrapper);
        this.$refs.contentEditor.appendChild(newParagraph);
      }

      this.$refs.contentEditor.focus();
      this.updateContentValue();

      if (this.$refs.imageInput) {
        this.$refs.imageInput.value = '';
      }
    },

    // Kiểm tra xem con trỏ có trong editor nội dung không
    isSelectionInContentEditor() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return false;

      const range = selection.getRangeAt(0);
      const contentEditor = this.$refs.contentEditor;

      return contentEditor && contentEditor.contains(range.commonAncestorContainer);
    },

    // Xóa định dạng
    clearFormatting() {
      document.execCommand('removeFormat', false, null);
      this.updateContentValue();
      this.coverImagePreview = null;
      this.contentImages = [];
      this.removeEditorClickListener(); // Remove listener on close
    },

    // Xử lý khi paste nội dung
    handlePaste(event) {
      event.preventDefault();

      // Lấy văn bản thuần túy
      const text = event.clipboardData.getData('text/plain');

      // Chèn văn bản không định dạng
      document.execCommand('insertText', false, text);
      this.updateContentValue();
    },

    // Xử lý khi nội dung thay đổi
    handleContentChange() {
      this.updateContentValue();
    },

    // Xử lý thay đổi tiêu đề để loại bỏ HTML và ảnh
    handleTitleChange() {
      // Loại bỏ tất cả các thẻ HTML khỏi tiêu đề
      if (this.form.tieuDe) {
        // Tạo một div tạm thời để xử lý HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.form.tieuDe;

        // Xóa tất cả các thẻ img
        const images = tempDiv.querySelectorAll('img');
        images.forEach(img => img.remove());

        // Lấy văn bản thuần túy
        let plainText = tempDiv.textContent || tempDiv.innerText || '';

        // Loại bỏ các ký tự đặc biệt và HTML
        plainText = plainText.replace(/<[^>]*>/g, '');

        // Cập nhật tiêu đề
        this.form.tieuDe = plainText;

        // Đảm bảo không vượt quá 100 ký tự
        if (this.form.tieuDe.length > 100) {
          this.form.tieuDe = this.form.tieuDe.substring(0, 100);
        }
      }
    },

    // Hiện/ẩn xem trước
    togglePreview() {
      this.showPreview = !this.showPreview;
    },

    // Cập nhật editor khi mở modal chỉnh sửa
    updateEditor() {
      if (this.$refs.contentEditor) {
        // Hiển thị nội dung HTML trong editor
        this.$refs.contentEditor.innerHTML = this.form.noiDung || '';

        // Đảm bảo editor có thể chỉnh sửa
        this.$refs.contentEditor.contentEditable = "true";

        // Thêm sự kiện để cập nhật nội dung khi có thay đổi
        this.$refs.contentEditor.addEventListener('input', this.updateContentValue);

        // Nếu đang chỉnh sửa tin tức, tải ảnh và xử lý
        if (this.isEditing && this.form.id) {
          this.processContentImagesForEditor();

          // Fix các nút xóa ảnh hiện có
          this.$nextTick(() => {
            // Tìm tất cả các container ảnh
            const imageContainers = this.$refs.contentEditor.querySelectorAll('.article-image');

            imageContainers.forEach(container => {
              const imageId = container.id || `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

              // Nếu container không có id, thêm id mới
              if (!container.id) {
                container.id = imageId;
              }

              // Xóa nút xóa cũ nếu có
              const oldDeleteBtn = container.querySelector('.image-delete-btn');
              if (oldDeleteBtn) {
                oldDeleteBtn.remove();
              }

              // Tạo nút xóa mới
              const deleteBtn = document.createElement('button');
              deleteBtn.type = 'button';
              deleteBtn.className = 'btn btn-sm btn-danger image-delete-btn';
              deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Xóa';
              deleteBtn.setAttribute('data-image-id', imageId);

              // Gắn sự kiện click trực tiếp
              deleteBtn.onclick = function () {
                const imageToRemove = document.getElementById(imageId);
                if (imageToRemove) {
                  imageToRemove.remove();
                  // Cập nhật nội dung sau khi xóa
                  document.dispatchEvent(new Event('content-changed'));
                }
              };

              // Thêm nút xóa vào container
              container.appendChild(deleteBtn);
            });

            // Thêm sự kiện để cập nhật nội dung khi có thay đổi
            document.addEventListener('content-changed', () => {
              this.updateContentValue();
            });
          });
        }
      }
    },

    async processContentImagesForEditor() {
      try {
        // Tải danh sách ảnh của tin tức
        const response = await getAnhTinTucByTinTucId(this.form.id);
        const images = response.data || [];

        // Dùng để theo dõi ảnh đã được tải
        this.contentImages = images;

        // Cập nhật nội dung trong editor để hiển thị các ảnh đã tải
        if (this.$refs.contentEditor && images.length > 0) {
          // Logic xử lý ảnh đã tải vào editor có thể thêm ở đây nếu cần
          console.log('Đã tải', images.length, 'ảnh cho tin tức.');
        }
      } catch (error) {
        console.error('Lỗi khi tải ảnh cho editor:', error);
      }
    },

    // Cập nhật mở modal thêm/sửa
    openAddModal() {
      this.isEditing = false;

      // Lấy ID tài khoản hiện tại từ authStore
      const authStore = useAuthStore();
      const currentUserId = authStore.user ? authStore.user.id : null;

      this.form = {
        id: null,
        maTinTuc: '',
        tieuDe: '',
        noiDung: '',
        trangThai: true,
        anhBia: '',
        anhBiaFile: null,
        taiKhoanId: currentUserId
      };
      this.coverImagePreview = null;
      this.contentImages = [];

      // Hiển thị modal
      this.showModal = true;

      // Cập nhật editor sau khi modal hiển thị
      this.$nextTick(() => {
        if (this.$refs.contentEditor) {
          this.$refs.contentEditor.innerHTML = '';
          this.$refs.contentEditor.contentEditable = "true";
          this.$refs.contentEditor.focus();
        }
        this.addEditorClickListener();
      });
    },

    // Mở modal chỉnh sửa
    openEditModal(item) {
      this.isEditing = true;

      // Sao chép thông tin tin tức vào form
      this.form = {
        id: item.id,
        maTinTuc: item.maTinTuc,
        tieuDe: item.tieuDe,
        noiDung: item.noiDung,
        trangThai: item.trangThai,
        anhBia: item.anhBia,
        anhBiaFile: null,
        taiKhoanId: item.taiKhoanId || item.taiKhoan?.id
      };

      // Nếu có ảnh bìa, đặt preview
      if (item.anhBia) {
        this.coverImagePreview = item.anhBia;
      } else {
        this.coverImagePreview = null;
      }

      this.contentImages = [];

      // Hiển thị modal
      this.showModal = true;

      // Cập nhật editor với nội dung từ tin tức
      this.$nextTick(() => {
        this.updateEditor();
        this.addEditorClickListener();
      });

      // Đóng modal chi tiết nếu đang mở
      if (this.showDetailModal) {
        this.closeDetailModal();
      }
    },

    handleCoverImageChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh');
        this.$refs.fileInput.value = '';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        this.$refs.fileInput.value = '';
        return;
      }

      // Store file and create preview
      this.form.anhBiaFile = file;
      console.log('File ảnh bìa đã chọn:', file.name, file.type, file.size);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.coverImagePreview = e.target.result;
        console.log('Đã tạo preview ảnh bìa');
      };
      reader.readAsDataURL(file);
    },

    clearCoverImage() {
      console.log('Xóa ảnh bìa');
      this.form.anhBia = '';
      this.form.anhBiaFile = null;
      this.coverImagePreview = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
        console.log('Đã reset input file');
      }
    },

    // Update the handleSubmit method to handle the embedded images from the content editor
    async handleSubmit() {
      // Validate ảnh bìa
      if (!this.isEditing && !this.form.anhBiaFile) {
        alert('Vui lòng thêm ảnh bìa!');
        return;
      }

      // Kiểm tra tiêu đề không chứa HTML hoặc ảnh
      if (this.form.tieuDe.includes('<img') || this.form.tieuDe.includes('<iframe') || this.form.tieuDe.includes('src=')) {
        alert('Tiêu đề không được chứa hình ảnh hoặc mã HTML!');
        return;
      }

      // Kiểm tra độ dài tiêu đề
      if (this.form.tieuDe.length > 100) {
        alert('Tiêu đề không được vượt quá 100 ký tự!');
        return;
      }

      if (!this.form.tieuDe || !this.form.noiDung) {
        alert('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
        return;
      }

      this.isSubmitting = true;
      let savedItemId = null;

      try {
        if (!this.isEditing) {
          const randomCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          this.form.maTinTuc = `TT${randomCode}`;
        }

        const formData = new FormData();
        if (this.form.anhBiaFile) {
          formData.append('coverImage', this.form.anhBiaFile);
        }

        // Thêm các ảnh trong nội dung
        this.contentImages.forEach(image => {
          // Chỉ thêm vào FormData nếu nó là một file thực sự, không phải là URL cũ
          if (image.file instanceof File) {
            // Đổi tên file để chứa ID tạm thời
            const renamedFile = new File([image.file], image.id, { type: image.file.type });
            formData.append('contentImages', renamedFile);
          }
        });

        const tinTucData = {
          id: this.form.id,
          maTinTuc: this.form.maTinTuc,
          tieuDe: this.form.tieuDe,
          noiDung: this.form.noiDung,
          trangThai: this.form.trangThai,
          taiKhoan: { id: this.form.taiKhoanId }
        };

        if (this.isEditing && !this.form.anhBiaFile && this.form.anhBia) {
          tinTucData.anhBia = this.form.anhBia;
        }

        formData.append('tinTuc', JSON.stringify(tinTucData));

        let response;
        if (this.isEditing) {
          response = await updateTinTuc(this.form.id, formData);
        } else {
          response = await addTinTuc(formData);
        }

        savedItemId = response.data.data.id;

        alert(this.isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        this.closeModal();
        await this.loadTinTuc();

        // Navigate to the correct page and highlight the item
        if (savedItemId) {
          this.$nextTick(() => {
            const itemIndex = this.filteredTinTucs.findIndex(t => t.id === savedItemId);
            if (itemIndex > -1) {
              const page = Math.floor(itemIndex / this.pageSize);
              this.currentPage = page;

              // Use double requestAnimationFrame to ensure the class is applied after the DOM is painted
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  this.highlightedId = savedItemId;
                  setTimeout(() => {
                    this.highlightedId = null;
                  }, 3000); // Remove the class after animation
                });
              });
            }
          });
        }

      } catch (error) {
        console.error('Lỗi khi lưu tin tức:', error);
        alert('Lỗi khi lưu tin tức: ' + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete(id) {
      if (confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
        try {
          await deleteTinTuc(id);
          alert('Đã xóa tin tức thành công');
          this.loadTinTuc();
        } catch (error) {
          console.error('Lỗi khi xóa tin tức:', error);
          alert('Lỗi khi xóa tin tức: ' + error.message);
        }
      }
    },

    async restoreTinTuc(id) {
      try {
        const item = this.tinTucs.find(t => t.id === id);
        if (item) {
          // Tạo đối tượng cập nhật với trạng thái mới là true
          const baseData = {
            id: item.id,
            maTinTuc: item.maTinTuc,
            tieuDe: item.tieuDe,
            noiDung: item.noiDung,
            trangThai: true,
            anhBia: item.anhBia,
            taiKhoanId: item.taiKhoanId
          };

          // Chuẩn bị dữ liệu với hàm helper
          const updatedData = prepareTinTucData(baseData);

          console.log('Dữ liệu khôi phục:', updatedData);
          const response = await updateTinTuc(id, updatedData);
          console.log('Kết quả khôi phục:', response);
          alert('Đã khôi phục tin tức thành công');
          this.loadTinTuc();
        }
      } catch (error) {
        console.error('Lỗi khi khôi phục tin tức:', error);
        console.error('Chi tiết lỗi:', error.response?.data);
        alert('Lỗi khi khôi phục tin tức: ' + (error.response?.data?.message || error.message || 'Không xác định'));
      }
    },

    // Hiển thị chi tiết tin tức
    showDetail(item) {
      this.detailItem = { ...item };
      this.showDetailModal = true;
      this.showImageGallery = false; // Reset trạng thái gallery ảnh
      this.extractedImages = []; // Xóa các ảnh đã trích xuất trước đó
    },

    // Đóng modal chi tiết
    closeDetailModal() {
      this.showDetailModal = false;
      this.detailItem = null;
      this.showImageGallery = false;
      this.extractedImages = [];
    },

    // Đóng modal chính
    closeModal() {
      this.showModal = false;
      this.isEditing = false;
      this.form = {
        id: null,
        maTinTuc: '',
        tieuDe: '',
        noiDung: '',
        trangThai: true,
        anhBia: '',
        anhBiaFile: null,
        taiKhoanId: null
      };
      this.coverImagePreview = null;
      this.contentImages = [];
    },

    // Các phương thức quản lý ảnh đã được xóa

    // Bật/tắt hiển thị gallery ảnh và trích xuất ảnh từ nội dung
    toggleImageGallery() {
      this.showImageGallery = !this.showImageGallery;

      if (this.showImageGallery && this.detailItem) {
        // Trích xuất ảnh từ nội dung HTML khi mở gallery
        this.extractImagesFromContent(this.detailItem.noiDung);
      }
    },

    // Trích xuất các URL ảnh từ nội dung HTML
    extractImagesFromContent(htmlContent) {
      if (!htmlContent) {
        this.extractedImages = [];
        return;
      }

      // Tạo một phần tử div tạm thời để parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Tìm tất cả các thẻ img trong nội dung
      const imgElements = tempDiv.querySelectorAll('img');
      const imageUrls = [];

      // Lấy src từ mỗi thẻ img
      imgElements.forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.trim() !== '') {
          imageUrls.push(src);
        }
      });

      this.extractedImages = imageUrls;
      console.log('Đã trích xuất', imageUrls.length, 'ảnh từ nội dung');
    },

    // Phương thức mới để xóa ảnh từ nội dung
    deleteImage(imageId) {
      const imageElement = document.getElementById(imageId);
      if (imageElement) {
        imageElement.remove();
        this.updateContentValue();
        // Thông báo đã xóa ảnh thành công
        console.log('Đã xóa ảnh:', imageId);
      }
    },

    // Add this new method for toggling fullscreen
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      if (this.isFullscreen) {
        document.body.classList.add('editor-fullscreen-active');
      } else {
        document.body.classList.remove('editor-fullscreen-active');
      }
      // Focus the editor after toggling
      this.$nextTick(() => {
        if (this.$refs.contentEditor) {
          this.$refs.contentEditor.focus();
        }
      });
    },

    saveContentChanges(event) {
      if (this.detailItem && event.target) {
        this.detailItem.noiDung = event.target.innerHTML;
        this.contentChanged = false;
      }
    },

    // Xử lý sự kiện click trong trình soạn thảo
    handleEditorClick(event) {
      const editor = this.$refs.contentEditor;
      if (!editor) return;

      // Xóa class 'focused' khỏi tất cả các ảnh
      editor.querySelectorAll('.image-container-editable.focused').forEach(el => {
        el.classList.remove('focused');
      });

      // Nếu click vào một ảnh, thêm class 'focused'
      const imageWrapper = event.target.closest('.image-container-editable');
      if (imageWrapper) {
        imageWrapper.classList.add('focused');
      }
    },

    // Gắn và gỡ bỏ event listener
    addEditorClickListener() {
      this.$nextTick(() => {
        if (this.$refs.contentEditor) {
          this.$refs.contentEditor.addEventListener('click', this.handleEditorClick);
        }
      });
    },
    removeEditorClickListener() {
      if (this.$refs.contentEditor) {
        this.$refs.contentEditor.removeEventListener('click', this.handleEditorClick);
      }
    },
    // Xử lý khi dán nội dung vào tiêu đề
    handleTitlePaste(event) {
      // Ngăn chặn hành động dán mặc định
      event.preventDefault();

      // Lấy văn bản thuần túy từ clipboard
      const text = event.clipboardData.getData('text/plain');

      // Loại bỏ các ký tự HTML và giới hạn độ dài
      const cleanText = text.replace(/<[^>]*>/g, '').substring(0, 100);

      // Chèn văn bản đã làm sạch vào vị trí con trỏ
      document.execCommand('insertText', false, cleanText);
    },
  }
}
</script>

<style scoped>
.homestay-container {
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

.controls-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
}

.search-box {
  max-width: 500px;


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
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #060606;
  z-index: 1;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 35px 10px 15px;
  border-radius: 10px;
  border: 1px solid #5c5d5e;
}

.clear-search-btn {
  position: absolute;
  right: 35px;
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
  border-radius: 30px;
  border: 1px solid #555759;
}

.add-button {
  padding: 8px 16px;
}

.table-responsive {
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  text-align: center;
  vertical-align: middle;
}

.content-truncate {
  max-width: 300px;
  max-height: 10em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
  margin: 0 auto;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.btn-info-light {
  background-color: rgba(232, 236, 238, 0.1);
  color: #020809;
  border: none;
}

.btn-primary-light {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
  border: none;
}

.btn-warning-light {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: none;
}

.btn-danger-light {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: none;
}

.btn-success-light {
  background-color: rgba(25, 135, 84, 0.1);
  color: #198754;
  border: none;
}

.btn-icon:hover {
  opacity: 0.8;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
}

.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.empty-row {
  height: 53px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.modal-editor {
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  background-color: white;
  border-bottom: 1px solid #dee2e6;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  color: #6c757d;
  cursor: pointer;
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: hidden;
  /* Loại bỏ thanh cuộn ở giữa */
  background-color: white;
}

.modal-body form {
  height: 100%;
  overflow-y: hidden;
  /* Loại bỏ thanh cuộn ở form */
}

.homestay-details-modal .modal-body {
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  background-color: white;
  border-top: 1px solid #dee2e6;
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

/* Fullscreen mode */
.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: white;
}

.fullscreen-mode .content-editor {
  height: calc(100vh - 120px);
}

.news-id {
  color: #6c757d;
  font-size: 0.9rem;
}

.avatar-preview {
  width: 100%;
  height: 200px;
  border: 2px dashed #ced4da;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 15px;
}

.avatar-preview:hover {
  border-color: #0d6efd;
}

.uploaded-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6c757d;
}

.avatar-placeholder i {
  font-size: 2rem;
  margin-bottom: 10px;
}

.news-avatar-display {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.no-cover-image {
  height: 200px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  transition: background-color 0.2s;
}

.no-cover-image:hover {
  background-color: #f8f9fa;
}

.no-cover-image i {
  font-size: 3rem;
  margin-bottom: 10px;
}

.thumbnail-image {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.thumbnail-image:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
}

.no-image-placeholder {
  width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #6c757d;
  cursor: pointer;
  transition: background-color 0.2s;
}

.no-image-placeholder:hover {
  background-color: #e9ecef;
}

.no-image-placeholder i {
  font-size: 1.2rem;
}

/* New styles for detail modal gallery */
.detail-image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.detail-image-item {
  flex: 1 1 calc(25% - 10px);
  /* 4 images per row */
  max-width: calc(25% - 10px);
  box-sizing: border-box;
}

.detail-gallery-img {
  width: 100%;
  height: 100px;
  /* Fixed height for gallery images */
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.detail-gallery-img:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.no-image-placeholder.large {
  height: 200px;
  /* Larger placeholder for cover image */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  transition: background-color 0.2s;
}

.no-image-placeholder.large:hover {
  background-color: #f8f9fa;
}

.no-image-placeholder.large i {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

/* New styles for detail modal gallery */
.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.gallery-image-item {
  flex: 1 1 calc(25% - 10px);
  /* 4 images per row */
  max-width: calc(25% - 10px);
  box-sizing: border-box;
  position: relative;
}

.gallery-img {
  width: 100%;
  height: 100px;
  /* Fixed height for gallery images */
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.gallery-img:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.gallery-image-item:hover .image-overlay {
  opacity: 1;
}

.image-overlay i {
  color: white;
  font-size: 1.5rem;
}

.cover-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 2;
}

.cover-image-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  /* Added for overlay positioning */
}

.cover-image {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.no-images {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.no-images i {
  font-size: 3rem;
  margin-bottom: 10px;
}

.image-overlay-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
  color: white;
  font-size: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.cover-image-container:hover .image-overlay-cover {
  opacity: 1;
}

.image-overlay-cover i {
  font-size: 2rem;
  margin-bottom: 5px;
}

.image-overlay-cover span {
  font-size: 0.9rem;
}

/* Homestay-like styling */
.homestay-avatar-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  background-color: white;
  cursor: pointer;
  position: relative;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 1.5rem;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-preview.view-mode {
  cursor: default;
}

.uploaded-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #6c757d;
}

.avatar-placeholder i {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.homestay-id {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 5px;
}

.status-badge {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 5px;
  display: block;
}

/* Styles for the tabs */
.nav-tabs .nav-link {
  color: #495057;
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
}

.nav-tabs .nav-link:hover {
  border-color: #e9ecef #e9ecef #dee2e6;
}

.modal-footer .btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.9rem;
}

.btn-icon i {
  margin-right: 5px;
}

.xem-anh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #17a2b8;
  border-color: #17a2b8;
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s;
  width: 100%;
  max-width: 180px;
  margin: 0 auto;
}

.xem-anh-btn:hover {
  background-color: #138496;
  border-color: #117a8b;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.xem-anh-btn i {
  font-size: 1rem;
}

/* Rich Content Editor */
.content-editor-wrapper {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-editor-toolbar {
  background-color: #f8f9fa;
  padding: 8px;
  border-bottom: 1px solid #ced4da;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.toolbar-button {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #dee2e6;
  background-color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-button:hover {
  background-color: #e9ecef;
}

.toolbar-button:active {
  background-color: #dee2e6;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: #ced4da;
  margin: 0 8px;
}

.content-editor {
  min-height: 250px;
  max-height: 400px;
  padding: 15px;
  background-color: white;
  border: none;
  outline: none;
  overflow-y: auto;
  /* Giữ thanh cuộn cho phần nội dung */
  line-height: 1.6;
  cursor: text;
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

.content-editor:focus {
  outline: 1px solid #0d6efd;
}

.content-editor-container {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  background-color: white;
  position: relative;
}

.image-delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(220, 53, 69, 0.8);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer !important;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  font-weight: 500;
  display: none;
  /* Hide by default */
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  min-width: 80px;
  justify-content: center;
  pointer-events: auto !important;
}

/* Show delete button when container is focused */
.image-container-editable.focused .image-delete-btn {
  display: flex !important;
}

.image-delete-btn:hover {
  opacity: 1;
  transform: scale(1.05);
  background-color: #c82333;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

.image-delete-btn i {
  font-size: 16px;
}

/* Đảm bảo article-image có thể chứa nút xóa đúng vị trí */
.article-image {
  position: relative;
  margin: 15px 0;
  text-align: center;
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  border: 1px solid #eee;
  border-radius: 5px;
  padding-bottom: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  /* Thêm con trỏ để cho biết có thể click */
}

/* Đảm bảo nút xóa luôn hiển thị */
.article-image .image-delete-btn {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.content-preview {
  border-top: 1px solid #ced4da;
}

.preview-header {
  padding: 8px 12px;
  background-color: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #6c757d;
}

.preview-content {
  padding: 15px;
  background-color: white;
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
}

.article-image img {
  max-width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  height: auto;
  display: block;
  margin: 0 auto;
}

/* Add full-width image style for the editor */
.content-editor img {
  max-width: 100% !important;
  height: auto !important;
  margin: 20px auto;
  display: block;
  border-radius: 8px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.image-caption {
  padding: 8px 10px;
  background-color: #f8f9fa;
  font-size: 0.9rem;
  color: #495057;
  font-style: italic;
}

/* Styles cho hiển thị nội dung HTML trong modal chi tiết */
.content-preview-box {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  padding: 1rem;
  background-color: #fff;
  min-height: 200px;
  max-height: 500px;
  overflow-y: auto;
}

.content-preview-html {
  font-size: 1rem;
  line-height: 1.6;
}

.content-editable {
  cursor: text;
  outline: none;
  background-color: white;
  padding: 10px;
}

.content-editable:focus {
  box-shadow: inset 0 0 0 2px #007bff;
}

/* Modal với nền trắng */
.modal-body {
  background-color: white;
}

.homestay-details-modal {
  width: 900px;
  max-width: 900px;
  margin: auto;
  background-color: white;
  height: 80vh;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  background-color: white;
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  background-color: white;
  border-top: 1px solid #dee2e6;
}

/* Hide delete buttons in preview only */
.content-preview-html button.image-delete-btn,
.content-preview-box button.image-delete-btn,
.content-preview-html .btn-danger,
.content-preview-box .btn-danger {
  display: none !important;
}

.content-preview-html p {
  margin-bottom: 1rem;
}

.content-preview-html h1,
.content-preview-html h2,
.content-preview-html h3,
.content-preview-html h4,
.content-preview-html h5,
.content-preview-html h6 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

/* Styles cho gallery ảnh */
.image-gallery-modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: modal-slide-in 0.3s ease-out;
  overflow: hidden;
}

.gallery-header {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
  background-color: #f8f9fa;
}

.gallery-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.gallery-subtitle {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

.gallery-close-btn {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background-color: #0d6efd;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.gallery-close-btn:hover {
  background-color: #0b5ed7;
}

.gallery-content {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 100px);
}

.gallery-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #495057;
  margin-bottom: 1rem;
  padding-left: 0.5rem;
  border-left: 3px solid #0d6efd;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.gallery-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 220px;
  position: relative;
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.cover-item {
  position: relative;
}

.cover-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #0d6efd;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  z-index: 1;
}

.gallery-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.cover-image {
  max-width: 400px;
  margin: 0 auto;
}

/* Prevent body scrolling when gallery is open */
body.gallery-open {
  overflow: hidden;
}

.no-images {
  grid-column: 1/-1;
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

/* Đảm bảo modal chi tiết đủ rộng */
.homestay-details-modal {
  max-width: 1000px;
}

/* Hide delete buttons only in preview, not in editor */
.content-preview-box button.btn-danger,
.content-preview-html button.btn-danger,
.content-preview-box .fa-trash,
.content-preview-html .fa-trash {
  display: none !important;
}

.article-image figure {
  margin: 0;
  width: 100%;
  position: relative;
}

.article-image figcaption {
  padding: 8px 10px;
  background-color: #f8f9fa;
  color: #495057;
  font-style: italic;
  font-size: 0.9rem;
  text-align: center;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.image-caption {
  padding: 8px 10px;
  background-color: #f8f9fa;
  font-size: 0.9rem;
  color: #495057;
  font-style: italic;
  text-align: center;
  border-top: 1px solid #eee;
}

/* Make content editor more spacious */
.content-editor-wrapper {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

/* Override the default image styles to make them larger */
.content-preview-html .article-image img,
.content-editor .article-image img {
  width: 100%;
  max-width: 100%;
  display: block;
}

/* Fullscreen mode styles */
.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fullscreen-mode .content-editor-toolbar {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  background-color: #f8f9fa;
  padding: 10px;
  border-bottom: 1px solid #ced4da;
  z-index: 100;
}

.toolbar-left {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.fullscreen-button {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #ced4da;
  transition: all 0.2s;
}

.fullscreen-button:hover {
  background-color: #e9ecef;
  color: #212529;
}

.fullscreen-mode .content-editor {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0;
  /* Important for flex child */
  font-size: 16px;
  line-height: 1.8;
}

.fullscreen-mode .content-preview {
  max-height: 40vh;
  overflow-y: auto;
  border-top: 1px solid #ced4da;
}

/* Prevent body scrolling when editor is in fullscreen mode */
:global(body.editor-fullscreen-active) {
  overflow: hidden;
}

/* Improve toolbar button styles */
.toolbar-button {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid #ced4da;
  background-color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-button:hover {
  background-color: #e9ecef;
  transform: translateY(-1px);
}

.toolbar-button:active {
  background-color: #dee2e6;
}

.content-preview-html img {
  max-width: 100% !important;
  height: auto !important;
  margin: 20px auto;
  display: block;
  border-radius: 8px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.content-editable {
  cursor: text;
  outline: none;
  background-color: white;
  padding: 10px;
}

.content-editable:focus {
  box-shadow: inset 0 0 0 2px #007bff;
}

/* Modal với nền trắng */
.modal-body {
  background-color: white;
}

.homestay-details-modal {
  max-width: 1000px;
  background-color: white;
}

.modal-header {
  background-color: white;
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  background-color: white;
  border-top: 1px solid #dee2e6;
}

.non-editable {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
  cursor: default;
  background-color: white;
}

.modal-dialog {
  width: 900px;
  max-width: 900px;
  margin: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.article-image:hover .image-delete-btn {
  opacity: 1;
}

/* Xử lý tiêu đề bị tràn ra */
.homestay-details-modal .form-control {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-wrap: break-word;
}

.homestay-details-modal .form-group input {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-title-preview {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-title-display {
  white-space: normal !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  line-height: 1.4;
  max-height: 100px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f8f9fa;
}

/* Thêm style cho highlight */
.highlight {
  animation: highlight-animation 2s ease-out;
}

@keyframes highlight-animation {
  0% {
    background-color: rgba(13, 110, 253, 0.3);
  }

  100% {
    background-color: transparent;
  }
}

.highlight-blue {
  animation: highlight-blue-fade 10s ease-out forwards;
}

.table tr {
  transition: background-color 0.5s ease;
}

@keyframes highlight-blue-fade {
  0% {
    background-color: #2815f1;
    /* Light Blue */
  }

  100% {
    background-color: transparent;
  }
}

.content-editor .article-image img {
  width: 100%;
  max-width: 95%;
  /* Adjust this to make the image larger */
  display: block;
  margin: 15px auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Fullscreen mode styles */
/* ... existing code ... */

/* Tăng kích thước ảnh trong article-image */
.article-image img {
  max-width: 100% !important;
  height: auto !important;
  margin: 20px auto;
  display: block;
  border-radius: 8px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

/* Đảm bảo container đủ rộng */
.content-editor-container {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
  width: 100%;
}

/* Đảm bảo tiêu đề không bị tràn */
input[type="text"] {
  width: 100%;
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
}

/* Đảm bảo ảnh trong tiêu đề không hiển thị */
.news-title-preview img,
.news-title-display img,
h4 img {
  display: none !important;
}

/* Sửa lại form để không bị tràn */
.modal-body form {
  max-height: calc(90vh - 60px);
  overflow-y: auto;
}

/* Đảm bảo phần xem trước tiêu đề không bị tràn */
.news-title-preview,
.news-title-display,
h4.text-center {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Đảm bảo tiêu đề trong bảng không bị tràn */
td.text-center {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tùy chỉnh nút chèn ảnh */
.image-button {
  background-color: #e3f2fd;
  position: relative;
}

.image-button:after {
  content: "Chỉ cho nội dung";
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.image-button:hover:after {
  opacity: 1;
}

/* Hiển thị thông báo khi chọn ảnh ngoài vùng nội dung */
.alert-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  animation: fadeIn 0.3s, fadeOut 0.3s 2.7s forwards;
}

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

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
