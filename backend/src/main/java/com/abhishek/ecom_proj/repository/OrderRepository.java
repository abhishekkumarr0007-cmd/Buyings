package com.abhishek.ecom_proj.repository;

import com.abhishek.ecom_proj.model.Order;
import com.abhishek.ecom_proj.model.User;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // ==========================================
    // GET ORDERS FOR A PARTICULAR USER
    // NEWEST FIRST
    // ==========================================

    List<Order> findByUserOrderByOrderDateDesc(User user);


    // ==========================================
    // GET ORDERS BY USER ID
    // NEWEST FIRST
    // ==========================================

    List<Order> findByUser_IdOrderByOrderDateDesc(Long userId);


    // ==========================================
    // GET ALL ORDERS WITH USER, ITEMS & PRODUCTS
    // NEWEST FIRST
    // ==========================================

    @EntityGraph(attributePaths = {
        "user",
        "items",
        "items.product"
    })
    List<Order> findAllByOrderByOrderDateDesc();


    // ==========================================
    // FIND ORDER BY RAZORPAY ORDER ID
    // ==========================================

    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
}