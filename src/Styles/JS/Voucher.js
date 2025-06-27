import { ref, onMounted, computed, watch } from 'vue'
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
  const selectedHomeStay = ref('')
  const isLoading = ref(false)

  // Biến cho modal chi tiết voucher
  const showDetailModal = ref(false)
  const detailVoucher = ref(null)
  const loadingDetail = ref(false)

  // Debug watcher for showModal
  watch(showModal, (newVal) => {
    console.log('showModal changed to:', newVal)
  })

  // Computed property cho vouchers đã được lọc
  const filteredVouchers = computed(() => {
    console.log('Computing filteredVouchers, total:', vouchers.value.length)
    const currentDate = new Date()

    return vouchers.value.filter(voucher => {
      const endDate = new Date(voucher.ngayKetThuc);
      const isExpired = endDate < currentDate;
      const isActive = voucher.trangThai;

      // Kiểm tra trạng thái (còn hạn / hết hạn)
      let statusPass;
      switch (selectedStatus.value) {
        case 'valid':
          statusPass = isActive && !isExpired;
          break;
        case 'expired':
          statusPass = !isActive || isExpired;
          break;
        default:
          statusPass = true;
      }

      // Kiểm tra bộ lọc homestay
      const homestayPass = selectedHomeStay.value === '' || String(voucher.homeStayId) === String(selectedHomeStay.value);

      return statusPass && homestayPass;
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
      isLoading.value = true
      console.log('Loading vouchers...')
      let params = {
        page: currentPage.value,
        size: pageSize.value,
        status: selectedStatus.value
      };

      if (selectedHomeStay.value !== '') {
        params.homeStayId = selectedHomeStay.value;
      }

      // Chỉ thêm searchTerm vào params nếu có giá trị
      if (searchTerm.value && searchTerm.value.trim() !== '') {
        params.searchTerm = searchTerm.value.trim();
      }

      console.log('Sending request with params:', params);

      const response = await axios.get('/api/giamgia', {
        params: params
      });

      console.log('Response data:', response.data);

      if (response.data && response.data.content) {
        vouchers.value = response.data.content;
        totalPages.value = response.data.totalPages;
        totalElements.value = response.data.totalElements;
      } else if (Array.isArray(response.data)) {
        vouchers.value = response.data;
        totalElements.value = response.data.length;
        totalPages.value = Math.ceil(totalElements.value / pageSize.value);
      } else {
        console.error('Unexpected response format:', response.data);
        vouchers.value = [];
        totalElements.value = 0;
        totalPages.value = 0;
      }
      console.log('Loaded vouchers:', vouchers.value.length);
    } catch (error) {
      console.error('Lỗi khi tải danh sách voucher:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      vouchers.value = [];
      totalPages.value = 0;
      totalElements.value = 0;
      toast.error('Không thể tải danh sách voucher. Vui lòng thử lại sau.');
    } finally {
      isLoading.value = false
    }
  };

  const handleSearch = () => {
    // Thêm log để debug
    console.log('Search term:', searchTerm.value);
    currentPage.value = 0;
    loadVouchers();
  };

  const handleStatusChange = (status) => {
    console.log('Status changed to:', status);
    selectedStatus.value = status
    currentPage.value = 0
    loadVouchers()
  }

  const handleHomeStayChange = (homeStayId) => {
    console.log('Homestay changed to:', homeStayId);
    selectedHomeStay.value = homeStayId;
    currentPage.value = 0;
    loadVouchers();
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
    console.log('Opening add modal');
    isEdit.value = false;
    selectedVoucher.value = null;
    showModal.value = true;
    console.log('showModal after open:', showModal.value);

    // Force a DOM update
    setTimeout(() => {
      console.log('showModal after timeout:', showModal.value);
    }, 0);
  }

  const editVoucher = (voucher) => {
    console.log('Opening edit modal for voucher:', voucher);
    isEdit.value = true;
    selectedVoucher.value = { ...voucher };
    showModal.value = true;
    console.log('showModal after edit:', showModal.value);

    // Force a DOM update
    setTimeout(() => {
      console.log('showModal after timeout:', showModal.value);
    }, 0);
  }

  const closeModal = () => {
    console.log('Closing modal');
    showModal.value = false;
    setTimeout(() => {
      selectedVoucher.value = null;
    }, 300); // Delay to allow animation to complete
    console.log('showModal after close:', showModal.value);
  }

  const saveVoucher = async (voucherData) => {
    try {
      console.log('Saving voucher data:', voucherData);
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
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  }

  // Mở modal chi tiết voucher
  const viewVoucherDetail = async (voucher) => {
    try {
      loadingDetail.value = true
      detailVoucher.value = {...voucher} // Hiển thị dữ liệu cơ bản trước
      showDetailModal.value = true

      // Gọi API để lấy chi tiết đầy đủ
      const response = await axios.get(`/api/giamgia/detail/${voucher.id}`)
      if (response.data && response.data.success) {
        detailVoucher.value = response.data.voucher
      }
    } catch (error) {
      console.error('Error fetching voucher details:', error)
      toast.error('Không thể tải thông tin chi tiết voucher')
    } finally {
      loadingDetail.value = false
    }
  }

  // Đóng modal chi tiết
  const closeDetailModal = () => {
    showDetailModal.value = false
    setTimeout(() => {
      detailVoucher.value = null
    }, 300)
  }

  // Load vouchers on mount
  onMounted(() => {
    console.log('Voucher management mounted');
    loadVouchers();
  });

  return {
    vouchers,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    searchTerm,
    showModal,
    selectedVoucher,
    isEdit,
    selectedStatus,
    selectedHomeStay,
    isLoading,
    filteredVouchers,
    displayedPages,
    loadVouchers,
    handleSearch,
    handleStatusChange,
    handleHomeStayChange,
    handlePageSizeChange,
    changePage,
    openAddModal,
    editVoucher,
    closeModal,
    saveVoucher,
    deleteVoucher,
    formatLoaiGiamGia,
    formatGiaTri,
    formatDate,
    // Thêm các biến và phương thức mới
    showDetailModal,
    detailVoucher,
    loadingDetail,
    viewVoucherDetail,
    closeDetailModal
  }
}
