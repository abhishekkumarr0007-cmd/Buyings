import React, {
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

import AppContext from "../Context/Context";
import axios from "axios";
import CheckoutPopup from "./CheckoutPopup";
import { Button } from "react-bootstrap";
import "./Cart.css";

const API_URL = "http://localhost:8080";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    updateStockQuantity,
  } = useContext(AppContext);

  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState(null);
  const [successPayment, setSuccessPayment] = useState(false);

  // =========================================================
  // PREVENT DOUBLE CHECKOUT
  // =========================================================

  const checkoutInProgress = useRef(false);

  // =========================================================
  // GET JWT TOKEN
  // =========================================================

  const getToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    if (token.startsWith("Bearer ")) {
      return token.substring(7).trim();
    }

    return token.trim();
  };

  // =========================================================
  // FETCH CART PRODUCTS
  // =========================================================

  useEffect(() => {
    const fetchCartProducts = async () => {
      if (!cart || cart.length === 0) {
        setCartItems([]);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/products`
        );

        const backendProducts = response.data || [];

        const updatedCartItems = cart
          .map((cartItem) => {
            const product = backendProducts.find(
              (p) => p.id === cartItem.id
            );

            if (!product) {
              return null;
            }

            return {
              ...product,
              quantity: cartItem.quantity,
            };
          })
          .filter(Boolean);

        const cartItemsWithImages =
          await Promise.all(
            updatedCartItems.map(
              async (item) => {
                try {
                  const imageResponse =
                    await axios.get(
                      `${API_URL}/api/product/${item.id}/image`,
                      {
                        responseType: "blob",
                      }
                    );

                  const imageUrl =
                    URL.createObjectURL(
                      imageResponse.data
                    );

                  return {
                    ...item,
                    imageUrl,
                  };
                } catch (error) {
                  console.error(
                    `Error loading image for product ${item.id}:`,
                    error
                  );

                  return {
                    ...item,
                    imageUrl: "",
                  };
                }
              }
            )
          );

        setCartItems(cartItemsWithImages);
      } catch (error) {
        console.error(
          "Error fetching products:",
          error
        );
      }
    };

    fetchCartProducts();
  }, [cart]);

  // =========================================================
  // CALCULATE TOTAL
  // =========================================================

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) =>
        acc +
        Number(item.price) *
        Number(item.quantity),
      0
    );

    setTotalPrice(total);
  }, [cartItems]);

  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  const handleIncreaseQuantity = (itemId) => {
    if (loading) {
      return;
    }

    const item = cartItems.find(
      (item) => item.id === itemId
    );

    if (!item) {
      return;
    }

    if (
      Number(item.quantity) >=
      Number(item.stockQuantity)
    ) {
      alert(
        "Cannot add more than available stock."
      );
      return;
    }

    const newQuantity =
      Number(item.quantity) + 1;

    // Update global cart + localStorage
    updateStockQuantity(
      itemId,
      newQuantity
    );
  };

  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  const handleDecreaseQuantity = (itemId) => {
    if (loading) {
      return;
    }

    const item = cartItems.find(
      (item) => item.id === itemId
    );

    if (!item) {
      return;
    }

    const newQuantity = Math.max(
      Number(item.quantity) - 1,
      1
    );

    // Update global cart + localStorage
    updateStockQuantity(
      itemId,
      newQuantity
    );
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const handleRemoveFromCart = (itemId) => {
    if (loading) {
      return;
    }

    removeFromCart(itemId);

    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => item.id !== itemId
      )
    );
  };

  // =========================================================
  // CREATE BACKEND ORDER
  // =========================================================

  const createBackendOrder = async (
    paymentMethod,
    addressData
  ) => {
    const token = getToken();

    console.log("========================================");
    console.log("CREATE BACKEND ORDER");
    console.log("JWT token exists:", !!token);
    console.log("Payment Method:", paymentMethod);
    console.log("Address Data:", addressData);
    console.log("========================================");

    if (!token) {
      alert("Please login before placing an order.");
      return null;
    }

    if (
      !addressData ||
      typeof addressData !== "object"
    ) {
      alert("Please enter your delivery address.");
      return null;
    }

    const {
      fullName,
      mobileNumber,
      pincode,
      area,
      city,
      state,
      address,
      addressLine,
      houseNumber,
      landmark,
    } = addressData;

    if (!fullName?.trim()) {
      alert("Please enter your full name.");
      return null;
    }

    if (!mobileNumber?.trim()) {
      alert("Please enter your mobile number.");
      return null;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        mobileNumber.trim()
      )
    ) {
      alert(
        "Please enter a valid 10-digit mobile number."
      );
      return null;
    }

    if (!pincode?.trim()) {
      alert("Please enter your pincode.");
      return null;
    }

    if (
      !/^\d{6}$/.test(
        pincode.trim()
      )
    ) {
      alert(
        "Please enter a valid 6-digit pincode."
      );
      return null;
    }

    if (!area?.trim()) {
      alert(
        "Please enter your area / locality."
      );
      return null;
    }

    if (!city?.trim()) {
      alert("Please enter your city.");
      return null;
    }

    if (!state?.trim()) {
      alert("Please enter your state.");
      return null;
    }

    let completeAddress = "";

    if (address?.trim()) {
      completeAddress = address.trim();
    } else if (addressLine?.trim()) {
      completeAddress = addressLine.trim();
    } else if (houseNumber?.trim()) {
      completeAddress = houseNumber.trim();
    }

    if (area?.trim()) {
      completeAddress +=
        completeAddress
          ? `, ${area.trim()}`
          : area.trim();
    }

    if (landmark?.trim()) {
      completeAddress +=
        `, ${landmark.trim()}`;
    }

    if (city?.trim()) {
      completeAddress +=
        `, ${city.trim()}`;
    }

    if (state?.trim()) {
      completeAddress +=
        `, ${state.trim()}`;
    }

    if (pincode?.trim()) {
      completeAddress +=
        ` - ${pincode.trim()}`;
    }

    if (!completeAddress.trim()) {
      alert(
        "Please enter your complete delivery address."
      );

      return null;
    }

    if (!paymentMethod?.trim()) {
      alert(
        "Please select a payment method."
      );

      return null;
    }

    const requestBody = {
      fullName: fullName.trim(),

      mobileNumber: mobileNumber.trim(),

      address: completeAddress.trim(),

      pincode: pincode.trim(),
      area: area.trim(),
      city: city.trim(),
      state: state.trim(),

      paymentMethod: paymentMethod.trim(),

      items: cartItems.map((item) => ({
        productId:
          item.productId ??
          item.id,

        quantity: item.quantity,
      })),
    };

    console.log(
      "========================================"
    );

    console.log(
      "ORDER REQUEST BODY:"
    );

    console.log(
      JSON.stringify(
        requestBody,
        null,
        2
      )
    );

    console.log(
      "========================================"
    );

    try {
      const response = await axios.post(
        "http://localhost:8080/orders",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      console.log(
        "ORDER CREATED SUCCESSFULLY:"
      );

      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error(
        "ORDER CREATION ERROR:"
      );

      console.error(error);

      if (error.response) {
        console.error(
          "Status:",
          error.response.status
        );

        console.error(
          "Response:",
          error.response.data
        );

        alert(
          error.response.data?.message ||
          error.response.data ||
          "Unable to create order."
        );
      } else {
        alert(
          "Unable to connect to the backend."
        );
      }

      return null;
    }
  };

  // =========================================================
  // CREATE RAZORPAY ORDER
  // =========================================================

  const createRazorpayOrder =
    async (orderId) => {
      const token = getToken();

      if (!token) {
        alert("Please login first.");
        return null;
      }

      try {
        const response =
          await axios.post(
            `${API_URL}/payment/create/${orderId}`,
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },
            }
          );

        console.log(
          "Razorpay order:",
          response.data
        );

        return response.data;
      } catch (error) {
        console.error(
          "Razorpay order error:",
          error
        );

        console.error(
          "Status:",
          error.response?.status
        );

        console.error(
          "Backend response:",
          error.response?.data
        );

        if (
          error.response?.status ===
          401
        ) {
          alert(
            "Your login session has expired. Please login again."
          );
        } else if (
          error.response?.status ===
          403
        ) {
          alert(
            "Access denied while creating Razorpay order. Please check your login."
          );
        } else {
          alert(
            error.response?.data?.message ||
            "Unable to create Razorpay payment."
          );
        }

        return null;
      }
    };

  // =========================================================
  // VERIFY RAZORPAY PAYMENT
  // =========================================================

  const verifyRazorpayPayment =
    async (
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    ) => {
      const token = getToken();

      if (!token) {
        alert("Please login first.");
        return null;
      }

      try {
        const response =
          await axios.post(
            `${API_URL}/payment/verify`,
            {
              razorpay_order_id:
                razorpayOrderId,

              razorpay_payment_id:
                razorpayPaymentId,

              razorpay_signature:
                razorpaySignature,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },
            }
          );

        console.log(
          "Payment verified:",
          response.data
        );

        return response.data;
      } catch (error) {
        console.error(
          "Payment verification error:",
          error
        );

        console.error(
          "Status:",
          error.response?.status
        );

        console.error(
          "Backend response:",
          error.response?.data
        );

        alert(
          error.response?.data?.message ||
          "Payment verification failed."
        );

        return null;
      }
    };

  // =========================================================
  // OPEN RAZORPAY CHECKOUT
  // =========================================================

  const openRazorpayCheckout =
    async (order) => {
      try {
        if (
          !checkoutInProgress.current
        ) {
          return;
        }

        if (!window.Razorpay) {
          alert(
            "Razorpay SDK is not loaded. Please refresh the page."
          );

          checkoutInProgress.current =
            false;

          setLoading(false);

          return;
        }

        const razorpayData =
          await createRazorpayOrder(
            order.id
          );

        if (!razorpayData) {
          checkoutInProgress.current =
            false;

          setLoading(false);

          return;
        }

        console.log(
          "Razorpay data:",
          razorpayData
        );

        const options = {
          key: razorpayData.key,

          amount: Math.round(
            Number(
              razorpayData.amount
            )
          ),

          currency:
            razorpayData.currency ||
            "INR",

          name: "Buyings",

          description:
            `Order #${order.id}`,

          order_id:
            razorpayData.razorpayOrderId,

          handler:
            async function (
              paymentResponse
            ) {
              console.log(
                "Razorpay payment response:",
                paymentResponse
              );

              const verifiedOrder =
                await verifyRazorpayPayment(
                  order.id,

                  paymentResponse.razorpay_order_id,

                  paymentResponse.razorpay_payment_id,

                  paymentResponse.razorpay_signature
                );

              if (verifiedOrder) {
                setSuccessOrderId(
                  verifiedOrder.id
                );

                setSuccessPayment(true);

                setShowSuccessModal(
                  true
                );

                clearCart();

                setCartItems([]);

                setShowModal(false);

                checkoutInProgress.current =
                  false;

                setLoading(false);
              }
            },

          prefill: {
            name:
              order.userName ||
              "",

            email:
              order.userEmail ||
              "",
          },

          theme: {
            color: "#3399cc",
          },

          modal: {
            ondismiss:
              function () {
                console.log(
                  "Razorpay checkout closed."
                );

                checkoutInProgress.current =
                  false;

                setLoading(false);
              },
          },
        };

        const razorpay =
          new window.Razorpay(
            options
          );

        razorpay.on(
          "payment.failed",
          function (
            response
          ) {
            console.error(
              "Razorpay payment failed:",
              response.error
            );

            alert(
              response.error
                ?.description ||
              "Payment failed. Please try again."
            );

            checkoutInProgress.current =
              false;

            setLoading(false);
          }
        );

        razorpay.open();
      } catch (error) {
        console.error(
          "Error opening Razorpay:",
          error
        );

        alert(
          "Unable to open payment gateway."
        );

        checkoutInProgress.current =
          false;

        setLoading(false);
      }
    };

  // =========================================================
  // MAIN CHECKOUT
  // =========================================================

  const handleCheckout =
    async (
      paymentMethod,
      addressData
    ) => {
      if (
        checkoutInProgress.current ||
        loading
      ) {
        console.log(
          "Checkout already in progress. Preventing duplicate order."
        );

        return;
      }

      const token = getToken();

      if (!token) {
        alert(
          "Please login before checkout."
        );

        return;
      }

      if (
        !cartItems ||
        cartItems.length === 0
      ) {
        alert(
          "Your cart is empty."
        );

        return;
      }

      if (!paymentMethod) {
        alert(
          "Please select a payment method."
        );

        return;
      }

      if (
        !addressData ||
        typeof addressData !== "object"
      ) {
        alert(
          "Please enter your delivery address."
        );

        return;
      }

      checkoutInProgress.current =
        true;

      setLoading(true);

      try {
        const order =
          await createBackendOrder(
            paymentMethod,
            addressData
          );

        if (!order) {
          checkoutInProgress.current =
            false;

          setLoading(false);

          return;
        }

        console.log(
          "Created order:",
          order
        );

        if (
          paymentMethod
            .trim()
            .toUpperCase() ===
          "COD"
        ) {
          setSuccessOrderId(order.id);

          setSuccessPayment(false);

          setShowSuccessModal(true);

          clearCart();

          setCartItems([]);

          setShowModal(false);

          checkoutInProgress.current =
            false;

          setLoading(false);

          return;
        }

        if (
          paymentMethod
            .trim()
            .toUpperCase() ===
          "UPI"
        ) {
          await openRazorpayCheckout(
            order
          );

          return;
        }

        alert(
          "Invalid payment method."
        );

        checkoutInProgress.current =
          false;

        setLoading(false);
      } catch (error) {
        console.error(
          "Checkout error:",
          error
        );

        alert(
          error.response?.data?.message ||
          "Something went wrong during checkout."
        );

        checkoutInProgress.current =
          false;

        setLoading(false);
      }
    };

  // =========================================================
  // OPEN CHECKOUT MODAL
  // =========================================================

  const handleOpenCheckout =
    () => {
      if (loading) {
        return;
      }

      if (
        !cartItems ||
        cartItems.length === 0
      ) {
        alert(
          "Your cart is empty."
        );

        return;
      }

      setShowModal(true);
    };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="cart-page">

      {/* PAGE HEADER */}
      <div className="cart-header">
        <div>
          <h2>Shopping Bag</h2>
          {cartItems.length > 0 && (
            <p>
              {cartItems.length}{" "}
              {cartItems.length === 1
                ? "item"
                : "items"}{" "}
              in your bag
            </p>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-header-icon">
            <i className="bi bi-bag-check-fill"></i>
          </div>
        )}
      </div>

      {cartItems.length === 0 ? (
        /* EMPTY CART */
        <div className="cart-empty">

          <div className="empty-cart-icon">
            <i className="bi bi-bag-x"></i>
          </div>

          <h3>Your cart is empty</h3>

          <p>
            Looks like you haven't added
            anything to your cart yet.
          </p>

        </div>
      ) : (
        <div className="cart-layout">

          {/* CART ITEMS */}
          <div className="cart-items-section">

            <div className="cart-items-header">
              <span>Product</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>

            <div className="cart-items-list">
              {cartItems.map(
                (item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    {/* IMAGE */}
                    <div className="cart-product-image-wrapper">
                      {item.imageUrl ? (
                        <img
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.name
                          }
                          className="cart-item-image"
                        />
                      ) : (
                        <div className="cart-image-unavailable">
                          <i className="bi bi-image"></i>
                        </div>
                      )}
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="cart-product-details">

                      <span className="cart-product-brand">
                        {item.brand}
                      </span>

                      <h3>
                        {item.name}
                      </h3>

                      <div className="cart-product-price">
                        ₹
                        {Number(
                          item.price
                        ).toFixed(2)}
                      </div>

                    </div>

                    {/* QUANTITY */}
                    <div className="cart-quantity-wrapper">

                      <button
                        className="quantity-btn minus-btn"
                        type="button"
                        disabled={
                          loading
                        }
                        onClick={() =>
                          handleDecreaseQuantity(
                            item.id
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        <i className="bi bi-dash"></i>
                      </button>

                      <span className="quantity-value">
                        {item.quantity}
                      </span>

                      <button
                        className="quantity-btn plus-btn"
                        type="button"
                        disabled={
                          loading
                        }
                        onClick={() =>
                          handleIncreaseQuantity(
                            item.id
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <i className="bi bi-plus"></i>
                      </button>

                    </div>

                    {/* ITEM TOTAL */}
                    <div className="cart-item-total">
                      ₹
                      {(
                        Number(
                          item.price
                        ) *
                        Number(
                          item.quantity
                        )
                      ).toFixed(2)}
                    </div>

                    {/* REMOVE */}
                    <button
                      className="remove-btn"
                      type="button"
                      disabled={
                        loading
                      }
                      onClick={() =>
                        handleRemoveFromCart(
                          item.id
                        )
                      }
                      aria-label="Remove item"
                    >
                      <i className="bi bi-trash3"></i>
                    </button>

                  </div>
                )
              )}
            </div>

          </div>

          {/* ORDER SUMMARY */}
          <div className="cart-summary">

            <div className="summary-header">
              <h3>Order Summary</h3>
            </div>

            <div className="summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {Number(
                  totalPrice
                ).toFixed(2)}
              </strong>
            </div>

            <div className="summary-row">
              <span>
                Delivery
              </span>

              <span className="free-delivery">
                FREE
              </span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>
                Total
              </span>

              <strong>
                ₹
                {Number(
                  totalPrice
                ).toFixed(2)}
              </strong>
            </div>

            <Button
              className="checkout-btn"
              onClick={
                handleOpenCheckout
              }
              disabled={
                loading ||
                checkoutInProgress.current
              }
            >
              {loading ? (
                <>
                  <span
                    className="checkout-spinner"
                  ></span>

                  Processing...
                </>
              ) : (
                <>
                  Proceed to Checkout

                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </Button>

            <div className="secure-checkout">
              <i className="bi bi-shield-check"></i>

              <span>
                Secure checkout
              </span>
            </div>

          </div>

        </div>
      )}

      {/* CHECKOUT POPUP */}
      <CheckoutPopup
        show={showModal}
        handleClose={() => {
          if (!loading) {
            setShowModal(false);
          }
        }}
        cartItems={cartItems}
        totalPrice={totalPrice}
        handleCheckout={
          handleCheckout
        }
        loading={loading}
      />

      {/* =========================================================
          ORDER SUCCESS POPUP
      ========================================================= */}

      <div
        className={`order-success-overlay ${showSuccessModal
          ? "show"
          : ""
          }`}
      >

        <div className="order-success-popup">

          <button
            type="button"
            className="success-popup-close"
            onClick={() => {
              setShowSuccessModal(
                false
              );

              setSuccessOrderId(
                null
              );
            }}
          >
            <i className="bi bi-x"></i>
          </button>

          <div className="success-icon">
            <i className="bi bi-check-lg"></i>
          </div>

          <h2>
            {successPayment
              ? "Payment Successful!"
              : "Order Placed Successfully!"}
          </h2>

          <p>
            {successPayment
              ? "Your payment has been successfully received and your order is confirmed."
              : "Thank you for your order. Your order has been successfully placed."}
          </p>

          <div className="success-order-number">
            <span>
              Order
            </span>

            <strong>
              #{successOrderId}
            </strong>
          </div>

          <button
            type="button"
            className="success-close-btn"
            onClick={() => {
              setShowSuccessModal(
                false
              );

              setSuccessOrderId(
                null
              );
            }}
          >
            Continue Shopping
            <i className="bi bi-arrow-right"></i>
          </button>

        </div>

      </div>

    </div>
  );
};

export default Cart;