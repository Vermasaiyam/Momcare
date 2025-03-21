import express from "express";
import multer from "multer";
import { uploadReport } from "../controllers/reportController.js";
import authUser from "../middleware/authUser.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post("/upload", authUser, upload.single("file"), uploadReport);

export default router;