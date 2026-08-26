package com.abhishek.ecom_proj.dto;

import java.math.BigDecimal;

public class OrderItemResponse {

    private Long id;
    private int productId;
    private String productName;
    private int quantity;
    private BigDecimal price;

    public OrderItemResponse() {
    }

    public OrderItemResponse(
            Long id,
            int productId,
            String productName,
            int quantity,
            BigDecimal price) {

        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public int getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }
}