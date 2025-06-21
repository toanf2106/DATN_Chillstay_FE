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
      authStore.initAuth()
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
