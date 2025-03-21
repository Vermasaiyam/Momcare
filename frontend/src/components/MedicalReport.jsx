import { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const UploadMedicalReport = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file");
    
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            // Step 1: Send image to Flask backend for transcription & summary
            const flaskResponse = await axios.post("http://127.0.0.1:10000/transcribe", formData);
            const transcription = flaskResponse.data.transcription;
    
            const modifyResponse = await axios.post("http://127.0.0.1:10000/modify", { transcription });
            const summaryText = modifyResponse.data.summary;
            setSummary(summaryText);
    
            // Step 2: Send image & summary to Node.js backend (with token)
            const token = localStorage.getItem("token"); // Get JWT token
    
            const nodeFormData = new FormData();
            nodeFormData.append("file", file);
            nodeFormData.append("summary", summaryText);
    
            await axios.post("http://localhost:4000/api/reports", nodeFormData, {
                headers: { Authorization: `Bearer ${token}` }, // Include token in headers
            });
    
            alert("Report uploaded successfully!");
        } catch (error) {
            console.error("Error:", error);
            alert("Error processing the report.");
        } finally {
            setLoading(false);
        }
    };    

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                    Upload and Scan Medical Report
                </h2>

                {/* File Input */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-700 bg-white p-2 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
                    />
                </div>

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`w-full mt-4 py-2 rounded-lg text-white font-semibold 
                    ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    {loading ? <Loader2 className="animate-spin inline-block mr-2" size={18} /> : "Upload & Scan"}
                </button>

                {/* Summary Display */}
                {summary && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800">Summary:</h3>
                        <p className="text-gray-700 text-sm mt-1">{summary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadMedicalReport;