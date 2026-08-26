import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

const CheckoutPopup = ({
  show,
  handleClose,
  cartItems,
  totalPrice,
  handleCheckout,
  loading,
}) => {
  // =========================================================
  // ADDRESS
  // =========================================================

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("COD");

  // =========================================================
  // LOAD SAVED ADDRESS
  // =========================================================

  useEffect(() => {
    if (!show) return;

    const token = localStorage.getItem("token");

    if (!token) return;

    axios
      .get("http://localhost:8080/address", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const savedAddress = response.data;

        if (savedAddress) {
          setFullName(savedAddress.fullName || "");
          setMobileNumber(savedAddress.mobileNumber || "");
          setAddress(savedAddress.address || "");
          setLandmark(savedAddress.landmark || "");
          setPincode(savedAddress.pincode || "");
          setArea(savedAddress.area || "");
          setCity(savedAddress.city || "");
          setState(savedAddress.state || "");
        }
      })
      .catch(() => {
        console.log("No saved address found.");
      });
  }, [show]);

  // =========================================================
  // CONFIRM CHECKOUT
  // =========================================================

  const handleConfirm = () => {

    // ---------------------------------------------------------
    // FULL NAME
    // ---------------------------------------------------------

    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    // ---------------------------------------------------------
    // MOBILE
    // ---------------------------------------------------------

    if (!mobileNumber.trim()) {
      alert("Please enter your mobile number.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    // ---------------------------------------------------------
    // ADDRESS
    // ---------------------------------------------------------

    if (!address.trim()) {
      alert("Please enter your complete address.");
      return;
    }

    // ---------------------------------------------------------
    // PINCODE
    // ---------------------------------------------------------

    if (!pincode.trim()) {
      alert("Please enter your pincode.");
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    // ---------------------------------------------------------
    // AREA
    // ---------------------------------------------------------

    if (!area.trim()) {
      alert("Please enter your area / locality.");
      return;
    }

    // ---------------------------------------------------------
    // CITY
    // ---------------------------------------------------------

    if (!city.trim()) {
      alert("Please enter your city.");
      return;
    }

    // ---------------------------------------------------------
    // STATE
    // ---------------------------------------------------------

    if (!state.trim()) {
      alert("Please enter your state.");
      return;
    }

    // ---------------------------------------------------------
    // PAYMENT
    // ---------------------------------------------------------

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    // ---------------------------------------------------------
    // SEND ADDRESS DATA TO CART
    // ---------------------------------------------------------

    const addressData = {
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      address: address.trim(),
      landmark: landmark.trim(),
      pincode: pincode.trim(),
      area: area.trim(),
      city: city.trim(),
      state: state.trim(),
    };

    handleCheckout(paymentMethod, addressData);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop={loading ? "static" : true}
      keyboard={!loading}
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Checkout</Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* =====================================================
            DELIVERY ADDRESS
        ===================================================== */}

        <div className="mb-4">

          <h6
            style={{
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            Delivery Address
          </h6>

          {/* FULL NAME */}

          <Form.Group className="mb-3">
            <Form.Label>
              Full Name <span style={{ color: "red" }}>*</span>
            </Form.Label>

            <Form.Control
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              disabled={loading}
            />
          </Form.Group>

          {/* MOBILE NUMBER */}

          <Form.Group className="mb-3">
            <Form.Label>
              Mobile Number <span style={{ color: "red" }}>*</span>
            </Form.Label>

            <Form.Control
              type="tel"
              value={mobileNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setMobileNumber(value.slice(0, 10));
              }}
              placeholder="Enter 10-digit mobile number"
              disabled={loading}
              maxLength={10}
            />
          </Form.Group>

          {/* ADDRESS */}

          <Form.Group className="mb-3">
            <Form.Label>
              Address <span style={{ color: "red" }}>*</span>
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House No., Street, Building, etc."
              disabled={loading}
            />
          </Form.Group>

          {/* LANDMARK */}

          <Form.Group className="mb-3">
            <Form.Label>
              Landmark
            </Form.Label>

            <Form.Control
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Enter nearby landmark"
              disabled={loading}
            />
          </Form.Group>

          {/* AREA */}

          <Form.Group className="mb-3">
            <Form.Label>
              Area / Locality <span style={{ color: "red" }}>*</span>
            </Form.Label>

            <Form.Control
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Enter area / locality"
              disabled={loading}
            />
          </Form.Group>

          {/* CITY */}

          <Form.Group className="mb-3">
            <Form.Label>
              City <span style={{ color: "red" }}>*</span>
            </Form.Label>

            <Form.Control
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              disabled={loading}
            />
          </Form.Group>

          {/* STATE */}

          <Form.Group className="mb-3">
            <Form.Label>
              State <span style={{ color: "red" }}>*</span>
            </Form.Label>

            <Form.Control
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Enter state"
              disabled={loading}
            />
          </Form.Group>

          {/* PINCODE */}

          <Form.Group className="mb-3">
            <Form.Label>
              Pincode <span style={{ color: "red" }}>*</span>
            </Form.Label>

            <Form.Control
              type="text"
              value={pincode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPincode(value.slice(0, 6));
              }}
              placeholder="Enter 6-digit pincode"
              disabled={loading}
              maxLength={6}
            />
          </Form.Group>

        </div>

        {/* =====================================================
            CART ITEMS
        ===================================================== */}

        <div className="checkout-items">

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="checkout-item"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
                gap: "12px",
              }}
            >

              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#eee",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                >
                  No Image
                </div>
              )}

              <div>

                <strong>{item.name}</strong>

                <p style={{ margin: "3px 0" }}>
                  Quantity: {item.quantity}
                </p>

                <p style={{ margin: 0 }}>
                  ₹
                  {(
                    Number(item.price) *
                    Number(item.quantity)
                  ).toFixed(2)}
                </p>

              </div>

            </div>
          ))}

        </div>

        <hr />

        {/* =====================================================
            TOTAL
        ===================================================== */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <h5
            style={{
              color: "black",
              fontSize: "1.3rem",
              fontWeight: "bold",
            }}
          >
            Total: ₹{Number(totalPrice).toFixed(2)}
          </h5>
        </div>

        {/* =====================================================
            PAYMENT METHOD
        ===================================================== */}

        <div>

          <h6
            style={{
              fontWeight: "bold",
              marginBottom: "12px",
            }}
          >
            Select Payment Method
          </h6>

          <Form.Check
            type="radio"
            id="payment-cod"
            name="paymentMethod"
            label="Cash on Delivery (COD)"
            value="COD"
            checked={paymentMethod === "COD"}
            onChange={(e) =>
              setPaymentMethod(e.target.value)
            }
            disabled={loading}
            style={{
              marginBottom: "10px",
            }}
          />

          <Form.Check
            type="radio"
            id="payment-upi"
            name="paymentMethod"
            label="UPI / Razorpay"
            value="UPI"
            checked={paymentMethod === "UPI"}
            onChange={(e) =>
              setPaymentMethod(e.target.value)
            }
            disabled={loading}
          />

        </div>

      </Modal.Body>

      <Modal.Footer>

        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={loading}
        >
          Close
        </Button>

        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={
            loading ||
            !paymentMethod ||
            !fullName.trim() ||
            !mobileNumber.trim() ||
            !address.trim() ||
            !pincode.trim() ||
            !area.trim() ||
            !city.trim() ||
            !state.trim()
          }
        >
          {loading
            ? "Processing..."
            : paymentMethod === "COD"
            ? "Place COD Order"
            : "Pay with Razorpay"}
        </Button>

      </Modal.Footer>

    </Modal>
  );
};

export default CheckoutPopup;