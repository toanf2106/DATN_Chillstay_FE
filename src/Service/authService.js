import api from '@/utils/api'

export function login(username, password) {
  console.log('Sending login request with:', { username, password })
  return api.post('/api/login', { username, password })
}

export function getAccountInfo(username) {
  return api.get(`/api/account/${username}`)
}

export function verifyAccount(username, password) {
  return api.post('/api/account/verify', { username, password })
}

export function forgotPassword(email) {
  return api.post('/api/quen-mat-khau', { email })
}

export function resetPassword(token, matKhauMoi) {
  return api.post('/api/dat-lai-mat-khau', { token, matKhauMoi })
}

export function checkResetToken(token) {
  return api.get(`/api/kiem-tra-token?token=${token}`)
}
