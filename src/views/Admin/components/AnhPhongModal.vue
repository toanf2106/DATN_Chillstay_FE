<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="anh-phong-details-modal">
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
            <div class="divider mb-4"><span>Danh sách ảnh</span></div>
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
              <p class="mt-2">Đang tải ảnh...</p>
            </div>
            <div v-else-if="images.length === 0" class="text-center py-5">
              <i class="fas fa-image text-muted" style="font-size: 3rem"></i>
              <p class="mt-3 text-muted">Chưa có ảnh nào cho phòng này</p>
            </div>
            <div v-else class="image-gallery">
              <div v-for="(image, index) in images" :key="image.id || index" class="image-item">
                <div class="image-container">
                  <div class="loading-overlay" v-if="loadingImages[index]">
                    <div class="spinner-border text-light" role="status">
                      <span class="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                  <img
                    :src="getImageUrl(image.duongDanAnh)"
                    :alt="`Ảnh ${index + 1}`"
                    @error="handleImageError"
                    @load="handleImageLoaded(index)"
                    loading="lazy"
                    class="room-image"
                    crossorigin="anonymous"
                  />
                  <div class="image-overlay">
                    <p class="image-info">{{ index + 1 }}/{{ images.length }}</p>
                  </div>
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
  getAnhPhongByPhongId,
  uploadAnhPhong,
  deleteAnhPhong,
} from '@/Service/phongService'
import { useToast } from '@/stores/notificationStore'

export default {
  name: 'AnhPhongModal',
  props: {
    phong: {
      type: Object,
      required: true,
    },
    viewOnly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'updated'],
  setup(props, { emit }) {
    const toast = useToast()
    const images = ref([])
    const loading = ref(true)
    const isUploading = ref(false)
    const isDeleting = ref(null)
    const fileInput = ref(null)
    const selectedFile = ref(null)
    const previewImage = ref(null)
    const loadingImages = ref([])

    const modalTitle = computed(() => {
      return props.viewOnly
        ? `Ảnh chi tiết - ${props.phong.tenPhong}`
        : `Quản lý ảnh - ${props.phong.tenPhong}`
    })

    // Xử lý URL ảnh an toàn
    const getImageUrl = (img) => {
      if (!img) return '/images/placeholder-house.jpg'

      // Nếu là URL GCS hoặc URL đầy đủ
      if (img.startsWith('http')) {
        // Đảm bảo URL an toàn bằng cách mã hóa các ký tự đặc biệt
        return encodeURI(img)
      }

      // Nếu không có http prefix, thêm vào
      return `http://localhost:8080${img.startsWith('/') ? '' : '/'}${img}`
    }

    const handleImageError = (event) => {
      // Use default image if loading fails
      event.target.src = '/images/placeholder-house.jpg'
    }

    const handleImageLoaded = (index) => {
      // Mark this image as loaded
      if (loadingImages.value[index] !== undefined) {
        loadingImages.value[index] = false
      }
    }

    const fetchImages = async () => {
      try {
        loading.value = true
        const response = await getAnhPhongByPhongId(props.phong.id)
        images.value = response.data || []

        // Initialize loading state for each image
        loadingImages.value = Array(images.value.length).fill(true)
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
      if (!selectedFile.value) {
        toast.error('Vui lòng chọn một ảnh để tải lên')
        return
      }

      try {
        isUploading.value = true
        toast.info('Đang tải ảnh lên...')

        const response = await uploadAnhPhong(selectedFile.value, props.phong.id)
        toast.success('Tải ảnh lên thành công!')
        resetUpload()
        await fetchImages()

        // Lấy URL của ảnh từ response để cập nhật anhBia của phòng
        if (response && response.data) {
          // Cập nhật anhBia của phòng với URL ảnh mới
          const updatedRoom = {
            ...props.phong,
            anhBia: response.data.duongDanAnh
          }

          console.log('Đã cập nhật phòng với ảnh bìa mới:', updatedRoom)
          emit('updated', updatedRoom)
        } else {
          emit('updated', props.phong)
        }
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
        await deleteAnhPhong(imageId)
        toast.success('Xóa ảnh thành công!')
        await fetchImages()

        // Emit sự kiện để thông báo phòng đã được cập nhật
        emit('updated', props.phong)
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
      loadingImages,
      triggerFileInput,
      handleFileUpload,
      resetUpload,
      uploadImage,
      deleteImage,
      getImageUrl,
      handleImageError,
      handleImageLoaded,
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

.anh-phong-details-modal {
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
  color: #dc3545;
}

.modal-body {
  padding: 20px;
}

.upload-area {
  border: 2px dashed #ced4da;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.upload-area:hover {
  background-color: #e9ecef;
  border-color: #6c757d;
}

.upload-placeholder {
  color: #6c757d;
}

.upload-placeholder i {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 5px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: #dee2e6;
}

.divider span {
  position: relative;
  background: white;
  padding: 0 15px;
  color: #495057;
  font-weight: 500;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.image-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
  padding-top: 75%; /* 4:3 aspect ratio */
  width: 100%;
}

.room-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-item:hover .room-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-info {
  margin: 0;
  font-size: 0.8rem;
  text-align: center;
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

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}
</style>
