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
  const selectedStatus = ref('all')

  // Computed property cho vouchers đã được lọc
  const filteredVouchers = computed(() => {
    const currentDate = new Date()

    return vouchers.value.filter(voucher => {
      const endDate = new Date(voucher.ngayKetThuc)
      const isExpired = endDate < currentDate
      const isActive = voucher.trangThai

      switch (selectedStatus.value) {
        case 'valid':
          return isActive && !isExpired
        case 'expired':
          return !isActive || isExpired
        default:
          return true
      }
    })
  })

  // Computed property for displayed page numbers
  const displayedPages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value + 1
    const range = 2

    let start = Math.max(1, current - range)
    let end = Math.min(total, current + range)

    if (current - range > 1) {
      start = Math.max(1, end - (range * 2))
    }
    if (current + range < total) {
      end = Math.min(total, start + (range * 2))
    }

    return Array.from({length: end - start + 1}, (_, i) => start + i)
  })

  // Methods
  const loadVouchers = async () => {
    try {
      let params = {
        page: currentPage.value,
        size: pageSize.value,
        status: selectedStatus.value
      };

      // Chỉ thêm searchTerm vào params nếu có giá trị
      if (searchTerm.value && searchTerm.value.trim() !== '') {
        params.searchTerm = searchTerm.value.trim();
      }

      console.log('Sending request with params:', params);

      const response = await axios.get('/api/giamgia', {
        params: params
      });

      console.log('Response data:', response.data);

      if (response.data.content) {
        vouchers.value = response.data.content;
        totalPages.value = response.data.totalPages;
        totalElements.value = response.data.totalElements;
      } else {
        vouchers.value = response.data;
        totalElements.value = response.data.length;
        totalPages.value = Math.ceil(totalElements.value / pageSize.value);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách voucher:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      vouchers.value = [];
      totalPages.value = 0;
      totalElements.value = 0;
    }
  };

  const handleSearch = () => {
    // Thêm log để debug
    console.log('Original search term:', searchTerm.value);

    // Chuẩn hóa searchTerm trước khi gửi
    if (searchTerm.value) {
      const term = searchTerm.value.trim().toLowerCase();
      console.log('Trimmed search term:', term);
    }

    // Tìm kiếm thông thường
    currentPage.value = 0;
    loadVouchers();
  };

  const handleStatusChange = (status) => {
    selectedStatus.value = status
    currentPage.value = 0
    loadVouchers()
  }

  const handlePageSizeChange = () => {
    currentPage.value = 0
    loadVouchers()
  }

  const changePage = (page) => {
    if (page >= 0 && page < totalPages.value) {
      currentPage.value = page
      loadVouchers()
    }
  }

  const openAddModal = () => {
    isEdit.value = false
    selectedVoucher.value = null
    showModal.value = true
  }

  const editVoucher = (voucher) => {
    isEdit.value = true
    selectedVoucher.value = { ...voucher }
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    selectedVoucher.value = null
  }

  const saveVoucher = async (voucherData) => {
    try {
      if (isEdit.value) {
        const response = await axios.put(`/api/giamgia/${voucherData.id}`, voucherData)
        if (response.data) {
          toast.success('Cập nhật mã giảm giá thành công')
          closeModal()
          await loadVouchers()
        }
      } else {
        const response = await axios.post('/api/giamgia', voucherData)
        if (response.data) {
          toast.success('Thêm mã giảm giá thành công')
          closeModal()
          await loadVouchers()
        }
      }
    } catch (error) {
      console.error('Error saving voucher:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu mã giảm giá'
      toast.error(errorMessage)
      throw error
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
    console.log('Formatting loaiGiamGia:', loai);
    if (!loai) return '';
    if (loai === 'Phần trăm' || loai === 'PhanTram') return 'Phần trăm';
    if (loai === 'Số tiền' || loai === 'SoTien') return 'Số tiền';
    return loai;
  }

  const formatGiaTri = (giaTri, loai) => {
    if (loai === 'Phần trăm' || loai === 'PhanTram') {
      return `${giaTri}%`;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(giaTri);
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

  onMounted(() => {
    loadVouchers()
  })

  return {
    // State
    vouchers: filteredVouchers,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    searchTerm,
    showModal,
    selectedVoucher,
    isEdit,
    displayedPages,
    selectedStatus,

    // Methods
    handleSearch,
    handleStatusChange,
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
