const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Joi = require("joi");
const multer = require("multer");
require("dotenv").config();
const mongoose = require("mongoose");

const Workout = require("./models/Workout");

const app = express();
const PORT = process.env.PORT || 3001;

// Make sure uploads folder exists
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsPath));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Joi validation
const workoutSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  category: Joi.string().min(3).max(50).required(),
  duration: Joi.string().min(3).max(30).required(),
  level: Joi.string().valid("Beginner", "Intermediate", "Advanced").required(),
  calories: Joi.string().pattern(/^\d+\s?kcal$/).required(),
  image: Joi.string().allow("").optional(),
  shortDescription: Joi.string().min(10).max(180).required(),
  description: Joi.string().min(20).max(600).required()
});

// GET all workouts
app.get("/api/workouts", async (req, res) => {
  try {
    const workouts = await Workout.find().sort({ createdAt: -1 });
    res.json(workouts);
  } catch (err) {
    console.error("GET /api/workouts error:", err);
    res.status(500).json({ error: "Failed to fetch workouts" });
  }
});

// GET one workout
app.get("/api/workouts/:id", async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json(workout);
  } catch (err) {
    console.error(`GET /api/workouts/${req.params.id} error:`, err);
    res.status(500).json({ error: "Error fetching workout" });
  }
});

// POST new workout
app.post("/api/workouts", upload.single("image"), async (req, res) => {
  try {
    const { error } = workoutSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((detail) => detail.message)
      });
    }

    let imagePath = "";

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image.trim();
    }

    const newWorkout = new Workout({
      title: req.body.title.trim(),
      category: req.body.category.trim(),
      duration: req.body.duration.trim(),
      level: req.body.level.trim(),
      calories: req.body.calories.trim(),
      shortDescription: req.body.shortDescription.trim(),
      description: req.body.description.trim(),
      image: imagePath
    });

    const savedWorkout = await newWorkout.save();

    res.status(201).json({
      success: true,
      message: "Workout added successfully",
      workout: savedWorkout
    });
  } catch (err) {
    console.error("POST /api/workouts error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update workout
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
    } else if (req.body.image) {
      updatedImage = req.body.image.trim();
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
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Workout updated successfully",
      workout: updatedWorkout
    });
  } catch (err) {
    console.error(`PUT /api/workouts/${req.params.id} error:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE workout
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
    console.error(`DELETE /api/workouts/${req.params.id} error:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});