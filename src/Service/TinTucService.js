import api from '@/utils/api';

// Lấy tất cả tin tức
export const getAllTinTuc = async () => {
  return api.get('/api/tin-tuc/hien-thi');
};

// Lấy chi tiết tin tức theo ID
export const getTinTucById = async (id) => {
  return api.get(`/api/tin-tuc/detail/${id}`);
};

// Thêm tin tức mới với hình ảnh
export const addTinTuc = async (data) => {
  // Nếu data là FormData, gửi trực tiếp
  if (data instanceof FormData) {
    return api.post('/api/tin-tuc/add', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Nếu không, gửi dữ liệu dạng JSON
  return api.post('/api/tin-tuc/add', data);
};

// Cập nhật tin tức với hình ảnh
export const updateTinTuc = async (id, data) => {
  // Đảm bảo id là số nguyên
  const cleanId = parseInt(id, 10);

  if (isNaN(cleanId)) {
    return Promise.reject(new Error('ID tin tức không hợp lệ'));
  }

  // Nếu data là FormData, gửi trực tiếp
  if (data instanceof FormData) {
    return api.put(`/api/tin-tuc/update/${cleanId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Nếu không, gửi dữ liệu dạng JSON
  return api.put(`/api/tin-tuc/update/${cleanId}`, data);
};

// Xóa tin tức
export const deleteTinTuc = async (id) => {
  return api.delete(`/api/tin-tuc/delete/${id}`);
};

// Tìm kiếm tin tức
export const searchTinTuc = async (page = 0, size = 10, tieuDe = '', ngayDang = null) => {
  let url = `/api/tin-tuc/search?page=${page}&size=${size}`;

  if (tieuDe) {
    url += `&tieuDe=${encodeURIComponent(tieuDe)}`;
  }

  if (ngayDang) {
    const formattedDate = ngayDang instanceof Date
      ? ngayDang.toISOString().split('T')[0]
      : ngayDang;
    url += `&ngayDang=${formattedDate}`;
  }

  return api.get(url);
};

// Chuẩn bị dữ liệu tin tức để gửi lên server
export function prepareTinTucData(data) {
  // Chuyển đổi dữ liệu cho phù hợp với API
  const preparedData = { ...data };

  // Đảm bảo taiKhoan là đối tượng với ID
  if (preparedData.taiKhoanId && !preparedData.taiKhoan) {
    preparedData.taiKhoan = { id: preparedData.taiKhoanId };
    // Keep taiKhoanId for JSON conversion in backend
  }

  return preparedData;
}
