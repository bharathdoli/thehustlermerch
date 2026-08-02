
import { z } from "zod";

export const RegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name should contain atleast 3 characters")
    .max(50),

  email: z
    .email()
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password should contain atleast 8 characters")
    .max(100),

  phoneNo: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;