<script lang="ts">
	import Scene from '$lib/components/experiment/Scene.svelte';
	import Overlay from '$lib/components/experiment/Overlay.svelte';
</script>

<svelte:head>
	<title>Living | Creative Coding Experiment</title>
	<meta name="description" content="A procedural WebGL organism." />
</svelte:head>

<main class="relative w-full">
	<Scene />
	<Overlay />

	<!-- Scroll Track -->
	<section class="h-screen w-full"></section>
	<section class="h-screen w-full"></section>
	<section class="h-screen w-full"></section>
	<section class="h-screen w-full"></section>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #111;
		color: #fff;
		overflow-x: hidden;
	}
</style>
