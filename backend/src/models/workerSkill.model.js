import mongoose from "mongoose";

const workerSkillSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerProfile",
      required: true,
    },

    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    proficiency: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      required: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

// A worker cannot have the same skill twice
workerSkillSchema.index(
  { workerId: 1, skillId: 1 },
  { unique: true }
);

const WorkerSkill = mongoose.model(
  "WorkerSkill",
  workerSkillSchema
);

export default WorkerSkill;