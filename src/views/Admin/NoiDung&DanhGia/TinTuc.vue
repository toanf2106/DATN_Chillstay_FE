<template>
  <div class="container-fluid mt-4">
    <nav aria-label="breadcrumb" class="breadcrumb-custom mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active" aria-current="page">Quản lý Tin tức</li>
        <li class="breadcrumb-item"><router-link :to="{ name: 'AdminAnhTinTuc' }">Quản lý Ảnh tin tức</router-link></li>
      </ol>
    </nav>

    <div class="news-management-section">
      <h2 class="section-title">DANH SÁCH TIN TỨC</h2>

      <!-- Toolbar -->
      <div class="toolbar-section">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <button class="btn btn-primary add-btn-custom d-flex align-items-center me-3" @click="openAddModal"
              title="Thêm tin tức">
              <i class="bi bi-plus-lg me-2"></i> Thêm Tin
            </button>
            <input v-model="searchKeyword" @input="debouncedSearch" class="form-control search-input-custom me-2"
              style="width: 300px" placeholder="Tìm kiếm theo mã hoặc tiêu đề..." />
            <select class="form-select search-select-custom me-2" v-model="filterStatus">
              <option :value="null">Tất cả trạng thái</option>
              <option :value="true">Đang hoạt động</option>
              <option :value="false">Không hoạt động</option>
            </select>
          </div>
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination-wrapper">
            <ul class="pagination pagination-sm">
              <li class="page-item" :class="{ disabled: page === 0 }">
                <button class="page-link" @click="changePage(page - 1)" :disabled="page === 0">‹</button>
              </li>
              <li class="page-item" v-for="p in totalPages" :key="p" :class="{ active: page === p - 1 }">
                <button class="page-link" @click="changePage(p - 1)">{{ p }}</button>
              </li>
              <li class="page-item" :class="{ disabled: page === totalPages - 1 }">
                <button class="page-link" @click="changePage(page + 1)" :disabled="page === totalPages - 1">›</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- News Table -->
      <div class="table-container">
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã tin tức</th>
              <th>Tiêu đề</th>
              <th>Ngày đăng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in tinTucs" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.maTinTuc }}</td>
              <td>{{ item.tieuDe }}</td>
              <td>{{ formatDate(item.ngayDang) }}</td>
              <td>
                <span :class="['badge', item.trangThai ? 'bg-success' : 'bg-secondary']">
                  {{ item.trangThai ? 'Đang hiển thị' : 'Đã ẩn' }}
                </span>
              </td>
              <td>
                <button class="icon-btn icon-btn-info me-1" @click="showDetail(item)" title="Chi tiết">
                  <i class="bi bi-info-circle"></i>
                </button>
                <router-link :to="{ name: 'AdminAnhTinTuc', params: { newsId: item.id } }"
                  class="icon-btn icon-btn-primary me-1" title="Quản lý ảnh">
                  <i class="bi bi-images"></i>
                </router-link>
                <button v-if="item.trangThai" class="icon-btn icon-btn-warning me-1" @click="openEditModal(item)"
                  title="Sửa">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button v-if="item.trangThai" class="icon-btn icon-btn-danger" @click="confirmDelete(item.id)"
                  title="Xóa">
                  <i class="bi bi-trash"></i>
                </button>
                <button v-else class="icon-btn icon-btn-success" @click="restoreTinTuc(item.id)" title="Khôi phục">
                  <i class="bi bi-arrow-clockwise"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <!-- Modal Thêm/Sửa tin tức -->
    <div class="modal fade" ref="tinTucModal" id="tinTucModal" tabindex="-1" aria-labelledby="tinTucModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <form @submit.prevent="handleSubmit">
            <div class="modal-header">
              <h5 class="modal-title" id="tinTucModalLabel">
                {{ isEditing ? 'Cập nhật tin tức' : 'Thêm tin tức mới' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Mã tin tức <span class="text-danger">*</span></label>
                <input v-model="form.maTinTuc" class="form-control" required maxlength="50" />
              </div>
              <div class="mb-3">
                <label class="form-label">Tiêu đề <span class="text-danger">*</span></label>
                <input v-model="form.tieuDe" class="form-control" required maxlength="200" />
              </div>
              <div class="mb-3">
                <label class="form-label">Nội dung <span class="text-danger">*</span></label>
                <textarea v-model="form.noiDung" class="form-control" rows="6" required maxlength="2000"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
              <button type="submit" class="btn btn-primary">
                {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết tin tức -->
    <div class="modal fade" ref="detailModal" id="detailModal" tabindex="-1" aria-labelledby="detailModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="detailModalLabel">Chi tiết tin tức</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="detailItem">
            <div class="row">
              <div class="col-md-8">
                <h4>{{ detailItem.tieuDe }}</h4>
                <p class="text-muted">Mã: {{ detailItem.maTinTuc }} | Ngày đăng: {{ formatDate(detailItem.ngayDang) }}
                </p>
                <div class="content-detail">
                  {{ detailItem.noiDung }}
                </div>
              </div>
              <div class="col-md-4" v-if="detailItem.anhBia">
                <img :src="detailItem.anhBia" alt="Ảnh bìa" class="img-fluid rounded" />
              </div>
            </div>
            <div class="mt-3">
              <span :class="['badge', detailItem.trangThai ? 'bg-success' : 'bg-secondary']">
                {{ detailItem.trangThai ? 'Đang hiển thị' : 'Đã ẩn' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  addTinTuc,
  updateTinTuc,
  deleteTinTuc,
  searchTinTuc,
} from '@/Service/TinTucSevice'
import * as bootstrap from 'bootstrap'

export default {
  name: 'TinTuc',
  data() {
    return {
      tinTucs: [],
      isEditing: false,
      form: {
        id: null,
        maTinTuc: '',
        tieuDe: '',
        noiDung: '',
        trangThai: true,
      },
      modal: null,
      detailItem: null,
      detailModal: null,
      searchKeyword: '',
      page: 0,
      size: 10,
      totalPages: 1,
      filterStatus: null,
      debouncedSearch: null,
    }
  },
  mounted() {
    this.loadTinTuc();
    this.$nextTick(() => {
      this.modal = bootstrap.Modal.getOrCreateInstance(this.$refs.tinTucModal);
      this.detailModal = bootstrap.Modal.getOrCreateInstance(this.$refs.detailModal);
    });
  },
  watch: {
    filterStatus() {
      this.page = 0;
      this.loadTinTuc();
    }
  },
  methods: {
    async loadTinTuc() {
      try {
        const res = await searchTinTuc({
          page: this.page,
          size: this.size,
          maTinTuc: this.searchKeyword,
          trangThai: this.filterStatus,
        });

        this.tinTucs = res.data.content;
        this.totalPages = res.data.totalPages;
      } catch (error) {
        console.error('Lỗi khi tải danh sách tin tức:', error);
        alert('Lỗi khi tải danh sách tin tức');
      }
    },

    openAddModal() {
      this.isEditing = false;
      this.form = {
        id: null,
        maTinTuc: '',
        tieuDe: '',
        noiDung: '',
        trangThai: true,
      };
      if (this.modal) this.modal.show();
    },

    openEditModal(item) {
      this.isEditing = true;
      this.form = {
        ...item
      };
      if (this.modal) this.modal.show();
    },

    async handleSubmit() {
      if (!this.form.maTinTuc || this.form.maTinTuc.trim() === '') {
        alert('Mã tin tức không được để trống!');
        return;
      }
      if (!this.form.tieuDe || this.form.tieuDe.trim() === '') {
        alert('Tiêu đề không được để trống!');
        return;
      }
      if (!this.form.noiDung || this.form.noiDung.trim() === '') {
        alert('Nội dung không được để trống!');
        return;
      }

      try {
        let tinTucData = { ...this.form };

        if (this.isEditing) {
          await updateTinTuc(this.form.id, tinTucData);
          alert('Cập nhật thành công');
        } else {
          await addTinTuc(tinTucData);
          alert('Thêm mới thành công');
        }
        this.modal.hide();
        this.loadTinTuc();
      } catch (error) {
        console.error('Lỗi khi lưu tin tức:', error);
        alert('Lỗi khi lưu tin tức');
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
          alert('Lỗi khi xóa tin tức');
        }
      }
    },

    async restoreTinTuc(id) {
      try {
        const item = this.tinTucs.find(t => t.id === id);
        if (item) {
          const updated = { ...item, trangThai: true };
          await updateTinTuc(id, updated);
          alert('Đã khôi phục tin tức');
          this.loadTinTuc();
        }
      } catch (error) {
        console.error('Lỗi khi khôi phục tin tức:', error);
        alert('Lỗi khi khôi phục tin tức');
      }
    },

    showDetail(item) {
      this.detailItem = item;
      if (this.detailModal) this.detailModal.show();
    },

    async changePage(newPage) {
      if (newPage >= 0 && newPage < this.totalPages) {
        this.page = newPage;
        await this.loadTinTuc();
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },
  },
  created() {
    // Debounce tìm kiếm 300ms
    let timeout = null;
    this.debouncedSearch = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.page = 0;
        this.loadTinTuc();
      }, 300);
    };
  }
}
</script>

<style scoped>
/* Breadcrumb */
.breadcrumb-custom {
  padding: 0;
  margin-bottom: 1.5rem;
}

.breadcrumb-custom .breadcrumb {
  background-color: transparent;
  padding: 0;
  font-size: 1.1rem;
}

.breadcrumb-custom .breadcrumb-item a {
  color: #0d6efd;
  text-decoration: none;
}

.breadcrumb-custom .breadcrumb-item.active {
  color: #495057;
  font-weight: 500;
}

.breadcrumb-custom .breadcrumb-item+.breadcrumb-item::before {
  content: "/";
  padding: 0 0.75rem;
  color: #6c757d;
}

/* Layout */
.transition-col {
  transition: all 0.4s ease-in-out;
}

.image-management-section {
  height: 100%;
}

.table th,
.table td {
  vertical-align: middle;
}

.modal.show {
  z-index: 1055;
}

/* Section styling */
.news-management-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.section-title {
  color: #1f2937;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.toolbar-section {
  margin-bottom: 20px;
}

.table-container {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

/* Custom search bar styles */
.search-input-custom {
  border-radius: 20px;
  border: 1.5px solid #3b82f6;
  background: #fff;
  box-shadow: none;
  transition: border-color 0.2s;
  width: 100%;
  min-width: 200px;
  max-width: 100%;
}

.search-input-custom:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px #dbeafe;
}

.search-select-custom {
  border-radius: 20px;
  border: 1.5px solid #3b82f6;
  background: #fff;
  box-shadow: none;
  transition: border-color 0.2s;
  width: 180px;
}

.add-btn-custom {
  border-radius: 20px;
  background: #2563eb;
  border: none;
  font-weight: 500;
  padding: 8px 24px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
  transition: background 0.2s;
}

.add-btn-custom:hover {
  background: #1d4ed8;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}

.pagination {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 4px 16px;
}

.pagination.pagination-sm .page-link {
  border-radius: 50% !important;
  margin: 0 2px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination .page-item.active .page-link {
  background: #2563eb;
  color: #fff;
  border: none;
}

.pagination .page-link:focus {
  box-shadow: 0 0 0 2px #dbeafe;
}

.icon-btn {
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: background 0.2s, color 0.2s;
  margin-right: 2px;
}

.icon-btn-info {
  color: #2563eb;
}

.icon-btn-info:hover {
  background: #dbeafe;
  color: #1d4ed8;
}

.icon-btn-primary {
  color: #7c3aed;
}

.icon-btn-primary:hover {
  background: #ede9fe;
  color: #5b21b6;
}

.icon-btn-warning {
  color: #f59e42;
}

.icon-btn-warning:hover {
  background: #fef3c7;
  color: #d97706;
}

.icon-btn-danger {
  color: #ef4444;
}

.icon-btn-danger:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.icon-btn-success {
  color: #22c55e;
}

.icon-btn-success:hover {
  background: #bbf7d0;
  color: #15803d;
}

.selected-row {
  background-color: #e0f2fe !important;
  border-left: 4px solid #0ea5e9;
}

.selected-row td {
  background-color: transparent !important;
}

.selected-news-info {
  background: #f0f9ff;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #3b82f6;
}

.image-grid-container {
  max-height: 600px;
  overflow-y: auto;
  padding: 5px;
}

.image-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.image-card .card-img-top {
  width: 100%;
  height: 150px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-card:hover .card-img-top {
  transform: scale(1.05);
}

.image-card .image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.empty-image-state {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
}

.image-thumbnail {
  width: 70px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.content-detail {
  white-space: pre-wrap;
  line-height: 1.6;
  max-height: 400px;
  overflow-y: auto;
}

.empty-row {
  height: 53px;
}
</style>
