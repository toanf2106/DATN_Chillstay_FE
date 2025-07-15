import api from '@/utils/api'

// Lấy tất cả đặt phòng
export function getAllDatHome() {
  return api.get('/api/datHome/all')
}

// Lấy thông tin chi tiết đặt phòng theo ID
export function getDatHomeById(id) {
  return api.get(`/api/datHome/${id}`)
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


export function getDatHomeByTrangThai(trangThai) {
  return api.get(`/api/datHome/trangThai/${trangThai}`)
}

// Lấy dịch vụ theo ID homestay
export function getDichVuByIdHomeStay(homestayId) {
  return api.get(`/api/dich-vu/by-homeStay2/${homestayId}`)
}

// Lấy tiện nghi theo ID homestay
export function getTienNghiByIdHomeStay(homestayId) {
  return api.get(`/api/homestay-tiennghi/by-homestay/${homestayId}`)
}

export function getGiamGiaByIdHomeStay(homestayId) {
  return api.get(`/api/giamgia/by-homestay/${homestayId}`)
    .catch(error => {
      // Return a resolved promise with null data for 500 errors (no discount found)
      if (error.response && error.response.status === 500 &&
          error.response.data && error.response.data.message &&
          error.response.data.message.includes('Không tìm thấy mã giảm giá')) {
        return { data: null };
      }
      // Re-throw other errors
      throw error;
    })
}

// Tạo đặt phòng mới
export async function createDatHome(datHomeData, tienDaNhan, tienTraLai) {
  try {
    let url = '/api/datHome/create'

    // Thêm tham số tienDaNhan và tienTraLai nếu có
    if (tienDaNhan !== undefined || tienTraLai !== undefined) {
      url += '?'
      if (tienDaNhan !== undefined) {
        url += `tienDaNhan=${tienDaNhan}`
      }
      if (tienDaNhan !== undefined && tienTraLai !== undefined) {
        url += '&'
      }
      if (tienTraLai !== undefined) {
        url += `tienTraLai=${tienTraLai}`
      }
    }

    const response = await api.post(url, datHomeData)
    return response
  } catch (error) {
    console.error('Lỗi khi đặt homestay:', error)
    throw error
  }
}

// Tạo đặt phòng mới với phương thức thanh toán chuyển khoản
export async function createDatHomeChuyenKhoan(datHomeData) {
  try {
    const response = await api.post('/api/payment/create-dathome-payment', datHomeData)
    return response
  } catch (error) {
    console.error('Lỗi khi đặt homestay với chuyển khoản:', error)
    throw error
  }
}


