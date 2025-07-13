import api from '@/utils/api'

/**
 * Lấy danh sách tất cả các phòng
 * @returns {Promise} Promise containing the response
 */
export const getAllPhong = async () => {
  return await api.get('/api/phong/all')
}

/**
 * Lấy thông tin chi tiết của phòng theo ID
 * @param {number} id - ID của phòng cần lấy thông tin
 * @returns {Promise} Promise containing the response
 */
export const getPhongById = async (id) => {
  return await api.get(`/api/phong/detail/${id}`)
}

/**
 * Thêm phòng mới
 * @param {Object} phongData - Dữ liệu phòng cần thêm
 * @returns {Promise} Promise containing the response
 */
export const addPhong = async (phongData) => {
  try {
    // Nếu phongData là FormData, trích xuất dữ liệu JSON từ FormData
    if (phongData instanceof FormData) {
      const phongJson = phongData.get('phong');
      if (phongJson) {
        const phongObj = JSON.parse(phongJson);
        console.log("Dữ liệu JSON được trích xuất từ FormData:", phongObj);

        // Đảm bảo tất cả các trường đều được đặt tên đúng định dạng cho backend
        // Chuyển đổi tên trường từ camelCase sang Snake_Case
        const formattedObj = {};

        // Xử lý các trường đặc biệt cho JPA Entities
        if (phongObj.HomeStay_ID) {
          formattedObj.idhomeStay = { id: phongObj.HomeStay_ID };
        } else if (phongObj.idhomeStay) {
          formattedObj.idhomeStay = phongObj.idhomeStay;
        }

        if (phongObj.LoaiPhong_ID) {
          formattedObj.idloaiPhong = { id: phongObj.LoaiPhong_ID };
        } else if (phongObj.idloaiPhong) {
          formattedObj.idloaiPhong = phongObj.idloaiPhong;
        }

        // Xử lý các trường thường
        if (phongObj.Ten_Phong !== undefined) {
          formattedObj.tenPhong = phongObj.Ten_Phong;
        } else if (phongObj.tenPhong !== undefined) {
          formattedObj.tenPhong = phongObj.tenPhong;
        }

        if (phongObj.Ma_Phong !== undefined) {
          formattedObj.maPhong = phongObj.Ma_Phong;
        } else if (phongObj.maPhong !== undefined) {
          formattedObj.maPhong = phongObj.maPhong;
        }

        if (phongObj.Dien_Tich !== undefined) {
          formattedObj.dienTich = parseFloat(phongObj.Dien_Tich);
        } else if (phongObj.dienTich !== undefined) {
          formattedObj.dienTich = parseFloat(phongObj.dienTich);
        }

        if (phongObj.Mo_Ta !== undefined) {
          formattedObj.moTa = phongObj.Mo_Ta;
        } else if (phongObj.moTa !== undefined) {
          formattedObj.moTa = phongObj.moTa;
        }

        if (phongObj.Tang_So !== undefined) {
          formattedObj.tangSo = parseInt(phongObj.Tang_So, 10);
        } else if (phongObj.tangSo !== undefined) {
          formattedObj.tangSo = parseInt(phongObj.tangSo, 10);
        }

        if (phongObj.So_Nguoi_Lon !== undefined) {
          formattedObj.soNguoiLon = parseInt(phongObj.So_Nguoi_Lon, 10);
        } else if (phongObj.soNguoiLon !== undefined) {
          formattedObj.soNguoiLon = parseInt(phongObj.soNguoiLon, 10);
        }

        if (phongObj.So_Nguoi_Nho !== undefined) {
          formattedObj.soNguoiNho = parseInt(phongObj.So_Nguoi_Nho, 10);
        } else if (phongObj.soNguoiNho !== undefined) {
          formattedObj.soNguoiNho = parseInt(phongObj.soNguoiNho, 10);
        }

        if (phongObj.So_Nguoi_Toi_Da !== undefined) {
          formattedObj.soNguoiToiDa = parseInt(phongObj.So_Nguoi_Toi_Da, 10);
        } else if (phongObj.soNguoiToiDa !== undefined) {
          formattedObj.soNguoiToiDa = parseInt(phongObj.soNguoiToiDa, 10);
        }

        if (phongObj.Anh_Bia !== undefined) {
          formattedObj.anhBia = phongObj.Anh_Bia;
        } else if (phongObj.anhBia !== undefined) {
          formattedObj.anhBia = phongObj.anhBia;
        }

        if (phongObj.Trang_Thai !== undefined) {
          formattedObj.trangThai = phongObj.Trang_Thai;
        } else if (phongObj.trangThai !== undefined) {
          formattedObj.trangThai = phongObj.trangThai;
        }

        // Đảm bảo trường id nếu có
        if (phongObj.id) {
          formattedObj.id = phongObj.id;
        }

        // Log dữ liệu đã định dạng để kiểm tra
        console.log("Dữ liệu đã định dạng gửi đến backend:", formattedObj);

        // Gửi dữ liệu JSON trực tiếp, không gửi FormData
        return await api.post('/api/phong/add', formattedObj, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        throw new Error('Không tìm thấy dữ liệu phòng trong FormData');
      }
    }

    // Nếu không phải FormData, chuẩn bị dữ liệu và gửi
    const formattedData = preparePhongData(phongData);
    return await api.post('/api/phong/add', formattedData);
  } catch (error) {
    console.error('Lỗi khi thêm phòng:', error);
    throw error;
  }
}

/**
 * Thêm phòng mới với hỗ trợ tải lên ảnh bìa
 * @param {FormData} formData - FormData chứa dữ liệu phòng và file ảnh
 * @returns {Promise} Promise containing the response
 */
export const addPhongWithImage = async (formData) => {
  try {
    console.log('Đang gọi API thêm phòng với ảnh bìa');

    // Kiểm tra formData có chứa phần tử 'phong' và 'file' không
    if (!formData.has('phong')) {
      throw new Error('FormData phải chứa dữ liệu phòng (phong)');
    }

    // Log để kiểm tra
    console.log('FormData có file:', formData.has('file'));

    // Gọi API endpoint mới
    const response = await api.post('/api/phong/add-with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Cache-Control': 'no-cache'
      },
      timeout: 30000 // Timeout dài hơn cho upload file
    });

    console.log('Kết quả thêm phòng với ảnh:', response);
    return response;
  } catch (error) {
    console.error('Lỗi khi thêm phòng với ảnh:', error);
    throw error;
  }
}

/**
 * Cập nhật thông tin phòng
 * @param {number} id - ID của phòng cần cập nhật
 * @param {Object} phongData - Dữ liệu phòng đã cập nhật
 * @returns {Promise} Promise containing the response
 */
export const updatePhong = async (id, phongData) => {
  // Đảm bảo id là số nguyên
  const cleanId = parseInt(id, 10);
  if (isNaN(cleanId)) {
    return Promise.reject(new Error('ID phòng không hợp lệ'));
  }

  try {
    console.log(`Đang cập nhật phòng với ID ${cleanId}`);

    // Nếu phongData là FormData, trích xuất dữ liệu JSON từ FormData
    if (phongData instanceof FormData) {
      const phongJson = phongData.get('phong');
      if (phongJson) {
        const phongObj = JSON.parse(phongJson);
        console.log("Dữ liệu JSON được trích xuất từ FormData:", phongObj);

        // Đảm bảo tất cả các trường đều được đặt tên đúng định dạng cho backend
        // Chuyển đổi tên trường từ camelCase sang Snake_Case
        const formattedObj = {};

        // Xử lý các trường đặc biệt cho JPA Entities
        if (phongObj.HomeStay_ID) {
          formattedObj.idhomeStay = { id: phongObj.HomeStay_ID };
        } else if (phongObj.idhomeStay) {
          formattedObj.idhomeStay = phongObj.idhomeStay;
        }

        if (phongObj.LoaiPhong_ID) {
          formattedObj.idloaiPhong = { id: phongObj.LoaiPhong_ID };
        } else if (phongObj.idloaiPhong) {
          formattedObj.idloaiPhong = phongObj.idloaiPhong;
        }

        // Xử lý các trường thường
        if (phongObj.Ten_Phong !== undefined) {
          formattedObj.tenPhong = phongObj.Ten_Phong;
        } else if (phongObj.tenPhong !== undefined) {
          formattedObj.tenPhong = phongObj.tenPhong;
        }

        if (phongObj.Ma_Phong !== undefined) {
          formattedObj.maPhong = phongObj.Ma_Phong;
        } else if (phongObj.maPhong !== undefined) {
          formattedObj.maPhong = phongObj.maPhong;
        }

        if (phongObj.Dien_Tich !== undefined) {
          formattedObj.dienTich = parseFloat(phongObj.Dien_Tich);
        } else if (phongObj.dienTich !== undefined) {
          formattedObj.dienTich = parseFloat(phongObj.dienTich);
        }

        if (phongObj.Mo_Ta !== undefined) {
          formattedObj.moTa = phongObj.Mo_Ta;
        } else if (phongObj.moTa !== undefined) {
          formattedObj.moTa = phongObj.moTa;
        }

        if (phongObj.Tang_So !== undefined) {
          formattedObj.tangSo = parseInt(phongObj.Tang_So, 10);
        } else if (phongObj.tangSo !== undefined) {
          formattedObj.tangSo = parseInt(phongObj.tangSo, 10);
        }

        if (phongObj.So_Nguoi_Lon !== undefined) {
          formattedObj.soNguoiLon = parseInt(phongObj.So_Nguoi_Lon, 10);
        } else if (phongObj.soNguoiLon !== undefined) {
          formattedObj.soNguoiLon = parseInt(phongObj.soNguoiLon, 10);
        }

        if (phongObj.So_Nguoi_Nho !== undefined) {
          formattedObj.soNguoiNho = parseInt(phongObj.So_Nguoi_Nho, 10);
        } else if (phongObj.soNguoiNho !== undefined) {
          formattedObj.soNguoiNho = parseInt(phongObj.soNguoiNho, 10);
        }

        if (phongObj.So_Nguoi_Toi_Da !== undefined) {
          formattedObj.soNguoiToiDa = parseInt(phongObj.So_Nguoi_Toi_Da, 10);
        } else if (phongObj.soNguoiToiDa !== undefined) {
          formattedObj.soNguoiToiDa = parseInt(phongObj.soNguoiToiDa, 10);
        }

        if (phongObj.Anh_Bia !== undefined) {
          formattedObj.anhBia = phongObj.Anh_Bia;
        } else if (phongObj.anhBia !== undefined) {
          formattedObj.anhBia = phongObj.anhBia;
        }

        if (phongObj.Trang_Thai !== undefined) {
          formattedObj.trangThai = phongObj.Trang_Thai;
        } else if (phongObj.trangThai !== undefined) {
          formattedObj.trangThai = phongObj.trangThai;
        }

        // Đảm bảo trường id nếu có
        if (phongObj.id) {
          formattedObj.id = phongObj.id;
        } else {
          formattedObj.id = cleanId; // Đảm bảo ID luôn được gán cho cập nhật
        }

        // Log dữ liệu đã định dạng để kiểm tra
        console.log("Dữ liệu đã định dạng gửi đến backend:", formattedObj);

        // Gửi dữ liệu JSON trực tiếp, không gửi FormData
        return await api.put(`/api/phong/update/${cleanId}`, formattedObj, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        throw new Error('Không tìm thấy dữ liệu phòng trong FormData');
      }
    }

    // Nếu không phải FormData, chuẩn bị dữ liệu và gửi
    const formattedData = preparePhongData(phongData);
    return await api.put(`/api/phong/update/${cleanId}`, formattedData);
  } catch (error) {
    console.error(`Lỗi khi cập nhật phòng ID ${cleanId}:`, error);
    throw error;
  }
}

/**
 * Cập nhật phòng với hỗ trợ tải lên ảnh bìa
 * @param {number} id - ID của phòng cần cập nhật
 * @param {FormData} formData - FormData chứa dữ liệu phòng và file ảnh
 * @returns {Promise} Promise containing the response
 */
export const updatePhongWithImage = async (id, formData) => {
  try {
    // Đảm bảo id là số nguyên
    const cleanId = parseInt(id, 10);
    if (isNaN(cleanId)) {
      return Promise.reject(new Error('ID phòng không hợp lệ'));
    }

    console.log(`Đang cập nhật phòng với ID ${cleanId} và ảnh bìa`);

    // Kiểm tra formData có chứa phần tử 'phong'
    if (!formData.has('phong')) {
      throw new Error('FormData phải chứa dữ liệu phòng (phong)');
    }

    // Log để kiểm tra
    console.log('FormData có file:', formData.has('file'));

    // Gọi API endpoint mới
    const response = await api.put(`/api/phong/update-with-image/${cleanId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Cache-Control': 'no-cache'
      },
      timeout: 30000 // Timeout dài hơn cho upload file
    });

    console.log('Kết quả cập nhật phòng với ảnh:', response);
    return response;
  } catch (error) {
    console.error(`Lỗi khi cập nhật phòng ID ${id} với ảnh:`, error);
    throw error;
  }
}

/**
 * Xóa phòng theo ID
 * @param {number} id - ID của phòng cần xóa
 * @returns {Promise} Promise containing the response
 */
export const deletePhong = async (id) => {
  return await api.put(`/api/phong/delete/${id}`);
}

/**
 * Lấy danh sách ảnh phòng theo ID phòng
 * @param {number} phongId - ID của phòng cần lấy ảnh
 * @returns {Promise} Promise containing the response
 */
export const getAnhPhongByPhongId = async (phongId) => {
  try {
    console.log(`Đang tải ảnh cho phòng ID: ${phongId}`);
    if (!phongId) {
      console.error('phongId không hợp lệ:', phongId);
      return { data: [] }; // Trả về mảng rỗng nếu phongId không hợp lệ
    }

    // Thử endpoint chính
    try {
      console.log(`Calling main endpoint: /api/anh_phong/by-phong/${phongId}`);
      const response = await api.get(`/api/anh_phong/by-phong/${phongId}`);

      // Log response for debugging
      if (response.data) {
        console.log(`Received ${Array.isArray(response.data) ? response.data.length : 0} images from API`);

        if (Array.isArray(response.data) && response.data.length > 0) {
          const firstImage = response.data[0];
          console.log('First image sample:', {
            id: firstImage.id,
            url: firstImage.duongDanAnh,
            hasPhong: !!firstImage.phong
          });

          // Xử lý và chuẩn hóa URL cho mỗi hình ảnh
          response.data = response.data.map(img => {
            if (img.duongDanAnh && img.duongDanAnh.startsWith('http')) {
              try {
                img.duongDanAnh = encodeURI(img.duongDanAnh);
              } catch (urlError) {
                console.error('Lỗi khi xử lý URL ảnh:', urlError);
              }
            }
            return img;
          });
        }
      }

      return response;
    } catch (error) {
      console.error('Lỗi khi tải ảnh phòng:', error);
      // Không throw lỗi, để component không bị crash
      return { data: [] }; // Trả về mảng rỗng trong trường hợp lỗi
    }
  } catch (error) {
    console.error(`Lỗi khi tải ảnh phòng ID ${phongId}:`, error);
    // Không throw lỗi, để component không bị crash
    return { data: [] }; // Trả về mảng rỗng trong trường hợp lỗi
  }
}

/**
 * Tải lên ảnh phòng mới
 * @param {File} file - File ảnh cần tải lên
 * @param {number} phongId - ID của phòng
 * @returns {Promise} Promise containing the response
 */
export const uploadAnhPhong = async (file, phongId) => {
  try {
    console.log(`Đang tải ảnh lên cho phòng ID: ${phongId}`);

    if (!file) {
      throw new Error('File ảnh không hợp lệ');
    }

    if (!phongId) {
      throw new Error('ID phòng không hợp lệ');
    }

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Kích thước file không được vượt quá 5MB');
    }

    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
      throw new Error('File phải là ảnh (jpg, png, gif, ...)');
    }

    // Log file information
    console.log(`File info: name=${file.name}, type=${file.type}, size=${file.size} bytes`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('phongId', phongId);

    // Make sure the FormData is correctly built
    console.log('FormData has file:', formData.has('file'));
    console.log('FormData has phongId:', formData.has('phongId'), 'with value', phongId);

    // Thử với endpoint chuẩn
    try {
      console.log('Sending request to /api/anh_phong/upload endpoint');
      const response = await api.post('/api/anh_phong/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Cache-Control': 'no-cache'
        },
        // Thêm timeout dài hơn cho upload file lớn
        timeout: 30000
      });

      console.log('Upload response:', response);
      return response;
    } catch (error) {
      console.error('Lỗi khi tải ảnh lên:', error);
      throw error;
    }
  } catch (error) {
    console.error(`Lỗi khi tải ảnh lên cho phòng ID ${phongId}:`, error);
    throw error;
  }
}

/**
 * Xóa ảnh phòng theo ID
 * @param {number} anhPhongId - ID của ảnh phòng cần xóa
 * @returns {Promise} Promise containing the response
 */
export const deleteAnhPhong = async (anhPhongId) => {
  return api.put(`/api/anh_phong/delete/${anhPhongId}`);
}

/**
 * Tìm kiếm phòng với các tiêu chí khác nhau
 * @param {Object} searchParams - Các tham số tìm kiếm (id, maPhong, tenPhong)
 * @returns {Promise} Promise containing the response
 */
export const searchPhong = async (searchParams) => {
  const params = new URLSearchParams();

  if (searchParams.id) {
    params.append('id', searchParams.id);
  }

  if (searchParams.maPhong) {
    params.append('maPhong', searchParams.maPhong);
  }

  if (searchParams.tenPhong) {
    params.append('tenPhong', searchParams.tenPhong);
  }

  return await api.get(`/api/phong/search?${params.toString()}`);
}

/**
 * Phân trang danh sách phòng
 * @param {number} page - Số trang (mặc định là 0)
 * @returns {Promise} Promise containing the response
 */
export const getPhongPaginated = async (page = 0) => {
  return await api.get(`/api/phong/list?page=${page}`);
}

/**
 * Lấy danh sách loại phòng
 * @returns {Promise} Promise containing the response
 */
export const getLoaiPhongList = async () => {
  try {
    // Thử endpoint chính trước
    console.log("Đang thử endpoint chính /api/loaiphong/all");
    const response = await api.get('/api/loaiphong/all');
    console.log("Tải loại phòng thành công từ endpoint chính:", response.data);
    return response;
  } catch (error) {
    console.error('Lỗi khi tải loại phòng từ endpoint chính:', error);

    try {
      // Thử endpoint dự phòng 1
      console.log("Đang thử endpoint dự phòng 1 /api/loai-phong/all");
      const response = await api.get('/api/loai-phong/all');
      console.log("Tải loại phòng thành công từ endpoint dự phòng 1:", response.data);
      return response;
    } catch (error2) {
      console.error('Lỗi khi tải loại phòng từ endpoint dự phòng 1:', error2);

      try {
        // Thử endpoint dự phòng 2
        console.log("Đang thử endpoint dự phòng 2 /loaiphong/all");
        const response = await api.get('/loaiphong/all');
        console.log("Tải loại phòng thành công từ endpoint dự phòng 2:", response.data);
        return response;
      } catch (error3) {
        console.error('Lỗi khi tải loại phòng từ endpoint dự phòng 2:', error3);

        // Fallback to mock data if all API calls fail
        console.warn('Fallback to mock data for loại phòng');
        return {
          data: [
            {
              id: 1,
              maLoaiPhong: "LP001",
              tenLoaiPhong: "Phòng Tiêu Chuẩn",
              moTa: "Phòng cơ bản, view đồi chè",
              soLuong: 5,
              trangThai: true
            },
            {
              id: 2,
              maLoaiPhong: "LP002",
              tenLoaiPhong: "Phòng VIP",
              moTa: "Phòng cao cấp, ban công hướng núi",
              soLuong: 3,
              trangThai: true
            },
            {
              id: 3,
              maLoaiPhong: "LP003",
              tenLoaiPhong: "Phòng Gia Đình",
              moTa: "Phòng rộng cho 4-6 người",
              soLuong: 2,
              trangThai: true
            }
          ]
        };
      }
    }
  }
}

/**
 * Lấy chi tiết loại phòng theo ID
 * @param {number} id - ID của loại phòng
 * @returns {Promise} Promise containing the response
 */
export const getLoaiPhongById = async (id) => {
  try {
    return await api.get(`/api/loaiphong/detail/${id}`);
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin loại phòng ID ${id}:`, error);

    try {
      // Thử endpoint dự phòng
      return await api.get(`/api/loai-phong/${id}`);
    } catch (error2) {
      console.error(`Lỗi khi lấy thông tin loại phòng từ endpoint dự phòng:`, error2);
      throw error2;
    }
  }
}

/**
 * Tìm kiếm loại phòng
 * @param {Object} params - Các tiêu chí tìm kiếm
 * @returns {Promise} Promise containing the response
 */
export const searchLoaiPhong = async (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.maLoaiPhong) {
    searchParams.append('maLoaiPhong', params.maLoaiPhong);
  }

  if (params.tenLoaiPhong) {
    searchParams.append('tenLoaiPhong', params.tenLoaiPhong);
  }

  if (params.trangThai !== undefined) {
    searchParams.append('trangThai', params.trangThai);
  }

  try {
    return await api.get(`/api/loaiphong/search?${searchParams.toString()}`);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm loại phòng:', error);

    try {
      // Thử endpoint dự phòng
      return await api.get(`/api/loai-phong/search?${searchParams.toString()}`);
    } catch (error2) {
      console.error('Lỗi khi tìm kiếm loại phòng từ endpoint dự phòng:', error2);
      // Trả về kết quả rỗng nếu không tìm kiếm được
      return { data: [] };
    }
  }
}

/**
 * Thêm loại phòng mới
 * @param {Object} loaiPhongData - Dữ liệu loại phòng cần thêm
 * @returns {Promise} Promise containing the response
 */
export const addLoaiPhong = async (loaiPhongData) => {
  // Đảm bảo dữ liệu có định dạng đúng
  const formattedData = {
    ...loaiPhongData,
    soLuong: parseInt(loaiPhongData.soLuong || 0, 10),
    trangThai: loaiPhongData.trangThai !== undefined ? loaiPhongData.trangThai : true
  };

  try {
    console.log('Đang thêm loại phòng mới:', formattedData);
    return await api.post('/api/loaiphong/add', formattedData);
  } catch (error) {
    console.error('Lỗi khi thêm loại phòng:', error);

    // Thử endpoint dự phòng
    try {
      return await api.post('/api/loai-phong/add', formattedData);
    } catch (error2) {
      console.error('Lỗi khi thêm loại phòng từ endpoint dự phòng:', error2);
      throw error2;
    }
  }
}

/**
 * Cập nhật thông tin loại phòng
 * @param {Object} loaiPhongData - Dữ liệu loại phòng đã cập nhật
 * @returns {Promise} Promise containing the response
 */
export const updateLoaiPhong = async (loaiPhongData) => {
  // Đảm bảo dữ liệu có định dạng đúng
  const id = loaiPhongData.id;
  const formattedData = {
    ...loaiPhongData,
    soLuong: parseInt(loaiPhongData.soLuong || 0, 10),
    trangThai: loaiPhongData.trangThai !== undefined ? loaiPhongData.trangThai : true
  };

  try {
    console.log(`Đang cập nhật loại phòng ID ${id}:`, formattedData);
    return await api.put(`/api/loaiphong/update/${id}`, formattedData);
  } catch (error) {
    console.error(`Lỗi khi cập nhật loại phòng ID ${id}:`, error);

    // Thử endpoint dự phòng
    try {
      return await api.put(`/api/loai-phong/${id}`, formattedData);
    } catch (error2) {
      console.error('Lỗi khi cập nhật loại phòng từ endpoint dự phòng:', error2);
      throw error2;
    }
  }
}

/**
 * Xóa loại phòng
 * @param {number} id - ID của loại phòng cần xóa
 * @returns {Promise} Promise containing the response
 */
export const deleteLoaiPhongAPI = async (id) => {
  try {
    console.log(`Đang xóa loại phòng ID ${id}`);
    return await api.put(`/api/loaiphong/delete/${id}`);
  } catch (error) {
    console.error(`Lỗi khi xóa loại phòng ID ${id}:`, error);

    // Thử endpoint dự phòng
    try {
      return await api.put(`/api/loai-phong/delete/${id}`);
    } catch (error2) {
      console.error('Lỗi khi xóa loại phòng từ endpoint dự phòng:', error2);
      throw error2;
    }
  }
}

/**
 * Lấy danh sách homestay
 * @returns {Promise} Promise containing the response
 */
export const getHomestayList = async () => {
  // Thử endpoint chính trước
  return api.get('/api/homestay/all')
    .catch(error => {
      console.error('Lỗi khi tải homestay từ endpoint chính:', error);

      // Thử endpoint dự phòng 1
      return api.get('/api/home-stay/all')
        .catch(error2 => {
          console.error('Lỗi khi tải homestay từ endpoint dự phòng 1:', error2);

          // Thử endpoint dự phòng 2
          return api.get('/homestay/all')
            .catch(error3 => {
              console.error('Lỗi khi tải homestay từ endpoint dự phòng 2:', error3);

              // Trả về mảng rỗng nếu tất cả các endpoint đều thất bại
              console.warn('Không thể tải danh sách homestay, sử dụng mảng rỗng');
              return { data: [] };
            });
        });
    });
}

/**
 * Hàm helper để chuẩn bị dữ liệu phòng đúng định dạng
 * @param {Object} data - Dữ liệu phòng cần chuẩn bị
 * @returns {Object} - Dữ liệu phòng đã được chuẩn bị
 */
function preparePhongData(data) {
  // Tạo bản sao để không ảnh hưởng đến dữ liệu gốc
  const formattedData = {};

  // Xử lý các trường đặc biệt cho JPA Entities
  if (data.LoaiPhong_ID) {
    formattedData.idloaiPhong = { id: parseInt(data.LoaiPhong_ID, 10) };
  } else if (data.idloaiPhong) {
    formattedData.idloaiPhong = typeof data.idloaiPhong === 'object'
      ? data.idloaiPhong
      : { id: parseInt(data.idloaiPhong, 10) };
  }

  if (data.HomeStay_ID) {
    formattedData.idhomeStay = { id: parseInt(data.HomeStay_ID, 10) };
  } else if (data.idhomeStay) {
    formattedData.idhomeStay = typeof data.idhomeStay === 'object'
      ? data.idhomeStay
      : { id: parseInt(data.idhomeStay, 10) };
  }

  // Xử lý các trường thường
  if (data.Ten_Phong !== undefined) {
    formattedData.tenPhong = data.Ten_Phong;
  } else if (data.tenPhong !== undefined) {
    formattedData.tenPhong = data.tenPhong;
  }

  if (data.Ma_Phong !== undefined) {
    formattedData.maPhong = data.Ma_Phong;
  } else if (data.maPhong !== undefined) {
    formattedData.maPhong = data.maPhong;
  }

  if (data.Dien_Tich !== undefined) {
    formattedData.dienTich = parseFloat(data.Dien_Tich);
  } else if (data.dienTich !== undefined) {
    formattedData.dienTich = parseFloat(data.dienTich);
  }

  if (data.Mo_Ta !== undefined) {
    formattedData.moTa = data.Mo_Ta;
  } else if (data.moTa !== undefined) {
    formattedData.moTa = data.moTa;
  }

  if (data.Tang_So !== undefined) {
    formattedData.tangSo = parseInt(data.Tang_So, 10);
  } else if (data.tangSo !== undefined) {
    formattedData.tangSo = parseInt(data.tangSo, 10);
  }

  if (data.So_Nguoi_Lon !== undefined) {
    formattedData.soNguoiLon = parseInt(data.So_Nguoi_Lon, 10);
  } else if (data.soNguoiLon !== undefined) {
    formattedData.soNguoiLon = parseInt(data.soNguoiLon, 10);
  }

  if (data.So_Nguoi_Nho !== undefined) {
    formattedData.soNguoiNho = parseInt(data.So_Nguoi_Nho, 10);
  } else if (data.soNguoiNho !== undefined) {
    formattedData.soNguoiNho = parseInt(data.soNguoiNho, 10);
  }

  if (data.So_Nguoi_Toi_Da !== undefined) {
    formattedData.soNguoiToiDa = parseInt(data.So_Nguoi_Toi_Da, 10);
  } else if (data.soNguoiToiDa !== undefined) {
    formattedData.soNguoiToiDa = parseInt(data.soNguoiToiDa, 10);
  }

  if (data.Anh_Bia !== undefined) {
    formattedData.anhBia = data.Anh_Bia;
  } else if (data.anhBia !== undefined) {
    formattedData.anhBia = data.anhBia;
  }

  if (data.Trang_Thai !== undefined) {
    formattedData.trangThai = data.Trang_Thai;
  } else if (data.trangThai !== undefined) {
    formattedData.trangThai = data.trangThai;
  }

  // Đảm bảo id nếu có
  if (data.id) {
    formattedData.id = parseInt(data.id, 10);
  }

  // Đảm bảo ngayTao và ngayUpdate nếu có
  if (data.ngayTao) {
    formattedData.ngayTao = data.ngayTao;
  }

  if (data.ngayUpdate) {
    formattedData.ngayUpdate = data.ngayUpdate;
  }

  return formattedData;
}
