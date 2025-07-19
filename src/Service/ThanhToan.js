import api from '../utils/api';

export default {
  tongTienDatHome(idDatHome) {
    return api.get(`/api/thanhToan/tongTienDatHome/${idDatHome}`);
  },

  createThanhToanTienMat(idDatHome, tienDaNhan, tienTraLai, tienThanhToan) {
    return api.post('/api/thanhToan/createThanhToan', null, {
      params: {
        idDatHome,
        tienDaNhan,
        tienTraLai,
        tienThanhToan
      }
    });
  }
};

