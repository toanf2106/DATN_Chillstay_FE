<template>
  <div class="payment-container">
    <div class="page-header">
      <h1>Phương thức thanh toán</h1>
      <p class="subtitle">ChillStay chấp nhận nhiều phương thức thanh toán khác nhau để mang đến sự tiện lợi cho khách hàng</p>
    </div>

    <div class="content-section">
      <div class="payment-intro">
        <p>Tại ChillStay, chúng tôi luôn nỗ lực mang đến cho khách hàng trải nghiệm đặt phòng và thanh toán đơn giản, an toàn và thuận tiện nhất. Dưới đây là các phương thức thanh toán chúng tôi chấp nhận.</p>
      </div>

      <div class="payment-methods">
        <div class="payment-method">
          <div class="method-icon">
            <i class="fas fa-credit-card"></i>
          </div>
          <div class="method-content">
            <h2>Thẻ tín dụng/ghi nợ</h2>
            <p>ChillStay chấp nhận thanh toán qua các thẻ tín dụng và ghi nợ phổ biến, bao gồm:</p>
            <div class="card-logos">
              <span class="card-logo visa">Visa</span>
              <span class="card-logo mastercard">MasterCard</span>
              <span class="card-logo jcb">JCB</span>
              <span class="card-logo amex">American Express</span>
            </div>
            <p class="method-note">Giao dịch thanh toán thẻ được bảo mật theo tiêu chuẩn quốc tế PCI DSS, đảm bảo thông tin thanh toán của bạn luôn được bảo vệ.</p>
          </div>
        </div>

        <div class="payment-method">
          <div class="method-icon">
            <i class="fas fa-university"></i>
          </div>
          <div class="method-content">
            <h2>Chuyển khoản ngân hàng</h2>
            <p>Bạn có thể thanh toán bằng cách chuyển khoản đến tài khoản ngân hàng của ChillStay:</p>
            <div class="bank-info">
              <p><strong>Ngân hàng:</strong> Vietcombank</p>
              <p><strong>Số tài khoản:</strong> 1234567890</p>
              <p><strong>Chủ tài khoản:</strong> CÔNG TY TNHH CHILLSTAY</p>
              <p><strong>Chi nhánh:</strong> Sơn La</p>
              <p><strong>Nội dung:</strong> [Mã đặt phòng] - [Họ tên]</p>
            </div>
            <p class="method-note">Sau khi chuyển khoản, vui lòng gửi xác nhận thanh toán đến email info@chillstay.com để chúng tôi xác nhận đặt phòng của bạn.</p>
          </div>
        </div>

        <div class="payment-method">
          <div class="method-icon">
            <i class="fas fa-wallet"></i>
          </div>
          <div class="method-content">
            <h2>Ví điện tử</h2>
            <p>ChillStay hỗ trợ thanh toán qua các ví điện tử phổ biến tại Việt Nam:</p>
            <div class="ewallet-logos">
              <span class="ewallet-logo momo">MoMo</span>
              <span class="ewallet-logo zalopay">ZaloPay</span>
              <span class="ewallet-logo vnpay">VNPay</span>
            </div>
            <p>Thanh toán qua ví điện tử nhanh chóng, tiện lợi và có nhiều ưu đãi hấp dẫn từ các đối tác ví điện tử.</p>
          </div>
        </div>

        <div class="payment-method">
          <div class="method-icon">
            <i class="fas fa-coins"></i>
          </div>
          <div class="method-content">
            <h2>Thanh toán tại homestay</h2>
            <p>Đối với một số homestay được chọn, bạn có thể thanh toán trực tiếp tại homestay khi nhận phòng. Phương thức này áp dụng có điều kiện và cần được xác nhận trước.</p>
            <p class="method-note">Lưu ý: Phương thức thanh toán này có thể yêu cầu đặt cọc trước để đảm bảo đặt phòng.</p>
          </div>
        </div>
      </div>

      <div class="payment-policy">
        <h2>Chính sách thanh toán</h2>

        <div class="policy-item">
          <h3>Thời hạn thanh toán</h3>
          <p>Sau khi đặt phòng, bạn cần thanh toán trong vòng 24 giờ để xác nhận đặt phòng. Nếu không nhận được thanh toán trong thời hạn này, đặt phòng có thể bị hủy tự động.</p>
        </div>

        <div class="policy-item">
          <h3>Đặt cọc và thanh toán toàn phần</h3>
          <p>Đối với các đặt phòng trong mùa cao điểm hoặc dịp lễ, chúng tôi có thể yêu cầu thanh toán 100% giá trị đặt phòng. Đối với các đặt phòng thông thường, chúng tôi yêu cầu đặt cọc 30% giá trị đặt phòng và thanh toán phần còn lại khi nhận phòng.</p>
        </div>

        <div class="policy-item">
          <h3>Phí thanh toán</h3>
          <p>ChillStay không thu phí thanh toán thêm. Tuy nhiên, ngân hàng hoặc nhà cung cấp dịch vụ thanh toán của bạn có thể áp dụng phí giao dịch theo quy định của họ.</p>
        </div>

        <div class="policy-item">
          <h3>Xác nhận thanh toán</h3>
          <p>Sau khi thanh toán thành công, bạn sẽ nhận được email xác nhận thanh toán và chi tiết đặt phòng. Vui lòng kiểm tra hòm thư và giữ email này để tham khảo sau này.</p>
        </div>
      </div>

      <div class="payment-security">
        <h2>Bảo mật thanh toán</h2>
        <p>ChillStay cam kết bảo vệ thông tin thanh toán của khách hàng. Chúng tôi áp dụng các biện pháp bảo mật hiện đại nhất:</p>
        <ul>
          <li>Mã hóa SSL 256-bit cho tất cả các giao dịch trực tuyến</li>
          <li>Tuân thủ tiêu chuẩn bảo mật PCI DSS cho dữ liệu thẻ</li>
          <li>Không lưu trữ thông tin thẻ tín dụng hoặc chi tiết tài khoản ngân hàng</li>
          <li>Hệ thống phát hiện gian lận để giám sát các giao dịch bất thường</li>
        </ul>
      </div>

      <div class="faq-section">
        <h2>Câu hỏi thường gặp về thanh toán</h2>

        <div class="faq-item">
          <h3>Tôi có thể thay đổi phương thức thanh toán sau khi đặt phòng không?</h3>
          <p>Có, bạn có thể thay đổi phương thức thanh toán bằng cách liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi trước thời hạn thanh toán.</p>
        </div>

        <div class="faq-item">
          <h3>Khi nào tôi sẽ nhận được hoàn tiền nếu hủy đặt phòng?</h3>
          <p>Thời gian hoàn tiền phụ thuộc vào phương thức thanh toán ban đầu của bạn. Thông thường, hoàn tiền thẻ tín dụng mất 5-10 ngày làm việc, chuyển khoản ngân hàng mất 3-5 ngày làm việc.</p>
        </div>

        <div class="faq-item">
          <h3>Tôi có thể thanh toán bằng ngoại tệ không?</h3>
          <p>Hiện tại, ChillStay chỉ chấp nhận thanh toán bằng đồng Việt Nam (VNĐ). Nếu bạn thanh toán bằng thẻ quốc tế, ngân hàng của bạn sẽ chuyển đổi số tiền theo tỷ giá hiện hành.</p>
        </div>

        <div class="faq-item">
          <h3>Tôi có thể nhận hóa đơn VAT không?</h3>
          <p>Có, để nhận hóa đơn VAT, vui lòng cung cấp thông tin xuất hóa đơn trong quá trình đặt phòng hoặc liên hệ với chúng tôi qua email info@chillstay.com.</p>
        </div>
      </div>

      <div class="contact-section">
        <h2>Bạn cần hỗ trợ về thanh toán?</h2>
        <p>Nếu bạn có bất kỳ thắc mắc nào về phương thức thanh toán hoặc gặp khó khăn trong quá trình thanh toán, vui lòng liên hệ với chúng tôi:</p>
        <div class="contact-info">
          <p><i class="fas fa-envelope"></i> Email: payment@chillstay.com</p>
          <p><i class="fas fa-phone"></i> Hotline: 0865344586</p>
          <p><i class="fas fa-clock"></i> Thời gian hỗ trợ: 8:00 - 22:00 hàng ngày</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Dữ liệu mẫu cho trang Phương thức thanh toán
</script>

<style scoped>
.payment-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  color: #333;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.payment-intro {
  font-size: 1.1rem;
  margin-bottom: 30px;
  color: #555;
  text-align: center;
  font-weight: 300;
  line-height: 1.7;
}

.payment-methods {
  margin-bottom: 40px;
}

.payment-method {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.payment-method:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.method-icon {
  background: linear-gradient(135deg, #48cae4, #0077b6);
  color: white;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  min-width: 100px;
}

.method-content {
  padding: 25px;
  flex-grow: 1;
}

.method-content h2 {
  color: #0077b6;
  margin-bottom: 15px;
  font-size: 1.4rem;
}

.method-content p {
  margin-bottom: 15px;
  color: #555;
  font-size: 1rem;
  line-height: 1.6;
}

.method-note {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
  margin-top: 10px;
}

.card-logos, .ewallet-logos {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 15px 0;
}

.card-logo, .ewallet-logo {
  padding: 8px 12px;
  background-color: white;
  border-radius: 5px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.visa {
  color: #1a1f71;
}

.mastercard {
  color: #eb001b;
}

.jcb {
  color: #0075bf;
}

.amex {
  color: #006fcf;
}

.momo {
  color: #ae2070;
}

.zalopay {
  color: #0068ff;
}

.vnpay {
  color: #0060be;
}

.bank-info {
  background-color: white;
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.bank-info p {
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.payment-policy, .payment-security, .faq-section {
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.payment-policy h2, .payment-security h2, .faq-section h2, .contact-section h2 {
  color: #0077b6;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.policy-item, .faq-item {
  margin-bottom: 20px;
}

.policy-item h3, .faq-item h3 {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.payment-security ul {
  margin-left: 20px;
  margin-bottom: 15px;
}

.payment-security li {
  margin-bottom: 8px;
  color: #555;
}

.contact-section {
  text-align: center;
  margin-top: 40px;
  padding: 25px;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  color: #333;
}

.contact-info i {
  color: #48cae4;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.8rem;
  }

  .payment-method {
    flex-direction: column;
  }

  .method-icon {
    padding: 20px;
    width: 100%;
    font-size: 2rem;
  }

  .card-logos, .ewallet-logos {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .method-content h2, .payment-policy h2, .payment-security h2, .faq-section h2, .contact-section h2 {
    font-size: 1.3rem;
  }

  .policy-item h3, .faq-item h3 {
    font-size: 1rem;
  }
}
</style>
