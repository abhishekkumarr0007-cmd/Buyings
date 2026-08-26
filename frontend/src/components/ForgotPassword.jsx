import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const ForgotPassword = () => {

    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // =====================================================
    // SEND OTP
    // =====================================================

    const handleSendOtp = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/auth/forgot-password",
                {
                    email
                }
            );

            setMessage(response.data);

            setStep(2);

        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );

            setError(
                error.response?.data ||
                "Unable to send OTP. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // VERIFY OTP
    // =====================================================

    const handleVerifyOtp = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/auth/verify-otp",
                {
                    email,
                    otp
                }
            );

            setMessage(response.data);

            setStep(3);

        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );

            setError(
                error.response?.data ||
                "Invalid or expired OTP."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // RESET PASSWORD
    // =====================================================

    const handleResetPassword = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (newPassword.length < 6) {

            setError(
                "Password must be at least 6 characters."
            );

            return;
        }

        if (newPassword !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }

        setLoading(true);

        try {

            const response = await api.post(
                "/auth/reset-password",
                {
                    email,
                    otp,
                    newPassword,
                    confirmPassword
                }
            );

            setMessage(response.data);

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );

            setError(
                error.response?.data ||
                "Unable to reset password."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div
            className="d-flex justify-content-center align-items-center"
            style={{
                minHeight: "80vh",
                backgroundColor: "#f8f9fa"
            }}
        >

            <div
                className="card shadow-lg border-0"
                style={{
                    width: "420px",
                    borderRadius: "15px"
                }}
            >

                <div className="card-body p-5">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="text-center mb-4">

                        <div
                            style={{
                                fontSize: "42px",
                                marginBottom: "10px"
                            }}
                        >
                            🔐
                        </div>

                        <h2 className="fw-bold">
                            Forgot Password?
                        </h2>

                        <p className="text-muted">
                            Reset your Buyings account password
                        </p>

                    </div>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div
                            className="alert alert-danger"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    {/* =================================================
                        SUCCESS
                    ================================================= */}

                    {message && (

                        <div
                            className="alert alert-success"
                            role="alert"
                        >
                            {message}
                        </div>

                    )}


                    {/* =================================================
                        STEP 1
                    ================================================= */}

                    {step === 1 && (

                        <form onSubmit={handleSendOtp}>

                            <div className="mb-4">

                                <label
                                    className="form-label fw-semibold"
                                >
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    className="form-control form-control-lg"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                            </div>


                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-100"
                                disabled={loading}
                            >

                                {loading
                                    ? "Sending OTP..."
                                    : "Send OTP"
                                }

                            </button>

                        </form>

                    )}


                    {/* =================================================
                        STEP 2
                    ================================================= */}

                    {step === 2 && (

                        <form onSubmit={handleVerifyOtp}>

                            <div className="mb-4">

                                <label
                                    className="form-label fw-semibold"
                                >
                                    Enter OTP
                                </label>

                                <input
                                    type="text"
                                    className="form-control form-control-lg text-center"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6)
                                        )
                                    }
                                    maxLength="6"
                                    required
                                />

                                <small className="text-muted">
                                    Check your email for the OTP.
                                </small>

                            </div>


                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-100"
                                disabled={
                                    loading ||
                                    otp.length !== 6
                                }
                            >

                                {loading
                                    ? "Verifying..."
                                    : "Verify OTP"
                                }

                            </button>


                            <button
                                type="button"
                                className="btn btn-link w-100 mt-2"
                                onClick={() => {
                                    setStep(1);
                                    setOtp("");
                                    setMessage("");
                                    setError("");
                                }}
                            >
                                Change Email
                            </button>

                        </form>

                    )}


                    {/* =================================================
                        STEP 3
                    ================================================= */}

                    {step === 3 && (

                        <form onSubmit={handleResetPassword}>

                            <div className="mb-3">

                                <label
                                    className="form-label fw-semibold"
                                >
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control form-control-lg"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <div className="mb-4">

                                <label
                                    className="form-label fw-semibold"
                                >
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control form-control-lg"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-100"
                                disabled={loading}
                            >

                                {loading
                                    ? "Resetting Password..."
                                    : "Reset Password"
                                }

                            </button>

                        </form>

                    )}


                    {/* =================================================
                        LOGIN
                    ================================================= */}

                    <div className="text-center mt-4">

                        <Link
                            to="/login"
                            className="fw-semibold text-decoration-none"
                        >
                            ← Back to Login
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ForgotPassword;