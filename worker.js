import mongoose from "mongoose";
import cron from "node-cron";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Worker connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Reminder Schema
const ReminderSchema = new mongoose.Schema({
    email: String,
    event: String,
    date: Date,
});
const Reminder = mongoose.model("Reminder", ReminderSchema);

// Email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Your Gmail
        pass: process.env.EMAIL_PASS,  // Gmail App Password
    },
});

// Cron job: Check every minute for upcoming reminders
cron.schedule("* * * * *", async () => {
    console.log("Checking for reminders...");

    const now = new Date();
    const nextMinute = new Date(now.getTime() + 60 * 1000); // 1 minute ahead

    // Find reminders that are due within the next minute
    const reminders = await Reminder.find({ date: { $gte: now, $lt: nextMinute } });

    for (const reminder of reminders) {
        // Send email
        await transporter.sendMail({
            from: `"Reminder App" <${process.env.EMAIL_USER}>`,
            to: reminder.email,
            subject: `Reminder: ${reminder.event}`,
            text: `This is a reminder for your event: "${reminder.event}" scheduled for ${reminder.date}`,
        });

        console.log(`Reminder sent to ${reminder.email} for event: ${reminder.event}`);

        // Optional: Delete reminder after sending
        await Reminder.findByIdAndDelete(reminder._id);
    }
});

console.log("Worker is running...");
