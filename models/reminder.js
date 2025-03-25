import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
    email: String,
    event: String,
    date: Date,
});

export default mongoose.model("Reminder", ReminderSchema);
