package org.example.datn_chillstay_2025.Service.Impl;

import org.example.datn_chillstay_2025.Entity.TaiKhoan;
import org.example.datn_chillstay_2025.Repository.TaiKhoanRepo;
import org.example.datn_chillstay_2025.Service.TaiKhoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.Optional;

@Service
public class TaiKhoanServiceImpl implements TaiKhoanService {

    @Autowired
    private TaiKhoanRepo taiKhoanRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Các phương thức khác giữ nguyên

    @Override
    public boolean verifyPassword(String username, String password) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(username);
        if (taiKhoan == null) {
            throw new EntityNotFoundException("Không tìm thấy tài khoản với tên đăng nhập: " + username);
        }

        return passwordEncoder.matches(password, taiKhoan.getMatKhau());
    }

    @Override
    @Transactional
    public void permanentDeleteAccount(Integer id) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài khoản với ID: " + id));

        // Xóa vĩnh viễn tài khoản
        taiKhoanRepository.delete(taiKhoan);
    }
}