import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    salts: { type: [String], required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    medicineImage: { type: String, required: true },
    coverImage: { type: String, required: true },
    otherImage: { type: String, required: true }
}, { timestamps: true });

const medicineModel = mongoose.models.medicine || mongoose.model("medicine", medicineSchema);
export default medicineModel;