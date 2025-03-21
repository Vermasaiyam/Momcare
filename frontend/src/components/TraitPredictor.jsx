import React, { useState } from "react";
import axios from "axios";

const TraitPredictor = () => {
    const [fatherTrait, setFatherTrait] = useState("");
    const [motherTrait, setMotherTrait] = useState("");
    const [selectedTrait, setSelectedTrait] = useState("eye_color");
    const [prediction, setPrediction] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const traitOptions = {
        eye_color: ["Brown", "Blue", "Green"],
        hair_color: ["Black", "Brown", "Blonde", "Red"],
        skin_tone: ["Light", "Medium", "Dark"]
    };

    const handlePredict = async () => {
        if (!fatherTrait || !motherTrait) {
            alert("Please select traits for both parents!");
            return;
        }

        setLoading(true);
        setError("");
        setPrediction("");

        try {
            const response = await axios.post("http://127.0.0.1:10000/predict-gene", {
                trait: selectedTrait,
                father_trait: fatherTrait,
                mother_trait: motherTrait
            });

            setPrediction(response.data.predicted_trait);
        } catch (err) {
            setError("Error predicting traits. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-bold text-center mb-4">Baby Trait Predictor</h2>

            <label className="block font-semibold">Select Trait to Predict:</label>
            <select
                value={selectedTrait}
                onChange={(e) => setSelectedTrait(e.target.value)}
                className="w-full p-2 border rounded mb-3"
            >
                <option value="eye_color">Eye Color</option>
                <option value="hair_color">Hair Color</option>
                <option value="skin_tone">Skin Tone</option>
            </select>

            <label className="block font-semibold">Father's {selectedTrait.replace("_", " ")}:</label>
            <select
                value={fatherTrait}
                onChange={(e) => setFatherTrait(e.target.value)}
                className="w-full p-2 border rounded mb-3"
            >
                <option value="">Select</option>
                {traitOptions[selectedTrait].map((option, idx) => (
                    <option key={idx} value={option}>
                        {option}
                    </option>
                ))}
            </select>

            <label className="block font-semibold">Mother's {selectedTrait.replace("_", " ")}:</label>
            <select
                value={motherTrait}
                onChange={(e) => setMotherTrait(e.target.value)}
                className="w-full p-2 border rounded mb-3"
            >
                <option value="">Select</option>
                {traitOptions[selectedTrait].map((option, idx) => (
                    <option key={idx} value={option}>
                        {option}
                    </option>
                ))}
            </select>

            <button
                onClick={handlePredict}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                disabled={loading}
            >
                {loading ? "Predicting..." : "Predict Baby Trait"}
            </button>

            {error && <p className="text-red-500 mt-3">{error}</p>}

            {prediction && (
                <div className="mt-5">
                    <h3 className="text-xl font-semibold">Predicted Baby {selectedTrait.replace("_", " ")}:</h3>
                    <p className="text-lg text-blue-600">{prediction}</p>
                </div>
            )}
        </div>
    );
};

export default TraitPredictor;