import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../Context/Context";
import "./CartToast.css";

const API_BASE_URL = "http://localhost:8080";

const CartToast = () => {

    const navigate = useNavigate();

    const {
        cartMessage,
        clearCartMessage
    } = useContext(AppContext);


    useEffect(() => {

        if (!cartMessage) {
            return;
        }

        const timer = setTimeout(() => {
            clearCartMessage();
        }, 4000);

        return () => clearTimeout(timer);

    }, [cartMessage, clearCartMessage]);


    if (!cartMessage) {
        return null;
    }


    const imageUrl =
        `${API_BASE_URL}/api/product/${cartMessage.imageId}/image`;


    const handleViewCart = () => {

        clearCartMessage();

        navigate("/cart");
    };


    const handleContinueShopping = () => {

        clearCartMessage();

    };


    return (

        <div className="premium-cart-toast-wrapper">

            <div className="premium-cart-toast">

                {/* CLOSE */}

                <button
                    type="button"
                    className="cart-toast-close"
                    onClick={clearCartMessage}
                    aria-label="Close"
                >
                    ×
                </button>


                {/* SUCCESS ICON */}

                <div className="cart-toast-success">

                    <div className="cart-success-circle">

                        <svg
                            viewBox="0 0 24 24"
                            className="cart-check-icon"
                        >
                            <path
                                d="M5 12.5L9.5 17L19 7"
                            />
                        </svg>

                    </div>

                </div>


                {/* PRODUCT IMAGE */}

                <div className="cart-toast-image">

                    <img
                        src={imageUrl}
                        alt={cartMessage.name}
                        onError={(event) => {
                            event.currentTarget.style.display =
                                "none";
                        }}
                    />

                </div>


                {/* CONTENT */}

                <div className="cart-toast-content">

                    <span className="cart-toast-label">
                        ADDED TO CART
                    </span>

                    <h3>
                        {cartMessage.name}
                    </h3>

                    <div className="cart-toast-info">

                        <span>
                            Quantity:{" "}
                            <strong>
                                {cartMessage.quantity}
                            </strong>
                        </span>

                        <span className="cart-toast-dot">
                            •
                        </span>

                        <span>
                            ₹
                            {Number(
                                cartMessage.price *
                                cartMessage.quantity
                            ).toLocaleString("en-IN")}
                        </span>

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="cart-toast-actions">

                    <button
                        type="button"
                        className="cart-toast-view"
                        onClick={handleViewCart}
                    >
                        View Cart
                        <span>→</span>
                    </button>

                    <button
                        type="button"
                        className="cart-toast-continue"
                        onClick={handleContinueShopping}
                    >
                        Continue Shopping
                    </button>

                </div>


                {/* PROGRESS */}

                <div className="cart-toast-progress">
                    <div />
                </div>

            </div>

        </div>
    );
};

export default CartToast;