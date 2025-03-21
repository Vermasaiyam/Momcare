import express from "express";
import multer from "multer";
import { uploadReport } from "../controllers/reportController.js";
import authUser from "../middleware/authUser.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", authUser, upload.single("file"), uploadReport); // Apply auth middleware

export default router;