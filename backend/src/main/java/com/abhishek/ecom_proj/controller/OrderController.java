package com.abhishek.ecom_proj.controller;

import com.abhishek.ecom_proj.dto.CreateOrderRequest;
import com.abhishek.ecom_proj.dto.OrderItemResponse;
import com.abhishek.ecom_proj.dto.OrderResponse;
import com.abhishek.ecom_proj.dto.RazorpayOrderResponse;
import com.abhishek.ecom_proj.dto.ReturnExchangeRequest;
import com.abhishek.ecom_proj.dto.ReturnStatusUpdateRequest;
import com.abhishek.ecom_proj.dto.VerifyPaymentRequest;

import com.abhishek.ecom_proj.model.Order;
import com.abhishek.ecom_proj.model.OrderItem;
import com.abhishek.ecom_proj.model.OrderStatus;
import com.abhishek.ecom_proj.model.PaymentMethod;
import com.abhishek.ecom_proj.model.Product;
import com.abhishek.ecom_proj.model.ReturnStatus;
import com.abhishek.ecom_proj.model.ReturnType;
import com.abhishek.ecom_proj.model.User;

import com.abhishek.ecom_proj.repository.OrderRepository;
import com.abhishek.ecom_proj.repository.ProductRepository;
import com.abhishek.ecom_proj.repository.UserRepository;

import com.abhishek.ecom_proj.model.ReturnRequest;
import com.abhishek.ecom_proj.repository.ReturnRequestRepository;

import com.abhishek.ecom_proj.service.RazorpayService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin
public class OrderController {

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final ReturnRequestRepository returnRequestRepository;
        private final RazorpayService razorpayService;

        public OrderController(
                        OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        ReturnRequestRepository returnRequestRepository,
                        RazorpayService razorpayService) {

                this.orderRepository = orderRepository;
                this.productRepository = productRepository;
                this.userRepository = userRepository;
                this.returnRequestRepository = returnRequestRepository;
                this.razorpayService = razorpayService;
        }

        // =========================================================
        // CREATE ORDER
        // =========================================================

        @PostMapping
        @Transactional
        public OrderResponse createOrder(
                        @RequestBody CreateOrderRequest request,
                        Authentication authentication) {

                System.out.println("🔥🔥 CREATE ORDER CONTROLLER REACHED 🔥🔥");
                System.out.println("Authentication: " + authentication);
                System.out.println("Authenticated: " +
                                (authentication != null && authentication.isAuthenticated()));
                System.out.println("User: " +
                                (authentication != null ? authentication.getName() : "NULL"));

                checkAuthentication(authentication);

                if (request == null) {
                        throw new RuntimeException("Invalid order request");
                }

                if (request.getItems() == null ||
                                request.getItems().isEmpty()) {

                        throw new RuntimeException("Cart is empty");
                }

                String email = authentication.getName();

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "User not found: " + email));

                // =====================================================
                // DELIVERY ADDRESS VALIDATION
                // =====================================================

                if (isBlank(request.getFullName())) {
                        throw new RuntimeException("Full name is required");
                }

                if (isBlank(request.getAddress())) {
                        throw new RuntimeException("Complete address is required");
                }

                if (isBlank(request.getMobileNumber())) {
                        throw new RuntimeException("Mobile number is required");
                }

                if (!request.getMobileNumber()
                                .trim()
                                .matches("^[6-9]\\d{9}$")) {

                        throw new RuntimeException("Invalid mobile number");
                }

                if (isBlank(request.getPincode())) {
                        throw new RuntimeException("Pincode is required");
                }

                if (!request.getPincode()
                                .trim()
                                .matches("^\\d{6}$")) {

                        throw new RuntimeException("Invalid pincode");
                }

                if (isBlank(request.getArea())) {
                        throw new RuntimeException(
                                        "Area / locality is required");
                }

                if (isBlank(request.getCity())) {
                        throw new RuntimeException("City is required");
                }

                if (isBlank(request.getState())) {
                        throw new RuntimeException("State is required");
                }

                // =====================================================
                // PAYMENT METHOD
                // =====================================================

                if (isBlank(request.getPaymentMethod())) {
                        throw new RuntimeException(
                                        "Payment method is required");
                }

                String requestedPaymentMethod = request.getPaymentMethod()
                                .trim()
                                .toUpperCase();

                if (!requestedPaymentMethod.equals("COD") &&
                                !requestedPaymentMethod.equals("UPI")) {

                        throw new RuntimeException(
                                        "Payment method must be COD or UPI");
                }

                PaymentMethod paymentMethod = PaymentMethod.valueOf(requestedPaymentMethod);

                // =====================================================
                // CREATE ORDER
                // =====================================================

                Order order = new Order();
                order.setUser(user);

                // =====================================================
                // SAVE ADDRESS SNAPSHOT
                // =====================================================

                String fullName = request.getFullName().trim();

                String address = request.getAddress().trim();

                String landmark = request.getLandmark() != null
                                ? request.getLandmark().trim()
                                : "";

                String mobileNumber = request.getMobileNumber().trim();

                String pincode = request.getPincode().trim();

                String area = request.getArea().trim();

                String city = request.getCity().trim();

                String state = request.getState().trim();

                order.setFullName(fullName);
                order.setAddress(address);
                order.setLandmark(landmark);
                order.setMobileNumber(mobileNumber);
                order.setPincode(pincode);
                order.setArea(area);
                order.setCity(city);
                order.setState(state);

                // =====================================================
                // DEFAULT ORDER VALUES
                // =====================================================

                order.setOrderDate(LocalDateTime.now());

                order.setReturnStatus(ReturnStatus.NONE);

                order.setReturnReason(null);

                order.setRefundAmount(null);

                order.setRefundInitiatedAt(null);

                order.setRefundProcessedAt(null);

                order.setPaymentMethod(paymentMethod);

                // =====================================================
                // CREATE ORDER ITEMS
                // =====================================================

                BigDecimal totalAmount = BigDecimal.ZERO;

                List<OrderItem> orderItems = new ArrayList<>();

                for (var itemRequest : request.getItems()) {

                        if (itemRequest == null) {
                                throw new RuntimeException(
                                                "Invalid order item");
                        }

                        int quantity = itemRequest.getQuantity();

                        if (quantity <= 0) {
                                throw new RuntimeException(
                                                "Quantity must be greater than zero");
                        }

                        Product product = productRepository.findById(
                                        itemRequest.getProductId())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Product not found: " +
                                                                        itemRequest.getProductId()));

                        // =================================================
                        // PRODUCT AVAILABILITY
                        // =================================================

                        if (!product.isProductAvailable()) {

                                throw new RuntimeException(
                                                product.getName() +
                                                                " is currently unavailable");
                        }

                        // =================================================
                        // STOCK VALIDATION
                        // =================================================

                        if (product.getStockQuantity() < quantity) {

                                throw new RuntimeException(
                                                "Not enough stock for " +
                                                                product.getName());
                        }

                        // =================================================
                        // PRICE
                        // =================================================

                        BigDecimal price = product.getPrice();

                        if (price == null) {

                                throw new RuntimeException(
                                                "Product price is missing for " +
                                                                product.getName());
                        }

                        // =================================================
                        // CALCULATE ITEM TOTAL
                        // =================================================

                        BigDecimal itemTotal = price.multiply(
                                        BigDecimal.valueOf(quantity));

                        totalAmount = totalAmount.add(itemTotal);

                        // =================================================
                        // REDUCE STOCK
                        // =================================================

                        product.setStockQuantity(
                                        product.getStockQuantity() - quantity);

                        if (product.getStockQuantity() == 0) {
                                product.setProductAvailable(false);
                        }

                        productRepository.save(product);

                        // =================================================
                        // CREATE ORDER ITEM
                        // =================================================

                        OrderItem orderItem = new OrderItem();

                        orderItem.setOrder(order);

                        orderItem.setProduct(product);

                        orderItem.setQuantity(quantity);

                        orderItem.setPrice(price);

                        orderItems.add(orderItem);
                }

                order.setItems(orderItems);

                order.setTotalAmount(totalAmount);

                // =====================================================
                // PAYMENT STATUS
                // =====================================================

                if (paymentMethod == PaymentMethod.COD) {

                        order.setPaymentStatus("PENDING");

                        // COD can be confirmed immediately
                        order.setStatus(OrderStatus.CONFIRMED);

                } else {

                        // UPI waits for Razorpay verification
                        order.setPaymentStatus("INITIATED");

                        order.setStatus(OrderStatus.PENDING);
                }

                // =====================================================
                // SAVE ORDER
                // =====================================================

                Order savedOrder = orderRepository.save(order);

                System.out.println(
                                "====================================");

                System.out.println("ORDER CREATED");

                System.out.println(
                                "Order ID: " + savedOrder.getId());

                System.out.println(
                                "User: " + email);

                System.out.println(
                                "Total: ₹" +
                                                savedOrder.getTotalAmount());

                System.out.println(
                                "Payment: " +
                                                savedOrder.getPaymentMethod());

                System.out.println(
                                "====================================");

                return convertToResponse(savedOrder);
        }

        // =========================================================
        // CREATE RAZORPAY ORDER
        // =========================================================

        @PostMapping("/{orderId}/razorpay")
        @Transactional
        public RazorpayOrderResponse createRazorpayOrder(
                        @PathVariable Long orderId,
                        Authentication authentication) {

                checkAuthentication(authentication);

                User user = getAuthenticatedUser(authentication);

                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Order not found"));

                checkOrderOwnership(order, user);

                if (order.getPaymentMethod() != PaymentMethod.UPI) {

                        throw new RuntimeException(
                                        "Razorpay payment is only available for UPI orders");
                }

                if ("PAID".equalsIgnoreCase(
                                order.getPaymentStatus())) {

                        throw new RuntimeException(
                                        "Order is already paid");
                }

                if (order.getStatus() != OrderStatus.PENDING) {

                        throw new RuntimeException(
                                        "Razorpay payment cannot be created for this order");
                }

                try {

                        if (order.getTotalAmount() == null ||
                                        order.getTotalAmount()
                                                        .compareTo(BigDecimal.ZERO) <= 0) {

                                throw new RuntimeException(
                                                "Invalid order amount");
                        }

                        long amountInPaise = order.getTotalAmount()
                                        .multiply(
                                                        new BigDecimal("100"))
                                        .longValueExact();

                        String receipt = "order_" + order.getId();

                        com.razorpay.Order razorpayOrder = razorpayService.createOrder(
                                        amountInPaise,
                                        receipt);

                        String razorpayOrderId = razorpayOrder.get("id");

                        order.setRazorpayOrderId(
                                        razorpayOrderId);

                        order.setPaymentStatus(
                                        "INITIATED");

                        orderRepository.save(order);

                        return new RazorpayOrderResponse(
                                        order.getId(),
                                        razorpayOrderId,
                                        razorpayService.getKeyId(),
                                        order.getTotalAmount(),
                                        "INR");

                } catch (Exception e) {

                        e.printStackTrace();

                        throw new RuntimeException(
                                        "Unable to create Razorpay order: " +
                                                        e.getMessage());
                }
        }

        // =========================================================
        // VERIFY RAZORPAY PAYMENT
        // =========================================================

        @PostMapping("/{orderId}/razorpay/verify")
        @Transactional
        public OrderResponse verifyRazorpayPayment(
                        @PathVariable Long orderId,
                        @RequestBody VerifyPaymentRequest request,
                        Authentication authentication) {

                checkAuthentication(authentication);

                User user = getAuthenticatedUser(authentication);

                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Order not found"));

                checkOrderOwnership(order, user);

                if (order.getPaymentMethod() != PaymentMethod.UPI) {

                        throw new RuntimeException(
                                        "Payment verification is only available for UPI orders");
                }

                if (request == null ||
                                isBlank(request.getRazorpayOrderId()) ||
                                isBlank(request.getRazorpayPaymentId()) ||
                                isBlank(request.getRazorpaySignature())) {

                        throw new RuntimeException(
                                        "Payment verification data is incomplete");
                }

                if (order.getRazorpayOrderId() == null) {

                        throw new RuntimeException(
                                        "Razorpay order was not created");
                }

                if (!order.getRazorpayOrderId()
                                .equals(request.getRazorpayOrderId())) {

                        throw new RuntimeException(
                                        "Razorpay order ID mismatch");
                }

                boolean valid = razorpayService.verifyPaymentSignature(
                                order.getRazorpayOrderId(),
                                request.getRazorpayPaymentId(),
                                request.getRazorpaySignature());

                if (!valid) {

                        throw new RuntimeException(
                                        "Payment verification failed");
                }

                // =====================================================
                // PAYMENT SUCCESS
                // =====================================================

                order.setRazorpayPaymentId(
                                request.getRazorpayPaymentId());

                order.setPaymentStatus("PAID");

                order.setStatus(OrderStatus.CONFIRMED);

                Order savedOrder = orderRepository.save(order);

                return convertToResponse(savedOrder);
        }

        // =========================================================
        // MY ORDERS
        // =========================================================

        @GetMapping("/my-orders")
        @Transactional(readOnly = true)
        public List<OrderResponse> getMyOrders(
                        Authentication authentication) {

                checkAuthentication(authentication);

                User user = getAuthenticatedUser(authentication);

                List<Order> orders = orderRepository
                                .findByUserOrderByOrderDateDesc(user);

                return orders.stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        // =========================================================
        // GET SINGLE ORDER
        // =========================================================

        @GetMapping("/{orderId}")
        @Transactional(readOnly = true)
        public OrderResponse getOrderById(
                        @PathVariable Long orderId,
                        Authentication authentication) {

                checkAuthentication(authentication);

                User user = getAuthenticatedUser(authentication);

                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Order not found"));

                checkOrderOwnership(order, user);

                return convertToResponse(order);
        }

        // =========================================================
        // ADMIN - UPDATE RETURN / EXCHANGE STATUS
        // =========================================================

        @PutMapping("/{orderId}/return-exchange/status")
        @Transactional
        public OrderResponse updateReturnExchangeStatus(
                        @PathVariable Long orderId,
                        @RequestBody ReturnStatusUpdateRequest request,
                        Authentication authentication) {

                checkAuthentication(authentication);

                // =====================================================
                // CHECK ADMIN
                // =====================================================

                User admin = getAuthenticatedUser(authentication);

                if (admin.getRole() == null ||
                                !"ADMIN".equalsIgnoreCase(
                                                admin.getRole().toString())) {

                        throw new RuntimeException(
                                        "Access denied. Admin privileges required");
                }

                // =====================================================
                // VALIDATE REQUEST
                // =====================================================

                if (request == null ||
                                request.getStatus() == null) {

                        throw new RuntimeException(
                                        "Return status is required");
                }

                // =====================================================
                // FIND ORDER
                // =====================================================

                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Order not found"));

                // =====================================================
                // CURRENT + NEW STATUS
                // =====================================================

                ReturnStatus currentStatus = order.getReturnStatus();

                ReturnStatus newStatus = request.getStatus();

                if (currentStatus == null ||
                                currentStatus == ReturnStatus.NONE) {

                        throw new RuntimeException(
                                        "This order does not have a return or exchange request");
                }

                // =====================================================
                // RETURN REQUESTED
                // =====================================================

                if (currentStatus == ReturnStatus.RETURN_REQUESTED) {

                        if (newStatus != ReturnStatus.RETURN_APPROVED &&
                                        newStatus != ReturnStatus.RETURN_REJECTED) {

                                throw new RuntimeException(
                                                "A return request can only be approved or rejected");
                        }
                }

                // =====================================================
                // EXCHANGE REQUESTED
                // =====================================================

                else if (currentStatus == ReturnStatus.EXCHANGE_REQUESTED) {

                        if (newStatus != ReturnStatus.EXCHANGE_APPROVED &&
                                        newStatus != ReturnStatus.EXCHANGE_REJECTED) {

                                throw new RuntimeException(
                                                "An exchange request can only be approved or rejected");
                        }
                }

                // =====================================================
                // RETURN APPROVED
                // =====================================================

                else if (currentStatus == ReturnStatus.RETURN_APPROVED) {

                        if (newStatus != ReturnStatus.RETURN_PICKUP_SCHEDULED &&
                                        newStatus != ReturnStatus.RETURN_RECEIVED) {

                                throw new RuntimeException(
                                                "Return can only move to pickup scheduled or received");
                        }
                }

                // =====================================================
                // RETURN PICKUP SCHEDULED
                // =====================================================

                else if (currentStatus == ReturnStatus.RETURN_PICKUP_SCHEDULED) {

                        if (newStatus != ReturnStatus.RETURN_RECEIVED) {

                                throw new RuntimeException(
                                                "Return pickup must be completed before receiving the return");
                        }
                }

                // =====================================================
                // RETURN RECEIVED
                // =====================================================

                else if (currentStatus == ReturnStatus.RETURN_RECEIVED) {

                        if (newStatus != ReturnStatus.REFUND_INITIATED) {

                                throw new RuntimeException(
                                                "Return must move to refund initiated");
                        }
                }

                // =====================================================
                // REFUND INITIATED
                // =====================================================

                else if (currentStatus == ReturnStatus.REFUND_INITIATED) {

                        if (newStatus != ReturnStatus.REFUNDED) {

                                throw new RuntimeException(
                                                "Refund must move to refunded");
                        }
                }

                // =====================================================
                // EXCHANGE APPROVED
                // =====================================================

                else if (currentStatus == ReturnStatus.EXCHANGE_APPROVED) {

                        if (newStatus != ReturnStatus.EXCHANGE_RECEIVED) {

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
                // UPDATE ORDER STATUS
                // =====================================================

                // =====================================================
                // FIND RETURN / EXCHANGE REQUEST
                // =====================================================

                ReturnRequest returnRequest = returnRequestRepository
                                .findByOrder(order)
                                .orElseThrow(() -> new RuntimeException(
                                                "Return/exchange request not found for this order"));

                // =====================================================
                // UPDATE ORDER STATUS
                // =====================================================

                order.setReturnStatus(newStatus);
                order.setReturnReason(returnRequest.getReason());

                // =====================================================
                // UPDATE RETURN REQUEST STATUS
                // =====================================================

                returnRequest.setStatus(newStatus);

                returnRequestRepository.save(returnRequest);

                // =====================================================
                // RETURN APPROVED
                // =====================================================

                if (newStatus == ReturnStatus.RETURN_APPROVED) {

                        // No refund yet.
                        // Refund happens only after
                        // returned product is received.
                }

                // =====================================================
                // RETURN REJECTED
                // =====================================================

                if (newStatus == ReturnStatus.RETURN_REJECTED) {

                        // Request is finished.
                        // No refund is generated.
                }

                // =====================================================
                // EXCHANGE APPROVED
                // =====================================================

                if (newStatus == ReturnStatus.EXCHANGE_APPROVED) {

                        // Admin can now arrange replacement.
                }

                // =====================================================
                // EXCHANGE REJECTED
                // =====================================================

                if (newStatus == ReturnStatus.EXCHANGE_REJECTED) {

                        // Exchange request is completed.
                }

                // =====================================================
                // REFUND INITIATED
                // =====================================================

                if (newStatus == ReturnStatus.REFUND_INITIATED) {

                        if (order.getTotalAmount() == null ||
                                        order.getTotalAmount()
                                                        .compareTo(BigDecimal.ZERO) <= 0) {

                                throw new RuntimeException(
                                                "Invalid refund amount");
                        }

                        // Current system operates at order level.
                        // Therefore the entire order amount is refunded.

                        order.setRefundAmount(
                                        order.getTotalAmount());

                        order.setRefundInitiatedAt(
                                        LocalDateTime.now());
                }

                // =====================================================
                // REFUNDED
                // =====================================================

                if (newStatus == ReturnStatus.REFUNDED) {

                        if (order.getRefundAmount() == null ||
                                        order.getRefundAmount()
                                                        .compareTo(BigDecimal.ZERO) <= 0) {

                                throw new RuntimeException(
                                                "Refund amount is not available");
                        }

                        order.setRefundProcessedAt(
                                        LocalDateTime.now());

                        order.setPaymentStatus("REFUNDED");
                }

                // =====================================================
                // SAVE
                // =====================================================

                Order savedOrder = orderRepository.save(order);

                return convertToResponse(savedOrder);
        }

        // =========================================================
        // CONVERT ORDER TO RESPONSE
        // =========================================================

        private OrderResponse convertToResponse(
                        Order order) {

                List<OrderItemResponse> items = new ArrayList<>();

                if (order.getItems() != null) {

                        items = order.getItems()
                                        .stream()
                                        .map(item -> new OrderItemResponse(
                                                        item.getId(),
                                                        item.getProduct().getId(),
                                                        item.getProduct().getName(),
                                                        item.getQuantity(),
                                                        item.getPrice()))
                                        .toList();
                }

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
                                                : null,

                                order.getReturnReason(),

                                order.getPaymentMethod() != null
                                                ? order.getPaymentMethod().name()
                                                : null,

                                order.getPaymentStatus(),

                                order.getRazorpayOrderId(),

                                order.getRazorpayPaymentId());
        }

        // =========================================================
        // AUTHENTICATION
        // =========================================================

        private void checkAuthentication(
                        Authentication authentication) {

                if (authentication == null ||
                                !authentication.isAuthenticated()) {

                        throw new RuntimeException(
                                        "User is not authenticated");
                }
        }

        // =========================================================
        // GET AUTHENTICATED USER
        // =========================================================

        private User getAuthenticatedUser(
                        Authentication authentication) {

                String email = authentication.getName();

                return userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "User not found: " + email));
        }

        // =========================================================
        // ORDER OWNERSHIP
        // =========================================================

        private void checkOrderOwnership(
                        Order order,
                        User user) {

                if (order.getUser() == null ||
                                user == null) {

                        throw new RuntimeException(
                                        "You cannot access this order");
                }

                /*
                 * IMPORTANT:
                 *
                 * User ID is treated as a primitive/int in your
                 * current project, so we must NOT do:
                 *
                 * order.getUser().getId() == null
                 *
                 * because int can never be null.
                 */

                if (order.getUser().getId() != user.getId()) {

                        throw new RuntimeException(
                                        "You cannot access this order");
                }
        }

        // =========================================================
        // STRING VALIDATION
        // =========================================================

        private boolean isBlank(String value) {

                return value == null ||
                                value.trim().isEmpty();
        }
}