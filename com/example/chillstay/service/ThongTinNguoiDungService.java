package org.example.datn_chillstay_2025.Service;

import org.example.datn_chillstay_2025.Dto.ThongTinNguoiDungDto;
import org.springframework.stereotype.Service;

@Service
public interface ThongTinNguoiDungService {

    /**
     * Lấy thông tin người dùng theo ID tài khoản
     * 
     * @param taiKhoanId ID của tài khoản
     * @return ThongTinNguoiDungDto chứa thông tin người dùng
     */
    ThongTinNguoiDungDto getByTaiKhoanId(Integer taiKhoanId);

    /**
     * Cập nhật thông tin người dùng
     * 
     * @param id                   ID của thông tin người dùng
     * @param thongTinNguoiDungDto Thông tin người dùng mới
     * @return ThongTinNguoiDungDto đã cập nhật
     */
    ThongTinNguoiDungDto update(Integer id, ThongTinNguoiDungDto thongTinNguoiDungDto);

    /**
     * Xóa thông tin người dùng theo ID tài khoản
     * 
     * @param taiKhoanId ID của tài khoản
     */
    void deleteByTaiKhoanId(Integer taiKhoanId);
}