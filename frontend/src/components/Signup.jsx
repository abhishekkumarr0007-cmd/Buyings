import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const Signup = () => {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        // Check passwords
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        setLoading(true);

        try {

            await api.post("/auth/signup", {
                name,
                email,
                password
            });

            setSuccess(
                "Account created successfully! Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {

            console.error("Signup error:", error);

            if (error.response) {

                if (error.response.status === 409) {

                    setError(
                        "An account with this email already exists."
                    );

                } else {

                    setError(
                        error.response.data?.message ||
                        "Signup failed. Please try again."
                    );
                }

            } else {

                setError(
                    "Cannot connect to the server."
                );
            }

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
                    width: "450px",
                    borderRadius: "15px"
                }}
            >

                <div className="card-body p-5">

                    {/* Title */}
                    <div className="text-center mb-4">

                        <h2 className="fw-bold">
                            Create Account
                        </h2>

                        <p className="text-muted">
                            Join the Buyings community
                        </p>

                    </div>

                    {/* Error */}
                    {error && (

                        <div
                            className="alert alert-danger"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}

                    {/* Success */}
                    {success && (

                        <div
                            className="alert alert-success"
                            role="alert"
                        >
                            {success}
                        </div>

                    )}

                    <form onSubmit={handleSignup}>

                        {/* Name */}
                        <div className="mb-3">

                            <label className="form-label fw-semibold">
                                Full Name
                            </label>

                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                required
                            />

                        </div>

                        {/* Email */}
                        <div className="mb-3">

                            <label className="form-label fw-semibold">
                                Email
                            </label>

                            <input
                                type="email"
                                className="form-control form-control-lg"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>

                        {/* Password */}
                        <div className="mb-3">

                            <label className="form-label fw-semibold">
                                Password
                            </label>

                            <input
                                type="password"
                                className="form-control form-control-lg"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>

                        {/* Confirm Password */}
                        <div className="mb-4">

                            <label className="form-label fw-semibold">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                className="form-control form-control-lg"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />

                        </div>

                        {/* Signup button */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating Account..."
                                : "Create Account"
                            }

                        </button>

                    </form>

                    {/* Login link */}
                    <div className="text-center mt-4">

                        <span className="text-muted">
                            Already have an account?{" "}
                        </span>

                        <Link
                            to="/login"
                            className="fw-semibold text-decoration-none"
                        >
                            Login
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Signup;

