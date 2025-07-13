import api from '../utils/api';

export const getAllNhanVien = () => {
  return api.get('/api/nhanVien/all');
};

export function getNhanVienById(id) {
  return api.get(`/api/nhanVien/${id}`);
}

export const deleteNhanVien = (id) => {
  return api.put(`/api/nhanVien/delete/${id}`);
};

export const restoreNhanVien = (id) => {
  return api.put(`/api/nhanVien/restore/${id}`);
};

export const addNhanVien = (formData) => {
  return api.post('/api/nhanVien/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updateNhanVien = (id, formData) => {
  // Log to debug
  console.log(`Updating employee with ID: ${id}`);

  // Check if formData contains file
  const fileData = formData.get('file');
  if (fileData) {
    console.log('File included in update:', fileData.name, fileData.type, fileData.size);
  } else {
    console.log('No file included in this update');
  }

  return api.put(`/api/nhanVien/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Các phương thức tìm kiếm nhân viên
export const searchNhanVienByMa = (maSuffix) => {
  return api.get(`/api/nhanVien/search/ma?maSuffix=${maSuffix}`);
};

export const searchNhanVienByTen = (hoTen) => {
  return api.get(`/api/nhanVien/search/ten?hoTen=${encodeURIComponent(hoTen)}`);
};

export const searchNhanVienBySoDienThoai = (soDienThoai) => {
  return api.get(`/api/nhanVien/search/sdt?soDienThoai=${soDienThoai}`);
};

export const searchNhanVienByEmail = (email) => {
  return api.get(`/api/nhanVien/search/email?email=${encodeURIComponent(email)}`);
};

export const searchNhanVien = (tuKhoa) => {
  return api.get(`/api/nhanVien/search?tuKhoa=${encodeURIComponent(tuKhoa)}`);
};
