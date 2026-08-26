package com.abhishek.ecom_proj.model;

import jakarta.persistence.*;

@Entity
@Table(name = "customer_addresses")
public class CustomerAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // CUSTOMER
    // =========================================================

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        unique = true
    )
    private User user;

    // =========================================================
    // ADDRESS DETAILS
    // =========================================================

    @Column(
        name = "full_name",
        nullable = false,
        length = 150
    )
    private String fullName;

    @Column(
        name = "mobile_number",
        nullable = false,
        length = 10
    )
    private String mobileNumber;

    @Column(
        name = "address",
        nullable = false,
        length = 500
    )
    private String address;

    @Column(
        name = "landmark",
        length = 200
    )
    private String landmark;

    @Column(
        nullable = false,
        length = 6
    )
    private String pincode;

    @Column(
        nullable = false,
        length = 300
    )
    private String area;

    @Column(
        nullable = false,
        length = 100
    )
    private String city;

    @Column(
        nullable = false,
        length = 100
    )
    private String state;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CustomerAddress() {
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLandmark() {
        return landmark;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}