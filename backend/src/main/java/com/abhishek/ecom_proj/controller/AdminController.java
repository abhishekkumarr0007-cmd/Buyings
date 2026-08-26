package com.abhishek.ecom_proj.controller;

import com.abhishek.ecom_proj.dto.AdminUserResponse;
import com.abhishek.ecom_proj.dto.OrderItemResponse;
import com.abhishek.ecom_proj.dto.OrderResponse;
import com.abhishek.ecom_proj.dto.ReturnRequestResponse;
import com.abhishek.ecom_proj.dto.UpdateOrderTrackingRequest;
import com.abhishek.ecom_proj.model.Order;
import com.abhishek.ecom_proj.model.OrderStatus;
import com.abhishek.ecom_proj.model.PaymentMethod;
import com.abhishek.ecom_proj.model.ReturnRequest;
import com.abhishek.ecom_proj.model.ReturnStatus;
import com.abhishek.ecom_proj.repository.OrderRepository;
import com.abhishek.ecom_proj.repository.ReturnRequestRepository;
import com.abhishek.ecom_proj.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminController {

        private final UserRepository userRepository;
        private final OrderRepository orderRepository;
        private final ReturnRequestRepository returnRequestRepository;

        public AdminController(
                        UserRepository userRepository,
                        OrderRepository orderRepository,
                        ReturnRequestRepository returnRequestRepository) {

                this.userRepository = userRepository;
                this.orderRepository = orderRepository;
                this.returnRequestRepository = returnRequestRepository;
        }

        // =========================================================
        // USERS
        // =========================================================

        @GetMapping("/users")
        public List<AdminUserResponse> getAllUsers() {

                return userRepository.findAll()
                                .stream()
                                .map(user -> new AdminUserResponse(
                                                user.getId(),
                                                user.getName(),
                                                user.getEmail(),
                                                user.getRole() != null
                                                                ? user.getRole().name()
                                                                : null))
                                .toList();
        }

        // =========================================================
        // ORDERS
        // =========================================================

        @GetMapping("/orders")
        @Transactional(readOnly = true)
        public List<OrderResponse> getAllOrders() {

                return orderRepository
                                .findAllByOrderByOrderDateDesc()
                                .stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        // =========================================================
        // SINGLE ORDER
        // =========================================================

        @GetMapping("/orders/{id}")
        @Transactional(readOnly = true)
        public OrderResponse getOrder(
                        @PathVariable Long id) {

                Order order = orderRepository
                                .findById(id)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                return convertToResponse(order);
        }

        // =========================================================
        // UPDATE ORDER STATUS
        // =========================================================

        @PutMapping("/orders/{id}/status")
        @Transactional
        public OrderResponse updateOrderStatus(
                        @PathVariable Long id,
                        @RequestParam OrderStatus status) {

                System.out.println("=================================");
                System.out.println("UPDATE ORDER STATUS");
                System.out.println("ORDER ID: " + id);
                System.out.println("NEW STATUS: " + status);
                System.out.println("=================================");

                if (status == null) {
                        throw new RuntimeException(
                                        "Order status is required");
                }

                Order order = orderRepository
                                .findById(id)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                order.setStatus(status);

                Order updatedOrder = orderRepository.save(order);

                return convertToResponse(updatedOrder);
        }

        // =========================================================
        // MARK COD PAYMENT AS RECEIVED
        // =========================================================

        @PutMapping("/orders/{orderId}/payment")
        @Transactional
        public ResponseEntity<?> markPaymentReceived(
                        @PathVariable Long orderId) {

                Order order = orderRepository
                                .findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                if (order.getPaymentMethod() == null ||
                                order.getPaymentMethod() != PaymentMethod.COD) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        "Only COD orders can be manually marked as paid");
                }

                order.setPaymentStatus("PAID");

                orderRepository.save(order);

                return ResponseEntity.ok().build();
        }

        // =========================================================
        // UPDATE ORDER TRACKING
        // =========================================================

        @PutMapping("/orders/{id}/tracking")
        @Transactional
        public OrderResponse updateOrderTracking(
                        @PathVariable Long id,
                        @RequestBody UpdateOrderTrackingRequest request) {

                Order order = orderRepository
                                .findById(id)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                if (request == null) {
                        throw new RuntimeException(
                                        "Tracking request is required");
                }

                order.setCourierName(
                                request.getCourierName());

                order.setTrackingNumber(
                                request.getTrackingNumber());

                order.setTrackingUrl(
                                request.getTrackingUrl());

                Order updatedOrder = orderRepository.save(order);

                return convertToResponse(updatedOrder);
        }

        // =========================================================
        // RETURN / EXCHANGE STATUS
        // =========================================================
        //
        // RETURN FLOW:
        //
        // RETURN_REQUESTED
        // ↓
        // RETURN_APPROVED
        // ↓
        // RETURN_PICKUP_SCHEDULED
        // ↓
        // RETURN_RECEIVED
        // ↓
        // REFUND_INITIATED
        // ↓
        // REFUNDED
        //
        // OR:
        //
        // RETURN_REQUESTED
        // ↓
        // RETURN_REJECTED
        //
        //
        // EXCHANGE FLOW:
        //
        // EXCHANGE_REQUESTED
        // ↓
        // EXCHANGE_APPROVED
        // ↓
        // EXCHANGE_RECEIVED
        //
        // OR:
        //
        // EXCHANGE_REQUESTED
        // ↓
        // EXCHANGE_REJECTED
        //
        // =========================================================

        @PutMapping("/orders/{id}/return-exchange/status")
        @Transactional
        public OrderResponse updateReturnStatus(
                        @PathVariable Long id,
                        @RequestParam ReturnStatus status) {

                // =====================================================
                // VALIDATE STATUS
                // =====================================================

                if (status == null) {
                        throw new RuntimeException("Return status is required");
                }

                // =====================================================
                // FIND ORDER
                // =====================================================

                Order order = orderRepository
                                .findById(id)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                // =====================================================
                // FIND CURRENT RETURN REQUEST
                // =====================================================

                ReturnRequest returnRequest = returnRequestRepository
                                .findByOrder(order)
                                .orElseThrow(() -> new RuntimeException(
                                                "No return/exchange request found for this order"));

                // =====================================================
                // CURRENT STATUS
                // =====================================================

                ReturnStatus currentStatus = returnRequest.getStatus();

                if (currentStatus == null) {
                        currentStatus = ReturnStatus.NONE;
                }

                // =====================================================
                // NONE NOT ALLOWED
                // =====================================================

                if (status == ReturnStatus.NONE) {
                        throw new RuntimeException(
                                        "Return status cannot be reset to NONE from admin");
                }

                // =====================================================
                // RETURN REQUESTED
                // =====================================================

                if (currentStatus == ReturnStatus.RETURN_REQUESTED) {

                        if (status != ReturnStatus.RETURN_APPROVED &&
                                        status != ReturnStatus.RETURN_REJECTED) {

                                throw new RuntimeException(
                                                "A return request can only be approved or rejected");
                        }
                }

                // =====================================================
                // EXCHANGE REQUESTED
                // =====================================================

                else if (currentStatus == ReturnStatus.EXCHANGE_REQUESTED) {

                        if (status != ReturnStatus.EXCHANGE_APPROVED &&
                                        status != ReturnStatus.EXCHANGE_REJECTED) {

                                throw new RuntimeException(
                                                "An exchange request can only be approved or rejected");
                        }
                }

                // =====================================================
                // RETURN APPROVED
                // =====================================================

                else if (currentStatus == ReturnStatus.RETURN_APPROVED) {

                        if (status != ReturnStatus.RETURN_PICKUP_SCHEDULED &&
                                        status != ReturnStatus.RETURN_RECEIVED) {

                                throw new RuntimeException(
                                                "Return can only move to pickup scheduled or received");
                        }
                }

                // =====================================================
                // RETURN PICKUP SCHEDULED
                // =====================================================

                else if (currentStatus == ReturnStatus.RETURN_PICKUP_SCHEDULED) {

                        if (status != ReturnStatus.RETURN_RECEIVED) {

                                throw new RuntimeException(
                                                "Return pickup must be completed before receiving the return");
                        }
                }

                // =====================================================
                // RETURN RECEIVED
                // =====================================================

                else if (currentStatus == ReturnStatus.RETURN_RECEIVED) {

                        if (status != ReturnStatus.REFUND_INITIATED) {

                                throw new RuntimeException(
                                                "Return must move to refund initiated");
                        }
                }

                // =====================================================
                // REFUND INITIATED
                // =====================================================

                else if (currentStatus == ReturnStatus.REFUND_INITIATED) {

                        if (status != ReturnStatus.REFUNDED) {

                                throw new RuntimeException(
                                                "Refund must move to refunded");
                        }
                }

                // =====================================================
                // EXCHANGE APPROVED
                // =====================================================

                else if (currentStatus == ReturnStatus.EXCHANGE_APPROVED) {

                        if (status != ReturnStatus.EXCHANGE_RECEIVED) {

                                throw new RuntimeException(
                                                "Exchange must move to exchange received");
                        }
                }

                // =====================================================
                // TERMINAL STATUSES
                // =====================================================

                else if (currentStatus == ReturnStatus.RETURN_REJECTED ||
                                currentStatus == ReturnStatus.EXCHANGE_REJECTED ||
                                currentStatus == ReturnStatus.REFUNDED ||
                                currentStatus == ReturnStatus.EXCHANGE_RECEIVED) {

                        throw new RuntimeException(
                                        "This return/exchange request is already completed");
                }

                // =====================================================
                // UPDATE RETURN REQUEST
                // =====================================================

                returnRequest.setStatus(status);

                // =====================================================
                // KEEP ORDER IN SYNC
                // =====================================================

                order.setReturnStatus(status);

                // =====================================================
                // KEEP RETURN REASON IN ORDER
                // =====================================================

                if (returnRequest.getReason() != null) {
                        order.setReturnReason(returnRequest.getReason());
                }

                // =====================================================
                // RETURN APPROVED
                // =====================================================

                if (status == ReturnStatus.RETURN_APPROVED) {

                        System.out.println(
                                        "Return approved for order: " +
                                                        order.getId());
                }

                // =====================================================
                // RETURN REJECTED
                // =====================================================

                if (status == ReturnStatus.RETURN_REJECTED) {

                        System.out.println(
                                        "Return rejected for order: " +
                                                        order.getId());

                        order.setRefundAmount(null);
                        order.setRefundInitiatedAt(null);
                        order.setRefundProcessedAt(null);
                }

                // =====================================================
                // EXCHANGE APPROVED
                // =====================================================

                if (status == ReturnStatus.EXCHANGE_APPROVED) {

                        System.out.println(
                                        "Exchange approved for order: " +
                                                        order.getId());
                }

                // =====================================================
                // EXCHANGE REJECTED
                // =====================================================

                if (status == ReturnStatus.EXCHANGE_REJECTED) {

                        System.out.println(
                                        "Exchange rejected for order: " +
                                                        order.getId());
                }

                // =====================================================
                // RETURN PICKUP SCHEDULED
                // =====================================================

                if (status == ReturnStatus.RETURN_PICKUP_SCHEDULED) {

                        System.out.println(
                                        "Return pickup scheduled for order: " +
                                                        order.getId());
                }

                // =====================================================
                // RETURN RECEIVED
                // =====================================================

                if (status == ReturnStatus.RETURN_RECEIVED) {

                        System.out.println(
                                        "Returned product received for order: " +
                                                        order.getId());
                }

                // =====================================================
                // REFUND INITIATED
                // =====================================================

                if (status == ReturnStatus.REFUND_INITIATED) {

                        if (order.getTotalAmount() == null ||
                                        order.getTotalAmount().compareTo(
                                                        java.math.BigDecimal.ZERO) <= 0) {

                                throw new RuntimeException(
                                                "Invalid refund amount");
                        }

                        // Current system is order-level,
                        // so refund entire order amount.

                        order.setRefundAmount(
                                        order.getTotalAmount());

                        order.setRefundInitiatedAt(
                                        LocalDateTime.now());

                        System.out.println(
                                        "Refund initiated: ₹" +
                                                        order.getRefundAmount());
                }

                // =====================================================
                // REFUNDED
                // =====================================================

                if (status == ReturnStatus.REFUNDED) {

                        if (order.getRefundAmount() == null ||
                                        order.getRefundAmount().compareTo(
                                                        java.math.BigDecimal.ZERO) <= 0) {

                                throw new RuntimeException(
                                                "Refund amount is not available");
                        }

                        order.setRefundProcessedAt(
                                        LocalDateTime.now());

                        order.setPaymentStatus("REFUNDED");

                        System.out.println(
                                        "Refund completed for order: " +
                                                        order.getId());
                }

                // =====================================================
                // EXCHANGE RECEIVED
                // =====================================================

                if (status == ReturnStatus.EXCHANGE_RECEIVED) {

                        System.out.println(
                                        "Exchange completed for order: " +
                                                        order.getId());
                }

                // =====================================================
                // SAVE BOTH
                // =====================================================

                returnRequestRepository.save(returnRequest);

                Order updatedOrder = orderRepository.save(order);

                // =====================================================
                // RESPONSE
                // =====================================================

                return convertToResponse(updatedOrder);
        }

        // =========================================================
        // ORDER → RESPONSE
        // =========================================================

        private OrderResponse convertToResponse(
                        Order order) {

                List<OrderItemResponse> items = order.getItems() == null
                                ? List.of()
                                : order.getItems()
                                                .stream()
                                                .map(item -> new OrderItemResponse(
                                                                item.getId(),
                                                                item.getProduct().getId(),
                                                                item.getProduct().getName(),
                                                                item.getQuantity(),
                                                                item.getPrice()))
                                                .toList();

                return new OrderResponse(

                                order.getId(),

                                order.getUser().getId(),

                                order.getUser().getName(),

                                order.getUser().getEmail(),

                                order.getFullName(),

                                order.getMobileNumber(),

                                order.getLandmark(),

                                order.getArea(),

                                order.getCity(),

                                order.getState(),

                                order.getPincode(),

                                order.getTotalAmount(),

                                order.getAddress(),

                                order.getStatus() != null
                                                ? order.getStatus().name()
                                                : null,

                                order.getOrderDate(),

                                items,

                                order.getCourierName(),

                                order.getTrackingNumber(),

                                order.getTrackingUrl(),

                                order.getReturnStatus() != null
                                                ? order.getReturnStatus().name()
                                                : ReturnStatus.NONE.name(),

                                order.getReturnReason(),

                                order.getPaymentMethod() != null
                                                ? order.getPaymentMethod().name()
                                                : null,

                                order.getPaymentStatus(),

                                order.getRazorpayOrderId(),

                                order.getRazorpayPaymentId());
        }
}