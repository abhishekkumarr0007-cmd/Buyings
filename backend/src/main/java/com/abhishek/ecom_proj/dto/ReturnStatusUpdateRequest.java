package com.abhishek.ecom_proj.dto;

import com.abhishek.ecom_proj.model.ReturnStatus;

public class ReturnStatusUpdateRequest {

    private ReturnStatus status;

    public ReturnStatusUpdateRequest() {
    }

    public ReturnStatus getStatus() {
        return status;
    }

    public void setStatus(ReturnStatus status) {
        this.status = status;
    }
}