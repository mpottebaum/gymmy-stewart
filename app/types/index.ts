import { z } from "zod";

export const workoutSchema = z.object({
  id: z.number(),
  utc_date: z.string(),
  title: z.string(),
  notes: z.string(),
});

export type Workout = typeof workoutSchema;
