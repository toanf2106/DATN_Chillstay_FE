import { ref, computed, onMounted } from 'vue';
import { getAllHomeStay, getLoaiHomeStay, getChuHomeStay } from '@/Service/HomeStayService';

/**
 * Composable quản lý dữ liệu Homestay cho trang QlyHomestay
 */
export function useHomestayManagement() {
  const homestays = ref([]);
  const loaiList = ref([]);
  const chuList = ref([]);
  const searchTerm = ref('');

  // Lấy danh sách homestay, loại và chủ homestay
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
    } catch {
      // Xử lý lỗi trong thầm lặng - hiện không có UI hiển thị thông báo lỗi
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
    return chu?.hotenChuHomestay || 'Không xác định';
  };
  const formatCurrency = (num) => new Intl.NumberFormat('vi-VN').format(num);
  const getImageUrl = (img) => (img ? `/resources/images/homestay/${img}` : '');

  const filteredHomestays = computed(() => {
    if (!searchTerm.value) return homestays.value;
    const key = searchTerm.value.toLowerCase();
    return homestays.value.filter((h) =>
      h.Ten_HomeStay?.toLowerCase().includes(key) ||
      h.Dia_Chi?.toLowerCase().includes(key)
    );
  });

  const handleSearch = () => {
    /* hiện tại lọc realtime qua computed */
  };

  // Placeholder cho modal thêm/sửa
  const openAddModal = () => {
    alert('Chức năng thêm/sửa sẽ được phát triển sau');
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
    openAddModal
  };
}
