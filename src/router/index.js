import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import about from '../views/AboutView.vue'
import AdminDashboard from '../components/AdminDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: about },
    {
      path: '/admin-dashboard',
      name: 'admin-dashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true }, // Đánh dấu route này yêu cầu xác thực
    },
  ],
})

// Navigation guard để bảo vệ route admin
router.beforeEach((to, from, next) => {
  // Nếu route yêu cầu xác thực
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // Kiểm tra xem người dùng đã đăng nhập chưa (có thể sử dụng localStorage hoặc vuex)
    const isAdmin = localStorage.getItem('isAdmin')

    if (!isAdmin) {
      // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
      next('/')
    } else {
      // Nếu đã đăng nhập, cho phép truy cập
      next()
    }
  } else {
    // Nếu route không yêu cầu xác thực, cho phép truy cập
    next()
  }
})

export default router
