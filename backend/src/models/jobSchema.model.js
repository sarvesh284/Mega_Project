import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployerProfile",
      required: true,
      index: true,
    },

    title: {
      mr: {
        type: String,
        trim: true,
      },
      hi: {
        type: String,
        trim: true,
      },
      en: {
        type: String,
        trim: true,
      },
    },

    skillIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    payType: {
      type: String,
      enum: ["daily", "monthly", "fixed"],
      required: true,
    },

    payAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    requiredWorkers: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["open", "assigned", "completed", "cancelled"],
      default: "open",
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCategory",
      required: true,
      index: true,
    },

    description: {
      mr: {
        type: String,
        trim: true,
      },
      hi: {
        type: String,
        trim: true,
      },
      en: {
        type: String,
        trim: true,
      },
    },

    experienceRequired: {
      type: Number,
      min: 0,
      default: 0,
    },

    preferredLanguages: [
      {
        type: String,
        trim: true,
      },
    ],

    applicationDeadline: {
      type: Date,
    },

    workingHours: {
      type: String,
      trim: true,
    },

    shiftType: {
      type: String,
      enum: ["day", "night", "flexible"],
      default: "flexible",
    },
  },

  {
    timestamps: true,
  }
);

// GeoJSON 2dsphere index
jobSchema.index({
  location: "2dsphere",
});

// Compound index: status + createdAt
jobSchema.index({
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Job", jobSchema);