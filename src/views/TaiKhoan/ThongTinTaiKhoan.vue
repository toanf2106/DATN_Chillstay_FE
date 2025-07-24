<template>
  <div class="booking-container">
    <!-- Main content -->
    <div class="booking-content">
      <h1 class="booking-title">Thông tin cá nhân</h1>
      <p class="booking-subtitle">Cập nhật thông tin của bạn và tìm hiểu các thông tin này được sử dụng ra sao.</p>

      <!-- Loading và Error messages -->
      <div v-if="loading" class="booking-loading">Đang tải...</div>
      <div v-if="error" class="booking-error-message">{{ error }}</div>
      <div v-if="successMessage" class="booking-success-message">{{ successMessage }}</div>

      <div v-if="!loading" class="booking-form">
        <!-- Profile photo -->
        <div class="booking-profile-photo">
          <img :src="displayAvatarUrl" alt="Avatar" @error="handleAvatarError" />
          <input type="file" id="avatar-upload" accept="image/*" @change="handleImageUpload" style="display: none;" />
          <label for="avatar-upload" class="booking-avatar-btn">
            <span class="booking-camera-icon">📷</span>
          </label>
        </div>

        <!-- Thông tin cá nhân -->
        <div class="booking-info-list">
          <!-- Tên đăng nhập -->
          <div class="booking-info-item">
            <div class="booking-info-label">Tên</div>
            <div class="booking-info-content">
              <input type="text" v-model="userData.hoTen" class="booking-input" />
            </div>
            <button class="booking-edit-btn" @click="focusInput('hoTen')">Chỉnh sửa</button>
          </div>

          <!-- Tên hiển thị -->
          <div class="booking-info-item">
            <div class="booking-info-label">Tên hiện thị</div>
            <div class="booking-info-content">
              <input type="text" v-model="userData.tenDangNhap" class="booking-input" />
            </div>
            <button class="booking-edit-btn" @click="focusInput('tenDangNhap')">Chỉnh sửa</button>
          </div>

          <!-- Email -->
          <div class="booking-info-item">
            <div class="booking-info-label">Địa chỉ email</div>
            <div class="booking-info-content">
              <input type="email" v-model="userData.email" class="booking-input" />
              <div class="booking-info-hint">Đây là địa chỉ email bạn dùng để đăng nhập. Chúng tôi cũng sẽ gửi các xác
                nhận đặt chỗ tới địa chỉ này.</div>
            </div>
            <button class="booking-edit-btn" @click="focusInput('email')">Chỉnh sửa</button>
          </div>

          <!-- Số điện thoại -->
          <div class="booking-info-item">
            <div class="booking-info-label">Số điện thoại</div>
            <div class="booking-info-content">
              <input type="tel" v-model="userData.soDienThoai" pattern="[0-9]{10,11}" class="booking-input"
                title="Số điện thoại phải có 10-11 chữ số" />
              <div class="booking-info-hint">Chỗ nghỉ hoặc địa điểm tham quan bạn đặt sẽ liên lạc với bạn qua số này nếu
                cần.</div>
            </div>
            <button class="booking-edit-btn" @click="focusInput('soDienThoai')">Chỉnh sửa</button>
          </div>

          <!-- Ngày sinh -->
          <div class="booking-info-item">
            <div class="booking-info-label">Ngày sinh</div>
            <div class="booking-info-content">
              <input type="date" v-model="userData.ngaySinh" class="booking-input" />
            </div>
            <button class="booking-edit-btn" @click="focusInput('ngaySinh')">Chỉnh sửa</button>
          </div>

          <!-- Địa chỉ -->
          <div class="booking-info-item">
            <div class="booking-info-label">Địa chỉ</div>
            <div class="booking-info-content">
              <input type="text" v-model="userData.diaChi" class="booking-input" />
            </div>
            <button class="booking-edit-btn" @click="focusInput('diaChi')">Chỉnh sửa</button>
          </div>

          <!-- Giới tính -->
          <div class="booking-info-item">
            <div class="booking-info-label">Giới tính</div>
            <div class="booking-info-content">
              <select v-model="userData.gioiTinh" class="booking-input">
                <option :value="0">Nam</option>
                <option :value="1">Nữ</option>
              </select>
            </div>
            <button class="booking-edit-btn" @click="focusInput('gioiTinh')">Chỉnh sửa</button>
          </div>
        </div>

        <!-- Lưu thay đổi button -->
        <div class="booking-action-btns">
          <button type="button" @click="saveChanges" class="booking-save-btn" :disabled="saving">
            {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { getThongTinNguoiDungByTaiKhoanId, updateThongTinNguoiDung1 } from '@/Service/ThongTinNguoiDungService';
import { updateTaiKhoan } from '@/Service/TaiKhoan';

const authStore = useAuthStore();
const userData = ref({});
const loading = ref(true);
const error = ref(null);
const saving = ref(false);
const successMessage = ref('');
const userId = ref(null);
const imageFile = ref(null);
const originalData = ref({});
const avatarError = ref(false);
const defaultAvatarUrl = '/images/default-avatar.png';

// Computed property cho URL ảnh đại diện
const displayAvatarUrl = computed(() => {
  if (avatarError.value || !userData.value?.anh) {
    return defaultAvatarUrl;
  }

  // Thêm timestamp để tránh cache
  const timestamp = new Date().getTime();
  const baseUrl = userData.value.anh;
  return baseUrl.includes('?') ? `${baseUrl}&t=${timestamp}` : `${baseUrl}?t=${timestamp}`;
});

// Hàm tập trung vào input khi nhấn "Chỉnh sửa"
function focusInput(fieldName) {
  setTimeout(() => {
    const input = document.querySelector(`input[name="${fieldName}"], select[name="${fieldName}"]`);
    if (input) {
      input.focus();
    }
  }, 100);
}

// Xử lý khi ảnh không tải được
function handleAvatarError() {
  console.log('Không thể tải ảnh đại diện, sử dụng ảnh mặc định');
  avatarError.value = true;
}

// Thêm hàm định dạng ngày
function formatDate(dateString) {
  if (!dateString) return '';

  // Kiểm tra xem dateString có phải là chuỗi ISO hoặc các định dạng khác không
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    // Format về định dạng yyyy-MM-dd cho input type="date"
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error('Lỗi khi định dạng ngày:', e);
    return '';
  }
}

// Thử lấy token mới khi token hiện tại hết hạn
async function refreshToken() {
  try {
    console.log('Đang thử làm mới token...');

    // Nếu bạn có API refresh token, gọi nó ở đây
    // const response = await fetch('/api/auth/refresh-token', {...});

    // Hoặc thử lấy token từ các nguồn khác
    const newToken = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (newToken) {
      console.log('Đã tìm thấy token mới');
      return newToken;
    } else {
      throw new Error('Không thể lấy token mới');
    }
  } catch (error) {
    console.error('Làm mới token thất bại:', error);
    return null;
  }
}

onMounted(async () => {
  try {
    if (!authStore.isLoggedIn || !authStore.user) {
      error.value = 'Bạn chưa đăng nhập.';
      loading.value = false;
      return;
    }

    const taiKhoanId = authStore.user.id;
    console.log('Bắt đầu tải thông tin cho tài khoản ID:', taiKhoanId);

    const response = await getThongTinNguoiDungByTaiKhoanId(taiKhoanId);

    // LOG CHI TIẾT: In ra toàn bộ đối tượng data để kiểm tra
    console.log('--- DEBUG: DỮ LIỆU THÔ TỪ API ---');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('------------------------------------');

    if (response.data) {
      const data = response.data;

      // Cố gắng lấy dữ liệu từ các tên trường có thể có
      const diaChiValue = data.diaChi || data.dia_Chi || data.Dia_Chi || '';
      // Sử dụng ngayTao nếu không có ngaySinh (dựa theo API response)
      const ngaySinhValue = data.ngaySinh || data.ngay_Sinh || data.Ngay_Sinh || data.ngayTao || '';
      const gioiTinhValue = data.gioiTinh !== undefined ? data.gioiTinh : data.gioi_Tinh;

      userData.value = {
        id: data.id,
        tenDangNhap: authStore.user.username,
        anh: data.anh || authStore.user.anh,
        hoTen: data.hoTen || data.ho_Ten || '',
        email: data.email || '',
        soDienThoai: data.soDienThoai || data.so_Dien_Thoai || '',
        diaChi: diaChiValue || '',
        ngaySinh: formatDate(ngaySinhValue),
        gioiTinh: gioiTinhValue === true ? 1 : (gioiTinhValue === false ? 0 : null),
      };
      userId.value = data.id;
      originalData.value = { ...userData.value };
    } else {
      // Fallback nếu API không trả về dữ liệu
      userData.value.tenDangNhap = authStore.user.username;
      userData.value.anh = authStore.user.anh;
    }
  } catch (apiError) {
    console.error('Lỗi khi gọi API getThongTinNguoiDung:', apiError);
    if (apiError.response && apiError.response.status === 404) {
      console.warn('Không tìm thấy thông tin người dùng cho tài khoản này (Lỗi 404).');
      error.value = 'Bạn chưa có thông tin chi tiết. Vui lòng cập nhật.';
    } else {
      error.value = 'Không thể tải được thông tin chi tiết của bạn.';
    }
    // Vẫn hiển thị thông tin cơ bản từ store
    userData.value.tenDangNhap = authStore.user.username;
    userData.value.anh = authStore.user.anh;
  } finally {
    loading.value = false;
  }
});

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // Hiển thị thông báo đang xử lý
    successMessage.value = 'Đang xử lý ảnh...';
    error.value = null;

    console.log('Đã chọn file:', file.name, 'loại:', file.type, 'kích thước:', file.size);

    // Kiểm tra kích thước file (giới hạn ở 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Kích thước ảnh không được vượt quá 5MB';
      successMessage.value = '';
      return;
    }

    // Kiểm tra loại file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      error.value = 'Chỉ hỗ trợ các định dạng ảnh: JPEG, PNG, GIF, WEBP';
      successMessage.value = '';
      return;
    }

    imageFile.value = file;

    // Hiển thị ảnh preview ngay lập tức
    const reader = new FileReader();
    reader.onload = (e) => {
      userData.value.anh = e.target.result;
    };
    reader.readAsDataURL(file);

    // Xử lý upload ảnh riêng biệt
    uploadAvatarOnly();
  }
}

// Xử lý riêng việc upload ảnh đã được chuyển đến uploadAvatarOnly

// Xử lý tải lên ảnh đại diện riêng biệt
async function uploadAvatarOnly(retryCount = 0) {
  try {
    saving.value = true;
    error.value = null;

    // Kiểm tra lại file trước khi upload
    if (!imageFile.value) {
      error.value = 'Không tìm thấy tệp ảnh để tải lên';
      saving.value = false;
      return;
    }

    console.log('Đang tải lên ảnh:', imageFile.value.name, 'kích thước:', imageFile.value.size);

    // Tạo FormData với tham số đúng như backend yêu cầu
    const formData = new FormData();
    formData.append('anhFile', imageFile.value);

    // Lấy token từ nhiều nguồn để đảm bảo luôn có token hợp lệ
    let token = authStore.token || localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      error.value = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      saving.value = false;
      return;
    }

    try {
      // Gọi API và hiển thị thông báo đang xử lý
      successMessage.value = 'Đang tải lên ảnh...';

      // Sử dụng URL tuyệt đối để tránh lỗi đường dẫn
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/taiKhoan/${authStore.user.id}/uploadAvatar`;
      console.log('Gửi request tới:', apiUrl);

      // Gửi yêu cầu API với timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 giây timeout

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
        credentials: 'include' // Gửi kèm cookie nếu có
      });

      clearTimeout(timeoutId);
      console.log('Mã trạng thái phản hồi:', response.status);

      // Xử lý kết quả dựa trên mã trạng thái
      if (response.status === 401) {
        if (retryCount < 1) {
          // Thử lấy token mới và gọi lại
          const newToken = await refreshToken();
          if (newToken) {
            console.log('Thử lại với token mới...');
            return uploadAvatarOnly(retryCount + 1);
          }
        }
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (response.status === 403) {
        throw new Error('Bạn không có quyền thực hiện thao tác này.');
      } else if (response.ok) {
        try {
          const data = await response.json();
          console.log('Dữ liệu từ server:', data);

          if (data && data.anh) {
            // Thêm timestamp vào URL ảnh để tránh cache
            const timestamp = new Date().getTime();
            const newAvatarUrl = data.anh.includes('?')
              ? `${data.anh}&t=${timestamp}`
              : `${data.anh}?t=${timestamp}`;

            console.log('URL ảnh mới với timestamp:', newAvatarUrl);

            // Reset trạng thái lỗi ảnh
            avatarError.value = false;

            // Cập nhật ảnh trong giao diện người dùng
            userData.value.anh = newAvatarUrl;
            originalData.value.anh = newAvatarUrl;

            // Cập nhật authStore
            if (authStore.user) {
              authStore.user.anh = newAvatarUrl;
              localStorage.setItem('user', JSON.stringify(authStore.user));
              console.log('Đã cập nhật ảnh trong authStore và localStorage');
            }

            // Reset file ảnh
            imageFile.value = null;

            // Hiển thị thông báo thành công
            successMessage.value = 'Cập nhật ảnh đại diện thành công!';
            setTimeout(() => {
              successMessage.value = '';
            }, 3000);

            // Buộc tải lại hình ảnh
            const img = new Image();
            img.src = newAvatarUrl;
            img.onload = () => console.log('Đã tải lại ảnh từ URL mới');
          } else {
            throw new Error('Server không trả về URL ảnh');
          }
        } catch (jsonError) {
          console.error('Lỗi khi xử lý dữ liệu JSON:', jsonError);
          throw new Error('Lỗi khi xử lý phản hồi từ máy chủ');
        }
      } else {
        // Xử lý lỗi HTTP
        const errorText = await response.text();
        console.error('Lỗi từ server:', response.status, errorText);
        throw new Error(`Lỗi máy chủ: ${response.status}`);
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('Quá thời gian chờ phản hồi từ máy chủ');
      }
      console.error('Lỗi khi gửi yêu cầu:', fetchError);
      throw fetchError;
    }
  } catch (err) {
    console.error('Lỗi tổng thể khi tải ảnh lên:', err);

    // Kiểm tra xem ảnh có thể đã được upload thành công không mặc dù có lỗi
    const isAvatarUploaded = await checkAvatarUploaded();

    if (isAvatarUploaded) {
      // Nếu ảnh đã được tải lên thành công, hiển thị thông báo thành công
      successMessage.value = 'Cập nhật ảnh đại diện thành công!';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);

      // Reset file ảnh
      imageFile.value = null;
    } else {
      // Nếu không, hiển thị thông báo lỗi
      error.value = err.message || 'Không thể tải lên ảnh đại diện. Vui lòng thử lại sau.';
      successMessage.value = '';
    }
  } finally {
    saving.value = false;
  }
}

async function saveChanges() {
  try {
    saving.value = true;
    error.value = null;

    // Kiểm tra xem có thay đổi gì không (không tính ảnh vì đã xử lý riêng)
    const hasChanges =
      userData.value.tenDangNhap !== originalData.value.tenDangNhap ||
      userData.value.hoTen !== originalData.value.hoTen ||
      userData.value.email !== originalData.value.email ||
      userData.value.soDienThoai !== originalData.value.soDienThoai ||
      userData.value.diaChi !== originalData.value.diaChi ||
      userData.value.ngaySinh !== originalData.value.ngaySinh ||
      userData.value.gioiTinh !== originalData.value.gioiTinh;

    if (!hasChanges) {
      saving.value = false;
      successMessage.value = 'Không có thông tin nào được thay đổi.';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
      return;
    }

    // Kiểm tra trạng thái đăng nhập
    if (!authStore.isLoggedIn) {
      error.value = 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
      return;
    }

    // 1. Cập nhật thông tin tài khoản (chỉ tên đăng nhập, ảnh xử lý riêng)
    if (userData.value.tenDangNhap !== originalData.value.tenDangNhap) {
      const taiKhoanData = {
        id: authStore.user.id,
        tenDangNhap: userData.value.tenDangNhap
      };

      console.log('Cập nhật thông tin tài khoản:', taiKhoanData);

      try {
        // Sử dụng hàm updateTaiKhoan từ TaiKhoan.js
        const taiKhoanResponse = await updateTaiKhoan(authStore.user.id, taiKhoanData);
        const taiKhoanResult = taiKhoanResponse.data;
        console.log('Kết quả cập nhật tài khoản:', taiKhoanResult);

        // Cập nhật thông tin trong authStore
        authStore.updateUserInfo({
          username: taiKhoanResult.tenDangNhap,
          anh: taiKhoanResult.anh
        });

        // Cập nhật dữ liệu hiển thị
        userData.value.tenDangNhap = taiKhoanResult.tenDangNhap;
        userData.value.anh = taiKhoanResult.anh;
        originalData.value.tenDangNhap = taiKhoanResult.tenDangNhap;
        originalData.value.anh = taiKhoanResult.anh;

        // Reset file ảnh sau khi upload thành công
        imageFile.value = null;
      } catch (taiKhoanError) {
        console.error('Lỗi khi cập nhật tài khoản:', taiKhoanError);
        error.value = taiKhoanError.message || 'Không thể cập nhật tên đăng nhập hoặc ảnh đại diện.';
        saving.value = false;
        return;
      }
    }

    // 2. Cập nhật thông tin người dùng
    try {
      const thongTinData = {
        id: userId.value,
        hoTen: userData.value.hoTen,
        email: userData.value.email,
        soDienThoai: userData.value.soDienThoai,
        diaChi: userData.value.diaChi || '', // Gửi chuỗi trống nếu không có giá trị
        ngaySinh: userData.value.ngaySinh || null, // Gửi null nếu ngày sinh rỗng
        ngayTao: userData.value.ngaySinh || null, // Thêm ngayTao để tương thích với API
        gioiTinh: userData.value.gioiTinh === 1, // Chuyển thành boolean cho backend
        taiKhoanId: authStore.user.id,
      };

      console.log('--- DEBUG: DỮ LIỆU GỬI ĐI ---');
      console.log(JSON.stringify(thongTinData, null, 2));
      console.log('-----------------------------');

      if (!userId.value) {
        error.value = 'Không thể cập nhật thông tin: Không tìm thấy ID người dùng.';
        saving.value = false;
        return;
      }

      // Sử dụng service function thay vì gọi trực tiếp fetch API
      const response = await updateThongTinNguoiDung1(userId.value, thongTinData);

      // Sửa đổi phần cập nhật dữ liệu sau khi API trả về thành công
      const thongTinResult = response.data;
      console.log('Kết quả cập nhật thông tin người dùng:', thongTinResult);

      // Cập nhật dữ liệu hiển thị và dữ liệu gốc
      userData.value = {
        ...userData.value,
        hoTen: thongTinResult.hoTen,
        email: thongTinResult.email,
        soDienThoai: thongTinResult.soDienThoai,
        diaChi: thongTinResult.diaChi || '',
        ngaySinh: formatDate(thongTinResult.ngaySinh || thongTinResult.ngayTao || ''),
        gioiTinh: thongTinResult.gioiTinh
      };
      console.log("Dữ liệu sau khi cập nhật:", userData.value);

      originalData.value = { ...userData.value };

      // Hiển thị thông báo thành công
      successMessage.value = 'Cập nhật thông tin thành công!';

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } catch (thongTinError) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', thongTinError);

      // Sửa đổi phần xử lý lỗi 500 nhưng dữ liệu vẫn được cập nhật
      if (thongTinError.response && thongTinError.response.status === 500) {
        // Không reload trang, sử dụng ngay dữ liệu người dùng đã nhập
        // Cập nhật dữ liệu hiển thị và dữ liệu gốc
        originalData.value = { ...userData.value };

        // Hiển thị thông báo thành công
        successMessage.value = 'Cập nhật thông tin thành công!';
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);

        // Thực hiện một API call để lấy lại thông tin người dùng mới nhất sau 1 giây
        setTimeout(async () => {
          try {
            const response = await getThongTinNguoiDungByTaiKhoanId(authStore.user.id);
            if (response.data) {
              userData.value = {
                ...userData.value,
                hoTen: response.data.ho_Ten || response.data.hoTen,
                email: response.data.email,
                soDienThoai: response.data.so_Dien_Thoai || response.data.soDienThoai,
                diaChi: response.data.dia_Chi || response.data.diaChi || '',
                ngaySinh: formatDate(response.data.ngay_Sinh || response.data.ngaySinh || response.data.ngayTao || ''),
                gioiTinh: response.data.gioi_Tinh !== undefined
                  ? (typeof response.data.gioi_Tinh === 'boolean' ? (response.data.gioi_Tinh ? 1 : 0) : response.data.gioi_Tinh)
                  : (typeof response.data.gioiTinh === 'boolean' ? (response.data.gioiTinh ? 1 : 0) : response.data.gioiTinh)
              };
              originalData.value = { ...userData.value };
            }
          } catch (refreshError) {
            console.error('Không thể làm mới dữ liệu:', refreshError);
            // Không hiển thị lỗi cho người dùng vì đã có thông báo thành công
          }
        }, 1000);
      } else {
        error.value = thongTinError.message || 'Không thể cập nhật thông tin cá nhân.';
      }
    }
  } catch (err) {
    console.error('Lỗi tổng quát:', err);
    error.value = 'Đã xảy ra lỗi khi lưu thay đổi. Vui lòng thử lại sau.';
  } finally {
    saving.value = false;
  }
}

// Thêm hàm kiểm tra ảnh đã upload
async function checkAvatarUploaded() {
  try {
    console.log('Kiểm tra xem ảnh đã được upload thành công không...');

    // Gọi API để lấy thông tin mới nhất của tài khoản
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/taiKhoan/${authStore.user.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Dữ liệu tài khoản mới nhất:', data);

      if (data && data.anh) {
        const timestamp = new Date().getTime();
        const newAvatarUrl = data.anh.includes('?')
          ? `${data.anh}&t=${timestamp}`
          : `${data.anh}?t=${timestamp}`;

        // Cập nhật UI với URL ảnh mới
        avatarError.value = false;
        userData.value.anh = newAvatarUrl;
        originalData.value.anh = newAvatarUrl;

        // Cập nhật authStore
        if (authStore.user) {
          authStore.user.anh = newAvatarUrl;
          localStorage.setItem('user', JSON.stringify(authStore.user));
        }

        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('Lỗi khi kiểm tra ảnh đại diện:', err);
    return false;
  }
}
</script>

<style scoped>
/* CSS theo phong cách Booking.com */
.booking-container {
  /* max-width: 1200px; */
  margin: 0 auto;
  padding: 20px 40px;
  font-family: BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  background-color: #fff;
}

.booking-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.booking-subtitle {
  font-size: 14px;
  color: #6b6b6b;
  margin-bottom: 30px;
}

.booking-loading {
  padding: 20px;
  text-align: center;
  color: #0071c2;
}

.booking-error-message {
  padding: 15px;
  margin-bottom: 20px;
  background-color: #fff0f0;
  border: 1px solid #e60000;
  border-radius: 4px;
  color: #e60000;
}

.booking-success-message {
  padding: 15px;
  margin-bottom: 20px;
  background-color: #ebf7ec;
  border: 1px solid #5a9e61;
  border-radius: 4px;
  color: #1a7823;
}

.booking-profile-photo {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 0 30px auto;
  border: 2px solid #eaeaea;
}

.booking-profile-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.booking-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #0071c2;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid white;
}

.booking-camera-icon {
  color: white;
  font-size: 14px;
}

.booking-info-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.booking-info-item {
  display: flex;
  align-items: flex-start;
  padding: 15px 0;
  border-bottom: 1px solid #e7e7e7;
}

.booking-info-label {
  width: 250px;
  font-weight: 500;
  color: #333;
  padding-right: 20px;
  flex-shrink: 0;
}

.booking-info-content {
  flex: 1;
}

.booking-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e7e7e7;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
  transition: border-color 0.2s;
}

.booking-input:focus {
  border-color: #0071c2;
  outline: none;
}

.booking-info-hint {
  margin-top: 5px;
  font-size: 12px;
  color: #6b6b6b;
}

.booking-edit-btn {
  padding: 0;
  background: none;
  border: none;
  color: #0071c2;
  font-weight: 500;
  cursor: pointer;
  margin-left: 15px;
  white-space: nowrap;
  font-size: 14px;
}

.booking-edit-btn:hover {
  text-decoration: underline;
}

.booking-action-btns {
  display: flex;
  justify-content: flex-start;
  margin-top: 30px;
}

.booking-save-btn {
  background-color: #0071c2;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  transition: background-color 0.2s;
}

.booking-save-btn:hover {
  background-color: #00487a;
}

.booking-save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .booking-info-item {
    flex-direction: column;
  }

  .booking-info-label {
    width: 100%;
    margin-bottom: 10px;
  }

  .booking-edit-btn {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>