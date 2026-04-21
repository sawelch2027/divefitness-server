const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    duration: { type: String, required: true },
    level: { type: String, required: true },
    calories: { type: String, required: true },
    image: { type: String, default: "" },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);