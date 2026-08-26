import "./App.css";
import React, { useState } from "react";

import UserAccount from "./components/UserAccount";
import MyOrders from "./components/MyOrders";
import ContactUs from "./components/ContactUs";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import UpdateProduct from "./components/UpdateProduct";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./components/AdminDashboard";
import "bootstrap-icons/font/bootstrap-icons.css";
import UserDashboard from "./components/UserDashboard";
import AdminContactMessages from "./components/AdminContactMessages";
import CartToast from "./components/CartToast";

import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import { AppProvider } from "./Context/Context";
import { AuthProvider } from "./Context/AuthContext";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


function App() {

    const [cart, setCart] = useState([]);

    const [selectedCategory, setSelectedCategory] =
        useState("");


    // ================= CATEGORY =================

    const handleCategorySelect = (category) => {

        setSelectedCategory(category);

    };


    // ================= ADD TO CART =================

    const addToCart = (product) => {

        setCart((currentCart) => {

            const existingProduct =
                currentCart.find(
                    (item) => item.id === product.id
                );


            // Product already exists
            if (existingProduct) {

                return currentCart.map((item) =>

                    item.id === product.id
                        ? {
                            ...item,
                            quantity:
                                item.quantity + 1
                        }
                        : item
                );

            }


            // New product
            return [
                ...currentCart,
                {
                    ...product,
                    quantity: 1
                }
            ];

        });

    };


    return (

        <AuthProvider>

            <AppProvider>

                <BrowserRouter>

                    {/* ================= NAVBAR ================= */}

                    <Navbar
                        onSelectCategory={
                            handleCategorySelect
                        }
                    />
                    {/* ================= CART TOAST ================= */}

                    <CartToast />


                    {/* ================= ROUTES ================= */}

                    <Routes>


                        {/* ================= HOME ================= */}

                        <Route
                            path="/"
                            element={
                                <Home
                                    addToCart={addToCart}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={handleCategorySelect}
                                />
                            }
                        />


                        {/* ================= AUTH ================= */}

                        <Route
                            path="/login"
                            element={<Login />}
                        />

                        <Route
                            path="/signup"
                            element={<Signup />}
                        />

                        <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                        />


                        {/* ================= CART ================= */}

                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute>
                                    <Cart />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <UserDashboard />
                                </ProtectedRoute>
                            }
                        />
                        


                        {/* ================= PRODUCTS ================= */}

                        <Route
                            path="/product"
                            element={<Product />}
                        />

                        <Route
                            path="/product/:id"
                            element={<Product />}
                        />


                        {/* ================= ADMIN ================= */}

                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />


                        {/* ================= ADD PRODUCT ================= */}

                        <Route
                            path="/add_product"
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <AddProduct />
                                </ProtectedRoute>
                            }
                        />


                        {/* ================= UPDATE PRODUCT ================= */}

                        <Route
                            path="/product/update/:id"
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <UpdateProduct />
                                </ProtectedRoute>
                            }
                        />
                        {/* ================= USER ACCOUNT ================= */}

                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute>
                                    <UserAccount />
                                </ProtectedRoute>
                            }
                        />


                        {/* ================= MY ORDERS ================= */}

                        <Route
                            path="/orders"
                            element={
                                <ProtectedRoute>
                                    <MyOrders />
                                </ProtectedRoute>
                            }
                        />


                        {/* ================= CONTACT US ================= */}

                        <Route
                            path="/contact"
                            element={<ContactUs />}
                        />

                        <Route
                            path="/admin/contact-messages"
                            element={<AdminContactMessages />}
                        />

                        {/* ================= 404 ================= */}

                        <Route
                            path="*"
                            element={
                                <div className="container text-center py-5">

                                    <h1 className="display-4 fw-bold">
                                        404
                                    </h1>

                                    <p className="text-muted">
                                        Page not found
                                    </p>

                                </div>
                            }
                        />

                    </Routes>

                </BrowserRouter>

            </AppProvider>

        </AuthProvider>

    );
}


export default App;

