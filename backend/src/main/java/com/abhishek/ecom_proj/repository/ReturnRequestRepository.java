package com.abhishek.ecom_proj.repository;

import com.abhishek.ecom_proj.model.Order;
import com.abhishek.ecom_proj.model.ReturnRequest;
import com.abhishek.ecom_proj.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository
        extends JpaRepository<ReturnRequest, Long> {

    Optional<ReturnRequest> findByOrder(Order order);

    List<ReturnRequest> findByUserOrderByCreatedAtDesc(User user);

    List<ReturnRequest> findAllByOrderByCreatedAtDesc();
}