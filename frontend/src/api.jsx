import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    timeout: 10000,
});

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        console.log("=================================");
        console.log(
            "API REQUEST:",
            config.method?.toUpperCase(),
            config.url
        );
        console.log("TOKEN EXISTS:", !!token);

        // =====================================================
        // ATTACH JWT
        // =====================================================

        if (token) {

            config.headers = config.headers || {};

            config.headers.Authorization = `Bearer ${token}`;

            console.log(
                "JWT ATTACHED: Bearer " +
                token.substring(0, 20) +
                "..."
            );

        } else {

            console.warn(
                "NO TOKEN FOUND IN LOCAL STORAGE"
            );
        }

        // =====================================================
        // FORM DATA
        // =====================================================

        if (config.data instanceof FormData) {

            // IMPORTANT:
            // Do NOT manually set multipart/form-data.
            // Browser/Axios will automatically add the boundary.

            delete config.headers["Content-Type"];

        } else {

            config.headers["Content-Type"] =
                "application/json";
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(

    (response) => {

        console.log(
            "API SUCCESS:",
            response.status,
            response.config.url
        );

        return response;
    },

    (error) => {

        if (error.response) {

            console.error(
                "API ERROR:",
                error.response.status,
                error.config?.url
            );

            console.error(
                "SERVER RESPONSE:",
                error.response.data
            );

            // =================================================
            // 401 = JWT missing / invalid / expired
            // =================================================

            if (error.response.status === 401) {

                console.error(
                    "JWT REJECTED BY BACKEND"
                );
            }

            // =================================================
            // 403 = authenticated but no permission
            // =================================================

            if (error.response.status === 403) {

                console.error(
                    "FORBIDDEN - USER DOES NOT HAVE REQUIRED ROLE"
                );
            }

        } else {

            console.error(
                "SERVER UNAVAILABLE:",
                error.message
            );
        }

        return Promise.reject(error);
    }
);

export default api;