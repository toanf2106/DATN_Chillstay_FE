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
              <th>STT</th>
              <th>Mã giảm giá</th>
              <th>Tên</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Số lượng</th>
              <th>Homestay</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(voucher, index) in filteredVouchers" :key="voucher.id">
              <td>{{ index + 1 }}</td>
              <td>{{ voucher.maGiamGia }}</td>
              <td>{{ voucher.tenGiamGia }}</td>
              <td>{{ formatLoaiGiamGia(voucher.loaiGiamGia) }}</td>
              <td>{{ formatGiaTri(voucher.giaTri, voucher.loaiGiamGia) }}</td>
              <td>{{ formatDate(voucher.ngayBatDau) }}</td>
              <td>{{ formatDate(voucher.ngayKetThuc) }}</td>
              <td>{{ voucher.soLuong }}</td>
              <td>{{ getHomeStayName(voucher.homeStayId) }}</td>
              <td>
                <span :class="['badge', isVoucherValid(voucher) ? 'badge-success' : 'badge-danger']">
                  {{ isVoucherValid(voucher) ? 'Còn hạn' : 'Hết hạn' }}
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
  <div v-if="showModal" class="modal-container">
    <VoucherModal
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
import { onMounted, ref } from 'vue';
import { getAllHomeStay } from '@/Service/HomeStayService.js';

export default {
  name: 'QlyVoucher',
  components: {
    VoucherModal
  },
  setup() {
    const voucherManagement = useVoucherManagement();
    const homeStayList = ref([]);
    const getHomeStayName = (id) => {
      const hs = homeStayList.value.find(h => h.id === id);
      return hs ? (hs.tenHomestay || hs.tenHomeStay) : '';
    };

    // Kiểm tra voucher còn hạn hay không
    const isVoucherValid = (voucher) => {
      const currentDate = new Date();
      const endDate = new Date(voucher.ngayKetThuc);
      return endDate >= currentDate && voucher.trangThai !== false;
    };

    onMounted(async () => {
      try {
        const res = await getAllHomeStay();
        homeStayList.value = res.data;
      } catch {
        homeStayList.value = [];
      }
      voucherManagement.loadVouchers();
    });

    return {
      ...voucherManagement,
      homeStayList,
      getHomeStayName,
      isVoucherValid
    };
  }
};
</script>

<style scoped>
@import '@/Styles/CSS/Voucher.css';

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.badge {
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
}

.btn-info {
  color: white;
  background-color: #17a2b8;
  border-color: #17a2b8;
}

.btn-info:hover {
  background-color: #138496;
  border-color: #117a8b;
}

.search-box {
  min-width: 250px;
}

.status-filter {
  min-width: 150px;
}
</style>
