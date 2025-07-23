<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="homestay-details-modal">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-4">
            <div class="homestay-avatar-display">
              <div
                class="avatar-preview"
                :class="{ 'view-mode': isViewMode }"
                @click="triggerFileInput"
              >
                <img
                  v-if="previewImage || formData.hinhAnh"
                  :src="previewImage || getImageUrl(formData.hinhAnh)"
                  alt="Ảnh Homestay"
                  class="uploaded-avatar"
                  @error="handleImageError"
                />
                <div v-else class="avatar-placeholder">
                  <i class="fas fa-home"></i>
                  <span>{{ isViewMode ? 'Chưa có ảnh' : 'Thêm ảnh' }}</span>
                </div>
              </div>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                accept="image/*"
                style="display: none"
              />

              <h4 class="text-center mt-3">{{ formData.tenHomestay || 'Homestay mới' }}</h4>
              <p class="text-center homestay-id" v-if="formData.maHomestay">
                Mã: {{ formData.maHomestay }}
              </p>

              <div class="status-badge" v-if="isEdit || isViewMode">
                <label>Trạng Thái:</label>
                <span :class="`badge ${formData.trangThai ? 'bg-success' : 'bg-danger'}`">
                  {{ formData.trangThai ? 'Hoạt động' : 'Khóa' }}
                </span>
              </div>

              <div class="mt-3 text-center" v-if="isViewMode">
                <button type="button" class="btn btn-info" @click="viewDetailImages">
                  <i class="fas fa-images me-1"></i> Xem ảnh chi tiết
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <form @submit.prevent="handleSubmit">
              <!-- Form for edit/add mode -->
              <div v-if="!isViewMode">
                <div class="form-group">
                  <label for="tenHomestay">Tên Homestay <span class="text-danger">*</span></label>
                  <input
                    id="tenHomestay"
                    v-model="formData.tenHomestay"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.tenHomestay }"
                    required
                  />
                  <div v-if="errors.tenHomestay" class="invalid-feedback">
                    {{ errors.tenHomestay }}
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="idLoaiHomeStay"
                        >Loại Homestay <span class="text-danger">*</span></label
                      >
                      <select
                        id="idLoaiHomeStay"
                        v-model="formData.idLoaiHomeStay"
                        class="form-select"
                        :class="{ 'is-invalid': errors.idLoaiHomeStay }"
                        required
                      >
                        <option value="" disabled selected>Chọn loại homestay</option>
                        <option
                          v-for="loai in loaiList"
                          :key="loai.id"
                          :value="loai.id"
                          :disabled="!loai.trangThai"
                        >
                          {{ loai.tenLoaiHomestay || loai.tenLoai }}
                        </option>
                      </select>
                      <div v-if="errors.idLoaiHomeStay" class="invalid-feedback">
                        {{ errors.idLoaiHomeStay }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="idChuHomeStay"
                        >Chủ sở hữu <span class="text-danger">*</span></label
                      >
                      <select
                        id="idChuHomeStay"
                        v-model="formData.idChuHomeStay"
                        class="form-select"
                        :class="{ 'is-invalid': errors.idChuHomeStay }"
                        required
                      >
                        <option value="" disabled selected>Chọn chủ homestay</option>
                        <option
                          v-for="chu in chuList"
                          :key="chu.id"
                          :value="chu.id"
                          :disabled="!chu.trangThai"
                        >
                          {{ chu.hotenChuHomestay || chu.hoTen }}
                        </option>
                      </select>
                      <div v-if="errors.idChuHomeStay" class="invalid-feedback">
                        {{ errors.idChuHomeStay }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="dienTich"
                        >Diện tích (m²) <span class="text-danger">*</span></label
                      >
                      <input
                        id="dienTich"
                        v-model="formData.dienTich"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.dienTich }"
                        min="0.01"
                        step="any"
                        placeholder="Nhập diện tích (VD: 25.5)"
                        required
                      />
                      <div v-if="errors.dienTich" class="invalid-feedback">
                        {{ errors.dienTich }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="giaCaHomestay"
                        >Giá (VND) <span class="text-danger">*</span></label
                      >
                      <input
                        id="giaCaHomestay"
                        v-model.number="formData.giaCaHomestay"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.giaCaHomestay }"
                        min="1000"
                        required
                      />
                      <div v-if="errors.giaCaHomestay" class="invalid-feedback">
                        {{ errors.giaCaHomestay }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="diaChi">Địa chỉ <span class="text-danger">*</span></label>
                  <textarea
                    id="diaChi"
                    v-model="formData.diaChi"
                    class="form-control"
                    :class="{ 'is-invalid': errors.diaChi }"
                    rows="3"
                    required
                  ></textarea>
                  <div v-if="errors.diaChi" class="invalid-feedback">
                    {{ errors.diaChi }}
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="tinhTrang">Tình trạng</label>
                      <select id="tinhTrang" v-model="formData.tinhTrang" class="form-select">
                        <option value="Trống và sạch">Trống và sạch</option>
                        <option value="Đã có người ở">Đã có người ở</option>
                        <option value="Trống nhưng bẩn">Trống nhưng bẩn</option>
                        <option value="Đang sửa chữa">Đang sửa chữa</option>
                        <option value="Đang dọn dẹp">Đang dọn dẹp</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
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
                </div>

                <!-- Phần Tiện Nghi -->
                <div class="form-group mt-4">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="fw-bold">Tiện Nghi</label>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary"
                      @click="showAddTienNghi = true"
                    >
                      <i class="fas fa-plus"></i> Thêm tiện nghi khác
                    </button>
                  </div>

                  <div class="controls-container">
                    <div class="search-box">
                      <div class="search-input-wrapper">
                        <i class="fas fa-search search-icon"></i>
                        <input
                          type="text"
                          v-model="searchTienNghi"
                          placeholder="Tìm kiếm tiện nghi..."
                          class="search-input"
                          @input="filterTienNghi"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="tien-nghi-container">
                    <div v-if="loading" class="text-center py-3">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                      </div>
                    </div>

                    <div v-else-if="filteredTienNghi.length === 0" class="text-center py-3 text-muted">
                      <i class="fas fa-info-circle me-1"></i> Chưa có tiện nghi nào
                    </div>

                    <div v-else class="tien-nghi-list">
                      <div v-for="item in filteredTienNghi" :key="item.id" class="tien-nghi-item">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :id="`tiennghi-${item.id}`"
                            v-model="selectedTienNghi[item.id].selected"
                          />
                          <label class="form-check-label" :for="`tiennghi-${item.id}`">
                            {{ item.tenTienNghi }}
                          </label>
                        </div>

                        <div v-if="selectedTienNghi[item.id].selected" class="tien-nghi-details">
                          <div class="input-group input-group-sm">
                            <span class="input-group-text">Số lượng</span>
                            <input
                              type="number"
                              class="form-control"
                              v-model="selectedTienNghi[item.id].soLuong"
                              min="1"
                            />
                            <span class="input-group-text">{{ item.donVi }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Modal thêm tiện nghi mới -->
                <div
                  v-if="showAddTienNghi"
                  class="modal-overlay"
                  @click.self="showAddTienNghi = false"
                >
                  <div class="modal-form">
                    <div class="modal-header">
                      <h3>Thêm Tiện Nghi Mới</h3>
                      <button class="close-button" @click="showAddTienNghi = false">&times;</button>
                    </div>
                    <div class="modal-body">
                      <form @submit.prevent="addNewTienNghi">
                        <div class="form-group">
                          <label for="tenTienNghi"
                            >Tên Tiện Nghi <span class="text-danger">*</span></label
                          >
                          <input
                            id="tenTienNghi"
                            v-model="newTienNghi.tenTienNghi"
                            type="text"
                            class="form-control"
                            required
                          />
                        </div>

                        <div class="form-group">
                          <label for="donVi">Đơn Vị <span class="text-danger">*</span></label>
                          <input
                            id="donVi"
                            v-model="newTienNghi.donVi"
                            type="text"
                            class="form-control"
                            required
                          />
                        </div>

                        <div class="form-group">
                          <label for="moTa">Mô Tả</label>
                          <textarea
                            id="moTa"
                            v-model="newTienNghi.moTa"
                            class="form-control"
                            rows="3"
                          ></textarea>
                        </div>

                        <div class="form-group">
                          <label for="soLuong">Số Lượng <span class="text-danger">*</span></label>
                          <input
                            id="soLuong"
                            v-model="newTienNghi.soLuong"
                            type="number"
                            class="form-control"
                            min="1"
                            required
                          />
                        </div>

                        <div class="form-actions mt-3">
                          <button
                            type="button"
                            class="btn btn-secondary"
                            @click="showAddTienNghi = false"
                          >
                            Hủy
                          </button>
                          <button type="submit" class="btn btn-primary">Thêm</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Read-only view for view mode -->
              <div v-if="isViewMode" class="staff-info">
                <div class="form-group">
                  <label>Tên Homestay</label>
                  <input type="text" class="form-control" :value="formData.tenHomestay" readonly />
                </div>

                <div class="form-group">
                  <label>Loại Homestay</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="getLoaiName(formData.idLoaiHomeStay)"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label>Quản lý Homestay</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="getChuName(formData.idChuHomeStay)"
                    readonly
                  />
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
                      <label>Giá</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formData.giaCaHomestay ? formatCurrency(formData.giaCaHomestay) : '0 ₫'"
                        readonly
                      />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>Địa chỉ</label>
                  <textarea
                    class="form-control"
                    rows="3"
                    :value="formData.diaChi"
                    readonly
                  ></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Tình trạng</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formData.tinhTrang"
                        readonly
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Trạng thái</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="formData.trangThai ? 'Đang hoạt động' : 'Đã khóa'"
                        readonly
                      />
                    </div>
                  </div>
                </div>

                <!-- Tiện Nghi Homestay -->
                <div class="section-container mt-4">
                  <h4 class="section-title">
                    <i class="fas fa-bell-concierge me-2 text-primary"></i> Tiện Nghi Homestay
                  </h4>
                  <div v-if="loadingTienNghi" class="text-center py-3">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                  <div v-else-if="!homestayTienNghiList.length" class="p-3">
                    <div class="alert alert-warning m-0">
                      <i class="fas fa-info-circle me-2"></i> Homestay chưa có tiện nghi nào được thêm vào.
                    </div>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Tên tiện nghi</th>
                          <th>Số lượng</th>
                          <th>Đơn vị</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in homestayTienNghiList" :key="item.id">
                          <td>{{ item.tienNghi.tenTienNghi }}</td>
                          <td>{{ item.soLuong }}</td>
                          <td>{{ item.tienNghi.donVi }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Dịch Vụ Homestay -->
                <div class="section-container mt-4">
                  <h4 class="section-title">
                    <i class="fas fa-concierge-bell me-2 text-primary"></i> Dịch Vụ Homestay
                  </h4>
                  <div v-if="loadingDichVu" class="text-center py-3">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                  <div v-else-if="!dichVuList.length" class="p-3">
                    <div class="alert alert-warning m-0">
                      <i class="fas fa-info-circle me-2"></i> Homestay chưa có dịch vụ nào được thêm vào.
                  </div>
                      </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Tên dịch vụ</th>
                          <th>Giá</th>
                          <th>Đơn vị</th>
                          <th>Mô tả</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="dichVu in dichVuList" :key="dichVu.id">
                          <td>{{ dichVu.tenDichVu }}</td>
                          <td>{{ dichVu.gia ? formatCurrency(dichVu.gia) : '0 ₫' }}</td>
                          <td>{{ dichVu.donVi }}</td>
                          <td>{{ dichVu.moTa }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Danh Sách Phòng -->
                <div class="section-container mt-4">
                  <h4 class="section-title">
                    <i class="fas fa-door-closed me-2 text-primary"></i> Danh Sách Phòng
                  </h4>
                  <div v-if="loadingPhong" class="text-center py-3">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                  <div v-else-if="!phongList.length" class="p-3">
                    <div class="alert alert-warning m-0">
                      <i class="fas fa-info-circle me-2"></i> Homestay chưa có phòng nào được thêm vào.
                  </div>
                      </div>
                  <div v-else>
                    <div v-for="phong in phongList" :key="phong.id" class="room-item mb-3">
                      <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                          <h5 class="mb-0">
                            <i class="fas fa-bed me-2"></i> {{ phong.tenPhong }}
                            <span class="badge bg-secondary ms-2">{{ phong.trangThai ? 'Đang hoạt động' : 'Khóa' }}</span>
                          </h5>
                          <button class="btn btn-sm btn-outline-primary" @click="viewVatTuPhong(phong.id)">
                            Xem vật tư
                          </button>
                    </div>
                        <div class="card-body">
                          <div class="row">
                            <div class="col-md-4">
                              <p><strong>Mã phòng:</strong> {{ phong.maPhong }}</p>
                            </div>
                            <div class="col-md-4">
                              <p><strong>Diện tích:</strong> {{ phong.dienTich }} m²</p>
                            </div>
                            <div class="col-md-4">
                              <p><strong>Số người tối đa:</strong> {{ phong.soNguoiToiDa }}</p>
                            </div>
                          </div>
                          <p><strong>Mô tả:</strong> {{ phong.moTa }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
import { ref, watch, computed, onMounted } from 'vue'
import { getAllTienNghi, addTienNghi } from '@/Service/TienNghiService'
import notification from '@/utils/notification'
import api from '@/utils/api'

export default {
  name: 'HomestayModal',
  props: {
    homestay: {
      type: Object,
      default: null,
    },
    loaiList: {
      type: Array,
      required: true,
    },
    chuList: {
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
  emits: ['save', 'close', 'edit', 'view-images', 'view-vattu-phong'],
  setup(props, { emit }) {
    const formData = ref({
      tenHomestay: '',
      idLoaiHomeStay: null,
      idChuHomeStay: null,
      dienTich: 0,
      giaCaHomestay: 0,
      diaChi: '',
      tinhTrang: 'Trống và sạch',
      trangThai: true,
      hinhAnh: '',
      maHomestay: '',
      ngayTao: null,
      ngayUpdate: null,
    })

    const isSubmitting = ref(false)
    const errors = ref({})
    const fileInput = ref(null)
    const previewImage = ref(null)
    const selectedFile = ref(null)
    const loading = ref(false)

    // Tiện nghi
    const tienNghiList = ref([])
    const selectedTienNghi = ref({})
    const showAddTienNghi = ref(false)
    const searchTienNghi = ref('')
    const newTienNghi = ref({
      tenTienNghi: '',
      donVi: '',
      moTa: '',
      soLuong: 1,
    })

    // Lọc tiện nghi theo từ khóa tìm kiếm
    const filteredTienNghi = computed(() => {
      if (!searchTienNghi.value) return tienNghiList.value

      const searchTerm = searchTienNghi.value.toLowerCase().trim()
      return tienNghiList.value.filter(item =>
        item.tenTienNghi.toLowerCase().includes(searchTerm) ||
        item.donVi.toLowerCase().includes(searchTerm) ||
        (item.moTa && item.moTa.toLowerCase().includes(searchTerm))
      )
    })

    // Hàm lọc tiện nghi
    const filterTienNghi = () => {
      // Computed property sẽ tự động cập nhật
    }

    // Danh sách phòng
    const phongList = ref([])
    const loadingPhong = ref(false)

    // Danh sách dịch vụ
    const dichVuList = ref([])
    const loadingDichVu = ref(false)

    // Danh sách tiện nghi của homestay
    const homestayTienNghiList = ref([])
    const loadingTienNghi = ref(false)

    // Lấy danh sách tiện nghi
    const fetchTienNghi = async () => {
      try {
        loading.value = true
        const response = await getAllTienNghi()
        tienNghiList.value = response.data || []

        // Khởi tạo đối tượng selectedTienNghi
        tienNghiList.value.forEach((item) => {
          selectedTienNghi.value[item.id] = {
            selected: false,
            soLuong: 1,
          }
        })
      } catch (error) {
        console.error('Lỗi khi lấy danh sách tiện nghi:', error)
        notification.error('Không thể tải danh sách tiện nghi')
      } finally {
        loading.value = false
      }
    }

    // Lấy thông tin tiện nghi của homestay
    const fetchHomestayTienNghi = async (homestayId) => {
      try {
        // Kiểm tra homestayId hợp lệ để tránh gọi API với giá trị undefined
        if (!homestayId || homestayId === 'undefined') {
          homestayTienNghiList.value = []
          loadingTienNghi.value = false
          return
        }

        loadingTienNghi.value = true
        const response = await api.get(`/api/homestay-tiennghi/by-homestay/${homestayId}`)
        homestayTienNghiList.value = response.data || []

        // Cập nhật trạng thái đã chọn
        homestayTienNghiList.value.forEach((item) => {
          if (selectedTienNghi.value[item.tienNghi.id]) {
            selectedTienNghi.value[item.tienNghi.id] = {
              selected: true,
              soLuong: item.soLuong || 1,
            }
          }
        })
      } catch {
        notification.error('Không thể tải thông tin tiện nghi')
      } finally {
        loadingTienNghi.value = false
      }
    }

    // Lấy danh sách phòng
    const fetchPhong = async (homestayId) => {
      try {
        // Kiểm tra homestayId hợp lệ để tránh gọi API với giá trị undefined
        if (!homestayId || homestayId === 'undefined') {
          phongList.value = []
          loadingPhong.value = false
          return
        }

        loadingPhong.value = true
        const response = await api.get(`/api/phong/homestay/${homestayId}`)
        phongList.value = response.data || []
      } catch {
        notification.error('Không thể tải danh sách phòng')
      } finally {
        loadingPhong.value = false
      }
    }

    // Lấy danh sách dịch vụ
    const fetchDichVu = async (homestayId) => {
      try {
        // Kiểm tra homestayId hợp lệ để tránh gọi API với giá trị undefined
        if (!homestayId || homestayId === 'undefined') {
          dichVuList.value = []
          loadingDichVu.value = false
          return
        }

        loadingDichVu.value = true
        const response = await api.get(`/api/dich-vu/by-homeStay2/${homestayId}`)
        dichVuList.value = response.data || []

        // Kiểm tra và đảm bảo tất cả các dịch vụ có trường giá hợp lệ
        dichVuList.value = dichVuList.value.map(dichVu => {
          // Nếu trường gia không tồn tại nhưng giaDichVu tồn tại, thì chuyển giá trị
          if (!dichVu.gia && dichVu.giaDichVu) {
            dichVu.gia = dichVu.giaDichVu;
          }

          // Chuyển đổi giá thành số nếu là chuỗi
          if (dichVu.gia && typeof dichVu.gia === 'string') {
            dichVu.gia = parseFloat(dichVu.gia);
          }

          return dichVu;
        });
      } catch {
        notification.error('Không thể tải danh sách dịch vụ')
      } finally {
        loadingDichVu.value = false
      }
    }

    // Xem vật tư phòng
    const viewVatTuPhong = (phongId) => {
      if (!phongId) return
      // Hiển thị modal xem vật tư phòng (có thể thêm emit để hiển thị modal từ component cha)
      emit('view-vattu-phong', phongId)
    }

    // Thêm tiện nghi mới
    const addNewTienNghi = async () => {
      try {
        // Validate
        if (!newTienNghi.value.tenTienNghi || !newTienNghi.value.donVi) {
          notification.error('Vui lòng điền đầy đủ thông tin tiện nghi')
          return
        }

        const response = await addTienNghi(newTienNghi.value)
        const addedTienNghi = response.data

        // Thêm vào danh sách
        tienNghiList.value.push(addedTienNghi)

        // Thêm vào đối tượng selectedTienNghi
        selectedTienNghi.value[addedTienNghi.id] = {
          selected: true,
          soLuong: newTienNghi.value.soLuong,
        }

        // Reset form
        newTienNghi.value = {
          tenTienNghi: '',
          donVi: '',
          moTa: '',
          soLuong: 1,
        }

        showAddTienNghi.value = false
        notification.success('Thêm tiện nghi thành công')
      } catch {
        notification.error('Không thể thêm tiện nghi mới')
      }
    }

    // Computed property for modal title based on mode
    const modalTitle = computed(() => {
      if (props.isViewMode) return 'Chi tiết Homestay'
      return props.isEdit ? 'Chỉnh sửa Homestay' : 'Thêm mới Homestay'
    })

    const validateForm = () => {
      const newErrors = {}

      if (!formData.value.tenHomestay?.trim()) {
        newErrors.tenHomestay = 'Tên Homestay không được để trống'
      }

      if (!formData.value.idLoaiHomeStay) {
        newErrors.idLoaiHomeStay = 'Vui lòng chọn loại Homestay'
      }

      if (!formData.value.idChuHomeStay) {
        newErrors.idChuHomeStay = 'Vui lòng chọn chủ sở hữu'
      }

      // Kiểm tra diện tích là số hợp lệ và lớn hơn 0
      const dienTich = parseFloat(formData.value.dienTich)
      if (isNaN(dienTich) || dienTich <= 0) {
        newErrors.dienTich = 'Diện tích phải là số dương lớn hơn 0'
      }

      if (!formData.value.giaCaHomestay || formData.value.giaCaHomestay <= 0) {
        newErrors.giaCaHomestay = 'Giá phải lớn hơn 0'
      }

      if (!formData.value.diaChi?.trim()) {
        newErrors.diaChi = 'Địa chỉ không được để trống'
      }

      errors.value = newErrors
      return Object.keys(newErrors).length === 0
    }

    const getImageUrl = (img) => {
      if (!img) return '/images/placeholder-house.jpg'

      // Nếu là URL GCS hoặc URL đầy đủ
      if (img.startsWith('http')) return img

      return img
    }

    // Helper functions for view mode
    const getLoaiName = (id) => {
      const loai = props.loaiList.find((l) => l.id === id)
      return loai ? loai.tenLoaiHomestay || loai.tenLoai : 'Không xác định'
    }

    const getChuName = (id) => {
      const chu = props.chuList.find((c) => c.id === id)
      return chu ? chu.hotenChuHomestay || chu.hoTen : 'Không xác định'
    }

    const formatCurrency = (value) => {
      if (!value || isNaN(value)) return '0 ₫';
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
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

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
          selectedFile.value = file

        // Tạo URL cho preview
        if (previewImage.value) {
          URL.revokeObjectURL(previewImage.value)
        }
        previewImage.value = URL.createObjectURL(file)
      }
    }

    const handleImageError = (event) => {
      event.target.src = '/images/placeholder-house.jpg'
    }

    const handleSubmit = async () => {
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

        // Chuyển đổi dữ liệu homestay thành JSON string
        const homestayData = { ...formData.value }

        // Đảm bảo các trường số được chuyển đổi đúng
        if (homestayData.dienTich) {
          homestayData.dienTich = parseFloat(homestayData.dienTich)
        }

        if (homestayData.giaCaHomestay) {
          homestayData.giaCaHomestay = parseFloat(homestayData.giaCaHomestay)
        }

        // Nếu là chỉnh sửa, đảm bảo có ID
        if (props.isEdit && props.homestay && props.homestay.id) {
          homestayData.id = parseInt(props.homestay.id, 10)
        }

        // Đảm bảo idLoaiHomeStay và idChuHomeStay là số nguyên
        if (homestayData.idLoaiHomeStay) {
          homestayData.idLoaiHomeStay = parseInt(homestayData.idLoaiHomeStay, 10)
        }

        if (homestayData.idChuHomeStay) {
          homestayData.idChuHomeStay = parseInt(homestayData.idChuHomeStay, 10)
        }

        // Thêm dữ liệu tiện nghi
        const selectedTienNghiData = []
        for (const [id, data] of Object.entries(selectedTienNghi.value)) {
          if (data.selected) {
            selectedTienNghiData.push({
              tienNghiId: parseInt(id, 10),
              soLuong: data.soLuong,
              trangThai: data.trangThai,
            })
          }
        }

        homestayData.tienNghi = selectedTienNghiData

        // Thêm dữ liệu homestay dạng JSON
        formDataToSend.append('homestay', JSON.stringify(homestayData))

        // Gọi hàm lưu từ component cha
        await emit('save', formDataToSend)
      } catch {
        // Lỗi được xử lý bởi component cha
      } finally {
        isSubmitting.value = false
      }
    }

    const viewDetailImages = () => {
      emit('view-images', formData.value)
    }

    // Nếu là chỉnh sửa, điền dữ liệu hiện có
    watch(
      () => props.homestay,
      (newVal) => {
        if (newVal) {
          // Copy dữ liệu từ props vào form
          formData.value = { ...newVal }

          // Đảm bảo giaCaHomestay là một số
          if (formData.value.giaCaHomestay) {
            formData.value.giaCaHomestay = parseFloat(formData.value.giaCaHomestay);
          }

          // Nếu đang ở chế độ xem, tải dữ liệu liên quan
          if (props.isViewMode && newVal.id) {
            Promise.all([
              fetchHomestayTienNghi(newVal.id),
              fetchPhong(newVal.id),
              fetchDichVu(newVal.id)
            ])
          }

          // Chỉ reset preview image khi mở một homestay mới hoặc thêm mới
          if (!props.isEdit || selectedFile.value === null) {
            previewImage.value = null
            selectedFile.value = null
          }
        } else {
          // Reset form khi thêm mới
          formData.value = {
            tenHomestay: '',
            idLoaiHomeStay: null,
            idChuHomeStay: null,
            dienTich: 0,
            giaCaHomestay: 0,
            diaChi: '',
            tinhTrang: 'Trống và sạch',
            trangThai: true,
            hinhAnh: '',
            maHomestay: '',
            ngayTao: null,
            ngayUpdate: null,
          }
          previewImage.value = null
          selectedFile.value = null
        }
      },
      { immediate: true },
    )

    // Nếu là chỉnh sửa hoặc xem chi tiết, điền dữ liệu hiện có
    const fillExistingData = async () => {
      if ((props.isEdit || props.isViewMode) && props.homestay) {
        formData.value = { ...props.homestay }

        // Đảm bảo giaCaHomestay là một số
        if (formData.value.giaCaHomestay) {
          formData.value.giaCaHomestay = parseFloat(formData.value.giaCaHomestay);
        }

        // Lấy thông tin tiện nghi, phòng và dịch vụ của homestay
        if (props.homestay.id) {
          await Promise.all([
            fetchHomestayTienNghi(props.homestay.id),
            fetchPhong(props.homestay.id),
            fetchDichVu(props.homestay.id)
          ])
        }
      }
        }

    // Tải danh sách tiện nghi khi component được tạo
        onMounted(() => {
      // Luôn tải danh sách tiện nghi
      fetchTienNghi()

      // Nếu là chỉnh sửa hoặc xem chi tiết, điền dữ liệu hiện có
      if ((props.isEdit || props.isViewMode) && props.homestay) {
        fillExistingData()
        }
    })



    return {
      formData,
      handleFileUpload,
      handleSubmit,
      getImageUrl,
      isSubmitting,
      errors,
      fileInput,
      triggerFileInput,
      previewImage,
      selectedFile,
      handleImageError,
      modalTitle,
      getLoaiName,
      getChuName,
      formatCurrency,
      formatDate,
      viewDetailImages,
      // Tiện nghi
      loading,
      tienNghiList,
      selectedTienNghi,
      showAddTienNghi,
      newTienNghi,
      addNewTienNghi,
      // Danh sách phòng
      phongList,
      loadingPhong,
      // Danh sách dịch vụ
      dichVuList,
      loadingDichVu,
      // Danh sách tiện nghi của homestay
      homestayTienNghiList,
      loadingTienNghi,
      // Xem vật tư phòng
      viewVatTuPhong,
      filteredTienNghi,
      searchTienNghi,
      filterTienNghi,
    }
  },
}
</script>

<style scoped>
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
  padding: 20px;
  box-sizing: border-box;
}

/* Modal container */
.homestay-details-modal {
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  width: 950px;
  max-width: 100%;
  max-height: 95vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-fade-in 0.3s ease;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

/* Modal header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  background-color: #f8f9fa;
  overflow: hidden;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  position: relative;
  z-index: 5;
  margin-right: 5px;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

/* Modal body */
.modal-body {
  padding: 25px;
  overflow-y: auto; /* Added overflow-y: auto here instead */
  max-height: calc(95vh - 140px); /* Adjusted to account for header and footer */
}

/* Form groups */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-control,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  background-color: #fff;
}

.form-control:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  outline: none;
}

.form-control:disabled,
.form-control[readonly],
.form-select:disabled {
  background-color: #f9fafb;
  opacity: 1;
}

.invalid-feedback {
  color: #ef4444;
  font-size: 14px;
  margin-top: 4px;
}

/* Avatar section */
.homestay-avatar-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 12px;
  height: 100%;
  border: 1px solid #e5e7eb;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.avatar-preview {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.avatar-preview:hover:not(.view-mode) {
  background-color: #d1d5db;
}

.avatar-preview:hover:not(.view-mode)::after {
  content: 'Thay đổi ảnh';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px;
  font-size: 14px;
  text-align: center;
}

.uploaded-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.avatar-placeholder i {
  font-size: 48px;
  margin-bottom: 10px;
}

.homestay-id {
  color: #6b7280;
  font-size: 14px;
  margin-top: 5px;
}

.status-badge {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.bg-success {
  background-color: #10b981;
  color: white;
}

.bg-danger {
  background-color: #ef4444;
  color: white;
}

/* Modal footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 25px;
  border-top: 1px solid #e5e7eb;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
  background-color: #f8f9fa;
  overflow: hidden;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-info {
  background-color: #0ea5e9;
  color: white;
  border: none;
}

.btn-info:hover {
  background-color: #0284c7;
}

/* Staff info (view mode) */
.staff-info .form-control {
  background-color: #f9fafb;
  cursor: not-allowed;
}

/* Animation */
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

/* Tiện nghi container */
.tien-nghi-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9fafb;
}

.tien-nghi-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tien-nghi-item {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.tien-nghi-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.tien-nghi-details {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e5e7eb;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
}
  to {
    opacity: 1;
    transform: translateY(0);
}
}

.form-check-input {
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  user-select: none;
  font-weight: 500;
}

.form-check-input:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.form-switch .form-check-input {
  width: 2.5em;
  margin-left: -2.5em;
}

.modal-form {
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  width: 550px;
  max-width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-fade-in 0.3s ease;
  z-index: 1060;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Dịch vụ container */
.dich-vu-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9fafb;
}

.dich-vu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dich-vu-item {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.dich-vu-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.dich-vu-details {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e5e7eb;
  animation: fade-in 0.3s ease;
}

/* Styles for sections */
.section-container {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.section-title {
  background-color: #f8f9fa;
  padding: 15px;
  margin: 0;
  font-size: 18px;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
  display: flex;
  align-items: center;
}

/* Icon styling is now handled with text-primary class */

.alert-warning {
  margin: 0;
  padding: 15px;
  background-color: #fff7ed;
  color: #9a3412;
  border-color: #ffedd5;
  display: flex;
  align-items: center;
  border-radius: 0;
  border: none;
  border-left: 4px solid #f97316;
}

.room-item .card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.room-item .card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.room-item .card-header {
  background-color: #f8f9fa;
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
}

.room-item .card-body {
  padding: 15px;
}

.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f9fafb;
  color: #374151;
  font-weight: 600;
}

.table th, .table td {
  padding: 12px 15px;
  vertical-align: middle;
}

/* CONTROLS CONTAINER */
.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px 15px;
  border-radius: 8px;
  background-color: #ffffff;
}

/* SEARCH INPUT */
.search-box {
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 16px;
}

.search-input {
  width: 100%;
  border: 2px solid #dee2e6;
  padding: 14px 18px 14px 48px;
  border-radius: 50px;
  outline: none;
  transition: all 0.25s ease;
  font-size: 1rem;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  color: #495057;
  font-weight: 500;
}

.search-input:hover {
  border-color: #adb5bd;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.search-input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25);
}
</style>
