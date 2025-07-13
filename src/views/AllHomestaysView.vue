<template>
  <div class="all-homestays-container">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Tất Cả <span class="highlight">Homestay tại ChillStay</span></h1>
        <p class="hero-subtitle">
          Khám phá những homestay độc đáo, retreat yên bình tại trung tâm Mộc Châu với tầm nhìn núi
          non hùng vĩ.
        </p>
        <div class="hero-search">
          <div class="search-box">
            <div class="search-input">
              <i class="fas fa-search search-icon"></i>
              <input type="text" placeholder="Nhập tên homestay" v-model="searchName" />
            </div>
            <div class="search-input dropdown">
              <i class="fas fa-map-marker-alt search-icon"></i>
              <select v-model="searchLocation">
                <option>Tất cả địa điểm</option>
                <option>Trung tâm Mộc Châu</option>
                <option>Bản Ba Phách</option>
                <option>Thung lũng Nà Ka</option>
              </select>
            </div>
            <div class="search-input dropdown">
              <i class="fas fa-tag search-icon"></i>
              <select v-model="searchPrice">
                <option>Tất cả mức giá</option>
                <option>Dưới 500 nghìn</option>
                <option>500 nghìn - 1 triệu</option>
                <option>1 - 1.5 triệu</option>
                <option>Trên 1.5 triệu</option>
              </select>
            </div>
            <button class="search-btn" @click="handleSearch">Tìm kiếm</button>
          </div>
        </div>
      </div>
    </section>

    <section class="homestays-section">
      <div class="container">
        <h2 class="section-title">Tìm thấy {{ filteredHomestays.length }} kết quả</h2>

        <!-- Bộ lọc -->
        <div class="filters">
          <div class="filter-group">
            <label>Sắp xếp theo:</label>
            <select v-model="sortOption">
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="rating-desc">Đánh giá cao nhất</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>

        <!-- Trạng thái đang tải -->
        <div v-if="isLoading" class="loading-container">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu...</p>
        </div>

        <!-- Thông báo lỗi -->
        <div v-else-if="hasError" class="error-container">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ errorMessage }}</p>
          <button class="retry-btn" @click="fetchHomestayData">Thử lại</button>
        </div>

        <!-- Lưới Homestay -->
        <div v-else class="homestays-grid">
          <div class="homestay-card" v-for="home in paginatedHomestays" :key="home.id">
            <div class="homestay-image">
              <img v-if="home.hinhAnh" :src="home.hinhAnh" :alt="home.tenHomestay" />
              <span class="rating-badge"
                >★ {{ home.danhGiaTrungBinh || '4.7' }} ({{ home.soDanhGia || '95' }} đánh
                giá)</span
              >
              <span class="homestay-status">Hoạt động</span>
            </div>
            <div class="homestay-content">
              <div class="location">
                <i class="fas fa-map-marker-alt"></i> {{ home.diaChi || 'Bản Áng, Mộc Châu' }}
              </div>
              <h3 class="homestay-title">{{ home.tenHomestay }}</h3>
              <div class="homestay-details">
                <span><i class="fas fa-home"></i> Homestay</span>
                <span
                  ><i class="fas fa-ruler-combined"></i> {{ home.dienTich || '200.75' }} m²</span
                >
                <span><i class="fas fa-users"></i> 2-4 người/căn</span>
              </div>

              <div class="homestay-price">
                <span class="price-value"
                  >{{
                    home.giaCaHomestay ? home.giaCaHomestay.toLocaleString('vi-VN') : '4.500.000'
                  }}đ</span
                >
                <span class="price-unit">/đêm</span>
              </div>

              <button class="book-now-btn" @click="navigateToBooking(home.id)">Đặt ngay</button>
            </div>
          </div>
        </div>

        <!-- Thông báo không có kết quả -->
        <div v-if="filteredHomestays.length === 0 && !isLoading && !hasError" class="no-results">
          <i class="fas fa-search"></i>
          <p>Không tìm thấy homestay nào phù hợp với bộ lọc của bạn.</p>
          <button class="reset-btn" @click="resetFilters">Đặt lại bộ lọc</button>
        </div>

        <!-- Phân trang -->
        <div v-if="totalPages > 1 && !isLoading && !hasError" class="pagination">
          <button
            class="pagination-btn"
            :class="{ disabled: currentPage === 1 }"
            @click="previousPage"
            :disabled="currentPage === 1"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            class="pagination-btn"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <button
            class="pagination-btn"
            :class="{ disabled: currentPage === totalPages }"
            @click="nextPage"
            :disabled="currentPage === totalPages"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getAllHomeStay, getLoaiHomeStay } from '@/Service/HomeStayService'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const homestays = ref([])
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
const sortOption = ref('price-asc')
const roomTypeFilter = ref('')
const homestayTypes = ref([]) // Array to store unique homestay types

// Thêm biến state cho tìm kiếm
const searchName = ref('')
const searchLocation = ref('Tất cả địa điểm')
const searchPrice = ref('Tất cả mức giá')

// Thêm biến state cho phân trang
const currentPage = ref(1)
const itemsPerPage = 4

// Phương thức chuyển đến trang Booking
const navigateToBooking = (homestayId) => {
  router.push(`/homestay/${homestayId}`)
}

// Phương thức tìm kiếm
const handleSearch = () => {
  console.log('Đang tìm kiếm với:', {
    tên: searchName.value,
    địaĐiểm: searchLocation.value,
    giáCả: searchPrice.value,
  })

  // Cập nhật query params
  router.push({
    path: '/all-homestays',
    query: {
      name: searchName.value,
      location: searchLocation.value !== 'Tất cả địa điểm' ? searchLocation.value : null,
      price: searchPrice.value !== 'Tất cả mức giá' ? searchPrice.value : null,
      sort: sortOption.value,
    },
  })
}

// Lọc và sắp xếp homestay
const filteredHomestays = computed(() => {
  // Lọc homestay theo trạng thái hoạt động
  let result = homestays.value.filter(
    (home) => home.trangThai === true || home.trangThai === 'Hoạt động',
  )

  // Lọc theo tên homestay từ tham số tìm kiếm
  if (searchName.value) {
    result = result.filter(
      (home) =>
        home.tenHomestay && home.tenHomestay.toLowerCase().includes(searchName.value.toLowerCase()),
    )
  }

  // Lọc theo địa điểm từ tham số tìm kiếm
  if (searchLocation.value && searchLocation.value !== 'Tất cả địa điểm') {
    result = result.filter((home) => home.diaChi && home.diaChi.includes(searchLocation.value))
  }

  // Lọc theo giá từ tham số tìm kiếm
  if (searchPrice.value && searchPrice.value !== 'Tất cả mức giá') {
    switch (searchPrice.value) {
      case 'Dưới 500 nghìn':
        result = result.filter((home) => home.giaCaHomestay < 500000)
        break
      case '500 nghìn - 1 triệu':
        result = result.filter(
          (home) => home.giaCaHomestay >= 500000 && home.giaCaHomestay <= 1000000,
        )
        break
      case '1 - 1.5 triệu':
        result = result.filter(
          (home) => home.giaCaHomestay > 1000000 && home.giaCaHomestay <= 1500000,
        )
        break
      case 'Trên 1.5 triệu':
        result = result.filter((home) => home.giaCaHomestay > 1500000)
        break
    }
  }

  // Lọc theo loại homestay nếu có
  if (roomTypeFilter.value) {
    result = result.filter((home) => {
      // Handle both object and string cases
      if (typeof home.loaiHomeStay === 'object') {
        return home.loaiHomeStay?.id === roomTypeFilter.value
      }
      return home.loaiHomeStay === roomTypeFilter.value
    })
  }

  // Sắp xếp theo tùy chọn
  switch (sortOption.value) {
    case 'price-asc':
      return result.sort((a, b) => (a.giaCaHomestay || 0) - (b.giaCaHomestay || 0))
    case 'price-desc':
      return result.sort((a, b) => (b.giaCaHomestay || 0) - (a.giaCaHomestay || 0))
    case 'rating-desc':
      return result.sort((a, b) => (b.danhGiaTrungBinh || 0) - (a.danhGiaTrungBinh || 0))
    case 'newest':
      // Giả định có trường ngayTao hoặc id lớn hơn = mới hơn
      return result.sort((a, b) => (b.id || 0) - (a.id || 0))
    default:
      return result
  }
})

// Tính toán tổng số trang
const totalPages = computed(() => {
  return Math.ceil(filteredHomestays.value.length / itemsPerPage)
})

// Lấy homestays cho trang hiện tại
const paginatedHomestays = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredHomestays.value.slice(startIndex, endIndex)
})

// Chuyển đến trang khác
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo(0, 0)
  }
}

// Đến trang trước
const previousPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

// Đến trang sau
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

// Đặt lại bộ lọc
const resetFilters = () => {
  searchName.value = ''
  searchLocation.value = 'Tất cả địa điểm'
  searchPrice.value = 'Tất cả mức giá'
  sortOption.value = 'price-asc'
  roomTypeFilter.value = ''

  // Cập nhật URL
  router.push({
    path: '/all-homestays',
  })
}

// Đọc tham số tìm kiếm từ URL khi component được tải
const readSearchParamsFromURL = () => {
  if (route.query.name) {
    searchName.value = route.query.name
  }

  if (route.query.location) {
    searchLocation.value = route.query.location
  }

  if (route.query.price) {
    searchPrice.value = route.query.price
  }

  if (route.query.sort) {
    sortOption.value = route.query.sort
  }

  if (route.query.page) {
    const pageNum = parseInt(route.query.page)
    if (!isNaN(pageNum) && pageNum > 0) {
      currentPage.value = pageNum
    }
  }
}

// Fetch homestay types from API
const fetchHomestayTypes = async () => {
  try {
    console.log('Đang tải dữ liệu loại homestay...')
    const response = await getLoaiHomeStay()
    console.log('Dữ liệu loại homestay từ API:', response.data)

    if (response.data && Array.isArray(response.data)) {
      homestayTypes.value = response.data
      console.log('Đã tải loại homestay từ API:', homestayTypes.value)
    } else {
      console.warn('API trả về dữ liệu loại homestay không hợp lệ:', response.data)
    }
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu loại homestay:', error)
  }
}

const fetchHomestayData = async () => {
  try {
    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''
    console.log('Đang tải dữ liệu homestay...')

    try {
      // Gọi API để lấy dữ liệu homestay
      const res = await getAllHomeStay()
      console.log('Dữ liệu homestay từ API:', res.data)

      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        homestays.value = res.data.map((room) => ({
          ...room,
          capacity: room.capacity || 2, // Giả định capacity mặc định nếu không có
        }))

        // Nếu không có dữ liệu loại homestay từ API riêng, trích xuất từ dữ liệu homestay
        if (homestayTypes.value.length === 0) {
          // Extract unique homestay types
          homestayTypes.value = [
            ...new Set(homestays.value.map((homestay) => homestay.loaiHomeStay)),
          ].filter((type) => type)
          console.log('Đã trích xuất loại homestay từ dữ liệu homestay:', homestayTypes.value)
        }
      } else {
        hasError.value = true
        errorMessage.value = 'Không có dữ liệu homestay nào được tìm thấy từ API.'
        console.warn('API trả về dữ liệu không hợp lệ:', res.data)
      }
    } catch (apiError) {
      hasError.value = true
      if (apiError.response && apiError.response.status === 401) {
        errorMessage.value =
          'API yêu cầu xác thực nhưng không có dữ liệu công khai. Vui lòng kiểm tra cấu hình backend.'
        console.error('Lỗi 401 - API yêu cầu xác thực:', apiError.response.data)
      } else if (apiError.message.includes('Network Error')) {
        errorMessage.value = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'
      } else {
        errorMessage.value =
          'Lỗi khi tải dữ liệu homestay: ' + (apiError.response?.data?.message || apiError.message)
      }
      console.error('Lỗi API chi tiết:', {
        message: apiError.message,
        status: apiError.response?.status,
        data: apiError.response?.data,
        url: apiError.config?.url,
      })
    }
  } catch (err) {
    console.error('Lỗi không xác định:', err)
    hasError.value = true
    errorMessage.value = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  console.log('Component AllHomestaysView đã được mount')
  // Đọc tham số tìm kiếm từ URL
  readSearchParamsFromURL()
  // Fetch homestay types first
  await fetchHomestayTypes()
  // Then fetch homestay data
  await fetchHomestayData()
})

// Theo dõi thay đổi trong tham số URL
watch(
  () => route.query,
  () => {
    readSearchParamsFromURL()
  },
  { deep: true },
)

// Cập nhật URL khi thay đổi trang
watch(currentPage, (newPage) => {
  router.push({
    query: {
      ...route.query,
      page: newPage,
    },
  })
})
</script>

<style scoped>
/* Nhập Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

/* Đặt lại và kiểu cơ bản */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.all-homestays-container {
  font-family: 'Roboto', sans-serif;
  color: #333;
  background: #f8f9fa;
}

/* Container */
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 15px;
}

/* Phần Hero */
.hero-section {
  background: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')
    no-repeat center/cover;
  color: #fff;
  padding: 80px 0;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: left;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  line-height: 1.2;
  text-align: left;
}

.highlight {
  color: #ff6200;
}

.hero-subtitle {
  font-size: 1.1rem;
  font-weight: 400;
  margin-bottom: 30px;
  opacity: 0.9;
  max-width: 600px;
}

/* Search box styles */
.hero-search {
  background: #fff;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
}

.search-box {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .search-box {
    flex-wrap: nowrap;
  }
}

.search-input {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input input,
.search-input select {
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.search-input.dropdown select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236c757d' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 20px center;
  padding-right: 40px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1rem;
}

.search-input input:focus,
.search-input select:focus {
  outline: none;
  border-color: #48cae4;
  box-shadow: 0 0 0 3px rgba(72, 202, 228, 0.2);
}

.search-btn {
  background: #48cae4;
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  min-width: 120px;
  text-align: center;
}

.search-btn:hover {
  background: #0096c7;
}

/* Phần Homestay */
.homestays-section {
  padding: 60px 0;
  background: #f8f9fa;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  text-align: left;
  margin-bottom: 25px;
  color: #333;
  padding-left: 10px;
}

/* Bộ lọc */
.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  background: #fff;
  padding: 15px 20px;
  border-radius: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
  color: #555;
}

.filter-group select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.filter-group select:focus {
  outline: none;
  border-color: #48cae4;
  box-shadow: 0 0 0 3px rgba(72, 202, 228, 0.2);
}

/* Homestay Cards */
.homestays-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 40px;
}

.homestay-card {
  background: #fff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: row;
  border: 1px solid #eaeaea;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.homestay-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.homestay-image {
  width: 350px;
  min-width: 300px;
  height: auto;
  position: relative;
}

.homestay-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.homestay-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
}

.location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #666;
}

.homestay-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.homestay-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 0.85rem;
  color: #666;
}

.homestay-details span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.homestay-price {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 15px;
  margin-top: auto;
}

.price-value {
  font-size: 1.4rem;
  font-weight: 600;
  color: #48cae4;
}

.price-unit {
  font-size: 0.9rem;
  color: #666;
}

.book-now-btn {
  width: 100%;
  padding: 12px;
  background: #48cae4;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.3s ease;
  text-align: center;
}

.book-now-btn:hover {
  background: #0096c7;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .homestay-card {
    flex-direction: column;
  }

  .homestay-image {
    width: 100%;
    height: 250px;
  }
}

@media (max-width: 768px) {
  .homestays-grid {
    grid-template-columns: 1fr;
  }

  .search-box {
    flex-direction: column;
  }

  .filters {
    flex-direction: column;
    gap: 15px;
  }
}

/* Trạng thái tải và lỗi */
.loading-container,
.error-container,
.no-results {
  text-align: center;
  padding: 35px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
  border: 1px solid #e8e8e8;
}

.loading-container i,
.error-container i,
.no-results i {
  font-size: 2rem;
  margin-bottom: 15px;
  display: block;
}

.loading-container i {
  color: #007bff;
}

.error-container i {
  color: #dc3545;
}

.no-results i {
  color: #6c757d;
}

.retry-btn,
.reset-btn {
  background: #48cae4;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 15px;
  transition: background 0.3s ease;
}

.retry-btn:hover,
.reset-btn:hover {
  background: #0096c7;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 8px;
}

.pagination-btn {
  min-width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #fff;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(.disabled) {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.pagination-btn.active {
  background-color: #48cae4;
  color: #fff;
  border-color: #48cae4;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
