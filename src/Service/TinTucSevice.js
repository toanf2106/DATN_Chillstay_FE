import api from '@/utils/api';

// Lấy tất cả tin tức
export function getAllTinTuc() {
  return api.get('/api/tin-tuc/hien-thi');
}

// Lấy chi tiết tin tức theo id
export function getTinTucById(id) {
  return api.get(`/api/tin-tuc/detail/${id}`);
}

// Thêm tin tức
export function addTinTuc(tinTuc) {
  return api.post('/api/tin-tuc/add', tinTuc);
}

// Cập nhật tin tức
export function updateTinTuc(id, tinTuc) {
  return api.put(`/api/tin-tuc/update/${id}`, tinTuc);
}

// Xóa tin tức
export function deleteTinTuc(id) {
  return api.delete(`/api/tin-tuc/delete/${id}`);
}

// Tìm kiếm và phân trang tin tức
export function searchTinTuc({ page = 0, size = 8, tieuDe = '', ngayDang = null, maTinTuc = '', trangThai = null }) {
  const params = {
    page,
    size,
    tieuDe,
    maTinTuc,
    trangThai
  };

  if (ngayDang) {
    params.ngayDang = ngayDang;
  }

  return api.get('/api/tin-tuc/phan-trang', { params });
}

// Upload ảnh tin tức
export function uploadImageTinTuc(formData) {
  return api.post('/api/tin-tuc/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// Lấy ảnh tin tức theo id
export function getImageTinTuc(id) {
  return api.get(`/api/tin-tuc/image/${id}`);
}

// Xóa ảnh tin tức
export function deleteImageTinTuc(id) {
  return api.delete(`/api/tin-tuc/image/${id}`);
}

// Lấy tất cả ảnh tin tức
export function getAllImagesTinTuc() {
  return api.get('/api/tin-tuc/images');
}

// Cập nhật ảnh tin tức
export function updateImageTinTuc(id, formData) {
  return api.put(`/api/tin-tuc/image/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// Lấy tất cả ảnh của một tin tức
export function getImagesByNewsId(newsId) {
  return api.get(`/api/tin-tuc/${newsId}/images`);
}

// Thêm ảnh mới cho một tin tức
export function addImageToNews(newsId, formData) {
  return api.post(`/api/tin-tuc/${newsId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// Xóa một ảnh của tin tức
export function deleteNewsImage(imageId) {
  return api.delete(`/api/tin-tuc/images/${imageId}`);
}
