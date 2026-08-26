import axios from "../axios";

import {
    useState,
    useEffect,
    useCallback,
    createContext
} from "react";


const AppContext = createContext({
    data: [],
    isError: "",
    cart: [],

    addToCart: () => { },
    removeFromCart: () => { },
    refreshData: () => { },
    updateStockQuantity: () => { },
    clearCart: () => { },

    cartMessage: "",
    clearCartMessage: () => { }
});


export const AppProvider = ({ children }) => {

    // =====================================================
    // PRODUCTS
    // =====================================================

    const [data, setData] = useState([]);

    const [isError, setIsError] = useState("");


    // =====================================================
    // CART
    // =====================================================

    const [cart, setCart] = useState(() => {

        try {

            const savedCart =
                localStorage.getItem("cart");

            return savedCart
                ? JSON.parse(savedCart)
                : [];

        } catch (error) {

            console.error(
                "Unable to read cart:",
                error
            );

            return [];
        }
    });


    // =====================================================
    // CART SUCCESS MESSAGE
    // =====================================================

    const [cartMessage, setCartMessage] = useState(null);


    // =====================================================
    // FETCH PRODUCTS
    // =====================================================

    const refreshData = useCallback(
        async () => {

            try {

                setIsError("");

                const response =
                    await axios.get("/products");

                if (
                    Array.isArray(
                        response.data
                    )
                ) {

                    setData(response.data);

                } else {

                    setData([]);
                }

            } catch (error) {

                console.error(
                    "Failed to load products:",
                    error
                );

                setIsError(
                    error?.message ||
                    "Unable to load products"
                );

            }

        },
        []
    );


    // =====================================================
    // INITIAL PRODUCT LOAD
    // =====================================================

    useEffect(() => {

        refreshData();

    }, [refreshData]);


    // =====================================================
    // ADD TO CART
    // =====================================================

    const addToCart = useCallback(
        (product, quantity = 1) => {

            if (!product) {
                return;
            }

            if (!product.productAvailable) {
                return;
            }

            const safeQuantity = Math.max(
                1,
                Number(quantity) || 1
            );

            setCart((previousCart) => {

                const existingProduct =
                    previousCart.find(
                        (item) =>
                            item.id === product.id
                    );

                let updatedCart;

                if (existingProduct) {

                    updatedCart =
                        previousCart.map((item) => {

                            if (
                                item.id === product.id
                            ) {

                                return {
                                    ...item,
                                    quantity:
                                        item.quantity +
                                        safeQuantity
                                };
                            }

                            return item;
                        });

                } else {

                    updatedCart = [
                        ...previousCart,
                        {
                            ...product,
                            quantity: safeQuantity
                        }
                    ];
                }

                localStorage.setItem(
                    "cart",
                    JSON.stringify(updatedCart)
                );

                return updatedCart;
            });

            setCartMessage({
                name: product.name || "Product",
                imageId: product.id,
                quantity: safeQuantity,
                price: Number(product.price || 0)
            });

        },
        []
    );


// =====================================================
// AUTOMATICALLY HIDE CART MESSAGE
// =====================================================

useEffect(() => {

    if (!cartMessage) {
        return;
    }


    const timer =
        setTimeout(() => {

            setCartMessage("");

        }, 2500);


    return () => {
        clearTimeout(timer);
    };

}, [cartMessage]);


// =====================================================
// CLEAR CART MESSAGE
// =====================================================

const clearCartMessage =
    useCallback(() => {

        setCartMessage("");

    }, []);


// =====================================================
// REMOVE FROM CART
// =====================================================

const removeFromCart =
    useCallback(
        (productId) => {

            setCart(
                (previousCart) => {

                    const updatedCart =
                        previousCart.filter(
                            (item) =>
                                item.id !==
                                productId
                        );


                    localStorage.setItem(
                        "cart",
                        JSON.stringify(
                            updatedCart
                        )
                    );


                    return updatedCart;
                }
            );

        },
        []
    );


// =====================================================
// UPDATE QUANTITY
// =====================================================

const updateStockQuantity =
    useCallback(
        (
            productId,
            newQuantity
        ) => {

            setCart(
                (previousCart) => {

                    const safeQuantity =
                        Math.max(
                            1,
                            Number(
                                newQuantity
                            ) || 1
                        );


                    const updatedCart =
                        previousCart.map(
                            (item) => {

                                if (
                                    item.id ===
                                    productId
                                ) {

                                    return {
                                        ...item,
                                        quantity:
                                            safeQuantity
                                    };
                                }

                                return item;
                            }
                        );


                    localStorage.setItem(
                        "cart",
                        JSON.stringify(
                            updatedCart
                        )
                    );


                    return updatedCart;
                }
            );

        },
        []
    );


// =====================================================
// CLEAR CART
// =====================================================

const clearCart =
    useCallback(() => {

        setCart([]);

        localStorage.removeItem(
            "cart"
        );

    }, []);


// =====================================================
// PROVIDER
// =====================================================

return (

    <AppContext.Provider
        value={{
            data,
            isError,

            cart,

            addToCart,
            removeFromCart,

            refreshData,

            updateStockQuantity,

            clearCart,

            cartMessage,
            clearCartMessage
        }}
    >

        {children}

    </AppContext.Provider>
);
};


export default AppContext;