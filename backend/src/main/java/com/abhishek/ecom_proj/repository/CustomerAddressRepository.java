package com.abhishek.ecom_proj.repository;

import com.abhishek.ecom_proj.model.CustomerAddress;
import com.abhishek.ecom_proj.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerAddressRepository
        extends JpaRepository<CustomerAddress, Long> {

    Optional<CustomerAddress> findByUser(User user);
}