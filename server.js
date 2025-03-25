import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Reminder Schema
const ReminderSchema = new mongoose.Schema({
    email: String,
    event: String,
    date: Date,
});
const Reminder = mongoose.model("Reminder", ReminderSchema);

// API Routes
app.post("/add-reminder", async (req, res) => {
    try {
        const { email, event, date } = req.body;
        const newReminder = new Reminder({ email, event, date });
        await newReminder.save();
        res.status(201).json({ message: "Reminder added successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to add reminder" });
    }
});

app.get("/reminders", async (req, res) => {
    try {
        const reminders = await Reminder.find(); // Fetch all reminders
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reminders" });
    }
});

app.delete("/delete-reminder/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReminder = await Reminder.findByIdAndDelete(id);
        if (!deletedReminder) {
            return res.status(404).json({ error: "Reminder not found" });
        }
        res.json({ message: "Reminder deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete reminder" });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
