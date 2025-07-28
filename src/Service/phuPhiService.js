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

export function getPhuPhiChiTietByDatHomeId(datHomeId) {
    return api.get(`/phu-phi-chi-tiet/dat-home/${datHomeId}`);
}
