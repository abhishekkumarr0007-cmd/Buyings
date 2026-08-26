import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import api from "../api";

const Login = () => {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );

            console.log(
                "Login response:",
                response.data
            );

            /*
             * Save authentication information
             * through AuthContext.
             */
            login(response.data);

            /*
             * Redirect according to role
             */
            if (response.data.role === "ADMIN") {

                navigate("/admin");

            } else {

                navigate("/");
            }

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            if (error.response?.status === 401) {

                setError(
                    "Invalid email or password."
                );

            } else if (error.response?.status === 403) {

                setError(
                    "You are not authorized to login."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Login failed. Please try again."
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
                    width: "420px",
                    borderRadius: "15px"
                }}
            >

                <div className="card-body p-5">

                    {/* ================= TITLE ================= */}

                    <div className="text-center mb-4">

                        <h2 className="fw-bold">
                            Welcome Back
                        </h2>

                        <p className="text-muted">
                            Login to your Buyings account
                        </p>

                    </div>

                    {/* ================= ERROR ================= */}

                    {error && (

                        <div
                            className="alert alert-danger"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}

                    {/* ================= FORM ================= */}

                    <form onSubmit={handleLogin}>

                        {/* Email */}

                        <div className="mb-3">

                            <label
                                className="form-label fw-semibold"
                            >
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

                        <div className="mb-2">

                            <label
                                className="form-label fw-semibold"
                            >
                                Password
                            </label>

                            <input
                                type="password"
                                className="form-control form-control-lg"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>

                        {/* Forgot Password */}

                        <div className="text-end mb-4">

                            <Link
                                to="/forgot-password"
                                className="forgot-password-link"
                            >
                                Forgot Password?
                            </Link>

                        </div>

                        {/* Login Button */}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100"
                            disabled={loading}
                        >

                            {loading
                                ? "Logging in..."
                                : "Login"
                            }

                        </button>

                    </form>

                    {/* ================= SIGNUP ================= */}

                    <div className="text-center mt-4">

                        <span className="text-muted">
                            Don't have an account?{" "}
                        </span>

                        <Link
                            to="/signup"
                            className="fw-semibold text-decoration-none"
                        >
                            Create Account
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;
