<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import * as THREE from 'three';
	import gsap from 'gsap';
	import { HeroObject } from './HeroObject';
	import { ExperienceManager } from './ExperienceManager';

	let canvas: HTMLCanvasElement;
	let renderer: THREE.WebGLRenderer;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let hero: HeroObject;
	let frameId: number;

	const init = () => {
		// Renderer
		renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true, // Allow background color to show through if needed
			powerPreference: 'high-performance'
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		// renderer.setClearColor(0x000000, 1); // Let CSS handle background or use clear color

		// Scene
		scene = new THREE.Scene();

		// Camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
		camera.position.z = 3.5; // Slightly further back for the larger object

		// Objects
		hero = new HeroObject();
		scene.add(hero.mesh);

		// Intro Animation
		hero.mesh.scale.set(0, 0, 0);
		gsap.to(hero.mesh.scale, {
			x: 1,
			y: 1,
			z: 1,
			duration: 2.5,
			ease: 'elastic.out(1, 0.5)',
			delay: 0.1
		});

		// Events
		window.addEventListener('resize', onResize);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('scroll', onScroll);

		// Initial Scroll Check
		onScroll();

		// Start Loop
		tick();
	};

	const onResize = () => {
		if (!camera || !renderer) return;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		if (hero) hero.onResize(window.innerWidth, window.innerHeight);
	};

	const onMouseMove = (e: MouseEvent) => {
		if (hero) hero.onMouseMove(e);
	};

	const onScroll = () => {
		const scrollY = window.scrollY;
		const maxScroll = document.body.scrollHeight - window.innerHeight;
		const progress = Math.max(0, Math.min(1, scrollY / maxScroll));

		ExperienceManager.getInstance().onScroll(progress);
	};

	const tick = (time: number = 0) => {
		const elapsedTime = time * 0.001;

		if (hero) hero.update(elapsedTime);

		renderer.render(scene, camera);
		frameId = requestAnimationFrame(tick);
	};

	onMount(() => {
		if (browser) {
			init();
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frameId);

			if (renderer) renderer.dispose();
			if (hero) hero.dispose();
		}
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed top-0 left-0 -z-10 block h-full w-full bg-neutral-900 outline-none"
></canvas>
