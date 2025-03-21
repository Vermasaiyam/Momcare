import Medicine from "../models/medicineModel.js";
import multer from "multer";
import path from "path";

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store images in 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage }).fields([
    { name: "medicineImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "otherImage", maxCount: 1 }
]);

export const addMedicine = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ error: "Image upload failed." });

        try {
            const { name, salts, company, description, price } = req.body;
            const medicine = new Medicine({
                name,
                salts: salts.split(",").map(salt => salt.trim()), // Convert string to array
                company,
                description,
                price,
                medicineImage: req.files["medicineImage"][0].path,
                coverImage: req.files["coverImage"][0].path,
                otherImage: req.files["otherImage"][0].path
            });

            await medicine.save();
            res.status(201).json({ message: "Medicine added successfully!", medicine });
        } catch (error) {
            res.status(500).json({ error: "Failed to add medicine." });
        }
    });
};