<template>
  <div class="admin-welcome-container">
    <div class="admin-welcome-content" :class="{ show: isVisible }">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="Chillstay Logo" class="logo" />
      </div>

      <h1 class="welcome-title">
        <span class="welcome-text">Chào mừng đến với</span>
        <span class="brand-name">Chill<span class="highlight">stay</span></span>
        <span class="admin-badge">Admin Panel</span>
      </h1>

      <p class="welcome-description">
        Quản lý hệ thống Chillstay một cách hiệu quả với đầy đủ công cụ và báo cáo
      </p>

      <div class="features">
        <div
          class="feature"
          v-for="(feature, index) in features"
          :key="index"
          :style="{ animationDelay: `${index * 0.2}s` }"
        >
          <div class="feature-icon">
            <i :class="feature.icon"></i>
          </div>
          <div class="feature-info">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <div class="cta-buttons">
        <button class="btn btn-primary" @click="goToDashboard">
          <i class="fas fa-tachometer-alt"></i> Bảng điều khiển
        </button>
        <button class="btn btn-outline" @click="viewReports">
          <i class="fas fa-chart-bar"></i> Xem báo cáo
        </button>
      </div>

      <div class="quick-stats">
        <div class="stat-item" v-for="(stat, index) in quickStats" :key="index">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <div class="background-elements">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="particles" ref="particles"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminWelcomeView',
  data() {
    return {
      isVisible: false,
      features: [
        {
          icon: 'fas fa-users',
          title: 'Quản lý người dùng',
          description: 'Thêm, sửa, xóa và phân quyền người dùng trong hệ thống',
        },
        {
          icon: 'fas fa-home',
          title: 'Quản lý Homestay',
          description: 'Kiểm duyệt, quản lý tất cả các homestay trên hệ thống',
        },
        {
          icon: 'fas fa-calendar-check',
          title: 'Quản lý đặt phòng',
          description: 'Theo dõi và xử lý các đơn đặt phòng từ khách hàng',
        },
        {
          icon: 'fas fa-chart-line',
          title: 'Báo cáo & Thống kê',
          description: 'Xem báo cáo doanh thu và các số liệu quan trọng',
        },
      ],
      quickStats: [
        { value: '245', label: 'Homestay' },
        { value: '1,893', label: 'Người dùng' },
        { value: '86', label: 'Đơn hàng mới' },
        { value: '₫25.6M', label: 'Doanh thu hôm nay' },
      ],
    }
  },
  mounted() {
    // Hiển thị nội dung với hiệu ứng fade-in
    setTimeout(() => {
      this.isVisible = true
    }, 300)

    // Khởi tạo hiệu ứng particles
    this.initParticles()
  },
  methods: {
    goToDashboard() {
      this.$router.push('/admin/dashboard')
    },
    viewReports() {
      this.$router.push('/admin/reports')
    },
    initParticles() {
      // Code để khởi tạo hiệu ứng particles
      const particlesContainer = this.$refs.particles
      if (!particlesContainer) return

      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div')
        particle.classList.add('particle')

        // Random vị trí và kích thước
        const size = Math.random() * 8 + 3
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`

        // Random thời gian animation
        particle.style.animationDuration = `${Math.random() * 10 + 5}s`
        particle.style.animationDelay = `${Math.random() * 5}s`

        particlesContainer.appendChild(particle)
      }
    },
  },
}
</script>

<style scoped>
.admin-welcome-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
}

.admin-welcome-content {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  padding: 2rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 1s ease;
  text-align: center;
}

.admin-welcome-content.show {
  opacity: 1;
  transform: translateY(0);
}

.logo-container {
  margin-bottom: 1.5rem;
}

.logo {
  max-width: 150px;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

.welcome-title {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-text {
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.brand-name {
  font-size: 4.5rem;
  background: linear-gradient(to right, #ffffff, #f9d423);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.admin-badge {
  background: #f9d423;
  color: #1e3c72;
  font-size: 1rem;
  padding: 0.3rem 1rem;
  border-radius: 50px;
  margin-top: 0.5rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 4px 10px rgba(249, 212, 35, 0.3);
}

.highlight {
  color: #f9d423;
  -webkit-text-fill-color: #f9d423;
}

.welcome-description {
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  opacity: 0.9;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  opacity: 0;
  animation: fadeInUp 0.8s forwards;
}

.feature:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #f9d423;
}

.feature-info h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.feature-info p {
  font-size: 0.95rem;
  opacity: 0.8;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.btn {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn i {
  font-size: 1.1rem;
}

.btn-primary {
  background: linear-gradient(to right, #f9d423, #ff4e50);
  border: none;
  color: #fff;
  box-shadow: 0 4px 15px rgba(249, 212, 35, 0.4);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(249, 212, 35, 0.6);
}

.btn-outline {
  background: transparent;
  border: 2px solid #fff;
  color: #fff;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-3px);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #f9d423;
  margin-bottom: 0.3rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.2;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(45deg, #4e54c8, #8f94fb);
  top: -100px;
  left: -100px;
  animation: float 15s infinite alternate;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #00b4db, #0083b0);
  bottom: -50px;
  right: -50px;
  animation: float 20s infinite alternate-reverse;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #f9d423, #ff4e50);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 10s infinite;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: float-particle 10s infinite ease-in-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(30px, 30px) rotate(15deg);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.2;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.2;
  }
}

@keyframes float-particle {
  0% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-50px) translateX(20px);
  }
  100% {
    transform: translateY(0) translateX(0);
  }
}

/* Responsive styles */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 2.5rem;
  }

  .welcome-text {
    font-size: 1.4rem;
  }

  .brand-name {
    font-size: 3.2rem;
  }

  .welcome-description {
    font-size: 1rem;
  }

  .features {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .quick-stats {
    grid-template-columns: 1fr;
  }
}
</style>
