import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import "./UserDashboard.css";

const UserDashboard = () => {
    const { token } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedOrder, setSelectedOrder] = useState(null);

    const [showReturn, setShowReturn] = useState(false);
    const [returnType, setReturnType] = useState("RETURN");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                "http://localhost:8080/orders/my-orders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setOrders(response.data);

        } catch (err) {
            console.error(err);
            setError("Unable to load your orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    const getStatusClass = (status) => {
        switch (status) {
            case "DELIVERED":
                return "status-delivered";

            case "OUT_FOR_DELIVERY":
                return "status-out";

            case "ON_THE_WAY":
            case "SHIPPED":
                return "status-shipped";

            case "CONFIRMED":
                return "status-confirmed";

            case "CANCELLED":
                return "status-cancelled";

            default:
                return "status-pending";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "PENDING":
                return "Order Placed";

            case "CONFIRMED":
                return "Confirmed";

            case "SHIPPED":
                return "Shipped";

            case "ON_THE_WAY":
                return "On The Way";

            case "OUT_FOR_DELIVERY":
                return "Out For Delivery";

            case "DELIVERED":
                return "Delivered";

            case "CANCELLED":
                return "Cancelled";

            default:
                return status;
        }
    };

    const openReturnExchange = (order, type) => {
        setSelectedOrder(order);
        setReturnType(type);
        setReason("");
        setShowReturn(true);
    };

    const submitReturnExchange = async () => {
        if (!reason.trim()) {
            alert("Please enter a reason.");
            return;
        }

        try {
            setSubmitting(true);

            await axios.post(
                `http://localhost:8080/orders/${selectedOrder.id}/return-exchange`,
                {
                    type: returnType,
                    reason: reason
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            alert(
                `${returnType === "RETURN"
                    ? "Return"
                    : "Exchange"} request submitted successfully.`
            );

            setShowReturn(false);
            setSelectedOrder(null);

            fetchOrders();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to submit request."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="user-dashboard-loading">
                <div className="dashboard-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="user-dashboard">

            {/* HEADER */}

            <section className="dashboard-header">

                <div>
                    <span>MY ACCOUNT</span>

                    <h1>
                        Your <strong>Orders</strong>
                    </h1>

                    <p>
                        Track your purchases, delivery status
                        and manage returns or exchanges.
                    </p>
                </div>

                <div className="order-count">
                    <strong>{orders.length}</strong>
                    <span>TOTAL ORDERS</span>
                </div>

            </section>


            {/* ERROR */}

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}


            {/* EMPTY */}

            {!error && orders.length === 0 && (
                <div className="orders-empty">

                    <div className="empty-order-icon">
                        <i className="bi bi-bag"></i>
                    </div>

                    <h2>No orders yet</h2>

                    <p>
                        Once you place an order,
                        it will appear here.
                    </p>

                    <button
                        onClick={() =>
                            window.location.href = "/"
                        }
                    >
                        START SHOPPING
                    </button>

                </div>
            )}


            {/* ORDERS */}

            <div className="orders-list">

                {orders.map((order) => (

                    <article
                        className="user-order-card"
                        key={order.id}
                    >

                        {/* ORDER TOP */}

                        <div className="order-top">

                            <div>
                                <span>ORDER</span>

                                <h3>
                                    #{order.id}
                                </h3>
                            </div>

                            <div className="order-date">
                                {new Date(
                                    order.orderDate
                                ).toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    }
                                )}
                            </div>

                            <div
                                className={`order-status ${getStatusClass(
                                    order.status
                                )}`}
                            >
                                <span></span>
                                {getStatusText(order.status)}
                            </div>

                        </div>


                        {/* TRACKING */}

                        <div className="tracking-section">

                            <div className="tracking-line">

                                <div
                                    className={
                                        order.status !==
                                            "PENDING" &&
                                        order.status !==
                                            "CANCELLED"
                                            ? "active"
                                            : ""
                                    }
                                >
                                    <span>✓</span>
                                    <small>PLACED</small>
                                </div>

                                <div
                                    className={
                                        [
                                            "CONFIRMED",
                                            "SHIPPED",
                                            "ON_THE_WAY",
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED"
                                        ].includes(order.status)
                                            ? "active"
                                            : ""
                                    }
                                >
                                    <span>✓</span>
                                    <small>CONFIRMED</small>
                                </div>

                                <div
                                    className={
                                        [
                                            "SHIPPED",
                                            "ON_THE_WAY",
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED"
                                        ].includes(order.status)
                                            ? "active"
                                            : ""
                                    }
                                >
                                    <span>✓</span>
                                    <small>SHIPPED</small>
                                </div>

                                <div
                                    className={
                                        [
                                            "ON_THE_WAY",
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED"
                                        ].includes(order.status)
                                            ? "active"
                                            : ""
                                    }
                                >
                                    <span>✓</span>
                                    <small>ON THE WAY</small>
                                </div>

                                <div
                                    className={
                                        [
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED"
                                        ].includes(order.status)
                                            ? "active"
                                            : ""
                                    }
                                >
                                    <span>✓</span>
                                    <small>OUT FOR DELIVERY</small>
                                </div>

                                <div
                                    className={
                                        order.status === "DELIVERED"
                                            ? "active"
                                            : ""
                                    }
                                >
                                    <span>✓</span>
                                    <small>DELIVERED</small>
                                </div>

                            </div>

                        </div>


                        {/* PRODUCTS */}

                        <div className="order-products">

                            {order.items?.map((item) => (

                                <div
                                    className="order-product"
                                    key={item.id}
                                >

                                    <div className="order-product-icon">
                                        <i className="bi bi-box"></i>
                                    </div>

                                    <div className="order-product-info">

                                        <strong>
                                            {item.productName}
                                        </strong>

                                        <span>
                                            Qty: {item.quantity}
                                        </span>

                                    </div>

                                    <strong>
                                        ₹{item.price}
                                    </strong>

                                </div>

                            ))}

                        </div>


                        {/* BOTTOM */}

                        <div className="order-bottom">

                            <div className="order-total">

                                <span>TOTAL</span>

                                <strong>
                                    ₹{order.totalAmount}
                                </strong>

                            </div>


                            {/* COURIER */}

                            {order.courierName && (
                                <div className="courier-info">

                                    <span>COURIER</span>

                                    <strong>
                                        {order.courierName}
                                    </strong>

                                    {order.trackingNumber && (
                                        <small>
                                            Tracking:{" "}
                                            {order.trackingNumber}
                                        </small>
                                    )}

                                </div>
                            )}


                            {/* TRACK */}

                            {order.trackingUrl &&
                                order.status !== "DELIVERED" &&
                                order.status !== "CANCELLED" && (

                                    <a
                                        href={order.trackingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="track-button"
                                    >
                                        <i className="bi bi-geo-alt"></i>
                                        TRACK ORDER
                                    </a>

                                )}


                            {/* RETURN / EXCHANGE */}

                            {order.status === "DELIVERED" && (

                                <div className="return-actions">

                                    {order.returnStatus ? (

                                        <div className="return-status">
                                            <i className="bi bi-clock"></i>
                                            {order.returnStatus
                                                .replaceAll("_", " ")}
                                        </div>

                                    ) : (

                                        <>
                                            <button
                                                className="return-button"
                                                onClick={() =>
                                                    openReturnExchange(
                                                        order,
                                                        "RETURN"
                                                    )
                                                }
                                            >
                                                RETURN
                                            </button>

                                            <button
                                                className="exchange-button"
                                                onClick={() =>
                                                    openReturnExchange(
                                                        order,
                                                        "EXCHANGE"
                                                    )
                                                }
                                            >
                                                EXCHANGE
                                            </button>
                                        </>

                                    )}

                                </div>

                            )}

                        </div>

                    </article>

                ))}

            </div>


            {/* HELP SECTION */}

            <section className="order-help">

                <div className="help-icon">
                    <i className="bi bi-headset"></i>
                </div>

                <div className="help-content">

                    <span>NEED HELP?</span>

                    <h2>
                        Something wrong with your order?
                    </h2>

                    <p>
                        Our support team is here to help
                        with delivery, returns, exchanges
                        and order issues.
                    </p>

                </div>

                <div className="help-actions">

                    <a
                        href="tel:+919999999999"
                        className="help-call"
                    >
                        <i className="bi bi-telephone"></i>
                        CALL SUPPORT
                    </a>

                    <a
                        href="mailto:support@buyings.com"
                        className="help-message"
                    >
                        <i className="bi bi-envelope"></i>
                        WRITE TO US
                    </a>

                </div>

            </section>


            {/* RETURN / EXCHANGE MODAL */}

            {showReturn && (

                <div
                    className="return-modal-overlay"
                    onClick={() =>
                        setShowReturn(false)
                    }
                >

                    <div
                        className="return-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            className="modal-close"
                            onClick={() =>
                                setShowReturn(false)
                            }
                        >
                            ×
                        </button>

                        <span>
                            ORDER #{selectedOrder?.id}
                        </span>

                        <h2>
                            {returnType === "RETURN"
                                ? "Return your order"
                                : "Exchange your order"}
                        </h2>

                        <p>
                            Tell us why you want to{" "}
                            {returnType === "RETURN"
                                ? "return"
                                : "exchange"}{" "}
                            this order.
                        </p>

                        <textarea
                            value={reason}
                            onChange={(e) =>
                                setReason(e.target.value)
                            }
                            placeholder="Describe the issue..."
                            rows="5"
                        />

                        <button
                            className="submit-return"
                            onClick={submitReturnExchange}
                            disabled={submitting}
                        >
                            {submitting
                                ? "SUBMITTING..."
                                : `SUBMIT ${returnType}`}
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
};

export default UserDashboard;