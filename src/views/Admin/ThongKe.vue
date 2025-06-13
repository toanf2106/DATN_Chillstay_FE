<template>
  <div class="thong-ke-container">
    <h1 class="mb-4">Thống kê tổng quan</h1>

    <div class="row">
      <div class="col-md-3">
        <div class="card stat-card stat-card-primary">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">Homestay</h5>
                <h2 class="mb-0">125</h2>
                <p class="text-muted">Tổng số homestay</p>
              </div>
              <div class="stat-icon text-primary">🏠</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card stat-card stat-card-success">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">Người dùng</h5>
                <h2 class="mb-0">1,458</h2>
                <p class="text-muted">Tổng số người dùng</p>
              </div>
              <div class="stat-icon text-success">👥</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card stat-card stat-card-warning">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">Đặt phòng</h5>
                <h2 class="mb-0">254</h2>
                <p class="text-muted">Tháng này</p>
              </div>
              <div class="stat-icon text-warning">📅</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card stat-card stat-card-danger">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">Doanh thu</h5>
                <h2 class="mb-0">120.5M</h2>
                <p class="text-muted">Tháng này (VNĐ)</p>
              </div>
              <div class="stat-icon text-danger">💰</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Biểu đồ doanh thu 6 tháng gần nhất</h5>
          </div>
          <div class="card-body">
            <canvas ref="revenueChart" height="300"></canvas>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Phân bổ đặt phòng</h5>
          </div>
          <div class="card-body">
            <canvas ref="bookingChart" height="300"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Đặt phòng gần đây</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Khách hàng</th>
                    <th>Homestay</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Trạng thái</th>
                    <th>Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#12345</td>
                    <td>Nguyễn Văn A</td>
                    <td>Sea View Villa</td>
                    <td>15/06/2023</td>
                    <td>20/06/2023</td>
                    <td>
                      <span class="badge bg-success">Đã thanh toán</span>
                    </td>
                    <td>5,500,000 VNĐ</td>
                  </tr>
                  <tr>
                    <td>#12346</td>
                    <td>Trần Thị B</td>
                    <td>Mountain Retreat</td>
                    <td>18/06/2023</td>
                    <td>22/06/2023</td>
                    <td><span class="badge bg-warning">Đang xử lý</span></td>
                    <td>4,200,000 VNĐ</td>
                  </tr>
                  <tr>
                    <td>#12347</td>
                    <td>Lê Văn C</td>
                    <td>City Center Apartment</td>
                    <td>20/06/2023</td>
                    <td>25/06/2023</td>
                    <td><span class="badge bg-danger">Đã hủy</span></td>
                    <td>3,800,000 VNĐ</td>
                  </tr>
                  <tr>
                    <td>#12348</td>
                    <td>Phạm Thị D</td>
                    <td>Lakeside Cottage</td>
                    <td>22/06/2023</td>
                    <td>24/06/2023</td>
                    <td>
                      <span class="badge bg-success">Đã thanh toán</span>
                    </td>
                    <td>2,100,000 VNĐ</td>
                  </tr>
                  <tr>
                    <td>#12349</td>
                    <td>Hoàng Văn E</td>
                    <td>Forest Cabin</td>
                    <td>25/06/2023</td>
                    <td>30/06/2023</td>
                    <td><span class="badge bg-info">Mới đặt</span></td>
                    <td>6,300,000 VNĐ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'ThongKe',
  setup() {
    const revenueChart = ref(null)
    const bookingChart = ref(null)

    onMounted(() => {
      // Biểu đồ doanh thu
      const revenueCtx = revenueChart.value.getContext('2d')
      new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
          datasets: [
            {
              label: 'Doanh thu (triệu VNĐ)',
              data: [85.2, 92.5, 98.3, 110.7, 115.2, 120.5],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      })

      // Biểu đồ đặt phòng
      const bookingCtx = bookingChart.value.getContext('2d')
      new Chart(bookingCtx, {
        type: 'doughnut',
        data: {
          labels: ['Đã thanh toán', 'Đang xử lý', 'Mới đặt', 'Đã hủy'],
          datasets: [
            {
              data: [65, 20, 10, 5],
              backgroundColor: [
                'rgba(40, 167, 69, 0.7)',
                'rgba(255, 193, 7, 0.7)',
                'rgba(23, 162, 184, 0.7)',
                'rgba(220, 53, 69, 0.7)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      })
    })

    return {
      revenueChart,
      bookingChart,
    }
  },
}
</script>

<style>
.thong-ke-container {
  padding: 0;
  width: 100%;
}

.card {
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-card {
  border-left: 4px solid;
}

.stat-icon {
  font-size: 3rem;
  opacity: 0.7;
}

.stat-card-primary {
  border-left-color: #007bff;
}

.stat-card-success {
  border-left-color: #28a745;
}

.stat-card-warning {
  border-left-color: #ffc107;
}

.stat-card-danger {
  border-left-color: #dc3545;
}
</style>
