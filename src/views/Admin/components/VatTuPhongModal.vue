<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="vattu-phong-modal">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <!-- Tìm kiếm vật tư -->
        <div class="search-container mb-3">
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-search"></i></span>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Tìm kiếm vật tư..."
              class="form-control"
            />
            <button v-if="searchTerm" @click="searchTerm = ''" class="btn btn-outline-secondary">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Danh sách vật tư -->
        <div class="vat-tu-container">
          <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
          </div>

          <div v-else-if="filteredVatTuList.length === 0" class="text-center py-3 text-muted">
            <i class="fas fa-info-circle me-1"></i> Không tìm thấy vật tư nào
          </div>

          <div v-else class="vat-tu-list">
            <div v-for="item in filteredVatTuList" :key="item.id" class="vat-tu-item">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="`vattu-${item.id}`"
                  v-model="selectedVatTu[item.id].selected"
                >
                <label class="form-check-label" :for="`vattu-${item.id}`">
                  {{ item.tenVatTu }}
                </label>
              </div>

              <div v-if="selectedVatTu[item.id].selected" class="vat-tu-details">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">Số lượng</span>
                  <input
                    type="number"
                    class="form-control"
                    v-model="selectedVatTu[item.id].soLuong"
                    min="1"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Danh sách đã chọn -->
        <div class="mt-4">
          <h5 class="mb-3">Vật tư đã chọn</h5>
          <div class="selected-items-container">
            <div v-if="Object.keys(selectedVatTuItems).length === 0" class="text-center py-3 text-muted">
              <i class="fas fa-info-circle me-1"></i> Chưa chọn vật tư nào
            </div>
            <div v-else class="selected-items-list">
              <div v-for="(item, id) in selectedVatTuItems" :key="id" class="selected-item">
                <div class="selected-item-name">{{ getVatTuName(id) }}</div>
                <div class="selected-item-actions">
                  <span class="selected-item-quantity">{{ item.soLuong }}</span>
                  <button class="btn btn-sm btn-outline-danger" @click="removeVatTu(id)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">
          Hủy
        </button>
        <button type="button" class="btn btn-primary" @click="saveVatTuPhong" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status"></span>
          {{ isEdit ? 'Cập nhật' : 'Lưu' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { getVatTuList } from '@/Service/vatTuService'
import api from '@/utils/api'
import notification from '@/utils/notification'

export default {
  name: 'VatTuPhongModal',
  props: {
    phongId: {
      type: Number,
      required: true
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const loading = ref(false)
    const vatTuList = ref([])
    const selectedVatTu = ref({})
    const searchTerm = ref('')

    const modalTitle = computed(() => {
      return props.isEdit ? 'Chỉnh Sửa Vật Tư Phòng' : 'Thêm Vật Tư Phòng'
    })

    // Lọc danh sách vật tư theo từ khóa tìm kiếm
    const filteredVatTuList = computed(() => {
      if (!searchTerm.value) return vatTuList.value

      const keyword = searchTerm.value.toLowerCase()
      return vatTuList.value.filter(item =>
        item.tenVatTu.toLowerCase().includes(keyword)
      )
    })

    // Danh sách các vật tư đã chọn
    const selectedVatTuItems = computed(() => {
      const result = {}
      for (const [id, data] of Object.entries(selectedVatTu.value)) {
        if (data.selected) {
          result[id] = data
        }
      }
      return result
    })

    // Lấy tên vật tư từ ID
    const getVatTuName = (vatTuId) => {
      const vatTu = vatTuList.value.find(item => item.id == vatTuId)
      return vatTu ? vatTu.tenVatTu : ''
    }

    // Xóa vật tư khỏi danh sách đã chọn
    const removeVatTu = (vatTuId) => {
      if (selectedVatTu.value[vatTuId]) {
        selectedVatTu.value[vatTuId].selected = false
      }
    }

    // Lưu vật tư phòng
    const saveVatTuPhong = async () => {
      try {
        loading.value = true

        // Chuyển đổi object thành mảng để gửi lên server
        const vatTuPhongList = Object.entries(selectedVatTu.value)
          .filter(([, data]) => data.selected)
          .map(([vatTuId, data]) => ({
            phong: { id: props.phongId },
            vatTu: { id: parseInt(vatTuId) },
            soLuong: data.soLuong,
            trangThai: true
          }))

        // Nếu không có vật tư nào được chọn
        if (vatTuPhongList.length === 0) {
          notification.warning('Vui lòng chọn ít nhất một vật tư')
          loading.value = false
          return
        }

        // Gửi dữ liệu lên server
        await api.post('/api/vat-tu-phong/batch', {
          phongId: props.phongId,
          vatTuPhongList: vatTuPhongList
        })

        notification.success('Cập nhật vật tư phòng thành công')
        emit('save')
        emit('close')
      } catch (error) {
        console.error('Lỗi khi lưu vật tư phòng:', error)
        notification.error('Có lỗi xảy ra khi lưu vật tư phòng')
      } finally {
        loading.value = false
      }
    }

    // Lấy danh sách vật tư
    const fetchVatTuList = async () => {
      try {
        loading.value = true
        const response = await getVatTuList()
        vatTuList.value = response.data.filter(item => item.trangThai)

        // Khởi tạo đối tượng selectedVatTu
        vatTuList.value.forEach(item => {
          selectedVatTu.value[item.id] = {
            selected: false,
            soLuong: 1,
            vatTuId: item.id
          }
        })
      } catch (error) {
        console.error('Lỗi khi lấy danh sách vật tư:', error)
        notification.error('Có lỗi xảy ra khi lấy danh sách vật tư')
      } finally {
        loading.value = false
      }
    }

    // Lấy danh sách vật tư của phòng
    const fetchVatTuPhong = async () => {
      if (!props.phongId) return

      try {
        loading.value = true
        const response = await api.get(`/api/vat-tu-phong/by-phong/${props.phongId}`)

        // Khởi tạo selectedVatTu từ dữ liệu hiện có
        response.data.forEach(item => {
          if (item.trangThai && selectedVatTu.value[item.vatTu.id]) {
            selectedVatTu.value[item.vatTu.id] = {
              selected: true,
              soLuong: item.soLuong,
              vatTuId: item.vatTu.id
            }
          }
        })
      } catch (error) {
        console.error('Lỗi khi lấy danh sách vật tư phòng:', error)
        notification.error('Có lỗi xảy ra khi lấy danh sách vật tư phòng')
      } finally {
        loading.value = false
      }
    }

    // Khởi tạo khi component được mount
    onMounted(() => {
      fetchVatTuList().then(() => {
        if (props.isEdit && props.phongId) {
          fetchVatTuPhong()
        }
      })
    })

    // Theo dõi thay đổi của phongId
    watch(() => props.phongId, (newVal) => {
      if (newVal && props.isEdit) {
        fetchVatTuPhong()
      }
    })

    return {
      loading,
      vatTuList,
      selectedVatTu,
      searchTerm,
      filteredVatTuList,
      selectedVatTuItems,
      modalTitle,
      getVatTuName,
      removeVatTu,
      saveVatTuPhong
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.vattu-phong-modal {
  background-color: #fff;
  border-radius: 8px;
  width: 700px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
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
  font-size: 1.25rem;
  font-weight: 600;
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

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.search-container {
  margin-bottom: 15px;
}

.vat-tu-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.vat-tu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vat-tu-item {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 10px;
  transition: all 0.2s;
}

.vat-tu-item:hover {
  border-color: #adb5bd;
}

.vat-tu-details {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #dee2e6;
}

.selected-items-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.selected-items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e9f7ef;
  border: 1px solid #28a745;
  border-radius: 6px;
  padding: 10px 15px;
}

.selected-item-name {
  font-weight: 500;
}

.selected-item-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.selected-item-quantity {
  background-color: #28a745;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* Form check styles */
.form-check {
  display: flex;
  align-items: center;
}

.form-check-input {
  margin-right: 8px;
}

.form-check-label {
  margin-bottom: 0;
  font-weight: 500;
}
</style>
