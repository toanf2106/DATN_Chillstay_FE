<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEdit ? 'Chỉnh Sửa Loại Phòng' : 'Thêm Loại Phòng Mới' }}</h3>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="tenLoaiPhong">Tên Loại Phòng</label>
            <input
              id="tenLoaiPhong"
              v-model="formData.tenLoaiPhong"
              type="text"
              class="form-control"
              required
            />
          </div>
          <div class="form-group">
            <label for="moTa">Mô Tả</label>
            <textarea
              id="moTa"
              v-model="formData.moTa"
              class="form-control"
              rows="3"
            ></textarea>
          </div>
          <div v-if="isEdit" class="form-group">
            <label for="trangThai">Trạng Thái</label>
            <select id="trangThai" v-model="formData.trangThai" class="form-select">
              <option :value="true">Hoạt động</option>
              <option :value="false">Không hoạt động</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Hủy</button>
            <button type="submit" class="btn btn-primary">
              {{ isEdit ? 'Cập Nhật' : 'Thêm Mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'LoaiPhongModal',
  props: {
    loaiPhong: {
      type: Object,
      default: null,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const formData = ref({
      tenLoaiPhong: '',
      moTa: '',
      trangThai: true,
    });

    watch(
      () => props.loaiPhong,
      (newVal) => {
        if (newVal && props.isEdit) {
          formData.value = { ...newVal };
        } else {
          formData.value = {
            tenLoaiPhong: '',
            moTa: '',
            trangThai: true,
          };
        }
      },
      { immediate: true, deep: true }
    );

    const handleSubmit = () => {
      emit('save', formData.value);
    };

    return {
      formData,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.form-group {
  margin-bottom: 1rem;
}
.form-control,
.form-select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ced4da;
}
.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>
