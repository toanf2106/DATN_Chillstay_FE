package com.example.chillstay.controller;

import com.example.chillstay.service.TaiKhoanService;
import com.example.chillstay.service.ThongTinNguoiDungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/taiKhoan")
public class TaiKhoanController {

    @Autowired
    private TaiKhoanService taiKhoanService;

    @Autowired
    private ThongTinNguoiDungService thongTinNguoiDungService;

    /**
     * Xóa vĩnh viễn tài khoản (chỉ người dùng tự xóa)
     * Yêu cầu xác thực mật khẩu
     */
    @DeleteMapping("/permanent-delete/{id}")
    public ResponseEntity<?> permanentDeleteAccount(@PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        try {
            String password = (String) request.get("password");
            Boolean deleteUserInfo = (Boolean) request.getOrDefault("deleteUserInfo", true);

            if (password == null || password.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Vui lòng cung cấp mật khẩu để xác thực");
            }

            // Kiểm tra mật khẩu
            boolean passwordMatched = taiKhoanService.verifyPassword(id, password);
            if (!passwordMatched) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mật khẩu không chính xác");
            }

            // Xóa thông tin người dùng trước nếu có yêu cầu
            if (deleteUserInfo) {
                thongTinNguoiDungService.deleteByTaiKhoanId(id);
            }

            // Xóa tài khoản vĩnh viễn
            taiKhoanService.permanentDeleteAccount(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tài khoản đã được xóa vĩnh viễn");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa tài khoản: " + e.getMessage());
        }
    }

    /**
     * Kiểm tra mật khẩu
     */
    @PostMapping("/verifyPassword")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            if (username == null || password == null) {
                return ResponseEntity.badRequest().body("Tên đăng nhập và mật khẩu không được để trống");
            }

            boolean matched = taiKhoanService.verifyPasswordByUsername(username, password);

            Map<String, Object> response = new HashMap<>();
            response.put("matched", matched);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi kiểm tra mật khẩu: " + e.getMessage());
        }
    }

    /**
     * Đổi mật khẩu
     */
    @PostMapping("/changePassword")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");

            if (username == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Tên đăng nhập và mật khẩu mới không được để trống");
            }

            // Nếu có oldPassword, kiểm tra xem có đúng không
            if (oldPassword != null && !oldPassword.isEmpty()) {
                boolean passwordMatched = taiKhoanService.verifyPasswordByUsername(username, oldPassword);
                if (!passwordMatched) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Mật khẩu hiện tại không chính xác");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
            }

            // Đổi mật khẩu
            taiKhoanService.changePasswordByUsername(username, newPassword);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đổi mật khẩu thành công");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi đổi mật khẩu: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}