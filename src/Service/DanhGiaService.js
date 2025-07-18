import api from '@/utils/api';

// Lấy tất cả đánh giá
export function getAllDanhGia() {
  // Thêm một tham số cache-busting để đảm bảo luôn lấy dữ liệu mới nhất
  const timestamp = new Date().getTime();
  return api.get(`/api/danh-gia/all?t=${timestamp}`);
}

export function getDanhGiaById(id) {
    return api.get(`/api/danh-gia/detail/${id}`);
}

export function createDanhGia(danhGiaDto) {
    return api.post('/api/danh-gia/create', danhGiaDto);
}

export function updateDanhGia(id, danhGiaDto) {
    return api.put(`/api/danh-gia/update/${id}`, danhGiaDto);
}

export function deleteDanhGia(id) {
    return api.delete(`/api/danh-gia/delete/${id}`);
}

// API for Review Images
export function getAnhDanhGiaByDanhGiaId(danhGiaId) {
    return api.get(`/api/anh_danh_gia/by-danh-gia/${danhGiaId}`);
}

export function uploadAnhDanhGia(file, danhGiaId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('danhGiaId', danhGiaId);
    return api.post('/api/anh_danh_gia/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

export function deleteAnhDanhGia(id) {
    // Note: The backend uses a PUT for soft delete
    return api.put(`/api/anh_danh_gia/delete/${id}`);
}


// Các hàm khác có thể được thêm vào sau khi backend cung cấp thêm API endpoints
