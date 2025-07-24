<template>
  <div class="loai-phong-container">
    <h1 class="page-title">Quản Lý Vật Tư Phòng</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Tìm kiếm vật tư phòng..."
              class="search-input"
            />
          </div>
        </div>
      </div>

      <div class="right-controls">
        <select class="form-select status-filter" v-model="selectedStatus">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Phòng</th>
            <th>Tên Vật Tư</th>
            <th>Số Lượng</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedItems" :key="`${item.phong?.id}-${item.vatTu?.id}`">
            <td class="text-center">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>{{ item.phong?.tenPhong }}</td>
            <td>{{ item.vatTu?.tenVatTu }}</td>
            <td class="text-center">{{ item.soLuong }} {{ item.vatTu?.donVi }}</td>
            <td class="text-center">
              <span :class="`badge ${item.trangThai ? 'bg-success' : 'bg-danger'}`">
                {{ item.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
              </span>
            </td>
          </tr>
          <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
            <td colspan="5">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && filteredItems.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p>Không tìm thấy vật tư phòng nào.</p>
    </div>

    <div class="pagination-container" v-if="!loading && filteredItems.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} vật tư phòng
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li
            v-for="page in displayedPages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages || totalPages === 0 }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { getAllVatTuPhong } from '@/Service/vatTuPhongService';
import { useToast } from '@/stores/notificationStore';
import api from '@/utils/api';

export default {
  name: 'QlyVatTuPhong',
  setup() {
    const vatTuPhongList = ref([]);
    const phongList = ref([]);
    const vatTuList = ref([]);
    const toast = useToast();
    const searchTerm = ref('');
    const selectedStatus = ref('all');
    const loading = ref(false);

    const currentPage = ref(1); // 1-based indexing
    const pageSize = ref(10);

    const fetchData = async () => {
      loading.value = true;
      try {
        const res = await getAllVatTuPhong();
        vatTuPhongList.value = res.data || [];

        const phongRes = await api.get('/api/phong');
        phongList.value = phongRes.data;

        const vatTuRes = await api.get('/api/vattu/all');
        vatTuList.value = vatTuRes.data.filter(vt => vt.trangThai);
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu vật tư phòng');
        console.error(error);
      } finally {
        loading.value = false;
      }
    };

    const filteredItems = computed(() => {
      let filtered = vatTuPhongList.value;

      if (searchTerm.value) {
        const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            (item.phong?.tenPhong?.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (item.vatTu?.tenVatTu?.toLowerCase().includes(lowerCaseSearchTerm)) ||
            String(item.soLuong).includes(searchTerm.value)
        );
      }

      if (selectedStatus.value !== 'all') {
        const isActive = selectedStatus.value === 'active';
        filtered = filtered.filter((item) => item.trangThai === isActive);
      }

      return filtered;
    });

    watch(filteredItems, () => {
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value || 1;
      }
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredItems.value.length / pageSize.value) || 1;
    });

    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filteredItems.value.slice(start, end);
    });

    const emptyRows = computed(() => {
      const remainingRows = pageSize.value - paginatedItems.value.length;
      return remainingRows > 0 ? remainingRows : 0;
    });

    const totalItems = computed(() => filteredItems.value.length);

    const startItem = computed(() => {
      if (totalItems.value === 0) return 0;
      return (currentPage.value - 1) * pageSize.value + 1;
    });

    const endItem = computed(() => {
      const end = currentPage.value * pageSize.value;
      return Math.min(end, totalItems.value);
    });

    const displayedPages = computed(() => {
      const maxDisplayed = 5;
      const pages = [];
      if (totalPages.value <= maxDisplayed) {
        for (let i = 1; i <= totalPages.value; i++) pages.push(i);
      } else {
        if (currentPage.value <= 3) {
          pages.push(1, 2, 3, 4, 5);
        } else if (currentPage.value >= totalPages.value - 2) {
          for (let i = totalPages.value - 4; i <= totalPages.value; i++) pages.push(i);
        } else {
          for (let i = currentPage.value - 2; i <= currentPage.value + 2; i++) pages.push(i);
        }
      }
      return pages;
    });

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    onMounted(fetchData);

    return {
      vatTuPhongList,
      phongList,
      vatTuList,
      searchTerm,
      selectedStatus,
      loading,
      currentPage,
      pageSize,
      totalPages,
      filteredItems,
      paginatedItems,
      emptyRows,
      totalItems,
      startItem,
      endItem,
      displayedPages,
      changePage
    };
  }
};
</script>

<style scoped>
.loai-phong-container {
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 25px;
  color: #343a40;
  background: linear-gradient(135deg, #0d6efd 20%, #20c997 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #ffffff;
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

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
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 16px;
  transition: color 0.25s ease;
}

.search-input-wrapper:hover .search-icon {
  color: #495057;
}

.search-input:focus ~ .search-icon {
  color: #0d6efd;
}

.search-input {
  width: 100%;
  border: 2px solid #dee2e6;
  padding: 14px 18px 14px 48px;
  border-radius: 50px;
  outline: none;
  transition: all 0.25s ease;
  font-size: 1rem;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  color: #495057;
  font-weight: 500;
}

.search-input:hover {
  border-color: #adb5bd;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.search-input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25);
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-filter {
  min-width: 180px;
  border-radius: 50px;
  padding: 14px 18px;
  border: 2px solid #dee2e6;
  background-color: #ffffff;
  font-size: 0.95rem;
  color: #495057;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236c757d' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 18px center;
  padding-right: 42px;
}

.status-filter:hover {
  border-color: #adb5bd;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.status-filter:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25);
  outline: none;
}

.table-responsive {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 20px;
}

.table thead th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding: 15px 10px;
  text-align: center;
  font-size: 0.95rem;
}

.table tbody td {
  padding: 15px 10px;
  vertical-align: middle;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.95rem;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.empty-state {
  text-align: center;
  padding: 50px 0;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 15px;
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
.empty-row td {
    padding: 24.5px !important;
    border-bottom: none !important;
}
</style>
