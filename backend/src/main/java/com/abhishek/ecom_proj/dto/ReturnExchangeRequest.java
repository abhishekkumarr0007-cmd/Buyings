package com.abhishek.ecom_proj.dto;

import com.abhishek.ecom_proj.model.ReturnType;

import java.util.List;

public class ReturnExchangeRequest {

    private ReturnType type;

    private String reason;

    private List<ReturnExchangeItemRequest> items;

    public ReturnExchangeRequest() {
    }

    public ReturnType getType() {
        return type;
    }

    public void setType(ReturnType type) {
        this.type = type;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public List<ReturnExchangeItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ReturnExchangeItemRequest> items) {
        this.items = items;
    }
}