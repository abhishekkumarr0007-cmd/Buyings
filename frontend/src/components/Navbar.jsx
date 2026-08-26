import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import "./Navbar.css";

const Navbar = ({ onSelectCategory }) => {
    const navigate = useNavigate();

    // =========================
    // AUTHENTICATION
    // =========================

    const { token, role, logout } = useAuth();

    // =========================
    // THEME
    // =========================

    const getInitialTheme = () => {
        const storedTheme = localStorage.getItem("theme");
        return storedTheme || "light-theme";
    };

    const [theme, setTheme] = useState(getInitialTheme);

    // =========================
    // SEARCH
    // =========================

    const [input, setInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [noResults, setNoResults] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // =========================
    // MOBILE MENU
    // =========================

    const [mobileMenu, setMobileMenu] = useState(false);

    // =========================
    // CATEGORIES
    // =========================

    const categories = [
        "Laptop",
        "Headphone",
        "Mobile",
        "Electronics",
        "Toys",
        "Fashion"
    ];

    // =========================
    // THEME EFFECT
    // =========================

    useEffect(() => {
        document.body.className = theme;

        localStorage.setItem("theme", theme);
    }, [theme]);

    // =========================
    // FETCH PRODUCTS
    // =========================

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/products"
            );

            setSearchResults(response.data);

        } catch (error) {
            console.error(
                "Error fetching products:",
                error
            );
        }
    };

    // =========================
    // SEARCH
    // =========================

    const handleChange = async (value) => {
        setInput(value);

        if (value.trim().length >= 1) {

            setShowSearchResults(true);

            try {

                const response = await axios.get(
                    `http://localhost:8080/api/products/search?keyword=${encodeURIComponent(
                        value
                    )}`
                );

                setSearchResults(response.data);

                setNoResults(
                    response.data.length === 0
                );

            } catch (error) {

                console.error(
                    "Search error:",
                    error
                );

                setSearchResults([]);
                setNoResults(true);
            }

        } else {

            setShowSearchResults(false);
            setSearchResults([]);
            setNoResults(false);
        }
    };

    // =========================
    // CATEGORY
    // =========================

    const handleCategorySelect = (category) => {

        if (onSelectCategory) {
            onSelectCategory(category);
        }

        setMobileMenu(false);

        navigate("/");
    };

    // =========================
    // HOME
    // =========================

    const handleHomeClick = () => {

        if (onSelectCategory) {
            onSelectCategory("");
        }

        setInput("");
        setSearchResults([]);
        setShowSearchResults(false);

        setMobileMenu(false);

        navigate("/");
    };

    // =========================
    // THEME
    // =========================

    const toggleTheme = () => {

        const newTheme =
            theme === "dark-theme"
                ? "light-theme"
                : "dark-theme";

        setTheme(newTheme);
    };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        logout();

        if (onSelectCategory) {
            onSelectCategory("");
        }

        setMobileMenu(false);

        navigate("/login");
    };

    // =========================
    // CLOSE SEARCH
    // =========================

    const closeSearch = () => {

        setTimeout(() => {
            setShowSearchResults(false);
        }, 200);
    };

    return (
        <header className="premium-navbar">

            <div className="navbar-main">

                <div className="navbar-container">

                    {/* ================= BRAND ================= */}

                    <Link
                        to="/"
                        className="premium-brand"
                        onClick={handleHomeClick}
                    >

                        <span className="brand-mark">
                            B
                        </span>

                        <span className="brand-text">
                            Buyings
                        </span>

                    </Link>


                    {/* ================= DESKTOP NAV ================= */}

                    <nav className="desktop-navigation">

                        <button
                            className="premium-nav-link active"
                            onClick={handleHomeClick}
                        >
                            Home
                        </button>


                        <div className="category-wrapper">

                            <button
                                className="premium-nav-link category-button"
                            >
                                Categories

                                <i className="bi bi-chevron-down"></i>
                            </button>


                            <div className="category-dropdown">

                                <div className="category-dropdown-header">

                                    <span>
                                        SHOP BY CATEGORY
                                    </span>

                                    <h4>
                                        Explore Collections
                                    </h4>

                                </div>


                                <div className="category-grid">

                                    {categories.map(
                                        (category) => (

                                            <button
                                                key={category}
                                                onClick={() =>
                                                    handleCategorySelect(
                                                        category
                                                    )
                                                }
                                                className="category-item"
                                            >

                                                <span>
                                                    {category}
                                                </span>

                                                <i className="bi bi-arrow-up-right"></i>

                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                        </div>


                        {/* ================= CONTACT ================= */}

                        {role === "ADMIN" ? (

                            <button
                                className="premium-nav-link"
                                onClick={() => {
                                    setMobileMenu(false);
                                    navigate("/admin/contact-messages");
                                }}
                            >
                                Messages
                            </button>

                        ) : (

                            <Link
                                to="/contact"
                                className="premium-nav-link"
                            >
                                Contact
                            </Link>

                        )}

                    </nav>


                    {/* ================= SEARCH ================= */}

                    <div className="premium-search">

                        <i className="bi bi-search"></i>

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={input}
                            onChange={(e) =>
                                handleChange(
                                    e.target.value
                                )
                            }
                            onFocus={() => {

                                if (
                                    input.length > 0
                                ) {
                                    setShowSearchResults(
                                        true
                                    );
                                }

                            }}
                            onBlur={() => {
                                setTimeout(() => {
                                    setShowSearchResults(false);
                                }, 300);
                            }}
                        />


                        {input && (

                            <button
                                className="search-clear"
                                onMouseDown={() => {

                                    setInput("");
                                    setShowSearchResults(
                                        false
                                    );

                                }}
                            >

                                <i className="bi bi-x"></i>

                            </button>

                        )}


                        {/* SEARCH RESULTS */}

                        {showSearchResults && (

                            <div className="premium-search-results">

                                {searchResults.length > 0 ? (

                                    searchResults.map(
                                        (result) => (

                                            <Link
                                                key={result.id}
                                                to={`/product/${result.id}`}
                                                className="search-result"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                }}
                                            >

                                                <div className="search-result-icon">

                                                    <i className="bi bi-box"></i>

                                                </div>

                                                <div>

                                                    <strong>
                                                        {
                                                            result.name
                                                        }
                                                    </strong>

                                                    <small>
                                                        View product
                                                    </small>

                                                </div>

                                                <i className="bi bi-arrow-up-right"></i>

                                            </Link>

                                        )
                                    )

                                ) : (

                                    noResults && (

                                        <div className="search-no-result">

                                            <i className="bi bi-search"></i>

                                            <span>
                                                No products found
                                            </span>

                                        </div>

                                    )

                                )}

                            </div>

                        )}

                    </div>


                    {/* ================= ACTIONS ================= */}

                    <div className="navbar-actions">

                        {/* THEME */}

                        <button
                            className="navbar-icon-button"
                            onClick={toggleTheme}
                            title="Toggle theme"
                        >

                            {theme === "dark-theme" ? (

                                <i className="bi bi-sun"></i>

                            ) : (

                                <i className="bi bi-moon"></i>

                            )}

                        </button>


                        {/* ACCOUNT */}

                        {token ? (

                            <Link
                                to="/account"
                                className="navbar-action"
                                title="Account"
                            >

                                <i className="bi bi-person"></i>

                                <span>
                                    Account
                                </span>

                            </Link>


                        ) : (

                            <Link
                                to="/login"
                                className="navbar-action"
                                title="Login"
                            >

                                <i className="bi bi-person"></i>

                                <span>
                                    Login
                                </span>

                            </Link>

                        )}



                        {/* ORDERS - HIDDEN FOR ADMIN */}




                        {/* CART - HIDDEN FOR ADMIN */}

                        {role !== "ADMIN" && (

                            <Link
                                to="/cart"
                                className="navbar-cart"
                                title="Shopping Cart"
                            >

                                <i className="bi bi-bag"></i>

                                <span>
                                    Cart
                                </span>

                            </Link>

                        )}


                        {/* ADMIN */}

                        {role === "ADMIN" && (

                            <Link
                                to="/admin"
                                className="admin-dashboard-button"
                            >

                                <i className="bi bi-grid"></i>

                                <span>
                                    Admin
                                </span>

                            </Link>

                        )}


                        {/* LOGOUT */}

                        {token && (

                            <button
                                className="navbar-logout"
                                onClick={handleLogout}
                                title="Logout"
                            >

                                <i className="bi bi-box-arrow-right"></i>

                            </button>

                        )}

                    </div>


                    {/* MOBILE BUTTON */}

                    <button
                        className="mobile-menu-button"
                        onClick={() =>
                            setMobileMenu(
                                !mobileMenu
                            )
                        }
                    >

                        {mobileMenu ? (

                            <i className="bi bi-x-lg"></i>

                        ) : (

                            <i className="bi bi-list"></i>

                        )}

                    </button>

                </div>

            </div>


            {/* ================= MOBILE MENU ================= */}

            {
                mobileMenu && (

                    <div className="mobile-navigation">

                        <button
                            onClick={handleHomeClick}
                        >
                            <i className="bi bi-house"></i>
                            Home
                        </button>


                        {/* MOBILE CONTACT */}

                        {role === "ADMIN" ? (

                            <button
                                onClick={() => {
                                    setMobileMenu(false);
                                    navigate("/admin/contact-messages");
                                }}
                            >
                                <i className="bi bi-headset"></i>
                                Contact
                            </button>

                        ) : (

                            <Link
                                to="/contact"
                                onClick={() =>
                                    setMobileMenu(false)
                                }
                            >
                                <i className="bi bi-headset"></i>
                                Contact Us
                            </Link>

                        )}


                        <div className="mobile-section-title">
                            CATEGORIES
                        </div>


                        {categories.map(
                            (category) => (

                                <button
                                    key={category}
                                    onClick={() =>
                                        handleCategorySelect(
                                            category
                                        )
                                    }
                                >

                                    <i className="bi bi-chevron-right"></i>
                                    {category}

                                </button>

                            )
                        )}


                        <div className="mobile-divider"></div>


                        {token ? (

                            <>

                                <Link
                                    to="/account"
                                    onClick={() =>
                                        setMobileMenu(false)
                                    }
                                >

                                    <i className="bi bi-person"></i>
                                    Account

                                </Link>

                                {role !== "ADMIN" && (
                                    <Link
                                        to="/cart"
                                        onClick={() => setMobileMenu(false)}
                                    >
                                        <i className="bi bi-bag"></i>
                                        Cart
                                    </Link>
                                )}

                                {/* ADMIN */}

                                {role === "ADMIN" && (

                                    <Link
                                        to="/admin"
                                        onClick={() =>
                                            setMobileMenu(
                                                false
                                            )
                                        }
                                    >

                                        <i className="bi bi-grid"></i>
                                        Admin Dashboard

                                    </Link>

                                )}


                                <button
                                    onClick={handleLogout}
                                >

                                    <i className="bi bi-box-arrow-right"></i>
                                    Logout

                                </button>

                            </>

                        ) : (

                            <>

                                <Link
                                    to="/login"
                                    onClick={() =>
                                        setMobileMenu(false)
                                    }
                                >

                                    <i className="bi bi-box-arrow-in-right"></i>
                                    Login

                                </Link>


                                <Link
                                    to="/signup"
                                    onClick={() =>
                                        setMobileMenu(false)
                                    }
                                >

                                    <i className="bi bi-person-plus"></i>
                                    Create Account

                                </Link>

                            </>

                        )}

                    </div>

                )
            }

        </header >
    );
};

export default Navbar;