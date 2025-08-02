import api from '@/utils/api'

export default {
  getAllDichVuChiTietByIdDatHome(idDatHome) {
    return api.get(`/api/dich-vu-chi-tiet/by-dat-home/${idDatHome}`)
  },

  updateQuantity(id, soLuong) {
    return api.post(`/api/dich-vu-chi-tiet/update-quantity/${id}`, { soLuong })
  },

  deleteDichVuChiTiet(id) {
    return api.get(`/api/dich-vu-chi-tiet/delete/${id}`)
  },

  addDichVuChiTiet(data) {
    return api.post('/api/dich-vu-chi-tiet/add', data)
  },

  addMultipleDichVuChiTiet(dataList) {
    return api.post('/api/dich-vu-chi-tiet/add-multiple', dataList)
  }
}
