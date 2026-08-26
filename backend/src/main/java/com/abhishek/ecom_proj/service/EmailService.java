package com.abhishek.ecom_proj.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String email, String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom("support.buyings@gmail.com");
        message.setTo(email);

        message.setSubject(
                "Buyings - Password Reset OTP"
        );

        message.setText(
                "Hello,\n\n"
                + "We received a request to reset your Buyings account password.\n\n"
                + "Your OTP is:\n\n"
                + otp
                + "\n\n"
                + "This OTP is valid for 10 minutes.\n\n"
                + "If you did not request a password reset, "
                + "please ignore this email.\n\n"
                + "Regards,\n"
                + "Buyings Support"
        );

        mailSender.send(message);
    }
}