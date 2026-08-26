package com.abhishek.ecom_proj.controller;

import com.abhishek.ecom_proj.dto.ReturnExchangeRequest;
import com.abhishek.ecom_proj.dto.ReturnRequestResponse;
import com.abhishek.ecom_proj.model.Order;
import com.abhishek.ecom_proj.model.ReturnRequest;
import com.abhishek.ecom_proj.model.ReturnStatus;
import com.abhishek.ecom_proj.model.ReturnType;
import com.abhishek.ecom_proj.model.User;
import com.abhishek.ecom_proj.repository.OrderRepository;
import com.abhishek.ecom_proj.repository.ReturnRequestRepository;
import com.abhishek.ecom_proj.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin
public class ReturnRequestController {

        private final ReturnRequestRepository returnRequestRepository;
        private final OrderRepository orderRepository;
        private final UserRepository userRepository;

        public ReturnRequestController(
                        ReturnRequestRepository returnRequestRepository,
                        OrderRepository orderRepository,
                        UserRepository userRepository) {

                this.returnRequestRepository = returnRequestRepository;
                this.orderRepository = orderRepository;
                this.userRepository = userRepository;
        }

        // =========================================================
        // CUSTOMER - CREATE RETURN / EXCHANGE
        // =========================================================

        @PostMapping("/{orderId}/return-exchange")
        public ResponseEntity<?> createReturnRequest(
                        @PathVariable Long orderId,
                        @RequestBody ReturnExchangeRequest request,
                        Authentication authentication) {

                // -----------------------------------------------------
                // CHECK AUTHENTICATION
                // -----------------------------------------------------

                if (authentication == null ||
                                authentication.getName() == null) {

                        return ResponseEntity.status(401)
                                        .body("You must be logged in to request a return or exchange.");
                }

                // -----------------------------------------------------
                // FIND LOGGED-IN USER
                // -----------------------------------------------------

                User user = userRepository
                                .findByEmail(authentication.getName())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // -----------------------------------------------------
                // FIND ORDER
                // -----------------------------------------------------

                Order order = orderRepository
                                .findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                // -----------------------------------------------------
                // MAKE SURE ORDER BELONGS TO USER
                // -----------------------------------------------------

                if (order.getUser() == null ||
                                !order.getUser().getId().equals(user.getId())) {

                        return ResponseEntity.status(403)
                                        .body("You are not allowed to request a return for this order.");
                }

                // -----------------------------------------------------
                // RETURN / EXCHANGE ONLY AFTER DELIVERY
                // -----------------------------------------------------

                if (order.getStatus() == null ||
                                !"DELIVERED".equals(order.getStatus().name())) {

                        return ResponseEntity.badRequest()
                                        .body(
                                                        "Return or exchange is available only for delivered orders.");
                }

                // -----------------------------------------------------
                // VALIDATE REQUEST
                // -----------------------------------------------------

                if (request == null) {

                        return ResponseEntity.badRequest()
                                        .body("Return request data is required.");
                }

                // -----------------------------------------------------
                // VALIDATE TYPE
                // -----------------------------------------------------

                if (request.getType() == null) {

                        return ResponseEntity.badRequest()
                                        .body("Return type is required.");
                }

                // -----------------------------------------------------
                // VALIDATE REASON
                // -----------------------------------------------------

                if (request.getReason() == null ||
                                request.getReason().trim().isEmpty()) {

                        return ResponseEntity.badRequest()
                                        .body("Return reason is required.");
                }

                // -----------------------------------------------------
                // GET TYPE
                // -----------------------------------------------------

                ReturnType type = request.getType();

                // -----------------------------------------------------
                // PREVENT DUPLICATE REQUEST
                // -----------------------------------------------------

                if (returnRequestRepository
                                .findByOrder(order)
                                .isPresent()) {

                        return ResponseEntity.badRequest()
                                        .body(
                                                        "A return or exchange request already exists for this order.");
                }

                // -----------------------------------------------------
                // CREATE RETURN REQUEST
                // -----------------------------------------------------

                ReturnRequest returnRequest = new ReturnRequest();

                returnRequest.setOrder(order);
                returnRequest.setUser(user);
                returnRequest.setType(type);
                returnRequest.setReason(
                                request.getReason().trim());

                // -----------------------------------------------------
                // INITIAL STATUS
                // -----------------------------------------------------

                if (type == ReturnType.RETURN) {

                        returnRequest.setStatus(
                                        ReturnStatus.RETURN_REQUESTED);

                } else if (type == ReturnType.EXCHANGE) {

                        returnRequest.setStatus(
                                        ReturnStatus.EXCHANGE_REQUESTED);

                } else {

                        return ResponseEntity.badRequest()
                                        .body("Invalid return type. Use RETURN or EXCHANGE.");
                }

                // -----------------------------------------------------
                // SAVE
                // -----------------------------------------------------

                // -----------------------------------------------------
                // SAVE RETURN REQUEST
                // -----------------------------------------------------

                // -----------------------------------------------------
                // SAVE RETURN REQUEST
                // -----------------------------------------------------

                ReturnRequest saved = returnRequestRepository.save(returnRequest);

                // -----------------------------------------------------
                // SYNC RETURN STATUS TO ORDER
                // -----------------------------------------------------

                order.setReturnStatus(saved.getStatus());
                order.setReturnReason(saved.getReason());
                orderRepository.save(order);

                // -----------------------------------------------------
                // RESPONSE
                // -----------------------------------------------------

                ReturnRequestResponse response = new ReturnRequestResponse(
                                saved.getId(),
                                saved.getOrder().getId(),
                                saved.getUser().getName(),
                                saved.getUser().getEmail(),
                                saved.getType().name(),
                                saved.getReason(),
                                saved.getStatus().name(),
                                saved.getCreatedAt(),
                                saved.getUpdatedAt(),
                                saved.getAdminNote());

                return ResponseEntity.ok(response);
        }

        // =========================================================
        // CUSTOMER - MY RETURN REQUESTS
        // =========================================================

        @GetMapping("/my-return-exchange")
        public ResponseEntity<?> getMyReturnRequests(
                        Authentication authentication) {

                // -----------------------------------------------------
                // CHECK AUTHENTICATION
                // -----------------------------------------------------

                if (authentication == null ||
                                authentication.getName() == null) {

                        return ResponseEntity.status(401)
                                        .body("You must be logged in.");
                }

                // -----------------------------------------------------
                // FIND USER
                // -----------------------------------------------------

                User user = userRepository
                                .findByEmail(authentication.getName())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // -----------------------------------------------------
                // GET REQUESTS
                // -----------------------------------------------------

                List<ReturnRequestResponse> responses = returnRequestRepository
                                .findByUserOrderByCreatedAtDesc(user)
                                .stream()
                                .map(this::convertToResponse)
                                .toList();

                return ResponseEntity.ok(responses);
        }

        // =========================================================
        // CONVERT ENTITY → RESPONSE
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
                                request.getAdminNote());
        }
}