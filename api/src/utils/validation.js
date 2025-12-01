const { z } = require("zod");

const userSchema = z.object({
  firstName: z.string().min(1, "Name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["Admin", "Visitor", "Moderator", "Editor"]),
  phoneNumber: z.string().optional(),
  address: z
    .object({
      country: z.string().optional(),
      state: z.string().optional(),
      streetName: z.string().optional(),
      streetNumber: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
});

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  publishedAt: z.string().or(z.date()).optional(), // Can come as string from JSON/Frontend
  status: z.enum(["Draft", "Published"]),
  user: z.string().min(1, "User ID is required"), // Expecting ObjectId as string
});

const formatZodError = (error) => {
  return error.errors
    .map((err) => {
      const path = err.path.join(".");
      return `${path}: ${err.message}`;
    })
    .join(", ");
};

module.exports = { userSchema, postSchema, formatZodError };
