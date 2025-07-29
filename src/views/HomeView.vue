<template>
  <div class="home-container">
    <!-- Cải thiện Hero Section với slideshow -->
    <section class="hero-section">
      <div class="hero-slideshow">
        <div class="slide" :class="{ active: currentSlide === 0 }">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
            alt="Chillstay Mộc Châu - Slide 1">
        </div>
        <div class="slide" :class="{ active: currentSlide === 1 }">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
            alt="Chillstay Mộc Châu - Slide 2">
        </div>
        <div class="slide" :class="{ active: currentSlide === 2 }">
          <img
            src="https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
            alt="Chillstay Mộc Châu - Slide 3">
        </div>

        <!-- Nút điều hướng -->
        <div class="slide-nav prev" @click="prevSlide">
          <i class="fas fa-chevron-left"></i>
        </div>
        <div class="slide-nav next" @click="nextSlide">
          <i class="fas fa-chevron-right"></i>
        </div>

        <!-- Chỉ báo slide -->
        <div class="slide-indicators">
          <span v-for="(_, index) in 3" :key="index" class="indicator" :class="{ active: currentSlide === index }"
            @click="setSlide(index)"></span>
        </div>
      </div>

      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">ChillStay <span class="highlight">Mộc Châu</span></h1>
          <p class="hero-subtitle">
            Khám phá những homestay độc đáo, retreat yên bình tại trung tâm Mộc Châu với tầm nhìn
            núi non hùng vĩ, trải nghiệm eco-friendly và văn hóa địa phương.
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
      </div>
    </section>

    <!-- Phần Tính Năng -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Tại Sao Chọn ChillStay Mộc Châu?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <i class="fas fa-mountain feature-icon"></i>
            <h3>Tầm Nhìn Núi Non Hùng Vĩ</h3>
            <p>
              Thưởng thức cảnh quan thiên nhiên, phong cảnh tuyệt đẹp và khí hậu mát mẻ quanh năm.
            </p>
          </div>
          <div class="feature-card">
            <i class="fas fa-home feature-icon"></i>
            <h3>Vị Trí Tập Trung</h3>
            <p>
              Hơn 20 homestay, cottage, và villa trong cùng khu vực, dễ dàng di chuyển và khám phá.
            </p>
          </div>
          <div class="feature-card">
            <i class="fas fa-concierge-bell feature-icon"></i>
            <h3>Quản Lý Thống Nhất</h3>
            <p>Dịch vụ hospitality đồng nhất với hỗ trợ 24/7 từ chủ nhà thân thiện.</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-parking feature-icon"></i>
            <h3>Tiện Ích Chung</h3>
            <p>Bãi đỗ xe, nhà hàng, quán cà phê, và tiện ích eco-friendly được chia sẻ.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Phần Homestay Nổi Bật -->
    <section class="homestays-section">
      <div class="container">
        <h2 class="section-title">Homestay Nổi Bật Tại Mộc Châu</h2>

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
          <div class="homestay-card" v-for="home in displayedHomestays" :key="home.id">
            <div class="homestay-image">
              <img v-if="home.hinhAnh" :src="fixImageUrl(home.hinhAnh)" :alt="home.tenHomestay" />
              <img v-else :src="defaultImage" :alt="home.tenHomestay" />
              <div class="homestay-rating" v-if="home.danhGiaTrungBinh !== undefined">
                <span class="stars">★</span> {{ home.danhGiaTrungBinh }} ({{ home.soDanhGia || 0 }}
                đánh giá)
              </div>
              <span class="homestay-status" v-if="home.trangThai">
                {{ home.trangThai === true ? 'Hoạt động' : home.trangThai }}
              </span>
            </div>
            <div class="homestay-content">
              <p class="homestay-location" v-if="home.diaChi">
                <i class="fas fa-map-marker-alt"></i> {{ home.diaChi }}
              </p>
              <h3>{{ home.tenHomestay }}</h3>
              <div class="homestay-details">
                <span v-if="home.loaiHomeStay"><i class="fas fa-home"></i> {{ home.loaiHomeStay.tenLoai }}</span>
                <span v-if="home.dienTich"><i class="fas fa-ruler"></i> {{ home.dienTich }} m²</span>
                <span v-if="home.sucChua"><i class="fas fa-bed"></i> {{ home.sucChua }} người/căn</span>
              </div>

              <div class="homestay-owner" v-if="home.hotenChuHomestay">
                <i class="fas fa-user"></i> Chủ homestay: {{ home.hotenChuHomestay }}
              </div>

              <div class="homestay-price" v-if="home.giaCaHomestay">
                <span class="price">{{ home.giaCaHomestay.toLocaleString('vi-VN') }}₫</span>
                <button class="book-now-btn" @click="navigateToBooking(home.id)">Đặt ngay</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Nút xem tất cả homestay đặt sau lưới -->
        <div class="view-more" v-if="!isLoading && !hasError">
          <button class="view-more-btn" @click="viewAllHomestays">Xem Tất Cả Homestay</button>
        </div>
      </div>
    </section>

    <!-- Phần Đánh giá Trải nghiệm -->
    <section class="reviews-section">
      <div class="container">
        <div class="reviews-content">
          <div class="reviews-header">
            <h2 class="section-title">Đánh giá từ những người đã trải nghiệm</h2>
            <p class="reviews-subtitle">
              Khách hàng chia sẻ về những kỷ niệm tuyệt vời trên chuyến du lịch với chúng tôi.
            </p>
          </div>

          <div class="reviews-slider" v-if="!isLoadingReviews">
            <div class="review-quote" v-if="activeReview">
              <div class="quote-icon">"</div>
              <p class="quote-text">{{ activeReview.content }}</p>
              <div class="author-info">
                <strong>{{ activeReview.author }}</strong> - {{ activeReview.location }}
              </div>
            </div>
          </div>

          <div class="review-tabs">
            <button v-for="(review, index) in reviews" :key="index"
              :class="['tab-button', { active: activeReviewIndex === index }]" @click="activeReviewIndex = index">
              {{ review.author }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Phần Câu hỏi thường gặp -->
    <section class="faq-section">
      <div class="container">
        <h2 class="section-title">Câu hỏi thường gặp</h2>
        <p class="faq-subtitle">Giải đáp thắc mắc của bạn về dịch vụ của chúng tôi</p>

        <div class="faq-container">
          <div class="faq-item" v-for="(item, index) in faqItems" :key="index">
            <div class="faq-question" @click="toggleFaq(index)" :class="{ 'active': activeFaq === index }">
              <h3>{{ item.question }}</h3>
              <i class="fas" :class="activeFaq === index ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </div>
            <div class="faq-answer" :class="{ 'show': activeFaq === index }">
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Phần Tin tức & Khám phá -->
    <section class="news-section">
      <div class="container">
        <div class="news-header">
          <div>
            <h2 class="section-title">
              Mộc Châu: Khám phá sự đặc sắc và cập nhật tin tức mới nhất
            </h2>
            <p class="news-subtitle">
              Mộc Châu: Bí mật và cuộc sống trong lành - Khám phá và cập nhật những tin tức hấp dẫn
              từ điểm đến tuyệt vời này.
            </p>
          </div>
          <div class="news-divider"></div>
        </div>

        <!-- Trạng thái đang tải tin tức -->
        <div v-if="isLoadingNews" class="loading-container">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Đang tải tin tức...</p>
        </div>

        <!-- Thông báo lỗi tin tức -->
        <div v-else-if="hasNewsError" class="error-container">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ newsErrorMessage }}</p>
          <button class="retry-btn" @click="fetchNewsData">Thử lại</button>
        </div>

        <!-- Hiển thị tin tức -->
        <div v-else class="news-grid">
          <div v-for="article in newsArticles" :key="article.id" class="news-card">
            <div class="news-image">
              <img :src="article.anhBia || defaultNewsImage" :alt="article.tieuDe" />
            </div>
            <h3 class="news-title">{{ article.tieuDe }}</h3>
            <p class="news-excerpt">{{ article.moTaNgan }}</p>
            <router-link :to="`/tin-tuc/${article.id}`" class="news-read-more">Đọc thêm</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Phần Kêu Gọi Hành Động -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getAllHomeStay, getAnhHomeStayByHomestayId } from '@/Service/HomeStayService'
import { getAllTinTuc } from '@/Service/TinTucService'
import { getAnhTinTucByTinTucId } from '@/Service/AnhTinTucService'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()
const homestays = ref([])
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
const defaultImage =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'

// Thêm các state cho form tìm kiếm
const searchName = ref('')
const searchLocation = ref('Tất cả địa điểm')
const searchPrice = ref('Tất cả mức giá')

// Thêm dữ liệu đánh giá mẫu
const isLoadingReviews = ref(false)
const activeReviewIndex = ref(0)
const reviews = ref([
  {
    id: 1,
    author: 'Chị Linh - Anh Dũng',
    location: 'Hà Nội',
    content:
      'Tour du homestay 2 ngày 1 đêm rất tuyệt vời, tôi được ngắm vẻ đẹp cả vùng Mộc Châu, khám phá các làng dân tộc. Nhân viên tư vấn nhiệt tình, phục vụ chu đáo. Đồ ăn ngon, phòng ốc đẹp. Đây thực sự là trải nghiệm đáng nhớ, mình sẽ tiếp tục ủng hộ và giới thiệu cho bạn bè. Cảm ơn ChillStay!',
    rating: 5,
  },
  {
    id: 2,
    author: 'Chị Thu Hà',
    location: 'TP. Hồ Chí Minh',
    content:
      'Phòng homestay rất sạch sẽ và trang trí đẹp mắt, view nhìn ra thung lũng tuyệt vời. Chủ homestay rất thân thiện và nhiệt tình giới thiệu những địa điểm đẹp ở Mộc Châu. Bữa sáng ngon miệng với nhiều món đặc sản địa phương. Chắc chắn sẽ quay lại vào dịp tiếp theo!',
    rating: 5,
  },
  {
    id: 3,
    author: 'Anh Khánh',
    location: 'Đà Nẵng',
    content:
      'Lần đầu tiên đến Mộc Châu và lựa chọn ChillStay là quyết định đúng đắn. Không gian yên tĩnh, gần gũi thiên nhiên nhưng vẫn đầy đủ tiện nghi. Đặc biệt ấn tượng với cách bài trí mang đậm văn hóa dân tộc Thái. Nhân viên chu đáo và luôn sẵn sàng hỗ trợ mọi lúc.',
    rating: 4,
  },
  {
    id: 4,
    author: 'Bạn Minh Hoàng',
    location: 'Hải Phòng',
    content:
      'ChillStay là điểm đến hoàn hảo cho chuyến phượt Mộc Châu của nhóm mình. Phòng rộng rãi, sạch sẽ, giá cả hợp lý. Đặc biệt, được ngủ trong những căn nhà gỗ giữa khung cảnh thiên nhiên tuyệt đẹp là trải nghiệm khó quên. Chủ homestay rất nhiệt tình giới thiệu các địa điểm thú vị xung quanh.',
    rating: 5,
  },
  {
    id: 5,
    author: 'Cô Thanh Hằng và bạn',
    location: 'Thái Nguyên',
    content:
      'Đã tới nhiều homestay ở Mộc Châu nhưng ChillStay là nơi để lại ấn tượng nhất. Không gian thoáng đãng, view đẹp, đồ ăn ngon và phong cách phục vụ chuyên nghiệp. Đặc biệt thích không gian cà phê nhỏ trong khu vực homestay, rất thích hợp để ngồi ngắm mây trôi và thưởng thức đồ uống.',
    rating: 5,
  },
])

// Thêm dữ liệu tin tức mẫu
// const newsArticles = ref([
//   {
//     id: 1,
//     title: 'Top 3 đồi chè đẹp nhất đáng để ghé thăm tại Mộc Châu',
//     excerpt:
//       'Những đồi chè xanh mướt trải dài tạo nên khung cảnh tuyệt đẹp là điểm đến không thể bỏ qua khi du lịch Mộc Châu.',
//     image:
//       'https://images.unsplash.com/photo-1598968693740-7ed0a5c0a8a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
//     date: '20/05/2023',
//   },
//   {
//     id: 2,
//     title: 'Ẩm thực Mộc Châu - Món ngon đặc sản không thể bỏ lỡ',
//     excerpt:
//       'Khám phá các món ăn đặc trưng của Mộc Châu từ thịt trâu gác bếp, cá suối nướng đến rau đặc sản vùng cao.',
//     image:
//       'https://images.unsplash.com/photo-1569058242253-92a0c8223b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
//     date: '15/06/2023',
//   },
//   {
//     id: 3,
//     title: 'Top 3 khu nghỉ dưỡng gần thác Dải Yếm dành cho gia đình',
//     excerpt:
//       'Chỉ cần rời khỏi thành phố khoảng 1-2 giờ đồng hồ, bạn đã có thể tận hưởng không gian nghỉ dưỡng tuyệt vời.',
//     image:
//       'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
//     date: '10/07/2023',
//   },
// ])

// // Thêm state cho phần tin tức
const newsArticles = ref([])
const isLoadingNews = ref(false)
const hasNewsError = ref(false)
const newsErrorMessage = ref('')
const defaultNewsImage =
  'https://images.unsplash.com/photo-1598968693740-7ed0a5c0a8a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'

// Đánh giá hiện tại đang được hiển thị
const activeReview = computed(() => {
  return reviews.value[activeReviewIndex.value]
})

// Phương thức tìm kiếm
const handleSearch = () => {
  console.log('Đang tìm kiếm với:', {
    tên: searchName.value,
    địaĐiểm: searchLocation.value,
    giáCả: searchPrice.value,
  })

  // Chuyển đến trang kết quả tìm kiếm với các tham số tương ứng
  router.push({
    path: '/all-homestays',
    query: {
      name: searchName.value,
      location: searchLocation.value !== 'Tất cả địa điểm' ? searchLocation.value : null,
      price: searchPrice.value !== 'Tất cả mức giá' ? searchPrice.value : null,
    },
  })
}

// Phương thức chuyển đến trang Booking
const navigateToBooking = (homestayId) => {
  router.push(`/homestay/${homestayId}`)
}

// Lọc chỉ các homestay có trạng thái Hoạt động (chấp nhận cả boolean true hoặc chuỗi "Hoạt động")
const activeHomestays = computed(() => {
  console.log('Tổng số homestay:', homestays.value.length)
  const result = homestays.value.filter(
    (home) => home.trangThai === true || home.trangThai === 'Hoạt động',
  )
  console.log('Số homestay đang hoạt động:', result.length)
  return result
})

// Hiển thị 6 homestay trên trang chủ thay vì 3
const displayedHomestays = computed(() => {
  return activeHomestays.value.slice(0, 6)
})

// Phương thức chuyển đến trang hiển thị tất cả homestay
const viewAllHomestays = () => {
  console.log('Chuyển hướng đến trang tất cả homestay')
  router.push('/all-homestays')
}

const fetchHomestayData = async () => {
  try {
    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''

    try {
      // Gọi API để lấy dữ liệu homestay
      const res = await getAllHomeStay()
      console.log('Dữ liệu homestay từ API:', res.data)

      // In ra xem có trường hotenChuHomestay không
      if (res.data && res.data.length > 0) {
        console.log('Kiểm tra dữ liệu homestay đầu tiên:', {
          id: res.data[0].id,
          ten: res.data[0].tenHomestay,
          chu: res.data[0].hotenChuHomestay,
          allProps: Object.keys(res.data[0]),
        })
      }

      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        homestays.value = await Promise.all(
          res.data.map(async (homestay) => {
            try {

              // Kiểm tra nếu homestay đã có trường hình ảnh từ dữ liệu trực tiếp
              if (homestay.Hinh_Anh) {
                homestay.hinhAnh = homestay.Hinh_Anh;
                console.log(`Sử dụng hình ảnh từ dữ liệu trực tiếp cho homestay ${homestay.id}:`, homestay.Hinh_Anh);
              }
              // Nếu không có trường Hinh_Anh, thử với trường viết thường hinhAnh
              else if (homestay.hinhAnh) {
                // Đã có hình ảnh, không cần làm gì thêm
                console.log(`Đã có hình ảnh cho homestay ${homestay.id}:`, homestay.hinhAnh);
              }
              // Thử tìm trong các thuộc tính khác có thể chứa URL hình ảnh
              else if (homestay.image || homestay.imageUrl || homestay.anhDaiDien || homestay.anhBia) {
                homestay.hinhAnh = homestay.image || homestay.imageUrl || homestay.anhDaiDien || homestay.anhBia;
                console.log(`Sử dụng hình ảnh thay thế cho homestay ${homestay.id}:`, homestay.hinhAnh);
              }
              // Nếu không có trường hình ảnh trực tiếp, gọi API để lấy
              else {
                const anhResponse = await getAnhHomeStayByHomestayId(homestay.id)
                if (anhResponse && anhResponse.data && anhResponse.data.length > 0) {
                  // Ưu tiên ảnh bìa đang hoạt động
                  const anhBia = anhResponse.data.find(img => img.anhBia === true && img.trangThai !== false) ||
                    anhResponse.data.find(img => img.anhBia === true);

                  // Nếu không có ảnh bìa, dùng ảnh đầu tiên đang hoạt động
                  const anhDauTien = anhBia || anhResponse.data.find(img => img.trangThai !== false) || anhResponse.data[0];

                  if (anhDauTien) {
                    homestay.hinhAnh = anhDauTien.duongDanAnh;
                    console.log(`Lấy hình ảnh từ API cho homestay ${homestay.id}:`, anhDauTien.duongDanAnh);
                  } else {
                    console.log(`Không tìm thấy ảnh phù hợp cho homestay ${homestay.id}`);
                  }


                } else {
                  console.log(`Không có ảnh nào cho homestay ${homestay.id}`);
                }
              }
            } catch (imgError) {
              console.error(`Lỗi khi lấy ảnh cho homestay ${homestay.id}:`, imgError)
            }
            return homestay
          }),
        )
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

// Hàm lấy dữ liệu tin tức từ API
const fetchNewsData = async () => {
  try {
    isLoadingNews.value = true
    hasNewsError.value = false
    newsErrorMessage.value = ''

    const res = await getAllTinTuc()
    console.log('Dữ liệu tin tức từ API:', res.data)

    if (res.data && Array.isArray(res.data)) {
      // Lấy 3 tin tức mới nhất
      const latestNews = res.data
        .filter((news) => news.trangThai !== false) // Lọc tin tức có trạng thái hoạt động
        .sort((a, b) => new Date(b.ngayDang) - new Date(a.ngayDang)) // Sắp xếp theo ngày đăng mới nhất
        .slice(0, 3) // Lấy 3 tin tức đầu tiên

      // Lấy ảnh bìa cho mỗi tin tức
      newsArticles.value = await Promise.all(
        latestNews.map(async (news) => {
          try {
            const anhResponse = await getAnhTinTucByTinTucId(news.id)
            if (anhResponse && anhResponse.data && anhResponse.data.length > 0) {
              // Tìm ảnh bìa hoặc ảnh đầu tiên
              const coverImage =
                anhResponse.data.find((img) => img.anhBia === true) || anhResponse.data[0]
              if (coverImage) {
                news.anhBia = coverImage.duongDanAnh
              }
            }
          } catch (imgError) {
            console.error(`Lỗi khi lấy ảnh cho tin tức ${news.id}:`, imgError)
          }

          // Tạo mô tả ngắn nếu không có
          if (!news.moTaNgan && news.noiDung) {
            // Lấy 150 ký tự đầu tiên từ nội dung và loại bỏ các thẻ HTML
            news.moTaNgan =
              news.noiDung
                .replace(/<[^>]*>/g, '') // Loại bỏ các thẻ HTML
                .slice(0, 150) + '...'
          }

          return news
        }),
      )
    } else {
      hasNewsError.value = true
      newsErrorMessage.value = 'Không có dữ liệu tin tức nào được tìm thấy.'
    }
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu tin tức:', error)
    hasNewsError.value = true
    newsErrorMessage.value = 'Đã xảy ra lỗi khi tải dữ liệu tin tức. Vui lòng thử lại sau.'
  } finally {
    isLoadingNews.value = false
  }
}

// Biến cho hero slideshow
const currentSlide = ref(0);
const slideInterval = ref(null);

// Phương thức cho slideshow
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % 3;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + 3) % 3;
};

const setSlide = (index) => {
  currentSlide.value = index;
};

const startSlideshow = () => {
  stopSlideshow(); // Clear any existing interval
  slideInterval.value = setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopSlideshow = () => {
  if (slideInterval.value) {
    clearInterval(slideInterval.value);
    slideInterval.value = null;
  }
};

// Biến cho FAQ
const activeFaq = ref(null);
const faqItems = ref([
  {
    question: "Thời gian nhận và trả phòng?",
    answer: "Giờ nhận phòng: 14:00, giờ trả phòng: 12:00. Nếu bạn cần nhận phòng sớm hoặc trả phòng muộn, vui lòng liên hệ trước để chúng tôi hỗ trợ."
  },
  {
    question: "Chính sách hủy đặt phòng?",
    answer: "Miễn phí hủy phòng trước 7 ngày. Hủy trong vòng 3-7 ngày sẽ mất 50% tiền đặt cọc. Hủy trong vòng 3 ngày sẽ không được hoàn tiền đặt cọc."
  },
  {
    question: "Có dịch vụ đưa đón không?",
    answer: "Có, chúng tôi cung cấp dịch vụ đưa đón từ bến xe Mộc Châu với chi phí bổ sung. Vui lòng đặt trước ít nhất 24 giờ."
  },
  {
    question: "Có chỗ đậu xe không?",
    answer: "Có, tất cả các homestay của chúng tôi đều có bãi đậu xe miễn phí cho khách."
  },
  {
    question: "Có cho phép mang thú cưng không?",
    answer: "Một số homestay cho phép mang thú cưng với điều kiện riêng. Vui lòng liên hệ trực tiếp để biết chi tiết."
  }
]);

// Phương thức cho FAQ
const toggleFaq = (index) => {
  if (activeFaq.value === index) {
    activeFaq.value = null;
  } else {
    activeFaq.value = index;
  }
};

// Khởi tạo slideshow khi component được mount
onMounted(() => {
  startSlideshow();

  // Tiếp tục các onMounted hiện có
  fetchHomestayData();
  fetchNewsData();
});

// Tạm dừng slideshow khi tab không được focus
watch(() => document.visibilityState, (newState) => {
  if (newState === 'visible') {
    startSlideshow();
  } else {
    stopSlideshow();
  }
});

onMounted(async () => {
  await fetchHomestayData()
  await fetchNewsData()
})

// Helper function to fix image URLs if they start with a slash
const fixImageUrl = (url) => {
  if (!url) return defaultImage

  // If it's already an absolute URL, return it as is
  if (url.startsWith('http')) {
    return url
  }

  // If it's a relative URL
  if (url.startsWith('/')) {
    // Use the API base URL from api.js
    return api.defaults.baseURL + url
  }

  return url
}
</script>

<style scoped>
/* Nhập Google Fonts (giống Mixivivu sử dụng font sans-serif hiện đại) */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

/* Đặt lại và kiểu cơ bản */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-container {
  font-family: 'Roboto', sans-serif;
  color: #333;
  background: #f8f9fa;
  /* Nền xám nhạt giống Mixivivu */
}

/* Container */
.container {
  max-width: 1140px;
  /* Tương tự Mixivivu */
  margin: 0 auto;
  padding: 0 15px;
}

/* Cải thiện Hero Section với slideshow */
.hero-section {
  position: relative;
  height: 500px;
  overflow: hidden;
  color: #fff;
}

.hero-slideshow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  z-index: 1;
}

.slide.active {
  opacity: 1;
  z-index: 2;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  font-size: 20px;
}

.slide-nav:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.slide-nav.prev {
  left: 20px;
}

.slide-nav.next {
  right: 20px;
}

.slide-indicators {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 10;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: white;
  transform: scale(1.2);
}

.hero-content {
  position: relative;
  z-index: 5;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
  z-index: 3;
}

.hero-text {
  position: relative;
  z-index: 4;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 15px;
  line-height: 1.2;
  text-align: left;
}

.highlight {
  color: #ff6200;
  /* Màu cam nổi bật giống Mixivivu */
}

.hero-subtitle {
  font-size: 1.2rem;
  font-weight: 400;
  margin-bottom: 30px;
  opacity: 0.9;
  text-align: left;
}

.hero-search {
  background: #fff;
  border-radius: 30px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin: 0 auto;
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

.search-input input[readonly] {
  background: #f8f9fa;
  cursor: not-allowed;
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

/* Phần Tính Năng */
.features-section {
  padding: 60px 0;
  background: #fff;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  text-align: left;
  margin-bottom: 25px;
  color: #333;
  padding-left: 10px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-card {
  background: #fff;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: 1px solid #e8e8e8;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 2rem;
  color: #48cae4;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
}

.feature-card p {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.5;
}

/* Phần Homestay - updated with border */
.homestays-section {
  padding: 60px 0;
  background: #f8f9fa;
}

/* Cập nhật phần CSS cho Homestay Cards */
.homestays-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.homestay-card {
  background: #fff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: 1px solid #e8e8e8;
  position: relative;
}

.homestay-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.homestay-image {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.homestay-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.homestay-status {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 4px 12px;
  background: #28a745;
  color: #fff;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 2;
}

.homestay-rating {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(255, 193, 7, 0.9);
  color: #fff;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stars {
  color: #fff;
  font-size: 0.85rem;
}

.rating-text {
  color: #fff;
  font-size: 0.8rem;
}

.homestay-content {
  padding: 20px;
}

.homestay-location {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: #6c757d;
}

.homestay-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
}

.homestay-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
  font-size: 0.85rem;
  color: #6c757d;
}

.homestay-details span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.homestay-owner {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  font-size: 0.85rem;
  color: #6c757d;
  border-bottom: 1px solid #e8e8e8;
}

.homestay-price {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 20px;
}

.price {
  font-size: 1.4rem;
  font-weight: 600;
  color: #48cae4;
}

.price-unit {
  font-size: 0.9rem;
  color: #6c757d;
}

.book-now-btn {
  width: 100%;
  padding: 12px;
  background: #48cae4;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  text-align: center;
}

.book-now-btn:hover {
  background: #0096c7;
}

.view-more {
  text-align: center;
  margin-top: 35px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.view-more-btn {
  padding: 12px 30px;
  background: #48cae4;
  color: #fff;
  border: none;
  border-radius: 30px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  min-width: 200px;
}

.view-more-btn:hover {
  background: #0096c7;
}

/* Phần Kêu Gọi Hành Động */
.cta-section {
  background: linear-gradient(135deg, #48cae4, #0096c7);
  color: #fff;
  padding: 60px 0;
  text-align: center;
  border-radius: 0;
}

.cta-content h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.cta-content p {
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto 30px;
  color: #e9ecef;
}

.cta-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.cta-btn {
  padding: 12px 30px;
  border-radius: 30px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cta-btn.primary {
  background: #ff6200;
  /* Màu cam nổi bật giống Mixivivu */
  color: #fff;
}

.cta-btn.primary:hover {
  background: #e65100;
}

.cta-btn.secondary {
  background: transparent;
  border: 2px solid #fff;
  color: #fff;
}

.cta-btn.secondary:hover {
  background: #fff;
  color: #007bff;
}

/* Trạng thái Tải và Lỗi */
.loading-container,
.error-container {
  text-align: center;
  padding: 35px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
  border: 1px solid #e8e8e8;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.loading-container p {
  font-size: 1rem;
  color: #007bff;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.error-container p {
  font-size: 1rem;
  color: #dc3545;
}

.retry-btn {
  background: #48cae4;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #0096c7;
}

/* Phần Đánh giá */
.reviews-section {
  padding: 80px 0;
  background: #e6f7fb;
  position: relative;
  overflow: hidden;
}

.reviews-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNDQwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBvcGFjaXR5PSIwLjEiIGQ9Ik0tMzUwLjM1OSAtMjI0LjQxNUMzOS4zNzEgLTQ0Ni44OTMgNzAwLjQyMyA3Ni4wNDggMTIxMy45NSAzNTYuMDg1QzE3MjcuNDggNjM2LjEyMyAxNjQ4LjE1IDEyNjEuMjMgMTI1OC40MiAxNDgzLjcxQzg2OC42ODggMTcwNi4xOSAyMDcuNjM2IDExODMuMjUgLTMwNS44ODkgOTAzLjIxNEMtODE5LjQxNCA2MjMuMTc2IC03NDAuMDg5IC0xLjkzOCAtMzUwLjM1OSAtMjI0LjQxNVoiIHN0cm9rZT0iIzQ4Y2FlNCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.4;
  z-index: 1;
}

.reviews-section::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 50px;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDE0NDAgODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE0NDAsMEgwVjgwQzI0MCw1MCA0ODAsMjAgNzIwLDIwQzk2MCwyMCAxMjAwLDUwIDE0NDAsODBWMFoiIGZpbGw9IiNlNmY3ZmIiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+');
  background-size: cover;
  z-index: 1;
}

.reviews-content {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.reviews-header {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.reviews-slider {
  position: relative;
  margin-bottom: 40px;
}

.review-quote {
  background: #fff;
  border-radius: 15px;
  padding: 40px 40px 40px 60px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  border-left: 4px solid #48cae4;
}

.quote-icon {
  position: absolute;
  top: 30px;
  left: 30px;
  font-size: 6rem;
  color: #48cae4;
  opacity: 0.2;
  font-family: Georgia, serif;
  line-height: 0;
  height: 40px;
}

.quote-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 20px;
}

.author-info {
  color: #666;
  font-size: 0.95rem;
  text-align: right;
  font-weight: 500;
}

.review-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.tab-button {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: #f0f9fc;
  border-color: #48cae4;
}

.tab-button.active {
  background: #48cae4;
  color: #fff;
  border-color: #48cae4;
}

@media (max-width: 768px) {
  .review-tabs {
    justify-content: center;
  }

  .reviews-subtitle {
    text-align: left;
    margin-left: 0;
  }
}

/* Phần Tin tức */
.news-section {
  padding: 80px 0;
  background: #fff;
}

.news-header {
  margin-bottom: 40px;
  position: relative;
}

.news-subtitle {
  font-size: 1.1rem;
  color: #666;
  max-width: 800px;
  margin-top: 5px;
  padding-left: 10px;
}

.news-divider {
  width: 80px;
  height: 4px;
  background: #48cae4;
  margin: 15px 0 0 10px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.news-card {
  background: #fff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: 1px solid #e8e8e8;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.news-image {
  height: 220px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-card:hover .news-image img {
  transform: scale(1.05);
}

.news-title {
  padding: 20px 20px 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.news-excerpt {
  padding: 0 20px 15px;
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
}

.news-read-more {
  display: inline-block;
  padding: 0 20px 20px;
  color: #48cae4;
  font-weight: 500;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.news-read-more:hover {
  color: #0096c7;
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}

/* Phần Câu hỏi thường gặp */
.faq-section {
  padding: 60px 0;
  background-color: #ffffff;
}

.faq-subtitle {
  font-size: 1.1rem;
  color: #666;
  max-width: 700px;
  margin: 15px 0 30px 10px;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  margin-bottom: 15px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
}

.faq-question {
  background-color: #fff;
  padding: 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.faq-question:hover {
  background-color: #f9f9f9;
}

.faq-question.active {
  background-color: #f0f9fc;
  border-left: 4px solid #48cae4;
}

.faq-question h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  color: #333;
}

.faq-question i {
  color: #48cae4;
  transition: transform 0.3s ease;
}

.faq-question.active i {
  transform: rotate(180deg);
}

.faq-answer {
  background-color: #fff;
  padding: 0 20px;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-answer.show {
  max-height: 300px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.faq-answer p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #666;
}

/* Thiết kế Responsive */
@media (max-width: 1024px) {
  .search-box {
    flex-direction: column;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .homestays-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .search-btn {
    width: 100%;
  }
}
</style>
