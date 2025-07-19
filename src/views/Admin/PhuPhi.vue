<template>
  <div class="phu-phi-container">
    <h1 class="page-title">Quản lý phụ phí</h1>

    <!-- Phần thêm phụ phí mới -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>Thêm phụ phí mới</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-4">
              <div class="mb-3">
                <label for="tenPhuPhi" class="form-label">Tên phụ phí</label>
                <input
                  type="text"
                  class="form-control"
                  id="tenPhuPhi"
                  v-model="formData.tenPhuPhi"
                  required
                />
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label for="giaTien" class="form-label">Giá tiền</label>
                <div class="input-group">
                  <input
                    type="number"
                    class="form-control"
                    id="giaTien"
                    v-model="formData.giaTien"
                    required
                  />
                  <span class="input-group-text">VND</span>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label for="loaiPhuPhi" class="form-label">Loại phụ phí</label>
                <select class="form-select" id="loaiPhuPhi" v-model="formData.loaiPhuPhi" required>
                  <option value="">-- Chọn loại --</option>
                  <option value="DICH_VU">Dịch vụ</option>
                  <option value="THUE">Thuế</option>
                  <option value="PHI_KHAC">Phí khác</option>
                </select>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label for="moTa" class="form-label">Mô tả</label>
            <textarea class="form-control" id="moTa" rows="3" v-model="formData.moTa"></textarea>
          </div>
          <div class="form-check mb-3">
            <input
              class="form-check-input"
              type="checkbox"
              id="trangThai"
              v-model="formData.trangThai"
            />
            <label class="form-check-label" for="trangThai"> Kích hoạt </label>
          </div>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save me-1"></i> Lưu phụ phí
          </button>
        </form>
      </div>
    </div>

    <!-- Phần danh sách phụ phí -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5>Danh sách phụ phí</h5>
        <div class="input-group" style="max-width: 300px">
          <input type="text" class="form-control" placeholder="Tìm kiếm..." v-model="searchTerm" />
          <button class="btn btn-outline-secondary" type="button">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Tên phụ phí</th>
                <th scope="col">Loại</th>
                <th scope="col">Giá tiền</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredItems" :key="item.id">
                <th scope="row">{{ index + 1 }}</th>
                <td>{{ item.tenPhuPhi }}</td>
                <td>
                  <span :class="getLoaiPhuPhiClass(item.loaiPhuPhi)">
                    {{ getLoaiPhuPhiLabel(item.loaiPhuPhi) }}
                  </span>
                </td>
                <td>{{ formatPrice(item.giaTien) }}</td>
                <td>
                  <span :class="item.trangThai ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ item.trangThai ? 'Đang hoạt động' : 'Không hoạt động' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-info me-1" @click="editItem(item)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(item)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="6" class="text-center">Không có phụ phí nào</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Form data
const formData = ref({
  tenPhuPhi: '',
  giaTien: 0,
  loaiPhuPhi: '',
  moTa: '',
  trangThai: true,
})

// Search term
const searchTerm = ref('')

// Sample data
const phuPhiList = ref([
  {
    id: 1,
    tenPhuPhi: 'Phí dọn dẹp',
    loaiPhuPhi: 'DICH_VU',
    giaTien: 100000,
    moTa: 'Phí dọn dẹp sau khi khách trả phòng',
    trangThai: true,
  },
  {
    id: 2,
    tenPhuPhi: 'Phí đưa đón sân bay',
    loaiPhuPhi: 'DICH_VU',
    giaTien: 250000,
    moTa: 'Dịch vụ đưa đón khách từ sân bay',
    trangThai: true,
  },
  {
    id: 3,
    tenPhuPhi: 'Thuế VAT',
    loaiPhuPhi: 'THUE',
    giaTien: 0,
    moTa: 'Thuế giá trị gia tăng 8%',
    trangThai: true,
  },
  {
    id: 4,
    tenPhuPhi: 'Phí hủy đặt phòng',
    loaiPhuPhi: 'PHI_KHAC',
    giaTien: 0,
    moTa: 'Áp dụng khi khách hủy đặt phòng',
    trangThai: false,
  },
])

// Filtered items based on search term
const filteredItems = computed(() => {
  if (!searchTerm.value) return phuPhiList.value

  const searchLower = searchTerm.value.toLowerCase()
  return phuPhiList.value.filter(
    (item) =>
      item.tenPhuPhi.toLowerCase().includes(searchLower) ||
      getLoaiPhuPhiLabel(item.loaiPhuPhi).toLowerCase().includes(searchLower),
  )
})

// Format price to VND
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

// Get badge class based on loaiPhuPhi
function getLoaiPhuPhiClass(loaiPhuPhi) {
  switch (loaiPhuPhi) {
    case 'DICH_VU':
      return 'badge bg-primary'
    case 'THUE':
      return 'badge bg-warning'
    case 'PHI_KHAC':
      return 'badge bg-info'
    default:
      return 'badge bg-secondary'
  }
}

// Get label for loaiPhuPhi
function getLoaiPhuPhiLabel(loaiPhuPhi) {
  switch (loaiPhuPhi) {
    case 'DICH_VU':
      return 'Dịch vụ'
    case 'THUE':
      return 'Thuế'
    case 'PHI_KHAC':
      return 'Phí khác'
    default:
      return 'Không xác định'
  }
}

// Submit form
function handleSubmit() {
  // Create a new item with a generated ID
  const newItem = {
    id: phuPhiList.value.length + 1,
    ...formData.value,
  }

  // Add to list
  phuPhiList.value.push(newItem)

  // Reset form
  formData.value = {
    tenPhuPhi: '',
    giaTien: 0,
    loaiPhuPhi: '',
    moTa: '',
    trangThai: true,
  }

  // Show success message (you might want to use a notification system)
  alert('Thêm phụ phí thành công!')
}

// Edit item
function editItem(item) {
  // Copy item data to form
  formData.value = { ...item }
}

// Confirm delete
function confirmDelete(item) {
  if (confirm(`Bạn có chắc chắn muốn xóa phụ phí "${item.tenPhuPhi}" không?`)) {
    // Remove item from list
    phuPhiList.value = phuPhiList.value.filter((i) => i.id !== item.id)

    // Show success message
    alert('Xóa phụ phí thành công!')
  }
}
</script>

<style scoped>
.page-title {
  margin-bottom: 1.5rem;
  color: #1e293b;
}

.phu-phi-container {
  padding: 1rem;
}

/* Responsive styling for small screens */
@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.9rem;
  }

  .btn-sm {
    padding: 0.25rem 0.4rem;
  }
}
</style>
