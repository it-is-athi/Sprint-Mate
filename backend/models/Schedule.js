const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  schedule_title: { type: String, required: true },
  starting_date: { type: Date, required: true },
  end_date: { type: Date },
  status: { type: String, enum: ["active", "completed", "archived"], default: "active" },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String }, // Subject or plan description
  repeat_pattern: { type: String, enum: ["once","daily", "weekly", "monthly"], default: "daily" }, // Only in schedule
}, { timestamps: true });

module.exports = mongoose.model("Schedule", ScheduleSchema);