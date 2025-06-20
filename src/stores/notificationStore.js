import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const nextId = ref(0)

  /**
   * Hiển thị thông báo
   * @param {Object} notification - Thông tin thông báo
   * @param {string} notification.message - Nội dung thông báo
   * @param {string} notification.type - Loại thông báo (success, error, warning, info)
   * @param {number} notification.duration - Thời gian hiển thị (ms)
   * @param {string} notification.position - Vị trí (top-right, top-left, bottom-right, bottom-left, top-center, bottom-center)
   * @param {boolean} notification.dismissible - Có thể đóng thủ công không
   */
  function showNotification({
    message,
    type = 'info',
    duration = 5000,
    position = 'top-right',
    dismissible = true
  }) {
    const id = nextId.value++

    const notification = {
      id,
      message,
      type,
      position,
      dismissible,
      visible: true
    }

    notifications.value.push(notification)

    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id)
      }, duration)
    }

    return id
  }

  function dismissNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      // Đánh dấu notification để hiện animation biến mất
      notifications.value[index].visible = false

      // Sau khi animation kết thúc, xóa notification khỏi mảng
      setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.id !== id)
      }, 300) // Thời gian animation
    }
  }

  function clearAll() {
    notifications.value = []
  }

  // Các hàm tiện ích
  function success(message, options = {}) {
    return showNotification({ message, type: 'success', ...options })
  }

  function error(message, options = {}) {
    return showNotification({ message, type: 'error', ...options })
  }

  function warning(message, options = {}) {
    return showNotification({ message, type: 'warning', ...options })
  }

  function info(message, options = {}) {
    return showNotification({ message, type: 'info', ...options })
  }

  function confirm({ message }) {
    return new Promise((resolve) => {
      const confirmed = window.confirm(message)
      resolve(confirmed)
    })
  }

  function showToast(message, type = 'success', duration = 3000) {
    const id = Date.now();
    notifications.value.push({
      id,
      message,
      type,
      duration
    });

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  function removeToast(id) {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  }

  return {
    notifications,
    showNotification,
    dismissNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    confirm,
    showToast,
    removeToast
  }
})

// Composable để sử dụng trong các component
export function useToast() {
  const store = useNotificationStore();

  return {
    success: store.success.bind(store),
    error: store.error.bind(store),
    warning: store.warning.bind(store),
    info: store.info.bind(store)
  };
}
