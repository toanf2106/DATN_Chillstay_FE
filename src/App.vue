<script>
import { RouterView } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
import HeaderNav from './components/HeaderNav.vue'
import FooterHome from './components/FooterHome.vue'
import NotificationContainer from './components/notifications/NotificationContainer.vue'
import { useAuthStore } from './stores/authStore'
import { useNotificationStore } from './stores/notificationStore'

export default {
  components: {
    RouterView,
    HeaderNav,
    FooterHome,
    NotificationContainer,
  },
  setup() {
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()

    // Hàm xử lý sự kiện phiên đăng nhập hết hạn
    const handleSessionExpired = (event) => {
      console.log('Phát hiện sự kiện phiên hết hạn')
      notificationStore.showNotification({
        type: 'error',
        title: 'Phiên đăng nhập hết hạn',
        message:
          event.detail.message || 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.',
        timeout: 5000,
      })
    }

    onMounted(() => {
      // Khôi phục trạng thái đăng nhập khi ứng dụng khởi động
      console.log('App mounted, initializing auth state...')
      try {
        // Đăng ký lắng nghe sự kiện phiên hết hạn
        window.addEventListener('session-expired', handleSessionExpired)

        // Khôi phục trạng thái đăng nhập từ localStorage nếu có
        authStore.initAuth()

        console.log('Auth state initialized:', {
          isLoggedIn: authStore.isLoggedIn,
          isAdmin: authStore.isAdmin,
          hasUser: !!authStore.user,
        })

        // Kiểm tra lại trạng thái sau khi khởi tạo để đảm bảo UI phản ánh đúng trạng thái
        if (authStore.isLoggedIn) {
          console.log('User is logged in:', authStore.user?.username)
        } else {
          console.log('No user is currently logged in')
        }

        // Kiểm tra nếu URL có tham số expired=true
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('expired') === 'true') {
          notificationStore.showNotification({
            type: 'error',
            title: 'Phiên đăng nhập hết hạn',
            message: 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.',
            timeout: 5000,
          })
          // Xóa tham số khỏi URL
          const url = new URL(window.location)
          url.searchParams.delete('expired')
          window.history.replaceState({}, '', url)
        }
      } catch (error) {
        console.error('Lỗi khi khởi tạo trạng thái đăng nhập:', error)
        // Nếu có lỗi, đảm bảo trạng thái đã được đăng xuất
        authStore.logout()
      }
    })

    onUnmounted(() => {
      // Hủy đăng ký sự kiện khi component bị hủy
      window.removeEventListener('session-expired', handleSessionExpired)
    })

    return {
      authStore,
      notificationStore,
    }
  },
  computed: {
    isAdminRoute() {
      return this.$route.path.startsWith('/admin')
    },
  },
}
</script>

<template>
  <HeaderNav v-if="!isAdminRoute" />
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
