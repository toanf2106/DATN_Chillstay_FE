import api from '@/utils/api';

// Lấy tất cả phụ phí
export const getAllPhuPhi = async () => {
  try {
    const response = await api.get('/api/phuPhi/all');
    return response;
  } catch (error) {
    console.error('Error fetching phu phi:', error);
    throw error;
  }
};

// Lấy phụ phí theo loại
export const getPhuPhiByLoai = async (loaiPhuPhi) => {
  try {
    const response = await api.get(`/api/phuPhi/by-loai/${loaiPhuPhi}`);
    return response;
  } catch (error) {
    console.error(`Error fetching phu phi by loai ${loaiPhuPhi}:`, error);
    throw error;
  }
};

// Lấy phụ phí cuối tuần
export const getPhuPhiCuoiTuan = async () => {
  try {
    const response = await api.get('/api/phuPhi/by-loai/Cuối Tuần');
    return response;
  } catch (error) {
    console.error('Error fetching weekend surcharge:', error);
    throw error;
  }
};

// Lấy phụ phí ngày lễ
export const getPhuPhiNgayLe = async () => {
  try {
    const response = await api.get('/api/phuPhi/by-loai/Ngày Lễ');
    return response;
  } catch (error) {
    console.error('Error fetching holiday surcharge:', error);
    throw error;
  }
};

// Lấy tất cả các ngày lễ
export const getAllNgayLe = async () => {
  try {
    const response = await api.get('/api/phuPhi/all-ngay-le');
    return response;
  } catch (error) {
    console.error('Error fetching all holidays:', error);
    throw error;
  }
};

// Xóa phụ phí theo ID
export const deletePhuPhiById = async (id) => {
  try {
    const response = await api.put(`/api/phuPhi/delete/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting phu phi:', error);
    throw error;
  }
};

// Khôi phục phụ phí theo ID
export const restorePhuPhiById = async (id) => {
  try {
    const response = await api.put(`/api/phuPhi/restore/${id}`);
    return response;
  } catch (error) {
    console.error('Error restoring phu phi:', error);
    throw error;
  }
};

// Tạo phụ phí mới
export const createPhuPhi = async (phuPhiData) => {
  try {
    const response = await api.post('/api/phuPhi/create', phuPhiData);
    return response;
  } catch (error) {
    console.error('Error creating phu phi:', error);
    throw error;
  }
};

// Cập nhật phụ phí
export const updatePhuPhi = async (id, phuPhiData) => {
  try {
    const response = await api.put(`/api/phuPhi/update/${id}`, phuPhiData);
    return response;
  } catch (error) {
    console.error('Error updating phu phi:', error);
    throw error;
  }
};

// Hàm tìm kiếm phụ phí (khi cần)
export const searchPhuPhi = async (keyword) => {
  try {
    const response = await api.get(`/api/phuPhi/search?keyword=${keyword}`);
    return response;
  } catch (error) {
    console.error('Error searching phu phi:', error);
    throw error;
  }
};

// Lấy tất cả phụ phí phát sinh đang hoạt động
export const getAllPhuPhiPhatSinhActive = async () => {
  try {
    const response = await api.get('/api/phuPhi/all-phat-sinh');
    return response;
  } catch (error) {
    console.error('Error fetching active phat sinh phu phi:', error);
    throw error;
  }
};

// Lấy tất cả chi tiết phụ phí theo ID đặt homestay
export const getPhuPhiChiTietByDatHomeId = async (datHomeId) => {
  try {
    const response = await api.get(`/api/phu-phi-chi-tiet/dat-home/${datHomeId}`);
    return response;
  } catch (error) {
    console.error('Error fetching phu phi chi tiet by dat home id:', error);
    throw error;
  }
};

// Lấy tất cả chi tiết phụ phí
export const getAllPhuPhiChiTiet = async () => {
  try {
    const response = await api.get('/api/phu-phi-chi-tiet/all');
    return response;
  } catch (error) {
    console.error('Error fetching all phu phi chi tiet:', error);
    throw error;
  }
};

// Tạo chi tiết phụ phí mới
export const createPhuPhiChiTiet = async (phuPhiChiTietData) => {
  try {
    const response = await api.post('/api/phu-phi-chi-tiet/create', phuPhiChiTietData);
    return response;
  } catch (error) {
    console.error('Error creating phu phi chi tiet:', error);
    throw error;
  }
};

// Cập nhật chi tiết phụ phí
export const updatePhuPhiChiTiet = async (id, phuPhiChiTietData) => {
  try {
    const response = await api.put(`/api/phu-phi-chi-tiet/update/${id}`, phuPhiChiTietData);
    return response;
  } catch (error) {
    console.error('Error updating phu phi chi tiet:', error);
    throw error;
  }
};

// Xóa chi tiết phụ phí theo ID
export const deletePhuPhiChiTietById = async (id) => {
  try {
    const response = await api.put(`/api/phu-phi-chi-tiet/delete/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting phu phi chi tiet:', error);
    throw error;
  }
};

// Khôi phục chi tiết phụ phí theo ID
export const restorePhuPhiChiTietById = async (id) => {
  try {
    const response = await api.put(`/api/phu-phi-chi-tiet/restore/${id}`);
    return response;
  } catch (error) {
    console.error('Error restoring phu phi chi tiet:', error);
    throw error;
  }
};
