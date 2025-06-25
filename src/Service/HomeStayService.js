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
export function createHomeStay(data) {
  // Đảm bảo dữ liệu đúng định dạng
  const formattedData = prepareDataForBackend(data);
  console.log('Dữ liệu gửi đi khi tạo mới:', formattedData);
  return api.post('/api/homestay/add', formattedData);
}

// Cập nhật thông tin homestay
export function updateHomeStay(id, data) {
  // Đảm bảo dữ liệu đúng định dạng
  const formattedData = prepareDataForBackend(data);
  console.log('Dữ liệu gửi đi khi cập nhật:', formattedData);
  return api.put(`/api/homestay/update/${id}`, formattedData);
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
export const createHomestay = createHomeStay;
export const updateHomestay = updateHomeStay;
export const deleteHomestayAPI = deleteHomeStay;

// Lấy danh sách loại homestay
// Danh sách loại homestay
export function getLoaiHomeStay() {
  // Backend: GET /loai-homestay/hien-thi
  console.log('Gọi API lấy loại homestay');
  return api.get('/loai-homestay/hien-thi')
    .then(response => {
      console.log('Dữ liệu loại homestay nhận được:', response.data);
      return response;
    })
    .catch(error => {
      console.error('Lỗi khi lấy loại homestay:', error);
      throw error;
    });
}

// Lấy danh sách chủ homestay
// Danh sách chủ homestay
export function getChuHomeStay() {
  // Endpoint đúng là /api/chu-home/all theo ChuHomeController
  console.log('Gọi API lấy chủ homestay');
  return api.get('/api/chu-home/all')
    .then(response => {
      console.log('Dữ liệu chủ homestay nhận được:', response.data);
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('Mẫu dữ liệu chủ homestay đầu tiên:', response.data[0]);
        console.log('Tên các thuộc tính:', Object.keys(response.data[0]));
      } else {
        console.warn('Không nhận được dữ liệu hoặc dữ liệu rỗng từ API chủ homestay');
      }
      return response;
    })
    .catch(error => {
      console.error('Lỗi khi lấy chủ homestay từ /api/chu-home/all:', error);
      // Hiển thị thông tin chi tiết lỗi nếu có
      if (error.response) {
        console.error('Lỗi response:', error.response.status, error.response.data);
        // Thử endpoint dự phòng nếu endpoint chính trả về lỗi 404
        if (error.response.status === 404) {
          console.log('Thử endpoint dự phòng...');
          return api.get('/api/chu-homestay/all')
            .catch(backupError => {
              console.error('Lỗi khi gọi endpoint dự phòng:', backupError);
              throw backupError;
            });
        }
      } else if (error.request) {
        console.error('Không nhận được response:', error.request);
      } else {
        console.error('Lỗi cấu hình:', error.message);
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
