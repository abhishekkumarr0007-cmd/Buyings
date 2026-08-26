package com.abhishek.ecom_proj.service;

import com.abhishek.ecom_proj.dto.CreateOrderRequest;
import com.abhishek.ecom_proj.model.Order;
import com.abhishek.ecom_proj.model.OrderStatus;
import com.abhishek.ecom_proj.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // =========================================================
    // CREATE ORDER
    // =========================================================

    public Order createOrder(CreateOrderRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Order request cannot be null.");
        }

        Order order = new Order();

        return orderRepository.save(order);
    }

    // =========================================================
    // GET ALL ORDERS
    // NEWEST FIRST
    // =========================================================

    public List<Order> getAllOrders() {

        return orderRepository
                .findAllByOrderByOrderDateDesc();
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    public Order getOrderById(Long id) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "Invalid order ID.");
        }

        return orderRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Order not found with id: " + id));
    }

    // =========================================================
    // GET ORDERS BY USER
    // NEWEST FIRST
    // =========================================================

    public List<Order> getOrdersByUser(Long userId) {

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException(
                    "Invalid user ID.");
        }

        return orderRepository
                .findByUser_IdOrderByOrderDateDesc(userId);
    }

    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    public Order updateOrderStatus(Long id, String status) {

        Order order = getOrderById(id);

        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Order status is required");
        }

        try {

            OrderStatus newStatus = OrderStatus.valueOf(
                    status.trim().toUpperCase());

            order.setStatus(newStatus);

        } catch (IllegalArgumentException e) {

            throw new IllegalArgumentException(
                    "Invalid order status: " + status);
        }

        return orderRepository.save(order);
    }
    // =========================================================
    // DELETE ORDER
    // =========================================================

    public void deleteOrder(Long id) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "Invalid order ID.");
        }

        if (!orderRepository.existsById(id)) {
            throw new RuntimeException(
                    "Order not found with id: " + id);
        }

        orderRepository.deleteById(id);
    }
}