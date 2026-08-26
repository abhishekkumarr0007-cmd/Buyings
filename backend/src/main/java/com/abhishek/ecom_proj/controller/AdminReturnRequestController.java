package com.abhishek.ecom_proj.controller;

import com.abhishek.ecom_proj.model.ReturnRequest;
import com.abhishek.ecom_proj.model.ReturnStatus;
import com.abhishek.ecom_proj.repository.ReturnRequestRepository;
import com.abhishek.ecom_proj.dto.ReturnRequestResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminReturnRequestController {

    private final ReturnRequestRepository returnRequestRepository;

    public AdminReturnRequestController(
            ReturnRequestRepository returnRequestRepository) {

        this.returnRequestRepository = returnRequestRepository;
    }

    // =========================================================
    // GET ALL RETURN / EXCHANGE REQUESTS
    // =========================================================

    @GetMapping("/return-exchange")
    public ResponseEntity<?> getAllReturnRequests() {

        List<ReturnRequest> requests =
                returnRequestRepository.findAllByOrderByCreatedAtDesc();

        return ResponseEntity.ok(
                requests.stream()
                        .map(this::convertToResponse)
                        .toList()
        );
    }

    // =========================================================
    // UPDATE ADMIN NOTE
    // =========================================================

    @PutMapping("/return-exchange/{id}/note")
    public ResponseEntity<?> updateAdminNote(
            @PathVariable Long id,
            @RequestBody AdminNoteRequest body) {

        ReturnRequest request =
                returnRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Return request not found"
                                )
                        );

        request.setAdminNote(body.getAdminNote());

        ReturnRequest saved =
                returnRequestRepository.save(request);

        return ResponseEntity.ok(
                convertToResponse(saved)
        );
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    private ReturnRequestResponse convertToResponse(
            ReturnRequest request) {

        return new ReturnRequestResponse(
                request.getId(),
                request.getOrder().getId(),
                request.getUser().getName(),
                request.getUser().getEmail(),
                request.getType().name(),
                request.getReason(),
                request.getStatus().name(),
                request.getCreatedAt(),
                request.getUpdatedAt(),
                request.getAdminNote()
        );
    }

    // =========================================================
    // ADMIN NOTE DTO
    // =========================================================

    public static class AdminNoteRequest {

        private String adminNote;

        public String getAdminNote() {
            return adminNote;
        }

        public void setAdminNote(String adminNote) {
            this.adminNote = adminNote;
        }
    }
}