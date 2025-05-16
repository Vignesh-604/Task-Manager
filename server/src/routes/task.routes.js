import { createTask, updateTask, deleteTask, getTasksOfUser, getTaskStats } from "../controllers/task.controller.js"
import { Router } from "express"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/", verifyJWT, createTask)

router.put("/:taskId", verifyJWT, updateTask)

router.delete("/:taskId", verifyJWT, deleteTask)

router.get("/user/:userId", verifyJWT, getTasksOfUser)

router.get("/stats", verifyJWT, getTaskStats);

export default router