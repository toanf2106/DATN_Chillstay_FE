<!-- VoucherModal.vue -->
<template>
  <div class="modal d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEdit ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3" v-if="isEdit">
              <label class="form-label">Mã giảm giá:</label>
              <input
                type="text"
                class="form-control"
                v-model="form.maGiamGia"
                disabled
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Tên giảm giá: <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                v-model="form.tenGiamGia"
                required
                :class="{ 'is-invalid': errors.tenGiamGia }"
              />
              <div class="invalid-feedback">{{ errors.tenGiamGia }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Loại giảm giá: <span class="text-danger">*</span></label>
              <select
                class="form-select"
                v-model="form.loaiGiamGia"
                required
                :class="{ 'is-invalid': errors.loaiGiamGia }"
              >
                <option value="PhanTram">Phần trăm</option>
                <option value="SoTien">Số tiền</option>
              </select>
              <div class="invalid-feedback">{{ errors.loaiGiamGia }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">
                Giá trị: <span class="text-danger">*</span>
                <small v-if="form.loaiGiamGia === 'PhanTram'">(0-100%)</small>
              </label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.giaTri"
                required
                :min="0"
                :max="form.loaiGiamGia === 'PhanTram' ? 100 : null"
                :step="form.loaiGiamGia === 'PhanTram' ? '0.1' : '1000'"
                :class="{ 'is-invalid': errors.giaTri }"
              />
              <div class="invalid-feedback">{{ errors.giaTri }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Giá trị tối thiểu:</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.giaTriToiThieu"
                min="0"
                step="1000"
                :class="{ 'is-invalid': errors.giaTriToiThieu }"
              />
              <div class="invalid-feedback">{{ errors.giaTriToiThieu }}</div>
              <small class="text-muted">Giá trị đơn hàng tối thiểu để áp dụng mã giảm giá</small>
            </div>

            <div class="mb-3">
              <label class="form-label">Ngày bắt đầu: <span class="text-danger">*</span></label>
              <input
                type="date"
                class="form-control"
                v-model="form.ngayBatDau"
                required
                :min="today"
                :class="{ 'is-invalid': errors.ngayBatDau }"
              />
              <div class="invalid-feedback">{{ errors.ngayBatDau }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Ngày kết thúc: <span class="text-danger">*</span></label>
              <input
                type="date"
                class="form-control"
                v-model="form.ngayKetThuc"
                required
                :min="form.ngayBatDau || today"
                :class="{ 'is-invalid': errors.ngayKetThuc }"
              />
              <div class="invalid-feedback">{{ errors.ngayKetThuc }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Số lượng:</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.soLuong"
                min="0"
                :class="{ 'is-invalid': errors.soLuong }"
              />
              <div class="invalid-feedback">{{ errors.soLuong }}</div>
              <small class="text-muted">Để trống hoặc 0 nếu không giới hạn số lượng</small>
            </div>

            <div class="mb-3">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  v-model="form.trangThai"
                  id="trangThai"
                />
                <label class="form-check-label" for="trangThai">
                  {{ form.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Hủy
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm mới') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'VoucherModal',
  props: {
    voucher: {
      type: Object,
      required: true
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const form = ref({
      id: props.voucher?.id,
      maGiamGia: props.voucher?.maGiamGia || '',
      tenGiamGia: props.voucher?.tenGiamGia || '',
      loaiGiamGia: props.voucher?.loaiGiamGia || 'PhanTram',
      giaTri: props.voucher?.giaTri || 0,
      giaTriToiThieu: props.voucher?.giaTriToiThieu || 0,
      ngayBatDau: props.voucher?.ngayBatDau || null,
      ngayKetThuc: props.voucher?.ngayKetThuc || null,
      soLuong: props.voucher?.soLuong || 0,
      trangThai: props.voucher?.trangThai ?? true
    });

    const errors = ref({});
    const isSubmitting = ref(false);

    const today = computed(() => {
      const date = new Date();
      return date.toISOString().split('T')[0];
    });

    const validateForm = () => {
      const newErrors = {};

      if (!form.value.tenGiamGia.trim()) {
        newErrors.tenGiamGia = 'Tên giảm giá không được để trống';
      }

      if (!form.value.loaiGiamGia) {
        newErrors.loaiGiamGia = 'Vui lòng chọn loại giảm giá';
      }

      if (form.value.giaTri < 0) {
        newErrors.giaTri = 'Giá trị giảm giá không được âm';
      }

      if (form.value.loaiGiamGia === 'PhanTram' && form.value.giaTri > 100) {
        newErrors.giaTri = 'Giá trị phần trăm không được vượt quá 100%';
      }

      if (form.value.giaTriToiThieu < 0) {
        newErrors.giaTriToiThieu = 'Giá trị tối thiểu không được âm';
      }

      if (!form.value.ngayBatDau) {
        newErrors.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
      }

      if (!form.value.ngayKetThuc) {
        newErrors.ngayKetThuc = 'Vui lòng chọn ngày kết thúc';
      }

      if (form.value.ngayBatDau && form.value.ngayKetThuc &&
          new Date(form.value.ngayBatDau) > new Date(form.value.ngayKetThuc)) {
        newErrors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
      }

      if (form.value.soLuong < 0) {
        newErrors.soLuong = 'Số lượng không được âm';
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;

      isSubmitting.value = true;
      try {
        // Create a new object with all necessary fields
        const formData = {
          ...form.value,
          id: props.voucher?.id,
          maGiamGia: props.isEdit ? props.voucher.maGiamGia : form.value.maGiamGia
        };

        // Convert dates to proper format
        if (formData.ngayBatDau) {
          formData.ngayBatDau = new Date(formData.ngayBatDau).toISOString().split('T')[0];
        }
        if (formData.ngayKetThuc) {
          formData.ngayKetThuc = new Date(formData.ngayKetThuc).toISOString().split('T')[0];
        }

        await emit('save', formData);
      } finally {
        isSubmitting.value = false;
      }
    };

    onMounted(() => {
      // Format dates if they exist
      if (props.voucher?.ngayBatDau) {
        form.value.ngayBatDau = new Date(props.voucher.ngayBatDau)
          .toISOString().split('T')[0];
      }
      if (props.voucher?.ngayKetThuc) {
        form.value.ngayKetThuc = new Date(props.voucher.ngayKetThuc)
          .toISOString().split('T')[0];
      }
    });

    return {
      form,
      errors,
      isSubmitting,
      today,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.form-label {
  font-weight: 500;
}

.text-danger {
  color: #dc3545;
}

.invalid-feedback {
  display: block;
}
</style>
