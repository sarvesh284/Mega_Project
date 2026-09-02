import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployerProfile",
      required: true,
    },

    title: {
      mr: {
        type: String,
        required: true,
        trim: true,
      },
      hi: {
        type: String,
        required: true,
        trim: true,
      },
      en: {
        type: String,
        required: true,
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
      default: 1,
      min: 1,
    },

    status: {
      type: String,
      enum: ["open", "assigned", "completed", "cancelled"],
      default: "open",
    },

    startDate: {
      type: Date,
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCategory",
      required: true,
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
      default: 0,
      min: 0,
    },

    preferredLanguages: {
      type: [String],
      enum: ["mr", "hi", "en"],
      default: ["mr"],
    },

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
      default: "day",
    },
  },
  {
    timestamps: true,
  }
);

// Geo-spatial search
jobSchema.index({
  location: "2dsphere",
});

// Faster retrieval of recent jobs by status
jobSchema.index({
  status: 1,
  createdAt: -1,
});

const Job = mongoose.model("Job", jobSchema);

export default Job;