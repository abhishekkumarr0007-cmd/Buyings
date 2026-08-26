package com.abhishek.ecom_proj.repository;

import com.abhishek.ecom_proj.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {

    List<ProductImage> findByProductId(int productId);
}