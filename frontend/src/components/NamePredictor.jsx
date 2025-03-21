import React, { useState } from "react";
import axios from "axios";

const NamePredictor = () => {
    const [fatherName, setFatherName] = useState("");
    const [motherName, setMotherName] = useState("");
    const [babyNames, setBabyNames] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handlePredict = async () => {
        if (!fatherName || !motherName) {
            alert("Please enter both names!");
            return;
        }

        setLoading(true);
        setError("");
        setBabyNames(null);

        try {
            const response = await axios.post("http://127.0.0.1:10000/name-predictor", {
                father_name: fatherName,
                mother_name: motherName,
            });

            setBabyNames(response.data);
        } catch (err) {
            setError("Error predicting names. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-bold text-center mb-4">Name Predictor</h2>

            <input
                type="text"
                placeholder="Father's Name"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full p-2 border rounded mb-3"
            />

            <input
                type="text"
                placeholder="Mother's Name"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                className="w-full p-2 border rounded mb-3"
            />

            <button
                onClick={handlePredict}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                disabled={loading}
            >
                {loading ? "Predicting..." : "Predict Names"}
            </button>

            {error && <p className="text-red-500 mt-3">{error}</p>}

            {babyNames && (
                <div className="mt-5">
                    <h3 className="text-xl font-semibold">Predicted Names:</h3>
                    <div className="mt-2">
                        <h4 className="font-bold">Baby Boy Names:</h4>
                        <ul className="list-disc ml-5">
                            {babyNames.boy_names.map((name, idx) => (
                                <li key={idx}>{name}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-2">
                        <h4 className="font-bold">Baby Girl Names:</h4>
                        <ul className="list-disc ml-5">
                            {babyNames.girl_names.map((name, idx) => (
                                <li key={idx}>{name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NamePredictor;