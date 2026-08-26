import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

const UpdateProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [updateProduct, setUpdateProduct] = useState({
        id: null,
        name: "",
        description: "",
        brand: "",
        price: "",
        category: "",
        releaseDate: "",
        productAvailable: false,
        stockQuantity: "",
    });

    // =========================
    // LOAD PRODUCT
    // =========================

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    `/api/product/${id}`
                );

                const product = response.data;

                setUpdateProduct({
                    id: product.id,
                    name: product.name || "",
                    description: product.description || "",
                    brand: product.brand || "",
                    price: product.price || "",
                    category: product.category || "",
                    releaseDate: product.releaseDate
                        ? product.releaseDate.substring(0, 10)
                        : "",
                    productAvailable:
                        product.productAvailable ?? false,
                    stockQuantity:
                        product.stockQuantity ?? "",
                });

                // ==========================================
                // LOAD ALL EXISTING IMAGES
                // ==========================================

                try {
                    const imageIdsResponse = await api.get(
                        `/api/product/${id}/images`
                    );

                    const imageIds = imageIdsResponse.data || [];

                    const existingPreviews = imageIds.map(
                        (imageId) =>
                            `${api.defaults.baseURL}/api/product/image/${imageId}`
                    );

                    setPreviews(existingPreviews);

                } catch (imageError) {

                    console.log("No existing images found.");

                    setPreviews([]);
                }

            } catch (error) {

                console.error(
                    "Error fetching product:",
                    error
                );

                alert(
                    "Failed to load product."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);


    // =========================
    // CLEAN PREVIEW URL
    // =========================




    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setUpdateProduct((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // =========================
    // HANDLE CHECKBOX
    // =========================

    const handleAvailabilityChange = (e) => {

        setUpdateProduct((previous) => ({
            ...previous,
            productAvailable: e.target.checked,
        }));
    };


    // =========================
    // HANDLE IMAGE
    // =========================

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length === 0) {
            return;
        }

        setImages((previous) => [
            ...previous,
            ...selectedFiles
        ]);

        const newPreviews = selectedFiles.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviews((previous) => [
            ...previous,
            ...newPreviews
        ]);

        // Allow selecting the same file again
        e.target.value = "";
    };
    // =========================
    // UPDATE PRODUCT
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (updating) {
            return;
        }

        try {

            setUpdating(true);

            const formData = new FormData();

            /*
             * Backend expects:
             *
             * @RequestPart("product")
             * @RequestPart("imageFile")
             */

            const productData = {
                id: updateProduct.id,
                name: updateProduct.name,
                description: updateProduct.description,
                brand: updateProduct.brand,
                price: updateProduct.price,
                category: updateProduct.category,
                releaseDate: updateProduct.releaseDate,
                productAvailable:
                    updateProduct.productAvailable,
                stockQuantity:
                    Number(updateProduct.stockQuantity),
            };

            formData.append(
                "product",
                new Blob(
                    [JSON.stringify(productData)],
                    {
                        type: "application/json",
                    }
                )
            );

            /*
             * Your backend currently requires imageFile.
             *
             * If the existing image was loaded successfully,
             * it will be sent again.
             *
             * If a new image was selected,
             * the new image will be sent.
             */

            // ==========================================
            // ADD NEW IMAGES IF SELECTED
            // ==========================================

            if (images.length > 0) {

                images.forEach((file) => {

                    formData.append(
                        "imageFiles",
                        file
                    );

                });

            }


            console.log(
                "Updating product:",
                productData
            );

            const response = await api.put(
                `/api/product/${id}`,
                formData
            );

            console.log(
                "Update response:",
                response.data
            );

            alert(
                "Product updated successfully!"
            );

            navigate(
                "/admin"
            );

        } catch (error) {

            console.error(
                "UPDATE PRODUCT ERROR:",
                error
            );

            console.error(
                "Response:",
                error.response?.data
            );

            console.error(
                "Status:",
                error.response?.status
            );

            if (error.response?.status === 401) {

                alert(
                    "Your login session has expired. Please login again."
                );

            } else if (error.response?.status === 403) {

                alert(
                    "You do not have permission to update products."
                );

            } else {

                alert(
                    error.response?.data ||
                    "Failed to update product."
                );
            }

        } finally {

            setUpdating(false);

        }
    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="update-page">

                <div className="update-card loading-card">

                    <div className="spinner"></div>

                    <h3>
                        Loading product...
                    </h3>

                </div>

            </div>
        );
    }


    // =========================
    // UI
    // =========================

    return (

        <div className="update-page">

            <div className="update-container">

                <div className="update-header">

                    <div>

                        <h1>
                            Update Product
                        </h1>

                        <p>
                            Edit product information
                        </p>

                    </div>

                    <button
                        type="button"
                        className="back-btn"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        ← Back to Dashboard
                    </button>

                </div>


                <form
                    className="update-card"
                    onSubmit={handleSubmit}
                >

                    {/* PRODUCT INFORMATION */}

                    <div className="section-title">

                        <h2>
                            Product Information
                        </h2>

                        <p>
                            Update the details of your product.
                        </p>

                    </div>


                    <div className="form-grid">

                        {/* NAME */}

                        <div className="form-group">

                            <label>
                                Product Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={updateProduct.name}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* BRAND */}

                        <div className="form-group">

                            <label>
                                Brand
                            </label>

                            <input
                                type="text"
                                name="brand"
                                value={updateProduct.brand}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* PRICE */}

                        <div className="form-group">

                            <label>
                                Price
                            </label>

                            <input
                                type="number"
                                name="price"
                                value={updateProduct.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                            />

                        </div>


                        {/* CATEGORY */}

                        <div className="form-group">

                            <label>
                                Category
                            </label>

                            <select
                                name="category"
                                value={updateProduct.category}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select category
                                </option>

                                <option value="Laptop">
                                    Laptop
                                </option>

                                <option value="Headphone">
                                    Headphone
                                </option>

                                <option value="Mobile">
                                    Mobile
                                </option>

                                <option value="Electronics">
                                    Electronics
                                </option>

                                <option value="Toys">
                                    Toys
                                </option>

                                <option value="Fashion">
                                    Fashion
                                </option>

                            </select>

                        </div>


                        {/* STOCK */}

                        <div className="form-group">

                            <label>
                                Stock Quantity
                            </label>

                            <input
                                type="number"
                                name="stockQuantity"
                                value={
                                    updateProduct.stockQuantity
                                }
                                onChange={handleChange}
                                min="0"
                                required
                            />

                        </div>


                        {/* RELEASE DATE */}

                        <div className="form-group">

                            <label>
                                Release Date
                            </label>

                            <input
                                type="date"
                                name="releaseDate"
                                value={
                                    updateProduct.releaseDate
                                }
                                onChange={handleChange}
                            />

                        </div>


                        {/* DESCRIPTION */}

                        <div className="form-group full-width">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    updateProduct.description
                                }
                                onChange={handleChange}
                                rows="5"
                                required
                            />

                        </div>

                    </div>


                    {/* IMAGE */}

                    <div className="image-section">

                        <div className="section-title">

                            <h2>
                                Product Images
                            </h2>

                            <p>
                                Select one or multiple images to replace the existing images.
                            </p>

                        </div>


                        <div className="image-content">

                            <div className="image-previews">

                                {previews.length > 0 ? (

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(3, 1fr)",
                                            gap: "10px"
                                        }}
                                    >

                                        {previews.map((src, index) => (

                                            <img
                                                key={index}
                                                src={src}
                                                alt={`Product preview ${index + 1}`}
                                                style={{
                                                    width: "100%",
                                                    height: "120px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px"
                                                }}
                                            />

                                        ))}

                                    </div>

                                ) : (

                                    <div className="no-image">
                                        No Image
                                    </div>

                                )}

                            </div>


                            <div className="image-upload">

                                <label>
                                    Change Images
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                />

                                <small>
                                    JPG, PNG, WEBP supported
                                </small>

                            </div>

                        </div>

                    </div>


                    {/* AVAILABILITY */}

                    <div className="availability-box">

                        <div>

                            <strong>
                                Product Availability
                            </strong>

                            <p>
                                Allow customers to purchase
                                this product.
                            </p>

                        </div>

                        <label className="switch">

                            <input
                                type="checkbox"
                                checked={
                                    updateProduct.productAvailable
                                }
                                onChange={
                                    handleAvailabilityChange
                                }
                            />

                            <span></span>

                        </label>

                    </div>


                    {/* BUTTONS */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() =>
                                navigate("/admin")
                            }
                            disabled={updating}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="update-btn"
                            disabled={updating}
                        >

                            {updating ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    ✓ Update Product
                                </>
                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default UpdateProduct;
