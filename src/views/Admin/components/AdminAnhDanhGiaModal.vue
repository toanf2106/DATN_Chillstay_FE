<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="anh-danh-gia-details-modal">
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
      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="$emit('close')"
        >
          <i class="fas fa-times"></i> Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import {
  getAnhDanhGiaByDanhGiaId,
  uploadAnhDanhGia,
  deleteAnhDanhGia,
} from '@/Service/DanhGiaService'
import { useToast } from '@/stores/notificationStore'

export default {
  name: 'AdminAnhDanhGiaModal',
  props: {
    danhGia: {
      type: Object,
      required: true,
    },
    viewOnly: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
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
        ? `Ảnh chi tiết - Đánh giá #${props.danhGia.maDanhGia}`
        : `Quản lý ảnh - Đánh giá #${props.danhGia.maDanhGia}`
    })

    const fetchImages = async () => {
      try {
        loading.value = true
        const response = await getAnhDanhGiaByDanhGiaId(props.danhGia.id)
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
        await uploadAnhDanhGia(selectedFile.value, props.danhGia.id)
        toast.success('Tải ảnh lên thành công!')
        resetUpload()
        await fetchImages()
        emit('images-updated');
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
        await deleteAnhDanhGia(imageId)
        toast.success('Xóa ảnh thành công!')
        await fetchImages()
         emit('images-updated');
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
  width: 100%;
  height: 100%;
  background-color: rgba(30, 41, 59, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
  transition: opacity 0.3s ease;
}

.anh-danh-gia-details-modal {
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  width: 800px;
  max-width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-fade-in 0.3s ease;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 2rem;
  font-weight: 300;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.upload-area:hover {
  background-color: #f8fafc;
  border-color: #a0aec0;
}

.upload-placeholder i {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.upload-placeholder p {
  margin: 0;
  color: #64748b;
  font-weight: 500;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.image-container {
  width: 100%;
  padding-top: 100%; /* Aspect ratio 1:1 */
  position: relative;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-item:hover img {
  transform: scale(1.1);
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}
</style>
