package com.abhishek.ecom_proj.dto;

public class ReturnExchangeItemRequest {

    private Long orderItemId;

    private int quantity;

    public ReturnExchangeItemRequest() {
    }

    public Long getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(Long orderItemId) {
        this.orderItemId = orderItemId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}