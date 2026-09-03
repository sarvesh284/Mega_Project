import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "online"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      required: true,
    },

    paidAt: {
      type: Date,
    },

    note: {
      type: String,
      trim: true,
    },

    gatewayTransactionId: {
      type: String,
      trim: true,
    },

    gatewayOrderId: {
      type: String,
      trim: true,
    },

    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: false,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;