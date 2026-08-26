package com.abhishek.ecom_proj.controller;

import com.abhishek.ecom_proj.model.ContactMessage;
import com.abhishek.ecom_proj.model.ContactMessageCategory;
import com.abhishek.ecom_proj.model.ContactMessageStatus;
import com.abhishek.ecom_proj.repository.ContactMessageRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/contact")
public class ContactMessageController {

    private final ContactMessageRepository repository;

    public ContactMessageController(
            ContactMessageRepository repository) {

        this.repository = repository;
    }


    // =====================================================
    // USER - SEND MESSAGE
    // =====================================================

    @PostMapping
    public ResponseEntity<ContactMessage> createMessage(
            @RequestBody ContactMessage message) {

        message.setId(null);

        message.setStatus(
                ContactMessageStatus.UNREAD
        );

        message.setCreatedAt(
                LocalDateTime.now()
        );

        if (message.getCategory() == null) {

            message.setCategory(
                    ContactMessageCategory.GENERAL
            );
        }

        ContactMessage saved =
                repository.save(message);

        return ResponseEntity.ok(saved);
    }


    // =====================================================
    // ADMIN - GET ALL MESSAGES
    // =====================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {

        return ResponseEntity.ok(
                repository.findAll()
        );
    }


    // =====================================================
    // ADMIN - GET SINGLE MESSAGE
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactMessage> getMessage(
            @PathVariable Long id) {

        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }


    // =====================================================
    // ADMIN - MARK AS READ
    // =====================================================

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactMessage> markAsRead(
            @PathVariable Long id) {

        ContactMessage message =
                repository.findById(id)
                        .orElse(null);

        if (message == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        message.setStatus(
                ContactMessageStatus.READ
        );

        return ResponseEntity.ok(
                repository.save(message)
        );
    }


    // =====================================================
    // ADMIN - DELETE MESSAGE
    // =====================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMessage(
            @PathVariable Long id) {

        if (!repository.existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        repository.deleteById(id);

        return ResponseEntity.ok(
                "Message deleted successfully"
        );
    }
}