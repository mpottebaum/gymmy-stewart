import { z } from "zod";

export const workoutSchema = z.object({
  id: z.number(),
  epoch_date: z.number(),
  title: z.string(),
  notes: z.string(),
});

export type Workout = z.infer<typeof workoutSchema>;
