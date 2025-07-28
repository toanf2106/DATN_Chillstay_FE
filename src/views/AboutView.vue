<template>
  <div class="about-container">
    <div class="page-header">
      <h1>Về ChillStay</h1>
    </div>

    <div class="content-section">
      <h2>Giới thiệu về ChillStay</h2>
      <p>ChillStay là hệ thống đặt homestay hàng đầu tại Mộc Châu, cung cấp trải nghiệm lưu trú đẳng cấp và gần gũi với
        thiên nhiên. Với sứ mệnh mang đến cho du khách những kỳ nghỉ đáng nhớ, ChillStay tự hào giới thiệu các homestay
        chất lượng cao với đầy đủ tiện nghi hiện đại.</p>

      <div class="image-section">
        <img
          src="https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
          alt="ChillStay Mộc Châu" class="about-image" />
      </div>

      <h2>Tầm nhìn của chúng tôi</h2>
      <p>ChillStay hướng đến việc trở thành thương hiệu homestay hàng đầu tại Việt Nam, mang đến trải nghiệm du lịch bền
        vững và gắn kết với văn hóa địa phương. Chúng tôi cam kết phát triển du lịch có trách nhiệm, tôn trọng môi
        trường và góp phần phát triển cộng đồng.</p>

      <h2>Giá trị cốt lõi</h2>
      <div class="values-grid">
        <div class="value-item">
          <i class="fas fa-heart"></i>
          <h3>Chất lượng</h3>
          <p>Cung cấp dịch vụ lưu trú chất lượng cao với tiêu chuẩn nghiêm ngặt</p>
        </div>

        <div class="value-item">
          <i class="fas fa-handshake"></i>
          <h3>Uy tín</h3>
          <p>Xây dựng niềm tin với khách hàng thông qua dịch vụ chuyên nghiệp</p>
        </div>

        <div class="value-item">
          <i class="fas fa-leaf"></i>
          <h3>Bền vững</h3>
          <p>Phát triển du lịch có trách nhiệm, bảo vệ môi trường tự nhiên</p>
        </div>

        <div class="value-item">
          <i class="fas fa-users"></i>
          <h3>Cộng đồng</h3>
          <p>Hỗ trợ và phát triển cùng cộng đồng địa phương</p>
        </div>
      </div>

      <h2>Đội ngũ của chúng tôi</h2>
      <p>ChillStay được thành lập bởi những người đam mê du lịch và hiểu rõ giá trị của việc tạo ra những trải nghiệm
        đáng nhớ cho du khách. Đội ngũ của chúng tôi luôn nỗ lực không ngừng để mang đến dịch vụ tốt nhất, từ việc lựa
        chọn các homestay chất lượng đến hỗ trợ khách hàng 24/7.</p>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 1200px;
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
  position: relative;
  display: inline-block;
}

.page-header h1:after {
  content: '';
  position: absolute;
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #48cae4, #0077b6);
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
}

.content-section {
  line-height: 1.8;
}

.content-section h2 {
  color: #0077b6;
  margin: 30px 0 15px;
  font-size: 1.8rem;
}

.content-section p {
  margin-bottom: 20px;
  color: #555;
  font-size: 1.1rem;
}

.image-section {
  margin: 30px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.about-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.about-image:hover {
  transform: scale(1.02);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 30px;
  margin: 30px 0;
}

.value-item {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 10px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.value-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.value-item i {
  font-size: 2.5rem;
  color: #48cae4;
  margin-bottom: 15px;
}

.value-item h3 {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #333;
}

.value-item p {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .values-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .content-section h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .values-grid {
    grid-template-columns: 1fr;
  }
}
</style>
