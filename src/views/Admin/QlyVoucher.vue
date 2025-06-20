<template>
  <div class="voucher-management">
    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Quản lý mã giảm giá</h4>
        <div class="search-box">
          <input
            v-model="searchTerm"
            @input="handleSearch"
            type="text"
            placeholder="Tìm kiếm theo tên..."
            class="form-control"
          >
        </div>
        <button @click="openAddModal" class="btn btn-primary">
          Thêm mã giảm giá
        </button>
      </div>

      <div class="card-body">
        <!-- Table -->
        <div class="table-responsive">
          <table class="table">
            <thead>
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
              <tr v-for="voucher in vouchers" :key="voucher.id">
                <td>{{ voucher.maGiamGia }}</td>
                <td>{{ voucher.tenGiamGia }}</td>
                <td>{{ formatLoaiGiamGia(voucher.loaiGiamGia) }}</td>
                <td>{{ formatGiaTri(voucher.giaTri, voucher.loaiGiamGia) }}</td>
                <td>{{ formatDate(voucher.ngayBatDau) }}</td>
                <td>{{ formatDate(voucher.ngayKetThuc) }}</td>
                <td>{{ voucher.soLuong }}</td>
                <td>
                  <span :class="['badge', voucher.trangThai ? 'badge-success' : 'badge-danger']">
                    {{ voucher.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
                  </span>
                </td>
                <td>
                  <button @click="editVoucher(voucher)" class="btn btn-sm btn-info me-2">
                    Sửa
                  </button>
                  <button @click="deleteVoucher(voucher.id)" class="btn btn-sm btn-danger">
                    Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div class="page-size">
            <select v-model="pageSize" class="form-select" @change="handlePageSizeChange">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
          <nav v-if="totalPages > 1">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 0 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                  Trước
                </a>
              </li>
              <li v-for="page in displayedPages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage + 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(page - 1)">
                  {{ page }}
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage >= totalPages - 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                  Sau
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal components for add/edit -->
    <VoucherModal
      v-if="showModal"
      :voucher="selectedVoucher"
      :isEdit="isEdit"
      @close="closeModal"
      @save="saveVoucher"
    />
  </div>
</template>

<script>
import VoucherModal from './components/VoucherModal.vue';
import { useVoucherManagement } from '@/Styles/JS/Voucher.js';

export default {
  name: 'QlyVoucher',
  components: {
    VoucherModal
  },
  setup() {
    return {
      ...useVoucherManagement()
    };
  }
};
</script>

<style scoped>
@import '@/Styles/CSS/Voucher.css';
</style>