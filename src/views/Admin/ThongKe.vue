<template>
  <div class="thong-ke-container">
    <h1 class="mb-4">Thống kê tổng quan</h1>
    <div v-if="isLoading" class="text-center py-5">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <div>Đang tải dữ liệu thống kê...</div>
    </div>
    <div v-else>
      <div class="row">
        <div class="col-md-3">
          <div class="card stat-card stat-card-primary">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h5 class="card-title">Homestay</h5>
                  <h2 class="mb-0">{{ totalHomestay }}</h2>
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
                  <h2 class="mb-0">{{ totalUser }}</h2>
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
                  <h2 class="mb-0">{{ totalBookingMonth }}</h2>
                  <div class="month-nav">
                    <button class="btn-nav" @click="prevMonth">‹</button>
                    <span class="month-label">{{ monthLabel }}</span>
                    <button class="btn-nav" :disabled="selectedMonthOffset >= 0" @click="nextMonth">›</button>
                  </div>
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
                  <h2 class="mb-0">{{ (totalRevenueMonth / 1e6).toFixed(1) }}M</h2>
                  <div class="month-nav">
                    <button class="btn-nav" @click="prevMonth">‹</button>
                    <span class="month-label">{{ monthLabel }} (VNĐ)</span>
                    <button class="btn-nav" :disabled="selectedMonthOffset >= 0" @click="nextMonth">›</button>
                  </div>
                </div>
                <div class="stat-icon text-danger">💰</div>
              </div>
            </div>
          </div>
        </div>
        <!-- Tổng doanh thu tất cả -->
        <div class="col-md-3">
          <div class="card stat-card stat-card-info">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h5 class="card-title">Tổng doanh thu</h5>
                  <h2 class="mb-0">{{ (totalRevenueAll / 1e6).toFixed(1) }}M</h2>
                  <p class="text-muted">Tổng (VNĐ)</p>
                </div>
                <div class="stat-icon" style="color:#17a2b8">💵</div>
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
                      <th>Khách hàng</th>
                      <th>Homestay</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="b in recentBookings" :key="b.id">
                      <td>{{ b.tenKhachHang || b.khachHang?.tenKhachHang || 'Ẩn danh' }}</td>
                      <td>{{ b.tenHomestay || b.homestay?.tenHomestay || '---' }}</td>
                      <td>{{ b.ngayCheckIn ? new Date(b.ngayCheckIn).toLocaleDateString('vi-VN') : '' }}</td>
                      <td>{{ b.ngayCheckOut ? new Date(b.ngayCheckOut).toLocaleDateString('vi-VN') : '' }}</td>
                      <td>
                        <span class="badge" :class="{
                          'bg-success': b.trangThai === true || b.trangThai === 'Đã thanh toán',
                          'bg-warning': b.trangThai === 'Đang xử lý',
                          'bg-danger': b.trangThai === false || b.trangThai === 'Đã hủy',
                          'bg-info': b.trangThai === 'Mới đặt',
                        }">
                          {{ b.trangThai || '---' }}
                        </span>
                      </td>
                      <td>{{ formatMoney(b.tongTien || b.soTien || 0) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
import { getAllHomeStay } from '@/Service/HomeStayService'
import { getAllThongTinNguoiDung } from '@/Service/ThongTinNguoiDungService'
import { getAllDatHomes } from '@/Service/DatHomeService'
import { getAllThanhToan } from '@/Service/thanhToanService'

function formatMoney(vnd) {
  if (!vnd) return '0 VNĐ';
  return vnd.toLocaleString('vi-VN') + ' VNĐ';
}

// Helper: lấy ngày hợp lệ từ object theo các key phổ biến
function pickDate(obj, keys = []) {
  for (const k of keys) {
    if (obj && obj[k]) {
      const d = new Date(obj[k])
      if (!isNaN(d.getTime())) return d
    }
  }
  return null
}

// Helper: lấy số tiền từ object theo các key phổ biến
function pickAmount(obj, keys = ['soTien', 'tongTien', 'tongGia']) {
  for (const k of keys) {
    if (obj && obj[k] != null) return Number(obj[k]) || 0
  }
  return 0
}

// Helper: kiểm tra trạng thái thanh toán thành công theo nhiều cách đặt tên
function isPaidStatus(p) {
  const v = (p?.trangThai || '').toString().toLowerCase()
  return p?.trangThai === true || ['thanhtoan', 'thanhcong', 'da thanh toan', 'đã thanh toán', 'paid', 'success'].some(s => v.includes(s))
}

// Helper: chuẩn hóa trạng thái đặt phòng về các nhãn mong muốn
function normalizeBookingStatus(booking) {
  const raw = booking?.trangThai ?? booking?.trangThaiDatPhong ?? booking?.status
  if (raw === false) return 'Đã hủy'
  if (raw === true) return 'Đã thanh toán'
  const s = (raw || '').toString().toLowerCase()
  if (s.includes('huy')) return 'Đã hủy'
  if (s.includes('moi') || s.includes('mới')) return 'Mới đặt'
  if (s.includes('dang') || s.includes('đang') || s.includes('cho') || s.includes('xac nhan') || s.includes('xác nhận')) return 'Đang xử lý'
  if (s.includes('thanh toan') || s.includes('payment') || s.includes('paid')) return 'Đã thanh toán'
  return 'Khác'
}

export default {
  name: 'ThongKe',
  setup() {
    const revenueChart = ref(null)
    const bookingChart = ref(null)
    const totalHomestay = ref(0)
    const totalUser = ref(0)
    const totalBookingMonth = ref(0)
    const totalRevenueMonth = ref(0)
    const totalRevenueAll = ref(0)
    const revenueByMonth = ref([])
    const revenueLabels = ref([])
    const bookingStatusData = ref([])
    const bookingStatusLabels = ref([])
    const recentBookings = ref([])
    const isLoading = ref(true)

    // Thêm state cho điều hướng tháng
    const selectedMonthOffset = ref(0) // 0: tháng hiện tại, -1: tháng trước, ...
    const monthLabel = ref('Tháng này')
    const allBookingsRef = ref([])
    const paidPaysRef = ref([])

    const updateMonthlyKPIs = () => {
      const now = new Date()
      const target = new Date(now.getFullYear(), now.getMonth() + selectedMonthOffset.value, 1)
      const tMonth = target.getMonth()
      const tYear = target.getFullYear()
      monthLabel.value = selectedMonthOffset.value === 0
        ? 'Tháng này'
        : `Tháng ${tMonth + 1}/${tYear}`

      // Booking count
      totalBookingMonth.value = allBookingsRef.value.filter(b => {
        const d = pickDate(b, ['ngayDat', 'thoiGianDat', 'createdAt', 'ngayTao'])
        return d && d.getMonth() === tMonth && d.getFullYear() === tYear
      }).length

      // Revenue sum
      totalRevenueMonth.value = paidPaysRef.value
        .filter(p => {
          const d = pickDate(p, ['thoiGianThanhToan', 'ngayThanhToan', 'updatedAt', 'createdAt'])
          return d && d.getMonth() === tMonth && d.getFullYear() === tYear
        })
        .reduce((sum, p) => sum + pickAmount(p), 0)
    }

    const prevMonth = () => {
      selectedMonthOffset.value -= 1
      updateMonthlyKPIs()
    }
    const nextMonth = () => {
      if (selectedMonthOffset.value < 0) {
        selectedMonthOffset.value += 1
        updateMonthlyKPIs()
      }
    }

    onMounted(async () => {
      isLoading.value = true
      // 1. Tổng số homestay
      const homeStayRes = await getAllHomeStay()
      totalHomestay.value = Array.isArray(homeStayRes.data) ? homeStayRes.data.length : 0

      // 2. Tổng số người dùng
      const userRes = await getAllThongTinNguoiDung()
      totalUser.value = Array.isArray(userRes.data) ? userRes.data.length : 0

      // 3. Tổng số booking
      const bookingRes = await getAllDatHomes()
      const allBookings = Array.isArray(bookingRes.data) ? bookingRes.data : []
      allBookingsRef.value = allBookings

      // 4. Doanh thu (danh sách thanh toán)
      const payRes = await getAllThanhToan()
      const allPays = Array.isArray(payRes.data) ? payRes.data : []
      const paidPays = allPays.filter(p => isPaidStatus(p))
      paidPaysRef.value = paidPays
      // Tổng doanh thu tất cả
      totalRevenueAll.value = paidPays.reduce((sum, p) => sum + pickAmount(p), 0)

      // 4b. Doanh thu 6 tháng gần nhất (giữ nguyên)
      const now = new Date()
      const monthMap = {}
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        monthMap[key] = { label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`, value: 0 }
      }
      paidPays.forEach(p => {
        const d = pickDate(p, ['thoiGianThanhToan', 'ngayThanhToan', 'updatedAt', 'createdAt'])
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (d && monthMap[key]) monthMap[key].value += pickAmount(p)
      })
      revenueLabels.value = Object.values(monthMap).map(m => m.label)
      revenueByMonth.value = Object.values(monthMap).map(m => Math.round(m.value / 1e6 * 10) / 10)

      // 5. Phân bổ trạng thái booking (giữ nguyên + thêm Đã hủy)
      const statusMap = {}
      allBookings.forEach(b => {
        const key = (b.trangThai !== undefined && b.trangThai !== null) ? b.trangThai : 'Khác'
        statusMap[key] = (statusMap[key] || 0) + 1
      })
      let cancelledCount = 0
      Object.keys(statusMap).forEach(k => {
        const lower = k.toString().toLowerCase()
        if (lower.includes('huy')) {
          cancelledCount += statusMap[k]
          delete statusMap[k]
        }
      })
      cancelledCount += allBookings.filter(b => b.trangThai === false).length
      if (cancelledCount > 0) {
        statusMap['Đã hủy'] = (statusMap['Đã hủy'] || 0) + cancelledCount
      }
      bookingStatusLabels.value = Object.keys(statusMap)
      bookingStatusData.value = Object.values(statusMap)

      // 6. Đặt phòng gần đây
      recentBookings.value = allBookings
        .sort((a, b) => new Date(b.ngayDat || b.createdAt) - new Date(a.ngayDat || a.createdAt))
        .slice(0, 5)

      // 7. Render Chart.js (giữ nguyên)
      setTimeout(() => {
        if (revenueChart.value) {
          const revenueCtx = revenueChart.value.getContext('2d')
          new Chart(revenueCtx, {
            type: 'line',
            data: {
              labels: revenueLabels.value,
              datasets: [
                {
                  label: 'Doanh thu (triệu VNĐ)',
                  data: revenueByMonth.value,
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
        }
        if (bookingChart.value) {
          const bookingCtx = bookingChart.value.getContext('2d')
          new Chart(bookingCtx, {
            type: 'doughnut',
            data: {
              labels: bookingStatusLabels.value,
              datasets: [
                {
                  data: bookingStatusData.value,
                  backgroundColor: [
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(23, 162, 184, 0.7)',
                    'rgba(220, 53, 69, 0.7)',
                    'rgba(108, 117, 125, 0.7)'
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
        }
      }, 200)

      // Cập nhật KPI theo tháng được chọn (mặc định: tháng này)
      updateMonthlyKPIs()
      isLoading.value = false
    })

    return {
      revenueChart,
      bookingChart,
      totalHomestay,
      totalUser,
      totalBookingMonth,
      totalRevenueMonth,
      totalRevenueAll,
      recentBookings,
      isLoading,
      formatMoney,
      // month nav
      monthLabel,
      selectedMonthOffset,
      prevMonth,
      nextMonth
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

.stat-card-info {
  border-left-color: #17a2b8;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.btn-nav {
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  padding: 0;
  line-height: 1;
  cursor: pointer;
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.month-label {
  color: #6c757d;
  font-size: 0.875rem;
}
</style>
