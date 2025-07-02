<!-- VoucherModal.vue -->
<template>
      <div class="modal-content">
        <div class="modal-header">
      <h3 class="modal-title">
            {{ isEdit ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới' }}
      </h3>
      <button type="button" class="close-button" @click="$emit('close')" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Tên giảm giá <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.tenGiamGia }"
                v-model="form.tenGiamGia"
                placeholder="Nhập tên giảm giá"
              />
              <div class="invalid-feedback" v-if="errors.tenGiamGia">
                {{ errors.tenGiamGia }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                Giá trị <span class="text-danger">*</span>
                <small>(0-100%)</small>
              </label>
              <input
                type="number"
                class="form-control"
                :class="{ 'is-invalid': errors.giaTri }"
                v-model.number="form.giaTri"
                min="0"
                max="100"
                step="1"
                placeholder="Nhập % giảm giá"
              />
              <div class="invalid-feedback" v-if="errors.giaTri">
                {{ errors.giaTri }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Giá trị tối thiểu</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.giaTriToiThieu"
                min="0"
                step="1000"
                placeholder="Nhập giá trị tối thiểu để áp dụng"
              />
              <small class="text-muted">Giá trị đơn hàng tối thiểu để áp dụng mã giảm giá</small>
            </div>

            <!-- Thêm trường giảm tối đa cho loại phần trăm -->
            <div class="form-group">
              <label class="form-label">Giảm tối đa</label>
              <input
                type="number"
                class="form-control"
                :class="{ 'is-invalid': errors.giamToiDa }"
                v-model.number="form.giamToiDa"
                min="0"
                step="1000"
                placeholder="Nhập giá trị giảm tối đa"
              />
              <div class="invalid-feedback" v-if="errors.giamToiDa">
                {{ errors.giamToiDa }}
              </div>
              <small class="text-muted">Giới hạn số tiền tối đa được giảm (để trống nếu không giới hạn)</small>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Ngày bắt đầu <span class="text-danger">*</span></label>
              <input
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.ngayBatDau }"
                v-model="form.ngayBatDau"
                :min="today"
              />
              <div class="invalid-feedback" v-if="errors.ngayBatDau">
                {{ errors.ngayBatDau }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Ngày kết thúc <span class="text-danger">*</span></label>
              <input
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.ngayKetThuc }"
                v-model="form.ngayKetThuc"
                :min="form.ngayBatDau || today"
              />
              <div class="invalid-feedback" v-if="errors.ngayKetThuc">
                {{ errors.ngayKetThuc }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Số lượng</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.soLuong"
                min="0"
                placeholder="Để trống hoặc 0 nếu không giới hạn"
              />
              <small class="text-muted">Để trống hoặc 0 nếu không giới hạn số lượng</small>
            </div>

            <div class="form-group">
              <label class="form-label">Homestay áp dụng <span class="text-danger">*</span></label>
              <select
                class="form-select"
                v-model="form.homeStayId"
                :class="{ 'is-invalid': errors.homeStayId }"
                required
              >
                <option value="">-- Chọn homestay --</option>
                <option v-for="hs in homeStayList" :key="hs.id" :value="hs.id">
                  {{ hs.tenHomeStay || hs.tenHomestay }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.homeStayId">
                {{ errors.homeStayId }}
              </div>
            </div>
          </div>
        </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Hủy
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="handleSubmit"
            :disabled="isSubmitting"
          >
        <span
          v-if="isSubmitting"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        <span v-else>{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</span>
          </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getAllHomeStay } from '@/Service/HomeStayService.js';

export default {
  name: 'VoucherModal',
  props: {
    voucher: {
      type: Object,
      default: () => ({})
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const form = ref({
      id: null,
      maGiamGia: '',
      tenGiamGia: '',
      loaiGiamGia: 'PhanTram',
      giaTri: 0,
      giaTriToiThieu: 0,
      giamToiDa: null,
      ngayBatDau: null,
      ngayKetThuc: null,
      soLuong: 0,
      trangThai: true,
      homeStayId: ''
    });
    const homeStayList = ref([]);

    onMounted(async () => {
      // Lấy danh sách homestay
      try {
        const res = await getAllHomeStay();
        homeStayList.value = res.data;
      } catch {
        homeStayList.value = [];
      }
      if (props.isEdit && props.voucher) {
        form.value = {
          id: props.voucher.id,
          maGiamGia: props.voucher.maGiamGia || '',
          tenGiamGia: props.voucher.tenGiamGia || '',
          loaiGiamGia: props.voucher.loaiGiamGia || 'PhanTram',
          giaTri: props.voucher.giaTri || 0,
          giaTriToiThieu: props.voucher.giaTriToiThieu || 0,
          giamToiDa: props.voucher.giamToiDa || null,
          ngayBatDau: props.voucher.ngayBatDau ? new Date(props.voucher.ngayBatDau).toISOString().split('T')[0] : null,
          ngayKetThuc: props.voucher.ngayKetThuc ? new Date(props.voucher.ngayKetThuc).toISOString().split('T')[0] : null,
          soLuong: props.voucher.soLuong || 0,
          trangThai: props.voucher.trangThai ?? true,
          homeStayId: props.voucher.homeStayId || ''
        };
      }
    });

    const errors = ref({});
    const isSubmitting = ref(false);

    const today = computed(() => {
      const date = new Date();
      return date.toISOString().split('T')[0];
    });

    const validateForm = () => {
      const newErrors = {};

      if (!form.value.tenGiamGia?.trim()) {
        newErrors.tenGiamGia = 'Tên giảm giá không được để trống';
      }

      if (!form.value.giaTri || form.value.giaTri <= 0) {
        newErrors.giaTri = 'Giá trị phải lớn hơn 0';
      } else if (form.value.loaiGiamGia === 'PhanTram' && form.value.giaTri > 100) {
        newErrors.giaTri = 'Phần trăm giảm giá không được vượt quá 100%';
      }

      if (!form.value.ngayBatDau) {
        newErrors.ngayBatDau = 'Ngày bắt đầu không được để trống';
      }

      if (!form.value.ngayKetThuc) {
        newErrors.ngayKetThuc = 'Ngày kết thúc không được để trống';
      }

      if (form.value.ngayBatDau && form.value.ngayKetThuc &&
          new Date(form.value.ngayBatDau) >= new Date(form.value.ngayKetThuc)) {
        newErrors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
      }

      if (!form.value.homeStayId) {
        newErrors.homeStayId = 'Vui lòng chọn homestay áp dụng';
      }

      // Validate giảm tối đa khi loại giảm giá là phần trăm
      if (form.value.loaiGiamGia === 'PhanTram' && form.value.giamToiDa !== null && form.value.giamToiDa <= 0) {
        newErrors.giamToiDa = 'Giá trị giảm tối đa phải lớn hơn 0';
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        isSubmitting.value = true;
        await emit('save', form.value);
      } catch (error) {
        console.error('Error submitting voucher form:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      form,
      homeStayList,
      errors,
      isSubmitting,
      today,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.modal-content {
  border-radius: 16px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  width: 800px;
  max-width: 95%;
  max-height: 95vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8f9fa;
}

.modal-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #343a40;
}

.close-button {
  position: relative;
  top: 0;
  right: 0;
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

.modal-body {
  padding: 25px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 25px;
  border-top: 1px solid #e5e7eb;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.15s, box-shadow 0.15s;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
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

.text-danger {
  color: #ef4444;
}

.text-muted {
  color: #6b7280;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}

/* Gender Radio Group */
.form-check-group {
  display: flex;
  gap: 30px;
  margin-top: 10px;
}

.form-check {
  display: flex;
  align-items: center;
}

.form-check-input {
  margin-right: 8px;
  width: 18px;
  height: 18px;
}

.form-check-label {
  font-size: 16px;
  color: #4b5563;
  cursor: pointer;
}

/* Button styles */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(45deg, #0d6efd, #0099ff);
  border: none;
  color: white;
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
  background: linear-gradient(45deg, #0a58ca, #0077cc);
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #475569;
  border: none;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
  }

  .form-check-group {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
