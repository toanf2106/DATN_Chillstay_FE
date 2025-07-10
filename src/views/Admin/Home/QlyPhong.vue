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
            <th>Ngay_Tao</th>
            <th>Ngay_Update</th>
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
            <td class="text-center">{{ formatDate(phong.ngayTao) }}</td>
            <td class="text-center">{{ formatDate(phong.ngayUpdate) || 'NULL' }}</td>
            <td class="text-center">
              <div class="image-wrapper">
                <img
                  v-if="phong.anhBia"
                  :src="getImageUrl(phong.anhBia)"
                  :alt="phong.tenPhong"
                  class="phong-image"
                  @click="openImagePreview(phong.anhBia, phong.tenPhong)"
                  @error="handleImageError(phong.id)"
                />
                <div
                  v-else
                  class="no-image-placeholder"
                  @click="openImagePreview(null, phong.tenPhong)"
                >
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

    <!-- Chi tiết phòng khi click vào dòng -->
    <div v-if="showDetailRow" class="detail-row-container">
      <div class="detail-row-content">
        <div class="detail-row-header">
          <h4>Chi tiết phòng: {{ detailPhong.tenPhong }}</h4>
          <button class="btn-close" @click="closeDetailRow"></button>
        </div>
        <div class="detail-row-body">
          <div class="row">
            <div class="col-md-4 detail-image-section">
              <div class="image-container">
                <img
                  v-if="detailPhong.anhBia"
                  :src="getImageUrl(detailPhong.anhBia)"
                  :alt="detailPhong.tenPhong"
                  class="detail-main-image"
                  @error="handlePreviewImageError"
                  @click="openImagePreview(detailPhong.anhBia, detailPhong.tenPhong)"
                />
                <div v-else class="no-image-detail">
                  <i class="fas fa-door-open"></i>
                  <span>Phòng không có ảnh</span>
                </div>
              </div>
              <div class="room-summary">
                <div class="room-id">
                  <span class="id-label">Mã phòng:</span>
                  <span class="id-value">{{ detailPhong.maPhong || "Không có" }}</span>
                </div>
                <div class="room-status">
                  <span :class="detailPhong.trangThai ? 'status-active' : 'status-inactive'">
                    {{ detailPhong.trangThai ? 'Đang hoạt động' : 'Không hoạt động' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-8">
              <div class="detail-info-container">
                <div class="detail-section">
                  <h5 class="section-title">Thông tin cơ bản</h5>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">Tên phòng:</span>
                      <span class="detail-value">{{ detailPhong.tenPhong }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Loại phòng:</span>
                      <span class="detail-value">{{ getLoaiPhongName(detailPhong.idloaiPhong) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Thuộc Homestay:</span>
                      <span class="detail-value">{{ getHomestayName(detailPhong.idhomeStay) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Diện tích:</span>
                      <span class="detail-value">{{ detailPhong.dienTich }} m²</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Tầng số:</span>
                      <span class="detail-value">{{ detailPhong.tangSo }}</span>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <h5 class="section-title">Số lượng người</h5>
                  <div class="capacity-info">
                    <div class="capacity-item">
                      <i class="fas fa-male"></i>
                      <div class="capacity-number">{{ detailPhong.soNguoiLon || 0 }}</div>
                      <div class="capacity-label">Người lớn</div>
                    </div>
                    <div class="capacity-item">
                      <i class="fas fa-child"></i>
                      <div class="capacity-number">{{ detailPhong.soNguoiNho || 0 }}</div>
                      <div class="capacity-label">Trẻ em</div>
                    </div>
                    <div class="capacity-item">
                      <i class="fas fa-users"></i>
                      <div class="capacity-number">{{ detailPhong.soNguoiToiDa || 0 }}</div>
                      <div class="capacity-label">Tối đa</div>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <h5 class="section-title">Mô tả</h5>
                  <div class="description-box">
                    {{ detailPhong.moTa || 'Không có mô tả' }}
                  </div>
                </div>

                <div class="detail-section">
                  <h5 class="section-title">Thông tin khác</h5>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">ID phòng:</span>
                      <span class="detail-value detail-id">{{ detailPhong.id }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Ngày tạo:</span>
                      <span class="detail-value">{{ formatDate(detailPhong.ngayTao) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Cập nhật:</span>
                      <span class="detail-value">{{ formatDate(detailPhong.ngayUpdate) || 'Chưa cập nhật' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="detail-row-footer">
          <button class="btn btn-secondary" @click="closeDetailRow">
            <i class="fas fa-times me-1"></i> Đóng
          </button>
          <button class="btn btn-primary" @click="editPhong(detailPhong)">
            <i class="fas fa-edit me-1"></i> Chỉnh sửa
          </button>
        </div>
      </div>
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
    <div class="image-preview-content">
      <div class="preview-header">
        <h4>{{ previewImageTitle }}</h4>
        <button class="preview-close-btn" @click="closeImagePreview">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="preview-image-container">
        <img
          v-if="previewImage"
          :src="getImageUrl(previewImage)"
          :alt="previewImageTitle"
          class="preview-image"
          @error="handlePreviewImageError"
        />
        <div v-else class="preview-no-image">
          <i class="fas fa-image"></i>
          <p>Không có ảnh</p>
        </div>
      </div>
      <div class="preview-footer">
        <p class="preview-image-info">
          <i class="fas fa-info-circle me-2"></i>
          Nhấn bất kỳ đâu để đóng
        </p>
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
  />
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import {
  getAllPhong,
  getPhongPaginated,
  searchPhong,
  addPhong,
  updatePhong,
  deletePhong as deletePhongAPI,
  getLoaiPhongList,
  getHomestayList
} from '@/Service/phongService'
import PhongModal from '../components/PhongModal.vue'
import { useToast } from '@/stores/notificationStore'

export default {
  name: 'QlyPhong',
  components: {
    PhongModal,
  },
  setup() {
    const toast = useToast()
    const phongs = ref([])
    const loaiPhongList = ref([])
    const homestayList = ref([])
    const searchTerm = ref('')
    const apiError = ref(false)
    const apiErrorMessage = ref('')
    const selectedStatus = ref('all')
    const loading = ref(false)
    const masterDataError = ref(false) // Biến theo dõi lỗi tải dữ liệu master

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

    // State for detail row
    const showDetailRow = ref(false)
    const detailPhong = ref(null)

    // State for image preview
    const showImagePreview = ref(false)
    const previewImage = ref(null)
    const previewImageTitle = ref('')

    // Debounced search
    let searchTimeout = null

    // API calls
    const fetchMasterData = async () => {
      try {
        loading.value = true;
        masterDataError.value = false; // Reset lỗi khi bắt đầu tải

        // Tải dữ liệu loại phòng và homestay
        const [loaiPhongRes, homestayRes] = await Promise.all([
          getLoaiPhongList(),
          getHomestayList()
        ])

        loaiPhongList.value = loaiPhongRes.data || []
        homestayList.value = homestayRes.data || []

        console.log("Loaded LoaiPhongList:", loaiPhongList.value);
        console.log("Loaded HomestayList:", homestayList.value);

        // Kiểm tra nếu danh sách loại phòng trống
        if (loaiPhongList.value.length === 0) {
          console.warn('Danh sách loại phòng trống, sử dụng mock data');
          // Tạo mock data cho loại phòng
          loaiPhongList.value = [
            { id: 1, tenLoaiPhong: "Phòng Tiêu Chuẩn", moTa: "Phòng tiêu chuẩn cho 1-2 người", giaPhong: 500000 },
            { id: 2, tenLoaiPhong: "Phòng VIP", moTa: "Phòng cao cấp với nhiều tiện nghi", giaPhong: 1200000 },
            { id: 3, tenLoaiPhong: "Phòng Gia Đình", moTa: "Phòng rộng rãi cho gia đình 4-6 người", giaPhong: 2000000 }
          ];
          toast.warning('Không thể tải danh sách loại phòng, đang sử dụng dữ liệu mẫu');
        }

        // Kiểm tra nếu danh sách homestay trống
        if (homestayList.value.length === 0) {
          console.warn('Danh sách homestay trống');
          toast.warning('Không thể tải danh sách homestay');
          masterDataError.value = true;
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu master:', error)
        toast.error('Không thể tải danh sách loại phòng hoặc homestay')
        masterDataError.value = true; // Đặt biến lỗi
      } finally {
        loading.value = false;
      }
    }

    const fetchData = async () => {
      try {
        loading.value = true

        if (searchTerm.value) {
          // Sử dụng API search khi có từ khóa tìm kiếm
          const searchParams = {
            tenPhong: searchTerm.value,
            maPhong: searchTerm.value
          }
          const response = await searchPhong(searchParams)
          phongs.value = response.data || []

          // Khi tìm kiếm thì tính toán phân trang ở client
          isServerSidePagination.value = false
          totalItems.value = phongs.value.length
          totalPages.value = Math.ceil(totalItems.value / pageSize.value) || 1
        } else if (isServerSidePagination.value) {
          // Sử dụng API phân trang khi không tìm kiếm
          const response = await getPhongPaginated(currentPage.value)
          if (response.data && response.data.content) {
            phongs.value = response.data.content
            totalItems.value = response.data.totalElements || 0
            totalPages.value = response.data.totalPages || 1
          } else {
            // Fallback nếu API không trả về định dạng phân trang
            const allPhongRes = await getAllPhong()
            phongs.value = allPhongRes.data || []
            totalItems.value = phongs.value.length
            totalPages.value = Math.ceil(totalItems.value / pageSize.value) || 1
            isServerSidePagination.value = false
          }
        } else {
          // Fallback sử dụng getAllPhong và phân trang client-side
          const response = await getAllPhong()
          phongs.value = response.data || []
          totalItems.value = phongs.value.length
          totalPages.value = Math.ceil(totalItems.value / pageSize.value) || 1
        }

        apiError.value = false
      } catch (e) {
        apiError.value = true

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

    // Helpers
    const getLoaiPhongName = (id) => {
      if (typeof id === 'object' && id !== null) {
        id = id.id; // Nếu id là một đối tượng, lấy thuộc tính id
      }
      const loaiPhong = loaiPhongList.value.find((l) => l.id === id)
      return loaiPhong ? loaiPhong.tenLoaiPhong : 'Không xác định'
    }

    const getLoaiPhongId = (id) => {
      if (typeof id === 'object' && id !== null) {
        return id.id; // Nếu id là một đối tượng, lấy thuộc tính id
      }
      return id;
    }

    const getHomestayName = (id) => {
      if (typeof id === 'object' && id !== null) {
        id = id.id; // Nếu id là một đối tượng, lấy thuộc tính id
      }
      const homestay = homestayList.value.find((h) => h.id === id)
      return homestay ? homestay.tenHomestay : 'Không xác định'
    }

    const getHomestayId = (id) => {
      if (typeof id === 'object' && id !== null) {
        return id.id; // Nếu id là một đối tượng, lấy thuộc tính id
      }
      return id;
    }

    const getImageUrl = (img) => {
      // Nếu không có ảnh
      if (!img) return '/images/default-avatar.png'

      // Nếu là URL GCS hoặc URL đầy đủ
      if (img.startsWith('http')) return img

      // Nếu là đường dẫn tương đối, thêm baseURL
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      return `${baseUrl}/images/${img}`
    }

    // Xử lý hình ảnh
    const handleImageError = (id) => {
      console.warn(`Failed to load image for room ID: ${id}`);
    }

    // Xử lý xem ảnh phóng to
    const openImagePreview = (imageUrl, roomName) => {
      previewImage.value = imageUrl;
      previewImageTitle.value = `Ảnh phòng: ${roomName}`;
      showImagePreview.value = true;
    }

    const closeImagePreview = () => {
      showImagePreview.value = false;
      setTimeout(() => {
        previewImage.value = null;
        previewImageTitle.value = '';
      }, 300);
    }

    const handlePreviewImageError = (event) => {
      // Use default image if loading fails
      event.target.src = '/images/default-avatar.png';
    }

    const clearSearch = () => {
      searchTerm.value = ''
      // Không cần gọi handleSearch vì đã có watch
    }

    // Close detail row
    const closeDetailRow = () => {
      showDetailRow.value = false;
        setTimeout(() => {
        detailPhong.value = null;
      }, 300); // Delay để hoàn tất animation
    }

    // Format date helper
    const formatDate = (dateString) => {
      if (!dateString) return '';

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Ngày không hợp lệ';

        return date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '-');
      } catch (error) {
        console.error('Lỗi định dạng ngày:', error);
        return 'Ngày không hợp lệ';
      }
    }

    const filteredPhongs = computed(() => {
      let filtered = phongs.value

      // Khi đã sử dụng API search, không cần lọc lại theo searchTerm
      // Chỉ lọc theo trạng thái
      if (selectedStatus.value !== 'all') {
        const isActive = selectedStatus.value === 'active'
        filtered = filtered.filter((p) => p.trangThai === isActive)
      }

      return filtered
    })

    // Computed properties cho phân trang
    const paginatedPhongs = computed(() => {
      // Nếu đã phân trang ở server, trả về tất cả phòng nhận được
      if (isServerSidePagination.value) {
        return filteredPhongs.value
      }

      // Nếu không, tính toán phân trang ở client
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
      // Debounce tìm kiếm để tránh gọi API quá nhiều
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

      // Nếu chỉ thay đổi trạng thái và không có search term, có thể lọc client-side
      if (!searchTerm.value) {
        fetchData()
      }
    }

    const changePage = (page) => {
      if (page >= 0 && page < totalPages.value) {
        currentPage.value = page

        // Nếu dùng server-side pagination, gọi API lại khi chuyển trang
        if (isServerSidePagination.value) {
          fetchData()
        }
      }
    }

    // Modal functions
    const openAddModal = () => {
      // Thiết lập các trạng thái cho modal
      isEdit.value = false;
      isViewMode.value = false;
      selectedPhong.value = null;

      // Đảm bảo dữ liệu master đã được tải trước khi mở modal
      if (loaiPhongList.value.length === 0 || homestayList.value.length === 0) {
        console.log("Đang tải lại dữ liệu master trước khi mở modal...");
        fetchMasterData().then(() => {
          console.log("Dữ liệu master đã tải xong, mở modal");
          // Mở modal sau khi đã tải xong dữ liệu
          showModal.value = true;
        });
      } else {
        console.log("Dữ liệu master đã sẵn sàng, mở modal ngay lập tức");
        // Mở modal ngay lập tức nếu dữ liệu đã có sẵn
        showModal.value = true;
      }
    }

    const editPhong = (phong) => {
      isEdit.value = true
      isViewMode.value = false
      selectedPhong.value = { ...phong }
      showModal.value = true

      // Đóng detail row nếu đang mở
      if (showDetailRow.value) {
        showDetailRow.value = false
      }
    }

    // View phòng details
    const viewPhongDetails = (phong) => {
      isEdit.value = false
      isViewMode.value = false
      detailPhong.value = { ...phong }
      showDetailRow.value = true
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

    const savePhong = async (phongData) => {
      try {
        // Kiểm tra xem phongData có phải là FormData object không
        if (phongData instanceof FormData) {
          // Lấy phòng JSON từ FormData
          const phongJson = phongData.get('phong')
          if (phongJson) {
            // Parse dữ liệu phòng để kiểm tra
            const phongObj = JSON.parse(phongJson);

            // Kiểm tra dữ liệu loại phòng và homestay
            if (!phongObj.LoaiPhong_ID) {
              console.error('Loại phòng không hợp lệ:', phongObj.LoaiPhong_ID);
              toast.error('Vui lòng chọn loại phòng');
              return;
            }

            if (!phongObj.HomeStay_ID) {
              console.error('Homestay không hợp lệ:', phongObj.HomeStay_ID);
              toast.error('Vui lòng chọn homestay');
              return;
            }

            // Log để debug
            console.log('Dữ liệu phòng trước khi gửi:', phongObj);
            console.log('LoaiPhong_ID:', phongObj.LoaiPhong_ID);
            console.log('HomeStay_ID:', phongObj.HomeStay_ID);

            if (isEdit.value && selectedPhong.value && selectedPhong.value.id) {
              const phongId = parseInt(selectedPhong.value.id, 10)
              await updatePhong(phongId, phongData) // Truyền trực tiếp formData
              toast.success('Cập nhật phòng thành công')
            } else {
              await addPhong(phongData) // Truyền trực tiếp formData
              toast.success('Thêm phòng mới thành công')
            }
          } else {
            throw new Error('Dữ liệu phòng không hợp lệ')
          }
        } else {
          // Xử lý trường hợp dữ liệu không phải FormData
          if (isEdit.value && phongData.id) {
            const phongId = parseInt(phongData.id, 10)
            await updatePhong(phongId, phongData)
            toast.success('Cập nhật phòng thành công')
          } else {
            await addPhong(phongData)
            toast.success('Thêm phòng mới thành công')
          }
        }

        closeModal()
        fetchData() // Tải lại danh sách sau khi lưu
      } catch (error) {
        console.error('Lỗi khi lưu phòng:', error)
        const errorMessage =
          error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu phòng'
        toast.error(errorMessage)
      }
    }

    // Xóa phòng (sử dụng hàm đã import từ phongService)
    const deletePhong = async (id) => {
      if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
        try {
          await deletePhongAPI(id)
          toast.success('Xóa phòng thành công')
          fetchData() // Tải lại danh sách sau khi xóa
      } catch (error) {
          console.error('Lỗi khi xóa phòng:', error)
          const errorMessage =
            error.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng'
          toast.error(errorMessage)
        }
      }
    }

    // Watch searchTerm để tự động gọi handleSearch khi thay đổi
    watch(searchTerm, () => {
      handleSearch()
    })

    onMounted(() => {
      fetchMasterData() // Tải danh sách loại phòng và homestay
      fetchData() // Tải danh sách phòng
    })

    return {
      searchTerm,
      filteredPhongs,
      paginatedPhongs,
      getLoaiPhongName,
      getLoaiPhongId,
      getHomestayName,
      getHomestayId,
      getImageUrl,
      handleSearch,
      handleImageError,
      openImagePreview,
      closeImagePreview,
      handlePreviewImageError,
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
      // State for detail row
      showDetailRow,
      detailPhong,
      closeDetailRow,
      formatDate,
      masterDataError, // Trả về biến lỗi
      // Trạng thái tải ảnh
      // imageLoadingStates, // Removed
      // imageErrors, // Removed
      // State for image preview
      showImagePreview,
      previewImage,
      previewImageTitle,
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

.image-preview-content {
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

.preview-close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  opacity: 0.8;
  cursor: pointer;
  padding: 5px;
  transition: opacity 0.3s ease;
}

.preview-close-btn:hover {
  opacity: 1;
}

.preview-image-container {
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
  transition: transform 0.3s ease;
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
  position: relative;
  width: 100%;
  height: 250px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
</style>
