package com.abhishek.ecom_proj.dto;

import java.time.LocalDateTime;

public record ReturnRequestResponse(

        Long id,

        Long orderId,

        String name,

        String email,

        String type,

        String reason,

        String status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt,

        String adminNote

) {
}