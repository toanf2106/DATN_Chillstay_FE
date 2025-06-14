import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import NotificationContainer from './components/notifications/NotificationContainer.vue'
import notification from './utils/notification'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

app.use(router)

app.config.globalProperties.$notification = notification

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
