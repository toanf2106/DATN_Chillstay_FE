<template>
  <div class="account-info-container">
    <h2 class="form-title">Thông tin tài khoản</h2>
    <p class="form-description">Quản lý thông tin cá nhân của bạn.</p>

    <div v-if="loading" class="loading-spinner">Đang tải...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading" class="user-info-form">
      <div class="user-header">
        <div class="user-avatar">
          <img :src="userData.anh || '/images/default-avatar.png'" alt="Avatar" />
          <div class="avatar-upload-btn">
            <label for="avatar-upload" class="upload-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                <path
                  d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" />
              </svg>
            </label>
            <input type="file" id="avatar-upload" accept="image/*" @change="handleImageUpload" style="display: none;" />
          </div>
        </div>
        <div class="user-name">
          <h3>{{ userData.hoTen || userData.tenDangNhap }}</h3>
          <p>{{ userData.tenDangNhap }}</p>
        </div>
      </div>

      <div class="info-section">
        <h3>Thông tin cá nhân</h3>
        <form @submit.prevent="saveChanges">
          <div class="form-row">
            <div class="form-label">Tên đăng nhập:</div>
            <div class="form-input">
              <input type="text" v-model="userData.tenDangNhap" class="form-control" required />
              <small class="form-text text-muted">Tên đăng nhập phải là duy nhất</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-label">Họ và tên:</div>
            <div class="form-input">
              <input type="text" v-model="userData.hoTen" class="form-control" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-label">Email:</div>
            <div class="form-input">
              <input type="email" v-model="userData.email" class="form-control" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-label">Số điện thoại:</div>
            <div class="form-input">
              <input type="tel" v-model="userData.soDienThoai" class="form-control" pattern="[0-9]{10,11}"
                title="Số điện thoại phải có 10-11 chữ số" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-label">Giới tính:</div>
            <div class="form-input radio-group">
              <label class="radio-label">
                <input type="radio" :value="0" v-model="userData.gioiTinh" name="gender" />
                Nam
              </label>
              <label class="radio-label">
                <input type="radio" :value="1" v-model="userData.gioiTinh" name="gender" />
                Nữ
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button" :disabled="saving">
              {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Thông báo thành công -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { getThongTinNguoiDungByTaiKhoanId } from '@/Service/ThongTinNguoiDungService';
import { updateTaiKhoan, uploadAvatar } from '@/Service/TaiKhoan';

const authStore = useAuthStore();
const userData = ref({});
const loading = ref(true);
const error = ref(null);
const saving = ref(false);
const successMessage = ref('');
const userId = ref(null);
const imageFile = ref(null);
const originalData = ref({});

onMounted(async () => {
  try {
    if (!authStore.isLoggedIn || !authStore.user) {
      error.value = 'Bạn chưa đăng nhập. Vui lòng đăng nhập để xem thông tin tài khoản.';
      loading.value = false;
      return;
    }

    const taiKhoanId = authStore.user.id;
    console.log('Đang lấy thông tin người dùng cho tài khoản ID:', taiKhoanId);

    try {
      // Gọi API để lấy thông tin người dùng
      const response = await getThongTinNguoiDungByTaiKhoanId(taiKhoanId);
      console.log('API response:', response);

      if (response.data) {
        // Log chi tiết để kiểm tra định dạng giới tính
        console.log('Giới tính từ API:', response.data.gioiTinh, typeof response.data.gioiTinh);
        console.log('Giới tính từ API (ho_Ten):', response.data.gioi_Tinh, typeof response.data.gioi_Tinh);

        userData.value = {
          id: response.data.id,
          tenDangNhap: authStore.user.username,
          anh: response.data.anh,
          hoTen: response.data.ho_Ten || response.data.hoTen,
          email: response.data.email,
          soDienThoai: response.data.so_Dien_Thoai || response.data.soDienThoai,
          // Kiểm tra và chuyển đổi giới tính đúng cách
          gioiTinh: response.data.gioi_Tinh !== undefined
            ? (typeof response.data.gioi_Tinh === 'boolean' ? (response.data.gioi_Tinh ? 1 : 0) : response.data.gioi_Tinh)
            : (typeof response.data.gioiTinh === 'boolean' ? (response.data.gioiTinh ? 1 : 0) : response.data.gioiTinh)
        };
        userId.value = response.data.id;

        // Lưu bản sao của dữ liệu gốc
        originalData.value = { ...userData.value };

        // Log để kiểm tra giá trị giới tính sau khi xử lý
        console.log('Giới tính sau khi xử lý:', userData.value.gioiTinh, typeof userData.value.gioiTinh);
      } else {
        // Nếu không có dữ liệu, sử dụng thông tin cơ bản từ authStore
        userData.value = {
          tenDangNhap: authStore.user.username,
          anh: authStore.user.anh || null,
          hoTen: authStore.user.username,
          email: authStore.user.email || '',
          soDienThoai: '',
          gioiTinh: null
        };
        originalData.value = { ...userData.value };
      }
    } catch (apiError) {
      console.error('Lỗi khi gọi API:', apiError);
      // Sử dụng thông tin cơ bản từ authStore
      userData.value = {
        tenDangNhap: authStore.user.username,
        anh: authStore.user.anh || null,
        hoTen: authStore.user.username,
        email: authStore.user.email || '',
        soDienThoai: '',
        gioiTinh: null
      };
      originalData.value = { ...userData.value };
    }

    console.log('Dữ liệu người dùng cuối cùng:', userData.value);
  } catch (err) {
    console.error('Lỗi khi tải thông tin người dùng:', err);
    error.value = 'Không thể tải thông tin người dùng. Vui lòng thử lại sau.';
  } finally {
    loading.value = false;
  }
});

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;

    // Hiển thị ảnh preview ngay lập tức
    const reader = new FileReader();
    reader.onload = (e) => {
      userData.value.anh = e.target.result;
    };
    reader.readAsDataURL(file);

    // Tự động lưu khi chọn ảnh
    saveChanges();
  }
}

async function uploadImage() {
  if (!imageFile.value) return null;

  try {
    // Sử dụng hàm uploadAvatar từ TaiKhoan.js
    const response = await uploadAvatar(authStore.user.id, imageFile.value);
    console.log('Kết quả upload ảnh:', response);

    // Trả về URL của ảnh đã upload
    return response.data?.anh || null;
  } catch (error) {
    console.error('Lỗi khi upload ảnh:', error);
    return null;
  }
}

async function saveChanges() {
  try {
    saving.value = true;
    error.value = null;

    // Kiểm tra xem có thay đổi gì không
    const hasChanges =
      userData.value.tenDangNhap !== originalData.value.tenDangNhap ||
      userData.value.hoTen !== originalData.value.hoTen ||
      userData.value.email !== originalData.value.email ||
      userData.value.soDienThoai !== originalData.value.soDienThoai ||
      userData.value.gioiTinh !== originalData.value.gioiTinh ||
      imageFile.value !== null;

    if (!hasChanges) {
      saving.value = false;
      successMessage.value = 'Không có thông tin nào được thay đổi.';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
      return;
    }

    // Upload ảnh nếu có
    let imageUrl = null;
    if (imageFile.value) {
      imageUrl = await uploadImage();
      if (!imageUrl) {
        error.value = 'Không thể tải lên ảnh đại diện. Vui lòng thử lại sau.';
        saving.value = false;
        return;
      }
    }

    // Lấy token từ authStore
    const token = authStore.token || localStorage.getItem('token');
    if (!token) {
      error.value = 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
      return;
    }

    // 1. Cập nhật thông tin tài khoản (ảnh và tên đăng nhập)
    if (userData.value.tenDangNhap !== originalData.value.tenDangNhap || imageFile.value) {
      const taiKhoanData = {
        id: authStore.user.id,
        tenDangNhap: userData.value.tenDangNhap,
        anh: imageUrl || userData.value.anh
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
      // Đảm bảo gioiTinh có định dạng đúng (số nguyên 0/1 thay vì boolean)
      const gioiTinh = userData.value.gioiTinh === false || userData.value.gioiTinh === 0 ? 0 :
        userData.value.gioiTinh === true || userData.value.gioiTinh === 1 ? 1 :
          userData.value.gioiTinh;

      const thongTinData = {
        id: userId.value,
        hoTen: userData.value.hoTen,
        email: userData.value.email,
        soDienThoai: userData.value.soDienThoai,
        gioiTinh: gioiTinh,
        taiKhoanId: authStore.user.id
      };

      console.log('Cập nhật thông tin người dùng:', thongTinData);

      if (!userId.value) {
        error.value = 'Không thể cập nhật thông tin: Không tìm thấy ID người dùng.';
        saving.value = false;
        return;
      }

      // Thử sử dụng API trực tiếp thay vì qua hàm service
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/thongTinNguoiDung/update1/${userId.value}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(thongTinData)
      });

      // Kiểm tra kết quả
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
      }

      const thongTinResult = await response.json();
      console.log('Kết quả cập nhật thông tin người dùng:', thongTinResult);

      // Cập nhật dữ liệu hiển thị và dữ liệu gốc
      userData.value = {
        ...userData.value,
        hoTen: thongTinResult.hoTen,
        email: thongTinResult.email,
        soDienThoai: thongTinResult.soDienThoai,
        gioiTinh: thongTinResult.gioiTinh
      };

      originalData.value = { ...userData.value };

      // Hiển thị thông báo thành công
      successMessage.value = 'Cập nhật thông tin thành công!';

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } catch (thongTinError) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', thongTinError);
      error.value = thongTinError.message || 'Không thể cập nhật thông tin cá nhân.';
    }
  } catch (err) {
    console.error('Lỗi tổng quát:', err);
    error.value = 'Đã xảy ra lỗi khi lưu thay đổi. Vui lòng thử lại sau.';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.account-info-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.form-description {
  color: #666;
  margin-bottom: 30px;
}

.loading-spinner,
.error-message,
.success-message {
  text-align: center;
  padding: 20px;
}

.error-message {
  color: #e74c3c;
  font-weight: 500;
  margin-bottom: 20px;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 5px;
  margin-top: 20px;
  font-weight: 500;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  border: 3px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #48cae4;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.avatar-upload-btn:hover {
  background-color: #0096c7;
  transform: scale(1.1);
}

.avatar-upload-btn:hover::after {
  content: "Thay đổi ảnh";
  position: absolute;
  top: -30px;
  right: -20px;
  background-color: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.avatar-upload-btn .upload-btn {
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.user-name h3 {
  margin: 0 0 5px 0;
  font-size: 20px;
  color: #333;
}

.user-name p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.info-section {
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.info-section h3 {
  font-size: 16px;
  padding: 12px 15px;
  margin: 0;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
}

.info-section form {
  padding: 15px;
}

.form-row {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.form-label {
  width: 30%;
  font-weight: 600;
  color: #555;
  padding: 10px 15px 10px 0;
}

.form-input {
  width: 70%;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-control:focus {
  border-color: #48cae4;
  outline: none;
  box-shadow: 0 0 0 2px rgba(72, 202, 228, 0.2);
}

.form-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  display: block;
}

.radio-group {
  display: flex;
  gap: 20px;
  padding: 5px 0;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input {
  margin-right: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.submit-button {
  background-color: #48cae4;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #0096c7;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
