import { ref, onMounted, computed } from 'vue'
import { useToast } from '@/stores/notificationStore'
import axios from '@/utils/api'

export const useVoucherManagement = () => {
  const toast = useToast()
  const vouchers = ref([])
  const currentPage = ref(0)
  const pageSize = ref(10)
  const totalPages = ref(0)
  const totalElements = ref(0)
  const searchTerm = ref('')
  const showModal = ref(false)
  const selectedVoucher = ref(null)
  const isEdit = ref(false)

  // Computed property for displayed page numbers
  const displayedPages = computed(() => {
    const pages = []
    const maxPages = 5 // Maximum number of page links to show
    let start = Math.max(1, currentPage.value - Math.floor(maxPages / 2))
    let end = Math.min(totalPages.value, start + maxPages - 1)

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  })

  // Methods
  const loadVouchers = async () => {
    try {
      const params = {
        page: currentPage.value,
        size: pageSize.value
      }
      if (searchTerm.value) {
        params.tenGiamGia = searchTerm.value
      }

      const response = await axios.get('/api/giamgia', { params })
      if (response.data.content) {
        // Paginated response
        vouchers.value = response.data.content
        totalPages.value = response.data.totalPages
        totalElements.value = response.data.totalElements
      } else {
        // List response
        vouchers.value = response.data
        totalPages.value = Math.ceil(response.data.length / pageSize.value)
        totalElements.value = response.data.length
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách mã giảm giá')
      console.error('Error loading vouchers:', error)
    }
  }

  const handleSearch = () => {
    currentPage.value = 0 // Reset to first page when searching
    loadVouchers()
  }

  const handlePageSizeChange = () => {
    currentPage.value = 0 // Reset to first page when changing page size
    loadVouchers()
  }

  const changePage = (page) => {
    if (page >= 0 && page < totalPages.value) {
      currentPage.value = page
      loadVouchers()
    }
  }

  const openAddModal = () => {
    selectedVoucher.value = {
      tenGiamGia: '',
      loaiGiamGia: 'PhanTram',
      giaTri: 0,
      giaTriToiThieu: 0,
      ngayBatDau: null,
      ngayKetThuc: null,
      soLuong: 0,
      trangThai: true
    }
    isEdit.value = false
    showModal.value = true
  }

  const editVoucher = (voucher) => {
    selectedVoucher.value = { ...voucher }
    isEdit.value = true
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    selectedVoucher.value = null
  }

  const saveVoucher = async (voucherData) => {
    try {
      if (isEdit.value) {
        // Tạo object mới cho update request, loại bỏ maGiamGia
        const { maGiamGia, ...updateData } = voucherData

        // Log the data being sent
        console.log('Updating voucher with data:', updateData)

        const response = await axios.put(`/api/giamgia/${updateData.id}`, updateData)
        if (response.data) {
          toast.success('Cập nhật mã giảm giá thành công')
          closeModal()
          await loadVouchers() // Refresh the list after successful update
        } else {
          throw new Error('Không nhận được phản hồi từ server')
        }
      } else {
        // Log the data being sent
        console.log('Creating new voucher with data:', voucherData)

        const response = await axios.post('/api/giamgia', voucherData)
        if (response.data) {
          toast.success('Thêm mã giảm giá thành công')
          closeModal()
          await loadVouchers() // Refresh the list after successful creation
        } else {
          throw new Error('Không nhận được phản hồi từ server')
        }
      }
    } catch (error) {
      console.error('Error saving voucher:', error)
      const errorMessage = error.response?.data?.message
        || error.message
        || 'Có lỗi xảy ra khi lưu mã giảm giá'
      toast.error(errorMessage)
      throw error // Re-throw to handle in the modal if needed
    }
  }

  const deleteVoucher = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      try {
        await axios.delete(`/api/giamgia/${id}`)
        toast.success('Xóa mã giảm giá thành công')
        loadVouchers()
      } catch (error) {
        toast.error('Lỗi khi xóa mã giảm giá')
        console.error('Error deleting voucher:', error)
      }
    }
  }

  const formatLoaiGiamGia = (loai) => {
    return loai === 'PhanTram' ? 'Phần trăm' : 'Số tiền'
  }

  const formatGiaTri = (giaTri, loai) => {
    if (loai === 'PhanTram') {
      return `${giaTri}%`
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(giaTri)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

  onMounted(() => {
    loadVouchers()
  })

  return {
    // State
    vouchers,
    currentPage,
    pageSize,
    totalPages,
    searchTerm,
    showModal,
    selectedVoucher,
    isEdit,
    displayedPages,

    // Methods
    handleSearch,
    handlePageSizeChange,
    changePage,
    openAddModal,
    editVoucher,
    closeModal,
    saveVoucher,
    deleteVoucher,
    formatLoaiGiamGia,
    formatGiaTri,
    formatDate
  }
}
