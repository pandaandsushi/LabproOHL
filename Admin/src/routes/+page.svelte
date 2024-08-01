<script lang="ts">
	import { goto } from '$app/navigation';
	import { initializeClient } from '$lib/api/client';
	import { onMount } from 'svelte';

	let url: string;

	onMount(() => {
		url = localStorage.getItem('api') ?? '';
	});
</script>

<div class="flex flex-1 items-center justify-center">
	<div class="card shadow-xl bg-primary-content w-96 max-w-full">
		<div class="card-body">
			<h1 class="card-title">Set API endpoint</h1>
			<form
				on:submit|preventDefault={() => {
					try {
						localStorage.setItem('api', url);
						initializeClient(url);
						goto('/login');
					} catch (e) {
						console.error(e);
					}
				}}
			>
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Endpoint</span>
					</div>
					<input
						bind:value={url}
						type="url"
						placeholder="http://localhost:5000"
						class="input input-bordered w-full placeholder:text-neutral-400 dark:placeholder:text-neutral-700"
					/>
				</label>
				<div class="label">
					<span class="label-text-alt"
						>You can use <span class="font-bold select-text">https://demo-labpro.hmif.dev</span> for
						demo</span
					>
				</div>
				<div class="card-actions mt-4">
					<button class="btn btn-primary w-full">Save</button>
				</div>
			</form>
		</div>
	</div>
</div>
