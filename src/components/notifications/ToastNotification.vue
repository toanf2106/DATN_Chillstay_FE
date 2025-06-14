<template>
  <div class="toast-container" :class="positionClass">
    <transition-group name="toast-animation">
      <div
        v-for="notification in notificationsForPosition"
        :key="notification.id"
        class="toast"
        :class="[`toast-${notification.type}`, { 'toast-dismissible': notification.dismissible }]"
        v-show="notification.visible"
      >
        <div class="toast-content">
          <div class="toast-message">{{ notification.message }}</div>
        </div>
        <button
          v-if="notification.dismissible"
          class="toast-close"
          @click="dismiss(notification.id)"
        >
          <i class="material-icons">close</i>
        </button>
        <div class="toast-progress" :style="{ animationDuration: `${duration}ms` }"></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => {
      return [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
        'top-center',
        'bottom-center',
      ].includes(value)
    },
  },
  duration: {
    type: Number,
    default: 5000,
  },
})

const notificationStore = useNotificationStore()

// Lọc thông báo cho vị trí hiện tại
const notificationsForPosition = computed(() => {
  return notificationStore.notifications.filter(
    (notification) => notification.position === props.position,
  )
})

const positionClass = computed(() => `position-${props.position}`)

function dismiss(id) {
  notificationStore.dismissNotification(id)
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  width: 100%;
  pointer-events: none;
}

.toast {
  background: #fff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  position: relative;
  animation: toast-in 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
}

.toast-content {
  flex: 1;
  padding: 16px;
}

.toast-message {
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
}

.toast-close {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  margin: 8px 12px 0 0;
  padding: 0;
  transition: color 0.2s;
  font-size: 1rem;
}

.toast-close:hover {
  color: #333;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  transform-origin: left;
  animation: progress-bar 5000ms linear;
}

/* Position variants */
.position-top-right {
  top: 20px;
  right: 20px;
}

.position-top-left {
  top: 20px;
  left: 20px;
}

.position-bottom-right {
  bottom: 20px;
  right: 20px;
  flex-direction: column-reverse;
}

.position-bottom-left {
  bottom: 20px;
  left: 20px;
  flex-direction: column-reverse;
}

.position-top-center {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.position-bottom-center {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column-reverse;
}

/* Type variants - Ẩn nhãn text, chỉ hiển thị màu */
.toast-success {
  border-left: 4px solid #10b981;
}
.toast-success .toast-progress {
  background-color: #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}
.toast-error .toast-progress {
  background-color: #ef4444;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}
.toast-warning .toast-progress {
  background-color: #f59e0b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}
.toast-info .toast-progress {
  background-color: #3b82f6;
}

/* Animations */
@keyframes toast-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-animation-enter-active {
  animation: toast-in 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
}

.toast-animation-leave-active {
  animation: toast-out 0.35s cubic-bezier(0.06, 0.71, 0.55, 1) forwards;
}

@keyframes toast-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes progress-bar {
  0% {
    width: 100%;
  }
  100% {
    width: 0;
  }
}
</style>
