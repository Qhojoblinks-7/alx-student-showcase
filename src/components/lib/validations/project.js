// src/lib/validations/project.js
import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  status: z.enum(["Planning", "In Progress", "Completed", "On Hold", "Cancelled"]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  is_public: z.boolean().default(false),
  // Optional fields for editing, if we want to allow them to be empty
  // For creation, these might be required or default to something
  // created_at: z.string().optional(),
  // updated_at: z.string().optional(),
  // user_id: z.string().optional(), // Will be set by Supabase auth
});

export const projectUpdateSchema = projectSchema.partial(); // For partial updates