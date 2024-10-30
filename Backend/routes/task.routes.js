import express from "express";
import * as task from '../controllers/task.controllers.js';
const router = express.Router();

router.post("/", task.addingTaskToAllWeeks);
router.put("/update",task.updateParticularWeekTasks);
router.delete("/delete",task.deleteTaskAtParticularWeek);
router.get("/", task.getAllTasksOfParticularDepartment);
export default router;
