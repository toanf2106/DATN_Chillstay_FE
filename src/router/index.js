import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import about from '../views/AboutView.vue'
import ThongKe from '../views/Admin/ThongKe.vue'
import DatHomestay from '../views/Admin/DatHome.vue'
import TestThanhToan from '../views/testThanhToan.vue'

import ForgotPasswordForm from '../components/Password.vue'
import EmailConfirmView from '../views/EmailConfirmView.vue'
import PaymentSuccessView from '../views/PaymentSuccessView.vue'

import DetailHome from '../views/DetailHome.vue'
import AllHomestaysView from '../views/AllHomestaysView.vue'

import BookingView from '../views/BookingView.vue'

import NewsView from '../views/NewsView.vue'
import NewsDetailView from '../views/NewsDetailView.vue'
import QlyLoaiPhong from '@/views/Admin/Home/QlyLoaiPhong.vue'
import QlyVatTuPhong from '@/views/Admin/Home/QlyVatTuPhong.vue'
import QlyPhong from '@/views/Admin/Home/QlyPhong.vue'
import DanhGiaView from '../views/DanhGiaView.vue'
import PublicReviewDetails from '../views/Admin/NoiDung&DanhGia/ReviewDetails.vue';


import { useAuthStore } from '../stores/authStore'

const TaiKhoanView = () => import('../views/TaiKhoanView.vue');
const ThongTinTaiKhoan = () => import('../views/TaiKhoan/ThongTinTaiKhoan.vue');
const CaiDatBaoMat = () => import('../views/TaiKhoan/CaiDatBaoMat.vue');
const LichSuDatPhong = () => import('../views/TaiKhoan/LichSuDatPhong.vue');
const DanhGiaCuaBan = () => import('../views/TaiKhoan/DanhGiaCuaBan.vue');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: about },
    { path: '/booking/:id', name: 'booking', component: BookingView },
    { path: '/all-homestays', name: 'allHomestays', component: AllHomestaysView },
    { path: '/danh-gia', name: 'danh-gia', component: DanhGiaView },
    { path: '/danh-gia/:homestayId', name: 'public-review-details', component: PublicReviewDetails, props: true },

    // Thanh toán
    { path: '/payment-success', name: 'payment-success', component: PaymentSuccessView },
    { path: '/payment-failure', name: 'payment-failure', component: () => import('../views/PaymentFailureView.vue') },

    { path: '/test-thanh-toan', name: 'testThanhToan', component: TestThanhToan },


    { path: '/homestay/:id', name: 'homestayDetail', component: DetailHome },

    { path: '/tin-tuc', name: 'news', component: NewsView },
    { path: '/tin-tuc/:id', name: 'newsDetail', component: NewsDetailView },



    // Route cho quên mật khẩu và đặt lại mật khẩu
    { path: '/quen-mat-khau', name: 'forgot-password', component: ForgotPasswordForm },
    { path: '/dat-lai-mat-khau', name: 'reset-password', component: ForgotPasswordForm },

    // Route cho xác nhận email
    { path: '/xac-nhan-tai-khoan', name: 'email-confirm', component: EmailConfirmView },

    {
      path: '/tai-khoan',
      component: TaiKhoanView,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/tai-khoan/thong-tin' },
        { path: 'thong-tin', name: 'tai-khoan-thong-tin', component: ThongTinTaiKhoan },
        { path: 'bao-mat', name: 'tai-khoan-bao-mat', component: CaiDatBaoMat },
        { path: 'lich-su-dat-phong', name: 'tai-khoan-lich-su', component: LichSuDatPhong },
        { path: 'lich-su-dat-phong/:id', name: 'booking-detail', component: () => import('../views/BookingDetailView.vue'), props: true },
        // Nâng cấp route: Thêm tham số customerId tùy chọn
        // /danh-gia -> xem đánh giá của mình
        // /danh-gia/5 -> xem đánh giá của khách hàng có ID là 5
        { path: 'danh-gia/:customerId?', name: 'tai-khoan-danh-gia', component: DanhGiaCuaBan, props: true },
      ],
    },

    // Các route cho Admin
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('../views/Admin/AdminDashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        // Dashboard - Trang chính quản trị
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/Admin/ThongKe.vue'),
        },

        // Quản lý Homestay - Thông tin chung về homestay
        {
          path: 'homestay',
          name: 'admin-homestay',
          component: () => import('../views/Admin/Home/QlyHomestay.vue'),
        },

        // Quản lý Loại Homestay
        {
          path: 'loai-homestay',
          name: 'admin-loai-homestay',
          component: () => import('../views/Admin/Home/QlyLoaiHomestay.vue'),
        },

        {
          path: 'qly-loai-phong',
          name: 'admin-qly-loai-phong',
          component: QlyLoaiPhong,
        },

        // Quản lý Tiện nghi Homestay
        {
          path: 'homestay-tien-nghi',
          name: 'admin-homestay-tien-nghi',
          component: () => import('../views/Admin/Home/QlyHomestayTienNghi.vue'),
        },

        // Quản lý Dịch vụ Homestay
        {
          path: 'homestay-dich-vu',
          name: 'admin-homestay-dich-vu',
          component: () => import('../views/Admin/Home/QlyHomestayDichVu.vue'),
        },

        // Alias cho URL tien-nghi-homestay
        {
          path: 'tien-nghi-homestay',
          redirect: { name: 'admin-homestay-tien-nghi' },
        },


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

        // DatHomeADM - Chi tiết quản lý đặt homestay
        {
          path: 'dat-homestay-adm',
          name: 'DatHomeADM',
          component: () => import('../views/Admin/DatHomeADM.vue'),
        },

        // Các route quản lý Homestay
        // Quản lý Vật tư - Thông tin về vật tư, thiết bị trong homestay
        {
          path: 'homestay/vattu',
          name: 'admin-homestay-vattu',
          component: () => import('../views/Admin/Home/VatTu.vue'),
        },

        // Quản lý Vật tư Phòng - Thông tin về vật tư trong phòng
        {
          path: 'homestay/vattu-phong',
          name: 'admin-vattu-phong',
          component: QlyVatTuPhong,
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

        // Chi tiết tài khoản
        {
          path: 'taikhoan/:id',
          name: 'admin-account-detail',
          component: () => import('../views/Admin/ChiTietTaiKhoanAdm.vue'),
          props: true
        },

        // Quản lý Đánh giá - Các đánh giá được sử dụng trong homestay
        {
          path: 'content/danhgia',
          name: 'admin-danh-gia',
          component: () => import('../views/Admin/NoiDung&DanhGia/DanhGia.vue'),
        },

        {
          path: 'danh-gia/:homestayId',
          name: 'ReviewDetails',
          component: () => import('../views/Admin/NoiDung&DanhGia/ReviewDetails.vue'),
          props: true
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

        // Trang test thanh toán
        {
          path: 'test-thanh-toan',
          name: 'admin-test-thanh-toan',
          component: TestThanhToan,
        },

        // Thêm route cho QlyPhong trong phần admin routes
        {
          path: '/admin/phong',
          name: 'admin-phong',
          component: QlyPhong,
          meta: {
            requiresAuth: true,
            requiresAdmin: true
          }
        },

          {
            path: '',
            name: 'admin-welcome',
            component: () => import('../components/Welcome.vue'), // Trang welcome admin
          },

          {
            path: '/admin/phuphi',
            name: 'admin-phuphi',
            component: () => import('../views/Admin/PhuPhi.vue'),
          },
        // Chuyển hướng mặc định về trang thống kê
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
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // Sử dụng authStore thay vì truy cập trực tiếp localStorage
    const authStore = useAuthStore()

    // Kiểm tra trạng thái đăng nhập từ store
    if (!authStore.isLoggedIn) {
      console.log('Chưa đăng nhập, chuyển hướng về trang chủ')
      next('/')
      return
    }

    // Kiểm tra quyền admin từ store
    if (to.meta.isAdmin && !authStore.hasAdminAccess) {
      console.log('Không có quyền admin, chuyển hướng về trang chủ')
      next('/')
      return
    }

    // Nếu đã đăng nhập và có quyền phù hợp
    next()
  } else {
    next()
  }
})

export default router
