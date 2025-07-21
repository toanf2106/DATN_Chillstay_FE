<template>
  <div class="container-fluid account-detail-page">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <!-- Header -->
        <div class="card shadow-sm rounded-4 border-0 mb-3">
          <div class="card-header bg-primary text-white border-0 py-3">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="m-0 fw-bold">Chi tiết tài khoản</h3>
              <div>
                <button class="btn btn-light btn-sm me-2" @click="goBack">
                  <i class="bi bi-arrow-left me-1"></i>Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading spinner -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="mt-2">Đang tải thông tin tài khoản...</p>
        </div>

        <!-- Error message -->
        <div v-else-if="error" class="alert alert-danger m-4">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ error }}
        </div>

        <!-- Account details -->
        <div v-else>
          <div class="card shadow-sm rounded-4 border-0 mb-4">
            <div class="card-body">
              <!-- Heading -->
              <div class="mb-4 d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <div class="position-relative avatar-container me-3">
                    <img
                      :src="account.anh || '/images/default-avatar.png'"
                      alt="Avatar người dùng"
                      class="rounded-circle img-thumbnail avatar-img"
                      :class="{ inactive: !account.trangThai }"
                      style="width: 80px; height: 80px"
                    />
                    <div class="status-indicator" :class="{ active: account.trangThai }"></div>
                  </div>
                  <div>
                    <h2 class="mb-1 fs-3">Thông tin cá nhân</h2>
                    <p class="text-muted mb-0">
                      Cập nhật thông tin của người dùng và quản lý tài khoản.
                    </p>
                  </div>
                </div>
                <div>
                  <button class="btn btn-outline-primary btn-sm" @click="showAvatarUpload = true">
                    <i class="bi bi-camera-fill me-1"></i> Đổi ảnh
                  </button>
                </div>
              </div>

              <!-- Avatar upload modal -->
              <div v-if="showAvatarUpload" class="avatar-upload-modal">
                <div class="modal-backdrop" @click="showAvatarUpload = false"></div>
                <div class="modal-content p-3 rounded-3">
                  <h5 class="mb-3">Tải lên ảnh đại diện mới</h5>
                  <div class="mb-3">
                    <input
                      type="file"
                      class="form-control"
                      @change="handleAvatarChange"
                      accept="image/*"
                    />
                  </div>
                  <div class="d-flex justify-content-end">
                    <button class="btn btn-secondary me-2" @click="showAvatarUpload = false">
                      Hủy
                    </button>
                    <button
                      class="btn btn-primary"
                      @click="uploadAvatarImage"
                      :disabled="!avatarFile"
                    >
                      <i class="bi bi-cloud-arrow-up me-1"></i> Tải lên
                    </button>
                  </div>
                </div>
              </div>

              <!-- Thông tin chi tiết -->
              <div class="info-list">
                <!-- Họ tên (từ thông tin nhân viên) -->
                <div v-if="hasNhanVienInfo" class="info-item">
                  <div class="info-label">Họ tên</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value" v-if="editingNhanVienField !== 'hoTen'">
                      {{ nhanVienInfo.hoTen }}
                    </div>
                    <input
                      v-else
                      type="text"
                      class="form-control"
                      v-model="nhanVienEditValue"
                      :placeholder="nhanVienInfo.hoTen"
                    />

                    <div v-if="editingNhanVienField !== 'hoTen'">
                      <button
                        class="btn btn-link text-primary p-0 edit-btn"
                        @click="editNhanVienField('hoTen')"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                    <div v-else class="d-flex">
                      <button class="btn btn-link text-danger p-0 me-3" @click="cancelNhanVienEdit">
                        Hủy
                      </button>
                      <button class="btn btn-link text-success p-0" @click="saveNhanVienEdit">
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Tên đăng nhập -->
                <div class="info-item">
                  <div class="info-label">Tên đăng nhập</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value">{{ account.tenDangNhap }}</div>
                  </div>
                </div>

                <!-- Mã nhân viên -->
                <div v-if="hasNhanVienInfo" class="info-item">
                  <div class="info-label">Mã nhân viên</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value">{{ formatEmployeeCode(nhanVienInfo.maNhanVien) }}</div>
                    <!-- <button class="btn btn-link text-primary p-0 edit-btn" disabled>
                      Chỉnh sửa
                    </button> -->
                  </div>
                </div>

                <!-- Email -->
                <div class="info-item">
                  <div class="info-label">Địa chỉ email</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value">
                      {{ account.email }}
                      <span class="badge bg-success ms-2">Xác thực</span>
                    </div>
                  </div>
                  <div class="info-description">
                    Đây là địa chỉ email đang dùng để đăng nhập. Chúng tôi cũng sẽ gửi các xác nhận
                    đặt chỗ tới địa chỉ này.
                  </div>
                </div>

                <!-- Số điện thoại -->
                <div class="info-item">
                  <div class="info-label">Số điện thoại</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value" v-if="editingField !== 'soDienThoai'">
                      {{ account.soDienThoai || 'Thêm số điện thoại của bạn' }}
                    </div>
                    <input
                      v-else
                      type="tel"
                      class="form-control"
                      v-model="editValue"
                      :placeholder="account.soDienThoai || 'Nhập số điện thoại'"
                    />

                    <div v-if="editingField !== 'soDienThoai'">
                      <button
                        class="btn btn-link text-primary p-0 edit-btn"
                        @click="editField('soDienThoai')"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                    <div v-else class="d-flex">
                      <button class="btn btn-link text-danger p-0 me-3" @click="cancelEdit">
                        Hủy
                      </button>
                      <button class="btn btn-link text-success p-0" @click="saveEdit">Lưu</button>
                    </div>
                  </div>
                  <div class="info-description">
                    Chỗ nghỉ hoặc địa điểm tham quan bạn đặt sẽ liên lạc với bạn qua số này nếu cần.
                  </div>
                </div>

                <!-- Địa chỉ -->
                <div v-if="hasNhanVienInfo" class="info-item">
                  <div class="info-label">Địa chỉ</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value" v-if="editingNhanVienField !== 'diaChi'">
                      {{ nhanVienInfo.diaChi || 'Chưa cập nhật' }}
                    </div>
                    <input
                      v-else
                      type="text"
                      class="form-control"
                      v-model="nhanVienEditValue"
                      :placeholder="nhanVienInfo.diaChi || 'Nhập địa chỉ'"
                    />

                    <div v-if="editingNhanVienField !== 'diaChi'">
                      <button
                        class="btn btn-link text-primary p-0 edit-btn"
                        @click="editNhanVienField('diaChi')"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                    <div v-else class="d-flex">
                      <button class="btn btn-link text-danger p-0 me-3" @click="cancelNhanVienEdit">
                        Hủy
                      </button>
                      <button class="btn btn-link text-success p-0" @click="saveNhanVienEdit">
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Giới tính -->
                <div v-if="hasNhanVienInfo" class="info-item">
                  <div class="info-label">Giới tính</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value" v-if="editingNhanVienField !== 'gioiTinh'">
                      {{ formatGender(nhanVienInfo.gioiTinh) }}
                    </div>
                    <select v-else class="form-select" v-model="nhanVienEditValue">
                      <option
                        v-for="option in genderOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>

                    <div v-if="editingNhanVienField !== 'gioiTinh'">
                      <button
                        class="btn btn-link text-primary p-0 edit-btn"
                        @click="editNhanVienField('gioiTinh')"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                    <div v-else class="d-flex">
                      <button class="btn btn-link text-danger p-0 me-3" @click="cancelNhanVienEdit">
                        Hủy
                      </button>
                      <button class="btn btn-link text-success p-0" @click="saveNhanVienEdit">
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Ngày vào làm -->
                <div v-if="hasNhanVienInfo" class="info-item">
                  <div class="info-label">Ngày vào làm</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value">{{ formatDate(nhanVienInfo.ngayVaoLam) }}</div>
                    <!-- <button class="btn btn-link text-primary p-0 edit-btn" disabled>
                      Chỉnh sửa
                    </button> -->
                  </div>
                </div>

                <!-- Loại tài khoản
                <div class="info-item">
                  <div class="info-label">Loại tài khoản</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value">
                      {{
                        accountRoles.find((role) => role.id === account.loaiTaiKhoan)?.tenLoai ||
                        'Không xác định'
                      }}
                    </div>
                    <button
                      class="btn btn-link text-primary p-0 edit-btn"
                      @click="editField('loaiTaiKhoan')"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                </div> -->

                <!-- Trạng thái -->
                <div class="info-item">
                  <div class="info-label">Trạng thái</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value">
                      <span :class="account.trangThai ? 'text-success' : 'text-danger'">
                        {{ account.trangThai ? 'Đang hoạt động' : 'Đã khóa' }}
                      </span>
                    </div>
                    <button
                      class="btn btn-link text-primary p-0 edit-btn"
                      @click="toggleAccountStatus"
                    >
                      {{ account.trangThai ? 'Khóa tài khoản' : 'Mở khóa' }}
                    </button>
                  </div>
                </div>

                <!-- Mật khẩu -->
                <div class="info-item">
                  <div class="info-label">Mật khẩu</div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="info-value">••••••••</div>
                    <button
                      class="btn btn-link text-primary p-0 edit-btn"
                      @click="showPasswordForm = true"
                    >
                      Thay đổi mật khẩu
                    </button>
                  </div>
                </div>
              </div>

              <!-- Form đổi mật khẩu -->
              <div v-if="showPasswordForm" class="mt-4 border-top pt-4">
                <h4 class="mb-3">Đổi mật khẩu</h4>
                <form @submit.prevent="updatePassword">
                  <div class="alert alert-info mb-4">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    Đặt mật khẩu mới cho tài khoản này. Mật khẩu phải có ít nhất 8 ký tự.
                  </div>

                  <div class="mb-3">
                    <label for="newPassword" class="form-label">Mật khẩu mới</label>
                    <input
                      type="password"
                      class="form-control"
                      id="newPassword"
                      v-model="passwordData.newPassword"
                    />
                  </div>

                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      class="form-control"
                      id="confirmPassword"
                      v-model="passwordData.confirmPassword"
                    />
                  </div>

                  <div v-if="passwordError" class="alert alert-danger">
                    {{ passwordError }}
                  </div>

                  <div class="d-flex justify-content-end mt-3">
                    <button
                      type="button"
                      class="btn btn-outline-secondary me-2"
                      @click="showPasswordForm = false"
                    >
                      Hủy
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="isUpdatingPassword">
                      <i class="bi bi-key me-1"></i> Đổi mật khẩu
                    </button>
                  </div>
                </form>
              </div>

              <!-- Form chỉnh sửa field -->
              <div v-if="editingField" class="mt-4 border-top pt-4">
                <h4 class="mb-3">Chỉnh sửa {{ getFieldLabel(editingField) }}</h4>
                <form @submit.prevent="saveEdit">
                  <div class="mb-3" v-if="editingField === 'loaiTaiKhoan'">
                    <label :for="editingField" class="form-label">{{
                      getFieldLabel(editingField)
                    }}</label>
                    <select class="form-select" :id="editingField" v-model="editValue">
                      <option v-for="role in accountRoles" :key="role.id" :value="role.id">
                        {{ role.tenLoai }}
                      </option>
                    </select>
                  </div>
                  <div class="mb-3" v-else>
                    <label :for="editingField" class="form-label">{{
                      getFieldLabel(editingField)
                    }}</label>
                    <input
                      :type="getFieldType(editingField)"
                      class="form-control"
                      :id="editingField"
                      v-model="editValue"
                    />
                  </div>

                  <div class="d-flex justify-content-end mt-3">
                    <button
                      type="button"
                      class="btn btn-outline-secondary me-2"
                      @click="cancelEdit"
                    >
                      Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                      <i class="bi bi-check-lg me-1"></i> Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>

              <!-- Xóa form riêng biệt cho chỉnh sửa nhân viên vì đã tích hợp vào từng trường -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  getTaiKhoanById,
  updateTaiKhoan,
  uploadAvatar,
  changePassword,
} from '../../Service/TaiKhoan'
import { useToast } from '../../stores/notificationStore'
import { getNhanVienByTaiKhoanId, updateNhanVien } from '../../Service/NhanVienService'

export default {
  name: 'ChiTietTaiKhoanAdm',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const toast = useToast()

    const account = reactive({
      id: null,
      tenDangNhap: '',
      email: '',
      soDienThoai: '',
      loaiTaiKhoan: null,
      tenLoai: '',
      trangThai: true,
      anh: '',
      ngayTao: null,
    })

    const nhanVienInfo = reactive({
      id: null,
      hoTen: '',
      diaChi: '',
      maNhanVien: '',
      ngayVaoLam: null,
      gioiTinh: '',
      anh: '',
      taiKhoanId: null,
    })

    const hasNhanVienInfo = ref(false)
    const isLoadingNhanVien = ref(false)
    const isLoading = ref(true)
    const error = ref(null)
    const showAvatarUpload = ref(false)
    const avatarFile = ref(null)
    const passwordData = reactive({
      newPassword: '',
      confirmPassword: '',
    })
    const passwordError = ref(null)
    const isUpdatingPassword = ref(false)
    const showPasswordForm = ref(false)

    // Thêm các biến cho chức năng chỉnh sửa inline
    const editingField = ref(null)
    const editValue = ref(null)

    // Thêm biến để theo dõi trường nhân viên đang được chỉnh sửa
    const editingNhanVienField = ref(null)
    const nhanVienEditValue = ref(null)
    const genderOptions = [
      { value: false, label: 'Nam' },
      { value: true, label: 'Nữ' },
    ]

    const accountRoles = ref([
      { id: 1, tenLoai: 'Admin' },
      { id: 2, tenLoai: 'Nhân viên' },
      { id: 3, tenLoai: 'Khách hàng' },
      { id: 4, tenLoai: 'Chủ HomeStay' },
    ])

    const goBack = () => {
      router.back()
    }

    const loadAccountDetails = async () => {
      try {
        isLoading.value = true
        const accountId = route.params.id

        if (!accountId) {
          error.value = 'Không tìm thấy ID tài khoản'
          isLoading.value = false
          return
        }

        const response = await getTaiKhoanById(accountId)
        Object.assign(account, response.data)
        console.log('Thông tin tài khoản:', account)
        isLoading.value = false

        // Nếu là nhân viên, lấy thêm thông tin từ bảng nhân viên
        // Chuyển đổi loaiTaiKhoan thành số để so sánh chính xác
        const loaiTK = parseInt(account.loaiTaiKhoan)
        console.log('Loại tài khoản:', loaiTK, typeof loaiTK)

        if (loaiTK === 2) {
          console.log('Đây là tài khoản nhân viên, đang tải thông tin...')
          await loadNhanVienInfo(account.id)
        } else {
          console.log('Không phải tài khoản nhân viên, loại:', loaiTK)
        }
      } catch (err) {
        console.error('Error loading account details:', err)
        error.value = 'Không thể tải thông tin tài khoản. Vui lòng thử lại sau.'
        isLoading.value = false
      }
    }

    const loadNhanVienInfo = async (taiKhoanId) => {
      try {
        isLoadingNhanVien.value = true
        const response = await getNhanVienByTaiKhoanId(taiKhoanId)
        console.log('Response từ API nhân viên:', response)
        console.log('Nhân viên data từ API:', response.data)

        // Sửa cấu trúc truy xuất dữ liệu - API trả về { success: true, data: {...} }
        if (response.data && response.data.data) {
          console.log('Thông tin nhân viên:', response.data.data)
          Object.assign(nhanVienInfo, response.data.data)
          hasNhanVienInfo.value = true
          console.log('Đã gán thông tin nhân viên:', nhanVienInfo)
        } else {
          console.log('Không tìm thấy dữ liệu nhân viên hoặc dữ liệu không đúng cấu trúc')
          hasNhanVienInfo.value = false
        }
      } catch (err) {
        console.error('Error loading nhanvien details:', err)
        toast.error('Không thể tải thông tin nhân viên')
      } finally {
        isLoadingNhanVien.value = false
      }
    }

    const updateAccountInfo = async () => {
      try {
        await updateTaiKhoan(account.id, {
          tenDangNhap: account.tenDangNhap,
          email: account.email,
          soDienThoai: account.soDienThoai,
          loaiTaiKhoan: account.loaiTaiKhoan,
          trangThai: account.trangThai,
        })

        toast.success('Cập nhật thông tin tài khoản thành công')
      } catch (err) {
        console.error('Error updating account:', err)
        toast.error('Không thể cập nhật thông tin tài khoản')
      }
    }

    const handleAvatarChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        avatarFile.value = file
      }
    }

    const uploadAvatarImage = async () => {
      if (!avatarFile.value) return

      try {
        await uploadAvatar(account.id, avatarFile.value)
        // Reload account details to get the new avatar URL
        await loadAccountDetails()
        showAvatarUpload.value = false
        avatarFile.value = null

        toast.success('Cập nhật ảnh đại diện thành công')
      } catch (err) {
        console.error('Error uploading avatar:', err)
        toast.error('Không thể tải lên ảnh đại diện')
      }
    }

    const updatePassword = async () => {
      passwordError.value = null

      if (passwordData.newPassword.length < 8) {
        passwordError.value = 'Mật khẩu phải có ít nhất 8 ký tự'
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        passwordError.value = 'Mật khẩu xác nhận không khớp'
        return
      }

      try {
        isUpdatingPassword.value = true
        await changePassword({
          id: account.id,
          newPassword: passwordData.newPassword,
        })

        passwordData.newPassword = ''
        passwordData.confirmPassword = ''
        showPasswordForm.value = false

        toast.success('Đổi mật khẩu thành công')
      } catch (err) {
        console.error('Error changing password:', err)
        toast.error('Không thể đổi mật khẩu')
      } finally {
        isUpdatingPassword.value = false
      }
    }

    const toggleAccountStatus = async () => {
      try {
        account.trangThai = !account.trangThai
        await updateTaiKhoan(account.id, {
          trangThai: account.trangThai,
        })

        toast.success(`Tài khoản đã ${account.trangThai ? 'được kích hoạt' : 'bị khóa'}`)
      } catch (err) {
        // Revert the status change in UI
        account.trangThai = !account.trangThai

        console.error('Error toggling account status:', err)
        toast.error('Không thể thay đổi trạng thái tài khoản')
      }
    }

    // Hàm chỉnh sửa field
    const editField = (fieldName) => {
      editingField.value = fieldName
      editValue.value = account[fieldName]
    }

    const getFieldLabel = (fieldName) => {
      const labels = {
        tenDangNhap: 'Tên đăng nhập',
        email: 'Địa chỉ email',
        soDienThoai: 'Số điện thoại',
        loaiTaiKhoan: 'Loại tài khoản',
      }
      return labels[fieldName] || fieldName
    }

    const getFieldType = (fieldName) => {
      if (fieldName === 'email') return 'email'
      if (fieldName === 'soDienThoai') return 'tel'
      return 'text'
    }

    const saveEdit = async () => {
      try {
        // Cập nhật giá trị vào object account
        account[editingField.value] = editValue.value

        // Gọi API để cập nhật tài khoản
        await updateTaiKhoan(account.id, {
          [editingField.value]: editValue.value,
        })

        // Reset các biến chỉnh sửa
        editingField.value = null
        editValue.value = null

        toast.success('Cập nhật thông tin thành công')
      } catch (err) {
        console.error('Error updating field:', err)
        toast.error('Không thể cập nhật thông tin')
      }
    }

    const cancelEdit = () => {
      editingField.value = null
      editValue.value = null
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'

      const date = new Date(dateString)
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date)
    }

    const formatGender = (gender) => {
      if (gender === false || gender === 0) return 'Nam'
      if (gender === true || gender === 1) return 'Nữ'
      return 'Không xác định'
    }

    const formatEmployeeCode = (code) => {
      if (code === null || code === undefined || code === '') return 'Không xác định'
      return code
    }

    const getRoleBadgeClass = (role) => {
      if (!role) return 'bg-secondary'

      switch (role.toLowerCase()) {
        case 'admin':
          return 'bg-danger'
        case 'nhân viên':
          return 'bg-warning text-dark'
        case 'khách hàng':
          return 'bg-info text-dark'
        case 'chủ homestay':
          return 'bg-success'
        default:
          return 'bg-secondary'
      }
    }

    // Hàm chỉnh sửa field nhân viên
    const editNhanVienField = (fieldName) => {
      editingNhanVienField.value = fieldName
      nhanVienEditValue.value = nhanVienInfo[fieldName]
    }

    const getNhanVienFieldLabel = (fieldName) => {
      const labels = {
        hoTen: 'Họ tên',
        diaChi: 'Địa chỉ',
        gioiTinh: 'Giới tính',
      }
      return labels[fieldName] || fieldName
    }

    const saveNhanVienEdit = async () => {
      try {
        // Tạo formData để gửi lên API
        const formData = new FormData()

        // Tạo object chứa thông tin nhân viên cần cập nhật
        const updatedNhanVien = { ...nhanVienInfo }
        updatedNhanVien[editingNhanVienField.value] = nhanVienEditValue.value

        // Thêm dữ liệu nhân viên dạng JSON vào formData
        formData.append('nhanVien', JSON.stringify(updatedNhanVien))

        // Gọi API cập nhật nhân viên
        await updateNhanVien(nhanVienInfo.id, formData)

        // Cập nhật lại state trong component
        nhanVienInfo[editingNhanVienField.value] = nhanVienEditValue.value

        // Reset các trường chỉnh sửa
        editingNhanVienField.value = null
        nhanVienEditValue.value = null

        toast.success('Cập nhật thông tin nhân viên thành công')
      } catch (err) {
        console.error('Error updating employee info:', err)
        toast.error('Không thể cập nhật thông tin nhân viên')
      }
    }

    const cancelNhanVienEdit = () => {
      editingNhanVienField.value = null
      nhanVienEditValue.value = null
    }

    onMounted(() => {
      loadAccountDetails()
    })

    return {
      account,
      nhanVienInfo,
      hasNhanVienInfo,
      isLoadingNhanVien,
      isLoading,
      error,
      showAvatarUpload,
      avatarFile,
      passwordData,
      passwordError,
      isUpdatingPassword,
      accountRoles,
      genderOptions,
      goBack,
      updateAccountInfo,
      handleAvatarChange,
      uploadAvatarImage,
      updatePassword,
      toggleAccountStatus,
      formatDate,
      formatGender,
      formatEmployeeCode,
      getRoleBadgeClass,
      showPasswordForm,
      editingField,
      editValue,
      editField,
      getFieldLabel,
      getFieldType,
      saveEdit,
      cancelEdit,
      editingNhanVienField,
      nhanVienEditValue,
      editNhanVienField,
      getNhanVienFieldLabel,
      saveNhanVienEdit,
      cancelNhanVienEdit,
    }
  },
}
</script>

<style scoped>
.account-detail-page {
  padding: 20px;
  background-color: #f8f9fa;
}

.card {
  overflow: hidden;
  transition: all 0.3s ease;
}

.bg-primary {
  background: #003580 !important;
}

.btn-primary {
  background-color: #0071c2;
  border-color: #0071c2;
}

.btn-primary:hover {
  background-color: #00508b;
  border-color: #00508b;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  padding: 16px 0;
  border-bottom: 1px solid #eaeaea;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.info-value {
  font-size: 16px;
  color: #333;
}

.info-description {
  font-size: 12px;
  color: #6b6b6b;
  margin-top: 4px;
}

.edit-btn {
  font-weight: 500;
  text-decoration: none;
}

.edit-btn:hover {
  text-decoration: underline;
}

/* Avatar styling */
.avatar-container {
  position: relative;
}

.avatar-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.avatar-img.inactive {
  filter: grayscale(100%);
  opacity: 0.6;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #dc3545;
  border: 2px solid #fff;
}

.status-indicator.active {
  background-color: #28a745;
}

/* Modal styling */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.avatar-upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1051;
}

.avatar-upload-modal .modal-content {
  width: 450px;
  max-width: 90%;
  background-color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .info-item {
    flex-direction: column;
  }
}
</style>
