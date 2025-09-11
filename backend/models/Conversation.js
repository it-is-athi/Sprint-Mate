const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  context: { type: Object, default: {} },
  state: { type: String, enum: ["idle", "awaiting_details", "generating", "awaiting_reschedule_choice"], default: "idle" },
  missingFields: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Conversation", ConversationSchema);
