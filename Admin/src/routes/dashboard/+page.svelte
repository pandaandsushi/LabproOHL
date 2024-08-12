<script lang="ts">
	import { deleteUser, getUsers, incrementUserBalance } from '$lib/api/user';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import Icon from '@iconify/svelte';
	import clsx from 'clsx';
	import type { User } from '$lib/api/schema';
	import type { EventHandler } from 'svelte/elements';
	let q = '';

	let toInc: string | null = null;

	let deleteDialog: HTMLDialogElement;
	let toDelete: User | null = null;
	let inc = 0;
	let timeout: number | null = null;
	console.log("TES")
	$: users = createQuery({
		queryKey: ['users', q],
		queryFn: async () => getUsers(q).then((res) => (res.status === 'success' ? res.data : []))
	});

	$: if (toInc) {
		const input = document.getElementById(`inc-${toInc}`) as HTMLInputElement;
		if (input) {
			input.focus();
		}
	}

	const queryClient = useQueryClient();

	function invalidate() {
		queryClient.invalidateQueries({ queryKey: ['users'] });
	}

	$: deleteMutation = createMutation({
		mutationFn: deleteUser,
		onMutate(id) {
			const prev = $users.data;
			queryClient.setQueryData(['users', q], (old: User[] | undefined) => {
				if (!old) return undefined;
				return old.filter((u) => u.id.toString() !== id);
			});
			return prev;
		},
		onSuccess: invalidate,
		onError: invalidate
	});

	const incrementMutation = createMutation({
		mutationFn: incrementUserBalance,
		onMutate: (data) => {
			const prev = $users.data;
			queryClient.setQueryData(['users', q], (old: User[] | undefined) => {
				if (!old) return undefined;
				return old.map((u) => {
					if (u.id.toString() === data.userId) {
						return { ...u, balance: u.balance + data.increment };
					}
					return u;
				});
			});
			return prev;
		},
		onSuccess: () => {
			$users.refetch();
		},
		onError: (err) => {
			console.error(err);
			$users.refetch();
		}
	});

	const onSearchSubmit: EventHandler<SubmitEvent, HTMLFormElement> = (e) => {
		const input = e.currentTarget.querySelector('input');
		if (input) {
			q = input.value;
		}
	};
</script>

<div class="flex-1">
	<h1 class="text-xl font-bold my-4 px-4">Users Management</h1>
	<form on:submit|preventDefault={onSearchSubmit}>
		<label class="input input-bordered flex items-center gap-2 input-sm">
			<input
				type="text"
				class="grow"
				placeholder="Search"
				on:input={(e) => {
					if (timeout) {
						clearTimeout(timeout);
					}
					const value = e.currentTarget.value;

					timeout = setTimeout(() => {
						q = value;
						$users.refetch();
					}, 500);
				}}
			/>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-4 w-4 opacity-70"
			>
				<path
					fill-rule="evenodd"
					d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
					clip-rule="evenodd"
				/>
			</svg>
		</label>
	</form>
	<dialog bind:this={deleteDialog} class="modal">
		<div class="modal-box">
			<form method="dialog">
				<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
			</form>
			<h3 class="text-lg font-bold">Delete User</h3>
			<p class="py-4">
				Are you sure you want to delete user <span class="font-bold italic"
					>`{toDelete?.username}`</span
				>?
			</p>
			<div class="flex justify-end space-x-2">
				<button
					class="btn btn-outline btn-sm"
					on:click={() => {
						deleteDialog.close();
					}}
				>
					Cancel
				</button>
				<button
					class="btn btn-error btn-sm"
					on:click={() => {
						if (!toDelete) return;
						$deleteMutation.mutate(toDelete.id.toString());
						toDelete = null;
						deleteDialog.close();
					}}
				>
					Delete
				</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
	<div class="overflow-x-auto my-4">
		<table class="table table-zebra">
			<!-- head -->
			<thead class="bg-neutral-200 dark:bg-neutral">
				<tr>
					<th>ID</th>
					<th>Username</th>
					<th>Email</th>
					<th>Balance</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if $users.data}
					{#each $users.data as user}
						<tr class="hover">
							<th>{user.id}</th>
							<td>{user.username}</td>
							<td>{user.email}</td>
							<td class="overflow-hidden">
								<button
									class="btn btn-xs"
									on:click={() => {
										toInc = user.id.toString();
										inc = 0;
									}}
								>
									🪙 {user.balance}
									<Icon icon="ic:baseline-plus" />
								</button>
								<form
									class={clsx(
										'duration-200',
										toInc === user.id.toString() ? 'opacity-100 h-7 pt-1' : 'h-0 opacity-0'
									)}
									on:submit|preventDefault={() => {
										if (inc) {
											$incrementMutation.mutate({ userId: user.id.toString(), increment: inc });
										}
										toInc = null;
									}}
									novalidate
								>
									<input
										id={`inc-${user.id}`}
										type="number"
										bind:value={inc}
										step="50"
										class={clsx(
											'input input-bordered input-xs w-20 duration-200 text-center',
											toInc === user.id.toString() ? 'h-6' : 'h-0'
										)}
									/>
								</form>
							</td>
							<td>
								<div class="flex space-x-1">
									<button
										class="btn btn-error btn-xs text-base-100"
										on:click={() => {
											toDelete = user;
											deleteDialog.showModal();
										}}
									>
										<Icon icon="ic:baseline-delete" />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
		{#if $users.isLoading}
			<div class="flex justify-center items-center h-32">
				<span class="loading loading-dots loading-lg"></span>
			</div>
		{/if}
		{#if $users.isError}
			<div class="flex justify-center items-center h-32">
				<div class="text-error">Failed to fetch users</div>
			</div>
		{/if}
	</div>
</div>
