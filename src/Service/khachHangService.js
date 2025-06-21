import api from '@/utils/api'

// Lấy danh sách khách hàng
export function getAllKhachHang() {
  return api.get('/api/khach-hang/hien-thi')
}

// Lấy danh sách khách hàng có phân trang
export function getKhachHangPaginated(page, size = 10) {
  return api.get(`/api/khach-hang/hien-thi/page?page=${page}&size=${size}`)
}

// Tìm kiếm khách hàng với nhiều tiêu chí
export function searchKhachHangAPI(searchParams, page = 0, size = 10) {
  // Xây dựng query params từ các trường tìm kiếm
  let queryParams = `page=${page}&size=${size}`

  // Log the request parameters
  console.log('DEBUG - searchKhachHangAPI called with:', { searchParams, page, size })

  // Only include parameters that actually have values
  if (searchParams.id && searchParams.id.trim() !== '') {
    queryParams += `&id=${encodeURIComponent(searchParams.id.trim())}`
  }
  if (searchParams.maKhachHang && searchParams.maKhachHang.trim() !== '') {
    queryParams += `&maKhachHang=${encodeURIComponent(searchParams.maKhachHang.trim())}`
  }
  if (searchParams.hoTen && searchParams.hoTen.trim() !== '') {
    queryParams += `&hoTen=${encodeURIComponent(searchParams.hoTen.trim())}`
  }
  if (searchParams.soDienThoai && searchParams.soDienThoai.trim() !== '') {
    queryParams += `&soDienThoai=${encodeURIComponent(searchParams.soDienThoai.trim())}`
  }
  if (searchParams.email && searchParams.email.trim() !== '') {
    queryParams += `&email=${encodeURIComponent(searchParams.email.trim())}`
  }

  // Log the full URL that will be called
  console.log('DEBUG - Search URL:', `/api/khach-hang/tim-kiem?${queryParams}`)

  // Try the main search endpoint
  return api.get(`/api/khach-hang/tim-kiem?${queryParams}`)
    .catch(error => {
      console.log('DEBUG - Primary search endpoint failed:', error.message);

      // If the primary endpoint fails, try an alternative endpoint
      // (some backends use different naming conventions)
      console.log('DEBUG - Trying alternative endpoint...');
      return api.get(`/api/khach-hang/search?${queryParams}`);
    })
    .catch(error => {
      console.log('DEBUG - Alternative search endpoint failed:', error.message);
      console.log('DEBUG - Falling back to filtered list approach...');

      // If both search endpoints fail, fallback to getting all data and filtering manually
      return api.get('/api/khach-hang/hien-thi').then(response => {
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
          if (searchParams.hoTen) {
            filteredData = filteredData.filter(item =>
              item.hoTen && item.hoTen.toLowerCase().includes(searchParams.hoTen.toLowerCase()));
          }
          if (searchParams.soDienThoai) {
            filteredData = filteredData.filter(item =>
              item.soDienThoai && item.soDienThoai.includes(searchParams.soDienThoai));
          }
          if (searchParams.email) {
            filteredData = filteredData.filter(item =>
              item.email && item.email.toLowerCase().includes(searchParams.email.toLowerCase()));
          }

          // Create a pseudo-paginated response
          const totalElements = filteredData.length;
          const totalPages = Math.ceil(totalElements / size);
          const startIndex = page * size;
          const endIndex = Math.min(startIndex + size, totalElements);
          const content = filteredData.slice(startIndex, endIndex);

          return {
            data: {
              content: content,
              totalElements: totalElements,
              totalPages: totalPages,
              number: page,
              size: size
            }
          };
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
