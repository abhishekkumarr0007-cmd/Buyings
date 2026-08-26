import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./AdminDashboard.css";

const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "ON_THE_WAY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED"
];

const getReturnStatusOptions = (request) => {

    if (request.type === "RETURN") {

        return [
            "RETURN_REQUESTED",
            "RETURN_APPROVED",
            "RETURN_REJECTED",
            "RETURN_PICKUP_SCHEDULED",
            "RETURN_RECEIVED",
            "REFUND_INITIATED",
            "REFUNDED"
        ];

    }

    if (request.type === "EXCHANGE") {

        return [
            "EXCHANGE_REQUESTED",
            "EXCHANGE_APPROVED",
            "EXCHANGE_REJECTED",
            "EXCHANGE_RECEIVED"
        ];
    }

    return [];
};

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState("products");

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);

    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [error, setError] = useState("");

    const [returnRequests, setReturnRequests] = useState([]);
    const [loadingReturns, setLoadingReturns] = useState(false);

    const [selectedReturnRequest, setSelectedReturnRequest] = useState(null);
    const [updatingReturnId, setUpdatingReturnId] = useState(null);

    const [returnAdminNote, setReturnAdminNote] = useState("");
    const [savingReturnNote, setSavingReturnNote] = useState(false);

    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingForm, setTrackingForm] = useState({
        courierName: "",
        trackingNumber: "",
        trackingUrl: ""
    });

    const [savingTracking, setSavingTracking] = useState(false);

    const fetchReturnRequests = async () => {
        try {
            setLoadingReturns(true);

            const response = await api.get("/admin/return-exchange");

            console.log("===== RETURN REQUEST API =====");
            console.log("FULL RESPONSE:", response.data);
            console.log("FIRST REQUEST:", response.data?.[0]);
            console.log("CATEGORY:", response.data?.[0]?.category);
            console.log("REASON:", response.data?.[0]?.reason);
            console.log("STATUS:", response.data?.[0]?.status);
            console.log("=============================");

            setReturnRequests(response.data || []);

        } catch (err) {
            console.error("Error fetching return requests:", err);

            if (err.response?.status === 403) {
                setError("You are not authorized to access return requests.");
            } else {
                setError("Unable to load return requests.");
            }

        } finally {
            setLoadingReturns(false);
        }
    };

    // =========================================================
    // LOAD PRODUCTS
    // =========================================================

    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);
            setError("");

            const response = await api.get("/api/products");
            setProducts(response.data || []);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Unable to load products.");
        } finally {
            setLoadingProducts(false);
        }
    };

    // =========================================================
    // LOAD ORDERS
    // =========================================================

    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            setError("");

            const response = await api.get("/admin/orders");
            setOrders(response.data || []);
        } catch (err) {
            console.error("Error fetching orders:", err);

            if (err.response?.status === 403) {
                setError("You are not authorized to access orders.");
            } else {
                setError("Unable to load orders.");
            }
        } finally {
            setLoadingOrders(false);
        }
    };

    // =========================================================
    // LOAD USERS
    // =========================================================

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            setError("");

            const response = await api.get("/admin/users");
            setUsers(response.data || []);
        } catch (err) {
            console.error("Error fetching users:", err);

            if (err.response?.status === 403) {
                setError("You are not authorized to access users.");
            } else {
                setError("Unable to load users.");
            }
        } finally {
            setLoadingUsers(false);
        }
    };

    // =========================================================
    // UPDATE RETURN / EXCHANGE STATUS
    // =========================================================

    const updateReturnStatus = async (requestId, newStatus) => {
        if (!newStatus) return;

        try {
            setUpdatingReturnId(requestId);

            console.log("================================");
            console.log("UPDATING RETURN STATUS");
            console.log("REQUEST ID:", requestId);
            console.log("NEW STATUS:", newStatus);
            console.log("================================");

            const request = returnRequests.find(
                (item) => Number(item.orderId) === Number(requestId)
            );

            if (!request) {
                console.error(
                    "RETURN REQUEST NOT FOUND:",
                    requestId
                );

                alert("Return request not found.");
                return;
            }

            const orderId = request.orderId;

            console.log("RETURN REQUEST:", request);
            console.log("ORDER ID:", orderId);

            if (!orderId) {
                console.error(
                    "ORDER ID IS MISSING FROM RETURN REQUEST"
                );

                alert("Order ID is missing from this return request.");
                return;
            }

            const response = await api.put(
                `/admin/orders/${orderId}/return-exchange/status`,
                null,
                {
                    params: {
                        status: newStatus
                    }
                }
            );

            console.log("================================");
            console.log("RETURN UPDATE SUCCESS");
            console.log("HTTP STATUS:", response.status);
            console.log("RESPONSE:", response.data);
            console.log("================================");

            await fetchReturnRequests();

            setSelectedReturnRequest((previous) => {
                if (
                    !previous ||
                    Number(previous.id) !== Number(requestId)
                ) {
                    return previous;
                }

                return {
                    ...previous,
                    status: newStatus
                };
            });

        } catch (error) {

            console.error("================================");
            console.error("RETURN UPDATE FAILED");
            console.error("HTTP STATUS:", error.response?.status);
            console.error("SERVER RESPONSE:", error.response?.data);
            console.error("URL:", error.config?.url);
            console.error("================================");

            if (error.response?.status === 401) {

                alert(
                    "Your login session has expired. Please login again."
                );

            } else if (error.response?.status === 403) {

                alert(
                    error.response?.data?.message ||
                    error.response?.data ||
                    "Return status update was rejected by the server."
                );

            } else {

                alert(
                    error.response?.data?.message ||
                    error.response?.data ||
                    "Failed to update return request."
                );
            }

        } finally {

            setUpdatingReturnId(null);
        }
    };

    // =========================================================
    // SAVE ADMIN NOTE
    // =========================================================

    const saveReturnAdminNote = async () => {

        if (!selectedReturnRequest?.id) {
            return;
        }

        try {

            setSavingReturnNote(true);

            const response = await api.put(
                `/admin/return-exchange/${selectedReturnRequest.id}/note`,
                {
                    adminNote: returnAdminNote
                }
            );

            const updatedRequest = response.data;

            setReturnRequests((previousRequests) =>
                previousRequests.map((request) =>
                    request.id === updatedRequest.id
                        ? updatedRequest
                        : request
                )
            );

            setSelectedReturnRequest(updatedRequest);

            alert("Admin note saved successfully.");

        } catch (error) {

            console.error(
                "ADMIN NOTE ERROR:",
                error
            );

            alert(
                error.response?.data ||
                "Failed to save admin note."
            );

        } finally {

            setSavingReturnNote(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchUsers();
        fetchReturnRequests();
    }, []);

    // =========================================================
    // CATEGORIES
    // =========================================================

    const categories = useMemo(() => {
        return [
            ...new Set(
                products
                    .map((product) => product.category)
                    .filter(Boolean)
            )
        ];
    }, [products]);

    // =========================================================
    // DELETE PRODUCT
    // =========================================================

    const deleteProduct = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to remove this product?"
        );

        if (!confirmed) return;

        try {

            const response = await api.delete(
                `/api/product/${id}`
            );

            const message = response.data;

            // =========================================
            // PRODUCT PERMANENTLY DELETED
            // =========================================

            if (message === "Product deleted successfully") {

                setProducts((prev) =>
                    prev.filter(
                        (product) => product.id !== id
                    )
                );

                alert("Product deleted successfully.");

                return;
            }

            // =========================================
            // PRODUCT HAD EXISTING ORDERS
            // =========================================

            if (message.includes("existing orders")) {

                setProducts((prev) =>
                    prev.map((product) =>
                        product.id === id
                            ? {
                                ...product,
                                productAvailable: false
                            }
                            : product
                    )
                );

                alert(
                    "This product has existing orders, so it was removed from the store but kept for order history."
                );

                return;
            }

            // =========================================
            // UNEXPECTED RESPONSE
            // =========================================

            alert(
                message ||
                "Product action completed."
            );

            await fetchProducts();

        } catch (err) {

            console.error(
                "DELETE PRODUCT ERROR:",
                err
            );

            console.error(
                "STATUS:",
                err.response?.status
            );

            console.error(
                "SERVER RESPONSE:",
                err.response?.data
            );

            alert(
                err.response?.data ||
                "Failed to remove product."
            );
        }
    };

    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    const updateOrderStatus = async (orderId, newStatus) => {
        if (!newStatus) return;

        const previousOrder = orders.find(
            (order) => order.id === orderId
        );

        if (!previousOrder) return;

        try {
            setUpdatingOrderId(orderId);

            console.log("Updating order:", orderId);
            console.log("New status:", newStatus);

            const response = await api.put(
                `/admin/orders/${orderId}/status`,
                null,
                {
                    params: {
                        status: newStatus
                    }
                }
            );

            console.log("STATUS UPDATE RESPONSE:", response.status);
            console.log("UPDATED ORDER:", response.data);

            // Update only status locally
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            status: newStatus
                        }
                        : order
                )
            );

            // Update modal
            setSelectedOrder((prevOrder) =>
                prevOrder && prevOrder.id === orderId
                    ? {
                        ...prevOrder,
                        status: newStatus
                    }
                    : prevOrder
            );

        } catch (err) {

            console.error(
                "ORDER STATUS UPDATE ERROR:",
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

            console.error(
                "URL:",
                err.config?.url
            );

            if (err.response?.status === 401) {
                alert("Your login session has expired. Please login again.");
            }
            else if (err.response?.status === 403) {
                alert(
                    "Your account is authenticated but does not have ADMIN permission."
                );
            }
            else {
                alert("Failed to update order status.");
            }

            // Reload actual database value
            await fetchOrders();

        } finally {
            setUpdatingOrderId(null);
        }
    };

    // =========================================================
    // UPDATE ORDER TRACKING
    // =========================================================

    const updateOrderTracking = async () => {

        if (!selectedOrder?.id) {
            alert("Please open an order first by clicking View.");
            return;
        }

        try {

            setSavingTracking(true);

            const response = await api.put(
                `/admin/orders/${selectedOrder.id}/tracking`,
                trackingForm
            );

            console.log("TRACKING UPDATE RESPONSE:", response.data);

            const updatedOrder = response.data;

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === updatedOrder.id
                        ? updatedOrder
                        : order
                )
            );

            setSelectedOrder(updatedOrder);

            setTrackingForm({
                courierName: updatedOrder.courierName || "",
                trackingNumber: updatedOrder.trackingNumber || "",
                trackingUrl: updatedOrder.trackingUrl || ""
            });

            alert("Tracking information saved successfully.");

        } catch (err) {

            console.error("TRACKING UPDATE ERROR:", err);
            console.error("STATUS:", err.response?.status);
            console.error("DATA:", err.response?.data);

            if (err.response?.status === 403) {
                alert("You are not authorized to update tracking information.");
            } else if (err.response?.status === 401) {
                alert("Your login session has expired. Please login again.");
            } else {
                alert(
                    err.response?.data?.message ||
                    "Failed to update tracking information."
                );
            }

        } finally {
            setSavingTracking(false);
        }
    };

    const markPaymentReceived = async (orderId) => {
        const confirmed = window.confirm(
            "Have you received the COD payment for this order?"
        );

        if (!confirmed) {
            return;
        }

        try {
            console.log("=== MARK PAYMENT START ===");
            console.log("Order ID:", orderId);

            const response = await api.put(
                `/admin/orders/${orderId}/payment`
            );

            console.log("=== PAYMENT REQUEST FINISHED ===");
            console.log("HTTP STATUS:", response.status);
            console.log("RESPONSE DATA:", response.data);

            // Update table immediately
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            paymentStatus: "PAID"
                        }
                        : order
                )
            );

            // Update View Order modal if it is open
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId
                        ? { ...order, paymentStatus: "PAID" }
                        : order
                )
            );

            setSelectedOrder((prevOrder) =>
                prevOrder && prevOrder.id === orderId
                    ? { ...prevOrder, paymentStatus: "PAID" }
                    : prevOrder
            );

            alert("COD payment marked as PAID successfully.");

        } catch (error) {

            console.error("=== PAYMENT REQUEST FAILED ===");
            console.error("ERROR:", error);
            console.error("HTTP STATUS:", error.response?.status);
            console.error("SERVER DATA:", error.response?.data);
            console.error("REQUEST URL:", error.config?.url);

            alert(
                `Payment update failed.\n\n` +
                `Status: ${error.response?.status || "No response"}\n` +
                `Server: ${error.response?.data || error.message}`
            );
        }
    };
    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (status) => {
        switch (status) {
            case "PENDING":
                return "status-pending";

            case "CONFIRMED":
                return "status-confirmed";

            case "SHIPPED":
                return "status-shipped";

            case "ON_THE_WAY":
                return "status-on-the-way";

            case "OUT_FOR_DELIVERY":
                return "status-out-for-delivery";

            case "DELIVERED":
                return "status-delivered";

            case "CANCELLED":
                return "status-cancelled";

            default:
                return "status-default";
        }
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // =========================================================
    // DASHBOARD
    // =========================================================

    return (
        <div className="admin-page">

            <div className="admin-wrapper">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="admin-header">

                    <div>
                        <h1>Admin Dashboard</h1>

                        <p>
                            Manage your Buyings store from one place
                        </p>
                    </div>

                    {activeSection === "products" && (
                        <Link
                            to="/add_product"
                            className="admin-add-btn"
                        >
                            <span>+</span>
                            Add Product
                        </Link>
                    )}

                </div>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="admin-stats">

                    <div className="admin-stat-card">

                        <div>
                            <span className="stat-label">
                                Total Products
                            </span>

                            <strong>
                                {products.length}
                            </strong>
                        </div>

                        <div className="stat-icon blue">
                            <i className="bi bi-box-seam"></i>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div>
                            <span className="stat-label">
                                Total Orders
                            </span>

                            <strong>
                                {orders.length}
                            </strong>
                        </div>

                        <div className="stat-icon orange">
                            <i className="bi bi-cart-check"></i>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div>
                            <span className="stat-label">
                                Total Users
                            </span>

                            <strong>
                                {users.length}
                            </strong>
                        </div>

                        <div className="stat-icon purple">
                            <i className="bi bi-people"></i>
                        </div>

                    </div>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <div className="admin-navigation">

                    <button
                        className={
                            activeSection === "returns"
                                ? "admin-nav-btn active"
                                : "admin-nav-btn"
                        }
                        onClick={() => setActiveSection("returns")}
                    >
                        <i className="bi bi-arrow-return-left"></i>
                        Returns

                        {returnRequests.length > 0 && (
                            <span className="nav-count">
                                {returnRequests.length}
                            </span>
                        )}
                    </button>

                    <button
                        className={
                            activeSection === "products"
                                ? "admin-nav-btn active"
                                : "admin-nav-btn"
                        }
                        onClick={() => setActiveSection("products")}
                    >
                        <i className="bi bi-box-seam"></i>
                        Products
                    </button>


                    <button
                        className={
                            activeSection === "orders"
                                ? "admin-nav-btn active"
                                : "admin-nav-btn"
                        }
                        onClick={() => setActiveSection("orders")}
                    >
                        <i className="bi bi-cart-check"></i>
                        Orders

                        {orders.length > 0 && (
                            <span className="nav-count">
                                {orders.length}
                            </span>
                        )}
                    </button>


                    <button
                        className={
                            activeSection === "users"
                                ? "admin-nav-btn active"
                                : "admin-nav-btn"
                        }
                        onClick={() => setActiveSection("users")}
                    >
                        <i className="bi bi-people"></i>
                        Users

                        {users.length > 0 && (
                            <span className="nav-count">
                                {users.length}
                            </span>
                        )}
                    </button>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="admin-error">
                        <i className="bi bi-exclamation-circle"></i>
                        {error}

                        <button
                            onClick={() => {
                                setError("");

                                if (activeSection === "products") {
                                    fetchProducts();
                                }

                                if (activeSection === "orders") {
                                    fetchOrders();
                                }

                                if (activeSection === "users") {
                                    fetchUsers();
                                }
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}


                {/* =================================================
                    PRODUCTS SECTION
                ================================================= */}

                {activeSection === "products" && (

                    <div className="admin-panel">

                        <div className="panel-header">

                            <div>
                                <h2>Products</h2>

                                <p>
                                    Manage all products in your store
                                </p>
                            </div>

                            <span className="panel-count">
                                {products.length} Products
                            </span>

                        </div>


                        {loadingProducts ? (

                            <div className="admin-loading">
                                <div className="spinner"></div>
                                <p>Loading products...</p>
                            </div>

                        ) : products.length === 0 ? (

                            <div className="admin-empty">

                                <i className="bi bi-box-seam"></i>

                                <h3>
                                    No Products Yet
                                </h3>

                                <p>
                                    Add your first product to your store.
                                </p>

                                <Link
                                    to="/add_product"
                                    className="admin-add-btn"
                                >
                                    + Add Product
                                </Link>

                            </div>

                        ) : (

                            <div className="table-wrapper">

                                <table className="admin-table">

                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Brand</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>


                                    <tbody>

                                        {products.map((product) => (

                                            <tr key={product.id}>


                                                <td>
                                                    <div className="product-info">

                                                        <img
                                                            src={`http://localhost:8080/api/product/${product.id}/image`}
                                                            alt={product.name}
                                                            className="product-image"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = "none";
                                                            }}
                                                        />

                                                        <div>
                                                            <div className="product-name">
                                                                {product.name}
                                                            </div>

                                                            <div className="product-id">
                                                                ID #{product.id}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </td>


                                                <td>
                                                    <span className="category-badge">
                                                        {product.category || "N/A"}
                                                    </span>
                                                </td>


                                                <td>
                                                    {product.brand || "N/A"}
                                                </td>


                                                <td>
                                                    <strong>
                                                        ₹{product.price}
                                                    </strong>
                                                </td>


                                                <td>
                                                    <span
                                                        className={
                                                            (product.stockQuantity ?? product.quantity ?? 0) > 0
                                                                ? "quantity available"
                                                                : "quantity unavailable"
                                                        }
                                                    >
                                                        {product.stockQuantity ??
                                                            product.quantity ??
                                                            0}
                                                    </span>
                                                </td>


                                                <td>

                                                    <div className="action-buttons">

                                                        <Link
                                                            to={`/product/${product.id}`}
                                                            className="action-btn view"
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                            <span>View</span>
                                                        </Link>


                                                        <Link
                                                            to={`/product/update/${product.id}`}
                                                            className="action-btn edit"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                            <span>Edit</span>
                                                        </Link>


                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => deleteProduct(product.id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                            <span>Delete</span>
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                )}


                {/* =================================================
    ORDERS SECTION
================================================= */}

                {activeSection === "orders" && (

                    <div className="admin-panel">

                        <div className="panel-header">

                            <div>
                                <h2>Orders</h2>

                                <p>
                                    View and manage customer orders
                                </p>
                            </div>

                            <span className="panel-count">
                                {orders.length} Orders
                            </span>

                        </div>


                        {loadingOrders ? (

                            <div className="admin-loading">
                                <div className="spinner"></div>
                                <p>Loading orders...</p>
                            </div>

                        ) : orders.length === 0 ? (

                            <div className="admin-empty">

                                <i className="bi bi-cart-x"></i>

                                <h3>
                                    No Orders Yet
                                </h3>

                                <p>
                                    Customer orders will appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="table-wrapper">

                                <table className="admin-table orders-table">

                                    <thead>

                                        <tr>
                                            <th>Order</th>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>

                                    </thead>


                                    <tbody>

                                        {orders.map((order) => (

                                            <tr key={order.id}>

                                                {/* =========================
                                    ORDER ID
                                ========================= */}

                                                <td>
                                                    <strong className="order-id">
                                                        #{order.id}
                                                    </strong>
                                                </td>


                                                {/* =========================
                                    CUSTOMER
                                ========================= */}

                                                <td>

                                                    <div className="customer-info">

                                                        <strong>
                                                            {order.fullName ||
                                                                order.userName ||
                                                                "Unknown"}
                                                        </strong>

                                                        <span>
                                                            {order.userEmail || "N/A"}
                                                        </span>

                                                        {/* MOBILE NUMBER */}
                                                        {order.mobileNumber && (
                                                            <span>
                                                                <i className="bi bi-telephone"></i>{" "}
                                                                {order.mobileNumber}
                                                            </span>
                                                        )}

                                                    </div>

                                                </td>


                                                {/* =========================
                                    DATE
                                ========================= */}

                                                <td>

                                                    <span className="date-text">
                                                        {formatDate(order.orderDate)}
                                                    </span>

                                                </td>

                                                {/* =========================
                                    ITEMS
                                ========================= */}

                                                <td>

                                                    <span className="items-count">

                                                        {order.items?.length || 0} item
                                                        {order.items?.length === 1
                                                            ? ""
                                                            : "s"}

                                                    </span>

                                                </td>


                                                {/* =========================
                                    TOTAL
                                ========================= */}

                                                <td>

                                                    <strong>
                                                        ₹{order.totalAmount}
                                                    </strong>

                                                </td>
                                                {/* =========================
                                                     PAYMENT
                                        ========================= */}
                                                <td>
                                                    <div className="payment-info">

                                                        <span
                                                            className={`payment-method ${order.paymentMethod === "COD"
                                                                ? "payment-cod"
                                                                : "payment-razorpay"
                                                                }`}
                                                        >
                                                            <i
                                                                className={
                                                                    order.paymentMethod === "COD"
                                                                        ? "bi bi-cash-coin"
                                                                        : "bi bi-credit-card"
                                                                }
                                                            ></i>

                                                            {order.paymentMethod === "COD"
                                                                ? "COD"
                                                                : "RAZORPAY"}
                                                        </span>

                                                        <span
                                                            className={`payment-status ${order.paymentStatus === "PAID"
                                                                ? "payment-paid"
                                                                : order.paymentStatus === "FAILED"
                                                                    ? "payment-failed"
                                                                    : "payment-pending"
                                                                }`}
                                                        >
                                                            {order.paymentStatus || "PENDING"}
                                                        </span>
                                                        {order.paymentMethod === "COD" &&
                                                            order.paymentStatus !== "PAID" && (
                                                                <button
                                                                    className="mark-payment-btn"
                                                                    onClick={() => markPaymentReceived(order.id)}
                                                                >
                                                                    <i className="bi bi-check-circle"></i>
                                                                    Mark Paid
                                                                </button>
                                                            )}

                                                    </div>
                                                </td>


                                                {/* =========================
                                    STATUS
                                ========================= */}

                                                <td>

                                                    <select
                                                        className={`status-select ${getStatusClass(order.status)}`}
                                                        value={order.status || "PENDING"}
                                                        disabled={updatingOrderId === order.id}
                                                        onChange={(e) =>
                                                            updateOrderStatus(
                                                                order.id,
                                                                e.target.value
                                                            )
                                                        }
                                                    >

                                                        {ORDER_STATUSES.map((status) => (

                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {status}
                                                            </option>

                                                        ))}

                                                    </select>

                                                </td>


                                                {/* =========================
                                    VIEW ORDER
                                ========================= */}

                                                <td>

                                                    <button
                                                        className="view-order-btn"

                                                        onClick={() => {
                                                            setSelectedOrder(order);

                                                            setTrackingForm({
                                                                courierName: order.courierName || "",
                                                                trackingNumber: order.trackingNumber || "",
                                                                trackingUrl: order.trackingUrl || ""
                                                            });
                                                        }}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                        View
                                                    </button>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                )}

                {activeSection === "returns" && (

                    <div className="admin-panel">

                        <div className="panel-header">

                            <div>
                                <h2>Returns & Exchanges</h2>

                                <p>
                                    Manage customer return and exchange requests
                                </p>
                            </div>

                            <span className="panel-count">
                                {returnRequests.length} Requests
                            </span>

                        </div>


                        {loadingReturns ? (

                            <div className="admin-loading">
                                <div className="spinner"></div>
                                <p>Loading return requests...</p>
                            </div>

                        ) : returnRequests.length === 0 ? (

                            <div className="admin-empty">

                                <i className="bi bi-arrow-return-left"></i>

                                <h3>
                                    No Return Requests
                                </h3>

                                <p>
                                    Customer return and exchange requests will appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="table-wrapper">

                                <table className="admin-table">

                                    <thead>

                                        <tr>
                                            <th>Request</th>
                                            <th>Order</th>
                                            <th>Customer</th>
                                            <th>Type</th>
                                            <th>Reason</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>

                                    </thead>


                                    <tbody>

                                        {returnRequests.map((request) => (

                                            <tr key={request.id}>

                                                <td>
                                                    <strong>
                                                        #{request.id}
                                                    </strong>
                                                </td>


                                                <td>
                                                    <strong className="order-id">
                                                        #{request.orderId}
                                                    </strong>
                                                </td>


                                                <td>

                                                    <div className="customer-info">

                                                        <strong>
                                                            {request.name || "Customer"}
                                                        </strong>

                                                        <span>
                                                            {request.email || "N/A"}
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>
                                                    <span
                                                        className={
                                                            request.type === "RETURN"
                                                                ? "return-type-badge"
                                                                : "exchange-type-badge"
                                                        }
                                                    >
                                                        <i
                                                            className={
                                                                request.type === "RETURN"
                                                                    ? "bi bi-box-arrow-left"
                                                                    : "bi bi-arrow-repeat"
                                                            }
                                                        ></i>

                                                        {request.type || "N/A"}
                                                    </span>
                                                </td>


                                                <td>
                                                    <div className="return-reason">
                                                        {request.reason || "No reason provided"}
                                                    </div>
                                                </td>


                                                <td>
                                                    <span className="date-text">
                                                        {formatDate(request.createdAt)}
                                                    </span>
                                                </td>


                                                <td>
                                                    <span
                                                        className={`return-status ${request.status?.toLowerCase() || "pending"
                                                            }`}
                                                    >
                                                        {request.status === "RETURN_REQUESTED"
                                                            ? "RETURN REQUESTED"
                                                            : request.status === "EXCHANGE_REQUESTED"
                                                                ? "EXCHANGE REQUESTED"
                                                                : request.status
                                                                    ? request.status.replace(/_/g, " ")
                                                                    : "PENDING"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="return-action-buttons">

                                                        <button
                                                            className="return-view-btn"
                                                            onClick={() => {
                                                                setSelectedReturnRequest(request);

                                                                setReturnAdminNote(
                                                                    request.adminNote || ""
                                                                );
                                                            }}
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                            View
                                                        </button>

                                                        <select
                                                            className="return-action-select"
                                                            value={request.status || ""}
                                                            disabled={updatingReturnId === request.orderId}
                                                            onChange={(e) =>
                                                                updateReturnStatus(
                                                                    request.orderId,
                                                                    e.target.value
                                                                )
                                                            }
                                                        >

                                                            {getReturnStatusOptions(request).map(
                                                                (status) => (
                                                                    <option
                                                                        key={status}
                                                                        value={status}
                                                                    >
                                                                        {status.replace(/_/g, " ")}
                                                                    </option>
                                                                )
                                                            )}

                                                        </select>

                                                    </div>
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                )}

                {/* =================================================
                    USERS SECTION
                ================================================= */}

                {activeSection === "users" && (

                    <div className="admin-panel">

                        <div className="panel-header">

                            <div>
                                <h2>Users</h2>

                                <p>
                                    View registered users and their roles
                                </p>
                            </div>

                            <span className="panel-count">
                                {users.length} Users
                            </span>

                        </div>


                        {loadingUsers ? (

                            <div className="admin-loading">
                                <div className="spinner"></div>
                                <p>Loading users...</p>
                            </div>

                        ) : users.length === 0 ? (

                            <div className="admin-empty">

                                <i className="bi bi-people"></i>

                                <h3>
                                    No Users Found
                                </h3>

                                <p>
                                    Registered users will appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="table-wrapper">

                                <table className="admin-table users-table">

                                    <thead>

                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>User ID</th>
                                        </tr>

                                    </thead>


                                    <tbody>

                                        {users.map((user) => (

                                            <tr key={user.id}>

                                                <td>

                                                    <div className="user-info">

                                                        <div className="user-avatar">
                                                            {user.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase() || "U"}
                                                        </div>

                                                        <strong>
                                                            {user.name || "Unknown"}
                                                        </strong>

                                                    </div>

                                                </td>


                                                <td>
                                                    {user.email || "N/A"}
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            user.role === "ADMIN"
                                                                ? "role-badge admin-role"
                                                                : "role-badge user-role"
                                                        }
                                                    >
                                                        {user.role || "USER"}
                                                    </span>

                                                </td>


                                                <td>
                                                    <span className="user-id">
                                                        #{user.id}
                                                    </span>
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                )}

            </div>


            {/* =====================================================
    ORDER DETAILS MODAL
===================================================== */}

            {selectedOrder && (

                <div
                    className="modal-overlay"
                    onClick={() => setSelectedOrder(null)}
                >

                    <div
                        className="order-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* =================================================
    ORDER TRACKING
===================================================== */}

                        <div className="order-tracking-section">

                            <div className="tracking-section-header">

                                <div>
                                    <h3>
                                        <i className="bi bi-truck"></i>
                                        Shipping & Tracking
                                    </h3>

                                    <p>
                                        Add courier and tracking information for this order
                                    </p>
                                </div>

                            </div>

                            <div className="tracking-form">

                                <div className="tracking-form-group">
                                    <label>Courier Name</label>

                                    <input
                                        type="text"
                                        placeholder="e.g. Delhivery, Blue Dart"
                                        value={trackingForm.courierName}
                                        onChange={(e) =>
                                            setTrackingForm({
                                                ...trackingForm,
                                                courierName: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <div className="tracking-form-group">
                                    <label>Tracking Number</label>

                                    <input
                                        type="text"
                                        placeholder="Enter tracking number"
                                        value={trackingForm.trackingNumber}
                                        onChange={(e) =>
                                            setTrackingForm({
                                                ...trackingForm,
                                                trackingNumber: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <div className="tracking-form-group">
                                    <label>Tracking URL</label>

                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={trackingForm.trackingUrl}
                                        onChange={(e) =>
                                            setTrackingForm({
                                                ...trackingForm,
                                                trackingUrl: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="save-tracking-btn"
                                    onClick={updateOrderTracking}
                                    disabled={savingTracking}
                                >
                                    {savingTracking ? (
                                        <>
                                            <i className="bi bi-arrow-repeat"></i>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Save Tracking Information
                                        </>
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* =================================================
                MODAL HEADER
            ================================================= */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Order #{selectedOrder.id}
                                </h2>

                                <p>
                                    {formatDate(selectedOrder.orderDate)}
                                </p>

                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setSelectedOrder(null)}
                            >
                                ×
                            </button>

                        </div>


                        {/* =================================================
                CUSTOMER INFORMATION
            ================================================= */}

                        <div className="modal-customer">

                            <div className="modal-avatar">

                                {selectedOrder.userName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}

                            </div>

                            <div>

                                <strong>
                                    {selectedOrder.userName || "Unknown Customer"}
                                </strong>

                                <span>
                                    {selectedOrder.userEmail || "N/A"}
                                </span>

                            </div>

                        </div>


                        {/* =================================================
    CUSTOMER DELIVERY ADDRESS
===================================================== */}

                        <div className="customer-address-section">

                            <div className="address-section-header">

                                <div>
                                    <h3>
                                        <i className="bi bi-geo-alt-fill"></i>
                                        Delivery Address
                                    </h3>

                                    <p>
                                        Shipping details provided by the customer
                                    </p>
                                </div>

                            </div>


                            <div className="address-card">

                                {/* =========================================
            CUSTOMER NAME + MOBILE
        ========================================= */}

                                <div className="address-contact">

                                    <div className="address-contact-item">

                                        <div className="address-icon">
                                            <i className="bi bi-person-fill"></i>
                                        </div>

                                        <div>
                                            <span className="address-label">
                                                Full Name
                                            </span>

                                            <strong>
                                                {selectedOrder.fullName ||
                                                    selectedOrder.userName ||
                                                    "N/A"}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="address-contact-item">

                                        <div className="address-icon">
                                            <i className="bi bi-telephone-fill"></i>
                                        </div>

                                        <div>
                                            <span className="address-label">
                                                Mobile Number
                                            </span>

                                            <strong>
                                                {selectedOrder.mobileNumber || "N/A"}
                                            </strong>
                                        </div>

                                    </div>

                                </div>


                                {/* =========================================
            COMPLETE ADDRESS
        ========================================= */}

                                <div className="address-main">

                                    <span className="address-label">
                                        Complete Address
                                    </span>

                                    <div className="address-text">

                                        <i className="bi bi-house-door"></i>

                                        <span>
                                            {selectedOrder.address || "N/A"}
                                        </span>

                                    </div>

                                </div>


                                {/* =========================================
            LANDMARK
        ========================================= */}

                                {selectedOrder.landmark && (

                                    <div className="address-landmark">

                                        <i className="bi bi-signpost-2"></i>

                                        <div>
                                            <span className="address-label">
                                                Landmark
                                            </span>

                                            <strong>
                                                {selectedOrder.landmark}
                                            </strong>
                                        </div>

                                    </div>

                                )}


                                {/* =========================================
            LOCATION DETAILS
        ========================================= */}

                                <div className="address-location-grid">

                                    <div className="address-location-item">

                                        <span className="address-label">
                                            Area / Locality
                                        </span>

                                        <strong>
                                            {selectedOrder.area || "N/A"}
                                        </strong>

                                    </div>


                                    <div className="address-location-item">

                                        <span className="address-label">
                                            City
                                        </span>

                                        <strong>
                                            {selectedOrder.city || "N/A"}
                                        </strong>

                                    </div>


                                    <div className="address-location-item">

                                        <span className="address-label">
                                            State
                                        </span>

                                        <strong>
                                            {selectedOrder.state || "N/A"}
                                        </strong>

                                    </div>


                                    <div className="address-location-item">

                                        <span className="address-label">
                                            Pincode
                                        </span>

                                        <strong>
                                            {selectedOrder.pincode || "N/A"}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* =================================================
                ORDER STATUS
            ================================================= */}

                        <div className="modal-status-row">

                            <div>

                                <span>
                                    Current Status
                                </span>

                                <strong
                                    className={`modal-status ${getStatusClass(
                                        selectedOrder.status
                                    )}`}
                                >
                                    {selectedOrder.status}
                                </strong>

                            </div>


                            <select
                                className={`status-select modal-status-select ${getStatusClass(
                                    selectedOrder.status
                                )}`}
                                value={selectedOrder.status}
                                disabled={
                                    updatingOrderId === selectedOrder.id
                                }
                                onChange={(e) =>
                                    updateOrderStatus(
                                        selectedOrder.id,
                                        e.target.value
                                    )
                                }
                            >

                                {ORDER_STATUSES.map((status) => (

                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {status}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* =================================================
    PAYMENT INFORMATION
===================================================== */}

                        <div className="payment-details-section">

                            <div className="payment-section-header">
                                <div>
                                    <h3>
                                        <i className="bi bi-wallet2"></i>
                                        Payment Information
                                    </h3>

                                    <p>
                                        Payment method and payment confirmation
                                    </p>
                                </div>
                            </div>

                            <div className="payment-details-card">

                                {/* PAYMENT METHOD */}

                                <div className="payment-detail-item">

                                    <span className="payment-detail-label">
                                        Payment Method
                                    </span>

                                    <strong
                                        className={
                                            selectedOrder.paymentMethod === "COD"
                                                ? "payment-method-text cod"
                                                : "payment-method-text razorpay"
                                        }
                                    >
                                        {selectedOrder.paymentMethod === "COD"
                                            ? "Cash on Delivery"
                                            : "Razorpay"}
                                    </strong>

                                </div>


                                {/* PAYMENT STATUS */}

                                <div className="payment-detail-item">

                                    <span className="payment-detail-label">
                                        Payment Status
                                    </span>

                                    <strong
                                        className={`payment-status-large ${selectedOrder.paymentStatus === "PAID"
                                            ? "paid"
                                            : selectedOrder.paymentStatus === "FAILED"
                                                ? "failed"
                                                : "pending"
                                            }`}
                                    >
                                        <i
                                            className={
                                                selectedOrder.paymentStatus === "PAID"
                                                    ? "bi bi-check-circle-fill"
                                                    : selectedOrder.paymentStatus === "FAILED"
                                                        ? "bi bi-x-circle-fill"
                                                        : "bi bi-clock-fill"
                                            }
                                        ></i>

                                        {selectedOrder.paymentStatus || "PENDING"}
                                    </strong>

                                </div>


                                {/* RAZORPAY PAYMENT ID */}

                                {selectedOrder.paymentMethod !== "COD" &&
                                    selectedOrder.razorpayPaymentId && (

                                        <div className="payment-detail-item">

                                            <span className="payment-detail-label">
                                                Razorpay Payment ID
                                            </span>

                                            <strong className="razorpay-id">
                                                {selectedOrder.razorpayPaymentId}
                                            </strong>

                                        </div>

                                    )}

                            </div>

                        </div>

                        {/* =================================================
                ORDER ITEMS
            ================================================= */}

                        <div className="order-items">

                            <h3>
                                Order Items
                            </h3>


                            {selectedOrder.items?.map((item) => (

                                <div
                                    className="order-item"
                                    key={item.id}
                                >

                                    <div>

                                        <strong>
                                            {item.productName}
                                        </strong>

                                        <span>
                                            Product ID #{item.productId}
                                        </span>

                                    </div>


                                    <div className="order-item-right">

                                        <span>
                                            × {item.quantity}
                                        </span>

                                        <strong>
                                            ₹{item.price}
                                        </strong>

                                    </div>

                                </div>

                            ))}

                        </div>


                        {/* =================================================
                ORDER TOTAL
            ================================================= */}

                        <div className="order-total">

                            <span>
                                Total Amount
                            </span>

                            <strong>
                                ₹{selectedOrder.totalAmount}
                            </strong>

                        </div>


                    </div>

                </div>

            )}

            {/* =====================================================
    RETURN / EXCHANGE DETAILS MODAL
===================================================== */}

            {selectedReturnRequest && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSelectedReturnRequest(null)
                    }
                >

                    <div
                        className="return-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {selectedReturnRequest.type === "RETURN"
                                        ? "Return Request"
                                        : "Exchange Request"}
                                </h2>

                                <p>
                                    Request #
                                    {selectedReturnRequest.id}
                                </p>

                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setSelectedReturnRequest(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* CUSTOMER */}

                        <div className="return-modal-section">

                            <h3>
                                <i className="bi bi-person"></i>
                                Customer
                            </h3>

                            <div className="return-customer-card">

                                <strong>
                                    {selectedReturnRequest.name ||
                                        "Customer"}
                                </strong>

                                <span>
                                    {selectedReturnRequest.email ||
                                        "N/A"}
                                </span>

                            </div>

                        </div>


                        {/* ORDER */}

                        <div className="return-modal-section">

                            <h3>
                                <i className="bi bi-box"></i>
                                Order
                            </h3>

                            <div className="return-order-info">

                                <strong>
                                    Order #
                                    {selectedReturnRequest.orderId}
                                </strong>

                                <span>
                                    Requested on{" "}
                                    {formatDate(
                                        selectedReturnRequest.createdAt
                                    )}
                                </span>

                            </div>

                        </div>


                        {/* REQUEST TYPE */}

                        <div className="return-modal-section">

                            <h3>
                                <i className="bi bi-arrow-repeat"></i>
                                Request Type
                            </h3>

                            <span
                                className={
                                    selectedReturnRequest.type ===
                                        "RETURN"
                                        ? "return-type-badge"
                                        : "exchange-type-badge"
                                }
                            >
                                {selectedReturnRequest.type}
                            </span>

                        </div>


                        {/* REASON */}

                        <div className="return-modal-section">

                            <h3>
                                <i className="bi bi-chat-left-text"></i>
                                Customer Reason
                            </h3>

                            <div className="return-reason-box">

                                {selectedReturnRequest.reason ||
                                    "No reason provided."}

                            </div>

                        </div>


                        {/* CURRENT STATUS */}

                        <div className="return-modal-section">

                            <h3>
                                <i className="bi bi-activity"></i>
                                Request Status
                            </h3>

                            <select
                                className="return-status-admin-select"
                                value={selectedReturnRequest.status}
                                disabled={
                                    updatingReturnId === selectedReturnRequest.id
                                }
                                onChange={(e) =>
                                    updateReturnStatus(
                                        selectedReturnRequest.id,
                                        e.target.value
                                    )
                                }
                            >
                                {getReturnStatusOptions(
                                    selectedReturnRequest
                                ).map((status) => (
                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {status.replace(/_/g, " ")}
                                    </option>
                                ))}
                            </select>

                        </div>


                        {/* ADMIN NOTE */}

                        <div className="return-modal-section">

                            <h3>
                                <i className="bi bi-pencil-square"></i>
                                Admin Note
                            </h3>

                            <textarea
                                className="return-admin-note"
                                rows="4"
                                placeholder="Write a note for the customer..."
                                value={returnAdminNote}
                                onChange={(e) =>
                                    setReturnAdminNote(
                                        e.target.value
                                    )
                                }
                            />

                            <button
                                className="save-return-note-btn"
                                onClick={saveReturnAdminNote}
                                disabled={savingReturnNote}
                            >

                                {savingReturnNote
                                    ? "Saving..."
                                    : "Save Note"}

                            </button>

                        </div>


                        {/* FOOTER */}

                        <div className="return-modal-footer">

                            <button
                                className="close-return-modal-btn"
                                onClick={() =>
                                    setSelectedReturnRequest(null)
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminDashboard;
