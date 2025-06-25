<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ isEdit ? 'Chỉnh sửa' : 'Thêm mới' }} Homestay</h5>
        <button type="button" class="btn-close" @click="$emit('close')"></button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label class="form-label">Tên Homestay <span class="text-danger">*</span></label>
            <input
              v-model="formData.tenHomestay"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.tenHomestay }"
              required
            >
            <div v-if="errors.tenHomestay" class="invalid-feedback">
              {{ errors.tenHomestay }}
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Loại Homestay <span class="text-danger">*</span></label>
                <select
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
              <div class="mb-3">
                <label class="form-label">Chủ sở hữu <span class="text-danger">*</span></label>
                <select
                  v-model="formData.idChuHomeStay"
                  class="form-select"
                  :class="{ 'is-invalid': errors.idChuHomeStay }"
                  required
                >
                  <option value="" disabled selected>-- Chọn chủ sở hữu --</option>
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
              <div class="mb-3">
                <label class="form-label">Diện tích (m²) <span class="text-danger">*</span></label>
                <input
                  v-model="formData.dienTich"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.dienTich }"
                  min="0.01"
                  step="any"
                  placeholder="Nhập diện tích (VD: 25.5)"
                  required
                >
                <div v-if="errors.dienTich" class="invalid-feedback">
                  {{ errors.dienTich }}
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Giá (VND) <span class="text-danger">*</span></label>
                <input
                  v-model.number="formData.giaCaHomestay"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.giaCaHomestay }"
                  min="1000"
                  required
                >
                <div v-if="errors.giaCaHomestay" class="invalid-feedback">
                  {{ errors.giaCaHomestay }}
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Địa chỉ <span class="text-danger">*</span></label>
            <input
              v-model="formData.diaChi"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.diaChi }"
              required
            >
            <div v-if="errors.diaChi" class="invalid-feedback">
              {{ errors.diaChi }}
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Tình trạng</label>
                <select v-model="formData.tinhTrang" class="form-select" required>
                  <option value="Còn phòng">Còn phòng</option>
                  <option value="Hết phòng">Hết phòng</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Trạng thái</label>
                <select v-model="formData.trangThai" class="form-select" required>
                  <option :value="true">Hoạt động</option>
                  <option :value="false">Khóa</option>
                </select>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Hình ảnh</label>
            <input type="file" class="form-control" @change="handleFileUpload" accept="image/*">
            <div v-if="formData.hinhAnh" class="mt-2">
              <img :src="getImageUrl(formData.hinhAnh)" class="img-thumbnail" style="max-height: 100px;">
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              <i class="fas fa-times me-1"></i> Hủy
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ isSubmitting ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Lưu') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { uploadImage } from '@/Service/HomeStayService';

export default {
  name: 'HomestayModal',
  props: {
    homestay: {
      type: Object,
      default: null
    },
    loaiList: {
      type: Array,
      required: true
    },
    chuList: {
      type: Array,
      required: true
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'close'],
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
      ngayUpdate: null
    });

    const isSubmitting = ref(false);
    const errors = ref({});

    const validateForm = () => {
      const newErrors = {};

      if (!formData.value.tenHomestay?.trim()) {
        newErrors.tenHomestay = 'Tên Homestay không được để trống';
      }

      if (!formData.value.idLoaiHomeStay) {
        newErrors.idLoaiHomeStay = 'Vui lòng chọn loại Homestay';
      }

      if (!formData.value.idChuHomeStay) {
        newErrors.idChuHomeStay = 'Vui lòng chọn chủ sở hữu';
      }

      // Kiểm tra diện tích là số hợp lệ và lớn hơn 0
      const dienTich = parseFloat(formData.value.dienTich);
      if (isNaN(dienTich) || dienTich <= 0) {
        newErrors.dienTich = 'Diện tích phải là số dương lớn hơn 0';
      }

      if (!formData.value.giaCaHomestay || formData.value.giaCaHomestay <= 0) {
        newErrors.giaCaHomestay = 'Giá phải lớn hơn 0';
      }

      if (!formData.value.diaChi?.trim()) {
        newErrors.diaChi = 'Địa chỉ không được để trống';
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const getImageUrl = (img) => img ? `/resources/images/homestay/${img}` : '';

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await uploadImage(formData);
          formData.value.hinhAnh = response.data.filename;
        } catch (error) {
          console.error('Lỗi khi tải lên ảnh:', error);
          alert('Có lỗi xảy ra khi tải lên ảnh');
        }
      }
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      isSubmitting.value = true;
      try {
        await emit('save', { ...formData.value });
        // Không cần đóng modal ở đây vì component cha sẽ quyết định
      } catch (error) {
        console.error('Lỗi khi lưu homestay:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    // Nếu là chỉnh sửa, điền dữ liệu hiện có
    watch(() => props.homestay, (newVal) => {
      if (newVal) {
        formData.value = { ...newVal };
      }
    }, { immediate: true });

    return {
      formData,
      handleFileUpload,
      handleSubmit,
      getImageUrl,
      isSubmitting,
      errors
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.btn-close {
  padding: 0.5rem;
  margin: -0.5rem -0.5rem -0.5rem auto;
  background: transparent;
  border: 0;
  font-size: 1.5rem;
  line-height: 1;
  opacity: 0.5;
  cursor: pointer;
}
</style>
