<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="loai-homestay-details-modal">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Form for edit/add mode -->
          <div v-if="!isViewMode">
            <div class="form-group">
              <label for="tenLoaiHomestay">Tên Loại Homestay <span class="text-danger">*</span></label>
              <input
                id="tenLoaiHomestay"
                v-model="formData.tenLoaiHomestay"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.tenLoaiHomestay }"
                required
              />
              <div v-if="errors.tenLoaiHomestay" class="invalid-feedback">
                {{ errors.tenLoaiHomestay }}
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
          </div>

          <!-- Read-only view for view mode -->
          <div v-if="isViewMode" class="loai-info">
            <div class="form-group">
              <label>Tên Loại Homestay</label>
              <input type="text" class="form-control" :value="formData.tenLoaiHomestay" readonly />
            </div>

            <div class="form-group">
              <label>Mô tả</label>
              <textarea class="form-control" rows="3" readonly>{{ formData.moTa }}</textarea>
            </div>

            <div class="form-group">
              <label>Ngày tạo</label>
              <input
                type="text"
                class="form-control"
                :value="formatDate(formData.ngayTao)"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Trạng thái</label>
              <div class="status-badge">
                <span :class="`badge ${formData.trangThai ? 'bg-success' : 'bg-danger'}`">
                  {{ formData.trangThai ? 'Hoạt động' : 'Khóa' }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <div v-if="isViewMode">
              <button type="button" class="btn btn-primary" @click="$emit('edit')">
                <i class="fas fa-edit"></i> Sửa
              </button>
              <button
                type="button"
                class="btn btn-danger"
                @click="confirmDelete"
                :disabled="isDeleting"
              >
                <i class="fas fa-trash-alt"></i> Xóa
              </button>
            </div>
            <div v-else class="button-container">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                <i class="fas fa-xmark"></i> Hủy
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <i class="fas fa-save"></i> {{ isEdit ? 'Cập nhật' : 'Lưu' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoaiHomestayModal',
  props: {
    loaiHomestay: {
      type: Object,
      default: () => null,
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
  data() {
    return {
      formData: {
        id: null,
        tenLoaiHomestay: '',
        moTa: '',
        ngayTao: null,
        trangThai: true,
      },
      errors: {},
      isSubmitting: false,
      isDeleting: false,
    }
  },
  computed: {
    modalTitle() {
      if (this.isViewMode) return 'Chi tiết loại homestay'
      return this.isEdit ? 'Cập nhật loại homestay' : 'Thêm loại homestay mới'
    },
  },
  watch: {
    loaiHomestay: {
      handler(newVal) {
        if (newVal) {
          this.formData = { ...newVal }
        } else {
          this.resetForm()
        }
      },
      immediate: true,
    },
  },
  methods: {
    resetForm() {
      this.formData = {
        id: null,
        tenLoaiHomestay: '',
        moTa: '',
        ngayTao: null,
        trangThai: true,
      }
      this.errors = {}
    },
    validateForm() {
      this.errors = {}
      let isValid = true

      if (!this.formData.tenLoaiHomestay?.trim()) {
        this.errors.tenLoaiHomestay = 'Tên loại homestay không được để trống'
        isValid = false
      }

      return isValid
    },
    async handleSubmit() {
      if (!this.validateForm()) return

      this.isSubmitting = true
      try {
        // Tạo bản sao của formData và loại bỏ trường ngayTao để backend tự động thiết lập
        const formDataToSend = { ...this.formData }
        delete formDataToSend.ngayTao

        if (this.isEdit) {
          await this.$emit('save', formDataToSend)
        } else {
          await this.$emit('save', formDataToSend)
        }
      } catch (error) {
        console.error('Lỗi khi lưu loại homestay:', error)
      } finally {
        this.isSubmitting = false
      }
    },
    confirmDelete() {
      if (confirm('Bạn có chắc chắn muốn xóa loại homestay này không?')) {
        this.deleteLoaiHomestay()
      }
    },
    async deleteLoaiHomestay() {
      this.isDeleting = true
      try {
        await this.$emit('delete', this.formData.id)
      } catch (error) {
        console.error('Lỗi khi xóa loại homestay:', error)
      } finally {
        this.isDeleting = false
      }
    },
    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('vi-VN')
    },
  },
}
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
  z-index: 1000;
}

.loai-homestay-details-modal {
  background-color: white;
  border-radius: 10px;
  width: 600px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #343a40;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.close-button:hover {
  color: #343a40;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  appearance: auto;
}

.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.btn-secondary {
  background-color: #f0f2f5;
  border-color: #f0f2f5;
  color: #495057;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-secondary:hover {
  background-color: #e2e6ea;
  border-color: #dae0e5;
  color: #343a40;
}

.btn i {
  font-size: 0.9rem;
}

.status-badge {
  margin-top: 5px;
}

.badge {
  padding: 6px 10px;
  border-radius: 4px;
  font-weight: 500;
}

.bg-success {
  background-color: #198754 !important;
  color: white;
}

.bg-danger {
  background-color: #dc3545 !important;
  color: white;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 5px;
}

.loai-info .form-group {
  margin-bottom: 15px;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #bb2d3b;
  border-color: #b02a37;
}

.btn-success {
  background-color: #198754;
  border-color: #198754;
  color: white;
}

.btn-success:hover {
  background-color: #157347;
  border-color: #146c43;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}
</style>
