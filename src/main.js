import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import NotificationContainer from './components/notifications/NotificationContainer.vue'
import notification from './utils/notification'
import { setupModalErrorHandling } from './utils/modalHelper'

const app = createApp(App)
library.add(fas, far)
app.component('font-awesome-icon', FontAwesomeIcon)


const pinia = createPinia()
app.use(pinia)

app.use(router)

app.config.globalProperties.$notification = notification

// Trợ giúp modal toàn ứng dụng
app.config.globalProperties.$modalHelper = {
  cleanupModals: () => {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}

// Thiết lập xử lý lỗi modal cho toàn ứng dụng
setupModalErrorHandling();

// Patch để bảo vệ khỏi lỗi DOM insertBefore và properties of null
const originalInsert = Element.prototype.insertBefore;
Element.prototype.insertBefore = function(newNode, referenceNode) {
  try {
    if (!this || !newNode) {
      console.warn('insertBefore bị gọi với đối tượng null hoặc undefined');
      return null;
    }
    return originalInsert.call(this, newNode, referenceNode);
  } catch (error) {
    console.warn('Bắt được lỗi trong insertBefore:', error);
    return null;
  }
};

// Thêm một "mạng lưới an toàn" để bắt và xử lý các lỗi modal kẹt
document.addEventListener('DOMContentLoaded', () => {
  // Kiểm tra và dọn dẹp backdrop nếu có màn hình đen mà không có modal
  setInterval(() => {
    const hasBackdrop = document.querySelectorAll('.modal-backdrop').length > 0;
    const hasModal = document.querySelector('.modal.show');

    if (hasBackdrop && !hasModal) {
      app.config.globalProperties.$modalHelper.cleanupModals();
    }
  }, 2000); // Kiểm tra mỗi 2 giây

  // Thiết lập kiểm tra các phần tử DOM trong modal auth
  setInterval(() => {
    const authModal = document.getElementById('authModal');
    if (authModal) {
      const loginForm = document.getElementById('loginForm');
      const signupForm = document.getElementById('signupForm');
      const forgotPasswordForm = document.getElementById('forgotPasswordForm');

      if (!loginForm || !signupForm || !forgotPasswordForm) {
        console.warn('Phát hiện modal auth thiếu form con. Khởi tạo lại...');
        if (authModal.style.display === 'block' || authModal.classList.contains('modal-active')) {
          // Ẩn modal nếu nó đang hiển thị
          authModal.style.display = 'none';
          authModal.classList.remove('modal-active');
        }
      }
    }
  }, 1000);
});

// Xử lý các lỗi Vue toàn cục
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err);
  console.log('Error info:', info);

  // Xử lý các lỗi DOM không tìm thấy phần tử
  if (err && (
    err.message.includes('Cannot read properties of null') ||
    err.message.includes('Cannot set properties of null')
  )) {
    console.warn('Đã phát hiện lỗi DOM null. Làm mới trạng thái...');
  }
};

app.mount('#app')

const notificationContainer = createApp(NotificationContainer)
notificationContainer.use(pinia)
notificationContainer.mount(
  (() => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    return container
  })()
)
