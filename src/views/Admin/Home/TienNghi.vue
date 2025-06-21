<template>
  <div class="container mt-4">
    <h2>Quản lý Tiện nghi</h2>
    <div class="mb-3 d-flex align-items-center search-bar-custom justify-content-between">
      <div class="d-flex align-items-center flex-grow-1">
        <input v-model="searchKeyword" @input="debouncedSearch" class="form-control search-input-custom me-2"
          style="width: 400px" placeholder="Tìm kiếm tiện nghi..." />
      </div>
      <div class="d-flex align-items-center">
        <select class="form-select search-select-custom me-2" v-model="filterStatus">
          <option :value="null">Tất cả trạng thái</option>
          <option :value="true">Đang hoạt động</option>
          <option :value="false">Không hoạt động</option>
        </select>
        <button class="btn-action btn-blue" @click="openAddModal" title="Thêm tiện nghi">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>
    <table class="table table-bordered table-hover">
      <thead>
        <tr>
          <th>STT</th>
          <th>Tên tiện nghi</th>
          <th>Mô tả</th>
          <th>Đơn vị</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in tienNghis" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.tenTienNghi }}</td>
          <td>{{ item.moTa }}</td>
          <td>{{ item.donVi }}</td>
          <td>
            <span :class="['badge', item.trangThai ? 'bg-success' : 'bg-secondary']">
              {{ item.trangThai ? 'Đang sử dụng' : 'Ngừng sử dụng' }}
            </span>
          </td>
          <td class="action-column">
            <button class="btn-action btn-blue" @click="showDetail(item)" title="Chi tiết">
              <i class="fas fa-eye"></i>
            </button>
            <button v-if="item.trangThai" class="btn-action btn-yellow" @click="openEditModal(item)" title="Sửa">
              <i class="fas fa-edit"></i>
            </button>
            <button v-if="item.trangThai" class="btn-action btn-red" @click="confirmDelete(item.id)" title="Xóa">
              <i class="fas fa-trash"></i>
            </button>
            <button v-else class="btn-action btn-green" @click="restoreTienNghi(item.id)" title="Khôi phục">
              <i class="fas fa-redo"></i>
            </button>
          </td>
        </tr>
        <!-- Empty rows to maintain table height -->
        <template v-if="tienNghis.length < size">
          <tr v-for="i in (size - tienNghis.length)" :key="'empty-' + i" class="empty-row">
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Modal Thêm/Sửa -->
    <div class="modal fade" ref="tienNghiModal" id="tienNghiModal" tabindex="-1" aria-labelledby="tienNghiModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form @submit.prevent="handleSubmit">
            <div class="modal-header">
              <h5 class="modal-title" id="tienNghiModalLabel">
                {{ isEditing ? 'Cập nhật tiện nghi' : 'Thêm tiện nghi mới' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Tên tiện nghi <span class="text-danger">*</span></label>
                <input v-model="form.tenTienNghi" class="form-control" required maxlength="100" />
              </div>
              <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea v-model="form.moTa" class="form-control" rows="2" maxlength="255"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Đơn vị</label>
                <input v-model="form.donVi" class="form-control" maxlength="20" />
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

    <!-- Modal Chi tiết tiện nghi -->
    <div class="modal fade" ref="detailModal" id="detailModal" tabindex="-1" aria-labelledby="detailModalLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="detailModalLabel">Chi tiết tiện nghi</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="detailItem">
            <p><b>Tên tiện nghi:</b> {{ detailItem.tenTienNghi }}</p>
            <p><b>Mô tả:</b> {{ detailItem.moTa }}</p>
            <p><b>Đơn vị:</b> {{ detailItem.donVi }}</p>
            <p><b>Trạng thái:</b> <span :class="['badge', detailItem.trangThai ? 'bg-success' : 'bg-secondary']">{{
              detailItem.trangThai ? 'Đang sử dụng' : 'Ngừng sử dụng' }}</span></p>
          </div>
        </div>
      </div>
    </div>

    <div class="table-footer">
      <div v-if="totalPages > 1" class="pagination-wrapper">
        <ul class="pagination pagination-sm justify-content-end">
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
</template>

<script>
import {
  addTienNghi,
  updateTienNghi,
  searchTienNghi,
} from '@/Service/TienNghiService'
import * as bootstrap from 'bootstrap'

export default {
  name: 'TienNghi',
  data() {
    return {
      tienNghis: [],
      isEditing: false,
      form: {
        id: null,
        tenTienNghi: '',
        moTa: '',
        donVi: '',
        trangThai: true,
      },
      modal: null,
      filterStatus: null,
      detailItem: null,
      detailModal: null,
      searchKeyword: '',
      page: 0,
      size: 8,
      totalPages: 1,
      totalElements: 0,
      searchText: '',
      debouncedSearch: null,
    }
  },
  mounted() {
    this.loadTienNghi();
    this.$nextTick(() => {
      const el = this.$refs.tienNghiModal;
      if (el) {
        this.modal = bootstrap.Modal.getOrCreateInstance(el);
      }
      const detailEl = this.$refs.detailModal;
      if (detailEl) {
        this.detailModal = bootstrap.Modal.getOrCreateInstance(detailEl);
      }
    });
  },
  watch: {
    filterStatus() {
      this.page = 0;
      this.loadTienNghi();
    }
  },
  methods: {
    async loadTienNghi() {
      try {
        const res = await searchTienNghi({
          keyword: this.searchKeyword,
          page: this.page,
          size: this.size,
          status: this.filterStatus,
        });

        this.tienNghis = res.data.content;
        this.totalPages = res.data.totalPages;
        this.totalElements = res.data.totalElements;
      } catch {
        alert('Lỗi khi tải danh sách tiện nghi');
      }
    },

    openAddModal() {
      this.isEditing = false;
      this.form = { id: null, tenTienNghi: '', moTa: '', donVi: '', trangThai: true };
      if (this.modal) this.modal.show();
    },
    openEditModal(item) {
      this.isEditing = true;
      this.form = { ...item };
      if (this.modal) this.modal.show();
    },
    async handleSubmit() {
      if (!this.form.tenTienNghi || this.form.tenTienNghi.trim() === '') {
        alert('Tên tiện nghi không được để trống!');
        return;
      }
      try {
        if (this.isEditing) {
          await updateTienNghi(this.form.id, this.form);
          alert('Cập nhật thành công');
        } else {
          await addTienNghi(this.form);
          alert('Thêm mới thành công');
        }
        this.modal.hide();
        this.loadTienNghi();
      } catch {
        alert('Lỗi khi lưu tiện nghi');
      }
    },
    async confirmDelete(id) {
      if (confirm('Bạn có chắc chắn muốn xóa tiện nghi này (chuyển sang không hoạt động)?')) {
        try {
          const item = this.tienNghis.find(tn => tn.id === id);
          if (item) {
            const updated = { ...item, trangThai: false };
            await updateTienNghi(id, updated);
            alert('Đã chuyển tiện nghi sang không hoạt động');
            this.loadTienNghi();
          }
        } catch {
          alert('Lỗi khi chuyển trạng thái tiện nghi');
        }
      }
    },
    async restoreTienNghi(id) {
      try {
        const item = this.tienNghis.find(tn => tn.id === id);
        if (item) {
          const updated = { ...item, trangThai: true };
          await updateTienNghi(id, updated);
          alert('Đã khôi phục tiện nghi');
          this.loadTienNghi();
        }
      } catch {
        alert('Lỗi khi khôi phục tiện nghi');
      }
    },
    showDetail(item) {
      this.detailItem = item;
      if (this.detailModal) this.detailModal.show();
    },
    async handleSearch() {
      this.page = 0;
      await this.loadTienNghi();
    },
    async changePage(newPage) {
      if (newPage >= 0 && newPage < this.totalPages) {
        this.page = newPage;
        await this.loadTienNghi();
      }
    },
    onSearchInput() {
      this.page = 0;
      this.loadTienNghi();
    }
  },
  created() {
    // Debounce tìm kiếm 300ms
    let timeout = null;
    this.debouncedSearch = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.page = 0;
        this.loadTienNghi();
      }, 300);
    };
  }
}
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}

.modal-backdrop.show {
  z-index: 1040;
}

.modal.show {
  display: block;
  z-index: 1055;
}

/* Custom search bar styles giống ảnh */
.search-bar-custom {
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 12px 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
}

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

/* Nút hành động */
.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin: 0 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-column {
  white-space: nowrap;
}

.btn-blue {
  background-color: #2563eb;
  color: white;
}

.btn-blue:hover {
  background-color: #1d4ed8;
}

.btn-yellow {
  background-color: #f59e42;
  color: white;
}

.btn-yellow:hover {
  background-color: #d97706;
}

.btn-red {
  background-color: #ef4444;
  color: white;
}

.btn-red:hover {
  background-color: #b91c1c;
}

.btn-green {
  background-color: #22c55e;
  color: white;
}

.btn-green:hover {
  background-color: #15803d;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  margin-bottom: 8px;
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

.table-footer {
  min-height: 56px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  margin-top: 0;
  margin-bottom: 16px;
  position: sticky;
  bottom: 0;
  background-color: #fff;
  z-index: 10;
  margin-top: auto;
  padding-top: 8px;
  padding-bottom: 16px;
}

.container {
  min-height: 600px;
  display: flex;
  flex-direction: column;
}
</style>
