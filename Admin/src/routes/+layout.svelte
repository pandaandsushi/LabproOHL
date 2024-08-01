<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { themeChange } from 'theme-change';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import Navbar from '../components/navbar.svelte';

	if (browser && !localStorage.getItem('api') && location.pathname !== '/') {
		goto('/');
	}

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});
</script>

<QueryClientProvider client={queryClient}>
	<div class="min-h-screen flex flex-col items-stretch">
		<Navbar />
		<div class="max-w-screen-lg mx-auto w-full flex-1 p-4 flex">
			<slot />
		</div>
	</div>
</QueryClientProvider>
