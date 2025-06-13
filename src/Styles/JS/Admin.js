import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Offcanvas } from 'bootstrap'

export function useAdminDashboard() {
  const router = useRouter()
  const route = useRoute()

  const isSubmenuOpen = ref({
    nguoiDung: false,
    datHome: false,
    noiDung: false
  })

  const isUserMenuActive = computed(() => {
    return isRouteActive('admin-nhan-vien') || isRouteActive('admin-khach-hang')
  })

  const isBookingMenuActive = computed(() => {
    return route.name && route.name.toString().startsWith('admin-dat-home')
  })

  const isContentMenuActive = computed(() => {
    return isRouteActive('admin-tin-tuc') || isRouteActive('admin-danh-gia')
  })

  function isRouteActive(routeName) {
    return route.name === routeName
  }

  function navigateTo(routeName) {
    router.push({ name: routeName })

    // Đóng offcanvas trên mobile và xóa backdrop
    closeOffcanvasAndRemoveBackdrop()
  }

  function closeOffcanvasAndRemoveBackdrop() {
    const sidebarEl = document.getElementById('sidebarOffcanvas')
    if (sidebarEl) {
      const bsOffcanvas = Offcanvas.getInstance(sidebarEl)
      if (bsOffcanvas) {
        bsOffcanvas.hide()

        // Sau khi ẩn offcanvas, xóa backdrop
        nextTick(() => {
          const backdrop = document.querySelector('.offcanvas-backdrop')
          if (backdrop) {
            backdrop.remove()
          }
          document.body.classList.remove('overflow-hidden')
          document.body.style.paddingRight = ''
        })
      }
    }
  }

  function toggleSubmenu(submenu) {
    isSubmenuOpen.value[submenu] = !isSubmenuOpen.value[submenu]
  }

  function toggleSidebar() {
    const sidebarEl = document.getElementById('sidebarOffcanvas')
    if (sidebarEl) {
      const bsOffcanvas = Offcanvas.getInstance(sidebarEl) || new Offcanvas(sidebarEl)
      bsOffcanvas.toggle()
    }
  }

  function logout() {
    // Xóa trạng thái đăng nhập
    localStorage.removeItem('isAdmin')

    // Thông báo đăng xuất thành công
    alert('Đăng xuất thành công!')

    // Chuyển hướng về trang chủ
    router.push('/')
  }

  // Thêm Font Awesome
  function setupFontAwesome() {
    if (!document.getElementById('font-awesome')) {
      const link = document.createElement('link')
      link.id = 'font-awesome'
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
      document.head.appendChild(link)
    }
  }

  // Xử lý sự kiện khi offcanvas được ẩn để đảm bảo backdrop được xóa
  function setupOffcanvasListeners() {
    const sidebarEl = document.getElementById('sidebarOffcanvas')
    if (sidebarEl) {
      sidebarEl.addEventListener('hidden.bs.offcanvas', () => {
        const backdrop = document.querySelector('.offcanvas-backdrop')
        if (backdrop) {
          backdrop.remove()
        }
        document.body.classList.remove('overflow-hidden')
        document.body.style.paddingRight = ''
      })
    }
  }

  // Mở submenu dựa trên route hiện tại
  function setupActiveSubmenu() {
    if (isUserMenuActive.value) {
      isSubmenuOpen.value.nguoiDung = true
    } else if (isBookingMenuActive.value) {
      isSubmenuOpen.value.datHome = true
    } else if (isContentMenuActive.value) {
      isSubmenuOpen.value.noiDung = true
    }
  }

  onMounted(() => {
    setupFontAwesome()
    setupOffcanvasListeners()
    setupActiveSubmenu()
  })

  return {
    isSubmenuOpen,
    isUserMenuActive,
    isBookingMenuActive,
    isContentMenuActive,
    isRouteActive,
    navigateTo,
    toggleSubmenu,
    toggleSidebar,
    logout
  }
}
