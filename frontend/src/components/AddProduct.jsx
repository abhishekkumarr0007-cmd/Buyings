import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";

const AddProduct = () => {
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        name: "",
        description: "",
        brand: "",
        price: "",
        category: "",
        releaseDate: "",
        productAvailable: true,
        stockQuantity: "",
    });

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const categories = [
        "Laptop",
        "Headphone",
        "Mobile",
        "Electronics",
        "Toys",
        "Fashion",
        "Shoes",
        "Home",
        "Accessories",
        "Sports",
        "Other",
    ];

    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProduct((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================================================
    // HANDLE AVAILABILITY
    // =========================================================

    const handleAvailabilityChange = (e) => {
        setProduct((prev) => ({
            ...prev,
            productAvailable: e.target.checked,
        }));
    };

    // =========================================================
    // HANDLE IMAGE
    // =========================================================

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) {
            return;
        }

        setError("");

        // Validate selected files
        for (const file of files) {

            if (!file.type.startsWith("image/")) {
                setError(`${file.name} is not a valid image file.`);
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError(`${file.name} is larger than 5 MB.`);
                return;
            }
        }

        // Add newly selected images to existing images
        setImages((prevImages) => {

            const combinedImages = [
                ...prevImages,
                ...files
            ];

            // Maximum 8 images
            if (combinedImages.length > 8) {
                setError("You can upload a maximum of 8 images.");
                return prevImages;
            }

            return combinedImages;
        });

        // Create previews for newly selected images
        const newPreviews = files.map((file) =>
            URL.createObjectURL(file)
        );

        setImagePreviews((prevPreviews) => [
            ...prevPreviews,
            ...newPreviews
        ]);

        // Allow selecting the same file again if needed
        e.target.value = "";
    };

    // =========================================================
    // REMOVE IMAGE
    // =========================================================

    const removeImage = (index) => {

        setImages((prev) =>
            prev.filter((_, i) => i !== index)
        );

        setImagePreviews((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // =====================================================
        // CHECK JWT BEFORE REQUEST
        // =====================================================

        const token = localStorage.getItem("token");

        console.log("=================================");
        console.log("ADD PRODUCT");
        console.log("TOKEN EXISTS:", !!token);

        if (!token) {
            setError(
                "You are not logged in. Please logout and login again."
            );

            return;
        }

        // =====================================================
        // VALIDATION
        // =====================================================

        if (!product.name.trim()) {
            setError("Product name is required.");
            return;
        }

        if (!product.description.trim()) {
            setError("Product description is required.");
            return;
        }

        if (!product.brand.trim()) {
            setError("Brand is required.");
            return;
        }

        if (
            product.price === "" ||
            Number(product.price) <= 0
        ) {
            setError("Please enter a valid price.");
            return;
        }

        if (!product.category) {
            setError("Please select a category.");
            return;
        }

        if (!product.releaseDate) {
            setError("Release date is required.");
            return;
        }

        if (
            product.stockQuantity === "" ||
            Number(product.stockQuantity) < 0
        ) {
            setError("Please enter a valid stock quantity.");
            return;
        }

        if (images.length === 0) {
            setError("Please select at least one product image.");
            return;
        }

        // =====================================================
        // SEND REQUEST
        // =====================================================

        try {
            setLoading(true);

            const formData = new FormData();

            // Product JSON
            const productData = {
                name: product.name.trim(),
                description: product.description.trim(),
                brand: product.brand.trim(),
                price: Number(product.price),
                category: product.category,
                releaseDate: product.releaseDate,
                productAvailable: product.productAvailable,
                stockQuantity: Number(product.stockQuantity),
            };

            console.log("PRODUCT DATA:", productData);
            console.log("NUMBER OF IMAGES:", images.length);

            images.forEach((image, index) => {
                console.log(`IMAGE ${index + 1}:`, {
                    name: image.name,
                    type: image.type,
                    size: image.size
                });
            });

            // =================================================
            // PRODUCT JSON PART
            // =================================================

            formData.append(
                "product",
                new Blob(
                    [JSON.stringify(productData)],
                    {
                        type: "application/json",
                    }
                )
            );

            // =================================================
            // IMAGE PART
            // =================================================
            images.forEach((image) => {

                formData.append(
                    "imageFiles",
                    image
                );

            });

            // =================================================
            // IMPORTANT
            //
            // Do NOT manually set:
            //
            // Content-Type: multipart/form-data
            //
            // Axios will automatically create the correct
            // Content-Type including the multipart boundary.
            //
            // Your api.js interceptor will automatically add:
            //
            // Authorization: Bearer YOUR_JWT
            // =================================================

            const response = await api.post(
                "/api/product",
                formData
            );

            console.log(
                "PRODUCT CREATED:",
                response.data
            );

            // =================================================
            // SUCCESS
            // =================================================

            setSuccess(
                "Product added successfully!"
            );

            // Reset form
            setProduct({
                name: "",
                description: "",
                brand: "",
                price: "",
                category: "",
                releaseDate: "",
                productAvailable: true,
                stockQuantity: "",
            });

            setImages([]);
            setImagePreviews([]);

            // Redirect
            setTimeout(() => {
                navigate("/admin");
            }, 1200);

        } catch (err) {
            console.error(
                "================================="
            );

            console.error(
                "ADD PRODUCT ERROR"
            );

            console.error(
                "STATUS:",
                err.response?.status
            );

            console.error(
                "RESPONSE:",
                err.response?.data
            );

            console.error(
                "MESSAGE:",
                err.message
            );

            console.error(
                "================================="
            );

            // =================================================
            // 401
            // =================================================

            if (err.response?.status === 401) {

                setError(
                    "Your login session has expired. Please logout and login again."
                );

                return;
            }

            // =================================================
            // 403
            // =================================================

            if (err.response?.status === 403) {

                setError(
                    "Access denied. Your account does not have ADMIN permission."
                );

                return;
            }

            // =================================================
            // BACKEND ERROR
            // =================================================

            const serverMessage =
                err.response?.data;

            if (
                typeof serverMessage === "string" &&
                serverMessage.trim()
            ) {
                setError(serverMessage);
            } else {
                setError(
                    "Failed to add product. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="add-product-page">

            <div className="add-product-container">

                {/* PAGE HEADER */}

                <div className="add-product-header">

                    <div>

                        <div className="breadcrumb">

                            <span
                                onClick={() =>
                                    navigate("/admin")
                                }
                            >
                                Admin
                            </span>

                            <i className="bi bi-chevron-right"></i>

                            <span>
                                Add Product
                            </span>

                        </div>

                        <h1>
                            Add New Product
                        </h1>

                        <p>
                            Add a new product to your Buyings store
                        </p>

                    </div>

                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        <i className="bi bi-arrow-left"></i>

                        Back to Dashboard

                    </button>

                </div>

                {/* ALERTS */}

                {error && (
                    <div className="form-alert error-alert">

                        <i className="bi bi-exclamation-circle-fill"></i>

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {success && (
                    <div className="form-alert success-alert">

                        <i className="bi bi-check-circle-fill"></i>

                        <span>
                            {success}
                        </span>

                    </div>
                )}

                {/* FORM */}

                <form
                    className="add-product-form"
                    onSubmit={handleSubmit}
                >

                    {/* LEFT */}

                    <div className="form-main">

                        {/* PRODUCT INFORMATION */}

                        <section className="form-card">

                            <div className="section-heading">

                                <div className="section-icon">

                                    <i className="bi bi-box-seam"></i>

                                </div>

                                <div>

                                    <h2>
                                        Product Information
                                    </h2>

                                    <p>
                                        Basic information about your product
                                    </p>

                                </div>

                            </div>

                            <div className="form-grid">

                                {/* NAME */}

                                <div className="form-group full-width">

                                    <label>
                                        Product Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={product.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Wireless Bluetooth Headphones"
                                    />

                                </div>

                                {/* BRAND */}

                                <div className="form-group">

                                    <label>
                                        Brand
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="brand"
                                        value={product.brand}
                                        onChange={handleChange}
                                        placeholder="e.g. Sony"
                                    />

                                </div>

                                {/* CATEGORY */}

                                <div className="form-group">

                                    <label>
                                        Category
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="category"
                                        value={product.category}
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            Select category
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* DESCRIPTION */}

                                <div className="form-group full-width">

                                    <label>
                                        Description
                                        <span>*</span>
                                    </label>

                                    <textarea
                                        name="description"
                                        value={product.description}
                                        onChange={handleChange}
                                        placeholder="Describe the product, its features and specifications..."
                                        rows="6"
                                    />

                                    <small>
                                        Give customers useful information
                                        about this product.
                                    </small>

                                </div>

                            </div>

                        </section>

                        {/* PRICING */}

                        <section className="form-card">

                            <div className="section-heading">

                                <div className="section-icon green-icon">

                                    <i className="bi bi-currency-rupee"></i>

                                </div>

                                <div>

                                    <h2>
                                        Pricing & Inventory
                                    </h2>

                                    <p>
                                        Set pricing and stock information
                                    </p>

                                </div>

                            </div>

                            <div className="form-grid">

                                {/* PRICE */}

                                <div className="form-group">

                                    <label>
                                        Price
                                        <span>*</span>
                                    </label>

                                    <div className="input-prefix">

                                        <span>
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            name="price"
                                            value={product.price}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />

                                    </div>

                                </div>

                                {/* STOCK */}

                                <div className="form-group">

                                    <label>
                                        Stock Quantity
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="stockQuantity"
                                        value={product.stockQuantity}
                                        onChange={handleChange}
                                        placeholder="e.g. 50"
                                        min="0"
                                    />

                                </div>

                                {/* RELEASE DATE */}

                                <div className="form-group">

                                    <label>
                                        Release Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="date"
                                        name="releaseDate"
                                        value={product.releaseDate}
                                        onChange={handleChange}
                                    />

                                </div>

                                {/* STATUS */}

                                <div className="form-group availability-group">

                                    <label>
                                        Product Status
                                    </label>

                                    <label className="availability-box">

                                        <input
                                            type="checkbox"
                                            checked={
                                                product.productAvailable
                                            }
                                            onChange={
                                                handleAvailabilityChange
                                            }
                                        />

                                        <span className="custom-checkbox">

                                            <i className="bi bi-check"></i>

                                        </span>

                                        <span>

                                            <strong>
                                                Product Available
                                            </strong>

                                            <small>
                                                Customers can purchase
                                                this product
                                            </small>

                                        </span>

                                    </label>

                                </div>

                            </div>

                        </section>

                    </div>

                    {/* RIGHT SIDEBAR */}

                    <div className="form-sidebar">

                        {/* IMAGE */}

                        {/* IMAGE */}

                        <section className="form-card image-card">

                            <div className="section-heading">

                                <div className="section-icon purple-icon">

                                    <i className="bi bi-images"></i>

                                </div>

                                <div>

                                    <h2>
                                        Product Images
                                    </h2>

                                    <p>
                                        Upload multiple high-quality product images
                                    </p>

                                </div>

                            </div>

                            {/* UPLOAD BUTTON */}

                            <label className="image-upload-area">

                                <input
                                    type="file"
                                    multiple
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={handleImageChange}
                                />

                                <div className="upload-icon">
                                    <i className="bi bi-cloud-arrow-up"></i>
                                </div>

                                <h3>
                                    Upload product images
                                </h3>

                                <p>
                                    Click to browse your files
                                </p>

                                <span>
                                    PNG, JPG, JPEG or WEBP
                                    <br />
                                    Maximum size 5 MB per image
                                </span>

                            </label>


                            {/* MULTIPLE IMAGE PREVIEW */}

                            {imagePreviews.length > 0 && (
                                <div className="multiple-image-preview">

                                    {imagePreviews.map((preview, index) => (
                                        <div
                                            key={index}
                                            className="image-preview-item"
                                        >

                                            <img
                                                src={preview}
                                                alt={`Product ${index + 1}`}
                                            />

                                            <span className="image-number">
                                                {index + 1}
                                            </span>

                                            <button
                                                type="button"
                                                className="remove-preview-btn"
                                                onClick={() => removeImage(index)}
                                            >
                                                ×
                                            </button>

                                        </div>
                                    ))}

                                </div>
                            )}

                            {/* IMAGE COUNT */}

                            {images.length > 0 && (
                                <div className="image-count">

                                    <i className="bi bi-images"></i>

                                    {images.length}{" "}
                                    {images.length === 1 ? "image" : "images"} selected

                                </div>
                            )}


                        </section>

                        {/* SUMMARY */}

                        <section className="form-card product-summary">

                            <div className="summary-title">

                                <i className="bi bi-lightning-charge"></i>

                                Product Summary

                            </div>

                            <div className="summary-row">

                                <span>
                                    Name
                                </span>

                                <strong>
                                    {product.name || "Not set"}
                                </strong>

                            </div>

                            <div className="summary-row">

                                <span>
                                    Category
                                </span>

                                <strong>
                                    {product.category || "Not set"}
                                </strong>

                            </div>

                            <div className="summary-row">

                                <span>
                                    Price
                                </span>

                                <strong>

                                    {product.price
                                        ? `₹${Number(
                                            product.price
                                        ).toLocaleString("en-IN")}`
                                        : "₹0"}

                                </strong>

                            </div>

                            <div className="summary-row">

                                <span>
                                    Stock
                                </span>

                                <strong>
                                    {product.stockQuantity || "0"}
                                </strong>

                            </div>

                            <div className="summary-row">

                                <span>
                                    Status
                                </span>

                                <strong
                                    className={
                                        product.productAvailable
                                            ? "status-active"
                                            : "status-inactive"
                                    }
                                >

                                    {product.productAvailable
                                        ? "Available"
                                        : "Unavailable"}

                                </strong>

                            </div>

                        </section>

                    </div>

                    {/* ACTIONS */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                                navigate("/admin")
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >

                            {loading ? (

                                <>
                                    <span className="button-spinner"></span>

                                    Adding Product...
                                </>

                            ) : (

                                <>
                                    <i className="bi bi-plus-lg"></i>

                                    Add Product
                                </>

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default AddProduct;