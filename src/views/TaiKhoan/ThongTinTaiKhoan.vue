<template>
  <div class="container-fluid account-detail-page">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <!-- Header -->
        <div class="card shadow-sm rounded-4 border-0 mb-3">
          <div class="card-header bg-primary text-white border-0 py-3">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="m-0 fw-bold">Thông tin tài khoản</h3>
            </div>
          </div>
        </div>

        <!-- Loading spinner -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="mt-2">Đang tải thông tin tài khoản...</p>
        </div>

        <!-- Error message -->
        <div v-else-if="error" class="alert alert-danger m-4">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ error }}
        </div>

        <!-- Account details -->
        <div v-else>
          <div class="card shadow-sm rounded-4 border-0 mb-4">
            <div class="card-body">
              <!-- Heading -->
              <div class="mb-4 d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <div class="position-relative avatar-container me-3">
                    <img :src="account.anh || '/images/default-avatar.png'" alt="Avatar người dùng"
                      class="rounded-circle img-thumbnail avatar-img" />
                  </div>
                  <div>
                    <h2 class="mb-1 fs-3">Thông tin cá nhân</h2>
                    <p class="text-muted mb-0">
                      Cập nhật thông tin của bạn và quản lý tài khoản.
                    </p>
                  </div>
                </div>
                <div>
                  <button class="btn btn-outline-primary btn-sm" @click="showAvatarUpload = true">
                    <i class="bi bi-camera-fill me-1"></i> Đổi ảnh
                  </button>
                </div>
              </div>

              <!-- Avatar upload modal -->
              <div v-if="showAvatarUpload" class="avatar-upload-modal">
                <div class="modal-backdrop" @click="showAvatarUpload = false"></div>
                <div class="modal-content p-3 rounded-3">
                  <h5 class="mb-3">Tải lên ảnh đại diện mới</h5>
                  <div class="mb-3">
                    <label for="avatarUpload" class="form-label">Chọn ảnh đại diện mới</label>
                    <input type="file" class="form-control" id="avatarUpload" name="avatarUpload" accept="image/*"
                      aria-describedby="avatarHelp" @change="handleAvatarChange" />
                    <div id="avatarHelp" class="form-text">Chọn một ảnh có kích thước nhỏ hơn 5MB.</div>
                  </div>
                  <div class="d-flex justify-content-end">
                    <button class="btn btn-secondary me-2" @click="showAvatarUpload = false">
                      Hủy
                    </button>
                    <button class="btn btn-primary" @click="uploadAvatarImage" :disabled="!avatarFile">
                      <i class="bi bi-cloud-arrow-up me-1"></i> Tải lên
                    </button>
                  </div>
                </div>
              </div>

              <!-- Thông tin chi tiết -->
              <div class="info-list">
                <!-- Tên đăng nhập -->
                <div class="info-item">
                  <div class="info-label">Tên đăng nhập</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value">{{ account.tenDangNhap }}</div>
                  </div>
                </div>

                <!-- Họ tên -->
                <div class="info-item">
                  <div class="info-label">Họ và tên</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value" v-if="editingField !== 'hoTen'">
                      {{ userInfo.hoTen || 'Chưa cập nhật' }}
                    </div>
                    <div class="input-group" v-else>
                      <input type="text" class="form-control" v-model="editValue"
                        :placeholder="userInfo.hoTen || 'Nhập họ và tên'" ref="inputField" id="hoTenInput" name="hoTen"
                        autocomplete="name" aria-label="Họ và tên" />
                    </div>
                    <div v-if="editingField !== 'hoTen'">
                      <button class="btn btn-link text-primary p-0 edit-btn"
                        @click="editField('hoTen', userInfo.hoTen)">
                        Chỉnh sửa
                      </button>
                    </div>
                    <div v-else class="d-flex">
                      <button class="btn btn-link text-danger p-0 me-3" @click="cancelEdit">
                        Hủy
                      </button>
                      <button class="btn btn-link text-success p-0" @click="saveEdit">Lưu</button>
                    </div>
                  </div>
                </div>

                <!-- Email -->
                <div class="info-item">
                  <div class="info-label">Địa chỉ email</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value" v-if="editingField !== 'email'">
                      {{ userInfo.email || account.email || 'Chưa cập nhật' }}
                      <span v-if="userInfo.email || account.email" class="badge bg-success ms-2">Xác thực</span>
                    </div>
                    <div class="input-group" v-else>
                      <input type="email" class="form-control" v-model="editValue"
                        :placeholder="userInfo.email || account.email || 'Nhập địa chỉ email'" ref="inputField"
                        id="emailInput" name="email" autocomplete="email" aria-label="Địa chỉ email" />
                    </div>
                    <div v-if="editingField !== 'email'">
                      <button class="btn btn-link text-primary p-0 edit-btn"
                        @click="editField('email', userInfo.email || account.email)">
                        Chỉnh sửa
                      </button>
                    </div>
                    <div v-else class="d-flex">
                      <button class="btn btn-link text-danger p-0 me-3" @click="cancelEdit">
                        Hủy
                      </button>
                      <button class="btn btn-link text-success p-0" @click="saveEdit">Lưu</button>
                    </div>
                  </div>
                  <div class="info-description">
                    Đây là địa chỉ email đang dùng để đăng nhập. Chúng tôi cũng sẽ gửi các xác nhận
                    đặt chỗ tới địa chỉ này.
                  </div>
                </div>

                <!-- Số điện thoại -->
                <div class="info-item">
                  <div class="info-label">Số điện thoại</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value" v-if="editingField !== 'soDienThoai'">
                      {{ userInfo.soDienThoai || 'Thêm số điện thoại của bạn' }}
                    </div>
                    <div class="input-group" v-else>
                      <input type="tel" class="form-control" v-model="editValue"
                        :placeholder="userInfo.soDienThoai || 'Nhập số điện thoại'" ref="inputField"
                        id="soDienThoaiInput" name="soDienThoai" autocomplete="tel" aria-label="Số điện thoại" />
                    </div>
                    <div v-if="editingField !== 'soDienThoai'">
                      <button class="btn btn-link text-primary p-0 edit-btn"
                        @click="editField('soDienThoai', userInfo.soDienThoai)">
                        Chỉnh sửa
                      </button>
                    </div>
                    <div v-else class="d-flex">
                      <button class="btn btn-link text-danger p-0 me-3" @click="cancelEdit">
                        Hủy
                      </button>
                      <button class="btn btn-link text-success p-0" @click="saveEdit">Lưu</button>
                    </div>
                  </div>
                  <div class="info-description">
                    Chỗ nghỉ hoặc địa điểm tham quan bạn đặt sẽ liên lạc với bạn qua số này nếu cần.
                  </div>
                </div>

                <!-- Địa chỉ -->
                <div class="info-item">
                  <div class="info-label">Địa chỉ</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value" v-if="editingField !== 'diaChi'">
                      {{ userInfo.diaChi || 'Chưa cập nhật' }}
                    </div>
                    <div class="input-group" v-else>
                      <input type="text" class="form-control" v-model="editValue"
                        :placeholder="userInfo.diaChi || 'Nhập địa chỉ'" ref="inputField" id="diaChiInput" name="diaChi"
                        autocomplete="address-line1" aria-label="Địa chỉ" />
                    </div>
                    <div v-if="editingField !== 'diaChi'">
                      <button class="btn btn-link text-primary p-0 edit-btn"
                        @click="editField('diaChi', userInfo.diaChi)">
                        Chỉnh sửa
                      </button>
                    </div>
                    <div v-else class="d-flex">
                      <button class="btn btn-link text-danger p-0 me-3" @click="cancelEdit">
                        Hủy
                      </button>
                      <button class="btn btn-link text-success p-0" @click="saveEdit">Lưu</button>
                    </div>
                  </div>
                </div>

                <!-- Giới tính -->
                <div class="info-item">
                  <div class="info-label">Giới tính</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value" v-if="editingField !== 'gioiTinh'">
                      {{ formatGender(userInfo.gioiTinh) }}
                    </div>
                    <div class="input-group" v-else>
                      <select class="form-select" v-model="editValue" ref="inputField" id="gioiTinhInput"
                        name="gioiTinh">
                        <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </div>
                    <div v-if="editingField !== 'gioiTinh'">
                      <button class="btn btn-link text-primary p-0 edit-btn"
                        @click="editField('gioiTinh', userInfo.gioiTinh)">
                        Chỉnh sửa
                      </button>
                    </div>
                    <div v-else class="d-flex">
                      <button class="btn btn-link text-danger p-0 me-3" @click="cancelEdit">
                        Hủy
                      </button>
                      <button class="btn btn-link text-success p-0" @click="saveEdit">Lưu</button>
                    </div>
                  </div>
                </div>

                <!-- Ngày sinh -->
                <div class="info-item">
                  <div class="info-label">Ngày sinh</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value" v-if="editingField !== 'ngaySinh'">
                      {{ formatDate(userInfo.ngaySinh) }}
                    </div>
                    <div class="input-group" v-else>
                      <input type="date" class="form-control" v-model="editValue" ref="inputField" id="ngaySinhInput"
                        name="ngaySinh" autocomplete="bday" aria-label="Ngày sinh" />
                    </div>
                    <div v-if="editingField !== 'ngaySinh'">
                      <button class="btn btn-link text-primary p-0 edit-btn"
                        @click="editField('ngaySinh', userInfo.ngaySinh)">
                        Chỉnh sửa
                      </button>
                    </div>
                    <div v-else class="d-flex">
                      <button class="btn btn-link text-danger p-0 me-3" @click="cancelEdit">
                        Hủy
                      </button>
                      <button class="btn btn-link text-success p-0" @click="saveEdit">Lưu</button>
                    </div>
                  </div>
                </div>

                <!-- Mật khẩu -->
                <div class="info-item">
                  <div class="info-label">Mật khẩu</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value">••••••••</div>
                    <button class="btn btn-link text-primary p-0 edit-btn" @click="showPasswordForm = true">
                      Thay đổi mật khẩu
                    </button>
                  </div>
                </div>
              </div>

              <!-- Form đổi mật khẩu -->
              <div v-if="showPasswordForm" class="mt-4 border-top pt-4">
                <h4 class="mb-3">Đổi mật khẩu</h4>
                <form @submit.prevent="updatePassword">
                  <div class="alert alert-info mb-4">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    Đặt lại mật khẩu của bạn. Mật khẩu phải có ít nhất 8 ký tự.
                  </div>

                  <!-- Mật khẩu hiện tại -->
                  <div class="mb-3">
                    <label for="currentPassword" class="form-label">Mật khẩu hiện tại</label>
                    <div class="input-group">
                      <input :type="showCurrentPassword ? 'text' : 'password'" class="form-control" id="currentPassword"
                        name="currentPassword" autocomplete="current-password" aria-describedby="currentPasswordHelp"
                        v-model="passwordData.currentPassword" />
                      <button class="btn btn-outline-secondary" type="button"
                        @click="showCurrentPassword = !showCurrentPassword">
                        <i class="bi" :class="showCurrentPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                      </button>
                    </div>
                    <div id="currentPasswordHelp" class="form-text">Nhập mật khẩu hiện tại của bạn.</div>
                  </div>

                  <!-- Mật khẩu mới -->
                  <div class="mb-3">
                    <label for="newPassword" class="form-label">Mật khẩu mới</label>
                    <div class="input-group">
                      <input :type="showNewPassword ? 'text' : 'password'" class="form-control" id="newPassword"
                        name="newPassword" autocomplete="new-password" aria-describedby="passwordHelp"
                        v-model="passwordData.newPassword" />
                      <button class="btn btn-outline-secondary" type="button"
                        @click="showNewPassword = !showNewPassword">
                        <i class="bi" :class="showNewPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                      </button>
                    </div>
                    <div id="passwordHelp" class="form-text">Mật khẩu phải có ít nhất 8 ký tự.</div>
                  </div>

                  <!-- Xác nhận mật khẩu -->
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
                    <div class="input-group">
                      <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control" id="confirmPassword"
                        name="confirmPassword" autocomplete="new-password" aria-describedby="confirmPasswordHelp"
                        v-model="passwordData.confirmPassword" />
                      <button class="btn btn-outline-secondary" type="button"
                        @click="showConfirmPassword = !showConfirmPassword">
                        <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                      </button>
                    </div>
                    <div id="confirmPasswordHelp" class="form-text">Nhập lại mật khẩu mới của bạn.</div>
                  </div>

                  <div v-if="passwordError" class="alert alert-danger">
                    {{ passwordError }}
                  </div>

                  <div class="d-flex justify-content-end mt-3">
                    <button type="button" class="btn btn-outline-secondary me-2" @click="showPasswordForm = false">
                      Hủy
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="isUpdatingPassword">
                      <i class="bi" :class="isUpdatingPassword ? 'bi-hourglass-split' : 'bi-key'"></i>
                      {{ isUpdatingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { getThongTinNguoiDungByTaiKhoanId, updateThongTinNguoiDung } from '@/Service/ThongTinNguoiDungService';
import { getTaiKhoanById, uploadAvatar, changePassword, checkOldPassword } from '@/Service/TaiKhoan';
import { useToast } from '@/stores/notificationStore';

export default {
  name: 'ThongTinTaiKhoan',
  setup() {
    const authStore = useAuthStore();
    const toast = useToast();

    // Hàm tiện ích để loại bỏ các thuộc tính có thể gây lỗi Hibernate proxy
    const sanitizeObject = (obj) => {
      if (!obj) return null;

      // Nếu là chuỗi, thử parse thành object
      if (typeof obj === 'string') {
        try {
          return JSON.parse(obj);
        } catch {
          return obj;
        }
      }

      // Nếu không phải object, trả về nguyên giá trị
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      // Nếu là mảng, xử lý từng phần tử
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }

      // Loại bỏ các thuộc tính có thể gây lỗi
      const result = {};
      for (const key in obj) {
        // Bỏ qua các thuộc tính bắt đầu bằng dấu gạch dưới hoặc các thuộc tính đặc biệt
        if (key.startsWith('_') || key === 'hibernateLazyInitializer' || key === 'handler') {
          continue;
        }

        // Xử lý đệ quy cho các thuộc tính là object
        result[key] = sanitizeObject(obj[key]);
      }

      return result;
    };

    const account = reactive({
      id: null,
      tenDangNhap: '',
      anh: '',
    });

    const userInfo = reactive({
      id: null,
      hoTen: '',
      email: '',
      soDienThoai: '',
      diaChi: '',
      gioiTinh: null,
      ngaySinh: null,
    });

    const isLoading = ref(true);
    const error = ref(null);
    const showAvatarUpload = ref(false);
    const avatarFile = ref(null);
    const showPasswordForm = ref(false);

    const passwordData = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    const passwordError = ref(null);
    const isUpdatingPassword = ref(false);
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);

    const editingField = ref(null);
    const editValue = ref(null);

    const genderOptions = [
      { value: false, label: 'Nam' },
      { value: true, label: 'Nữ' },
    ];

    const loadAccountAndUserInfo = async () => {
      try {
        isLoading.value = true;
        if (!authStore.user) {
          throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        }

        // Log thông tin người dùng để debug
        console.log('Thông tin authStore.user:', authStore.user);

        // Lấy ID tài khoản từ authStore, kiểm tra nhiều trường hợp có thể
        const userId = authStore.user.id || authStore.user.userId || authStore.user.accountId;

        if (!userId) {
          console.error('Không tìm thấy ID trong authStore.user:', authStore.user);
          throw new Error("Không tìm thấy ID tài khoản. Vui lòng đăng nhập lại.");
        }

        console.log('Sử dụng userId:', userId);

        // 1. Lấy thông tin tài khoản (ảnh, tên đăng nhập)
        const accountResponse = await getTaiKhoanById(userId);
        if (accountResponse.data) {
          const cleanAccountData = sanitizeObject(accountResponse.data);
          account.id = cleanAccountData.id;
          account.tenDangNhap = cleanAccountData.tenDangNhap;
          account.anh = cleanAccountData.anh;
          account.email = cleanAccountData.email;
          account.soDienThoai = cleanAccountData.soDienThoai;
        }

        // 2. Lấy thông tin người dùng chi tiết
        console.log('Gọi API getThongTinNguoiDungByTaiKhoanId với userId:', userId);
        let userInfoLoaded = false;

        try {
          const userInfoResponse = await getThongTinNguoiDungByTaiKhoanId(userId);
          console.log('Thông tin người dùng từ API:', userInfoResponse);

          if (userInfoResponse.data) {
            // Kiểm tra cấu trúc dữ liệu trả về và làm sạch dữ liệu
            const rawUserData = userInfoResponse.data.data || userInfoResponse.data;
            const cleanUserData = sanitizeObject(rawUserData);

            // Xử lý lỗi Hibernate proxy
            if (cleanUserData) {
              try {
                // Sao chép dữ liệu cần thiết
                userInfo.id = cleanUserData.id;
                userInfo.hoTen = cleanUserData.hoTen;
                userInfo.email = cleanUserData.email || account.email;
                userInfo.soDienThoai = cleanUserData.soDienThoai || account.soDienThoai;
                userInfo.diaChi = cleanUserData.diaChi;
                userInfo.gioiTinh = cleanUserData.gioiTinh;
                userInfo.ngaySinh = cleanUserData.ngaySinh;
                userInfoLoaded = true;
              } catch (parseError) {
                console.error('Lỗi khi xử lý dữ liệu người dùng:', parseError);
                toast.error('Có lỗi khi xử lý dữ liệu. Vui lòng tải lại trang.');
              }
            } else {
              console.log('Không tìm thấy dữ liệu người dùng chi tiết.');
            }
          }
        } catch (userInfoError) {
          console.log('Không tìm thấy thông tin người dùng từ API, có thể là tài khoản mới:', userInfoError);
        }

        // Nếu không tải được thông tin từ API, thử tải từ localStorage
        if (!userInfoLoaded) {
          console.log('Tải thông tin người dùng từ localStorage');
          const userInfoKey = `userInfo_${userId}`;
          try {
            const storedUserInfo = localStorage.getItem(userInfoKey);
            if (storedUserInfo) {
              const parsedUserInfo = JSON.parse(storedUserInfo);

              // Cập nhật thông tin từ localStorage
              userInfo.id = null; // Không có ID từ server
              userInfo.hoTen = parsedUserInfo.hoTen || '';
              userInfo.email = parsedUserInfo.email || account.email || '';
              userInfo.soDienThoai = parsedUserInfo.soDienThoai || account.soDienThoai || '';
              userInfo.diaChi = parsedUserInfo.diaChi || '';
              userInfo.gioiTinh = parsedUserInfo.gioiTinh !== undefined ? parsedUserInfo.gioiTinh : null;
              userInfo.ngaySinh = parsedUserInfo.ngaySinh || null;

              console.log('Đã tải thông tin người dùng từ localStorage:', parsedUserInfo);
            } else {
              // Khởi tạo với thông tin cơ bản từ tài khoản
              userInfo.id = null;
              userInfo.email = account.email || '';
              userInfo.soDienThoai = account.soDienThoai || '';
            }
          } catch (localStorageError) {
            console.error('Lỗi khi tải thông tin từ localStorage:', localStorageError);
            // Khởi tạo với thông tin cơ bản từ tài khoản
            userInfo.id = null;
            userInfo.email = account.email || '';
            userInfo.soDienThoai = account.soDienThoai || '';
          }
        }

      } catch (err) {
        console.error('Lỗi khi tải thông tin:', err);
        error.value = 'Không thể tải thông tin tài khoản. Vui lòng thử lại.';
      } finally {
        isLoading.value = false;
      }
    };

    const handleAvatarChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        avatarFile.value = file;
      }
    };

    const uploadAvatarImage = async () => {
      if (!avatarFile.value) return;

      try {
        console.log('Đang tải lên ảnh đại diện...');

        // Đảm bảo có ID tài khoản
        const userId = authStore.user.id || authStore.user.userId || authStore.user.accountId;
        if (!userId) {
          toast.error('Không tìm thấy ID tài khoản. Vui lòng tải lại trang.');
          return;
        }

        await uploadAvatar(userId, avatarFile.value);
        toast.success('Tải lên ảnh đại diện thành công');

        // Tải lại thông tin tài khoản để cập nhật ảnh
        const accountResponse = await getTaiKhoanById(userId);
        if (accountResponse.data && accountResponse.data.anh) {
          account.anh = accountResponse.data.anh;
          console.log('Đã cập nhật ảnh đại diện:', account.anh);
        }

        showAvatarUpload.value = false;
        avatarFile.value = null;
      } catch (err) {
        console.error('Lỗi khi tải lên ảnh đại diện:', err);
        toast.error('Không thể tải lên ảnh đại diện. Vui lòng thử lại.');
      }
    };

    const updatePassword = async () => {
      passwordError.value = null;

      // Validate mật khẩu hiện tại
      if (!passwordData.currentPassword) {
        passwordError.value = 'Vui lòng nhập mật khẩu hiện tại';
        return;
      }

      // Validate mật khẩu mới
      if (!passwordData.newPassword) {
        passwordError.value = 'Vui lòng nhập mật khẩu mới';
        return;
      }

      if (passwordData.newPassword.length < 8) {
        passwordError.value = 'Mật khẩu mới phải có ít nhất 8 ký tự';
        return;
      }

      // Validate xác nhận mật khẩu
      if (!passwordData.confirmPassword) {
        passwordError.value = 'Vui lòng xác nhận mật khẩu mới';
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        passwordError.value = 'Mật khẩu xác nhận không khớp';
        return;
      }

      try {
        isUpdatingPassword.value = true;

        // Lấy username từ account hoặc authStore
        const username = account.tenDangNhap || authStore.user.username;
        if (!username) {
          passwordError.value = 'Không tìm thấy tên đăng nhập. Vui lòng tải lại trang.';
          return;
        }

        // Kiểm tra mật khẩu hiện tại
        const verifyResponse = await checkOldPassword({
          username: username,
          password: passwordData.currentPassword
        });

        if (!verifyResponse.data.matched) {
          passwordError.value = 'Mật khẩu hiện tại không đúng';
          isUpdatingPassword.value = false;
          return;
        }

        // Đổi mật khẩu - sử dụng username thay vì id
        const changeResponse = await changePassword({
          username: username,
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });

        // Kiểm tra kết quả từ API
        if (changeResponse.data && changeResponse.data.success) {
          // Reset form và đóng modal
          passwordData.currentPassword = '';
          passwordData.newPassword = '';
          passwordData.confirmPassword = '';
          showPasswordForm.value = false;

          // Reset các trạng thái hiển thị mật khẩu
          showCurrentPassword.value = false;
          showNewPassword.value = false;
          showConfirmPassword.value = false;

          toast.success('Đổi mật khẩu thành công');
        } else {
          // Xử lý trường hợp API trả về thành công nhưng không có dữ liệu
          const errorMessage = (changeResponse.data && changeResponse.data.message) || 'Không thể đổi mật khẩu';
          passwordError.value = errorMessage;
          toast.error(errorMessage);
        }
      } catch (err) {
        console.error('Lỗi khi đổi mật khẩu:', err);

        if (err.response && err.response.data) {
          passwordError.value = err.response.data.message || 'Không thể đổi mật khẩu';
        } else {
          passwordError.value = 'Không thể đổi mật khẩu. Vui lòng thử lại sau.';
        }

        toast.error(passwordError.value);
      } finally {
        isUpdatingPassword.value = false;
      }
    };

    const editField = (fieldName, currentValue) => {
      editingField.value = fieldName;

      // Xử lý đặc biệt cho trường ngày sinh
      if (fieldName === 'ngaySinh' && currentValue) {
        // Chuyển đổi định dạng ngày từ chuỗi sang định dạng YYYY-MM-DD cho input type="date"
        const date = new Date(currentValue);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          editValue.value = `${year}-${month}-${day}`;
        } else {
          editValue.value = '';
        }
      } else {
        editValue.value = currentValue;
      }

      // Tự động focus vào ô input sau khi render
      setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        const inputEl = document.querySelector('.input-group input, .input-group select');
        if (inputEl) {
          inputEl.focus();
        }
      }, 100);
    };

    const cancelEdit = () => {
      editingField.value = null;
      editValue.value = null;
    };

    const saveEdit = async () => {
      if (editingField.value === null) return;

      try {
        const fieldToUpdate = editingField.value;
        let valueToUpdate = editValue.value;

        if (valueToUpdate === null || valueToUpdate === undefined || valueToUpdate === '') {
          toast.warning('Vui lòng nhập thông tin hợp lệ.');
          return;
        }

        // Xử lý đặc biệt cho trường ngày sinh
        if (fieldToUpdate === 'ngaySinh' && valueToUpdate) {
          // Đảm bảo ngày sinh được lưu đúng định dạng
          const dateObj = new Date(valueToUpdate);
          if (!isNaN(dateObj.getTime())) {
            // Chuyển đổi sang định dạng ISO để lưu vào database
            valueToUpdate = dateObj.toISOString();
          }
        }

        // Xử lý đặc biệt cho trường số điện thoại
        if (fieldToUpdate === 'soDienThoai') {
          // Đảm bảo số điện thoại chỉ chứa chữ số
          valueToUpdate = valueToUpdate.replace(/\D/g, '');
        }

        // Xử lý đặc biệt cho trường email
        if (fieldToUpdate === 'email') {
          // Kiểm tra định dạng email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(valueToUpdate)) {
            toast.warning('Vui lòng nhập địa chỉ email hợp lệ.');
            return;
          }
        }

        // Lấy ID tài khoản từ authStore
        const userId = authStore.user.id || authStore.user.userId || authStore.user.accountId;
        if (!userId) {
          toast.error('Không tìm thấy ID tài khoản. Vui lòng tải lại trang.');
          return;
        }

        // Hiển thị thông báo đang cập nhật
        const loadingToastId = toast.info('Đang cập nhật thông tin...', { duration: 0 });

        try {
          // Cập nhật UI ngay lập tức để người dùng thấy thay đổi
          userInfo[fieldToUpdate] = valueToUpdate;

          // Nếu đang cập nhật email, cập nhật cả trong account
          if (fieldToUpdate === 'email') {
            account.email = valueToUpdate;

            // Cập nhật email trong authStore nếu cần
            if (authStore.user) {
              authStore.user.email = valueToUpdate;

              // Lưu lại thông tin user đã cập nhật vào localStorage
              const sessionId = sessionStorage.getItem('current_tab_id');
              if (sessionId) {
                const userStr = localStorage.getItem(`user_${sessionId}`);
                if (userStr) {
                  try {
                    const userData = JSON.parse(userStr);
                    userData.email = valueToUpdate;
                    localStorage.setItem(`user_${sessionId}`, JSON.stringify(userData));
                  } catch (e) {
                    console.error('Lỗi khi cập nhật email trong localStorage:', e);
                  }
                }
              }
            }
          }

          // Nếu có ID thông tin người dùng, gọi API cập nhật
          if (userInfo.id) {
            // Tạo object chỉ chứa thuộc tính cần cập nhật
            const updatedData = {
              id: userInfo.id,
              taiKhoanId: userId,
              [fieldToUpdate]: valueToUpdate
            };

            // Nếu đang cập nhật email, thêm flag để backend biết cần cập nhật cả tài khoản
            if (fieldToUpdate === 'email') {
              updatedData.updateAccountEmail = true;
            }

            console.log('Cập nhật thông tin:', updatedData);

            try {
              // Gọi API cập nhật thông tin
              const response = await updateThongTinNguoiDung(userInfo.id, updatedData);
              console.log('Kết quả cập nhật:', response.data);
            } catch (apiError) {
              console.error('Lỗi API khi cập nhật:', apiError);
              // Không hiển thị lỗi cho người dùng vì UI đã được cập nhật
            }
          } else {
            // Không có ID thông tin người dùng, có thể là tài khoản mới
            console.log('Không có ID thông tin người dùng, lưu thông tin vào localStorage');

            // Lưu thông tin người dùng vào localStorage để sử dụng sau này
            const userInfoKey = `userInfo_${userId}`;
            try {
              const storedUserInfo = localStorage.getItem(userInfoKey)
                ? JSON.parse(localStorage.getItem(userInfoKey))
                : {};

              // Cập nhật trường mới
              storedUserInfo[fieldToUpdate] = valueToUpdate;
              localStorage.setItem(userInfoKey, JSON.stringify(storedUserInfo));
            } catch (e) {
              console.error('Lỗi khi lưu thông tin vào localStorage:', e);
            }
          }

          // Đóng toast loading
          toast.dismissNotification(loadingToastId);

          // Thông báo thành công và đóng form chỉnh sửa
          cancelEdit();
          toast.success('Cập nhật thông tin thành công!');
        } catch (apiError) {
          console.error('Lỗi API:', apiError);
          toast.dismissNotification(loadingToastId);

          // Hiển thị thông báo lỗi
          toast.error('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
        }
      } catch (err) {
        console.error('Lỗi khi cập nhật thông tin:', err);
        toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    };

    const formatGender = (gender) => {
      if (gender === false) return 'Nam';
      if (gender === true) return 'Nữ';
      return 'Chưa cập nhật';
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'Chưa cập nhật';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    onMounted(() => {
      // Đảm bảo đã khởi tạo thông tin người dùng từ localStorage
      authStore.initAuth();

      // Kiểm tra xem đã đăng nhập chưa
      if (!authStore.isLoggedIn) {
        error.value = "Vui lòng đăng nhập để xem thông tin tài khoản.";
        isLoading.value = false;
        return;
      }

      console.log('Thông tin người dùng đang đăng nhập:', authStore.user);
      loadAccountAndUserInfo();
    });

    return {
      account,
      userInfo,
      isLoading,
      error,
      showAvatarUpload,
      avatarFile,
      passwordData,
      passwordError,
      isUpdatingPassword,
      showPasswordForm,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      editingField,
      editValue,
      genderOptions,
      handleAvatarChange,
      uploadAvatarImage,
      updatePassword,
      editField,
      cancelEdit,
      saveEdit,
      formatGender,
      formatDate,
    };
  },
};
</script>

<style scoped>
.account-detail-page {
  padding: 20px;
  background-color: #f8f9fa;
}

.card {
  overflow: hidden;
  transition: all 0.3s ease;
}

.bg-primary {
  background: #003580 !important;
}

.btn-primary {
  background-color: #0071c2;
  border-color: #0071c2;
}

.btn-primary:hover {
  background-color: #00508b;
  border-color: #00508b;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  padding: 16px 0;
  border-bottom: 1px solid #eaeaea;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.info-value {
  font-size: 16px;
  color: #333;
}

.info-description {
  font-size: 12px;
  color: #6b6b6b;
  margin-top: 4px;
}

.edit-btn {
  font-weight: 500;
  text-decoration: none;
}

.edit-btn:hover {
  text-decoration: underline;
}

/* Thêm style cho input khi đang chỉnh sửa */
.input-group {
  max-width: 300px;
  transition: all 0.3s ease;
}

.input-group .form-control:focus,
.input-group .form-select:focus {
  border-color: #0071c2;
  box-shadow: 0 0 0 0.2rem rgba(0, 113, 194, 0.25);
}

/* Avatar styling */
.avatar-container {
  position: relative;
}

.avatar-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Modal styling */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.avatar-upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1051;
}

.avatar-upload-modal .modal-content {
  width: 450px;
  max-width: 90%;
  background-color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .info-item {
    flex-direction: column;
  }

  .input-group {
    max-width: 100%;
    margin-bottom: 10px;
  }
}
</style>
