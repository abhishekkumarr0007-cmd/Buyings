package com.abhishek.ecom_proj.repository;

import com.abhishek.ecom_proj.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    boolean existsByProductId(int productId);
}