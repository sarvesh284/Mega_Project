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

    resumeLanguages: [
      {
        type: String,
        trim: true,
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
    },

    aiGenerated: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    resumeCreatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    resumeUpdatedAt: {
      type: Date,
      default: Date.now,
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

    contact: {
      type: mongoose.Schema.Types.Mixed,
    },

    generatedAt: {
      type: Date,
    },

    version: {
      type: Number,
      required: true,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: false,
  }
);

// Unique combination of worker and resume version
resumeSchema.index(
  { workerId: 1, version: 1 },
  { unique: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;