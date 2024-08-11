import { z } from 'zod';
import { client, makeSchema } from './client';
import { UserSchema } from './schema';

const UsersResponseSchema = makeSchema(z.array(UserSchema));

export async function getUsers(q?: string) {
	const searchParams = new URLSearchParams();
	if (q) {
		searchParams.set('q', q);
	}

	const data = await client()
		.get(`/users?${searchParams.toString()}`)
		.then((res) => res.data);
	console.log("CEK DATA CONTENTS")
	console.log(data)
	return UsersResponseSchema.parse(data);
}

export async function deleteUser(userId: string) {
	await client()
		.delete(`/users/${userId}`)
		.then((res) => {
			if (res.data.status !== 'success') {
				throw new Error('Failed to delete user');
			}
		});
}

export async function incrementUserBalance({
	userId,
	increment
}: {
	userId: string;
	increment: number;
}) {
	await client()
		.post(`/users/${userId}/balance`, { increment })
		.then((res) => {
			if (res.data.status !== 'success') {
				throw new Error('Failed to increment user balance');
			}
		});
}
