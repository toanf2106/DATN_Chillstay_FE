<template>
  <div class="container-fluid security-settings-page">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <!-- Header -->
        <div class="card shadow-sm rounded-4 border-0 mb-3">
          <div class="card-header bg-primary text-white border-0 py-3">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="m-0 fw-bold">Cài đặt bảo mật</h3>
            </div>
          </div>
        </div>

        <!-- Nội dung cài đặt bảo mật -->
        <div class="card shadow-sm rounded-4 border-0 mb-4">
          <div class="card-body">
            <h4 class="mb-4">Quản lý tài khoản</h4>

            <!-- Xóa tài khoản -->
            <div class="section-delete-account">
              <h5 class="text-danger mb-3">Xóa tài khoản</h5>
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Cảnh báo:</strong> Việc xóa tài khoản là không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa
                vĩnh viễn.
              </div>

              <p>Khi xóa tài khoản, những thông tin sau sẽ bị xóa:</p>
              <ul>
                <li>Thông tin cá nhân và hồ sơ của bạn</li>
                <li>Lịch sử đặt phòng</li>
                <li>Đánh giá và nhận xét</li>
                <li>Tất cả dữ liệu khác liên quan đến tài khoản của bạn</li>
              </ul>

              <button class="btn btn-outline-danger mt-3" @click="showDeleteConfirmation = true">
                <i class="bi bi-trash me-2"></i>Xóa tài khoản của tôi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận xóa tài khoản -->
    <div v-if="showDeleteConfirmation" class="modal-backdrop" @click="closeDeleteModal"></div>
    <div v-if="showDeleteConfirmation" class="modal-container">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Xác nhận xóa tài khoản
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
        </div>
        <div class="modal-body">
          <div v-if="!confirmDelete">
            <p class="mb-3">Bạn có chắc chắn muốn xóa tài khoản của mình? Hành động này không thể hoàn tác.</p>
            <p class="mb-4">Để tiếp tục, vui lòng nhấn vào nút "Tôi muốn xóa tài khoản" bên dưới.</p>
            <div class="d-flex justify-content-end">
              <button class="btn btn-secondary me-2" @click="closeDeleteModal">Hủy</button>
              <button class="btn btn-danger" @click="confirmDelete = true">
                Tôi muốn xóa tài khoản
              </button>
            </div>
          </div>
          <div v-else>
            <p class="mb-3">Để xác nhận xóa tài khoản, vui lòng nhập mật khẩu của bạn:</p>
            <div class="mb-3">
              <label for="password" class="form-label">Mật khẩu</label>
              <div class="input-group">
                <input :type="showPassword ? 'text' : 'password'" class="form-control" id="password" v-model="password"
                  placeholder="Nhập mật khẩu của bạn" autocomplete="current-password" />
                <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                  <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
              <div class="form-text">Nhập mật khẩu để xác nhận bạn là chủ tài khoản.</div>
            </div>
            <div v-if="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>
            <div class="d-flex justify-content-end">
              <button class="btn btn-secondary me-2" @click="confirmDelete = false">Quay lại</button>
              <button class="btn btn-danger" @click="deleteAccount" :disabled="isDeleting || !password">
                <span v-if="isDeleting" class="spinner-border spinner-border-sm me-2" role="status"
                  aria-hidden="true"></span>
                {{ isDeleting ? 'Đang xử lý...' : 'Xóa tài khoản' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { useToast } from '@/stores/notificationStore';
import { checkOldPassword } from '@/Service/TaiKhoan';
import api from '@/utils/api';

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

// Trạng thái cho modal xóa tài khoản
const showDeleteConfirmation = ref(false);
const confirmDelete = ref(false);
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const isDeleting = ref(false);

// Đóng modal và reset trạng thái
const closeDeleteModal = () => {
  showDeleteConfirmation.value = false;
  confirmDelete.value = false;
  password.value = '';
  errorMessage.value = '';
  showPassword.value = false;
};

// Xử lý xóa tài khoản
const deleteAccount = async () => {
  try {
    errorMessage.value = '';
    isDeleting.value = true;

    // Lấy thông tin người dùng
    const username = authStore.user?.username;
    const userId = authStore.user?.id;

    if (!username || !userId) {
      errorMessage.value = 'Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.';
      isDeleting.value = false;
      return;
    }

    // Kiểm tra mật khẩu
    const verifyResponse = await checkOldPassword({
      username: username,
      password: password.value
    });

    if (!verifyResponse.data.matched) {
      errorMessage.value = 'Mật khẩu không chính xác';
      isDeleting.value = false;
      return;
    }

    // Gọi API xóa tài khoản vĩnh viễn
    const response = await api.delete(`/api/taiKhoan/permanent-delete/${userId}`, {
      data: {
        password: password.value,
        deleteUserInfo: true
      }
    });

    // Xử lý phản hồi
    if (response.data && response.data.success) {
      // Đóng modal
      closeDeleteModal();

      // Hiển thị thông báo thành công
      toast.success('Tài khoản đã được xóa thành công');

      // Đăng xuất người dùng
      authStore.logout();

      // Chuyển hướng về trang chủ
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      errorMessage.value = response.data?.message || 'Không thể xóa tài khoản. Vui lòng thử lại sau.';
    }
  } catch (error) {
    console.error('Lỗi khi xóa tài khoản:', error);
    errorMessage.value = error.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản. Vui lòng thử lại sau.';
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
.security-settings-page {
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

.section-delete-account {
  border-top: 1px solid #eaeaea;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.modal-container {
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

.modal-content {
  width: 500px;
  max-width: 90%;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  animation: modal-in 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.modal-body {
  padding: 1.5rem;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .modal-content {
    width: 95%;
  }
}
</style>
