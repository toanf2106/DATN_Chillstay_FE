import api from '@/utils/api'

export function login(username, password) {
  return api.post('/api/login', { username, password })
}

export function getAccountInfo(username) {
  return api.get(`/api/account/${username}`)
}

export function verifyAccount(username, password) {
  return api.post('/api/account/verify', { username, password })
}
