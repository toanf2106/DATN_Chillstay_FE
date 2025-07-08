import api from '@/utils/api'

// Lấy tất cả đặt phòng
export function getAllDatHome() {
  return api.get('/api/datHome/all')
}

// Lấy thông tin chi tiết đặt phòng theo ID
export function getDatHomeById(id) {
  return api.get(`/api/datHome/${id}`)
}

// Xóa đặt phòng
export function deleteDatHome(id) {
  return api.put(`/api/datHome/delete/${id}`)
}

// Khôi phục đặt phòng
export function restoreDatHome(id) {
  return api.put(`/api/datHome/restore/${id}`)
}

// Cập nhật trạng thái đặt phòng với log
export function updateStatus(id, newTrangThai, thucHienBoi, ghiChu) {
  return api.put(`/api/datHome/updateStatus/${id}?newTrangThai=${newTrangThai}${thucHienBoi ? `&thucHienBoi=${thucHienBoi}` : ''}${ghiChu ? `&ghiChu=${encodeURIComponent(ghiChu)}` : ''}`)
}

// Cập nhật check-in
export function checkIn(id, nhanVienId, ghiChu) {
  return api.put(`/api/datHome/checkIn/${id}?nhanVienId=${nhanVienId}${ghiChu ? `&ghiChu=${encodeURIComponent(ghiChu)}` : ''}`)
}

// Cập nhật check-out
export function checkOut(id, nhanVienId, ghiChu) {
  return api.put(`/api/datHome/checkOut/${id}?nhanVienId=${nhanVienId}${ghiChu ? `&ghiChu=${encodeURIComponent(ghiChu)}` : ''}`)
}

// Lấy danh sách đặt phòng theo trạng thái
export function getDatHomeByTrangThai(trangThai) {
  return api.get(`/api/datHome/trangThai/${trangThai}`)
}

// Đếm số lượng đặt phòng chờ xác nhận hoặc đã cọc
export function countDatHomeChoXacNhanOrDaCoc() {
  return api.get('/api/datHome/count')
}
