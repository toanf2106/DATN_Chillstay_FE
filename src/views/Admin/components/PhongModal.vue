<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="phong-details-modal">
      <!-- Modal header -->
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Modal body -->
      <div class="modal-body">
        <div class="row">
          <!-- Left side: Image and basic info -->
          <div class="col-md-4">
            <div class="phong-image-display">
              <div
                class="image-preview"
                :class="{ 'view-mode': isViewMode, 'has-image': previewImage || formData.anhBia }"
                @click="!isViewMode && triggerFileInput()"
              >
                <img
                  v-if="previewImage || formData.anhBia"
                  :src="previewImage || getImageUrl(formData.anhBia)"
                  alt="Ảnh Phòng"
                  class="uploaded-image"
                  @error="handleImageError"
                />
                <div v-else class="image-placeholder">
                  <i class="fas fa-door-open"></i>
                  <span>{{ isViewMode ? 'Chưa có ảnh' : 'Thêm ảnh' }}</span>
                </div>
                <div class="image-overlay" v-if="!isViewMode">
                  <i class="fas fa-camera"></i>
                  <span>{{ previewImage || formData.anhBia ? 'Thay đổi ảnh' : 'Thêm ảnh' }}</span>
                </div>
              </div>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                accept="image/*"
                style="display: none"
              />

              <h4 class="room-title mt-3">{{ formData.tenPhong || 'Phòng mới' }}</h4>
              <p class="room-id" v-if="formData.maPhong">
                <span class="id-label">Mã phòng:</span>
                <span class="id-value">{{ formData.maPhong }}</span>
              </p>

              <div class="status-badge">
                <div class="status-label">Trạng thái:</div>
                <div :class="`status-pill ${formData.trangThai ? 'active' : 'inactive'}`">
                  <i :class="formData.trangThai ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  {{ formData.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Right side: Form -->
          <div class="col-md-8">
            <form @submit.prevent="handleSubmit">
              <!-- Form cho mode chỉnh sửa/thêm mới -->
              <div v-if="!isViewMode" class="edit-form">
                <!-- Tab navigation cho các phần thông tin -->
                <ul class="nav nav-tabs mb-3" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="info-tab" data-bs-toggle="tab" data-bs-target="#info" type="button" role="tab" aria-selected="true">
                      <i class="fas fa-info-circle me-1"></i> Thông tin cơ bản
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="capacity-tab" data-bs-toggle="tab" data-bs-target="#capacity" type="button" role="tab" aria-selected="false">
                      <i class="fas fa-users me-1"></i> Sức chứa
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="description-tab" data-bs-toggle="tab" data-bs-target="#description" type="button" role="tab" aria-selected="false">
                      <i class="fas fa-align-left me-1"></i> Mô tả
                    </button>
                  </li>
                </ul>

                <!-- Tab content -->
                <div class="tab-content">
                  <!-- Tab 1: Thông tin cơ bản -->
                  <div class="tab-pane fade show active" id="info" role="tabpanel" aria-labelledby="info-tab">
                    <div class="form-group">
                      <label for="tenPhong" class="form-label">Tên phòng <span class="required-mark">*</span></label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-door-open"></i></span>
                        <input
                          type="text"
                          id="tenPhong"
                          v-model="formData.tenPhong"
                          class="form-control"
                          :class="{ 'is-invalid': errors.tenPhong }"
                          placeholder="Nhập tên phòng"
                          required
                        />
                        <div v-if="errors.tenPhong" class="invalid-feedback">
                          {{ errors.tenPhong }}
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="loaiPhong" class="form-label">Loại phòng <span class="required-mark">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-tag"></i></span>
                            <select
                              id="loaiPhong"
                              v-model="formData.idloaiPhong.id"
                              class="form-select"
                              :class="{ 'is-invalid': errors.idloaiPhong }"
                              required
                            >
                              <option value="" disabled selected>-- Chọn loại phòng --</option>
                              <option
                                v-for="loaiPhong in loaiPhongList"
                                :key="loaiPhong.id"
                                :value="loaiPhong.id"
                              >
                                {{ loaiPhong.tenLoaiPhong }}
                              </option>
                            </select>
                            <div v-if="errors.idloaiPhong" class="invalid-feedback">
                              {{ errors.idloaiPhong }}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="homeStay" class="form-label">Homestay <span class="required-mark">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-home"></i></span>
                            <select
                              id="homeStay"
                              v-model="formData.idhomeStay.id"
                              class="form-select"
                              :class="{ 'is-invalid': errors.idhomeStay }"
                              required
                            >
                              <option value="" disabled selected>-- Chọn homestay --</option>
                              <option
                                v-for="homestay in homestayList"
                                :key="homestay.id"
                                :value="homestay.id"
                              >
                                {{ homestay.tenHomestay }}
                              </option>
                            </select>
                            <div v-if="errors.idhomeStay" class="invalid-feedback">
                              {{ errors.idhomeStay }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="tangSo" class="form-label">Tầng số</label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-layer-group"></i></span>
                            <input
                              type="number"
                              id="tangSo"
                              v-model="formData.tangSo"
                              class="form-control"
                              min="0"
                              :class="{ 'is-invalid': errors.tangSo }"
                              placeholder="Tầng"
                            />
                            <div v-if="errors.tangSo" class="invalid-feedback">
                              {{ errors.tangSo }}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="dienTich" class="form-label">Diện tích (m²)</label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-vector-square"></i></span>
                            <input
                              type="number"
                              id="dienTich"
                              v-model="formData.dienTich"
                              class="form-control"
                              min="0.01"
                              step="0.01"
                              :class="{ 'is-invalid': errors.dienTich }"
                              placeholder="Diện tích"
                            />
                            <span class="input-group-text">m²</span>
                            <div v-if="errors.dienTich" class="invalid-feedback">
                              {{ errors.dienTich }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="trangThai" class="form-label">Trạng thái</label>
                      <div class="status-switch">
                        <div
                          class="switch-option"
                          :class="{ 'active': formData.trangThai }"
                          @click="formData.trangThai = true"
                        >
                          <i class="fas fa-check-circle"></i> Hoạt động
                        </div>
                        <div
                          class="switch-option"
                          :class="{ 'active': !formData.trangThai }"
                          @click="formData.trangThai = false"
                        >
                          <i class="fas fa-times-circle"></i> Không hoạt động
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Tab 2: Sức chứa -->
                  <div class="tab-pane fade" id="capacity" role="tabpanel" aria-labelledby="capacity-tab">
                    <div class="capacity-container">
                      <div class="capacity-header">
                        <h5 class="capacity-title">Sức chứa phòng</h5>
                        <p class="capacity-subtitle">Thiết lập số lượng người tối đa có thể ở trong phòng</p>
                      </div>

                      <div class="row">
                        <div class="col-md-6">
                          <div class="form-group">
                            <label for="soNguoiLon" class="form-label">
                              <i class="fas fa-male me-1"></i> Số người lớn
                            </label>
                            <div class="input-group">
                              <button type="button" class="btn btn-outline-secondary" @click="decrementCount('soNguoiLon')">
                                <i class="fas fa-minus"></i>
                              </button>
                              <input
                                type="number"
                                id="soNguoiLon"
                                v-model="formData.soNguoiLon"
                                class="form-control text-center"
                                min="0"
                                :class="{ 'is-invalid': errors.soNguoiLon }"
                              />
                              <button type="button" class="btn btn-outline-secondary" @click="incrementCount('soNguoiLon')">
                                <i class="fas fa-plus"></i>
                              </button>
                              <div v-if="errors.soNguoiLon" class="invalid-feedback">
                                {{ errors.soNguoiLon }}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-group">
                            <label for="soNguoiNho" class="form-label">
                              <i class="fas fa-child me-1"></i> Số trẻ em
                            </label>
                            <div class="input-group">
                              <button type="button" class="btn btn-outline-secondary" @click="decrementCount('soNguoiNho')">
                                <i class="fas fa-minus"></i>
                              </button>
                              <input
                                type="number"
                                id="soNguoiNho"
                                v-model="formData.soNguoiNho"
                                class="form-control text-center"
                                min="0"
                                :class="{ 'is-invalid': errors.soNguoiNho }"
                              />
                              <button type="button" class="btn btn-outline-secondary" @click="incrementCount('soNguoiNho')">
                                <i class="fas fa-plus"></i>
                              </button>
                              <div v-if="errors.soNguoiNho" class="invalid-feedback">
                                {{ errors.soNguoiNho }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="total-capacity">
                        <div class="total-capacity-label">
                          <i class="fas fa-users"></i> Tổng số người tối đa:
                        </div>
                        <div class="total-capacity-value">
                          {{ formData.soNguoiToiDa }}
                        </div>
                        <small class="text-muted d-block mt-1">
                          Tự động tính từ tổng số người lớn và trẻ em
                        </small>
                      </div>
                    </div>
                  </div>

                  <!-- Tab 3: Mô tả -->
                  <div class="tab-pane fade" id="description" role="tabpanel" aria-labelledby="description-tab">
                    <div class="form-group">
                      <label for="moTa" class="form-label">Mô tả chi tiết về phòng</label>
                      <textarea
                        id="moTa"
                        v-model="formData.moTa"
                        class="form-control description-textarea"
                        rows="6"
                        placeholder="Nhập mô tả chi tiết về phòng (trang thiết bị, tiện nghi, view, v.v.)"
                      ></textarea>
                      <small class="text-muted">Mô tả chi tiết sẽ giúp khách hàng có thông tin đầy đủ về phòng</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Chế độ xem chi tiết -->
              <div v-if="isViewMode" class="phong-info">
                <div class="form-group">
                  <label>Tên Phòng</label>
                  <input type="text" class="form-control" :value="formData.tenPhong" readonly />
                </div>

                <div class="form-group" v-if="formData.maPhong">
                  <label>Mã Phòng</label>
                  <input type="text" class="form-control" :value="formData.maPhong" readonly />
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Loại Phòng</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="getLoaiPhongName(formData.idloaiPhong.id)"
                        readonly
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Homestay</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="getHomestayName(formData.idhomeStay.id)"
                        readonly
                      />
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Diện tích</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="`${formData.dienTich} m²`"
                        readonly
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Tầng số</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formData.tangSo"
                        readonly
                      />
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Số người lớn</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formData.soNguoiLon || 0"
                        readonly
                      />
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Số trẻ em</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formData.soNguoiNho || 0"
                        readonly
                      />
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Số người tối đa</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formData.soNguoiToiDa || 0"
                        readonly
                      />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>Mô tả</label>
                  <textarea
                    class="form-control"
                    rows="3"
                    :value="formData.moTa || 'Không có mô tả'"
                    readonly
                  ></textarea>
                </div>

                <div class="row" v-if="formData.ngayTao">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Ngày tạo</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formatDate(formData.ngayTao)"
                        readonly
                      />
                    </div>
                  </div>
                  <div class="col-md-6" v-if="formData.ngayUpdate">
                    <div class="form-group">
                      <label>Ngày cập nhật</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formatDate(formData.ngayUpdate)"
                        readonly
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="$emit('close')">
                  <i class="fas fa-times me-1"></i> {{ isViewMode ? 'Đóng' : 'Hủy' }}
                </button>
                <button
                  v-if="isViewMode"
                  type="button"
                  class="btn btn-primary"
                  @click="$emit('edit')"
                >
                  <i class="fas fa-edit me-1"></i> Chỉnh sửa
                </button>
                <button
                  v-if="!isViewMode"
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  <span
                    v-if="isSubmitting"
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span v-else>
                    <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                    {{ isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu' }}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'PhongModal',
  props: {
    phong: {
      type: Object,
      default: null,
    },
    loaiPhongList: {
      type: Array,
      required: true,
    },
    homestayList: {
      type: Array,
      required: true,
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
  emits: ['save', 'close', 'edit'],
  setup(props, { emit }) {
    const formData = ref({
      idloaiPhong: { id: null },
      idhomeStay: { id: null },
      tenPhong: '',
      dienTich: 0,
      moTa: '',
      tangSo: 1,
      soNguoiLon: 0,
      soNguoiNho: 0,
      soNguoiToiDa: 0,
      ngayTao: null,
      ngayUpdate: null,
      anhBia: '',
      trangThai: true
    })

    // Debug: Log danh sách loại phòng và homestay
    console.log("LoaiPhongList:", props.loaiPhongList);
    console.log("HomestayList:", props.homestayList);

    const isSubmitting = ref(false)
    const errors = ref({})
    const fileInput = ref(null)
    const previewImage = ref(null)
    const selectedFile = ref(null)
    const modalInitialized = ref(false)

    // Đảm bảo rằng modal được khởi tạo đầy đủ trước khi xử lý các sự kiện
    onMounted(() => {
      modalInitialized.value = true;
      console.log("Modal đã được khởi tạo hoàn chỉnh");
    });

    // Computed property for modal title based on mode
    const modalTitle = computed(() => {
      if (props.isViewMode) return 'Chi tiết Phòng'
      return props.isEdit ? 'Chỉnh sửa Phòng' : 'Thêm mới Phòng'
    })

    // Computed property để tính tổng số người
    const calculateTotalPeople = computed(() => {
      const soNguoiLon = parseInt(formData.value.soNguoiLon) || 0;
      const soNguoiNho = parseInt(formData.value.soNguoiNho) || 0;
      const total = soNguoiLon + soNguoiNho;
      return total > 0 ? total : 0;
    });

    // Hàm cập nhật số người tối đa khi thay đổi số người lớn hoặc trẻ em
    const updateTotalPeople = () => {
      formData.value.soNguoiToiDa = calculateTotalPeople.value;
    };

    const validateForm = () => {
      const newErrors = {}

      if (!formData.value.tenPhong?.trim()) {
        newErrors.tenPhong = 'Tên Phòng không được để trống'
      }

      if (!formData.value.idloaiPhong.id) {
        newErrors.idloaiPhong = 'Vui lòng chọn loại phòng'
      }

      if (!formData.value.idhomeStay.id) {
        newErrors.idhomeStay = 'Vui lòng chọn homestay'
      }

      // Kiểm tra diện tích là số hợp lệ và lớn hơn 0
      const dienTich = parseFloat(formData.value.dienTich)
      if (isNaN(dienTich) || dienTich <= 0) {
        newErrors.dienTich = 'Diện tích phải là số dương lớn hơn 0'
      }

      // Kiểm tra tầng
      const tangSo = parseInt(formData.value.tangSo)
      if (isNaN(tangSo) || tangSo < 0) {
        newErrors.tangSo = 'Tầng phải là số không âm'
      }

      // Kiểm tra số người lớn và trẻ em
      const soNguoiLon = parseInt(formData.value.soNguoiLon)
      if (isNaN(soNguoiLon) || soNguoiLon < 0) {
        newErrors.soNguoiLon = 'Số người lớn phải là số không âm'
      }

      const soNguoiNho = parseInt(formData.value.soNguoiNho)
      if (isNaN(soNguoiNho) || soNguoiNho < 0) {
        newErrors.soNguoiNho = 'Số trẻ em phải là số không âm'
      }

      // Đảm bảo có ít nhất 1 người
      if (calculateTotalPeople.value <= 0) {
        newErrors.soNguoiLon = 'Tổng số người phải lớn hơn 0'
      }

      errors.value = newErrors
      return Object.keys(newErrors).length === 0
    }

    const getImageUrl = (img) => {
      if (!img) return '/images/default-avatar.png'

      // Nếu là URL đầy đủ
      if (img.startsWith('http')) return img

      // Thêm base URL khi ảnh không phải là URL đầy đủ
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      return `${baseUrl}/images/${img}`
    }

    // Helper functions for view mode
    const getLoaiPhongName = (id) => {
      const loai = props.loaiPhongList.find((l) => l.id === id)
      return loai ? loai.tenLoaiPhong : 'Không xác định'
    }

    const getHomestayName = (id) => {
      const homestay = props.homestayList.find((h) => h.id === id)
      return homestay ? homestay.tenHomestay : 'Không xác định'
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
    }

    const triggerFileInput = () => {
      if (props.isViewMode) return
      fileInput.value.click()
    }

    const handleImageError = (event) => {
      // Use default avatar image if loading fails
      event.target.src = '/images/default-avatar.png'
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        try {
          // Lưu file đã chọn
          selectedFile.value = file

          // Hiển thị preview trước khi upload
          const reader = new FileReader()
          reader.onload = (e) => {
            previewImage.value = e.target.result
          }
          reader.readAsDataURL(file)

          // Lưu tên file cho hiển thị
          formData.value.anhBia = file.name
        } catch (error) {
          console.error('Lỗi xử lý ảnh:', error)
          alert('Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại hoặc chọn ảnh khác.')
        }
      }
    }

    const handleSubmit = async () => {
      // Cập nhật số người tối đa trước khi submit
      formData.value.soNguoiToiDa = calculateTotalPeople.value;

      if (!validateForm()) {
        return
      }

      isSubmitting.value = true
      try {
        // Tạo FormData để gửi dữ liệu và file
        const formDataToSend = new FormData()

        // Thêm file ảnh nếu có
        if (selectedFile.value) {
          formDataToSend.append('file', selectedFile.value)
        }

        // Chuẩn bị dữ liệu phòng
        const phongData = { ...formData.value };

        // Sử dụng ID trực tiếp thay vì đối tượng lồng nhau
        if (phongData.idloaiPhong && phongData.idloaiPhong.id) {
          phongData.LoaiPhong_ID = parseInt(phongData.idloaiPhong.id, 10);
          delete phongData.idloaiPhong;
          delete phongData.loaiPhong;
        }

        if (phongData.idhomeStay && phongData.idhomeStay.id) {
          phongData.HomeStay_ID = parseInt(phongData.idhomeStay.id, 10);
          delete phongData.idhomeStay;
          delete phongData.homeStay;
        }

        // Đổi tên các trường khác để phù hợp với backend
        if (phongData.tenPhong !== undefined) {
          phongData.Ten_Phong = phongData.tenPhong;
          delete phongData.tenPhong;
        }

        if (phongData.dienTich !== undefined) {
          phongData.Dien_Tich = parseFloat(phongData.dienTich);
          delete phongData.dienTich;
        }

        if (phongData.moTa !== undefined) {
          phongData.Mo_Ta = phongData.moTa || "";
          delete phongData.moTa;
        }

        if (phongData.tangSo !== undefined) {
          phongData.Tang_So = parseInt(phongData.tangSo, 10);
          delete phongData.tangSo;
        }

        if (phongData.soNguoiLon !== undefined) {
          phongData.So_Nguoi_Lon = parseInt(phongData.soNguoiLon, 10);
          delete phongData.soNguoiLon;
        }

        if (phongData.soNguoiNho !== undefined) {
          phongData.So_Nguoi_Nho = parseInt(phongData.soNguoiNho, 10);
          delete phongData.soNguoiNho;
        }

        if (phongData.soNguoiToiDa !== undefined) {
          phongData.So_Nguoi_Toi_Da = parseInt(phongData.soNguoiToiDa, 10);
          delete phongData.soNguoiToiDa;
        }

        if (phongData.trangThai !== undefined) {
          phongData.Trang_Thai = phongData.trangThai;
          delete phongData.trangThai;
        }

        // Nếu là chỉnh sửa, đảm bảo có ID
        if (props.isEdit && props.phong && props.phong.id) {
          phongData.id = parseInt(props.phong.id, 10)
        }

        // Log để debug trước khi gửi
        console.log('Dữ liệu phòng trước khi gửi:', phongData);
        console.log('LoaiPhong_ID:', phongData.LoaiPhong_ID);
        console.log('HomeStay_ID:', phongData.HomeStay_ID);

        // Thêm dữ liệu phòng dạng JSON
        formDataToSend.append('phong', JSON.stringify(phongData))

        // Gọi hàm lưu từ component cha
        await emit('save', formDataToSend)
      } catch (error) {
        console.error('Lỗi khi lưu phòng:', error);
        // Hiển thị lỗi cho người dùng
        alert(error.message || 'Có lỗi xảy ra khi lưu phòng. Vui lòng thử lại.');
      } finally {
        isSubmitting.value = false
      }
    }

    // Thêm phương thức tăng giảm số lượng người
    function incrementCount(field) {
      if (field === 'soNguoiLon' || field === 'soNguoiNho') {
        // Chuyển đổi sang số nếu là undefined hoặc null
        if (!formData.value[field]) {
          formData.value[field] = 0;
        }
        formData.value[field]++;
        updateTotalCapacity();
      }
    }

    function decrementCount(field) {
      if (field === 'soNguoiLon' || field === 'soNguoiNho') {
        // Chuyển đổi sang số nếu là undefined hoặc null
        if (!formData.value[field]) {
          formData.value[field] = 0;
        }
        // Đảm bảo giá trị không âm
        if (formData.value[field] > 0) {
          formData.value[field]--;
          updateTotalCapacity();
        }
      }
    }

    // Cập nhật tổng số người tối đa
    function updateTotalCapacity() {
      const soNguoiLon = parseInt(formData.value.soNguoiLon || 0);
      const soNguoiNho = parseInt(formData.value.soNguoiNho || 0);
      formData.value.soNguoiToiDa = soNguoiLon + soNguoiNho;
    }

    // Nếu là chỉnh sửa, điền dữ liệu hiện có
    watch(
      () => props.phong,
      (newVal) => {
        if (newVal) {
          // Copy dữ liệu từ props vào form
          formData.value = { ...newVal }

          // Đảm bảo idloaiPhong và idhomeStay có cấu trúc đúng
          if (typeof formData.value.idloaiPhong !== 'object' || formData.value.idloaiPhong === null) {
            formData.value.idloaiPhong = { id: formData.value.idloaiPhong ? parseInt(formData.value.idloaiPhong, 10) : null };
          }

          if (typeof formData.value.idhomeStay !== 'object' || formData.value.idhomeStay === null) {
            formData.value.idhomeStay = { id: formData.value.idhomeStay ? parseInt(formData.value.idhomeStay, 10) : null };
          }

          // Đảm bảo ID là số nguyên, không phải chuỗi
          if (formData.value.idloaiPhong.id !== null) {
            formData.value.idloaiPhong.id = parseInt(formData.value.idloaiPhong.id, 10);
          }

          if (formData.value.idhomeStay.id !== null) {
            formData.value.idhomeStay.id = parseInt(formData.value.idhomeStay.id, 10);
          }

          // Đảm bảo số người tối đa bằng tổng số người lớn và trẻ em
          updateTotalPeople();

          // Chỉ reset preview image khi mở một phòng mới hoặc thêm mới
          if (!props.isEdit || selectedFile.value === null) {
            previewImage.value = null
            selectedFile.value = null
          }
        } else {
          // Reset form khi thêm mới
          formData.value = {
            idloaiPhong: { id: null },
            idhomeStay: { id: null },
            tenPhong: '',
            dienTich: 0,
            moTa: '',
            tangSo: 1,
            soNguoiLon: 0,
            soNguoiNho: 0,
            soNguoiToiDa: 0,
            ngayTao: null,
            ngayUpdate: null,
            anhBia: '',
            trangThai: true
          }
          previewImage.value = null
          selectedFile.value = null
        }
      },
      { immediate: true }
    )

    // Watch để cập nhật số người tối đa khi thay đổi số người lớn hoặc trẻ em
    watch(
      [() => formData.value.soNguoiLon, () => formData.value.soNguoiNho],
      () => {
        updateTotalPeople();
      }
    );

    return {
      formData,
      errors,
      isSubmitting,
      fileInput,
      previewImage,
      selectedFile,
      modalTitle,
      calculateTotalPeople,
      updateTotalPeople,
      modalInitialized,
      validateForm,
      triggerFileInput,
      handleFileUpload,
      handleImageError,
      handleSubmit,
      getImageUrl,
      getLoaiPhongName,
      getHomestayName,
      formatDate,
      incrementCount,
      decrementCount,
      updateTotalCapacity
    }
  },
}
</script>

<style lang="scss" scoped>
/* Modal overlay */
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

/* Modal container */
.phong-details-modal {
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

/* Modal header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #343a40;
}

.close-button {
  position: relative;
  top: -2px;
  background: #f1f5f9;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

/* Modal body */
.modal-body {
  padding: 25px;
}

/* Form styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
}

.form-control,
.form-select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.form-control:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  outline: none;
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #ef4444;
}

.invalid-feedback {
  color: #ef4444;
  font-size: 14px;
  margin-top: 5px;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 0;
  border-top: 1px solid #e5e7eb;
  margin-top: 20px;
}

.btn {
  font-size: 1rem;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #475569;
  border: none;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

.btn-primary {
  background-color: #0d6efd;
  border: none;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.7;
  transform: none;
}

/* Avatar section */
.phong-image-display {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-preview {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  border: 2px dashed #d1d5db;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  background-color: #f9fafb;
  transition: all 0.3s ease;
  margin-bottom: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  position: relative; /* Added for overlay positioning */
}

.image-preview:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.image-preview.has-image {
  border-color: #3b82f6; /* Highlight border when image is present */
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #9ca3af;
  height: 100%;
  width: 100%;
  justify-content: center;
}

.image-placeholder i {
  font-size: 50px;
  margin-bottom: 10px;
}

.image-placeholder span {
  font-size: 14px;
  text-align: center;
}

.image-overlay {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.phong-image-display h4 {
  font-size: 1.2rem;
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
}

.phong-image-display .phong-id {
  font-size: 0.85rem;
  color: #6c757d;
}

.phong-image-display .room-title {
  font-size: 1.1rem;
  margin-top: 0.5rem;
  margin-bottom: 0.2rem;
}

.phong-image-display .room-id {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.phong-image-display .id-label {
  font-weight: 500;
  color: #4b5563;
}

.phong-image-display .id-value {
  font-weight: 600;
  color: #343a40;
}

.status-badge {
  padding-top: 15px;
  text-align: center;
}

.status-badge .status-label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4b5563;
}

.status-badge .status-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  gap: 5px;
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.status-badge .status-pill.active {
  background-color: #10b981; /* Green for active */
}

.status-badge .status-pill.inactive {
  background-color: #ef4444; /* Red for inactive */
}

.status-badge .status-pill:hover {
  transform: translateY(-2px);
}

/* Add additional styles for view mode */
.phong-info .form-control[readonly] {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  cursor: text;
  padding: 8px 12px;
  font-size: 0.95rem;
}

.phong-info .form-group {
  margin-bottom: 12px;
}

.phong-info label {
  font-size: 0.9rem;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

/* Avatar preview in view mode shouldn't have pointer cursor */
.image-preview.view-mode {
  cursor: default;
  pointer-events: none;
}

.image-preview.view-mode:hover {
  border-color: #d1d5db;
  transform: none;
}

/* Form styling */
.edit-form {
  padding: 5px;
}

.nav-tabs {
  border-bottom: 1px solid #dee2e6;
}

.nav-tabs .nav-link {
  margin-bottom: -1px;
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 10px 20px;
  color: #495057;
}

.nav-tabs .nav-link:hover,
.nav-tabs .nav-link:focus {
  border-color: #e9ecef #e9ecef #dee2e6;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: #495057;
}

.required-mark {
  color: #dc3545;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
  color: #6c757d;
}

.form-control, .form-select {
  border-color: #ced4da;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  color: #212529;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

.status-switch {
  display: flex;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 8px;
  overflow: hidden;
}

.switch-option {
  flex: 1;
  padding: 10px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.switch-option:first-child {
  border-right: 1px solid #ced4da;
}

.switch-option.active {
  background-color: #e9ecef;
  font-weight: 600;
}

.switch-option:first-child.active {
  color: #198754;
  background-color: rgba(25, 135, 84, 0.1);
}

.switch-option:last-child.active {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
}

/* Capacity tab styling */
.capacity-container {
  padding: 10px 5px;
}

.capacity-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 15px;
}

.capacity-title {
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: #0d6efd;
}

.capacity-subtitle {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0;
}

.total-capacity {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.total-capacity-label {
  font-size: 1rem;
  color: #495057;
  margin-bottom: 5px;
}

.total-capacity-value {
  font-size: 2rem;
  font-weight: bold;
  color: #0d6efd;
  margin-bottom: 5px;
}

.description-textarea {
  min-height: 150px;
  resize: vertical;
}
</style>
