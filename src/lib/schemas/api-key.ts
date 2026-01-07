import { z } from "zod";

export const apiKeyRegistrationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  turnstileToken: z.string().min(1, "Please complete the CAPTCHA verification"),
});

export type ApiKeyRegistrationData = z.infer<typeof apiKeyRegistrationSchema>;
