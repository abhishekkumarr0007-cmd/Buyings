import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import "./UserPages.css";

const API_URL = "http://localhost:8080";

const UserAccount = () => {

    const { role } = useAuth();

    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChangePassword = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${API_URL}/auth/change-password`,
                {
                    currentPassword,
                    newPassword,
                    confirmPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setMessage(response.data);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (error) {

            console.error(
                "Change password error:",
                error
            );

            if (error.response?.data) {
                setError(error.response.data);
            } else {
                setError(
                    "Unable to change password. Please try again."
                );
            }

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="user-account-page">

            <div className="user-account-container">

                <div className="account-header">
                    <div>
                        <span>MY ACCOUNT</span>
                        <h1>Welcome back</h1>
                        <p>
                            Manage your orders, returns and support.
                        </p>
                    </div>
                </div>

                <div className="account-grid">

                    <Link
                        to="/orders"
                        className="account-card"
                    >
                        <div className="account-icon">
                            <i className="bi bi-box-seam"></i>
                        </div>

                        <div>
                            <small>SHOPPING</small>
                            <h2>My Orders</h2>
                            <p>
                                Track current and previous orders.
                            </p>
                        </div>

                        <strong>→</strong>
                    </Link>

                    <Link
                        to="/contact"
                        className="account-card"
                    >
                        <div className="account-icon">
                            <i className="bi bi-headset"></i>
                        </div>

                        <div>
                            <small>SUPPORT</small>
                            <h2>Contact Us</h2>
                            <p>
                                Get help with orders and products.
                            </p>
                        </div>

                        <strong>→</strong>
                    </Link>

                    <Link
                        to="/cart"
                        className="account-card"
                    >
                        <div className="account-icon">
                            <i className="bi bi-cart3"></i>
                        </div>

                        <div>
                            <small>SHOPPING</small>
                            <h2>My Cart</h2>
                            <p>
                                View products waiting for checkout.
                            </p>
                        </div>

                        <strong>→</strong>
                    </Link>

                    {role === "ADMIN" && (
                        <Link
                            to="/admin"
                            className="account-card"
                        >
                            <div className="account-icon">
                                <i className="bi bi-speedometer2"></i>
                            </div>

                            <div>
                                <small>MANAGEMENT</small>
                                <h2>Admin Dashboard</h2>
                                <p>
                                    Manage products and orders.
                                </p>
                            </div>

                            <strong>→</strong>
                        </Link>
                    )}

                    {/* CHANGE PASSWORD */}

                    <div
                        className={`account-card security-card ${
                            showPasswordForm
                                ? "password-card-open"
                                : ""
                        }`}
                        onClick={() => {
                            if (!showPasswordForm) {
                                setShowPasswordForm(true);
                                setMessage("");
                                setError("");
                            }
                        }}
                    >

                        <div className="account-icon">
                            <i className="bi bi-shield-lock"></i>
                        </div>

                        <div className="security-content">

                            <small>SECURITY</small>

                            <h2>Change Password</h2>

                            {!showPasswordForm && (
                                <p>
                                    Update your password to keep
                                    your account secure.
                                </p>
                            )}

                            {showPasswordForm && (

                                <form
                                    className="change-password-form"
                                    onSubmit={handleChangePassword}
                                    onClick={(e) =>
                                        e.stopPropagation()
                                    }
                                >

                                    <div className="password-input-group">

                                        <label>
                                            Current Password
                                        </label>

                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) =>
                                                setCurrentPassword(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter current password"
                                        />

                                    </div>

                                    <div className="password-input-group">

                                        <label>
                                            New Password
                                        </label>

                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Minimum 6 characters"
                                        />

                                    </div>

                                    <div className="password-input-group">

                                        <label>
                                            Confirm New Password
                                        </label>

                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Confirm new password"
                                        />

                                    </div>

                                    {error && (
                                        <div className="password-error">
                                            <i className="bi bi-exclamation-circle"></i>
                                            {error}
                                        </div>
                                    )}

                                    {message && (
                                        <div className="password-success">
                                            <i className="bi bi-check-circle"></i>
                                            {message}
                                        </div>
                                    )}

                                    <div className="password-actions">

                                        <button
                                            type="submit"
                                            className="change-password-btn"
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Changing..."
                                                : "Change Password"}
                                        </button>

                                        <button
                                            type="button"
                                            className="cancel-password-btn"
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                setError("");
                                                setMessage("");
                                            }}
                                        >
                                            Cancel
                                        </button>

                                    </div>

                                </form>

                            )}

                        </div>

                        {!showPasswordForm && (
                            <strong>→</strong>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default UserAccount;