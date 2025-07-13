<!-- Sửa modal trong template -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="loai-phong-details-modal">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Form for edit/add mode -->
          <div v-if="!isViewMode">
            <div class="form-group">
              <label for="maLoaiPhong">Mã Loại Phòng</label>
              <div class="input-group">
                <input
                  id="maLoaiPhong"
                  v-model="formData.maLoaiPhong"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.maLoaiPhong }"
                  placeholder="LP001, LP002, ... (không bắt buộc)"
                  :disabled="isEdit"
                  @input="validateField('maLoaiPhong')"
                />
                <button
                  v-if="!isEdit"
                  type="button"
                  class="btn btn-outline-secondary generate-btn"
                  @click="generateCode"
                  title="Tạo mã tự động"
                >
                  <i class="fas fa-sync-alt"></i>
                </button>
              </div>
              <div v-if="errors.maLoaiPhong" class="invalid-feedback d-block">
                {{ errors.maLoaiPhong }}
              </div>
              <small class="form-text text-muted" v-if="!isEdit">
                Mã loại phòng có thể để trống. Nếu nhập, nên bắt đầu bằng "LP" và theo sau là số, ví dụ: LP001
              </small>
            </div>

            <div class="form-group">
              <label for="tenLoaiPhong">Tên Loại Phòng <span class="text-danger">*</span></label>
              <input
                id="tenLoaiPhong"
                v-model="formData.tenLoaiPhong"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.tenLoaiPhong }"
                placeholder="Nhập tên loại phòng"
                required
                @input="validateField('tenLoaiPhong')"
              />
              <div v-if="errors.tenLoaiPhong" class="invalid-feedback d-block">
                {{ errors.tenLoaiPhong }}
              </div>
            </div>

            <div class="form-group">
              <label for="moTa">Mô tả</label>
              <textarea
                id="moTa"
                v-model="formData.moTa"
                class="form-control"
                :class="{ 'is-invalid': errors.moTa }"
                placeholder="Nhập mô tả chi tiết về loại phòng"
                rows="3"
                @input="validateField('moTa')"
              ></textarea>
              <div v-if="errors.moTa" class="invalid-feedback d-block">
                {{ errors.moTa }}
              </div>
            </div>

            <div class="form-group">
              <label for="soLuong">Số lượng <span class="text-danger">*</span></label>
              <input
                id="soLuong"
                v-model.number="formData.soLuong"
                type="number"
                min="0"
                class="form-control"
                :class="{ 'is-invalid': errors.soLuong }"
                placeholder="Nhập số lượng phòng"
                required
                @input="validateField('soLuong')"
              />
              <div v-if="errors.soLuong" class="invalid-feedback d-block">
                {{ errors.soLuong }}
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
              <label>ID</label>
              <input type="text" class="form-control" :value="formData.id || 'Chưa có ID'" readonly />
            </div>

            <div class="form-group" v-if="formData.maLoaiPhong">
              <label>Mã Loại Phòng</label>
              <input type="text" class="form-control" :value="formData.maLoaiPhong" readonly />
            </div>

            <div class="form-group">
              <label>Tên Loại Phòng</label>
              <input type="text" class="form-control" :value="formData.tenLoaiPhong" readonly />
            </div>

            <div class="form-group">
              <label>Mô tả</label>
              <textarea class="form-control" rows="3" readonly :value="moTaDisplay"></textarea>
            </div>

            <div class="form-group">
              <label>Số lượng</label>
              <input type="text" class="form-control" :value="formData.soLuong || 0" readonly />
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
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !formIsValid">
                <i class="fas fa-save"></i> {{ isEdit ? 'Cập nhật' : 'Lưu' }}
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm ms-2"></span>
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
  name: 'LoaiPhongModal',
  props: {
    loaiPhong: {
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
        maLoaiPhong: '',
        tenLoaiPhong: '',
        moTa: '',
        soLuong: 0,
        ngayTao: null,
        ngayUpdate: null,
        trangThai: true,
      },
      errors: {},
      isSubmitting: false,
      isDeleting: false,
      touchedFields: new Set(),
    }
  },
  computed: {
    modalTitle() {
      if (this.isViewMode) return 'Chi tiết loại phòng'
      return this.isEdit ? 'Cập nhật loại phòng' : 'Thêm loại phòng mới'
    },
    formIsValid() {
      // Bắt buộc phải có tên loại phòng và số lượng
      return this.formData.tenLoaiPhong &&
             this.formData.soLuong !== undefined &&
             !this.errors.tenLoaiPhong &&
             !this.errors.soLuong &&
             !this.errors.maLoaiPhong;
    },
    moTaDisplay() {
      return this.formData.moTa || 'Không có mô tả';
    }
  },
  watch: {
    loaiPhong: {
      handler(newVal) {
        if (newVal) {
          this.formData = { ...newVal }
        } else {
          this.resetForm()
        }
        this.errors = {}
        this.touchedFields = new Set()
      },
      immediate: true,
    }
  },
  methods: {
    resetForm() {
      this.formData = {
        id: null,
        maLoaiPhong: '',
        tenLoaiPhong: '',
        moTa: '',
        soLuong: 0,
        ngayTao: null,
        ngayUpdate: null,
        trangThai: true,
      }
    },
    validateField(fieldName) {
      this.touchedFields.add(fieldName)

      switch(fieldName) {
        case 'maLoaiPhong':
          // Mã loại phòng không bắt buộc, nhưng nếu có thì phải đúng định dạng
          if (this.formData.maLoaiPhong) {
            if (!/^LP\d{3,}$/i.test(this.formData.maLoaiPhong)) {
              this.errors.maLoaiPhong = 'Mã loại phòng nên có định dạng LP + số (ví dụ: LP001)';
            } else {
              delete this.errors.maLoaiPhong;
            }
          } else {
            // Mã loại phòng có thể null/trống
            delete this.errors.maLoaiPhong;
          }
          break;

        case 'tenLoaiPhong':
          if (!this.formData.tenLoaiPhong || this.formData.tenLoaiPhong.trim() === '') {
            this.errors.tenLoaiPhong = 'Tên loại phòng không được để trống';
          } else {
            delete this.errors.tenLoaiPhong;
          }
          break;

        case 'soLuong':
          if (this.formData.soLuong === undefined || this.formData.soLuong < 0) {
            this.errors.soLuong = 'Số lượng phải là số không âm';
          } else {
            delete this.errors.soLuong;
          }
          break;

        case 'moTa':
          // Mô tả không bắt buộc
          delete this.errors.moTa;
          break;
      }
    },
    handleSubmit() {
      // Validate all fields before submit
      ['tenLoaiPhong', 'maLoaiPhong', 'soLuong'].forEach(field => this.validateField(field));

      // Return if there are any errors
      if (Object.keys(this.errors).length > 0) return;

      this.isSubmitting = true;

      // Prepare data to submit
      const formDataToSubmit = {
        ...this.formData,
        soLuong: parseInt(this.formData.soLuong || 0, 10)
      };

      // Emit save event with form data
      this.$emit('save', formDataToSubmit);

      // Reset submission state
      this.isSubmitting = false;
    },
    generateCode() {
      // Generate a random code in format LP + 3 digits
      const randomNum = Math.floor(100 + Math.random() * 900);
      this.formData.maLoaiPhong = `LP${randomNum}`;
      this.validateField('maLoaiPhong');
    },
    confirmDelete() {
      if (confirm('Bạn có chắc chắn muốn xóa loại phòng này không?')) {
        this.deleteLoaiPhong();
      }
    },
    deleteLoaiPhong() {
      this.isDeleting = true;
      try {
        this.$emit('delete', this.formData.id);
      } catch (error) {
        console.error('Lỗi khi xóa loại phòng:', error);
      } finally {
        this.isDeleting = false;
      }
    },
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('vi-VN');
    },
  }
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

.loai-phong-details-modal {
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
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #343a40;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s;
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
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  appearance: auto;
  background-color: #fff;
  font-size: 0.95rem;
}

.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.input-group {
  display: flex;
  align-items: stretch;
}

.input-group .form-control {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  flex: 1;
}

.generate-btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border: 1px solid #ced4da;
  border-left: none;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #495057;
  transition: all 0.2s;
}

.generate-btn:hover {
  background-color: #e9ecef;
  color: #212529;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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
  font-size: 0.9rem;
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
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background-color: #e2e6ea;
  border-color: #dae0e5;
  color: #343a40;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #bb2d3b;
  border-color: #b02a37;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  display: inline-block;
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

.form-text {
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 5px;
}

.loai-info .form-group {
  margin-bottom: 15px;
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

/* Styling for view mode */
.loai-info .form-control {
  background-color: #f8f9fa;
  cursor: default;
}
</style>
