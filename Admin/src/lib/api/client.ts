import axios, { type AxiosInstance } from 'axios';
import { z } from 'zod';

let _client: AxiosInstance;

export function initializeClient(endpoint: string) {
	_client = axios.create({
		baseURL: endpoint,
		validateStatus(status) {
			return status < 500;
		}
	});

	_client.interceptors.request.use((config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
		}
		config.headers['Accept'] = 'application/json';

		if (!config.headers['Content-Type']) {
			config.headers['Content-Type'] = 'application/json';
		}
		return config;
	});
}

export function client() {
	if (!_client) {
		const endpoint = localStorage.getItem('api');
		if (!endpoint) {
			throw new Error('Call initializeClient before calling client');
		}
		initializeClient(endpoint);
	}
	return _client;
}

export function makeSchema<T extends z.Schema>(schema: T) {
	return z.discriminatedUnion('status', [
		z.object({
			status: z.literal('success'),
			message: z.string().optional(),
			data: schema
		}),
		z.object({
			status: z.literal('error'),
			message: z.string().optional(),
			data: z.null().optional()
		})
	]);
}
