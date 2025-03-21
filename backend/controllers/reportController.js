import cloudinary from "cloudinary";
import Report from "../models/reportModel.js";
import User from "../models/userModel.js";

export const uploadReport = async (req, res) => {
    try {
        console.log("Received Request Body:", req.body);
        console.log("Received File:", req.file);

        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const { userId, summary, dos, donts, condition } = req.body;
        if (!userId) return res.status(400).json({ error: "User ID required" });

        if (!summary || !dos || !donts || !condition) {
            return res.status(400).json({ error: "Incomplete report details" });
        }

        // Upload image to Cloudinary
        cloudinary.v2.uploader.upload_stream({ resource_type: "image" }, async (error, cloudinaryResponse) => {
            if (error) return res.status(500).json({ error: "Cloudinary upload failed" });

            // Save report in MongoDB
            const newReport = new Report({
                image: cloudinaryResponse.secure_url,
                summary,
                dos: JSON.parse(dos),
                donts: JSON.parse(donts),
                condition,
            });

            await newReport.save();

            // Update user's reports array
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ error: "User not found" });

            user.reports.push(newReport._id);
            await user.save();

            res.json({ message: "Report uploaded successfully", report: newReport });
        }).end(req.file.buffer);
    } catch (error) {
        console.error("Error uploading report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserReports = async (req, res) => {
    try {
        const { userId } = req.query;

        // console.log("user id: ", userId);
        
        // Populate the reports field with all details of the reports
        const user = await User.findById(userId).populate({
            path: "reports",
            select: "image summary condition dos donts createdAt", // Select specific fields
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ reports: user.reports });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
};