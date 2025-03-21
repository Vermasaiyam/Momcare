import cloudinary from "cloudinary";
import Report from "../models/reportModel.js";
import User from "../models/userModel.js"; // Import user model

export const uploadReport = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const userId = req.user.id; // Get userId from req.user (set in authUser middleware)
        if (!userId) return res.status(400).json({ error: "User ID required" });

        // Upload image to Cloudinary
        cloudinary.v2.uploader.upload_stream({ resource_type: "image" }, async (error, cloudinaryResponse) => {
            if (error) return res.status(500).json({ error: "Cloudinary upload failed" });

            // Save report in MongoDB
            const newReport = new Report({
                image: cloudinaryResponse.secure_url,
                summary: req.body.summary,
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