<template>
  <div class="voucher-container">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="mb-0">Quản lý mã giảm giá</h2>
      <div class="d-flex">
        <div class="me-2">
          <input
            type="text"
            class="form-control"
            placeholder="Tìm kiếm theo tên..."
            v-model="searchKeyword"
            @keyup.enter="searchVouchers"
          />
        </div>
        <button class="btn btn-primary" @click="showAddModal">
          Thêm mã giảm giá
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover border">
        <thead class="table-light">
          <tr>
            <th>Mã giảm giá</th>
            <th>Tên</th>
            <th>Loại</th>
            <th>Giá trị</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Số lượng</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="vouchers.length === 0">
            <td colspan="9" class="text-center py-3">Không có dữ liệu mã giảm giá</td>
          </tr>
          <tr v-for="voucher in vouchers" :key="voucher.id">
            <td>{{ voucher.code }}</td>
            <td>{{ voucher.name }}</td>
            <td>{{ voucher.type === 'PERCENT' ? 'Phần trăm' : 'Số tiền' }}</td>
            <td>{{ formatValue(voucher.value, voucher.type) }}</td>
            <td>{{ formatDate(voucher.startDate) }}</td>
            <td>{{ formatDate(voucher.endDate) }}</td>
            <td>{{ voucher.quantity }}</td>
            <td>
              <span class="badge bg-success rounded-pill">
                Hoạt động
              </span>
            </td>
            <td>
              <div class="btn-group">
                <button class="btn btn-info btn-sm" @click="showEditModal(voucher)">
                  Sửa
                </button>
                <button class="btn btn-danger btn-sm ms-1" @click="showDeleteModal(voucher)">
                  Xóa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <select class="form-select me-2" style="width: auto;" v-model="pageSize">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
        <span>items per page</span>
      </div>
      <ul class="pagination mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">Trước</a>
        </li>
        <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
          <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">Sau</a>
        </li>
      </ul>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" id="voucherModal" tabindex="-1" aria-hidden="true" ref="voucherModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="mb-3" v-if="isEdit">
                <label class="form-label">Mã giảm giá</label>
                <input type="text" class="form-control" v-model="formData.code" disabled />
              </div>
              <div class="mb-3">
                <label class="form-label">Tên mã giảm giá <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="formData.name" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Loại giảm giá <span class="text-danger">*</span></label>
                <select class="form-select" v-model="formData.type" required>
                  <option value="PERCENT">Phần trăm (%)</option>
                  <option value="AMOUNT">Số tiền (VNĐ)</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Giá trị <span class="text-danger">*</span></label>
                <div class="input-group">
                  <input
                    type="number"
                    class="form-control"
                    v-model="formData.value"
                    :max="formData.type === 'PERCENT' ? 100 : null"
                    min="0"
                    required
                  />
                  <span class="input-group-text">{{ formData.type === 'PERCENT' ? '%' : 'đ' }}</span>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Ngày bắt đầu <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" v-model="formData.startDate" required />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Ngày kết thúc <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" v-model="formData.endDate" required />
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Số lượng <span class="text-danger">*</span></label>
                <input type="number" class="form-control" v-model="formData.quantity" min="1" required />
              </div>
              <div class="mb-3">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="activeStatus" v-model="formData.isActive">
                  <label class="form-check-label" for="activeStatus">
                    {{ formData.isActive ? 'Hoạt động' : 'Không hoạt động' }}
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="submitForm">Lưu</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedVoucher">
            <p>Bạn có chắc chắn muốn xóa mã giảm giá <strong>{{ selectedVoucher.name }}</strong> ({{ selectedVoucher.code }})?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="deleteVoucher">Xóa</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'

export default {
  name: 'QlyVoucher',
  data() {
    return {
      vouchers: [],
      loading: false,
      searchKeyword: '',
      currentPage: 1,
      pageSize: 5,
      totalItems: 0,
      totalPages: 1,
      voucherModal: null,
      deleteModal: null,
      isEdit: false,
      selectedVoucher: null,
      formData: {
        code: '',
        name: '',
        type: 'PERCENT',
        value: 0,
        startDate: '',
        endDate: '',
        quantity: 1,
        isActive: true
      },
      // Dữ liệu mẫu
      sampleData: [
        {
          id: 1,
          code: 'GG000001',
          name: 'Giảm giá mùa xuân',
          type: 'PERCENT',
          value: 10,
          startDate: '2025-06-01',
          endDate: '2025-12-31',
          quantity: 50,
          isActive: true
        },
        {
          id: 2,
          code: 'GG000002',
          name: 'Giảm giá mùa hè',
          type: 'AMOUNT',
          value: 500000,
          startDate: '2025-06-01',
          endDate: '2025-09-30',
          quantity: 30,
          isActive: true
        },
        {
          id: 3,
          code: 'GG000003',
          name: 'Giảm giá mùa thu đông',
          type: 'AMOUNT',
          value: 200000,
          startDate: '2025-06-01',
          endDate: '2026-12-30',
          quantity: 30,
          isActive: true
        },
        {
          id: 4,
          code: 'GG000016',
          name: 'Giảm giá hè thu',
          type: 'PERCENT',
          value: 25,
          startDate: '2025-06-19',
          endDate: '2025-07-12',
          quantity: 50,
          isActive: true
        },
        {
          id: 5,
          code: 'GG000018',
          name: 'test 03',
          type: 'AMOUNT',
          value: 35000,
          startDate: '2025-06-19',
          endDate: '2025-09-18',
          quantity: 50,
          isActive: true
        }
      ]
    }
  },
  computed: {
    displayedPages() {
      const delta = 2; // Số trang hiển thị trước và sau trang hiện tại
      const pages = [];
      let start = Math.max(1, this.currentPage - delta);
      let end = Math.min(this.totalPages, this.currentPage + delta);

      if (this.currentPage - delta > 1) {
        pages.push(1);
        if (this.currentPage - delta > 2) {
          pages.push('...');
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (this.currentPage + delta < this.totalPages) {
        if (this.currentPage + delta < this.totalPages - 1) {
          pages.push('...');
        }
        pages.push(this.totalPages);
      }

      return pages;
    }
  },
  mounted() {
    this.voucherModal = new Modal(this.$refs.voucherModal);
    this.deleteModal = new Modal(this.$refs.deleteModal);
    this.loadData();
  },
  methods: {
    loadData() {
      this.loading = true;
      setTimeout(() => {
        // Giả lập dữ liệu từ API
        this.vouchers = [...this.sampleData];
        this.totalItems = this.sampleData.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
      }, 500);
    },

    formatValue(value, type) {
      if (type === 'PERCENT') {
        return `${value}%`;
      } else {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
          .format(value)
          .replace(/\s₫$/, ' đ');
      }
    },

    formatDate(date) {
      if (!date) return '';

      const parts = date.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return date;
    },

    searchVouchers() {
      if (!this.searchKeyword.trim()) {
        this.loadData();
        return;
      }

      const keyword = this.searchKeyword.toLowerCase();
      this.vouchers = this.sampleData.filter(voucher =>
        voucher.name.toLowerCase().includes(keyword) ||
        voucher.code.toLowerCase().includes(keyword)
      );

      this.totalItems = this.vouchers.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.currentPage = 1;
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    showAddModal() {
      this.isEdit = false;
      this.resetForm();
      this.voucherModal.show();
    },

    showEditModal(voucher) {
      this.isEdit = true;
      this.selectedVoucher = voucher;

      this.formData = {
        code: voucher.code,
        name: voucher.name,
        type: voucher.type,
        value: voucher.value,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        quantity: voucher.quantity,
        isActive: voucher.isActive
      };

      this.voucherModal.show();
    },

    showDeleteModal(voucher) {
      this.selectedVoucher = voucher;
      this.deleteModal.show();
    },

    resetForm() {
      const today = new Date();
      const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

      this.formData = {
        code: this.generateVoucherCode(),
        name: '',
        type: 'PERCENT',
        value: 0,
        startDate: today.toISOString().split('T')[0],
        endDate: nextYear.toISOString().split('T')[0],
        quantity: 1,
        isActive: true
      };
    },

    generateVoucherCode() {
      // Tạo mã voucher tiếp theo dựa trên mã lớn nhất hiện tại
      if (this.sampleData.length === 0) {
        return 'GG000001';
      }

      const maxCode = Math.max(...this.sampleData.map(v => parseInt(v.code.replace('GG', ''), 10)));
      return `GG${String(maxCode + 1).padStart(6, '0')}`;
    },

    submitForm() {
      // Kiểm tra ngày bắt đầu <= ngày kết thúc
      if (new Date(this.formData.startDate) > new Date(this.formData.endDate)) {
        alert('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc');
        return;
      }

      if (this.isEdit) {
        // Cập nhật voucher
        const index = this.sampleData.findIndex(v => v.code === this.formData.code);
        if (index !== -1) {
          this.sampleData[index] = {
            ...this.sampleData[index],
            ...this.formData
          };
        }
      } else {
        // Thêm voucher mới
        const newVoucher = {
          id: this.sampleData.length + 1,
          ...this.formData
        };
        this.sampleData.push(newVoucher);
      }

      this.voucherModal.hide();
      this.loadData();

      // Hiển thị thông báo
      alert(`${this.isEdit ? 'Cập nhật' : 'Thêm'} mã giảm giá thành công!`);
    },

    deleteVoucher() {
      if (!this.selectedVoucher) return;

      const index = this.sampleData.findIndex(v => v.code === this.selectedVoucher.code);
      if (index !== -1) {
        this.sampleData.splice(index, 1);
      }

      this.deleteModal.hide();
      this.loadData();

      // Hiển thị thông báo
      alert('Xóa mã giảm giá thành công!');
    }
  }
}
</script>

<style scoped>
.voucher-container {
  padding: 20px;
}

.pagination li.page-item a {
  cursor: pointer;
}
</style>
