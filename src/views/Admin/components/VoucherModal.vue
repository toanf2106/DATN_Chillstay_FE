<!-- VoucherModal.vue -->
<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-wrapper">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEdit ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Tên giảm giá: <span class="text-danger">*</span></label>
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

            <div class="mb-3">
              <label class="form-label">Loại giảm giá: <span class="text-danger">*</span></label>
              <select
                class="form-select"
                v-model="form.loaiGiamGia"
              >
                <option value="PhanTram">Phần trăm</option>
                <option value="SoTien">Số tiền</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">
                Giá trị: <span class="text-danger">*</span>
                <small v-if="form.loaiGiamGia === 'PhanTram'">(0-100%)</small>
              </label>
              <input
                type="number"
                class="form-control"
                :class="{ 'is-invalid': errors.giaTri }"
                v-model.number="form.giaTri"
                min="0"
                :max="form.loaiGiamGia === 'PhanTram' ? 100 : null"
                :step="form.loaiGiamGia === 'PhanTram' ? 1 : 1000"
                :placeholder="form.loaiGiamGia === 'PhanTram' ? 'Nhập % giảm giá' : 'Nhập số tiền giảm'"
              />
              <div class="invalid-feedback" v-if="errors.giaTri">
                {{ errors.giaTri }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Giá trị tối thiểu:</label>
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

            <div class="mb-3">
              <label class="form-label">Ngày bắt đầu: <span class="text-danger">*</span></label>
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

            <div class="mb-3">
              <label class="form-label">Ngày kết thúc: <span class="text-danger">*</span></label>
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

            <div class="mb-3">
              <label class="form-label">Số lượng:</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.soLuong"
                min="0"
                placeholder="Để trống hoặc 0 nếu không giới hạn"
              />
              <small class="text-muted">Để trống hoặc 0 nếu không giới hạn số lượng</small>
            </div>

            <div class="mb-3">
              <label class="form-label">Homestay áp dụng: <span class="text-danger">*</span></label>
              <select
                class="form-select"
                v-model="form.homeStayId"
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
            {{ isSubmitting ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm mới') }}
          </button>
        </div>
      </div>
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

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;

      isSubmitting.value = true;
      try {
        await emit('save', { ...form.value });
        emit('close');
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      form,
      errors,
      isSubmitting,
      today,
      handleSubmit,
      homeStayList
    };
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-wrapper {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.modal-content {
  background-color: white;
  border-radius: 0.3rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
}

.invalid-feedback {
  display: block;
}

.form-check {
  margin-top: 1rem;
}
</style>
