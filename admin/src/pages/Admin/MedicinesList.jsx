import React, { useEffect, useState } from "react";
import axios from "axios";

const MedicineList = () => {
    const [medicines, setMedicines] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        axios
            .get("http://localhost:4000/api/medicines/all-medicines")
            .then((res) => setMedicines(res.data))
            .catch((err) => console.error("Error fetching medicines:", err));
    }, []);

    const toggleExpand = (id) => {
        setExpanded((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Medicine List</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Salts</th>
                        <th className="border p-2">Company</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Images</th>
                    </tr>
                </thead>
                <tbody>
                    {medicines.map((medicine) => (
                        <tr key={medicine._id} className="text-center">
                            <td className="border p-2">{medicine.name}</td>
                            <td className="border p-2">{medicine.salts.join(", ")}</td>
                            <td className="border p-2">{medicine.company}</td>
                            <td className="border p-2 w-64">
                                <p className={`text-sm ${expanded[medicine._id] ? "" : "line-clamp-2"}`}>
                                    {medicine.description}
                                </p>
                                <button
                                    onClick={() => toggleExpand(medicine._id)}
                                    className="text-blue-500 hover:underline mt-1"
                                >
                                    {expanded[medicine._id] ? "Read Less" : "Read More"}
                                </button>
                            </td>
                            <td className="border p-2">₹{medicine.price}</td>
                            <td className="border p-2">
                                <div className="flex space-x-2 justify-center">
                                    {[medicine.medicineImage, medicine.coverImage, medicine.otherImage].map(
                                        (img, index) =>
                                            img && (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt="Medicine"
                                                    className="w-12 h-12 cursor-pointer rounded"
                                                    onClick={() => setSelectedImage(img)}
                                                />
                                            )
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Fullscreen Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center"
                    onClick={() => setSelectedImage(null)}
                >
                    <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-full rounded" />
                </div>
            )}
        </div>
    );
};

export default MedicineList;