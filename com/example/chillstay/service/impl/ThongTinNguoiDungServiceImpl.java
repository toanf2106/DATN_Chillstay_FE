package com.example.chillstay.service.impl;

import com.example.chillstay.dto.ThongTinNguoiDungDto;
import com.example.chillstay.entity.ThongTinNguoiDung;
import com.example.chillstay.repository.ThongTinNguoiDungRepository;
import com.example.chillstay.service.ThongTinNguoiDungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;

@Service
public class ThongTinNguoiDungServiceImpl implements ThongTinNguoiDungService {

    @Autowired
    private ThongTinNguoiDungRepository thongTinNguoiDungRepository;

    @Override
    public ThongTinNguoiDungDto getByTaiKhoanId(Integer taiKhoanId) {
        ThongTinNguoiDung thongTinNguoiDung = thongTinNguoiDungRepository.findByTaiKhoanId(taiKhoanId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy thông tin người dùng với ID tài khoản: " + taiKhoanId));

        return convertToDto(thongTinNguoiDung);
    }

    @Override
    @Transactional
    public ThongTinNguoiDungDto update(Integer id, ThongTinNguoiDungDto thongTinNguoiDungDto) {
        ThongTinNguoiDung thongTinNguoiDung = thongTinNguoiDungRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin người dùng với ID: " + id));

        // Cập nhật thông tin
        updateEntityFromDto(thongTinNguoiDung, thongTinNguoiDungDto);

        // Lưu vào database
        ThongTinNguoiDung updatedEntity = thongTinNguoiDungRepository.save(thongTinNguoiDung);

        return convertToDto(updatedEntity);
    }

    @Override
    @Transactional
    public void deleteByTaiKhoanId(Integer taiKhoanId) {
        // Tìm thông tin người dùng theo ID tài khoản
        thongTinNguoiDungRepository.findByTaiKhoanId(taiKhoanId)
                .ifPresent(thongTinNguoiDung -> {
                    // Xóa thông tin người dùng
                    thongTinNguoiDungRepository.delete(thongTinNguoiDung);
                });
    }

    /**
     * Chuyển đổi entity thành DTO
     */
    private ThongTinNguoiDungDto convertToDto(ThongTinNguoiDung entity) {
        if (entity == null) {
            return null;
        }

        ThongTinNguoiDungDto dto = new ThongTinNguoiDungDto();
        dto.setId(entity.getId());
        dto.setHoTen(entity.getHoTen());
        dto.setEmail(entity.getEmail());
        dto.setSoDienThoai(entity.getSoDienThoai());
        dto.setDiaChi(entity.getDiaChi());
        dto.setGioiTinh(entity.getGioiTinh());
        dto.setNgaySinh(entity.getNgaySinh());

        if (entity.getTaiKhoan() != null) {
            dto.setTaiKhoanId(entity.getTaiKhoan().getId());
        }

        return dto;
    }

    /**
     * Cập nhật entity từ DTO
     */
    private void updateEntityFromDto(ThongTinNguoiDung entity, ThongTinNguoiDungDto dto) {
        if (dto.getHoTen() != null) {
            entity.setHoTen(dto.getHoTen());
        }

        if (dto.getEmail() != null) {
            entity.setEmail(dto.getEmail());
        }

        if (dto.getSoDienThoai() != null) {
            entity.setSoDienThoai(dto.getSoDienThoai());
        }

        if (dto.getDiaChi() != null) {
            entity.setDiaChi(dto.getDiaChi());
        }

        if (dto.getGioiTinh() != null) {
            entity.setGioiTinh(dto.getGioiTinh());
        }

        if (dto.getNgaySinh() != null) {
            entity.setNgaySinh(dto.getNgaySinh());
        }
    }
}