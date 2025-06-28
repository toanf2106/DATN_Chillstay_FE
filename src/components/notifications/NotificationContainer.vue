<template>
  <div>
    <!-- Container for each position -->
    <div
      v-for="position in positions"
      :key="position"
      class="notification-container"
      :class="`position-${position}`"
    >
      <transition-group name="notification-transition">
        <toast-notification
          v-for="notification in getNotificationsForPosition(position)"
          :key="notification.id"
          :notification="notification"
        />
      </transition-group>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import ToastNotification from './ToastNotification.vue'

export default {
  name: 'NotificationContainer',
  components: {
    ToastNotification
  },
  setup() {
    const store = useNotificationStore()
    const notifications = computed(() => store.notifications)

    // Các vị trí có thể hiển thị thông báo
    const positions = [
      'top-right',
      'top-left',
      'bottom-right',
      'bottom-left',
      'top-center',
      'bottom-center'
    ]

    // Lấy thông báo theo vị trí
    const getNotificationsForPosition = (position) => {
      return notifications.value.filter(n =>
        (n.position || 'top-right') === position && n.visible
      )
    }

    return {
      notifications,
      positions,
      getNotificationsForPosition
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  max-width: 450px;
  pointer-events: none;
  padding: 10px;
}

/* Vị trí các container */
.position-top-right {
  top: 0;
  right: 0;
}

.position-top-left {
  top: 0;
  left: 0;
}

.position-bottom-right {
  bottom: 0;
  right: 0;
  flex-direction: column-reverse;
}

.position-bottom-left {
  bottom: 0;
  left: 0;
  flex-direction: column-reverse;
}

.position-top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.position-bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column-reverse;
}

/* Animation cho transition-group */
.notification-transition-enter-active,
.notification-transition-leave-active {
  transition: all 0.3s ease;
}

.notification-transition-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.notification-transition-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
