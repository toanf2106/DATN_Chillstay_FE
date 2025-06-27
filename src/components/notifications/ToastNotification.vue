<template>
  <div
    class="toast-notification"
    :class="[
      `toast-${notification.type}`,
      `toast-${notification.position || 'top-right'}`,
      { 'show': notification.visible }
    ]"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
  >
    <div class="toast-header">
      <i class="toast-icon" :class="iconClass"></i>
      <strong class="toast-title">{{ notification.title || typeTitle }}</strong>
      <div class="spacer"></div>
      <button
        v-if="notification.dismissible !== false"
        type="button"
        class="toast-close"
        @click="dismiss"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="toast-body">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';

export default {
  name: 'ToastNotification',
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const store = useNotificationStore();

    const iconClass = computed(() => {
      switch(props.notification.type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        default: return 'fas fa-info-circle';
      }
    });

    const typeTitle = computed(() => {
      switch(props.notification.type) {
        case 'success': return 'Thành công';
        case 'error': return 'Lỗi';
        case 'warning': return 'Cảnh báo';
        default: return 'Thông tin';
      }
    });

    const dismiss = () => {
      store.dismissNotification(props.notification.id);
    };

    return {
      iconClass,
      typeTitle,
      dismiss
    };
  }
}
</script>

<style scoped>
.toast-notification {
  min-width: 300px;
  max-width: 450px;
  background-color: #fff;
  color: #212529;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  z-index: 1050;
  border-left: 4px solid #ccc;
}

.toast-notification.show {
  opacity: 1;
  transform: translateY(0);
}

.toast-success {
  border-left-color: #28a745;
}

.toast-error {
  border-left-color: #dc3545;
}

.toast-warning {
  border-left-color: #ffc107;
}

.toast-info {
  border-left-color: #17a2b8;
}

.toast-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.toast-icon {
  margin-right: 10px;
  font-size: 1.1rem;
}

.toast-success .toast-icon {
  color: #28a745;
}

.toast-error .toast-icon {
  color: #dc3545;
}

.toast-warning .toast-icon {
  color: #ffc107;
}

.toast-info .toast-icon {
  color: #17a2b8;
}

.toast-title {
  font-weight: 600;
  color: #333;
}

.spacer {
  flex-grow: 1;
}

.toast-close {
  background: transparent;
  border: 0;
  font-size: 1.25rem;
  padding: 0;
  margin-left: 10px;
  opacity: 0.5;
  cursor: pointer;
}

.toast-close:hover {
  opacity: 1;
}

.toast-body {
  padding: 0.75rem;
  word-wrap: break-word;
}

/* Position styles */
.toast-top-right, .toast-top-left, .toast-top-center,
.toast-bottom-right, .toast-bottom-left, .toast-bottom-center {
  position: fixed;
  z-index: 1060;
}

.toast-top-right {
  top: 20px;
  right: 20px;
}

.toast-top-left {
  top: 20px;
  left: 20px;
}

.toast-top-center {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.toast-notification.toast-top-center.show {
  transform: translateX(-50%);
}

.toast-bottom-right {
  bottom: 20px;
  right: 20px;
}

.toast-bottom-left {
  bottom: 20px;
  left: 20px;
}

.toast-bottom-center {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.toast-notification.toast-bottom-center.show {
  transform: translateX(-50%);
}
</style>
