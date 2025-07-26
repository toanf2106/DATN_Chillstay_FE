<template>
    <div class="reviews-page">
        <div class="header">
            <!-- Title changes based on context -->
            <h1 v-if="pageTitle">{{ pageTitle }}</h1>
        </div>

        <div v-if="loading" class="loading-state">Đang tải đánh giá...</div>
        <div v-if="error" class="error-state">{{ error }}</div>

        <div v-if="!loading && processedReviews.length" class="reviews-list">
            <div v-for="reviewData in processedReviews" :key="reviewData.review.id" class="review-card-shopee">
                <!-- User Info Section -->
                <div class="user-info">
                    <img :src="reviewData.customer.avatar || '/images/default-avatar.png'" alt="Avatar"
                        class="user-avatar" />
                    <div class="user-details">
                        <p class="user-name">{{ reviewData.customer.hoTen || 'Khách hàng' }}</p>
                        <div class="star-rating">
                            <span v-for="n in 5" :key="n" class="star"
                                :class="{ filled: n <= reviewData.review.diemSo }">★</span>
                        </div>
                        <p class="review-meta">
                            {{ new Date(reviewData.review.thoiGianDanhGia).toLocaleString() }}
                        </p>
                    </div>
                </div>

                <!-- Review Content Section -->
                <div class="review-content">
                    <p>{{ reviewData.review.noiDung }}</p>
                    <div v-if="reviewData.review.anhDanhGias && reviewData.review.anhDanhGias.length"
                        class="review-images">
                        <img v-for="image in reviewData.review.anhDanhGias" :key="image.id" :src="image.duongDanAnh"
                            alt="Ảnh đánh giá" class="review-image" />
                    </div>
                </div>

                <!-- Product Info Section -->
                <div v-if="reviewData.homestay" class="product-info">
                    <img :src="reviewData.homestay.hinhAnh || '/images/default-homestay.png'" alt="Homestay"
                        class="product-image" />
                    <p class="product-name">{{ reviewData.homestay.tenHomestay || 'Homestay đã đánh giá' }}</p>
                </div>
                <!-- Edit Button -->
                <div class="review-actions">
                    <button v-if="reviewData.review.lanSua === 0 || reviewData.review.lanSua === null"
                        @click="openEditModal(reviewData)" class="edit-review-btn-green">
                        Sửa đánh giá
                    </button>
                    <span v-else class="edited-label">Đã sửa</span>
                </div>
            </div>
        </div>
        <div v-else-if="!loading" class="empty-state">
            <p>Không có đánh giá nào để hiển thị.</p>
        </div>

        <!-- New Edit Modal -->
        <div v-if="isEditModalVisible" class="edit-modal-backdrop">
            <div class="edit-modal-content">
                <button @click="closeEditModal" class="edit-modal-close-btn">&times;</button>
                <h3 class="edit-modal-title">Đánh giá Homestay</h3>

                <div class="homestay-info-modal">
                    <i class="fas fa-home"></i>
  <div>
                        <p class="homestay-name-modal">{{ editingReview.homestayName }}</p>
                        <p class="booking-code-modal">Mã đặt phòng: {{ editingReview.maDatHome }}</p>
                    </div>
                </div>

                <div class="rating-section-modal">
                    <p>Chất lượng sản phẩm</p>
                    <div class="star-rating-modal">
                        <span v-for="star in 5" :key="star" @click="setEditRating(star)"
                            :class="{ 'filled': star <= editingReview.diemSo }">★</span>
                    </div>
                </div>

                <textarea v-model="editingReview.noiDung" class="review-textarea-modal"
                    placeholder="Hãy chia sẻ nhận xét của bạn về homestay này nhé!"></textarea>

                <!-- Image Editing UI -->
                <div class="image-editing-section">
                    <p>Chỉnh sửa hình ảnh</p>
                    <!-- Existing Images -->
                    <div class="image-preview-container">
                        <div v-for="(image, index) in editingReview.anhDanhGias" :key="image.id" class="image-preview">
                            <img :src="image.duongDanAnh" alt="Ảnh hiện tại">
                            <button @click="removeExistingImage(index)" class="remove-image-btn">&times;</button>
                        </div>
                        <!-- New Image Previews -->
                        <div v-for="(image, index) in newImagePreviews" :key="index" class="image-preview">
                            <img :src="image.src" alt="Ảnh mới">
                            <button @click="removeNewImage(index)" class="remove-image-btn">&times;</button>
                        </div>
                         <!-- Add Image Button -->
                        <label class="add-image-btn-label" v-if="(editingReview.anhDanhGias.length + newImagePreviews.length) < 5">
                            <input type="file" @change="handleImageUpload" multiple accept="image/*" class="file-input-hidden">
                            <i class="fas fa-plus"></i>
                            <span>Thêm ảnh</span>
                        </label>
                    </div>
                </div>

                <button @click="submitEditReview" class="submit-edit-btn-green" :disabled="isSubmitting">
                    <span v-if="isSubmitting">Đang gửi...</span>
                    <span v-else>Gửi đánh giá</span>
                </button>
            </div>
        </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { updateDanhGia, deleteAnhDanhGia, uploadAnhDanhGia, getDanhGiaByKhachHangId } from '@/Service/DanhGiaService';
import { getHomeStayById } from '@/Service/HomeStayService';
import { getKhachHangById, getAllKhachHang } from '@/Service/khachHangService';
import { getDatHomeById } from '@/Service/DatHomeService';
import { useToast } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps({
  customerId: {
    type: [String, Number],
    default: null
  }
});

const toast = useToast();
const authStore = useAuthStore();
const processedReviews = ref([]);
const loading = ref(true);
const error = ref(null);
const pageTitle = ref(''); // Reactive title
const isEditModalVisible = ref(false);
const isSubmitting = ref(false);
const editingReview = reactive({
    id: null,
    diemSo: 0,
    noiDung: '',
    homestayName: '',
    maDatHome: '',
    anhDanhGias: [],
    imagesToDelete: [],
});
const newImageFiles = ref([]);
const newImagePreviews = ref([]);

const API_BASE_URL = 'http://localhost:8080';

const getFullImageUrl = (relativeUrl) => {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    try {
        // Use URL constructor for robust path joining
        return new URL(relativeUrl, API_BASE_URL).href;
    } catch {
        console.error("Invalid URL:", relativeUrl);
        return relativeUrl;
    }
};

const openEditModal = (reviewData) => {
    // Reset state
    newImageFiles.value = [];
    newImagePreviews.value = [];
    editingReview.imagesToDelete = [];

    editingReview.id = reviewData.review.id;
    editingReview.diemSo = reviewData.review.diemSo;
    editingReview.noiDung = reviewData.review.noiDung;
    editingReview.homestayName = reviewData.homestay.tenHomestay;
    editingReview.maDatHome = reviewData.booking.maDatHome;
    editingReview.anhDanhGias = [...reviewData.review.anhDanhGias]; // Create a mutable copy
    isEditModalVisible.value = true;
};

const closeEditModal = () => { isEditModalVisible.value = false; };
const setEditRating = (rating) => { editingReview.diemSo = rating; };

const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const totalImages = editingReview.anhDanhGias.length + newImageFiles.value.length + files.length;

    if (totalImages > 5) {
        toast.error("Bạn chỉ có thể có tối đa 5 ảnh cho mỗi đánh giá.");
        return;
    }

    files.forEach(file => {
        newImageFiles.value.push(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            newImagePreviews.value.push({ src: event.target.result, file: file });
        };
        reader.readAsDataURL(file);
    });
};

const removeExistingImage = (index) => {
    const imageToDelete = editingReview.anhDanhGias.splice(index, 1)[0];
    editingReview.imagesToDelete.push(imageToDelete.id);
};

const removeNewImage = (index) => {
    newImageFiles.value.splice(index, 1);
    newImagePreviews.value.splice(index, 1);
};


const submitEditReview = async () => {
    isSubmitting.value = true;
    try {
        // Step 1: Update text and score
        const payload = { diemSo: editingReview.diemSo, noiDung: editingReview.noiDung };
        await updateDanhGia(editingReview.id, payload);

        // Step 2 & 3: Process image changes concurrently
        const deletePromises = editingReview.imagesToDelete.map(id => deleteAnhDanhGia(id));
        const uploadPromises = newImageFiles.value.map(file => uploadAnhDanhGia(file, editingReview.id));

        await Promise.all([...deletePromises, ...uploadPromises]);

        toast.success('Đánh giá đã được cập nhật thành công!');
        closeEditModal();
        await fetchAndProcessReviews();
    } catch (error) {
        console.error('Lỗi khi cập nhật đánh giá:', error);
        toast.error(error.response?.data?.message || 'Không thể cập nhật đánh giá.');
    } finally {
        isSubmitting.value = false;
    }
};

const fetchAndProcessReviews = async () => {
    loading.value = true;
    error.value = null;
    processedReviews.value = [];

    try {
        let reviewsToFetch = [];

        // Case 1: A specific customer's reviews are requested via URL parameter
        if (props.customerId) {
            const customerIdNum = Number(props.customerId);
            pageTitle.value = `Đánh giá của Khách hàng #${customerIdNum}`;
            const reviewsResponse = await getDanhGiaByKhachHangId(customerIdNum);
            reviewsToFetch = reviewsResponse.data || [];
        }
        // Case 2: Show reviews for the logged-in user
        else {
            if (!authStore.user || !authStore.user.id) {
                error.value = "Vui lòng đăng nhập để xem đánh giá.";
                pageTitle.value = 'Đánh giá'; // Default title
                loading.value = false;
                return;
            }
            pageTitle.value = 'Đánh giá của tôi';

            // Step 1: Get all customer profiles linked to the logged-in account
            const allKhachHangRes = await getAllKhachHang();
            // This is the core logic requested by the user.
            const userCustomerProfiles = (allKhachHangRes.data || []).filter(
                // Use `taiKhoan.id` which should be available from the updated DTO
                kh => kh.taiKhoan && kh.taiKhoan.id === authStore.user.id
            );

            if (userCustomerProfiles.length === 0) {
                loading.value = false;
                console.log("Không tìm thấy hồ sơ khách hàng nào cho tài khoản này.");
                return; // No customer profiles for this user, so no reviews
            }

            // Step 2: Fetch reviews for each customer profile using a loop (Promise.all)
            const reviewPromises = userCustomerProfiles.map(profile =>
                getDanhGiaByKhachHangId(profile.id).catch(e => {
                    console.error(`Không thể tải đánh giá cho khách hàng ${profile.id}:`, e);
                    return { data: [] }; // Return empty data on error to not break Promise.all
                })
            );
            const reviewResponses = await Promise.all(reviewPromises);
            reviewsToFetch = reviewResponses.flatMap(res => res.data);
        }

        if (reviewsToFetch.length === 0) {
            loading.value = false;
            return;
        }

        // Step 3: Fetch details for the filtered/fetched reviews
        const reviewsWithDetails = await Promise.all(
            reviewsToFetch.map(async (review) => {
                try {
                    const [homestayResponse, bookingResponse, customerResponse] = await Promise.all([
                        getHomeStayById(review.homeStayId),
                        getDatHomeById(review.datHomeId),
                        getKhachHangById(review.khachHangId)
                    ]);

                    const homestayData = homestayResponse.data || {};
                    const bookingData = bookingResponse.data || {};
                    const customerData = customerResponse.data || {};

                    // Ensure all images have full URLs
                    const processedReview = {
                        ...review,
                        anhDanhGias: (review.anhDanhGias || []).map(img => ({
                            ...img,
                            duongDanAnh: getFullImageUrl(img.duongDanAnh)
                        }))
                    };
                    const processedHomestay = {
                        ...homestayData,
                        hinhAnh: getFullImageUrl(homestayData.hinhAnh)
                    };

                    return {
                        review: processedReview,
                        customer: customerData,
                        homestay: processedHomestay,
                        booking: bookingData
                    };
                } catch (e) {
                    console.error(`Lỗi khi lấy chi tiết cho đánh giá ID ${review.id}:`, e);
                    return null; // Return null for failed fetches
                }
            })
        );

        // Filter out any nulls from failed detail fetches and sort
        processedReviews.value = reviewsWithDetails
            .filter(Boolean)
            .sort((a, b) => new Date(b.review.thoiGianDanhGia) - new Date(a.review.thoiGianDanhGia));

    } catch (err) {
        error.value = 'Đã xảy ra lỗi khi tải đánh giá.';
        console.error('Lỗi tổng thể:', err);
    } finally {
        loading.value = false;
    }
};


// Watch for changes in user login state or the customerId prop
watch(
  [() => authStore.user, () => props.customerId],
  () => {
    fetchAndProcessReviews();
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
/* Styles remain the same */
.reviews-page {
    background-color: #f5f5f5;
    min-height: 100vh;
    font-family: 'Helvetica Neue', Arial, sans-serif;
}

.header {
    padding: 15px;
    background-color: #fff;
    border-bottom: 1px solid #e0e0e0;
    text-align: center;
}

h1 {
    font-size: 18px;
    margin: 0;
}

.reviews-list {
    padding: 10px;
}

.review-card-shopee {
    background-color: #fff;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 4px;
}

.user-info {
    display: flex;
    align-items: flex-start;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
}

.user-details .user-name {
    font-weight: bold;
    margin: 0;
}

.star-rating {
    display: flex;
}

.star {
    font-size: 20px;
    color: #d8d8d8;
}

.star.filled {
    color: #fdd835;
    /* Shopee-like yellow */
}

.review-meta {
    font-size: 12px;
    color: #888;
    margin: 5px 0;
}

.review-content {
    margin-left: 50px;
    /* Align with user details */
    padding-top: 10px;
}

.review-images {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.review-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
}

.product-info {
    display: flex;
    align-items: center;
    background-color: #fafafa;
    padding: 10px;
    margin-top: 15px;
    border-radius: 4px;
}

.product-image {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    border-radius: 4px;
}

.product-name {
    font-size: 14px;
    color: #333;
}

.loading-state,
.error-state,
.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #888;
}

.review-actions {
    margin-left: 50px;
    margin-top: 15px;
}

.edit-review-btn {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.edit-review-btn:hover {
    background-color: #e0e0e0;
}

/* General button style update */
.edit-review-btn-green {
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.edit-review-btn-green:hover {
    background-color: #218838;
}

.edited-label {
    font-style: italic;
    color: #888;
    font-size: 13px;
}


/* New Modal Styles */
.edit-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.edit-modal-content {
    background-color: #2d2d2d;
    color: #fff;
    border-radius: 8px;
    padding: 25px;
    width: 90%;
    max-width: 450px;
    position: relative;
    font-family: Arial, sans-serif;
}

.edit-modal-close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 24px;
    color: #888;
    background: none;
    border: none;
    cursor: pointer;
}

.edit-modal-title {
    text-align: center;
    font-size: 18px;
    margin-bottom: 20px;
    border-bottom: 1px solid #444;
    padding-bottom: 15px;
}

.homestay-info-modal {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
}
.homestay-info-modal .fa-home { font-size: 24px; }
.homestay-name-modal { font-weight: bold; }
.booking-code-modal { font-size: 14px; color: #aaa; }

.rating-section-modal { margin-bottom: 20px; }
.star-rating-modal { display: flex; gap: 10px; font-size: 28px; color: #555; cursor: pointer; }
.star-rating-modal .filled { color: #f5b301; }

.review-textarea-modal {
    width: 100%;
    background-color: #3a3a3a;
    border: 1px solid #555;
    border-radius: 4px;
    color: #fff;
    padding: 10px;
    height: 100px;
    resize: none;
    margin-bottom: 20px;
}
.review-textarea-modal::placeholder { color: #888; }

.image-editing-section {
    border: 2px dashed #555;
    border-radius: 4px;
    padding: 15px;
    text-align: center;
    color: #888;
  margin-bottom: 20px;
}
.image-editing-section p {
    margin-bottom: 15px;
    font-weight: bold;
    color: #ccc;
}
.image-preview-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
}
.image-preview {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #555;
}
.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.remove-image-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    background: rgba(0,0,0,0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
}
.add-image-btn-label {
    width: 80px;
    height: 80px;
    border: 2px dashed #555;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
}
.add-image-btn-label:hover {
    background-color: #444;
    border-color: #777;
}
.add-image-btn-label .fa-plus {
    font-size: 20px;
    margin-bottom: 5px;
}
.add-image-btn-label span {
    font-size: 12px;
}
.file-input-hidden {
    display: none;
}

.submit-edit-btn-green {
    width: 100%;
    background-color: #28a745;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
}
.submit-edit-btn-green:disabled { background-color: #555; }
</style>
