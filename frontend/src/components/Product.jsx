import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context";
import axios from "../axios";
import "./Product.css";

const Product = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data,
        addToCart,
    } = useContext(AppContext);

    const [product, setProduct] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
    const [selectedImage, setSelectedImage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);

                // ==========================================
                // GET PRODUCT
                // ==========================================

                const response = await axios.get(
                    `http://localhost:8080/api/product/${id}`
                );

                const productData = response.data;

                setProduct(productData);

                // ==========================================
                // GET ALL IMAGE IDS
                // ==========================================

                const imageIdsResponse = await axios.get(
                    `http://localhost:8080/api/product/${id}/images`
                );

                const imageIds = imageIdsResponse.data || [];

                // ==========================================
                // CREATE IMAGE URLS
                // ==========================================

                const urls = imageIds.map(
                    (imageId) =>
                        `http://localhost:8080/api/product/image/${imageId}`
                );

                // ==========================================
                // FALLBACK TO OLD IMAGE
                // ==========================================

                if (
                    urls.length === 0 &&
                    productData.imageName
                ) {
                    urls.push(
                        `http://localhost:8080/api/product/${id}/image`
                    );
                }

                setImageUrls(urls);

                if (urls.length > 0) {
                    setSelectedImage(urls[0]);
                }

            } catch (error) {

                console.error(
                    "Error fetching product:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        fetchProduct();

        return () => {
            // Nothing to revoke because these are
            // backend URLs, not blob URLs.
        };

    }, [id]);

    const increaseQuantity = () => {
        if (
            product &&
            quantity < product.stockQuantity
        ) {
            setQuantity((prev) => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const handleAddToCart = () => {

        if (!product || !product.productAvailable) {
            return;
        }

        addToCart(product, quantity);
    };

    const handleBuyNow = () => {
        if (!product || !product.productAvailable) {
            return;
        }

        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }

        navigate("/cart");
    };

    if (loading) {
        return (
            <div className="product-loading-page">
                <div className="product-spinner"></div>
                <p>Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-not-found">
                <div className="not-found-icon">
                    <i className="bi bi-box-seam"></i>
                </div>

                <h2>Product Not Found</h2>

                <p>
                    The product you're looking for
                    doesn't exist or has been removed.
                </p>

                <button
                    onClick={() => navigate("/")}
                    className="back-home-btn"
                >
                    <i className="bi bi-arrow-left"></i>
                    Back to Store
                </button>
            </div>
        );
    }

    const isAvailable =
        product.productAvailable &&
        product.stockQuantity > 0;

    const totalPrice =
        Number(product.price || 0) * quantity;

    return (
        <div className="premium-product-page">

            {/* BREADCRUMB */}

            <div className="product-container">

                <div className="product-breadcrumb">

                    <span
                        onClick={() => navigate("/")}
                    >
                        Home
                    </span>

                    <i className="bi bi-chevron-right"></i>

                    <span>
                        {product.category || "Products"}
                    </span>

                    <i className="bi bi-chevron-right"></i>

                    <strong>
                        {product.name}
                    </strong>

                </div>


                {/* MAIN PRODUCT */}

                <div className="product-main-card">

                    {/* IMAGE */}

                    <div className="product-gallery">

                        <div className="image-container">

                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={product.name}
                                    className="main-product-image"
                                    onError={() => {
                                        console.error(
                                            "Failed to load image:",
                                            selectedImage
                                        );
                                    }}
                                />
                            ) : (
                                <div className="image-placeholder">
                                    <i className="bi bi-image"></i>

                                    <span>
                                        Image unavailable
                                    </span>
                                </div>
                            )}

                            {product.productAvailable && (
                                <span className="image-stock-badge">
                                    <i className="bi bi-check-circle-fill"></i>
                                    In Stock
                                </span>
                            )}

                        </div>


                        {/* ==========================================
        IMAGE THUMBNAILS
    ========================================== */}

                        {imageUrls.length > 1 && (
                            <div className="product-image-thumbnails">

                                {imageUrls.map((url, index) => (

                                    <button
                                        key={index}
                                        type="button"
                                        className={
                                            selectedImage === url
                                                ? "product-thumbnail active"
                                                : "product-thumbnail"
                                        }
                                        onClick={() =>
                                            setSelectedImage(url)
                                        }
                                    >

                                        <img
                                            src={url}
                                            alt={`${product.name} ${index + 1}`}
                                        />

                                    </button>

                                ))}

                            </div>
                        )}


                        <div className="secure-badge">

                            <i className="bi bi-shield-check"></i>

                            <div>

                                <strong>
                                    Secure Shopping
                                </strong>

                                <span>
                                    100% genuine products
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* DETAILS */}

                    <div className="product-details">

                        <div className="product-category-row">

                            <span className="product-category">
                                {product.category ||
                                    "General"}
                            </span>

                            {product.brand && (
                                <span className="product-brand">
                                    By{" "}
                                    <strong>
                                        {product.brand}
                                    </strong>
                                </span>
                            )}

                        </div>


                        <h1 className="product-title">
                            {product.name}
                        </h1>


                        <div className="product-rating">

                            <span className="rating-stars">
                                ★★★★★
                            </span>

                            <span>
                                4.8
                            </span>

                            <span className="rating-divider">
                                |
                            </span>

                            <span className="reviews">
                                120+ Reviews
                            </span>

                        </div>


                        <div className="price-section">

                            <span className="current-price">
                                ₹
                                {Number(
                                    product.price
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </span>

                            <span className="tax-text">
                                Inclusive of all taxes
                            </span>

                        </div>


                        <div className="product-divider"></div>


                        {/* SHORT DESCRIPTION */}

                        <div className="description-section">

                            <h3>
                                About this product
                            </h3>

                            <p>
                                {product.description ||
                                    "Experience premium quality and excellent performance with this product."}
                            </p>

                        </div>


                        {/* FEATURES */}

                        <div className="feature-grid">

                            <div className="feature-item">
                                <i className="bi bi-truck"></i>

                                <div>
                                    <strong>
                                        Fast Delivery
                                    </strong>

                                    <span>
                                        Quick doorstep delivery
                                    </span>
                                </div>
                            </div>

                            <div className="feature-item">
                                <i className="bi bi-arrow-repeat"></i>

                                <div>
                                    <strong>
                                        Easy Returns
                                    </strong>

                                    <span>
                                        Hassle-free returns
                                    </span>
                                </div>
                            </div>

                            <div className="feature-item">
                                <i className="bi bi-shield-check"></i>

                                <div>
                                    <strong>
                                        Secure Payment
                                    </strong>

                                    <span>
                                        100% secure checkout
                                    </span>
                                </div>
                            </div>

                            <div className="feature-item">
                                <i className="bi bi-patch-check"></i>

                                <div>
                                    <strong>
                                        Genuine Product
                                    </strong>

                                    <span>
                                        Quality guaranteed
                                    </span>
                                </div>
                            </div>

                        </div>


                        {/* PURCHASE */}

                        <div className="purchase-section">

                            {isAvailable ? (
                                <>
                                    <div className="purchase-top">

                                        <div className="quantity-wrapper">

                                            <span className="quantity-label">
                                                Quantity
                                            </span>

                                            <div className="quantity-control">

                                                <button
                                                    onClick={
                                                        decreaseQuantity
                                                    }
                                                    disabled={
                                                        quantity <= 1
                                                    }
                                                >
                                                    −
                                                </button>

                                                <span>
                                                    {quantity}
                                                </span>

                                                <button
                                                    onClick={
                                                        increaseQuantity
                                                    }
                                                    disabled={
                                                        quantity >=
                                                        product.stockQuantity
                                                    }
                                                >
                                                    +
                                                </button>

                                            </div>

                                        </div>


                                        <div className="stock-info">

                                            <span>
                                                Available
                                            </span>

                                            <strong>
                                                {product.stockQuantity}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="purchase-buttons">

                                        <button
                                            className="add-cart-btn"
                                            onClick={
                                                handleAddToCart
                                            }
                                        >
                                            <i className="bi bi-cart3"></i>
                                            Add to Cart
                                        </button>

                                        <button
                                            className="buy-now-btn"
                                            onClick={
                                                handleBuyNow
                                            }
                                        >
                                            Buy Now
                                            <i className="bi bi-arrow-right"></i>
                                        </button>

                                    </div>


                                    <div className="order-total">

                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            ₹
                                            {totalPrice.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>

                                    </div>
                                </>
                            ) : (
                                <div className="out-of-stock-box">

                                    <i className="bi bi-x-circle"></i>

                                    <div>
                                        <strong>
                                            Currently Unavailable
                                        </strong>

                                        <span>
                                            This product is
                                            currently out of
                                            stock.
                                        </span>
                                    </div>

                                </div>
                            )}

                        </div>

                    </div>

                </div>


                {/* PRODUCT INFORMATION */}

                <div className="product-information">

                    <div className="information-header">

                        <span className="information-icon">
                            <i className="bi bi-info-circle"></i>
                        </span>

                        <div>
                            <h2>
                                Product Information
                            </h2>

                            <p>
                                Everything you need to know
                                about this product
                            </p>
                        </div>

                    </div>


                    <div className="information-grid">

                        <div className="information-item">

                            <span>
                                Brand
                            </span>

                            <strong>
                                {product.brand ||
                                    "Not specified"}
                            </strong>

                        </div>


                        <div className="information-item">

                            <span>
                                Category
                            </span>

                            <strong>
                                {product.category ||
                                    "General"}
                            </strong>

                        </div>


                        <div className="information-item">

                            <span>
                                Availability
                            </span>

                            <strong
                                className={
                                    isAvailable
                                        ? "available-text"
                                        : "unavailable-text"
                                }
                            >
                                {isAvailable
                                    ? "In Stock"
                                    : "Out of Stock"}
                            </strong>

                        </div>


                        <div className="information-item">

                            <span>
                                Stock
                            </span>

                            <strong>
                                {product.stockQuantity ??
                                    0}{" "}
                                units
                            </strong>

                        </div>


                        <div className="information-item">

                            <span>
                                Listed Date
                            </span>

                            <strong>
                                {product.releaseDate
                                    ? new Date(
                                        product.releaseDate
                                    ).toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        }
                                    )
                                    : "N/A"}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* WHY BUY FROM US */}

                <div className="why-shop-section">

                    <div className="why-shop-header">

                        <span>
                            WHY SHOP WITH US
                        </span>

                        <h2>
                            A better way to shop
                        </h2>

                        <p>
                            We make every purchase simple,
                            secure and reliable.
                        </p>

                    </div>


                    <div className="why-shop-grid">

                        <div className="why-shop-card">

                            <div className="why-icon">
                                <i className="bi bi-truck"></i>
                            </div>

                            <h3>
                                Quick Delivery
                            </h3>

                            <p>
                                Get your order delivered
                                quickly and safely to your
                                doorstep.
                            </p>

                        </div>


                        <div className="why-shop-card">

                            <div className="why-icon">
                                <i className="bi bi-shield-lock"></i>
                            </div>

                            <h3>
                                Secure Payments
                            </h3>

                            <p>
                                Your payment information is
                                protected with secure
                                checkout.
                            </p>

                        </div>


                        <div className="why-shop-card">

                            <div className="why-icon">
                                <i className="bi bi-headset"></i>
                            </div>

                            <h3>
                                Customer Support
                            </h3>

                            <p>
                                Our support team is ready to
                                help whenever you need us.
                            </p>

                        </div>


                        <div className="why-shop-card">

                            <div className="why-icon">
                                <i className="bi bi-award"></i>
                            </div>

                            <h3>
                                Quality Products
                            </h3>

                            <p>
                                Shop confidently with products
                                selected for quality.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Product;