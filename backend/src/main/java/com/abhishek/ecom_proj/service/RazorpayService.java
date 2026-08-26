package com.abhishek.ecom_proj.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    // ==========================================
    // CREATE RAZORPAY ORDER
    // ==========================================

    public Order createOrder(
            long amountInPaise,
            String receipt) throws Exception {

        RazorpayClient razorpayClient =
                new RazorpayClient(keyId, keySecret);

        JSONObject orderRequest = new JSONObject();

        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receipt);
        orderRequest.put("payment_capture", 1);

        return razorpayClient.orders.create(orderRequest);
    }

    // ==========================================
    // VERIFY PAYMENT SIGNATURE
    // ==========================================

    public boolean verifyPaymentSignature(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) {

        try {

            JSONObject options = new JSONObject();

            options.put(
                    "razorpay_order_id",
                    razorpayOrderId
            );

            options.put(
                    "razorpay_payment_id",
                    razorpayPaymentId
            );

            options.put(
                    "razorpay_signature",
                    razorpaySignature
            );

            return Utils.verifyPaymentSignature(
                    options,
                    keySecret
            );

        } catch (Exception e) {

            return false;
        }
    }

    // ==========================================
    // GET KEY ID
    // ==========================================

    public String getKeyId() {
        return keyId;
    }
}