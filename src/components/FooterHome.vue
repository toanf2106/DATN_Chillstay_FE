<template>
  <footer class="footer">
    <div class="footer-main">
      <div class="container">
        <div class="footer-columns">
          <div class="footer-logo-column">
            <div class="footer-logo">
              <img src="@/assets/Icon/LogoChill.png" alt="ChillStay Logo" class="logo-image" />
            </div>
            <p class="company-name">Công ty TNHH Du lịch và Dịch Vụ ChillStay</p>
            <p class="company-address">Tiểu khu 5, Thị trấn Mộc Châu, Huyện Mộc Châu, Tỉnh Sơn La</p>
            <p class="company-info">ChillStay - Hệ thống homestay hàng đầu tại Mộc Châu, mang đến trải nghiệm lưu trú
              đẳng cấp giữa thiên nhiên</p>
            <div class="contact-info">
              <p class="hotline">Hotline: 0922222016</p>
              <p class="email">Email: info@chillstay.com</p>
            </div>
          </div>
          <div class="footer-links-column">
            <h4 class="footer-heading">GIỚI THIỆU</h4>
            <ul class="footer-links">
              <li><a href="/about">Về chúng tôi</a></li>
              <li><a href="/careers">Tuyển dụng</a></li>
              <li><a href="/press">Báo chí</a></li>
              <li><a href="#">Điều khoản và điều kiện</a></li>
              <li><a href="#">Chính sách riêng tư</a></li>
            </ul>
          </div>
          <div class="footer-links-column">
            <h4 class="footer-heading">HỖ TRỢ</h4>
            <ul class="footer-links">
              <li><a href="#">Trung tâm trợ giúp</a></li>
              <li><a href="#">Liên hệ</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
              <li><a href="#">Hướng dẫn sử dụng</a></li>
              <li><a href="#">Hình thức thanh toán</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container">
        <p class="copyright">Bản quyền © 2024 ChillStay.</p>
      </div>
    </div>

  </footer>
</template>

<script setup>
// Import statements removed since Icon is no longer used
</script>

<style scoped>
.footer {
  background-color: #131b2e;
  color: #fff;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.footer-main {
  padding: 50px 0 30px;
}

.footer-columns {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.footer-logo-column {
  width: 33%;
  padding-right: 30px;
}

.footer-links-column {
  width: 28%;
}

.footer-logo {
  text-align: left;
  margin-bottom: 20px;
}

.logo-image {
  max-width: 120px;
  height: auto;
}

.company-name,
.company-address,
.company-info {
  margin-bottom: 10px;
  font-size: 14px;
  color: #aaaeb6;
  line-height: 1.5;
}

.footer-heading {
  text-align: left;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
  display: inline-block;
}

.footer-heading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 30px;
  height: 2px;
  background-color: #fff;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #aaaeb6;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #fff;
}

.contact-info {
  margin-top: 20px;
}

.hotline,
.email {
  color: #aaaeb6;
  font-size: 14px;
  margin-bottom: 10px;
}

.footer-bottom {
  background-color: #0e1524;
  padding: 20px 0;
}

.footer-bottom .container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.copyright {
  color: #aaaeb6;
  font-size: 14px;
}

@media (max-width: 768px) {

  .footer-logo-column,
  .footer-links-column {
    width: 100%;
    padding-right: 0;
    margin-bottom: 30px;
  }

  .footer-columns {
    flex-direction: column;
  }

  .footer-bottom .container {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
