import express from "express";
import {
  addProject,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/projectoverview.controller.js";
const router = express.Router();

router.get("/", (req, res) => {
  getProject(req, res);
  console.log("Fetched Project");
});
router.post("/", (req, res) => {
  addProject(req, res);
  console.log("Added Project");
});
router.put("/", (req, res) => {
  updateProject(req, res);
  console.log("Updated Project");
});
router.delete("/", (req, res) => {
  deleteProject(req, res);
  console.log("Deleted Project");
});

export default router;
