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
              placeholder="Tìm kiếm theo tên hoặc mã phòng..."
              class="search-input"
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
        <button class="btn btn-info loai-phong-btn" @click="navigateToLoaiPhong" title="Quản lý loại phòng">
          <i class="fas fa-tags"></i>
        </button>
        <button class="btn btn-primary add-button" @click="openAddModal">
          <i class="fas fa-door-open"></i>
        </button>
      </div>
    </div>

    <!-- API Error Alert -->
    <div v-if="apiError" class="alert alert-warning">
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>Lưu ý:</strong> {{ apiErrorMessage }}
      <button type="button" class="btn-close float-end" @click="apiError = false"></button>
    </div>

    <!-- Master Data Error Alert -->
    <div v-if="masterDataError" class="alert alert-danger">
      <i class="fas fa-exclamation-circle me-2"></i>
      <strong>Lỗi:</strong> Không thể tải danh sách loại phòng hoặc homestay
      <button type="button" class="btn btn-sm btn-outline-danger ms-3" @click="fetchMasterData">
        <i class="fas fa-sync-alt me-1"></i> Thử lại
      </button>
      <button type="button" class="btn-close float-end" @click="masterDataError = false"></button>
    </div>

    <!-- Search indicator -->
    <div v-if="searchTerm && !loading" class="search-results-info">
      <i class="fas fa-info-circle me-2"></i>
      Kết quả tìm kiếm cho "{{ searchTerm }}": <strong>{{ totalItems }}</strong> phòng
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-2">{{ searchTerm ? 'Đang tìm kiếm...' : 'Đang tải dữ liệu...' }}</p>
    </div>

    <!-- Phòng Table -->
    <div class="table-responsive" v-if="!loading">
      <table class="table table-hover table-bordered table-sm">
        <thead>
        <tr>
          <th>ID</th>
          <th>LoaiPhong_ID</th>
          <th>HomeStay_ID</th>
          <th>Ma_Phong</th>
          <th>Ten_Phong</th>
          <th>Dien_Tich</th>
          <th>Mo_Ta</th>
          <th>Tang_So</th>
          <th>So_Nguoi_Lon</th>
          <th>So_Nguoi_Nho</th>
          <th>So_Nguoi_Toi_Da</th>
          <th>Anh_Bia</th>
          <th>Trang_Thai</th>
          <th>Thao tác</th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="phong in paginatedPhongs"
          :key="phong.id"
          @dblclick="viewPhongDetails(phong)"
        >
          <td class="text-center">{{ phong.id }}</td>
          <td class="text-center">{{ getLoaiPhongName(phong.idloaiPhong) }}</td>
          <td class="text-center">{{ getHomestayName(phong.idhomeStay) }}</td>
          <td class="text-center">{{ phong.maPhong }}</td>
          <td class="text-center">{{ phong.tenPhong }}</td>
          <td class="text-center">{{ phong.dienTich }}</td>
          <td class="text-center truncate-text">{{ phong.moTa || '-' }}</td>
          <td class="text-center">{{ phong.tangSo }}</td>
          <td class="text-center">{{ phong.soNguoiLon || 0 }}</td>
          <td class="text-center">{{ phong.soNguoiNho || 0 }}</td>
          <td class="text-center">{{ phong.soNguoiToiDa || 0 }}</td>
          <td class="text-center">
            <div class="image-wrapper">
              <div v-if="phong.anhBia" class="image-container" @click="openImagePreview(phong.anhBia, phong.tenPhong)">
                <img
                  :src="getImageUrl(phong.anhBia)"
                  :alt="phong.tenPhong"
                  class="homestay-image"
                  loading="lazy"
                  @error="handleImageError"
                />
              </div>
              <div v-else class="no-image-placeholder">
                <i class="fas fa-door-open"></i>
                <span>Không có ảnh</span>
              </div>
            </div>
          </td>
          <td class="text-center">
            {{ phong.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
          </td>
          <td class="text-center">
            <div class="action-buttons">
              <button
                class="btn btn-sm btn-success me-1"
                @click="openAnhModal(phong)"
                title="Quản lý ảnh"
              >
                <i class="fas fa-images"></i>
              </button>
              <button
                class="btn btn-icon btn-info-light"
                title="Xem chi tiết"
                @click="viewPhongDetails(phong)"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button
                class="btn btn-icon btn-warning-light"
                title="Chỉnh sửa"
                @click="editPhong(phong)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn btn-icon btn-danger-light"
                title="Xóa"
                @click="deletePhong(phong.id)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
        <!-- Empty rows to ensure space for 10 rows -->
        <tr v-for="i in emptyRows" :key="`empty-${i}`" class="empty-row">
          <td colspan="16">&nbsp;</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && paginatedPhongs.length === 0" class="empty-state">
      <i class="fas fa-box-open empty-icon"></i>
      <p v-if="searchTerm">Không tìm thấy phòng nào phù hợp với từ khóa "{{ searchTerm }}".</p>
      <p v-else>Không tìm thấy phòng nào.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="!loading && paginatedPhongs.length > 0">
      <div class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong số {{ totalItems }} phòng
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 0 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: page - 1 === currentPage }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page - 1)">{{ page }}</a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages - 1 || totalPages === 0 }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <!-- Modal hiển thị ảnh phóng to -->
  <div v-if="showImagePreview" class="image-preview-modal" @click.self="closeImagePreview">
    <div class="preview-content">
      <div class="preview-header">
        <h4>{{ previewImageTitle }}</h4>
        <button class="close-button" @click="closeImagePreview">&times;</button>
      </div>
      <div class="preview-body">
        <img :src="previewImage" :alt="previewImageTitle" class="preview-image" />
      </div>
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
    :phong="selectedPhongForImages"
    :viewOnly="viewOnlyImages"
    @close="closeAnhModal"
    @updated="handleImageUpdated"
  />
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import {
  getAllPhong,
  getPhongPaginated,
  searchPhong,
  deletePhong as deletePhongAPI,
  getLoaiPhongList,
  getHomestayList
} from '@/Service/phongService'
import PhongModal from '../components/PhongModal.vue'
import AnhPhongModal from '../components/AnhPhongModal.vue'
import { useToast } from '@/stores/notificationStore'
import { useRouter } from 'vue-router'

export default {
  name: 'QlyPhong',
  components: {
    PhongModal,
    AnhPhongModal,
  },
  setup() {
    const toast = useToast()
    const router = useRouter()

    // Chuyển từ ref() sang ref ngắn gọn hơn
    const phongs = ref([])
    const loaiPhongList = ref([])
    const homestayList = ref([])
    const searchTerm = ref('')
    const apiError = ref(false)
    const apiErrorMessage = ref('')
    const selectedStatus = ref('all')
    const loading = ref(false)
    const masterDataError = ref(false)

    // Pagination
    const currentPage = ref(0)
    const pageSize = ref(10)
    const totalPages = ref(1)
    const totalItems = ref(0)
    const isServerSidePagination = ref(true)

    // State for modal
    const showModal = ref(false)
    const selectedPhong = ref(null)
    const isEdit = ref(false)
    const isViewMode = ref(false)

    // State for image preview
    const showImagePreview = ref(false)
    const previewImage = ref(null)
    const previewImageTitle = ref('')

    // State for modal ảnh phòng
    const showAnhModal = ref(false)
    const selectedPhongForImages = ref(null)
    const viewOnlyImages = ref(false)

    // Debounced search
    let searchTimeout = null

    // API calls
    const fetchMasterData = async () => {
      try {
        loading.value = true
        masterDataError.value = false

        const [loaiPhongRes, homestayRes] = await Promise.all([
          getLoaiPhongList(),
          getHomestayList()
        ])

        loaiPhongList.value = loaiPhongRes.data || []
        homestayList.value = homestayRes.data || []

        if (loaiPhongList.value.length === 0) {
          loaiPhongList.value = [
            { id: 1, tenLoaiPhong: "Phòng Tiêu Chuẩn", moTa: "Phòng tiêu chuẩn cho 1-2 người", giaPhong: 500000 },
            { id: 2, tenLoaiPhong: "Phòng VIP", moTa: "Phòng cao cấp với nhiều tiện nghi", giaPhong: 1200000 },
            { id: 3, tenLoaiPhong: "Phòng Gia Đình", moTa: "Phòng rộng rãi cho gia đình 4-6 người", giaPhong: 2000000 }
          ]
          toast.warning('Không thể tải danh sách loại phòng, đang sử dụng dữ liệu mẫu')
        }

        if (homestayList.value.length === 0) {
          toast.warning('Không thể tải danh sách homestay')
          masterDataError.value = true
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu master:', error)
        toast.error('Không thể tải danh sách loại phòng hoặc homestay')
        masterDataError.value = true
      } finally {
        loading.value = false
      }
    }

    const fetchData = async () => {
      try {
        loading.value = true

        if (searchTerm.value) {
          const searchParams = {
            tenPhong: searchTerm.value,
            maPhong: searchTerm.value
          }
          const response = await searchPhong(searchParams)
          phongs.value = response.data || []
          isServerSidePagination.value = false
          totalItems.value = phongs.value.length
          totalPages.value = Math.ceil(totalItems.value / pageSize.value) || 1
        } else if (isServerSidePagination.value) {
          const response = await getPhongPaginated(currentPage.value)
          if (response.data && response.data.content) {
            phongs.value = response.data.content
            totalItems.value = response.data.totalElements || 0
            totalPages.value = response.data.totalPages || 1
          } else {
            const allPhongRes = await getAllPhong()
            phongs.value = allPhongRes.data || []
            totalItems.value = phongs.value.length
            totalPages.value = Math.ceil(totalItems.value / pageSize.value) || 1
            isServerSidePagination.value = false
          }
        } else {
          const response = await getAllPhong()
          phongs.value = response.data || []
          totalItems.value = phongs.value.length
          totalPages.value = Math.ceil(totalItems.value / pageSize.value) || 1
        }

        apiError.value = false
      } catch (e) {
        apiError.value = true
        if (e.response && e.response.status === 404) {
          apiErrorMessage.value = 'Không thể kết nối đến API phòng. Vui lòng kiểm tra đường dẫn API hoặc khởi động lại server.'
        } else {
          apiErrorMessage.value = 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
        }
      } finally {
        loading.value = false
      }
    }

    // Helpers
    const getLoaiPhongName = (id) => {
      if (typeof id === 'object' && id !== null) {
        id = id.id
      }
      const loaiPhong = loaiPhongList.value.find((l) => l.id === id)
      return loaiPhong ? loaiPhong.tenLoaiPhong : 'Không xác định'
    }

    const getHomestayName = (id) => {
      if (typeof id === 'object' && id !== null) {
        id = id.id
      }
      const homestay = homestayList.value.find((h) => h.id === id)
      return homestay ? homestay.tenHomestay : 'Không xác định'
    }

    // Xử lý xem ảnh phóng to - đơn giản hóa
    const openImagePreview = (imageUrl, roomName) => {
      if (!imageUrl) return
      previewImage.value = imageUrl
      previewImageTitle.value = `Ảnh phòng: ${roomName}`
      showImagePreview.value = true
    }

    const closeImagePreview = () => {
      showImagePreview.value = false
      setTimeout(() => {
        previewImage.value = null
        previewImageTitle.value = ''
      }, 300)
    }

    const clearSearch = () => {
      searchTerm.value = ''
    }

    // Format date helper
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Ngày không hợp lệ'
        return date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '-')
      // eslint-disable-next-line no-empty
      } catch {
        return 'Ngày không hợp lệ'
      }
    }

    const filteredPhongs = computed(() => {
      let filtered = phongs.value
      if (selectedStatus.value !== 'all') {
        const isActive = selectedStatus.value === 'active'
        filtered = filtered.filter((p) => p.trangThai === isActive)
      }
      return filtered
    })

    // Computed properties cho phân trang
    const paginatedPhongs = computed(() => {
      if (isServerSidePagination.value) {
        return filteredPhongs.value
      }
      const start = currentPage.value * pageSize.value
      const end = start + pageSize.value
      return filteredPhongs.value.slice(start, end)
    })

    const startItem = computed(() => {
      return totalItems.value === 0 ? 0 : currentPage.value * pageSize.value + 1
    })

    const endItem = computed(() => {
      const end = (currentPage.value + 1) * pageSize.value
      return end > totalItems.value ? totalItems.value : end
    })

    const emptyRows = computed(() => {
      const rowsCount = paginatedPhongs.value.length
      return rowsCount < pageSize.value ? pageSize.value - rowsCount : 0
    })

    const handleSearch = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      searchTimeout = setTimeout(() => {
        currentPage.value = 0
        fetchData()
      }, 500)
    }

    const handleStatusChange = (status) => {
      selectedStatus.value = status
      currentPage.value = 0
      if (!searchTerm.value) {
        fetchData()
      }
    }

    const changePage = (page) => {
      if (page >= 0 && page < totalPages.value) {
        currentPage.value = page
        if (isServerSidePagination.value) {
          fetchData()
        }
      }
    }

    // Modal functions
    const openAddModal = () => {
      isEdit.value = false
      isViewMode.value = false
      selectedPhong.value = null

      if (loaiPhongList.value.length === 0 || homestayList.value.length === 0) {
        fetchMasterData().then(() => {
          showModal.value = true
        })
      } else {
        showModal.value = true
      }
    }

    const editPhong = (phong) => {
      isEdit.value = true
      isViewMode.value = false
      selectedPhong.value = { ...phong }
      showModal.value = true
    }

    const viewPhongDetails = (phong) => {
      selectedPhong.value = phong
      showModal.value = true
      isEdit.value = false
      isViewMode.value = true
    }

    const editFromViewMode = () => {
      isViewMode.value = false
      isEdit.value = true
    }

    const openAnhModalFromDetails = (phong) => {
      showModal.value = false
      selectedPhongForImages.value = phong
      showAnhModal.value = true
      viewOnlyImages.value = true
    }

    const closeModal = () => {
      showModal.value = false
      setTimeout(() => {
        selectedPhong.value = null
        isEdit.value = false
        isViewMode.value = false
      }, 300)
    }

        const savePhong = async (responseData) => {
      try {
        // Phong modal đã được cập nhật để trả về dữ liệu phòng đã xử lý từ API
        if (responseData) {
          // Kiểm tra xem có phải là dữ liệu từ API mới không
          if (responseData.data) {
            // Đây là response từ API mới
            const phongData = responseData.data;

            if (isEdit.value && selectedPhong.value && selectedPhong.value.id) {
              // Cập nhật phòng trong danh sách
              const phongId = parseInt(selectedPhong.value.id, 10);
              const index = phongs.value.findIndex(p => p.id === phongId);
              if (index !== -1) {
                phongs.value[index] = phongData;
              }
              toast.success('Cập nhật phòng thành công');
            } else {
              // Thêm phòng mới vào danh sách
              phongs.value.unshift(phongData);
              toast.success('Thêm phòng mới thành công');
            }
          } else {
            // Đây là dữ liệu phòng trực tiếp
            if (isEdit.value && responseData.id) {
              // Cập nhật phòng trong danh sách
              const phongId = parseInt(responseData.id, 10);
              const index = phongs.value.findIndex(p => p.id === phongId);
              if (index !== -1) {
                phongs.value[index] = responseData;
              }
              toast.success('Cập nhật phòng thành công');
            } else {
              // Thêm phòng mới vào danh sách
              phongs.value.unshift(responseData);
              toast.success('Thêm phòng mới thành công');
            }
          }
        } else {
          // Nếu không có dữ liệu trả về, tải lại dữ liệu từ API
          fetchData();
        }

        closeModal();
      } catch (err) {
        console.error('Lỗi khi lưu phòng:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu phòng';
        toast.error(errorMessage);
      }
    }

    const deletePhong = async (id) => {
      if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
        try {
          await deletePhongAPI(id)
          toast.success('Xóa phòng thành công')
          fetchData()
        } catch (error) {
          console.error('Lỗi khi xóa phòng:', error)
          const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng'
          toast.error(errorMessage)
        }
      }
    }

    const navigateToLoaiPhong = () => {
      router.push({ name: 'admin-loai-phong' })
    }

    // Quản lý modal ảnh chi tiết
    const openAnhModal = (phong) => {
      selectedPhongForImages.value = { ...phong }
      showAnhModal.value = true
      viewOnlyImages.value = false
    }

    const closeAnhModal = () => {
      showAnhModal.value = false
    }

        // Xử lý khi ảnh được cập nhật - FIX cho lỗi hiển thị sau upload
    const handleImageUpdated = (updatedPhong) => {
      try {
        console.log('Nhận cập nhật phòng từ modal ảnh:', updatedPhong)

        // Đảm bảo URL ảnh bìa có định dạng đúng (http://localhost:8080/...)
        if (updatedPhong.anhBia && !updatedPhong.anhBia.startsWith('http')) {
          updatedPhong.anhBia = `http://localhost:8080${updatedPhong.anhBia.startsWith('/') ? '' : '/'}${updatedPhong.anhBia}`
        }

        // Tìm và cập nhật phòng trong danh sách
        const index = phongs.value.findIndex(p => p.id === updatedPhong.id)
        if (index !== -1) {
          phongs.value[index] = { ...phongs.value[index], ...updatedPhong }
          console.log('Đã cập nhật phòng trong danh sách với ảnh bìa:', phongs.value[index].anhBia)
        }

        // Cập nhật selectedPhong nếu đang xem chi tiết
        if (selectedPhong.value && selectedPhong.value.id === updatedPhong.id) {
          selectedPhong.value = { ...selectedPhong.value, ...updatedPhong }
          console.log('Đã cập nhật phòng đang xem chi tiết với ảnh bìa:', selectedPhong.value.anhBia)
        }

        // Cập nhật selectedPhongForImages
        if (selectedPhongForImages.value && selectedPhongForImages.value.id === updatedPhong.id) {
          selectedPhongForImages.value = { ...selectedPhongForImages.value, ...updatedPhong }
        }

        // Hiển thị thông báo cập nhật thành công
        toast.success('Ảnh phòng đã được cập nhật')
      } catch (e) {
        console.error('Lỗi khi cập nhật phòng sau upload ảnh:', e)
        toast.error('Có lỗi xảy ra khi cập nhật ảnh')
      }
    }

        // Xử lý URL ảnh - đơn giản hóa
    const getImageUrl = (img) => {
      if (!img) return '/images/placeholder-house.jpg'
      // Nếu là URL đầy đủ, trả về url đã được mã hóa đúng
      if (img.startsWith('http')) {
        return encodeURI(img)
      }
      // Nếu không có http prefix, thêm vào
      return `http://localhost:8080${img.startsWith('/') ? '' : '/'}${img}`
    }

    // Xử lý lỗi ảnh khi tải
    const handleImageError = (event) => {
      event.target.src = '/images/placeholder-house.jpg'; // Thay thế bằng ảnh mặc định
      event.target.alt = 'Không thể tải ảnh';
    };

    watch(searchTerm, () => {
      handleSearch()
    })

    onMounted(() => {
      fetchMasterData()
      fetchData()
    })

    return {
      searchTerm,
      filteredPhongs,
      paginatedPhongs,
      getLoaiPhongName,
      getHomestayName,
      handleSearch,
      openImagePreview,
      closeImagePreview,
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
      formatDate,
      masterDataError,
      // State for image preview
      showImagePreview,
      previewImage,
      previewImageTitle,
      navigateToLoaiPhong,
      // Quản lý modal ảnh phòng
      showAnhModal,
      selectedPhongForImages,
      viewOnlyImages,
      openAnhModal,
      openAnhModalFromDetails,
      closeAnhModal,
      handleImageUpdated, // Thêm function mới
      getImageUrl, // Thêm function mới
      handleImageError, // Thêm function mới
    }
  },
}
</script>

<style scoped>
/* GENERAL CONTAINER & TITLE */
.phong-container {
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

/* CONTROLS BAR */
.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  background-color: #ffffff;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
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
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9a9a9a;
  font-size: 1rem;
}

.search-input {
  width: 100%;
  border: 1px solid #e9ecef;
  padding: 12px 15px 12px 45px;
  border-radius: 30px;
  outline: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  background-color: #f8f9fa;
}

.search-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  background-color: #fff;
}

.clear-search-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9a9a9a;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.clear-search-btn:hover {
  color: #495057;
}

/* RIGHT SIDE: FILTERS & ADD BUTTON */
.right-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-filter {
  min-width: 180px;
  border-radius: 30px;
  padding: 10px 15px;
  border: 1px solid #e9ecef;
  background-color: #f8f9fa;
  font-size: 0.95rem;
  color: #495057;
}

.add-button {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 21px;
  font-weight: 600;
  padding: 0 20px;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #0d6efd, #0099ff);
  border: none;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
  background: linear-gradient(45deg, #0a58ca, #0077cc);
}

.loai-phong-btn {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 21px;
  font-weight: 600;
  padding: 0 20px;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #0d6efd, #0099ff);
  border: none;
}

.loai-phong-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
  background: linear-gradient(45deg, #0a58ca, #0077cc);
}

/* Search results info */
.search-results-info {
  background-color: #e8f4fd;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 15px;
  color: #0c63e4;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.search-results-info i {
  font-size: 1.1rem;
}

/* TABLE STYLES */
.table-responsive {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 20px;
  overflow-x: auto;
}

.table {
  margin-bottom: 0;
  width: 100%;
  border-collapse: collapse;
}

.table thead th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding: 12px 8px;
  text-align: center;
  font-size: 0.85rem;
  white-space: nowrap;
}

.table tbody td {
  padding: 8px;
  vertical-align: middle;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.85rem;
  text-align: center;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

/* Truncate long text */
.truncate-text {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* People info styling */
.people-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.85rem;
}

.people-row {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6c757d;
}

.people-row i {
  width: 16px;
  text-align: center;
}

.people-row.total {
  color: #0d6efd;
  font-weight: 500;
  margin-top: 3px;
}

/* Image styling */
.image-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 6px;
  position: relative;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
}

.phong-image,
.homestay-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 6px;
}

.no-image-placeholder i {
  font-size: 20px;
  margin-bottom: 5px;
  color: #aaa;
}

.no-image-placeholder span {
  font-size: 0.7rem;
  text-align: center;
}

/* Detail image styling */
.detail-image-container {
  position: relative;
  display: inline-block;
  margin: 0 auto;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  max-width: 100%;
}

.detail-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 10px;
}

.no-image-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 0.95rem;
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
}

.no-image-detail i {
  font-size: 3rem;
  margin-bottom: 10px;
  color: #adb5bd;
}

/* Modal hiển thị ảnh phóng to */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1051;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

.preview-content {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  max-width: 90%;
  max-height: 90vh;
  width: auto;
  overflow: hidden;
  animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 15px 20px;
  background: linear-gradient(90deg, #0d6efd 0%, #0099ff 100%);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.preview-header h4 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  opacity: 0.8;
  cursor: pointer;
  padding: 5px;
  transition: opacity 0.3s ease;
}

.close-button:hover {
  opacity: 1;
}

.preview-body {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 300px;
  background-color: #f8f9fa;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background-color: #f0f0f0;
  transition: none !important;
  transform: none !important;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-transform: translateZ(0) scale(1.0, 1.0);
  transform: translateZ(0);
  image-rendering: -webkit-optimize-contrast;
}

.preview-no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  height: 300px;
  width: 100%;
}

.preview-no-image i {
  font-size: 5rem;
  margin-bottom: 20px;
  color: #adb5bd;
}

.preview-no-image p {
  font-size: 1.2rem;
  font-weight: 500;
}

.preview-footer {
  padding: 12px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
}

.preview-image-info {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

/* Detail row styling */
.detail-row-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(3px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.detail-row-content {
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease;
  display: flex;
  flex-direction: column;
}

@keyframes slideDown {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.detail-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(90deg, #0d6efd 0%, #0099ff 100%);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.detail-row-header h4 {
  margin: 0;
  color: #fff;
  font-weight: 600;
  font-size: 1.5rem;
}

.detail-row-header .btn-close {
  color: #fff;
  opacity: 0.8;
  background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat;
}

.detail-row-header .btn-close:hover {
  opacity: 1;
}

.detail-row-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

/* Image section */
.detail-image-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.image-container {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
}

.image-container:hover::after {
  content: '🔍';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.detail-main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.detail-main-image:hover {
  transform: scale(1.05);
}

.no-image-detail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #6c757d;
  gap: 10px;
}

.no-image-detail i {
  font-size: 3rem;
}

.room-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.room-id {
  font-size: 1rem;
}

.id-label {
  font-weight: 500;
  color: #6c757d;
}

.id-value {
  font-weight: 600;
  color: #495057;
}

.room-status {
  padding-top: 5px;
}

.status-active, .status-inactive {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
}

.status-active {
  background-color: rgba(25, 135, 84, 0.15);
  color: #198754;
}

.status-inactive {
  background-color: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

/* Detail info styling */
.detail-info-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.detail-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #0d6efd;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 1rem;
  font-weight: 500;
  color: #212529;
}

.detail-id {
  font-family: monospace;
  color: #6610f2;
}

/* Capacity info */
.capacity-info {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.capacity-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.capacity-item i {
  font-size: 1.8rem;
  color: #0d6efd;
  margin-bottom: 10px;
}

.capacity-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #212529;
}

.capacity-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 5px;
}

/* Description box */
.description-box {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  min-height: 80px;
  color: #495057;
  line-height: 1.6;
}

/* Footer */
.detail-row-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .controls-container {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .search-box {
  width: 100%;
  }

  .right-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .detail-row-container {
    padding: 10px;
  }

  .detail-row-content {
    width: 95%;
    max-width: 95%;
  }

  .detail-row-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .detail-row-header h4 {
    width: 100%;
    text-align: center;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .detail-label {
    width: 100%;
    text-align: left;
    margin-right: 0;
  }

  .detail-value {
    width: 100%;
    text-align: left;
  }

  .detail-description {
    text-align: left;
  }

  .detail-image {
    max-width: 80%;
  }

  .detail-row-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}

.detail-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.homestay-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  will-change: auto;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-font-smoothing: subpixel-antialiased;
  image-rendering: auto;
}
</style>
