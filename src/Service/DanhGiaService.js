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

export function createDanhGia(danhGiaDto, files) {
  const formData = new FormData();

  // Part 1: Đóng gói dữ liệu đánh giá dưới dạng JSON và đặt tên là "danhGia"
  const danhGiaJson = JSON.stringify(danhGiaDto);
  formData.append('danhGia', new Blob([danhGiaJson], { type: 'application/json' }));

  // Part 2: Đóng gói các tệp ảnh và đặt tên là "files"
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('files', file);
    });
  }

  // Gửi yêu cầu với đúng định dạng
  return api.post('/api/danh-gia/create', formData, {
    headers: {
      // Trình duyệt sẽ tự động đặt Content-Type là multipart/form-data
      // khi bạn truyền một đối tượng FormData.
      // Không cần thiết phải đặt thủ công, nhưng để rõ ràng thì có thể giữ lại.
      'Content-Type': 'multipart/form-data',
    },
  });
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

export function getDanhGiaByKhachHangId(id) {
    return api.get(`/api/danh-gia/khach-hang/${id}`);
}

// Các hàm khác có thể được thêm vào sau khi backend cung cấp thêm API endpoints
