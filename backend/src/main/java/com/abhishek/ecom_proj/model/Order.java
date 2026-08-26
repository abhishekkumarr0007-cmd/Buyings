package com.abhishek.ecom_proj.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    // =========================================================
    // ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // USER
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // =========================================================
    // DELIVERY / TRACKING
    // =========================================================

    @Column
    private String courierName;

    @Column
    private String trackingNumber;

    @Column
    private String trackingUrl;

    // =========================================================
    // RETURN / EXCHANGE
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "return_status", nullable = false)
    private ReturnStatus returnStatus = ReturnStatus.NONE;

    @Column(name = "return_reason", length = 500)
    private String returnReason;

    // =========================================================
    // REFUND
    // =========================================================

    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "refund_initiated_at")
    private LocalDateTime refundInitiatedAt;

    @Column(name = "refund_processed_at")
    private LocalDateTime refundProcessedAt;

    // =========================================================
    // DELIVERY ADDRESS
    // =========================================================

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "landmark", length = 300)
    private String landmark;

    @Column(name = "mobile_number", nullable = false, length = 10)
    private String mobileNumber;

    @Column(name = "pincode", nullable = false, length = 6)
    private String pincode;

    @Column(name = "area", nullable = false, length = 300)
    private String area;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    // =========================================================
    // ORDER AMOUNT
    // =========================================================

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    // =========================================================
    // ORDER STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    // =========================================================
    // ORDER DATE
    // =========================================================

    @Column(nullable = false)
    private LocalDateTime orderDate;

    // =========================================================
    // PAYMENT
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Column
    private String paymentStatus;

    // =========================================================
    // RAZORPAY
    // =========================================================

    @Column
    private String razorpayOrderId;

    @Column
    private String razorpayPaymentId;

    // =========================================================
    // ORDER ITEMS
    // =========================================================

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Order() {
    }

    // =========================================================
    // ID
    // =========================================================

    public Long getId() {
        return id;
    }

    // =========================================================
    // USER
    // =========================================================

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // =========================================================
    // COURIER
    // =========================================================

    public String getCourierName() {
        return courierName;
    }

    public void setCourierName(String courierName) {
        this.courierName = courierName;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getTrackingUrl() {
        return trackingUrl;
    }

    public void setTrackingUrl(String trackingUrl) {
        this.trackingUrl = trackingUrl;
    }

    // =========================================================
    // RETURN / EXCHANGE
    // =========================================================

    public ReturnStatus getReturnStatus() {
        return returnStatus;
    }

    public void setReturnStatus(ReturnStatus returnStatus) {
        this.returnStatus = returnStatus;
    }

    public String getReturnReason() {
        return returnReason;
    }

    public void setReturnReason(String returnReason) {
        this.returnReason = returnReason;
    }

    // =========================================================
    // REFUND AMOUNT
    // =========================================================

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    // =========================================================
    // REFUND INITIATED AT
    // =========================================================

    public LocalDateTime getRefundInitiatedAt() {
        return refundInitiatedAt;
    }

    public void setRefundInitiatedAt(LocalDateTime refundInitiatedAt) {
        this.refundInitiatedAt = refundInitiatedAt;
    }

    // =========================================================
    // REFUND PROCESSED AT
    // =========================================================

    public LocalDateTime getRefundProcessedAt() {
        return refundProcessedAt;
    }

    public void setRefundProcessedAt(LocalDateTime refundProcessedAt) {
        this.refundProcessedAt = refundProcessedAt;
    }

    // =========================================================
    // FULL NAME
    // =========================================================

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    // =========================================================
    // ADDRESS
    // =========================================================

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    // =========================================================
    // LANDMARK
    // =========================================================

    public String getLandmark() {
        return landmark;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    // =========================================================
    // MOBILE
    // =========================================================

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    // =========================================================
    // PINCODE
    // =========================================================

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    // =========================================================
    // AREA
    // =========================================================

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    // =========================================================
    // CITY
    // =========================================================

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    // =========================================================
    // STATE
    // =========================================================

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    // =========================================================
    // SHIPPING ADDRESS ALIAS
    // =========================================================

    public String getShippingAddress() {
        return address;
    }

    public void setShippingAddress(String shippingAddress) {
        this.address = shippingAddress;
    }

    // =========================================================
    // TOTAL AMOUNT
    // =========================================================

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    // =========================================================
    // STATUS
    // =========================================================

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    // =========================================================
    // ORDER DATE
    // =========================================================

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    // =========================================================
    // PAYMENT METHOD
    // =========================================================

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    // =========================================================
    // PAYMENT STATUS
    // =========================================================

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    // =========================================================
    // RAZORPAY ORDER ID
    // =========================================================

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    // =========================================================
    // RAZORPAY PAYMENT ID
    // =========================================================

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    // =========================================================
    // ORDER ITEMS
    // =========================================================

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
}