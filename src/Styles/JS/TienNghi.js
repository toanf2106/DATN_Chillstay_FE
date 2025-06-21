// Các hàm xử lý hiệu ứng hoặc logic cho Tiện Nghi
export function openTienNghiModal() {
  const modal = document.getElementById('tienNghiModal');
  if (modal) {
    // Thêm class show và style để hiển thị modal (nếu muốn dùng JS thuần)
    modal.classList.add('show');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    // Tạo backdrop thủ công nếu cần
    let backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.id = 'tienNghiBackdrop';
    document.body.appendChild(backdrop);
  }
}

export function closeTienNghiModal() {
  const modal = document.getElementById('tienNghiModal');
  if (modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    // Xóa backdrop thủ công nếu có
    const backdrop = document.getElementById('tienNghiBackdrop');
    if (backdrop) backdrop.remove();
  }
}