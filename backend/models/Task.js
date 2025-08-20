const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  starting_time: {
    type: String, // "HH:MM" format
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  repeat_pattern: {
    type: String,
    enum: ["none", "daily", "weekly", "monthly"],
    default: "none",
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  missed: {
    type: Boolean,
    default: false,
  },
  schedule_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Schedule",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);
