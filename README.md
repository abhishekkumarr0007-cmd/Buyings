# 🛒 Buyings — Full-Stack E-Commerce Platform

Buyings is a full-stack e-commerce web application built with **React.js**, **Spring Boot**, and **PostgreSQL**.

The application provides a complete online shopping experience for customers, along with an administrative dashboard for managing products, customers, orders, order tracking, return/exchange requests, and customer support messages.

---

## 📌 Project Overview

Buyings is designed as a modern e-commerce platform with a separate frontend and backend architecture.

The frontend is developed using **React.js** and communicates with the backend through REST APIs. The backend is developed using **Spring Boot**, with **Spring Security and JWT** for authentication and authorization. **PostgreSQL** is used as the primary relational database.

The application supports both customer and administrator workflows, including product management, shopping cart functionality, checkout, order management, payment integration, return/exchange processing, and customer support.

---

## ✨ Key Features

### 👤 Customer Features

* User registration and login
* JWT-based authentication
* Role-based authorization
* Secure password handling
* Forgot password functionality
* OTP-based password verification
* Password reset
* Change password
* Customer account management
* Product browsing
* Product details
* Product image display
* Multiple product images
* Shopping cart
* Add/remove products from cart
* Increase/decrease product quantity
* Customer address management
* Checkout
* Multiple payment methods
* Razorpay payment integration
* Order placement
* Order history
* Order status tracking
* Order cancellation
* Return requests
* Exchange requests
* Customer support/contact messages

---

### 👨‍💼 Admin Features

* Secure admin authentication
* Role-based admin access
* Admin dashboard
* Customer management
* Product management
* Add products
* Update products
* Product image management
* Product stock management
* Order management
* Order status management
* Order tracking management
* Return/exchange request management
* Customer address information
* Customer support message management

---

## 🛠️ Technology Stack

### Frontend

* **React.js**
* **JavaScript**
* **HTML5**
* **CSS3**
* **Bootstrap**
* **Axios**
* **React Router**
* **Vite**

### Backend

* **Java**
* **Spring Boot**
* **Spring Data JPA**
* **Spring Security**
* **JWT Authentication**
* **Maven**
* **REST APIs**

### Database

* **PostgreSQL**

### Payment Gateway

* **Razorpay**

### Development Tools

* **Visual Studio Code**
* **IntelliJ IDEA**
* **Postman**
* **Git**
* **GitHub**

---

## 🏗️ Project Architecture

```text
Buyings/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/abhishek/ecom_proj/
│   │   │   │       ├── config/
│   │   │   │       ├── controller/
│   │   │   │       ├── dto/
│   │   │   │       ├── model/
│   │   │   │       ├── repository/
│   │   │   │       ├── security/
│   │   │   │       └── service/
│   │   │   │
│   │   │   └── resources/
│   │   │       └── application-example.properties
│   │   │
│   │   └── test/
│   │
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── Context/
│   │   ├── App.jsx
│   │   ├── api.jsx
│   │   └── axios.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🔐 Authentication & Security

Buyings uses **Spring Security** and **JWT (JSON Web Token)** for authentication and authorization.

The application supports different user roles:

* `USER`
* `ADMIN`

Protected backend APIs require authentication, while role-based authorization restricts administrative functionality to authorized users.

The authentication flow is based on JWT tokens, allowing the frontend to securely communicate with protected backend endpoints.

Sensitive configuration files are intentionally excluded from the public repository using `.gitignore`.

---

## 🛒 E-Commerce Workflow

The typical customer workflow is:

```text
Register / Login
       ↓
Browse Products
       ↓
View Product Details
       ↓
Add Products to Cart
       ↓
Manage Cart
       ↓
Enter / Select Address
       ↓
Checkout
       ↓
Select Payment Method
       ↓
Place Order
       ↓
Track Order
       ↓
Request Return / Exchange
```

---

## 👨‍💼 Admin Workflow

The typical administrator workflow is:

```text
Admin Login
    ↓
Admin Dashboard
    ↓
Manage Products
    ↓
Manage Customers
    ↓
Manage Orders
    ↓
Update Order Status / Tracking
    ↓
Manage Return & Exchange Requests
    ↓
Manage Customer Messages
```

---

## 💳 Payment Integration

Buyings includes **Razorpay** integration for online payments.

The payment functionality is handled through the Spring Boot backend and the frontend checkout workflow.

Payment-related credentials are kept outside the public repository to prevent sensitive information from being exposed.


---

## 📦 Order Management

The application provides a complete order management workflow.

### Customer

Customers can:

* Place orders
* View order history
* View order items
* Track order status
* View payment method
* Cancel eligible orders
* Request returns
* Request exchanges

### Admin

Administrators can:

* View customer orders
* Manage order status
* Update order tracking information
* Review order information
* Manage return/exchange requests

### Supported Order Statuses

```text
PENDING
CONFIRMED
SHIPPED
ON_THE_WAY
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

---

## 🔄 Return & Exchange System

Buyings includes a return and exchange workflow.

Customers can submit return or exchange requests for eligible orders.

Administrators can review and manage these requests from the admin dashboard.

The system maintains request information and return status for proper order management.

---

## 📧 Forgot Password & OTP

The application includes a password recovery system using OTP verification.

The general workflow is:

```text
Enter Email
    ↓
Request OTP
    ↓
Receive OTP
    ↓
Verify OTP
    ↓
Set New Password
```

Email-related credentials are stored in local configuration and are not committed to GitHub.

---

## 🗄️ Database

Buyings uses **PostgreSQL** as its relational database.

The application stores data related to:

* Users
* User roles
* Products
* Product images
* Product stock
* Customer addresses
* Orders
* Order items
* Payment information
* Return/exchange requests
* Contact messages

Spring Data JPA is used for database interaction and entity management.

---

## 📡 REST API Architecture

The backend follows a REST-based architecture.

The application separates backend responsibilities into:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL Database
```

### Backend Layers

#### Controllers

Handle incoming HTTP requests and expose REST endpoints.

Examples include:

* Authentication
* Products
* Orders
* Payments
* Customers
* Returns
* Contact messages
* Admin operations

#### Services

Contain business logic for different application features.

#### Repositories

Handle database operations using Spring Data JPA.

#### DTOs

Data Transfer Objects are used to transfer structured data between the frontend and backend.

#### Models / Entities

Represent the application's database entities.

#### Security

JWT and Spring Security components handle authentication and authorization.

---

## 📁 Important Backend Packages

```text
config/
controller/
dto/
model/
repository/
security/
service/
```

### `config`

Contains application configuration and security configuration.

### `controller`

Contains REST API controllers.

### `dto`

Contains request and response data transfer objects.

### `model`

Contains JPA entities and application models.

### `repository`

Contains Spring Data JPA repositories.

### `security`

Contains JWT-related security components.

### `service`

Contains application business logic.

---

## 💻 Frontend Architecture

The React frontend is organized into reusable components and application contexts.

```text
frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── Context/
│   ├── App.jsx
│   ├── api.jsx
│   ├── axios.jsx
│   ├── App.css
│   └── index.css
│
├── package.json
├── package-lock.json
└── vite.config.js
```

React Context is used for application-level state such as authentication and shopping cart functionality.

Axios is used for communication between the React frontend and Spring Boot backend.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/abhishekkumarr0007-cmd/Buyings.git
```

Move into the project directory:

```bash
cd Buyings
```

---

# ⚙️ Backend Setup

## 2. Open the Backend

```bash
cd backend
```

---

## 3. Configure PostgreSQL

Create a PostgreSQL database for the application.

Then create a local configuration file:

```text
backend/src/main/resources/application.properties
```

The repository contains:

```text
backend/src/main/resources/application-example.properties
```

Use this example configuration as a reference when creating your local `application.properties`.

Configure the required values for:

* PostgreSQL database
* Database username
* Database password
* JWT secret/configuration
* Email service
* Razorpay credentials


---

## 4. Run the Spring Boot Backend

### Windows

Using the Maven wrapper:

```bash
mvnw.cmd spring-boot:run
```

Or, if Maven is installed:

```bash
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

---

# 💻 Frontend Setup

Open a **new terminal**.

From the project root:

```bash
cd frontend
```

---

## 5. Install Dependencies

Run:

```bash
npm install
```

This installs the required React and frontend dependencies.

---

## 6. Start the React Development Server

Run:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

Open that URL in your browser.

---

# 🔑 Configuration & Secrets

Sensitive configuration is intentionally excluded from the GitHub repository.

The following files should remain local:

```text
.env
.env.*
application.properties
application-local.properties
application-secret.properties
```

Before running the backend, configure your own local credentials for:

* PostgreSQL
* JWT
* Email service
* Razorpay

---

## 🔒 Security Considerations

This repository intentionally does not contain production credentials.

Never commit the following information:

* Database passwords
* JWT secrets
* Razorpay secret keys
* Email passwords
* Email app passwords
* API keys
* `.env` files containing secrets
* Production credentials

For deployment, use environment variables or your hosting provider's secret-management system.

---

# 🧪 Testing

Backend tests are included using the Spring Boot testing framework.

API endpoints can also be tested during development using **Postman**.

The backend contains a test structure under:

```text
backend/src/test/
```

---

# 📸 Screenshots & Demo

The following screenshots demonstrate the major features and user interfaces available in the Buyings e-commerce platform.

---

## 👤 User Side

### 🏠 Home Page

The home page provides customers with an intuitive interface for browsing available products and accessing the main shopping features.

![Buyings Home Page](screenshots/user/home.png)

---

### 🔐 Login Page

The login page allows registered customers to securely access their Buyings account using their credentials.

![Buyings Login Page](screenshots/user/login.png)

---

### 📝 Signup Page

The signup page allows new customers to create an account and access the shopping features available on the Buyings platform.

![Buyings Signup Page](screenshots/user/signup.png)

---

### 🛍️ Product Details

Customers can view detailed product information, images, pricing, availability, and add products to their shopping cart.

![Product Details](screenshots/user/product.png)

---

### 🔎 Individual Product View

Customers can open an individual product to view its detailed information, product images, pricing, availability, and purchase-related options.

![Individual Product View](screenshots/user/individual-product.png)

---

### 🛒 Shopping Cart

Customers can review their selected products, modify quantities, remove items, and proceed to checkout.

![Shopping Cart](screenshots/user/cart.png)

---

### 📦 Checkout & Address

Customers can enter or select their delivery address and choose their preferred payment method during checkout.

![Checkout](screenshots/user/checkout.png)

---

### 📋 My Orders

Customers can view their previous orders, order details, order status, and available order-related actions.

![My Orders](screenshots/user/orders.png)

---

### 👤 Customer Account

Customers can manage their account information and access account-related functionality.

![Customer Account](screenshots/user/account.png)

---

### 📩 Contact Us

Customers can use the Contact Us page to submit questions, concerns, or support messages to the Buyings administration team.

![Contact Us](screenshots/user/contact-us.png)

---

## 👨‍💼 Admin Side

### 📊 Admin Dashboard

The admin dashboard provides a centralized interface for managing the e-commerce platform.

![Admin Dashboard](screenshots/admin/dashboard.png)

---

### 📦 Product Management

Administrators can add, update, and manage products and their available stock.

![Product Management](screenshots/admin/products.png)

---

### ➕ Add Product

Administrators can add new products by providing product details such as name, description, brand, price, category, stock quantity, and product images.

![Add Product](screenshots/admin/add-product.png)

---

### ✏️ Update Product

Administrators can update existing product information, including product details, pricing, stock availability, and product images.

![Update Product](screenshots/admin/update-product.png)

---

### 👥 Customer Management

Administrators can view and manage registered customer information.

![Customer Management](screenshots/admin/customers.png)

---

### 🛍️ Order Management

Administrators can view customer orders and manage order status and tracking information.

![Order Management](screenshots/admin/orders.png)

---

### 🔄 Return & Exchange Management

Administrators can review and manage customer return and exchange requests.

![Return & Exchange Management](screenshots/admin/returns.png)

---

### 💬 Customer Messages

Administrators can view and manage messages submitted by customers through the support/contact system.

![Customer Messages](screenshots/admin/messages.png)

---

# 🎥 Functionality Demo

The following videos demonstrate the complete application workflow from both customer and administrator perspectives.

## 👤 User Side Demo

The user-side demonstration covers:

* Registration and login
* Product browsing
* Product details
* Adding products to cart
* Cart management
* Address selection/entry
* Checkout
* Payment flow
* Order placement
* Order tracking
* Return/exchange functionality
* Customer account functionality

▶️ **[![Buyings E-Commerce User Side Demo](screenshots/user-demo-thumbnail.png)](https://youtu.be/Tsaa7hJH0Ns)**

---

## 👨‍💼 Admin Side Demo

The admin-side demonstration covers:

* Admin login
* Admin dashboard
* Product management
* Customer management
* Order management
* Order status updates
* Order tracking
* Return/exchange management
* Customer message management

▶️ **[![Buyings E-Commerce Admin Side Demo](screenshots/admin-demo-thumbnail.png)](https://youtu.be/EWeNlz-44y0)**

---

## 🎯 Complete Application Workflow

```text
                         BUYINGS
                            │
              ┌─────────────┴─────────────┐
              │                           │
           👤 USER                     👨‍💼 ADMIN
              │                           │
       Browse Products              Admin Dashboard
              │                           │
          View Product              Manage Products
              │                           │
          Add to Cart              Manage Customers
              │                           │
           Checkout                Manage Orders
              │                           │
       Select Address              Update Tracking
              │                           │
       Select Payment              Manage Returns
              │                           │
        Place Order                Manage Messages
              │
        Track Order
              │
       Return / Exchange
```


# 🌐 Deployment

The application can be deployed using separate frontend and backend hosting services.

A typical production architecture is:

```text
React Frontend
      ↓
Vercel    
      ↓
Spring Boot REST API
      ↓
Render
      ↓
PostgreSQL Database
```

Deployment Stack:

Frontend: React.js → Vercel
Backend: Spring Boot REST API → Render
Database: PostgreSQL

Production Configuration-

For production deployment:

Configure the frontend with the production backend API URL.
Configure the Spring Boot backend with the production PostgreSQL database.
Store database credentials, JWT secrets, email credentials, and payment gateway keys using environment variables or the hosting platform's secret-management system.
Configure CORS to allow requests from the deployed frontend domain.
Never commit passwords, API keys, JWT secrets, or .env files to the GitHub repository.

Note: The deployment architecture described above is planned for production deployment. The repository currently contains the complete project source code and configuration required to prepare the application for deployment.

---

# 🔮 Future Improvements

Possible future improvements include:

* Production deployment
* Advanced product search
* Advanced product filtering
* Product reviews and ratings
* Wishlist functionality
* Improved analytics dashboard
* Automated order email notifications
* Advanced inventory management
* Cloud-based image storage
* Improved payment reconciliation
* More comprehensive automated testing
* CI/CD pipeline
* Performance optimization
* Enhanced mobile responsiveness

---

# 📚 Learning Outcomes

This project provided practical experience with:

* Full-stack web application development
* React.js
* Spring Boot
* REST API development
* Spring Security
* JWT authentication
* Role-based authorization
* Spring Data JPA
* PostgreSQL
* Database relationships
* DTO-based API design
* Payment gateway integration
* File/image handling
* Order management
* Return/exchange workflows
* Email and OTP functionality
* Git and GitHub
* Frontend/backend integration

---

# 🎯 Project Highlights

### Full-Stack Architecture

The application demonstrates communication between a modern React frontend and a Spring Boot REST backend.

### Secure Authentication

JWT authentication and Spring Security are used to protect application resources and implement role-based access control.

### E-Commerce Functionality

The platform covers major e-commerce workflows including products, cart, checkout, orders, payments, tracking, and returns/exchanges.

### Admin Management

The admin dashboard provides centralized management of products, customers, orders, return/exchange requests, and customer messages.

### Database Integration

PostgreSQL and Spring Data JPA are used for persistent application data.

---

# 👨‍💻 Author

## Abhishek Kumar

**B.Tech Computer Science & Engineering**

GitHub: [abhishekkumarr0007-cmd](https://github.com/abhishekkumarr0007-cmd)

---

# 📄 License

This project is developed for **educational, portfolio, and demonstration purposes**.
