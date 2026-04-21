require("dotenv").config();
const mongoose = require("mongoose");
const Workout = require("./models/Workout");

const workouts = [
  {
    title: "Power Endurance",
    category: "Strength",
    duration: "25 min",
    level: "Intermediate",
    calories: "220 kcal",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    shortDescription: "A balanced strength session focused on stamina and control.",
    description:
      "This workout blends bodyweight movements and resistance exercises to improve endurance, muscular control, and full-body strength over a focused 25-minute session."
  },
  {
    title: "HIIT Burn Circuit",
    category: "Cardio",
    duration: "20 min",
    level: "Advanced",
    calories: "300 kcal",
    image: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2",
    shortDescription: "A fast-paced cardio circuit built to raise your heart rate.",
    description:
      "This high-intensity interval training workout is designed to push your cardiovascular endurance with explosive rounds, short recovery periods, and total-body conditioning."
  },
  {
    title: "Core Control Flow",
    category: "Recovery",
    duration: "15 min",
    level: "Beginner",
    calories: "120 kcal",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a",
    shortDescription: "A lighter session focused on core stability and mobility.",
    description:
      "This beginner-friendly recovery workout improves posture, core strength, and flexibility through controlled movement patterns and low-impact exercises."
  }
];

async function seedWorkouts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Workout.deleteMany({});
    console.log("Old workouts removed");

    await Workout.insertMany(workouts);
    console.log("Starter workouts added");

    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    mongoose.connection.close();
  }
}

seedWorkouts();