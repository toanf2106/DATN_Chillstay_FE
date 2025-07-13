import api from '@/utils/api';

// Lấy tất cả homestay
export function getAllHomeStay() {
  return api.get('/api/homestay/all');
}

// Lấy thông tin chi tiết homestay theo ID
export function getHomeStayById(id) {
  return api.get(`/api/homestay/${id}`);
}

// Tạo mới homestay
export function createHomestay(data) {
  // Nếu data là FormData, gửi trực tiếp
  if (data instanceof FormData) {
    return api.post('/api/homestay/add', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Nếu không, đảm bảo dữ liệu đúng định dạng
  const formattedData = prepareDataForBackend(data);
  return api.post('/api/homestay/add', formattedData);
}

// Cập nhật thông tin homestay
export function updateHomestay(id, data) {
  // Đảm bảo id là số nguyên
  const cleanId = parseInt(id, 10);

  if (isNaN(cleanId)) {
    return Promise.reject(new Error('ID homestay không hợp lệ'));
  }

  // Nếu data là FormData, gửi trực tiếp
  if (data instanceof FormData) {
    return api.put(`/api/homestay/update/${cleanId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Nếu không, đảm bảo dữ liệu đúng định dạng
  const formattedData = prepareDataForBackend(data);
  return api.put(`/api/homestay/update/${cleanId}`, formattedData);
}

// Xóa homestay
export function deleteHomeStay(id) {
  return api.put(`/api/homestay/delete/${id}`);
}

// Cập nhật trạng thái homestay
export function updateHomeStayStatus(id, status) {
  return api.patch(`/api/homestay/${id}/status`, { status });
}

// Hàm helper để chuẩn bị dữ liệu
function prepareDataForBackend(data) {
  // Tạo bản sao để không ảnh hưởng đến dữ liệu gốc
  const formattedData = { ...data };

  // Đảm bảo các trường số được chuyển đổi đúng
  if (formattedData.dienTich) {
    formattedData.dienTich = parseFloat(formattedData.dienTich);
  }

  if (formattedData.giaCaHomestay) {
    formattedData.giaCaHomestay = parseFloat(formattedData.giaCaHomestay);
  }

  // Đảm bảo có mã homestay
  if (!formattedData.maHomestay) {
    formattedData.maHomestay = 'HS' + Date.now().toString().slice(-6);
  }

  // Đảm bảo loaiHomeStay và chuHomeStay là đối tượng
  if (formattedData.idLoaiHomeStay && !formattedData.loaiHomeStay) {
    formattedData.loaiHomeStay = { id: formattedData.idLoaiHomeStay };
    delete formattedData.idLoaiHomeStay;
  }

  if (formattedData.idChuHomeStay && !formattedData.chuHomeStay) {
    formattedData.chuHomeStay = { id: formattedData.idChuHomeStay };
    delete formattedData.idChuHomeStay;
  }

  // Xóa các trường không cần thiết
  delete formattedData.tenLoaiHomestay;
  delete formattedData.hotenChuHomestay;

  return formattedData;
}

// Thêm các alias cho các hàm trên để phù hợp với tên gọi trong QlyHomestay.vue
export const deleteHomestayAPI = deleteHomeStay;

// Lấy danh sách loại homestay
export function getLoaiHomeStay() {
  return api.get('/api/loai-homestay/hien-thi');
}

// Lấy danh sách chủ homestay
export function getChuHomeStay() {
  // Endpoint đúng là /api/chu-home/all theo ChuHomeController
  return api.get('/api/chu-home/all')
    .catch(error => {
      // Thử endpoint dự phòng nếu endpoint chính trả về lỗi 404
      if (error.response && error.response.status === 404) {
        return api.get('/api/chu-homestay/all');
      }
      throw error;
    });
}

// Tải lên hình ảnh
export function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/upload/homestay', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// Lấy loại homestay theo id
export function getLoaiHomeStayById(id) {
  return api.get(`/api/loai-homestay/detail/${id}`);
}

// Thêm loại homestay mới
export function createLoaiHomestay(loaiHomestayData) {
  return api.post('/api/loai-homestay/add', loaiHomestayData);
}

// Cập nhật loại homestay
export function updateLoaiHomestay(id, loaiHomestayData) {
  return api.put(`/api/loai-homestay/${id}`, loaiHomestayData);
}

// Xóa loại homestay
export function deleteLoaiHomestay(id) {
  return api.put(`/api/loai-homestay/delete/${id}`);
}

// Đổi trạng thái loại homestay
export function changeLoaiHomestayStatus(id) {
  return api.put(`/api/loai-homestay/change-status/${id}`);
}

// Lấy danh sách ảnh của homestay
export function getAnhHomeStayByHomestayId(homestayId) {
  return api.get(`/api/anh_homestay/by-homestay/${homestayId}`);
}

// Thêm ảnh cho homestay
export function addAnhHomeStay(data) {
  if (data instanceof FormData) {
    return api.post('/api/anh_homestay/add', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  return api.post('/api/anh_homestay/add', data);
}

// Cập nhật ảnh homestay
export function updateAnhHomeStay(id, data) {
  if (data instanceof FormData) {
    return api.put(`/api/anh_homestay/update/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  return api.put(`/api/anh_homestay/update/${id}`, data);
}

// Xóa ảnh homestay
export function deleteAnhHomeStay(id) {
  return api.put(`/api/anh_homestay/delete/${id}`);
}

// Tải lên ảnh homestay
export function uploadAnhHomeStay(file, homestayId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('homestayId', homestayId);
  return api.post('/api/anh_homestay/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// Lấy số lượng phòng theo ID homestay
export function getSoPhongByHomestayId(homestayId) {
  return api.get(`/api/homestay/Phong/${homestayId}`);
}
