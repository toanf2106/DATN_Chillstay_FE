<template>
  <div class="admin-dashboard">
    <header class="admin-header">
      <div class="header-left">
        <h1>Chillstay Admin</h1>
      </div>
      <div class="header-right">
        <div class="admin-search">
          <input type="text" placeholder="Tìm kiếm..." />
          <button><i class="fas fa-search"></i></button>
        </div>
        <div class="admin-notifications">
          <span class="notification-badge">3</span>
          <i class="fas fa-bell"></i>
        </div>
        <div class="admin-profile">
          <img src="https://via.placeholder.com/40" alt="Admin" />
          <span>Admin</span>
        </div>
        <button class="logout-btn" @click="logout">Đăng xuất</button>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="sidebar">
        <nav class="admin-nav">
          <ul>
            <li class="active">
              <a href="#dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
            </li>
            <li>
              <a href="#users"><i class="fas fa-users"></i> Quản lý người dùng</a>
            </li>
            <li>
              <a href="#bookings"><i class="fas fa-calendar-check"></i> Quản lý đặt phòng</a>
            </li>
            <li>
              <a href="#properties"><i class="fas fa-home"></i> Quản lý chỗ nghỉ</a>
            </li>
            <li>
              <a href="#reviews"><i class="fas fa-star"></i> Đánh giá</a>
            </li>
            <li>
              <a href="#reports"><i class="fas fa-chart-bar"></i> Báo cáo</a>
            </li>
            <li>
              <a href="#settings"><i class="fas fa-cog"></i> Cài đặt</a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="main-content">
        <div class="page-header">
          <h2>Dashboard</h2>
          <div class="date-filter">
            <label>Thời gian:</label>
            <select>
              <option>Hôm nay</option>
              <option>7 ngày qua</option>
              <option selected>30 ngày qua</option>
              <option>Năm nay</option>
            </select>
          </div>
        </div>

        <div class="dashboard-summary">
          <div class="stat-card">
            <h3>Tổng người dùng</h3>
            <p class="stat-number">1,245</p>
            <p class="stat-change positive">+12% so với tháng trước</p>
          </div>

          <div class="stat-card">
            <h3>Đặt phòng mới</h3>
            <p class="stat-number">87</p>
            <p class="stat-change positive">+5% so với tháng trước</p>
          </div>

          <div class="stat-card">
            <h3>Doanh thu</h3>
            <p class="stat-number">45.2M VND</p>
            <p class="stat-change positive">+8% so với tháng trước</p>
          </div>

          <div class="stat-card">
            <h3>Đánh giá mới</h3>
            <p class="stat-number">32</p>
            <p class="stat-change negative">-3% so với tháng trước</p>
          </div>
        </div>

        <div class="dashboard-row">
          <div class="recent-activity">
            <div class="card-header">
              <h2>Hoạt động gần đây</h2>
              <button class="view-all-btn">Xem tất cả</button>
            </div>
            <table class="activity-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Hoạt động</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nguyễn Văn A</td>
                  <td>Đặt phòng mới</td>
                  <td>15 phút trước</td>
                  <td><span class="status-badge success">Thành công</span></td>
                </tr>
                <tr>
                  <td>Trần Thị B</td>
                  <td>Đánh giá mới</td>
                  <td>1 giờ trước</td>
                  <td><span class="status-badge success">Đã đăng</span></td>
                </tr>
                <tr>
                  <td>Lê Văn C</td>
                  <td>Hủy đặt phòng</td>
                  <td>3 giờ trước</td>
                  <td><span class="status-badge warning">Đang xử lý</span></td>
                </tr>
                <tr>
                  <td>Phạm Thị D</td>
                  <td>Đăng ký mới</td>
                  <td>5 giờ trước</td>
                  <td><span class="status-badge success">Đã xác nhận</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  methods: {
    logout() {
      // Xóa trạng thái đăng nhập
      localStorage.removeItem('isAdmin')

      // Thông báo đăng xuất thành công
      alert('Đăng xuất thành công!')

      // Chuyển hướng về trang chủ
      window.location.href = '/'
    },
  },
  mounted() {
    // Thêm Font Awesome
    if (!document.getElementById('font-awesome')) {
      const link = document.createElement('link')
      link.id = 'font-awesome'
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
      document.head.appendChild(link)
    }
  },
}
</script>

<style scoped>
.admin-dashboard {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background-color: #206243;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.header-right {
  gap: 20px;
}

.admin-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.admin-search {
  display: flex;
  align-items: center;
}

.admin-search input {
  padding: 8px 12px;
  border: none;
  border-radius: 4px 0 0 4px;
  width: 200px;
}

.admin-search button {
  background: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.admin-notifications {
  position: relative;
  cursor: pointer;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.admin-profile img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

.logout-btn {
  background-color: transparent;
  border: 2px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: white;
  color: #206243;
}

.dashboard-content {
  display: flex;
  flex: 1;
  height: calc(100vh - 70px);
}

.sidebar {
  width: 250px;
  background-color: #f5f5f5;
  padding: 2rem 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  height: 100%;
  overflow-y: auto;
  position: sticky;
  top: 70px;
}

.admin-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-nav li {
  padding: 0.8rem 1.5rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.admin-nav li.active {
  background-color: #e0f2e9;
  border-left: 4px solid #206243;
}

.admin-nav li:hover {
  background-color: #e0f2e9;
}

.admin-nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-nav i {
  width: 20px;
  text-align: center;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #f9f9f9;
  overflow-y: auto;
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #333;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-filter label {
  font-weight: 500;
}

.date-filter select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin-top: 0;
  color: #555;
  font-size: 1rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: #206243;
}

.stat-change {
  margin: 0;
  font-size: 0.9rem;
}

.positive {
  color: #28a745;
}

.negative {
  color: #dc3545;
}

.dashboard-row {
  margin-bottom: 2rem;
}

.recent-activity {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.view-all-btn {
  background-color: transparent;
  border: 1px solid #206243;
  color: #206243;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background-color: #206243;
  color: white;
}

.activity-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.activity-table th,
.activity-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.activity-table th {
  font-weight: 600;
  color: #555;
}

.activity-table tbody tr:hover {
  background-color: #f5f5f5;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.success {
  background-color: #e6f7e6;
  color: #28a745;
}

.status-badge.warning {
  background-color: #fff8e6;
  color: #ffa502;
}

.status-badge.danger {
  background-color: #ffe6e6;
  color: #dc3545;
}
</style>
