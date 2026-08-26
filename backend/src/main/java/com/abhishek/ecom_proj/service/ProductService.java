package com.abhishek.ecom_proj.service;

import com.abhishek.ecom_proj.model.Product;
import com.abhishek.ecom_proj.repository.ProductImageRepository;
import com.abhishek.ecom_proj.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.abhishek.ecom_proj.model.ProductImage;
import com.abhishek.ecom_proj.repository.OrderItemRepository;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repo;

    @Autowired
    private OrderItemRepository orderItemRepo;

    // Get all products
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    // Get product by ID
    public Product getProductById(int id) {
        return repo.findById(id).orElse(null);
    }

    // Add product with image
    public Product addProduct(
            Product product,
            MultipartFile[] imageFiles) throws IOException {

        // Keep first image in old fields for compatibility
        if (imageFiles != null && imageFiles.length > 0) {

            MultipartFile firstImage = imageFiles[0];

            if (!firstImage.isEmpty()) {

                product.setImageName(
                        firstImage.getOriginalFilename());

                product.setImageType(
                        firstImage.getContentType());

                product.setImageData(
                        firstImage.getBytes());
            }
        }

        // Save product first
        Product savedProduct = repo.save(product);

        // Save all additional images
        if (imageFiles != null) {

            for (MultipartFile file : imageFiles) {

                if (file == null || file.isEmpty()) {
                    continue;
                }

                ProductImage productImage = new ProductImage();

                productImage.setImageName(
                        file.getOriginalFilename());

                productImage.setImageType(
                        file.getContentType());

                productImage.setImageData(
                        file.getBytes());

                productImage.setProduct(savedProduct);

                savedProduct.getImages().add(productImage);
            }
        }

        return repo.save(savedProduct);
    }

    // Update product with multiple images
    public Product updateProduct(
            int id,
            Product product,
            MultipartFile[] imageFiles) throws IOException {

        Product existingProduct = repo.findById(id).orElse(null);

        if (existingProduct == null) {
            return null;
        }

        // ================================
        // UPDATE PRODUCT DETAILS
        // ================================

        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setReleaseDate(product.getReleaseDate());
        existingProduct.setProductAvailable(
                product.isProductAvailable());
        existingProduct.setStockQuantity(
                product.getStockQuantity());

        // ================================
        // UPDATE IMAGES
        // ================================

        if (imageFiles != null && imageFiles.length > 0) {

            // Remove old additional images
            existingProduct.getImages().clear();

            // First image remains in old Product fields
            MultipartFile firstImage = imageFiles[0];

            if (firstImage != null && !firstImage.isEmpty()) {

                existingProduct.setImageName(
                        firstImage.getOriginalFilename());

                existingProduct.setImageType(
                        firstImage.getContentType());

                existingProduct.setImageData(
                        firstImage.getBytes());
            }

            // Save ALL selected images
            for (MultipartFile file : imageFiles) {

                if (file == null || file.isEmpty()) {
                    continue;
                }

                ProductImage productImage = new ProductImage();

                productImage.setImageName(
                        file.getOriginalFilename());

                productImage.setImageType(
                        file.getContentType());

                productImage.setImageData(
                        file.getBytes());

                productImage.setProduct(existingProduct);

                existingProduct.getImages().add(productImage);
            }
        }

        return repo.save(existingProduct);
    }

    // Search products
    public List<Product> searchProducts(String keyword) {
        return repo.searchProducts(keyword);
    }

    // Delete product
    public String deleteProduct(int id) {

        Product product = repo.findById(id).orElse(null);

        if (product == null) {
            return "NOT_FOUND";
        }

        // Check whether this product has ever been included
        // in an existing customer order.
        boolean hasOrders = orderItemRepo.existsByProductId(id);

        if (hasOrders) {

            // Keep the product because old orders still
            // reference it. Simply make it unavailable.
            product.setProductAvailable(false);

            repo.save(product);

            return "DEACTIVATED";
        }

        // Product has never been ordered.
        // It is safe to permanently delete it.
        repo.delete(product);

        return "DELETED";
    }
}