<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="phong-details-modal">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-button" @click="$emit('close')">&times;</button>
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
                      <label for="idloaiPhong">Loại Phòng <span class="text-danger">*</span></label>
                      <select
                        id="idloaiPhong"
                        v-model="formData.idloaiPhong.id"
                        class="form-select"
                        :class="{ 'is-invalid': errors.idloaiPhong }"
                        required
                      >
                        <option value="" disabled selected>Chọn loại phòng</option>
                        <option
                          v-for="loai in loaiPhongList"
                          :key="loai.id"
                          :value="loai.id"
                        >
                          {{ loai.tenLoai || loai.tenLoaiPhong }}
                        </option>
                      </select>
                      <div v-if="errors.idloaiPhong" class="invalid-feedback">
                        {{ errors.idloaiPhong }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="idhomeStay">Homestay <span class="text-danger">*</span></label>
                      <select
                        id="idhomeStay"
                        v-model="formData.idhomeStay.id"
                        class="form-select"
                        :class="{ 'is-invalid': errors.idhomeStay }"
                        required
                      >
                        <option value="" disabled selected>Chọn Homestay</option>
                        <option
                          v-for="homestay in homestayList"
                          :key="homestay.id"
                          :value="homestay.id"
                        >
                          {{ homestay.tenHomestay }}
                        </option>
                      </select>
                      <div v-if="errors.idhomeStay" class="invalid-feedback">
                        {{ errors.idhomeStay }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="dienTich">Diện tích (m²) <span class="text-danger">*</span></label>
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
                      <label for="soNguoiToiDa">Số người tối đa <span class="text-danger">*</span></label>
                      <input
                        id="soNguoiToiDa"
                        v-model.number="formData.soNguoiToiDa"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.soNguoiToiDa }"
                        min="1"
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
                    rows="3"
                    placeholder="Nhập mô tả về phòng"
                  ></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="tangSo">Tầng số <span class="text-danger">*</span></label>
                      <input
                        id="tangSo"
                        v-model.number="formData.tangSo"
                        type="number"
                        class="form-control"
                        min="1"
                        required
                      />
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
              <div v-if="isViewMode" class="phong-info">
                <div class="form-group">
                  <label>Tên Phòng</label>
                  <input type="text" class="form-control" :value="formData.tenPhong" readonly />
                </div>

                <div class="form-group">
                  <label>Loại Phòng</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="getLoaiPhongName(formData.idloaiPhong.id)"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Homestay</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="getHomestayName(formData.idhomeStay.id)"
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
                      <label>Số người tối đa</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formData.soNguoiToiDa"
                        readonly
                      />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>Mô tả</label>
                  <textarea
                    class="form-control"
                    rows="3"
                    :value="formData.moTa"
                    readonly
                  ></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Tầng số</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formData.tangSo"
                        readonly
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Trạng thái</label>
                      <div class="form-control bg-light">
                        <span :class="`badge ${formData.trangThai ? 'bg-success' : 'bg-danger'}`">
                          {{ formData.trangThai ? 'Hoạt động' : 'Khóa' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
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
                  <div class="col-md-6">
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
                  v-if="isViewMode"
                  type="button"
                  class="btn btn-primary"
                  @click="$emit('edit')"
                >
                  <i class="fas fa-edit me-1"></i> Chỉnh sửa
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
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from '@/stores/notificationStore'
import {
  addPhong,
  updatePhong,
  addPhongWithImage,
  updatePhongWithImage
} from '@/Service/phongService'

export default {
  name: 'PhongModal',
  props: {
    phong: {
      type: Object,
      default: null,
    },
    loaiPhongList: {
      type: Array,
      required: true,
    },
    homestayList: {
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
    const toast = useToast()
    const formData = ref({
      idloaiPhong: { id: null },
      idhomeStay: { id: null },
      tenPhong: '',
      dienTich: 0,
      moTa: '',
      tangSo: 1,
      soNguoiLon: 0,
      soNguoiNho: 0,
      soNguoiToiDa: 0,
      ngayTao: null,
      ngayUpdate: null,
      anhBia: '',
      trangThai: true,
      maPhong: '',
    })

    const isSubmitting = ref(false)
    const errors = ref({})
    const fileInput = ref(null)
    const previewImage = ref(null)
    const selectedFile = ref(null)

    // Computed property for modal title based on mode
    const modalTitle = computed(() => {
      if (props.isViewMode) return 'Chi tiết Phòng'
      return props.isEdit ? 'Chỉnh sửa Phòng' : 'Thêm mới Phòng'
    })

    const validateForm = () => {
      const newErrors = {}

      if (!formData.value.tenPhong?.trim()) {
        newErrors.tenPhong = 'Tên Phòng không được để trống'
      }

      if (!formData.value.idloaiPhong.id) {
        newErrors.idloaiPhong = 'Vui lòng chọn loại phòng'
      }

      if (!formData.value.idhomeStay.id) {
        newErrors.idhomeStay = 'Vui lòng chọn homestay'
      }

      // Kiểm tra diện tích là số hợp lệ và lớn hơn 0
      const dienTich = parseFloat(formData.value.dienTich)
      if (isNaN(dienTich) || dienTich <= 0) {
        newErrors.dienTich = 'Diện tích phải là số dương lớn hơn 0'
      }

      if (!formData.value.soNguoiToiDa || formData.value.soNguoiToiDa <= 0) {
        newErrors.soNguoiToiDa = 'Số người tối đa phải lớn hơn 0'
      }

      errors.value = newErrors
      return Object.keys(newErrors).length === 0
    }

    const getImageUrl = (img) => {
      if (!img) return '/images/placeholder-house.jpg'

      // Nếu là URL GCS hoặc URL đầy đủ
      if (img.startsWith('http')) {
        // Đảm bảo URL an toàn bằng cách mã hóa các ký tự đặc biệt
        return encodeURI(img)
      }

      // Nếu không có http prefix, thêm vào
      return `http://localhost:8080${img.startsWith('/') ? '' : '/'}${img}`
    }

    // Helper functions for view mode
    const getLoaiPhongName = (id) => {
      const loai = props.loaiPhongList.find((l) => l.id === id)
      return loai ? loai.tenLoai || loai.tenLoaiPhong : 'Không xác định'
    }

    const getHomestayName = (id) => {
      const homestay = props.homestayList.find((h) => h.id === id)
      return homestay ? homestay.tenHomestay : 'Không xác định'
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Ngày không hợp lệ'

      return date.toLocaleDateString('vi-VN')
    }

    // Xử lý tải lên ảnh
    const triggerFileInput = () => {
      if (props.isViewMode) return
      fileInput.value.click()
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        // Kiểm tra kích thước file
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Kích thước file không được vượt quá 5MB')
          return
        }

        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
          toast.error('Vui lòng chọn file hình ảnh')
          return
        }

        selectedFile.value = file
        const reader = new FileReader()
        reader.onload = (e) => {
          previewImage.value = e.target.result

          // Cập nhật anhBia trong formData để hiển thị preview
          // Lưu ý: Đây chỉ là hiển thị tạm thời, anhBia thực sự sẽ được cập nhật khi lưu

          // Hiển thị thông báo cho người dùng biết ảnh sẽ được lưu khi lưu phòng
          toast.info('Ảnh bìa sẽ được cập nhật khi bạn lưu thông tin phòng')
        }
        reader.readAsDataURL(file)
      }
    }

    const handleImageError = (event) => {
      event.target.src = '/images/placeholder-house.jpg'
    }

    const handleImageLoaded = () => {
      // Xử lý khi ảnh đã tải xong
    }

    // Computed property để tính tổng số người
    const calculateTotalPeople = computed(() => {
      const nguoiLon = parseInt(formData.value.soNguoiLon) || 0
      const nguoiNho = parseInt(formData.value.soNguoiNho) || 0
      return nguoiLon + nguoiNho
    })

    const updateTotalPeople = () => {
      formData.value.soNguoiToiDa = calculateTotalPeople.value
    }

    const updateTotalCapacity = () => {
      updateTotalPeople()
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
          // Log để kiểm tra
          console.log('Đã thêm file:', selectedFile.value.name)
        }

        // Chuẩn bị dữ liệu phòng
        const phongData = { ...formData.value }

        // Sử dụng ID trực tiếp thay vì đối tượng lồng nhau
        if (phongData.idloaiPhong && phongData.idloaiPhong.id) {
          phongData.LoaiPhong_ID = parseInt(phongData.idloaiPhong.id, 10)
          delete phongData.idloaiPhong
        }

        if (phongData.idhomeStay && phongData.idhomeStay.id) {
          phongData.HomeStay_ID = parseInt(phongData.idhomeStay.id, 10)
          delete phongData.idhomeStay
        }

        // Đảm bảo các trường số được chuyển đổi đúng
        if (phongData.dienTich) {
          phongData.dienTich = parseFloat(phongData.dienTich)
        }

        if (phongData.soNguoiToiDa) {
          phongData.soNguoiToiDa = parseInt(phongData.soNguoiToiDa, 10)
        }

        if (phongData.tangSo) {
          phongData.tangSo = parseInt(phongData.tangSo, 10)
        }

        if (phongData.soNguoiLon) {
          phongData.soNguoiLon = parseInt(phongData.soNguoiLon, 10)
        }

        if (phongData.soNguoiNho) {
          phongData.soNguoiNho = parseInt(phongData.soNguoiNho, 10)
        }

        // Nếu là chỉnh sửa, đảm bảo có ID
        if (props.isEdit && props.phong && props.phong.id) {
          phongData.id = parseInt(props.phong.id, 10)
        }

        // Thêm dữ liệu phòng dạng JSON
        formDataToSend.append('phong', JSON.stringify(phongData))
        console.log('FormData đã sẵn sàng để gửi')

        let response;

        // Sử dụng API endpoints mới nếu có file ảnh, ngược lại sử dụng API cũ
        if (selectedFile.value) {
          // Có file ảnh, sử dụng API mới với hỗ trợ upload ảnh
          if (props.isEdit && phongData.id) {
            // Cập nhật phòng với ảnh
            toast.info('Đang cập nhật phòng và tải lên ảnh bìa...')
            response = await updatePhongWithImage(phongData.id, formDataToSend)
          } else {
            // Thêm mới phòng với ảnh
            toast.info('Đang thêm phòng mới và tải lên ảnh bìa...')
            response = await addPhongWithImage(formDataToSend)
          }
        } else {
          // Không có file ảnh, sử dụng API cũ
          if (props.isEdit && phongData.id) {
            response = await updatePhong(phongData.id, formDataToSend)
          } else {
            response = await addPhong(formDataToSend)
          }
        }

        // Gọi hàm lưu từ component cha
        await emit('save', response.data)

        // Reset file input sau khi lưu thành công
        if (fileInput.value) {
          fileInput.value.value = ''
        }

        // Thông báo thành công
        const action = props.isEdit ? 'cập nhật' : 'thêm mới'
        toast.success(`Đã ${action} phòng thành công`)
      } catch (error) {
        console.error('Lỗi khi lưu phòng:', error)
        toast.error('Có lỗi xảy ra khi lưu phòng')
      } finally {
        isSubmitting.value = false
      }
    }

    const viewDetailImages = () => {
      // Đóng modal chi tiết phòng trước khi mở modal ảnh
      emit('close')
      // Sau đó gọi sự kiện để mở modal ảnh
      emit('view-images', formData.value)
    }

    // Nếu là chỉnh sửa, điền dữ liệu hiện có
    watch(
      () => props.phong,
      (newVal) => {
        if (newVal) {
          // Copy dữ liệu từ props vào form
          formData.value = { ...newVal }

          // Đảm bảo idloaiPhong và idhomeStay có cấu trúc đúng
          if (typeof formData.value.idloaiPhong !== 'object' || formData.value.idloaiPhong === null) {
            formData.value.idloaiPhong = { id: formData.value.idloaiPhong ? parseInt(formData.value.idloaiPhong, 10) : null }
          }

          if (typeof formData.value.idhomeStay !== 'object' || formData.value.idhomeStay === null) {
            formData.value.idhomeStay = { id: formData.value.idhomeStay ? parseInt(formData.value.idhomeStay, 10) : null }
          }

          // Chỉ reset preview image khi mở một phòng mới hoặc thêm mới
          if (!props.isEdit || selectedFile.value === null) {
            previewImage.value = null
            selectedFile.value = null
          }
        } else {
          // Reset form khi thêm mới
          formData.value = {
            idloaiPhong: { id: null },
            idhomeStay: { id: null },
            tenPhong: '',
            dienTich: 0,
            moTa: '',
            tangSo: 1,
            soNguoiLon: 0,
            soNguoiNho: 0,
            soNguoiToiDa: 0,
            ngayTao: null,
            ngayUpdate: null,
            anhBia: '',
            trangThai: true,
            maPhong: '',
          }
          previewImage.value = null
          selectedFile.value = null
        }
      },
      { immediate: true }
    )

    // Watch để cập nhật số người tối đa khi thay đổi số người lớn hoặc trẻ em
    watch(
      [() => formData.value.soNguoiLon, () => formData.value.soNguoiNho],
      () => {
        updateTotalPeople()
      }
    )

    return {
      formData,
      errors,
      isSubmitting,
      fileInput,
      previewImage,
      selectedFile,
      modalTitle,
      calculateTotalPeople,
      updateTotalPeople,
      validateForm,
      triggerFileInput,
      handleFileUpload,
      handleImageError,
      handleImageLoaded,
      handleSubmit,
      getImageUrl,
      getLoaiPhongName,
      getHomestayName,
      formatDate,
      updateTotalCapacity,
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
.phong-details-modal {
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
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s;
}

.close-button:hover {
  color: #dc3545;
}

/* Modal body */
.modal-body {
  padding: 25px;
}

/* Avatar display */
.phong-avatar-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  border: 2px dashed #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background-color: #f1f5f9;
  transition: all 0.3s ease;
}

.avatar-preview:hover {
  border-color: #3b82f6;
}

.avatar-preview.view-mode {
  cursor: default;
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #64748b;
}

.avatar-placeholder i {
  font-size: 48px;
  margin-bottom: 10px;
}

.uploaded-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.phong-id {
  color: #64748b;
  font-size: 0.85rem;
}

.status-badge {
  margin-top: 15px;
  text-align: center;
}

.status-badge label {
  margin-right: 5px;
  font-weight: 600;
  color: #4b5563;
}

.status-badge .badge {
  font-size: 0.85rem;
  padding: 5px 10px;
  border-radius: 6px;
}

/* Form styling */
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}

.form-control, .form-select {
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  padding: 10px 12px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus, .form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.form-control.is-invalid, .form-select.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 5px;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

/* Modal footer */
.modal-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}

.btn-info {
  background-color: #0dcaf0;
  color: white;
  border: none;
}

.btn-info:hover {
  background-color: #0bacce;
}

/* Read-only view styling */
.phong-info .form-control,
.phong-info .form-select,
.phong-info textarea {
  background-color: #f8f9fa;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .avatar-preview {
    width: 150px;
    height: 150px;
    margin-bottom: 20px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
