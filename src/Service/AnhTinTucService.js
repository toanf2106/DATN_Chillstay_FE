import api from '@/utils/api';

// Lấy danh sách ảnh của tin tức
export function getAnhTinTucByTinTucId(tinTucId) {
  return api.get(`/api/anh-tintuc/by-tintuc/${tinTucId}`);
}

// Lấy danh sách ảnh đã xóa của tin tức
export function getDeletedAnhTinTucByTinTucId(tinTucId) {
  return api.get(`/api/anh-tintuc/deleted-by-tintuc/${tinTucId}`);
}

// Thêm ảnh cho tin tức
export function addAnhTinTucWithImage(formData) {
  console.log('Gửi yêu cầu upload ảnh tin tức');

  // Kiểm tra formData
  if (formData instanceof FormData) {
    // Log some info about the formData for debugging
    const file = formData.get('file');
    const tinTucId = formData.get('tinTucId');

    // Validate tinTucId
    if (!tinTucId || tinTucId === 'undefined' || tinTucId === 'null') {
      console.error('ID tin tức không hợp lệ:', tinTucId);
      return Promise.reject(new Error('ID tin tức không được để trống hoặc không hợp lệ'));
    }

    if (file) {
      console.log(`Uploading file: ${file.name}, size: ${file.size} bytes for tin tức ID: ${tinTucId}`);
    } else {
      console.warn('FormData does not contain a file');
      return Promise.reject(new Error('Không tìm thấy file trong FormData'));
    }
  } else {
    console.error('Invalid FormData object');
    return Promise.reject(new Error('Dữ liệu form không hợp lệ'));
  }

  return api.post('/api/anh-tintuc/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000 // Increase timeout for large images
  }).catch(error => {
    console.error('Lỗi khi upload ảnh:', error);
    if (error.response) {
      console.error('Server responded with:', error.response.data);
    }
    throw error;
  });
}

// Cập nhật ảnh tin tức
export function updateAnhTinTucWithImage(id, formData) {
  return api.put(`/api/anh-tintuc/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// Xóa ảnh tin tức
export function deleteAnhTinTuc(id) {
  return api.put(`/api/anh-tintuc/delete/${id}`);
}

// Khôi phục ảnh tin tức đã xóa
export function restoreAnhTinTuc(id) {
  return api.put(`/api/anh-tintuc/restore/${id}`);
}

// Đặt ảnh làm ảnh bìa cho tin tức
export function setAnhBia(tinTucId, anhId) {
  return api.put(`/api/anh-tintuc/set-cover/${tinTucId}/${anhId}`);
}
