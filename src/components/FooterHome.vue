<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-brand">
        <img src="@/assets/Icon/LogoChill.png" alt="ChillStay" class="footer-logo" />
        <h3 class="brand-name">ChillStay</h3>
        <p class="slogan">Trải nghiệm nghỉ dưỡng đẳng cấp tại Mộc Châu</p>
      </div>

      <div class="footer-sections">
        <div class="footer-section">
          <h4>Về ChillStay</h4>
          <ul>
            <li><a href="/about">Giới thiệu</a></li>
            <li><a href="/press">Tin tức</a></li>
            <li><a href="/terms">Điều khoản dịch vụ</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li><a href="/faq">Câu hỏi thường gặp</a></li>
            <li><a href="/privacy">Chính sách bảo mật</a></li>
            <li><a href="/payment">Phương thức thanh toán</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>Liên hệ</h4>
          <p><i class="fas fa-map-marker-alt"></i> Tiểu khu 5, TT. Mộc Châu, Sơn La</p>
          <p><i class="fas fa-phone"></i>0865344586</p>
          <p><i class="fas fa-envelope"></i> info@chillstay.com</p>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2024 ChillStay. Mọi quyền được bảo lưu.</p>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
.footer {
  background: #fff;
  color: #333;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  font-size: 0.85rem;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.5px;
  background: linear-gradient(135deg, #48cae4, #0077b6);
  opacity: 0.6;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px 5px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  position: relative;
}

.footer-brand {
  width: 100%;
  max-width: 280px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.footer-logo {
  max-width: 60px;
  margin-bottom: 5px;
}

.brand-name {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #48cae4, #0077b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 5px 0;
}

.slogan {
  font-size: 12px;
  line-height: 1.4;
  color: #555;
  font-weight: 300;
  margin-bottom: 5px;
  letter-spacing: 0.2px;
}

.footer-sections {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: flex-end;
}

.footer-section {
  width: 160px;
}

.footer-section h4 {
  color: #48cae4;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  position: relative;
  padding-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-section h4::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 25px;
  height: 0.5px;
  background: linear-gradient(135deg, #48cae4, #0077b6);
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: 6px;
}

.footer-section a {
  color: #555;
  text-decoration: none;
  font-size: 12px;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
}

.footer-section a:hover {
  color: #48cae4;
  transform: translateX(5px);
}

.footer-section p {
  color: #555;
  font-size: 12px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.footer-section i {
  margin-right: 8px;
  color: #48cae4;
  font-size: 12px;
  width: 12px;
  text-align: center;
}

.social-icons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.social-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(72, 202, 228, 0.1);
  color: #48cae4;
  transition: all 0.3s ease;
  font-size: 12px;
}

.social-icons a:hover {
  background: linear-gradient(135deg, #48cae4, #0077b6);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(72, 202, 228, 0.3);
}

.footer-bottom {
  background: #f8f9fa;
  padding: 8px 0;
  text-align: center;
}

.footer-bottom p {
  font-size: 11px;
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    padding: 20px 20px 10px;
  }

  .footer-brand {
    width: 100%;
    max-width: 100%;
    margin-bottom: 20px;
    text-align: center;
    align-items: center;
  }

  .footer-logo {
    margin: 0 auto 5px;
  }

  .footer-sections {
    width: 100%;
    justify-content: center;
    gap: 30px;
  }

  .footer-section {
    width: 30%;
    margin-bottom: 15px;
    min-width: 140px;
  }
}

@media (max-width: 580px) {
  .footer-sections {
    flex-direction: column;
    align-items: center;
  }

  .footer-section {
    width: 100%;
    max-width: 280px;
    text-align: center;
  }

  .footer-section h4::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .footer-section ul {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .footer-section p {
    justify-content: center;
  }

  .social-icons {
    justify-content: center;
  }
}
</style>
