<template>
  <div class="phong-container">
    <h1 class="page-title">Quản Lý Phòng</h1>

    <div class="controls-container">
      <div class="search-box">
        <div class="search-control-group">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Tìm kiếm phòng..."
              class="search-input"
              @input="handleSearch"
            />
            <button v-if="searchTerm" @click="clearSearch" class="clear-search-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="right-controls">
        <select
          class="form-select status-filter"
          v-model="selectedStatus"
          @change="handleStatusChange(selectedStatus)"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
        <button
          class="btn btn-info loai-phong-btn"
          title="Quản lý loại phòng"
          @click="goToLoaiPhong"
        >
          <i class="fas fa-tags"></i>
        </button>
        <button
          class="btn btn-warning vattu-phong-btn"
          title="Quản lý vật tư phòng"
          @click="goToVatTuPhong"
        >
          <i class="fas fa-box"></i>
        </button>
        <button class="btn btn-primary add-button" @click="openAddModal">
          <font-awesome-icon icon="fa-solid fa-door-open" />
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

    <!-- Phòng Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
          <tr>
            <th>STT</th>
            <th>Homestay</th>
            <th>Tên Phòng</th>
            <th>Loại Phòng</th>
            <th>Diện Tích</th>
            <th>Tầng</th>
            <th>Số Người Lớn</th>
            <th>Số Trẻ Nhỏ</th>
            <th>Số Người Tối Đa</th>
            <th>Trạng thái</th>
            <th>Ảnh Bìa</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(phong, index) in filteredPhongs"
            :key="phong.id"
            @dblclick="viewPhongDetails(phong)"
          >
            <td class="text-center">{{ calculateIndex(index) }}</td>
            <td class="text-center">{{ getHomestayName(phong.homeStayId) }}</td>
            <td class="text-center">{{ phong.tenPhong }}</td>
            <td class="text-center">{{ getLoaiPhongName(phong.loaiPhongId) }}</td>
            <td class="text-center">{{ phong.dienTich }} m²</td>
            <td class="text-center">{{ phong.tangSo }}</td>
            <td class="text-center">{{ phong.soNguoiLon }}</td>
            <td class="text-center">{{ phong.soNguoiNho }}</td>
            <td class="text-center">{{ phong.soNguoiToiDa }}</td>
            <td class="text-center">
              <span :class="`badge ${phong.trangThai ? 'bg-success' : 'bg-danger'}`">
                {{ phong.trangThai ? 'Hoạt động' : 'Khóa' }}
              </span>
            </td>
            <td class="text-center">
              <div class="image-wrapper">
                <img
                  v-if="phong.anhBia"
                  :src="getImageUrl(phong.anhBia)"
                  :alt="phong.tenPhong"
                  class="phong-image"
                />
                <div v-else class="no-image-placeholder">
                  <i class="fas fa-door-open"></i>
                  <span>Không có ảnh</span>
                </div>
              </div>
            </td>
            <td class="text-center">
              <div class="action-buttons">
                <button
                  class="btn btn-icon btn-info-light"
                  title="Quản lý ảnh"
                  @click="openAnhModal(phong)"
                >
                  <i class="fas fa-images"></i>
                </button>
                <button
                  v-if="phong.trangThai"
                  class="btn btn-icon btn-warning-light"
                  title="Chỉnh sửa"
                  @click="editPhong(phong)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  v-if="phong.trangThai"
                  class="btn btn-icon btn-danger-light"
                  title="Vô hiệu hóa"
                  @click="confirmDelete(phong)"
                >
                  <i class="fas fa-trash"></i>
                </button>
                <button
                  v-if="!phong.trangThai"
                  class="btn btn-icon btn-success-light"
                  title="Khôi phục"
                  @click="confirmRestore(phong)"
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
    <div v-if="!loading && filteredPhongs.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p v-if="searchTerm">Không tìm thấy phòng nào phù hợp với từ khóa "{{ searchTerm }}".</p>
      <p v-else>Không tìm thấy phòng nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && filteredPhongs.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} phòng
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

  <!-- Modal component cho thêm/sửa/xem chi tiết -->
  <PhongModal
    v-if="showModal"
    :phong="selectedPhong"
    :loaiPhongList="loaiPhongList"
    :homestayList="homestayList"
    :isEdit="isEdit"
    :isViewMode="isViewMode"
    @close="closeModal"
    @save="savePhong"
    @edit="editFromViewMode"
    @view-images="openAnhModalFromDetails"
  />

  <!-- Modal component cho quản lý ảnh phòng -->
  <AnhPhongModal
    v-if="showAnhModal"
    :phong="selectedPhongForAnh"
    :viewOnly="viewOnlyAnh"
    @close="closeAnhModal"
  />

  <!-- Thêm modal xác nhận xóa -->
  <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
    <div class="confirmation-box">
      <button class="close-button" @click="cancelDelete">
        <i class="fas fa-times"></i>
      </button>
      <div class="confirm-icon-wrapper icon-danger">
        <i class="fas fa-trash-alt"></i>
      </div>
      <h3 class="confirm-title">Xác nhận vô hiệu hóa</h3>
      <p class="confirm-message">
        Bạn có chắc chắn muốn vô hiệu hóa phòng
        <strong>{{ selectedPhongForDelete?.tenPhong || 'này' }}</strong>?
      </p>
      <div class="confirm-actions">
        <button class="btn-cancel" @click="cancelDelete">
          <i class="fas fa-times"></i>
          <span>Hủy bỏ</span>
        </button>
        <button class="btn-confirm btn-danger" @click="executeDelete" :disabled="deleting">
          <span v-if="deleting" class="spinner"></span>
          <span v-else>
            <i class="fas fa-trash-alt"></i>
            <span>Xác nhận vô hiệu hóa</span>
          </span>
        </button>
      </div>
    </div>
  </div>

  <!-- Thêm modal xác nhận khôi phục -->
  <div v-if="showRestoreConfirm" class="modal-overlay" @click.self="cancelRestore">
    <div class="confirmation-box">
      <button class="close-button" @click="cancelRestore">
        <i class="fas fa-times"></i>
      </button>
      <div class="confirm-icon-wrapper icon-success">
        <i class="fas fa-reply"></i>
      </div>
      <h3 class="confirm-title">Xác nhận khôi phục</h3>
      <p class="confirm-message">
        Bạn có chắc chắn muốn khôi phục phòng
        <strong>{{ selectedPhongForDelete?.tenPhong || 'này' }}</strong>?
      </p>
      <div class="confirm-actions">
        <button class="btn-cancel" @click="cancelRestore">
          <i class="fas fa-times"></i>
          <span>Hủy bỏ</span>
        </button>
        <button class="btn-confirm btn-success" @click="executeRestore" :disabled="restoring">
          <span v-if="restoring" class="spinner"></span>
          <span v-else>
            <i class="fas fa-reply"></i>
            <span>Xác nhận khôi phục</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import {
  getAllPhong,
  getLoaiPhongList,
  getHomestayList,
  createPhong,
  updatePhong,
  deletePhong as deletePhongAPI,
  searchPhongByKeyword,
  deletePhong,
  restorePhong
} from '@/Service/phongService'
import PhongModal from '../components/PhongModal.vue'
import { useToast } from '@/stores/notificationStore'
import AnhPhongModal from '../components/AnhPhongModal.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'QlyPhong',
  components: {
    PhongModal,
    AnhPhongModal,
  },
  setup() {
    const router = useRouter()
    const toast = useToast()
    const phongs = ref([])
    const loaiPhongList = ref([])
    const homestayList = ref([])
    const searchTerm = ref('')
    const apiError = ref(false)
    const apiErrorMessage = ref('')
    const selectedStatus = ref('all')
    const loading = ref(false)
    const searchTimeout = ref(null)

    // Pagination
    const currentPage = ref(1)
    const pageSize = ref(10)

    // State for modal
    const showModal = ref(false)
    const selectedPhong = ref(null)
    const isEdit = ref(false)
    const isViewMode = ref(false)

    // State for AnhPhongModal
    const showAnhModal = ref(false)
    const selectedPhongForAnh = ref(null)
    const viewOnlyAnh = ref(false)

    // Biến và hàm xử lý xác nhận xóa
    const deleting = ref(false)
    const restoring = ref(false)
    const showDeleteConfirm = ref(false)
    const showRestoreConfirm = ref(false)
    const selectedPhongForDelete = ref(null)

    const goToLoaiPhong = () => {
      router.push({ name: 'admin-qly-loai-phong' })
    }

    const goToVatTuPhong = () => {
      router.push({ name: 'admin-vattu-phong' })
    }

    // API calls
    const fetchData = async () => {
      try {
        loading.value = true
        const [phongRes, loaiRes, homestayRes] = await Promise.all([
          getAllPhong(),
          getLoaiPhongList(),
          getHomestayList(),
        ])
        // Đảm bảo phongs luôn là một mảng và chuyển đổi tên trường nếu cần
        phongs.value = Array.isArray(phongRes.data)
          ? phongRes.data.map(normalizePhongData)
          : []
        loaiPhongList.value = Array.isArray(loaiRes.data) ? loaiRes.data : []
        homestayList.value = Array.isArray(homestayRes.data) ? homestayRes.data : []
        apiError.value = false
      } catch (e) {
        apiError.value = true
        // Chỉ log lỗi quan trọng
        if (e.response && e.response.status) {
          console.error(`Lỗi API: ${e.response.status} - ${e.response.statusText || ''}`)
        }

        // Đảm bảo phongs vẫn là mảng ngay cả khi có lỗi
        phongs.value = []

        // Kiểm tra lỗi cụ thể để hiển thị thông báo phù hợp
        if (e.response && e.response.status === 404) {
          apiErrorMessage.value =
            'Không thể kết nối đến API phòng. Vui lòng kiểm tra đường dẫn API hoặc khởi động lại server.'
        } else {
          apiErrorMessage.value = 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
        }
      } finally {
        loading.value = false
      }
    }

    // Hàm chuẩn hóa dữ liệu phòng để đảm bảo tên trường chính xác
    const normalizePhongData = (phong) => {
      const result = { ...phong }

      // Chuyển đổi các trường từ backend nếu cần
      if (phong.idHomeStay !== undefined && phong.homeStayId === undefined) {
        result.homeStayId = phong.idHomeStay
      }

      if (phong.idLoaiPhong !== undefined && phong.loaiPhongId === undefined) {
        result.loaiPhongId = phong.idLoaiPhong
      }

      if (phong.tang !== undefined && phong.tangSo === undefined) {
        result.tangSo = phong.tang
      }

      if (phong.soTreNho !== undefined && phong.soNguoiNho === undefined) {
        result.soNguoiNho = phong.soTreNho
      }

      return result
    }

    // Helpers
    const getLoaiPhongName = (id) => {
      const loai = loaiPhongList.value.find((l) => l.id === id)
      return loai?.tenLoaiPhong || 'Không xác định'
    }

    const getHomestayName = (id) => {
      const homestay = homestayList.value.find((h) => h.id === id)
      if (!homestay) return 'Không xác định'
      return homestay.tenHomestay || 'Không xác định'
    }

    const getImageUrl = (img) => {
      // Nếu không có ảnh
      if (!img) return '/images/placeholder-room.jpg'

      // Nếu là URL GCS hoặc URL đầy đủ
      if (img.startsWith('http')) return img

      return img
    }

    // Computed property for filtered phongs
    const filteredPhongs = computed(() => {
      // Đảm bảo phongs.value luôn là một mảng
      if (!Array.isArray(phongs.value)) {
        return []
      }

      let filtered = [...phongs.value];

      // Chỉ lọc theo trạng thái active/inactive ở phía client
      if (selectedStatus.value !== 'all') {
        const isActive = selectedStatus.value === 'active';
        filtered = filtered.filter((p) => p.trangThai === isActive);
      }

      // Đảm bảo filtered là một mảng trước khi dùng slice
      if (!Array.isArray(filtered)) {
        return []
      }

      // Phân trang
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;

      return filtered.slice(start, end);
    });

    // Tính toán số trang và các thông tin phân trang
    const totalItems = computed(() => {
      // Đảm bảo phongs.value luôn là một mảng
      if (!Array.isArray(phongs.value)) {
        return 0;
      }

      let filtered = [...phongs.value];
      if (selectedStatus.value !== 'all') {
        const isActive = selectedStatus.value === 'active';
        filtered = filtered.filter((p) => p.trangThai === isActive);
      }
      return filtered.length;
    });

    const totalPages = computed(() => {
      if (totalItems.value === 0) {
        return 1;
      }
      return Math.ceil(totalItems.value / pageSize.value) || 1;
    });

    const startItem = computed(() => {
      if (totalItems.value === 0) {
        return 0;
      }
      return (currentPage.value - 1) * pageSize.value + 1;
    });

    const endItem = computed(() => {
      if (totalItems.value === 0) {
        return 0;
      }
      const end = currentPage.value * pageSize.value;
      return end > totalItems.value ? totalItems.value : end;
    });

    // Display a reasonable number of page buttons
    const displayedPages = computed(() => {
      const maxDisplayed = 5;
      const pages = [];

      if (totalPages.value <= maxDisplayed) {
        // If we have 5 or fewer pages, show all
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i);
        }
      } else {
        // We have more than maxDisplayed pages, need to decide which to show
        if (currentPage.value <= 3) {
          // Near the start
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
        } else if (currentPage.value >= totalPages.value - 2) {
          // Near the end
          for (let i = totalPages.value - 4; i <= totalPages.value; i++) {
            pages.push(i);
          }
        } else {
          // Somewhere in the middle
          for (let i = currentPage.value - 2; i <= currentPage.value + 2; i++) {
            pages.push(i);
          }
        }
      }

      return pages;
    });

    const emptyRows = computed(() => {
      const rowsCount = filteredPhongs.value.length;
      return rowsCount < pageSize.value ? pageSize.value - rowsCount : 0;
    });

    // Tính số thứ tự cho hàng
    const calculateIndex = (index) => {
      return (currentPage.value - 1) * pageSize.value + index + 1;
    };

    // Update page when data changes
    watch([phongs, selectedStatus], () => {
      // Reset to page 1 when filters change
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = 1;
      }
    });

    // Xử lý tìm kiếm từ khóa tổng hợp với debounce
    const handleSearch = () => {
      // Xóa timeout cũ nếu có
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }

      // Thiết lập timeout mới (500ms)
      searchTimeout.value = setTimeout(async () => {
        try {
          loading.value = true;
          currentPage.value = 1;

          if (!searchTerm.value || searchTerm.value.trim() === '') {
            await fetchData(); // Nếu không có từ khóa, tải lại toàn bộ dữ liệu
            return;
          }

          // Gọi API tìm kiếm theo từ khóa
          const response = await searchPhongByKeyword(searchTerm.value);

          if (response && response.data) {
            // Kiểm tra dữ liệu trả về từ API
            if (response.data.data && Array.isArray(response.data.data)) {
              // Nếu API trả về cấu trúc { data: [...] }
              phongs.value = response.data.data.map(normalizePhongData);
            } else if (Array.isArray(response.data)) {
              // Nếu API trả về mảng trực tiếp
              phongs.value = response.data.map(normalizePhongData);
            } else {
              // Nếu không đúng định dạng mong đợi
              phongs.value = [];
              apiError.value = true;
              apiErrorMessage.value = 'Định dạng dữ liệu trả về không hợp lệ';
            }
          } else {
            phongs.value = [];
          }
        } catch (err) {
          apiError.value = true;
          apiErrorMessage.value = 'Lỗi khi gọi API tìm kiếm.';
          phongs.value = []; // Đảm bảo là mảng khi có lỗi

          // Chỉ log lỗi kết nối API quan trọng
          if (err.response && err.response.status) {
            console.error(`Lỗi API tìm kiếm: ${err.response.status} - ${err.response.statusText || ''}`)
          }
        } finally {
          loading.value = false;
        }
      }, 500); // Trì hoãn 500ms
    };

    const clearSearch = () => {
      searchTerm.value = '';
      fetchData(); // Tải lại toàn bộ dữ liệu
    }

    const handleStatusChange = (status) => {
      selectedStatus.value = status;
      currentPage.value = 1;
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    }

    // Modal functions
    const openAddModal = () => {
      isEdit.value = false
      isViewMode.value = false
      selectedPhong.value = null
      showModal.value = true
    }

    const editPhong = (phong) => {
      isEdit.value = true
      isViewMode.value = false
      selectedPhong.value = { ...phong }
      showModal.value = true
    }

    // View phong details
    const viewPhongDetails = (phong) => {
      isEdit.value = false
      isViewMode.value = true
      selectedPhong.value = { ...phong }
      showModal.value = true
    }

    // Handle edit from view mode
    const editFromViewMode = () => {
      isViewMode.value = false
      isEdit.value = true
    }

    const closeModal = () => {
      showModal.value = false
      setTimeout(() => {
        selectedPhong.value = null
        isEdit.value = false
        isViewMode.value = false
      }, 300) // Delay để hoàn tất animation
    }

    const savePhong = async (formData) => {
      try {
        // Kiểm tra xem formData có phải là FormData object không
        if (formData instanceof FormData) {
          // Lấy phong JSON từ FormData
          const phongJsonStr = formData.get('phong')
          if (phongJsonStr) {
            // Không cần sử dụng biến phongData ở đây
            if (isEdit.value && selectedPhong.value && selectedPhong.value.id) {
              const phongId = parseInt(selectedPhong.value.id, 10)
              await updatePhong(phongId, formData)
            } else {
              await createPhong(formData)
            }
          } else {
            throw new Error('Dữ liệu phòng không hợp lệ')
          }
        } else {
          // Xử lý trường hợp dữ liệu không phải FormData (trường hợp cũ)
          if (isEdit.value && formData.id) {
            const phongId = parseInt(formData.id, 10)
            await updatePhong(phongId, formData)
          } else {
            await createPhong(formData)
          }
        }

        closeModal()
        fetchData() // Tải lại danh sách sau khi lưu
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu phòng'
        toast.error(errorMessage)
      }
    }

    const deletePhong = async (id) => {
      if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
        try {
          await deletePhongAPI(id)
          fetchData()
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          toast.error('Lỗi khi xóa phòng')
        }
      }
    }

    // Quản lý modal ảnh chi tiết
    const openAnhModal = (phong) => {
      console.log('Mở modal ảnh cho phòng:', phong)
      selectedPhongForAnh.value = phong
      viewOnlyAnh.value = false // Khi quản lý là có thể chỉnh sửa
      showAnhModal.value = true
    }

    const openAnhModalFromDetails = (phongId) => {
      console.log('openAnhModalFromDetails được gọi với ID phòng:', phongId)
      const phongData = phongs.value.find((p) => p.id === phongId)
      if (phongData) {
        selectedPhongForAnh.value = phongData
        viewOnlyAnh.value = true // Khi xem từ chi tiết là chỉ xem
        showAnhModal.value = true
      } else {
        console.error('Lỗi: Không tìm thấy dữ liệu phòng với ID:', phongId)
        toast.error('Không thể mở ảnh: Dữ liệu phòng không tìm thấy.')
      }
    }

    const closeAnhModal = () => {
      showAnhModal.value = false
      setTimeout(() => {
        selectedPhongForAnh.value = null
        viewOnlyAnh.value = false
      }, 300)
    }

    // Thêm các hàm xác nhận xóa
    const confirmDelete = (phong) => {
      selectedPhongForDelete.value = { ...phong }
      showDeleteConfirm.value = true
    }

    const cancelDelete = () => {
      showDeleteConfirm.value = false
      selectedPhongForDelete.value = null
      deleting.value = false
    }

    const executeDelete = async () => {
      try {
        deleting.value = true
        await deletePhong(selectedPhongForDelete.value.id)
        toast.success('Đã vô hiệu hóa phòng thành công')
        fetchData()
        showDeleteConfirm.value = false
      } catch (error) {
        console.error('Lỗi khi vô hiệu hóa phòng:', error)
        toast.error('Có lỗi xảy ra khi vô hiệu hóa phòng')
      } finally {
        deleting.value = false
      }
    }

    // Thêm các hàm xác nhận khôi phục
    const confirmRestore = (phong) => {
      selectedPhongForDelete.value = { ...phong }
      showRestoreConfirm.value = true
    }

    const cancelRestore = () => {
      showRestoreConfirm.value = false
      selectedPhongForDelete.value = null
      restoring.value = false
    }

    const executeRestore = async () => {
      try {
        restoring.value = true
        await restorePhong(selectedPhongForDelete.value.id)
        toast.success('Đã khôi phục phòng thành công')
        fetchData()
        showRestoreConfirm.value = false
      } catch (error) {
        console.error('Lỗi khi khôi phục phòng:', error)
        toast.error('Có lỗi xảy ra khi khôi phục phòng')
      } finally {
        restoring.value = false
      }
    }

    onMounted(() => {
      fetchData();
    });

    return {
      searchTerm,
      filteredPhongs,
      getLoaiPhongName,
      getHomestayName,
      getImageUrl,
      handleSearch,
      clearSearch,
      apiError,
      apiErrorMessage,
      selectedStatus,
      handleStatusChange,
      loading,
      // Pagination
      currentPage,
      pageSize,
      totalPages,
      totalItems,
      startItem,
      endItem,
      emptyRows,
      changePage,
      displayedPages,
      // Modal state và functions
      showModal,
      selectedPhong,
      isEdit,
      isViewMode,
      openAddModal,
      editPhong,
      viewPhongDetails,
      editFromViewMode,
      closeModal,
      savePhong,
      deletePhong,
      // Các danh sách để truyền xuống modal
      loaiPhongList,
      homestayList,
      openAnhModal,
      openAnhModalFromDetails,
      calculateIndex,
      // State và functions cho AnhPhongModal
      showAnhModal,
      selectedPhongForAnh,
      viewOnlyAnh,
      closeAnhModal,
      goToLoaiPhong,
      goToVatTuPhong,
      // Biến và hàm xử lý xác nhận xóa
      showDeleteConfirm,
      deleting,
      confirmDelete,
      cancelDelete,
      executeDelete,
      selectedPhongForDelete,
      // Biến và hàm xử lý xác nhận khôi phục
      showRestoreConfirm,
      restoring,
      confirmRestore,
      cancelRestore,
      executeRestore,
    }
  },
}
</script>

<style scoped>
/* GENERAL CONTAINER & TITLE */
.phong-container {
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

/* CONTROLS BAR */
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

.clear-search-btn {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.25s ease;
}

.clear-search-btn:hover {
  background-color: #e9ecef;
  color: #212529;
}

/* RIGHT SIDE: FILTERS & ADD BUTTON */
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

.add-button, .loai-phong-btn, .vattu-phong-btn {
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  font-weight: 600;
  padding: 0 20px;
  gap: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
  border: none;
}

.add-button {
  background: linear-gradient(135deg, #0d6efd, #0099ff);
}

.add-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
  background: linear-gradient(135deg, #0a58ca, #0077cc);
}

.loai-phong-btn {
  background: linear-gradient(135deg, #0dcaf0, #0aa2c0);
}

.loai-phong-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(13, 202, 240, 0.4);
  background: linear-gradient(135deg, #0aa2c0, #0892ac);
}

.vattu-phong-btn {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

.vattu-phong-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(255, 193, 7, 0.4);
  background: linear-gradient(135deg, #e0a800, #e76b00);
}

.loai-phong-btn, .vattu-phong-btn {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 21px;
  font-weight: 600;
  padding: 0 20px;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
}

.loai-phong-btn:hover, .vattu-phong-btn:hover {
  transform: translateY(-2px);
}

/* TABLE STYLES */
.table-responsive {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 20px;
}

.table {
  margin-bottom: 0;
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

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

/* Image styling */
.image-wrapper {
  position: relative;
  width: 70px;
  height: 50px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 5px;
}

.phong-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  color: #6c757d;
}

.no-image-placeholder i {
  font-size: 1.2rem;
  margin-bottom: 2px;
}

.no-image-placeholder span {
  font-size: 0.7rem;
}

/* Badge styling */
.badge {
  padding: 6px 10px;
  font-weight: 500;
  font-size: 0.8rem;
}

/* Action buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
}

.btn-warning-light {
  background-color: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  border: none;
}

.btn-warning-light:hover {
  background-color: rgba(255, 193, 7, 0.3);
  color: #e0a800;
}

.btn-danger-light {
  background-color: rgba(220, 53, 69, 0.15);
  color: #dc3545;
  border: none;
}

.btn-danger-light:hover {
  background-color: rgba(220, 53, 69, 0.3);
  color: #bd2130;
}

.btn-info-light {
  background-color: rgba(13, 202, 240, 0.15);
  color: #0dcaf0;
  border: none;
}

.btn-info-light:hover {
  background-color: rgba(13, 202, 240, 0.3);
  color: #0aa2c0;
}

/* Loading indicator */
.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

/* Empty state */
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

.empty-state p {
  color: #6c757d;
  font-size: 1.1rem;
}

/* Pagination */
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

/* Empty rows */
.empty-row td {
  padding: 10px !important;
  border-bottom: none !important;
}

/* Alert styling */
.alert {
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* Ensure it's above other content */
}

.confirmation-box {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  padding: 30px;
  text-align: center;
  position: relative;
  width: 90%;
  max-width: 400px;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-button:hover {
  color: #343a40;
}

.confirm-icon-wrapper {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #dc3545; /* Red for delete/restore */
}

.icon-success {
  color: #28a745; /* Green for restore */
}

.confirm-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 15px;
}

.confirm-message {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 25px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  justify-content: space-around;
  gap: 15px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-cancel {
  background-color: #e9ecef;
  color: #495057;
}

.btn-cancel:hover {
  background-color: #dee2e6;
  color: #343a40;
}

.btn-confirm {
  background: linear-gradient(135deg, #0d6efd, #0099ff);
  color: #fff;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
  background: linear-gradient(135deg, #0a58ca, #0077cc);
}

.btn-danger {
  background: linear-gradient(135deg, #dc3545, #c82333);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #c82333, #bd2130);
}

.btn-success {
  background: linear-gradient(135deg, #28a745, #218838);
}

.btn-success:hover {
  background: linear-gradient(135deg, #218838, #1e7e34);
}

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
