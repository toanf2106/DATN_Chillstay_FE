import api from '../utils/api';

export const getAllTaiKhoan = () => {
  return api.get('/api/taiKhoan/all');
};

export const getTaiKhoanById = (id) => {
  return api.get(`/api/taiKhoan/${id}`);
};

export const addTaiKhoan = (taiKhoanData) => {
  const formData = new FormData();

  formData.append('tenDangNhap', taiKhoanData.tenDangNhap);
  formData.append('email', taiKhoanData.email);
  formData.append('soDienThoai', taiKhoanData.soDienThoai);

  // Thêm trường hoTen mới
  if (taiKhoanData.hoTen) {
    formData.append('hoTen', taiKhoanData.hoTen);
  }

  if (taiKhoanData.matKhau) {
    formData.append('matKhau', taiKhoanData.matKhau);
  }

  if (taiKhoanData.loaiTaiKhoan !== null && taiKhoanData.loaiTaiKhoan !== undefined) {
    formData.append('loaiTaiKhoan', taiKhoanData.loaiTaiKhoan);
  }

  if (taiKhoanData.trangThai !== null && taiKhoanData.trangThai !== undefined) {
    formData.append('trangThai', taiKhoanData.trangThai);
  }

  if (taiKhoanData.anhFile) {
    formData.append('anhFile', taiKhoanData.anhFile);
  }

  return api.post('/api/taiKhoan/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updateTaiKhoan = (id, taiKhoanData) => {
  const formData = new FormData();

  if (taiKhoanData.tenDangNhap) {
    formData.append('tenDangNhap', taiKhoanData.tenDangNhap);
  }

  if (taiKhoanData.email) {
    formData.append('email', taiKhoanData.email);
  }

  if (taiKhoanData.soDienThoai) {
    formData.append('soDienThoai', taiKhoanData.soDienThoai);
  }

  if (taiKhoanData.matKhau) {
    formData.append('matKhau', taiKhoanData.matKhau);
  }

  if (taiKhoanData.loaiTaiKhoan !== null && taiKhoanData.loaiTaiKhoan !== undefined) {
    formData.append('loaiTaiKhoan', taiKhoanData.loaiTaiKhoan);
  }

  if (taiKhoanData.trangThai !== null && taiKhoanData.trangThai !== undefined) {
    formData.append('trangThai', taiKhoanData.trangThai);
  }

  if (taiKhoanData.anhFile) {
    formData.append('anhFile', taiKhoanData.anhFile);
  }

  return api.put(`/api/taiKhoan/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const uploadAvatar = (id, file) => {
  const formData = new FormData();
  formData.append('anhFile', file);

  return api.post(`/api/taiKhoan/${id}/uploadAvatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteTaiKhoan = (id) => {
  return api.put(`/api/taiKhoan/delete/${id}`);
};

export const restoreTaiKhoan = (id) => {
  return api.put(`/api/taiKhoan/restore/${id}`);
};

export const searchTaiKhoan = (query) => {
  return api.get(`/api/taiKhoan/search?query=${query}`);
};

// kiểm tra mật khẩu cũ
export const checkOldPassword = (data) => {
  return api.post('/api/taiKhoan/verifyPassword', data);
};

//  đổi mật khẩu
export const changePassword = (data) => {
  return api.post('/api/taiKhoan/changePassword', data);
};



