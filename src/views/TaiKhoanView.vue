<template>
  <div class="account-page">
    <div class="account-container">
      <div class="account-sidebar">
        <div class="sidebar-header">
          <h3>Tài khoản</h3>
        </div>
        <ul class="sidebar-nav">
          <li class="nav-section-header">Quản lý tài khoản</li>
          <li class="nav-item">
            <router-link to="/tai-khoan/thong-tin" class="nav-link" active-class="active">Thông tin tài
              khoản</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tai-khoan/bao-mat" class="nav-link" active-class="active">Cài đặt bảo mật</router-link>
          </li>

          <li class="nav-section-header">Hoạt động</li>
          <li class="nav-item">
            <router-link to="/tai-khoan/lich-su-dat-phong" class="nav-link" active-class="active">Lịch sử đặt
              Homestay</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tai-khoan/danh-gia" class="nav-link" active-class="active">Đánh giá của bạn</router-link>
          </li>
        </ul>
      </div>
      <div class="account-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/');
  }
});
</script>

<style scoped>
.account-page {
  padding: 40px 20px;
  background-color: #f9f9f9;
  min-height: 80vh;
}

.account-container {
  /* max-width: 1200px; */
  margin: 0 auto;
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.account-sidebar {
  width: 280px;
  background-color: #fdfdfd;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
}

.sidebar-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-section-header {
  font-size: 14px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  padding: 15px 0;
  margin-top: 10px;
}

.nav-item {
  margin-bottom: 5px;
}

.nav-link {
  display: block;
  padding: 12px 15px;
  color: #555;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s;
}

.nav-link:hover {
  background-color: #f0f0f0;
  color: #007bff;
}

.router-link-active {
  background-color: #007bff;
  color: #fff;
  font-weight: 600;
}

.account-content {
  flex-grow: 1;
  padding: 40px;
}
</style>
