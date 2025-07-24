import api from '@/utils/api';

// Lấy danh sách tất cả thông tin người dùng
export function getAllThongTinNguoiDung() {
  return api.get('/api/thongTinNguoiDung/all');
}

// Lấy chi tiết thông tin người dùng theo ID
export function getThongTinNguoiDungById(id) {
  return api.get(`/api/thongTinNguoiDung/${id}`);
}

// Lấy chi tiết thông tin người dùng theo ID tài khoản
export function getThongTinNguoiDungByTaiKhoanId(taiKhoanId) {
  return api.get(`/api/thongTinNguoiDung/taiKhoan/${taiKhoanId}`);
}

export function updateThongTinNguoiDung1(id, thongTinNguoiDung) {
  return api.put(`/api/thongTinNguoiDung/update1/${id}`, thongTinNguoiDung);
}
