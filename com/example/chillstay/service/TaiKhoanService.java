package org.example.datn_chillstay_2025.Service;

import java.util.List;
import org.example.datn_chillstay_2025.Dto.AccountInfoResponse;
import org.example.datn_chillstay_2025.Dto.TaiKhoanDto;
import org.example.datn_chillstay_2025.Entity.TaiKhoan;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface TaiKhoanService {
    TaiKhoan authenticate(String username, String password);

    TaiKhoan getTaiKhoanByUsername(String username);

    // New methods
    AccountInfoResponse getAccountInfo(String username);

    AccountInfoResponse checkAccountAndGetPermission(String username, String password);

    List<TaiKhoanDto> getAllTaiKhoan();

    void restore(Integer id);

    void deleteTK(Integer id);

    TaiKhoanDto getTaiKhoanById(Integer id);

    TaiKhoanDto addTaiKhoan(TaiKhoanDto taiKhoanDto);

    TaiKhoanDto updateTaiKhoan(Integer id, TaiKhoanDto taiKhoanDto);

    List<TaiKhoanDto> searchTaiKhoan(String query);

    // Phương thức mới để upload ảnh đại diện
    String uploadAvatar(MultipartFile file);

    // Phương thức cập nhật ảnh đại diện cho tài khoản
    TaiKhoanDto updateAvatar(Integer id, MultipartFile file);

    /**
     * Kiểm tra mật khẩu của tài khoản
     * 
     * @param username Tên đăng nhập
     * @param password Mật khẩu cần kiểm tra
     * @return true nếu mật khẩu chính xác, false nếu không
     */
    boolean verifyPassword(String username, String password);

    /**
     * Xóa vĩnh viễn tài khoản
     * 
     * @param id ID của tài khoản
     */
    void permanentDeleteAccount(Integer id);
}