import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {

    const { token, role } = useAuth();

    // User is not logged in
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Page is only for ADMIN
    if (adminOnly && role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
