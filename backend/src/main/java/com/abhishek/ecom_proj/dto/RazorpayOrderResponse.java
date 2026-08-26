package com.abhishek.ecom_proj.dto;

import java.math.BigDecimal;

public class RazorpayOrderResponse {

    private Long orderId;

    private String razorpayOrderId;

    private String keyId;

    private BigDecimal amount;

    private String currency;

    public RazorpayOrderResponse() {
    }

    public RazorpayOrderResponse(
            Long orderId,
            String razorpayOrderId,
            String keyId,
            BigDecimal amount,
            String currency) {

        this.orderId = orderId;
        this.razorpayOrderId = razorpayOrderId;
        this.keyId = keyId;
        this.amount = amount;
        this.currency = currency;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public String getKeyId() {
        return keyId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }
}