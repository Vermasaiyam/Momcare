import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const MedicinePage = () => {
    const [medicines, setMedicines] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const { token, backendUrl, userData } = useContext(AppContext);

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/medicines/all-medicines`);
                setMedicines(res.data);
            } catch (err) {
                console.error("Error fetching medicines:", err);
            }
        };

        const fetchCartItems = async () => {
            if (userData?._id && token) {
                try {
                    const res = await axios.get(`${backendUrl}/api/user/cart/${userData._id}`, {
                        headers: { token },
                    });
                    setCartItems(res.data.cart || []);
                } catch (err) {
                    console.error("Error fetching cart:", err);
                }
            }
        };

        fetchMedicines();
        fetchCartItems();
    }, [backendUrl, userData, token]);


    const addToCart = async (medicineId) => {
        try {
            const res = await axios.post(
                `${backendUrl}/api/user/add-to-cart`,
                { userId: userData._id, medicineId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCartItems([...cartItems, { _id: medicineId }]); // Add item to cart state
            alert(res.data.message);
        } catch (error) {
            console.error("Error adding to cart:", error.response?.data?.error);
            alert(error.response?.data?.error || "Failed to add to cart");
        }
    };

    const removeFromCart = async (medicineId) => {
        try {
            await axios.delete(`${backendUrl}/api/user/cart/${userData._id}/${medicineId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setCartItems(cartItems.filter((item) => item._id !== medicineId)); // Remove from state
        } catch (error) {
            console.error("Error removing item:", error.response?.data || error.message);
        }
    };

    return (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {medicines.map((medicine) => {
                const isInCart = cartItems.some((item) => item._id === medicine._id);

                return (
                    <div key={medicine._id} className="border p-4 rounded-lg shadow-md">
                        <img
                            src={medicine.medicineImage}
                            alt={medicine.name}
                            className="w-full h-40 object-cover rounded"
                        />
                        <h2 className="text-lg font-bold mt-2">{medicine.name}</h2>
                        <p className="text-gray-600">₹{medicine.price}</p>
                        <p className="text-sm line-clamp-2">{medicine.description}</p>
                        <div className="flex space-x-2 mt-3">
                            {isInCart ? (
                                <button
                                    onClick={() => removeFromCart(medicine._id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Remove from Cart
                                </button>
                            ) : (
                                <button
                                    onClick={() => addToCart(medicine._id)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Add to Cart
                                </button>
                            )}
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MedicinePage;