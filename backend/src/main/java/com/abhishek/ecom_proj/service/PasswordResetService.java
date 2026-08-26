package com.abhishek.ecom_proj.service;

import com.abhishek.ecom_proj.model.User;
import com.abhishek.ecom_proj.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final SecureRandom secureRandom =
            new SecureRandom();

    private final Map<String, OtpData> otpStore =
            new ConcurrentHashMap<>();

    public PasswordResetService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public void sendOtp(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        /*
         * Don't reveal whether an email exists.
         */
        if (user == null) {
            return;
        }

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1000000)
        );

        LocalDateTime expiry =
                LocalDateTime.now().plusMinutes(10);

        otpStore.put(
                email,
                new OtpData(otp, expiry)
        );

        emailService.sendOtpEmail(
                email,
                otp
        );
    }

    public boolean verifyOtp(
            String email,
            String otp) {

        OtpData data =
                otpStore.get(email);

        if (data == null) {
            return false;
        }

        if (LocalDateTime.now()
                .isAfter(data.expiry)) {

            otpStore.remove(email);

            return false;
        }

        return data.otp.equals(otp);
    }

    public String resetPassword(
            String email,
            String otp,
            String newPassword,
            String confirmPassword) {

        if (!verifyOtp(email, otp)) {
            return "Invalid or expired OTP";
        }

        if (newPassword == null ||
                newPassword.length() < 6) {

            return "Password must be at least 6 characters";
        }

        if (!newPassword.equals(confirmPassword)) {
            return "Passwords do not match";
        }

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return "Unable to reset password";
        }

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        userRepository.save(user);

        otpStore.remove(email);

        return "Password reset successfully";
    }

    private static class OtpData {

        private final String otp;
        private final LocalDateTime expiry;

        private OtpData(
                String otp,
                LocalDateTime expiry) {

            this.otp = otp;
            this.expiry = expiry;
        }
    }
}