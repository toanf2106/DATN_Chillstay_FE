<template>
  <div class="admin-dashboard">
    <header class="admin-header">
      <div class="header-left">
        <button class="navbar-toggler" type="button" @click="toggleSidebar">
          <i class="fas fa-bars"></i>
        </button>
        <h1>Chillstay Admin</h1>
      </div>
      <div class="header-right">
        <div class="admin-profile" ref="adminProfileRef" @click="toggleUserMenu">
          <div class="avatar-circle">
            <img
              :src="
                nhanVienInfo && nhanVienInfo.anh ? nhanVienInfo.anh : '/images/default-avatar.png'
              "
              alt="Avatar"
            />
          </div>
          <div class="user-info">
            <span class="user-name">{{ nhanVienInfo?.hoTen || 'Không tìm thấy' }}</span>
          </div>
          <i class="fas fa-chevron-down dropdown-icon" :class="{ rotated: isUserMenuOpen }"></i>

          <!-- Dropdown menu -->
          <div class="user-dropdown" v-show="isUserMenuOpen">
            <div class="dropdown-item" @click="goToAccountDetail">
              <i class="fas fa-user"></i>
              <span>Tài khoản</span>
            </div>
            <div class="dropdown-item" @click="showChangePasswordForm = true">
              <i class="fas fa-key"></i>
              <span>Đổi mật khẩu</span>
            </div>
            <div class="dropdown-item logout" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="dashboard-content">
      <div
        class="offcanvas offcanvas-start"
        data-bs-scroll="true"
        tabindex="-1"
        id="sidebarOffcanvas"
        aria-labelledby="sidebarOffcanvasLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="sidebarOffcanvasLabel">Quản lý Chillstays</h5>
          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body p-0">
          <div class="sidebar-menu">
            <div class="menu-item" :class="{ active: isRouteActive('admin-thong-ke') }">
              <a href="#" @click.prevent="navigateTo('admin-thong-ke')">
                <i class="fas fa-chart-line"></i>
                <span>Thống kê</span>
              </a>
            </div>

            <div class="menu-item" :class="{ active: isRouteActive('admin-dat-homestay') }">
              <a href="#" @click.prevent="navigateTo('admin-dat-homestay')">
                <i class="fas fa-home"></i>
                <span>Đặt homestay</span>
              </a>
            </div>
            <div
              class="menu-item"
              :class="{ open: isSubmenuOpen.nguoiDung, active: isUserMenuActive }"
            >
              <a href="#" class="has-submenu" @click.prevent="toggleSubmenu('nguoiDung')">
                <i class="fas fa-users"></i>
                <span>Người dùng</span>
                <span class="arrow">
                  <i class="fas fa-chevron-right" v-if="!isSubmenuOpen.nguoiDung"></i>
                  <i class="fas fa-chevron-down" v-else></i>
                </span>
              </a>
              <div class="submenu">
                <a
                  v-if="isAdmin"
                  href="#"
                  @click.prevent="navigateTo('admin-nhan-vien')"
                  :class="{ active: isRouteActive('admin-nhan-vien') }"
                >
                  Nhân viên
                  <i class="fas fa-check check-icon" v-if="isRouteActive('admin-nhan-vien')"></i>
                </a>
                <a
                  href="#"
                  @click.prevent="navigateTo('admin-khach-hang')"
                  :class="{ active: isRouteActive('admin-khach-hang') }"
                >
                  Khách hàng
                  <i class="fas fa-check check-icon" v-if="isRouteActive('admin-khach-hang')"></i>
                </a>
              </div>
            </div>

            <div
              v-if="isAdmin"
              class="menu-item"
              :class="{ open: isSubmenuOpen.Homestay, active: isBookingMenuActive }"
            >
              <a href="#" class="has-submenu" @click.prevent="toggleSubmenu('Homestay')">
                <i class="fas fa-calendar-check"></i>
                <span>Homestay</span>
                <span class="arrow">
                  <i class="fas fa-chevron-right" v-if="!isSubmenuOpen.Homestay"></i>
                  <i class="fas fa-chevron-down" v-else></i>
                </span>
              </a>
              <div class="submenu">
                <a
                  href="#"
                  @click.prevent="navigateTo('admin-homestay')"
                  :class="{ active: isRouteActive('admin-homestay') }"
                >
                  Homestay
                </a>
                <a
                  href="#"
                  @click.prevent="navigateTo('admin-phong')"
                  :class="{ active: isRouteActive('admin-phong') }"
                >
                  Phòng
                  <i class="fas fa-check check-icon" v-if="isRouteActive('admin-phong')"></i>
                </a>
                <a
                  href="#"
                  @click.prevent="navigateTo('admin-homestay-vattu')"
                  :class="{ active: isRouteActive('admin-homestay-vattu') }"
                >
                  Vật tư
                </a>
                <a
                  href="#"
                  @click.prevent="navigateTo('admin-homestay-tiennghi')"
                  :class="{ active: isRouteActive('admin-homestay-tiennghi') }"
                >
                  Tiện nghi
                </a>
                <a
                  href="#"
                  @click.prevent="navigateTo('admin-homestay-dichvu')"
                  :class="{ active: isRouteActive('admin-homestay-dichvu') }"
                >
                  Dịch vụ
                </a>
              </div>
            </div>

            <div
              v-if="isAdmin"
              class="menu-item"
              :class="{ active: isRouteActive('admin-voucher') }"
            >
              <a href="#" @click.prevent="navigateTo('admin-voucher')">
                <i class="fas fa-ticket-alt"></i>
                <span>Giảm giá</span>
              </a>
            </div>

            <div
              v-if="isAdmin"
              class="menu-item"
              :class="{ active: isRouteActive('admin-tai-khoan') }"
            >
              <a href="#" @click.prevent="navigateTo('admin-tai-khoan')">
                <i class="fas fa-user-circle"></i>
                <span>Tài khoản</span>
              </a>
            </div>

            <div
              class="menu-item"
              :class="{ open: isSubmenuOpen.noiDung, active: isContentMenuActive }"
            >
              <a href="#" class="has-submenu" @click.prevent="toggleSubmenu('noiDung')">
                <i class="fas fa-file-alt"></i>
                <span>Nội dung và đánh giá</span>
                <span class="arrow">
                  <i class="fas fa-chevron-right" v-if="!isSubmenuOpen.noiDung"></i>
                  <i class="fas fa-chevron-down" v-else></i>
                </span>
              </a>
              <div class="submenu">
                <a
                  href="#"
                  @click.prevent="navigateTo('admin-tin-tuc')"
                  :class="{ active: isRouteActive('admin-tin-tuc') }"
                >
                  Tin tức
                  <i class="fas fa-check check-icon" v-if="isRouteActive('admin-tin-tuc')"></i>
                </a>
                <a
                  href="#"
                  @click.prevent="navigateTo('admin-danh-gia')"
                  :class="{ active: isRouteActive('admin-danh-gia') }"
                >
                  Đánh giá
                </a>
              </div>
            </div>

            <div
              v-if="isAdmin"
              class="menu-item"
              :class="{ active: isRouteActive('admin-thanh-toan') }"
            >
              <a href="#" @click.prevent="navigateTo('admin-thanh-toan')">
                <i class="fas fa-credit-card"></i>
                <span>Thanh toán</span>
              </a>
            </div>

            <div
              v-if="isAdmin"
              class="menu-item"
              :class="{ active: isRouteActive('admin-phuphi') }"
            >
              <a href="#" @click.prevent="navigateTo('admin-phuphi')">
                <i class="fas fa-money-bill"></i>
                <span>Phụ phí</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="main-content">
        <router-view></router-view>
      </div>
    </div>

    <!-- Form đổi mật khẩu đơn giản với animation -->
    <transition name="fade">
      <div
        class="password-form-overlay"
        v-if="showChangePasswordForm"
        @click="showChangePasswordForm = false"
      ></div>
    </transition>

    <transition name="zoom-fade">
      <div class="password-form" v-if="showChangePasswordForm">
        <div class="form-header">
          <h3>Đổi mật khẩu</h3>
          <button class="close-button" @click="showChangePasswordForm = false">×</button>
        </div>
        <div class="form-content">
          <div class="form-row">
            <label>Mật khẩu hiện tại</label>
            <div class="input-wrapper">
              <input
                :type="showOldPassword ? 'text' : 'password'"
                v-model="passwordForm.oldPassword"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <i
                class="fas"
                :class="showOldPassword ? 'fa-eye-slash' : 'fa-eye'"
                @click="toggleOldPassword"
              ></i>
            </div>
            <div class="error-message" v-if="passwordForm.errors.oldPassword">
              {{ passwordForm.errors.oldPassword }}
            </div>
          </div>
          <div class="form-row">
            <label>Mật khẩu mới</label>
            <div class="input-wrapper">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                v-model="passwordForm.newPassword"
                placeholder="Nhập mật khẩu mới"
              />
              <i
                class="fas"
                :class="showNewPassword ? 'fa-eye-slash' : 'fa-eye'"
                @click="toggleNewPassword"
              ></i>
            </div>
            <div class="error-message" v-if="passwordForm.errors.newPassword">
              {{ passwordForm.errors.newPassword }}
            </div>
          </div>
          <div class="form-row">
            <label>Xác nhận mật khẩu</label>
            <div class="input-wrapper">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="passwordForm.confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
              />
              <i
                class="fas"
                :class="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"
                @click="toggleConfirmPassword"
              ></i>
            </div>
            <div class="error-message" v-if="passwordForm.errors.confirmPassword">
              {{ passwordForm.errors.confirmPassword }}
            </div>
          </div>
          <div class="form-buttons">
            <button
              class="submit-button"
              @click="handleChangePassword"
              :disabled="passwordForm.isLoading"
            >
              <i
                class="fas"
                :class="passwordForm.isLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"
              ></i>
              {{ passwordForm.isLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css'
import { useAdminDashboard } from '../../Styles/JS/Admin.js'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getNhanVienByTaiKhoanId } from '@/Service/NhanVienService'
import { checkOldPassword, changePassword as changePasswordService } from '@/Service/TaiKhoan'
// import { useNotificationStore } from '@/stores/notificationStore'
import notification from '@/utils/notification'

export default {
  name: 'AdminDashboard',
  setup() {
    const {
      isSubmenuOpen,
      isUserMenuActive,
      isBookingMenuActive,
      isContentMenuActive,
      isRouteActive,
      navigateTo,
      toggleSubmenu,
      toggleSidebar,
    } = useAdminDashboard()

    const authStore = useAuthStore()
    const router = useRouter()
    // const notificationStore = useNotificationStore()
    const isUserMenuOpen = ref(false)
    const nhanVienInfo = ref(null)
    const adminProfileRef = ref(null)
    const showChangePasswordForm = ref(false)
    const showOldPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)

    // Kiểm tra quyền admin dựa trên loại tài khoản
    const isAdmin = computed(() => {
      console.log('Thông tin user:', authStore.user)

      // Kiểm tra quyền ADMIN từ cấu trúc dữ liệu của backend
      return (
        authStore.user &&
        // ID 2 cho Admin từ cơ sở dữ liệu
        (authStore.user.accountTypeId === 2 ||
          // Kiểm tra tên loại tài khoản nếu có (không phân biệt hoa thường)
          authStore.user.accountTypeName?.toUpperCase() === 'ADMIN' ||
          // Kiểm tra thêm tên loại là 'Admin'
          authStore.user.accountTypeName === 'Admin')
      )
    })

    const passwordForm = ref({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      errors: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      isLoading: false,
    })

    const toggleUserMenu = (event) => {
      // Ngăn chặn sự kiện click lan truyền tới document
      event.stopPropagation()
      isUserMenuOpen.value = !isUserMenuOpen.value
    }

    const goToAccountDetail = () => {
      if (authStore.user && authStore.user.id) {
        // Chuyển đến trang chi tiết tài khoản của người dùng đang đăng nhập
        router.push({
          name: 'admin-account-detail',
          params: { id: authStore.user.id },
        })
        // Đóng dropdown menu
        isUserMenuOpen.value = false
      } else {
        notification.warning('Không thể lấy thông tin tài khoản. Vui lòng đăng nhập lại.')
      }
    }

    const handleLogout = () => {
      authStore.logout()
      router.push('/')
    }

    const handleClickOutside = (event) => {
      // Kiểm tra xem click có nằm trong admin-profile hay không
      const adminProfile = document.querySelector('.admin-profile')
      if (adminProfile && !adminProfile.contains(event.target) && isUserMenuOpen.value) {
        isUserMenuOpen.value = false
      }
    }

    // Lấy thông tin nhân viên dựa trên tài khoản ID
    const fetchNhanVienInfo = async () => {
      try {
        if (authStore.user && authStore.user.id) {
          const response = await getNhanVienByTaiKhoanId(authStore.user.id)
          if (response.data.success) {
            nhanVienInfo.value = response.data.data
            console.log('Thông tin nhân viên:', nhanVienInfo.value)
            console.log('URL ảnh nhân viên:', nhanVienInfo.value.anh || 'Không có ảnh')
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin nhân viên:', error)
      }
    }

    // Xử lý phím ESC để đóng form
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showChangePasswordForm.value) {
        showChangePasswordForm.value = false
      }
    }

    const toggleOldPassword = () => {
      showOldPassword.value = !showOldPassword.value
    }

    const toggleNewPassword = () => {
      showNewPassword.value = !showNewPassword.value
    }

    const toggleConfirmPassword = () => {
      showConfirmPassword.value = !showConfirmPassword.value
    }

    const handleChangePassword = async () => {
      // Reset errors
      passwordForm.value.errors = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }

      // Validate
      let isValid = true

      if (!passwordForm.value.oldPassword) {
        passwordForm.value.errors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại'
        isValid = false
      }

      if (!passwordForm.value.newPassword) {
        passwordForm.value.errors.newPassword = 'Vui lòng nhập mật khẩu mới'
        isValid = false
      } else if (passwordForm.value.newPassword.length < 6) {
        passwordForm.value.errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự'
        isValid = false
      }

      if (!passwordForm.value.confirmPassword) {
        passwordForm.value.errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới'
        isValid = false
      } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        passwordForm.value.errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
        isValid = false
      }

      if (!isValid) return

      try {
        passwordForm.value.isLoading = true

        // Kiểm tra mật khẩu cũ
        const verifyResponse = await checkOldPassword({
          username: authStore.user.username,
          password: passwordForm.value.oldPassword,
        })

        if (!verifyResponse.data.matched) {
          passwordForm.value.errors.oldPassword = 'Mật khẩu hiện tại không đúng'
          passwordForm.value.isLoading = false
          return
        }

        // Thay đổi mật khẩu
        const changeResponse = await changePasswordService({
          username: authStore.user.username,
          oldPassword: passwordForm.value.oldPassword,
          newPassword: passwordForm.value.newPassword,
        })

        if (changeResponse.data.success) {
          // Sử dụng dịch vụ thông báo toàn cục
          notification.success('Đổi mật khẩu thành công!', {
            duration: 5000,
          })

          // Reset form và đóng modal
          passwordForm.value.oldPassword = ''
          passwordForm.value.newPassword = ''
          passwordForm.value.confirmPassword = ''
          showChangePasswordForm.value = false

          // Reset các trạng thái hiển thị mật khẩu
          showOldPassword.value = false
          showNewPassword.value = false
          showConfirmPassword.value = false
        } else {
          // Sử dụng dịch vụ thông báo toàn cục
          notification.error(changeResponse.data.message || 'Có lỗi xảy ra khi đổi mật khẩu', {
            duration: 5000,
          })
        }
      } catch (error) {
        // Sử dụng dịch vụ thông báo toàn cục
        notification.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu', {
          duration: 5000,
        })
      } finally {
        passwordForm.value.isLoading = false
      }
    }

    onMounted(() => {
      fetchNhanVienInfo()
      // Thêm event listener để lắng nghe click toàn cục
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)

      // Kiểm tra quyền truy cập sau khi đăng nhập
      checkAccessPermission()

      // Hiển thị trang Welcome nếu đang ở trang chính admin
      if (router.currentRoute.value.path === '/admin') {
        router.push({ name: 'admin-welcome' })
      }

      // Ngăn chặn việc quay lại trang người dùng thông thường bằng cách thay thế lịch sử
      const replaceStateWithAdmin = () => {
        if (window.history && window.history.replaceState) {
          // Thay thế lịch sử hiện tại bằng trang admin hiện tại
          window.history.replaceState({ adminPage: true }, document.title, window.location.href);
        }
      };

      // Thực hiện ngay khi trang được tải
      replaceStateWithAdmin();

      // Thêm một mục mới vào lịch sử để nếu người dùng bấm Back, họ vẫn ở trong trang admin
      window.history.pushState({ adminPage: true }, document.title, window.location.href);

      // Xử lý sự kiện popstate (khi người dùng bấm nút back)
      const handlePopState = (event) => {
        // Nếu không có state hoặc không phải trang admin, thì đẩy lại trang admin vào lịch sử
        if (!event.state || !event.state.adminPage) {
          window.history.pushState({ adminPage: true }, document.title, window.location.href);
        }
      };

      // Đăng ký sự kiện
      window.addEventListener('popstate', handlePopState);

      // Dọn dẹp khi component unmount
      onUnmounted(() => {
        window.removeEventListener('popstate', handlePopState);
      });
    })

    // Kiểm tra quyền truy cập và chuyển hướng
    const checkAccessPermission = () => {
      if (!authStore.user) {
        router.push('/')
        return
      }

      // Cập nhật lại giá trị isAdmin từ store
      authStore.checkAdminAccess()

      // Nếu người dùng là nhân viên và đang cố truy cập trang không được phép
      if (!isAdmin.value) {
        const allowedRoutes = [
          'admin-thong-ke',
          'admin-dat-homestay',
          'admin-khach-hang',
          'admin-tin-tuc',
          'admin-danh-gia',
          'admin-welcome', // Thêm welcome vào danh sách được phép
        ]

        const currentRouteName = router.currentRoute.value.name

        if (!allowedRoutes.includes(currentRouteName)) {
          router.push({ name: 'admin-welcome' })
          // notification.warning('Bạn không có quyền truy cập trang này')
        }
      }
    }

    onUnmounted(() => {
      // Xóa event listener khi component bị hủy
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    })

    return {
      isSubmenuOpen,
      isUserMenuActive,
      isBookingMenuActive,
      isContentMenuActive,
      isRouteActive,
      navigateTo,
      toggleSubmenu,
      toggleSidebar,
      handleLogout,
      isUserMenuOpen,
      toggleUserMenu,
      goToAccountDetail,
      nhanVienInfo,
      adminProfileRef,
      showChangePasswordForm,
      passwordForm,
      handleChangePassword,
      showOldPassword,
      showNewPassword,
      showConfirmPassword,
      toggleOldPassword,
      toggleNewPassword,
      toggleConfirmPassword,
      isAdmin,
    }
  },
}
</script>

<style>
@import '../../Styles/CSS/Admin.css';

:root {
  --primary-color: #3d5af1;
  --primary-light: #e8ebff;
  --secondary-color: #22b07d;
  --text-color: #172b4d;
  --text-light: #42526e;
  --border-color: #e9ecef;
  --background-color: #f8f9fa;
  --header-height: 70px;
  --danger-color: #e63757;
  --warning-color: #f6c343;
  --success-color: #00b894;

  /* Màu xám và trắng cho form */
  --form-bg: #ffffff;
  --form-gray-light: #f5f5f5;
  --form-gray-medium: #e0e0e0;
  --form-gray-dark: #666666;
  --form-text: #333333;
  --form-text-light: #757575;
  --form-accent: #1e8f67; /* Màu xanh chủ đạo */
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: var(--header-height);
  background-color: #1e8f67; /* Màu xanh lá đậm của header */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
  color: #ffffff; /* Màu xanh dương nhạt của chữ "Chillstay Admin" */
  margin-left: 15px;
}

.navbar-toggler {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: white;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.navbar-toggler:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.header-right {
  position: relative;
}

.admin-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.admin-profile:hover {
  background-color: rgba(255, 255, 255, 0.518);
  border-color: rgba(255, 255, 255, 0.2);
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-light);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  border: 2px solid var(--primary-color);
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  margin-right: 10px;
}

.user-name {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-icon {
  font-size: 0.75rem;
  color: var(--text-light);
  transition: transform 0.2s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 260px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
  opacity: 0;
  animation: fadeIn 0.2s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  color: var(--text-color);
  font-weight: 500;
}

.dropdown-item:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.dropdown-item i {
  margin-right: 15px;
  width: 20px;
  font-size: 1rem;
  text-align: center;
}

.dropdown-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.dropdown-item.logout {
  color: var(--danger-color);
}

.dropdown-item.logout:hover {
  background-color: rgba(230, 55, 87, 0.1);
}

.dashboard-content {
  padding-top: var(--header-height);
  display: flex;
  min-height: 100vh;
  background-color: var(--background-color);
}

.main-content {
  flex: 1;
  padding: 20px;
  position: relative;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-left h1 {
    font-size: 1.3rem;
  }

  .user-name {
    max-width: 100px;
  }

  .user-dropdown {
    width: 250px;
  }
}

@media (max-width: 576px) {
  .admin-header {
    padding: 0 15px;
  }

  .header-left h1 {
    font-size: 1.1rem;
  }

  .avatar-circle {
    width: 35px;
    height: 35px;
  }

  .user-dropdown {
    width: 220px;
    right: -10px;
  }
}

/* CSS cho form đổi mật khẩu với màu xám-trắng và animation */
.password-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1050;
  backdrop-filter: blur(2px);
}

.password-form {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-width: 90%;
  background-color: var(--form-bg);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 1051;
  overflow: hidden;
}

.form-header {
  padding: 18px 22px;
  border-bottom: 1px solid var(--form-gray-medium);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--form-gray-light);
}

.form-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--form-accent); /* Màu xanh cho tiêu đề */
}

.close-button {
  background: none;
  border: none;
  color: var(--form-text-light);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.close-button:hover {
  color: var(--form-accent);
  transform: rotate(90deg);
}

.form-content {
  padding: 24px;
}

.form-row {
  margin-bottom: 20px;
  animation: slideUp 0.4s ease forwards;
  opacity: 0;
}

.form-row:nth-child(1) {
  animation-delay: 0.1s;
}
.form-row:nth-child(2) {
  animation-delay: 0.2s;
}
.form-row:nth-child(3) {
  animation-delay: 0.3s;
}
.form-buttons {
  animation-delay: 0.4s;
}

.form-row label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--form-text);
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 1px solid var(--form-gray-medium);
  border-radius: 6px;
  font-size: 14px;
  color: var(--form-text);
  background-color: var(--form-bg);
  transition: all 0.3s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--form-accent);
  box-shadow: 0 0 0 2px rgba(30, 143, 103, 0.15);
}

.input-wrapper input::placeholder {
  color: var(--form-text-light);
  opacity: 0.7;
}

.input-wrapper i {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--form-accent); /* Màu xanh cho các icon */
  transition: all 0.3s ease;
  cursor: pointer;
}

.input-wrapper i:hover {
  color: #167d57; /* Màu đậm hơn khi hover */
}

.input-wrapper input:focus + i {
  color: var(--form-accent);
}

.form-buttons {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  opacity: 0;
  animation: slideUp 0.4s ease forwards;
}

.submit-button {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background-color: var(--form-accent);
  color: white;
  width: 100%;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-button i {
  font-size: 15px;
}

.submit-button:hover {
  background-color: #167d57;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 143, 103, 0.25);
}

.submit-button:active {
  transform: translateY(0);
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
  font-weight: 500;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.zoom-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -60%) scale(0.9);
}

.zoom-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%) scale(0.8);
}
</style>
