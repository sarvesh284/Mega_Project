import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerProfile",
      required: true,
    },

    headline: {
      type: String,
      trim: true,
    },

    summary: {
      type: String,
      trim: true,
    },

    experience: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],

    education: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],

    preferredJobTypes: [
      {
        type: String,
        trim: true,
      },
    ],

    resumeUrl: {
      type: String,
      trim: true,
    },

    sourceVoiceProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VoiceProfile",
      default: null,
    },

    aiGenerated: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    template: {
      type: String,
      trim: true,
    },

    certifications: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],

    projects: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],

    generatedAt: {
      type: Date,
      default: null,
    },

    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate versions for the same worker
resumeSchema.index(
  { workerId: 1, version: 1 },
  { unique: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;