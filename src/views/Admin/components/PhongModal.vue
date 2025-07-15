<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="phong-details-modal">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-button" @click="$emit('close')" style="display:flex; align-items:center; justify-content:center;">&times;</button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-4">
            <div class="phong-avatar-display">
              <div
                class="avatar-preview"
                :class="{ 'view-mode': isViewMode }"
                @click="triggerFileInput"
              >
                <img
                  v-if="previewImage || formData.anhBia"
                  :src="previewImage || getImageUrl(formData.anhBia)"
                  alt="Ảnh Phòng"
                  class="uploaded-avatar"
                  @error="handleImageError"
                />
                <div v-else class="avatar-placeholder">
                  <i class="fas fa-door-open"></i>
                  <span>{{ isViewMode ? 'Chưa có ảnh' : 'Thêm ảnh' }}</span>
                </div>
              </div>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                accept="image/*"
                style="display: none"
              />

              <h4 class="text-center mt-3">{{ formData.tenPhong || 'Phòng mới' }}</h4>
              <p class="text-center phong-id" v-if="formData.maPhong">
                Mã: {{ formData.maPhong }}
              </p>

              <div class="status-badge" v-if="isEdit || isViewMode">
                <label>Trạng Thái:</label>
                <span :class="`badge ${formData.trangThai ? 'bg-success' : 'bg-danger'}`">
                  {{ formData.trangThai ? 'Hoạt động' : 'Khóa' }}
                </span>
              </div>

              <div class="mt-3 text-center" v-if="isViewMode">
                <button type="button" class="btn btn-info" @click="$emit('view-images', phong.id)">
                  <i class="fas fa-images me-1"></i> Xem ảnh chi tiết
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <form @submit.prevent="handleSubmit">
              <!-- Form for edit/add mode -->
              <div v-if="!isViewMode">
                <div class="form-group">
                  <label for="tenPhong">Tên Phòng <span class="text-danger">*</span></label>
                  <input
                    id="tenPhong"
                    v-model="formData.tenPhong"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.tenPhong }"
                    required
                  />
                  <div v-if="errors.tenPhong" class="invalid-feedback">
                    {{ errors.tenPhong }}
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="loaiPhongId"
                        >Loại Phòng <span class="text-danger">*</span></label
                      >
                      <select
                        id="loaiPhongId"
                        v-model="formData.loaiPhongId"
                        class="form-select"
                        :class="{ 'is-invalid': errors.loaiPhongId }"
                        required
                      >
                        <option value="" disabled selected>Chọn loại phòng</option>
                        <option
                          v-for="loai in loaiPhongList"
                          :key="loai.id"
                          :value="loai.id"
                          :disabled="!loai.trangThai"
                        >
                          {{ loai.tenLoaiPhong }}
                        </option>
                      </select>
                      <div v-if="errors.loaiPhongId" class="invalid-feedback">
                        {{ errors.loaiPhongId }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="homeStayId"
                        >Homestay <span class="text-danger">*</span></label
                      >
                      <select
                        id="homeStayId"
                        v-model="formData.homeStayId"
                        class="form-select"
                        :class="{ 'is-invalid': errors.homeStayId }"
                        required
                      >
                        <option value="" disabled selected>Chọn homestay</option>
                        <option
                          v-for="homestay in homestayList"
                          :key="homestay.id"
                          :value="homestay.id"
                          :disabled="!homestay.trangThai"
                        >
                          {{ homestay.tenHomestay }}
                        </option>
                      </select>
                      <div v-if="errors.homeStayId" class="invalid-feedback">
                        {{ errors.homeStayId }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="dienTich"
                        >Diện tích (m²) <span class="text-danger">*</span></label
                      >
                      <input
                        id="dienTich"
                        v-model="formData.dienTich"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.dienTich }"
                        min="0.01"
                        step="any"
                        placeholder="Nhập diện tích (VD: 25.5)"
                        required
                      />
                      <div v-if="errors.dienTich" class="invalid-feedback">
                        {{ errors.dienTich }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="tangSo"
                        >Tầng <span class="text-danger">*</span></label
                      >
                      <input
                        id="tangSo"
                        v-model.number="formData.tangSo"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.tangSo }"
                        min="1"
                        required
                      />
                      <div v-if="errors.tangSo" class="invalid-feedback">
                        {{ errors.tangSo }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="soNguoiLon"
                        >Số người lớn <span class="text-danger">*</span></label
                      >
                      <input
                        id="soNguoiLon"
                        v-model.number="formData.soNguoiLon"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.soNguoiLon }"
                        min="0"
                        @input="updateSoNguoiToiDa"
                        required
                      />
                      <div v-if="errors.soNguoiLon" class="invalid-feedback">
                        {{ errors.soNguoiLon }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="soNguoiNho"
                        >Số trẻ nhỏ <span class="text-danger">*</span></label
                      >
                      <input
                        id="soNguoiNho"
                        v-model.number="formData.soNguoiNho"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.soNguoiNho }"
                        min="0"
                        @input="updateSoNguoiToiDa"
                        required
                      />
                      <div v-if="errors.soNguoiNho" class="invalid-feedback">
                        {{ errors.soNguoiNho }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="soNguoiToiDa"
                        >Số người tối đa <span class="text-danger">*</span></label
                      >
                      <input
                        id="soNguoiToiDa"
                        v-model.number="formData.soNguoiToiDa"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.soNguoiToiDa }"
                        min="1"
                        disabled
                        readonly
                        required
                      />

                      <div v-if="errors.soNguoiToiDa" class="invalid-feedback">
                        {{ errors.soNguoiToiDa }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="moTa">Mô tả</label>
                  <textarea
                    id="moTa"
                    v-model="formData.moTa"
                    class="form-control"
                    :class="{ 'is-invalid': errors.moTa }"
                    rows="3"
                  ></textarea>
                  <div v-if="errors.moTa" class="invalid-feedback">
                    {{ errors.moTa }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="trangThai">Trạng thái</label>
                  <select
                    id="trangThai"
                    v-model="formData.trangThai"
                    class="form-select"
                    required
                  >
                    <option :value="true">Hoạt động</option>
                    <option :value="false">Khóa</option>
                  </select>
                </div>

                <div class="form-buttons mt-4">
                  <button type="button" class="btn btn-secondary" @click="$emit('close')">
                    Hủy
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <span v-if="loading" class="spinner-border spinner-border-sm" role="status"></span>
                    {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
                  </button>
                </div>
              </div>

              <!-- View mode display -->
              <div v-else>
                <div class="view-info-group">
                  <label>Tên Phòng</label>
                  <div class="info-value">{{ formData.tenPhong }}</div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="view-info-group">
                      <label>Loại Phòng</label>
                      <div class="info-value">{{ getLoaiPhongName(formData.loaiPhongId) }}</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="view-info-group">
                      <label>Homestay</label>
                      <div class="info-value">{{ getHomestayName(formData.homeStayId) }}</div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="view-info-group">
                      <label>Diện Tích</label>
                      <div class="info-value">{{ formData.dienTich }} m²</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="view-info-group">
                      <label>Tầng</label>
                      <div class="info-value">{{ formData.tangSo }}</div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-4">
                    <div class="view-info-group">
                      <label>Số Người Lớn</label>
                      <div class="info-value">{{ formData.soNguoiLon }} người</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="view-info-group">
                      <label>Số Trẻ Nhỏ</label>
                      <div class="info-value">{{ formData.soNguoiNho }} trẻ</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="view-info-group">
                      <label>Số Người Tối Đa</label>
                      <div class="info-value">{{ formData.soNguoiToiDa }} người</div>
                      <small class="text-muted">(Người lớn + Trẻ nhỏ)</small>
                    </div>
                  </div>
                </div>

                <div class="view-info-group">
                  <label>Mô Tả</label>
                  <div class="info-value">{{ formData.moTa || 'Không có mô tả' }}</div>
                </div>

                <div class="view-info-group">
                  <label>Trạng Thái</label>
                  <div class="info-value">
                    <span :class="`badge ${formData.trangThai ? 'bg-success' : 'bg-danger'}`">
                      {{ formData.trangThai ? 'Hoạt động' : 'Khóa' }}
                    </span>
                  </div>
                </div>

                <div class="form-buttons mt-4">
                  <button type="button" class="btn btn-secondary" @click="$emit('close')">
                    Đóng
                  </button>
                  <button type="button" class="btn btn-primary" @click="$emit('edit')">
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'PhongModal',
  props: {
    phong: {
      type: Object,
      default: null
    },
    loaiPhongList: {
      type: Array,
      default: () => []
    },
    homestayList: {
      type: Array,
      default: () => []
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    isViewMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'save', 'edit', 'view-images'],
  setup(props, { emit }) {
    const modalTitle = computed(() => {
      if (props.isViewMode) return 'Chi Tiết Phòng'
      return props.isEdit ? 'Chỉnh Sửa Phòng' : 'Thêm Phòng Mới'
    })

    // Biến giá trị form
    const formData = ref({
      tenPhong: '',
      maPhong: '',
      loaiPhongId: '',
      homeStayId: '',
      dienTich: '',
      tangSo: 1,
      soNguoiLon: 2,
      soNguoiNho: 0,
      soNguoiToiDa: 2,
      moTa: '',
      anhBia: '',
      trangThai: true
    })

    // Quản lý lỗi
    const errors = ref({})
    const loading = ref(false)

    // Quản lý ảnh
    const fileInput = ref(null)
    const previewImage = ref(null)
    const imageFile = ref(null)

    // Hàm cập nhật số người tối đa khi số người lớn hoặc số trẻ nhỏ thay đổi
    const updateSoNguoiToiDa = () => {
      formData.value.soNguoiToiDa = formData.value.soNguoiLon + formData.value.soNguoiNho
    }

    // Khởi tạo form dựa trên dữ liệu từ props
    watch(
      () => props.phong,
      (newVal) => {
        if (newVal) {
          // Sao chép từ props vào formData
          Object.keys(formData.value).forEach(key => {
            if (newVal[key] !== undefined) {
              formData.value[key] = newVal[key]
            }
          })
        } else {
          // Reset form về giá trị mặc định nếu không có dữ liệu
          formData.value = {
            tenPhong: '',
            maPhong: '',
            loaiPhongId: '',
            homeStayId: '',
            dienTich: '',
            tangSo: 1,
            soNguoiLon: 2,
            soNguoiNho: 0,
            soNguoiToiDa: 2,
            moTa: '',
            anhBia: '',
            trangThai: true
          }
          previewImage.value = null
          imageFile.value = null
        }
        // Đảm bảo số người tối đa được tính đúng
        updateSoNguoiToiDa()
      },
      { immediate: true }
    )

    // Theo dõi thay đổi của số người lớn và số trẻ nhỏ để tự động cập nhật số người tối đa
    watch(
      () => [formData.value.soNguoiLon, formData.value.soNguoiNho],
      () => {
        updateSoNguoiToiDa()
      }
    )

    // Helpers
    const getLoaiPhongName = (id) => {
      const loai = props.loaiPhongList.find((l) => l.id === id)
      return loai?.tenLoaiPhong || 'Không xác định'
    }

    const getHomestayName = (id) => {
      const homestay = props.homestayList.find((h) => h.id === id)
      if (!homestay) return 'Không xác định'
      return homestay.tenHomestay || 'Không xác định'
    }

    const getImageUrl = (img) => {
      // Nếu không có ảnh
      if (!img) return '/images/placeholder-room.jpg'

      // Nếu là URL đầy đủ
      if (img.startsWith('http')) return img

      return img
    }

    // Xử lý khi nhấn vào ảnh để tải lên
    const triggerFileInput = () => {
      if (props.isViewMode) return
      fileInput.value.click()
    }

    // Xử lý khi chọn file ảnh
    const handleFileUpload = (e) => {
      const file = e.target.files[0]
      if (!file) return

      // Kiểm tra loại file
      if (!file.type.includes('image/')) {
        errors.value.image = 'Vui lòng chọn file ảnh'
        return
      }

      // Hiển thị ảnh preview
      const reader = new FileReader()
      reader.onload = (e) => {
        previewImage.value = e.target.result
      }
      reader.readAsDataURL(file)
      imageFile.value = file
    }

    // Xử lý khi ảnh không tải được
    const handleImageError = () => {
      if (formData.value.anhBia) {
        formData.value.anhBia = '/images/placeholder-room.jpg'
      }
    }

    // Xem ảnh chi tiết
    const viewDetailImages = () => {
      emit('view-images', formData.value)
    }

    // Kiểm tra form
    const validateForm = () => {
      const newErrors = {}

      if (!formData.value.tenPhong.trim()) {
        newErrors.tenPhong = 'Vui lòng nhập tên phòng'
      }

      if (!formData.value.loaiPhongId) {
        newErrors.loaiPhongId = 'Vui lòng chọn loại phòng'
      }

      if (!formData.value.homeStayId) {
        newErrors.homeStayId = 'Vui lòng chọn homestay'
      }

      if (!formData.value.dienTich || formData.value.dienTich <= 0) {
        newErrors.dienTich = 'Vui lòng nhập diện tích hợp lệ'
      }

      if (!formData.value.tangSo || formData.value.tangSo < 1) {
        newErrors.tangSo = 'Vui lòng nhập tầng hợp lệ'
      }

      if (formData.value.soNguoiLon < 0) {
        newErrors.soNguoiLon = 'Số người lớn không được âm'
      }

      if (formData.value.soNguoiNho < 0) {
        newErrors.soNguoiNho = 'Số trẻ nhỏ không được âm'
      }

      // Kiểm tra tổng số người
      if (formData.value.soNguoiLon + formData.value.soNguoiNho < 1) {
        newErrors.soNguoiLon = 'Tổng số người phải ít nhất là 1'
      }

      errors.value = newErrors
      return Object.keys(newErrors).length === 0
    }

    // Xử lý submit form
    const handleSubmit = async () => {
      if (!validateForm()) return

      loading.value = true

      try {
        // Tạo FormData để gửi lên server
        const submitData = new FormData()

        // Thêm thông tin phòng dưới dạng JSON
        const phongData = { ...formData.value }
        if (props.phong && props.phong.id) {
          phongData.id = props.phong.id
        }

        submitData.append('phong', JSON.stringify(phongData))

        // Thêm file ảnh nếu có
        if (imageFile.value) {
          submitData.append('file', imageFile.value)
        }

        emit('save', submitData)
      } catch (error) {
        console.error('Lỗi khi xử lý form:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      modalTitle,
      formData,
      errors,
      loading,
      fileInput,
      previewImage,
      imageFile,
      getLoaiPhongName,
      getHomestayName,
      getImageUrl,
      triggerFileInput,
      handleFileUpload,
      handleImageError,
      viewDetailImages,
      updateSoNguoiToiDa,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  padding: 30px 0;
}

.phong-details-modal {
  background-color: #fff;
  border-radius: 15px;
  width: 900px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  animation: modal-fade-in 0.3s ease;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #343a40;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  position: relative;
  z-index: 5;
  margin-right: 5px;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 25px;
}

/* Avatar/Image section */
.phong-avatar-display {
  margin-bottom: 25px;
}

.avatar-preview {
  width: 100%;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  margin-bottom: 15px;
  border: 2px dashed #dee2e6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-preview:not(.view-mode):hover {
  border-color: #0d6efd;
}

.uploaded-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f8f9fa;
  color: #6c757d;
}

.avatar-placeholder i {
  font-size: 3rem;
  margin-bottom: 10px;
}

.phong-id {
  color: #6c757d;
  font-size: 0.9rem;
}

.status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.status-badge label {
  margin-bottom: 0;
  font-weight: 600;
  color: #6c757d;
}

.badge {
  padding: 6px 12px;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Form styling */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.form-control,
.form-select {
  border: 1px solid #ced4da;
  padding: 0.6rem 0.75rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #dc3545;
  background-image: none;
}

.form-control:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
  opacity: 0.8;
}

.invalid-feedback {
  display: block;
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.25rem;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn {
  padding: 0.6rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5c636a;
  border-color: #565e64;
}

.btn-info {
  background-color: #0dcaf0;
  border-color: #0dcaf0;
}

.btn-info:hover {
  background-color: #31d2f2;
  border-color: #25cff2;
}

/* View mode styling */
.view-info-group {
  margin-bottom: 1.5rem;
}

.view-info-group label {
  display: block;
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.view-info-group .info-value {
  font-weight: 600;
  color: #212529;
  font-size: 1rem;
}

/* Responsive fixes */
@media (max-width: 767px) {
  .phong-details-modal {
    max-width: 95%;
  }

  .modal-body {
    padding: 20px 15px;
  }

  .avatar-preview {
    height: 180px;
  }
}
</style>
