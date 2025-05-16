import mongoose from "mongoose"
import Task from "../models/task.model.js"
import ApiResponse from "../utils/ApiResponse.js"

const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, isRecurring, recurrence } = req.body;

    const newTask = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo,
      isRecurring,
      recurrence,
      createdBy: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, newTask, "Task created"));
  } catch (err) {
    return res.status(500).json(new ApiResponse(500, null, err.message));
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid task ID"));
    }

    const updateData = req.body;

    const { status } = req.body;

    if (status && !["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid status value"));
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json(new ApiResponse(404, null, "Task not found"));
    }

    Object.assign(task, updateData);
    await task.save();

    return res.status(200).json(new ApiResponse(200, task, "Task updated"));
  } catch (err) {
    return res.status(500).json(new ApiResponse(500, null, err.message));
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid task ID"));
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json(new ApiResponse(404, null, "Task not found"));
    }


    if (req.user.role == "admin") {
      return res.status(401).json(new ApiResponse(401, null, "Unauthorized access"));
    }

    await task.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"));
  } catch (err) {
    return res.status(500).json(new ApiResponse(500, null, err.message));
  }
};

const getTasksOfUser = async (req, res) => {
  const userId = req.params.userId

  const createdTasks = await Task.find({ createdBy: userId })
    .populate("assignedTo")
    .sort({ dueDate: 1 });

  const assignedTasks = await Task.find({ assignedTo: userId })
    .populate("createdBy")
    .sort({ dueDate: 1 });

  return res.status(200).json(
    new ApiResponse(200, {
      createdTasks,
      assignedTasks,
    }, "Fetched user's tasks")
  );
};

const getTaskStats = async (req, res) => {
  const userId = req.user._id;

  try {
    const createdTasks = await Task.find({ createdBy: userId });
    const assignedTasks = await Task.find({ assignedTo: userId });

    const allTasks = [...createdTasks, ...assignedTasks];

    const now = new Date();

    const stats = {
      totalCreated: createdTasks.length,
      totalAssigned: assignedTasks.length,
      statusCount: {
        pending: 0,
        inProgress: 0,
        completed: 0,
      },
      overdueCount: 0
    };

    for (const task of allTasks) {
      if (task.status === "pending") stats.statusCount.pending++;
      if (task.status === "in-progress") stats.statusCount.inProgress++;
      if (task.status === "completed") stats.statusCount.completed++;

      if (task.dueDate && new Date(task.dueDate) < now && task.status !== "completed") {
        stats.overdueCount++;
      }
    }

    return res.status(200).json(new ApiResponse(200, stats, "Task stats fetched"));
  } catch (err) {
    return res.status(500).json(new ApiResponse(500, null, "Error fetching task stats"));
  }
};



export { createTask, updateTask, deleteTask, getTasksOfUser, getTaskStats }