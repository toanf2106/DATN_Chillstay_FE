<template>
  <div class="admin-dashboard">
    <header class="admin-header">
      <div class="header-left">
        <button class="navbar-toggler" type="button" @click="toggleSidebar">☰</button>
        <h1>Chillstay Admin</h1>
      </div>
      <div class="header-right">
        <div class="admin-search">
          <input type="text" placeholder="Tìm kiếm..." />
          <button><i class="fas fa-search"></i></button>
        </div>
        <div class="admin-notifications">
          <span class="notification-badge">3</span>
          <i class="fas fa-bell"></i>
        </div>
        <div class="admin-profile">
          <img src="https://via.placeholder.com/40" alt="Admin" />
          <span>Admin</span>
        </div>
        <button class="logout-btn" @click="logout">Đăng xuất</button>
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
                  @click.prevent="navigateTo('admin-homestay-phong')"
                  :class="{ active: isRouteActive('admin-homestay-phong') }"
                >
                  Phòng
                  <i
                    class="fas fa-check check-icon"
                    v-if="isRouteActive('admin-homestay-phong')"
                  ></i>
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

            <div class="menu-item" :class="{ active: isRouteActive('admin-voucher') }">
              <a href="#" @click.prevent="navigateTo('admin-voucher')">
                <i class="fas fa-ticket-alt"></i>
                <span>Voucher</span>
              </a>
            </div>

            <div class="menu-item" :class="{ active: isRouteActive('admin-tai-khoan') }">
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

            <div class="menu-item" :class="{ active: isRouteActive('admin-thanh-toan') }">
              <a href="#" @click.prevent="navigateTo('admin-thanh-toan')">
                <i class="fas fa-credit-card"></i>
                <span>Thanh toán</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="main-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css'
import { useAdminDashboard } from '../Styles/JS/Admin.js'

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
      logout,
    } = useAdminDashboard()

    return {
      isSubmenuOpen,
      isUserMenuActive,
      isBookingMenuActive,
      isContentMenuActive,
      isRouteActive,
      navigateTo,
      toggleSubmenu,
      toggleSidebar,
      logout,
    }
  },
}
</script>

<style>
@import '../Styles/CSS/Admin.css';
</style>
