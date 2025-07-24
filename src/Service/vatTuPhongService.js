import api from '@/utils/api'

export const getAllVatTuPhong = () => {
  return api.get('/api/vat-tu-phong')
}
