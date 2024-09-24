import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true }, // Changed to String to accommodate different phone number formats
    password: { type: String, required: true }, // Added field for password
    currentRole: { type: String }, // Added to reflect the current role of the mentor
    expertise: [{ type: String, required: true }], // Expertise fields can still be a list of strings
    experienceYears: { type: Number, required: true },
    availability: { type: String, required: true }, // e.g., "Next Available: Tomorrow" or "Weekdays 6-8 PM"
    hourlyRate: { type: Number, required: true }, // Rate per hour in INR
    targetDomain: { type: String, required: true }, // Added to reflect the target domain
    additionalInfo: { type: String }, // Added for extra details like placement journey support
    ratings: {
        average: { type: Number, default: 0 },
        reviews: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reviews from registered users
            rating: { type: Number, required: true },
            comment: { type: String }
        }]
    },
    mentees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Linking mentees who are regular users
    }],
    sessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session' // Separate schema for mentoring sessions
    }],
    profilePhoto: { type: String } // Added field for profile photo URL
}, { timestamps: true });

export const Mentor = mongoose.model('Mentor', mentorSchema);
