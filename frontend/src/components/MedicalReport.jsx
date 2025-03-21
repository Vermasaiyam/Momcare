import { useContext, useState } from "react";
import axios from "axios";
import { Loader2, UploadCloud } from "lucide-react";
import { AppContext } from "../context/AppContext";

const UploadMedicalReport = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    const { token, backendUrl, userData } = useContext(AppContext);

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
            // Step 1: Upload image to Flask backend for transcription
            const transcribeResponse = await axios.post("http://127.0.0.1:10000/transcribe", formData);
            const transcription = transcribeResponse.data.transcription;
            if (!transcription) throw new Error("Failed to extract text from image");

            // Step 2: Process transcription with Flask's /modify route
            const modifyResponse = await axios.post("http://127.0.0.1:10000/modify", { transcription });
            const { summary, dos, donts, condition } = modifyResponse.data;

            if (!summary || !dos || !donts || !condition) {
                console.error("AI Response Missing Fields:", modifyResponse.data);
                throw new Error("AI response is incomplete. Please try again.");
            }

            setReportData({ summary, dos, donts, condition });

            // Step 3: Upload image & AI-processed details to Node.js backend
            const nodeFormData = new FormData();
            nodeFormData.append("file", file);
            nodeFormData.append("userId", userData._id);
            nodeFormData.append("summary", summary);
            nodeFormData.append("dos", JSON.stringify(dos));
            nodeFormData.append("donts", JSON.stringify(donts));
            nodeFormData.append("condition", condition);

            await axios.post(`${backendUrl}/api/reports/upload`, nodeFormData, {
                headers: { token },
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
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
                    Upload & Scan Medical Report
                </h2>

                {/* File Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition">
                    <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
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
                    className={`w-full mt-4 py-2 rounded-lg text-white font-semibold transition duration-300 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md"
                        }`}
                >
                    {loading ? <Loader2 className="animate-spin inline-block mr-2" size={18} /> : "Upload & Scan"}
                </button>
                
                {/* Summary Display */}
                {reportData && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                            📄 Report Summary
                        </h3>

                        <div className="mt-3 space-y-2">
                            <p className="text-gray-700 text-sm flex items-start">
                                <span className="text-blue-600 font-semibold">📝 Summary:</span>
                                <span className="ml-2">{reportData.summary}</span>
                            </p>
                            <p className="text-gray-700 text-sm flex items-start">
                                <span className="text-red-600 font-semibold">⚕️ Condition:</span>
                                <span className="ml-2">{reportData.condition}</span>
                            </p>
                            <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                                <h4 className="text-green-700 font-semibold flex items-center gap-1">
                                    ✅ Do's
                                </h4>
                                <ul className="list-disc list-inside text-gray-700 text-sm mt-1 space-y-1">
                                    {reportData.dos.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg border border-red-300 mt-2">
                                <h4 className="text-red-700 font-semibold flex items-center gap-1">
                                    ❌ Don'ts
                                </h4>
                                <ul className="list-disc list-inside text-gray-700 text-sm mt-1 space-y-1">
                                    {reportData.donts.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadMedicalReport;