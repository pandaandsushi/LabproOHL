import { createQuery, QueryClient } from '@tanstack/svelte-query';
import { getSelf } from './api/auth';

export function createAuthQuery() {
	return createQuery({
		queryKey: ['auth'],
		queryFn: async () => {
			return getSelf().then((data) => (data?.status === 'success' ? data : null));
		}
	});
}

export function invalidateAuthQuery(queryClient: QueryClient) {
	queryClient.invalidateQueries({ queryKey: ['auth'] });
}
