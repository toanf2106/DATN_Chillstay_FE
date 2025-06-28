import api from '@/utils/api'

/**
 * Lấy danh sách tất cả các phòng
 * @returns {Promise} Promise containing the response
 */
export const getAllPhong = async () => {
  return await api.get('/api/phong/all')
}

/**
 * Lấy thông tin chi tiết của phòng theo ID
 * @param {number} id - ID của phòng cần lấy thông tin
 * @returns {Promise} Promise containing the response
 */
export const getPhongById = async (id) => {
  return await api.get(`/api/phong/detail/${id}`)
}

/**
 * Thêm phòng mới
 * @param {Object} phongData - Dữ liệu phòng cần thêm
 * @returns {Promise} Promise containing the response
 */
export const addPhong = async (phongData) => {
  return await api.post('/api/phong/add', phongData)
}

/**
 * Cập nhật thông tin phòng
 * @param {number} id - ID của phòng cần cập nhật
 * @param {Object} phongData - Dữ liệu phòng đã cập nhật
 * @returns {Promise} Promise containing the response
 */
export const updatePhong = async (id, phongData) => {
  return await api.put(`/api/phong/update/${id}`, phongData)
}

/**
 * Xóa phòng theo ID
 * @param {number} id - ID của phòng cần xóa
 * @returns {Promise} Promise containing the response
 */
export const deletePhong = async (id) => {
  console.log('Gọi API xóa phòng ID:', id);
  try {
    // Thử sử dụng phương thức DELETE trước
    return await api.delete(`/api/phong/delete/${id}`);
  } catch (error) {
    console.log('Lỗi với phương thức DELETE, thử lại với PUT:', error);
    // Nếu DELETE không được, thử sử dụng PUT (theo chuẩn REST, DELETE là phương thức chuẩn để xóa)
    return await api.put(`/api/phong/delete/${id}`);
  }
}

/**
 * Tìm kiếm phòng với các tiêu chí khác nhau
 * @param {Object} searchParams - Các tham số tìm kiếm (id, maPhong, tenPhong)
 * @returns {Promise} Promise containing the response
 */
export const searchPhong = async (searchParams) => {
  const params = new URLSearchParams();

  if (searchParams.id) {
    params.append('id', searchParams.id);
  }

  if (searchParams.maPhong) {
    params.append('maPhong', searchParams.maPhong);
  }

  if (searchParams.tenPhong) {
    params.append('tenPhong', searchParams.tenPhong);
  }

  return await api.get(`/api/phong/search?${params.toString()}`);
}

/**
 * Phân trang danh sách phòng
 * @param {number} page - Số trang (mặc định là 0)
 * @returns {Promise} Promise containing the response
 */
export const getPhongPaginated = async (page = 0) => {
  return await api.get(`/api/phong/list?page=${page}`);
}

/**
 * Lấy danh sách loại phòng
 * @returns {Promise} Promise containing the response
 */
export const getLoaiPhongList = async () => {
  return await api.get('/api/loaiphong/all')
}

/**
 * Lấy danh sách homestay
 * @returns {Promise} Promise containing the response
 */
export const getHomestayList = async () => {
  return await api.get('/api/homestay/all')
}
