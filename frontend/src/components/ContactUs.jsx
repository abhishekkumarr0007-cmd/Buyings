import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import api from "../api";
import "./UserPages.css";

const ContactUs = () => {

    const { token } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        orderId: "",
        category: "GENERAL",
        message: ""
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    // =========================================================
    // HANDLE INPUT CHANGE
    // =========================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    // =========================================================
    // SUBMIT CONTACT MESSAGE
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSubmitted(false);

        // =====================================================
        // VALIDATION
        // =====================================================

        if (!form.name.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (!form.email.trim()) {
            setError("Please enter your email.");
            return;
        }

        if (!form.message.trim()) {
            setError("Please enter your message.");
            return;
        }

        // =====================================================
        // CHECK LOGIN TOKEN
        // =====================================================

        if (!token) {
            setError("Please login before sending a message.");
            return;
        }

        try {

            setLoading(true);

            // =================================================
            // CONTACT MESSAGE DATA
            // =================================================

            const contactData = {
                name: form.name.trim(),
                email: form.email.trim(),

                orderId:
                    form.orderId.trim()
                        ? form.orderId.trim()
                        : null,

                category: form.category,

                message: form.message.trim()
            };

            console.log(
                "================================="
            );

            console.log(
                "SENDING CONTACT MESSAGE"
            );

            console.log(
                contactData
            );

            // =================================================
            // SEND TO SPRING BOOT
            // =================================================

            const response = await api.post(
                "/api/contact",
                contactData
            );

            console.log(
                "CONTACT MESSAGE SAVED:",
                response.data
            );

            // =================================================
            // SUCCESS
            // =================================================

            setSubmitted(true);

            setForm({
                name: "",
                email: "",
                orderId: "",
                category: "GENERAL",
                message: ""
            });

        } catch (err) {

            console.error(
                "================================="
            );

            console.error(
                "CONTACT MESSAGE ERROR:",
                err
            );

            // =================================================
            // SERVER RESPONSE
            // =================================================

            if (err.response) {

                console.error(
                    "STATUS:",
                    err.response.status
                );

                console.error(
                    "SERVER RESPONSE:",
                    err.response.data
                );

                // =============================================
                // 401 - NOT AUTHENTICATED
                // =============================================

                if (err.response.status === 401) {

                    setError(
                        "Your session has expired. Please login again."
                    );

                }

                // =============================================
                // 403 - FORBIDDEN
                // =============================================

                else if (err.response.status === 403) {

                    setError(
                        "Your account is authenticated but is not allowed to send contact messages."
                    );

                }

                // =============================================
                // 400 - BAD REQUEST
                // =============================================

                else if (err.response.status === 400) {

                    setError(
                        typeof err.response.data === "string"
                            ? err.response.data
                            : "Invalid contact message."
                    );

                }

                // =============================================
                // 500 - SERVER ERROR
                // =============================================

                else if (err.response.status >= 500) {

                    setError(
                        "Server error. Please try again later."
                    );

                }

                // =============================================
                // OTHER SERVER ERRORS
                // =============================================

                else {

                    setError(
                        typeof err.response.data === "string"
                            ? err.response.data
                            : "Failed to send your message."
                    );
                }

            }

            // =================================================
            // SERVER NOT AVAILABLE
            // =================================================

            else if (err.request) {

                setError(
                    "Unable to connect to the server. Please make sure the backend is running."
                );

            }

            // =================================================
            // UNKNOWN ERROR
            // =================================================

            else {

                setError(
                    "Something went wrong. Please try again."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // SEND ANOTHER MESSAGE
    // =========================================================

    const handleSendAnother = () => {

        setSubmitted(false);
        setError("");

    };


    return (

        <div className="contact-page">

            <div className="contact-container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="contact-header">

                    <div>

                        <span>
                            CUSTOMER SUPPORT
                        </span>

                        <h1>
                            Contact Us
                        </h1>

                        <p>
                            Have a question, problem or feedback?
                            We're here to help.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {error && (

                    <div
                        className="form-alert error-alert"
                        style={{
                            marginBottom: "20px"
                        }}
                    >

                        <i className="bi bi-exclamation-circle-fill"></i>

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() => setError("")}
                        >
                            ×
                        </button>

                    </div>

                )}


                <div className="contact-layout">


                    {/* =================================================
                        LEFT SIDE
                    ================================================= */}

                    <div className="contact-info">


                        {/* PHONE */}

                        <div className="contact-info-card">

                            <div className="contact-info-icon">

                                <i className="bi bi-telephone"></i>

                            </div>

                            <div>

                                <span>
                                    CALL US
                                </span>

                                <h3>
                                    +91 7488309450
                                </h3>

                                <p>
                                    Mon – Sat, 9:00 AM – 7:00 PM
                                </p>

                            </div>

                            <a href="tel:+917488309450">
                                Call Now →
                            </a>

                        </div>


                        {/* EMAIL */}

                        <div className="contact-info-card">

                            <div className="contact-info-icon">

                                <i className="bi bi-envelope"></i>

                            </div>

                            <div>

                                <span>
                                    EMAIL
                                </span>

                                <h3>
                                    support.buyings@gmail.com
                                </h3>

                                <p>
                                    We usually reply within 24 hours.
                                </p>

                            </div>

                            <a href="mailto:support.buyings@gmail.com">
                                Email Us →
                            </a>

                        </div>


                        {/* ORDER SUPPORT */}

                        <div className="contact-info-card">

                            <div className="contact-info-icon">

                                <i className="bi bi-box-seam"></i>

                            </div>

                            <div>

                                <span>
                                    ORDER SUPPORT
                                </span>

                                <h3>
                                    Need help with an order?
                                </h3>

                                <p>
                                    Track, return or exchange your purchase.
                                </p>

                            </div>

                            {token && (

                                <Link to="/orders">
                                    View Orders →
                                </Link>

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        RIGHT SIDE
                    ================================================= */}

                    <div className="contact-form-card">


                        {/* =================================================
                            SUCCESS SCREEN
                        ================================================= */}

                        {submitted ? (

                            <div className="contact-success">

                                <div>
                                    <i className="bi bi-check-lg"></i>
                                </div>

                                <h2>
                                    Message Sent
                                </h2>

                                <p>
                                    Thank you for contacting us.
                                    Our support team will get back to you.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleSendAnother}
                                >
                                    Send Another Message
                                </button>

                            </div>

                        ) : (


                            /* =================================================
                               FORM
                            ================================================= */

                            <form onSubmit={handleSubmit}>

                                <span>
                                    SEND A MESSAGE
                                </span>

                                <h2>
                                    How can we help?
                                </h2>


                                {/* NAME + EMAIL */}

                                <div className="form-row">


                                    {/* NAME */}

                                    <div className="form-field">

                                        <label>
                                            Your Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                            required
                                        />

                                    </div>


                                    {/* EMAIL */}

                                    <div className="form-field">

                                        <label>
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* ORDER ID + CATEGORY */}

                                <div className="form-row">


                                    {/* ORDER ID */}

                                    <div className="form-field">

                                        <label>
                                            Order ID
                                        </label>

                                        <input
                                            type="text"
                                            name="orderId"
                                            value={form.orderId}
                                            onChange={handleChange}
                                            placeholder="Optional"
                                        />

                                    </div>


                                    {/* CATEGORY */}

                                    <div className="form-field">

                                        <label>
                                            Reason
                                        </label>

                                        <select
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                        >

                                            <option value="GENERAL">
                                                General Question
                                            </option>

                                            <option value="ORDER">
                                                Order Issue
                                            </option>

                                            <option value="DELIVERY">
                                                Delivery Issue
                                            </option>

                                            <option value="RETURN">
                                                Return / Exchange
                                            </option>

                                            <option value="PAYMENT">
                                                Payment Issue
                                            </option>

                                            <option value="PRODUCT">
                                                Product Issue
                                            </option>

                                            <option value="OTHER">
                                                Other
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                {/* MESSAGE */}

                                <div className="form-field">

                                    <label>
                                        Message
                                    </label>

                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="Tell us how we can help..."
                                        rows="6"
                                        required
                                    />

                                </div>


                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    className="send-message-button"
                                    disabled={loading}
                                >

                                    {loading ? (

                                        <>
                                            <span className="button-spinner"></span>

                                            Sending...
                                        </>

                                    ) : (

                                        <>
                                            Send Message

                                            <i className="bi bi-arrow-right"></i>
                                        </>

                                    )}

                                </button>

                            </form>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ContactUs;