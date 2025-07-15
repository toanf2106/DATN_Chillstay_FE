<template>
  <div class="danh-gia-container">
    <div class="page-header">
      <h1><i class="fas fa-star-half-alt"></i> Quản lý Đánh giá</h1>
    </div>

    <div class="filter-container">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Tìm kiếm theo mã đánh giá hoặc tên khách hàng"
          @input="filterDanhGia"
        />
      </div>
      <div class="filter-options">
        <div class="select-wrapper">
          <select v-model="filterStatus" @change="filterDanhGia">
            <option value="all">Tất cả trạng thái</option>
            <option value="true">Hiển thị</option>
            <option value="false">Ẩn</option>
            <option value="deleted">Đã xóa</option>
          </select>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="select-wrapper">
          <select v-model="sortBy" @change="filterDanhGia">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest">Điểm cao nhất</option>
            <option value="lowest">Điểm thấp nhất</option>
          </select>
          <i class="fas fa-chevron-down"></i>
        </div>
      </div>
    </div>

    <div class="loading-container" v-if="loading">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Đang tải dữ liệu...</span>
      </div>
    </div>

    <div class="danh-gia-grid" v-else-if="filteredDanhGia.length > 0">
      <div class="danh-gia-card" v-for="danhGia in filteredDanhGia" :key="danhGia.id" :class="{'deleted': danhGia.isDeleted}">
        <div class="card-header" :class="{'active': danhGia.trangThai && !danhGia.isDeleted, 'deleted': danhGia.isDeleted}">
          <div class="review-id">
            <i class="fas fa-hashtag"></i> {{ danhGia.maDanhGia }}
          </div>
          <div class="review-status">
            <span v-if="danhGia.isDeleted" class="status deleted">
              <i class="fas fa-trash-alt"></i> Đã xóa
            </span>
            <span v-else-if="danhGia.trangThai" class="status hiển-thị">
              <i class="fas fa-eye"></i> Hiển thị
            </span>
            <span v-else class="status ẩn">
              <i class="fas fa-eye-slash"></i> Ẩn
            </span>
          </div>
        </div>
        <div class="card-content">
          <div class="info-row">
            <span class="label"><i class="fas fa-home"></i> Homestay:</span>
            <span class="value homestay-name">{{ getHomestayName(danhGia.homeStayId) }}</span>
          </div>
          <div class="info-row">
            <span class="label"><i class="fas fa-user"></i> Khách hàng:</span>
            <span class="value customer-name">{{ getKhachHangName(danhGia.khachHangId) }}</span>
          </div>
          <div class="info-row">
            <span class="label"><i class="fas fa-star"></i> Điểm đánh giá:</span>
            <span class="value rating">
              <span class="stars">
                <!-- Sử dụng v-for để tạo 5 sao -->
                <template v-for="n in 5" :key="n">
                  <!-- Sao đầy đủ: n <= điểm số nguyên -->
                  <i v-if="Math.floor(danhGia.diemSo) >= n" class="fas fa-star filled"></i>
                  <!-- Nửa sao: n = điểm số nguyên + 1 và phần thập phân >= 0.5 -->
                  <i v-else-if="Math.floor(danhGia.diemSo) === n-1 && (danhGia.diemSo % 1) >= 0.5"
                     class="fas fa-star-half-alt filled"></i>
                  <!-- Sao trống -->
                  <i v-else class="far fa-star"></i>
                </template>
              </span>
              <span class="score">{{ parseFloat(danhGia.diemSo).toFixed(1) }}/5</span>
            </span>
          </div>
          <div class="info-row">
            <span class="label"><i class="fas fa-calendar-alt"></i> Thời gian:</span>
            <span class="value time">{{ formatDate(danhGia.thoiGianDanhGia) }}</span>
          </div>
          <div class="review-content">
            <p><i class="fas fa-quote-left quote-icon"></i> {{ danhGia.noiDung }} <i class="fas fa-quote-right quote-icon"></i></p>
          </div>
        </div>
        <div class="card-actions">
          <template v-if="!danhGia.isDeleted">
            <button
              @click="toggleStatus(danhGia)"
              :class="danhGia.trangThai ? 'hide-btn' : 'show-btn'"
            >
              <i :class="danhGia.trangThai ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              {{ danhGia.trangThai ? 'Ẩn đánh giá' : 'Hiển thị đánh giá' }}
            </button>
            <button
              @click="softDelete(danhGia)"
              class="delete-btn"
            >
              <i class="fas fa-trash-alt"></i> Xóa đánh giá
            </button>
          </template>
          <button
            v-else
            @click="restoreReview(danhGia)"
            class="restore-btn"
          >
            <i class="fas fa-trash-restore"></i> Khôi phục đánh giá
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <i class="fas fa-comment-slash empty-icon"></i>
      <p>Không có đánh giá nào được tìm thấy</p>
      <small>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</small>
    </div>

    <div class="pagination-container" v-if="totalPages > 1">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="pagination-info">
        <span>Trang {{ currentPage }} / {{ totalPages }}</span>
      </div>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <div class="load-more" v-if="hasMoreItems && filteredDanhGia.length > 0">
      <button @click="loadMore">
        <i class="fas fa-sync"></i> Xem thêm đánh giá
      </button>
    </div>
  </div>
</template>

<script>
import { getAllDanhGia } from '@/Service/DanhGiaService';
import { getHomeStayById } from '@/Service/HomeStayService';
import { getKhachHangById } from '@/Service/khachHangService';
import { ref, onMounted, computed } from 'vue';

export default {
  name: 'DanhGia',
  setup() {
    const danhGiaList = ref([]);
    const filteredDanhGia = ref([]);
    const searchTerm = ref('');
    const filterStatus = ref('all');
    const sortBy = ref('newest');
    const currentPage = ref(1);
    const itemsPerPage = ref(8);
    const homestayNames = ref({});
    const khachHangNames = ref({});
    const loading = ref(false);
    const hasMoreItems = ref(false);
    const deletedReviews = ref(new Set()); // Lưu trữ ID của các đánh giá đã bị xóa mềm

    const totalPages = computed(() => {
      return Math.ceil(filteredDanhGia.value.length / itemsPerPage.value);
    });

    const fetchDanhGia = async () => {
      try {
        loading.value = true;
        const response = await getAllDanhGia();
        danhGiaList.value = response.data.map(item => ({
          ...item,
          isDeleted: false // Thêm trường isDeleted để theo dõi trạng thái xóa mềm
        }));
        // Thêm mock data cho demo nếu cần
        if (danhGiaList.value.length === 0) {
          danhGiaList.value = generateMockData();
        }

        // Lấy thông tin homestay và khách hàng
        await fetchRelatedData();

        filterDanhGia();
        loading.value = false;
      } catch (error) {
        console.error('Error fetching reviews:', error);
        loading.value = false;
        // Thêm mock data nếu API lỗi
        danhGiaList.value = generateMockData();
        filterDanhGia();
      }
    };

    // Lấy thông tin tên homestay và khách hàng dựa vào ID
    const fetchRelatedData = async () => {
      try {
        // Lấy danh sách ID homestay và khách hàng độc nhất
        const uniqueHomestayIds = [...new Set(danhGiaList.value.map(item => item.homeStayId))];
        const uniqueKhachHangIds = [...new Set(danhGiaList.value.map(item => item.khachHangId))];

        // Fetch thông tin homestay
        const homestayPromises = uniqueHomestayIds.map(async (id) => {
          try {
            const response = await getHomeStayById(id);
            if (response.data) {
              homestayNames.value[id] = response.data.tenHomestay;
            }
          } catch (error) {
            console.error(`Error fetching homestay info for ID ${id}:`, error);
          }
        });

        // Fetch thông tin khách hàng
        const khachHangPromises = uniqueKhachHangIds.map(async (id) => {
          try {
            const response = await getKhachHangById(id);
            if (response.data) {
              khachHangNames.value[id] = response.data.tenKhachHang;
            }
          } catch (error) {
            console.error(`Error fetching customer info for ID ${id}:`, error);
          }
        });

        // Đợi tất cả các promise hoàn thành
        await Promise.allSettled([...homestayPromises, ...khachHangPromises]);

      } catch (error) {
        console.error('Error fetching related data:', error);
      }
    };

    const filterDanhGia = () => {
      let filtered = [...danhGiaList.value];

      // Filter by search term
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();
        filtered = filtered.filter(item =>
          (item.maDanhGia && item.maDanhGia.toLowerCase().includes(term)) ||
          (getKhachHangName(item.khachHangId).toLowerCase().includes(term)) ||
          (getHomestayName(item.homeStayId).toLowerCase().includes(term))
        );
      }

      // Filter by status
      if (filterStatus.value !== 'all') {
        if (filterStatus.value === 'deleted') {
          filtered = filtered.filter(item => item.isDeleted);
        } else {
          const status = filterStatus.value === 'true';
          filtered = filtered.filter(item => item.trangThai === status && !item.isDeleted);
        }
      } else {
        // Trong trường hợp 'all', vẫn lọc ra các item không bị xóa mềm trừ khi người dùng đang lọc theo từ khóa
        if (!searchTerm.value) {
          filtered = filtered.filter(item => !item.isDeleted);
        }
      }

      // Sort items
      switch(sortBy.value) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.thoiGianDanhGia) - new Date(a.thoiGianDanhGia));
          break;
        case 'oldest':
          filtered.sort((a, b) => new Date(a.thoiGianDanhGia) - new Date(b.thoiGianDanhGia));
          break;
        case 'highest':
          filtered.sort((a, b) => b.diemSo - a.diemSo);
          break;
        case 'lowest':
          filtered.sort((a, b) => a.diemSo - b.diemSo);
          break;
      }

      filteredDanhGia.value = filtered;
      hasMoreItems.value = filteredDanhGia.value.length > itemsPerPage.value * currentPage.value;
    };

    const getHomestayName = (id) => {
      return homestayNames.value[id] || `Homestay #${id}`;
    };

    const getKhachHangName = (id) => {
      return khachHangNames.value[id] || `Khách hàng #${id}`;
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const toggleStatus = (danhGia) => {
      // Thực hiện API call để thay đổi trạng thái nếu có API endpoint
      // Hoặc sử dụng cách này cho demo
      danhGia.trangThai = !danhGia.trangThai;
    };

    const softDelete = (danhGia) => {
      // Đánh dấu đánh giá là đã xóa mềm (chỉ ở UI)
      danhGia.isDeleted = true;
      deletedReviews.value.add(danhGia.id);
      filterDanhGia(); // Cập nhật lại danh sách hiển thị
    };

    const restoreReview = (danhGia) => {
      // Khôi phục đánh giá đã xóa mềm
      danhGia.isDeleted = false;
      deletedReviews.value.delete(danhGia.id);
      filterDanhGia(); // Cập nhật lại danh sách hiển thị
    };

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    const loadMore = () => {
      itemsPerPage.value += 8;
      hasMoreItems.value = filteredDanhGia.value.length > itemsPerPage.value;
    };

    // Mock data for demo purposes
    const generateMockData = () => {
      const mockData = [];
      const homestays = ['Nhà Sàn Mộc Châu 1', 'Villa Thung Lũng', 'Sea View Resort', 'Mountain Retreat'];
      const customers = ['Nguyễn Văn A', 'Lê Thị Hồng', 'Trần Minh Tuấn', 'Phạm Thị Lan'];

      for (let i = 1; i <= 20; i++) {
        const homestayId = Math.floor(Math.random() * 4) + 1;
        const khachHangId = Math.floor(Math.random() * 4) + 1;

        homestayNames.value[homestayId] = homestays[homestayId - 1];
        khachHangNames.value[khachHangId] = customers[khachHangId - 1];

        mockData.push({
          id: i,
          datHomeId: 100 + i,
          khachHangId: khachHangId,
          homeStayId: homestayId,
          maDanhGia: `DG${10000 + i}`,
          diemSo: (Math.floor(Math.random() * 10) + 1) / 2, // Random score between 0.5 and 5.0
          noiDung: getRandomReview(),
          thoiGianDanhGia: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          trangThai: Math.random() > 0.2, // 80% chance of being visible
          isDeleted: false // Thêm trạng thái xóa mềm
        });
      }

      return mockData;
    };

    const getRandomReview = () => {
      const reviews = [
        "Chỗ ở rất thoải mái và sạch sẽ. Nhân viên thân thiện và nhiệt tình. Tôi rất hài lòng với kỳ nghỉ của mình.",
        "Không gian rất đẹp, view nhìn ra núi rất thích. Tuy nhiên đồ ăn tại nhà hàng hơi đắt so với chất lượng.",
        "Tôi thực sự yêu thích nơi này! Không gian yên tĩnh, thoáng mát, phù hợp để nghỉ dưỡng và thư giãn.",
        "Phòng ốc sạch sẽ, tiện nghi đầy đủ. Tuy nhiên vị trí hơi xa trung tâm nên việc di chuyển không thuận tiện lắm.",
        "Phục vụ tốt, nhân viên thân thiện. Tuy nhiên phòng có mùi ẩm mốc, cần cải thiện hơn về vệ sinh.",
        "Đồ ăn sáng ngon, view đẹp, nhân viên thân thiện. Chắc chắn sẽ quay lại lần sau.",
        "Tôi đặc biệt ấn tượng với cách bài trí không gian và phong cách thiết kế của homestay. Rất đáng để trải nghiệm!"
      ];

      return reviews[Math.floor(Math.random() * reviews.length)];
    };

    onMounted(() => {
      fetchDanhGia();
    });

    return {
      danhGiaList,
      filteredDanhGia,
      searchTerm,
      filterStatus,
      sortBy,
      currentPage,
      totalPages,
      hasMoreItems,
      filterDanhGia,
      getHomestayName,
      getKhachHangName,
      formatDate,
      toggleStatus,
      softDelete,
      restoreReview,
      changePage,
      loadMore
    };
  }
}
</script>

<style scoped>
.danh-gia-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  color: #333;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  margin-bottom: 25px;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 15px;
}

.page-header h1 {
  font-size: 28px;
  color: #3a3a3a;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.page-header h1 i {
  color: #ffb400;
  margin-right: 10px;
  font-size: 24px;
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.search-box {
  position: relative;
  flex-grow: 1;
}

.search-box input {
  padding: 12px 15px 12px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 100%;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.search-box input:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
}

.filter-options {
  display: flex;
  gap: 15px;
}

.select-wrapper {
  position: relative;
}

.select-wrapper i {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
  pointer-events: none;
}

.filter-options select {
  padding: 12px 35px 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
  appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.filter-options select:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  outline: none;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 50px 0;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: #666;
}

.loading-spinner i {
  font-size: 40px;
  color: #4a90e2;
}

.danh-gia-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.danh-gia-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.danh-gia-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.danh-gia-card.deleted {
  opacity: 0.75;
  border: 1px dashed #e0e0e0;
  background-color: #f9f9f9;
  box-shadow: none;
}

.danh-gia-card.deleted:hover {
  transform: none;
}

.card-header {
  padding: 18px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header.active {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-bottom: 1px solid #bbdefb;
}

.card-header.deleted {
  background: #f9f9f9;
  border-bottom: 1px dashed #e0e0e0;
}

.review-id {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
}

.review-id i {
  color: #666;
  font-size: 14px;
}

.deleted .review-id {
  color: #999;
}

.review-status .status {
  padding: 6px 10px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.review-status .status i {
  font-size: 11px;
}

.review-status .hiển-thị {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.review-status .ẩn {
  background-color: #ffebee;
  color: #c62828;
}

.review-status .deleted {
  background-color: #f5f5f5;
  color: #757575;
}

.card-content {
  padding: 20px;
  flex-grow: 1;
}

.deleted .card-content {
  color: #999;
}

.info-row {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.info-row .label {
  font-weight: 500;
  color: #666;
  width: 120px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.info-row .label i {
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.deleted .info-row .label {
  color: #999;
}

.info-row .value {
  color: #333;
  flex-grow: 1;
  font-weight: 400;
}

.deleted .info-row .value {
  color: #999;
}

.homestay-name, .customer-name {
  font-weight: 500;
  color: #4a90e2;
}

.deleted .homestay-name, .deleted .customer-name {
  color: #999;
}

.stars {
  color: #ddd;
  display: inline-flex;
  margin-right: 8px;
  gap: 2px;
}

.stars .filled {
  color: #ffb400;
}

.deleted .stars .filled {
  color: #ccc;
}

.score {
  font-weight: 600;
  color: #333;
  background-color: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 13px;
}

.deleted .score {
  color: #999;
  background-color: transparent;
}

.review-content {
  margin-top: 15px;
  padding: 15px;
  border-top: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.quote-icon {
  font-size: 12px;
  opacity: 0.6;
  margin: 0 5px;
}

.deleted .review-content {
  border-top: 1px dashed #eee;
  background-color: transparent;
}

.review-content p {
  margin: 0;
  color: #555;
  line-height: 1.6;
  font-size: 14px;
  max-height: 100px;
  overflow-y: auto;
}

.deleted .review-content p {
  color: #999;
}

.card-actions {
  padding: 15px 20px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #fafafa;
}

.deleted .card-actions {
  border-top: 1px dashed #e0e0e0;
}

.card-actions button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-actions button i {
  font-size: 13px;
}

.show-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.show-btn:hover {
  background-color: #bbdefb;
}

.hide-btn {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.hide-btn:hover {
  background-color: #e1bee7;
}

.delete-btn {
  background-color: #ffebee;
  color: #d32f2f;
}

.delete-btn:hover {
  background-color: #ffcdd2;
}

.restore-btn {
  background-color: #e8f5e9;
  color: #388e3c;
}

.restore-btn:hover {
  background-color: #c8e6c9;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
  gap: 20px;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.pagination-btn:not(:disabled):hover {
  background-color: #f5f5f5;
  transform: scale(1.1);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
  background-color: #f5f5f5;
  padding: 8px 15px;
  border-radius: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 60px;
  color: #ddd;
  margin-bottom: 15px;
}

.empty-state p {
  font-size: 18px;
  margin: 0 0 5px 0;
  font-weight: 500;
}

.empty-state small {
  color: #999;
  font-size: 14px;
}

.load-more {
  text-align: center;
  margin: 30px 0;
}

.load-more button {
  padding: 12px 25px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #4a5568;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
}

.load-more button:hover {
  background: linear-gradient(135deg, #e4e7eb 0%, #d2d6dc 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.load-more button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .filter-options {
    width: 100%;
    justify-content: space-between;
  }

  .filter-options select {
    flex-grow: 1;
  }

  .danh-gia-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-wrap: wrap;
  }

  .card-actions button {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}
</style>
