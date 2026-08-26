package com.abhishek.ecom_proj.controller;

import com.abhishek.ecom_proj.model.Order;
import com.abhishek.ecom_proj.repository.OrderRepository;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@CrossOrigin
public class PaymentController {

    private final OrderRepository orderRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // ==========================================
    // CREATE RAZORPAY ORDER
    // ==========================================

    @PostMapping("/create/{orderId}")
    public ResponseEntity<?> createPaymentOrder(
            @PathVariable Long orderId,
            Authentication authentication) {

        try {

            String email = authentication.getName();

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() ->
                            new RuntimeException("Order not found"));

            // Security check
            if (!order.getUser().getEmail().equals(email)) {
                return ResponseEntity.status(403)
                        .body(Map.of(
                                "message",
                                "You cannot pay for this order"
                        ));
            }

            // Check payment method
            if (order.getPaymentMethod() == null ||
                    !order.getPaymentMethod().name().equals("UPI")) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "This order is not a UPI order"
                        ));
            }

            // Already paid
            if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Order is already paid"
                        ));
            }

            RazorpayClient razorpay =
                    new RazorpayClient(
                            razorpayKeyId,
                            razorpayKeySecret
                    );

            // Razorpay expects amount in paise
            int amountInPaise =
                    order.getTotalAmount()
                            .multiply(BigDecimal.valueOf(100))
                            .intValueExact();

            JSONObject options = new JSONObject();

            options.put(
                    "amount",
                    amountInPaise
            );

            options.put(
                    "currency",
                    "INR"
            );

            options.put(
                    "receipt",
                    "order_" + order.getId()
            );

            com.razorpay.Order razorpayOrder =
                    razorpay.orders.create(options);

            String razorpayOrderId =
                    razorpayOrder.get("id");

            // Save Razorpay order ID
            order.setRazorpayOrderId(
                    razorpayOrderId
            );

            order.setPaymentStatus(
                    "INITIATED"
            );

            orderRepository.save(order);

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "key",
                    razorpayKeyId
            );

            response.put(
                    "razorpayOrderId",
                    razorpayOrderId
            );

            response.put(
                    "amount",
                    amountInPaise
            );

            response.put(
                    "currency",
                    "INR"
            );

            response.put(
                    "orderId",
                    order.getId()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "message",
                            "Unable to create payment order",
                            "error",
                            e.getMessage()
                    ));
        }
    }

    // ==========================================
    // VERIFY RAZORPAY PAYMENT
    // ==========================================

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        try {

            String email = authentication.getName();

            String razorpayOrderId =
                    request.get("razorpay_order_id");

            String razorpayPaymentId =
                    request.get("razorpay_payment_id");

            String razorpaySignature =
                    request.get("razorpay_signature");

            if (razorpayOrderId == null ||
                    razorpayPaymentId == null ||
                    razorpaySignature == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Payment details are incomplete"
                        ));
            }

            Order order =
                    orderRepository
                            .findByRazorpayOrderId(
                                    razorpayOrderId
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Order not found"
                                    ));

            // Security check
            if (!order.getUser().getEmail().equals(email)) {

                return ResponseEntity.status(403)
                        .body(Map.of(
                                "message",
                                "You cannot verify this payment"
                        ));
            }

            JSONObject attributes =
                    new JSONObject();

            attributes.put(
                    "razorpay_order_id",
                    razorpayOrderId
            );

            attributes.put(
                    "razorpay_payment_id",
                    razorpayPaymentId
            );

            attributes.put(
                    "razorpay_signature",
                    razorpaySignature
            );

            boolean valid =
                    Utils.verifyPaymentSignature(
                            attributes,
                            razorpayKeySecret
                    );

            if (!valid) {

                order.setPaymentStatus(
                        "FAILED"
                );

                orderRepository.save(order);

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Payment verification failed"
                        ));
            }

            // ======================================
            // PAYMENT SUCCESS
            // ======================================

            order.setRazorpayPaymentId(
                    razorpayPaymentId
            );

            order.setPaymentStatus(
                    "PAID"
            );

            orderRepository.save(order);

            return ResponseEntity.ok(
                    Map.of(
                            "success",
                            true,
                            "message",
                            "Payment successful",
                            "orderId",
                            order.getId()
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "message",
                            "Payment verification error",
                            "error",
                            e.getMessage()
                    ));
        }
    }
}