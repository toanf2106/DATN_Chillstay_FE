// src/services/giamGiaService.js
import api from '@/utils/api'

export function createGiamGia(giamGiaData) {
  return api.post('/api/giamgia', giamGiaData)
}

export function updateGiamGia(id, giamGiaData) {
  return api.put(`/api/giamgia/${id}`, giamGiaData)
}

export function getGiamGiaById(id) {
  return api.get(`/api/giamgia/${id}`)
}

export function getAllGiamGia() {
  return api.get('/api/giamgia')
}

export function deleteGiamGia(id) {
  return api.delete(`/api/giamgia/${id}`)
}