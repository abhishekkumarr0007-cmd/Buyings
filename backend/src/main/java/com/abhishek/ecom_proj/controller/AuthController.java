package com.abhishek.ecom_proj.controller;

import com.abhishek.ecom_proj.model.Role;
import com.abhishek.ecom_proj.model.User;
import com.abhishek.ecom_proj.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.abhishek.ecom_proj.dto.LoginRequest;
import com.abhishek.ecom_proj.dto.LoginResponse;
import com.abhishek.ecom_proj.service.JwtService;
import com.abhishek.ecom_proj.dto.ChangePasswordRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.abhishek.ecom_proj.dto.ForgotPasswordRequest;
import com.abhishek.ecom_proj.dto.VerifyOtpRequest;
import com.abhishek.ecom_proj.dto.ResetPasswordRequest;
import com.abhishek.ecom_proj.service.PasswordResetService;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetService passwordResetService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
            PasswordResetService passwordResetService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/signup")
    public String signup(@RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "Email already registered";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Every normal signup is USER
        user.setRole(Role.USER);

        userRepository.save(user);

        return "Signup successful";
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {

            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(token, user.getEmail(), user.getRole().name());
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body("User is not authenticated");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check current password
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            return ResponseEntity.badRequest()
                    .body("Current password is incorrect");
        }

        // Check new password
        if (request.getNewPassword() == null ||
                request.getNewPassword().length() < 6) {

            return ResponseEntity.badRequest()
                    .body("New password must be at least 6 characters");
        }

        // Check confirmation
        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            return ResponseEntity.badRequest()
                    .body("New passwords do not match");
        }

        // Prevent using the same password
        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword())) {

            return ResponseEntity.badRequest()
                    .body("New password must be different from current password");
        }

        // Encode and save new password
        user.setPassword(
                passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        passwordResetService.sendOtp(
                request.getEmail());

        return ResponseEntity.ok(
                "If the email is registered, an OTP has been sent.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        boolean valid = passwordResetService.verifyOtp(
                request.getEmail(),
                request.getOtp());

        if (!valid) {
            return ResponseEntity.badRequest()
                    .body("Invalid or expired OTP");
        }

        return ResponseEntity.ok(
                "OTP verified successfully");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        String result = passwordResetService.resetPassword(
                request.getEmail(),
                request.getOtp(),
                request.getNewPassword(),
                request.getConfirmPassword());

        if (!result.equals(
                "Password reset successfully")) {

            return ResponseEntity.badRequest()
                    .body(result);
        }

        return ResponseEntity.ok(result);
    }
}