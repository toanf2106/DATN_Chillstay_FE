import api from '@/utils/api'

// Lấy danh sách khách hàng
export function getAllKhachHang() {
  return api.get('/api/khach-hang/all')
}

// Lấy danh sách khách hàng có phân trang
export function getKhachHangPaginated(page) {
  return api.get(`/api/khach-hang/page?page=${page}`)
}

// Tìm kiếm khách hàng với nhiều tiêu chí
export function searchKhachHangAPI(searchParams, page = 0) {
  // Xây dựng query params từ các trường tìm kiếm
  let queryParams = `page=${page}`

  // Log the request parameters
  console.log('DEBUG - searchKhachHangAPI called with:', { searchParams, page })

  // Only include parameters that actually have values
  if (searchParams.id && searchParams.id.trim() !== '') {
    queryParams += `&id=${encodeURIComponent(searchParams.id.trim())}`
  }
  if (searchParams.maKhachHang && searchParams.maKhachHang.trim() !== '') {
    queryParams += `&maKhachHang=${encodeURIComponent(searchParams.maKhachHang.trim())}`
  }
  if (searchParams.tenKhachHang && searchParams.tenKhachHang.trim() !== '') {
    queryParams += `&tenKhachHang=${encodeURIComponent(searchParams.tenKhachHang.trim())}`
  }
  if (searchParams.soDienThoai && searchParams.soDienThoai.trim() !== '') {
    queryParams += `&soDienThoai=${encodeURIComponent(searchParams.soDienThoai.trim())}`
  }
  if (searchParams.email && searchParams.email.trim() !== '') {
    queryParams += `&email=${encodeURIComponent(searchParams.email.trim())}`
  }

  // Log the full URL that will be called
  console.log('DEBUG - Search URL:', `/api/khach-hang/search?${queryParams}`)

  // Try the controller search endpoint
  return api.get(`/api/khach-hang/search?${queryParams}`)
    .catch(error => {
      console.log('DEBUG - Search endpoint failed:', error.message);
      console.log('DEBUG - Falling back to all data approach...');

      // If search fails, fallback to getting all data
      return getAllKhachHang().then(response => {
        if (response && response.data && Array.isArray(response.data)) {
          // Filter the data manually based on searchParams
          let filteredData = response.data;

          if (searchParams.id) {
            filteredData = filteredData.filter(item =>
              item.id && item.id.toString().includes(searchParams.id));
          }
          if (searchParams.maKhachHang) {
            filteredData = filteredData.filter(item =>
              item.maKhachHang && item.maKhachHang.toLowerCase().includes(searchParams.maKhachHang.toLowerCase()));
          }
          if (searchParams.tenKhachHang) {
            const searchTerm = searchParams.tenKhachHang.toLowerCase();
            filteredData = filteredData.filter(item =>
              (item.tenKhachHang && item.tenKhachHang.toLowerCase().includes(searchTerm)) ||
              (item.hoTen && item.hoTen.toLowerCase().includes(searchTerm)));
          }
          if (searchParams.soDienThoai) {
            filteredData = filteredData.filter(item =>
              item.soDienThoai && item.soDienThoai.includes(searchParams.soDienThoai));
          }
          if (searchParams.email) {
            filteredData = filteredData.filter(item =>
              item.email && item.email.toLowerCase().includes(searchParams.email.toLowerCase()));
          }

          return { data: filteredData };
        }

        // If all else fails, return the original response
        return response;
      });
    });
}

// Lấy thông tin chi tiết khách hàng theo ID
export function getKhachHangById(id) {
  return api.get(`/api/khach-hang/detail/${id}`)
}

// Thêm khách hàng mới
export function addKhachHang(khachHangData) {
  return api.post('/api/khach-hang/add', khachHangData)
}

// Cập nhật thông tin khách hàng
export function updateKhachHang(id, khachHangData) {
  return api.put(`/api/khach-hang/update/${id}`, khachHangData)
}

// Xóa khách hàng
export function deleteKhachHang(id) {
  return api.delete(`/api/khach-hang/delete/${id}`)
}
