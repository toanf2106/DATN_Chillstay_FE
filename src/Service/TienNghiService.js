import api from '@/utils/api';

// Lấy tất cả tiện nghi
export function getAllTienNghi() {
  return api.get('/api/tien-nghi/all');
}

// Lấy chi tiết tiện nghi theo id
export function getTienNghiById(id) {
  return api.get(`/api/tien-nghi/detail/${id}`);
}

// Lấy chi tiết tiện nghi theo tên
export function getTienNghiByTen(tenTienNghi) {
  return api.get(`/api/tien-nghi/detail-ten/${encodeURIComponent(tenTienNghi)}`);
}

// Thêm tiện nghi
export function addTienNghi(tienNghi) {
  return api.post('/api/tien-nghi/add', tienNghi);
}

// Cập nhật tiện nghi
export function updateTienNghi(id, tienNghi) {
  return api.put(`/api/tien-nghi/${id}`, tienNghi);
}

// Xóa tiện nghi (dùng PUT theo backend)
export function deleteTienNghi(id) {
  return api.put(`/api/tien-nghi/delete/${id}`);
}

// Tìm kiếm và phân trang tiện nghi
export function searchTienNghi({ keyword = '', status = null, page = 0, size = 8 }) {
  const params = {
    keyword,
    page,
    size
  };
  if (status !== null) {
    params.status = status;
  }
  return api.get('/api/tien-nghi/search', { params });
}