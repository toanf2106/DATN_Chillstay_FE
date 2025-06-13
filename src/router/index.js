import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import about from '../views/AboutView.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import ThongKe from '../views/Admin/ThongKe.vue'
import DatHomestay from '../views/Admin/DatHome.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: about },

    // Các route cho Admin
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { requiresAuth: true, isAdmin: true },
      children: [
        // Thống kê - Hiển thị dữ liệu tổng quan
        {
          path: 'thong-ke',
          name: 'admin-thong-ke',
          component: ThongKe,
        },

        // Đặt homestay - Quản lý đặt phòng
        {
          path: 'dat-homestay',
          name: 'admin-dat-homestay',
          component: DatHomestay,
        },

        // Các route quản lý Homestay
        // Quản lý Homestay - Thông tin chung về homestay
        {
          path: 'homestay',
          name: 'admin-homestay',
          component: () => import('../views/Admin/Home/QlyHomestay.vue'),
        },

        // Quản lý Phòng - Thông tin về các phòng trong homestay
        {
          path: 'homestay/phong',
          name: 'admin-homestay-phong',
          component: () => import('../views/Admin/Home/QlyPhong.vue'),
        },

        // Quản lý Vật tư - Thông tin về vật tư, thiết bị trong homestay
        {
          path: 'homestay/vattu',
          name: 'admin-homestay-vattu',
          component: () => import('../views/Admin/Home/VatTu.vue'),
        },

        // Quản lý Tiện nghi - Các tiện nghi cung cấp cho khách hàng
        {
          path: 'homestay/tiennghi',
          name: 'admin-homestay-tiennghi',
          component: () => import('../views/Admin/Home/TienNghi.vue'),
        },

        // Quản lý Dịch vụ - Các dịch vụ bổ sung trong homestay
        {
          path: 'homestay/dichvu',
          name: 'admin-homestay-dichvu',
          component: () => import('../views/Admin/Home/DichVu.vue'),
        },

        // Quản lý Voucher - Các voucher được sử dụng trong homestay
        {
          path: 'voucher',
          name: 'admin-voucher',
          component: () => import('../views/Admin/QlyVoucher.vue'),
        },

        // Quản lý Nhân viên - Các nhân viên được sử dụng trong homestay
        {
          path: 'User/nhanvien',
          name: 'admin-nhan-vien',
          component: () => import('../views/Admin/User/NhanVien.vue'),
        },

        // Quản lý Khách hàng -U Các khách hàng được sử dụng trong homestay
        {
          path: 'user/khachhang',
          name: 'admin-khach-hang',
          component: () => import('../views/Admin/User/KhachHang.vue'),
        },

        // Quản lý Tài khoản - Các tài khoản được sử dụng trong homestay
        {
          path: 'taikhoan',
          name: 'admin-tai-khoan',
          component: () => import('../views/Admin/AccountT.vue'),
        },

        // Quản lý Đánh giá - Các đánh giá được sử dụng trong homestay
        {
          path: 'content/danhgia',
          name: 'admin-danh-gia',
          component: () => import('../views/Admin/NoiDung&DanhGia/DanhGia.vue'),
        },

        // Quản lý Tin tức - Các tin tức được sử dụng trong homestay
        {
          path: 'content/tintuc',
          name: 'admin-tin-tuc',
          component: () => import('../views/Admin/NoiDung&DanhGia/TinTuc.vue'),
        },

        // Quản lý Thanh toán - Các thanh toán được sử dụng trong homestay
        {
          path: 'thanhtoan',
          name: 'admin-thanh-toan',
          component: () => import('../views/Admin/ThanhToan.vue'),
        },

        // Chuyển hướng mặc định về trang thống kê
        {
          path: '',
          redirect: { name: 'admin-thong-ke' },
        },
      ],
    },

    // Chuyển hướng từ đường dẫn admin-dashboard cũ đến admin mới
    {
      path: '/admin-dashboard',
      redirect: { name: 'admin' },
    },

    // Chuyển hướng từ đường dẫn thong-ke cũ đến admin-thong-ke mới
    {
      path: '/thong-ke',
      redirect: { name: 'admin-thong-ke' },
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
