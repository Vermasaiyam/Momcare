import { useState, useRef, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AddMedicinePage = () => {
    const { aToken } = useContext(AdminContext);
    const fileInputRefs = {
        medicineImage: useRef(null),
        coverImage: useRef(null),
        otherImage: useRef(null),
    };

    const [medicineData, setMedicineData] = useState({
        name: "",
        salts: "",
        company: "",
        description: "",
        price: "",
        medicineImage: null,
        coverImage: null,
        otherImage: null
    });

    const handleChange = (e) => {
        setMedicineData({ ...medicineData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setMedicineData({ ...medicineData, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", medicineData.name);
        formData.append("salts", medicineData.salts);
        formData.append("company", medicineData.company);
        formData.append("description", medicineData.description);
        formData.append("price", medicineData.price);
        formData.append("medicineImage", medicineData.medicineImage);
        formData.append("coverImage", medicineData.coverImage);
        formData.append("otherImage", medicineData.otherImage);

        try {
            const response = await axios.post("http://localhost:4000/api/medicines/upload", formData, {
                headers: { aToken },
            });

            console.log("Medicine uploaded:", response.data);
            alert("Medicine added successfully!");

            // Reset form fields
            setMedicineData({
                name: "",
                salts: "",
                company: "",
                description: "",
                price: "",
                medicineImage: null,
                coverImage: null,
                otherImage: null
            });

            // Clear file inputs manually
            Object.values(fileInputRefs).forEach(ref => {
                if (ref.current) ref.current.value = "";
            });

        } catch (error) {
            console.error("Error uploading medicine:", error);
            alert("Failed to add medicine.");
        }
    };

    return (
        <div className="min-h-screen w-full mx-10 flex flex-col items-center bg-gray-50 py-10 overflow-y-scroll">
            <h2 className="text-2xl font-semibold mb-4">Add New Medicine</h2>
            <form onSubmit={handleSubmit} className="w-full bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-700">Medicine Name</label>
                    <input
                        type="text"
                        name="name"
                        value={medicineData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Salts (comma separated)</label>
                    <input
                        type="text"
                        name="salts"
                        value={medicineData.salts}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Company Name</label>
                    <input
                        type="text"
                        name="company"
                        value={medicineData.company}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={medicineData.description}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                        required
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Price (₹)</label>
                    <input
                        type="number"
                        name="price"
                        value={medicineData.price}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Medicine Image</label>
                    <input
                        type="file"
                        name="medicineImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRefs.medicineImage}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Cover Image</label>
                    <input
                        type="file"
                        name="coverImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRefs.coverImage}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Other Image</label>
                    <input
                        type="file"
                        name="otherImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRefs.otherImage}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
                >
                    Add Medicine
                </button>
            </form>
        </div>
    );
};

export default AddMedicinePage;