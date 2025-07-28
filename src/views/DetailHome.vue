<template>
  <div class="booking-container">
    <!-- Hiển thị trạng thái tải -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải thông tin homestay...</p>
    </div>

    <!-- Hiển thị lỗi nếu có -->
    <div v-else-if="hasError" class="error-container">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <h3>Đã xảy ra lỗi</h3>
      <p>{{ errorMessage }}</p>
      <button class="btn primary-btn" @click="goBack">Quay lại</button>
    </div>

    <!-- Hiển thị thông tin chi tiết homestay -->
    <div v-else-if="homestay" class="booking-content">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/">Trang chủ</router-link>
        <span class="separator">/</span>
        <router-link to="/all-homestays">Tất cả homestay</router-link>
        <span class="separator">/</span>
        <span class="current">{{ homestay.tenHomestay }}</span>
      </div>
      <!-- Thanh navigation -->
      <div class="booking-nav">
        <div class="nav-container">
          <div class="nav-tabs">
            <button :class="['nav-tab', { active: activeSection === 'overview' }]"
              @click="setActiveSection('overview')">
              Tổng quan
            </button>
            <button :class="['nav-tab', { active: activeSection === 'rooms' }]" @click="setActiveSection('rooms')">
              Thông tin cơ bản
            </button>
            <button :class="['nav-tab', { active: activeSection === 'amenities' }]"
              @click="setActiveSection('amenities')">
              Tiện nghi và vật tư
            </button>
            <button :class="['nav-tab', { active: activeSection === 'rules' }]" @click="setActiveSection('rules')">
              Quy tắc chung
            </button>
          </div>
        </div>
      </div>


      <!-- Thông tin cơ bản và hình ảnh -->
      <div class="homestay-header">
        <h1>{{ homestay.tenHomestay }}</h1>
        <div class="homestay-meta">
          <div class="location">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ homestay.diaChi }}</span>
          </div>
          <div class="rating" v-if="homestay.danhGiaTrungBinh !== undefined">
            <span class="stars">★★★★★</span>
            <span>{{ homestay.danhGiaTrungBinh }} ({{ homestay.soDanhGia || 0 }} đánh giá)</span>
          </div>
        </div>
      </div>

      <!-- Gallery hình ảnh -->
      <div class="homestay-gallery">
        <div class="gallery-grid">
          <!-- Ảnh chính (lớn bên trái) -->
          <div class="main-image" @click="openGalleryModal(0)">
            <img :src="filteredImages[0] || defaultImage" :alt="homestay.tenHomestay" />
          </div>

          <!-- Ảnh nhỏ bên phải -->
          <div class="small-image top-right" @click="openGalleryModal(1)" v-if="filteredImages.length > 1">
            <img :src="filteredImages[1]" :alt="`${homestay.tenHomestay} - Ảnh 2`" />
          </div>

          <div class="small-image bottom-right-top" @click="openGalleryModal(2)" v-if="filteredImages.length > 2">
            <img :src="filteredImages[2]" :alt="`${homestay.tenHomestay} - Ảnh 3`" />
          </div>

          <!-- Ảnh cuối cùng có overlay hiển thị số ảnh còn lại -->
          <div class="small-image bottom-right-bottom" @click="openGalleryModal(3)" v-if="filteredImages.length > 3">
            <img :src="filteredImages[3]" :alt="`${homestay.tenHomestay} - Ảnh 4`" />
            <div class="more-photos" v-if="filteredImages.length > 4">
              <span>+{{ filteredImages.length - 4 }} ảnh</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Nút Đặt phòng ngay -->
      <div class="booking-action">
        <div class="booking-action-container">
          <div v-if="homestay.giaCaHomestay" class="price-display">
            <span class="price">{{ formatPrice(homestay.giaCaHomestay) }}</span>
            <span class="price-unit">/ đêm</span>
          </div>
          <button class="booking-btn" @click="bookNow">
            <i class="fas fa-calendar-check"></i> Đặt Homestay ngay
          </button>
        </div>
      </div>

      <!-- Modal xem ảnh toàn màn hình -->
      <div class="gallery-modal" v-if="showGalleryModal" @click.self="closeGalleryModal">
        <div class="modal-content">
          <span class="close-button" @click="closeGalleryModal">&times;</span>

          <!-- Tab trong modal -->
          <div class="modal-tabs">
            <button :class="['modal-tab-button', { active: activeTab === 'tongquan' }]"
              @click="setActiveTab('tongquan')">
              Tổng quan
            </button>
            <button :class="['modal-tab-button', { active: activeTab === 'homestay' }]"
              @click="setActiveTab('homestay')">
              Ảnh Homestay
            </button>
            <button :class="['modal-tab-button', { active: activeTab === 'phong' }]" @click="setActiveTab('phong')">
              Ảnh Phòng
            </button>
          </div>

          <!-- Thumbnails strip -->
          <div class="thumbnail-strip">
            <div v-for="(image, index) in filteredImages.slice(0, 6)" :key="index" class="thumbnail-item"
              :class="{ active: index === currentImageIndex }" @click="setModalImage(index)">
              <img :src="image" :alt="`${homestay.tenHomestay} - Thumbnail ${index + 1}`" />
            </div>
            <div v-if="filteredImages.length > 6" class="more-thumbnails">
              <span>+{{ filteredImages.length - 6 }}</span>
            </div>
          </div>

          <!-- Main image with navigation -->
          <div class="main-image-container">
            <button class="nav-arrow prev" @click="prevImage" v-if="currentImageIndex > 0">
              <i class="fas fa-chevron-left"></i>
            </button>

            <div class="main-image-wrapper">
              <img :src="filteredImages[currentImageIndex]"
                :alt="`${homestay.tenHomestay} - Ảnh ${currentImageIndex + 1}`" class="main-image" />
              <div class="image-counter">{{ currentImageIndex + 1 }}/{{ filteredImages.length }}</div>

              <!-- Room info overlay when viewing room images -->
              <div v-if="activeTab === 'phong' && currentRoomInfo" class="room-info-overlay">
                <div class="room-info-content">
                  <h4>{{ currentRoomInfo.roomName }}</h4>
                  <p v-if="currentRoomInfo.roomType">{{ currentRoomInfo.roomType }}</p>
                </div>
              </div>
            </div>

            <button class="nav-arrow next" @click="nextImage" v-if="currentImageIndex < filteredImages.length - 1">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <!-- Gallery grid removed -->
        </div>
      </div>

      <!-- Thông tin chi tiết và đặt phòng -->
      <div class="homestay-info">
        <div class="info-section" ref="overviewSection">
          <h2>Thông tin chi tiết</h2>

          <div class="info-section">
            <h3>Mô tả</h3>
            <p>Homestay xinh đẹp tọa lạc tại trung tâm Mộc Châu với tầm nhìn núi non hùng vĩ, không
              gian yên bình và thiết kế hiện đại kết hợp với nét văn hóa địa phương. Đây là nơi lý tưởng để nghỉ dưỡng,
              thư giãn và khám phá vẻ đẹp thiên nhiên của Mộc Châu</p>
          </div>

          <div class="info-section" ref="roomsSection">
            <h3>Thông tin cơ bản của Homestay</h3>
            <div v-if="isLoading" class="loading-indicator">
              <div class="spinner-sm"></div>
              <span>Đang tải thông tin...</span>
            </div>
            <div v-else class="basic-info-container">
              <!-- Thông tin chính -->
              <div class="info-grid">
                <div class="info-item" v-if="homestay.dienTich">
                  <i class="fas fa-ruler"></i>
                  <div class="info-content">
                    <strong>Diện tích</strong>
                    <span>{{ homestay.dienTich }} m²</span>
                  </div>
                </div>
                <div class="info-item" v-if="homestay.diaChi">
                  <i class="fas fa-map-marker-alt"></i>
                  <div class="info-content">
                    <strong>Địa chỉ</strong>
                    <span>{{ homestay.diaChi }}</span>
                  </div>
                </div>
                <div class="info-item" v-if="homestay.loaiHomeStay">
                  <i class="fas fa-home"></i>
                  <div class="info-content">
                    <strong>Loại Homestay</strong>
                    <span>{{ homestay.loaiHomeStay.tenLoai }}</span>
                  </div>
                </div>
                <div class="info-item" v-else-if="homestay.tenLoaiHomestay">
                  <i class="fas fa-home"></i>
                  <div class="info-content">
                    <strong>Loại Homestay</strong>
                    <span>{{ homestay.tenLoaiHomestay }}</span>
                  </div>
                </div>
                <div class="info-item" v-if="homestay.hotenChuHomestay">
                  <i class="fas fa-user"></i>
                  <div class="info-content">
                    <strong>Chủ Homestay</strong>
                    <span>{{ homestay.hotenChuHomestay }}</span>
                  </div>
                </div>
                <div class="info-item" v-else-if="homestay.quanLy">
                  <i class="fas fa-user"></i>
                  <div class="info-content">
                    <strong>Quản lý Homestay</strong>
                    <span>{{ homestay.quanLy.tenQuanLy }}</span>
                  </div>
                </div>
                <div class="info-item" v-if="homestay.sucChua">
                  <i class="fas fa-users"></i>
                  <div class="info-content">
                    <strong>Sức chứa</strong>
                    <span>{{ homestay.sucChua }} người</span>
                  </div>
                </div>
                <div class="info-item" v-if="homestay.giaCaHomestay">
                  <i class="fas fa-money-bill-wave"></i>
                  <div class="info-content">
                    <strong>Giá</strong>
                    <span>{{ formatPrice(homestay.giaCaHomestay) }} / đêm</span>
                  </div>
                </div>
                <div class="info-item" v-if="homestay.danhGiaTrungBinh !== undefined">
                  <i class="fas fa-star"></i>
                  <div class="info-content">
                    <strong>Đánh giá</strong>
                    <span>{{ homestay.danhGiaTrungBinh }} <i class="fas fa-star star-icon"></i> ({{ homestay.soDanhGia
                      || 0 }} đánh giá)</span>
                  </div>
                </div>
                <div class="info-item" v-if="homestay.trangThai !== undefined">
                  <i class="fas fa-calendar-check"></i>
                  <div class="info-content">
                    <strong>Trạng thái</strong>
                    <span :class="{ 'status-active': homestay.trangThai, 'status-inactive': !homestay.trangThai }">
                      {{ getStatusText(homestay.trangThai) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Danh sách phòng -->
              <div class="rooms-section">
                <h4 class="sub-heading">Thông tin các phòng</h4>
                <div v-if="isLoadingRooms" class="loading-indicator">
                  <div class="spinner-sm"></div>
                  <span>Đang tải thông tin phòng...</span>
                </div>
                <div v-else-if="rooms.length > 0">
                  <div v-for="room in rooms" :key="room.id" class="room-section">
                    <div class="room-header">
                      <h5 class="room-title">{{ room.tenPhong }}</h5>
                      <button v-if="room.images && room.images.length > 0" @click="openRoomGallery(room)"
                        class="view-room-images">
                        <i class="fas fa-images"></i> Xem ảnh ({{ room.images.length }})
                      </button>
                    </div>
                    <div class="info-grid">
                      <div class="info-item">
                        <i class="fas fa-tag"></i>
                        <div class="info-content">
                          <strong>Loại phòng</strong>
                          <span>{{ room.loaiPhong?.tenLoai || room.tenLoaiPhong || 'N/A' }}</span>
                        </div>
                      </div>
                      <div class="info-item">
                        <i class="fas fa-ruler-combined"></i>
                        <div class="info-content">
                          <strong>Diện tích</strong>
                          <span>{{ room.dienTich }} m²</span>
                        </div>
                      </div>
                      <div class="info-item">
                        <i class="fas fa-building"></i>
                        <div class="info-content">
                          <strong>Tầng</strong>
                          <span>{{ room.tang || room.tangSo || 'N/A' }}</span>
                        </div>
                      </div>
                      <div class="info-item">
                        <i class="fas fa-male"></i>
                        <div class="info-content">
                          <strong>Số người lớn</strong>
                          <span>{{ room.soNguoiLon }}</span>
                        </div>
                      </div>
                      <div class="info-item">
                        <i class="fas fa-child"></i>
                        <div class="info-content">
                          <strong>Số trẻ nhỏ</strong>
                          <span>{{ room.soTreNho || room.soNguoiNho || 0 }}</span>
                        </div>
                      </div>
                      <div class="info-item">
                        <i class="fas fa-users"></i>
                        <div class="info-content">
                          <strong>Tổng số người</strong>
                          <span>{{ room.soNguoiToiDa || (room.soNguoiLon + (room.soTreNho || room.soNguoiNho || 0))
                          }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="room.moTa" class="room-description">
                      <strong>Mô tả:</strong> {{ room.moTa }}
                    </div>

                  </div>
                </div>
                <div v-else class="no-data">
                  <i class="fas fa-info-circle"></i>
                  <span>Chưa có thông tin phòng cho homestay này.</span>
                </div>
              </div>

              <!-- Thông tin thêm nếu có -->
              <div v-if="homestay.thongTinThem" class="additional-info">
                <h4 class="sub-heading">Thông tin thêm</h4>
                <p>{{ homestay.thongTinThem }}</p>
              </div>

              <!-- Tiện ích gần đó - chỉ hiển thị nếu có dữ liệu thực tế -->
              <div v-if="homestay.tienIchXungQuanh" class="nearby-amenities">
                <h4 class="sub-heading">Tiện ích xung quanh</h4>
                <div class="nearby-grid">
                  <div v-for="(tienIch, index) in homestay.tienIchXungQuanh" :key="index" class="nearby-item">
                    <i :class="tienIch.icon || 'fas fa-map-marker'"></i>
                    <span>{{ tienIch.ten }} ({{ tienIch.khoangCach }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="info-section" ref="amenitiesSection">
            <h3>Tiện nghi, vật tư và dịch vụ</h3>

            <!-- Tiện nghi -->
            <h4 class="sub-heading">Tiện nghi</h4>
            <div v-if="isLoadingAmenities" class="loading-indicator">
              <div class="spinner-sm"></div>
              <span>Đang tải tiện nghi...</span>
            </div>
            <div v-else-if="tienNghiList.length > 0" class="amenities-grid">
              <div class="amenity-item" v-for="(item, index) in tienNghiList" :key="index">
                <i :class="item.icon || 'fas fa-check-circle'"></i>
                <div class="amenity-content">
                  <span class="amenity-name">{{ item.tenTienNghi }}</span>
                  <p v-if="item.moTa" class="amenity-description">{{ item.moTa }}</p>
                </div>
              </div>
            </div>
            <div v-else class="amenities-grid">
              <div class="amenity-item" v-for="(amenity, index) in amenities" :key="index">
                <i :class="amenity.icon"></i>
                <div class="amenity-content">
                  <span class="amenity-name">{{ amenity.name }}</span>
                  <p v-if="amenity.description" class="amenity-description">{{ amenity.description }}</p>
                </div>
              </div>
            </div>

            <!-- Vật tư -->
            <h4 class="sub-heading">Vật tư</h4>
            <div v-if="isLoadingSupplies" class="loading-indicator">
              <div class="spinner-sm"></div>
              <span>Đang tải vật tư...</span>
            </div>
            <div v-else-if="vatTuList.length > 0" class="supplies-grid">
              <div class="supply-item" v-for="(item, index) in vatTuList" :key="index">
                <i class="fas fa-box"></i>
                <div class="supply-content">
                  <span class="supply-name">{{ item.tenVatTu }} <small v-if="item.soLuong">({{ item.soLuong
                  }})</small></span>
                  <p v-if="item.moTa" class="supply-description">{{ item.moTa }}</p>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <i class="fas fa-info-circle"></i>
              <span>Không có thông tin vật tư</span>
            </div>

            <!-- Dịch vụ -->
            <h4 class="sub-heading">Dịch vụ</h4>
            <div v-if="isLoadingServices" class="loading-indicator">
              <div class="spinner-sm"></div>
              <span>Đang tải dịch vụ...</span>
            </div>
            <div v-else-if="dichVuList.length > 0" class="services-grid">
              <div class="service-item" v-for="(item, index) in dichVuList" :key="index">
                <i class="fas fa-concierge-bell"></i>
                <div class="service-content">
                  <div class="service-header">
                    <span class="service-name">{{ item.tenDichVu }}</span>
                    <span class="service-price">{{ formatPrice(item.gia) }}<small>/{{ item.donVi || 'Ngày'
                    }}</small></span>
                  </div>
                  <p v-if="item.moTa" class="service-description">{{ item.moTa }}</p>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <i class="fas fa-info-circle"></i>
              <span>Không có thông tin dịch vụ</span>
            </div>
          </div>

          <div class="info-section" ref="rulesSection">
            <h3>Quy tắc chung</h3>

            <div class="rules-category">
              <h4 class="sub-heading">Thời gian</h4>
              <div class="rules">
                <div class="rule-item">
                  <i class="fas fa-clock"></i>
                  <div>
                    <strong>Nhận phòng:</strong> Sau 14:00
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-clock"></i>
                  <div>
                    <strong>Trả phòng:</strong> Trước 12:00
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-moon"></i>
                  <div>
                    <strong>Giờ yên lặng:</strong> 22:00 - 07:00
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-calendar-alt"></i>
                  <div>
                    <strong>Lưu trú tối thiểu:</strong> 1 đêm
                  </div>
                </div>
              </div>
            </div>

            <div class="rules-category">
              <h4 class="sub-heading">Quy định chung</h4>
              <div class="rules">
                <div class="rule-item">
                  <i class="fas fa-smoking-ban"></i>
                  <div>
                    <strong>Hút thuốc:</strong> Không hút thuốc trong phòng và khu vực chung
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-paw"></i>
                  <div>
                    <strong>Thú cưng:</strong> Không cho phép mang thú cưng
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-glass-cheers"></i>
                  <div>
                    <strong>Tiệc tùng:</strong> Không tổ chức tiệc hoặc sự kiện ồn ào
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-id-card"></i>
                  <div>
                    <strong>Giấy tờ tùy thân:</strong> Yêu cầu xuất trình khi nhận phòng
                  </div>
                </div>
              </div>
            </div>

            <div class="rules-category">
              <h4 class="sub-heading">Thanh toán và hủy phòng</h4>
              <div class="rules">
                <div class="rule-item">
                  <i class="fas fa-money-bill-wave"></i>
                  <div>
                    <strong>Đặt cọc:</strong> 30% tổng giá trị đơn đặt phòng
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-ban"></i>
                  <div>
                    <strong>Chính sách hủy:</strong> Miễn phí hủy trước 7 ngày, mất cọc nếu hủy muộn hơn
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-credit-card"></i>
                  <div>
                    <strong>Phương thức thanh toán:</strong> Tiền mặt, chuyển khoản, thẻ tín dụng
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-user-plus"></i>
                  <div>
                    <strong>Khách thêm:</strong> Phụ thu 100.000₫/người/đêm nếu vượt quá số lượng đăng ký
                  </div>
                </div>
              </div>
            </div>

            <div class="rules-category">
              <h4 class="sub-heading">An ninh và an toàn</h4>
              <div class="rules">
                <div class="rule-item">
                  <i class="fas fa-key"></i>
                  <div>
                    <strong>Chìa khóa:</strong> Phí 200.000₫ nếu làm mất chìa khóa
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-fire-extinguisher"></i>
                  <div>
                    <strong>An toàn cháy nổ:</strong> Không sử dụng bếp gas, nến, hoặc các thiết bị dễ cháy
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-user-shield"></i>
                  <div>
                    <strong>Khách thăm:</strong> Phải đăng ký với lễ tân và không ở qua đêm
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-door-closed"></i>
                  <div>
                    <strong>Cửa ra vào:</strong> Đóng cửa và khóa khi rời khỏi phòng
                  </div>
                </div>
              </div>
            </div>

            <div class="rules-category">
              <h4 class="sub-heading">Vệ sinh và bảo quản</h4>
              <div class="rules">
                <div class="rule-item">
                  <i class="fas fa-broom"></i>
                  <div>
                    <strong>Dọn dẹp:</strong> Dọn dẹp hàng ngày từ 10:00 - 14:00
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-trash"></i>
                  <div>
                    <strong>Rác thải:</strong> Phân loại rác và để vào thùng quy định
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-couch"></i>
                  <div>
                    <strong>Nội thất:</strong> Bồi thường nếu làm hỏng đồ đạc trong phòng
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-wind"></i>
                  <div>
                    <strong>Tiết kiệm năng lượng:</strong> Tắt điều hòa, đèn và thiết bị điện khi ra ngoài
                  </div>
                </div>
              </div>
            </div>

            <p class="rules-note">
              <i class="fas fa-info-circle"></i>
              Việc đặt phòng đồng nghĩa với việc bạn đã đọc và đồng ý với tất cả các quy tắc trên. Nếu có bất kỳ thắc
              mắc nào, vui lòng liên hệ với chúng tôi trước khi đặt phòng.
            </p>
          </div>

          <div class="info-section">
            <h3>Đánh giá từ khách hàng</h3>
            <div v-if="homestay.danhGiaTrungBinh !== undefined" class="reviews-summary">
              <div class="overall-rating">
                <span class="rating-number">{{ homestay.danhGiaTrungBinh }}</span>
                <div class="stars">★★★★★</div>
                <span class="review-count">{{ homestay.soDanhGia || 0 }} đánh giá</span>
              </div>
              <div v-if="homestay.chiTietDanhGia" class="rating-bars">
                <div v-for="(rating, category) in homestay.chiTietDanhGia" :key="category" class="rating-bar-item">
                  <span>{{ category }}</span>
                  <div class="bar-container">
                    <div class="bar" :style="{ width: (rating * 20) + '%' }"></div>
                  </div>
                  <span>{{ rating.toFixed(1) }}</span>
                </div>
              </div>
              <div v-else class="no-data">
                <i class="fas fa-info-circle"></i>
                <span>Chưa có chi tiết đánh giá</span>
              </div>
            </div>
            <div v-else class="no-data">
              <i class="fas fa-info-circle"></i>
              <span>Chưa có đánh giá</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getHomeStayById, getAnhHomeStayByHomestayId, getAvailableHomestay } from '@/Service/HomeStayService';
import { getAllTienNghi } from '@/Service/TienNghiService';
import { getVatTuList } from '@/Service/vatTuService';
import { getPhongByHomeStayId, getAnhPhongByPhongId } from '@/Service/phongService';
import { getDichVuByIdHomeStay } from '@/Service/DatHomeService';
// import { useAuthStore } from '@/stores/authStore';
import notification from '@/utils/notification';

const route = useRoute();
const router = useRouter();
const homestay = ref(null);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';

// Dữ liệu phòng
const rooms = ref([]);
const isLoadingRooms = ref(false);

// Hình ảnh homestay từ API
const additionalImages = ref([]);
const mainImage = ref('');
const roomImages = ref([]);

// Quản lý tab
const activeTab = ref('tongquan'); // 'tongquan', 'homestay', 'phong'

// Lọc ảnh theo tab đang active
const filteredImages = computed(() => {
  switch (activeTab.value) {
    case 'homestay':
      return [...additionalImages.value];
    case 'phong':
      return roomImages.value.map(img => img.url || img);
    case 'tongquan':
    default:
      return [
        ...additionalImages.value,
        ...roomImages.value.map(img => img.url || img)
      ];
  }
});

// Thông tin phòng của ảnh đang hiển thị
const currentRoomInfo = computed(() => {
  if (activeTab.value === 'phong' && roomImages.value.length > 0) {
    const currentImg = roomImages.value[currentImageIndex.value];
    if (currentImg && currentImg.roomId) {
      const room = rooms.value.find(r => r.id === currentImg.roomId);
      if (room) {
        return {
          roomId: room.id,
          roomName: room.tenPhong,
          roomType: room.loaiPhong?.tenLoai || room.tenLoaiPhong
        };
      }
    }
  }
  return null;
});

// Dữ liệu và chức năng cho modal gallery
const showGalleryModal = ref(false);
const currentImageIndex = ref(0);
const modalImage = ref('');

// Quản lý sections với tabs
const activeSection = ref('overview'); // 'overview', 'rooms', 'amenities', 'rules'

// Refs for section elements to enable scrolling
const overviewSection = ref(null);
const roomsSection = ref(null);
const amenitiesSection = ref(null);
const rulesSection = ref(null);

// Đặt section active và scroll đến section đó
const setActiveSection = (section) => {
  activeSection.value = section;

  // Scroll to the selected section
  let targetElement = null;

  switch (section) {
    case 'overview':
      targetElement = overviewSection.value;
      break;
    case 'rooms':
      targetElement = roomsSection.value;
      break;
    case 'amenities':
      targetElement = amenitiesSection.value;
      break;
    case 'rules':
      targetElement = rulesSection.value;
      break;
  }

  if (targetElement) {
    // Offset for the sticky navigation bar
    const offset = 70;
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Danh sách tiện nghi mẫu (fallback nếu API không trả về dữ liệu)
const amenities = [
  { name: 'WiFi miễn phí', icon: 'fas fa-wifi', description: 'Kết nối internet tốc độ cao miễn phí trong toàn bộ khu vực' },
  { name: 'Điều hòa', icon: 'fas fa-snowflake', description: 'Điều hòa hai chiều, điều chỉnh nhiệt độ theo nhu cầu' },
  { name: 'TV', icon: 'fas fa-tv', description: 'TV màn hình phẳng với các kênh truyền hình cáp' },
  { name: 'Bếp', icon: 'fas fa-utensils', description: 'Bếp đầy đủ tiện nghi với các dụng cụ nấu ăn cơ bản' },
  { name: 'Máy giặt', icon: 'fas fa-tshirt', description: 'Máy giặt miễn phí trong khu vực chung' },
  { name: 'Chỗ đậu xe', icon: 'fas fa-parking', description: 'Bãi đậu xe miễn phí trong khuôn viên' },
  { name: 'Hồ bơi', icon: 'fas fa-swimming-pool', description: 'Hồ bơi ngoài trời mở cửa từ 7:00 đến 19:00' },
  { name: 'Bữa sáng', icon: 'fas fa-coffee', description: 'Bữa sáng miễn phí với các món ăn địa phương và quốc tế' }
];

// Danh sách tiện nghi từ API
const tienNghiList = ref([]);
const vatTuList = ref([]);
const dichVuList = ref([]);
const isLoadingAmenities = ref(false);
const isLoadingSupplies = ref(false);
const isLoadingServices = ref(false);

// Lấy dữ liệu tiện nghi, vật tư và dịch vụ
const fetchAmenitiesAndSupplies = async () => {
  isLoadingAmenities.value = true;
  isLoadingSupplies.value = true;
  isLoadingServices.value = true;

  try {
    // Lấy danh sách tiện nghi
    const tienNghiResponse = await getAllTienNghi();
    if (tienNghiResponse && tienNghiResponse.data) {
      tienNghiList.value = tienNghiResponse.data.filter(item => item.trangThai !== false);
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tiện nghi:', error);
  } finally {
    isLoadingAmenities.value = false;
  }

  try {
    // Lấy danh sách vật tư
    const vatTuResponse = await getVatTuList();
    if (vatTuResponse && vatTuResponse.data) {
      vatTuList.value = vatTuResponse.data.filter(item => item.trangThai !== false);
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vật tư:', error);
  } finally {
    isLoadingSupplies.value = false;
  }

  // Nếu đã có ID homestay, lấy danh sách dịch vụ
  if (route.params.id) {
    try {
      const dichVuResponse = await getDichVuByIdHomeStay(route.params.id);
      if (dichVuResponse && dichVuResponse.data) {
        dichVuList.value = dichVuResponse.data.filter(item => item.trangThai !== false);
        console.log('Danh sách dịch vụ:', dichVuList.value);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách dịch vụ:', error);
    } finally {
      isLoadingServices.value = false;
    }
  } else {
    isLoadingServices.value = false;
  }
};

// Lấy thông tin ảnh homestay từ API
const fetchHomestayImages = async (homestayId) => {
  try {
    // Kiểm tra nếu homestay đã có trường hình ảnh trực tiếp
    if (homestay.value && homestay.value.Hinh_Anh) {
      console.log('Sử dụng hình ảnh trực tiếp từ homestay:', homestay.value.Hinh_Anh);
      // Sử dụng ảnh trực tiếp
      mainImage.value = homestay.value.Hinh_Anh;
      additionalImages.value = [homestay.value.Hinh_Anh];
      modalImage.value = homestay.value.Hinh_Anh;

      // Vẫn tiếp tục tải các ảnh khác từ API để hiển thị trong gallery
      const response = await getAnhHomeStayByHomestayId(homestayId);
      if (response && response.data && response.data.length > 0) {
        const apiImages = response.data.filter(img => img.trangThai !== false).map(img => img.duongDanAnh);
        // Thêm vào danh sách ảnh (nếu chưa có)
        apiImages.forEach(imgUrl => {
          if (!additionalImages.value.includes(imgUrl)) {
            additionalImages.value.push(imgUrl);
          }
        });
      }
    }
    // Nếu không có hình ảnh trực tiếp, tìm kiếm trong các trường khác
    else if (homestay.value && (homestay.value.hinhAnh || homestay.value.image || homestay.value.imageUrl || homestay.value.anhDaiDien || homestay.value.anhBia)) {
      const directImage = homestay.value.hinhAnh || homestay.value.image || homestay.value.imageUrl || homestay.value.anhDaiDien || homestay.value.anhBia;
      console.log('Sử dụng hình ảnh từ trường thay thế:', directImage);
      mainImage.value = directImage;
      additionalImages.value = [directImage];
      modalImage.value = directImage;

      // Vẫn tiếp tục tải các ảnh khác từ API để hiển thị trong gallery
      const response = await getAnhHomeStayByHomestayId(homestayId);
      if (response && response.data && response.data.length > 0) {
        const apiImages = response.data.filter(img => img.trangThai !== false).map(img => img.duongDanAnh);
        // Thêm vào danh sách ảnh (nếu chưa có)
        apiImages.forEach(imgUrl => {
          if (!additionalImages.value.includes(imgUrl)) {
            additionalImages.value.push(imgUrl);
          }
        });
      }
    }
    // Nếu không có hình ảnh trực tiếp, dùng API
    else {
      const response = await getAnhHomeStayByHomestayId(homestayId);
      if (response && response.data && response.data.length > 0) {
        // Lấy danh sách ảnh từ API
        const images = response.data.filter(img => img.trangThai !== false).map(img => img.duongDanAnh);

        // Nếu có ảnh, cập nhật ảnh chính và danh sách ảnh bổ sung
        if (images.length > 0) {
          mainImage.value = images[0];
          additionalImages.value = images;
          modalImage.value = images[0]; // Initialize modal image
        } else {
          // Nếu không có ảnh từ API, sử dụng ảnh mặc định
          mainImage.value = defaultImage;
          additionalImages.value = [defaultImage];
          modalImage.value = defaultImage;
        }
      } else {
        // Nếu không có dữ liệu từ API, sử dụng ảnh mặc định
        mainImage.value = defaultImage;
        additionalImages.value = [defaultImage];
        modalImage.value = defaultImage;
      }
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin ảnh homestay:', error);
    // Trong trường hợp lỗi, vẫn sử dụng ảnh mặc định
    mainImage.value = defaultImage;
    additionalImages.value = [defaultImage];
    modalImage.value = defaultImage;
  }
};

// Lấy thông tin homestay từ API
const fetchHomestayData = async () => {
  isLoading.value = true;
  hasError.value = false;
  errorMessage.value = '';

  try {
    const homestayId = route.params.id;

    if (!homestayId) {
      throw new Error('Không tìm thấy ID homestay');
    }

    console.log('Đang tải thông tin homestay với ID:', homestayId);
    const response = await getHomeStayById(homestayId);

    if (response.data) {
      homestay.value = response.data;
      console.log('Dữ liệu homestay từ API:', homestay.value);
      console.log('Kiểm tra các trường dữ liệu:', {
        id: homestay.value.id,
        tenHomestay: homestay.value.tenHomestay,
        hotenChuHomestay: homestay.value.hotenChuHomestay,
        tenLoaiHomestay: homestay.value.tenLoaiHomestay,
        loaiHomeStay: homestay.value.loaiHomeStay,
        quanLy: homestay.value.quanLy,
        allProps: Object.keys(homestay.value)
      });

      // Sau khi lấy thông tin homestay thành công, tiếp tục lấy ảnh và phòng
      await fetchHomestayImages(homestayId);
      await fetchRooms(homestayId);
    } else {
      throw new Error('Không tìm thấy thông tin homestay');
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin homestay:', error);
    hasError.value = true;
    errorMessage.value = error.message || 'Đã xảy ra lỗi khi tải thông tin homestay';
  } finally {
    isLoading.value = false;
  }
};

// Lấy thông tin phòng của homestay
const fetchRooms = async (homestayId) => {
  isLoadingRooms.value = true;
  try {
    const response = await getPhongByHomeStayId(homestayId);
    if (response && response.data) {
      // Lọc ra các phòng đang hoạt động
      rooms.value = response.data.filter(room => room.trangThai === 'Hoạt động' || room.trangThai === true);
      console.log('Room data:', rooms.value); // Log room data to verify structure

      // Fetch room images for each room
      await fetchRoomImages();
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng:', error);
  } finally {
    isLoadingRooms.value = false;
  }
};

// Lấy ảnh cho từng phòng
const fetchRoomImages = async () => {
  try {
    roomImages.value = []; // Reset room images array

    // Fetch images for each room
    for (const room of rooms.value) {
      if (room.id) {
        // Kiểm tra nếu phòng đã có trường hình ảnh trực tiếp
        let directImagesAdded = false;

        // Kiểm tra các trường có thể chứa hình ảnh trực tiếp của phòng
        if (room.Hinh_Anh) {
          // Thêm ảnh trực tiếp từ trường Hinh_Anh
          const directImageInfo = {
            url: room.Hinh_Anh,
            roomId: room.id,
            roomName: room.tenPhong,
            isMainImage: true
          };

          roomImages.value.push(directImageInfo);

          // Lưu ảnh vào room object để dễ truy cập
          room.images = [directImageInfo.url];
          directImagesAdded = true;
          console.log(`Đã thêm ảnh trực tiếp cho phòng ${room.tenPhong} từ trường Hinh_Anh:`, room.Hinh_Anh);
        }
        // Kiểm tra các trường khác có thể chứa hình ảnh
        else if (room.hinhAnh || room.image || room.imageUrl || room.anhDaiDien || room.anhBia) {
          const directImageUrl = room.hinhAnh || room.image || room.imageUrl || room.anhDaiDien || room.anhBia;

          const directImageInfo = {
            url: directImageUrl,
            roomId: room.id,
            roomName: room.tenPhong,
            isMainImage: true
          };

          roomImages.value.push(directImageInfo);

          // Lưu ảnh vào room object để dễ truy cập
          room.images = [directImageInfo.url];
          directImagesAdded = true;
          console.log(`Đã thêm ảnh trực tiếp cho phòng ${room.tenPhong} từ trường thay thế:`, directImageUrl);
        }

        // Vẫn tiếp tục tải ảnh từ API để có đầy đủ bộ sưu tập
        try {
          const response = await getAnhPhongByPhongId(room.id);
          if (response && response.data && response.data.length > 0) {
            // Filter valid images
            const apiImages = response.data
              .filter(img => img.trangThai !== false)
              .map(img => ({
                url: img.duongDanAnh,
                roomId: room.id,
                roomName: room.tenPhong
              }));

            // Thêm ảnh từ API vào mảng hình ảnh (nếu chưa có)
            apiImages.forEach(imgInfo => {
              // Kiểm tra xem ảnh đã tồn tại chưa để tránh trùng lặp
              if (!roomImages.value.some(existingImg =>
                existingImg.roomId === imgInfo.roomId && existingImg.url === imgInfo.url)) {
                roomImages.value.push(imgInfo);
              }
            });

            // Cập nhật danh sách ảnh trong room object
            if (!directImagesAdded || !room.images) {
              room.images = apiImages.map(img => img.url);
            } else if (directImagesAdded) {
              // Thêm các ảnh API vào danh sách đã có (nếu chưa có)
              apiImages.forEach(apiImg => {
                if (!room.images.includes(apiImg.url)) {
                  room.images.push(apiImg.url);
                }
              });
            }
          }
        } catch (apiError) {
          console.error(`Lỗi khi lấy ảnh từ API cho phòng ${room.id}:`, apiError);
        }
      }
    }

    console.log('Room images loaded:', roomImages.value.length);
  } catch (error) {
    console.error('Lỗi khi lấy ảnh phòng:', error);
  }
};


// Đặt tab active
const setActiveTab = (tab) => {
  activeTab.value = tab;
  // Cập nhật modal index để phù hợp với bộ ảnh đã lọc
  currentImageIndex.value = 0;
  if (filteredImages.value.length > 0) {
    modalImage.value = filteredImages.value[0];
  }
};

// Mở modal gallery
const openGalleryModal = (index) => {
  currentImageIndex.value = index;
  modalImage.value = filteredImages.value[index];
  showGalleryModal.value = true;
  // Ngăn cuộn trang khi modal mở
  document.body.style.overflow = 'hidden';
};

// Đóng modal gallery
const closeGalleryModal = () => {
  showGalleryModal.value = false;
  // Cho phép cuộn trang khi đóng modal
  document.body.style.overflow = '';
};

// Đặt ảnh trong modal
const setModalImage = (index) => {
  currentImageIndex.value = index;
  modalImage.value = filteredImages.value[index];
};

// Mở gallery cho một phòng cụ thể
const openRoomGallery = (room) => {
  if (room.images && room.images.length > 0) {
    // Chuyển sang tab phòng
    setActiveTab('phong');

    // Tìm index của ảnh đầu tiên của phòng này trong mảng roomImages
    const firstImageIndex = roomImages.value.findIndex(img =>
      img.roomId === room.id && img.url === room.images[0]
    );

    // Nếu tìm thấy, mở gallery tại ảnh đó
    if (firstImageIndex !== -1) {
      openGalleryModal(firstImageIndex);
    } else {
      // Nếu không tìm thấy, mở gallery ở ảnh đầu tiên
      openGalleryModal(0);
    }
  }
};

// Chuyển đến ảnh trước
const prevImage = () => {
  currentImageIndex.value = (currentImageIndex.value - 1 + filteredImages.value.length) % filteredImages.value.length;
  modalImage.value = filteredImages.value[currentImageIndex.value];
};

// Chuyển đến ảnh tiếp theo
const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % filteredImages.value.length;
  modalImage.value = filteredImages.value[currentImageIndex.value];
};

// Quay lại trang trước
const goBack = () => {
  router.back();
};

// Khởi tạo authStore
// const authStore = useAuthStore();

// Hàm để xử lý việc đặt phòng
const bookNow = async () => {
  try {
    // Kiểm tra xem homestay có đang bị khóa không
    const availabilityResponse = await getAvailableHomestay();
    if (availabilityResponse && availabilityResponse.success) {
      const homestayData = availabilityResponse.data.find(
        item => item.homestay && item.homestay.id === homestay.value.id
      );

      // Nếu homestay đang bị khóa, hiển thị thông báo và không cho phép đặt
      if (!homestayData || homestayData.isLocked) {
                 notification.warning(
           'Rất tiếc, homestay này hiện đang được đặt tại quầy. Vui lòng chọn homestay khác hoặc thử lại sau.'
         );
         router.push('/').then(() => {
           // Đảm bảo cuộn lên đầu trang sau khi chuyển hướng
           window.scrollTo({ top: 0, behavior: 'smooth' });
         });
         return;
      }
    }

    // Nếu homestay không bị khóa, tiếp tục quy trình đặt phòng
    router.push({
      name: 'booking',
      query: { id: homestay.value.id, fromHome: 'true' }
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái homestay:', error);
    notification.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
  }
};

// Format giá tiền
const formatPrice = (price) => {
  if (!price) return '0₫';
  return price.toLocaleString('vi-VN') + '₫';
};

// Hàm để lấy text cho trạng thái
const getStatusText = (status) => {
  if (status === true || status === 'Hoạt động') {
    return 'Đang hoạt động';
  } else if (status === false || status === 'Tạm ngưng') {
    return 'Tạm ngưng';
  } else {
    return 'Không xác định';
  }
};

onMounted(() => {
  fetchHomestayData();
  fetchAmenitiesAndSupplies();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

/* Booking Container */
.booking-container {
  font-family: 'Roboto', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  background-color: #ffffff;
}

.booking-content {
  background-color: #ffffff;
}

/* Loading và Error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  text-align: center;
  background-color: #ffffff;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #007bff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-icon {
  color: #dc3545;
  font-size: 48px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.primary-btn {
  background-color: #007bff;
  color: white;
}

.primary-btn:hover {
  background-color: #0056b3;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  font-size: 14px;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 10px;
  color: #6c757d;
}

.current {
  color: #6c757d;
  font-weight: 500;
}

/* Homestay Header */
.homestay-header {
  margin-bottom: 28px;
}

.homestay-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #212529;
}

.homestay-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #6c757d;
  font-size: 14px;
}

.location,
.rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stars {
  color: #ffc107;
}

/* Gallery - Booking.com style */
.homestay-gallery {
  margin-bottom: 40px;
  background-color: #ffffff;
}

.gallery-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tab-button {
  padding: 10px 20px;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.tab-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.tab-button:hover:not(.active) {
  background-color: #f9f9f9;
}

.gallery-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, 200px);
  gap: 5px;
  height: 405px;
}

.main-image {
  grid-column: 1;
  grid-row: 1 / span 2;
  border-radius: 8px 0 0 8px;
  overflow: hidden;
  height: 100%;
  cursor: pointer;
}

.small-image {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.top-right {
  grid-column: 2;
  grid-row: 1;
  border-radius: 0 8px 0 0;
}

.bottom-right-top {
  grid-column: 2;
  grid-row: 2;
}

.bottom-right-bottom {
  grid-column: 2;
  grid-row: 2;
  border-radius: 0 0 8px 0;
}

.main-image img,
.small-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-image:hover img,
.small-image:hover img {
  transform: scale(1.05);
}

.more-photos {
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

/* Gallery Modal - Booking.com style */
.gallery-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.96);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  position: relative;
  width: 95%;
  max-width: 1300px;
  height: 90%;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  overflow: hidden;
}

/* Tab design */
.modal-tabs {
  display: flex;
  gap: 0;
  background-color: #1a1a1a;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #333;
}

.modal-tab-button {
  background: transparent;
  border: none;
  color: #fff;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  opacity: 0.7;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
}

.modal-tab-button:hover {
  opacity: 1;
}

.modal-tab-button.active {
  color: #fff;
  opacity: 1;
  border-bottom: 3px solid #0077db;
}

/* Thumbnails strip */
.thumbnail-strip {
  display: flex;
  padding: 20px;
  gap: 10px;
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
}

.thumbnail-item {
  flex: 0 0 120px;
  height: 80px;
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  opacity: 0.7;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.thumbnail-item:hover {
  opacity: 1;
}

.thumbnail-item.active {
  opacity: 1;
  border-color: #0077db;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.more-thumbnails {
  flex: 0 0 60px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #333;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 3px;
  cursor: pointer;
}

/* Main image container */
.main-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  position: relative;
  background-color: #000;
}

.main-image-wrapper {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.main-image {
  max-width: 95%;
  max-height: 90%;
  object-fit: contain;
}

.image-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 400;
}

/* Navigation arrows */
.nav-arrow {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s ease;
  z-index: 2;
}

.nav-arrow.prev {
  left: 20px;
}

.nav-arrow.next {
  right: 20px;
}

.nav-arrow:hover {
  background-color: rgba(255, 255, 255, 0.35);
  transform: scale(1.05);
}

/* Close button */
.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

/* Modal gallery grid */
.modal-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  padding: 10px;
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  margin: 0 -5px 15px;
}

.modal-gallery-grid::-webkit-scrollbar {
  width: 6px;
}

.modal-gallery-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.modal-gallery-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.modal-gallery-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-gallery-item {
  height: 200px;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  transform: translateY(0);
}

.modal-gallery-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 1;
}

.modal-gallery-item:hover::before {
  opacity: 1;
}

.modal-gallery-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
}

.modal-gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1);
}

.modal-gallery-item:hover img {
  transform: scale(1.1);
}

.modal-gallery-item img.active-image {
  border: 3px solid #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.4);
}

/* Controls */
.modal-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 25px;
  margin: 5px auto 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50px;
  width: max-content;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.nav-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  margin: 0 15px;
  position: relative;
  overflow: hidden;
}

.nav-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(33, 150, 243, 0.8), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  transform: scale(0.5);
}

.nav-button:hover::before {
  opacity: 1;
  transform: scale(1.5);
}

.nav-button:hover {
  background-color: rgba(33, 150, 243, 0.2);
  transform: scale(1.15);
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.4);
}

.image-counter {
  color: white;
  font-size: 15px;
  font-weight: 500;
  margin: 0 20px;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 20px;
  border-radius: 20px;
  letter-spacing: 1px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Modal main image for swiping */
.modal-main-image-container {
  position: relative;
  width: 100%;
  height: 400px;
  margin-top: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  background-color: rgba(0, 0, 0, 0.3);
  user-select: none;
  touch-action: pan-y;
}

.modal-main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.modal-swipe-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  opacity: 0.6;
  transition: opacity 0.3s, background-color 0.3s;
  z-index: 2;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-swipe-indicator.left {
  left: 15px;
}

.modal-swipe-indicator.right {
  right: 15px;
}

.modal-main-image-container:hover .modal-swipe-indicator {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.3);
}

.modal-main-image-container .image-counter {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Thumbnails Strip */
.thumbnail-strip {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
  scrollbar-width: none;
  /* Hide scrollbar for Firefox */
  -ms-overflow-style: none;
  /* Hide scrollbar for IE and Edge */
}

.thumbnail-strip::-webkit-scrollbar {
  display: none;
  /* Hide scrollbar for Chrome, Safari and Opera */
}

.thumbnail-item {
  flex: 0 0 auto;
  width: 100px;
  /* Fixed width for thumbnails */
  height: 70px;
  /* Fixed height for thumbnails */
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.thumbnail-item:hover {
  transform: scale(1.05);
  border-color: #2196f3;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
}

.thumbnail-item.active {
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.4);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.more-thumbnails {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  /* Fixed width for the "more" indicator */
  height: 70px;
  /* Fixed height for the "more" indicator */
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  padding: 0 5px;
  margin-left: 10px;
}

.main-image-container {
  position: relative;
  width: 100%;
  height: 400px;
  margin-top: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  background-color: rgba(0, 0, 0, 0.3);
  user-select: none;
  touch-action: pan-y;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image-container:hover .modal-swipe-indicator {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.3);
}

.main-image-container .image-counter {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Booking Navigation Bar - Booking.com style */
.booking-nav {
  background-color: #ffffff;
  border-bottom: 1px solid #e7e7e7;
  margin: 0 0 32px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.nav-tabs {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-tabs::-webkit-scrollbar {
  display: none;
}

.nav-tab {
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.nav-tab:hover {
  color: #0077db;
}

.nav-tab.active {
  color: #0077db;
  border-bottom: 3px solid #0077db;
}

@media (max-width: 768px) {
  .nav-tab {
    padding: 12px 16px;
    font-size: 14px;
  }
}

/* Booking Details */
.homestay-info {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;
}

.homestay-info h2 {
  font-size: 26px;
  font-weight: 600;
  margin: 16px 0 24px;
  color: #212529;
}

.info-section {
  margin-bottom: 36px;
  padding-bottom: 24px;
  border-bottom: 1px solid #dee2e6;
}

.info-section:last-child {
  border-bottom: none;
  margin-bottom: 32px;
  padding-bottom: 32px;
}

.info-section h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #212529;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item i {
  color: #007bff;
  width: 20px;
  text-align: center;
}

/* Amenities */
.amenities-grid,
.supplies-grid,
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.amenity-item,
.supply-item,
.service-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.amenity-item:hover,
.supply-item:hover,
.service-item:hover {
  background-color: #f9f9f9;
  transform: translateY(-2px);
}

.amenity-item i,
.supply-item i,
.service-item i {
  color: #007bff;
  width: 20px;
  text-align: center;
  margin-top: 4px;
}

.amenity-content,
.supply-content,
.service-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.amenity-name,
.supply-name,
.service-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.amenity-description,
.supply-description,
.service-description {
  margin: 0;
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
}

/* Service specific styles */
.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.service-price {
  font-weight: 600;
  color: #28a745;
  font-size: 14px;
}

.service-price small {
  font-weight: normal;
  font-size: 12px;
  color: #6c757d;
  margin-left: 2px;
}

/* No data message */
.no-data {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6c757d;
  font-style: italic;
  margin: 20px 0;
  padding: 15px;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

/* Rules */
.rules-category {
  margin-bottom: 24px;
}

.rules {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.rule-item:hover {
  background-color: #f9f9f9;
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.rule-item i {
  color: #007bff;
  width: 20px;
  text-align: center;
  margin-top: 3px;
  font-size: 16px;
}

.rule-item strong {
  display: block;
  margin-bottom: 2px;
  color: #343a40;
}

.rules-note {
  margin-top: 30px;
  padding: 16px;
  background-color: #ffffff;
  border-left: 4px solid #007bff;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
}

.rules-note i {
  color: #007bff;
  margin-right: 8px;
}

/* Reviews */
.reviews-summary {
  display: flex;
  gap: 40px;
  align-items: center;
}

.overall-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 140px;
}

.rating-number {
  font-size: 52px;
  font-weight: 700;
  color: #212529;
  line-height: 1;
  margin-bottom: 8px;
}

.review-count {
  color: #6c757d;
  font-size: 14px;
}

.rating-bars {
  flex: 1;
}

.rating-bar-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.rating-bar-item span {
  width: 60px;
}

.rating-bar-item span:last-child {
  width: 30px;
  text-align: right;
}

/* Bar styling */
.bar-container {
  flex: 1;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  margin: 0 10px;
}

.bar {
  height: 100%;
  background-color: #007bff;
  border-radius: 4px;
}

/* Booking Form - Removed */

@media (max-width: 576px) {
  .booking-container {
    padding: 10px;
  }

  .main-image {
    height: 250px;
  }

  .reviews-summary {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .homestay-info {
    padding: 0 12px;
  }

  .reviews-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }

  .overall-rating {
    width: 100%;
    flex-direction: row;
    gap: 16px;
    margin-bottom: 16px;
  }

  .rating-number {
    margin-bottom: 0;
  }

  .info-section h3 {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .homestay-header h1 {
    font-size: 24px;
  }

  .nav-tab {
    padding: 12px 16px;
    font-size: 14px;
  }

  .amenities-grid,
  .supplies-grid,
  .services-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .rules {
    grid-template-columns: 1fr;
  }
}

/* Sub headings */
.sub-heading {
  font-size: 18px;
  font-weight: 500;
  margin: 24px 0 16px;
  color: #444;
}

/* Loading indicators */
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  color: #6c757d;
  padding: 15px;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.spinner-sm {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #007bff;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

body,
html {
  background-color: #ffffff;
}

/* Basic Info Styling */
.basic-info-container {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  border-radius: 8px;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.info-item i {
  color: #007bff;
  font-size: 18px;
  width: 24px;
  text-align: center;
  margin-top: 2px;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-content strong {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
}

.info-content span {
  font-size: 16px;
  color: #212529;
}

.star-icon {
  color: #ffc107;
  font-size: 14px;
}

.status-active {
  color: #28a745;
}

.status-inactive {
  color: #dc3545;
}

.additional-info {
  margin-bottom: 30px;
}

.additional-info p {
  line-height: 1.6;
}

.nearby-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.nearby-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
}

.nearby-item i {
  color: #007bff;
  width: 20px;
  text-align: center;
}

/* Room list styles */
.rooms-section {
  margin-top: 40px;
}

.rooms-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.room-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.room-card-header {
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.room-card-header h5 {
  margin: 0;
  font-size: 18px;
  color: #212529;
}

.room-type {
  display: inline-block;
  margin-top: 5px;
  font-size: 14px;
  color: #6c757d;
}

.room-card-body {
  padding: 15px;
}

.room-detail {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  font-size: 14px;
}

.room-detail:last-child {
  margin-bottom: 0;
}

.room-detail i {
  width: 20px;
  margin-right: 10px;
  color: #007bff;
  font-size: 16px;
  margin-top: 2px;
}

.room-detail span {
  flex: 1;
  line-height: 1.4;
}

/* CSS cho nút đặt phòng */
.booking-action {
  max-width: 1000px;
  margin: 25px auto;
  padding: 0 16px;
}

.booking-action-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
}

.price-display {
  display: flex;
  align-items: baseline;
}

.price {
  font-size: 26px;
  font-weight: 700;
  color: #007bff;
}

.price-unit {
  font-size: 16px;
  color: #6c757d;
  margin-left: 5px;
}

.booking-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.booking-btn i {
  font-size: 18px;
}

.booking-btn:hover {
  background-color: #0056b3;
}

@media (max-width: 576px) {
  .booking-action-container {
    flex-direction: column;
    gap: 15px;
  }

  .booking-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Room section styles */
.room-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.room-section:last-child {
  border-bottom: none;
}

.room-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #212529;
  font-weight: 600;
}

.room-description {
  margin-top: 15px;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
}

.room-description strong {
  color: #495057;
}

/* Room header with title and view images button */
.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.view-room-images {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.view-room-images:hover {
  background-color: #0056b3;
}

/* Room image preview */
.room-image-preview {
  margin-top: 15px;
  border-radius: 8px;
  overflow: hidden;
  max-width: 300px;
  height: 200px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.room-image-preview:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.room-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Room info overlay in modal */
.room-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  backdrop-filter: blur(5px);
}

.room-info-content {
  text-align: center;
}

.room-info-content h4 {
  margin: 0 0 5px;
  font-size: 18px;
  font-weight: 600;
}

.room-info-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}
</style>
