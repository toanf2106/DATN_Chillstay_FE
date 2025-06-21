import api from '@/utils/api';

export function getAllNhanVien() {
    return api.get('/api/nhanVien/all');
}
export function getNhanVienById(id) {
    return api.get(`/api/nhanVien/${id}`);
}
export function deleteNhanVien(id) {
    return api.put(`/api/nhanVien/delete/${id}`);
}
export function restoreNhanVien(id) {
    return api.put(`/api/nhanVien/restore/${id}`);
}
