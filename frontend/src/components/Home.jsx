import React, {
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import "./Home.css";
import { Link } from "react-router-dom";

import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

const Home = ({ selectedCategory, onSelectCategory }) => {
    const {
        data,
        isError,
        addToCart
    } = useContext(AppContext);

    const [imageErrors, setImageErrors] = useState({});


    // =========================================================
    // RESET IMAGE ERRORS
    // =========================================================

    useEffect(() => {
        setImageErrors({});
    }, [data]);

    // =========================================================
    // PRODUCTS
    // =========================================================

    const products = Array.isArray(data) ? data : [];

    const filteredProducts = useMemo(() => {

        if (!selectedCategory) {
            return products;
        }

        return products.filter(
            (product) =>
                product.category === selectedCategory
        );

    }, [products, selectedCategory]);

    // =========================================================
    // IMAGE URL
    // =========================================================

    const getImageUrl = (product) => {

        if (imageErrors[product.id]) {
            return unplugged;
        }

        return `${API_BASE_URL}/api/product/${product.id}/image`;
    };

    // =========================================================
    // IMAGE ERROR
    // =========================================================

    const handleImageError = (id) => {

        setImageErrors((previous) => ({
            ...previous,
            [id]: true
        }));

    };

    // =========================================================
    // ADD TO CART
    // =========================================================

    const handleAddToCart = (event, product) => {

        event.preventDefault();
        event.stopPropagation();

        if (!product.productAvailable) {
            return;
        }

        addToCart(product);
    };

    // =========================================================
    // ERROR PAGE
    // =========================================================

    if (isError) {

        return (
            <main className="premium-error">

                <img
                    src={unplugged}
                    alt="Server error"
                />

                <h2>
                    Store unavailable
                </h2>

                <p>
                    We couldn't connect to the store.
                    Please make sure your backend server
                    is running.
                </p>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>

            </main>
        );
    }

    return (
        <main className="premium-store">

            {/* =====================================================
                HERO
            ===================================================== */}

            {!selectedCategory && (
                <section className="premium-hero">

                    <div className="hero-left">

                        <span className="hero-label">
                            PREMIUM ONLINE STORE
                        </span>

                        <h1>
                            Everything you need.
                            <br />

                            <span>
                                Nothing you don't.
                            </span>
                        </h1>

                        <p>
                            Discover thoughtfully selected products
                            designed to make your everyday life
                            better, simpler and more stylish.
                        </p>

                        <div className="hero-buttons">

                            <a
                                href="#products"
                                className="hero-primary"
                            >
                                Shop Collection
                                <span>→</span>
                            </a>

                            <a
                                href="#categories"
                                className="hero-secondary"
                            >
                                Explore Categories
                            </a>

                        </div>

                        <div className="hero-benefits">

                            <div>
                                <b>✓</b>
                                <span>
                                    Quality products
                                </span>
                            </div>

                            <div>
                                <b>⚡</b>
                                <span>
                                    Easy shopping
                                </span>
                            </div>

                            <div>
                                <b>↻</b>
                                <span>
                                    Simple checkout
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* HERO PRODUCT */}

                    <div className="hero-right">

                        <div className="hero-product-card">

                            <div className="hero-card-top">

                                <span>
                                    FEATURED
                                </span>

                                <span>
                                    01 / 04
                                </span>

                            </div>

                            <div className="hero-product-image">

                                {products.length > 0 ? (

                                    <img
                                        src={getImageUrl(products[0])}
                                        alt={products[0].name}
                                        onError={() =>
                                            handleImageError(
                                                products[0].id
                                            )
                                        }
                                    />

                                ) : (

                                    <img
                                        src={unplugged}
                                        alt="Product"
                                    />

                                )}

                            </div>

                            {products.length > 0 && (

                                <div className="hero-product-details">

                                    <div>

                                        <small>
                                            FEATURED PRODUCT
                                        </small>

                                        <strong>
                                            {products[0].name}
                                        </strong>

                                    </div>

                                    <span>
                                        ₹
                                        {Number(
                                            products[0].price || 0
                                        ).toLocaleString("en-IN")}
                                    </span>

                                </div>

                            )}

                        </div>

                    </div>

                </section>
            )}

            {/* =====================================================
                CATEGORIES
            ===================================================== */}

            {!selectedCategory && (
                <section
                    className="premium-categories"
                    id="categories"
                >

                    <div className="section-heading">

                        <div>

                            <span>
                                EXPLORE
                            </span>

                            <h2>
                                Shop by category
                            </h2>

                        </div>

                        <p>
                            Find products made for your lifestyle.
                        </p>

                    </div>

                    <div className="category-grid">

                        <button
                            type="button"
                            className="premium-category-card"
                            onClick={() => {
                                onSelectCategory("Electronics");
                                setTimeout(() => {
                                    document
                                        .getElementById("products")
                                        ?.scrollIntoView({
                                            behavior: "smooth"
                                        });
                                }, 0);
                            }}
                        >
                            <span className="category-number">
                                01
                            </span>

                            <div>
                                <small>
                                    COLLECTION
                                </small>

                                <h3>
                                    Electronics
                                </h3>
                            </div>

                            <strong>
                                ↗
                            </strong>
                        </button>
                        <button
                            type="button"
                            className="premium-category-card"
                            onClick={() => {
                                onSelectCategory("Fashion");
                                setTimeout(() => {
                                    document
                                        .getElementById("products")
                                        ?.scrollIntoView({
                                            behavior: "smooth"
                                        });
                                }, 0);
                            }}
                        >
                            <span className="category-number">
                                02
                            </span>

                            <div>
                                <small>
                                    COLLECTION
                                </small>

                                <h3>
                                    Fashion
                                </h3>
                            </div>

                            <strong>
                                ↗
                            </strong>
                        </button>

                        <button
                            type="button"
                            className="premium-category-card"
                            onClick={() => {
                                onSelectCategory("Accessories");
                                setTimeout(() => {
                                    document
                                        .getElementById("products")
                                        ?.scrollIntoView({
                                            behavior: "smooth"
                                        });
                                }, 0);
                            }}
                        >
                            <span className="category-number">
                                03
                            </span>

                            <div>
                                <small>
                                    COLLECTION
                                </small>

                                <h3>
                                    Accessories
                                </h3>
                            </div>

                            <strong>
                                ↗
                            </strong>
                        </button>

                        <button
                            type="button"
                            className="premium-category-card"
                            onClick={() => {
                                onSelectCategory("Lifestyle");
                                setTimeout(() => {
                                    document
                                        .getElementById("products")
                                        ?.scrollIntoView({
                                            behavior: "smooth"
                                        });
                                }, 0);
                            }}
                        >
                            <span className="category-number">
                                04
                            </span>

                            <div>
                                <small>
                                    COLLECTION
                                </small>

                                <h3>
                                    Lifestyle
                                </h3>
                            </div>

                            <strong>
                                ↗
                            </strong>
                        </button>

                    </div>

                </section>
            )}

            {/* =====================================================
                PRODUCT SECTION
            ===================================================== */}

            <section
                className="premium-products-section"
                id="products"
            >

                <div className="section-heading products-heading">

                    <div>

                        <span>
                            {selectedCategory
                                ? "CATEGORY"
                                : "OUR COLLECTION"}
                        </span>

                        <h2>
                            {selectedCategory ||
                                "Featured products"}
                        </h2>

                        <p>
                            Carefully selected products
                            for quality, design and everyday use.
                        </p>

                    </div>

                    <div className="product-total">

                        <strong>
                            {filteredProducts.length
                                .toString()
                                .padStart(2, "0")}
                        </strong>

                        <span>
                            PRODUCTS
                        </span>

                    </div>

                </div>

                {/* =================================================
                    LOADING
                ================================================= */}

                {data === undefined && (

                    <div className="premium-product-grid">

                        {Array.from({ length: 8 }).map(
                            (_, index) => (

                                <div
                                    className="premium-skeleton"
                                    key={index}
                                >

                                    <div className="skeleton-image"></div>

                                    <div className="skeleton-content">

                                        <div className="skeleton-line"></div>

                                        <div className="skeleton-line short"></div>

                                        <div className="skeleton-bottom">

                                            <div></div>

                                            <div></div>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {data !== undefined &&
                    filteredProducts.length === 0 && (

                        <div className="premium-empty">

                            <div className="empty-icon">
                                🛍
                            </div>

                            <h3>
                                No products found
                            </h3>

                            <p>
                                We are adding more products
                                to this collection soon.
                            </p>

                        </div>

                    )}

                {/* =================================================
                    PRODUCT GRID
                ================================================= */}

                {data !== undefined &&
                    filteredProducts.length > 0 && (

                        <div className="premium-product-grid">

                            {filteredProducts.map(
                                (product, index) => (

                                    <article
                                        className="premium-product-card"
                                        key={product.id}
                                    >

                                        {/* IMAGE */}

                                        <Link
                                            to={`/product/${product.id}`}
                                            className="premium-image-link"
                                        >

                                            <div className="premium-image-box">

                                                <span className="product-number">
                                                    {String(
                                                        index + 1
                                                    ).padStart(2, "0")}
                                                </span>

                                                <span
                                                    className={
                                                        product.productAvailable
                                                            ? "stock-badge"
                                                            : "stock-badge sold"
                                                    }
                                                >
                                                    {product.productAvailable
                                                        ? "IN STOCK"
                                                        : "SOLD OUT"}
                                                </span>

                                                <img
                                                    src={getImageUrl(product)}
                                                    alt={product.name}
                                                    className="premium-product-image"
                                                    loading="lazy"
                                                    decoding="async"
                                                    draggable="false"
                                                    onError={() =>
                                                        handleImageError(
                                                            product.id
                                                        )
                                                    }
                                                />

                                                <div className="product-hover">

                                                    <span>
                                                        View Product
                                                    </span>

                                                    <strong>
                                                        ↗
                                                    </strong>

                                                </div>

                                            </div>

                                        </Link>

                                        {/* DETAILS */}

                                        <div className="premium-product-details">

                                            <div className="product-meta">

                                                <span>
                                                    {brandName(product.brand)}
                                                </span>

                                                <span>
                                                    {product.category ||
                                                        "COLLECTION"}
                                                </span>

                                            </div>

                                            <Link
                                                to={`/product/${product.id}`}
                                                className="premium-product-title"
                                            >
                                                {product.name}
                                            </Link>

                                            <div className="product-rating">

                                                <span>
                                                    ★★★★★
                                                </span>

                                                <small>
                                                    4.8
                                                </small>

                                            </div>

                                            <div className="product-bottom">

                                                <div className="price-block">

                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            product.price || 0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </strong>

                                                    {product.productAvailable &&
                                                        product.stockQuantity <=
                                                        5 && (

                                                            <small>
                                                                Only{" "}
                                                                {
                                                                    product.stockQuantity
                                                                }{" "}
                                                                left
                                                            </small>

                                                        )}

                                                </div>

                                                {/* ADD TO CART */}

                                                <button
                                                    type="button"
                                                    className={
                                                        product.productAvailable
                                                            ? "add-cart-button"
                                                            : "add-cart-button disabled"
                                                    }
                                                    disabled={
                                                        !product.productAvailable
                                                    }
                                                    onClick={(event) =>
                                                        handleAddToCart(
                                                            event,
                                                            product
                                                        )
                                                    }
                                                >

                                                    {product.productAvailable
                                                        ? "Add to Cart"
                                                        : "Sold Out"}

                                                </button>

                                            </div>

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    )}

            </section>

            {/* =====================================================
                PROMO
            ===================================================== */}

            {!selectedCategory && (

                <section className="premium-promo">

                    <div className="promo-content">

                        <span>
                            CURATED FOR EVERYDAY LIFE
                        </span>

                        <h2>
                            Better products.
                            <br />
                            Better choices.
                        </h2>

                        <p>
                            Discover products that combine
                            useful design, dependable quality
                            and timeless style.
                        </p>

                        <a href="#products">
                            Shop the collection
                            <span>↗</span>
                        </a>

                    </div>

                    <div className="promo-decoration">

                        <div className="promo-ring ring-one"></div>

                        <div className="promo-ring ring-two"></div>

                        <div className="promo-square"></div>

                    </div>

                </section>

            )}

            {/* =====================================================
                FEATURES
            ===================================================== */}

            {!selectedCategory && (

                <section className="premium-features">

                    <div className="feature-item">

                        <div className="feature-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                Quality Products
                            </strong>

                            <span>
                                Carefully selected for you
                            </span>
                        </div>

                    </div>

                    <div className="feature-item">

                        <div className="feature-icon">
                            ⚡
                        </div>

                        <div>
                            <strong>
                                Fast Shopping
                            </strong>

                            <span>
                                Simple and seamless experience
                            </span>
                        </div>

                    </div>

                    <div className="feature-item">

                        <div className="feature-icon">
                            ↻
                        </div>

                        <div>
                            <strong>
                                Easy Checkout
                            </strong>

                            <span>
                                Everything in one place
                            </span>
                        </div>

                    </div>

                    <div className="feature-item">

                        <div className="feature-icon">
                            ♢
                        </div>

                        <div>
                            <strong>
                                Built For You
                            </strong>

                            <span>
                                Modern and friendly experience
                            </span>
                        </div>

                    </div>

                </section>

            )}

        </main>
    );
};


/* =========================================================
   HELPER
========================================================= */

const brandName = (brand) => {
    return brand || "Buyings";
};

export default Home;