const express = require("express");
const cors = require("cors");
const path = require("path");
const Joi = require("joi");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let workouts = [
  {
    id: 1,
    title: "Morning Mobility",
    category: "Recovery",
    duration: "15 min",
    level: "Beginner",
    calories: "120 kcal",
    image: "/images/mobility.jpg",
    shortDescription: "A low-impact session designed to improve flexibility and movement quality.",
    description:
      "Morning Mobility helps you loosen tight muscles, improve joint range of motion, and prepare your body for the day. It is perfect for recovery days, warmups, and building long-term movement quality."
  },
  {
    id: 2,
    title: "Leg Liquifier",
    category: "Strength",
    duration: "30 min",
    level: "Intermediate",
    calories: "280 kcal",
    image: "/images/legliquifier.jpg",
    shortDescription: "A lower-body training session focused on endurance, power, and control.",
    description:
      "Leg Liquifier targets quads, hamstrings, glutes, and calves with a mix of controlled strength work and high-rep burnouts. It is ideal for building strong, athletic legs."
  },
  {
    id: 3,
    title: "HIIT Cardio Blast",
    category: "Cardio",
    duration: "20 min",
    level: "Advanced",
    calories: "320 kcal",
    image: "/images/hiitblast.jpg",
    shortDescription: "A fast-paced conditioning workout to push endurance and burn calories.",
    description:
      "HIIT Cardio Blast alternates short bursts of high effort with quick recovery periods. This workout helps improve stamina, cardiovascular fitness, and calorie burn in less time."
  },
  {
    id: 4,
    title: "Upper Body Builder",
    category: "Strength",
    duration: "35 min",
    level: "Intermediate",
    calories: "260 kcal",
    image: "/images/upperbody.jpg",
    shortDescription: "A focused upper-body session for chest, shoulders, back, and arms.",
    description:
      "Upper Body Builder combines pushing and pulling exercises to help develop balanced strength. It is designed to improve posture, stability, and upper-body definition."
  },
  {
    id: 5,
    title: "Core Control",
    category: "Core",
    duration: "18 min",
    level: "Beginner",
    calories: "150 kcal",
    image: "/images/corecontrol.jpg",
    shortDescription: "A core workout centered on stability, control, and posture.",
    description:
      "Core Control strengthens the abdominals, obliques, and lower back using controlled exercises that improve support, balance, and total-body performance."
  },
  {
    id: 6,
    title: "Recovery Flow",
    category: "Recovery",
    duration: "25 min",
    level: "Beginner",
    calories: "100 kcal",
    image: "/images/recoveryflow.jpg",
    shortDescription: "A guided recovery workout focused on stretching and restoring movement.",
    description:
      "Recovery Flow helps reduce soreness, improve flexibility, and reset the body after hard training. It is a great option for active rest days and post-workout cooldowns."
  }
];

const workoutSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  category: Joi.string().min(3).max(50).required(),
  duration: Joi.string().min(3).max(30).required(),
  level: Joi.string().valid("Beginner", "Intermediate", "Advanced").required(),
  calories: Joi.string().pattern(/^\d+\s?kcal$/).required(),
  image: Joi.string().min(5).required(),
  shortDescription: Joi.string().min(10).max(180).required(),
  description: Joi.string().min(20).max(600).required()
});

app.get("/api/workouts", (req, res) => {
  res.json(workouts);
});

app.get("/api/workouts/:id", (req, res) => {
  const workoutId = parseInt(req.params.id);
  const workout = workouts.find((item) => item.id === workoutId);

  if (!workout) {
    return res.status(404).json({ error: "Workout not found" });
  }

  res.json(workout);
});

app.post("/api/workouts", (req, res) => {
  const { error } = workoutSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((detail) => detail.message)
    });
  }

  const newWorkout = {
    id: workouts.length ? workouts[workouts.length - 1].id + 1 : 1,
    title: req.body.title.trim(),
    category: req.body.category.trim(),
    duration: req.body.duration.trim(),
    level: req.body.level.trim(),
    calories: req.body.calories.trim(),
    image: req.body.image.trim(),
    shortDescription: req.body.shortDescription.trim(),
    description: req.body.description.trim()
  };

  workouts.push(newWorkout);

  res.status(201).json({
    success: true,
    message: "Workout added successfully",
    workout: newWorkout
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});