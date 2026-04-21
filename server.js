const express = require("express");
const cors = require("cors");
const path = require("path");
const Joi = require("joi");
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config();

const Workout = require("./models/Workout");

const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

const workoutSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  category: Joi.string().min(3).max(50).required(),
  duration: Joi.string().min(3).max(30).required(),
  level: Joi.string().valid("Beginner", "Intermediate", "Advanced").required(),
  calories: Joi.string().pattern(/^\d+\s?kcal$/).required(),
  image: Joi.string().optional(),
  shortDescription: Joi.string().min(10).max(180).required(),
  description: Joi.string().min(20).max(600).required()
});

app.get("/api/workouts", async (req, res) => {
  try {
    const workouts = await Workout.find().sort({ createdAt: -1 });
    res.json(workouts);
  } catch (err) {
    console.error("GET /api/workouts error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/workouts/:id", async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: "Error fetching workout" });
  }
});

app.post("/api/workouts", upload.single("image"), async (req, res) => {
  try {
    const { error } = workoutSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((detail) => detail.message)
      });
    }

    const newWorkout = new Workout({
      title: req.body.title.trim(),
      category: req.body.category.trim(),
      duration: req.body.duration.trim(),
      level: req.body.level.trim(),
      calories: req.body.calories.trim(),
      shortDescription: req.body.shortDescription.trim(),
      description: req.body.description.trim(),
      image: req.file ? `/uploads/${req.file.filename}` : ""
    });

    const saved = await newWorkout.save();

    res.status(201).json({
      success: true,
      message: "Workout added successfully",
      workout: saved
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/workouts/:id", upload.single("image"), async (req, res) => {
  try {
    const { error } = workoutSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((detail) => detail.message)
      });
    }

    const existingWorkout = await Workout.findById(req.params.id);

    if (!existingWorkout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    let updatedImage = existingWorkout.image;

    if (req.file) {
      updatedImage = `/uploads/${req.file.filename}`;
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title.trim(),
        category: req.body.category.trim(),
        duration: req.body.duration.trim(),
        level: req.body.level.trim(),
        calories: req.body.calories.trim(),
        shortDescription: req.body.shortDescription.trim(),
        description: req.body.description.trim(),
        image: updatedImage
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Workout updated successfully",
      workout: updatedWorkout
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/workouts/:id", async (req, res) => {
  try {
    const deletedWorkout = await Workout.findByIdAndDelete(req.params.id);

    if (!deletedWorkout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json({
      success: true,
      message: "Workout deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});