import React, {
    createContext,
    useContext,
    useState
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [role, setRole] = useState(
        localStorage.getItem("role")
    );

    const [email, setEmail] = useState(
        localStorage.getItem("email")
    );

    const login = (data) => {

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "email",
            data.email
        );

        localStorage.setItem(
            "role",
            data.role
        );

        setToken(data.token);
        setEmail(data.email);
        setRole(data.role);
    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        setToken(null);
        setEmail(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                role,
                email,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};