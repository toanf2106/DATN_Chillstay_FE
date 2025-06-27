<template>
  <div class="qly-phong-container">
    <!-- Header with search in the middle -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center">
      <h2 class="mb-0">Quản lý phòng</h2>

        <!-- Nút đồng bộ với backend (chỉ hiển thị khi cấu hình cho phép) -->
        <button
          type="button"
          class="btn btn-sm btn-outline-primary ms-1"
          @click="syncWithBackend"
          v-if="syncConfig.useRealApi"
          v-tooltip="'Đồng bộ dữ liệu với backend'"
          :disabled="loading"
        >
          <i class="fas fa-sync" :class="{'fa-spin': loading}"></i>
          <span class="d-none d-md-inline ms-1">Đồng bộ</span>
        </button>
      </div>

      <!-- Search bar (more compact) -->
      <div class="search-container mx-2" style="width: 400px;">
        <div class="input-group">
          <select class="form-select flex-grow-0" style="width: auto;" v-model="searchType">
            <option value="tenPhong">Tên phòng</option>
            <option value="maPhong">Mã phòng</option>
            <option value="id">ID</option>
          </select>
          <input
            type="text"
            class="form-control"
            :placeholder="'Tìm theo ' + (searchType === 'tenPhong' ? 'tên phòng' : searchType === 'maPhong' ? 'mã phòng' : 'ID')"
            v-model="searchKeyword"
            @keyup.enter="searchPhongs"
          />
          <button class="btn btn-primary" type="button" @click="searchPhongs">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>

      <button class="btn btn-success" @click="showAddModal">
        <i class="fas fa-plus"></i> Thêm phòng mới
      </button>
    </div>

    <!-- Thông tin đồng bộ hóa -->
    <div class="mb-3 small text-muted" v-if="syncConfig.useRealApi && syncConfig.lastSyncTime">
      <i class="fas fa-info-circle"></i>
      Đồng bộ lần cuối: {{ formatDateWithTime(syncConfig.lastSyncTime) }}
      <span v-if="schemaInfo.hasChanges" class="text-primary">(Phát hiện thay đổi schema)</span>
    </div>

    <!-- Giả lập thêm trường (chỉ cho demo) -->
    <div class="mb-3" v-if="!syncConfig.useRealApi">
      <button
        type="button"
        class="btn btn-sm btn-warning"
        @click="simulateBackendFieldChange"
        v-tooltip="'Giả lập backend thêm trường dữ liệu mới (demo)'"
      >
        <i class="fas fa-plus-circle"></i> Giả lập thêm trường (Demo)
      </button>
      <small class="text-muted ms-2">
        Nhấn để giả lập backend thêm trường dữ liệu mới
      </small>
    </div>

    <!-- Table for displaying rooms -->
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th v-for="(field, index) in tableFields" :key="index">{{ field.label }}</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="tableFields.length + 1" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="phongs.length === 0">
            <td :colspan="tableFields.length + 1" class="text-center">Không có dữ liệu phòng</td>
          </tr>
          <tr v-for="phong in phongs" :key="phong.id">
            <td v-for="(field, index) in tableFields" :key="index">
              <template v-if="field.key === 'idloaiPhong' || field.key === 'idhomeStay'">
                {{ getNestedValue(phong, field.key + '.id') || 'N/A' }}
              </template>
              <template v-else-if="field.format === 'date'">
                {{ formatDateShort(getNestedValue(phong, field.key)) }}
              </template>
              <template v-else-if="field.format === 'boolean'">
                {{ getNestedValue(phong, field.key) ? '1' : '0' }}
              </template>
              <template v-else-if="field.key === 'dienTich'">
                {{ getNestedValue(phong, field.key) ? `${getNestedValue(phong, field.key)} m²` : 'NULL' }}
              </template>
              <template v-else-if="field.key === 'anhBia'">
                <img v-if="getNestedValue(phong, field.key)" :src="getNestedValue(phong, field.key)" class="img-thumbnail" style="max-height: 50px; max-width: 70px;" :alt="phong.tenPhong" />
                <span v-else class="text-muted">Chưa có ảnh</span>
              </template>
              <template v-else>
                {{ getNestedValue(phong, field.key) || 'NULL' }}
              </template>
            </td>
            <td>
              <div class="btn-group" role="group">
                <button class="btn btn-sm btn-info me-1" @click="showDetailModal(phong)">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary me-1" @click="showEditModal(phong)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" @click="confirmDelete(phong)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <div>Hiển thị {{ startIndex + 1 }} đến {{ endIndex }} trong số {{ totalItems }} phòng</div>
      <nav aria-label="Page navigation" v-if="totalPages > 1">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 0 }">
            <button class="page-link" @click="currentPage > 0 && changePage(currentPage - 1)" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
        </button>
          </li>

          <template v-for="pageNum in displayedPages" :key="pageNum">
            <li v-if="pageNum !== '...'" class="page-item" :class="{ active: pageNum === currentPage }">
              <button class="page-link" @click="changePage(pageNum)">{{ pageNum + 1 }}</button>
            </li>
            <li v-else class="page-item disabled">
              <span class="page-link">...</span>
            </li>
          </template>

          <li class="page-item" :class="{ disabled: currentPage >= totalPages - 1 }">
            <button class="page-link" @click="currentPage < totalPages - 1 && changePage(currentPage + 1)" aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
        </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal" id="phongModal" tabindex="-1" aria-hidden="true" ref="phongModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Cập nhật thông tin phòng' : 'Thêm phòng mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm()" id="phongForm">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Loại Phòng <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formData.idloaiPhong.id" required>
                    <option value="">-- Chọn loại phòng --</option>
                    <option v-for="loaiPhong in loaiPhongList" :key="loaiPhong.id" :value="loaiPhong.id">
                      {{ loaiPhong.tenLoaiPhong }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Homestay <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formData.idhomeStay.id" required>
                    <option value="">-- Chọn homestay --</option>
                    <option v-for="homestay in homestayList" :key="homestay.id" :value="homestay.id">
                      {{ homestay.tenHomestay }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Mã Phòng <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input type="text" class="form-control" v-model="formData.maPhong" maxlength="50" required />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="generateRoomCode"
                      title="Tạo mã phòng tự động"
                    >
                      <i class="fas fa-sync-alt"></i>
                    </button>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tên Phòng <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="formData.tenPhong" maxlength="100" required />
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label">Diện tích (m²) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input type="number" step="0.01" class="form-control" v-model="formData.dienTich" required min="0" />
                    <span class="input-group-text">m²</span>
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Tầng <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" v-model="formData.tangSo" required min="0" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Số người tối đa <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" v-model="formData.soNguoiToiDa" required min="1" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea class="form-control" v-model="formData.moTa" rows="3" placeholder="Nhập mô tả về phòng..."></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Ảnh bìa</label>
                <div class="input-group">
                  <input type="file" class="form-control" @change="handleImageUpload" accept="image/*" />
                  <button class="btn btn-outline-secondary" type="button" @click="removeImage" title="Xóa ảnh" v-if="formData.anhBia || previewImage">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div v-if="formData.anhBia || previewImage" class="mt-2">
                  <img :src="previewImage || formData.anhBia" class="img-thumbnail" style="max-height: 150px;" />
                </div>
              </div>
              <div class="mb-3">
                <div class="d-flex align-items-center">
                  <!-- Switch toggle style matching the screenshot -->
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="trangThai" v-model="formData.trangThai">
                  </div>
                  <!-- Text with icon beside the toggle -->
                  <div class="ms-2">
                    <span v-if="formData.trangThai" class="text-success">
                      <i class="fas fa-check-circle"></i> Hoạt động
                    </span>
                    <span v-else class="text-danger">
                      <i class="fas fa-times-circle"></i> Không hoạt động
                    </span>
                  </div>
                </div>
              </div>

              <!-- Hiển thị các trường dữ liệu động từ backend -->
              <template v-for="(field, key) in dynamicFields" :key="key">
                <div class="mb-3">
                  <label class="form-label">{{ field.label }}</label>
                  <input
                    v-if="field.type === 'text'"
                    type="text"
                    class="form-control"
                    v-model="formData[field.key]"
                  />
                  <input
                    v-else-if="field.type === 'number'"
                    type="number"
                    class="form-control"
                    v-model="formData[field.key]"
                  />
                  <input
                    v-else-if="field.type === 'date'"
                    type="date"
                    class="form-control"
                    v-model="formData[field.key]"
                  />
                  <div
                    v-else-if="field.type === 'checkbox'"
                    class="form-check"
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="'dynamic-' + field.key"
                      v-model="formData[field.key]"
                    >
                    <label
                      class="form-check-label"
                      :for="'dynamic-' + field.key"
                    >
                      {{ formData[field.key] ? 'Có' : 'Không' }}
                    </label>
                  </div>
                  <textarea
                    v-else
                    class="form-control"
                    v-model="formData[field.key]"
                    rows="3"
                  ></textarea>
                </div>
              </template>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="submit" class="btn btn-primary" form="phongForm" id="btnSavePhong">
              <i class="fas fa-save me-1"></i> Lưu
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div class="modal" id="detailModal" tabindex="-1" aria-hidden="true" ref="detailModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thông tin chi tiết phòng</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedPhong">
            <div class="row">
                              <div class="col-md-12">
                  <table class="table table-bordered">
                    <tbody>
                    <template v-for="(field, index) in detailFields" :key="index">
                      <tr v-if="index % 2 === 0">
                        <th>{{ detailFields[index].label }}</th>
                        <td>
                          <template v-if="detailFields[index].key === 'idloaiPhong' || detailFields[index].key === 'idhomeStay'">
                            {{ getNestedValue(selectedPhong, detailFields[index].key + '.id') }}
                          </template>
                          <template v-else-if="detailFields[index].format === 'date'">
                            {{ formatDateShort(getNestedValue(selectedPhong, detailFields[index].key)) }}
                          </template>
                          <template v-else-if="detailFields[index].format === 'boolean'">
                            {{ getNestedValue(selectedPhong, detailFields[index].key) ? '1' : '0' }}
                          </template>
                          <template v-else-if="detailFields[index].key === 'dienTich'">
                            {{ getNestedValue(selectedPhong, detailFields[index].key) ? `${getNestedValue(selectedPhong, detailFields[index].key)} m²` : 'N/A' }}
                          </template>
                          <template v-else>
                            {{ getNestedValue(selectedPhong, detailFields[index].key) || 'N/A' }}
                          </template>
                        </td>

                        <th v-if="index + 1 < detailFields.length">{{ detailFields[index + 1].label }}</th>
                        <td v-if="index + 1 < detailFields.length">
                          <template v-if="detailFields[index + 1].key === 'idloaiPhong' || detailFields[index + 1].key === 'idhomeStay'">
                            {{ getNestedValue(selectedPhong, detailFields[index + 1].key + '.id') }}
                          </template>
                          <template v-else-if="detailFields[index + 1].format === 'date'">
                            {{ formatDateShort(getNestedValue(selectedPhong, detailFields[index + 1].key)) }}
                          </template>
                          <template v-else-if="detailFields[index + 1].format === 'boolean'">
                            {{ getNestedValue(selectedPhong, detailFields[index + 1].key) ? '1' : '0' }}
                          </template>
                          <template v-else-if="detailFields[index + 1].key === 'dienTich'">
                            {{ getNestedValue(selectedPhong, detailFields[index + 1].key) ? `${getNestedValue(selectedPhong, detailFields[index + 1].key)} m²` : 'N/A' }}
                          </template>
                          <template v-else>
                            {{ getNestedValue(selectedPhong, detailFields[index + 1].key) || 'N/A' }}
                          </template>
                        </td>
                      </tr>
                    </template>
                    <!-- Special handling for ảnh bìa -->
                    <tr v-if="selectedPhong.anhBia">
                      <th>Ảnh Bìa</th>
                        <td colspan="3">
                          <img v-if="selectedPhong.anhBia" :src="selectedPhong.anhBia" class="img-thumbnail" style="max-height: 150px;">
                          <span v-else>NULL</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal" id="deleteModal" tabindex="-1" aria-hidden="true" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedPhong">
            <p>Bạn có chắc chắn muốn xóa phòng <strong>{{ selectedPhong.tenPhong }}</strong> (Mã: {{ selectedPhong.maPhong }})?</p>
            <p><strong>ID phòng:</strong> {{ selectedPhong.id }}</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="deletePhongConfirm" id="btnXacNhanXoa">Xóa</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getAllPhong,
  getPhongById,
  getPhongPaginated,
  searchPhong,
  addPhong,
  updatePhong,
  deletePhong,
  getLoaiPhongList,
  getHomestayList
} from '@/Service/phongService'

export default {
  name: 'QlyPhong',
  data() {
    return {
      phongs: [],
      searchKeyword: '',
      searchType: 'tenPhong', // Mặc định tìm theo tên phòng
      loading: false,
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10, // Phân trang mỗi trang 10 phần tử theo yêu cầu
      startIndex: 0,
      endIndex: 0,
      isEdit: false,
      selectedPhong: null,
      previewImage: null,
      dynamicFields: {},
      // Cấu hình đồng bộ với backend
      syncConfig: {
        useRealApi: true,  // Sử dụng API thật để thêm/sửa/xóa dữ liệu
        autoSync: true,     // Tự động đồng bộ dữ liệu từ backend
        syncInterval: 60000, // Cập nhật mỗi 60 giây
        lastSyncTime: null   // Thời gian đồng bộ lần cuối
      },

      // Thông tin lưu trữ schema
      schemaInfo: {
        fieldCount: 0,       // Số lượng trường hiện tại
        fields: {},          // Thông tin về các trường
        hasChanges: false    // Đánh dấu có thay đổi
      },
      // Dữ liệu mẫu để demo
      sampleData: [
        {
          id: 1,
          idloaiPhong: { id: 1 },
          idhomeStay: { id: 1 },
          maPhong: 'P000001',
          tenPhong: 'Phòng Tiêu Chuẩn 1',
          dienTich: 25.50,
          moTa: 'View đồi chè',
          tangSo: 1,
          soNguoiToiDa: 2,
          ngayTao: '2025-06-24',
          ngayUpdate: null,
          anhBia: null,
          trangThai: true
        },
        {
          id: 2,
          idloaiPhong: { id: 1 },
          idhomeStay: { id: 1 },
          maPhong: 'P000002',
          tenPhong: 'Phòng Tiêu Chuẩn 2',
          dienTich: 25.50,
          moTa: 'Gần lối đi',
          tangSo: 1,
          soNguoiToiDa: 2,
          ngayTao: '2025-06-24',
          ngayUpdate: null,
          anhBia: null,
          trangThai: true
        },
        {
          id: 3,
          idloaiPhong: { id: 2 },
          idhomeStay: { id: 2 },
          maPhong: 'P000003',
          tenPhong: 'Phòng VIP Bungalow',
          dienTich: 35.00,
          moTa: 'Ban công thoáng',
          tangSo: 1,
          soNguoiToiDa: 3,
          ngayTao: '2025-06-24',
          ngayUpdate: null,
          anhBia: null,
          trangThai: true
        },
        {
          id: 4,
          idloaiPhong: { id: 3 },
          idhomeStay: { id: 3 },
          maPhong: 'P000004',
          tenPhong: 'Phòng Gia Đình Villa',
          dienTich: 50.25,
          moTa: 'View trung tâm',
          tangSo: 2,
          soNguoiToiDa: 6,
          ngayTao: '2025-06-24',
          ngayUpdate: null,
          anhBia: null,
          trangThai: true
        },
        {
          id: 5,
          idloaiPhong: { id: 1 },
          idhomeStay: { id: 1 },
          maPhong: 'PK000001',
          tenPhong: 'Phòng Tiêu Chuẩn 1',
          dienTich: 25.50,
          moTa: 'View đồi chè',
          tangSo: 1,
          soNguoiToiDa: 2,
          ngayTao: '2025-06-24',
          ngayUpdate: null,
          anhBia: null,
          trangThai: true
        },
        {
          id: 6,
          idloaiPhong: { id: 1 },
          idhomeStay: { id: 2 },
          maPhong: 'PP000002',
          tenPhong: 'Phòng Tiêu Chuẩn 1',
          dienTich: 25.50,
          moTa: 'View đồi chè',
          tangSo: 1,
          soNguoiToiDa: 2,
          ngayTao: '2025-06-24',
          ngayUpdate: null,
          anhBia: null,
          trangThai: true
        }
      ],
      formData: {
        maPhong: '',
        tenPhong: '',
        idloaiPhong: {
          id: ''
        },
        idhomeStay: {
          id: ''
        },
        dienTich: 0.00,
        moTa: '',
        tangSo: 1,
        soNguoiToiDa: 2,
        anhBia: '',
        trangThai: true
      },
      // Danh sách loại phòng mẫu
      loaiPhongList: [
        { id: 1, tenLoaiPhong: 'Phòng Tiêu Chuẩn' },
        { id: 2, tenLoaiPhong: 'Phòng VIP Bungalow' },
        { id: 3, tenLoaiPhong: 'Phòng Gia Đình Villa' }
      ],
      // Danh sách homestay mẫu
      homestayList: [
        { id: 1, tenHomestay: 'Homestay 1' },
        { id: 2, tenHomestay: 'Homestay 2' },
        { id: 3, tenHomestay: 'Homestay 3' }
      ],
      // Định nghĩa các trường hiển thị trên bảng
      tableFields: [
        { key: 'id', label: 'ID' },
        { key: 'idloaiPhong', label: 'Loại Phòng' },
        { key: 'idhomeStay', label: 'Homestay' },
        { key: 'maPhong', label: 'Mã Phòng' },
        { key: 'tenPhong', label: 'Tên Phòng' },
        { key: 'dienTich', label: 'Diện Tích (m²)' },
        { key: 'moTa', label: 'Mô Tả' },
        { key: 'tangSo', label: 'Tầng' },
        { key: 'soNguoiToiDa', label: 'Số Người Tối Đa' },
        { key: 'ngayTao', label: 'Ngày Tạo', format: 'date' },
        { key: 'ngayUpdate', label: 'Ngày Cập Nhật', format: 'date' },
        { key: 'anhBia', label: 'Ảnh Bìa' },
        { key: 'trangThai', label: 'Trạng Thái', format: 'boolean' }
      ],

      // Các trường hiển thị chi tiết
      detailFields: [
        { key: 'id', label: 'ID' },
        { key: 'idloaiPhong', label: 'Loại Phòng' },
        { key: 'idhomeStay', label: 'Homestay' },
        { key: 'maPhong', label: 'Mã Phòng' },
        { key: 'tenPhong', label: 'Tên Phòng' },
        { key: 'dienTich', label: 'Diện Tích (m²)' },
        { key: 'tangSo', label: 'Tầng' },
        { key: 'soNguoiToiDa', label: 'Số Người Tối Đa' },
        { key: 'ngayTao', label: 'Ngày Tạo', format: 'date' },
        { key: 'ngayUpdate', label: 'Ngày Cập Nhật', format: 'date' },
        { key: 'trangThai', label: 'Trạng Thái', format: 'boolean' },
        { key: 'moTa', label: 'Mô Tả' }
      ],
    }
  },
  mounted() {
    // Tự định nghĩa các hàm show và hide cho modal thay vì dùng Bootstrap modal
    this.initializeModals();

    // Khởi tạo schema từ các trường mặc định
    this.initializeSchema();

    // Khởi tạo giá trị phân trang
    this.currentPage = 0;
    this.pageSize = 5;

    // Tải dữ liệu ban đầu
    if (this.syncConfig.useRealApi) {
      console.log('Bắt đầu tải dữ liệu từ API...');
      // Khởi tạo đồng bộ với backend
      this.syncWithBackend();
    } else {
      console.log('Bắt đầu tải dữ liệu mẫu...');
      // Sử dụng dữ liệu mẫu cho demo
      this.loadSampleData();
    }

    // Hiển thị thông báo để người dùng biết dữ liệu đã được tải
    setTimeout(() => {
      this.$notify({
        type: 'success',
        title: 'Dữ liệu đã sẵn sàng',
        text: 'Đã tải ' + this.phongs.length + ' bản ghi và ' + this.tableFields.length + ' trường dữ liệu'
      });
    }, 500);

    // Tải danh sách loại phòng và homestay
    this.fetchLoaiPhongList();
    this.fetchHomestayList();

    // Bắt đầu tự động đồng bộ nếu cấu hình cho phép
    if (this.syncConfig.useRealApi && this.syncConfig.autoSync) {
      this.startAutoSync();
    }
  },
  methods: {
        // Khởi tạo xử lý modal tuỳ chỉnh
    initializeModals() {
      // Lưu các tham chiếu modal
      this.$modalElements = {
        phongModal: this.$refs.phongModal,
        detailModal: this.$refs.detailModal,
        deleteModal: this.$refs.deleteModal
      };

      // Đặt các sự kiện đóng modal cho các nút đóng
      const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => {
          const modalEl = button.closest('.modal');
          this.hideModal(modalEl.id);
        });
      });

      // Thêm sự kiện bàn phím để đóng modal khi nhấn ESC
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          // Tìm modal đang hiển thị
          const visibleModal = document.querySelector('.modal.show');
          if (visibleModal) {
            this.hideModal(visibleModal.id);
          }
        }
      });

      // Log để debug
      console.log('initializeModals đã chạy, tham chiếu modal:', this.$modalElements);

      // Đảm bảo hàm được gọi lại khi DOM đã cập nhật
      this.$nextTick(() => {
        if (this.$refs.deleteModal) {
          console.log('deleteModal ref được tìm thấy sau nextTick');
          this.$modalElements.deleteModal = this.$refs.deleteModal;
        }

        if (this.$refs.phongModal) {
          console.log('phongModal ref được tìm thấy sau nextTick');
          this.$modalElements.phongModal = this.$refs.phongModal;
        }
      });
    },

    // Hiển thị modal theo ID
    showModal(modalId) {
      console.log('Mở modal:', modalId);
      const modalEl = this.$modalElements[modalId];
      if (!modalEl) {
        console.error('Không tìm thấy modal element:', modalId);
        return;
      }

      // Xóa tất cả backdrop và reset trước khi mở
      this.cleanupModals();

      // Hiển thị modal
      modalEl.classList.add('show');
      modalEl.style.display = 'block';

      // Thêm backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop show custom-backdrop';
      backdrop.id = 'modal-backdrop-' + modalId;
      document.body.appendChild(backdrop);

      // Cho phép đóng modal khi click vào backdrop
      backdrop.addEventListener('click', () => {
        this.hideModal(modalId);
      });

      // Thêm class cho body
      document.body.classList.add('modal-open');

      // Log xác nhận
      console.log('Modal đã được hiển thị:', modalId);
    },

    // Đóng modal theo ID
    hideModal(modalId) {
      console.log('Đang đóng modal:', modalId);
      const modalEl = document.getElementById(modalId) || this.$modalElements[modalId];
      if (!modalEl) {
        console.error('Không tìm thấy modal:', modalId);
        return;
      }

      // Ẩn modal
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';

      // Nếu đang đóng modal phòng, reset form
      if (modalId === 'phongModal' || modalId === 'phongModal') {
        setTimeout(() => {
          this.resetForm();
        }, 300);
      }

      // Dọn dẹp
      this.cleanupModals();
      console.log('Đã đóng modal:', modalId);
    },

    // Dọn dẹp tất cả backdrop và reset body
    cleanupModals() {
      // Xóa tất cả backdrop
      document.querySelectorAll('.modal-backdrop, .custom-backdrop').forEach(el => el.remove());

      // Reset body
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    },

    // Load dữ liệu mẫu
    loadSampleData() {
      try {
        this.loading = true;

        // Gán dữ liệu mẫu vào danh sách phòng đầy đủ
        const fullData = JSON.parse(JSON.stringify(this.sampleData));

        // Log để debug
        console.log('Đã tải ' + fullData.length + ' bản ghi dữ liệu mẫu.');

        // Cập nhật thông tin phân trang
        this.totalItems = fullData.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);

        // Đảm bảo pageSize cố định ở mức 10 phần tử
        this.pageSize = 10;

        // Đảm bảo currentPage hợp lệ
        if (this.currentPage >= this.totalPages) {
          this.currentPage = Math.max(0, this.totalPages - 1);
        }

        // Tính toán chỉ số bắt đầu và kết thúc cho trang hiện tại
        this.startIndex = this.currentPage * this.pageSize;
        this.endIndex = Math.min(this.startIndex + this.pageSize, this.totalItems);

        // Lấy chính xác 10 phần tử (hoặc ít hơn nếu là trang cuối) cho trang hiện tại
        this.phongs = fullData.slice(this.startIndex, this.startIndex + this.pageSize);

        console.log(`Hiển thị trang ${this.currentPage + 1}/${this.totalPages} (${this.phongs.length} phần tử)`);
        console.log(`Chỉ số bắt đầu: ${this.startIndex}, chỉ số kết thúc: ${this.endIndex}`);

        // Nếu có dữ liệu, cập nhật các trường hiển thị và schema
        if (fullData && fullData.length > 0) {
          // Cập nhật schema từ dữ liệu mẫu
          this.checkAndUpdateSchema(fullData[0]);
        } else {
          console.error('Không có dữ liệu mẫu hoặc dữ liệu mẫu rỗng.');
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu mẫu:', error);
      } finally {
        this.loading = false;
      }
    },

    // Format date trong định dạng ngắn: yyyy-MM-dd
    formatDateShort(dateString) {
      if (!dateString) return 'NULL'

      // Xử lý nếu đã là string định dạng yyyy-MM-dd
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString
      }

      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    },

    // Format date đầy đủ với ngày giờ - không kèm giờ
    formatDate(dateString) {
      if (!dateString) return 'NULL';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },

    // Format date đầy đủ với ngày giờ
    formatDateWithTime(dateString) {
      if (!dateString) return 'Chưa đồng bộ';
      const date = new Date(dateString);

      // Format ngày: DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      // Format giờ: HH:MM:SS
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    },

    // Lấy danh sách loại phòng (API thực tế)
    async fetchLoaiPhongList() {
      try {
        if (this.syncConfig.useRealApi) {
          // Sử dụng API thực tế
          const response = await getLoaiPhongList();
          this.loaiPhongList = response.data;
        }
        // Nếu không sử dụng API thực tế, giữ nguyên dữ liệu mẫu
      } catch (error) {
        console.error('Error fetching room types:', error);
      }
    },

    // Lấy danh sách homestay (API thực tế)
    async fetchHomestayList() {
      try {
        if (this.syncConfig.useRealApi) {
          // Sử dụng API thực tế
          const response = await getHomestayList();
          this.homestayList = response.data;
        }
        // Nếu không sử dụng API thực tế, giữ nguyên dữ liệu mẫu
      } catch (error) {
        console.error('Error fetching homestays:', error);
      }
    },

    // Xử lý tải ảnh lên
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // Kiểm tra kích thước file (giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.'
        });
        event.target.value = null;
        return;
      }

      // Kiểm tra định dạng file (chỉ cho phép ảnh)
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF và WEBP.'
        });
        event.target.value = null;
        return;
      }

      // Tạo URL để preview ảnh
      this.previewImage = URL.createObjectURL(file)

      // Đọc file dưới dạng Base64 để gửi lên server
      const reader = new FileReader()
      reader.onload = (e) => {
        // Lưu ảnh dưới dạng Base64
        this.formData.anhBia = e.target.result
      }
      reader.readAsDataURL(file)
    },

    // Xóa ảnh
    removeImage() {
      this.previewImage = null;
      this.formData.anhBia = '';
      // Reset input file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    },

    // Tạo mã phòng tự động
    generateRoomCode() {
      const currentIdMax = Math.max(...this.sampleData.map(p => {
        const match = p.maPhong?.match(/^P(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      }), 0);

      const newPhongNumber = (currentIdMax + 1).toString().padStart(6, '0');
      this.formData.maPhong = 'P' + newPhongNumber;

      this.$notify({
        type: 'info',
        title: 'Thông báo',
        text: `Đã tạo mã phòng mới: ${this.formData.maPhong}`,
        duration: 2000
      });
    },

    // Fetch all rooms with pagination
    async fetchPhongs() {
      this.loading = true;
      try {
        // Gọi API để lấy dữ liệu mới nhất
        const response = await getAllPhong();

        // Xử lý response
        if (Array.isArray(response.data)) {
          this.phongs = response.data;

          // Cập nhật schema nếu có trường mới
          if (this.phongs.length > 0) {
            this.checkAndUpdateSchema(this.phongs[0]);
          }

          // Cập nhật thông tin phân trang
          this.totalItems = response.data.length;
          this.totalPages = response.data.totalPages;
          this.currentPage = response.data.number;
          this.startIndex = this.currentPage * this.pageSize;
          this.endIndex = Math.min(this.startIndex + this.pageSize, this.totalItems);
        } else if (response.data && response.data.content) {
          this.phongs = response.data.content;

          // Cập nhật schema nếu có trường mới
          if (this.phongs.length > 0) {
            this.checkAndUpdateSchema(this.phongs[0]);
          }

          // Cập nhật thông tin phân trang
          this.totalItems = response.data.totalElements;
          this.totalPages = response.data.totalPages;
          this.currentPage = response.data.number;
          this.startIndex = this.currentPage * this.pageSize;
          this.endIndex = Math.min(this.startIndex + this.pageSize, this.totalItems);
        } else {
          console.error('Unexpected response format', response);
          this.phongs = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }

        // Cập nhật thời gian đồng bộ
        this.syncConfig.lastSyncTime = new Date();
      } catch (error) {
        console.error('Error fetching rooms:', error);
        this.phongs = [];
      } finally {
        this.loading = false;
      }
    },

    // Get a room by ID
    async fetchPhongDetail(id) {
      try {
        const response = await getPhongById(id)
        return response.data
      } catch (error) {
        console.error(`Error fetching room with ID ${id}:`, error)
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Không thể tải thông tin chi tiết phòng'
        })
        return null
      }
    },

    // Search for rooms
    async searchPhongs() {
      this.loading = true;
      try {
        let response;

        if (!this.searchKeyword.trim()) {
          // Nếu không có từ khóa, tải tất cả phòng theo trang
          response = await getPhongPaginated(this.currentPage);
        } else {
          // Xây dựng tham số tìm kiếm dựa trên loại tìm kiếm
          const searchParams = {};

          if (this.searchType === 'id') {
            // Kiểm tra nếu searchKeyword là số
            if (!isNaN(this.searchKeyword)) {
              searchParams.id = parseInt(this.searchKeyword);
            } else {
              this.$notify({
                type: 'error',
                title: 'Lỗi',
                text: 'ID phải là số!'
              });
              this.loading = false;
              return;
            }
          } else if (this.searchType === 'maPhong') {
            searchParams.maPhong = this.searchKeyword;
          } else { // tenPhong
            searchParams.tenPhong = this.searchKeyword;
          }

          // Gọi API tìm kiếm
          response = await searchPhong(searchParams);
        }

        // Xử lý kết quả
        const data = response.data;
        if (Array.isArray(data)) {
          this.phongs = data;
          this.totalItems = data.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        }

        // Cập nhật thông tin phân trang
        this.startIndex = this.currentPage * this.pageSize;
        this.endIndex = Math.min(this.startIndex + this.pageSize, this.totalItems);

      } catch (error) {
        console.error('Lỗi khi tìm kiếm phòng:', error);
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Không thể tìm kiếm phòng'
        });
      } finally {
        this.loading = false;
      }
    },

    // Change page
    changePage(page) {
      console.log(`Chuyển đến trang ${page + 1} (trang hiện tại: ${this.currentPage + 1})`);
      if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        this.loadSampleData();
      }
    },

    // Phương thức mới để lấy dữ liệu theo trang
    async fetchPhongsPaginated() {
      this.loading = true;
      try {
        // Đảm bảo pageSize cố định ở mức 10 phần tử
        this.pageSize = 10;

        const response = await getPhongPaginated(this.currentPage);

        // Xử lý response từ API phân trang
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            // Nếu API trả về mảng đầy đủ, chúng ta cần tự phân trang
            const allData = response.data;
            this.totalItems = allData.length;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);

            // Đảm bảo currentPage hợp lệ
            if (this.currentPage >= this.totalPages) {
              this.currentPage = Math.max(0, this.totalPages - 1);
            }

            // Tính toán các chỉ số phân trang
            this.startIndex = this.currentPage * this.pageSize;
            this.endIndex = Math.min(this.startIndex + this.pageSize, this.totalItems);

            // Lấy chỉ đúng số lượng phần tử cho trang hiện tại
            this.phongs = allData.slice(this.startIndex, this.startIndex + this.pageSize);
        } else {
            // API trả về dữ liệu đã phân trang
            this.phongs = Array.isArray(response.data.content) ? response.data.content : [];

            // Đảm bảo chỉ hiển thị tối đa 10 phần tử nếu API trả về nhiều hơn
            if (this.phongs.length > 10) {
              this.phongs = this.phongs.slice(0, 10);
            }

            this.totalItems = response.data.totalElements || 0;
            this.totalPages = response.data.totalPages || Math.ceil(this.totalItems / this.pageSize);
            this.pageSize = 10; // Đảm bảo pageSize luôn là 10
          }

          // Cập nhật thông tin phân trang
          this.startIndex = this.currentPage * this.pageSize;
          this.endIndex = Math.min(this.startIndex + this.pageSize, this.totalItems);

          // Cập nhật schema nếu có dữ liệu mới
          if (this.phongs.length > 0) {
            this.updateFieldsFromData(this.phongs[0]);
          }

          console.log(`Đã tải ${this.phongs.length} phòng cho trang ${this.currentPage + 1}/${this.totalPages}`);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu phân trang:', error);
      } finally {
        this.loading = false;
      }
    },

    // Reset form data
    resetForm() {
      console.log('Reset form data');
      this.formData = {
        maPhong: '',
        tenPhong: '',
        idloaiPhong: {
          id: ''
        },
        idhomeStay: {
          id: ''
        },
        dienTich: 0,
        moTa: '',
        tangSo: 1,
        soNguoiToiDa: 2,
        anhBia: '',
        trangThai: true
      };
      this.previewImage = null;
      this.isEdit = false;
      this.selectedPhong = null;
      this.dynamicFields = {};
    },

    // Validate form trước khi submit
    validateForm() {
      // Kiểm tra loại phòng
      if (!this.formData.idloaiPhong.id) {
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Vui lòng chọn loại phòng'
        });
        return false;
      }

      // Kiểm tra homestay
      if (!this.formData.idhomeStay.id) {
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Vui lòng chọn homestay'
        });
        return false;
      }

      // Kiểm tra mã phòng
      if (!this.formData.maPhong || this.formData.maPhong.trim() === '') {
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Vui lòng nhập mã phòng'
        });
        return false;
      }

      // Kiểm tra trùng mã phòng (chỉ khi thêm mới)
      if (!this.isEdit) {
        const existingPhong = this.sampleData.find(p => p.maPhong === this.formData.maPhong);
        if (existingPhong) {
          this.$notify({
            type: 'error',
            title: 'Lỗi',
            text: `Mã phòng "${this.formData.maPhong}" đã tồn tại`
          });
          return false;
        }
      }

      // Kiểm tra tên phòng
      if (!this.formData.tenPhong || this.formData.tenPhong.trim() === '') {
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Vui lòng nhập tên phòng'
        });
        return false;
      }

      // Kiểm tra diện tích
      if (!this.formData.dienTich || isNaN(this.formData.dienTich) || parseFloat(this.formData.dienTich) <= 0) {
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Diện tích phải lớn hơn 0'
        });
        return false;
      }

      // Kiểm tra tầng
      if (this.formData.tangSo === null || isNaN(this.formData.tangSo) || parseInt(this.formData.tangSo) < 0) {
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Tầng phải là số không âm'
        });
        return false;
      }

      // Kiểm tra số người tối đa
      if (!this.formData.soNguoiToiDa || isNaN(this.formData.soNguoiToiDa) || parseInt(this.formData.soNguoiToiDa) <= 0) {
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Số người tối đa phải lớn hơn 0'
        });
        return false;
      }

      return true;
    },

    // Show add modal
    showAddModal() {
      this.isEdit = false;
      this.resetForm();

      // Reset submit button state before showing add modal
      this.$nextTick(() => {
        const saveButton = document.getElementById('btnSavePhong');
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.innerHTML = '<i class="fas fa-save me-1"></i> Lưu';
        }

        // Tự động tạo mã phòng mới có dạng Pxxxxxx
        const currentIdMax = Math.max(...this.sampleData.map(p => {
          const match = p.maPhong?.match(/^P(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        }), 0);

        const newPhongNumber = (currentIdMax + 1).toString().padStart(6, '0');
        this.formData.maPhong = 'P' + newPhongNumber;

        console.log('Tạo mã phòng mới:', this.formData.maPhong);
      });

      this.showModal('phongModal');
    },

    // Show edit modal
    async showEditModal(phong) {
      this.isEdit = true;
      this.selectedPhong = JSON.parse(JSON.stringify(phong)); // Clone để tránh tham chiếu thay đổi

      try {
        console.log('Mở modal chỉnh sửa cho phòng ID:', phong.id);

        // Khởi tạo form data dựa trên API hoặc dữ liệu mẫu
        let phongData;

        if (this.syncConfig.useRealApi) {
          try {
            // Lấy chi tiết phòng từ API
            const phongDetail = await this.fetchPhongDetail(phong.id);
            console.log('Đã nhận dữ liệu chi tiết từ API:', phongDetail);
            phongData = phongDetail || phong;
          } catch (apiError) {
            console.error('Không thể lấy dữ liệu chi tiết từ API:', apiError);
            // Sử dụng dữ liệu đã có nếu API lỗi
            phongData = phong;
          }
        } else {
          // Sử dụng dữ liệu đã có cho môi trường phát triển
          phongData = phong;
        }

        // Trích xuất tất cả các trường từ đối tượng phòng
        this.formData = this.extractFields(phongData);
        console.log('Form data đã được tạo:', this.formData);

        // Tạo các trường động cho form
        this.buildDynamicFields(phongData);

        // Tạo preview ảnh nếu có
        if (phongData.anhBia) {
          this.previewImage = phongData.anhBia;
        }

        // Reset submit button state before showing modal
        this.$nextTick(() => {
          const saveButton = document.getElementById('btnSavePhong');
          if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save me-1"></i> Lưu';
          }
        });

        // Hiển thị modal
        this.showModal('phongModal');
      } catch (error) {
        console.error('Error showing edit modal:', error);
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Không thể mở form chỉnh sửa phòng!'
        });
      }
    },

    // Show detail modal
    async showDetailModal(phong) {
      try {
        // Sử dụng dữ liệu đã có
        this.selectedPhong = phong;
        this.showModal('detailModal');
      } catch (error) {
        console.error('Error showing detail modal:', error);
      }
    },

    // Confirm delete
    confirmDelete(phong) {
      console.log('Xác nhận xóa phòng:', phong);
      // Clone đối tượng phòng để tránh tham chiếu thay đổi
      this.selectedPhong = JSON.parse(JSON.stringify(phong));
      this.showModal('deleteModal');
    },

        // Submit form (add or edit)
    async     submitForm() {
      try {
        console.log('Đang xử lý form submitting, isEdit =', this.isEdit);

        // Xác thực form trước khi submit
        if (!this.validateForm()) {
          return;
        }

        // Disable nút lưu để tránh submit nhiều lần
        const saveButton = document.getElementById('btnSavePhong');
        if (saveButton) {
          saveButton.disabled = true;
          saveButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang lưu...';
        }

        const formData = this.prepareFormData();

        if (this.syncConfig.useRealApi) {
          // Sử dụng API thực tế
                              if (this.isEdit && this.selectedPhong) {
                        // Cập nhật phòng hiện có
            console.log('Cập nhật phòng với ID:', this.selectedPhong.id);
            const response = await updatePhong(this.selectedPhong.id, formData);
            console.log('Kết quả cập nhật từ API:', response);

            // Cập nhật dữ liệu trong sampleData để hiển thị ngay lập tức
            const index = this.sampleData.findIndex(p => p.id === this.selectedPhong.id);
            if (index !== -1) {
              console.log('Cập nhật dữ liệu mẫu tại vị trí:', index);

              // Tạo phòng đã cập nhật với ngày cập nhật mới
              const updatedPhong = {
                ...this.sampleData[index],
                ...formData,
                ngayUpdate: new Date().toISOString().split('T')[0]
              };

              // Cập nhật trong sampleData
              this.sampleData[index] = updatedPhong;

              // Cập nhật trong phongs hiển thị nếu đang ở trang hiện tại
              const displayIndex = this.phongs.findIndex(p => p.id === this.selectedPhong.id);
              if (displayIndex !== -1) {
                console.log('Cập nhật dữ liệu hiển thị tại vị trí:', displayIndex);
                // Thay thế $set bằng cách cập nhật trực tiếp trong mảng
                this.phongs[displayIndex] = updatedPhong;
              }
            }

            this.$notify({
              type: 'success',
              title: 'Cập nhật thành công!',
              text: `Đã cập nhật thông tin phòng "${formData.tenPhong}" (Mã: ${formData.maPhong})`,
              duration: 7000,
              position: 'top-center'
            });

            // Đồng bộ trực tiếp phongs và sampleData để đảm bảo UI cập nhật tức thì
            const currentPageDisplayed = this.phongs.map(p => p.id);
            console.log('ID các phòng đang hiển thị:', currentPageDisplayed);

            // Kiểm tra xem phòng được cập nhật có đang hiển thị không
            if (currentPageDisplayed.includes(this.selectedPhong.id)) {
              console.log('Phòng được cập nhật đang hiển thị trên trang hiện tại');
            } else {
              console.log('Phòng được cập nhật không nằm trong trang hiện tại');
            }

            // Tự động đóng form sau khi cập nhật thành công
            console.log('Tự động đóng form sau khi cập nhật thành công');
            this.hideModal('phongModal');
          } else {
            // Thêm phòng mới
            const response = await addPhong(formData);
            console.log('Kết quả thêm mới từ API:', response);

            let newPhong;
            // Thêm dữ liệu mới vào danh sách để hiển thị ngay lập tức
            if (response && response.data) {
              // Nếu có response.data, thêm vào danh sách
              newPhong = response.data;
              this.sampleData.push(newPhong);
            } else {
              // Nếu không có response.data, thêm formData với ID giả
              const newId = Math.max(...this.sampleData.map(p => p.id), 0) + 1;
              newPhong = {
                ...formData,
                id: newId
              };
              this.sampleData.push(newPhong);
            }

            // Hiển thị thông báo thêm thành công với chi tiết
            this.$notify({
              type: 'success',
              title: 'Thêm mới thành công!',
              text: `Đã thêm phòng "${formData.tenPhong}" (Mã: ${formData.maPhong})`,
              duration: 7000,
              position: 'top-center'
            });
          }

          // Đồng bộ lại dữ liệu từ server và chuyển về trang cuối để xem bản ghi mới
          await this.syncWithBackend();

          // Đảm bảo hiển thị trang cuối sau khi thêm mới
          if (!this.isEdit) {
            this.currentPage = this.totalPages - 1;
            await this.fetchPhongsPaginated();
          }

        } else {
                    // Demo: Thêm/cập nhật vào dữ liệu mẫu
                              if (this.isEdit && this.selectedPhong) {
            const index = this.sampleData.findIndex(p => p.id === this.selectedPhong.id);
            if (index !== -1) {
              // Tạo phòng đã cập nhật với ngày cập nhật mới
              const updatedPhong = {
                ...this.sampleData[index],
                ...formData,
                ngayUpdate: new Date().toISOString().split('T')[0]
              };

              // Cập nhật trong sampleData
              this.sampleData[index] = updatedPhong;

              // Cập nhật trong phongs hiển thị để thay đổi ngay lập tức
              const displayIndex = this.phongs.findIndex(p => p.id === this.selectedPhong.id);
              if (displayIndex !== -1) {
                console.log('Demo: Cập nhật dữ liệu hiển thị tại vị trí:', displayIndex);
                this.phongs[displayIndex] = updatedPhong;
              }

              console.log('Demo: Đã cập nhật phòng tại vị trí:', index);
            }

            // Hiển thị thông báo cập nhật thành công với chi tiết (chế độ demo)
            this.$notify({
              type: 'success',
              title: 'Cập nhật thành công!',
              text: `Đã cập nhật thông tin phòng "${formData.tenPhong}" (Mã: ${formData.maPhong}) (Chế độ demo)`,
              duration: 7000,
              position: 'top-center'
            });

            // Tự động đóng form sau khi cập nhật thành công (chế độ demo)
            console.log('Demo: Tự động đóng form sau khi cập nhật thành công');
            this.hideModal('phongModal');
          } else {
            // Thêm phòng mới vào dữ liệu mẫu
            const newId = Math.max(...this.sampleData.map(p => p.id)) + 1;
            const newPhong = {
              ...formData,
              id: newId
            };
            this.sampleData.push(newPhong);
            console.log('Demo: Đã thêm phòng mới với ID:', newId);

            // Hiển thị thông báo thêm thành công với chi tiết (chế độ demo)
            this.$notify({
              type: 'success',
              title: 'Thêm mới thành công!',
              text: `Đã thêm phòng "${formData.tenPhong}" (Mã: ${formData.maPhong}) (Chế độ demo)`,
              duration: 7000,
              position: 'top-center'
            });

            // Chuyển đến trang cuối sau khi thêm mới
            this.currentPage = Math.ceil(this.sampleData.length / this.pageSize) - 1;
          }

          // Tải lại dữ liệu mẫu
          this.loadSampleData();
        }

        // Close modal and refresh data
        this.hideModal('phongModal');

        // Reset form data after successful submission
        this.resetForm();
      } catch (error) {
        console.error('Error submitting form:', error);
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Đã xảy ra lỗi khi lưu thông tin phòng!'
        });

        // Re-enable nút lưu nếu có lỗi
        const saveButton = document.getElementById('btnSavePhong');
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.innerHTML = '<i class="fas fa-save me-1"></i> Lưu';
        }
      } finally {
        // Đảm bảo form đóng dù thành công hay thất bại
        this.hideModal('phongModal');
      }
    },

        // Delete room confirmation
    async deletePhongConfirm() {
      if (!this.selectedPhong) return;

      try {
        console.log('Bắt đầu xóa phòng ID:', this.selectedPhong.id);

                  if (this.syncConfig.useRealApi) {
          try {
            // Sử dụng API thực tế để xóa phòng
            const response = await deletePhong(this.selectedPhong.id);
            console.log('Kết quả xóa từ API:', response);

            // Xóa khỏi dữ liệu mẫu để cập nhật ngay lập tức
            const index = this.sampleData.findIndex(p => p.id === this.selectedPhong.id);
            if (index !== -1) {
              console.log('Đã tìm thấy phòng trong dữ liệu mẫu, vị trí:', index);
              this.sampleData.splice(index, 1);
            }

            // Đồng bộ lại dữ liệu từ server
            await this.syncWithBackend();

            // Hiển thị thông báo thành công với thông tin chi tiết
            this.$notify({
              type: 'success',
              title: 'Xóa thành công!',
              text: `Đã xóa phòng "${this.selectedPhong.tenPhong}" (Mã: ${this.selectedPhong.maPhong})`,
              duration: 7000,
              position: 'top-center'
            });
          } catch (apiError) {
            console.error('Lỗi API khi xóa phòng:', apiError);

            // Xử lý trường hợp API lỗi nhưng vẫn muốn xóa khỏi dữ liệu mẫu
            const index = this.sampleData.findIndex(p => p.id === this.selectedPhong.id);
            if (index !== -1) {
              console.log('API lỗi nhưng vẫn xóa khỏi dữ liệu mẫu tại vị trí:', index);
              this.sampleData.splice(index, 1);

              // Thông báo xóa thành công trong chế độ offline
              this.$notify({
                type: 'warning',
                title: 'Xóa thành công (Chế độ offline)',
                text: `Đã xóa phòng "${this.selectedPhong.tenPhong}" khỏi dữ liệu hiển thị. Dữ liệu thực tế có thể chưa được cập nhật.`,
                duration: 7000
              });
            }

            // Tải lại dữ liệu mẫu
            this.loadSampleData();
          }
                } else {
          // Demo: Xóa khỏi dữ liệu mẫu
          const index = this.sampleData.findIndex(p => p.id === this.selectedPhong.id);
          if (index !== -1) {
            console.log('Demo: Xóa phòng tại vị trí:', index);
            this.sampleData.splice(index, 1);

            // Hiển thị thông báo xóa thành công trong chế độ demo
            this.$notify({
              type: 'success',
              title: 'Xóa thành công!',
              text: `Đã xóa phòng "${this.selectedPhong.tenPhong}" (Mã: ${this.selectedPhong.maPhong})`,
              duration: 7000,
              position: 'top-center'
            });
          } else {
            console.warn('Không tìm thấy phòng cần xóa trong dữ liệu mẫu, ID:', this.selectedPhong.id);

            // Thông báo lỗi khi không tìm thấy phòng
            this.$notify({
              type: 'error',
              title: 'Lỗi',
              text: 'Không tìm thấy phòng cần xóa!',
              duration: 5000
            });
          }

          // Tải lại dữ liệu mẫu
          this.loadSampleData();
        }

        // Đảm bảo rằng trang hiện tại vẫn hợp lệ sau khi xóa
        if (this.currentPage >= this.totalPages && this.currentPage > 0) {
          this.currentPage = this.totalPages - 1;
        }

        // Close modal and refresh data
        this.hideModal('deleteModal');
      } catch (error) {
        console.error('Lỗi chung khi xóa phòng:', error);
        this.$notify({
          type: 'error',
          title: 'Lỗi',
          text: 'Đã xảy ra lỗi khi xóa phòng!'
        });
      }
    },

    // Prepare data for API
    prepareFormData() {
      // Tạo bản sao để không làm thay đổi dữ liệu form
      const formData = { ...this.formData }

      // Thêm ngày tạo nếu là bản ghi mới
      if (!this.isEdit) {
        formData.ngayTao = new Date().toISOString().split('T')[0]
      }

      // Thêm ngày cập nhật
      formData.ngayUpdate = new Date().toISOString().split('T')[0]

      return formData
    },

    // Phương thức lấy giá trị lồng nhau từ đối tượng
    getNestedValue(obj, path) {
      return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null
      }, obj);
    },

    // Phương thức lấy tất cả các trường từ đối tượng phòng
    extractFields(phongObj) {
      // Tạo đối tượng chứa các trường mặc định
      const formData = {
        maPhong: '',
        tenPhong: '',
        idloaiPhong: { id: '' },
        idhomeStay: { id: '' },
        dienTich: 0.00,
        moTa: '',
        tangSo: 1,
        soNguoiToiDa: 2,
        anhBia: '',
        trangThai: true
      };

      // Cập nhật với dữ liệu từ phongObj
      if (!phongObj) return formData;

      // Lặp qua tất cả các thuộc tính và cập nhật
      for (const key in phongObj) {
        if (key === 'idloaiPhong' || key === 'idhomeStay') {
          formData[key] = { id: phongObj[key]?.id || '' };
        } else if (key in formData) { // Chỉ cập nhật các trường mặc định
          formData[key] = phongObj[key];
        }
      }

      return formData;
    },

    // Tạo các trường dữ liệu động dựa trên dữ liệu từ backend
    buildDynamicFields(data) {
      // Khởi tạo đối tượng chứa các trường động
      this.dynamicFields = {};

      if (!data) return;

      console.log('Tạo trường động từ dữ liệu:', data);

      // Danh sách các trường mặc định, không cần thêm vào dynamicFields
      const defaultFields = [
        'id', 'idloaiPhong', 'idhomeStay', 'maPhong', 'tenPhong', 'dienTich',
        'moTa', 'tangSo', 'soNguoiToiDa', 'ngayTao', 'ngayUpdate', 'anhBia', 'trangThai'
      ];

      // Duyệt qua tất cả các thuộc tính trong dữ liệu
      for (const key in data) {
        // Bỏ qua các trường mặc định
        if (defaultFields.includes(key)) continue;

        // Lấy giá trị của thuộc tính
        const value = data[key];

        // Xác định kiểu dữ liệu cho trường mới
        let fieldType = 'text'; // Mặc định là text

        if (typeof value === 'number') {
          fieldType = 'number';
        } else if (typeof value === 'boolean') {
          fieldType = 'checkbox';
        } else if (value instanceof Date ||
                  (typeof value === 'string' &&
                   (key.toLowerCase().includes('ngay') || key.toLowerCase().includes('date')))) {
          fieldType = 'date';
        }

        // Tạo label từ key với định dạng đẹp hơn
        const label = key.charAt(0).toUpperCase() +
                     key.slice(1).replace(/([A-Z])/g, ' $1').trim();

        console.log('Thêm trường động vào form:', key, label, fieldType);

        // Thêm trường vào danh sách dynamicFields
        this.dynamicFields[key] = {
          key: key,
          label: label,
          type: fieldType,
          value: value
        };
      }

      console.log('Các trường động đã tạo:', this.dynamicFields);
    },

    // Cập nhật các trường hiển thị dựa trên dữ liệu
    updateFieldsFromData(data) {
      if (!data) return;

      console.log('Cập nhật trường từ dữ liệu:', data);

      // Lấy tất cả các keys từ dữ liệu
      const dataKeys = Object.keys(data);

      // Cập nhật tableFields
      const existingKeys = this.tableFields.map(field => field.key);

      // Mảng lưu trữ các trường mới được thêm vào
      const addedFields = [];

      for (const key of dataKeys) {
        // Chỉ thêm các trường mới chưa có trong danh sách
        if (!existingKeys.includes(key)) {
          let format = null;

          // Xác định kiểu dữ liệu
          if (typeof key === 'string' && (key.toLowerCase().includes('ngay') || key.toLowerCase().includes('date'))) {
            format = 'date';
          } else if (typeof data[key] === 'boolean') {
            format = 'boolean';
          }

          // Biến đổi key thành label
          const label = key.charAt(0).toUpperCase() +
                       key.slice(1).replace(/([A-Z])/g, ' $1').trim();

          console.log('Thêm trường mới vào bảng:', key, label, format);
          addedFields.push(key);

          // Thêm trường mới vào tableFields
          this.tableFields.push({
            key: key,
            label: label,
            format: format
          });

          // Đồng thời thêm vào detailFields
          this.detailFields.push({
            key: key,
            label: label,
            format: format
          });
        }
      }

      // Xây dựng các trường động cho form
      this.buildDynamicFields(data);

      // Hiển thị thông báo nếu có trường mới
      if (addedFields.length > 0) {
        this.$notify({
          type: 'info',
          title: 'Phát hiện trường dữ liệu mới',
          text: `Đã thêm ${addedFields.length} trường mới từ backend: ${addedFields.join(', ')}`
        });

        // Cập nhật tình trạng thay đổi schema
        this.schemaInfo.hasChanges = false;
      }
    },

    // Khởi tạo schema từ các trường mặc định
    initializeSchema() {
      // Danh sách các trường mặc định
      const defaultFields = [
        'id', 'idloaiPhong', 'idhomeStay', 'maPhong', 'tenPhong', 'dienTich',
        'moTa', 'tangSo', 'soNguoiToiDa', 'ngayTao', 'ngayUpdate', 'anhBia', 'trangThai'
      ];

      // Lưu thông tin các trường
      this.schemaInfo.fieldCount = defaultFields.length;
      defaultFields.forEach(field => {
        this.schemaInfo.fields[field] = {
          isDefault: true,
          addedAt: new Date(),
          type: this.determineFieldType(field, null)
        };
      });

      console.log('Schema ban đầu:', this.schemaInfo);
    },

    // Bắt đầu tự động đồng bộ với backend
    startAutoSync() {
      console.log('Bắt đầu tự động đồng bộ với backend');

      // Đặt interval để đồng bộ định kỳ
      this.syncIntervalId = setInterval(() => {
        this.syncWithBackend();
      }, this.syncConfig.syncInterval);

      // Đồng bộ ngay lần đầu
      this.syncWithBackend();
    },

    // Ngừng tự động đồng bộ
    stopAutoSync() {
      if (this.syncIntervalId) {
        clearInterval(this.syncIntervalId);
        this.syncIntervalId = null;
        console.log('Đã dừng đồng bộ tự động');
      }
    },

        // Đồng bộ với backend
    async syncWithBackend() {
      try {
        console.log('Đang đồng bộ với backend...');
        this.loading = true;

        // Đảm bảo pageSize cố định ở mức 10 phần tử
        this.pageSize = 10;

        let allData = [];
        try {
          // Lấy dữ liệu mới nhất
          const response = await getAllPhong();

          // Xử lý phản hồi tùy thuộc vào định dạng
          if (response && response.data) {
            allData = Array.isArray(response.data) ? response.data :
                    (response.data.content ? response.data.content : []);
            console.log('Đã nhận dữ liệu từ API:', allData.length, 'bản ghi');
          }
        } catch (apiError) {
          console.error('Lỗi khi gọi API getAllPhong:', apiError);
          // Sử dụng dữ liệu mẫu nếu API lỗi
          allData = [...this.sampleData];
          console.log('Sử dụng dữ liệu mẫu:', allData.length, 'bản ghi');
        }

        // Nếu không nhận được dữ liệu từ API và không có dữ liệu mẫu, hiển thị dữ liệu trống
        if (allData.length === 0 && this.sampleData.length === 0) {
          console.log('Không có dữ liệu từ API và dữ liệu mẫu cũng trống');
          this.phongs = [];
          this.totalItems = 0;
          this.totalPages = 0;
          this.currentPage = 0;

          // Cập nhật thời gian đồng bộ
          this.syncConfig.lastSyncTime = new Date();
          return;
        }

        // Lưu lại toàn bộ dữ liệu để sử dụng trong các thao tác khác
        this.sampleData = [...allData];
        console.log('Đã cập nhật sampleData với', this.sampleData.length, 'bản ghi');

        if (allData.length > 0) {
          // Kiểm tra schema và cập nhật nếu có thay đổi
          this.checkAndUpdateSchema(allData[0]);

          // Cập nhật thông tin phân trang
          this.totalItems = allData.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);

          // Đảm bảo trang hiện tại hợp lệ
          if (this.currentPage >= this.totalPages) {
            this.currentPage = Math.max(0, this.totalPages - 1);
          }

          // Lưu thông tin phòng hiện tại để log
          console.log('Trạng thái phòng trước khi đồng bộ:',
                     this.phongs.map(p => ({ id: p.id, ten: p.tenPhong })));

          // Tính toán chỉ số bắt đầu và kết thúc cho trang hiện tại
          this.startIndex = this.currentPage * this.pageSize;
          this.endIndex = Math.min(this.startIndex + this.pageSize, this.totalItems);

          // Lấy dữ liệu cho trang hiện tại
          const newPhongPage = allData.slice(this.startIndex, this.startIndex + this.pageSize);

          // Cập nhật thông minh - chỉ cập nhật các phòng đã thay đổi để tránh làm mới UI không cần thiết
          if (this.phongs.length > 0) {
            // Có dữ liệu hiển thị, cập nhật thông minh
            this.phongs = newPhongPage;
            console.log('Dữ liệu hiển thị đã được cập nhật thông minh');
          } else {
            // Chưa có dữ liệu, gán trực tiếp
            this.phongs = newPhongPage;
          }

          console.log(`Đã đồng bộ ${allData.length} bản ghi, hiển thị ${this.phongs.length} phòng trên trang ${this.currentPage + 1}/${this.totalPages}`);
        } else {
          // Nếu không có dữ liệu, hiển thị trống
          this.phongs = [];
          this.totalItems = 0;
          this.totalPages = 0;
          this.currentPage = 0;
          console.log('Không có dữ liệu để hiển thị');
        }

        // Cập nhật thời gian đồng bộ
        this.syncConfig.lastSyncTime = new Date();
        console.log('Đồng bộ hoàn tất vào lúc:', this.syncConfig.lastSyncTime);
      } catch (error) {
        console.error('Lỗi đồng bộ với backend:', error);
        this.$notify({
          type: 'error',
          title: 'Lỗi đồng bộ',
          text: 'Không thể đồng bộ dữ liệu với máy chủ'
        });
      } finally {
        this.loading = false;
      }
    },

    // Kiểm tra và cập nhật schema nếu có thay đổi
    checkAndUpdateSchema(data) {
      if (!data) return;

      let hasChanges = false;
      let newFieldCount = 0;

      // Kiểm tra từng trường trong dữ liệu
      for (const key in data) {
        // Nếu trường chưa có trong schema
        if (!this.schemaInfo.fields[key]) {
          hasChanges = true;
          newFieldCount++;

          // Thêm trường mới vào schema
          this.schemaInfo.fields[key] = {
            isDefault: false,
            addedAt: new Date(),
            type: this.determineFieldType(key, data[key])
          };

          console.log(`Phát hiện trường mới từ backend: ${key} (${this.schemaInfo.fields[key].type})`);
        }
      }

      // Cập nhật số lượng trường
      if (hasChanges) {
        const oldFieldCount = this.schemaInfo.fieldCount;
        this.schemaInfo.fieldCount = Object.keys(this.schemaInfo.fields).length;
        this.schemaInfo.hasChanges = true;

        console.log(`Đã cập nhật schema: ${oldFieldCount} -> ${this.schemaInfo.fieldCount} trường (+${newFieldCount})`);

        // Cập nhật giao diện nếu có thay đổi
        this.updateFieldsFromData(data);
      }
    },

    // Xác định kiểu dữ liệu của trường
    determineFieldType(key, value) {
      if (typeof key === 'string' && (key.toLowerCase().includes('ngay') || key.toLowerCase().includes('date'))) {
        return 'date';
      } else if (value !== null && value !== undefined) {
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'object') return 'object';
      }
      return 'text'; // Mặc định là text
    },

    // Thêm phương thức để thông báo về số trường dữ liệu
    showSchemaInfo() {
      // Lấy tổng số trường
      const totalFields = Object.keys(this.schemaInfo.fields).length;

      // Đếm số trường không phải mặc định
      const customFields = Object.values(this.schemaInfo.fields).filter(f => !f.isDefault).length;

      this.$notify({
        type: 'info',
        title: 'Thông tin schema',
        text: `Tổng số trường: ${totalFields} (${customFields} trường tùy chỉnh)`
      });

      console.log('Thông tin chi tiết schema:', this.schemaInfo);
    },

    // Giả lập backend thêm trường mới - Chỉ với mục đích demo
    simulateBackendFieldChange() {
      console.log('Giả lập backend thêm trường mới...');

      // Tạo trường mới
      const newFields = {
        giaThueTheoNgay: 1200000,
        coMayLanh: true,
        dichVuDacBiet: 'Đưa đón sân bay'
      };

      // Thêm trường mới vào dữ liệu
      this.sampleData.forEach(phong => {
        Object.assign(phong, newFields);
      });

      // Cập nhật dữ liệu
      this.phongs = [...this.sampleData];

      // Kiểm tra và cập nhật schema
      this.checkAndUpdateSchema(this.sampleData[0]);

      console.log('Đã giả lập backend thêm trường mới:', newFields);
    },

    // Hủy interval khi component bị hủy
    beforeDestroy() {
      // Ngừng auto sync trước khi component bị hủy
      this.stopAutoSync();
    },
  },
  computed: {
    // Các trang hiển thị trong phân trang
    displayedPages() {
      const pages = [];
      const totalPages = this.totalPages;

      if (totalPages <= 5) {
        // Nếu ít hơn hoặc bằng 5 trang, hiển thị tất cả
        for (let i = 0; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Nếu có nhiều hơn 5 trang, hiển thị dạng rút gọn
        if (this.currentPage <= 2) {
          // Đầu: hiển thị 3 trang đầu, dấu ..., và trang cuối
          pages.push(0, 1, 2, '...', totalPages - 1);
        } else if (this.currentPage >= totalPages - 3) {
          // Cuối: hiển thị trang đầu, dấu ..., và 3 trang cuối
          pages.push(0, '...', totalPages - 3, totalPages - 2, totalPages - 1);
        } else {
          // Giữa: hiển thị trang đầu, dấu ..., trang hiện tại và 2 trang liền kề, dấu ..., và trang cuối
          pages.push(0, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', totalPages - 1);
        }
      }

      return pages;
    }
  }
}
</script>

    <style scoped>
.qly-phong-container {
  padding: 20px;
}

.table th, .table td {
  vertical-align: middle;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

/* Modal styling */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1055;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
  display: none;
  color: #fff;
}

.modal-content {
  background-color: #212529;
  border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.1);
}

.modal-header {
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.modal-footer {
  border-top: 1px solid rgba(255,255,255,0.1);
}

.form-control, .form-select {
  background-color: #2c3034;
  border-color: rgba(255,255,255,0.1);
  color: #fff;
}

.form-control:focus, .form-select:focus {
  background-color: #2c3034;
  color: #fff;
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgb(13 110 253 / 25%);
}

.form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
}

.input-group-text {
  background-color: #2c3034;
  border-color: rgba(255,255,255,0.1);
  color: #fff;
}

::placeholder {
  color: rgba(255,255,255,0.5) !important;
}

/* Update modal backdrop for dark theme */
.modal.show {
  display: block;
}

.custom-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
}

/* Toggle switch styling */
.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>
