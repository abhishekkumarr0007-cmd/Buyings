package com.abhishek.ecom_proj.repository;

import com.abhishek.ecom_proj.model.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository
        extends JpaRepository<ContactMessage, Long> {

}