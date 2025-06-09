<script setup>
import { RouterView } from 'vue-router'
import HeaderChillstay from './components/HeaderChillstay.vue'
import FooterHome from './components/FooterHome.vue'
</script>

<template>
  <HeaderChillstay />
  <RouterView />
  <FooterHome />

</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
