<template>
  <div class="homestay-listing-container">
    <div class="page-header">
      <h1><i class="fas fa-home"></i> Danh sách Đánh Giá</h1>
    </div>

    <div class="filter-controls">
      <input type="text" v-model="searchQuery" placeholder="Tìm kiếm theo tên, địa chỉ, mã..." class="search-input">
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
    </div>
    <div v-else-if="filteredHomestays.length === 0" class="empty-state">
      <i class="fas fa-house-damage"></i>
      <p>Không tìm thấy homestay nào</p>
    </div>

    <div v-else :class="viewMode === 'grid' ? 'homestay-grid' : 'homestay-list'">
      <div v-for="homestay in filteredHomestays" :key="homestay.id" class="homestay-card" @click="goToReviewDetails(homestay.id)">
        <div class="card-image">
          <img :src="homestay.hinhAnh || '/public/assets/Icon/logo.png'" :alt="homestay.tenHomestay">
          <span class="homestay-status" :class="homestay.trangThai ? 'active' : 'inactive'">
            {{ homestay.trangThai ? 'Hoạt động' : 'Ngừng hoạt động' }}
          </span>
        </div>
        <div class="card-content">
          <h2 class="homestay-name">{{ homestay.tenHomestay }}</h2>
          <p class="homestay-type">{{ homestay.tenLoaiHomestay }}</p>
          <div class="info-row">
            <i class="fas fa-barcode"></i>
            <span>Mã: {{ homestay.maHomestay }}</span>
          </div>
          <div class="info-row">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ homestay.diaChi }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAllHomeStay } from '@/Service/HomeStayService';

export default {
  name: 'DanhGiaView',
  setup() {
    const router = useRouter();
    const homestays = ref([]);
    const loading = ref(true);
    const searchQuery = ref('');
    const viewMode = ref('grid');

    const fetchHomestays = async () => {
      try {
        loading.value = true;
        const response = await getAllHomeStay();
        homestays.value = response.data;
      } catch (error) {
        console.error("Lỗi khi tải danh sách homestay:", error);
      } finally {
        loading.value = false;
      }
    };

    const goToReviewDetails = (homestayId) => {
      router.push({ name: 'public-review-details', params: { homestayId } });
    };

    const filteredHomestays = computed(() => {
      if (!searchQuery.value) {
        return homestays.value;
      }
      const lowerCaseQuery = searchQuery.value.toLowerCase();
      return homestays.value.filter(h =>
        h.tenHomestay.toLowerCase().includes(lowerCaseQuery) ||
        h.diaChi.toLowerCase().includes(lowerCaseQuery) ||
        (h.maHomestay && h.maHomestay.toLowerCase().includes(lowerCaseQuery))
      );
    });

    onMounted(fetchHomestays);

    return {
      homestays,
      loading,
      searchQuery,
      filteredHomestays,
      viewMode,
      goToReviewDetails
    };
  }
}
</script>

<style scoped>
.homestay-listing-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  width: 50%;
}

.view-toggle button {
  padding: 10px 15px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 16px;
}

.view-toggle button.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.view-toggle button:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.view-toggle button:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
}

.homestay-grid {
  display: flex;
  overflow-x: auto;
  gap: 25px;
  padding-bottom: 20px; /*Để có không gian cho thanh cuộn*/
}

.homestay-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer; /* Add pointer cursor */
  width: 300px;
  flex-shrink: 0;
}

.homestay-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
}

.card-image {
  position: relative;
  width: 100%;
  padding-top: 66.66%;
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.homestay-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.homestay-status.active { background-color: rgba(46, 125, 50, 0.8); }
.homestay-status.inactive { background-color: rgba(198, 40, 40, 0.8); }

.card-content { padding: 20px; flex-grow: 1; }
.homestay-name { font-size: 20px; font-weight: 600; margin: 0 0 5px 0; }
.homestay-type { font-size: 14px; color: #666; margin-bottom: 15px; }

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  margin-bottom: 8px;
  font-size: 14px;
}

.price-and-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.price { font-size: 18px; font-weight: 600; color: #d0021b; }
.area { font-size: 14px; color: #555; }

.card-footer {
  padding: 15px 20px;
  background-color: #f9f9f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-created { font-size: 12px; color: #888; }

.homestay-list .homestay-card { flex-direction: row; height: 200px; }
.homestay-list .card-image { width: 35%; height: 100%; padding-top: 0; flex-shrink: 0; }
.homestay-list .card-content { display: flex; flex-direction: column; }
.homestay-list .card-footer { flex-direction: column; justify-content: center; gap: 10px; width: 20%; }

</style>
