import { useNotificationStore } from '@/stores/notificationStore';

// Utility service cho notification
const notification = {
  /**
   * Hiển thị thông báo thành công
   * @param {string} message - Nội dung thông báo
   * @param {Object} options - Tùy chọn thêm
   * @returns {number} ID của notification
   */
  success(message, options = {}) {
    const store = useNotificationStore();
    return store.success(message, options);
  },

  /**
   * Hiển thị thông báo lỗi
   * @param {string} message - Nội dung thông báo
   * @param {Object} options - Tùy chọn thêm
   * @returns {number} ID của notification
   */
  error(message, options = {}) {
    const store = useNotificationStore();
    return store.error(message, options);
  },

  /**
   * Hiển thị thông báo cảnh báo
   * @param {string} message - Nội dung thông báo
   * @param {Object} options - Tùy chọn thêm
   * @returns {number} ID của notification
   */
  warning(message, options = {}) {
    const store = useNotificationStore();
    return store.warning(message, options);
  },

  /**
   * Hiển thị thông báo thông tin
   * @param {string} message - Nội dung thông báo
   * @param {Object} options - Tùy chọn thêm
   * @returns {number} ID của notification
   */
  info(message, options = {}) {
    const store = useNotificationStore();
    return store.info(message, options);
  },

  /**
   * Hiển thị modal alert
   * @param {Object} options - Các tùy chọn cho modal
   * @returns {Promise} Promise sẽ resolve khi người dùng xác nhận hoặc reject khi bấm hủy
   */
  alert(options = {}) {
    return new Promise((resolve) => {
      const store = useNotificationStore();
      const id = store.showNotification({
        ...options,
        type: options.type || 'info',
        isModal: true
      });

      // Remove ID từ store khi modal được đóng
      const unsubscribe = store.$onAction(({ name, args, after }) => {
        if (name === 'dismissNotification' && args[0] === id) {
          after(() => {
            unsubscribe();
            resolve();
          });
        }
      });
    });
  },

  /**
   * Hiển thị confirm dialog
   * @param {Object} options - Các tùy chọn cho confirm dialog
   * @returns {Promise} Promise sẽ resolve(true) khi xác nhận hoặc resolve(false) khi hủy
   */
  confirm(options = {}) {
    return new Promise((resolve) => {
      // Tạm thời dùng confirm mặc định của trình duyệt
      const result = window.confirm(options.message || 'Xác nhận?');
      resolve(result);

      // TODO: Implement confirm dialog with custom UI
    });
  }
};

export default notification;
