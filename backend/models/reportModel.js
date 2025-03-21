import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    image: { type: String, required: true },
    summary: { type: String, required: true },
    condition: { type: String, required: true },
    dos: { type: [String], required: true },
    donts: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Report", reportSchema);
