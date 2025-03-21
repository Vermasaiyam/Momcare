import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    image: { type: String, required: true }, // Cloudinary URL
    summary: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Report", reportSchema);