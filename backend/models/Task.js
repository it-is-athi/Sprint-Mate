const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Day 1: Variables & Loops"
  topic: { type: String }, // Unique portion/topic for the day
  date: { type: Date, required: true },
  description: { type: String },
  status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  missed: { type: Boolean, default: false },
  schedule_id: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);