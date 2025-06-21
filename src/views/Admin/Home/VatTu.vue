<template>
  <div class="container-xl py-4">
    <h2 class="fw-bold text-gradient mb-4">Quản lý Vật Tư</h2>
    <!-- Thanh công cụ góc phải -->
    <div class="d-flex justify-content-end align-items-center mb-4 gap-2 flex-wrap">
      <input v-model="searchText" type="text" class="form-control w-auto rounded-pill shadow-sm" style="min-width:180px"
        placeholder="Tìm kiếm vật tư..." />
      <select v-model="filterStatus" class="form-select w-auto rounded-pill shadow-sm">
        <option value="Đang hoạt động">Đang hoạt động</option>
        <option value="Ngừng hoạt động">Ngừng hoạt động</option>
      </select>
      <button class="btn btn-primary rounded-pill shadow-sm" @click="showAddModal">
        <i class="bi bi-plus-lg"></i> Thêm vật tư
      </button>
    </div>

    <!-- Form Thêm/Sửa popup giữa màn hình -->
    <div v-if="showForm" class="modal-backdrop-custom">
      <div class="modal-dialog-custom">
        <div class="card p-4 shadow border-0">
          <h5 class="mb-3 fw-bold">{{ isEdit ? 'Sửa vật tư' : 'Thêm vật tư' }}</h5>
          <form @submit.prevent="saveVatTu">
            <div class="mb-3">
              <input v-model="form.tenVatTu" class="form-control rounded-pill" placeholder="Tên vật tư" required />
            </div>
            <div class="mb-3">
              <input v-model="form.donVi" class="form-control rounded-pill" placeholder="Đơn vị" required />
            </div>
            <div class="mb-3">
              <textarea v-model="form.moTa" class="form-control rounded-3" placeholder="Mô tả"></textarea>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-3">
              <button class="btn btn-primary rounded-pill px-4" type="submit">{{ isEdit ? 'Lưu' : 'Thêm' }}</button>
              <button class="btn btn-secondary rounded-pill px-4" @click.prevent="cancelForm">Huỷ</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal chi tiết vật tư -->
    <div v-if="showDetail" class="modal-backdrop-custom">
      <div class="modal-dialog-custom">
        <div class="card p-4 shadow border-0">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0">Chi tiết vật tư</h5>
            <button class="btn-close" @click="showDetail = false"></button>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item bg-transparent">
              <strong>ID:</strong> {{ detailVatTu.id }}
            </li>
            <li class="list-group-item bg-transparent">
              <strong>Tên vật tư:</strong> {{ detailVatTu.tenVatTu }}
            </li>
            <li class="list-group-item bg-transparent">
              <strong>Đơn vị:</strong> {{ detailVatTu.donVi }}
            </li>
            <li class="list-group-item bg-transparent">
              <strong>Mô tả:</strong> {{ detailVatTu.moTa || 'Không có' }}
            </li>
            <li class="list-group-item bg-transparent">
              <strong>Trạng thái:</strong>
              <span
                :class="detailVatTu.trangThai === 'Đang hoạt động' ? 'badge-status-active' : 'badge-status-inactive'">
                {{ detailVatTu.trangThai }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bảng vật tư -->
    <div class="card shadow-sm border-0 rounded-4">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-success">
              <tr>
                <th>STT</th>
                <th>ID</th>
                <th>Tên Vật Tư</th>
                <th>Đơn Vị</th>
                <th>Mô Tả</th>
                <th>Trạng Thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in pagedVatTuList" :key="item.id">
                <td>{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
                <td>{{ item.id }}</td>
                <td class="fw-semibold">{{ item.tenVatTu }}</td>
                <td>{{ item.donVi }}</td>
                <td>{{ item.moTa }}</td>
                <td>
                  <span :class="item.trangThai === 'Đang hoạt động' ? 'badge-status-active' : 'badge-status-inactive'">
                    {{ item.trangThai }}
                  </span>
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-1 justify-content-center">
                    <button class="btn btn-info btn-sm rounded-pill" @click="showDetailModal(item)">
                      <i class="bi bi-eye"></i> Chi tiết
                    </button>
                    <template v-if="item.trangThai === 'Đang hoạt động'">
                      <button class="btn btn-outline-warning btn-sm rounded-pill" @click="editVatTu(item)">
                        <i class="bi bi-pencil-square"></i> Sửa
                      </button>
                      <button class="btn btn-outline-danger btn-sm rounded-pill" @click="deleteVatTu(item.id)">
                        <i class="bi bi-trash"></i> Xoá
                      </button>
                    </template>
                    <template v-else>
                      <button class="btn btn-outline-primary btn-sm rounded-pill" @click="restoreVatTu(item)">
                        <i class="bi bi-arrow-clockwise"></i> Khôi phục
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
              <tr v-if="pagedVatTuList.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-3"></i><br>
                  Không có vật tư nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Phân trang -->
        <nav class="mt-3">
          <ul class="pagination justify-content-end mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">Trước</button>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">Sau</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/utils/api'
import notification from '@/utils/notification'

const vatTuList = ref([])
const showForm = ref(false)
const isEdit = ref(false)
const filterStatus = ref('Đang hoạt động')
const searchText = ref('')
const form = ref({
  id: null,
  tenVatTu: '',
  donVi: '',
  moTa: '',
  trangThai: 'Đang hoạt động'
})

// BỔ SUNG 2 DÒNG NÀY
const showDetail = ref(false)
const detailVatTu = ref({})

const currentPage = ref(1)
const pageSize = ref(5 // Số dòng mỗi trang
)

// Lọc theo trạng thái và từ khóa tìm kiếm
const filteredVatTuList = computed(() =>
  vatTuList.value.filter(
    v =>
      v.trangThai === filterStatus.value &&
      (
        v.tenVatTu.toLowerCase().includes(searchText.value.trim().toLowerCase()) ||
        String(v.id).includes(searchText.value.trim())
      )
  )
)

// Danh sách vật tư đã phân trang
const pagedVatTuList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredVatTuList.value.slice(start, start + pageSize.value)
})

// Tổng số trang
const totalPages = computed(() =>
  Math.ceil(filteredVatTuList.value.length / pageSize.value)
)

async function fetchVatTu() {
  const res = await api.get('/api/vattu/all')
  vatTuList.value = res.data
    .map(v => ({
      ...v,
      trangThai: v.trangThai ? 'Đang hoạt động' : 'Ngừng hoạt động'
    }))
}

onMounted(fetchVatTu)

function showAddModal() {
  showForm.value = true
  isEdit.value = false
  form.value = {
    id: null,
    tenVatTu: '',
    donVi: '',
    moTa: '',
    trangThai: 'Đang hoạt động'
  }
}

function editVatTu(item) {
  showForm.value = true
  isEdit.value = true
  form.value = { ...item }
}

function cancelForm() {
  showForm.value = false
}

function showDetailModal(item) {
  detailVatTu.value = { ...item }
  showDetail.value = true
}

async function saveVatTu() {
  try {
    const payload = {
      ...form.value,
      trangThai: form.value.trangThai === 'Đang hoạt động'
    }
    if (isEdit.value) {
      await api.put(`/api/vattu/update/${form.value.id}`, payload)
      notification.success('Cập nhật vật tư thành công!', {
        position: 'top-right',
        duration: 3000
      })
    } else {
      await api.post('/api/vattu/add', payload)
      notification.success('Thêm vật tư thành công!', {
        position: 'top-right',
        duration: 3000
      })
    }
    showForm.value = false
    await fetchVatTu()
  } catch {
    notification.error('Lỗi khi lưu vật tư!', {
      position: 'top-right',
      duration: 3000
    })
  }
}

async function deleteVatTu(id) {
  if (confirm('Bạn chắc chắn muốn xoá vật tư này?')) {
    try {
      await api.put(`/api/vattu/delete/${id}`)
      await fetchVatTu()
      notification.success('Xoá vật tư thành công!', {
        position: 'top-right',
        duration: 3000
      })
    } catch (e) {
      notification.error('Lỗi xoá vật tư!', {
        position: 'top-right',
        duration: 3000
      })
    }
  }
}

async function restoreVatTu(item) {
  try {
    const payload = {
      ...item,
      trangThai: true
    }
    await api.put(`/api/vattu/reset/${item.id}`, payload)
    await fetchVatTu()
    notification.success('Khôi phục vật tư thành công!', {
      position: 'top-right',
      duration: 3000
    })
  } catch {
    notification.error('Lỗi khôi phục vật tư!', {
      position: 'top-right',
      duration: 3000
    })
  }
}

function changePage(page) {
  currentPage.value = page
}

// ĐƯA VÀO ĐÂY
watch([filterStatus, searchText], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(90deg, #0d6efd 40%, #20c997 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card {
  border-radius: 1.5rem;
}

.badge-status-active {
  background: linear-gradient(90deg, #20c997 60%, #0d6efd 100%);
  color: #fff;
  font-weight: 500;
  border-radius: 1em;
  padding: 0.5em 1.2em;
  font-size: 1rem;
  box-shadow: 0 2px 8px #20c99722;
}

.badge-status-inactive {
  background: #adb5bd;
  color: #fff;
  font-weight: 500;
  border-radius: 1em;
  padding: 0.5em 1.2em;
  font-size: 1rem;
}

.table th,
.table td {
  vertical-align: middle;
  text-align: center;
}

.table th {
  font-weight: 700;
  font-size: 1.08rem;
  letter-spacing: 0.5px;
}

.btn {
  border-radius: 2em;
  font-weight: 500;
}

.form-control,
.form-select {
  border-radius: 2em;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-dialog-custom {
  min-width: 350px;
  max-width: 500px;
  width: 100%;
}
</style>
