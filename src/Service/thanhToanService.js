import api from '@/utils/api';

// Lấy tất cả tiện nghi
export function getAllThanhToan() {
  return api.get('/api/thanhToan/all');
}

// Lấy chi tiết tiện nghi theo id
export function getAllThanhToanBy(id) {
  return api.get(`/api/thanhToan/detail/${id}`);
}
