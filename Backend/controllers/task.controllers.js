import Task from "../models/task.models.js";

export const addingTaskToAllWeeks = async (req, res) => {
  try {
    // Validate request body
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array of tasks",
      });
    }

    const newTasks = await Task.insertMany(req.body);

    return res.status(201).json({
      success: true,
      message: "Successfully added all tasks",
      tasks: newTasks,
    });
  } catch (err) {
    console.error("Error in addingTaskToAllWeeks:", err);
    return res.status(500).json({
      success: false,
      message: "Error adding tasks",
      error: err.message,
    });
  }
};

export const updateParticularWeekTasks = async (req, res) => {
  try {
    const { title, weekNumber, updatedTask } = req.body;

    // Input validation
    if (!title || !weekNumber || !updatedTask) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, weekNumber, or updatedTask",
      });
    }

    const task = await Task.findOne({ mainTitle: title.toLowerCase() });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if weekNumber is valid
    if (weekNumber < 1 || weekNumber > task.weeklyPlans.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid week number. Must be between 1 and ${task.weeklyPlans.length}`,
      });
    }

    // Update the specific week's tasks
    const weekIndex = weekNumber - 1;
    if (!task.weeklyPlans[weekIndex]) {
      task.weeklyPlans[weekIndex] = [];
    }

    // Merge the updated task with existing data
    task.weeklyPlans[weekIndex] = task.weeklyPlans[weekIndex].map((plan) => ({
      ...plan,
      ...updatedTask,
      updatedAt: new Date(),
    }));

    const updatedDocument = await task.save();

    return res.status(200).json({
      success: true,
      message: "Task successfully updated",
      task: updatedDocument,
    });
  } catch (err) {
    console.error("Error in updateParticularWeekTasks:", err);
    return res.status(500).json({
      success: false,
      message: "Error updating task",
      error: err.message,
    });
  }
};

export const deleteTaskAtParticularWeek = async (req, res) => {
  try {
    const { title, weekNumber } = req.body;

    if (!title || !weekNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title or weekNumber",
      });
    }

    const task = await Task.findOne({ mainTitle: title.toLowerCase() });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (weekNumber < 1 || weekNumber > task.weeklyPlans.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid week number. Must be between 1 and ${task.weeklyPlans.length}`,
      });
    }

    // Remove the specified week
    task.weeklyPlans.splice(weekNumber - 1, 1);
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Successfully deleted week's tasks",
    });
  } catch (err) {
    console.error("Error in deleteTaskAtParticularWeek:", err);
    return res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: err.message,
    });
  }
};

export const getAllTasksOfParticularDepartment = async (req, res) => {
  try {
    const { title } = req.query;
    console.log(title);

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const tasks = await Task.findOne({ mainTitle: title.toLowerCase() });

    if (!tasks) {
      return res.status(404).json({
        success: false,
        message: "No tasks found for this department",
      });
    }

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (err) {
    console.error("Error in getAllTasksOfParticularDepartment:", err);
    return res.status(500).json({
      success: false,
      message: "Error retrieving tasks",
      error: err.message,
    });
  }
};

export const getTaskofParticularDepartmentofOneWeek = async (req, res) => {
  try {
    const { title, weekNumber } = req.query;
    console.log(title,weekNumber);
    if (!title || !weekNumber)
      return res.status(400).json({
        status: "Error",
        message: "Both title and weekNumber is required",
      });
    const task = await Task.findOne({ departmentName: title });
    console.log(task);
    return res.status(200).json({
      status:"Success",
      weektask: task.weeklyPlans[Number(weekNumber-1)]
    });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ status: "Error", err: err.message });
  }
};
