import api from '@/utils/api';

/**
 * Lấy danh sách tất cả dịch vụ
 * @returns {Promise} Promise kết quả API
 */
export function getAllDichVu() {
  console.log('Đang gọi API lấy tất cả dịch vụ từ /api/dich-vu/hien-thi');
  return api.get('/api/dich-vu/hien-thi');
}

/**
 * Thêm dịch vụ mới
 * @param {Object} data Dữ liệu dịch vụ cần thêm
 * @returns {Promise} Promise kết quả API
 */
export function addDichVu(data) {
  const formattedData = {
    tenDichVu: data.tenDichVu || '',
    gia: parseFloat(data.gia || 0),
    donVi: data.donVi || 'Ngày',
    moTa: data.moTa || '',
    trangThai: Boolean(data.trangThai),
    homeStay: {
      id: parseInt(data.homestayID || 0)
    }
  };

  console.log('Thêm mới dịch vụ với dữ liệu:', formattedData);
  return api.post('/api/dich-vu/add', formattedData);
}

/**
 * Cập nhật dịch vụ
 * @param {Number} id ID của dịch vụ cần cập nhật
 * @param {Object} data Dữ liệu dịch vụ cần cập nhật
 * @returns {Promise} Promise kết quả API
 */
export function updateDichVu(id, data) {
  const cleanId = parseInt(id, 10);

  if (isNaN(cleanId)) {
    return Promise.reject(new Error('ID dịch vụ không hợp lệ'));
  }

  // Log thông tin trước khi format để debug
  console.log('Dữ liệu đầu vào:', data);
  console.log('Đơn vị gốc:', data.donVi);

  const formattedData = {
    id: cleanId,
    tenDichVu: data.tenDichVu || '',
    gia: parseFloat(data.gia || 0),
    donVi: data.donVi || 'Ngày',
    moTa: data.moTa || '',
    trangThai: Boolean(data.trangThai),
    homeStay: {
      id: parseInt(data.homestayID || 0)
    }
  };

  console.log(`Cập nhật dịch vụ ID ${cleanId} với dữ liệu:`, formattedData);
  return api.put(`/api/dich-vu/update/${cleanId}`, formattedData);
}

/**
 * Xóa dịch vụ (soft delete - chuyển trangThai thành false)
 * @param {Number} id ID của dịch vụ cần xóa
 * @returns {Promise} Promise kết quả API
 */
export function deleteDichVu(id) {
  const cleanId = parseInt(id, 10);

  if (isNaN(cleanId)) {
    return Promise.reject(new Error('ID dịch vụ không hợp lệ'));
  }

  console.log(`Soft delete dịch vụ ID ${cleanId}`);
  return api.delete(`/api/dich-vu/delete/${cleanId}`);
}

/**
 * Khôi phục dịch vụ đã xóa
 * @param {Number} id ID của dịch vụ cần khôi phục
 * @returns {Promise} Promise kết quả API
 */
export function restoreDichVu(id) {
  const cleanId = parseInt(id, 10);

  if (isNaN(cleanId)) {
    return Promise.reject(new Error('ID dịch vụ không hợp lệ'));
  }

  console.log(`Khôi phục dịch vụ ID ${cleanId}`);
  return api.put(`/api/dich-vu/restore/${cleanId}`);
}

/**
 * Tìm kiếm dịch vụ theo các tiêu chí
 * @param {Object} options - Các tùy chọn tìm kiếm
 * @param {string} options.keyword - Từ khóa tìm kiếm
 * @param {number} options.idHomeStay - ID của HomeStay
 * @param {number} options.gia - Giá dịch vụ
 * @param {number} options.page - Số trang (bắt đầu từ 0)
 * @param {number} options.size - Số lượng bản ghi mỗi trang
 * @returns {Promise} - Promise kết quả API
 */
export function searchDichVu({
  keyword = null,
  idHomeStay = null,
  gia = null,
  page = 0,
  size = 10
} = {}) {
  console.log('Tìm kiếm dịch vụ với các tham số:', { keyword, idHomeStay, gia, page, size });

  // Xây dựng tham số query
  const params = {
    page,
    size
  };

  // Thêm các tham số tìm kiếm nếu có
  if (keyword) params.keyword = keyword;
  if (idHomeStay) params.idHomeStay = idHomeStay;
  if (gia) params.gia = gia;

  return api.get('/api/dich-vu/search', { params });
}

export function getDichVuByHomestay(id) {
    return api.get(`/api/dich-vu/by-homeStay2/${id}`);
}

export function getDichVuChiTietByDatHomeId(datHomeId) {
    return api.get(`/dich-vu-chi-tiet/dat-home/${datHomeId}`);
}
