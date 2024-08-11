import { z } from 'zod';

export const SimpleUserSchema = z.object({
	username: z.string(),
	name: z.string()
});

export const UserSchema = z.object({
	id: z.number(),
	username: z.string(),
	email: z.string().email(),
	balance: z.number()
});

export const SimpleFilmSchema = z.object({
	id: z.string(),
	title: z.string(),
	release_year: z.number(),
	director: z.string(),
	genre: z.array(z.string()),
	price: z.number(),
	duration: z.number(),
	cover_image_url: z.string().nullable().optional(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime()
});

export const FilmSchema = SimpleFilmSchema.extend({
	description: z.string(),
	video_url: z.string()
});

export type User = z.infer<typeof UserSchema>;
export type SimpleFilm = z.infer<typeof SimpleFilmSchema>;
export type Film = z.infer<typeof FilmSchema>;
