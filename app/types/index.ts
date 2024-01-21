import { z } from "zod";

export const sessionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
});

export type Session = z.infer<typeof sessionSchema>;

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password_hash: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const workoutSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  epoch_date: z.number(),
  title: z.string(),
  notes: z.string(),
});

export type Workout = z.infer<typeof workoutSchema>;
