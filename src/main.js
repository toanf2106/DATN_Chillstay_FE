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
});

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
