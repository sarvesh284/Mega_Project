import mongoose from "mongoose";

const workHistorySchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerProfile",
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployerProfile",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    agreedPay: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["completed", "cancelled"],
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },
  }
);

const WorkHistory = mongoose.model("WorkHistory", workHistorySchema);

export default WorkHistory;