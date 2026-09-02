import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: [true,"Password is must"],
    },

    role: {
      type: String,
      enum: ["worker", "employer", "admin"],
      required: true,
    },

    preferredLanguage: {
      type: String,
      enum: ["mr", "hi", "en"],
      default: "en",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    fraudScore: {
      type: Number,
      default: null,
    },

    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;