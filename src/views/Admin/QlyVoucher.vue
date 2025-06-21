<template>
  <h4 class="page-title mb-3">Quản lý mã giảm giá</h4>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <div class="search-box">
        <input
          v-model="searchTerm"
          @input="handleSearch"
          type="text"
          class="form-control"
        >
      </div>
      <div class="d-flex align-items-center gap-3">
        <select
          v-model="selectedStatus"
          @change="handleStatusChange(selectedStatus)"
          class="form-select status-filter"
        >
          <option value="all">Tất cả voucher</option>
          <option value="valid">Voucher còn hạn</option>
          <option value="expired">Voucher hết hạn</option>
        </select>
        <button @click="openAddModal" class="btn btn-primary d-flex align-items-center">
          <i class="fas fa-plus"></i>
        </button>
      </div>
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
                <div class="d-flex gap-2">
                  <button @click="editVoucher(voucher)" class="btn btn-sm btn-info">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteVoucher(voucher.id)" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="pagination-info">
          Hiển thị {{ (currentPage * pageSize) + 1 }} đến {{ Math.min((currentPage + 1) * pageSize, totalElements) }} trong tổng số {{ totalElements }} mục
        </div>
        <nav v-if="totalPages > 1">
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 0 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                <i class="fas fa-chevron-left"></i>
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
                <i class="fas fa-chevron-right"></i>
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
