<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Đánh giá Homestay</h3>
        <button @click="closeModal" class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <div class="booking-info">
          <img :src="booking.hinhAnh || '/images/default-homestay.png'" alt="Homestay Image" class="homestay-image"/>
          <div class="booking-details">
            <h4>{{ booking.tenHomestay }}</h4>
            <p>Mã đặt phòng: {{ booking.maDatHome }}</p>
          </div>
        </div>

        <div class="rating-section">
          <label>Chất lượng sản phẩm</label>
          <div class="stars">
            <span v-for="star in 5" :key="star" @click="setRating('quality', star)" :class="{ 'filled': review.quality >= star }">&#9733;</span>
          </div>
          <span class="rating-text">{{ getRatingText(review.quality) }}</span>
        </div>

        <div class="comment-section">
          <textarea v-model="review.comment" placeholder="Hãy chia sẻ nhận xét của bạn về homestay này nhé!"></textarea>
        </div>

        <div class="media-upload">
          <div class="upload-box">
            <i class="fas fa-camera"></i>
            <span>Thêm hình ảnh</span>
            <input type="file" multiple @change="handleImageUpload" accept="image/*" />
          </div>
        </div>
         <div class="image-preview" v-if="review.images.length">
          <div v-for="(image, index) in review.images" :key="index" class="preview-item">
            <img :src="image.url" />
            <button @click="removeImage(index)" class="remove-image">&times;</button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="submitReview" class="submit-button">Gửi đánh giá</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  booking: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'submit']);

const review = ref({
  quality: 0,
  comment: '',
  images: [],
});

const setRating = (type, value) => {
  review.value[type] = value;
};

const getRatingText = (rating) => {
  const texts = ['Tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời'];
  return rating > 0 ? texts[rating - 1] : '';
};

const handleImageUpload = (event) => {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = (e) => {
      review.value.images.push({ file: file, url: e.target.result });
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = (index) => {
    review.value.images.splice(index, 1);
}

const closeModal = () => {
  emit('close');
};

const submitReview = () => {
  const reviewData = {
    quality: review.value.quality,
    comment: review.value.comment,
    bookingId: props.booking.id,
    idKhachHang: props.booking.idKhachHang,
    homestayId: props.booking.homestayId,
    images: review.value.images.map(img => img.file)
  };
  emit('submit', reviewData);
  // closeModal(); // The parent component will now be responsible for closing the modal
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.booking-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.homestay-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 15px;
}

.booking-details h4 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.booking-details p {
  margin: 0;
  color: #666;
}

.homestay-info h4 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
}

.rating-section, .rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.rating-section label, .rating-item label {
  width: 120px;
}

.stars {
  color: #ccc;
  font-size: 1.8rem;
}

.stars span {
  cursor: pointer;
  transition: color 0.2s;
}

.stars span.filled {
  color: #ffc107;
}

.rating-text {
  margin-left: 10px;
  color: #ffc107;
  font-weight: bold;
}

.comment-section textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: vertical;
}

.media-upload {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.upload-box {
  border: 2px dashed #ddd;
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
  flex: 1;
}

.upload-box i {
  font-size: 1.5rem;
  color: #888;
}

.upload-box span {
  display: block;
  margin-top: 5px;
  color: #888;
}

.upload-box input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
}

.remove-image {
    position: absolute;
    top: -5px;
    right: -5px;
    background: rgba(0,0,0,0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    cursor: pointer;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  text-align: right;
}

.submit-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.submit-button:hover {
  background-color: #218838;
}
</style>
