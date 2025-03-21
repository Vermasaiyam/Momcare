import express from "express";
import multer from "multer";
import { getUserReports, uploadReport } from "../controllers/reportController.js";
import authUser from "../middleware/authUser.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post("/upload", authUser, upload.single("file"), uploadReport);
router.get("/get-reports", getUserReports);

export default router;