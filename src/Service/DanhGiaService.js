import api from '@/utils/api';

// Lấy tất cả đánh giá
export function getAllDanhGia() {
  return api.get('/api/danh-gia/all');
}

// Các hàm khác có thể được thêm vào sau khi backend cung cấp thêm API endpoints
