import { z } from 'zod';
import { client, makeSchema } from './client';
import { FilmSchema, SimpleFilmSchema } from './schema';
import type { AxiosProgressEvent } from 'axios';

const FilmsResponseSchema = makeSchema(z.array(SimpleFilmSchema));
const FilmResponseSchema = makeSchema(FilmSchema);

export async function getFilms(q?: string) {
    try {
        const searchParams = new URLSearchParams();
        if (q) {
            searchParams.set('q', q);
        }

        const response = await client().get(`/films?${searchParams.toString()}`);
        const data = response.data;

        const parsed = FilmsResponseSchema.parse(data);
        if (parsed.status === 'error') {
			console.log("EROR BANH")
            throw new Error(parsed.message);
        }

        return parsed.data;
    } catch (error) {
        console.error("Failed to fetch or parse films data:", error);
        throw error; 
    }
}

export async function createFilm(
	data: {
		title: string;
		description: string;
		director: string;
		release_year: number;
		genre: string[];
		price: number;
		duration: number;
		cover_image: File;
		video: File;
	},
	onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) {
	await new Promise((resolve) => setTimeout(resolve, 3000));
	const formData = new FormData();
	Object.entries(data).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			value.forEach((v) => formData.append(key, v));
		} else if (value instanceof File) {
			formData.append(key, value);
		} else {
			formData.append(key, value.toString());
		}
	});
	
	return client()
		.post('/films', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			onUploadProgress
		})
		.then((res) => {
			return res.data;
		});
}
export async function updateFilm(
	payload: {
		id: string;
		data: {
			title: string;
			description: string;
			director: string;
			release_year: number;
			genre: string[];
			price: number;
			duration: number;
			cover_image: File | null;
			video: File | null;
		};
	},
	onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) {
	const { id, data } = payload;
	await new Promise((resolve) => setTimeout(resolve, 3000));
	const formData = new FormData();
	Object.entries(data).forEach(([key, value]) => {
		if (value === null) {
			return;
		}
		if (Array.isArray(value)) {
			value.forEach((v) => formData.append(key, v));
		} else if (value instanceof File) {
			formData.append(key, value);
		} else {
			formData.append(key, value.toString());
		}
	});

	return client()
		.put('/films/' + id, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			onUploadProgress
		})
		.then((res) => {
			return res.data;
		});
}

export async function getFilm(id: string) {
	const data = await client()
		.get(`/films/${id}`)
		.then((res) => res.data);

	const parsed = FilmResponseSchema.parse(data);

	if (parsed.status === 'error') {
		throw new Error(parsed.message);
	}
	return parsed.data;
}

export async function deleteFilm(id: string) {
	const data = await client()
		.delete(`/films/${id}`)
		.then((res) => res.data);
	const parsed = FilmsResponseSchema.parse(data);

	if (parsed.status === 'error') {
		throw new Error(parsed.message);
	}

	return parsed.data;
}
