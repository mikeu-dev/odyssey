<script lang="ts">
	import { currentMode, currentSection, scrollProgress } from './stores';
	import { fade, fly } from 'svelte/transition';

	let sectionLabels = ['GENESIS', 'ENERGY', 'CHAOS', 'HARMONY'];

	let sectionSubtitles = [
		'A quiet beginning. The breath of life.',
		'Forces gather. The flow intensifies.',
		'Entropy rises. Structure breaks apart.',
		'Balance is restored. A new form emerges.'
	];
</script>

<div
	class="pointer-events-none fixed top-0 left-0 z-10 flex h-full w-full flex-col justify-between p-8 text-white mix-blend-difference"
>
	<!-- Header -->
	<header class="flex items-center justify-between opacity-70">
		<div class="text-sm font-bold tracking-widest">EXPERIMENT_02</div>
		<div class="font-mono text-xs">{$currentMode} MODE</div>
	</header>

	<!-- Center Content (Dynamic based on section) -->
	<div
		class="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 transform text-center"
	>
		{#key $currentSection}
			<div
				in:fly={{ y: 20, duration: 1000, delay: 200 }}
				out:fade={{ duration: 500 }}
				class="flex flex-col items-center"
			>
				<h1 class="mb-4 text-6xl font-black tracking-tighter opacity-90 md:text-8xl">
					{sectionLabels[$currentSection]}
				</h1>
				<p class="mx-auto max-w-md font-mono text-sm opacity-60 md:text-base">
					{sectionSubtitles[$currentSection]}
				</p>
			</div>
		{/key}
	</div>

	<!-- Footer / Progress -->
	<footer class="flex items-end justify-between opacity-70">
		<div class="flex flex-col gap-1">
			<div class="h-1 w-32 overflow-hidden rounded-full bg-white/20">
				<div class="h-full bg-white" style="width: {$scrollProgress * 100}%"></div>
			</div>
			<div class="font-mono text-xs">SCROLL PROGRESS</div>
		</div>

		<div class="text-right font-mono text-xs">
			<p>ANTIGRAVITY // DEEPMIND</p>
		</div>
	</footer>
</div>
