<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="anh-homestay-details-modal">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-12 mb-4" v-if="!viewOnly">
            <h4>Thêm ảnh mới</h4>
            <div class="upload-area" @click="triggerFileInput">
              <div v-if="!previewImage" class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Nhấp để tải ảnh lên</p>
              </div>
              <img v-else :src="previewImage" alt="Preview" class="preview-image" />
            </div>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              accept="image/*"
              style="display: none"
            />
            <div class="mt-3 d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-secondary me-2"
                @click="resetUpload"
                v-if="previewImage"
              >
                <i class="fas fa-xmark"></i> Hủy
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="uploadImage"
                :disabled="isUploading || !selectedFile"
              >
                <i class="fas fa-save"></i> Lưu ảnh
              </button>
            </div>
          </div>

          <div class="col-md-12">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4>Danh sách ảnh ({{ images.length }})</h4>
              <button v-if="viewOnly" type="button" class="btn btn-primary" @click="$emit('close')">
                <i class="fas fa-times me-1"></i> Đóng
              </button>
            </div>
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
            </div>
            <div v-else-if="images.length === 0" class="text-center py-4">
              <p>Chưa có ảnh nào</p>
            </div>
            <div v-else class="image-gallery">
              <div v-for="(image, index) in images" :key="index" class="image-item">
                <div class="image-container">
                  <img :src="image.duongDanAnh" :alt="`Ảnh ${index + 1}`" />
                  <div class="image-actions" v-if="!viewOnly">
                    <button
                      class="btn btn-sm btn-danger"
                      @click="deleteImage(image.id)"
                      :disabled="isDeleting === image.id"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import {
  getAnhHomeStayByHomestayId,
  uploadAnhHomeStay,
  deleteAnhHomeStay,
} from '@/Service/HomeStayService'
import { useToast } from '@/stores/notificationStore'

export default {
  name: 'AnhHomestayModal',
  props: {
    homestay: {
      type: Object,
      required: true,
    },
    viewOnly: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const toast = useToast()
    const images = ref([])
    const loading = ref(true)
    const isUploading = ref(false)
    const isDeleting = ref(null)
    const fileInput = ref(null)
    const selectedFile = ref(null)
    const previewImage = ref(null)

    const modalTitle = computed(() => {
      return props.viewOnly
        ? `Ảnh chi tiết - ${props.homestay.tenHomestay}`
        : `Quản lý ảnh - ${props.homestay.tenHomestay}`
    })

    const fetchImages = async () => {
      try {
        loading.value = true
        const response = await getAnhHomeStayByHomestayId(props.homestay.id)
        images.value = response.data || []
      } catch (error) {
        console.error('Lỗi khi tải ảnh:', error)
        toast.error('Không thể tải danh sách ảnh. Vui lòng thử lại sau.')
      } finally {
        loading.value = false
      }
    }

    const triggerFileInput = () => {
      fileInput.value.click()
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        selectedFile.value = file
        const reader = new FileReader()
        reader.onload = (e) => {
          previewImage.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const resetUpload = () => {
      selectedFile.value = null
      previewImage.value = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    const uploadImage = async () => {
      if (!selectedFile.value) return

      try {
        isUploading.value = true
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        formData.append('homestayId', props.homestay.id)

        await uploadAnhHomeStay(selectedFile.value, props.homestay.id)
        toast.success('Tải ảnh lên thành công!')
        resetUpload()
        await fetchImages()
      } catch (error) {
        console.error('Lỗi khi tải ảnh lên:', error)
        toast.error('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại sau.')
      } finally {
        isUploading.value = false
      }
    }

    const deleteImage = async (imageId) => {
      if (!confirm('Bạn có chắc chắn muốn xóa ảnh này không?')) return

      try {
        isDeleting.value = imageId
        await deleteAnhHomeStay(imageId)
        toast.success('Xóa ảnh thành công!')
        await fetchImages()
      } catch (error) {
        console.error('Lỗi khi xóa ảnh:', error)
        toast.error('Có lỗi xảy ra khi xóa ảnh. Vui lòng thử lại sau.')
      } finally {
        isDeleting.value = null
      }
    }

    onMounted(fetchImages)

    return {
      modalTitle,
      images,
      loading,
      isUploading,
      isDeleting,
      fileInput,
      selectedFile,
      previewImage,
      triggerFileInput,
      handleFileUpload,
      resetUpload,
      uploadImage,
      deleteImage,
    }
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

.anh-homestay-details-modal {
  background-color: white;
  border-radius: 10px;
  width: 800px;
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

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9fafb;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #f0f7ff;
}

.upload-placeholder {
  color: #6b7280;
}

.upload-placeholder i {
  font-size: 3rem;
  margin-bottom: 10px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
  padding-top: 75%; /* 4:3 Aspect Ratio */
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .image-actions {
  opacity: 1;
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

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
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

.btn-danger:hover {
  background-color: #bb2d3b;
  border-color: #b02a37;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn i {
  font-size: 0.9rem;
}
</style>
