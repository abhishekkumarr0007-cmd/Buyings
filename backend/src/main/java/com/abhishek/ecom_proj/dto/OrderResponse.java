package com.abhishek.ecom_proj.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String fullName;
    private String landmark;
    private String area;
    private String city;
    private String state;
    private String pincode;

    private String mobileNumber;

    private BigDecimal totalAmount;

    // Delivery address
    private String address;

    private String status;
    private LocalDateTime orderDate;

    private List<OrderItemResponse> items;

    private String courierName;
    private String trackingNumber;
    private String trackingUrl;

    private String returnStatus;
    private String returnReason;

    private String paymentMethod;
    private String paymentStatus;

    private String razorpayOrderId;
    private String razorpayPaymentId;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public OrderResponse() {
    }

    // =========================================================
    // FULL CONSTRUCTOR
    // =========================================================

    public OrderResponse(
            Long id,
            Long userId,
            String userName,
            String userEmail,
            String fullName,
            String mobileNumber,
            String landmark,
            String area,
            String city,
            String state,
            String pincode,

            BigDecimal totalAmount,
            String address,
            String status,
            LocalDateTime orderDate,
            List<OrderItemResponse> items,
            String courierName,
            String trackingNumber,
            String trackingUrl,
            String returnStatus,
            String returnReason,
            String paymentMethod,
            String paymentStatus,
            String razorpayOrderId,
            String razorpayPaymentId) {

        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.fullName = fullName;
        this.mobileNumber = mobileNumber;
        this.landmark = landmark;
        this.area = area;
        this.city = city;
        this.state = state;
        this.pincode = pincode;

        this.totalAmount = totalAmount;
        this.address = address;
        this.status = status;
        this.orderDate = orderDate;

        this.items = items;

        this.courierName = courierName;
        this.trackingNumber = trackingNumber;
        this.trackingUrl = trackingUrl;

        this.returnStatus = returnStatus;
        this.returnReason = returnReason;

        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;

        this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId;
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getFullName() {
        return fullName;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public String getLandmark() {
        return landmark;
    }

    public String getArea() {
        return area;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPincode() {
        return pincode;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getAddress() {
        return address;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public String getCourierName() {
        return courierName;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public String getTrackingUrl() {
        return trackingUrl;
    }

    public String getReturnStatus() {
        return returnStatus;
    }

    public String getReturnReason() {
        return returnReason;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }

    public void setCourierName(String courierName) {
        this.courierName = courierName;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public void setTrackingUrl(String trackingUrl) {
        this.trackingUrl = trackingUrl;
    }

    public void setReturnStatus(String returnStatus) {
        this.returnStatus = returnStatus;
    }

    public void setReturnReason(String returnReason) {
        this.returnReason = returnReason;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }
}