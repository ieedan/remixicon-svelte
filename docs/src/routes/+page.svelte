<script lang="ts">
    import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';
	import { RiFileCopyLine, RiFileCopyFill, RiCheckLine, RiCheckFill, RiGithubLine, RiGithubFill, RiExternalLinkLine, RiExternalLinkFill, RiEyeFill, RiEyeLine, RiNpmjsLine, RiNpmjsFill } from 'remixicon-svelte';
	import { ToggleGroup } from 'bits-ui';
    import { scale } from 'svelte/transition';
	import { PersistedState } from 'runed';

	const clipboard = new UseClipboard();

	let iconStyle = new PersistedState('iconStyle', 'line');
</script>

<main class="h-dvh flex flex-col gap-4 px-4 items-center justify-center">
	<div class="fixed top-2 right-2">
		<ToggleGroup.Root bind:value={iconStyle.current} type="single" class="flex items-center p-0.5 gap-0.5 bg-(--bg-card) border-(--border-color) border rounded-lg relative group">
			<ToggleGroup.Item value="line" class="size-7 flex items-center justify-center shrink-0 text-(--text-foreground) border-(--border-color) data-[state=on]:border rounded-lg data-[state=on]:bg-(--secondary-color)">
				<RiEyeLine class="size-4" />
			</ToggleGroup.Item>
			<ToggleGroup.Item value="fill" class="size-7 flex items-center justify-center shrink-0 text-(--text-foreground) border-(--border-color) data-[state=on]:border rounded-lg data-[state=on]:bg-(--secondary-color)">
				<RiEyeFill class="size-4" />
			</ToggleGroup.Item>
		</ToggleGroup.Root>
	</div>
	
	<div class="flex items-center justify-center flex-col gap-2">
		<h1 class="text-5xl font-bold text-(--text-foreground) text-center">remixicon-<span class="text-[#FF3E01]">svelte</span></h1>
		<p class="text-(--text-muted) text-lg text-center">RemixIcon for Svelte.</p>
	</div>
	<div class="border-(--border-color) bg-(--bg-card) border rounded-lg py-2 px-3 flex items-center justify-between w-full max-w-md">
		<span class="text-(--text-foreground)">pnpm install remixicon-svelte</span>
		<button type="button" class="size-8 [&_svg]:size-4 rounded-md bg-(--secondary-color) text-(--text-muted) flex items-center justify-center" onclick={() => clipboard.copy('pnpm install remixicon-svelte')}>
			{#if clipboard.copied}
				<div in:scale={{ duration: 500, start: 0.85 }}>
					{#if iconStyle.current === 'fill'}
						<RiCheckFill />
					{:else}
						<RiCheckLine />
					{/if}
					<span class="sr-only">Copied</span>
				</div>
			{:else}
				<div in:scale={{ duration: 500, start: 0.85 }}>
					{#if iconStyle.current === 'fill'}
						<RiFileCopyFill />
					{:else}
						<RiFileCopyLine />
					{/if}
					<span class="sr-only">Copy</span>
				</div>
			{/if}
		</button>
	</div>
	<div class="flex items-center gap-2">
		<a href="https://github.com/ieedan/remixicon-svelte" target="_blank" rel="noopener noreferrer" class="bg-(--bg-card) border-(--border-color) border rounded-full py-1 px-2 flex items-center gap-1 text-(--text-foreground) text-sm hover:opacity-80 transition-opacity">
			{#if iconStyle.current === 'fill'}
				<RiGithubFill class="size-4" />
			{:else}
				<RiGithubLine class="size-4" />
			{/if}
			<span>GitHub</span>
			{#if iconStyle.current === 'fill'}
				<RiExternalLinkFill class="size-4 text-(--text-muted)" />
			{:else}
				<RiExternalLinkLine class="size-4 text-(--text-muted)" />
			{/if}
		</a>
		<a href="https://www.npmjs.com/package/remixicon-svelte" target="_blank" rel="noopener noreferrer" class="bg-(--bg-card) border-(--border-color) border rounded-full py-1 px-2 flex items-center gap-1 text-(--text-foreground) text-sm hover:opacity-80 transition-opacity">
			{#if iconStyle.current === 'fill'}
				<RiNpmjsFill class="size-4" />
			{:else}
				<RiNpmjsLine class="size-4" />
			{/if}
			<span>npm</span>
			{#if iconStyle.current === 'fill'}
				<RiExternalLinkFill class="size-4 text-(--text-muted)" />
			{:else}
				<RiExternalLinkLine class="size-4 text-(--text-muted)" />
			{/if}
		</a>
	</div>
</main>