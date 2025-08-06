import api from '@/utils/api'

export default {
  // Lấy tất cả phụ phí chi tiết
  getAllPhuPhiChiTiet() {
    return api.get('/api/phu-phi-chi-tiet/all');
  },

  // Lấy phụ phí chi tiết theo ID đặt phòng
  getPhuPhiChiTietByDatHomeId(datHomeId) {
    return api.get(`/api/phu-phi-chi-tiet/dat-home/${datHomeId}`);
  },

  // Thêm phụ phí chi tiết
  createPhuPhiChiTiet(data) {
    return api.post('/api/phu-phi-chi-tiet/create', data);
  },

  // Thêm nhiều phụ phí chi tiết cùng lúc
  addMultiplePhuPhiChiTiet(dataList) {
    return api.post('/api/phu-phi-chi-tiet/add-multiple', dataList);
  },

  // Xóa phụ phí chi tiết
  deletePhuPhiChiTiet(id) {
    return api.delete(`/api/phu-phi-chi-tiet/${id}`);
  },

  // Các phương thức dưới đây đã được xóa vì không được sử dụng trong dự án:
  // - updatePhuPhiChiTiet(id, data)
  // - deletePhuPhiChiTiet(id)
  // - restorePhuPhiChiTiet(id)
}
