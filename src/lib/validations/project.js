// src/lib/validations/project.js
import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Project title is required.").max(100, "Project title must not exceed 100 characters."),
  description: z.string().min(1, "Project description is required.").max(2000, "Project description must not exceed 2000 characters."),
  image_url: z.string().url("Must be a valid URL.").optional().or(z.literal('')), // Optional URL, or empty string
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    errorMap: () => ({ message: "Please select a difficulty level." })
  }),
  category: z.enum(["Web Development", "Mobile App", "Data Science", "Machine Learning", "Game Development", "DevOps", "Cybersecurity", "UI/UX Design", "Other"], {
    errorMap: () => ({ message: "Please select a project category." })
  }),
  technologies: z.array(z.string().min(1, "Technology cannot be empty")).min(1, "At least one technology is required.").max(20, "Maximum 20 technologies allowed."),
  tags: z.array(z.string().min(1, "Tag cannot be empty")).max(10, "Maximum 10 tags allowed.").optional(),
  completion_date: z.string().optional().or(z.literal('')), // Will be ISO string or empty
  time_spent_hours: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)), // Convert empty string to undefined, then to number
    z.number().min(0, "Time spent cannot be negative.").optional()
  ),
  time_spent_unit: z.enum(["hours", "days", "weeks"]).optional(), // Unit for time_spent
  github_url: z.string().url("Must be a valid GitHub URL.").regex(/^https?:\/\/(www\.)?github\.com\/.+/, "Must be a GitHub URL.").optional().or(z.literal('')),
  live_url: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  key_learnings: z.string().max(2000, "Key learnings must not exceed 2000 characters.").optional().or(z.literal('')),
  challenges_faced: z.string().max(2000, "Challenges faced must not exceed 2000 characters.").optional().or(z.literal('')),
  is_public: z.boolean().default(false),
  // AI fields - these are read-only in the form, updated via AI service
  ai_summary: z.string().optional(),
  ai_work_log: z.string().optional(),
  // Internal fields (not part of form directly, but part of project object)
  user_id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// For partial updates where not all fields are required
export const projectUpdateSchema = projectSchema.partial();
