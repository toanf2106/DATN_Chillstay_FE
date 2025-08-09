import api from '@/utils/api';

export function getAllPhong() {
  return api.get('/api/phong');
}

export function getPhongById(id) {
  return api.get(`/api/phong/${id}`);
}

export function getPhongByMaPhong(maPhong) {
  return api.get(`/api/phong/ma/${maPhong}`);
}

export function getPhongByHomeStayId(homestayId) {
  return api.get(`/api/phong/homestay/${homestayId}`);
}

export function getPhongByLoaiPhongId(loaiPhongId) {
  return api.get(`/api/phong/loaiphong/${loaiPhongId}`);
}

export function searchPhongByKeyword(keyword) {
  return api.get(`/api/phong/search?keyword=${encodeURIComponent(keyword)}`);
}

export function getPhongBySoNguoi(soNguoi) {
  return api.get(`/api/phong/songuoi/${soNguoi}`);
}

export function createPhong(phongData) {
  return api.post('/api/phong/add', phongData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function updatePhong(id, phongData) {
  return api.put(`/api/phong/update/${id}`, phongData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function deletePhong(id) {
  return api.put(`/api/phong/delete/${id}`);
}

export function restorePhong(id) {
  return api.put(`/api/phong/restore/${id}`);
}

// Lấy danh sách loại phòng để hiển thị trong form
export function getLoaiPhongList() {
  return api.get('/api/loaiphong/all');
}

export function createLoaiPhong(data) {
  return api.post('/api/loaiphong/add', data);
}

export function updateLoaiPhong(id, data) {
  return api.put(`/api/loaiphong/update/${id}`, data);
}

export function deleteLoaiPhong(id) {
  return api.delete(`/api/loaiphong/delete/${id}`);
}

// Lấy danh sách homestay để hiển thị trong form
export function getHomestayList() {
  return api.get('/api/homestay/all');
}

export function searchPhongAdvanced({
  keyword = null,
  homestayId = null,
  loaiPhongId = null,
  soNguoi = null,
} = {}) {
  const params = {};

  if (keyword) params.keyword = keyword;
  if (homestayId) params.homestayId = homestayId;
  if (loaiPhongId) params.loaiPhongId = loaiPhongId;
  if (soNguoi) params.soNguoi = soNguoi;

  return api.get('/api/phong/search', { params });
}

// Quản lý ảnh phòng
export function getAnhPhongByPhongId(phongId) {
  return api.get(`/api/anh_phong/by-phong/${phongId}`);
}

export function uploadAnhPhong(file, phongId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('phongId', phongId);

  return api.post('/api/anh_phong/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function deleteAnhPhong(anhPhongId) {
  return api.put(`/api/anh_phong/delete/${anhPhongId}`);
}

export function updateAnhPhongStatus(anhPhongId, status) {
  return api.put(`/api/anh_phong/${anhPhongId}/status`, { trangThai: status });
}

// Quản lý vật tư trong phòng
export function getVatTuPhongByPhongId(phongId) {
  return api.get(`/api/vat-tu-phong/by-phong/${phongId}`);
}

export function addVatTuToPhong(phongId, vatTuId, soLuong) {
  return api.post(`/api/vat-tu-phong`, {
    phong: { id: phongId },
    vatTu: { id: vatTuId },
    soLuong: soLuong
  });
}

export function updateVatTuPhong(phongId, vatTuId, soLuong) {
  return api.put(`/api/vat-tu-phong`, {
    phong: { id: phongId },
    vatTu: { id: vatTuId },
    soLuong: soLuong
  });
}

export function deleteVatTuFromPhong(phongId, vatTuId) {
  return api.delete(`/api/vat-tu-phong/delete?phongId=${phongId}&vatTuId=${vatTuId}`);
}

export function batchUpdateVatTuPhong(phongId, vatTuPhongList) {
  return api.post(`/api/vat-tu-phong/batch/${phongId}`, vatTuPhongList);
}
