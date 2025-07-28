<template>
  <div class="faq-container">
    <div class="page-header">
      <h1>Câu hỏi thường gặp</h1>
      <p class="subtitle">Giải đáp thắc mắc của bạn về dịch vụ của ChillStay</p>
    </div>

    <div class="content-section">
      <div class="faq-search">
        <input type="text" placeholder="Tìm kiếm câu hỏi..." v-model="searchQuery" @input="filterFaqs" />
        <i class="fas fa-search"></i>
      </div>

      <div class="faq-categories">
        <button
          v-for="(category, index) in categories"
          :key="index"
          :class="['category-btn', { active: activeCategory === category }]"
          @click="setCategory(category)">
          {{ category }}
        </button>
      </div>

      <div class="faq-list">
        <div class="faq-item" v-for="(item, index) in filteredFaqs" :key="index">
          <div class="faq-question" @click="toggleFaq(index)" :class="{ 'active': activeFaq === index }">
            <h3>{{ item.question }}</h3>
            <i class="fas" :class="activeFaq === index ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </div>
          <div class="faq-answer" :class="{ 'show': activeFaq === index }">
            <p v-html="item.answer"></p>
          </div>
        </div>
      </div>

      <div class="no-results" v-if="filteredFaqs.length === 0">
        <p>Không tìm thấy câu hỏi phù hợp với tìm kiếm của bạn.</p>
        <button class="reset-btn" @click="resetSearch">Đặt lại tìm kiếm</button>
      </div>
    </div>

    <div class="support-section">
      <h2>Bạn cần hỗ trợ thêm?</h2>
      <p>Nếu bạn không tìm thấy câu trả lời cho thắc mắc của mình, vui lòng liên hệ với chúng tôi:</p>
      <div class="contact-methods">
        <div class="contact-method">
          <i class="fas fa-envelope"></i>
          <p>info@chillstay.com</p>
        </div>
        <div class="contact-method">
          <i class="fas fa-phone"></i>
          <p>0865344586</p>
        </div>
        <div class="contact-method">
          <i class="fas fa-comments"></i>
          <p>Chat trực tuyến</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Danh sách các chủ đề
const categories = ['Tất cả', 'Đặt phòng', 'Thanh toán', 'Hủy đặt phòng', 'Dịch vụ', 'Khác'];
const activeCategory = ref('Tất cả');
const activeFaq = ref(null);
const searchQuery = ref('');

// Danh sách câu hỏi và trả lời mẫu
const faqItems = ref([
  {
    question: 'Làm thế nào để đặt homestay trên ChillStay?',
    answer: 'Để đặt homestay, bạn chỉ cần làm theo các bước sau: <br>1. Tìm kiếm homestay phù hợp với nhu cầu của bạn<br>2. Chọn ngày check-in và check-out<br>3. Nhập thông tin cá nhân<br>4. Tiến hành thanh toán<br>5. Nhận email xác nhận đặt phòng',
    category: 'Đặt phòng'
  },
  {
    question: 'ChillStay chấp nhận những phương thức thanh toán nào?',
    answer: 'ChillStay chấp nhận nhiều phương thức thanh toán khác nhau, bao gồm:<br>• Thẻ tín dụng/ghi nợ (Visa, MasterCard, JCB)<br>• Chuyển khoản ngân hàng<br>• Ví điện tử (Momo, ZaloPay, VNPay)<br>• Thanh toán tại homestay (đối với một số homestay được chọn)',
    category: 'Thanh toán'
  },
  {
    question: 'Chính sách hủy đặt phòng như thế nào?',
    answer: 'Chính sách hủy đặt phòng phụ thuộc vào từng homestay cụ thể. Thông thường:<br>• Hủy trước 7 ngày: Hoàn tiền 100% (trừ phí xử lý)<br>• Hủy trong vòng 3-7 ngày: Hoàn tiền 50%<br>• Hủy trong vòng 3 ngày: Không hoàn tiền<br><br>Vui lòng kiểm tra chính sách hủy cụ thể của homestay khi đặt phòng.',
    category: 'Hủy đặt phòng'
  },
  {
    question: 'Tôi có thể thay đổi ngày đặt phòng đã xác nhận không?',
    answer: 'Có, bạn có thể thay đổi ngày đặt phòng tùy thuộc vào chính sách của homestay và tình trạng phòng trống. Để thay đổi, vui lòng đăng nhập vào tài khoản ChillStay của bạn, vào phần "Lịch sử đặt phòng" và chọn "Thay đổi đặt phòng". Một số thay đổi có thể phát sinh phí.',
    category: 'Đặt phòng'
  },
  {
    question: 'Giờ nhận phòng (check-in) và trả phòng (check-out) là mấy giờ?',
    answer: 'Thông thường, giờ nhận phòng (check-in) là từ 14:00 và giờ trả phòng (check-out) là trước 12:00 trưa. Tuy nhiên, mỗi homestay có thể có chính sách riêng. Bạn có thể kiểm tra thông tin này trong mô tả homestay hoặc email xác nhận đặt phòng.',
    category: 'Đặt phòng'
  },
  {
    question: 'Homestay có bao gồm bữa sáng không?',
    answer: 'Việc bao gồm bữa sáng phụ thuộc vào từng homestay. Một số homestay có bao gồm bữa sáng trong giá phòng, trong khi những homestay khác có thể tính phí bổ sung. Thông tin này được hiển thị rõ ràng trong mô tả homestay và chi tiết đặt phòng của bạn.',
    category: 'Dịch vụ'
  },
  {
    question: 'Làm thế nào để nhận hóa đơn VAT cho đặt phòng của tôi?',
    answer: 'Để nhận hóa đơn VAT, vui lòng cung cấp thông tin xuất hóa đơn trong quá trình đặt phòng hoặc liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi qua email info@chillstay.com kèm theo mã đặt phòng của bạn.',
    category: 'Thanh toán'
  },
  {
    question: 'Tôi có thể đặt phòng cho người khác không?',
    answer: 'Có, bạn có thể đặt phòng cho người khác. Trong quá trình đặt phòng, bạn có thể nhập thông tin của khách lưu trú. Lưu ý rằng người đặt phòng sẽ chịu trách nhiệm về thanh toán và tuân thủ các chính sách đặt phòng.',
    category: 'Đặt phòng'
  },
  {
    question: 'Làm thế nào để tôi biết đặt phòng của mình đã được xác nhận?',
    answer: 'Sau khi hoàn tất quá trình đặt phòng và thanh toán, bạn sẽ nhận được email xác nhận đặt phòng. Email này chứa tất cả thông tin chi tiết về đặt phòng của bạn, bao gồm mã đặt phòng, thông tin liên hệ của homestay, và hướng dẫn nhận phòng.',
    category: 'Đặt phòng'
  },
  {
    question: 'ChillStay có chương trình thành viên hoặc khuyến mãi không?',
    answer: 'Có, ChillStay có chương trình thành viên với nhiều ưu đãi hấp dẫn. Khi đăng ký làm thành viên, bạn sẽ tích lũy điểm từ mỗi lần đặt phòng và được hưởng các ưu đãi đặc biệt, giảm giá và thông báo sớm về các khuyến mãi. Chúng tôi cũng thường xuyên có các chương trình khuyến mãi theo mùa.',
    category: 'Khác'
  },
  {
    question: 'Tôi cần mang theo những gì khi nhận phòng?',
    answer: 'Khi nhận phòng, bạn cần mang theo:<br>• Giấy tờ tùy thân có ảnh (CMND/CCCD/Hộ chiếu)<br>• Email xác nhận đặt phòng hoặc mã đặt phòng<br>• Phương tiện thanh toán đã sử dụng để đặt phòng (nếu áp dụng)',
    category: 'Đặt phòng'
  },
  {
    question: 'Homestay có cho phép mang thú cưng không?',
    answer: 'Chính sách về thú cưng khác nhau tùy theo từng homestay. Một số homestay cho phép mang theo thú cưng (có thể tính phí bổ sung), trong khi những homestay khác không cho phép. Thông tin này được hiển thị trong phần mô tả và tiện ích của homestay. Nếu bạn có thắc mắc, vui lòng liên hệ trực tiếp với homestay trước khi đặt phòng.',
    category: 'Dịch vụ'
  }
]);

// Lọc câu hỏi theo danh mục và tìm kiếm
const filteredFaqs = computed(() => {
  let result = faqItems.value;

  // Lọc theo danh mục
  if (activeCategory.value !== 'Tất cả') {
    result = result.filter(item => item.category === activeCategory.value);
  }

  // Lọc theo từ khóa tìm kiếm
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item =>
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query)
    );
  }

  return result;
});

// Các hàm xử lý sự kiện
const setCategory = (category) => {
  activeCategory.value = category;
  activeFaq.value = null;
};

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index;
};

const filterFaqs = () => {
  activeFaq.value = null;
};

const resetSearch = () => {
  searchQuery.value = '';
  activeCategory.value = 'Tất cả';
  activeFaq.value = null;
};
</script>

<style scoped>
.faq-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.faq-search {
  position: relative;
  margin-bottom: 30px;
}

.faq-search input {
  width: 100%;
  padding: 15px 20px;
  padding-right: 50px;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.faq-search input:focus {
  outline: none;
  border-color: #48cae4;
  box-shadow: 0 2px 12px rgba(72, 202, 228, 0.2);
}

.faq-search i {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #48cae4;
  font-size: 1.2rem;
}

.faq-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.category-btn {
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-btn:hover {
  background-color: #e9ecef;
}

.category-btn.active {
  background-color: #48cae4;
  color: white;
  border-color: #48cae4;
}

.faq-list {
  margin-bottom: 40px;
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
  max-height: 500px;
}

.faq-answer p {
  margin: 0;
  color: #555;
  line-height: 1.6;
}

.no-results {
  text-align: center;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.no-results p {
  margin-bottom: 15px;
  color: #666;
}

.reset-btn {
  padding: 8px 16px;
  background-color: #48cae4;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background-color: #0077b6;
}

.support-section {
  text-align: center;
  margin-top: 50px;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.support-section h2 {
  color: #333;
  margin-bottom: 15px;
}

.support-section p {
  color: #555;
  margin-bottom: 20px;
}

.contact-methods {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.contact-method {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.contact-method i {
  font-size: 1.5rem;
  color: #48cae4;
  background-color: rgba(72, 202, 228, 0.1);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.contact-method p {
  margin: 0;
  color: #333;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .contact-methods {
    flex-direction: column;
    gap: 20px;
  }

  .faq-question h3 {
    font-size: 1rem;
  }
}
</style>
