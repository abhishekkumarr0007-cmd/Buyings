package com.abhishek.ecom_proj.controller;

import com.abhishek.ecom_proj.model.CustomerAddress;
import com.abhishek.ecom_proj.model.User;
import com.abhishek.ecom_proj.repository.CustomerAddressRepository;
import com.abhishek.ecom_proj.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/address")
@CrossOrigin
public class CustomerAddressController {

    private final CustomerAddressRepository addressRepository;
    private final UserRepository userRepository;

    public CustomerAddressController(
            CustomerAddressRepository addressRepository,
            UserRepository userRepository) {

        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET SAVED ADDRESS
    // =========================================================

    @GetMapping
    public CustomerAddress getSavedAddress(
            Authentication authentication) {

        checkAuthentication(authentication);

        User user = getAuthenticatedUser(authentication);

        return addressRepository
                .findByUser(user)
                .orElse(null);
    }

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    private void checkAuthentication(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }
    }

    // =========================================================
    // GET USER
    // =========================================================

    private User getAuthenticatedUser(
            Authentication authentication) {

        String email = authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found: " + email
                        )
                );
    }
}