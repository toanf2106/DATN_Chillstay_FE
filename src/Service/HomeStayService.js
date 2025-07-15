import api from '@/utils/api';

// Lấy tất cả homestay
export function getAllHomeStay() {
  return api.get('/api/homestay/all');
}

// Lấy chi tiết homestay theo id
export function getHomeStayById(id) {
  return api.get(`/api/homestay/${id}`);
}

// Thêm homestay mới
export function createHomestay(formData) {
  return api.post('/api/homestay/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

// Cập nhật homestay
export function updateHomestay(id, formData) {
  return api.put(`/api/homestay/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
}

// Xóa homestay
export function deleteHomestayAPI(id) {
  return api.delete(`/api/homestay/delete/${id}`);
  }

// Lấy danh sách loại homestay
export function getLoaiHomeStay() {
  return api.get('/api/loai-homestay/hien-thi');
}

// Thêm loại homestay mới
export function createLoaiHomestay(data) {
  return api.post('/api/loai-homestay/add', data);
}

// Cập nhật loại homestay
export function updateLoaiHomestay(id, data) {
  return api.put(`/api/loai-homestay/update/${id}`, data);
}

// Xóa loại homestay
export function deleteLoaiHomestay(id) {
  return api.delete(`/api/loai-homestay/delete/${id}`);
}

// Thay đổi trạng thái loại homestay
export function changeLoaiHomestayStatus(id) {
  return api.put(`/api/loai-homestay/change-status/${id}`);
}

// Lấy danh sách chủ homestay
export function getChuHomeStay() {
  return api.get('/api/chu-home/all');
}

// Lấy danh sách tiện nghi của homestay
export function getHomestayTienNghi(homestayId) {
  return api.get(`/api/homestay-tiennghi/by-homestay/${homestayId}`);
}

// Thêm tiện nghi cho homestay
export function addHomestayTienNghi(data) {
  return api.post('/api/homestay-tiennghi/add', data);
}

// Cập nhật tiện nghi của homestay
export function updateHomestayTienNghi(homestayId, tienNghiId, data) {
  return api.put(`/api/homestay-tiennghi/update/${homestayId}/${tienNghiId}`, data);
}

// Xóa tiện nghi khỏi homestay
export function deleteHomestayTienNghi(homestayId, tienNghiId) {
  return api.delete(`/api/homestay-tiennghi/delete/${homestayId}/${tienNghiId}`);
}

// Xóa tất cả tiện nghi của homestay
export function deleteAllHomestayTienNghi(homestayId) {
  return api.delete(`/api/homestay-tiennghi/delete-all/${homestayId}`);
}

// Lấy ảnh homestay theo homestay id
export function getAnhHomeStayByHomestayId(homestayId) {
  return api.get(`/api/anh_homestay/by-homestay/${homestayId}`);
}

// Tải lên ảnh homestay
export function uploadAnhHomeStay(file, homestayId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('homestayId', homestayId);

  return api.post('/api/anh_homestay/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}


// Lấy số lượng phòng theo ID homestay

export function getSoPhongByHomestayId2(homestayId) {
  return api.get(`/api/homestay/Phong/${homestayId}`);
}

export function getSoPhongByHomestayId(homestayId) {
  return api.get(`/api/homestay-tiennghi/by-homestay/${homestayId}`);

}

// Xóa ảnh homestay
export function deleteAnhHomeStay(id) {
  return api.put(`/api/anh_homestay/delete/${id}`);
}

// Tìm kiếm homestay theo từ khóa
export function searchByKeyword(keyword) {
  return api.get(`/api/homestay/search/keyword?keyword=${encodeURIComponent(keyword)}`);
}
