import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "./UserPages.css";


/* =========================================================
   DELIVERY STATUS STEPS
========================================================= */

const STATUS_STEPS = [
    {
        key: "PENDING",
        label: "Order Placed",
        icon: "bi-receipt"
    },
    {
        key: "CONFIRMED",
        label: "Confirmed",
        icon: "bi-check-circle"
    },
    {
        key: "SHIPPED",
        label: "Shipped",
        icon: "bi-box-seam"
    },
    {
        key: "ON_THE_WAY",
        label: "On the Way",
        icon: "bi-truck"
    },
    {
        key: "OUT_FOR_DELIVERY",
        label: "Out for Delivery",
        icon: "bi-bicycle"
    },
    {
        key: "DELIVERED",
        label: "Delivered",
        icon: "bi-house-check"
    }
];

/* =========================================================
   RETURN STATUS STEPS
========================================================= */

const RETURN_STEPS = [
    {
        key: "RETURN_REQUESTED",
        label: "Request Submitted",
        icon: "bi-send-check"
    },
    {
        key: "RETURN_APPROVED",
        label: "Return Approved",
        icon: "bi-check-circle"
    },
    {
        key: "RETURN_PICKUP_SCHEDULED",
        label: "Pickup Scheduled",
        icon: "bi-calendar-check"
    },
    {
        key: "RETURN_RECEIVED",
        label: "Product Received",
        icon: "bi-box-seam"
    },
    {
        key: "REFUND_INITIATED",
        label: "Refund Initiated",
        icon: "bi-cash-stack"
    },
    {
        key: "REFUNDED",
        label: "Refund Completed",
        icon: "bi-check2-circle"
    }
];

/* =========================================================
   EXCHANGE STATUS STEPS
========================================================= */

const EXCHANGE_STEPS = [
    {
        key: "EXCHANGE_REQUESTED",
        label: "Request Submitted",
        icon: "bi-send-check"
    },
    {
        key: "EXCHANGE_APPROVED",
        label: "Exchange Approved",
        icon: "bi-check-circle"
    },
    {
        key: "EXCHANGE_RECEIVED",
        label: "Exchange Completed",
        icon: "bi-arrow-repeat"
    }
];

/* =========================================================
   NORMALIZE STATUS
========================================================= */

const normalizeStatus = (status) => {
    if (!status) return "NONE";

    return String(status)
        .trim()
        .toUpperCase()
        .replaceAll(" ", "_")
        .replaceAll("-", "_");
};

/* =========================================================
   DELIVERY STATUS INDEX
========================================================= */

const getStatusIndex = (status) => {
    const normalizedStatus = normalizeStatus(status);

    const index = STATUS_STEPS.findIndex(
        step => step.key === normalizedStatus
    );

    return index === -1 ? 0 : index;
};

/* =========================================================
   RETURN STATUS INFORMATION
========================================================= */

const getReturnStatusInfo = (status) => {
    const normalizedStatus = normalizeStatus(status);

    const isExchange =
        normalizedStatus.startsWith("EXCHANGE_");

    const steps = isExchange
        ? EXCHANGE_STEPS
        : RETURN_STEPS;

    const index = steps.findIndex(
        step => step.key === normalizedStatus
    );

    return {
        status: normalizedStatus,
        index: index === -1 ? 0 : index,
        steps,
        isExchange
    };
};

/* =========================================================
   COMPONENT
========================================================= */

const MyOrders = () => {

    const { token } = useAuth();

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [openHelp, setOpenHelp] = useState(null);

    const [openReturn, setOpenReturn] = useState(null);

    const [openReturnStatus, setOpenReturnStatus] = useState(null);

    const [returnType, setReturnType] = useState("RETURN");

    const [returnReason, setReturnReason] = useState("");

    const [helpMessage, setHelpMessage] = useState("");

    const [submittingReturn, setSubmittingReturn] = useState(false);

    /* =====================================================
       FETCH ORDERS
    ===================================================== */

    useEffect(() => {

        if (!token) {
            setLoading(false);
            return;
        }

        // Initial load
        fetchOrders();

        // Automatically check for admin status updates
        const interval = setInterval(() => {
            fetchOrders(false);
        }, 5000);

        // Refresh immediately when user comes back to this tab
        const handleFocus = () => {
            fetchOrders(false);
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", handleFocus);
        };

    }, [token]);

    const fetchOrders = async (showLoading = true) => {

        if (!token) {
            setLoading(false);
            return;
        }

        try {

            if (showLoading) {
                setLoading(true);
            }

            setError("");

            const response = await api.get("/orders/my-orders");

            console.log(
                "MY ORDERS RESPONSE:",
                response.data
            );

            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "MY ORDERS ERROR:",
                err.response?.status,
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                "Unable to load your orders."
            );

        } finally {

            if (showLoading) {
                setLoading(false);
            }

        }
    };

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (date) => {

        if (!date) return "";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    /* =====================================================
       FORMAT STATUS
    ===================================================== */

    const formatStatus = (status) => {

        const normalized = normalizeStatus(status);

        if (
            !normalized ||
            normalized === "NONE"
        ) {
            return "";
        }

        return normalized
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                char => char.toUpperCase()
            );
    };

    /* =====================================================
       DELIVERY STATUS CLASS
    ===================================================== */

    const getStatusClass = (status) => {

        const normalizedStatus =
            normalizeStatus(status);

        if (normalizedStatus === "DELIVERED") {
            return "delivered";
        }

        if (normalizedStatus === "CANCELLED") {
            return "cancelled";
        }

        if (
            normalizedStatus === "OUT_FOR_DELIVERY" ||
            normalizedStatus === "ON_THE_WAY"
        ) {
            return "moving";
        }

        return "active";
    };

    /* =====================================================
       ORDER DELIVERED
    ===================================================== */

    const isOrderDelivered = (order) => {

        return (
            normalizeStatus(order?.status) ===
            "DELIVERED"
        );
    };

    /* =====================================================
       GET RETURN STATUS
    ===================================================== */

    const getOrderReturnStatus = (order) => {
        if (!order) return "NONE";

        // 1. Direct order.returnStatus
        if (order.returnStatus) {
            return normalizeStatus(order.returnStatus);
        }

        // 2. Direct order.returnRequest.status
        if (order.returnRequest?.status) {
            return normalizeStatus(order.returnRequest.status);
        }

        // 3. Direct order.returnRequest.returnStatus
        if (order.returnRequest?.returnStatus) {
            return normalizeStatus(order.returnRequest.returnStatus);
        }

        // 4. If backend returns returnRequests as an array
        if (
            Array.isArray(order.returnRequests) &&
            order.returnRequests.length > 0
        ) {
            const latestRequest =
                [...order.returnRequests]
                    .sort((a, b) => {
                        const dateA = new Date(
                            a.createdAt || a.requestDate || 0
                        ).getTime();

                        const dateB = new Date(
                            b.createdAt || b.requestDate || 0
                        ).getTime();

                        return dateB - dateA;
                    })[0];

            if (latestRequest?.status) {
                return normalizeStatus(latestRequest.status);
            }

            if (latestRequest?.returnStatus) {
                return normalizeStatus(
                    latestRequest.returnStatus
                );
            }
        }

        // 5. Sometimes backend may return a single request
        // under another property
        if (order.returnRequestResponse?.status) {
            return normalizeStatus(
                order.returnRequestResponse.status
            );
        }

        return "NONE";
    };

    /* =====================================================
       HAS RETURN REQUEST
    ===================================================== */

    const hasReturnRequest = (order) => {

        const status =
            getOrderReturnStatus(order);

        return (
            status !== "NONE" &&
            status !== ""
        );
    };

    /* =====================================================
       GET RETURN TYPE
    ===================================================== */

    const getReturnTypeFromStatus = (status) => {

        const normalizedStatus =
            normalizeStatus(status);

        if (
            normalizedStatus.startsWith(
                "EXCHANGE_"
            )
        ) {
            return "EXCHANGE";
        }

        return "RETURN";
    };

    /* =====================================================
       RETURN REQUEST ACTIVE
    ===================================================== */

    const isReturnRequestActive = (status) => {

        const normalizedStatus =
            normalizeStatus(status);

        const terminalStatuses = [
            "RETURN_REJECTED",
            "EXCHANGE_REJECTED",
            "REFUNDED",
            "EXCHANGE_RECEIVED"
        ];

        return (
            normalizedStatus !== "NONE" &&
            normalizedStatus !== "" &&
            !terminalStatuses.includes(
                normalizedStatus
            )
        );
    };

    /* =====================================================
       RETURN REJECTED
    ===================================================== */

    const isReturnRejected = (status) => {

        const normalizedStatus =
            normalizeStatus(status);

        return (
            normalizedStatus ===
            "RETURN_REJECTED" ||
            normalizedStatus ===
            "EXCHANGE_REJECTED"
        );
    };

    /* =====================================================
       RETURN COMPLETED
    ===================================================== */

    const isReturnCompleted = (status) => {

        const normalizedStatus =
            normalizeStatus(status);

        return (
            normalizedStatus ===
            "REFUNDED" ||
            normalizedStatus ===
            "EXCHANGE_RECEIVED"
        );
    };

    /* =====================================================
       GET RETURN REASON
    ===================================================== */

    const getReturnReason = (order) => {
        if (!order) return "";

        if (order.returnReason) {
            return order.returnReason;
        }

        if (order.returnRequest?.reason) {
            return order.returnRequest.reason;
        }

        if (order.returnRequest?.returnReason) {
            return order.returnRequest.returnReason;
        }

        if (
            Array.isArray(order.returnRequests) &&
            order.returnRequests.length > 0
        ) {
            const latestRequest =
                [...order.returnRequests]
                    .sort((a, b) => {
                        const dateA = new Date(
                            a.createdAt || a.requestDate || 0
                        ).getTime();

                        const dateB = new Date(
                            b.createdAt || b.requestDate || 0
                        ).getTime();

                        return dateB - dateA;
                    })[0];

            return (
                latestRequest?.reason ||
                latestRequest?.returnReason ||
                ""
            );
        }

        return "";
    };

    /* =====================================================
       GET REFUND AMOUNT
    ===================================================== */

    const getRefundAmount = (order) => {

        const amount =
            order?.refundAmount ??
            order?.returnRequest?.refundAmount ??
            order?.totalAmount ??
            0;

        return Number(amount) || 0;
    };

    /* =====================================================
       SUBMIT HELP
    ===================================================== */

    const submitHelp = async (order) => {

        if (!helpMessage.trim()) {

            alert(
                "Please enter your message."
            );

            return;
        }

        try {

            const email =
                localStorage.getItem("email") ||
                "";

            const name =
                localStorage.getItem("name") ||
                localStorage.getItem("userName") ||
                "Customer";

            const messageData = {

                name: name,

                email: email,

                orderId: String(order.id),

                category: "ORDER",

                message:
                    `Order Support Request\n\n` +
                    `Order ID: #${order.id}\n\n` +
                    helpMessage.trim()
            };

            await api.post(
                "/contact",
                messageData
            );

            alert(
                `Your support request for Order #${order.id} has been sent successfully.`
            );

            setHelpMessage("");

            setOpenHelp(null);

        } catch (err) {

            console.error(
                "ORDER SUPPORT ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to submit your support request. Please try again."
            );
        }
    };

    /* =====================================================
       SUBMIT RETURN / EXCHANGE
    ===================================================== */

    const submitReturnExchange = async (order) => {

        if (!returnReason.trim()) {

            alert(
                "Please enter a reason."
            );

            return;
        }

        if (submittingReturn) {
            return;
        }

        try {

            setSubmittingReturn(true);

            const requestData = {

                type: returnType,

                reason: returnReason.trim()

            };

            console.log(
                "SUBMITTING RETURN/EXCHANGE:",
                {
                    orderId: order.id,
                    requestData
                }
            );

            /*
             * Backend endpoint:
             *
             * POST
             * /orders/{orderId}/return-exchange
             */

            const response =
                await api.post(
                    `/orders/${order.id}/return-exchange`,
                    requestData
                );

            console.log(
                "RETURN REQUEST SUCCESS:",
                response.data
            );

            alert(
                `${returnType === "RETURN"
                    ? "Return"
                    : "Exchange"
                } request for Order #${order.id} has been submitted successfully.`
            );

            setReturnReason("");

            setReturnType("RETURN");

            setOpenReturn(null);

            /*
             * Refresh orders so customer immediately
             * sees RETURN_REQUESTED / EXCHANGE_REQUESTED.
             */

            await fetchOrders();

        } catch (err) {

            console.error(
                "RETURN/EXCHANGE ERROR:",
                err
            );

            console.error(
                "STATUS:",
                err.response?.status
            );

            console.error(
                "DATA:",
                err.response?.data
            );

            alert(
                typeof err.response?.data === "string"
                    ? err.response.data
                    : err.response?.data?.message ||
                    "Unable to submit your request. Please try again."
            );

        } finally {

            setSubmittingReturn(false);

        }
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="orders-page">

                <div className="orders-container">

                    <div className="orders-loading">

                        <div className="spinner-border"></div>

                        <p>
                            Loading your orders...
                        </p>

                    </div>

                </div>

            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div className="orders-page">

                <div className="orders-container">

                    <div className="orders-error">

                        <i className="bi bi-exclamation-circle"></i>

                        <h2>
                            Unable to load orders
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={fetchOrders}
                            className="orders-retry"
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    /* =====================================================
       MAIN UI
    ===================================================== */

    return (

        <div className="orders-page">

            <div className="orders-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="orders-header">

                    <div>

                        <span>
                            YOUR SHOPPING
                        </span>

                        <h1>
                            My Orders
                        </h1>

                        <p>
                            Track your purchases and manage your orders.
                        </p>

                    </div>

                    <Link
                        to="/"
                        className="continue-shopping"
                    >
                        Continue Shopping →
                    </Link>

                </div>

                {/* =================================================
                    EMPTY
                ================================================= */}

                {orders.length === 0 ? (

                    <div className="orders-empty">

                        <div className="empty-order-icon">

                            <i className="bi bi-box-seam"></i>

                        </div>

                        <h2>
                            No orders yet
                        </h2>

                        <p>
                            Your purchased products will appear here.
                        </p>

                        <Link
                            to="/"
                            className="shop-now-button"
                        >
                            Start Shopping
                        </Link>

                    </div>

                ) : (

                    <div className="orders-list">

                        {orders.map((order) => {

                            /* =====================================
                               DELIVERY
                            ===================================== */

                            const currentIndex =
                                getStatusIndex(
                                    order.status
                                );

                            const normalizedOrderStatus =
                                normalizeStatus(
                                    order.status
                                );

                            const isCancelled =
                                normalizedOrderStatus ===
                                "CANCELLED";

                            /* =====================================
                               RETURN
                            ===================================== */

                            const returnStatus =
                                getOrderReturnStatus(
                                    order
                                );

                            const hasReturn =
                                hasReturnRequest(
                                    order
                                );

                            const returnTypeForOrder =
                                getReturnTypeFromStatus(
                                    returnStatus
                                );

                            const returnTimeline =
                                getReturnStatusInfo(
                                    returnStatus
                                );

                            const returnReasonFromOrder =
                                getReturnReason(
                                    order
                                );

                            const refundAmount =
                                getRefundAmount(
                                    order
                                );

                            return (

                                <div
                                    className="order-card"
                                    key={order.id}
                                >

                                    {/* =================================================
                                        ORDER TOP
                                    ================================================= */}

                                    <div className="order-top">

                                        <div>

                                            <span>
                                                ORDER
                                            </span>

                                            <h2>
                                                #{order.id}
                                            </h2>

                                        </div>

                                        <div className="order-date">

                                            <span>
                                                ORDERED
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    order.orderDate
                                                )}
                                            </strong>

                                        </div>

                                        <div className="order-total">

                                            <span>
                                                TOTAL
                                            </span>

                                            <strong>
                                                ₹
                                                {Number(
                                                    order.totalAmount
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                    {/* =================================================
                                        DELIVERY STATUS
                                    ================================================= */}

                                    <div className="order-status-section">

                                        <div className="status-heading">

                                            <div>

                                                <span>
                                                    DELIVERY STATUS
                                                </span>

                                                <h3>
                                                    {formatStatus(
                                                        normalizedOrderStatus
                                                    )}
                                                </h3>

                                            </div>

                                            <div
                                                className={
                                                    `status-pill ${getStatusClass(
                                                        normalizedOrderStatus
                                                    )}`
                                                }
                                            >
                                                {formatStatus(
                                                    normalizedOrderStatus
                                                )}
                                            </div>

                                        </div>

                                        {!isCancelled && (

                                            <div className="status-timeline">

                                                {STATUS_STEPS.map(
                                                    (
                                                        step,
                                                        index
                                                    ) => {

                                                        const completed =
                                                            index <=
                                                            currentIndex;

                                                        return (

                                                            <div
                                                                key={
                                                                    step.key
                                                                }
                                                                className={
                                                                    `status-step ${completed
                                                                        ? "completed"
                                                                        : ""
                                                                    }`
                                                                }
                                                            >

                                                                <div className="status-circle">

                                                                    <i
                                                                        className={
                                                                            `bi ${step.icon}`
                                                                        }
                                                                    ></i>

                                                                </div>

                                                                <span>
                                                                    {
                                                                        step.label
                                                                    }
                                                                </span>

                                                                {index <
                                                                    STATUS_STEPS.length -
                                                                    1 && (

                                                                        <div
                                                                            className={
                                                                                `status-line ${index <
                                                                                    currentIndex
                                                                                    ? "completed"
                                                                                    : ""
                                                                                }`
                                                                            }
                                                                        />

                                                                    )}

                                                            </div>
                                                        );
                                                    }
                                                )}

                                            </div>
                                        )}

                                        {isCancelled && (

                                            <div className="cancelled-message">

                                                <i className="bi bi-x-circle"></i>

                                                This order has been cancelled.

                                            </div>
                                        )}

                                    </div>

                                    {/* =================================================
                                        ORDER ITEMS
                                    ================================================= */}

                                    <div className="order-items">

                                        <div className="items-title">
                                            ORDER ITEMS
                                        </div>

                                        {order.items?.map(
                                            (item) => (

                                                <div
                                                    className="order-item"
                                                    key={item.id}
                                                >

                                                    <div className="item-image">

                                                        <i className="bi bi-image"></i>

                                                    </div>

                                                    <div className="item-info">

                                                        <strong>
                                                            {
                                                                item.productName
                                                            }
                                                        </strong>

                                                        <span>
                                                            Qty:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>

                                                    </div>

                                                    <strong className="item-price">

                                                        ₹
                                                        {Number(
                                                            item.price
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}

                                                    </strong>

                                                </div>
                                            )
                                        )}

                                    </div>

                                    {/* =================================================
                                        ORDER ACTIONS
                                    ================================================= */}

                                    <div className="order-actions">

                                        {/* TRACK PACKAGE */}

                                        {order.trackingUrl ? (

                                            <a
                                                href={
                                                    order.trackingUrl
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="order-action-btn track-action"
                                            >

                                                <span className="action-icon">

                                                    <i className="bi bi-geo-alt-fill"></i>

                                                </span>

                                                <span className="action-content">

                                                    <strong>
                                                        Track Package
                                                    </strong>

                                                    <small>
                                                        View live delivery tracking
                                                    </small>

                                                </span>

                                                <i className="bi bi-arrow-up-right"></i>

                                            </a>

                                        ) : (

                                            !isOrderDelivered(order) &&
                                            !isCancelled && (

                                                <button
                                                    type="button"
                                                    className="order-action-btn track-action disabled-action"
                                                    disabled
                                                >

                                                    <span className="action-icon">

                                                        <i className="bi bi-clock"></i>

                                                    </span>

                                                    <span className="action-content">

                                                        <strong>
                                                            Tracking Coming Soon
                                                        </strong>

                                                        <small>
                                                            Tracking will be available after dispatch
                                                        </small>

                                                    </span>

                                                </button>
                                            )
                                        )}

                                        {/* =================================================
                                            RETURN / EXCHANGE BUTTON
                                        ================================================= */}

                                        {isOrderDelivered(order) &&
                                            !hasReturn && (

                                                <button
                                                    type="button"
                                                    className="order-action-btn return-action"
                                                    onClick={() => {

                                                        setOpenReturn(
                                                            order.id
                                                        );

                                                        setReturnType(
                                                            "RETURN"
                                                        );

                                                        setReturnReason(
                                                            ""
                                                        );

                                                    }}
                                                >

                                                    <span className="action-icon">

                                                        <i className="bi bi-arrow-return-left"></i>

                                                    </span>

                                                    <span className="action-content">

                                                        <strong>
                                                            Return or Exchange
                                                        </strong>

                                                        <small>
                                                            Return an item or request an exchange
                                                        </small>

                                                    </span>

                                                    <i className="bi bi-chevron-right"></i>

                                                </button>
                                            )}

                                        {/* =================================================
                                            RETURN STATUS BUTTON
                                        ================================================= */}

                                        {hasReturn && (

                                            <button
                                                type="button"
                                                className={
                                                    `order-action-btn return-status-action ${isReturnRejected(
                                                        returnStatus
                                                    )
                                                        ? "return-rejected"
                                                        : isReturnCompleted(
                                                            returnStatus
                                                        )
                                                            ? "return-completed"
                                                            : "return-processing"
                                                    }`
                                                }
                                                onClick={() => {

                                                    setOpenReturnStatus(
                                                        openReturnStatus ===
                                                            order.id
                                                            ? null
                                                            : order.id
                                                    );

                                                }}
                                            >

                                                <span className="action-icon">

                                                    <i
                                                        className={
                                                            returnTypeForOrder ===
                                                                "EXCHANGE"
                                                                ? "bi bi-arrow-repeat"
                                                                : "bi bi-arrow-return-left"
                                                        }
                                                    ></i>

                                                </span>

                                                <span className="action-content">

                                                    <strong>

                                                        {returnTypeForOrder ===
                                                            "EXCHANGE"
                                                            ? "Exchange Status"
                                                            : "Return Status"}

                                                    </strong>

                                                    <small>

                                                        {formatStatus(
                                                            returnStatus
                                                        )}

                                                    </small>

                                                </span>

                                                <i
                                                    className={
                                                        `bi ${openReturnStatus ===
                                                            order.id
                                                            ? "bi-chevron-up"
                                                            : "bi-chevron-down"
                                                        }`
                                                    }
                                                ></i>

                                            </button>
                                        )}

                                        {/* =================================================
                                            HELP
                                        ================================================= */}

                                        <button
                                            type="button"
                                            className="order-action-btn help-action"
                                            onClick={() =>
                                                setOpenHelp(
                                                    openHelp ===
                                                        order.id
                                                        ? null
                                                        : order.id
                                                )
                                            }
                                        >

                                            <span className="action-icon">

                                                <i className="bi bi-headset"></i>

                                            </span>

                                            <span className="action-content">

                                                <strong>
                                                    Help with Order
                                                </strong>

                                                <small>
                                                    Contact our support team
                                                </small>

                                            </span>

                                            <i className="bi bi-chevron-right"></i>

                                        </button>

                                    </div>

                                    {/* =================================================
                                        CUSTOMER RETURN / EXCHANGE STATUS PANEL
                                    ================================================= */}

                                    {hasReturn &&
                                        openReturnStatus ===
                                        order.id && (

                                            <div className="return-tracking-panel">

                                                {/* HEADER */}

                                                <div className="return-tracking-header">

                                                    <div>

                                                        <span>
                                                            {returnTypeForOrder ===
                                                                "EXCHANGE"
                                                                ? "EXCHANGE REQUEST"
                                                                : "RETURN REQUEST"}
                                                        </span>

                                                        <h3>
                                                            {formatStatus(
                                                                returnStatus
                                                            )}
                                                        </h3>

                                                    </div>

                                                    <div
                                                        className={
                                                            `return-status-badge ${isReturnRejected(
                                                                returnStatus
                                                            )
                                                                ? "rejected"
                                                                : isReturnCompleted(
                                                                    returnStatus
                                                                )
                                                                    ? "completed"
                                                                    : "processing"
                                                            }`
                                                        }
                                                    >
                                                        {formatStatus(
                                                            returnStatus
                                                        )}
                                                    </div>

                                                </div>

                                                {/* =================================================
                                                    REJECTED
                                                ================================================= */}

                                                {isReturnRejected(
                                                    returnStatus
                                                ) ? (

                                                    <div className="return-rejected-message">

                                                        <div className="return-message-icon">

                                                            <i className="bi bi-x-circle-fill"></i>

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                Request Not Approved
                                                            </strong>

                                                            <p>
                                                                Unfortunately, your{" "}
                                                                {returnTypeForOrder.toLowerCase()}{" "}
                                                                request was not approved by our team.
                                                            </p>

                                                            {returnReasonFromOrder && (

                                                                <small>

                                                                    <b>
                                                                        Reason submitted:
                                                                    </b>{" "}

                                                                    {
                                                                        returnReasonFromOrder
                                                                    }

                                                                </small>

                                                            )}

                                                        </div>

                                                    </div>

                                                ) : (

                                                    <>

                                                        {/* =================================================
                                                            STATUS PROGRESS
                                                        ================================================= */}

                                                        <div className="return-status-timeline">

                                                            {returnTimeline.steps.map(
                                                                (
                                                                    step,
                                                                    index
                                                                ) => {

                                                                    const completed =
                                                                        index <=
                                                                        returnTimeline.index;

                                                                    const current =
                                                                        index ===
                                                                        returnTimeline.index;

                                                                    return (

                                                                        <div
                                                                            key={
                                                                                step.key
                                                                            }
                                                                            className={
                                                                                `return-status-step ${completed
                                                                                    ? "completed"
                                                                                    : ""
                                                                                } ${current
                                                                                    ? "current"
                                                                                    : ""
                                                                                }`
                                                                            }
                                                                        >

                                                                            <div className="return-status-circle">

                                                                                <i
                                                                                    className={
                                                                                        `bi ${step.icon}`
                                                                                    }
                                                                                ></i>

                                                                            </div>

                                                                            <div className="return-status-step-content">

                                                                                <strong>
                                                                                    {
                                                                                        step.label
                                                                                    }
                                                                                </strong>

                                                                                {completed &&
                                                                                    current && (

                                                                                        <small>
                                                                                            Current status
                                                                                        </small>
                                                                                    )}

                                                                            </div>

                                                                            {index <
                                                                                returnTimeline.steps.length -
                                                                                1 && (

                                                                                    <div
                                                                                        className={
                                                                                            `return-status-line ${index <
                                                                                                returnTimeline.index
                                                                                                ? "completed"
                                                                                                : ""
                                                                                            }`
                                                                                        }
                                                                                    />

                                                                                )}

                                                                        </div>
                                                                    );
                                                                }
                                                            )}

                                                        </div>

                                                        {/* =================================================
                                                            CURRENT STATUS MESSAGE
                                                        ================================================= */}

                                                        <div className="return-current-status">

                                                            <div className="return-current-status-icon">

                                                                <i
                                                                    className={
                                                                        isReturnCompleted(
                                                                            returnStatus
                                                                        )
                                                                            ? "bi bi-check-circle-fill"
                                                                            : "bi bi-clock-history"
                                                                    }
                                                                ></i>

                                                            </div>

                                                            <div>

                                                                <span>
                                                                    CURRENT STATUS
                                                                </span>

                                                                <strong>
                                                                    {formatStatus(
                                                                        returnStatus
                                                                    )}
                                                                </strong>

                                                                <p>

                                                                    {returnStatus ===
                                                                        "RETURN_REQUESTED" &&
                                                                        "Your return request has been submitted and is waiting for our team to review it."}

                                                                    {returnStatus ===
                                                                        "RETURN_APPROVED" &&
                                                                        "Your return request has been approved. Pickup arrangements will be made shortly."}

                                                                    {returnStatus ===
                                                                        "RETURN_PICKUP_SCHEDULED" &&
                                                                        "Your return pickup has been scheduled. Please keep the product ready."}

                                                                    {returnStatus ===
                                                                        "RETURN_RECEIVED" &&
                                                                        "We have received your returned product. Your refund will be processed next."}

                                                                    {returnStatus ===
                                                                        "REFUND_INITIATED" &&
                                                                        "Your refund has been initiated and is being processed by your payment provider."}

                                                                    {returnStatus ===
                                                                        "REFUNDED" &&
                                                                        "Your refund has been completed successfully."}

                                                                    {returnStatus ===
                                                                        "EXCHANGE_REQUESTED" &&
                                                                        "Your exchange request has been submitted and is waiting for approval."}

                                                                    {returnStatus ===
                                                                        "EXCHANGE_APPROVED" &&
                                                                        "Your exchange request has been approved. Your replacement product is being processed."}

                                                                    {returnStatus ===
                                                                        "EXCHANGE_RECEIVED" &&
                                                                        "Your exchange has been completed successfully."}

                                                                </p>

                                                            </div>

                                                        </div>

                                                        {/* =================================================
                                                            RETURN REASON
                                                        ================================================= */}

                                                        {returnReasonFromOrder && (

                                                            <div className="return-reason-display">

                                                                <span>
                                                                    YOUR REASON
                                                                </span>

                                                                <p>
                                                                    {
                                                                        returnReasonFromOrder
                                                                    }
                                                                </p>

                                                            </div>
                                                        )}

                                                        {/* =================================================
                                                            REFUND INITIATED
                                                        ================================================= */}

                                                        {returnStatus ===
                                                            "REFUND_INITIATED" && (

                                                                <div className="refund-info-card">

                                                                    <div className="refund-icon">

                                                                        <i className="bi bi-cash-stack"></i>

                                                                    </div>

                                                                    <div>

                                                                        <span>
                                                                            REFUND INITIATED
                                                                        </span>

                                                                        <strong>

                                                                            ₹
                                                                            {refundAmount.toLocaleString(
                                                                                "en-IN"
                                                                            )}

                                                                        </strong>

                                                                        <small>
                                                                            Your refund has been initiated. Please allow your payment provider some time to process it.
                                                                        </small>

                                                                    </div>

                                                                </div>
                                                            )}

                                                        {/* =================================================
                                                            REFUND COMPLETED
                                                        ================================================= */}

                                                        {returnStatus ===
                                                            "REFUNDED" && (

                                                                <div className="refund-info-card refund-complete">

                                                                    <div className="refund-icon">

                                                                        <i className="bi bi-check2-circle"></i>

                                                                    </div>

                                                                    <div>

                                                                        <span>
                                                                            REFUND COMPLETED
                                                                        </span>

                                                                        <strong>

                                                                            ₹
                                                                            {refundAmount.toLocaleString(
                                                                                "en-IN"
                                                                            )}

                                                                        </strong>

                                                                        <small>
                                                                            Your refund has been successfully processed.
                                                                        </small>

                                                                    </div>

                                                                </div>
                                                            )}

                                                        {/* =================================================
                                                            EXCHANGE COMPLETED
                                                        ================================================= */}

                                                        {returnStatus ===
                                                            "EXCHANGE_RECEIVED" && (

                                                                <div className="exchange-complete-message">

                                                                    <i className="bi bi-check-circle-fill"></i>

                                                                    <div>

                                                                        <strong>
                                                                            Exchange Completed
                                                                        </strong>

                                                                        <p>
                                                                            Your replacement product has been processed successfully.
                                                                        </p>

                                                                    </div>

                                                                </div>
                                                            )}

                                                    </>
                                                )}

                                            </div>
                                        )}

                                    {/* =================================================
                                        HELP PANEL
                                    ================================================= */}

                                    {openHelp ===
                                        order.id && (

                                            <div className="order-help-panel">

                                                <div>

                                                    <span>
                                                        ORDER SUPPORT
                                                    </span>

                                                    <h3>
                                                        Need help with this order?
                                                    </h3>

                                                    <p>
                                                        Tell us what went wrong
                                                        and our support team will
                                                        help you.
                                                    </p>

                                                </div>

                                                <textarea
                                                    value={
                                                        helpMessage
                                                    }
                                                    onChange={(e) =>
                                                        setHelpMessage(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Describe your issue..."
                                                />

                                                <div className="help-actions">

                                                    <a
                                                        href="tel:+919999999999"
                                                        className="call-support"
                                                    >

                                                        <i className="bi bi-telephone"></i>

                                                        Call Support

                                                    </a>

                                                    <button
                                                        onClick={() =>
                                                            submitHelp(
                                                                order
                                                            )
                                                        }
                                                    >
                                                        Send Message
                                                    </button>

                                                </div>

                                            </div>
                                        )}

                                    {/* =================================================
                                        RETURN REQUEST PANEL
                                    ================================================= */}

                                    {openReturn ===
                                        order.id && (

                                            <div className="return-panel">

                                                <div className="return-panel-header">

                                                    <div className="return-panel-icon">

                                                        <i className="bi bi-arrow-return-left"></i>

                                                    </div>

                                                    <div>

                                                        <span>
                                                            RETURNS & EXCHANGES
                                                        </span>

                                                        <h3>
                                                            How can we help with this order?
                                                        </h3>

                                                        <p>
                                                            Choose whether you want
                                                            to return the product
                                                            or exchange it.
                                                        </p>

                                                    </div>

                                                </div>

                                                {/* RETURN / EXCHANGE */}

                                                <div className="return-options">

                                                    <button
                                                        type="button"
                                                        className={
                                                            returnType ===
                                                                "RETURN"
                                                                ? "return-option selected"
                                                                : "return-option"
                                                        }
                                                        onClick={() =>
                                                            setReturnType(
                                                                "RETURN"
                                                            )
                                                        }
                                                    >

                                                        <div className="return-option-icon">

                                                            <i className="bi bi-box-arrow-left"></i>

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                Return
                                                            </strong>

                                                            <span>
                                                                Send the product back
                                                            </span>

                                                        </div>

                                                        {returnType ===
                                                            "RETURN" && (

                                                                <i className="bi bi-check-circle-fill option-check"></i>
                                                            )}

                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={
                                                            returnType ===
                                                                "EXCHANGE"
                                                                ? "return-option selected"
                                                                : "return-option"
                                                        }
                                                        onClick={() =>
                                                            setReturnType(
                                                                "EXCHANGE"
                                                            )
                                                        }
                                                    >

                                                        <div className="return-option-icon">

                                                            <i className="bi bi-arrow-repeat"></i>

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                Exchange
                                                            </strong>

                                                            <span>
                                                                Replace with another item
                                                            </span>

                                                        </div>

                                                        {returnType ===
                                                            "EXCHANGE" && (

                                                                <i className="bi bi-check-circle-fill option-check"></i>
                                                            )}

                                                    </button>

                                                </div>

                                                {/* REASON */}

                                                <div className="return-reason-field">

                                                    <label>
                                                        Reason for{" "}
                                                        {returnType ===
                                                            "RETURN"
                                                            ? "return"
                                                            : "exchange"}
                                                    </label>

                                                    <textarea
                                                        value={
                                                            returnReason
                                                        }
                                                        onChange={(e) =>
                                                            setReturnReason(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={
                                                            returnType ===
                                                                "RETURN"
                                                                ? "Tell us why you want to return this product..."
                                                                : "Tell us why you want to exchange this product..."
                                                        }
                                                        maxLength={500}
                                                    />

                                                    <div className="return-character-count">

                                                        {
                                                            returnReason.length
                                                        }
                                                        /500

                                                    </div>

                                                </div>

                                                {/* ACTIONS */}

                                                <div className="return-panel-actions">

                                                    <button
                                                        type="button"
                                                        className="return-cancel-btn"
                                                        disabled={
                                                            submittingReturn
                                                        }
                                                        onClick={() => {

                                                            setOpenReturn(
                                                                null
                                                            );

                                                            setReturnReason(
                                                                ""
                                                            );

                                                            setReturnType(
                                                                "RETURN"
                                                            );

                                                        }}
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="submit-return"
                                                        disabled={
                                                            !returnReason.trim() ||
                                                            submittingReturn
                                                        }
                                                        onClick={() =>
                                                            submitReturnExchange(
                                                                order
                                                            )
                                                        }
                                                    >

                                                        <i
                                                            className={
                                                                submittingReturn
                                                                    ? "bi bi-hourglass-split"
                                                                    : "bi bi-send"
                                                            }
                                                        ></i>

                                                        {submittingReturn
                                                            ? "Submitting..."
                                                            : `Submit ${returnType ===
                                                                "RETURN"
                                                                ? "Return"
                                                                : "Exchange"
                                                            } Request`}

                                                    </button>

                                                </div>

                                            </div>
                                        )}

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>

        </div>
    );
};

export default MyOrders;