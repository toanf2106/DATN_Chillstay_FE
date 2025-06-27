import api from '../utils/api';

export const getAllTaiKhoan = () => {
  return api.get('/api/taiKhoan/all');
};

export function getTaiKhoanById(id) {
  return api.get(`/api/taiKhoan/${id}`);
}

export const deleteTaiKhoan = (id) => {
  return api.put(`/api/taiKhoan/delete/${id}`);
};

export const restoreTaiKhoan = (id) => {
  return api.put(`/api/taiKhoan/restore/${id}`);
};

export const addTaiKhoan = (taiKhoanData) => {
  return api.post('/api/taiKhoan/add', taiKhoanData);
};

export const updateTaiKhoan = (id, taiKhoanData) => {
  return api.put(`/api/taiKhoan/update/${id}`, taiKhoanData);
};

export const searchTaiKhoan = (searchTerm) => {
  return api.get(`/api/taiKhoan/search?query=${encodeURIComponent(searchTerm)}`);
};



