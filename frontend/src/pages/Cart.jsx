import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";
import { AppContext } from "../context/AppContext";

const CartPage = () => {
    const { token, userData } = useContext(AppContext);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        if (userData) {
            fetchCartItems();
        }
    }, [userData]);

    const fetchCartItems = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/user/cart/${userData._id}`, {
                headers: { token },
            });
            setCartItems(response.data);
        } catch (error) {
            console.error("Error fetching cart items:", error.response?.data || error.message);
        }
    };

    const removeFromCart = async (medicineId) => {
        try {
            await axios.delete(`http://localhost:4000/api/user/cart/${userData._id}/${medicineId}`, {
                headers: { token },
            });

            setCartItems((prevItems) => prevItems.filter((item) => item._id !== medicineId));
        } catch (error) {
            console.error("Error removing item:", error.response?.data || error.message);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cartItems.map((item) => (
                        <div key={item._id} className="bg-white shadow-md rounded-lg p-4">
                            <img src={item.medicineImage} alt={item.name} className="w-full h-40 object-cover rounded" />
                            <h3 className="text-lg font-semibold mt-2">{item.name}</h3>
                            <p className="text-gray-600">₹{item.price}</p>
                            <button
                                onClick={() => removeFromCart(item._id)}
                                className="mt-3 bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700 transition-all"
                            >
                                <FaTrashAlt /> Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CartPage;