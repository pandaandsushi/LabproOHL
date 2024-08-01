import { AxiosError } from 'axios';
import { z } from 'zod';
import { client, makeSchema } from './client';

const LoginResponseSchema = makeSchema(
	z.object({
		username: z.string(),
		token: z.string()
	})
);

export async function login(body: { username: string; password: string }) {
	const data = await client()
		.post('/login', body)
		.then((res) => res.data);

	return LoginResponseSchema.parse(data);
}

export async function getSelf() {
	try {
		const data = await client()
			.get('/self')
			.then((res) => res.data);

		return LoginResponseSchema.parse(data);
	} catch (e) {
		if (e instanceof AxiosError) {
			return null;
		}
	}
}
