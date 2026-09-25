import Job from "../models/job.model.js";
import EmployerProfile from "../models/employerProfile.model.js";
import WorkerProfile from "../models/workerProfile.model.js";
import WorkerSkill from "../models/workerSkill.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { translateTextToAllLanguages } from "../services/translation.service.js";
import { getPaginationParams, formatPaginatedResult } from "../utils/pagination.js";
import { pickLanguage } from "../utils/languagePicker.js";
import { calculateMatchScore } from "../services/matching.service.js";

export const createJob = asyncHandler(async (req, res) => {
  const employerProfile = await EmployerProfile.findOne({ userId: req.user._id });
  if (!employerProfile) throw new ApiError(404, "Employer profile not found");

  const { title, description, originalLanguage = "en", coordinates, ...jobData } = req.body;

  // Auto-translate title and description into all 3 languages if single string or partial object provided
  let translatedTitle = title;
  if (typeof title === "string" || (title && (title.mr || title.hi || title.en))) {
    const rawText = typeof title === "string" ? title : title[originalLanguage] || title.en || title.mr || title.hi;
    translatedTitle = await translateTextToAllLanguages(rawText, originalLanguage);
  }

  let translatedDescription = description;
  if (typeof description === "string" || (description && (description.mr || description.hi || description.en))) {
    const rawDesc = typeof description === "string" ? description : description[originalLanguage] || description.en || description.mr || description.hi;
    translatedDescription = await translateTextToAllLanguages(rawDesc, originalLanguage);
  }

  const job = await Job.create({
    ...jobData,
    employerId: employerProfile._id,
    title: translatedTitle,
    description: translatedDescription,
    originalLanguage,
    location: {
      type: "Point",
      coordinates,
    },
    status: "open",
  });

  return res.status(201).json(new ApiResponse(201, job, "Job created successfully with auto-translations"));
});

export const updateJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const employerProfile = await EmployerProfile.findOne({ userId: req.user._id });
  if (!employerProfile) throw new ApiError(404, "Employer profile not found");

  const job = await Job.findOne({ _id: jobId, employerId: employerProfile._id });
  if (!job) throw new ApiError(404, "Job not found or unauthorized");

  const allowedUpdates = [
    "title",
    "description",
    "categoryId",
    "skillIds",
    "requiredWorkers",
    "startDate",
    "endDate",
    "startTime",
    "endTime",
    "payType",
    "payAmount",
    "genderPreference",
    "city",
    "village",
    "address",
    "originalLanguage",
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });

  if (req.body.coordinates && Array.isArray(req.body.coordinates) && req.body.coordinates.length === 2) {
    job.location = {
      type: "Point",
      coordinates: req.body.coordinates,
    };
  }

  await job.save();

  return res.status(200).json(new ApiResponse(200, job, "Job updated successfully"));
});

export const cancelJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const employerProfile = await EmployerProfile.findOne({ userId: req.user._id });

  const job = await Job.findOneAndUpdate(
    { _id: jobId, employerId: employerProfile._id },
    { status: "cancelled" },
    { new: true }
  );

  if (!job) throw new ApiError(404, "Job not found");

  return res.status(200).json(new ApiResponse(200, job, "Job cancelled successfully"));
});

export const closeJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const employerProfile = await EmployerProfile.findOne({ userId: req.user._id });

  const job = await Job.findOneAndUpdate(
    { _id: jobId, employerId: employerProfile._id },
    { status: "completed" },
    { new: true }
  );

  if (!job) throw new ApiError(404, "Job not found");

  return res.status(200).json(new ApiResponse(200, job, "Job completed and closed"));
});

export const getEmployerJobs = asyncHandler(async (req, res) => {
  const employerProfile = await EmployerProfile.findOne({ userId: req.user._id });
  if (!employerProfile) throw new ApiError(404, "Employer profile not found");

  const jobs = await Job.find({ employerId: employerProfile._id }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, jobs, "Employer jobs retrieved"));
});

export const searchAndFilterJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { categoryId, payType, minPay, search, status = "open" } = req.query;
  const lang = req.lang || "en";

  const queryFilter = { status };
  if (categoryId) queryFilter.categoryId = categoryId;
  if (payType) queryFilter.payType = payType;
  if (minPay) queryFilter.payAmount = { $gte: Number(minPay) };

  const [rawJobs, totalDocs] = await Promise.all([
    Job.find(queryFilter)
      .populate("categoryId skillIds employerId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Job.countDocuments(queryFilter),
  ]);

  const localizedJobs = rawJobs.map((j) => ({
    ...j.toObject(),
    titleText: pickLanguage(j.title, lang, j.originalLanguage),
    descriptionText: pickLanguage(j.description, lang, j.originalLanguage),
  }));

  const result = formatPaginatedResult({ docs: localizedJobs, totalDocs, page, limit });
  return res.status(200).json(new ApiResponse(200, result, "Jobs search results"));
});

export const getNearbyJobs = asyncHandler(async (req, res) => {
  const { longitude, latitude, radiusKm = 20 } = req.query;
  const lng = Number(longitude);
  const lat = Number(latitude);
  const radiusInMeters = Number(radiusKm) * 1000;

  if (isNaN(lng) || isNaN(lat)) {
    throw new ApiError(400, "Valid longitude and latitude are required");
  }

  const nearbyJobs = await Job.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        distanceField: "distanceMeters",
        maxDistance: radiusInMeters,
        query: { status: "open" },
        spherical: true,
      },
    },
    { $limit: 50 },
  ]);

  return res.status(200).json(new ApiResponse(200, nearbyJobs, "Nearby jobs retrieved"));
});

export const getRecommendedJobs = asyncHandler(async (req, res) => {
  const workerProfile = await WorkerProfile.findOne({ userId: req.user._id });
  if (!workerProfile) throw new ApiError(404, "Worker profile not found");

  const workerSkills = await WorkerSkill.find({ workerId: workerProfile._id });

  const openJobs = await Job.find({ status: "open" })
    .populate("categoryId skillIds employerId")
    .limit(50);

  const scoredJobs = openJobs.map((job) => {
    const { score, factors } = calculateMatchScore(job, workerProfile, workerSkills);
    return {
      job,
      matchScore: score,
      matchFactors: factors,
    };
  });

  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

  return res.status(200).json(new ApiResponse(200, scoredJobs, "Recommended jobs retrieved"));
});
