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

// Cập nhật hoặc tạo mới thông tin người dùng
export function updateThongTinNguoiDung(id, thongTinNguoiDungDto) {
  // Nếu id là null, đây là tạo mới
  if (id === null) {
    if (!thongTinNguoiDungDto.taiKhoanId) {
      throw new Error('Thiếu ID tài khoản khi tạo mới thông tin người dùng');
    }

    // Sử dụng API add để tạo mới thông tin người dùng
    return api.post(`/api/thongTinNguoiDung/add`, thongTinNguoiDungDto);
  }

  // Nếu có flag updateAccountEmail, sử dụng endpoint đặc biệt để cập nhật cả email trong tài khoản
  if (thongTinNguoiDungDto.email && thongTinNguoiDungDto.updateAccountEmail) {
    return api.put(`/api/thongTinNguoiDung/updateWithEmail/${id}`, thongTinNguoiDungDto);
  }

  // Nếu không, sử dụng endpoint thông thường
  return api.put(`/api/thongTinNguoiDung/update/${id}`, thongTinNguoiDungDto);
}
