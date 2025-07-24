<template>
  <div class="user-avatar-container">
    <div class="user-avatar-wrapper">
      <img :src="avatarUrl" @error="handleAvatarError" alt="Avatar" class="user-avatar-img" />
    </div>
    <span class="user-greeting">Xin chào, {{ username }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const avatarError = ref(false);
const defaultAvatar = '/images/default-avatar.png';

const username = computed(() => {
  return authStore.user?.username || 'Khách';
});

const avatarUrl = computed(() => {
  if (avatarError.value || !authStore.user?.anh) {
    return defaultAvatar;
  }

  // Thêm timestamp để tránh cache
  const timestamp = new Date().getTime();
  const baseUrl = authStore.user.anh;
  return baseUrl.includes('?') ? `${baseUrl}&t=${timestamp}` : `${baseUrl}?t=${timestamp}`;
});

function handleAvatarError() {
  avatarError.value = true;
}

onMounted(() => {
  // Đảm bảo avatar được load mới nhất từ server nếu có thể
  if (authStore.isLoggedIn && authStore.user) {
    console.log('User avatar URL:', authStore.user.anh);
  }
});
</script>

<style scoped>
.user-avatar-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
}

.user-avatar-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #eaeaea;
  background-color: #f5f5f5;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-greeting {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
</style>
