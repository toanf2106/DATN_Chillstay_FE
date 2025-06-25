<template>
  <h4 class="page-title mb-3">Quản lý Homestay</h4>
  <div class="card">
    <!-- API Error Alert -->
    <div v-if="apiError" class="alert alert-warning mx-3 mt-3">
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>Lưu ý:</strong> {{ apiErrorMessage }}
      <button type="button" class="btn-close float-end" @click="apiError = false"></button>
    </div>

    <!-- Header -->
    <div class="card-header d-flex justify-content-between align-items-center">
      <div class="search-box">
        <input
          v-model="searchTerm"
          @input="handleSearch"
          type="text"
          class="form-control"
          placeholder="Tìm kiếm homestay..."
        >
      </div>
      <div class="d-flex align-items-center gap-3">
        <select
          v-model="selectedStatus"
          @change="handleStatusChange(selectedStatus)"
          class="form-select status-filter"
        >
          <option value="all">Tất cả homestay</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
        <button @click="openAddModal" class="btn btn-primary d-flex align-items-center">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Hình ảnh</th>
              <th>Tên Homestay</th>
              <th>Chủ sở hữu</th>
              <th>Diện tích</th>
              <th>Giá</th>
              <th>Địa chỉ</th>
              <th>Tình trạng</th>
              <th>Loại Phòng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(hs, index) in filteredHomestays" :key="hs.id">
              <td>{{ index + 1 }}</td>
              <td>
                <img
                  v-if="hs.hinhAnh"
                  :src="getImageUrl(hs.hinhAnh)"
                  :alt="hs.tenHomestay"
                  class="img-thumbnail"
                  style="width: 70px; height: 50px; object-fit: cover;"
                >
                <span v-else class="text-muted">Không có ảnh</span>
              </td>
              <td>{{ hs.tenHomestay }}</td>
              <td>
                <span :title="'ID: ' + hs.idChuHomeStay">
                  {{ getChuName(hs.idChuHomeStay) }}
                  <i v-if="getChuName(hs.idChuHomeStay) === 'Không xác định'" class="fas fa-exclamation-circle text-warning ms-1" title="Không tìm thấy thông tin chủ sở hữu"></i>
                </span>
              </td>
              <td>{{ hs.dienTich }} m²</td>
              <td>{{ formatCurrency(hs.giaCaHomestay) }}</td>
              <td>{{ hs.diaChi }}</td>
              <td>
                <span :class="['badge', hs.tinhTrang?.toLowerCase() === 'còn phòng' ? 'bg-success' : 'bg-warning']">
                  {{ hs.tinhTrang }}
                </span>
              </td>
              <td>
                <span :class="['badge', 'bg-info']" :title="'ID: ' + hs.idLoaiHomeStay">
                  {{ getLoaiName(hs.idLoaiHomeStay) }}
                  <i v-if="getLoaiName(hs.idLoaiHomeStay) === 'Không xác định'" class="fas fa-exclamation-circle text-warning ms-1" title="Không tìm thấy thông tin loại phòng"></i>
                </span>
              </td>
              <td>
                <span :class="['badge', hs.trangThai ? 'bg-success' : 'bg-danger']">
                  {{ hs.trangThai ? 'Hoạt động' : 'Khóa' }}
                </span>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-info" @click="editHomestay(hs)"><i class="fas fa-edit"></i></button>
                  <button class="btn btn-sm btn-danger" @click="deleteHomestay(hs.id)"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredHomestays.length === 0">
              <td colspan="11" class="text-center">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal component cho thêm/sửa -->
  <HomestayModal
    v-if="showModal"
    :homestay="selectedHomestay"
    :loaiList="loaiList"
    :chuList="chuList"
    :isEdit="isEdit"
    @close="closeModal"
    @save="saveHomestay"
  />
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getAllHomeStay, getLoaiHomeStay, getChuHomeStay, createHomestay, updateHomestay, deleteHomestayAPI } from '@/Service/HomeStayService';
import HomestayModal from '../components/HomestayModal.vue';
import { useToast } from '@/stores/notificationStore';

export default {
  name: 'QlyHomestay',
  components: {
    HomestayModal
  },
  setup() {
    const toast = useToast();
    const homestays = ref([]);
    const loaiList = ref([]);
    const chuList = ref([]);
    const searchTerm = ref('');
    const apiError = ref(false);
    const apiErrorMessage = ref('');
    const selectedStatus = ref('all');
    // State for modal
    const showModal = ref(false);
    const selectedHomestay = ref(null);
    const isEdit = ref(false);

    // API calls
    const fetchData = async () => {
      try {
        const [hsRes, loaiRes, chuRes] = await Promise.all([
          getAllHomeStay(),
          getLoaiHomeStay(),
          getChuHomeStay()
        ]);
        homestays.value = hsRes.data || [];
        loaiList.value = loaiRes.data || [];
        chuList.value = chuRes.data || [];
        apiError.value = false;

        // Debug và kiểm tra cấu trúc dữ liệu
        console.log('Đã tải danh sách loại:', loaiList.value);
        if (loaiList.value.length > 0) {
          console.log('Thuộc tính của loại đầu tiên:', Object.keys(loaiList.value[0]));
        } else {
          console.warn('Không có dữ liệu loại homestay');
        }

        console.log('Đã tải danh sách chủ homestay:', chuList.value);
        if (chuList.value.length > 0) {
          const firstChuItem = chuList.value[0];
          console.log('Thuộc tính của chủ đầu tiên:', Object.keys(firstChuItem));
          console.log('Chi tiết chủ đầu tiên:', JSON.stringify(firstChuItem, null, 2));
        } else {
          console.warn('Không có dữ liệu chủ homestay');
        }

        // Kiểm tra tên trường chính xác từ API
        if (chuList.value.length > 0) {
          const firstChuItem = chuList.value[0];
          const possibleFieldNames = [
            'hoTen', 'hotenChuHomestay', 'hotenChuHomeStay', 'hoTen_Chu_HomeStay'
          ];

          console.log('Kiểm tra tên trường chủ homestay:');
          possibleFieldNames.forEach(field => {
            console.log(`${field}: ${firstChuItem[field] !== undefined ? 'CÓ' : 'KHÔNG'}`);
          });
        }
      } catch (e) {
        console.error('Lỗi khi tải dữ liệu homestay:', e);
        apiError.value = true;

        // Kiểm tra lỗi cụ thể để hiển thị thông báo phù hợp
        if (e.response && e.response.status === 404) {
          apiErrorMessage.value = 'Không thể kết nối đến API chủ homestay. Vui lòng kiểm tra đường dẫn API hoặc khởi động lại server.';
        } else {
          apiErrorMessage.value = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
        }
      }
    };

    // Helpers
    const getLoaiName = (id) => {
      const loai = loaiList.value.find(l => l.id === id);
      return loai?.tenLoaiHomestay || 'Không xác định';
    };
    const getChuName = (id) => {
      const chu = chuList.value.find(c => c.id === id);
      // Dựa vào ChuHomeStay.java, trường đúng là 'hotenChuHomestay'
      // @Column(name = "HoTen_Chu_HomeStay")
      // private String hotenChuHomestay;
      if (!chu) return id + ' (Không xác định)';

      return chu.hotenChuHomestay || id + ' (Không xác định)';
    };
    const formatCurrency = (num) => new Intl.NumberFormat('vi-VN').format(num);
    const getImageUrl = (img) => img ? `/resources/images/homestay/${img}` : '';

    const filteredHomestays = computed(() => {
      let filtered = homestays.value;

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm.value) {
        const key = searchTerm.value.toLowerCase();
        filtered = filtered.filter(h =>
          h.tenHomestay?.toLowerCase().includes(key) ||
          h.diaChi?.toLowerCase().includes(key)
        );
      }

      // Lọc theo trạng thái
      if (selectedStatus.value !== 'all') {
        const isActive = selectedStatus.value === 'active';
        filtered = filtered.filter(h => h.trangThai === isActive);
      }

      return filtered;
    });

    const handleSearch = () => {};

    const handleStatusChange = (status) => {
      console.log('Trạng thái đã thay đổi thành:', status);
      selectedStatus.value = status;
    };

    // Modal functions
    const openAddModal = () => {
      console.log('Mở modal thêm mới homestay');
      isEdit.value = false;
      selectedHomestay.value = null;
      showModal.value = true;
    };

    const editHomestay = (homestay) => {
      console.log('Mở modal chỉnh sửa homestay:', homestay);
      isEdit.value = true;
      selectedHomestay.value = { ...homestay };
      showModal.value = true;
    };

    const closeModal = () => {
      console.log('Đóng modal');
      showModal.value = false;
      setTimeout(() => {
        selectedHomestay.value = null;
      }, 300); // Delay để hoàn tất animation
    };

    const saveHomestay = async (homestayData) => {
      try {
        console.log('Dữ liệu homestay gốc:', homestayData);

        if (isEdit.value) {
          await updateHomestay(homestayData.id, homestayData);
          toast.success('Cập nhật homestay thành công');
        } else {
          await createHomestay(homestayData);
          toast.success('Thêm homestay thành công');
        }
        closeModal();
        fetchData(); // Tải lại danh sách sau khi lưu
      } catch (error) {
        console.error('Lỗi khi lưu homestay:', error);
        if (error.response) {
          console.error('Response error:', error.response.status, error.response.data);
        }
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu homestay';
        toast.error(errorMessage);
      }
    };

    const deleteHomestay = async (id) => {
      if (confirm('Bạn có chắc chắn muốn xóa homestay này?')) {
        try {
          await deleteHomestayAPI(id);
          toast.success('Xóa homestay thành công');
          fetchData();
        } catch (error) {
          toast.error('Lỗi khi xóa homestay');
          console.error('Error deleting homestay:', error);
        }
      }
    };

    onMounted(fetchData);

    return {
      searchTerm,
      filteredHomestays,
      getLoaiName,
      getChuName,
      formatCurrency,
      getImageUrl,
      handleSearch,
      apiError,
      apiErrorMessage,
      selectedStatus,
      handleStatusChange,
      // Modal state và functions
      showModal,
      selectedHomestay,
      isEdit,
      openAddModal,
      editHomestay,
      closeModal,
      saveHomestay,
      deleteHomestay,
      // Các danh sách để truyền xuống modal
      loaiList,
      chuList
    };
  }
};
</script>

<style scoped>
@import '@/Styles/CSS/Homestay.css';

.search-box {
  min-width: 250px;
}

.status-filter {
  min-width: 150px;
}

.badge {
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-weight: 500;
}
</style>
