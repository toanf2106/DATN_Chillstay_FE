<script>
import { RouterView } from 'vue-router'
import HeaderChillstay from './components/HeaderChillstay.vue'
import FooterHome from './components/FooterHome.vue'

export default {
  components: {
    RouterView,
    HeaderChillstay,
    FooterHome,
  },
  computed: {
    isAdminRoute() {
      return this.$route.path.includes('/admin')
    },
  },
}
</script>

<template>
  <HeaderChillstay v-if="!isAdminRoute" />
  <RouterView />
  <FooterHome v-if="!isAdminRoute" />
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
