import { Schema, model } from "mongoose"

const taskSchema = new Schema({
    title: String,
    description: String,
    dueDate: Date,
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending"
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    isRecurring: { type: Boolean, default: false },
    recurrence: {
        type: String,
        enum: ["daily", "weekly", "monthly"]
    },
}, { timestamps: true });

const Task = model("Task", taskSchema)
export default Task