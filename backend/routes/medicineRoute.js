import express from "express";
import { addMedicine, getMedicines } from "../controllers/medicineController.js";

const medicineRouter = express.Router();

medicineRouter.post("/upload", addMedicine);
medicineRouter.get("/all-medicines", getMedicines);

export default medicineRouter;