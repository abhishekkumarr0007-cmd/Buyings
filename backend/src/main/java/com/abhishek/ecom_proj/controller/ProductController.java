package com.abhishek.ecom_proj.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.abhishek.ecom_proj.model.Product;
import com.abhishek.ecom_proj.model.ProductImage;
import com.abhishek.ecom_proj.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.abhishek.ecom_proj.repository.ProductImageRepository;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class ProductController {

        @Autowired
        private ProductService service;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private ProductImageRepository imageRepo;

        // =========================================================
        // TEST
        // =========================================================

        @GetMapping("/")
        public String greet() {
                return "Hello Abhishek";
        }

        // =========================================================
        // GET ALL PRODUCTS
        // =========================================================

        @GetMapping("/products")
        public ResponseEntity<List<Product>> getAllProducts() {

                return ResponseEntity.ok(
                                service.getAllProducts());
        }

        // =========================================================
        // GET PRODUCT BY ID
        // =========================================================

        @GetMapping("/product/{id}")
        public ResponseEntity<Product> getProduct(
                        @PathVariable int id) {

                Product product = service.getProductById(id);

                if (product == null) {
                        return ResponseEntity.notFound().build();
                }

                return ResponseEntity.ok(product);
        }

        @GetMapping("/product/image/{imageId}")
        public ResponseEntity<byte[]> getProductImage(
                        @PathVariable int imageId) {

                ProductImage image = imageRepo.findById(imageId).orElse(null);

                if (image == null ||
                                image.getImageData() == null ||
                                image.getImageData().length == 0) {

                        return ResponseEntity
                                        .notFound()
                                        .build();
                }

                try {

                        MediaType mediaType = MediaType.parseMediaType(
                                        image.getImageType());

                        return ResponseEntity
                                        .ok()
                                        .contentType(mediaType)
                                        .body(image.getImageData());

                } catch (Exception e) {

                        return ResponseEntity
                                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .build();
                }
        }

        @GetMapping("/product/{productId}/images")
        public ResponseEntity<List<Integer>> getProductImageIds(
                        @PathVariable int productId) {

                Product product = service.getProductById(productId);

                if (product == null) {
                        return ResponseEntity.notFound().build();
                }

                List<Integer> imageIds = imageRepo
                                .findByProductId(productId)
                                .stream()
                                .map(ProductImage::getId)
                                .toList();

                return ResponseEntity.ok(imageIds);
        }

        // =========================================================
        // ADD PRODUCT
        // =========================================================

        @PostMapping(value = "/product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<?> addProduct(

                        @RequestPart("product") String productJson,

                        @RequestPart("imageFiles") MultipartFile[] imageFiles) {

                try {

                        Product product = objectMapper.readValue(
                                        productJson,
                                        Product.class);

                        Product savedProduct = service.addProduct(
                                        product,
                                        imageFiles);

                        return ResponseEntity
                                        .status(HttpStatus.CREATED)
                                        .body(savedProduct);

                } catch (Exception e) {

                        e.printStackTrace();

                        return ResponseEntity
                                        .status(HttpStatus.BAD_REQUEST)
                                        .body(
                                                        "Failed to add product: "
                                                                        + e.getMessage());
                }
        }
        // =========================================================
        // GET PRODUCT IMAGE
        // =========================================================

        @GetMapping("/product/{productId}/image")
        public ResponseEntity<byte[]> getImageByProductId(
                        @PathVariable int productId) {

                Product product = service.getProductById(productId);

                if (product == null) {
                        return ResponseEntity
                                        .notFound()
                                        .build();
                }

                if (product.getImageData() == null ||
                                product.getImageData().length == 0) {

                        return ResponseEntity
                                        .notFound()
                                        .build();
                }

                if (product.getImageType() == null ||
                                product.getImageType().isBlank()) {

                        return ResponseEntity
                                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .build();
                }

                try {

                        MediaType mediaType = MediaType.parseMediaType(
                                        product.getImageType());

                        return ResponseEntity
                                        .ok()
                                        .contentType(mediaType)
                                        .body(product.getImageData());

                } catch (Exception e) {

                        e.printStackTrace();

                        return ResponseEntity
                                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .build();
                }
        }

        // =========================================================
        // UPDATE PRODUCT
        // =========================================================
        //
        // imageFile is OPTIONAL.
        //
        // This means admin can:
        //
        // 1. Update product details only
        // 2. Update product details + image
        //
        // =========================================================

        // =========================================================
        // UPDATE PRODUCT - MULTIPLE IMAGES
        // =========================================================

        @PutMapping(value = "/product/{prodId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<?> updateProduct(

                        @PathVariable int prodId,

                        @RequestPart("product") String productJson,

                        @RequestPart(value = "imageFiles", required = false) MultipartFile[] imageFiles) {

                try {

                        // =============================================
                        // CHECK PRODUCT
                        // =============================================

                        Product existingProduct = service.getProductById(prodId);

                        if (existingProduct == null) {

                                return ResponseEntity
                                                .status(HttpStatus.NOT_FOUND)
                                                .body("Product not found");
                        }

                        // =============================================
                        // CONVERT JSON
                        // =============================================

                        Product product = objectMapper.readValue(
                                        productJson,
                                        Product.class);

                        product.setId(prodId);

                        // =============================================
                        // UPDATE PRODUCT
                        // =============================================

                        Product updatedProduct = service.updateProduct(
                                        prodId,
                                        product,
                                        imageFiles);

                        if (updatedProduct == null) {

                                return ResponseEntity
                                                .status(HttpStatus.NOT_FOUND)
                                                .body("Product not found");
                        }

                        return ResponseEntity.ok(updatedProduct);

                } catch (Exception e) {

                        e.printStackTrace();

                        return ResponseEntity
                                        .status(HttpStatus.BAD_REQUEST)
                                        .body(
                                                        "Failed to update product: "
                                                                        + e.getMessage());
                }
        }

        // =========================================================
        // DELETE PRODUCT
        // =========================================================

        @DeleteMapping("/product/{prodId}")
        public ResponseEntity<?> deleteProduct(
                        @PathVariable int prodId) {

                try {

                        Product product = service.getProductById(prodId);

                        if (product == null) {

                                return ResponseEntity
                                                .status(HttpStatus.NOT_FOUND)
                                                .body("Product not found");
                        }

                        String result = service.deleteProduct(prodId);

                        if ("DELETED".equals(result)) {

                                return ResponseEntity.ok(
                                                "Product deleted successfully");
                        }

                        if ("DEACTIVATED".equals(result)) {

                                return ResponseEntity.ok(
                                                "This product has existing orders, so it was removed from the store but kept for order history.");
                        }

                        return ResponseEntity
                                        .status(HttpStatus.NOT_FOUND)
                                        .body("Product not found");

                } catch (Exception e) {

                        e.printStackTrace();

                        return ResponseEntity
                                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(
                                                        "Failed to delete product: "
                                                                        + e.getMessage());
                }
        }

        // =========================================================
        // SEARCH PRODUCTS
        // =========================================================

        @GetMapping("/products/search")
        public ResponseEntity<List<Product>> searchProducts(
                        @RequestParam String keyword) {

                List<Product> products = service.searchProducts(keyword);

                return ResponseEntity.ok(products);
        }
}