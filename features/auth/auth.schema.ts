import { z } from "zod";

export const registerUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be at most 100 characters long"),

  userName: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be at most 30 characters long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .toLowerCase(), // ✅ convert usernames to lowercase to avoid duplicates like 'User' vs 'user'

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be at most 100 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  role: z.enum(["applicant", "employer"], {
    errorMap: () => ({
      message: "Role must be either 'applicant' or 'employer'",
    }),
  }).default("applicant"),
});

export type RegisterUserData = z.infer<typeof registerUserSchema>;

export const registerUserWithConfirmSchema = registerUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterUserWithConfirmData = z.infer<typeof registerUserWithConfirmSchema>;


export const LoginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type LoginUserData = z.infer<typeof LoginUserSchema>;
