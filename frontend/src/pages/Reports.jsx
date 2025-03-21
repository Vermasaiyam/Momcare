import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { FilePlus, ArrowLeft, Loader2, ClipboardList } from "lucide-react";

const ReportsPage = () => {
    const { token, backendUrl, userData } = useContext(AppContext);
    const [reports, setReports] = useState([]); // Ensure reports is an array initially
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            if (!userData?._id) {
                console.error("User ID not found!");
                setLoading(false);
                return;
            }

            try {
                console.log("Start");

                const response = await axios.get(`${backendUrl}/api/reports/get-reports`, {
                    headers: { token },
                    params: { userId: userData._id }
                });

                // Ensure response data is always an array
                setReports(response.data.reports || []);
            } catch (error) {
                console.error("Error fetching reports:", error);
                setReports([]); // Ensure it doesn't stay undefined
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50 py-10">
            {/* Header with Upload Button */}
            <div className="w-full max-w-4xl flex justify-between items-center px-4 mb-6">
                <button
                    onClick={() => navigate("/")} // Navigates to home for uploading a new report
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
                >
                    <FilePlus size={18} /> Upload New Report
                </button>
                {selectedReport && (
                    <button
                        onClick={() => setSelectedReport(null)} // Back to list view
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft size={18} /> Back to Reports
                    </button>
                )}
            </div>

            {/* Loading Spinner */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 size={40} className="animate-spin text-blue-600" />
                    <p className="text-gray-700 mt-3">Loading Reports...</p>
                </div>
            ) : (
                <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
                    {selectedReport ? (
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <ClipboardList size={24} className="text-blue-600" />
                                Report Details
                            </h2>

                            {/* Display Report Image */}
                            {selectedReport.image && (
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={selectedReport.image}
                                        alt="Report Image"
                                        className="w-full max-w-md rounded-lg border border-gray-300 shadow-md"
                                    />
                                </div>
                            )}

                            <p className="text-gray-700"><strong>Summary:</strong> {selectedReport.summary}</p>
                            <p className="text-gray-700 mt-2"><strong>Condition:</strong> {selectedReport.condition}</p>

                            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-md">
                                <h3 className="text-green-700 font-semibold">✅ Do's:</h3>
                                <ul className="list-disc list-inside text-gray-700 text-sm mt-1">
                                    {selectedReport.dos.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>

                            <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-md">
                                <h3 className="text-red-700 font-semibold">❌ Don'ts:</h3>
                                <ul className="list-disc list-inside text-gray-700 text-sm mt-1">
                                    {selectedReport.donts.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        // List View of All Reports
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📝 Your Scanned Reports</h2>
                            {reports?.length === 0 ? (
                                <p className="text-gray-600 text-center">No reports found. Upload a new report.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {reports.map((report, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedReport(report)}
                                            className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-md cursor-pointer hover:bg-blue-100 transition"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-800">Report {index + 1}</h3>
                                            <p className="text-gray-700 text-sm"><strong>Condition:</strong> {report.condition}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportsPage;