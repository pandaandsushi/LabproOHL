<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { createAuthQuery } from '$lib/user';

	const user = createAuthQuery();

	$: if (browser && !$user.isLoading && !$user.data) {
		goto('/login');
	}
</script>

{#if $user.data}
	<slot />
{/if}
