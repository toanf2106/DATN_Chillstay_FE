/**
 * Utility function để hiển thị hiệu ứng pháo hoa
 * Có thể sử dụng ở bất kỳ đâu trong ứng dụng
 */

// Đảm bảo thư viện canvas-confetti được tải
const loadConfetti = () => {
  return new Promise((resolve) => {
    if (window.confetti) {
      resolve(window.confetti);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
    script.onload = () => resolve(window.confetti);
    script.onerror = () => {
      console.error('Không thể tải thư viện pháo hoa');
      resolve(null); // Resolve với null nếu không thể tải
    };
    document.head.appendChild(script);
  });
};

// Helper function để tạo số ngẫu nhiên trong khoảng
const randomInRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

/**
 * Hiển thị pháo hoa với nhiều tùy chọn
 * @param {Object} options - Các tùy chọn cho hiệu ứng pháo hoa
 * @param {number} options.duration - Thời gian hiệu ứng (ms), mặc định 5000ms (5 giây)
 * @param {number} options.intensity - Cường độ (1-10), mặc định 5
 * @param {boolean} options.celebration - Kiểu mừng chiến thắng đặc biệt, mặc định false
 * @param {Array<string>} options.colors - Mảng các màu, mặc định là màu sắc cầu vồng
 * @returns {Promise<void>}
 */
export const showFireworks = async (options = {}) => {
  const confetti = await loadConfetti();
  if (!confetti) return;

  // Các tùy chọn mặc định
  const {
    duration = 5000,
    intensity = 5,
    celebration = false,
    colors = ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee']
  } = options;

  const animationEnd = Date.now() + duration;

  // Điều chỉnh cường độ (từ 1-10)
  const particleMultiplier = Math.max(1, Math.min(10, intensity)) * 5;

  // Cài đặt mặc định
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 9999,
    colors
  };

  // Hiệu ứng pháo hoa
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = particleMultiplier * (timeLeft / duration);

    // Bắn từ bên trái và phải
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });

    // Nếu là chế độ mừng chiến thắng đặc biệt, thêm hiệu ứng từ giữa
    if (celebration && Math.random() > 0.7) {
      confetti({
        ...defaults,
        particleCount: particleCount * 2,
        origin: { x: randomInRange(0.4, 0.6), y: Math.random() - 0.2 },
        gravity: 1.2,
        scalar: 1.2
      });
    }
  }, 250);
};

/**
 * Hiệu ứng pháo hoa mừng chiến thắng đặc biệt
 * Sử dụng khi hoàn thành một tác vụ quan trọng
 * @returns {Promise<void>}
 */
export const showCelebration = async () => {
  await showFireworks({
    duration: 6000,
    intensity: 8,
    celebration: true
  });
};

export default {
  showFireworks,
  showCelebration
};
