<template>
  <div class="contact-container">
    <div class="page-header">
      <h1>Liên hệ với chúng tôi</h1>
      <p class="subtitle">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc</p>
    </div>

    <div class="contact-content">
      <div class="contact-info-section">
        <h2>Thông tin liên hệ</h2>
        <div class="info-item">
          <i class="fas fa-map-marker-alt"></i>
          <div>
            <h3>Địa chỉ</h3>
            <p>Tiểu khu 5, TT. Mộc Châu, Sơn La</p>
          </div>
        </div>

        <div class="info-item">
          <i class="fas fa-phone-alt"></i>
          <div>
            <h3>Điện thoại</h3>
            <p>0865344586</p>
          </div>
        </div>

        <div class="info-item">
          <i class="fas fa-envelope"></i>
          <div>
            <h3>Email</h3>
            <p>info@chillstay.com</p>
          </div>
        </div>

        <div class="info-item">
          <i class="fas fa-clock"></i>
          <div>
            <h3>Giờ làm việc</h3>
            <p>Thứ 2 - Chủ Nhật: 8:00 - 22:00</p>
          </div>
        </div>

        <div class="social-media">
          <h3>Kết nối với chúng tôi</h3>
          <div class="social-icons">
            <a href="#" class="social-icon facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social-icon instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social-icon twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" class="social-icon youtube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>

      <div class="contact-form-section">
        <h2>Gửi tin nhắn cho chúng tôi</h2>
        <form @submit.prevent="submitForm" class="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label for="fullName">Họ và tên <span class="required">*</span></label>
              <input
                type="text"
                id="fullName"
                v-model="formData.fullName"
                :class="{ 'error': errors.fullName }"
                placeholder="Nhập họ và tên của bạn"
              >
              <p v-if="errors.fullName" class="error-message">{{ errors.fullName }}</p>
            </div>

            <div class="form-group">
              <label for="email">Email <span class="required">*</span></label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                :class="{ 'error': errors.email }"
                placeholder="Nhập địa chỉ email của bạn"
              >
              <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                v-model="formData.phone"
                placeholder="Nhập số điện thoại của bạn"
              >
            </div>

            <div class="form-group">
              <label for="subject">Chủ đề <span class="required">*</span></label>
              <select
                id="subject"
                v-model="formData.subject"
                :class="{ 'error': errors.subject }"
              >
                <option value="" disabled selected>Chọn chủ đề</option>
                <option value="booking">Đặt phòng</option>
                <option value="service">Dịch vụ</option>
                <option value="feedback">Góp ý</option>
                <option value="support">Hỗ trợ kỹ thuật</option>
                <option value="cooperation">Hợp tác kinh doanh</option>
                <option value="other">Khác</option>
              </select>
              <p v-if="errors.subject" class="error-message">{{ errors.subject }}</p>
            </div>
          </div>

          <div class="form-group">
            <label for="message">Nội dung tin nhắn <span class="required">*</span></label>
            <textarea
              id="message"
              v-model="formData.message"
              :class="{ 'error': errors.message }"
              rows="6"
              placeholder="Nhập nội dung tin nhắn của bạn"
            ></textarea>
            <p v-if="errors.message" class="error-message">{{ errors.message }}</p>
          </div>

          <div class="form-group file-upload">
            <label for="attachment">Tệp đính kèm (nếu có)</label>
            <div class="file-input-container">
              <input
                type="file"
                id="attachment"
                @change="handleFileUpload"
                ref="fileInput"
              >
              <button type="button" class="browse-btn" @click="triggerFileInput">Chọn tệp</button>
              <span class="file-name">{{ fileName || 'Chưa có tệp nào được chọn' }}</span>
            </div>
            <p class="file-note">Chấp nhận file: JPG, PNG, PDF. Kích thước tối đa: 5MB</p>
          </div>

          <div class="form-group checkbox-group">
            <div class="checkbox-container">
              <input type="checkbox" id="agreement" v-model="formData.agreement">
              <label for="agreement">Tôi đồng ý với <a href="/privacy" target="_blank">chính sách bảo mật</a> của ChillStay</label>
            </div>
            <p v-if="errors.agreement" class="error-message">{{ errors.agreement }}</p>
          </div>

          <div v-if="formSuccess" class="success-message">
            <i class="fas fa-check-circle"></i> Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin"></i> Đang gửi...</span>
              <span v-else>Gửi tin nhắn</span>
            </button>
            <button type="button" class="reset-btn" @click="resetForm">Xóa form</button>
          </div>
        </form>
      </div>
    </div>

    <div class="map-section">
      <h2>Vị trí của chúng tôi</h2>
      <div class="map-container">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59818.92011557971!2d104.63045831508338!3d20.841682081713736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31346fc919c4e575%3A0x84a30ee38382f1a4!2zVHQuIE3hu5ljIENow6J1LCBTxqFuIExhLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1720875222699!5m2!1svi!2s"
          width="100%"
          height="450"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </div>

    <div class="faq-section">
      <h2>Câu hỏi thường gặp</h2>
      <div class="faq-list">
        <div class="faq-item" v-for="(faq, index) in faqs" :key="index" @click="toggleFaq(index)">
          <div class="faq-question" :class="{ 'active': activeFaq === index }">
            <h3>{{ faq.question }}</h3>
            <i class="fas" :class="activeFaq === index ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </div>
          <div class="faq-answer" :class="{ 'show': activeFaq === index }">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
      <div class="more-faq">
        <router-link to="/faq" class="more-faq-link">Xem thêm câu hỏi <i class="fas fa-arrow-right"></i></router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const formData = reactive({
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  attachment: null,
  agreement: false
});

const errors = reactive({
  fullName: '',
  email: '',
  subject: '',
  message: '',
  agreement: ''
});

const isSubmitting = ref(false);
const formSuccess = ref(false);
const fileName = ref('');
const fileInput = ref(null);

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });

  if (!formData.fullName.trim()) {
    errors.fullName = 'Vui lòng nhập họ và tên';
    isValid = false;
  }

  if (!formData.email.trim()) {
    errors.email = 'Vui lòng nhập email';
    isValid = false;
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Email không hợp lệ';
    isValid = false;
  }

  if (!formData.subject) {
    errors.subject = 'Vui lòng chọn chủ đề';
    isValid = false;
  }

  if (!formData.message.trim()) {
    errors.message = 'Vui lòng nhập nội dung tin nhắn';
    isValid = false;
  }

  if (!formData.agreement) {
    errors.agreement = 'Bạn cần đồng ý với chính sách bảo mật';
    isValid = false;
  }

  return isValid;
};

const submitForm = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    // Mô phỏng API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Form submitted:', formData);
    formSuccess.value = true;
    resetForm();

    // Tự động ẩn thông báo thành công sau 5 giây
    setTimeout(() => {
      formSuccess.value = false;
    }, 5000);
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key === 'agreement') {
      formData[key] = false;
    } else {
      formData[key] = '';
    }
  });

  fileName.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    formData.attachment = file;
    fileName.value = file.name;
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

// FAQ section
const activeFaq = ref(null);
const faqs = [
  {
    question: 'Làm thế nào để tôi đặt phòng tại ChillStay?',
    answer: 'Bạn có thể đặt phòng trực tiếp trên website của chúng tôi bằng cách chọn homestay, ngày check-in và check-out, và điền thông tin cá nhân. Bạn cũng có thể gọi điện thoại hoặc gửi email để đặt phòng.'
  },
  {
    question: 'Chính sách hủy phòng của ChillStay như thế nào?',
    answer: 'Chính sách hủy phòng phụ thuộc vào từng homestay. Thông thường, nếu bạn hủy trước 7 ngày, bạn sẽ được hoàn lại toàn bộ tiền. Hủy trước 3-7 ngày, bạn sẽ được hoàn 50%. Hủy trong vòng 3 ngày, bạn sẽ không được hoàn tiền.'
  },
  {
    question: 'Tôi có thể thanh toán bằng những phương thức nào?',
    answer: 'ChillStay chấp nhận thanh toán bằng thẻ tín dụng/ghi nợ, chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay, VNPay) và thanh toán trực tiếp tại homestay (đối với một số homestay được chọn).'
  }
];

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index;
};
</script>

<style scoped>
.contact-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
  position: relative;
  display: inline-block;
}

.page-header h1:after {
  content: '';
  position: absolute;
  width: 80px;
  height: 3px;
  background: linear-gradient(135deg, #48cae4, #0077b6);
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
}

.subtitle {
  color: #666;
  font-size: 1.2rem;
  margin-top: 15px;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  margin-bottom: 60px;
}

@media (max-width: 992px) {
  .contact-content {
    grid-template-columns: 1fr;
  }
}

.contact-info-section {
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
}

.contact-info-section h2,
.contact-form-section h2,
.map-section h2,
.faq-section h2 {
  color: #0077b6;
  font-size: 1.8rem;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 10px;
}

.contact-info-section h2:after,
.contact-form-section h2:after,
.map-section h2:after,
.faq-section h2:after {
  content: '';
  position: absolute;
  width: 50px;
  height: 2px;
  background: linear-gradient(135deg, #48cae4, #0077b6);
  bottom: 0;
  left: 0;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 25px;
}

.info-item i {
  font-size: 1.5rem;
  color: #48cae4;
  margin-right: 15px;
  margin-top: 5px;
  width: 20px;
  text-align: center;
}

.info-item h3 {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.info-item p {
  color: #555;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.social-media {
  margin-top: 30px;
}

.social-media h3 {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #fff;
  border-radius: 50%;
  color: #48cae4;
  font-size: 1.2rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.social-icon:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
}

.facebook:hover {
  background-color: #1877f2;
  color: white;
}

.instagram:hover {
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  color: white;
}

.twitter:hover {
  background-color: #1da1f2;
  color: white;
}

.youtube:hover {
  background-color: #ff0000;
  color: white;
}

/* Form styles */
.contact-form-section {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 1rem;
}

.required {
  color: #ff4757;
}

input[type="text"],
input[type="email"],
input[type="tel"],
select,
textarea {
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;
  color: #333;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #48cae4;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(72, 202, 228, 0.15);
}

input.error,
select.error,
textarea.error {
  border-color: #ff4757;
}

.error-message {
  color: #ff4757;
  font-size: 0.85rem;
  margin-top: 5px;
}

.file-upload {
  margin-top: 10px;
}

.file-input-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.file-input-container input[type="file"] {
  display: none;
}

.browse-btn {
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;
}

.browse-btn:hover {
  background-color: #e9ecef;
}

.file-name {
  color: #666;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.file-note {
  color: #666;
  font-size: 0.85rem;
  margin-top: 5px;
}

.checkbox-group {
  margin-top: 5px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-container label {
  margin-bottom: 0;
  cursor: pointer;
}

.checkbox-container a {
  color: #0077b6;
  text-decoration: none;
}

.checkbox-container a:hover {
  text-decoration: underline;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.submit-btn {
  padding: 12px 25px;
  background: linear-gradient(135deg, #48cae4, #0077b6);
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #0077b6, #023e8a);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 119, 182, 0.3);
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reset-btn {
  padding: 12px 25px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  color: #333;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background-color: #e9ecef;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 5px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.success-message i {
  font-size: 1.2rem;
}

/* Map section */
.map-section {
  margin-bottom: 60px;
}

.map-container {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
}

/* FAQ section */
.faq-list {
  margin-bottom: 30px;
}

.faq-item {
  margin-bottom: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.faq-question h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
}

.faq-question i {
  color: #48cae4;
  transition: transform 0.3s ease;
}

.faq-question.active {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.faq-answer {
  padding: 0 20px;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-answer.show {
  padding: 20px;
  max-height: 300px;
}

.faq-answer p {
  margin: 0;
  color: #555;
  line-height: 1.6;
}

.more-faq {
  text-align: center;
  margin-top: 30px;
}

.more-faq-link {
  color: #0077b6;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.more-faq-link:hover {
  color: #023e8a;
}

.more-faq-link i {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.more-faq-link:hover i {
  transform: translateX(5px);
}

@media (max-width: 576px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .contact-info-section,
  .contact-form-section {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
