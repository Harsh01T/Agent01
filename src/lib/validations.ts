import { z } from 'zod';

export const ChatRequestSchema = z.object({
  message: z.string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(1000, "Message is too long. Please keep it under 1000 characters."),
  
  sessionId: z.string()
    .uuid("Invalid session ID format.")
    .optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
