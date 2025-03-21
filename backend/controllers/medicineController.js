import Medicine from "../models/medicineModel.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import connectCloudinary from "../config/cloudinary.js";
import fs from "fs";
import medicineModel from "../models/medicineModel.js";

await connectCloudinary();

// Multer Configuration (temporary storage)
const upload = multer({ dest: "uploads/" }).fields([
    { name: "medicineImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "otherImage", maxCount: 1 }
]);

// Function to upload file to Cloudinary
const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "medicines"
        });
        fs.unlinkSync(filePath); // Remove the local file after upload
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw new Error("Failed to upload image");
    }
};

export const addMedicine = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ error: "Image upload failed." });

        try {
            const { name, salts, company, description, price } = req.body;

            // Upload images to Cloudinary
            const medicineImage = req.files["medicineImage"] ? await uploadToCloudinary(req.files["medicineImage"][0].path) : null;
            const coverImage = req.files["coverImage"] ? await uploadToCloudinary(req.files["coverImage"][0].path) : null;
            const otherImage = req.files["otherImage"] ? await uploadToCloudinary(req.files["otherImage"][0].path) : null;

            // Save to database
            const medicine = new Medicine({
                name,
                salts: salts.split(",").map(salt => salt.trim()), // Convert string to array
                company,
                description,
                price,
                medicineImage,
                coverImage,
                otherImage
            });

            await medicine.save();
            res.status(201).json({ message: "Medicine added successfully!", medicine });

        } catch (error) {
            res.status(500).json({ error: error.message || "Failed to add medicine." });
        }
    });
};


export const getMedicines = async (req, res) => {
    try {
        const medicines = await medicineModel.find({});
        res.status(200).json(medicines);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch medicines" });
    }
};