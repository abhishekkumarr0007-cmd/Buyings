import React, { useEffect, useState } from "react";
import api from "../api";
import "./AdminContactMessages.css";

const AdminContactMessages = () => {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMessage, setSelectedMessage] = useState(null);

    // =====================================================
    // FETCH ALL CONTACT MESSAGES
    // =====================================================

    const fetchMessages = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/api/contact");

            console.log(
                "Contact messages:",
                response.data
            );

            // Newest messages first
            const sortedMessages = [...response.data].sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );

            setMessages(sortedMessages);

        } catch (err) {

            console.error(
                "Error fetching contact messages:",
                err
            );

            if (err.response) {

                if (err.response.status === 401) {

                    setError(
                        "Your session has expired. Please login again."
                    );

                } else if (err.response.status === 403) {

                    setError(
                        "Access denied. Admin permission is required."
                    );

                } else {

                    setError(
                        "Failed to load contact messages."
                    );
                }

            } else {

                setError(
                    "Unable to connect to the server."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // LOAD MESSAGES
    // =====================================================

    useEffect(() => {

        fetchMessages();

    }, []);


    // =====================================================
    // MARK AS READ
    // =====================================================

    const markAsRead = async (id) => {

        try {

            const response = await api.put(
                `/api/contact/${id}/read`
            );

            const updatedMessage = response.data;

            setMessages((previousMessages) =>
                previousMessages.map((message) =>
                    message.id === id
                        ? updatedMessage
                        : message
                )
            );

            // Update selected message if open
            if (
                selectedMessage &&
                selectedMessage.id === id
            ) {

                setSelectedMessage(
                    updatedMessage
                );
            }

        } catch (err) {

            console.error(
                "Error marking message as read:",
                err
            );

            alert(
                "Unable to mark message as read."
            );
        }
    };


    // =====================================================
    // DELETE MESSAGE
    // =====================================================

    const deleteMessage = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this message?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await api.delete(
                `/api/contact/${id}`
            );

            setMessages((previousMessages) =>
                previousMessages.filter(
                    (message) =>
                        message.id !== id
                )
            );

            if (
                selectedMessage &&
                selectedMessage.id === id
            ) {

                setSelectedMessage(null);
            }

        } catch (err) {

            console.error(
                "Error deleting message:",
                err
            );

            alert(
                "Unable to delete message."
            );
        }
    };


    // =====================================================
    // OPEN MESSAGE
    // =====================================================

    const openMessage = async (message) => {

        setSelectedMessage(message);

        // Automatically mark unread message as read
        if (message.status === "UNREAD") {

            await markAsRead(message.id);
        }
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleString(
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


    // =====================================================
    // CATEGORY LABEL
    // =====================================================

    const getCategoryLabel = (category) => {

        const labels = {

            GENERAL: "General Question",

            ORDER: "Order Issue",

            DELIVERY: "Delivery Issue",

            RETURN: "Return Request",

            EXCHANGE: "Exchange Request",

            PAYMENT: "Payment Issue",

            PRODUCT: "Product Issue",

            OTHER: "Other"

        };

        return labels[category] || category;
    };


    // =====================================================
    // COUNTS
    // =====================================================

    const totalMessages =
        messages.length;

    const unreadMessages =
        messages.filter(
            (message) =>
                message.status === "UNREAD"
        ).length;


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-contact-page">

                <div className="admin-contact-loading">

                    <div className="contact-spinner"></div>

                    <p>
                        Loading customer messages...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="admin-contact-page">

                <div className="admin-contact-error">

                    <div className="error-icon">

                        <i className="bi bi-exclamation-triangle"></i>

                    </div>

                    <h2>
                        Unable to Load Messages
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={fetchMessages}
                        className="retry-button"
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    return (

        <div className="admin-contact-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-contact-header">

                <div>

                    <span className="admin-contact-eyebrow">
                        CUSTOMER SUPPORT
                    </span>

                    <h1>
                        Contact Messages
                    </h1>

                    <p>
                        Manage questions and support
                        requests from your customers.
                    </p>

                </div>


                <button
                    className="refresh-contact-button"
                    onClick={fetchMessages}
                >

                    <i className="bi bi-arrow-clockwise"></i>

                    Refresh

                </button>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="contact-stat-grid">

                <div className="contact-stat-card">

                    <div className="contact-stat-icon total">

                        <i className="bi bi-chat-left-text"></i>

                    </div>

                    <div>

                        <span>
                            TOTAL MESSAGES
                        </span>

                        <strong>
                            {totalMessages}
                        </strong>

                    </div>

                </div>


                <div className="contact-stat-card">

                    <div className="contact-stat-icon unread">

                        <i className="bi bi-envelope"></i>

                    </div>

                    <div>

                        <span>
                            UNREAD
                        </span>

                        <strong>
                            {unreadMessages}
                        </strong>

                    </div>

                </div>


                <div className="contact-stat-card">

                    <div className="contact-stat-icon read">

                        <i className="bi bi-envelope-open"></i>

                    </div>

                    <div>

                        <span>
                            READ
                        </span>

                        <strong>
                            {totalMessages - unreadMessages}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                MESSAGE LIST
            ================================================= */}

            <div className="contact-messages-card">

                <div className="contact-list-header">

                    <div>

                        <h2>
                            Customer Messages
                        </h2>

                        <p>
                            {totalMessages === 0
                                ? "No messages received yet."
                                : `${totalMessages} message${totalMessages !== 1 ? "s" : ""}`
                            }
                        </p>

                    </div>

                </div>


                {messages.length === 0 ? (

                    <div className="empty-contact-state">

                        <div className="empty-contact-icon">

                            <i className="bi bi-inbox"></i>

                        </div>

                        <h3>
                            No messages yet
                        </h3>

                        <p>
                            Customer messages will appear
                            here when they contact you.
                        </p>

                    </div>

                ) : (

                    <div className="contact-message-list">

                        {messages.map((message) => (

                            <div
                                key={message.id}
                                className={`contact-message-row ${message.status === "UNREAD"
                                        ? "unread-message"
                                        : ""
                                    }`}
                            >

                                {/* STATUS */}

                                <div className="message-status">

                                    {message.status === "UNREAD" ? (

                                        <span className="unread-dot"></span>

                                    ) : (

                                        <i className="bi bi-envelope-open"></i>

                                    )}

                                </div>


                                {/* CUSTOMER */}

                                <div className="message-customer">

                                    <strong>
                                        {message.name}
                                    </strong>

                                    <span>
                                        {message.email}
                                    </span>

                                </div>


                                {/* CATEGORY */}

                                <div className="message-category">

                                    <span
                                        className={`category-badge category-${(
                                            message.category || "GENERAL"
                                        ).toLowerCase()}`}
                                    >
                                        {getCategoryLabel(
                                            message.category
                                        )}
                                    </span>

                                </div>


                                {/* MESSAGE PREVIEW */}

                                <div className="message-preview">

                                    <p>
                                        {message.message}
                                    </p>

                                    {message.orderId && (
                                        <button
                                            type="button"
                                            className="order-reference"
                                            onClick={() => {
                                                window.location.href = `/admin/orders/${message.orderId}`;
                                            }}
                                        >
                                            <i className="bi bi-box-seam"></i>
                                            Order #{message.orderId}
                                            <i className="bi bi-arrow-up-right"></i>
                                        </button>
                                    )}

                                </div>


                                {/* DATE */}

                                <div className="message-date">

                                    {formatDate(
                                        message.createdAt
                                    )}

                                </div>


                                {/* ACTIONS */}

                                <div className="message-actions">

                                    <button
                                        className="view-message-button"
                                        onClick={() =>
                                            openMessage(message)
                                        }
                                        title="View message"
                                    >

                                        <i className="bi bi-eye"></i>

                                    </button>


                                    {message.status === "UNREAD" && (

                                        <button
                                            className="read-message-button"
                                            onClick={() =>
                                                markAsRead(
                                                    message.id
                                                )
                                            }
                                            title="Mark as read"
                                        >

                                            <i className="bi bi-check2"></i>

                                        </button>

                                    )}


                                    <button
                                        className="delete-message-button"
                                        onClick={() =>
                                            deleteMessage(
                                                message.id
                                            )
                                        }
                                        title="Delete message"
                                    >

                                        <i className="bi bi-trash3"></i>

                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* =================================================
                MESSAGE DETAILS MODAL
            ================================================= */}

            {selectedMessage && (

                <div
                    className="contact-modal-overlay"
                    onClick={() =>
                        setSelectedMessage(null)
                    }
                >

                    <div
                        className="contact-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="contact-modal-header">

                            <div>

                                <span>
                                    CUSTOMER MESSAGE
                                </span>

                                <h2>
                                    Message Details
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedMessage(null)
                                }
                                className="close-contact-modal"
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>


                        <div className="contact-modal-body">

                            {/* CUSTOMER */}

                            <div className="detail-section">

                                <span className="detail-label">
                                    CUSTOMER
                                </span>

                                <div className="customer-detail">

                                    <div className="customer-avatar">

                                        {selectedMessage.name
                                            ?.charAt(0)
                                            ?.toUpperCase()}

                                    </div>

                                    <div>

                                        <strong>
                                            {selectedMessage.name}
                                        </strong>

                                        <a
                                            href={`mailto:${selectedMessage.email}`}
                                        >
                                            {selectedMessage.email}
                                        </a>

                                    </div>

                                </div>

                            </div>


                            {/* DETAILS */}

                            <div className="message-detail-grid">

                                <div className="detail-section">

                                    <span className="detail-label">
                                        CATEGORY
                                    </span>

                                    <strong>
                                        {getCategoryLabel(
                                            selectedMessage.category
                                        )}
                                    </strong>

                                </div>


                                <div className="detail-section">

                                    <span className="detail-label">
                                        STATUS
                                    </span>

                                    <span
                                        className={`status-badge ${selectedMessage.status ===
                                                "UNREAD"
                                                ? "status-unread"
                                                : "status-read"
                                            }`}
                                    >

                                        {selectedMessage.status ===
                                            "UNREAD"
                                            ? "Unread"
                                            : "Read"}

                                    </span>

                                </div>


                                <div className="detail-section">

                                    <span className="detail-label">
                                        ORDER ID
                                    </span>

                                    <strong>
                                        {selectedMessage.orderId
                                            ? `#${selectedMessage.orderId}`
                                            : "Not provided"}
                                    </strong>

                                </div>


                                <div className="detail-section">

                                    <span className="detail-label">
                                        RECEIVED
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedMessage.createdAt
                                        )}
                                    </strong>

                                </div>

                            </div>


                            {/* MESSAGE */}

                            <div className="detail-section full">

                                <span className="detail-label">
                                    MESSAGE
                                </span>

                                <div className="full-message">

                                    {selectedMessage.message}

                                </div>

                            </div>

                        </div>


                        <div className="contact-modal-footer">

                            <a
                                href={`mailto:${selectedMessage.email}`}
                                className="reply-message-button"
                            >

                                <i className="bi bi-reply"></i>

                                Reply by Email

                            </a>


                            <button
                                className="modal-delete-button"
                                onClick={() =>
                                    deleteMessage(
                                        selectedMessage.id
                                    )
                                }
                            >

                                <i className="bi bi-trash3"></i>

                                Delete

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminContactMessages;