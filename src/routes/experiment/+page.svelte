<script lang="ts">
	import Scene from '$lib/components/experiment/Scene.svelte';
	import Overlay from '$lib/components/experiment/Overlay.svelte';

	let mainElement = $state<HTMLElement>();
</script>

<svelte:head>
	<title>WebGL Experiment | A Dimensional Drift</title>
	<meta name="description" content="A WebGL exploratory experiment using SvelteKit and Three.js" />
</svelte:head>

<div class="relative w-full bg-black text-white">
	<div bind:this={mainElement} class="fixed top-0 left-0 z-0 h-screen w-full">
		<Scene container={mainElement} />
		<Overlay />
	</div>

	<!-- Scroll spacer to drive the interaction -->
	<div class="pointer-events-none relative z-10 h-[1000vh] w-full"></div>
</div>
