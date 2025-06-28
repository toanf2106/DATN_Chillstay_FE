/**
 * Utility để xử lý modal trong toàn ứng dụng
 * Giải quyết vấn đề tối màn hình và không tương tác được
 */

/**
 * Xóa tất cả modal-backdrop và reset trạng thái body
 */
export const cleanupModals = () => {
  // Xóa tất cả các backdrop
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

  // Xóa các class và style của body
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
};

/**
 * Vá lỗi Bootstrap modal không đóng đúng cách
 */
export const fixBootstrapModalBugs = () => {
  // Kiểm tra nếu không có modal đang mở
  if (!document.querySelector('.modal.show')) {
    cleanupModals();
  }
};

/**
 * Thêm bộ xử lý sự kiện để bắt lỗi modal
 */
export const setupModalErrorHandling = () => {
  // Thêm sự kiện click toàn cục để bắt trường hợp màn hình tối không tương tác được
  document.addEventListener('click', (e) => {
    // Nếu người dùng click vào backdrop hoặc document body và có backdrop
    if ((e.target.classList.contains('modal-backdrop') || e.target === document.body) &&
        document.querySelectorAll('.modal-backdrop').length > 0) {
      // Và không có modal nào đang hiển thị
      if (!document.querySelector('.modal.show')) {
        cleanupModals();
      }
    }
  });

  // Thêm phím tắt để thoát khỏi modal nếu gặp lỗi
  document.addEventListener('keydown', (e) => {
    // Escape key
    if (e.key === 'Escape' && document.querySelectorAll('.modal-backdrop').length > 0) {
      cleanupModals();
    }
  });
};

export default {
  cleanupModals,
  fixBootstrapModalBugs,
  setupModalErrorHandling
};
