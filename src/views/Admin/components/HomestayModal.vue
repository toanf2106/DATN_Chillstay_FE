<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="homestay-details-modal">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-4">
            <div class="homestay-avatar-display">
              <div
                class="avatar-preview"
                :class="{ 'view-mode': isViewMode }"
                @click="triggerFileInput"
              >
                <img
                  v-if="previewImage || formData.hinhAnh"
                  :src="previewImage || getImageUrl(formData.hinhAnh)"
                  alt="Ảnh Homestay"
                  class="uploaded-avatar"
                  @error="handleImageError"
                />
                <div v-else class="avatar-placeholder">
                  <i class="fas fa-home"></i>
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

              <h4 class="text-center mt-3">{{ formData.tenHomestay || 'Homestay mới' }}</h4>
              <p class="text-center homestay-id" v-if="formData.maHomestay">
                Mã: {{ formData.maHomestay }}
              </p>

              <div class="status-badge" v-if="isEdit || isViewMode">
                <label>Trạng Thái:</label>
                <span :class="`badge ${formData.trangThai ? 'bg-success' : 'bg-danger'}`">
                  {{ formData.trangThai ? 'Hoạt động' : 'Khóa' }}
                </span>
              </div>

              <div class="mt-3 text-center" v-if="isViewMode">
                <button type="button" class="btn btn-info" @click="viewDetailImages">
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
                  <label for="tenHomestay">Tên Homestay <span class="text-danger">*</span></label>
                  <input
                    id="tenHomestay"
                    v-model="formData.tenHomestay"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.tenHomestay }"
                    required
                  />
                  <div v-if="errors.tenHomestay" class="invalid-feedback">
                    {{ errors.tenHomestay }}
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="loaiHomestay"
                        >Loại Homestay <span class="text-danger">*</span></label
                      >
                      <select
                        id="loaiHomestay"
                        v-model="formData.idLoaiHomeStay"
                        class="form-select"
                        :class="{ 'is-invalid': errors.idLoaiHomeStay }"
                        required
                      >
                        <option value="" disabled selected>-- Chọn loại --</option>
                        <option v-for="loai in loaiList" :key="loai.id" :value="loai.id">
                          {{ loai.tenLoaiHomestay || loai.tenLoai }}
                        </option>
                      </select>
                      <div v-if="errors.idLoaiHomeStay" class="invalid-feedback">
                        {{ errors.idLoaiHomeStay }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="chuSoHuu">Quản lý Homestay <span class="text-danger">*</span></label>
                      <select
                        id="chuSoHuu"
                        v-model="formData.idChuHomeStay"
                        class="form-select"
                        :class="{ 'is-invalid': errors.idChuHomeStay }"
                        required
                      >
                        <option value="" disabled selected>-- Chọn quản lý--</option>
                        <option v-for="chu in chuList" :key="chu.id" :value="chu.id">
                          {{ chu.hotenChuHomestay || chu.hoTen }}
                        </option>
                      </select>
                      <div v-if="errors.idChuHomeStay" class="invalid-feedback">
                        {{ errors.idChuHomeStay }}
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
                      <label for="giaCaHomestay"
                        >Giá (VND) <span class="text-danger">*</span></label
                      >
                      <input
                        id="giaCaHomestay"
                        v-model.number="formData.giaCaHomestay"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.giaCaHomestay }"
                        min="1000"
                        required
                      />
                      <div v-if="errors.giaCaHomestay" class="invalid-feedback">
                        {{ errors.giaCaHomestay }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="diaChi">Địa chỉ <span class="text-danger">*</span></label>
                  <textarea
                    id="diaChi"
                    v-model="formData.diaChi"
                    class="form-control"
                    :class="{ 'is-invalid': errors.diaChi }"
                    rows="3"
                    required
                  ></textarea>
                  <div v-if="errors.diaChi" class="invalid-feedback">
                    {{ errors.diaChi }}
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="tinhTrang">Tình trạng</label>
                      <select
                        id="tinhTrang"
                        v-model="formData.tinhTrang"
                        class="form-select"
                        required
                      >
                        <option value="Còn phòng">Còn phòng</option>
                        <option value="Hết phòng">Hết phòng</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
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
                  </div>
                </div>
              </div>

              <!-- Read-only view for view mode -->
              <div v-if="isViewMode" class="staff-info">
                <div class="form-group">
                  <label>Tên Homestay</label>
                  <input type="text" class="form-control" :value="formData.tenHomestay" readonly />
                </div>

                <div class="form-group">
                  <label>Loại Homestay</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="getLoaiName(formData.idLoaiHomeStay)"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Quản lý Homestay</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="getChuName(formData.idChuHomeStay)"
                    readonly
                  />
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Diện tích</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="`${formData.dienTich} m²`"
                        readonly
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Giá</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formatCurrency(formData.giaCaHomestay)"
                        readonly
                      />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>Địa chỉ</label>
                  <textarea
                    class="form-control"
                    rows="3"
                    :value="formData.diaChi"
                    readonly
                  ></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Tình trạng</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formData.tinhTrang"
                        readonly
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Trạng thái</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formData.trangThai ? 'Đang hoạt động' : 'Đã khóa'"
                        readonly
                      />
                    </div>
                  </div>
                </div>

                <div class="row" v-if="formData.ngayTao">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Ngày tạo</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formatDate(formData.ngayTao)"
                        readonly
                      />
                    </div>

                  </div>
                  <div class="col-md-6" v-if="formData.ngayUpdate">
                    <div class="form-group">
                      <label>Ngày cập nhật</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formatDate(formData.ngayUpdate)"
                        readonly
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="$emit('close')">
                  <i class="fas fa-times me-1"></i> {{ isViewMode ? 'Đóng' : 'Hủy' }}
                </button>
                <button
                  v-if="!isViewMode"
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  <span
                    v-if="isSubmitting"
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span v-else>
                    <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                    {{ isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu' }}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'

export default {
  name: 'HomestayModal',
  props: {
    homestay: {
      type: Object,
      default: null,
    },
    loaiList: {
      type: Array,
      required: true,
    },
    chuList: {
      type: Array,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    isViewMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['save', 'close', 'edit', 'view-images'],
  setup(props, { emit }) {
    const formData = ref({
      tenHomestay: '',
      idLoaiHomeStay: null,
      idChuHomeStay: null,
      dienTich: 0,
      giaCaHomestay: 0,
      diaChi: '',
      tinhTrang: 'Còn phòng',
      trangThai: true,
      hinhAnh: '',
      maHomestay: '',
      ngayTao: null,
      ngayUpdate: null,
    })

    const isSubmitting = ref(false)
    const errors = ref({})
    const fileInput = ref(null)
    const previewImage = ref(null)
    const selectedFile = ref(null)

    // Computed property for modal title based on mode
    const modalTitle = computed(() => {
      if (props.isViewMode) return 'Chi tiết Homestay'
      return props.isEdit ? 'Chỉnh sửa Homestay' : 'Thêm mới Homestay'
    })

    const validateForm = () => {
      const newErrors = {}

      if (!formData.value.tenHomestay?.trim()) {
        newErrors.tenHomestay = 'Tên Homestay không được để trống'
      }

      if (!formData.value.idLoaiHomeStay) {
        newErrors.idLoaiHomeStay = 'Vui lòng chọn loại Homestay'
      }

      if (!formData.value.idChuHomeStay) {
        newErrors.idChuHomeStay = 'Vui lòng chọn chủ sở hữu'
      }

      // Kiểm tra diện tích là số hợp lệ và lớn hơn 0
      const dienTich = parseFloat(formData.value.dienTich)
      if (isNaN(dienTich) || dienTich <= 0) {
        newErrors.dienTich = 'Diện tích phải là số dương lớn hơn 0'
      }

      if (!formData.value.giaCaHomestay || formData.value.giaCaHomestay <= 0) {
        newErrors.giaCaHomestay = 'Giá phải lớn hơn 0'
      }

      if (!formData.value.diaChi?.trim()) {
        newErrors.diaChi = 'Địa chỉ không được để trống'
      }

      errors.value = newErrors
      return Object.keys(newErrors).length === 0
    }

    const getImageUrl = (img) => {
      if (!img) return '/images/placeholder-house.jpg'

      // Nếu là URL GCS hoặc URL đầy đủ
      if (img.startsWith('http')) return img

      return img
    }

    // Helper functions for view mode
    const getLoaiName = (id) => {
      const loai = props.loaiList.find((l) => l.id === id)
      return loai ? loai.tenLoaiHomestay || loai.tenLoai : 'Không xác định'
    }

    const getChuName = (id) => {
      const chu = props.chuList.find((c) => c.id === id)
      return chu ? chu.hotenChuHomestay || chu.hoTen : 'Không xác định'
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
    }

    const triggerFileInput = () => {
      if (props.isViewMode) return
      fileInput.value.click()
    }

    const handleImageError = (event) => {
      // Use default avatar image if loading fails
      event.target.src = '/images/default-avatar.png'
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        try {
          // Lưu file đã chọn
          selectedFile.value = file

          // Hiển thị preview trước khi upload
          const reader = new FileReader()
          reader.onload = (e) => {
            previewImage.value = e.target.result
          }
          reader.readAsDataURL(file)

          // Lưu tên file cho hiển thị
          formData.value.hinhAnh = file.name
        } catch (error) {
          console.error('Lỗi xử lý ảnh:', error)
          alert('Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại hoặc chọn ảnh khác.')
        }
      }
    }

    const handleSubmit = async () => {
      if (!validateForm()) {
        return
      }

      isSubmitting.value = true
      try {
        // Tạo FormData để gửi dữ liệu và file
        const formDataToSend = new FormData()

        // Thêm file ảnh nếu có
        if (selectedFile.value) {
          formDataToSend.append('file', selectedFile.value)
        }

        // Chuyển đổi dữ liệu homestay thành JSON string
        const homestayData = { ...formData.value }

        // Đảm bảo các trường số được chuyển đổi đúng
        if (homestayData.dienTich) {
          homestayData.dienTich = parseFloat(homestayData.dienTich)
        }

        if (homestayData.giaCaHomestay) {
          homestayData.giaCaHomestay = parseFloat(homestayData.giaCaHomestay)
        }

        // Nếu là chỉnh sửa, đảm bảo có ID
        if (props.isEdit && props.homestay && props.homestay.id) {
          homestayData.id = parseInt(props.homestay.id, 10)
        }

        // Đảm bảo idLoaiHomeStay và idChuHomeStay là số nguyên
        if (homestayData.idLoaiHomeStay) {
          homestayData.idLoaiHomeStay = parseInt(homestayData.idLoaiHomeStay, 10)
        }

        if (homestayData.idChuHomeStay) {
          homestayData.idChuHomeStay = parseInt(homestayData.idChuHomeStay, 10)
        }

        // Thêm dữ liệu homestay dạng JSON
        formDataToSend.append('homestay', JSON.stringify(homestayData))

        // Gọi hàm lưu từ component cha
        await emit('save', formDataToSend)
      } catch {
        // Lỗi được xử lý bởi component cha
      } finally {
        isSubmitting.value = false
      }
    }

    const viewDetailImages = () => {
      emit('view-images', formData.value)
    }

    // Nếu là chỉnh sửa, điền dữ liệu hiện có
    watch(
      () => props.homestay,
      (newVal) => {
        if (newVal) {
          // Copy dữ liệu từ props vào form
          formData.value = { ...newVal }

          // Chỉ reset preview image khi mở một homestay mới hoặc thêm mới
          if (!props.isEdit || selectedFile.value === null) {
            previewImage.value = null
            selectedFile.value = null
          }
        } else {
          // Reset form khi thêm mới
          formData.value = {
            tenHomestay: '',
            idLoaiHomeStay: null,
            idChuHomeStay: null,
            dienTich: 0,
            giaCaHomestay: 0,
            diaChi: '',
            tinhTrang: 'Còn phòng',
            trangThai: true,
            hinhAnh: '',
            maHomestay: '',
            ngayTao: null,
            ngayUpdate: null,
          }
          previewImage.value = null
          selectedFile.value = null
        }
      },
      { immediate: true },
    )

    return {
      formData,
      handleFileUpload,
      handleSubmit,
      getImageUrl,
      isSubmitting,
      errors,
      fileInput,
      triggerFileInput,
      previewImage,
      selectedFile,
      handleImageError,
      modalTitle,
      getLoaiName,
      getChuName,
      formatCurrency,
      formatDate,
      viewDetailImages,
    }
  },
}
</script>

<style scoped>
/* Modal overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(30, 41, 59, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
  transition: opacity 0.3s ease;
}

/* Modal container */
.homestay-details-modal {
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  width: 800px;
  max-width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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

/* Modal header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #343a40;
}

.close-button {
  position: relative;
  top: -2px;
  background: #f1f5f9;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

/* Modal body */
.modal-body {
  padding: 25px;
}

/* Avatar section */
.homestay-avatar-display {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  border: 2px dashed #d1d5db;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  background-color: #f9fafb;
  transition: all 0.3s ease;
  margin-bottom: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.avatar-preview:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #9ca3af;
  height: 100%;
  width: 100%;
  justify-content: center;
}

.avatar-placeholder i {
  font-size: 50px;
  margin-bottom: 10px;
}

.avatar-placeholder span {
  font-size: 14px;
  text-align: center;
}

.uploaded-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.homestay-avatar-display h4 {
  font-size: 1.2rem;
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
}

.homestay-avatar-display .homestay-id {
  font-size: 0.85rem;
  color: #6c757d;
}

.status-badge {
  padding-top: 15px;
  text-align: center;
}

.status-badge label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge .badge {
  font-size: 0.9rem;
  padding: 6px 12px;
}

/* Form styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}

.form-control,
.form-select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.form-control:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  outline: none;
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #ef4444;
}

.invalid-feedback {
  color: #ef4444;
  font-size: 14px;
  margin-top: 5px;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 0;
  border-top: 1px solid #e5e7eb;
  margin-top: 20px;
}

.btn {
  font-size: 1rem;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #475569;
  border: none;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

.btn-primary {
  background-color: #0d6efd;
  border: none;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.7;
  transform: none;
}

/* Add additional styles for view mode */
.staff-info .form-control[readonly] {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  cursor: text;
  padding: 8px 12px;
  font-size: 0.95rem;
}

.staff-info .form-group {
  margin-bottom: 12px;
}

.staff-info label {
  font-size: 0.9rem;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

/* Avatar preview in view mode shouldn't have pointer cursor */
.avatar-preview.view-mode {
  cursor: default;
  pointer-events: none;
}

.avatar-preview.view-mode:hover {
  border-color: #d1d5db;
  transform: none;
}
</style>

