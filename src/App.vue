<script>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import HeaderChillstay from './components/HeaderChillstay.vue'
import FooterHome from './components/FooterHome.vue'
import NotificationContainer from './components/notifications/NotificationContainer.vue'
import { useAuthStore } from './stores/authStore'

export default {
  components: {
    RouterView,
    HeaderChillstay,
    FooterHome,
    NotificationContainer,
  },
  setup() {
    const authStore = useAuthStore()

    onMounted(() => {
      // Khôi phục trạng thái đăng nhập khi ứng dụng khởi động
      console.log('App mounted, initializing auth state...')
      try {
        // Khôi phục trạng thái đăng nhập từ localStorage nếu có
        authStore.initAuth()

        console.log('Auth state initialized:', {
          isLoggedIn: authStore.isLoggedIn,
          isAdmin: authStore.isAdmin,
          hasUser: !!authStore.user,
        })
      } catch (error) {
        console.error('Lỗi khi khởi tạo trạng thái đăng nhập:', error)
        // Nếu có lỗi, đảm bảo trạng thái đã được đăng xuất
        authStore.logout()
      }
    })
  },
  computed: {
    isAdminRoute() {
      return this.$route.path.startsWith('/admin')
    },
  },
}
</script>

<template>
  <HeaderChillstay v-if="!isAdminRoute" />
  <RouterView />
  <FooterHome v-if="!isAdminRoute" />
  <NotificationContainer />
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

body {
  padding-top: 0;
  background: #f4f6fb;
  margin: 0;
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

/* Đảm bảo hiển thị tiếng Việt đúng cho toàn bộ ứng dụng */
* {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Đặc biệt cho các input, textarea, select để hiển thị tiếng Việt đúng */
input,
textarea,
select,
button {
  font-family: 'Roboto', sans-serif;
}
</style>
