import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const MedicinePage = () => {
    const [medicines, setMedicines] = useState([]);
    const { token, backendUrl, userData } = useContext(AppContext);


    useEffect(() => {
        axios.get("http://localhost:4000/api/medicines/all-medicines")
            .then((res) => setMedicines(res.data))
            .catch((err) => console.error("Error fetching medicines:", err));
    }, []);

    const addToCart = async (medicineId) => {
        try {
            const res = await axios.post("http://localhost:4000/api/user/add-to-cart", {
                userId : userData._id,
                medicineId
            });
            alert(res.data.message);
        } catch (error) {
            console.error("Error adding to cart:", error.response?.data?.error);
            alert(error.response?.data?.error || "Failed to add to cart");
        }
    };

    return (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {medicines.map((medicine) => (
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
                        <button
                            onClick={() => addToCart(medicine._id)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Add to Cart
                        </button>
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MedicinePage;