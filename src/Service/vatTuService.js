import api from '@/utils/api'

export function getVatTuList() {
  return api.get('/api/vattu/all')
}
export function getVatTuById(id) {
  return api.get(`/api/vattu/one/${id}`)
}
export function createVatTu(vatTu) {
  return api.post('/api/vattu/add', vatTu)
}
export function updateVatTu(id, vatTu) {
  return api.put(`/api/vattu/update/${id}`, vatTu)
}
export function deleteVatTu(id) {
  return api.put(`/api/vattu/delete/${id}`)
}

export function resetVatTu(id) {
  return api.put(`/api/vattu/reset/${id}`)
}

export function pagedList() {
  return api.get('/api/vattu/paged')
}
 export function searchVatTu() {
  return api.get(`/api/vattu/search`)
}
